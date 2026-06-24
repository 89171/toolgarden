'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Canvas,
  Ellipse,
  FabricImage,
  FabricObject,
  IText,
  PencilBrush,
  Polyline,
  Rect,
  type TPointerEventInfo,
} from 'fabric';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
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
  tool: ShapeTool | EffectTool;
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
const CANVAS_VIEWPORT_PADDING = 24;

const EDITOR_TOOLS: Array<{ tool: EditorTool; icon: string }> = [
  { tool: 'select', icon: 'SEL' },
  { tool: 'brush', icon: 'PEN' },
  { tool: 'marker', icon: 'MRK' },
  { tool: 'rectangle', icon: 'REC' },
  { tool: 'ellipse', icon: 'ELL' },
  { tool: 'polyline', icon: 'LIN' },
  { tool: 'text', icon: 'TXT' },
  { tool: 'mosaic', icon: 'MOS' },
  { tool: 'blur', icon: 'BLR' },
  { tool: 'eraser', icon: 'ERS' },
];

const COLOR_SWATCHES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#111827'];

if (!FabricObject.customProperties.includes('data')) {
  FabricObject.customProperties.push('data');
}

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

function createShapeObject(tool: ShapeTool, point: Point, color: string, strokeWidth: number, shapeMode: ShapeMode): FabricObject {
  const common = {
    left: point.x,
    top: point.y,
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

function getCanvasDisplaySize(width: number, height: number, viewport: HTMLElement | null): { width: number; height: number } {
  const fallbackWidth = Math.max(160, Math.min(width, window.innerWidth - 48));
  const fallbackHeight = Math.max(160, Math.min(height, Math.round(window.innerHeight * 0.7)));
  const availableWidth = viewport ? viewport.clientWidth - CANVAS_VIEWPORT_PADDING : fallbackWidth;
  const availableHeight = viewport ? viewport.clientHeight - CANVAS_VIEWPORT_PADDING : fallbackHeight;
  const maxWidth = Math.max(160, availableWidth);
  const maxHeight = Math.max(160, availableHeight);
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}

function fitCanvasDisplaySize(canvas: Canvas, width: number, height: number, viewport: HTMLElement | null) {
  const displaySize = getCanvasDisplaySize(width, height, viewport);
  canvas.setDimensions({ width: `${displaySize.width}px`, height: `${displaySize.height}px` }, { cssOnly: true });

  const wrapper = canvas.wrapperEl;
  wrapper.style.width = `${displaySize.width}px`;
  wrapper.style.height = `${displaySize.height}px`;
  wrapper.style.maxWidth = 'none';
  wrapper.style.maxHeight = 'none';
  wrapper.style.aspectRatio = `${width} / ${height}`;

  [canvas.lowerCanvasEl, canvas.upperCanvasEl].forEach((element) => {
    element.style.width = `${displaySize.width}px`;
    element.style.height = `${displaySize.height}px`;
  });
}

function syncCanvasDisplaySize(canvas: Canvas, width: number, height: number, viewport: HTMLElement | null) {
  canvas.setDimensions({ width, height });
  fitCanvasDisplaySize(canvas, width, height, viewport);
}

function createPatchCanvasFromDataUrl(dataUrl: string, width: number, height: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Canvas context unavailable.'));
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      resolve(canvas);
    };
    image.onerror = () => reject(new Error('Patch image could not be loaded.'));
    image.src = dataUrl;
  });
}

export function ImageEditorTool() {
  const tc = useTranslations('common');
  const ti = useTranslations('image_editor');
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const sourceRef = useRef<EditorImageSource | null>(null);
  const sourceUrlRef = useRef('');
  const outputRef = useRef<OutputState | null>(null);
  const loadRequestRef = useRef(0);
  const drawingStateRef = useRef<DrawingState | null>(null);
  const polylineRef = useRef<PolylineState>({ points: [], preview: null });
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isRestoringRef = useRef(false);
  const toolRef = useRef<EditorTool>('select');
  const colorRef = useRef('#ef4444');
  const strokeWidthRef = useRef(6);
  const shapeModeRef = useRef<ShapeMode>('stroke');
  const textValueRef = useRef('');
  const fontSizeRef = useRef(36);
  const mosaicBlockSizeRef = useRef(18);
  const blurRadiusRef = useRef(8);
  const imageInfoRef = useRef<ImageInfo | null>(null);

  const [canvasReady, setCanvasReady] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [tool, setTool] = useState<EditorTool>('select');
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [shapeMode, setShapeMode] = useState<ShapeMode>('stroke');
  const [textValue, setTextValue] = useState('');
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

  const accept = getImageAcceptValue();
  const inputFormatLabels = getSupportedImageInputLabel().split(' / ');
  const target = getImageTargetConfig(outputFormat);
  const showQuality = target.supportsQuality;
  const canEdit = Boolean(imageInfo && canvasReady);
  const canExport = Boolean(imageInfo && canvasReady && !isLoading && !isExporting);
  const usesStrokeWidth = tool === 'brush' || tool === 'marker' || tool === 'rectangle' || tool === 'ellipse' || tool === 'polyline';

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
  }, [strokeWidth]);

  useEffect(() => {
    shapeModeRef.current = shapeMode;
  }, [shapeMode]);

  useEffect(() => {
    textValueRef.current = textValue;
  }, [textValue]);

  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  useEffect(() => {
    mosaicBlockSizeRef.current = mosaicBlockSize;
  }, [mosaicBlockSize]);

  useEffect(() => {
    blurRadiusRef.current = blurRadius;
  }, [blurRadius]);

  useEffect(() => {
    imageInfoRef.current = imageInfo;
  }, [imageInfo]);

  useEffect(() => {
    sourceUrlRef.current = sourceUrl;
  }, [sourceUrl]);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

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
      const currentImage = imageInfoRef.current;
      if (currentImage) {
        fitCanvasDisplaySize(canvas, currentImage.width, currentImage.height, canvasViewportRef.current);
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

  const fitCurrentCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return;
    fitCanvasDisplaySize(canvas, currentImage.width, currentImage.height, canvasViewportRef.current);
    canvas.requestRenderAll();
  }, []);

  const selectTool = useCallback((nextTool: EditorTool) => {
    const canvas = fabricCanvasRef.current;
    drawingStateRef.current = null;
    if (toolRef.current === 'polyline' && nextTool !== 'polyline') resetPolyline();

    if (canvas) {
      canvas.isDrawingMode = nextTool === 'brush' || nextTool === 'marker';
      canvas.selection = nextTool === 'select' || nextTool === 'eraser';
      canvas.defaultCursor = nextTool === 'text' ? 'text' : nextTool === 'eraser' ? 'not-allowed' : 'crosshair';
      canvas.hoverCursor = nextTool === 'eraser' ? 'not-allowed' : 'move';
      canvas.discardActiveObject();
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
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
    recordHistory();
  }, [recordHistory]);

  const addTextAt = useCallback((point: Point) => {
    const value = textValueRef.current.trim();
    if (!value) {
      setError(ti('errors.empty_text'));
      return;
    }

    const text = new IText(value, {
      left: point.x,
      top: point.y,
      fill: colorRef.current,
      fontFamily: 'sans-serif',
      fontSize: fontSizeRef.current,
      fontWeight: '600',
      editable: true,
    });
    addAnnotationObject(text);
    text.enterEditing();
  }, [addAnnotationObject, ti]);

  const createEffectPatch = useCallback(async (toolName: EffectTool, start: Point, end: Point) => {
    const canvas = fabricCanvasRef.current;
    const currentImage = imageInfoRef.current;
    if (!canvas || !currentImage) return;

    const rect = createNormalizedRect(start, end, currentImage.width, currentImage.height);
    if (rect.width < 2 || rect.height < 2) return;

    try {
      const snapshot = canvas.toDataURL({
        format: 'png',
        multiplier: 1,
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        enableRetinaScaling: false,
      });
      const patchCanvas = await createPatchCanvasFromDataUrl(snapshot, rect.width, rect.height);
      const ok = toolName === 'mosaic'
        ? applyMosaic(patchCanvas, { x: 0, y: 0, width: rect.width, height: rect.height }, mosaicBlockSizeRef.current)
        : applyBlur(patchCanvas, { x: 0, y: 0, width: rect.width, height: rect.height }, blurRadiusRef.current);
      if (!ok) {
        setError(ti('errors.canvas_context'));
        return;
      }

      const patchImage = await FabricImage.fromURL(patchCanvas.toDataURL('image/png'));
      patchImage.set({
        left: rect.x,
        top: rect.y,
        selectable: true,
        evented: true,
      });
      setObjectRole(patchImage, 'annotation');
      addAnnotationObject(patchImage);
    } catch {
      setError(ti('errors.canvas_export'));
    }
  }, [addAnnotationObject, ti]);

  const updatePolylinePreview = useCallback((pointer?: Point) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const state = polylineRef.current;
    const points = pointer ? [...state.points, pointer] : state.points;
    if (points.length < 2) return;

    if (!state.preview) {
      const preview = new Polyline(points, {
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
      state.preview = preview;
    } else {
      state.preview.set({
        points,
        stroke: colorRef.current,
        strokeWidth: strokeWidthRef.current,
      });
      state.preview.setDimensions();
      state.preview.setCoords();
    }
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
    const polyline = new Polyline(state.points, {
      fill: 'transparent',
      stroke: colorRef.current,
      strokeWidth: strokeWidthRef.current,
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      selectable: true,
      evented: true,
      objectCaching: false,
    });
    setObjectRole(polyline, 'annotation');
    canvas.add(polyline);
    canvas.setActiveObject(polyline);
    canvas.requestRenderAll();
    polylineRef.current = { points: [], preview: null };
    setPolylineCount(0);
    recordHistory();
  }, [recordHistory, ti]);

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

    if (activeTool === 'text') {
      addTextAt(pointer);
      return;
    }

    if (activeTool === 'polyline') {
      polylineRef.current.points = [...polylineRef.current.points, pointer];
      setPolylineCount(polylineRef.current.points.length);
      updatePolylinePreview();
      return;
    }

    const object = activeTool === 'mosaic' || activeTool === 'blur'
      ? new Rect({
          left: pointer.x,
          top: pointer.y,
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
      : createShapeObject(activeTool, pointer, colorRef.current, strokeWidthRef.current, shapeModeRef.current);

    setObjectRole(object, activeTool === 'mosaic' || activeTool === 'blur' ? 'transient' : 'annotation');
    canvas.add(object);
    drawingStateRef.current = { tool: activeTool, start: pointer, object };
  }, [addTextAt, removeObjects, updatePolylinePreview]);

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

    updateShapeObject(drawingState.object, drawingState.tool === 'blur' || drawingState.tool === 'mosaic' ? 'rectangle' : drawingState.tool, drawingState.start, pointer);
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

    canvas.add(drawingState.object);
    canvas.setActiveObject(drawingState.object);
    canvas.requestRenderAll();
    recordHistory();
  }, [createEffectPatch, recordHistory]);

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
      canvas.on('mouse:down', handleCanvasMouseDown),
      canvas.on('mouse:move', handleCanvasMouseMove),
      canvas.on('mouse:up', handleCanvasMouseUp),
      canvas.on('object:modified', () => recordHistory()),
      canvas.on('text:changed', () => recordHistory()),
      canvas.on('path:created', (event) => {
        if (event.path) setObjectRole(event.path, 'annotation');
        recordHistory();
      }),
    ];

    return () => {
      disposers.forEach((dispose) => dispose());
    };
  }, [canvasReady, handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp, recordHistory]);

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

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const targetElement = event.target as HTMLElement | null;
      const tagName = targetElement?.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || targetElement?.isContentEditable) return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  const prepareFabricCanvas = useCallback((source: EditorImageSource) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return false;

    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    syncCanvasDisplaySize(canvas, source.width, source.height, canvasViewportRef.current);

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

  return (
    <ToolLayout toolId="image-editor">
      <div className="grid flex-grow grid-cols-1 gap-4 overflow-auto pb-4 sm:gap-6 sm:pb-8 xl:min-h-0 xl:grid-cols-[minmax(320px,400px)_1fr] xl:overflow-hidden">
        <Panel
          title={ti('settings_title')}
          actions={<Button variant="secondary" onClick={clearImage} disabled={!imageInfo && !error}>{tc('clear')}</Button>}
          className="h-[min(46rem,calc(100svh-12rem))] min-h-0 overflow-hidden xl:h-auto"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-4 overflow-y-auto overscroll-contain pr-1">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                if (event.target.files) handleFiles(event.target.files);
              }}
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDraggingFile(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDraggingFile(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDraggingFile(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDraggingFile(false);
                handleFiles(event.dataTransfer.files);
              }}
              aria-label={ti('drop_action')}
              className={`group flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-4 text-center transition-colors ${
                draggingFile
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <span className="flex flex-col gap-1">
                <span className="text-base font-semibold text-content">{imageInfo ? ti('replace') : ti('drop_title')}</span>
                <span className="max-w-72 text-xs leading-relaxed text-content-muted">
                  {ti('drop_hint', { formats: getSupportedImageInputLabel() })}
                </span>
              </span>
            </button>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                {ti('input_formats')}
              </span>
              <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {inputFormatLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-xs text-content-muted"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <p className="rounded-lg border border-border-subtle bg-surface-raised p-3 text-xs leading-relaxed text-content-muted">
              {ti('local_note')}
            </p>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <span className="mb-3 block text-sm font-semibold text-content">{ti('tool_title')}</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EDITOR_TOOLS.map(({ tool: option, icon }) => {
                  const active = tool === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectTool(option)}
                      disabled={!canEdit && option !== 'select'}
                      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded border px-2 py-2 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                        active
                          ? 'border-border-strong bg-action text-background'
                          : 'border-border-subtle bg-surface text-content-muted hover:border-border-strong hover:text-content-secondary'
                      }`}
                    >
                      <span className="font-mono text-xs font-semibold">{icon}</span>
                      <span className="text-xs leading-tight">{ti(`tools.${option}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {tool === 'polyline' && (
              <div className="rounded-lg border border-border-base bg-surface-raised p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-sm font-semibold text-content">{ti('polyline_title')}</span>
                    <span className="text-xs text-content-faint">
                      {ti('polyline_count', { count: polylineCount })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={resetPolyline} disabled={polylineCount === 0}>
                      {ti('cancel_polyline')}
                    </Button>
                    <Button onClick={finishPolyline} disabled={polylineCount < 2}>
                      {ti('finish_polyline')}
                    </Button>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-content-muted">{ti('polyline_hint')}</p>
              </div>
            )}

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <span className="mb-3 block text-sm font-semibold text-content">{ti('style_title')}</span>
              <label className="block">
                <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                  <span>{ti('color')}</span>
                  <span className="font-mono uppercase">{color}</span>
                </span>
                <input
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                  className="h-10 w-full rounded border border-border-input bg-surface p-1"
                />
              </label>
              <div className="mt-3 grid grid-cols-8 gap-1.5">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    aria-label={ti('choose_color', { color: swatch })}
                    onClick={() => setColor(swatch)}
                    className={`h-8 rounded border transition-transform hover:scale-105 ${
                      color === swatch ? 'border-border-strong' : 'border-border-subtle'
                    }`}
                    style={{ backgroundColor: swatch }}
                  />
                ))}
              </div>

              {usesStrokeWidth && (
                <label className="mt-4 block">
                  <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                    <span>{ti('stroke_width')}</span>
                    <span className="font-mono">{strokeWidth}px</span>
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={48}
                    step={1}
                    value={strokeWidth}
                    onChange={(event) => setStrokeWidth(Number(event.target.value))}
                    className="w-full accent-action"
                  />
                </label>
              )}

              {(tool === 'rectangle' || tool === 'ellipse') && (
                <div className="mt-4">
                  <span className="mb-2 block text-xs text-content-faint">{ti('shape_mode')}</span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['stroke', 'fill'] as ShapeMode[]).map((mode) => {
                      const active = shapeMode === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setShapeMode(mode)}
                          className={`rounded border px-3 py-2 text-sm transition-colors ${
                            active
                              ? 'border-border-strong bg-action text-background'
                              : 'border-border-subtle bg-surface text-content-muted hover:border-border-strong hover:text-content-secondary'
                          }`}
                        >
                          {ti(`shape_modes.${mode}`)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tool === 'text' && (
                <div className="mt-4 space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-xs text-content-faint">{ti('text_content')}</span>
                    <textarea
                      value={textValue}
                      onChange={(event) => setTextValue(event.target.value)}
                      rows={3}
                      placeholder={ti('text_placeholder')}
                      className="w-full resize-y rounded border border-border-input bg-surface px-3 py-2 text-sm text-content outline-none transition-colors focus:border-border-strong"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                      <span>{ti('font_size')}</span>
                      <span className="font-mono">{fontSize}px</span>
                    </span>
                    <input
                      type="range"
                      min={12}
                      max={128}
                      step={1}
                      value={fontSize}
                      onChange={(event) => setFontSize(Number(event.target.value))}
                      className="w-full accent-action"
                    />
                  </label>
                </div>
              )}

              {tool === 'mosaic' && (
                <label className="mt-4 block">
                  <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                    <span>{ti('mosaic_size')}</span>
                    <span className="font-mono">{mosaicBlockSize}px</span>
                  </span>
                  <input
                    type="range"
                    min={6}
                    max={64}
                    step={1}
                    value={mosaicBlockSize}
                    onChange={(event) => setMosaicBlockSize(Number(event.target.value))}
                    className="w-full accent-action"
                  />
                </label>
              )}

              {tool === 'blur' && (
                <label className="mt-4 block">
                  <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                    <span>{ti('blur_radius')}</span>
                    <span className="font-mono">{blurRadius}px</span>
                  </span>
                  <input
                    type="range"
                    min={2}
                    max={32}
                    step={1}
                    value={blurRadius}
                    onChange={(event) => setBlurRadius(Number(event.target.value))}
                    className="w-full accent-action"
                  />
                </label>
              )}

              {tool === 'eraser' && (
                <p className="mt-4 rounded border border-border-subtle bg-surface p-2 text-xs leading-relaxed text-content-muted">
                  {ti('eraser_hint')}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border-base bg-surface-raised p-3">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-normal text-content-faint">
                {ti('output_format')}
              </span>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`rounded border px-2 py-2 font-mono text-sm font-semibold transition-colors ${
                        active
                          ? 'border-border-strong bg-action text-background'
                          : 'border-border-subtle bg-surface text-content-muted hover:border-border-strong hover:text-content-secondary'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>

              {showQuality && (
                <label className="mt-4 block">
                  <span className="mb-2 flex items-center justify-between gap-3 text-xs text-content-faint">
                    <span>{ti('quality')}</span>
                    <span className="font-mono">{ti('quality_value', { value: Math.round(quality * 100) })}</span>
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
            </div>

            {imageInfo && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="border-t border-border-subtle pt-3">
                  <span className="block text-xs text-content-faint">{ti('source_size')}</span>
                  <span className="font-mono font-semibold text-content-secondary">
                    {formatDimensions(imageInfo.width, imageInfo.height)}
                  </span>
                </div>
                <div className="border-t border-border-subtle pt-3">
                  <span className="block text-xs text-content-faint">{ti('file_size')}</span>
                  <span className="font-mono font-semibold text-content-secondary">{formatFileSize(imageInfo.size)}</span>
                </div>
              </div>
            )}

            <Button onClick={exportImage} disabled={!canExport} className="w-full justify-center">
              {isExporting ? ti('exporting') : ti('export')}
            </Button>

            {output && (
              <div className="rounded-lg border border-border-base bg-surface-raised p-3 text-sm">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-semibold text-content">{ti('result_ready')}</span>
                  <Button variant="secondary" onClick={() => downloadUrl(output.url, output.result.filename)}>
                    {ti('download')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {outputStats?.map((item) => (
                    <div key={item.label} className="flex justify-between gap-3 border-t border-border-subtle pt-2">
                      <span className="text-content-faint">{item.label}</span>
                      <span className="font-mono font-semibold text-content-secondary">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-danger-surface bg-danger-surface px-3 py-2 text-sm text-danger-content">
                {error}
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title={ti('editor_title')}
          actions={(
            <>
              <Button variant="secondary" onClick={undo} disabled={historyStatus.undo === 0}>
                {ti('undo')}
              </Button>
              <Button variant="secondary" onClick={redo} disabled={historyStatus.redo === 0}>
                {ti('redo')}
              </Button>
              <Button variant="secondary" onClick={deleteSelected} disabled={!imageInfo}>
                {ti('delete_selected')}
              </Button>
              <Button variant="secondary" onClick={resetToSource} disabled={!imageInfo}>
                {ti('reset_all')}
              </Button>
            </>
          )}
          className="min-h-[42rem] overflow-hidden xl:min-h-0"
        >
          <div className="flex min-h-0 flex-grow flex-col gap-3">
            <div
              ref={canvasViewportRef}
              className="relative flex min-h-[26rem] flex-grow items-center justify-center overflow-hidden rounded-lg border border-border-input bg-surface-raised p-3 xl:min-h-0"
            >
              <div className={imageInfo ? 'block' : 'pointer-events-none h-px w-px opacity-0'}>
                <canvas ref={canvasElementRef} />
              </div>

              {!imageInfo && (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="flex max-w-sm flex-col items-center gap-3 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-border-subtle bg-surface font-mono text-sm font-semibold text-content-faint">
                      EDT
                    </span>
                    <div>
                      <h2 className="font-semibold text-content">{isLoading ? ti('loading') : ti('empty_title')}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-content-muted">{ti('empty_body')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {imageInfo && (
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                <div className="rounded border border-border-subtle bg-surface-raised p-3">
                  <span className="block text-xs text-content-faint">{ti('filename')}</span>
                  <span className="break-all text-content-secondary">{imageInfo.filename}</span>
                </div>
                <div className="rounded border border-border-subtle bg-surface-raised p-3">
                  <span className="block text-xs text-content-faint">{ti('history')}</span>
                  <span className="font-mono text-content-secondary">
                    {ti('history_value', { undo: historyStatus.undo, redo: historyStatus.redo })}
                  </span>
                </div>
                <div className="rounded border border-border-subtle bg-surface-raised p-3">
                  <span className="block text-xs text-content-faint">{ti('type')}</span>
                  <span className="font-mono text-content-secondary">{imageInfo.mimeType || ti('unknown_type')}</span>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
