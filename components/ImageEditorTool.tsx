'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import {
  Canvas,
  Ellipse,
  FabricImage,
  FabricObject,
  IText,
  PencilBrush,
  Polyline,
  Rect,
  Textbox,
  type TPointerEventInfo,
} from 'fabric';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import {
  applyBlur,
  applyMosaic,
  createImageSourceFromUrl,
  createNormalizedRect,
  exportEditedImageDataUrl,
  validateEditorImageDimensions,
  validateEditorImageFile,
  type EditorImageSource,
  type ExportEditedImageOutcome,
  type Point,
} from '@/lib/utils/image-editor';
import {
  formatFileSize,
  getImageAcceptValue,
  getImageTargetConfig,
  getSupportedImageInputLabel,
  inferImageMimeType,
  type ImageConversionError,
  type ImageTargetFormat,
} from '@/lib/utils/image';

type EditorTool = 'select' | 'brush' | 'marker' | 'rectangle' | 'ellipse' | 'polyline' | 'text' | 'mosaic' | 'blur' | 'eraser';
type ShapeMode = 'stroke' | 'fill';
type EffectTool = Extract<EditorTool, 'mosaic' | 'blur'>;
type ShapeTool = Extract<EditorTool, 'rectangle' | 'ellipse'>;
type EditedImageSuccess = Extract<ExportEditedImageOutcome, { ok: true }>;

interface ImageInfo {
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  size: number;
}

interface OutputState {
  result: EditedImageSuccess;
  url: string;
}

interface DrawingState {
  tool: ShapeTool | EffectTool | 'text';
  start: Point;
  object: FabricObject;
}

interface PolylineState {
  points: Point[];
  preview: Polyline | null;
}

interface HistoryStatus {
  undo: number;
  redo: number;
}

type ObjectRole = 'base' | 'annotation' | 'transient';

const OUTPUT_FORMATS: ImageTargetFormat[] = ['png', 'jpg', 'webp'];
const HISTORY_LIMIT = 40;
const CANVAS_VIEWPORT_PADDING = 32;
const CANVAS_MIN_ZOOM_SCALE = 0.05;
const CANVAS_MAX_ZOOM_SCALE = 6;
const CANVAS_ZOOM_FACTOR = 1.25;
const TEXTBOX_DEFAULT_WIDTH = 240;
const TEXTBOX_MIN_WIDTH = 48;
const POLYLINE_DUPLICATE_POINT_DISTANCE = 2;

const COLOR_SWATCHES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#111827'];

if (!FabricObject.customProperties.includes('data')) {
  FabricObject.customProperties.push('data');
}

type IconProps = { className?: string };

const IconSelect: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 3l6 16 2.2-6.8L19 10z" />
  </svg>
);
const IconBrush: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.5 12.5 17 5a2.1 2.1 0 1 1 3 3l-7.5 7.5" />
    <path d="M9.5 12.5c-2 0-3.5 1.4-3.5 3.4 0 1.4-1.5 2.1-2 2.6 1 1 2.5 2 4.5 2 2.4 0 4-1.7 4-3.9 0-2-1.4-3.4-3-4.1z" />
  </svg>
);
const IconMarker: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 4 5 5-9 9-5-5z" />
    <path d="m6 13-2 7 7-2" />
    <path d="M14 5 18 9" />
  </svg>
);
const IconRectangle: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.2" />
  </svg>
);
const IconEllipse: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <ellipse cx="12" cy="12" rx="9" ry="7" />
  </svg>
);
const IconPolyline: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 18 8 8l5 6 8-10" />
  </svg>
);
const IconText: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 6V4h14v2" />
    <path d="M12 4v16" />
    <path d="M9 20h6" />
  </svg>
);
const IconMosaic: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="3" y="3" width="6" height="6" rx="0.6" />
    <rect x="15" y="3" width="6" height="6" rx="0.6" />
    <rect x="9" y="9" width="6" height="6" rx="0.6" />
    <rect x="3" y="15" width="6" height="6" rx="0.6" />
    <rect x="15" y="15" width="6" height="6" rx="0.6" />
  </svg>
);
const IconBlur: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="5.5" r="1.1" />
    <circle cx="6" cy="12" r="1.1" />
    <circle cx="18" cy="12" r="1.1" />
    <circle cx="12" cy="18.5" r="1.1" />
    <circle cx="8.3" cy="8.3" r="1.1" />
    <circle cx="15.7" cy="8.3" r="1.1" />
    <circle cx="8.3" cy="15.7" r="1.1" />
    <circle cx="15.7" cy="15.7" r="1.1" />
    <circle cx="12" cy="12" r="1.6" />
  </svg>
);
const IconEraser: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m20 20-8 0L4 12l8-8 8 8z" />
    <path d="M14 14 9 9" />
  </svg>
);

const IconUndo: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </svg>
);
const IconRedo: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H10a6 6 0 0 0 0 12h3" />
  </svg>
);
const IconTrash: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 7h16" />
    <path d="M10 11v6M14 11v6" />
    <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
    <path d="M9 7V4h6v3" />
  </svg>
);
const IconReset: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);
const IconUpload: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
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
const IconFullscreen: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 3H3v5" />
    <path d="M16 3h5v5" />
    <path d="M21 16v5h-5" />
    <path d="M8 21H3v-5" />
  </svg>
);
const IconExitFullscreen: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 3v6H3" />
    <path d="M15 3v6h6" />
    <path d="M21 15h-6v6" />
    <path d="M3 15h6v6" />
  </svg>
);
const IconZoomIn: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M10.5 7.5v6" />
    <path d="M7.5 10.5h6" />
    <path d="m16 16 5 5" />
  </svg>
);
const IconZoomOut: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M7.5 10.5h6" />
    <path d="m16 16 5 5" />
  </svg>
);
const IconFit: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 9V4h5" />
    <path d="M20 9V4h-5" />
    <path d="M20 15v5h-5" />
    <path d="M4 15v5h5" />
    <rect x="8" y="8" width="8" height="8" rx="1" />
  </svg>
);

const EDITOR_TOOLS: Array<{ tool: EditorTool; Icon: React.FC<IconProps> }> = [
  { tool: 'select', Icon: IconSelect },
  { tool: 'brush', Icon: IconBrush },
  { tool: 'marker', Icon: IconMarker },
  { tool: 'rectangle', Icon: IconRectangle },
  { tool: 'ellipse', Icon: IconEllipse },
  { tool: 'polyline', Icon: IconPolyline },
  { tool: 'text', Icon: IconText },
  { tool: 'mosaic', Icon: IconMosaic },
  { tool: 'blur', Icon: IconBlur },
  { tool: 'eraser', Icon: IconEraser },
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

function getDefaultOutputFormat(file: File): ImageTargetFormat {
  const sourceType = inferImageMimeType(file);
  if (sourceType === 'image/jpeg') return 'jpg';
  if (sourceType === 'image/webp') return 'webp';
  return 'png';
}

function colorWithAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  if (![red, green, blue].every(Number.isFinite)) return hex;
  return `rgba(${red},${green},${blue},${alpha})`;
}

function setObjectRole(object: FabricObject, role: ObjectRole) {
  object.set({ data: { role } });
}

function getObjectRole(object: FabricObject | undefined): ObjectRole | undefined {
  return (object as unknown as { data?: { role?: ObjectRole } } | undefined)?.data?.role;
}

function isBaseObject(object: FabricObject | undefined): boolean {
  return getObjectRole(object) === 'base';
}

function getCanvasPoint(event: TPointerEventInfo): Point {
  return {
    x: event.scenePoint.x,
    y: event.scenePoint.y,
  };
}

function configureBaseObject(image: FabricImage) {
  setObjectRole(image, 'base');
  image.set({
    left: 0,
    top: 0,
    originX: 'left',
    originY: 'top',
    selectable: false,
    evented: false,
    lockMovementX: true,
    lockMovementY: true,
    lockRotation: true,
    lockScalingX: true,
    lockScalingY: true,
    hasControls: false,
    hasBorders: false,
  });
}

function lockBaseObjects(canvas: Canvas) {
  canvas.getObjects().forEach((object, index) => {
    if (isBaseObject(object) || index === 0) {
      configureBaseObject(object as FabricImage);
    }
  });
}

function applyToolInteractivity(canvas: Canvas, tool: EditorTool) {
  const isSelect = tool === 'select';
  const isEraser = tool === 'eraser';
  const isText = tool === 'text';

  canvas.selection = isSelect;
  canvas.skipTargetFind = !isSelect && !isEraser && !isText;

  canvas.getObjects().forEach((object) => {
    if (isBaseObject(object)) return;
    if (getObjectRole(object) === 'transient') return;

    const isTextObject = object instanceof IText;
    const canSelect = isSelect || (isText && isTextObject);
    const canReceiveEvents = canSelect || isEraser;

    object.set({
      selectable: canSelect,
      evented: canReceiveEvents,
      hasControls: canSelect,
      hasBorders: canSelect,
      lockMovementX: !canSelect,
      lockMovementY: !canSelect,
    });
    object.setCoords();
  });
}

function exitActiveTextEditing(canvas: Canvas) {
  canvas.getObjects().forEach((object) => {
    if (object instanceof IText && object.isEditing) {
      object.exitEditing();
      object.hiddenTextarea?.blur();
    }
  });
}

function getActiveEditingText(canvas: Canvas): IText | undefined {
  return canvas.getObjects().find((object): object is IText => object instanceof IText && object.isEditing);
}

function createShapeObject(tool: ShapeTool, point: Point, color: string, strokeWidth: number, shapeMode: ShapeMode): FabricObject {
  const common = {
    left: point.x,
    top: point.y,
    originX: 'left' as const,
    originY: 'top' as const,
    stroke: color,
    strokeWidth,
    fill: shapeMode === 'fill' ? color : 'transparent',
    objectCaching: false,
  };

  const object = tool === 'rectangle'
    ? new Rect({ ...common, width: 1, height: 1 })
    : new Ellipse({ ...common, rx: 1, ry: 1 });
  setObjectRole(object, 'annotation');
  return object;
}

function updateShapeObject(object: FabricObject, tool: ShapeTool, start: Point, end: Point) {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const width = Math.max(1, Math.abs(end.x - start.x));
  const height = Math.max(1, Math.abs(end.y - start.y));

  if (tool === 'ellipse') {
    object.set({
      left,
      top,
      rx: width / 2,
      ry: height / 2,
    });
  } else {
    object.set({
      left,
      top,
      width,
      height,
    });
  }
  object.setCoords();
}

function getPointDistance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function createPolylineFromScenePoints(points: Point[], options: NonNullable<ConstructorParameters<typeof Polyline>[1]>): Polyline {
  const left = Math.min(...points.map((point) => point.x));
  const top = Math.min(...points.map((point) => point.y));
  const localPoints = points.map((point) => ({
    x: point.x - left,
    y: point.y - top,
  }));

  const polyline = new Polyline(localPoints, {
    ...options,
    left,
    top,
    originX: 'left',
    originY: 'top',
  });
  polyline.setCoords();
  return polyline;
}

function getCanvasFitScale(width: number, height: number, viewport: HTMLElement | null): number {
  const fallbackWidth = Math.max(160, Math.min(width, window.innerWidth - 48));
  const fallbackHeight = Math.max(160, Math.min(height, Math.round(window.innerHeight * 0.7)));
  const availableWidth = viewport ? viewport.clientWidth - CANVAS_VIEWPORT_PADDING : fallbackWidth;
  const availableHeight = viewport ? viewport.clientHeight - CANVAS_VIEWPORT_PADDING : fallbackHeight;
  const maxWidth = Math.max(160, availableWidth);
  const maxHeight = Math.max(160, availableHeight);

  return Math.max(CANVAS_MIN_ZOOM_SCALE, Math.min(maxWidth / width, maxHeight / height, 1));
}

function clampCanvasZoomScale(scale: number): number {
  return Math.min(CANVAS_MAX_ZOOM_SCALE, Math.max(CANVAS_MIN_ZOOM_SCALE, scale));
}

function getCanvasDisplaySize(
  width: number,
  height: number,
  viewport: HTMLElement | null,
  zoomScale = getCanvasFitScale(width, height, viewport)
): { width: number; height: number } {
  const scale = clampCanvasZoomScale(zoomScale);

  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

function fitCanvasDisplaySize(
  canvas: Canvas,
  width: number,
  height: number,
  viewport: HTMLElement | null,
  zoomScale?: number
) {
  const displaySize = getCanvasDisplaySize(width, height, viewport, zoomScale);
  canvas.setDimensions({ width: `${displaySize.width}px`, height: `${displaySize.height}px` }, { cssOnly: true });

  const wrapper = canvas.wrapperEl;
  const hasImage = width > 1 && height > 1;
  wrapper.style.width = `${displaySize.width}px`;
  wrapper.style.height = `${displaySize.height}px`;
  wrapper.style.maxWidth = 'none';
  wrapper.style.maxHeight = 'none';
  wrapper.style.aspectRatio = `${width} / ${height}`;
  wrapper.style.display = 'block';
  wrapper.style.boxShadow = hasImage ? '0 8px 28px rgba(0,0,0,0.12)' : '';
  wrapper.style.outline = hasImage ? '1px solid rgba(0,0,0,0.08)' : '';
  wrapper.style.borderRadius = hasImage ? '2px' : '';

  [canvas.lowerCanvasEl, canvas.upperCanvasEl].forEach((element) => {
    element.style.width = `${displaySize.width}px`;
    element.style.height = `${displaySize.height}px`;
    element.style.display = 'block';
  });
}

function syncCanvasDisplaySize(
  canvas: Canvas,
  width: number,
  height: number,
  viewport: HTMLElement | null,
  zoomScale?: number
) {
  canvas.setDimensions({ width, height });
  fitCanvasDisplaySize(canvas, width, height, viewport, zoomScale);
}

function drawSourceToCanvas(
  canvas: HTMLCanvasElement,
  source: CanvasImageSource,
  width: number,
  height: number
): boolean {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return false;
  context.clearRect(0, 0, width, height);
  context.drawImage(source, 0, 0, width, height);
  return true;
}

function getBaseImageObject(canvas: Canvas): FabricImage | null {
  const baseObject = canvas.getObjects().find((object) => isBaseObject(object)) ?? canvas.getObjects()[0];
  return baseObject instanceof FabricImage ? baseObject : null;
}

function syncBaseCanvasFromBaseImage(
  canvas: Canvas,
  image: ImageInfo,
  existingCanvas: HTMLCanvasElement | null
): HTMLCanvasElement | null {
  const baseImage = getBaseImageObject(canvas);
  const element = baseImage?.getElement();
  if (!element) return null;

  const baseCanvas = existingCanvas ?? document.createElement('canvas');
  const ok = drawSourceToCanvas(baseCanvas, element, image.width, image.height);
  return ok ? baseCanvas : null;
}

async function createImageElementFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return createImageSourceFromUrl(dataUrl).then((source) => source.element);
}

interface IconActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

const IconAction: React.FC<IconActionProps> = ({ label, active, className, children, ...rest }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    className={clsx(
      'flex h-9 w-9 items-center justify-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40',
      active
        ? 'border-border-strong bg-action text-white'
        : 'border-transparent bg-transparent text-content-secondary hover:bg-surface-hover hover:text-content',
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);

interface InlineRangeProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

const InlineRange: React.FC<InlineRangeProps> = ({ label, value, min, max, step = 1, unit = '', onChange }) => (
  <label className="flex items-center gap-2 text-xs text-content-muted">
    <span className="whitespace-nowrap">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-24 accent-action sm:w-28"
    />
    <span className="w-10 text-right font-mono text-xs text-content-secondary">{value}{unit}</span>
  </label>
);

export function ImageEditorTool() {
  const tc = useTranslations('common');
  const ti = useTranslations('image_editor');
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceRef = useRef<EditorImageSource | null>(null);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const loadRequestRef = useRef(0);
  const drawingStateRef = useRef<DrawingState | null>(null);
  const polylineRef = useRef<PolylineState>({ points: [], preview: null });
  const suppressNextTextCreateRef = useRef(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isRestoringRef = useRef(false);
  const toolRef = useRef<EditorTool>('select');
  const colorRef = useRef('#ef4444');
  const strokeWidthRef = useRef(6);
  const shapeModeRef = useRef<ShapeMode>('stroke');
  const fontSizeRef = useRef(36);
  const mosaicBlockSizeRef = useRef(18);
  const blurRadiusRef = useRef(8);
  const imageInfoRef = useRef<ImageInfo | null>(null);
  const zoomScaleRef = useRef(1);
  const zoomFitRef = useRef(true);

  const [canvasReady, setCanvasReady] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [tool, setTool] = useState<EditorTool>('select');
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [shapeMode, setShapeMode] = useState<ShapeMode>('stroke');
  const [fontSize, setFontSize] = useState(36);
  const [mosaicBlockSize, setMosaicBlockSize] = useState(18);
  const [blurRadius, setBlurRadius] = useState(8);
  const [outputFormat, setOutputFormat] = useState<ImageTargetFormat>('png');
  const [quality, setQuality] = useState(0.92);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>({ undo: 0, redo: 0 });
  const [polylineCount, setPolylineCount] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [draggingFile, setDraggingFile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  const accept = getImageAcceptValue();
  const target = getImageTargetConfig(outputFormat);
  const showQuality = target.supportsQuality;
  const canEdit = Boolean(imageInfo && canvasReady);
  const canExport = Boolean(imageInfo && canvasReady && !isLoading && !isExporting);
  const usesStrokeWidth = tool === 'brush' || tool === 'marker' || tool === 'rectangle' || tool === 'ellipse' || tool === 'polyline';
  const zoomPercent = `${Math.round(zoomScale * 100)}%`;
  const editorShellClassName = clsx(
    'flex min-h-0 flex-grow flex-col gap-3',
    isFullscreen
      ? 'fixed inset-0 z-50 bg-background p-2 text-foreground sm:p-3'
      : 'pb-4 sm:pb-8',
  );

  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { shapeModeRef.current = shapeMode; }, [shapeMode]);
  useEffect(() => { fontSizeRef.current = fontSize; }, [fontSize]);
  useEffect(() => { mosaicBlockSizeRef.current = mosaicBlockSize; }, [mosaicBlockSize]);
  useEffect(() => { blurRadiusRef.current = blurRadius; }, [blurRadius]);
  useEffect(() => { imageInfoRef.current = imageInfo; }, [imageInfo]);
  useEffect(() => { sourceUrlRef.current = sourceUrl; }, [sourceUrl]);
  useEffect(() => { outputRef.current = output; }, [output]);
  useEffect(() => { zoomScaleRef.current = zoomScale; }, [zoomScale]);

  const clearOutput = useCallback(() => {
    setOutput((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }, []);

  const updateHistoryStatus = useCallback(() => {
    const history = historyRef.current;
    const index = historyIndexRef.current;
    setHistoryStatus({
      undo: Math.max(0, index),
      redo: Math.max(0, history.length - index - 1),
    });
  }, []);

  const serializeCanvas = useCallback((): string | null => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return null;
    return JSON.stringify(canvas.toJSON());
  }, []);

  const setInitialHistory = useCallback(() => {
    const state = serializeCanvas();
    if (!state) {
      historyRef.current = [];
      historyIndexRef.current = -1;
    } else {
      historyRef.current = [state];
      historyIndexRef.current = 0;
    }
    updateHistoryStatus();
  }, [serializeCanvas, updateHistoryStatus]);

  const recordHistory = useCallback(() => {
    if (isRestoringRef.current) return;

    const state = serializeCanvas();
    if (!state) return;

    const currentHistory = historyRef.current;
    if (currentHistory[historyIndexRef.current] === state) return;

    const nextHistory = currentHistory.slice(0, historyIndexRef.current + 1);
    nextHistory.push(state);
    if (nextHistory.length > HISTORY_LIMIT) nextHistory.shift();
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    updateHistoryStatus();
    clearOutput();
  }, [clearOutput, serializeCanvas, updateHistoryStatus]);

  const loadHistoryState = useCallback(async (state: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    isRestoringRef.current = true;
    try {
      await canvas.loadFromJSON(state);
      lockBaseObjects(canvas);
      applyToolInteractivity(canvas, toolRef.current);
      const currentImage = imageInfoRef.current;
      if (currentImage) {
        const viewport = canvasViewportRef.current;
        const nextScale = zoomFitRef.current
          ? getCanvasFitScale(currentImage.width, currentImage.height, viewport)
          : zoomScaleRef.current;
        zoomScaleRef.current = nextScale;
        setZoomScale(nextScale);
        fitCanvasDisplaySize(canvas, currentImage.width, currentImage.height, viewport, nextScale);
        const syncedBaseCanvas = syncBaseCanvasFromBaseImage(canvas, currentImage, baseCanvasRef.current);
        if (syncedBaseCanvas) baseCanvasRef.current = syncedBaseCanvas;
      }
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      clearOutput();
    } finally {
      isRestoringRef.current = false;
    }
  }, [clearOutput]);

  const getErrorMessage = useCallback((imageError: ImageConversionError): string => {
    switch (imageError.code) {
      case 'empty_file':
        return ti('errors.empty_file');
      case 'unsupported_input':
        return ti('errors.unsupported_input', { type: imageError.detail ?? ti('unknown_type') });
      case 'file_too_large':
        return ti('errors.file_too_large', { maxSize: imageError.maxSize ?? '' });
      case 'too_many_pixels':
        return ti('errors.too_many_pixels', { maxPixels: imageError.maxPixels ?? '' });
      case 'load_failed':
        return ti('errors.load_failed');
      case 'canvas_context':
        return ti('errors.canvas_context');
      case 'canvas_export':
        return ti('errors.canvas_export');
      case 'unsupported_output':
        return ti('errors.unsupported_output', { format: imageError.detail ?? '' });
      default:
        return ti('errors.general');
    }
  }, [ti]);

  const resetPolyline = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const preview = polylineRef.current.preview;
    if (canvas && preview) {
      canvas.remove(preview);
      canvas.requestRenderAll();
    }
    polylineRef.current = { points: [], preview: null };
    setPolylineCount(0);
  }, []);

  const removeObjects = useCallback((objects: FabricObject[]) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const removable = objects.filter((object) => !isBaseObject(object));
    if (removable.length === 0) return;

    canvas.remove(...removable);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    recordHistory();
  }, [recordHistory]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    removeObjects(canvas.getActiveObjects());
  }, [removeObjects]);

  const applyCanvasZoom = useCallback((nextScale: number, fitToViewport = false) => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return;

    const viewport = canvasViewportRef.current;
    const scrollCenter = viewport
      ? {
          x: (viewport.scrollLeft + viewport.clientWidth / 2) / Math.max(1, viewport.scrollWidth),
          y: (viewport.scrollTop + viewport.clientHeight / 2) / Math.max(1, viewport.scrollHeight),
        }
      : null;
    const scale = clampCanvasZoomScale(nextScale);

    zoomFitRef.current = fitToViewport;
    zoomScaleRef.current = scale;
    setZoomScale(scale);
    fitCanvasDisplaySize(canvas, currentImage.width, currentImage.height, viewport, scale);
    canvas.requestRenderAll();

    if (viewport && scrollCenter) {
      window.requestAnimationFrame(() => {
        viewport.scrollLeft = scrollCenter.x * viewport.scrollWidth - viewport.clientWidth / 2;
        viewport.scrollTop = scrollCenter.y * viewport.scrollHeight - viewport.clientHeight / 2;
      });
    }
  }, []);

  const fitCurrentCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return;
    const viewport = canvasViewportRef.current;
    const nextScale = zoomFitRef.current
      ? getCanvasFitScale(currentImage.width, currentImage.height, viewport)
      : zoomScaleRef.current;
    zoomScaleRef.current = nextScale;
    setZoomScale(nextScale);
    fitCanvasDisplaySize(canvas, currentImage.width, currentImage.height, viewport, nextScale);
    canvas.requestRenderAll();
  }, []);

  const fitCanvasToViewport = useCallback(() => {
    const currentImage = imageInfoRef.current;
    if (!currentImage) return;
    applyCanvasZoom(getCanvasFitScale(currentImage.width, currentImage.height, canvasViewportRef.current), true);
  }, [applyCanvasZoom]);

  const zoomIn = useCallback(() => {
    applyCanvasZoom(zoomScaleRef.current * CANVAS_ZOOM_FACTOR);
  }, [applyCanvasZoom]);

  const zoomOut = useCallback(() => {
    applyCanvasZoom(zoomScaleRef.current / CANVAS_ZOOM_FACTOR);
  }, [applyCanvasZoom]);

  const selectTool = useCallback((nextTool: EditorTool) => {
    const canvas = fabricCanvasRef.current;
    drawingStateRef.current = null;
    suppressNextTextCreateRef.current = false;
    if (toolRef.current === 'polyline' && nextTool !== 'polyline') resetPolyline();

    if (canvas) {
      exitActiveTextEditing(canvas);
      canvas.discardActiveObject();
      canvas.isDrawingMode = nextTool === 'brush' || nextTool === 'marker';
      canvas.defaultCursor =
        nextTool === 'text' ? 'text'
        : nextTool === 'eraser' ? 'not-allowed'
        : nextTool === 'select' ? 'default'
        : 'crosshair';
      canvas.hoverCursor =
        nextTool === 'select' ? 'move'
        : nextTool === 'eraser' ? 'not-allowed'
        : 'crosshair';
      applyToolInteractivity(canvas, nextTool);
      canvas.requestRenderAll();
    }

    setTool(nextTool);
    setError('');
  }, [resetPolyline]);

  const updateFreeDrawingBrush = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const brush = new PencilBrush(canvas);
    brush.width = strokeWidthRef.current;
    brush.color = toolRef.current === 'marker' ? colorWithAlpha(colorRef.current, 0.35) : colorRef.current;
    brush.strokeLineCap = 'round';
    brush.strokeLineJoin = 'round';
    canvas.freeDrawingBrush = brush;
  }, []);

  const addAnnotationObject = useCallback((object: FabricObject) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (!getObjectRole(object)) setObjectRole(object, 'annotation');
    canvas.add(object);
    applyToolInteractivity(canvas, toolRef.current);
    if (toolRef.current === 'select') {
      canvas.setActiveObject(object);
    }
    canvas.requestRenderAll();
    recordHistory();
  }, [recordHistory]);

  const addTextBox = useCallback((start: Point, end: Point) => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return;

    exitActiveTextEditing(canvas);

    const rect = createNormalizedRect(start, end, currentImage.width, currentImage.height);
    const isClick = Math.abs(end.x - start.x) < TEXTBOX_MIN_WIDTH && Math.abs(end.y - start.y) < fontSizeRef.current;
    const left = isClick ? Math.max(0, Math.min(start.x, currentImage.width - TEXTBOX_MIN_WIDTH)) : rect.x;
    const top = isClick ? Math.max(0, Math.min(start.y, currentImage.height - fontSizeRef.current)) : rect.y;
    const maxWidth = Math.max(TEXTBOX_MIN_WIDTH, currentImage.width - left);
    const width = isClick
      ? Math.min(TEXTBOX_DEFAULT_WIDTH, maxWidth)
      : Math.max(TEXTBOX_MIN_WIDTH, Math.min(rect.width, maxWidth));

    const text = new Textbox('', {
      left,
      top,
      width,
      originX: 'left',
      originY: 'top',
      fill: colorRef.current,
      fontFamily: 'sans-serif',
      fontSize: fontSizeRef.current,
      fontWeight: '600',
      editable: true,
      objectCaching: false,
    });
    setObjectRole(text, 'annotation');
    canvas.add(text);
    text.set({
      selectable: true,
      evented: true,
      hasControls: true,
      hasBorders: true,
      lockMovementX: false,
      lockMovementY: false,
    });
    canvas.setActiveObject(text);
    text.enterEditing();
    text.hiddenTextarea?.focus();
    canvas.requestRenderAll();
    recordHistory();
  }, [recordHistory]);

  const syncBaseCanvasFromFabric = useCallback((): boolean => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return false;

    const baseCanvas = syncBaseCanvasFromBaseImage(canvas, currentImage, baseCanvasRef.current);
    if (!baseCanvas) return false;

    baseCanvasRef.current = baseCanvas;
    return true;
  }, []);

  const replaceBaseImageFromCanvas = useCallback(async (): Promise<boolean> => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    const baseCanvas = baseCanvasRef.current;
    if (!canvas || !currentImage || !baseCanvas) return false;

    const baseImage = getBaseImageObject(canvas);
    if (!baseImage) return false;

    const imageElement = await createImageElementFromDataUrl(baseCanvas.toDataURL('image/png'));
    baseImage.setElement(imageElement, {
      width: currentImage.width,
      height: currentImage.height,
    });
    configureBaseObject(baseImage);
    canvas.sendObjectToBack(baseImage);
    baseImage.setCoords();
    canvas.requestRenderAll();
    return true;
  }, []);

  const createEffectPatch = useCallback(async (toolName: EffectTool, start: Point, end: Point) => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return;

    const rect = createNormalizedRect(start, end, currentImage.width, currentImage.height);
    if (rect.width < 2 || rect.height < 2) return;

    try {
      if (!baseCanvasRef.current && !syncBaseCanvasFromFabric()) {
        setError(ti('errors.canvas_context'));
        return;
      }

      const baseCanvas = baseCanvasRef.current;
      if (!baseCanvas) {
        setError(ti('errors.canvas_context'));
        return;
      }

      const ok = toolName === 'mosaic'
        ? applyMosaic(baseCanvas, rect, mosaicBlockSizeRef.current)
        : applyBlur(baseCanvas, rect, blurRadiusRef.current);
      if (!ok) {
        setError(ti('errors.canvas_context'));
        return;
      }

      const replaced = await replaceBaseImageFromCanvas();
      if (!replaced) {
        setError(ti('errors.canvas_context'));
        return;
      }

      canvas.discardActiveObject();
      canvas.requestRenderAll();
      recordHistory();
    } catch {
      setError(ti('errors.canvas_export'));
    }
  }, [recordHistory, replaceBaseImageFromCanvas, syncBaseCanvasFromFabric, ti]);

  const updatePolylinePreview = useCallback((pointer?: Point) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const state = polylineRef.current;
    const points = pointer ? [...state.points, pointer] : state.points;
    if (points.length < 2) return;

    if (state.preview) {
      canvas.remove(state.preview);
    }
    const preview = createPolylineFromScenePoints(points, {
      fill: 'transparent',
      stroke: colorRef.current,
      strokeWidth: strokeWidthRef.current,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      strokeDashArray: [8, 6],
      selectable: false,
      evented: false,
      objectCaching: false,
    });
    setObjectRole(preview, 'transient');
    canvas.add(preview);
    polylineRef.current.preview = preview;
    canvas.requestRenderAll();
  }, []);

  const finishPolyline = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const state = polylineRef.current;
    if (!canvas) return;

    if (state.points.length < 2) {
      setError(ti('errors.polyline_points'));
      return;
    }

    if (state.preview) canvas.remove(state.preview);
    const polyline = createPolylineFromScenePoints(state.points, {
      fill: 'transparent',
      stroke: colorRef.current,
      strokeWidth: strokeWidthRef.current,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      objectCaching: false,
    });
    polylineRef.current = { points: [], preview: null };
    setPolylineCount(0);
    addAnnotationObject(polyline);
  }, [addAnnotationObject, ti]);

  const addPolylinePoint = useCallback((point: Point): number => {
    const state = polylineRef.current;
    const lastPoint = state.points.at(-1);
    if (lastPoint && getPointDistance(lastPoint, point) <= POLYLINE_DUPLICATE_POINT_DISTANCE) {
      return state.points.length;
    }

    const points = [...state.points, point];
    polylineRef.current.points = points;
    setPolylineCount(points.length);
    return points.length;
  }, []);

  const handleCanvasMouseDownBefore = useCallback((event: TPointerEventInfo) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || toolRef.current !== 'text') return;

    const editingText = getActiveEditingText(canvas);
    if (!editingText || event.target === editingText) return;

    editingText.exitEditing();
    editingText.hiddenTextarea?.blur();
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    suppressNextTextCreateRef.current = true;
  }, []);

  const handleCanvasMouseDown = useCallback((event: TPointerEventInfo) => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return;

    const activeTool = toolRef.current;
    const pointer = getCanvasPoint(event);
    setError('');

    if (activeTool === 'eraser') {
      if (event.target && !isBaseObject(event.target)) {
        removeObjects(event.target === canvas.getActiveObject() ? canvas.getActiveObjects() : [event.target]);
      }
      return;
    }

    if (activeTool === 'select' || activeTool === 'brush' || activeTool === 'marker') return;

    if (activeTool === 'text' && suppressNextTextCreateRef.current) {
      suppressNextTextCreateRef.current = false;
      return;
    }

    if (activeTool === 'text' && event.target instanceof IText && !isBaseObject(event.target)) {
      exitActiveTextEditing(canvas);
      canvas.setActiveObject(event.target);
      event.target.enterEditing();
      event.target.hiddenTextarea?.focus();
      return;
    }

    if (activeTool === 'polyline') {
      addPolylinePoint(pointer);
      updatePolylinePreview();
      return;
    }

    const object = activeTool === 'mosaic' || activeTool === 'blur'
      ? new Rect({
          left: pointer.x,
          top: pointer.y,
          originX: 'left',
          originY: 'top',
          width: 1,
          height: 1,
          fill: colorWithAlpha(colorRef.current, 0.14),
          stroke: colorRef.current,
          strokeWidth: 3,
          strokeDashArray: [8, 6],
          selectable: false,
          evented: false,
          objectCaching: false,
        })
      : activeTool === 'text'
        ? new Rect({
            left: pointer.x,
            top: pointer.y,
            originX: 'left',
            originY: 'top',
            width: 1,
            height: 1,
            fill: colorWithAlpha(colorRef.current, 0.08),
            stroke: colorRef.current,
            strokeWidth: 2,
            strokeDashArray: [6, 5],
            selectable: false,
            evented: false,
            objectCaching: false,
          })
        : createShapeObject(activeTool, pointer, colorRef.current, strokeWidthRef.current, shapeModeRef.current);

    setObjectRole(object, activeTool === 'mosaic' || activeTool === 'blur' ? 'transient' : 'annotation');
    canvas.add(object);
    drawingStateRef.current = { tool: activeTool, start: pointer, object };
  }, [addPolylinePoint, removeObjects, updatePolylinePreview]);

  const handleCanvasDoubleClick = useCallback((event: TPointerEventInfo) => {
    if (toolRef.current !== 'polyline') return;

    const pointer = getCanvasPoint(event);
    addPolylinePoint(pointer);
    event.e.preventDefault();
    event.e.stopPropagation();
    finishPolyline();
  }, [addPolylinePoint, finishPolyline]);

  const handleCanvasMouseMove = useCallback((event: TPointerEventInfo) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const pointer = getCanvasPoint(event);
    if (toolRef.current === 'polyline' && polylineRef.current.points.length > 0) {
      updatePolylinePreview(pointer);
      return;
    }

    const drawingState = drawingStateRef.current;
    if (!drawingState) return;

    updateShapeObject(drawingState.object, drawingState.tool === 'blur' || drawingState.tool === 'mosaic' || drawingState.tool === 'text' ? 'rectangle' : drawingState.tool, drawingState.start, pointer);
    canvas.requestRenderAll();
  }, [updatePolylinePreview]);

  const handleCanvasMouseUp = useCallback((event: TPointerEventInfo) => {
    const canvas = fabricCanvasRef.current;
    const drawingState = drawingStateRef.current;
    if (!canvas || !drawingState) return;

    const pointer = getCanvasPoint(event);
    canvas.remove(drawingState.object);
    drawingStateRef.current = null;

    if (drawingState.tool === 'mosaic' || drawingState.tool === 'blur') {
      void createEffectPatch(drawingState.tool, drawingState.start, pointer);
      return;
    }

    if (drawingState.tool === 'text') {
      addTextBox(drawingState.start, pointer);
      return;
    }

    addAnnotationObject(drawingState.object);
  }, [addAnnotationObject, addTextBox, createEffectPatch]);

  useEffect(() => {
    const element = canvasElementRef.current;
    if (!element) return;

    const canvas = new Canvas(element, {
      width: 1,
      height: 1,
      allowTouchScrolling: true,
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: '#ffffff',
    });
    fabricCanvasRef.current = canvas;
    setCanvasReady(true);

    return () => {
      setCanvasReady(false);
      fabricCanvasRef.current = null;
      void canvas.dispose();
    };
  }, []);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvasReady) return;

    const disposers = [
      canvas.on('mouse:down:before', handleCanvasMouseDownBefore),
      canvas.on('mouse:down', handleCanvasMouseDown),
      canvas.on('mouse:dblclick', handleCanvasDoubleClick),
      canvas.on('mouse:move', handleCanvasMouseMove),
      canvas.on('mouse:up', handleCanvasMouseUp),
      canvas.on('object:modified', () => recordHistory()),
      canvas.on('text:changed', () => recordHistory()),
      canvas.on('path:created', (event) => {
        if (event.path) setObjectRole(event.path, 'annotation');
        applyToolInteractivity(canvas, toolRef.current);
        recordHistory();
      }),
    ];

    return () => {
      disposers.forEach((dispose) => dispose());
    };
  }, [canvasReady, handleCanvasDoubleClick, handleCanvasMouseDown, handleCanvasMouseDownBefore, handleCanvasMouseMove, handleCanvasMouseUp, recordHistory]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !canvasReady) return;
    updateFreeDrawingBrush();
    canvas.isDrawingMode = tool === 'brush' || tool === 'marker';
  }, [canvasReady, color, strokeWidth, tool, updateFreeDrawingBrush]);

  useEffect(() => {
    if (!canvasReady) return;

    const viewport = canvasViewportRef.current;
    fitCurrentCanvas();

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      fitCurrentCanvas();
    });
    if (viewport && observer) observer.observe(viewport);
    window.addEventListener('resize', fitCurrentCanvas);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', fitCurrentCanvas);
    };
  }, [canvasReady, fitCurrentCanvas, imageInfo]);

  useEffect(() => {
    if (!canvasReady) return;
    const frame = window.requestAnimationFrame(fitCurrentCanvas);
    return () => window.cancelAnimationFrame(frame);
  }, [canvasReady, fitCurrentCanvas, isFullscreen]);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const targetElement = event.target as HTMLElement | null;
      const tagName = targetElement?.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || targetElement?.isContentEditable) return;
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, isFullscreen]);

  const prepareFabricCanvas = useCallback((source: EditorImageSource) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return false;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    const fitScale = getCanvasFitScale(source.width, source.height, canvasViewportRef.current);
    zoomFitRef.current = true;
    zoomScaleRef.current = fitScale;
    setZoomScale(fitScale);
    syncCanvasDisplaySize(canvas, source.width, source.height, canvasViewportRef.current, fitScale);
    const baseCanvas = baseCanvasRef.current ?? document.createElement('canvas');
    if (!drawSourceToCanvas(baseCanvas, source.element, source.width, source.height)) {
      return false;
    }
    baseCanvasRef.current = baseCanvas;

    const baseImage = new FabricImage(source.element);
    configureBaseObject(baseImage);
    canvas.add(baseImage);
    canvas.sendObjectToBack(baseImage);
    canvas.requestRenderAll();
    setInitialHistory();
    return true;
  }, [setInitialHistory]);

  const resetToSource = useCallback(() => {
    const source = sourceRef.current;
    if (!source) return;
    prepareFabricCanvas(source);
    resetPolyline();
    clearOutput();
  }, [clearOutput, prepareFabricCanvas, resetPolyline]);

  const clearImage = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    loadRequestRef.current += 1;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    clearOutput();
    resetPolyline();
    sourceRef.current = null;
    drawingStateRef.current = null;
    baseCanvasRef.current = null;
    zoomFitRef.current = true;
    zoomScaleRef.current = 1;
    setZoomScale(1);
    historyRef.current = [];
    historyIndexRef.current = -1;
    updateHistoryStatus();
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      syncCanvasDisplaySize(canvas, 1, 1, canvasViewportRef.current);
      canvas.requestRenderAll();
    }
    setImageInfo(null);
    setSourceUrl('');
    setError('');
    setIsLoading(false);
    if (inputRef.current) inputRef.current.value = '';
  }, [clearOutput, resetPolyline, sourceUrl, updateHistoryStatus]);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const selected = Array.from(fileList)[0];
    if (!selected || !fabricCanvasRef.current) return;

    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setIsLoading(true);
    setError('');
    clearOutput();
    resetPolyline();

    const validationError = validateEditorImageFile(selected);
    if (validationError) {
      setIsLoading(false);
      setError(getErrorMessage(validationError));
      return;
    }

    const nextSourceUrl = URL.createObjectURL(selected);
    try {
      const source = await createImageSourceFromUrl(nextSourceUrl);
      if (requestId !== loadRequestRef.current) {
        URL.revokeObjectURL(nextSourceUrl);
        return;
      }

      const dimensionError = validateEditorImageDimensions(source.width, source.height);
      if (dimensionError) {
        URL.revokeObjectURL(nextSourceUrl);
        setIsLoading(false);
        setError(getErrorMessage(dimensionError));
        return;
      }

      if (!prepareFabricCanvas(source)) {
        URL.revokeObjectURL(nextSourceUrl);
        setIsLoading(false);
        setError(ti('errors.canvas_context'));
        return;
      }

      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      sourceRef.current = source;
      const nextImageInfo = {
        filename: selected.name,
        mimeType: inferImageMimeType(selected),
        width: source.width,
        height: source.height,
        size: selected.size,
      };
      setSourceUrl(nextSourceUrl);
      setImageInfo(nextImageInfo);
      imageInfoRef.current = nextImageInfo;
      setOutputFormat(getDefaultOutputFormat(selected));
      selectTool('select');
      setIsLoading(false);
    } catch {
      URL.revokeObjectURL(nextSourceUrl);
      if (requestId !== loadRequestRef.current) return;
      setIsLoading(false);
      setError(ti('errors.load_failed'));
    }
  }, [
    clearOutput,
    getErrorMessage,
    prepareFabricCanvas,
    resetPolyline,
    selectTool,
    sourceUrl,
    ti,
  ]);

  const undo = useCallback(() => {
    const nextIndex = historyIndexRef.current - 1;
    if (nextIndex < 0) return;
    historyIndexRef.current = nextIndex;
    updateHistoryStatus();
    void loadHistoryState(historyRef.current[nextIndex]);
  }, [loadHistoryState, updateHistoryStatus]);

  const redo = useCallback(() => {
    const nextIndex = historyIndexRef.current + 1;
    if (nextIndex >= historyRef.current.length) return;
    historyIndexRef.current = nextIndex;
    updateHistoryStatus();
    void loadHistoryState(historyRef.current[nextIndex]);
  }, [loadHistoryState, updateHistoryStatus]);

  const exportImage = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!imageInfo || !canvas) return;

    setIsExporting(true);
    setError('');
    clearOutput();

    try {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      const dataUrl = canvas.toDataURL({
        format: outputFormat === 'jpg' ? 'jpeg' : outputFormat,
        multiplier: 1,
        quality,
        enableRetinaScaling: false,
      });

      const result = exportEditedImageDataUrl({
        dataUrl,
        sourceFilename: imageInfo.filename,
        originalSize: imageInfo.size,
        targetFormat: outputFormat,
        width: imageInfo.width,
        height: imageInfo.height,
      });

      if (!result.ok) {
        setError(getErrorMessage(result));
        return;
      }

      const url = URL.createObjectURL(result.blob);
      setOutput({ result, url });
      downloadUrl(url, result.filename);
    } catch {
      setError(ti('errors.canvas_export'));
    } finally {
      setIsExporting(false);
    }
  }, [clearOutput, getErrorMessage, imageInfo, outputFormat, quality, ti]);

  const outputStats = useMemo(() => {
    if (!output) return null;
    return [
      { label: ti('output_size'), value: formatDimensions(output.result.width, output.result.height) },
      { label: ti('file_size'), value: formatFileSize(output.result.outputSize) },
      { label: ti('duration'), value: ti('duration_value', { value: output.result.durationMs }) },
    ];
  }, [output, ti]);

  const handleViewportDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault();
      setDraggingFile(true);
    }
  }, []);

  const handleViewportDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes('Files')) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const handleViewportDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node)) return;
    setDraggingFile(false);
  }, []);

  const handleViewportDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingFile(false);
    if (event.dataTransfer.files.length > 0) {
      void handleFiles(event.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleViewportWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    if (!imageInfoRef.current || (!event.ctrlKey && !event.metaKey)) return;
    event.preventDefault();
    applyCanvasZoom(
      zoomScaleRef.current * (event.deltaY < 0 ? CANVAS_ZOOM_FACTOR : 1 / CANVAS_ZOOM_FACTOR)
    );
  }, [applyCanvasZoom]);

  return (
    <ToolLayout toolId="image-editor">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) handleFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div className={editorShellClassName}>

        {/* 顶部操作条 */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-base bg-surface px-3 py-2">
          <div className="flex items-center gap-2">
            <Button size="md" onClick={() => inputRef.current?.click()}>
              <span className="inline-flex items-center gap-1.5">
                <IconUpload className="h-4 w-4" />
                {imageInfo ? ti('replace') : ti('drop_action')}
              </span>
            </Button>
            {imageInfo && (
              <div className="hidden items-center gap-3 text-xs sm:flex">
                <span className="max-w-[220px] truncate text-content-secondary" title={imageInfo.filename}>
                  {imageInfo.filename}
                </span>
                <span className="font-mono text-content-faint">
                  {formatDimensions(imageInfo.width, imageInfo.height)} · {formatFileSize(imageInfo.size)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <IconAction label={ti('undo')} onClick={undo} disabled={historyStatus.undo === 0}>
              <IconUndo className="h-4 w-4" />
            </IconAction>
            <IconAction label={ti('redo')} onClick={redo} disabled={historyStatus.redo === 0}>
              <IconRedo className="h-4 w-4" />
            </IconAction>
            <span className="mx-1 h-5 w-px bg-border-subtle" aria-hidden />
            <IconAction label={ti('delete_selected')} onClick={deleteSelected} disabled={!imageInfo}>
              <IconTrash className="h-4 w-4" />
            </IconAction>
            <IconAction label={ti('reset_all')} onClick={resetToSource} disabled={!imageInfo}>
              <IconReset className="h-4 w-4" />
            </IconAction>
            <span className="mx-1 h-5 w-px bg-border-subtle" aria-hidden />
            <IconAction label={ti('zoom_out')} onClick={zoomOut} disabled={!imageInfo || zoomScale <= CANVAS_MIN_ZOOM_SCALE + 0.001}>
              <IconZoomOut className="h-4 w-4" />
            </IconAction>
            <span className="min-w-12 text-center font-mono text-xs text-content-muted" aria-label={ti('zoom_level', { value: zoomPercent })}>
              {zoomPercent}
            </span>
            <IconAction label={ti('zoom_in')} onClick={zoomIn} disabled={!imageInfo || zoomScale >= CANVAS_MAX_ZOOM_SCALE - 0.001}>
              <IconZoomIn className="h-4 w-4" />
            </IconAction>
            <IconAction label={ti('zoom_fit')} onClick={fitCanvasToViewport} disabled={!imageInfo}>
              <IconFit className="h-4 w-4" />
            </IconAction>
            <span className="mx-1 h-5 w-px bg-border-subtle" aria-hidden />
            <IconAction
              label={isFullscreen ? ti('exit_fullscreen') : ti('fullscreen')}
              onClick={() => {
                setIsFullscreen((current) => !current);
                window.setTimeout(fitCurrentCanvas, 0);
              }}
              disabled={!canvasReady}
            >
              {isFullscreen ? <IconExitFullscreen className="h-4 w-4" /> : <IconFullscreen className="h-4 w-4" />}
            </IconAction>
            <span className="mx-1 h-5 w-px bg-border-subtle" aria-hidden />
            <Button variant="secondary" onClick={clearImage} disabled={!imageInfo && !error}>
              {tc('clear')}
            </Button>
          </div>
        </div>

        {/* 主编辑区：左工具栏 + 画布 + 右输出 */}
        <div
          className={clsx(
            'grid min-h-0 flex-grow grid-cols-1 gap-3',
            isFullscreen
              ? 'lg:grid-cols-[52px_minmax(0,1fr)_260px]'
              : 'lg:grid-cols-[52px_minmax(0,1fr)_240px] xl:grid-cols-[52px_minmax(0,1fr)_260px]',
          )}
        >

          {/* 左侧垂直工具栏 */}
          <div className="flex flex-row gap-1 overflow-x-auto rounded-md border border-border-base bg-surface p-1.5 lg:min-h-0 lg:flex-col lg:overflow-visible">
            {EDITOR_TOOLS.map(({ tool: option, Icon }) => (
              <IconAction
                key={option}
                label={ti(`tools.${option}`)}
                active={tool === option}
                disabled={!canEdit && option !== 'select'}
                onClick={() => selectTool(option)}
              >
                <Icon className="h-5 w-5" />
              </IconAction>
            ))}
          </div>

          {/* 中部：上下文选项条 + 画布 */}
          <div className="flex min-h-0 flex-col gap-2">

            {/* 上下文选项条 */}
            <div className="flex min-h-[44px] flex-wrap items-center gap-3 rounded-md border border-border-base bg-surface px-3 py-2">
              {/* 颜色（除选择/橡皮擦外都需要） */}
              {tool !== 'eraser' && tool !== 'select' && (
                <div className="flex items-center gap-2">
                  <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-md border border-border-input">
                    <span className="block h-full w-full" style={{ backgroundColor: color }} />
                    <input
                      type="color"
                      value={color}
                      onChange={(event) => setColor(event.target.value)}
                      aria-label={ti('color')}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                  <div className="hidden items-center gap-1 sm:flex">
                    {COLOR_SWATCHES.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        aria-label={ti('choose_color', { color: swatch })}
                        onClick={() => setColor(swatch)}
                        className={clsx(
                          'h-5 w-5 rounded-full border transition-transform hover:scale-110',
                          color === swatch ? 'border-border-strong ring-2 ring-action/40' : 'border-border-subtle',
                        )}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 线宽 */}
              {usesStrokeWidth && (
                <InlineRange
                  label={ti('stroke_width')}
                  value={strokeWidth}
                  min={2}
                  max={48}
                  unit="px"
                  onChange={setStrokeWidth}
                />
              )}

              {/* 形状模式 */}
              {(tool === 'rectangle' || tool === 'ellipse') && (
                <div className="flex items-center gap-1 rounded-md border border-border-subtle p-0.5 text-xs">
                  {(['stroke', 'fill'] as ShapeMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setShapeMode(mode)}
                      className={clsx(
                        'rounded px-2.5 py-1 transition-colors',
                        shapeMode === mode
                          ? 'bg-action text-white'
                          : 'text-content-muted hover:text-content',
                      )}
                    >
                      {ti(`shape_modes.${mode}`)}
                    </button>
                  ))}
                </div>
              )}

              {/* 文字 */}
              {tool === 'text' && (
                <InlineRange
                  label={ti('font_size')}
                  value={fontSize}
                  min={12}
                  max={128}
                  unit="px"
                  onChange={setFontSize}
                />
              )}

              {/* 马赛克 */}
              {tool === 'mosaic' && (
                <InlineRange
                  label={ti('mosaic_size')}
                  value={mosaicBlockSize}
                  min={6}
                  max={64}
                  unit="px"
                  onChange={setMosaicBlockSize}
                />
              )}

              {/* 模糊 */}
              {tool === 'blur' && (
                <InlineRange
                  label={ti('blur_radius')}
                  value={blurRadius}
                  min={2}
                  max={32}
                  unit="px"
                  onChange={setBlurRadius}
                />
              )}

              {/* 折线 */}
              {tool === 'polyline' && (
                <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-content-muted">
                    {ti('polyline_count', { count: polylineCount })} · {ti('polyline_hint_inline')}
                  </span>
                  <div className="flex gap-1.5">
                    <Button variant="secondary" onClick={resetPolyline} disabled={polylineCount === 0}>
                      {ti('cancel_polyline')}
                    </Button>
                    <Button onClick={finishPolyline} disabled={polylineCount < 2}>
                      {ti('finish_polyline')}
                    </Button>
                  </div>
                </div>
              )}

              {/* 橡皮擦提示 */}
              {tool === 'eraser' && (
                <span className="text-xs text-content-muted">{ti('eraser_hint')}</span>
              )}

              {/* 选择提示 */}
              {tool === 'select' && (
                <span className="text-xs text-content-muted">{ti('select_hint')}</span>
              )}

              {/* 右侧历史指示 */}
              {imageInfo && (
                <span className="ml-auto hidden font-mono text-[11px] text-content-faint md:inline">
                  {ti('history_value', { undo: historyStatus.undo, redo: historyStatus.redo })}
                </span>
              )}
            </div>

            {/* 画布视口：图片即画布。阴影/边框由 fitCanvasDisplaySize 注入到 Fabric 的 canvas-container 上 */}
            <div
              ref={canvasViewportRef}
              onDragEnter={handleViewportDragEnter}
              onDragOver={handleViewportDragOver}
              onDragLeave={handleViewportDragLeave}
              onDrop={handleViewportDrop}
              onWheel={handleViewportWheel}
              className={clsx(
                'relative flex flex-grow items-center justify-center overflow-auto rounded-md p-3 transition-colors sm:p-4',
                isFullscreen ? 'min-h-0' : 'min-h-[32rem] lg:min-h-0',
                imageInfo ? 'bg-background' : 'bg-surface-raised',
                draggingFile && 'ring-2 ring-action ring-offset-2 ring-offset-background',
              )}
            >
              <div className={clsx('relative', !imageInfo && 'pointer-events-none h-px w-px opacity-0')}>
                <canvas ref={canvasElementRef} />
              </div>

              {!imageInfo && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-border-subtle bg-surface/70 transition-colors hover:border-border-strong hover:bg-surface"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-hover text-content-muted">
                    <IconUpload className="h-7 w-7" />
                  </span>
                  <div className="max-w-sm text-center">
                    <p className="text-base font-semibold text-content">
                      {isLoading ? ti('loading') : ti('drop_title')}
                    </p>
                    <p className="mt-1 text-xs text-content-muted">
                      {ti('drop_hint', { formats: getSupportedImageInputLabel() })}
                    </p>
                  </div>
                </button>
              )}

              {draggingFile && imageInfo && (
                <div className="pointer-events-none absolute inset-2 flex items-center justify-center rounded-md border-2 border-dashed border-action bg-action/10 text-sm font-semibold text-action">
                  {ti('drop_replace')}
                </div>
              )}
            </div>
          </div>

          {/* 右侧输出/导出面板 */}
          <aside
            className={clsx(
              'flex min-h-0 flex-col gap-3 rounded-md border border-border-base bg-surface p-3',
              !isFullscreen && 'max-lg:min-h-[14rem]',
            )}
          >
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-content-faint">{ti('output_format')}</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {OUTPUT_FORMATS.map((format) => {
                  const config = getImageTargetConfig(format);
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
            </div>

            {showQuality && (
              <label className="block">
                <span className="mb-1.5 flex items-center justify-between text-xs text-content-muted">
                  <span>{ti('quality')}</span>
                  <span className="font-mono text-content-secondary">{ti('quality_value', { value: Math.round(quality * 100) })}</span>
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={quality}
                  onChange={(event) => {
                    setQuality(Number(event.target.value));
                    clearOutput();
                  }}
                  className="w-full accent-action"
                />
              </label>
            )}

            <Button onClick={exportImage} disabled={!canExport} className="w-full justify-center py-2">
              <span className="inline-flex items-center justify-center gap-1.5">
                <IconDownload className="h-4 w-4" />
                {isExporting ? ti('exporting') : ti('export')}
              </span>
            </Button>

            {output && (
              <div className="space-y-1.5 rounded-md border border-border-subtle bg-surface-raised p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-content">{ti('result_ready')}</span>
                  <button
                    type="button"
                    onClick={() => downloadUrl(output.url, output.result.filename)}
                    className="text-action hover:underline"
                  >
                    {ti('download')}
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
              {ti('local_note')}
            </p>
          </aside>
        </div>
      </div>
    </ToolLayout>
  );
}
