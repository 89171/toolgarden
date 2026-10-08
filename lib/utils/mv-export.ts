import { loadFfmpeg } from './audio-browser';

export interface MvExportOptions {
  canvas: HTMLCanvasElement;
  audioFile: File;
  /** Draw the frame for `time` seconds; `analyser` reflects the audio being recorded. */
  drawFrame: (time: number, analyser: AnalyserNode) => void;
  onProgress: (fraction: number, stage: 'render' | 'convert') => void;
  /** Called right before recording starts (e.g. to restart the background video). */
  onStart?: () => Promise<void> | void;
}

const MP4_TYPES = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4'];
const WEBM_TYPES = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];

export class MvExportError extends Error {
  constructor(readonly code: 'unsupported' | 'no-codec') {
    super(code);
  }
}

/**
 * Plays the audio through Web Audio while the canvas is captured in real time,
 * so export takes roughly the song's length. Browsers without native MP4
 * recording get WebM, converted to MP4 locally with FFmpeg.wasm.
 */
export async function exportMv({ canvas, audioFile, drawFrame, onProgress, onStart }: MvExportOptions): Promise<Blob> {
  if (!window.MediaRecorder || !canvas.captureStream) throw new MvExportError('unsupported');
  const mp4Type = MP4_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  const mimeType = mp4Type ?? WEBM_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) throw new MvExportError('no-codec');

  const audioContext = new AudioContext();
  try {
    const decoded = await audioContext.decodeAudioData(await audioFile.arrayBuffer());
    const source = audioContext.createBufferSource();
    const destination = audioContext.createMediaStreamDestination();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.buffer = decoded;
    source.connect(analyser);
    analyser.connect(destination);

    const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...destination.stream.getAudioTracks()]);
    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    const recorded = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    });

    await onStart?.();
    await audioContext.resume();
    const startsAt = audioContext.currentTime + 0.15;
    recorder.start(1000);
    source.start(startsAt);

    let rendering = true;
    const render = () => {
      if (!rendering) return;
      const elapsed = Math.max(0, audioContext.currentTime - startsAt);
      drawFrame(elapsed, analyser);
      onProgress(Math.min(elapsed / decoded.duration, 0.99), 'render');
      requestAnimationFrame(render);
    };
    render();

    await new Promise<void>((resolve) => {
      source.onended = () => {
        rendering = false;
        drawFrame(decoded.duration, analyser);
        window.setTimeout(() => {
          recorder.stop();
          resolve();
        }, 120);
      };
    });
    const raw = await recorded;
    stream.getTracks().forEach((track) => track.stop());
    return mp4Type ? raw : await convertWebmToMp4(raw, (fraction) => onProgress(fraction, 'convert'));
  } finally {
    void audioContext.close();
  }
}

async function convertWebmToMp4(blob: Blob, onProgress: (fraction: number) => void): Promise<Blob> {
  const ffmpeg = await loadFfmpeg();
  const handleProgress = ({ progress }: { progress: number }) => onProgress(Math.max(0, Math.min(1, progress)));
  ffmpeg.on('progress', handleProgress);
  try {
    await ffmpeg.writeFile('mv-input.webm', new Uint8Array(await blob.arrayBuffer()));
    await ffmpeg.exec(['-i', 'mv-input.webm', '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', 'mv-output.mp4']);
    const data = await ffmpeg.readFile('mv-output.mp4');
    return new Blob([typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data)], { type: 'video/mp4' });
  } finally {
    ffmpeg.off('progress', handleProgress);
    await Promise.all(['mv-input.webm', 'mv-output.mp4'].map((name) => ffmpeg.deleteFile(name).catch(() => undefined)));
  }
}
