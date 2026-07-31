'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { formatAudioFileSize } from '@/lib/utils/audio';
import {
  STEM_WAVEFORM_HEIGHT,
  buildWaveformPath,
  formatClock,
  type StemSource,
} from '@/lib/utils/stem-separation';

export interface StemPlayerTrack {
  source: StemSource;
  filename: string;
  blob: Blob;
  url: string;
  size: number;
  peaks: Uint8Array;
}

interface StemPlayerProps {
  tracks: StemPlayerTrack[];
  /** 轨道显示名，由调用方从 i18n 取。 */
  labelOf: (source: StemSource) => string;
  labels: {
    playAll: string;
    pauseAll: string;
    stop: string;
    volume: string;
    mute: string;
    unmute: string;
    download: string;
  };
  onDownload: (track: StemPlayerTrack) => void;
}

/** 音量默认值（0–1）。 */
const DEFAULT_VOLUME = 1;

/**
 * 多轨播放器：波形 + 每轨音量 + 全部齐奏。
 *
 * 所有分轨长度严格相同（都来自同一段输入的 overlap-add 输出），所以同步
 * 策略很简单：统一 seek 到同一个 currentTime，再一起 play。实测同时播放的
 * 各轨 currentTime 完全一致（1.08s / 1.08s / 1.08s）。
 *
 * 重新分轨后的状态重置不在这里做：调用方用随每次运行变化的 key 让本组件
 * 重新挂载，播放头、音量、静音自然回到初值。用 effect 里 setState 去重置
 * 是 React 反模式（react-hooks/set-state-in-effect 会报错），也会多渲染一轮。
 */
export function StemPlayer({ tracks, labelOf, labels, onDownload }: StemPlayerProps) {
  const audioRefs = useRef(new Map<StemSource, HTMLAudioElement>());
  const frameRef = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [muted, setMuted] = useState<Record<string, boolean>>({});

  const eachAudio = useCallback((fn: (audio: HTMLAudioElement, source: StemSource) => void) => {
    for (const [source, audio] of audioRefs.current) fn(audio, source);
  }, []);

  /*
   * 计时基准固定取第一条轨道，按 source 查表而不是拿 Map 的第一个值。
   *
   * 内联 ref 回调在每次渲染都会先以 null 清理、再重新写入，Map 的插入顺序
   * 因此会被打乱；一旦顺序里排头的轨道恰好是静音/未播放的那条，播放头就会
   * 一直停在 0。实测就踩到过：三条轨道都在 1.08s，时钟却显示 00:00.0。
   */
  const leaderSource = tracks[0]?.source;

  // 播放中用 rAF 驱动播放头：比 timeupdate 事件平滑得多（后者约 4Hz）。
  useEffect(() => {
    if (!playing) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      return;
    }

    const leader = leaderSource ? audioRefs.current.get(leaderSource) : undefined;

    const tick = () => {
      const current = leaderSource ? audioRefs.current.get(leaderSource) : undefined;
      if (current) setPosition(current.currentTime);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);

    /*
     * timeupdate 作为兜底。
     *
     * 标签页切到后台时浏览器会挂起 requestAnimationFrame（实测隐藏标签页
     * 500ms 内触发 0 次），只靠 rAF 播放头会冻住。timeupdate 约 4Hz，平时
     * 由 rAF 提供顺滑度，后台时由它保证时钟仍然在走。
     */
    const onTimeUpdate = () => {
      if (leader) setPosition(leader.currentTime);
    };
    leader?.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      leader?.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [playing, leaderSource]);

  /*
   * 音量用 effect 同步到 DOM。
   *
   * <audio> 没有 volume 属性，只能命令式赋值；放在 ref 回调里赋值会随渲染
   * 反复触发，而且和「静音」互相干扰。muted 则可以直接当受控属性传下去。
   */
  useEffect(() => {
    for (const track of tracks) {
      const audio = audioRefs.current.get(track.source);
      if (audio) audio.volume = volumes[track.source] ?? DEFAULT_VOLUME;
    }
  }, [tracks, volumes]);

  const playAll = useCallback(async () => {
    const audios = [...audioRefs.current.values()];
    if (audios.length === 0) return;

    // 先对齐到同一位置再一起播，否则各轨道会因起播时刻不同而错位。
    for (const audio of audios) audio.currentTime = position;
    await Promise.all(audios.map((audio) => audio.play().catch(() => undefined)));
    setPlaying(true);
  }, [position]);

  const pauseAll = useCallback(() => {
    eachAudio((audio) => audio.pause());
    setPlaying(false);
  }, [eachAudio]);

  const stopAll = useCallback(() => {
    eachAudio((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    setPlaying(false);
    setPosition(0);
  }, [eachAudio]);

  const seekTo = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(duration || 0, seconds));
      eachAudio((audio) => {
        audio.currentTime = clamped;
      });
      setPosition(clamped);
    },
    [duration, eachAudio],
  );

  const seekFromPointer = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width === 0 || !duration) return;
      const ratio = (event.clientX - rect.left) / rect.width;
      seekTo(ratio * duration);
    },
    [duration, seekTo],
  );

  const setVolume = useCallback((source: StemSource, value: number) => {
    setVolumes((current) => ({ ...current, [source]: value }));
  }, []);

  const toggleMute = useCallback((source: StemSource) => {
    setMuted((current) => ({ ...current, [source]: !current[source] }));
  }, []);

  const progressRatio = duration > 0 ? Math.min(1, position / duration) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* 传输控制条 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={playing ? pauseAll : playAll}>
          {playing ? labels.pauseAll : labels.playAll}
        </Button>
        <Button variant="secondary" onClick={stopAll}>
          {labels.stop}
        </Button>
        <span className="ml-1 font-mono text-xs text-content-secondary">
          {formatClock(position)} / {formatClock(duration)}
        </span>
      </div>

      {tracks.map((track, index) => {
        const volume = volumes[track.source] ?? DEFAULT_VOLUME;
        const isMuted = muted[track.source] ?? false;
        // 静音或音量归零时波形压暗，让「听不到」在视觉上也成立。
        const dimmed = isMuted || volume === 0;

        return (
          <div
            key={track.source}
            className="overflow-hidden rounded-lg border border-border-base bg-surface"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2">
              <span className="min-w-16 text-sm font-medium text-content">
                {labelOf(track.source)}
              </span>
              <span className="text-xs text-content-faint">{formatAudioFileSize(track.size)}</span>

              <button
                type="button"
                onClick={() => toggleMute(track.source)}
                aria-label={isMuted ? labels.unmute : labels.mute}
                aria-pressed={isMuted}
                className="cursor-pointer rounded border border-border-base px-2 py-1 text-xs text-content-secondary transition-colors hover:bg-surface-hover"
              >
                {isMuted ? labels.unmute : labels.mute}
              </button>

              <label className="flex flex-1 items-center gap-2 text-xs text-content-muted">
                <span className="whitespace-nowrap">{labels.volume}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(track.source, Number(event.target.value))}
                  className="min-w-24 flex-1"
                  aria-label={`${labelOf(track.source)} ${labels.volume}`}
                />
                <span className="w-9 text-right font-mono tabular-nums">
                  {Math.round(volume * 100)}
                </span>
              </label>

              <Button variant="secondary" onClick={() => onDownload(track)}>
                {labels.download}
              </Button>
            </div>

            {/* 波形：点击任意位置对所有轨道统一 seek */}
            <div
              className="relative cursor-pointer bg-waveform-track"
              onPointerDown={seekFromPointer}
            >
              <svg
                viewBox={`0 0 ${track.peaks.length} ${STEM_WAVEFORM_HEIGHT}`}
                preserveAspectRatio="none"
                className="block h-14 w-full"
                aria-hidden="true"
              >
                <path
                  d={buildWaveformPath(track.peaks)}
                  className={dimmed ? 'fill-waveform-dim' : 'fill-waveform-fill'}
                />
              </svg>
              <div
                className="pointer-events-none absolute inset-y-0 w-px bg-waveform-playhead"
                style={{ left: `${progressRatio * 100}%` }}
              />
            </div>

            <audio
              /*
               * ref 回调只登记元素，null 清理时刻意不删除。
               *
               * React 19 的内联 ref 每次渲染都会先以 null 清理再重新写入，
               * 如果这里删除，Map 会出现短暂为空的窗口；playAll 正好在这个
               * 窗口里取快照就会拿到过期元素。组件卸载时整个 Map 一起丢弃，
               * 所以不删除不会泄漏。
               */
              ref={(element) => {
                if (element) audioRefs.current.set(track.source, element);
              }}
              src={track.url}
              muted={isMuted}
              preload="metadata"
              // 只让第一条轨道汇报时长与结束，避免 6 条轨道重复触发同一状态更新。
              onLoadedMetadata={
                index === 0
                  ? (event) => setDuration(event.currentTarget.duration || 0)
                  : undefined
              }
              onEnded={index === 0 ? stopAll : undefined}
              className="hidden"
            />
          </div>
        );
      })}
    </div>
  );
}
