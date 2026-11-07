import { loadFfmpeg } from './audio-browser';

/**
 * 音轨并行预处理 — 共享模块（视频压缩/截取/裁剪、视频去水印共用）。
 *
 * 与视频渲染并行启动：渲染开始时就用 ffmpeg.wasm 探测音轨并抽出独立音轨
 * （AAC 源直接流复制，零损伤、几乎不耗时），渲染结束后只做一次流复制封装，
 * 不再串行等待音频重编码。
 *
 * 本文件不依赖 DOM / React；进度以通用回调暴露，由调用方映射成各自的进度类型。
 */

export type AudioPrepResult =
  /** 源视频明确没有音轨 */
  | { status: 'none' }
  /** 已抽出独立音轨，最后只需流复制封装 */
  | { status: 'ready'; blob: Blob }
  /** 源有音轨但预处理失败，退回「视频 + 源文件」重编码音轨的老路径 */
  | { status: 'failed' };

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new Error('cancelled');
    error.name = 'AbortError';
    throw error;
  }
}

function isCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function getFileExtension(name: string): string {
  return (/\.([a-z0-9]{2,5})$/i.exec(name)?.[1] ?? 'mp4').toLowerCase();
}

/**
 * 用 ffmpeg 探测音轨并按区间抽出独立音轨。
 *
 * - AAC 源直接 `-c:a copy` 流复制（零损伤、几乎不耗时）
 * - 其它编码重编码为 AAC
 * - 探测/抽取失败返回 'failed'，由封装阶段退回老路径，不阻塞导出
 */
export async function prepareAudioTrack(
  file: File,
  range: { start: number; end: number } | null,
  audioBitrateKbps: number,
  signal?: AbortSignal,
  onProgress?: (label: string, percent: number) => void
): Promise<AudioPrepResult> {
  const sourceName = `audio-source.${getFileExtension(file.name)}`;
  const audioName = 'audio-track.m4a';
  let ffmpeg: Awaited<ReturnType<typeof loadFfmpeg>> | null = null;

  try {
    onProgress?.('loading', 10);
    ffmpeg = await loadFfmpeg();
    throwIfAborted(signal);
    onProgress?.('loading', 40);
    await ffmpeg.writeFile(sourceName, new Uint8Array(await file.arrayBuffer()));
    throwIfAborted(signal);

    // 探测音轨：ffmpeg 不带输出文件必然返回非零退出码，日志里能看到流信息
    const logs: string[] = [];
    const onLog = ({ message }: { message: string }) => {
      logs.push(message);
    };
    ffmpeg.on('log', onLog);
    try {
      await ffmpeg.exec(['-i', sourceName]);
    } catch {
      // 预期行为：仅用于拿到流信息
    } finally {
      ffmpeg.off('log', onLog);
    }
    throwIfAborted(signal);

    const audioLine = logs.find((line) => /stream #\d+:\d+.*?:\s*audio:\s*/i.test(line));
    if (!audioLine) {
      return { status: 'none' };
    }
    const sourceCodec = (/audio:\s*([a-z0-9_]+)/i.exec(audioLine)?.[1] ?? '').toLowerCase();
    const canStreamCopy = sourceCodec === 'aac';

    onProgress?.('extracting', 60);
    const args: string[] = [];
    if (range) {
      args.push('-ss', range.start.toFixed(3), '-t', (range.end - range.start).toFixed(3));
    }
    args.push('-i', sourceName, '-vn', '-c:a', canStreamCopy ? 'copy' : 'aac');
    if (!canStreamCopy) {
      args.push('-b:a', `${audioBitrateKbps}k`);
    }
    args.push('-movflags', '+faststart', audioName);
    await ffmpeg.exec(args);
    throwIfAborted(signal);

    const data = await ffmpeg.readFile(audioName);
    if (typeof data === 'string' || data.byteLength < 512) {
      return { status: 'failed' };
    }
    onProgress?.('extracting', 100);
    return { status: 'ready', blob: new Blob([new Uint8Array(data)], { type: 'audio/mp4' }) };
  } catch (error) {
    if (isCancellation(error)) throw error;
    return { status: 'failed' };
  } finally {
    if (ffmpeg) {
      await Promise.allSettled([ffmpeg.deleteFile(sourceName), ffmpeg.deleteFile(audioName)]);
    }
  }
}

/** 把已抽好的音轨以流复制方式封进重编码后的视频（耗时主要在写/读文件，几乎不占 CPU） */
export async function muxWithPreparedAudio(
  videoBlob: Blob,
  audioBlob: Blob,
  signal?: AbortSignal,
  onProgress?: (label: string, percent: number) => void
): Promise<Blob | null> {
  const videoName = 'mux-video.mp4';
  const audioName = 'mux-audio.m4a';
  const outputName = 'mux-output.mp4';
  let ffmpeg: Awaited<ReturnType<typeof loadFfmpeg>> | null = null;

  try {
    onProgress?.('muxing', 20);
    ffmpeg = await loadFfmpeg();
    await ffmpeg.writeFile(videoName, new Uint8Array(await videoBlob.arrayBuffer()));
    await ffmpeg.writeFile(audioName, new Uint8Array(await audioBlob.arrayBuffer()));
    throwIfAborted(signal);
    onProgress?.('muxing', 50);

    await ffmpeg.exec([
      '-i', videoName,
      '-i', audioName,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c', 'copy',
      '-movflags', '+faststart',
      outputName,
    ]);
    throwIfAborted(signal);

    const data = await ffmpeg.readFile(outputName);
    if (typeof data === 'string' || data.byteLength < 1024) {
      return null;
    }
    onProgress?.('muxing', 100);
    return new Blob([new Uint8Array(data)], { type: 'video/mp4' });
  } catch (error) {
    if (isCancellation(error)) throw error;
    return null;
  } finally {
    if (ffmpeg) {
      await Promise.allSettled([
        ffmpeg.deleteFile(videoName),
        ffmpeg.deleteFile(audioName),
        ffmpeg.deleteFile(outputName),
      ]);
    }
  }
}
