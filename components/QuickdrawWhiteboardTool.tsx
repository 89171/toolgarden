'use client';

import { type ComponentType, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { quickdrawWhiteboardContent } from '@/lib/tools/content/quickdraw-whiteboard';
import { FULLSCREEN_ARIA_KEY_SHORTCUTS, useFullscreenShortcut } from '@/lib/hooks/useFullscreenShortcut';

const QUICKDRAW_PERSISTENCE_KEY = 'toolgarden-quickdraw-whiteboard';

type QuickdrawComponent = typeof import('@quickdrawjs/react').Quickdraw;
type QuickdrawSnapshot = import('@quickdrawjs/react').Snapshot;

function readSavedSnapshot(): QuickdrawSnapshot | undefined {
  try {
    const saved = window.localStorage.getItem(QUICKDRAW_PERSISTENCE_KEY);
    return saved ? JSON.parse(saved) as QuickdrawSnapshot : undefined;
  } catch {
    return undefined;
  }
}

export function QuickdrawWhiteboardTool() {
  const t = useTranslations('quickdraw_whiteboard_tool');
  const fullscreenRef = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const [Quickdraw, setQuickdraw] = useState<QuickdrawComponent | null>(null);
  const [snapshot, setSnapshot] = useState<QuickdrawSnapshot | undefined>();
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenFallback, setIsFullscreenFallback] = useState(false);

  useEffect(() => {
    setSnapshot(readSavedSnapshot());
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoadError(false);

    void import('@quickdrawjs/react')
      .then((module) => {
        if (isMounted) {
          setQuickdraw(() => module.Quickdraw);
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

  useFullscreenShortcut(toggleFullscreen);

  const isFullscreenActive = isFullscreen || isFullscreenFallback;
  const fullscreenLabel = isFullscreenActive ? t('exit_fullscreen') : t('fullscreen');
  const Board = Quickdraw as ComponentType<Parameters<QuickdrawComponent>[0]> | null;

  return (
    <ToolLayout toolId="quickdraw-whiteboard" content={quickdrawWhiteboardContent}>
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
            className={`overflow-hidden rounded-lg border border-border-base bg-surface-raised ${
              isFullscreenActive ? 'min-h-0 flex-1' : 'h-[880px] min-h-[760px]'
            }`}
            aria-label={t('canvas_label')}
          >
            {loadError ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="max-w-md text-sm leading-6 text-content-muted">{t('load_error')}</p>
                <Button type="button" variant="secondary" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                  {t('retry')}
                </Button>
              </div>
            ) : Board ? (
              <Board
                autoFit
                grid="lines"
                snapshot={snapshot}
                theme="light"
                themeToggle
                watermark={false}
                className="h-full w-full"
                onChange={(_diff, _source, editor) => {
                  if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
                  saveTimerRef.current = window.setTimeout(() => {
                    window.localStorage.setItem(
                      QUICKDRAW_PERSISTENCE_KEY,
                      JSON.stringify(editor.store.getSnapshot())
                    );
                  }, 250);
                }}
              />
            ) : (
              <div className="h-full" />
            )}
          </div>
          <p className="mt-3 text-sm text-content-faint">{t('local_note')}</p>
        </Panel>
      </div>
    </ToolLayout>
  );
}
