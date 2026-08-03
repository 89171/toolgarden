'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { excalidrawBoardContent } from '@/lib/tools/content/excalidraw-board';

const EXCALIDRAW_ASSET_PATH = '/excalidraw/';

type ExcalidrawComponent = typeof import('@excalidraw/excalidraw').Excalidraw;

const configureExcalidrawAssetPath = () => {
  if (typeof window === 'undefined') return;

  (window as Window & { EXCALIDRAW_ASSET_PATH?: string }).EXCALIDRAW_ASSET_PATH = EXCALIDRAW_ASSET_PATH;
};

configureExcalidrawAssetPath();

export function ExcalidrawBoardTool() {
  const t = useTranslations('excalidraw_board_tool');
  const locale = useLocale();
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const [Excalidraw, setExcalidraw] = useState<ExcalidrawComponent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenFallback, setIsFullscreenFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    configureExcalidrawAssetPath();
    setLoadError(false);

    void import('@excalidraw/excalidraw')
      .then((module) => {
        if (isMounted) setExcalidraw(() => module.Excalidraw);
      })
      .catch(() => {
        if (isMounted) setLoadError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  useEffect(() => {
    const syncFullscreenState = () => {
      const isActive = document.fullscreenElement === fullscreenRef.current;
      setIsFullscreen(isActive);
      if (isActive) setIsFullscreenFallback(false);
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    if (!isFullscreenFallback) return;

    const previousOverflow = document.body.style.overflow;
    const exitFallbackOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      event.preventDefault();
      setIsFullscreenFallback(false);
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', exitFallbackOnEscape);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', exitFallbackOnEscape);
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    };
  }, [isFullscreenFallback]);

  const toggleFullscreen = () => {
    const fullscreenElement = fullscreenRef.current;
    if (!fullscreenElement) return;

    void (async () => {
      try {
        if (document.fullscreenElement === fullscreenElement) {
          await document.exitFullscreen();
          return;
        }
        if (isFullscreenFallback) {
          setIsFullscreenFallback(false);
          window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
          return;
        }
        await fullscreenElement.requestFullscreen();
      } catch {
        setIsFullscreenFallback(true);
      }
    })();
  };

  const isFullscreenActive = isFullscreen || isFullscreenFallback;

  return (
    <ToolLayout toolId="excalidraw-board" content={excalidrawBoardContent}>
      <div
        ref={fullscreenRef}
        className={`flex min-h-0 flex-1 flex-col bg-background ${isFullscreenActive ? 'fixed inset-0 z-50 h-screen overflow-hidden p-3' : ''}`}
      >
        <Panel
          title={t('canvas_title')}
          className="min-h-0 flex-1"
          actions={(
            <Button type="button" variant="secondary" onClick={toggleFullscreen}>
              {isFullscreenActive ? t('exit_fullscreen') : t('fullscreen')}
            </Button>
          )}
        >
          <div
            className={`overflow-hidden rounded-lg border border-border-base bg-surface-raised ${
              isFullscreenActive ? 'min-h-0 flex-1' : 'h-[720px] min-h-[620px]'
            }`}
          >
            {loadError ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="max-w-md text-sm leading-6 text-content-muted">{t('load_error')}</p>
                <Button type="button" variant="secondary" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                  {t('retry')}
                </Button>
              </div>
            ) : Excalidraw ? (
              <Excalidraw
                langCode={locale === 'zh' ? 'zh-CN' : 'en'}
                name="toolgarden-excalidraw-board"
                theme="light"
                initialData={{
                  appState: {
                    viewBackgroundColor: '#ffffff',
                    currentItemStrokeColor: '#111827',
                    currentItemBackgroundColor: 'transparent',
                  },
                }}
                UIOptions={{
                  canvasActions: {
                    changeViewBackgroundColor: true,
                    clearCanvas: true,
                    export: { saveFileToDisk: true },
                    loadScene: true,
                    saveAsImage: true,
                    saveToActiveFile: true,
                    toggleTheme: true,
                  },
                  tools: {
                    image: true,
                  },
                }}
              />
            ) : (
              <div className="h-full bg-surface-raised" />
            )}
          </div>
          <p className="mt-3 text-sm text-content-faint">{t('local_note')}</p>
        </Panel>
      </div>
    </ToolLayout>
  );
}
