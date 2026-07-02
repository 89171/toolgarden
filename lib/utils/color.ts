export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
  a: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface CmykColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export type ColorOutcome =
  | { ok: true; rgb: RgbColor }
  | { ok: false; message: string };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const round = (value: number, decimals = 0): number => {
  const p = 10 ** decimals;
  return Math.round(value * p) / p;
};

export function parseColor(input: string): ColorOutcome {
  const value = input.trim();
  if (!value) return { ok: false, message: 'empty' };

  const hexMatch = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { ok: true, rgb: { r, g, b, a } };
  }

  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return { ok: false, message: 'invalid' };
    const r = clamp(parseFloat(parts[0]), 0, 255);
    const g = clamp(parseFloat(parts[1]), 0, 255);
    const b = clamp(parseFloat(parts[2]), 0, 255);
    const a = parts[3] !== undefined ? clamp(parseFloat(parts[3]), 0, 1) : 1;
    if ([r, g, b].some(Number.isNaN)) return { ok: false, message: 'invalid' };
    return { ok: true, rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b), a } };
  }

  const hslMatch = value.match(/^hsla?\(([^)]+)\)$/i);
  if (hslMatch) {
    const parts = hslMatch[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return { ok: false, message: 'invalid' };
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const a = parts[3] !== undefined ? clamp(parseFloat(parts[3]), 0, 1) : 1;
    if ([h, s, l].some(Number.isNaN)) return { ok: false, message: 'invalid' };
    return { ok: true, rgb: { ...hslToRgb(h, s, l), a } };
  }

  return { ok: false, message: 'invalid' };
}

export function rgbToHex(rgb: RgbColor): string {
  const toHex = (v: number) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
  const base = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  if (rgb.a < 1) return `${base}${toHex(rgb.a * 255)}`;
  return base;
}

export function rgbString(rgb: RgbColor): string {
  if (rgb.a < 1) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round(rgb.a, 2)})`;
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function rgbToHsl(rgb: RgbColor): HslColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
    }
  }
  return { h: round(h), s: round(s * 100), l: round(l * 100), a: rgb.a };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hue = ((h % 360) + 360) % 360;
  const sat = clamp(s, 0, 1);
  const light = clamp(l, 0, 1);
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = light - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hue < 60) [rp, gp, bp] = [c, x, 0];
  else if (hue < 120) [rp, gp, bp] = [x, c, 0];
  else if (hue < 180) [rp, gp, bp] = [0, c, x];
  else if (hue < 240) [rp, gp, bp] = [0, x, c];
  else if (hue < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function hslString(hsl: HslColor): string {
  if (hsl.a < 1) return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${round(hsl.a, 2)})`;
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

export function rgbToHsv(rgb: RgbColor): HsvColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
    }
  }
  return { h: round(h), s: round(s * 100), v: round(v * 100), a: rgb.a };
}

export function hsvString(hsv: HsvColor): string {
  return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
}

export function rgbToCmyk(rgb: RgbColor): CmykColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return { c: round(c * 100), m: round(m * 100), y: round(y * 100), k: round(k * 100) };
}

export function cmykString(cmyk: CmykColor): string {
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
}
