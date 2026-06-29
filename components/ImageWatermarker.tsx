'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import {
  applyWatermark,
  createImageAssetFromUrl,
  getDefaultWatermarkOptions,
  renderWatermark,
  anchorToPosition,
  validateWatermarkImageDimensions,
  validateWatermarkImageFile,
  type ImageWatermarkAsset,
  type TextWatermarkStyle,
  type WatermarkAnchor,
  type WatermarkApplyOutcome,
  type WatermarkLayout,
  type WatermarkOptions,
  type WatermarkType,
} from '@/lib/utils/image-watermark';
import {
  formatFileSize,
  getBasicImageTargetConfig,
  getImageAcceptValue,
  getSupportedImageInputLabel,
  inferImageMimeType,
  type BasicImageTargetFormat,
  type ImageConversionError,
} from '@/lib/utils/image';

type WatermarkSuccess = Extract<WatermarkApplyOutcome, { ok: true }>;

interface ImageInfo {
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

interface OutputState {
  result: WatermarkSuccess;
  url: string;
}

const OUTPUT_FORMATS: BasicImageTargetFormat[] = ['png', 'jpg', 'webp'];
const COLOR_SWATCHES = ['#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
const FONT_FAMILIES = [
  { value: 'system-ui, sans-serif', label: 'Sans' },
  { value: 'Georgia, "Times New Roman", serif', label: 'Serif' },
  { value: '"Courier New", monospace', label: 'Mono' },
  { value: '"PingFang SC", "Microsoft YaHei", sans-serif', label: '中文' },
];

const ANCHOR_GRID: WatermarkAnchor[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

function formatDimensions(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)} px`;
}

function downloadUrl(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => anchor.remove(), 0);
}

function getDefaultOutputFormat(file: File): BasicImageTargetFormat {
  const sourceType = inferImageMimeType(file);
  if (sourceType === 'image/jpeg') return 'jpg';
  if (sourceType === 'image/webp') return 'webp';
  return 'png';
}

interface IconProps {
  className?: string;
}

const IconUpload: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4v12" />
    <path d="m7 9 5-5 5 5" />
    <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);
const IconDownload: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 4v12" />
    <path d="m7 11 5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);
const IconBold: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
    <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
  </svg>
);
const IconItalic: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="14" y1="5" x2="20" y2="5" />
    <line x1="4" y1="19" x2="10" y2="19" />
    <line x1="15" y1="5" x2="9" y2="19" />
  </svg>
);

interface RangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  format?: (value: number) => string;
  onChange: (value: number) => void;
}

const RangeRow: React.FC<RangeProps> = ({ label, value, min, max, step = 1, unit = '', format, onChange }) => (
  <label className="block">
    <span className="mb-1 flex items-center justify-between text-xs text-content-muted">
      <span>{label}</span>
      <span className="font-mono text-content-secondary">{format ? format(value) : `${value}${unit}`}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-action"
    />
  </label>
);

export function ImageWatermarker() {
  const tc = useTranslations('common');
  const tw = useTranslations('image_watermark');

  // 资源 refs
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef('');
  const watermarkUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);

  // 主图与水印图
  const sourceAssetRef = useRef<ImageWatermarkAsset | null>(null);
  const watermarkAssetRef = useRef<ImageWatermarkAsset | null>(null);

  // 预览 canvas
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  // 拖动状态
  const draggingRef = useRef<{ startX: number; startY: number; basePos: { x: number; y: number } } | null>(null);

  // UI 状态
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [, setSourceTick] = useState(0);
  const [watermarkImageName, setWatermarkImageName] = useState('');
  const [options, setOptions] = useState<WatermarkOptions>(getDefaultWatermarkOptions);
  const [activeAnchor, setActiveAnchor] = useState<WatermarkAnchor>('middle-center');
  const [outputFormat, setOutputFormat] = useState<BasicImageTargetFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [draggingFile, setDraggingFile] = useState(false);

  const accept = useMemo(() => getImageAcceptValue(), []);
  const target = getBasicImageTargetConfig(outputFormat);
  const showQuality = target.supportsQuality;
  const canExport = Boolean(imageInfo && !isLoading && !isExporting);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  const clearOutput = useCallback(() => {
    setOutput((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  // 错误码 → 文案
  const getErrorMessage = useCallback((imageError: ImageConversionError): string => {
    switch (imageError.code) {
      case 'empty_file':
        return tw('errors.empty_file');
      case 'unsupported_input':
        return tw('errors.unsupported_input', { type: imageError.detail ?? tw('unknown_type') });
      case 'file_too_large':
        return tw('errors.file_too_large', { maxSize: imageError.maxSize ?? '' });
      case 'too_many_pixels':
        return tw('errors.too_many_pixels', { maxPixels: imageError.maxPixels ?? '' });
      case 'load_failed':
        return tw('errors.load_failed');
      case 'canvas_context':
        return tw('errors.canvas_context');
      case 'canvas_export':
        return tw('errors.canvas_export');
      case 'unsupported_output':
        return tw('errors.unsupported_output', { format: imageError.detail ?? '' });
      default:
        return tw('errors.general');
    }
  }, [tw]);

  // 实时渲染预览
  const drawPreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const source = sourceAssetRef.current;
    if (!canvas || !source) return;

    const container = previewContainerRef.current;
    if (!container) return;

    const containerWidth = Math.max(200, container.clientWidth - 16);
    const containerHeight = Math.max(200, container.clientHeight - 16);
    const scale = Math.min(containerWidth / source.width, containerHeight / source.height, 1);
    const displayWidth = Math.max(1, Math.floor(source.width * scale));
    const displayHeight = Math.max(1, Math.floor(source.height * scale));

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    setPreviewSize({ width: displayWidth, height: displayHeight });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // 透明背景棋盘格（仅 PNG 透明区域可见）
    if (target.mimeType === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, displayWidth, displayHeight);
    }
    ctx.drawImage(source.element, 0, 0, displayWidth, displayHeight);

    // 按显示尺寸缩放水印参数（fontSize、间距等是基于原图比例的，需换算到预览）
    const previewOptions: WatermarkOptions = {
      ...options,
      text: options.text
        ? { ...options.text, fontSize: options.text.fontSize * scale, strokeWidth: options.text.strokeWidth * scale }
        : undefined,
      image: watermarkAssetRef.current ?? options.image,
    };
    renderWatermark(ctx, displayWidth, displayHeight, previewOptions);
  }, [options, target.mimeType]);

  // 在 imageInfo 或 options 变化时重新预览
  useEffect(() => {
    drawPreview();
  }, [drawPreview, imageInfo]);

  // 监听容器尺寸变化
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => drawPreview());
    observer.observe(container);
    return () => observer.disconnect();
  }, [drawPreview]);

  // 卸载清理
  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
  }, []);

  // 加载主图
  const handleSourceFiles = useCallback(async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    setIsLoading(true);
    setError('');
    clearOutput();

    const validationError = validateWatermarkImageFile(file);
    if (validationError) {
      setIsLoading(false);
      setError(getErrorMessage(validationError));
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    try {
      const asset = await createImageAssetFromUrl(nextUrl);
      const dimensionError = validateWatermarkImageDimensions(asset.width, asset.height);
      if (dimensionError) {
        URL.revokeObjectURL(nextUrl);
        setIsLoading(false);
        setError(getErrorMessage(dimensionError));
        return;
      }

      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = nextUrl;
      sourceAssetRef.current = asset;
      setImageInfo({
        filename: file.name,
        mimeType: inferImageMimeType(file),
        width: asset.width,
        height: asset.height,
        size: file.size,
      });
      setOutputFormat(getDefaultOutputFormat(file));
      setSourceTick((tick) => tick + 1);
      setIsLoading(false);
    } catch {
      URL.revokeObjectURL(nextUrl);
      setIsLoading(false);
      setError(tw('errors.load_failed'));
    }
  }, [clearOutput, getErrorMessage, tw]);

  // 加载水印图
  const handleWatermarkFiles = useCallback(async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;
    setError('');

    const validationError = validateWatermarkImageFile(file);
    if (validationError) {
      setError(getErrorMessage(validationError));
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    try {
      const asset = await createImageAssetFromUrl(nextUrl);
      if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current);
      watermarkUrlRef.current = nextUrl;
      watermarkAssetRef.current = asset;
      setWatermarkImageName(file.name);
      setOptions((prev) => ({ ...prev, type: 'image', image: asset }));
    } catch {
      URL.revokeObjectURL(nextUrl);
      setError(tw('errors.load_failed'));
    }
  }, [getErrorMessage, tw]);

  // 选择九宫格
  const handleAnchorPick = useCallback((anchor: WatermarkAnchor) => {
    const pos = anchorToPosition(anchor);
    if (!pos) return;
    setActiveAnchor(anchor);
    setOptions((prev) => ({ ...prev, layout: 'single', position: pos }));
  }, []);

  // 拖动水印（仅 single 模式）
  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageInfo || options.layout !== 'single') return;
    if (!previewCanvasRef.current) return;

    const rect = previewCanvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setOptions((prev) => ({ ...prev, position: { x, y } }));
    setActiveAnchor('custom');

    draggingRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      basePos: { x, y },
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [imageInfo, options.layout]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const clamped = {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };
    setOptions((prev) => ({ ...prev, position: clamped }));
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingRef.current = null;
  }, []);

  // 导出
  const exportImage = useCallback(async () => {
    const source = sourceAssetRef.current;
    if (!imageInfo || !source) return;

    setIsExporting(true);
    setError('');
    clearOutput();

    try {
      const result = await applyWatermark({
        source,
        sourceFilename: imageInfo.filename,
        originalSize: imageInfo.size,
        targetFormat: outputFormat,
        quality,
        options: {
          ...options,
          image: watermarkAssetRef.current ?? options.image,
        },
      });

      if (!result.ok) {
        setError(getErrorMessage(result));
        return;
      }

      const url = URL.createObjectURL(result.blob);
      setOutput({ result, url });
      downloadUrl(url, result.filename);
    } catch {
      setError(tw('errors.canvas_export'));
    } finally {
      setIsExporting(false);
    }
  }, [clearOutput, getErrorMessage, imageInfo, options, outputFormat, quality, tw]);

  // 文件拖入预览区
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingFile(false);
    if (event.dataTransfer.files.length > 0) {
      void handleSourceFiles(event.dataTransfer.files);
    }
  }, [handleSourceFiles]);

  const updateText = useCallback((patch: Partial<TextWatermarkStyle>) => {
    setOptions((prev) => ({
      ...prev,
      text: { ...(prev.text ?? getDefaultWatermarkOptions().text!), ...patch },
    }));
  }, []);

  const outputStats = useMemo(() => {
    if (!output) return null;
    return [
      { label: tw('output_size'), value: formatDimensions(output.result.width, output.result.height) },
      { label: tw('file_size'), value: formatFileSize(output.result.outputSize) },
      { label: tw('duration'), value: tw('duration_value', { value: output.result.durationMs }) },
    ];
  }, [output, tw]);

  return (
    <ToolLayout toolId="image-watermark">
      <input
        ref={sourceInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) handleSourceFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={watermarkInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) handleWatermarkFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div className="grid flex-grow grid-cols-1 gap-3 min-h-0 pb-4 sm:pb-8 lg:grid-cols-[320px_minmax(0,1fr)]">

        {/* 左侧控制面板 */}
        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto rounded-lg border border-border-base bg-surface p-3">

          {/* 顶部：选择/更换图片 + 信息 */}
          <div className="flex items-center justify-between gap-2">
            <Button size="md" onClick={() => sourceInputRef.current?.click()}>
              <span className="inline-flex items-center gap-1.5">
                <IconUpload className="h-4 w-4" />
                {imageInfo ? tw('replace') : tw('drop_action')}
              </span>
            </Button>
            {imageInfo && (
              <span className="font-mono text-[11px] text-content-faint">
                {formatDimensions(imageInfo.width, imageInfo.height)}
              </span>
            )}
          </div>

          {imageInfo && (
            <div className="truncate text-xs text-content-muted" title={imageInfo.filename}>
              {imageInfo.filename} · {formatFileSize(imageInfo.size)}
            </div>
          )}

          {/* 水印类型切换 */}
          <div className="grid grid-cols-2 gap-1 rounded-md border border-border-subtle p-0.5">
            {(['text', 'image'] as WatermarkType[]).map((type) => {
              const active = options.type === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setOptions((prev) => ({ ...prev, type }))}
                  className={clsx(
                    'rounded px-3 py-1.5 text-sm transition-colors',
                    active ? 'bg-action text-white' : 'text-content-muted hover:text-content',
                  )}
                >
                  {tw(`types.${type}`)}
                </button>
              );
            })}
          </div>

          {/* 内容：文字 */}
          {options.type === 'text' && options.text && (
            <div className="space-y-2.5 border-t border-border-subtle pt-3">
              <label className="block">
                <span className="mb-1 block text-xs text-content-muted">{tw('text_content')}</span>
                <textarea
                  value={options.text.text}
                  onChange={(event) => updateText({ text: event.target.value })}
                  rows={2}
                  placeholder={tw('text_placeholder')}
                  className="w-full resize-y rounded-md border border-border-input bg-surface px-2.5 py-1.5 text-sm text-content outline-none transition-colors focus:border-border-strong"
                />
              </label>

              <div className="grid grid-cols-4 gap-1">
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    onClick={() => updateText({ fontFamily: font.value })}
                    className={clsx(
                      'rounded border px-1.5 py-1 text-xs transition-colors',
                      options.text?.fontFamily === font.value
                        ? 'border-border-strong bg-action text-white'
                        : 'border-border-subtle text-content-muted hover:border-border-strong hover:text-content',
                    )}
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateText({ bold: !options.text!.bold })}
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded border transition-colors',
                    options.text.bold ? 'border-border-strong bg-action text-white' : 'border-border-subtle text-content-muted hover:text-content',
                  )}
                  aria-label={tw('bold')}
                >
                  <IconBold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateText({ italic: !options.text!.italic })}
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded border transition-colors',
                    options.text.italic ? 'border-border-strong bg-action text-white' : 'border-border-subtle text-content-muted hover:text-content',
                  )}
                  aria-label={tw('italic')}
                >
                  <IconItalic className="h-4 w-4" />
                </button>
                <label className="relative ml-auto h-8 w-8 cursor-pointer overflow-hidden rounded border border-border-input">
                  <span className="block h-full w-full" style={{ backgroundColor: options.text.color }} />
                  <input
                    type="color"
                    value={options.text.color}
                    onChange={(event) => updateText({ color: event.target.value })}
                    aria-label={tw('color')}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
                <div className="flex items-center gap-0.5">
                  {COLOR_SWATCHES.slice(0, 6).map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => updateText({ color: swatch })}
                      className={clsx(
                        'h-5 w-5 rounded-full border transition-transform hover:scale-110',
                        options.text?.color === swatch ? 'border-border-strong ring-2 ring-action/40' : 'border-border-subtle',
                      )}
                      style={{ backgroundColor: swatch }}
                      aria-label={tw('choose_color', { color: swatch })}
                    />
                  ))}
                </div>
              </div>

              <RangeRow
                label={tw('font_size')}
                value={options.text.fontSize}
                min={12}
                max={200}
                unit="px"
                onChange={(value) => updateText({ fontSize: value })}
              />

              <RangeRow
                label={tw('stroke_width')}
                value={options.text.strokeWidth}
                min={0}
                max={12}
                unit="px"
                onChange={(value) => updateText({ strokeWidth: value })}
              />
            </div>
          )}

          {/* 内容：图片 */}
          {options.type === 'image' && (
            <div className="space-y-2.5 border-t border-border-subtle pt-3">
              <div className="flex items-center justify-between gap-2">
                <Button variant="secondary" onClick={() => watermarkInputRef.current?.click()}>
                  {watermarkAssetRef.current ? tw('replace_watermark') : tw('upload_watermark')}
                </Button>
                {watermarkAssetRef.current && (
                  <span className="truncate text-[11px] text-content-faint" title={watermarkImageName}>
                    {watermarkImageName}
                  </span>
                )}
              </div>
              <RangeRow
                label={tw('image_scale')}
                value={Math.round(options.imageScale * 100)}
                min={5}
                max={150}
                unit="%"
                onChange={(value) => setOptions((prev) => ({ ...prev, imageScale: value / 100 }))}
              />
            </div>
          )}

          {/* 通用样式：透明度 + 旋转 */}
          <div className="space-y-2.5 border-t border-border-subtle pt-3">
            <RangeRow
              label={tw('opacity')}
              value={Math.round(options.opacity * 100)}
              min={5}
              max={100}
              unit="%"
              onChange={(value) => setOptions((prev) => ({ ...prev, opacity: value / 100 }))}
            />
            <RangeRow
              label={tw('rotation')}
              value={options.rotation}
              min={-180}
              max={180}
              unit="°"
              onChange={(value) => setOptions((prev) => ({ ...prev, rotation: value }))}
            />
          </div>

          {/* 排列方式 */}
          <div className="space-y-2 border-t border-border-subtle pt-3">
            <span className="block text-xs font-semibold uppercase tracking-wide text-content-faint">
              {tw('layout_title')}
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-md border border-border-subtle p-0.5">
              {(['single', 'tile', 'diagonal'] as WatermarkLayout[]).map((layout) => {
                const active = options.layout === layout;
                return (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => setOptions((prev) => ({ ...prev, layout }))}
                    className={clsx(
                      'rounded px-2 py-1.5 text-xs transition-colors',
                      active ? 'bg-action text-white' : 'text-content-muted hover:text-content',
                    )}
                  >
                    {tw(`layouts.${layout}`)}
                  </button>
                );
              })}
            </div>

            {options.layout === 'single' && (
              <div className="space-y-2">
                <span className="block text-[11px] text-content-faint">{tw('anchor_hint')}</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {ANCHOR_GRID.map((anchor) => (
                    <button
                      key={anchor}
                      type="button"
                      onClick={() => handleAnchorPick(anchor)}
                      aria-label={tw(`anchors.${anchor}`)}
                      className={clsx(
                        'flex h-8 items-center justify-center rounded border transition-colors',
                        activeAnchor === anchor
                          ? 'border-border-strong bg-action text-white'
                          : 'border-border-subtle text-content-muted hover:border-border-strong hover:text-content',
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </button>
                  ))}
                </div>
                <span className="block text-[11px] text-content-faint">{tw('drag_hint')}</span>
              </div>
            )}

            {(options.layout === 'tile' || options.layout === 'diagonal') && (
              <div className="space-y-2.5">
                <RangeRow
                  label={tw('spacing_x')}
                  value={Math.round(options.spacingX * 100)}
                  min={0}
                  max={120}
                  unit="%"
                  onChange={(value) => setOptions((prev) => ({ ...prev, spacingX: value / 100 }))}
                />
                <RangeRow
                  label={tw('spacing_y')}
                  value={Math.round(options.spacingY * 100)}
                  min={0}
                  max={120}
                  unit="%"
                  onChange={(value) => setOptions((prev) => ({ ...prev, spacingY: value / 100 }))}
                />
              </div>
            )}
          </div>

          {/* 输出格式 + 质量 */}
          <div className="space-y-2.5 border-t border-border-subtle pt-3">
            <span className="block text-xs font-semibold uppercase tracking-wide text-content-faint">
              {tw('output_format')}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {OUTPUT_FORMATS.map((format) => {
                const config = getBasicImageTargetConfig(format);
                const active = outputFormat === format;
                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => {
                      setOutputFormat(format);
                      clearOutput();
                    }}
                    className={clsx(
                      'rounded-md border px-2 py-1.5 font-mono text-xs font-semibold transition-colors',
                      active
                        ? 'border-border-strong bg-action text-white'
                        : 'border-border-subtle text-content-muted hover:border-border-strong hover:text-content',
                    )}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
            {showQuality && (
              <RangeRow
                label={tw('quality')}
                value={Math.round(quality * 100)}
                min={50}
                max={100}
                onChange={(value) => {
                  setQuality(value / 100);
                  clearOutput();
                }}
                format={(value) => `${value}%`}
              />
            )}
          </div>

          {/* 导出按钮 */}
          <div className="sticky bottom-0 -mx-3 mt-1 border-t border-border-subtle bg-surface px-3 py-2">
            <Button onClick={exportImage} disabled={!canExport} className="w-full justify-center py-2">
              <span className="inline-flex items-center justify-center gap-1.5">
                <IconDownload className="h-4 w-4" />
                {isExporting ? tw('exporting') : tw('export')}
              </span>
            </Button>
          </div>

          {output && (
            <div className="space-y-1.5 rounded-md border border-border-subtle bg-surface-raised p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-content">{tw('result_ready')}</span>
                <button
                  type="button"
                  onClick={() => downloadUrl(output.url, output.result.filename)}
                  className="text-action hover:underline"
                >
                  {tw('download')}
                </button>
              </div>
              {outputStats?.map((item) => (
                <div key={item.label} className="flex justify-between gap-2 border-t border-border-subtle pt-1">
                  <span className="text-content-faint">{item.label}</span>
                  <span className="font-mono text-content-secondary">{item.value}</span>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-danger-surface bg-danger-surface px-2.5 py-2 text-xs text-danger-content">
              {error}
            </div>
          )}

          <p className="mt-auto text-[11px] leading-relaxed text-content-faint">
            {tw('local_note')}
          </p>
        </aside>

        {/* 右侧：预览画布 */}
        <div
          ref={previewContainerRef}
          onDragEnter={(event) => {
            if (event.dataTransfer.types.includes('Files')) {
              event.preventDefault();
              setDraggingFile(true);
            }
          }}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes('Files')) event.preventDefault();
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) return;
            setDraggingFile(false);
          }}
          onDrop={handleDrop}
          className={clsx(
            'relative flex min-h-[26rem] flex-grow items-center justify-center overflow-hidden rounded-lg border bg-surface-raised p-2 transition-colors lg:min-h-0',
            draggingFile ? 'border-action ring-2 ring-action/40' : 'border-border-base',
          )}
        >
          {imageInfo ? (
            <div
              className="relative inline-block touch-none select-none"
              style={{ width: previewSize.width, height: previewSize.height }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <canvas
                ref={previewCanvasRef}
                className="block rounded-sm shadow-[0_8px_28px_rgba(0,0,0,0.12)] ring-1 ring-border-subtle"
              />
              {options.layout === 'single' && (
                <div
                  className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-action bg-white shadow-md"
                  style={{
                    left: `${options.position.x * 100}%`,
                    top: `${options.position.y * 100}%`,
                  }}
                  aria-hidden
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => sourceInputRef.current?.click()}
              className="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border-subtle bg-surface/70 transition-colors hover:border-border-strong hover:bg-surface"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover text-content-muted">
                <IconUpload className="h-7 w-7" />
              </span>
              <div className="max-w-sm text-center">
                <p className="text-base font-semibold text-content">
                  {isLoading ? tw('loading') : tw('drop_title')}
                </p>
                <p className="mt-1 text-xs text-content-muted">
                  {tw('drop_hint', { formats: getSupportedImageInputLabel() })}
                </p>
              </div>
            </button>
          )}

          {draggingFile && imageInfo && (
            <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-lg border-2 border-dashed border-action bg-action/10 text-sm font-semibold text-action">
              {tw('drop_replace')}
            </div>
          )}
        </div>
      </div>

      {/* 隐藏的 clear hook（保持 ToolLayout 不变） */}
      <span className="hidden">{tc('clear')}</span>
    </ToolLayout>
  );
}
