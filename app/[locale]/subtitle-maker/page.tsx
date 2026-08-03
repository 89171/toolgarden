'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import {
  exportSubtitle,
  formatSubtitleTime,
  parseSubtitle,
  parseSubtitleTime,
  type SubtitleCue,
  type SubtitleFormat,
} from '@/lib/utils/subtitle';
import { subtitleMakerContent } from '@/lib/tools/content/subtitle-maker';

type MediaKind = 'audio' | 'video';

const sampleSrt = `1
00:00:01,000 --> 00:00:04,000
Welcome to Subtitle Maker.

2
00:00:04,500 --> 00:00:08,000
Edit SRT, VTT, and LRC subtitles in the browser.`;

const sampleLrc = `[00:01.00]<00:04.00>Welcome to Subtitle Maker.
[00:04.50]<00:08.00>Edit SRT, VTT, and LRC subtitles in the browser.`;

const sampleVtt = `WEBVTT

00:00:01.000 --> 00:00:04.000
Welcome to Subtitle Maker.

00:00:04.500 --> 00:00:08.000
Edit SRT, VTT, and LRC subtitles in the browser.`;

function clampTime(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SubtitleMakerPage() {
  const t = useTranslations('tools.subtitle-maker');
  const tc = useTranslations('common');
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [format, setFormat] = useState<SubtitleFormat>('srt');
  const [sourceText, setSourceText] = useState(sampleSrt);
  const [cues, setCues] = useState<SubtitleCue[]>(() => {
    const result = parseSubtitle(sampleSrt, 'sample.srt');
    return result.ok ? result.cues : [];
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [status, setStatus] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaKind, setMediaKind] = useState<MediaKind | null>(null);
  const [mediaName, setMediaName] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
  }, [mediaUrl]);

  const activeIndex = useMemo(() => {
    const found = cues.findIndex((cue) => currentTime >= cue.start && currentTime < cue.end);
    return found >= 0 ? found : selectedIndex;
  }, [cues, currentTime, selectedIndex]);

  const activeCue = cues[activeIndex];
  const previousCue = activeIndex > 0 ? cues[activeIndex - 1] : null;
  const nextCue = activeIndex >= 0 && activeIndex < cues.length - 1 ? cues[activeIndex + 1] : null;
  const exportPreview = useMemo(() => exportSubtitle(cues, format), [cues, format]);

  const parseInput = (text = sourceText, filename = '') => {
    const result = parseSubtitle(text, filename);
    if (!result.ok) {
      setStatus(t('parse_failed'));
      return;
    }

    setFormat(result.format);
    setCues(result.cues);
    setSelectedIndex(0);
    setStatus(t('loaded_count', { count: result.cues.length, format: result.format.toUpperCase() }));
  };

  const loadSubtitleFile = async (file: File) => {
    const text = await file.text();
    setSourceText(text);
    parseInput(text, file.name);
  };

  const loadMediaFile = (file: File) => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    const url = URL.createObjectURL(file);
    setMediaUrl(url);
    setMediaKind(file.type.startsWith('video/') ? 'video' : 'audio');
    setMediaName(file.name);
    setCurrentTime(0);
    setDuration(0);
    setStatus(t('media_loaded'));
  };

  const seekToCue = (index: number) => {
    const cue = cues[index];
    if (!cue) return;
    setSelectedIndex(index);
    setCurrentTime(cue.start);
    if (mediaRef.current) {
      mediaRef.current.currentTime = cue.start;
    }
  };

  const updateCue = (index: number, patch: Partial<SubtitleCue>) => {
    setCues((current) => current.map((cue, cueIndex) => {
      if (cueIndex !== index) return cue;
      const next = { ...cue, ...patch };
      if (next.end <= next.start) next.end = next.start + 1;
      return next;
    }));
  };

  const updateCueTime = (index: number, field: 'start' | 'end', value: string) => {
    const parsed = parseSubtitleTime(value, format);
    if (parsed === null) {
      setStatus(t('invalid_time'));
      return;
    }
    updateCue(index, { [field]: parsed });
    setStatus('');
  };

  const addCue = (position: 'above' | 'below') => {
    const anchor = cues[selectedIndex];
    const fallbackStart = cues.length ? cues[cues.length - 1].end : currentTime;
    const start = anchor ? (position === 'above' ? anchor.start : anchor.end) : fallbackStart;
    const nextCue: SubtitleCue = { start: clampTime(start), end: clampTime(start) + 3, text: t('new_line') };
    const insertIndex = anchor ? selectedIndex + (position === 'below' ? 1 : 0) : cues.length;

    setCues((current) => [
      ...current.slice(0, insertIndex),
      nextCue,
      ...current.slice(insertIndex),
    ]);
    setSelectedIndex(insertIndex);
  };

  const deleteCue = (index: number) => {
    setCues((current) => current.filter((_, cueIndex) => cueIndex !== index));
    setSelectedIndex((current) => Math.max(0, Math.min(current, cues.length - 2)));
  };

  const setCurrentStamp = (field: 'start' | 'end') => {
    if (!cues[selectedIndex]) return;
    updateCue(selectedIndex, { [field]: currentTime });
  };

  const exportCurrent = () => {
    const result = exportSubtitle(cues, format);
    if (!result.ok) {
      setStatus(t('export_failed'));
      return;
    }
    downloadText(`subtitle-maker.${format}`, result.output);
    setStatus(t('exported', { format: format.toUpperCase() }));
  };

  const switchFormat = (nextFormat: SubtitleFormat) => {
    const result = exportSubtitle(cues, nextFormat);
    setFormat(nextFormat);
    if (result.ok) setSourceText(result.output);
  };

  return (
    <ToolLayout toolId="subtitle-maker" content={subtitleMakerContent}>
      <div className="flex min-h-0 flex-grow flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center rounded border border-border-base bg-surface-hover px-3 py-2 text-sm text-content-secondary transition-colors hover:border-border-strong hover:text-content">
            {t('load_media')}
            <input
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) loadMediaFile(file);
              }}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center rounded border border-border-base bg-surface-hover px-3 py-2 text-sm text-content-secondary transition-colors hover:border-border-strong hover:text-content">
            {t('load_subtitle')}
            <input
              type="file"
              accept=".lrc,.srt,.vtt,text/plain,text/vtt"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) loadSubtitleFile(file);
              }}
            />
          </label>
          <Button variant={format === 'srt' ? 'primary' : 'secondary'} onClick={() => switchFormat('srt')}>
            SRT
          </Button>
          <Button variant={format === 'lrc' ? 'primary' : 'secondary'} onClick={() => switchFormat('lrc')}>
            LRC
          </Button>
          <Button variant={format === 'vtt' ? 'primary' : 'secondary'} onClick={() => switchFormat('vtt')}>
            VTT
          </Button>
          <Button variant="secondary" onClick={() => {
            const sample = format === 'srt' ? sampleSrt : format === 'vtt' ? sampleVtt : sampleLrc;
            setSourceText(sample);
            parseInput(sample, `sample.${format}`);
          }}>
            {tc('example')}
          </Button>
          <Button onClick={exportCurrent} disabled={!cues.length}>{t('export')}</Button>
          {status && <span className="text-sm text-content-muted">{status}</span>}
        </div>

        <aside className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-content">{t('ai_project_title')}</p>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-content-muted">
              {t('ai_project_description')}
            </p>
          </div>
          <a
            href="https://github.com/89171/subtitle-maker/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 shrink-0 items-center justify-center self-start whitespace-nowrap rounded border border-border-strong bg-surface px-3 py-1.5 text-sm font-medium text-content transition-colors hover:bg-surface-hover active:translate-y-px sm:self-center"
          >
            {t('ai_project_action')}
          </a>
        </aside>

        <div className="grid min-h-0 flex-grow grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(440px,520px)]">
          <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-lg border border-border-base bg-surface">
            <div className="flex min-h-0 flex-grow flex-col bg-surface-raised">
              <div className="relative flex min-h-80 flex-grow items-center justify-center overflow-hidden border-b border-border-base bg-surface-hover p-4">
                {mediaUrl && mediaKind === 'video' && (
                  <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={mediaUrl}
                    controls
                    className="max-h-full max-w-full"
                    onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
                    onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                  />
                )}
                {mediaUrl && mediaKind === 'audio' && (
                  <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-4">
                    <div className="flex h-20 items-end gap-1" aria-hidden="true">
                      {Array.from({ length: 12 }).map((_, index) => (
                        <span
                          key={index}
                          className="w-1 rounded bg-content"
                          style={{ height: `${18 + ((index * 13) % 42)}px` }}
                        />
                      ))}
                    </div>
                    <audio
                      ref={mediaRef as React.RefObject<HTMLAudioElement>}
                      src={mediaUrl}
                      controls
                      className="w-full"
                      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
                      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                    />
                  </div>
                )}
                {!mediaUrl && (
                  <div className="max-w-md text-center">
                    <p className="text-lg font-semibold text-content">{t('empty_media_title')}</p>
                    <p className="mt-2 text-sm leading-relaxed text-content-muted">{t('empty_media_body')}</p>
                  </div>
                )}
                {activeCue && (
                  <div className="pointer-events-none absolute inset-x-4 bottom-8 mx-auto max-w-3xl rounded bg-content px-4 py-3 text-center text-lg font-semibold leading-relaxed text-background shadow-lg">
                    {activeCue.text}
                  </div>
                )}
              </div>

              <div className="grid gap-3 border-b border-border-base p-4 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-normal text-content-faint">{t('current_time')}</p>
                  <p className="mt-1 font-mono text-sm text-content-secondary">{formatSubtitleTime(currentTime, format)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-normal text-content-faint">{t('duration')}</p>
                  <p className="mt-1 font-mono text-sm text-content-secondary">{duration ? formatSubtitleTime(duration, format) : '--:--'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-normal text-content-faint">{t('media_file')}</p>
                  <p className="mt-1 truncate text-sm text-content-secondary">{mediaName || t('none')}</p>
                </div>
              </div>

              <div className="grid gap-3 p-4 md:grid-cols-3">
                <p className="truncate text-sm text-content-faint">{previousCue?.text ?? ''}</p>
                <p className="text-center text-sm font-semibold text-content-secondary">{activeCue?.text ?? t('no_active_line')}</p>
                <p className="truncate text-right text-sm text-content-faint">{nextCue?.text ?? ''}</p>
              </div>
            </div>
          </section>

          <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-lg border border-border-base bg-surface">
            <div className="flex flex-wrap items-center gap-2 border-b border-border-base p-3">
              <span className="mr-auto text-sm font-semibold text-content-secondary">{t('editor')}</span>
              <Button variant="secondary" onClick={() => addCue('above')} disabled={!cues.length}>{t('add_above')}</Button>
              <Button variant="secondary" onClick={() => addCue('below')}>{t('add_below')}</Button>
              <Button variant="secondary" onClick={() => setCurrentStamp('start')} disabled={!cues.length}>{t('set_start')}</Button>
              <Button variant="secondary" onClick={() => setCurrentStamp('end')} disabled={!cues.length}>{t('set_end')}</Button>
            </div>

            <div className="min-h-0 flex-grow overflow-auto">
              {cues.length > 0 ? (
                <table className="w-full table-fixed border-collapse">
                  <thead className="sticky top-0 z-10 bg-surface">
                    <tr className="border-b border-border-base text-left text-xs uppercase tracking-normal text-content-faint">
                      <th className="w-12 px-3 py-2 text-center">#</th>
                      <th className="w-28 px-3 py-2">{t('start')}</th>
                      <th className="w-28 px-3 py-2">{t('end')}</th>
                      <th className="px-3 py-2">{t('subtitle')}</th>
                      <th className="w-20 px-3 py-2 text-center">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cues.map((cue, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <tr
                          key={`${index}-${cue.start}-${cue.end}`}
                          className={`border-b border-border-subtle transition-colors hover:bg-surface-hover ${isActive ? 'bg-surface-hover' : ''}`}
                          onClick={() => seekToCue(index)}
                        >
                          <td className="px-3 py-2 text-center text-xs text-content-faint">{index + 1}</td>
                          <td className="px-3 py-2">
                            <input
                              key={`start-${format}-${index}-${cue.start}`}
                              defaultValue={formatSubtitleTime(cue.start, format)}
                              onBlur={(event) => updateCueTime(index, 'start', event.target.value)}
                              className="w-full rounded border border-border-input bg-surface-raised px-2 py-1 font-mono text-xs text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              key={`end-${format}-${index}-${cue.end}`}
                              defaultValue={formatSubtitleTime(cue.end, format)}
                              onBlur={(event) => updateCueTime(index, 'end', event.target.value)}
                              className="w-full rounded border border-border-input bg-surface-raised px-2 py-1 font-mono text-xs text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <textarea
                              value={cue.text}
                              rows={2}
                              onChange={(event) => updateCue(index, { text: event.target.value })}
                              className="w-full resize-none rounded border border-border-input bg-surface-raised px-2 py-1 text-sm text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Button variant="danger" onClick={(event) => {
                              event.stopPropagation();
                              deleteCue(index);
                            }}>
                              {tc('delete')}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="flex h-full min-h-72 items-center justify-center p-8 text-center">
                  <p className="text-sm leading-relaxed text-content-muted">{t('empty_subtitles')}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="flex min-h-72 flex-col rounded-lg border border-border-base bg-surface p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-content-secondary">{t('source_title')}</h2>
              <Button variant="secondary" onClick={() => parseInput()}>{t('parse_source')}</Button>
            </div>
            <textarea
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              className="min-h-56 flex-grow resize-none rounded border border-border-input bg-surface-raised p-3 font-mono text-xs text-content-secondary focus:outline-none focus:ring-2 focus:ring-action"
              placeholder={t('source_placeholder')}
            />
          </div>
          <div className="flex min-h-72 flex-col rounded-lg border border-border-base bg-surface p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-content-secondary">{t('export_preview')}</h2>
              <span className="rounded border border-border-subtle bg-surface-raised px-2 py-1 font-mono text-xs text-content-faint">
                {format.toUpperCase()}
              </span>
            </div>
            <pre className="min-h-56 flex-grow overflow-auto rounded border border-border-input bg-surface-raised p-3 font-mono text-xs text-content-muted whitespace-pre-wrap">
              {exportPreview.ok ? exportPreview.output : t('empty_export')}
            </pre>
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}
