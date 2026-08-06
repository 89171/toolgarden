'use client';

import { useLocale, useTranslations } from 'next-intl';
import { type WheelEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { tldrawAssetUrls } from '@/lib/utils/tldrawAssets';
import { whiteboardContent } from '@/lib/tools/content/whiteboard';
import { FULLSCREEN_ARIA_KEY_SHORTCUTS, useFullscreenShortcut } from '@/lib/hooks/useFullscreenShortcut';

const TLDRAW_LICENSE_KEY = 'tldraw-jimmy-zhu-2027-07-17/WyJsLUQ4RXlMciIsWyIqLnRvb2xnYXJkZW4ueHl6Il0sOSwiMjAyNy0wNy0xNyJd.ZurBhW4L3cSjEc1rW398Hlge8lHL2VvvnSlqsi3o+OGkieOP0Fhho30OqXaVXiE6m/nDEUe5PNvdIB1VJ5YDYw';
const TLDRAW_PERSISTENCE_KEY = 'toolgarden-whiteboard-tldraw';

type TldrawComponent = typeof import('tldraw').Tldraw;
type DefaultToolbarComponent = typeof import('tldraw').DefaultToolbar;
type TldrawComponents = NonNullable<Parameters<TldrawComponent>[0]['components']>;
type TldrawCameraOptions = NonNullable<Parameters<TldrawComponent>[0]['cameraOptions']>;

export function WhiteboardTool() {
  const t = useTranslations('whiteboard_tool');
  const locale = useLocale();
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const [Tldraw, setTldraw] = useState<TldrawComponent | null>(null);
  const [DefaultToolbar, setDefaultToolbar] = useState<DefaultToolbarComponent | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenFallback, setIsFullscreenFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadError(false);

    void import('tldraw')
      .then((module) => {
        if (isMounted) {
          setTldraw(() => module.Tldraw);
          setDefaultToolbar(() => module.DefaultToolbar);
          window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
        }
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
  const fullscreenLabel = isFullscreenActive ? t('exit_fullscreen') : t('fullscreen');
  useFullscreenShortcut(toggleFullscreen);
  const cameraOptions = useMemo<TldrawCameraOptions>(() => ({
    wheelBehavior: isFullscreenActive ? 'pan' : 'none',
  }), [isFullscreenActive]);
  const tldrawComponents = useMemo<TldrawComponents | undefined>(() => {
    if (!DefaultToolbar) return undefined;
    const Toolbar: DefaultToolbarComponent = DefaultToolbar;

    function LeftToolbar() {
      return (
        <Toolbar
          orientation="vertical"
          minItems={8}
          minSizePx={360}
          maxItems={14}
          maxSizePx={620}
        />
      );
    }

    return { Toolbar: LeftToolbar };
  }, [DefaultToolbar]);
  const scrollPageFromCanvas = (event: WheelEvent<HTMLDivElement>) => {
    if (isFullscreenActive || event.ctrlKey || event.metaKey) return;
    if (event.deltaX === 0 && event.deltaY === 0) return;

    event.preventDefault();
    event.stopPropagation();
    window.scrollBy({
      left: event.deltaX,
      top: event.deltaY,
      behavior: 'auto',
    });
  };

  return (
    <ToolLayout toolId="whiteboard" content={whiteboardContent}>
      <div
        ref={fullscreenRef}
        className={`flex min-h-0 flex-1 flex-col bg-background ${isFullscreenActive ? 'fixed inset-0 z-50 h-[100dvh] overflow-hidden p-3' : ''}`}
      >
        <Panel
          title={t('canvas_title')}
          className="min-h-0 flex-1"
          actions={(
            <Button
              type="button"
              variant="secondary"
              onClick={toggleFullscreen}
              aria-keyshortcuts={FULLSCREEN_ARIA_KEY_SHORTCUTS}
              title={`${fullscreenLabel} (${t('fullscreen_shortcut')})`}
            >
              {fullscreenLabel}
            </Button>
          )}
        >
          <div
            className={`whiteboard-canvas-frame overflow-hidden rounded-lg border border-border-base ${
              isFullscreenActive ? 'min-h-0 flex-1' : 'h-[880px] min-h-[760px]'
            }`}
          >
            <div className="tldraw-left-toolbar relative h-full w-full" onWheelCapture={scrollPageFromCanvas}>
              {loadError ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                  <p className="max-w-md text-sm leading-6 text-content-muted">{t('load_error')}</p>
                  <Button type="button" variant="secondary" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                    {t('retry')}
                  </Button>
                </div>
              ) : Tldraw ? (
                <Tldraw
                  autoFocus
                  colorScheme="light"
                  initialState="select"
                  assetUrls={tldrawAssetUrls}
                  cameraOptions={cameraOptions}
                  components={tldrawComponents}
                  licenseKey={TLDRAW_LICENSE_KEY}
                  locale={locale === 'zh' ? 'zh-cn' : 'en'}
                  persistenceKey={TLDRAW_PERSISTENCE_KEY}
                />
              ) : (
                <div className="h-full" />
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-content-faint">{t('local_note')}</p>
        </Panel>
      </div>
    </ToolLayout>
  );
}
