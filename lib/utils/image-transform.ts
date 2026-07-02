export interface TransformState {
  angle: number;
  flipX: boolean;
  flipY: boolean;
}

export function drawTransformed(
  source: HTMLImageElement | HTMLCanvasElement,
  state: TransformState
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const rad = (state.angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const w = source instanceof HTMLImageElement ? source.naturalWidth : source.width;
  const h = source instanceof HTMLImageElement ? source.naturalHeight : source.height;
  const newW = Math.round(w * cos + h * sin);
  const newH = Math.round(w * sin + h * cos);
  canvas.width = newW;
  canvas.height = newH;

  ctx.translate(newW / 2, newH / 2);
  ctx.rotate(rad);
  ctx.scale(state.flipX ? -1 : 1, state.flipY ? -1 : 1);
  ctx.drawImage(source, -w / 2, -h / 2, w, h);
  return canvas;
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('load_failed'));
    };
    img.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('export_failed'));
      },
      type,
      quality
    );
  });
}
