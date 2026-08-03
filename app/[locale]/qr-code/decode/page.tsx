'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { QrToolSwitcher } from '@/components/QrToolSwitcher';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import {
  formatQrFileSize,
  formatQrPixelLimit,
  QR_DECODE_LIMITS,
  type DecodedQrCode,
  type QrFailureCode,
} from '@/lib/utils/qr';
import { decodeQrCodeFile, decodeQrCodeImageData } from '@/lib/utils/qr-browser';
import { qrCodeDecoderContent } from '@/lib/tools/content/qr-code-decoder';

const CAMERA_SCAN_INTERVAL_MS = 240;
const CAMERA_FRAME_MAX_WIDTH = 960;

export default function QrCodeDecodePage() {
  const t = useTranslations('tools.qr-code-decoder');
  const tc = useTranslations('common');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraFrameRef = useRef<number | null>(null);
  const lastCameraScanAtRef = useRef(0);
  const lastDecodedCameraTextRef = useRef('');

  const [decoded, setDecoded] = useState<DecodedQrCode | null>(null);
  const [decodeError, setDecodeError] = useState('');
  const [decoding, setDecoding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draggingImage, setDraggingImage] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('');

  const errorMessage = useCallback((code: QrFailureCode, detail?: string) =>
    t(`errors.${code}`, {
      maxPixels: formatQrPixelLimit(QR_DECODE_LIMITS.maxPixels),
      maxSize: formatQrFileSize(QR_DECODE_LIMITS.maxFileBytes),
      type: detail || t('unknown_file_type'),
    }), [t]);

  const stopCamera = useCallback(() => {
    if (cameraFrameRef.current !== null) {
      window.cancelAnimationFrame(cameraFrameRef.current);
      cameraFrameRef.current = null;
    }

    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraStarting(false);
    setCameraMessage('');
  }, []);

  const scanCameraFrame = useCallback(() => {
    if (!cameraStreamRef.current) return;

    const video = videoRef.current;
    const canvas = cameraCanvasRef.current;
    const now = performance.now();

    if (
      video
      && canvas
      && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      && video.videoWidth > 0
      && video.videoHeight > 0
      && now - lastCameraScanAtRef.current >= CAMERA_SCAN_INTERVAL_MS
    ) {
      lastCameraScanAtRef.current = now;

      const scale = Math.min(1, CAMERA_FRAME_MAX_WIDTH / video.videoWidth);
      const width = Math.max(1, Math.round(video.videoWidth * scale));
      const height = Math.max(1, Math.round(video.videoHeight * scale));
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        setDecodeError(t('errors.canvas_context'));
        return;
      }

      try {
        context.drawImage(video, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        const result = decodeQrCodeImageData(imageData, width, height, {
          filename: 'camera-frame',
          sourceLabel: t('camera_source'),
        });

        if (result.ok && result.decoded.text !== lastDecodedCameraTextRef.current) {
          lastDecodedCameraTextRef.current = result.decoded.text;
          setDecoded(result.decoded);
          setDecodeError('');
          setCopied(false);
          setCameraMessage(t('camera_detected'));
        }
      } catch {
        setDecodeError(t('errors.canvas_context'));
      }
    }

    if (cameraStreamRef.current) {
      cameraFrameRef.current = window.requestAnimationFrame(scanCameraFrame);
    }
  }, [t]);

  const getCameraErrorMessage = (error: unknown) => {
    if (error instanceof DOMException && ['NotAllowedError', 'SecurityError'].includes(error.name)) {
      return t('errors.camera_denied');
    }

    return t('errors.camera_failed');
  };

  const startCamera = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setDecodeError(t('errors.camera_unsupported'));
      return;
    }

    setCameraStarting(true);
    setDecoded(null);
    setDecodeError('');
    setCopied(false);
    setCameraMessage(t('camera_starting'));
    lastDecodedCameraTextRef.current = '';
    lastCameraScanAtRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
        },
      });
      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        setDecodeError(t('errors.camera_failed'));
        setCameraMessage('');
        return;
      }

      cameraStreamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      setCameraActive(true);
      setCameraMessage(t('camera_scanning'));

      if (cameraFrameRef.current !== null) {
        window.cancelAnimationFrame(cameraFrameRef.current);
      }
      cameraFrameRef.current = window.requestAnimationFrame(scanCameraFrame);
    } catch (error) {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      setDecodeError(getCameraErrorMessage(error));
      setCameraMessage('');
      setCameraActive(false);
    } finally {
      setCameraStarting(false);
    }
  };

  useEffect(() => stopCamera, [stopCamera]);

  const decodeFile = async (file: File | undefined) => {
    if (!file) return;

    stopCamera();
    setDraggingImage(false);
    setDecoding(true);
    setDecoded(null);
    setDecodeError('');
    const result = await decodeQrCodeFile(file);
    setDecoding(false);

    if (!result.ok) {
      setDecodeError(errorMessage(result.code, result.detail));
      return;
    }

    setDecoded(result.decoded);
  };

  const copyDecodedText = async () => {
    if (!decoded?.text) return;

    await navigator.clipboard.writeText(decoded.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const clearResult = () => {
    lastDecodedCameraTextRef.current = '';
    setDecoded(null);
    setDecodeError('');
    setCopied(false);
  };

  const hasDraggedFile = (event: React.DragEvent<HTMLElement>) => (
    Array.from(event.dataTransfer.types).includes('Files')
  );

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <ToolLayout toolId="qr-code-decoder" content={qrCodeDecoderContent}>
      <QrToolSwitcher current="decode" />
      <div className="flex-grow min-h-0 overflow-auto pr-1">
        <div className="grid min-h-full grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1fr)]">
          <Panel
            title={t('decode_title')}
            actions={
              <>
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  {t('choose_image')}
                </Button>
                <Button variant="secondary" onClick={startCamera} disabled={cameraActive || cameraStarting}>
                  {t('start_camera')}
                </Button>
                <Button variant="secondary" onClick={() => stopCamera()} disabled={!cameraActive && !cameraStarting}>
                  {t('stop_camera')}
                </Button>
                <Button variant="secondary" onClick={clearResult} disabled={!decoded && !decodeError}>
                  {tc('clear')}
                </Button>
              </>
            }
            className="min-h-[24rem] lg:min-h-0"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
              className="sr-only"
              onChange={(event) => {
                void decodeFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
            <div className="mb-4 rounded border border-border-base bg-surface-raised p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-content-secondary">{t('camera_title')}</p>
                <span className="rounded bg-surface-hover px-2 py-1 text-xs text-content-muted">
                  {cameraStarting ? t('camera_starting') : cameraActive ? t('camera_live') : t('camera_off')}
                </span>
              </div>
              <div className="relative mt-3 aspect-video overflow-hidden rounded border border-border-subtle bg-surface">
                <video
                  ref={videoRef}
                  className={cameraActive ? 'h-full w-full object-cover' : 'hidden'}
                  muted
                  playsInline
                  autoPlay
                />
                {!cameraActive && (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm text-content-faint">
                    {cameraStarting ? t('camera_starting') : t('camera_hint')}
                  </div>
                )}
              </div>
              {cameraMessage && <p className="mt-2 text-xs text-content-muted">{cameraMessage}</p>}
              <canvas ref={cameraCanvasRef} className="hidden" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={openFilePicker}
              onDragEnter={(event) => {
                if (!hasDraggedFile(event)) return;
                event.preventDefault();
                setDraggingImage(true);
              }}
              onDragOver={(event) => {
                if (!hasDraggedFile(event)) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                setDraggingImage(true);
              }}
              onDragLeave={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setDraggingImage(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDraggingImage(false);
                void decodeFile(event.dataTransfer.files?.[0]);
              }}
              className={`flex flex-grow min-h-72 cursor-pointer flex-col items-center justify-center rounded border border-dashed p-6 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-strong ${
                draggingImage
                  ? 'border-border-strong bg-surface-hover ring-2 ring-action/30'
                  : 'border-border-base bg-surface-raised hover:border-border-strong hover:bg-surface-hover'
              }`}
            >
              <p className="text-sm font-medium text-content-secondary">{t('drop_title')}</p>
              <p className="mt-2 text-xs text-content-faint">{t('drop_hint')}</p>
            </button>
          </Panel>

          <Panel
            title={t('result_title')}
            actions={
              <Button onClick={copyDecodedText} disabled={!decoded?.text}>
                {copied ? tc('copied') : tc('copy')}
              </Button>
            }
            className="min-h-[24rem] lg:min-h-0"
          >
            <div className="flex-grow overflow-auto rounded border border-border-base bg-surface-raised p-3">
              {decoding ? (
                <p className="text-sm text-content-muted">{t('decoding')}</p>
              ) : decodeError ? (
                <p className="text-sm text-syntax-null">{decodeError}</p>
              ) : decoded ? (
                <div className="flex h-full flex-col gap-3">
                  <div className="flex flex-wrap gap-2 text-xs text-content-muted">
                    <span className="rounded bg-surface-hover px-2 py-1">{decoded.width} x {decoded.height}</span>
                    <span className="rounded bg-surface-hover px-2 py-1">v{decoded.version}</span>
                    <span className="rounded bg-surface-hover px-2 py-1">
                      {decoded.sourceLabel || formatQrFileSize(decoded.fileSize)}
                    </span>
                  </div>
                  <pre className="min-h-0 flex-grow whitespace-pre-wrap break-words font-mono text-sm text-content-secondary">
                    {decoded.text}
                  </pre>
                </div>
              ) : (
                <p className="flex h-full items-center justify-center text-sm text-content-faint">
                  {t('empty_decode')}
                </p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </ToolLayout>
  );
}
