'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ToolLayout } from '@/components/ToolLayout';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatAudioFileSize, getAudioAcceptValue } from '@/lib/utils/audio';
import { createZipArchive } from '@/lib/utils/zip';
import {
  buildStemArchiveName,
  clampSelection,
  defaultStemModelId,
  defaultStemSelection,
  sourcesForModel,
  stemModelIds,
  stemModels,
  type StemBackend,
  type StemModelId,
  type StemProgress,
  type StemSource,
} from '@/lib/utils/stem-separation';
import {
  clearStemModelCache,
  detectStemCapability,
  separateStems,
} from '@/lib/utils/stem-separation-browser';

interface StemSplitterProps {
  toolId: string;
}

/**
 * 分轨结果的可播放形态。
 *
 * 只保留 Blob 而丢掉原始 Uint8Array：Blob 构造时已拷贝一份数据，
 * 两者同时持有会让 6 轨 4 分钟歌多占约 250MB。
 */
interface ReadyTrack {
  source: StemSource;
  filename: string;
  blob: Blob;
  url: string;
  size: number;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

export function AudioStemSplitter({ toolId }: StemSplitterProps) {
  const t = useTranslations('stem_splitter');

  const [file, setFile] = useState<File | null>(null);
  const [modelId, setModelId] = useState<StemModelId>(defaultStemModelId);
  const [selected, setSelected] = useState<StemSource[]>(defaultStemSelection);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<StemProgress | null>(null);
  const [tracks, setTracks] = useState<ReadyTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  // 失败时的技术细节。工具坏掉的时候，真实原因比友好文案有用得多。
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number | null>(null);
  const [backend, setBackend] = useState<StemBackend | null>(null);
  const [capability, setCapability] = useState<{ supported: boolean; webgpu: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tracksRef = useRef<ReadyTrack[]>([]);
  const accept = useMemo(() => getAudioAcceptValue(), []);
  const isProcessing = progress !== null;
  const availableSources = useMemo(() => sourcesForModel(modelId), [modelId]);

  // 卸载时回收 object URL，避免几百 MB 的 WAV 一直挂在内存里。
  const releaseTracks = useCallback(() => {
    for (const track of tracksRef.current) URL.revokeObjectURL(track.url);
    tracksRef.current = [];
  }, []);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => releaseTracks, [releaseTracks]);

  useEffect(() => {
    let active = true;
    void detectStemCapability().then((result) => {
      if (active) setCapability(result);
    });
    return () => {
      active = false;
    };
  }, []);

  const pickFile = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      releaseTracks();
      setTracks([]);
      setError(null);
      setElapsedSeconds(null);
      setBackend(null);
      setFile(files[0]);
    },
    [releaseTracks],
  );

  const switchModel = useCallback((next: StemModelId) => {
    setModelId(next);
    // 切到 4 轨时把 guitar / piano 去掉，否则会请求模型不存在的轨道。
    setSelected((current) => clampSelection(current, next));
  }, []);

  const toggleStem = useCallback(
    (source: StemSource) => {
      setSelected((current) =>
        current.includes(source)
          ? current.filter((item) => item !== source)
          : // 保持固定顺序，输出列表才不会跟着点击顺序乱跳。
            availableSources.filter((item) => item === source || current.includes(item)),
      );
    },
    [availableSources],
  );

  const run = useCallback(async () => {
    if (!file) return;

    releaseTracks();
    setTracks([]);
    setError(null);
    setElapsedSeconds(null);
    setBackend(null);
    setProgress({ stage: 'decode', percent: 0 });

    const outcome = await separateStems(file, {
      selected,
      modelId,
      onProgress: setProgress,
    });

    setProgress(null);

    if (!outcome.ok) {
      setError(t(`errors.${outcome.code}`));
      setErrorDetail(outcome.detail ?? null);
      return;
    }

    const ready = outcome.tracks.map<ReadyTrack>((track) => {
      const blob = new Blob([track.wav], { type: 'audio/wav' });
      return {
        source: track.source,
        filename: track.filename,
        blob,
        url: URL.createObjectURL(blob),
        size: blob.size,
      };
    });

    tracksRef.current = ready;
    setTracks(ready);
    setBackend(outcome.backend);
    setElapsedSeconds(Math.round(outcome.durationMs / 1000));
  }, [file, modelId, releaseTracks, selected, t]);

  const downloadAll = useCallback(async () => {
    if (!file || tracks.length === 0) return;

    const archive = await createZipArchive(
      tracks.map((track) => ({ filename: track.filename, blob: track.blob })),
    );
    downloadBlob(archive, buildStemArchiveName(file.name));
  }, [file, tracks]);

  const stageLabel = progress
    ? progress.stage === 'separating'
      ? t('stage.separating', {
          current: progress.chunkIndex ?? 0,
          total: progress.chunkTotal ?? 0,
        })
      : t(`stage.${progress.stage}`)
    : null;

  /** 开始按钮为什么不可用；null 表示可用。 */
  const blockedReason: 'needs_file' | 'needs_stem' | null = !file
    ? 'needs_file'
    : selected.length === 0
      ? 'needs_stem'
      : null;

  const modelDetail =
    progress?.stage === 'model' && progress.totalBytes
      ? `${formatAudioFileSize(progress.receivedBytes ?? 0)} / ${formatAudioFileSize(progress.totalBytes)}`
      : null;

  if (capability && !capability.supported) {
    return (
      <ToolLayout toolId={toolId}>
        <div className="rounded-lg border border-border-base bg-surface p-6">
          <h2 className="text-base font-semibold text-content">{t('unsupported_title')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">{t('unsupported_hint')}</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout toolId={toolId}>
      <div className="grid min-h-0 flex-grow gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel title={t('upload_title')}>
          <div className="flex flex-col gap-4">
            <label
              className={[
                'flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center transition-colors',
                isProcessing
                  ? 'cursor-not-allowed border-border-subtle bg-surface text-content-faint'
                  : dragging
                    ? 'border-border-strong bg-surface-hover'
                    : 'border-border-input bg-surface-raised hover:border-border-strong hover:bg-surface-hover',
              ].join(' ')}
              onDragEnter={(event) => {
                event.preventDefault();
                if (isProcessing) return;
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (isProcessing) return;
                pickFile(event.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                disabled={isProcessing}
                className="sr-only"
                onChange={(event) => {
                  pickFile(event.target.files);
                  event.currentTarget.value = '';
                }}
              />
              <span className="text-sm font-semibold text-content">{t('drop_title')}</span>
              <span className="max-w-sm text-sm leading-relaxed text-content-muted">
                {t('drop_hint')}
              </span>
              {file && (
                <span className="text-xs text-content-faint">
                  {file.name} · {formatAudioFileSize(file.size)}
                </span>
              )}
            </label>

            <div className="rounded-lg border border-border-base bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-content">{t('model_title')}</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {stemModelIds.map((id) => (
                  <label
                    key={id}
                    className={[
                      'flex cursor-pointer items-start gap-2 rounded border p-2 transition-colors',
                      modelId === id
                        ? 'border-border-strong bg-surface-hover'
                        : 'border-border-subtle hover:bg-surface-hover',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="stem-model"
                      className="mt-0.5"
                      checked={modelId === id}
                      disabled={isProcessing}
                      onChange={() => switchModel(id)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-content">
                        {t(`models.${id}.name`)}
                      </span>
                      <span className="block text-xs leading-relaxed text-content-faint">
                        {t(`models.${id}.hint`)}
                      </span>
                      <span className="mt-1 block text-xs text-content-muted">
                        {formatAudioFileSize(stemModels[id].bytes)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border-base bg-surface p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-content">{t('stems_title')}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setSelected([...availableSources])}
                    disabled={isProcessing}
                  >
                    {t('select_all')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSelected([])}
                    disabled={isProcessing}
                  >
                    {t('select_none')}
                  </Button>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {availableSources.map((source) => (
                  <label
                    key={source}
                    className="flex cursor-pointer items-start gap-2 rounded border border-border-subtle p-2 transition-colors hover:bg-surface-hover"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={selected.includes(source)}
                      disabled={isProcessing}
                      onChange={() => toggleStem(source)}
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-content">
                        {t(`stems.${source}`)}
                      </span>
                      <span className="block text-xs leading-relaxed text-content-faint">
                        {t(`stem_hint.${source}`)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>

              <p className="mt-3 text-xs text-content-muted">
                {t('selected_count', { count: selected.length })}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Button onClick={run} disabled={isProcessing || blockedReason !== null}>
                {t('action_separate')}
              </Button>
              {/* 按钮禁用时必须说明原因，否则用户只看到一个点不动的灰按钮。 */}
              {blockedReason && !isProcessing && (
                <p className="text-xs text-content-muted">{t(blockedReason)}</p>
              )}
            </div>

            <p className="text-xs leading-relaxed text-content-faint">{t('model_download_note')}</p>
            <p className="text-xs leading-relaxed text-content-faint">{t('privacy_note')}</p>
            {capability && !capability.webgpu && (
              <p className="text-xs leading-relaxed text-content-muted">{t('backend_wasm')}</p>
            )}
          </div>
        </Panel>

        <Panel
          title={t('output_title')}
          actions={
            tracks.length > 0 ? (
              <Button variant="secondary" onClick={downloadAll}>
                {t('download_all')}
              </Button>
            ) : undefined
          }
        >
          <div className="flex flex-col gap-4">
            {progress && (
              <div className="rounded-lg border border-border-base bg-surface p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-content-secondary">{stageLabel}</span>
                  <span className="text-content-muted">{progress.percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-surface-raised">
                  <div
                    className="h-full bg-action transition-[width]"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                {modelDetail && <p className="mt-2 text-xs text-content-faint">{modelDetail}</p>}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-danger-content bg-danger-surface p-4 text-sm text-danger-content">
                <p>{error}</p>
                {errorDetail && (
                  <p className="mt-2 font-mono text-xs break-all opacity-80">{errorDetail}</p>
                )}
                <Button
                  variant="secondary"
                  className="mt-3"
                  onClick={async () => {
                    await clearStemModelCache();
                    setError(null);
                    setErrorDetail(null);
                  }}
                >
                  {t('clear_cache')}
                </Button>
              </div>
            )}

            {tracks.length > 0 && (
              <div className="flex flex-col gap-3">
                {(elapsedSeconds !== null || backend) && (
                  <p className="text-xs text-content-muted">
                    {[
                      elapsedSeconds !== null ? t('elapsed', { seconds: elapsedSeconds }) : null,
                      backend === 'webgpu' ? t('backend_webgpu') : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                )}

                {tracks.map((track) => (
                  <div
                    key={track.source}
                    className="rounded-lg border border-border-base bg-surface p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium text-content">
                        {t(`stems.${track.source}`)}
                        <span className="ml-2 text-xs font-normal text-content-faint">
                          {formatAudioFileSize(track.size)}
                        </span>
                      </span>
                      <Button
                        variant="secondary"
                        onClick={() => downloadBlob(track.blob, track.filename)}
                      >
                        {t('download_one')}
                      </Button>
                    </div>
                    <audio controls preload="none" src={track.url} className="w-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
