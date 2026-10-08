'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import type { ToolContent } from '@/lib/tools/content';
import { MV_RATIO_SIZES, prepareLyrics, type MvRatio } from '@/lib/utils/mv-lyrics';
import {
  MV_TEMPLATES,
  createMvRenderer,
  type MvLyricMode,
  type MvLyricPosition,
  type MvLyricStyle,
  type MvScene,
  type MvTemplate,
} from '@/lib/utils/mv-render';
import { MvExportError, exportMv } from '@/lib/utils/mv-export';

const TOOL_ID = 'audio-lyric-video';
const DEFAULT_DURATION = 180;
const RATIOS = Object.keys(MV_RATIO_SIZES) as MvRatio[];
const STYLES: MvLyricStyle[] = ['clean', 'outline', 'neon'];
const POSITIONS: MvLyricPosition[] = ['top', 'center', 'bottom'];
const MODES: MvLyricMode[] = ['single', 'multi'];

const inputClass = 'w-full rounded border border-border-input bg-surface px-3 py-2 text-sm text-content placeholder:text-content-faint';
const fileButtonClass = 'inline-flex cursor-pointer items-center rounded border border-border-base bg-surface-hover px-3 py-2 text-sm text-content-secondary transition-colors hover:border-border-strong hover:text-content';

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

function Choice<T extends string>({ label, value, options, onChange, render }: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  render: (option: T) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold text-content-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button key={option} variant={option === value ? 'primary' : 'secondary'} aria-pressed={option === value} onClick={() => onChange(option)}>
            {render(option)}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

export function MvGenerator({ content }: { content: ToolContent }) {
  const t = useTranslations(`tools.${TOOL_ID}`);

  const [template, setTemplate] = useState<MvTemplate>('vinyl');
  const [ratio, setRatio] = useState<MvRatio>('16:9');
  const [lyricStyle, setLyricStyle] = useState<MvLyricStyle>('clean');
  const [lyricPosition, setLyricPosition] = useState<MvLyricPosition>('bottom');
  const [lyricMode, setLyricMode] = useState<MvLyricMode>('multi');
  const [lyricsText, setLyricsText] = useState('');
  const [credits, setCredits] = useState({ title: '', artist: '', lyricist: '', composer: '' });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState<{ fraction: number; label: string } | null>(null);
  const [error, setError] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const previewContextRef = useRef<AudioContext | null>(null);
  const exportingRef = useRef(false);
  const rendererRef = useRef<ReturnType<typeof createMvRenderer> | null>(null);

  const lyrics = useMemo(() => prepareLyrics(lyricsText, duration || DEFAULT_DURATION), [lyricsText, duration]);
  const [width, height] = MV_RATIO_SIZES[ratio];

  const scene: MvScene = {
    template,
    lyrics,
    lyricStyle,
    lyricPosition,
    lyricMode,
    credits: [credits.title, credits.artist, credits.lyricist, credits.composer].some((value) => value.trim())
      ? {
          title: credits.title.trim(),
          details: ([[t('artist'), credits.artist], [t('lyricist'), credits.lyricist], [t('composer'), credits.composer]] as Array<[string, string]>)
            .map(([label, value]): [string, string] => [label, value.trim()])
            .filter(([, value]) => value),
          heading: 'NOW PLAYING',
          fallbackTitle: t('untitled'),
        }
      : null,
    idleText: t('idle_text'),
    analyser: null,
    video: template === 'video' && videoUrl ? videoRef.current : null,
  };
  const sceneRef = useRef(scene);
  sceneRef.current = scene;

  // Preview loop: redraw every frame from the latest scene.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = createMvRenderer(canvas);
    rendererRef.current = renderer;
    let frame = 0;
    const loop = () => {
      if (!exportingRef.current) {
        const audio = audioRef.current;
        const time = audio?.src ? audio.currentTime : performance.now() / 1000;
        renderer.draw(time, { ...sceneRef.current, analyser: analyserRef.current });
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(frame);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);
  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);
  useEffect(() => () => {
    void previewContextRef.current?.close();
  }, []);

  // Background clip follows the template and play state.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (template === 'video' && videoUrl && playing) void video.play().catch(() => undefined);
    else video.pause();
  }, [template, videoUrl, playing]);

  const loadAudio = useCallback((file: File) => {
    setError('');
    if (!file.type.includes('mpeg') && !file.name.toLowerCase().endsWith('.mp3')) {
      setError(t('err_mp3'));
      return;
    }
    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
    setCurrentTime(0);
    setPlaying(false);
  }, [t]);

  const loadVideo = (file: File) => {
    setVideoUrl(URL.createObjectURL(file));
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioFile) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    if (!previewContextRef.current) {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaElementSource(audio).connect(analyser);
      analyser.connect(context.destination);
      previewContextRef.current = context;
      analyserRef.current = analyser;
    }
    await previewContextRef.current.resume();
    await audio.play();
  };

  const exportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioFile || exportingRef.current) return;
    if (template === 'video' && !videoUrl) {
      setError(t('err_video_required'));
      return;
    }
    setError('');
    audioRef.current?.pause();
    exportingRef.current = true;
    const renderer = rendererRef.current!;
    try {
      const blob = await exportMv({
        canvas,
        audioFile,
        // The idle placeholder is a preview hint only; never record it.
        drawFrame: (time, analyser) => renderer.draw(time, { ...sceneRef.current, analyser, idleText: '' }),
        onProgress: (fraction, stage) => setProgress({ fraction, label: t(stage === 'render' ? 'progress_render' : 'progress_convert') }),
        onStart: async () => {
          const video = videoRef.current;
          if (template === 'video' && video) {
            video.currentTime = 0;
            await video.play();
          }
        },
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${audioFile.name.replace(/\.[^.]+$/, '')}-MV.mp4`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setProgress({ fraction: 1, label: t('done') });
    } catch (cause) {
      setProgress(null);
      setError(cause instanceof MvExportError ? t(cause.code === 'unsupported' ? 'err_unsupported' : 'err_no_codec') : t('err_failed'));
    } finally {
      videoRef.current?.pause();
      exportingRef.current = false;
    }
  };

  const exporting = progress !== null && progress.fraction < 1;
  const creditFields: Array<[keyof typeof credits, string]> = [
    ['title', t('song_title')],
    ['artist', t('artist')],
    ['lyricist', t('lyricist')],
    ['composer', t('composer')],
  ];

  return (
    <ToolLayout toolId={TOOL_ID} content={content}>
      <div className="grid min-h-0 flex-grow grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(420px,560px)]">
        <div className="flex flex-col gap-4">
          <Panel title={t('templates')}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MV_TEMPLATES.map((id) => (
                <Button key={id} variant={id === template ? 'primary' : 'secondary'} aria-pressed={id === template} onClick={() => setTemplate(id)}>
                  {t(`template_${id}`)}
                </Button>
              ))}
            </div>
            {template === 'video' && (
              <label className={clsx(fileButtonClass, 'mt-3')}>
                {videoUrl ? t('replace_video') : t('upload_video')}
                <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) loadVideo(file);
                }} />
              </label>
            )}
          </Panel>

          <Panel title={t('audio_title')}>
            <div className="flex flex-wrap items-center gap-3">
              <label
                className={fileButtonClass}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) loadAudio(file);
                }}
              >
                {audioFile ? t('replace') : t('audio_drop')}
                <input type="file" accept="audio/mpeg,audio/mp3,.mp3" className="hidden" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) loadAudio(file);
                }} />
              </label>
              {audioFile && (
                <>
                  <Button variant="secondary" onClick={() => void togglePlay()}>{playing ? t('pause') : t('play')}</Button>
                  <span className="text-sm text-content-muted">
                    {audioFile.name} · {(audioFile.size / 1024 / 1024).toFixed(1)} MB · {formatTime(duration)}
                  </span>
                </>
              )}
            </div>
            <audio
              ref={audioRef}
              src={audioUrl || undefined}
              preload="metadata"
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={() => setError(t('err_audio'))}
            />
            <p className="mt-2 text-xs text-content-faint">{t('privacy_note')}</p>
          </Panel>

          <Panel title={t('lyrics_title')}>
            <label className={clsx(fileButtonClass, 'mb-3')}>
              {t('upload_lrc')}
              <input type="file" accept=".lrc,text/plain" className="hidden" onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) setLyricsText(await file.text());
                event.target.value = '';
              }} />
            </label>
            <textarea
              className={clsx(inputClass, 'min-h-40 font-mono')}
              value={lyricsText}
              placeholder={t('lyrics_placeholder')}
              onChange={(event) => setLyricsText(event.target.value)}
            />
            <p className="mt-2 text-xs text-content-faint">{t('lyrics_hint')}</p>
          </Panel>

          <Panel title={t('credits_title')}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {creditFields.map(([key, label]) => (
                <label key={key} className="flex flex-col gap-1 text-xs font-semibold text-content-muted">
                  {label}
                  <input className={inputClass} value={credits[key]} onChange={(event) => setCredits({ ...credits, [key]: event.target.value })} />
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-content-faint">{t('credits_hint')}</p>
          </Panel>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border-base bg-surface p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-content-muted">
              <span>{t('preview')}</span>
              <span>{width} × {height}</span>
            </div>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="mx-auto block w-full rounded bg-surface-raised"
              style={{ aspectRatio: `${width} / ${height}`, maxWidth: height > width ? 430 : width === height ? 650 : undefined }}
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-content-muted">
              <span>{formatTime(currentTime)}</span>
              <progress className="h-1 flex-grow" value={duration ? currentTime : 0} max={duration || 1} />
              <span>{formatTime(duration)}</span>
            </div>
            <video ref={videoRef} src={videoUrl || undefined} muted loop playsInline className="hidden" />
          </div>

          <Panel title={t('style_title')}>
            <div className="flex flex-col gap-4">
              <Choice label={t('ratio_title')} value={ratio} options={RATIOS} onChange={setRatio} render={(option) => option} />
              <Choice label={t('lyric_style')} value={lyricStyle} options={STYLES} onChange={setLyricStyle} render={(option) => t(`style_${option}`)} />
              <Choice label={t('lyric_position')} value={lyricPosition} options={POSITIONS} onChange={setLyricPosition} render={(option) => t(`position_${option}`)} />
              <Choice label={t('lyric_lines')} value={lyricMode} options={MODES} onChange={setLyricMode} render={(option) => t(`lines_${option}`)} />
            </div>
          </Panel>

          <div className="flex flex-col gap-2">
            <Button size="md" disabled={!audioFile || exporting} onClick={() => void exportVideo()}>
              {exporting ? t('exporting') : t('export')}
            </Button>
            {progress && (
              <div role="status" className="text-sm text-content-secondary">
                <div className="mb-1 flex justify-between"><span>{progress.label}</span><span>{Math.round(progress.fraction * 100)}%</span></div>
                <progress className="h-2 w-full" value={progress.fraction} max={1} />
              </div>
            )}
            {error && <p role="alert" className="text-sm text-danger-content">{error}</p>}
            <p className="text-xs text-content-faint">{t('keep_foreground')}</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
