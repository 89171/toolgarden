import * as THREE from 'three';
import { lyricAt, type LyricLine } from './mv-lyrics';

export type MvTemplate = 'vinyl' | 'particles' | 'spectrum' | 'waveform' | 'tunnel' | 'video';
export type MvLyricStyle = 'clean' | 'outline' | 'neon';
export type MvLyricPosition = 'top' | 'center' | 'bottom';
export type MvLyricMode = 'single' | 'multi';

export const MV_TEMPLATES: readonly MvTemplate[] = ['vinyl', 'particles', 'spectrum', 'waveform', 'tunnel', 'video'];
export const MV_CREDITS_SECONDS = 5;

export interface MvCredits {
  title: string;
  details: Array<[label: string, value: string]>;
  heading: string;
  fallbackTitle: string;
}

/** Everything one frame depends on; the renderer holds no UI state. */
export interface MvScene {
  template: MvTemplate;
  lyrics: LyricLine[];
  lyricStyle: MvLyricStyle;
  lyricPosition: MvLyricPosition;
  lyricMode: MvLyricMode;
  credits: MvCredits | null;
  /** Placeholder shown before the first lyric; leave empty for exported frames. */
  idleText: string;
  analyser: AnalyserNode | null;
  video: HTMLVideoElement | null;
}

const STAR_COUNT = 1200;
const BACKGROUNDS: Record<Exclude<MvTemplate, 'tunnel' | 'video'>, [string, string, string]> = {
  vinyl: ['#773d68', '#2b2347', '#100f20'],
  particles: ['#243b78', '#251548', '#090818'],
  spectrum: ['#243566', '#25133f', '#080713'],
  waveform: ['#122f4a', '#260e3e', '#050611'],
};

/** Draws MV frames onto `canvas`. Call `dispose()` to free the WebGL context. */
export function createMvRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const frequencyData = new Uint8Array(128);
  const waveformData = new Uint8Array(256);
  let three: ReturnType<typeof createStarField> | null = null;

  function wrapText(text: string, y: number, maxWidth: number, stroke = false) {
    const rows: string[] = [];
    let line = '';
    for (const character of text) {
      if (ctx.measureText(line + character).width > maxWidth && line) {
        rows.push(line);
        line = character;
      } else {
        line += character;
      }
    }
    if (line) rows.push(line);
    rows.slice(0, 2).forEach((row, index) => {
      if (stroke) ctx.strokeText(row, canvas.width / 2, y + index * 68);
      ctx.fillText(row, canvas.width / 2, y + index * 68);
    });
  }

  function spectrumValues(time: number, count: number, analyser: AnalyserNode | null) {
    if (analyser) {
      analyser.getByteFrequencyData(frequencyData);
      return Array.from({ length: count }, (_, index) => frequencyData[Math.floor((index * 90) / count)] / 255);
    }
    return Array.from({ length: count }, (_, index) =>
      0.18 + Math.abs(Math.sin(time * 2.8 + index * 0.47) * Math.cos(time * 1.1 - index * 0.19)) * 0.68);
  }

  function drawVinyl(time: number) {
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.38;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.45);
    const record = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
    record.addColorStop(0, '#ffd166');
    record.addColorStop(0.17, '#ef476f');
    record.addColorStop(0.18, '#1b1b1b');
    record.addColorStop(0.62, '#090909');
    record.addColorStop(1, '#202020');
    ctx.fillStyle = record;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.11)';
    ctx.lineWidth = 2;
    for (let groove = radius * 0.48; groove < radius * 0.96; groove += radius * 0.064) {
      ctx.beginPath();
      ctx.arc(0, 0, groove, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#79c8ff';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + radius * 1.07, cy - radius * 0.88);
    ctx.lineTo(cx + radius * 1.3, cy - radius * 0.68);
    ctx.lineTo(cx + radius * 0.93, cy + radius * 0.23);
    ctx.stroke();
  }

  function drawParticles(time: number) {
    const colors = ['88,214,255', '178,122,255', '255,105,180', '255,211,102'];
    for (let index = 0; index < 110; index++) {
      const speed = 12 + (index % 9) * 2.4;
      const x = (index * 97.31 + time * speed) % canvas.width;
      const y = canvas.height / 2 + Math.sin(index * 1.7 + time * (0.35 + (index % 4) * 0.08)) * (80 + (index % 7) * 25);
      const size = 0.7 + (index % 5) * 0.65;
      const color = colors[index % colors.length];
      const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 5);
      glow.addColorStop(0, `rgba(${color},${0.35 + (index % 4) * 0.13})`);
      glow.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSpectrum(time: number, analyser: AnalyserNode | null) {
    const count = Math.max(26, Math.min(52, Math.floor(canvas.width / 22)));
    const values = spectrumValues(time, count, analyser);
    const gap = Math.max(3, canvas.width * 0.0045);
    const barWidth = (canvas.width * 0.82) / count - gap;
    const startX = (canvas.width - values.length * (barWidth + gap)) / 2;
    const centerY = canvas.height / 2;
    values.forEach((value, index) => {
      const height = 24 + value * canvas.height * 0.46;
      const gradient = ctx.createLinearGradient(0, centerY - height, 0, centerY + height);
      gradient.addColorStop(0, '#5ee7ff');
      gradient.addColorStop(0.5, '#a66cff');
      gradient.addColorStop(1, '#ff5ca8');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.82;
      ctx.fillRect(startX + index * (barWidth + gap), centerY - height / 2, barWidth, height);
    });
    ctx.globalAlpha = 1;
  }

  function drawWaveform(time: number, analyser: AnalyserNode | null) {
    if (analyser) analyser.getByteTimeDomainData(waveformData);
    const drawLine = (offset: number, color: string, blur: number) => {
      ctx.beginPath();
      for (let index = 0; index < 180; index++) {
        const x = (index / 179) * canvas.width;
        const sample = analyser
          ? (waveformData[Math.floor((index * waveformData.length) / 180)] - 128) / 128
          : Math.sin(index * 0.17 + time * 4 + offset) * 0.35 + Math.sin(index * 0.043 - time * 2) * 0.2;
        const envelope = Math.sin((index / 179) * Math.PI);
        const y = canvas.height / 2 + sample * canvas.height * 0.32 * envelope + Math.sin(index * 0.03 + offset) * canvas.height * 0.04;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = blur;
      ctx.stroke();
    };
    drawLine(0, '#48e5ff', 24);
    drawLine(2.2, '#ff4fb8', 30);
    ctx.shadowBlur = 0;
  }

  function drawTunnel(time: number, analyser: AnalyserNode | null) {
    three ??= createStarField();
    const energy = spectrumValues(time, 24, analyser).reduce((sum, value) => sum + value, 0) / 24;
    three.step(time, energy, canvas.width, canvas.height);
    ctx.drawImage(three.canvas, 0, 0, canvas.width, canvas.height);
  }

  function drawVideo(time: number, video: HTMLVideoElement | null) {
    if (video && video.readyState >= 2) {
      const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
      const width = video.videoWidth * scale;
      const height = video.videoHeight * scale;
      ctx.globalAlpha = 0.75;
      ctx.drawImage(video, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    ['#168aad', '#7251b5', '#e0568b'].forEach((color, index) => {
      const x = canvas.width * (0.25 + index * 0.25) + Math.sin(time * 0.45 + index * 2) * 180;
      const y = canvas.height * (0.35 + (index % 2) * 0.3) + Math.cos(time * 0.38 + index) * 110;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 430);
      glow.addColorStop(0, color);
      glow.addColorStop(1, 'rgba(5,6,17,0)');
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    ctx.globalAlpha = 1;
  }

  function drawCredits(time: number, credits: MvCredits) {
    ctx.save();
    ctx.globalAlpha = time > MV_CREDITS_SECONDS - 1 ? MV_CREDITS_SECONDS - time : 1;
    ctx.fillStyle = 'rgba(3,4,12,.62)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,.65)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255,255,255,.58)';
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText(credits.heading, canvas.width / 2, canvas.height * 0.3);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.max(42, Math.min(64, canvas.width * 0.07))}px system-ui, sans-serif`;
    wrapText(credits.title || credits.fallbackTitle, canvas.height * 0.43, canvas.width * 0.82);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,.78)';
    ctx.font = '400 25px system-ui, sans-serif';
    ctx.fillText(credits.details.map(([label, value]) => `${label}  ${value}`).join('    ·    '), canvas.width / 2, canvas.height * 0.6);
    ctx.restore();
  }

  function drawLyrics(time: number, scene: MvScene) {
    const { lyrics } = scene;
    const index = lyricAt(lyrics, time);
    const current = index >= 0 ? lyrics[index].text : scene.idleText;
    const previous = index > 0 ? lyrics[index - 1].text : '';
    const next = lyrics[index + 1]?.text ?? '';
    const transition = index >= 0 ? Math.min(1, Math.max(0, (time - lyrics[index].time) / 0.42)) : 1;
    const eased = 1 - Math.pow(1 - transition, 3);
    const lyricY = { top: 0.18, center: 0.5, bottom: 0.81 }[scene.lyricPosition] * canvas.height;
    const lineGap = Math.max(58, Math.min(canvas.width, canvas.height) * 0.1);
    const currentSize = Math.max(38, Math.min(52, canvas.width * 0.055));

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    if (scene.lyricMode === 'multi') {
      ctx.fillStyle = 'rgba(255,255,255,.38)';
      ctx.font = `${Math.max(21, currentSize * 0.56)}px system-ui, sans-serif`;
      if (previous) ctx.fillText(previous, canvas.width / 2, lyricY - lineGap);
      ctx.globalAlpha = 0.35 + eased * 0.65;
      if (next) ctx.fillText(next, canvas.width / 2, lyricY + lineGap + (1 - eased) * 10);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${currentSize}px system-ui, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,.9)';
    ctx.shadowBlur = 18;
    if (scene.lyricStyle === 'outline') {
      ctx.strokeStyle = 'rgba(0,0,0,.9)';
      ctx.lineWidth = 12;
      ctx.shadowBlur = 0;
    }
    if (scene.lyricStyle === 'neon') {
      ctx.fillStyle = '#baf7ff';
      ctx.shadowColor = '#3ddcff';
      ctx.shadowBlur = 28;
    }
    ctx.globalAlpha = 0.2 + eased * 0.8;
    wrapText(current, lyricY + (1 - eased) * 24, canvas.width * 0.82, scene.lyricStyle === 'outline');
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function draw(time: number, scene: MvScene) {
    const background = ctx.createRadialGradient(
      canvas.width / 2, canvas.height * 0.44, 20,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.72,
    );
    const stops = scene.template in BACKGROUNDS ? BACKGROUNDS[scene.template as keyof typeof BACKGROUNDS] : null;
    if (stops) {
      background.addColorStop(0, stops[0]);
      background.addColorStop(0.55, stops[1]);
      background.addColorStop(1, stops[2]);
    } else {
      background.addColorStop(0, '#242424');
      background.addColorStop(1, '#030303');
    }
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (scene.template === 'vinyl') drawVinyl(time);
    else if (scene.template === 'particles') drawParticles(time);
    else if (scene.template === 'spectrum') drawSpectrum(time, scene.analyser);
    else if (scene.template === 'waveform') drawWaveform(time, scene.analyser);
    else if (scene.template === 'tunnel') drawTunnel(time, scene.analyser);
    else drawVideo(time, scene.video);

    if (scene.credits && time < MV_CREDITS_SECONDS) drawCredits(time, scene.credits);
    else drawLyrics(time, scene);
  }

  return { draw, dispose: () => three?.dispose() };
}

function createStarField() {
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(72, 16 / 9, 1, 1800);
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  for (let index = 0; index < STAR_COUNT; index++) {
    const radius = 25 + Math.random() * 420;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle) * radius;
    positions[index * 3 + 2] = -Math.random() * 1700;
    new THREE.Color().setHSL(0.52 + Math.random() * 0.25, 0.85, 0.7).toArray(colors, index * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({ size: 3.2, vertexColors: true, transparent: true, opacity: 0.9, sizeAttenuation: true });
  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  camera.position.z = 10;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x030518);

  return {
    canvas,
    step(time: number, energy: number, width: number, height: number) {
      const speed = 6 + energy * 24;
      for (let index = 2; index < positions.length; index += 3) {
        positions[index] += speed;
        if (positions[index] > 10) positions[index] = -1700;
      }
      geometry.attributes.position.needsUpdate = true;
      stars.rotation.z = time * 0.035;
      material.size = 2.7 + energy * 4;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    },
    dispose() {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
