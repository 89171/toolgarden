'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import {
  Canvas,
  FabricImage,
  IText,
  PencilBrush,
  Rect,
  StaticCanvas,
  type TPointerEventInfo,
  type TPointerEvent,
} from 'fabric';
import { Button } from '@/components/ui/Button';
import { applyPdfAnnotations, type PageAnnotations } from '@/lib/utils/pdf-annotations';
import { collectNonWinAnsiText, fabricObjectsToShapes } from '@/lib/utils/pdf-annotation-shapes';
import { loadCjkFontSubset } from '@/lib/utils/pdf-cjk-font';
import {
  applyPdfTextRewrites,
  type PdfTextRewrite,
  type PdfTextRewriteFailureReason,
} from '@/lib/utils/pdf-text-rewrite';
import { createPdfDerivedFilename, isPdfFile } from '@/lib/utils/pdf';
import {
  renderPdfPageImage,
  renderPdfPages,
  type PdfTextItem,
  type RenderedPage,
} from '@/lib/utils/pdf-render';

type EditorTool = 'select' | 'edit_text' | 'text' | 'draw' | 'highlight' | 'rect';

interface TextEditingState {
  item: PdfTextItem;
  value: string;
}

const TOOLS: EditorTool[] = ['select', 'edit_text', 'text', 'draw', 'highlight', 'rect'];
const TEXT_FONT_FAMILY = 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

function colorWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  if (![red, green, blue].every(Number.isFinite)) return hex;
  return `rgba(${red},${green},${blue},${alpha})`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

function findTextItemAt(items: PdfTextItem[] | undefined, x: number, y: number): PdfTextItem | null {
  if (!items) return null;
  // 命中判定放宽两像素：文字块高度来自字号，紧贴基线的小字不容易点中。
  const padding = 2;
  return (
    items.find(
      (item) =>
        x >= item.x - padding &&
        x <= item.x + item.width + padding &&
        y >= item.y - padding &&
        y <= item.y + item.height + padding
    ) ?? null
  );
}

export function PdfEditorToolImpl() {
  const t = useTranslations('tools.pdf-edit');

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [tool, setTool] = useState<EditorTool>('edit_text');
  const [color, setColor] = useState('#e11d48');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const [filled, setFilled] = useState(false);
  const [rewrites, setRewrites] = useState<PdfTextRewrite[]>([]);
  const [editing, setEditing] = useState<TextEditingState | null>(null);
  const [hovered, setHovered] = useState<PdfTextItem | null>(null);
  /** 已应用改写后重新渲染出来的页面图，key 为 0-based 页码 */
  const [previews, setPreviews] = useState<Map<number, string>>(new Map());
  const [previewBusy, setPreviewBusy] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  /**
   * 每页的标注对象，key 为 0-based 页码。切页时序列化保存，导出时统一贴回 PDF。
   * 换一份 PDF 时 pages 变化会换成新 Map，旧文档的标注不会漏到新文档上。
   */
  const annotationsRef = useRef<{ key: RenderedPage[]; map: Map<number, object[]> }>({ key: [], map: new Map() });
  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);
  const fontSizeRef = useRef(fontSize);
  const filledRef = useRef(filled);
  const rewritesRef = useRef(rewrites);
  const sourceBytesRef = useRef<Uint8Array | null>(null);
  const renderScaleRef = useRef(1.5);

  if (annotationsRef.current.key !== pages) annotationsRef.current = { key: pages, map: new Map() };
  const annotations = annotationsRef.current.map;

  toolRef.current = tool;
  colorRef.current = color;
  strokeWidthRef.current = strokeWidth;
  fontSizeRef.current = fontSize;
  filledRef.current = filled;
  rewritesRef.current = rewrites;

  const page = pages[pageIndex];
  const pageImage = previews.get(pageIndex) ?? page?.dataUrl;

  const describeFailures = useCallback(
    (failed: Array<{ reason: PdfTextRewriteFailureReason }>): string => {
      if (failed.length === 0) return '';
      const reasons = [...new Set(failed.map((entry) => t(`rewrite_failure.${entry.reason}`)))];
      return t('rewrite_partial', { count: failed.length, reasons: reasons.join(' / ') });
    },
    [t]
  );


  // 每次切页重建画布：页面尺寸不同，重建比逐项改尺寸更简单，代价只有几毫秒。
  useEffect(() => {
    const element = canvasElRef.current;
    const current = pages[pageIndex];
    if (!element || !current) return;

    const canvas = new Canvas(element, {
      width: current.width,
      height: current.height,
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;

    const saved = annotations.get(pageIndex);
    if (saved?.length) {
      void canvas.loadFromJSON({ objects: saved }).then(() => {
        applyToolInteractivity(canvas, toolRef.current);
        canvas.requestRenderAll();
      });
    }

    const handleMouseDown = (event: TPointerEventInfo<TPointerEvent>) => {
      const activeTool = toolRef.current;
      const point = event.scenePoint;

      if (activeTool === 'edit_text') {
        const item = findTextItemAt(current.textItems, point.x, point.y);
        // 已排队的改写要接着上次改的内容编辑，而不是回到原文。
        const queued = item
          ? rewritesRef.current.find(
              (entry) =>
                entry.pageIndex === pageIndex &&
                entry.original === item.text &&
                entry.occurrence === item.occurrence
            )
          : undefined;
        // 延后一帧再挂输入框：浏览器处理完这次 mousedown 会把焦点移回 body，
        // 同步挂上的输入框会立刻 blur 并被当成「编辑取消」。
        window.requestAnimationFrame(() =>
          setEditing(item ? { item, value: queued?.next ?? item.text } : null)
        );
        return;
      }

      if (activeTool !== 'text' && activeTool !== 'rect') return;
      if (event.target) return;

      if (activeTool === 'text') {
        const text = new IText(t('text_placeholder'), {
          left: point.x,
          top: point.y,
          fill: colorRef.current,
          fontSize: fontSizeRef.current,
          fontFamily: TEXT_FONT_FAMILY,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
      } else {
        const rect = new Rect({
          left: point.x,
          top: point.y,
          width: 160,
          height: 60,
          fill: filledRef.current ? colorRef.current : 'transparent',
          stroke: colorRef.current,
          strokeWidth: strokeWidthRef.current,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
      }
      canvas.requestRenderAll();
    };

    const handleMouseMove = (event: TPointerEventInfo<TPointerEvent>) => {
      if (toolRef.current !== 'edit_text') return;
      const item = findTextItemAt(current.textItems, event.scenePoint.x, event.scenePoint.y);
      setHovered((previous) => (previous === item ? previous : item));
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:out', () => setHovered(null));

    const index = pageIndex;
    return () => {
      annotations.set(index, canvas.toObject().objects as object[]);
      canvasRef.current = null;
      void canvas.dispose();
    };
  }, [annotations, pageIndex, pages, t]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = tool === 'draw' || tool === 'highlight';
    if (canvas.isDrawingMode) {
      const brush = new PencilBrush(canvas);
      brush.color = tool === 'highlight' ? colorWithAlpha(color, 0.35) : color;
      brush.width = tool === 'highlight' ? Math.max(14, strokeWidth * 5) : strokeWidth;
      brush.strokeLineCap = 'round';
      brush.strokeLineJoin = 'round';
      canvas.freeDrawingBrush = brush;
    }
    applyToolInteractivity(canvas, tool);
    canvas.requestRenderAll();
  }, [color, pageIndex, pages, strokeWidth, tool]);

  useEffect(() => {
    setEditing(null);
    setHovered(null);
  }, [pageIndex, tool]);

  /**
   * 排队的改写一变就把它们真的写进 PDF，再用 pdf.js 重画受影响的页面。
   * 预览因此和导出结果完全一致——字体、颜色、位置都来自 PDF 本身，
   * 不是用 DOM 文字去模拟。
   *
   * ponytail: 每次改动都重新解析整份文档，几百 KB 的文件足够快；
   * 真遇到很大的文件再做增量。
   */
  useEffect(() => {
    const bytes = sourceBytesRef.current;
    if (!bytes || pages.length === 0) return;
    if (rewrites.length === 0) {
      setPreviews(new Map());
      setWarning('');
      // 上一轮预览可能正在途中被取消，它的 finally 不会再执行，这里兜底收尾。
      setPreviewBusy(false);
      return;
    }

    let cancelled = false;
    setPreviewBusy(true);

    const timer = window.setTimeout(async () => {
      try {
        const result = await applyPdfTextRewrites(bytes.slice(), rewrites);
        const next = new Map<number, string>();
        for (const index of new Set(rewrites.map((entry) => entry.pageIndex))) {
          const dataUrl = await renderPdfPageImage(result.bytes, index + 1, renderScaleRef.current);
          if (dataUrl) next.set(index, dataUrl);
        }
        if (cancelled) return;
        setPreviews(next);
        setWarning(describeFailures(result.failed));
      } catch {
        // 预览失败不影响继续编辑，导出时会再报一次
      } finally {
        if (!cancelled) setPreviewBusy(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [describeFailures, pages, rewrites]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      const canvas = canvasRef.current;
      const target = event.target as HTMLElement | null;
      if (!canvas || target?.closest('input, textarea')) return;
      const active = canvas.getActiveObjects();
      if (active.length === 0 || (active[0] as IText).isEditing) return;
      event.preventDefault();
      canvas.remove(...active);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadFile = useCallback(async (nextFile: File | null) => {
    setError('');
    setWarning('');
    if (!nextFile) return;
    if (!isPdfFile(nextFile)) {
      setError(t('errors.not_pdf'));
      return;
    }

    setFile(nextFile);
    setPages([]);
    setPageIndex(0);
    setRewrites([]);
    setEditing(null);
    setHovered(null);
    setPreviews(new Map());
    setProgress({ current: 0, total: 0 });

    // 渲染分辨率跟随容器宽度，避免小屏幕上画布横向溢出。612pt 是 Letter/A4 的常见宽度。
    const stageWidth = stageRef.current?.clientWidth ?? 900;
    const scale = Math.min(2, Math.max(1, stageWidth / 612));
    renderScaleRef.current = scale;

    try {
      sourceBytesRef.current = new Uint8Array(await nextFile.arrayBuffer());
      const rendered = await renderPdfPages(nextFile, {
        format: 'png',
        scale,
        extractText: true,
        onProgress: (current, total) => setProgress({ current, total }),
      });
      setPages(rendered);
    } catch {
      setError(t('errors.render_failed'));
      setFile(null);
    } finally {
      setProgress(null);
    }
  }, [t]);

  const commitEditing = useCallback(() => {
    if (!editing) return;
    const { item, value } = editing;
    setEditing(null);
    setWarning('');

    setRewrites((current) => {
      const rest = current.filter(
        (entry) =>
          entry.pageIndex !== pageIndex ||
          entry.original !== item.text ||
          entry.occurrence !== item.occurrence
      );
      if (value === item.text) return rest;
      return [...rest, { pageIndex, original: item.text, occurrence: item.occurrence, next: value }];
    });
  }, [editing, pageIndex]);

  const insertImage = useCallback(async (imageFile: File | null) => {
    const canvas = canvasRef.current;
    if (!imageFile || !canvas) return;
    try {
      const image = await FabricImage.fromURL(await readFileAsDataUrl(imageFile));
      const targetWidth = canvas.getWidth() / 3;
      image.scaleToWidth(Math.min(targetWidth, image.width));
      image.set({ left: canvas.getWidth() / 2 - targetWidth / 2, top: canvas.getHeight() / 3 });
      canvas.add(image);
      canvas.setActiveObject(image);
      setTool('select');
      canvas.requestRenderAll();
    } catch {
      setError(t('errors.image_failed'));
    }
  }, [t]);

  const clearPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.remove(...canvas.getObjects());
      canvas.requestRenderAll();
    }
    setRewrites((current) => current.filter((entry) => entry.pageIndex !== pageIndex));
  }, [pageIndex]);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.remove(...canvas.getActiveObjects());
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  const removeRewrite = useCallback((target: PdfTextRewrite) => {
    setRewrites((current) =>
      current.filter(
        (entry) =>
          entry.pageIndex !== target.pageIndex ||
          entry.original !== target.original ||
          entry.occurrence !== target.occurrence
      )
    );
  }, []);

  /**
   * 把每页的标注对象转成矢量注释形状。
   * 不再把整页压成 PNG：注释以 Ink / Square / FreeText / Stamp 写进 PDF。
   */
  const buildAnnotations = useCallback(async (): Promise<{
    pages: PageAnnotations[];
    unicodeFont: Uint8Array | null;
  }> => {
    const canvas = canvasRef.current;
    if (canvas) annotations.set(pageIndex, canvas.toObject().objects as object[]);

    const canvases: Array<{ index: number; staticCanvas: StaticCanvas; height: number }> = [];
    for (const [index, objects] of annotations) {
      const source = pages[index];
      if (!source || objects.length === 0) continue;
      const staticCanvas = new StaticCanvas(undefined, {
        width: source.width,
        height: source.height,
        enableRetinaScaling: false,
      });
      await staticCanvas.loadFromJSON({ objects });
      canvases.push({ index, staticCanvas, height: source.height });
    }

    // 只有真的写了中文这类字符才去下载字体，并且只裁出用到的那几个字形；
    // 拿不到字体就让转换器把这几个文字对象单独栅格化。
    const unicodeText = canvases
      .map((entry) => collectNonWinAnsiText(entry.staticCanvas.getObjects()))
      .join('');
    const unicodeFont = unicodeText ? await loadCjkFontSubset(unicodeText) : null;

    const result: PageAnnotations[] = [];
    for (const { index, staticCanvas, height } of canvases) {
      const shapes = fabricObjectsToShapes(staticCanvas.getObjects(), {
        scale: renderScaleRef.current,
        canvasHeight: height,
        allowUnicodeText: Boolean(unicodeFont),
      });
      if (shapes.length > 0) result.push({ pageIndex: index, shapes });
      void staticCanvas.dispose();
    }
    return { pages: result, unicodeFont };
  }, [annotations, pageIndex, pages]);

  const save = useCallback(async () => {
    if (!file) return;
    setSaving(true);
    setError('');
    setWarning('');

    try {
      const { pages: pageAnnotations, unicodeFont } = await buildAnnotations();
      if (pageAnnotations.length === 0 && rewrites.length === 0) {
        setError(t('errors.nothing_to_save'));
        return;
      }

      // 先改内容流里的原文，再把标注图层盖上去，两步共用同一份字节。
      let bytes: ArrayBuffer | Uint8Array = await file.arrayBuffer();
      let failed: Array<{ reason: PdfTextRewriteFailureReason }> = [];
      if (rewrites.length > 0) {
        const result = await applyPdfTextRewrites(bytes, rewrites);
        bytes = result.bytes;
        failed = result.failed;
      }

      if (pageAnnotations.length > 0) {
        bytes = await applyPdfAnnotations(bytes, pageAnnotations, { unicodeFont });
      }
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, createPdfDerivedFilename(file.name, 'edited'));
      setWarning(describeFailures(failed));
    } catch (cause) {
      console.error('[pdf-edit] save failed', cause);
      setError(t('errors.save_failed'));
    } finally {
      setSaving(false);
    }
  }, [buildAnnotations, describeFailures, file, rewrites, t]);

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <section className="flex flex-wrap items-center gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
        <label className="flex cursor-pointer items-center gap-2 rounded border border-dashed border-border-input bg-surface-raised px-4 py-2 text-sm text-content-secondary hover:border-border-strong">
          <span>{file ? t('replace_file') : t('drop_title')}</span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(event) => void loadFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <span className="text-xs text-content-faint">{file ? file.name : t('drop_hint')}</span>
        {pages.length > 0 && (
          <Button className="ml-auto" size="md" onClick={() => void save()} disabled={saving}>
            {saving ? t('saving') : t('save_download')}
          </Button>
        )}
      </section>

      {error && (
        <p className="rounded border border-border-base bg-danger-surface px-4 py-2 text-sm text-danger-content" role="alert">
          {error}
        </p>
      )}

      {warning && (
        <p className="rounded border border-border-base bg-surface-raised px-4 py-2 text-sm text-content-secondary" role="status">
          {warning}
        </p>
      )}

      {progress && (
        <p className="text-sm text-content-muted" aria-live="polite">
          {progress.total > 0
            ? t('rendering_progress', { current: progress.current, total: progress.total })
            : t('rendering')}
        </p>
      )}

      {pages.length > 0 && page && (
        <section className="flex min-h-0 flex-col gap-3 rounded-lg border border-border-base bg-surface p-4 shadow">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded border border-border-input">
              {TOOLS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTool(item)}
                  aria-pressed={tool === item}
                  className={clsx(
                    'px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action',
                    tool === item
                      ? 'bg-action text-background'
                      : 'bg-surface-raised text-content-secondary hover:bg-surface-hover'
                  )}
                >
                  {t(`tool_${item}`)}
                </button>
              ))}
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded border border-border-input bg-surface-raised px-3 py-1.5 text-sm text-content-secondary hover:bg-surface-hover">
              <span>{t('tool_image')}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  void insertImage(event.target.files?.[0] ?? null);
                  event.target.value = '';
                }}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-content-secondary">
              {t('color_label')}
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-8 w-12 cursor-pointer rounded border border-border-input bg-surface-raised"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-content-secondary">
              {t('stroke_label')}
              <input
                type="range"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(event) => setStrokeWidth(Number(event.target.value))}
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-content-secondary">
              {t('font_size_label')}
              <input
                type="number"
                min={8}
                max={96}
                value={fontSize}
                onChange={(event) => setFontSize(Math.min(96, Math.max(8, Number(event.target.value) || 8)))}
                className="w-16 rounded border border-border-input bg-surface-raised px-2 py-1 text-sm text-content"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-content-secondary">
              <input type="checkbox" checked={filled} onChange={(event) => setFilled(event.target.checked)} />
              {t('fill_label')}
            </label>

            <Button variant="secondary" onClick={deleteSelected}>{t('delete_selected')}</Button>
            <Button variant="danger" onClick={clearPage}>{t('clear_page')}</Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPageIndex((index) => Math.max(0, index - 1))}
              disabled={pageIndex === 0}
            >
              {t('page_prev')}
            </Button>
            <span className="text-sm text-content-secondary">
              {t('page_indicator', { current: pageIndex + 1, total: pages.length })}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPageIndex((index) => Math.min(pages.length - 1, index + 1))}
              disabled={pageIndex >= pages.length - 1}
            >
              {t('page_next')}
            </Button>
            <span className="text-xs text-content-faint" aria-live="polite">
              {previewBusy ? t('preview_updating') : tool === 'edit_text' ? t('edit_text_hint') : t('hint')}
            </span>
          </div>

          {rewrites.length > 0 && (
            <div className="flex flex-col gap-1 rounded border border-border-subtle bg-surface-raised p-3">
              <p className="text-xs font-medium text-content-secondary">
                {t('rewrite_queue_title', { count: rewrites.length })}
              </p>
              <ul className="flex flex-col gap-1">
                {rewrites.map((entry) => (
                  <li
                    key={`${entry.pageIndex}-${entry.occurrence}-${entry.original}`}
                    className="flex flex-wrap items-center gap-2 text-xs text-content-muted"
                  >
                    <span>{t('page_indicator', { current: entry.pageIndex + 1, total: pages.length })}</span>
                    <span className="line-through">{entry.original}</span>
                    <span aria-hidden="true">→</span>
                    <span className="font-medium text-content">{entry.next || t('rewrite_empty')}</span>
                    <button
                      type="button"
                      className="cursor-pointer underline hover:text-content-secondary"
                      onClick={() => removeRewrite(entry)}
                    >
                      {t('rewrite_remove')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div ref={stageRef} className="min-h-0 overflow-auto rounded border border-border-subtle bg-surface-raised p-4">
            <div
              className="relative mx-auto shadow"
              style={{
                width: page.width,
                height: page.height,
                // 有改写时显示的就是改写后重新渲染出来的页面，字体、颜色与原文一致
                backgroundImage: `url(${pageImage})`,
                backgroundSize: '100% 100%',
              }}
            >
              <canvas ref={canvasElRef} />

              {/* 鼠标指到哪段文字就框出哪段，纯提示，不参与导出 */}
              {tool === 'edit_text' && hovered && !editing && (
                <span
                  className="pointer-events-none absolute border border-dashed border-action"
                  style={{ left: hovered.x, top: hovered.y, width: hovered.width, height: hovered.height }}
                />
              )}

              {editing && (
                <input
                  autoFocus
                  value={editing.value}
                  onChange={(event) => setEditing({ item: editing.item, value: event.target.value })}
                  onBlur={commitEditing}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitEditing();
                    if (event.key === 'Escape') setEditing(null);
                  }}
                  aria-label={t('edit_text_input_label')}
                  className="absolute rounded border border-action bg-surface px-1 text-content shadow"
                  style={{
                    left: editing.item.x,
                    top: editing.item.y,
                    minWidth: Math.max(editing.item.width + 32, 96),
                    height: Math.max(editing.item.height, 20),
                    fontSize: Math.max(editing.item.height * 0.82, 12),
                  }}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {pages.length === 0 && !progress && (
        <div ref={stageRef} className="flex min-h-[20rem] items-center justify-center rounded-lg border border-border-base bg-surface p-6 text-sm text-content-faint">
          {t('empty_state')}
        </div>
      )}
    </div>
  );
}

function applyToolInteractivity(canvas: Canvas, tool: EditorTool) {
  const selectable = tool === 'select';
  canvas.selection = selectable;
  canvas.defaultCursor = selectable ? 'default' : tool === 'edit_text' ? 'text' : 'crosshair';
  canvas.forEachObject((object) => {
    object.selectable = selectable;
    object.evented = selectable;
  });
  if (!selectable) canvas.discardActiveObject();
}
