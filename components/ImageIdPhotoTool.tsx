'use client';

/* eslint-disable @next/next/no-img-element -- Local previews use object URLs. */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import type { ToolContent } from '@/lib/tools/content';
import {
  inspectImageFile,
  preloadImageBackgroundRemovalModel,
  removeImageBackground,
} from '@/lib/utils/image-browser';
import {
  formatFileSize,
  getImageAcceptValue,
  getSupportedImageInputLabel,
  type ImageBackgroundRemovalModel,
  type ImageBackgroundRemovalProgress,
  type ImageConversionError,
  type ImageInspectionSuccess,
} from '@/lib/utils/image';
import {
  createIdPhotoFilename,
  createInitialIdPhotoTransform,
  detectFaceBounds,
  formatIdPhotoMm,
  formatIdPhotoPixels,
  getIdPhotoCanvasSize,
  getSubjectBoundsFromImageUrl,
  clampIdPhotoScale,
  idPhotoBackgroundColors,
  idPhotoPresets,
  ID_PHOTO_DPI,
  ID_PHOTO_SCALE_MAX,
  ID_PHOTO_SCALE_MIN,
  normalizeCustomMillimeters,
  renderIdPhotoImage,
  scaleIdPhotoTransform,
  type IdPhotoBounds,
  type IdPhotoCanvasSize,
  type IdPhotoFaceStatus,
  type IdPhotoPreset,
  type IdPhotoPresetId,
  type IdPhotoTransform,
} from '@/lib/utils/id-photo';

type ProcessingStatus = 'idle' | 'loading' | 'ready' | 'processing' | 'error';
type OutputFormat = 'jpg' | 'png';

interface SourceImage {
  id: string;
  file: File;
  url: string;
  info?: ImageInspectionSuccess;
  error?: ImageConversionError;
}

interface SubjectImage {
  url: string;
  width: number;
  height: number;
  faceBounds: IdPhotoBounds | null;
  subjectBounds: IdPhotoBounds | null;
  faceStatus: IdPhotoFaceStatus;
}

interface PointerPosition {
  clientX: number;
  clientY: number;
}

interface CanvasPoint {
  x: number;
  y: number;
}

type GestureState =
  | {
      mode: 'drag';
      pointerId: number;
      startPoint: CanvasPoint;
      startTransform: IdPhotoTransform;
    }
  | {
      mode: 'pinch';
      startDistance: number;
      startCenter: CanvasPoint;
      startTransform: IdPhotoTransform;
    };

const TOOL_ID = 'image-id-photo';
const CUSTOM_PRESET_ID: IdPhotoPresetId = 'custom';

function createImageId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`;
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

function getProgressPercent(progress: ImageBackgroundRemovalProgress | null, virtualProgress: number): number {
  if (!progress) return virtualProgress;
  const base = progress.stage === 'model' ? 8 : 62;
  const span = progress.stage === 'model' ? 54 : 32;
  return Math.min(98, Math.max(8, Math.round(base + (progress.percent / 100) * span)));
}

function getPresetById(id: IdPhotoPresetId): IdPhotoPreset | null {
  return idPhotoPresets.find((preset) => preset.id === id) ?? null;
}

function getCanvasPoint(clientX: number, clientY: number, element: HTMLElement, canvas: IdPhotoCanvasSize): CanvasPoint {
  const rect = element.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / Math.max(1, rect.width)) * canvas.width,
    y: ((clientY - rect.top) / Math.max(1, rect.height)) * canvas.height,
  };
}

function getPointerDistance(first: PointerPosition, second: PointerPosition): number {
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function getPointerCenter(first: PointerPosition, second: PointerPosition): PointerPosition {
  return {
    clientX: (first.clientX + second.clientX) / 2,
    clientY: (first.clientY + second.clientY) / 2,
  };
}

interface ImageIdPhotoToolProps {
  content?: ToolContent;
}

export function ImageIdPhotoTool({ content }: ImageIdPhotoToolProps) {
  const ti = useTranslations('image_id_photo');
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<SourceImage | null>(null);
  const subjectRef = useRef<SubjectImage | null>(null);
  const transformRef = useRef<IdPhotoTransform>({ x: 0, y: 0, scale: 1 });
  const pointerRef = useRef<Map<number, PointerPosition>>(new Map());
  const gestureRef = useRef<GestureState | null>(null);
  const jobRef = useRef<string | null>(null);

  const [source, setSource] = useState<SourceImage | null>(null);
  const [subject, setSubject] = useState<SubjectImage | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<IdPhotoPresetId>('cn-one-inch');
  const [customWidthMm, setCustomWidthMm] = useState('35');
  const [customHeightMm, setCustomHeightMm] = useState('45');
  const [backgroundColor, setBackgroundColor] = useState<string>(idPhotoBackgroundColors[0].value);
  const [customBackgroundColor, setCustomBackgroundColor] = useState<string>(idPhotoBackgroundColors[0].value);
  const [model, setModel] = useState<ImageBackgroundRemovalModel>('small');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg');
  const [transform, setTransform] = useState<IdPhotoTransform>({ x: 0, y: 0, scale: 1 });
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [draggingFile, setDraggingFile] = useState(false);
  const [progress, setProgress] = useState<ImageBackgroundRemovalProgress | null>(null);
  const [virtualProgress, setVirtualProgress] = useState(0);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const accept = getImageAcceptValue();
  const inputFormatLabels = useMemo(() => getSupportedImageInputLabel().split(' / '), []);
  const selectedPreset = getPresetById(selectedPresetId);
  const size = useMemo(() => {
    const widthMm = selectedPreset
      ? selectedPreset.widthMm
      : normalizeCustomMillimeters(customWidthMm, 35);
    const heightMm = selectedPreset
      ? selectedPreset.heightMm
      : normalizeCustomMillimeters(customHeightMm, 45);

    return { widthMm, heightMm, dpi: ID_PHOTO_DPI };
  }, [customHeightMm, customWidthMm, selectedPreset]);
  const canvas = useMemo(() => getIdPhotoCanvasSize(size), [size]);
  const currentPresetForFit = useMemo(() => selectedPreset ?? {
    headRatio: 0.62,
    headTopRatio: 0.12,
  }, [selectedPreset]);
  const hasSubject = Boolean(subject);
  const canExport = Boolean(subject && status !== 'processing' && !isExporting);
  const progressPercent = getProgressPercent(progress, virtualProgress);
  const mmLabel = formatIdPhotoMm(size.widthMm, size.heightMm);
  const pixelLabel = formatIdPhotoPixels(canvas.width, canvas.height);
  const activePresetId = selectedPreset?.id ?? CUSTOM_PRESET_ID;

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    subjectRef.current = subject;
  }, [subject]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  useEffect(() => {
    let cancelled = false;
    const preloadModel = () => {
      if (cancelled) return;
      void preloadImageBackgroundRemovalModel(model).catch(() => undefined);
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(preloadModel, { timeout: 2500 });
      return () => {
        cancelled = true;
        idleWindow.cancelIdleCallback?.(handle);
      };
    }

    const handle = window.setTimeout(preloadModel, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [model]);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !subject) return undefined;

    const handleWheelZoom = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      event.stopPropagation();
      const deltaMultiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 120 : 1;
      const pixelDelta = event.deltaY * deltaMultiplier;
      const zoomFactor = Math.min(1.18, Math.max(0.85, Math.exp(-pixelDelta * 0.006)));
      const anchor = getCanvasPoint(event.clientX, event.clientY, preview, canvas);

      setTransform((current) => scaleIdPhotoTransform(current, current.scale * zoomFactor, anchor));
    };

    preview.addEventListener('wheel', handleWheelZoom, { passive: false });

    return () => {
      preview.removeEventListener('wheel', handleWheelZoom);
    };
  }, [canvas, subject]);

  useEffect(() => () => {
    if (sourceRef.current) URL.revokeObjectURL(sourceRef.current.url);
    if (subjectRef.current) URL.revokeObjectURL(subjectRef.current.url);
  }, []);

  const getImageErrorMessage = useCallback((imageError: ImageConversionError): string => {
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
        return imageError.detail ? `${ti('errors.canvas_export')} ${imageError.detail}` : ti('errors.canvas_export');
      case 'unsupported_output':
        return ti('errors.unsupported_output', { format: imageError.detail ?? '' });
      default:
        return ti('errors.general');
    }
  }, [ti]);

  const fitSubjectToTemplate = useCallback((nextSubject = subjectRef.current) => {
    if (!nextSubject) return;
    setTransform(createInitialIdPhotoTransform({
      canvas,
      sourceWidth: nextSubject.width,
      sourceHeight: nextSubject.height,
      preset: currentPresetForFit,
      faceBounds: nextSubject.faceBounds,
      subjectBounds: nextSubject.subjectBounds,
    }));
  }, [canvas, currentPresetForFit]);

  useEffect(() => {
    fitSubjectToTemplate();
  }, [fitSubjectToTemplate, subject]);

  const clearCurrentImage = useCallback(() => {
    jobRef.current = null;
    if (sourceRef.current) URL.revokeObjectURL(sourceRef.current.url);
    if (subjectRef.current) URL.revokeObjectURL(subjectRef.current.url);
    sourceRef.current = null;
    subjectRef.current = null;
    pointerRef.current.clear();
    gestureRef.current = null;
    setSource(null);
    setSubject(null);
    setProgress(null);
    setVirtualProgress(0);
    setError('');
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const processSourceImage = useCallback(async (target: SourceImage) => {
    if (!target.file || !target.info) return;

    const jobId = `${target.id}-${Date.now()}`;
    jobRef.current = jobId;
    setStatus('processing');
    setError('');
    setProgress(null);
    setVirtualProgress(10);

    const facePromise = detectFaceBounds(target.file);
    const removalPromise = removeImageBackground(target.file, {
      model,
      onProgress: (nextProgress) => {
        if (jobRef.current !== jobId) return;
        setProgress(nextProgress);
      },
    });

    const [faceResult, removalResult] = await Promise.all([facePromise, removalPromise]);
    if (jobRef.current !== jobId) return;

    if (!removalResult.ok) {
      setStatus('error');
      setError(getImageErrorMessage(removalResult));
      setProgress(null);
      return;
    }

    setVirtualProgress(96);
    const nextSubjectUrl = URL.createObjectURL(removalResult.blob);
    const subjectBounds = await getSubjectBoundsFromImageUrl(nextSubjectUrl);
    if (jobRef.current !== jobId) {
      URL.revokeObjectURL(nextSubjectUrl);
      return;
    }

    if (subjectRef.current) URL.revokeObjectURL(subjectRef.current.url);
    const nextSubject: SubjectImage = {
      url: nextSubjectUrl,
      width: removalResult.width,
      height: removalResult.height,
      faceBounds: faceResult.bounds,
      subjectBounds,
      faceStatus: faceResult.status,
    };

    subjectRef.current = nextSubject;
    setSubject(nextSubject);
    setTransform(createInitialIdPhotoTransform({
      canvas,
      sourceWidth: nextSubject.width,
      sourceHeight: nextSubject.height,
      preset: currentPresetForFit,
      faceBounds: nextSubject.faceBounds,
      subjectBounds: nextSubject.subjectBounds,
    }));
    setProgress(null);
    setVirtualProgress(0);
    setStatus('ready');
  }, [canvas, currentPresetForFit, getImageErrorMessage, model]);

  const addFile = useCallback((fileList: FileList | File[]) => {
    const file = Array.from(fileList)[0];
    if (!file) return;

    clearCurrentImage();
    const id = createImageId(file);
    const nextSource: SourceImage = {
      id,
      file,
      url: URL.createObjectURL(file),
    };

    sourceRef.current = nextSource;
    setSource(nextSource);
    setStatus('loading');

    void inspectImageFile(file).then((inspection) => {
      const current = sourceRef.current;
      if (!current || current.id !== id) return;

      if (inspection.ok) {
        const inspectedSource: SourceImage = { ...current, info: inspection, error: undefined };
        sourceRef.current = inspectedSource;
        setSource(inspectedSource);
        void processSourceImage(inspectedSource);
        return;
      }

      const failedSource: SourceImage = { ...current, error: inspection };
      sourceRef.current = failedSource;
      setSource(failedSource);
      setStatus('error');
      setError(getImageErrorMessage(inspection));
    });
  }, [clearCurrentImage, getImageErrorMessage, processSourceImage]);

  const exportPhoto = useCallback(async () => {
    const target = sourceRef.current;
    const currentSubject = subjectRef.current;
    if (!target || !currentSubject || isExporting) return;

    setIsExporting(true);
    setError('');
    const extension = outputFormat === 'png' ? 'png' : 'jpg';
    try {
      const result = await renderIdPhotoImage({
        subjectUrl: currentSubject.url,
        canvas,
        transform,
        backgroundColor,
        filename: createIdPhotoFilename(target.file.name, activePresetId, extension),
        format: outputFormat,
      });

      if (result.ok) {
        const url = URL.createObjectURL(result.blob);
        downloadUrl(url, result.filename);
        window.setTimeout(() => URL.revokeObjectURL(url), 15000);
      } else {
        setError(ti(`errors.${result.code}`));
      }
    } finally {
      setIsExporting(false);
    }
  }, [activePresetId, backgroundColor, canvas, isExporting, outputFormat, ti, transform]);

  const updatePreset = useCallback((presetId: IdPhotoPresetId) => {
    setSelectedPresetId(presetId);
  }, []);

  const chooseBackgroundColor = useCallback((color: string) => {
    setBackgroundColor(color);
    setCustomBackgroundColor(color);
  }, []);

  const beginGestureFromPointers = useCallback(() => {
    const preview = previewRef.current;
    const pointers = Array.from(pointerRef.current.values());
    if (!preview || pointers.length === 0) {
      gestureRef.current = null;
      return;
    }

    const currentTransform = transformRef.current;
    if (pointers.length >= 2) {
      const first = pointers[0];
      const second = pointers[1];
      const distance = getPointerDistance(first, second);
      if (distance <= 0) {
        gestureRef.current = null;
        return;
      }

      const center = getPointerCenter(first, second);
      gestureRef.current = {
        mode: 'pinch',
        startDistance: distance,
        startCenter: getCanvasPoint(center.clientX, center.clientY, preview, canvas),
        startTransform: currentTransform,
      };
      return;
    }

    const pointerId = Array.from(pointerRef.current.keys())[0];
    const pointer = pointers[0];
    if (pointerId === undefined) {
      gestureRef.current = null;
      return;
    }

    gestureRef.current = {
      mode: 'drag',
      pointerId,
      startPoint: getCanvasPoint(pointer.clientX, pointer.clientY, preview, canvas),
      startTransform: currentTransform,
    };
  }, [canvas]);

  const beginGesture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!subjectRef.current || !previewRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });
    beginGestureFromPointers();
  }, [beginGestureFromPointers]);

  const moveGesture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const preview = previewRef.current;
    const gesture = gestureRef.current;
    if (!preview || !gesture || !pointerRef.current.has(event.pointerId)) return;

    event.preventDefault();
    event.stopPropagation();
    pointerRef.current.set(event.pointerId, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    if (gesture.mode === 'pinch') {
      const pointers = Array.from(pointerRef.current.values());
      if (pointers.length < 2 || gesture.startDistance <= 0) return;

      const first = pointers[0];
      const second = pointers[1];
      const distance = getPointerDistance(first, second);
      const center = getPointerCenter(first, second);
      const centerPoint = getCanvasPoint(center.clientX, center.clientY, preview, canvas);
      const nextScale = gesture.startTransform.scale * (distance / gesture.startDistance);
      const anchoredTransform = scaleIdPhotoTransform(gesture.startTransform, nextScale, gesture.startCenter);

      setTransform({
        ...anchoredTransform,
        x: anchoredTransform.x + centerPoint.x - gesture.startCenter.x,
        y: anchoredTransform.y + centerPoint.y - gesture.startCenter.y,
      });
      return;
    }

    if (pointerRef.current.size === 1 && pointerRef.current.has(gesture.pointerId)) {
      const pointer = pointerRef.current.get(gesture.pointerId);
      if (!pointer) return;
      const point = getCanvasPoint(pointer.clientX, pointer.clientY, preview, canvas);

      setTransform({
        ...gesture.startTransform,
        x: gesture.startTransform.x + point.x - gesture.startPoint.x,
        y: gesture.startTransform.y + point.y - gesture.startPoint.y,
      });
    }
  }, [canvas]);

  const endGesture = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    pointerRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    beginGestureFromPointers();
  }, [beginGestureFromPointers]);

  const zoomValue = Math.round(clampIdPhotoScale(transform.scale) * 100);
  const previewAspect = canvas.width / canvas.height;
  const previewWidthRem = Math.min(22, 24 * previewAspect);
  const previewFrameStyle = {
    aspectRatio: `${canvas.width} / ${canvas.height}`,
    backgroundColor,
    width: `min(100%, ${previewWidthRem.toFixed(3)}rem)`,
  };
  const faceStatusLabel = subject
    ? ti(`face_status_${subject.faceStatus}`)
    : ti('face_status_waiting');
  const progressLabel = progress
    ? (progress.stage === 'model'
        ? ti('progress_model', { value: progress.percent })
        : ti('progress_compute', { value: progress.percent }))
    : ti('progress_prepare');
  const isModelProgress = status === 'processing' && (!progress || progress.stage === 'model');
  const progressModelNote = model === 'small'
    ? ti('progress_model_note_fast')
    : ti('progress_model_note_quality');

  return (
    <ToolLayout toolId={TOOL_ID} content={content}>
      <Panel
        title={ti('editor_title')}
        actions={(
          <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-xs text-content-muted">
            <span>{mmLabel}</span>
            <span>/</span>
            <span>{pixelLabel}</span>
            <span>/</span>
            <span>{faceStatusLabel}</span>
          </div>
        )}
      >
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept={accept}
          onChange={(event) => addFile(event.target.files ?? [])}
        />

        <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <div
              className={`flex min-h-[24rem] items-center justify-center rounded-lg border p-4 transition-colors ${
                draggingFile
                  ? 'border-border-strong bg-surface-hover'
                  : 'border-border-base bg-surface-raised'
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDraggingFile(true);
              }}
              onDragLeave={() => setDraggingFile(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDraggingFile(false);
                addFile(event.dataTransfer.files);
              }}
            >
              {subject ? (
                <div
                  ref={previewRef}
                  role="application"
                  aria-label={ti('editor_aria')}
                  className="relative touch-none overflow-hidden rounded border border-border-strong shadow-sm"
                  style={previewFrameStyle}
                  onPointerDown={beginGesture}
                  onPointerMove={moveGesture}
                  onPointerUp={endGesture}
                  onPointerCancel={endGesture}
                >
                  <img
                    alt=""
                    src={subject.url}
                    draggable={false}
                    className="absolute h-auto max-w-none select-none"
                    style={{
                      left: `${(transform.x / canvas.width) * 100}%`,
                      top: `${(transform.y / canvas.height) * 100}%`,
                      width: `${(subject.width / canvas.width) * 100}%`,
                      transform: `scale(${transform.scale})`,
                      transformOrigin: 'top left',
                    }}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded border border-border-strong"
                    style={{
                      top: `${currentPresetForFit.headTopRatio * 100}%`,
                      height: `${currentPresetForFit.headRatio * 100}%`,
                      width: '54%',
                    }}
                  />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-border-subtle" />
                  <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-border-subtle" />
                </div>
              ) : source?.url ? (
                <div
                  className="relative overflow-hidden rounded border border-border-base bg-surface"
                  style={previewFrameStyle}
                >
                  <img src={source.url} alt={source.file.name} className="h-full w-full object-contain" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={`flex flex-col items-center justify-center rounded border border-dashed px-5 py-6 text-center transition-colors ${
                    draggingFile
                      ? 'border-border-strong bg-surface-hover'
                      : 'border-border-base bg-surface hover:border-border-strong hover:bg-surface-hover'
                  }`}
                  style={previewFrameStyle}
                >
                  <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded border border-border-subtle bg-surface-raised font-mono text-sm font-semibold text-content-muted">
                    ID
                  </span>
                  <span className="font-semibold text-content">{ti('drop_title')}</span>
                  <span className="mt-2 text-sm leading-relaxed text-content-muted">
                    {ti('drop_hint', { formats: inputFormatLabels.join(' / ') })}
                  </span>
                  <span className="mt-3 text-xs text-content-faint">{ti('local_note')}</span>
                </button>
              )}
            </div>

            {status === 'processing' && (
              <div className="rounded border border-border-base bg-surface-raised p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-content-muted">
                  <span>{progressLabel}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-surface-hover">
                  <div
                    className={`h-full rounded bg-action transition-[width] ${isModelProgress ? 'model-progress-pulse' : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {isModelProgress && (
                  <p className="mt-2 text-xs leading-relaxed text-content-muted">
                    {progressModelNote}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="rounded border border-danger-border bg-danger-surface px-3 py-2 text-sm text-danger-content">
                {error}
              </div>
            )}

            <div className="grid gap-4 rounded border border-border-base bg-surface-raised p-3 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,0.7fr)]">
              <div>
                <h2 className="mb-2 text-sm font-semibold text-content">{ti('background_title')}</h2>
                <div className="flex flex-wrap gap-2">
                  {idPhotoBackgroundColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => chooseBackgroundColor(color.value)}
                      className={`flex min-h-10 items-center gap-2 rounded border px-3 text-sm text-content-secondary transition-colors ${
                        backgroundColor.toLowerCase() === color.value.toLowerCase()
                          ? 'border-border-strong bg-surface-hover'
                          : 'border-border-base bg-surface hover:border-border-strong hover:bg-surface-hover'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="h-5 w-5 rounded border border-border-subtle"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{ti(color.labelKey)}</span>
                    </button>
                  ))}
                  <label className="flex min-h-10 items-center gap-2 rounded border border-border-base bg-surface px-3 text-sm text-content-secondary">
                    <input
                      type="color"
                      value={customBackgroundColor}
                      onChange={(event) => {
                        setCustomBackgroundColor(event.target.value);
                        setBackgroundColor(event.target.value);
                      }}
                      className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                    />
                    {ti('background_custom')}
                  </label>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-content-secondary">
                  {ti('zoom')}
                  <input
                    type="range"
                    min={Math.round(ID_PHOTO_SCALE_MIN * 100)}
                    max={Math.round(ID_PHOTO_SCALE_MAX * 100)}
                    value={Math.min(Math.round(ID_PHOTO_SCALE_MAX * 100), Math.max(Math.round(ID_PHOTO_SCALE_MIN * 100), zoomValue))}
                    disabled={!hasSubject}
                    onChange={(event) => {
                      const nextScale = Number(event.target.value) / 100;
                      setTransform((current) => scaleIdPhotoTransform(current, nextScale, {
                        x: canvas.width / 2,
                        y: canvas.height / 2,
                      }));
                    }}
                    className="w-full accent-[var(--action)] disabled:opacity-50"
                  />
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-16 text-sm font-semibold text-content">{zoomValue}%</span>
                  <Button type="button" variant="secondary" disabled={!hasSubject} onClick={() => fitSubjectToTemplate()}>
                    {ti('center_reset')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="flex min-w-0 flex-col gap-5 border-t border-border-subtle pt-4 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-content">{ti('composition_title')}</h2>
                <p className="mt-1 text-xs text-content-muted">{mmLabel}</p>
              </div>
              <span className="rounded border border-border-subtle bg-surface-raised px-2 py-1 font-mono text-xs text-content-faint">
                {outputFormat.toUpperCase()}
              </span>
            </div>

            {source?.info && (
              <div className="grid grid-cols-2 gap-2 text-xs text-content-muted">
                <div className="rounded border border-border-subtle bg-surface-raised p-3">
                  <div className="text-content-faint">{ti('source_size')}</div>
                  <div className="mt-1 font-medium text-content">{formatIdPhotoPixels(source.info.width, source.info.height)}</div>
                </div>
                <div className="rounded border border-border-subtle bg-surface-raised p-3">
                  <div className="text-content-faint">{ti('file_size')}</div>
                  <div className="mt-1 font-medium text-content">{formatFileSize(source.info.size)}</div>
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Button type="button" size="md" variant="secondary" onClick={() => inputRef.current?.click()}>
                {source ? ti('replace') : ti('drop_title')}
              </Button>
            </div>

            <div className="grid gap-3">
              <label className="flex flex-col gap-1 text-sm font-medium text-content-secondary">
                {ti('preset_title')}
                <select
                  value={selectedPresetId}
                  onChange={(event) => updatePreset(event.target.value as IdPhotoPresetId)}
                  className="min-h-10 rounded border border-border-input bg-surface px-3 text-content outline-none transition-colors focus:border-border-strong"
                >
                  {idPhotoPresets.map((preset) => {
                    const presetCanvas = getIdPhotoCanvasSize({ widthMm: preset.widthMm, heightMm: preset.heightMm, dpi: ID_PHOTO_DPI });
                    return (
                      <option key={preset.id} value={preset.id}>
                        {ti(preset.labelKey)} - {formatIdPhotoMm(preset.widthMm, preset.heightMm)} - {formatIdPhotoPixels(presetCanvas.width, presetCanvas.height)}
                      </option>
                    );
                  })}
                  <option value={CUSTOM_PRESET_ID}>
                    {ti('preset_custom')} - {mmLabel} - {pixelLabel}
                  </option>
                </select>
              </label>

              {selectedPresetId === CUSTOM_PRESET_ID && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-sm font-medium text-content-secondary">
                    {ti('custom_width')}
                    <input
                      value={customWidthMm}
                      onChange={(event) => setCustomWidthMm(event.target.value)}
                      onBlur={() => setCustomWidthMm(String(normalizeCustomMillimeters(customWidthMm, 35)))}
                      inputMode="decimal"
                      className="min-h-10 rounded border border-border-input bg-surface px-3 text-content outline-none transition-colors focus:border-border-strong"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium text-content-secondary">
                    {ti('custom_height')}
                    <input
                      value={customHeightMm}
                      onChange={(event) => setCustomHeightMm(event.target.value)}
                      onBlur={() => setCustomHeightMm(String(normalizeCustomMillimeters(customHeightMm, 45)))}
                      inputMode="decimal"
                      className="min-h-10 rounded border border-border-input bg-surface px-3 text-content outline-none transition-colors focus:border-border-strong"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm font-medium text-content-secondary">
                  {ti('model_choice')}
                  <select
                    value={model}
                    disabled={status === 'processing'}
                    onChange={(event) => setModel(event.target.value as ImageBackgroundRemovalModel)}
                    className="min-h-10 rounded border border-border-input bg-surface px-3 text-content outline-none transition-colors focus:border-border-strong disabled:text-content-faint"
                  >
                    <option value="medium">{ti('model_quality')}</option>
                    <option value="small">{ti('model_fast')}</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-content-secondary">
                  {ti('output_format')}
                  <select
                    value={outputFormat}
                    onChange={(event) => setOutputFormat(event.target.value as OutputFormat)}
                    className="min-h-10 rounded border border-border-input bg-surface px-3 text-content outline-none transition-colors focus:border-border-strong"
                  >
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                  </select>
                </label>
              </div>

            </div>

            <div className="grid gap-3 border-t border-border-subtle pt-4">
              <div className="grid gap-2 text-sm text-content-muted">
                <div className="flex justify-between gap-3">
                  <span>{ti('canvas_size')}</span>
                  <span className="text-content">{mmLabel}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>{ti('pixel_size')}</span>
                  <span className="text-content">{pixelLabel}</span>
                </div>
              </div>
              <Button type="button" size="md" disabled={!canExport} onClick={exportPhoto}>
                {isExporting ? ti('exporting') : ti('download')}
              </Button>
            </div>
          </aside>
        </div>
      </Panel>
    </ToolLayout>
  );
}
