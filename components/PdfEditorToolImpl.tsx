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
import { applyPdfOverlays, type PdfPageOverlay } from '@/lib/utils/pdf-edit';
import { createPdfDerivedFilename, isPdfFile } from '@/lib/utils/pdf';
import { renderPdfPages, type RenderedPage } from '@/lib/utils/pdf-render';

type EditorTool = 'select' | 'text' | 'draw' | 'highlight' | 'rect';

const TOOLS: EditorTool[] = ['select', 'text', 'draw', 'highlight', 'rect'];
const TEXT_FONT_FAMILY = 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
/** 标注图层按页面显示尺寸的 2 倍导出，约 144-216 DPI，避免线条和文字发虚。 */
const EXPORT_MULTIPLIER = 2;

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

export function PdfEditorToolImpl() {
  const t = useTranslations('tools.pdf-edit');

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [tool, setTool] = useState<EditorTool>('select');
  const [color, setColor] = useState('#e11d48');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(20);
  const [filled, setFilled] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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

  if (annotationsRef.current.key !== pages) annotationsRef.current = { key: pages, map: new Map() };
  const annotations = annotationsRef.current.map;

  toolRef.current = tool;
  colorRef.current = color;
  strokeWidthRef.current = strokeWidth;
  fontSizeRef.current = fontSize;
  filledRef.current = filled;

  const page = pages[pageIndex];

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
      if (activeTool !== 'text' && activeTool !== 'rect') return;
      if (event.target) return;

      const point = event.scenePoint;
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

    canvas.on('mouse:down', handleMouseDown);

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
    if (!nextFile) return;
    if (!isPdfFile(nextFile)) {
      setError(t('errors.not_pdf'));
      return;
    }

    setFile(nextFile);
    setPages([]);
    setPageIndex(0);
    setProgress({ current: 0, total: 0 });

    // 渲染分辨率跟随容器宽度，避免小屏幕上画布横向溢出。612pt 是 Letter/A4 的常见宽度。
    const stageWidth = stageRef.current?.clientWidth ?? 900;
    const scale = Math.min(2, Math.max(1, stageWidth / 612));

    try {
      const rendered = await renderPdfPages(nextFile, {
        format: 'png',
        scale,
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
    if (!canvas) return;
    canvas.remove(...canvas.getObjects());
    canvas.requestRenderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.remove(...canvas.getActiveObjects());
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  const save = useCallback(async () => {
    if (!file) return;
    const canvas = canvasRef.current;
    if (canvas) annotations.set(pageIndex, canvas.toObject().objects as object[]);

    setSaving(true);
    setError('');
    try {
      const overlays: PdfPageOverlay[] = [];
      for (const [index, objects] of annotations) {
        const source = pages[index];
        if (!source || objects.length === 0) continue;
        const staticCanvas = new StaticCanvas(undefined, {
          width: source.width,
          height: source.height,
          enableRetinaScaling: false,
        });
        await staticCanvas.loadFromJSON({ objects });
        overlays.push({
          pageIndex: index,
          dataUrl: staticCanvas.toDataURL({ format: 'png', multiplier: EXPORT_MULTIPLIER }),
        });
        void staticCanvas.dispose();
      }

      if (overlays.length === 0) {
        setError(t('errors.nothing_to_save'));
        return;
      }

      const blob = await applyPdfOverlays(await file.arrayBuffer(), overlays);
      downloadBlob(blob, createPdfDerivedFilename(file.name, 'edited'));
    } catch {
      setError(t('errors.save_failed'));
    } finally {
      setSaving(false);
    }
  }, [annotations, file, pageIndex, pages, t]);

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
            <span className="text-xs text-content-faint">{t('hint')}</span>
          </div>

          <div ref={stageRef} className="min-h-0 overflow-auto rounded border border-border-subtle bg-surface-raised p-4">
            <div
              className="mx-auto shadow"
              style={{
                width: page.width,
                height: page.height,
                backgroundImage: `url(${page.dataUrl})`,
                backgroundSize: '100% 100%',
              }}
            >
              <canvas ref={canvasElRef} />
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
  canvas.defaultCursor = selectable ? 'default' : 'crosshair';
  canvas.forEachObject((object) => {
    object.selectable = selectable;
    object.evented = selectable;
  });
  if (!selectable) canvas.discardActiveObject();
}
