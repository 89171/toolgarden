import * as ort from 'onnxruntime-web/wasm';
import type {
  OcrLanguage,
  OcrOutcome,
  OcrProgress,
  OcrProgressStage,
  OcrTextBlock,
  OcrTextBox,
} from '../utils/ocr';

interface OcrWorkerFile {
  data: ArrayBuffer;
  type: string;
  name: string;
  size: number;
}

interface OcrWorkerRequest {
  id: string;
  type: 'recognize';
  file: OcrWorkerFile;
  language: OcrLanguage;
}

interface LoadedImageCanvas {
  canvas: OffscreenCanvas;
  width: number;
  height: number;
}

interface OcrSessions {
  det: ort.InferenceSession;
  cls: ort.InferenceSession;
  rec: ort.InferenceSession;
  characters: string[];
  preferredClassMasks: Record<OcrLanguage, Uint8Array>;
}

interface DetectionBox extends OcrTextBox {
  score: number;
}

interface RecognitionResult {
  text: string;
  confidence: number;
}

interface OcrWorkerProfile {
  detectionMaxSide: number;
  detectionThreshold: number;
  detectionBoxThreshold: number;
  maxTextBoxes: number;
  recognitionMaxWidth: number;
}

type NormalizeMode = 'imagenet' | 'paddle';
type CanvasFitMode = 'stretch' | 'contain-left';

const workerScope = self as unknown as {
  location: Location;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<OcrWorkerRequest>) => void
  ) => void;
};

const MODEL_ROOT = `${workerScope.location.origin}/models/ocr`;
const OCR_MODEL_URLS = {
  det: `${MODEL_ROOT}/det-mobile.onnx`,
  cls: `${MODEL_ROOT}/cls.onnx`,
  rec: `${MODEL_ROOT}/rec-unified-mobile.onnx`,
  dict: `${MODEL_ROOT}/rec-unified-dict.txt`,
};

const ONNX_WASM_PUBLIC_PATH = `${workerScope.location.origin}/models/onnxruntime-web/`;
const MAX_IMAGE_PIXELS = 40_000_000;
const DETECTION_DILATE_RADIUS = 2;
const MIN_DETECTION_PIXELS = 20;
const MIN_TEXT_BOX_SIDE = 5;
const CLS_WIDTH = 192;
const CLS_HEIGHT = 48;
const REC_HEIGHT = 48;
const CONTRAST_PERCENTILE_LOW = 0.02;
const CONTRAST_PERCENTILE_HIGH = 0.98;
const LANGUAGE_BIAS_MIN_RATIO = 0.72;
const OCR_LANGUAGES: OcrLanguage[] = ['eng', 'chi_sim', 'chi_tra', 'jpn'];
const OCR_PROFILE: OcrWorkerProfile = {
  detectionMaxSide: 960,
  detectionThreshold: 0.3,
  detectionBoxThreshold: 0.45,
  maxTextBoxes: 80,
  recognitionMaxWidth: 960,
};

let sessionsPromise: Promise<OcrSessions> | null = null;

function postProgress(id: string, stage: OcrProgressStage, percent: number, processed?: number, total?: number) {
  const progress: OcrProgress = {
    stage,
    percent: clampInteger(percent, 0, 100),
    processed,
    total,
  };

  workerScope.postMessage({ id, type: 'progress', progress });
}

function postResult(id: string, result: OcrOutcome) {
  workerScope.postMessage({ id, type: 'result', result });
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function ceilToMultiple(value: number, multiple: number): number {
  return Math.max(multiple, Math.ceil(value / multiple) * multiple);
}

function normalizeInputByte(value: number, channel: number, mode: NormalizeMode): number {
  const scaled = value / 255;

  if (mode === 'imagenet') {
    const mean = channel === 0 ? 0.485 : channel === 1 ? 0.456 : 0.406;
    const std = channel === 0 ? 0.229 : channel === 1 ? 0.224 : 0.225;
    return (scaled - mean) / std;
  }

  return (scaled - 0.5) / 0.5;
}

function getCharacterCodePoint(character: string): number {
  return character.codePointAt(0) ?? 0;
}

function isAsciiLetterOrDigit(character: string): boolean {
  const codePoint = getCharacterCodePoint(character);
  return (
    (codePoint >= 48 && codePoint <= 57) ||
    (codePoint >= 65 && codePoint <= 90) ||
    (codePoint >= 97 && codePoint <= 122)
  );
}

function isAsciiPunctuation(character: string): boolean {
  const codePoint = getCharacterCodePoint(character);
  return (
    (codePoint >= 32 && codePoint <= 47) ||
    (codePoint >= 58 && codePoint <= 64) ||
    (codePoint >= 91 && codePoint <= 96) ||
    (codePoint >= 123 && codePoint <= 126)
  );
}

function isCjkCharacter(character: string): boolean {
  const codePoint = getCharacterCodePoint(character);
  return (
    (codePoint >= 0x3400 && codePoint <= 0x4dbf) ||
    (codePoint >= 0x4e00 && codePoint <= 0x9fff) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff)
  );
}

function isJapaneseKana(character: string): boolean {
  const codePoint = getCharacterCodePoint(character);
  return (
    (codePoint >= 0x3040 && codePoint <= 0x309f) ||
    (codePoint >= 0x30a0 && codePoint <= 0x30ff) ||
    (codePoint >= 0xff66 && codePoint <= 0xff9f)
  );
}

function isFullWidthPunctuation(character: string): boolean {
  const codePoint = getCharacterCodePoint(character);
  return (
    (codePoint >= 0x3000 && codePoint <= 0x303f) ||
    (codePoint >= 0xff00 && codePoint <= 0xff65)
  );
}

function isLanguagePreferredCharacter(language: OcrLanguage, character: string): boolean {
  if (!character || character === '#') return false;
  if (isAsciiPunctuation(character) || isFullWidthPunctuation(character)) return true;

  if (language === 'eng') {
    return isAsciiLetterOrDigit(character);
  }

  if (language === 'jpn') {
    return isCjkCharacter(character) || isJapaneseKana(character) || isAsciiLetterOrDigit(character);
  }

  return isCjkCharacter(character) || isAsciiLetterOrDigit(character);
}

function getRecognitionCharacter(characters: string[], classIndex: number): string {
  return characters[classIndex] ?? characters[classIndex - 1] ?? '';
}

function createPreferredClassMasks(characters: string[]): Record<OcrLanguage, Uint8Array> {
  const maskLength = characters.length + 1;
  return OCR_LANGUAGES.reduce((masks, language) => {
    const mask = new Uint8Array(maskLength);

    for (let classIndex = 1; classIndex < maskLength; classIndex += 1) {
      const character = getRecognitionCharacter(characters, classIndex);
      mask[classIndex] = isLanguagePreferredCharacter(language, character) ? 1 : 0;
    }

    return { ...masks, [language]: mask };
  }, {} as Record<OcrLanguage, Uint8Array>);
}

function findContrastBounds(pixels: Uint8ClampedArray): { low: number; high: number } {
  const histogram = new Uint32Array(256);
  const pixelCount = pixels.length / 4;

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    const gray = clampInteger(
      pixels[sourceIndex] * 0.299 + pixels[sourceIndex + 1] * 0.587 + pixels[sourceIndex + 2] * 0.114,
      0,
      255
    );
    histogram[gray] += 1;
  }

  const lowTarget = pixelCount * CONTRAST_PERCENTILE_LOW;
  const highTarget = pixelCount * CONTRAST_PERCENTILE_HIGH;
  let cumulative = 0;
  let low = 0;
  let high = 255;

  for (let value = 0; value < histogram.length; value += 1) {
    cumulative += histogram[value];
    if (cumulative >= lowTarget) {
      low = value;
      break;
    }
  }

  cumulative = 0;
  for (let value = 0; value < histogram.length; value += 1) {
    cumulative += histogram[value];
    if (cumulative >= highTarget) {
      high = value;
      break;
    }
  }

  return { low, high };
}

function getTextInputByte(
  pixels: Uint8ClampedArray,
  sourceIndex: number,
  channel: number,
  mode: NormalizeMode,
  contrastBounds: { low: number; high: number } | null
): number {
  if (mode !== 'paddle' || !contrastBounds || contrastBounds.high - contrastBounds.low < 24) {
    return pixels[sourceIndex + channel];
  }

  const gray = pixels[sourceIndex] * 0.299 + pixels[sourceIndex + 1] * 0.587 + pixels[sourceIndex + 2] * 0.114;
  return clampInteger(((gray - contrastBounds.low) / (contrastBounds.high - contrastBounds.low)) * 255, 0, 255);
}

function createPreparedCanvas(
  source: OffscreenCanvas,
  width: number,
  height: number,
  fit: CanvasFitMode
): OffscreenCanvas | null {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  if (fit === 'contain-left') {
    const scale = Math.min(width / source.width, height / source.height);
    const drawWidth = Math.max(1, Math.round(source.width * scale));
    const drawHeight = Math.max(1, Math.round(source.height * scale));
    context.drawImage(source, 0, 0, drawWidth, drawHeight);
  } else {
    context.drawImage(source, 0, 0, width, height);
  }

  return canvas;
}

function canvasToTensor(
  source: OffscreenCanvas,
  width: number,
  height: number,
  mode: NormalizeMode,
  fit: CanvasFitMode = 'stretch'
): ort.Tensor | null {
  const canvas = createPreparedCanvas(source, width, height, fit);
  const context = canvas?.getContext('2d', { willReadFrequently: true });
  if (!canvas || !context) return null;

  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const planeSize = width * height;
  const tensorData = new Float32Array(planeSize * 3);
  const contrastBounds = mode === 'paddle' ? findContrastBounds(pixels) : null;

  for (let pixelIndex = 0; pixelIndex < planeSize; pixelIndex += 1) {
    const sourceIndex = pixelIndex * 4;
    tensorData[pixelIndex] = normalizeInputByte(
      getTextInputByte(pixels, sourceIndex, 0, mode, contrastBounds),
      0,
      mode
    );
    tensorData[planeSize + pixelIndex] = normalizeInputByte(
      getTextInputByte(pixels, sourceIndex, 1, mode, contrastBounds),
      1,
      mode
    );
    tensorData[planeSize * 2 + pixelIndex] = normalizeInputByte(
      getTextInputByte(pixels, sourceIndex, 2, mode, contrastBounds),
      2,
      mode
    );
  }

  return new ort.Tensor('float32', tensorData, [1, 3, height, width]);
}

async function loadOcrSessions(id: string): Promise<OcrSessions> {
  postProgress(id, 'model', 8);

  if (!sessionsPromise) {
    sessionsPromise = (async () => {
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.proxy = false;
      ort.env.logLevel = 'fatal';
      ort.env.wasm.wasmPaths = {
        wasm: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.wasm`,
        mjs: `${ONNX_WASM_PUBLIC_PATH}ort-wasm-simd-threaded.mjs`,
      };

      const sessionOptions: ort.InferenceSession.SessionOptions = {
        executionProviders: ['wasm'],
        executionMode: 'sequential',
        graphOptimizationLevel: 'all',
        logSeverityLevel: 3,
      };

      const [det, cls, rec, dictResponse] = await Promise.all([
        ort.InferenceSession.create(OCR_MODEL_URLS.det, sessionOptions),
        ort.InferenceSession.create(OCR_MODEL_URLS.cls, sessionOptions),
        ort.InferenceSession.create(OCR_MODEL_URLS.rec, sessionOptions),
        fetch(OCR_MODEL_URLS.dict),
      ]);

      if (!dictResponse.ok) {
        throw new Error(`Failed to load OCR dictionary: ${dictResponse.status}`);
      }

      const dictionary = await dictResponse.text();
      const characters = dictionary.split(/\r?\n/).filter((line) => line.length > 0);
      const preferredClassMasks = createPreferredClassMasks(characters);

      return { det, cls, rec, characters, preferredClassMasks };
    })().catch((error) => {
      sessionsPromise = null;
      throw error;
    });
  }

  const sessions = await sessionsPromise;
  postProgress(id, 'model', 34);
  return sessions;
}

async function loadImageCanvas(file: OcrWorkerFile): Promise<LoadedImageCanvas | null> {
  const blob = new Blob([file.data], { type: file.type || 'image/png' });
  const bitmap = await createImageBitmap(blob);

  if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_IMAGE_PIXELS) {
    bitmap.close();
    return null;
  }

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    bitmap.close();
    return null;
  }

  context.drawImage(bitmap, 0, 0);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();

  return { canvas, width, height };
}

function getDetectionInputSize(
  width: number,
  height: number,
  profile: OcrWorkerProfile
): { width: number; height: number } {
  const scale = Math.min(1, profile.detectionMaxSide / Math.max(width, height));
  return {
    width: ceilToMultiple(Math.max(32, Math.round(width * scale)), 32),
    height: ceilToMultiple(Math.max(32, Math.round(height * scale)), 32),
  };
}

function dilateBinaryMask(binary: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const dilated = new Uint8Array(binary.length);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      if (!binary[index]) continue;

      const minY = Math.max(0, y - radius);
      const maxY = Math.min(height - 1, y + radius);
      const minX = Math.max(0, x - radius);
      const maxX = Math.min(width - 1, x + radius);

      for (let dy = minY; dy <= maxY; dy += 1) {
        const row = dy * width;
        for (let dx = minX; dx <= maxX; dx += 1) {
          dilated[row + dx] = 1;
        }
      }
    }
  }

  return dilated;
}

function expandBox(box: DetectionBox, imageWidth: number, imageHeight: number): DetectionBox {
  const horizontalPad = clampInteger(Math.max(4, box.height * 0.22), 4, 24);
  const verticalPad = clampInteger(Math.max(2, box.height * 0.12), 2, 14);
  const x = clampNumber(box.x - horizontalPad, 0, imageWidth - 1);
  const y = clampNumber(box.y - verticalPad, 0, imageHeight - 1);
  const maxX = clampNumber(box.x + box.width + horizontalPad, 1, imageWidth);
  const maxY = clampNumber(box.y + box.height + verticalPad, 1, imageHeight);

  return {
    ...box,
    x,
    y,
    width: Math.max(1, maxX - x),
    height: Math.max(1, maxY - y),
  };
}

function findDetectionBoxes(
  probabilities: Float32Array,
  mapWidth: number,
  mapHeight: number,
  imageWidth: number,
  imageHeight: number,
  profile: OcrWorkerProfile
): DetectionBox[] {
  const pixelCount = mapWidth * mapHeight;
  const binary = new Uint8Array(pixelCount);

  for (let index = 0; index < pixelCount; index += 1) {
    binary[index] = probabilities[index] >= profile.detectionThreshold ? 1 : 0;
  }

  const mask = dilateBinaryMask(binary, mapWidth, mapHeight, DETECTION_DILATE_RADIUS);
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  const boxes: DetectionBox[] = [];
  const scaleX = imageWidth / mapWidth;
  const scaleY = imageHeight / mapHeight;

  for (let start = 0; start < pixelCount; start += 1) {
    if (!mask[start] || visited[start]) continue;

    let head = 0;
    let tail = 0;
    let count = 0;
    let scoreSum = 0;
    let minX = mapWidth;
    let minY = mapHeight;
    let maxX = 0;
    let maxY = 0;

    queue[tail] = start;
    tail += 1;
    visited[start] = 1;

    while (head < tail) {
      const index = queue[head];
      head += 1;
      const x = index % mapWidth;
      const y = Math.floor(index / mapWidth);
      count += 1;
      scoreSum += probabilities[index] ?? 0;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

      const left = x > 0 ? index - 1 : -1;
      const right = x < mapWidth - 1 ? index + 1 : -1;
      const up = y > 0 ? index - mapWidth : -1;
      const down = y < mapHeight - 1 ? index + mapWidth : -1;
      const neighbors = [left, right, up, down];

      for (const neighbor of neighbors) {
        if (neighbor < 0 || visited[neighbor] || !mask[neighbor]) continue;
        visited[neighbor] = 1;
        queue[tail] = neighbor;
        tail += 1;
      }
    }

    const score = scoreSum / Math.max(1, count);
    const boxWidth = maxX - minX + 1;
    const boxHeight = maxY - minY + 1;

    if (
      count < MIN_DETECTION_PIXELS ||
      score < profile.detectionBoxThreshold ||
      boxWidth < MIN_TEXT_BOX_SIDE ||
      boxHeight < MIN_TEXT_BOX_SIDE
    ) {
      continue;
    }

    boxes.push(expandBox({
      x: minX * scaleX,
      y: minY * scaleY,
      width: boxWidth * scaleX,
      height: boxHeight * scaleY,
      score,
    }, imageWidth, imageHeight));
  }

  return boxes;
}

function verticalOverlap(a: OcrTextBox, b: OcrTextBox): number {
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return Math.max(0, bottom - top);
}

function shouldMergeBoxes(a: DetectionBox, b: DetectionBox): boolean {
  const overlap = verticalOverlap(a, b);
  const smallerHeight = Math.max(1, Math.min(a.height, b.height));
  const overlapRatio = overlap / smallerHeight;
  const gap = Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width);
  const heightRatio = Math.max(a.height, b.height) / Math.max(1, smallerHeight);

  return (
    overlapRatio >= 0.45 &&
    heightRatio <= 2.4 &&
    gap <= Math.max(24, smallerHeight * 2.2)
  );
}

function mergeTwoBoxes(a: DetectionBox, b: DetectionBox): DetectionBox {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);

  return {
    x,
    y,
    width: maxX - x,
    height: maxY - y,
    score: Math.max(a.score, b.score),
  };
}

function mergeLineBoxes(boxes: DetectionBox[], profile: OcrWorkerProfile): DetectionBox[] {
  let merged = [...boxes].sort((a, b) => a.y - b.y || a.x - b.x);
  let changed = true;

  while (changed) {
    changed = false;
    const next: DetectionBox[] = [];
    const used = new Set<number>();

    for (let index = 0; index < merged.length; index += 1) {
      if (used.has(index)) continue;
      let current = merged[index];

      for (let candidateIndex = index + 1; candidateIndex < merged.length; candidateIndex += 1) {
        if (used.has(candidateIndex)) continue;
        const candidate = merged[candidateIndex];
        if (!shouldMergeBoxes(current, candidate)) continue;

        current = mergeTwoBoxes(current, candidate);
        used.add(candidateIndex);
        changed = true;
      }

      next.push(current);
    }

    merged = next.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  return merged.slice(0, profile.maxTextBoxes);
}

function sortBoxesForReading(boxes: DetectionBox[]): DetectionBox[] {
  const sorted = [...boxes].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: DetectionBox[][] = [];

  for (const box of sorted) {
    const centerY = box.y + box.height / 2;
    const row = rows.find((candidate) => {
      const averageCenter = candidate.reduce((sum, item) => sum + item.y + item.height / 2, 0) / candidate.length;
      const averageHeight = candidate.reduce((sum, item) => sum + item.height, 0) / candidate.length;
      return Math.abs(centerY - averageCenter) <= Math.max(12, averageHeight * 0.6);
    });

    if (row) {
      row.push(box);
    } else {
      rows.push([box]);
    }
  }

  return rows
    .map((row) => row.sort((a, b) => a.x - b.x))
    .sort((a, b) => {
      const aY = a.reduce((sum, item) => sum + item.y, 0) / a.length;
      const bY = b.reduce((sum, item) => sum + item.y, 0) / b.length;
      return aY - bY;
    })
    .flat();
}

async function detectTextBoxes(
  sessions: OcrSessions,
  source: LoadedImageCanvas,
  profile: OcrWorkerProfile
): Promise<DetectionBox[] | null> {
  const inputSize = getDetectionInputSize(source.width, source.height, profile);
  const tensor = canvasToTensor(source.canvas, inputSize.width, inputSize.height, 'imagenet');
  if (!tensor) return null;

  const result = await sessions.det.run({ [sessions.det.inputNames[0]]: tensor });
  const outputName = sessions.det.outputNames[0] ?? Object.keys(result)[0];
  const output = outputName ? result[outputName] : undefined;

  if (!output || !(output.data instanceof Float32Array) || output.dims.length < 4) {
    throw new Error('Unexpected detection model output.');
  }

  const mapHeight = Number(output.dims[2]);
  const mapWidth = Number(output.dims[3]);
  const boxes = findDetectionBoxes(output.data, mapWidth, mapHeight, source.width, source.height, profile);

  return sortBoxesForReading(mergeLineBoxes(boxes, profile));
}

function cropCanvas(source: OffscreenCanvas, box: OcrTextBox): OffscreenCanvas | null {
  const width = clampInteger(box.width, 1, source.width);
  const height = clampInteger(box.height, 1, source.height);
  const x = clampInteger(box.x, 0, Math.max(0, source.width - width));
  const y = clampInteger(box.y, 0, Math.max(0, source.height - height));
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(source, x, y, width, height, 0, 0, width, height);
  return canvas;
}

function rotateCanvas180(source: OffscreenCanvas): OffscreenCanvas | null {
  const canvas = new OffscreenCanvas(source.width, source.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.translate(source.width, source.height);
  context.rotate(Math.PI);
  context.drawImage(source, 0, 0);
  return canvas;
}

async function classifyTextOrientation(
  sessions: OcrSessions,
  crop: OffscreenCanvas
): Promise<{ canvas: OffscreenCanvas; angle: 0 | 180 }> {
  const tensor = canvasToTensor(crop, CLS_WIDTH, CLS_HEIGHT, 'paddle');
  if (!tensor) return { canvas: crop, angle: 0 };

  const result = await sessions.cls.run({ [sessions.cls.inputNames[0]]: tensor });
  const outputName = sessions.cls.outputNames[0] ?? Object.keys(result)[0];
  const output = outputName ? result[outputName] : undefined;

  if (!output || !(output.data instanceof Float32Array) || output.data.length < 2) {
    return { canvas: crop, angle: 0 };
  }

  const shouldRotate = output.data[1] > output.data[0] && output.data[1] >= 0.65;
  if (!shouldRotate) return { canvas: crop, angle: 0 };

  const rotated = rotateCanvas180(crop);
  return {
    canvas: rotated ?? crop,
    angle: rotated ? 180 : 0,
  };
}

function getRecognitionWidth(crop: OffscreenCanvas, profile: OcrWorkerProfile): number {
  const ratio = crop.width / Math.max(1, crop.height);
  return ceilToMultiple(clampInteger(REC_HEIGHT * ratio, REC_HEIGHT, profile.recognitionMaxWidth), 32);
}

function selectRecognitionClass(
  data: Float32Array,
  offset: number,
  classCount: number,
  preferredClassMask: Uint8Array
): { index: number; score: number } {
  let bestIndex = 0;
  let bestScore = data[offset] ?? 0;
  let preferredIndex = 0;
  let preferredScore = -Infinity;

  for (let classIndex = 1; classIndex < classCount; classIndex += 1) {
    const score = data[offset + classIndex] ?? 0;

    if (score > bestScore) {
      bestIndex = classIndex;
      bestScore = score;
    }

    if (preferredClassMask[classIndex] && score > preferredScore) {
      preferredIndex = classIndex;
      preferredScore = score;
    }
  }

  if (
    bestIndex !== 0 &&
    !preferredClassMask[bestIndex] &&
    preferredIndex !== 0 &&
    preferredScore >= bestScore * LANGUAGE_BIAS_MIN_RATIO
  ) {
    return { index: preferredIndex, score: preferredScore };
  }

  return { index: bestIndex, score: bestScore };
}

function decodeRecognitionOutput(
  output: ort.Tensor,
  characters: string[],
  preferredClassMask: Uint8Array
): RecognitionResult {
  if (!(output.data instanceof Float32Array) || output.dims.length < 3) {
    return { text: '', confidence: 0 };
  }

  const [, steps, classCount] = output.dims.map(Number);
  const data = output.data;
  let previousIndex = -1;
  let text = '';
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (let step = 0; step < steps; step += 1) {
    const offset = step * classCount;
    const { index: bestIndex, score: bestScore } = selectRecognitionClass(
      data,
      offset,
      classCount,
      preferredClassMask
    );

    if (bestIndex !== 0 && bestIndex !== previousIndex) {
      const character = getRecognitionCharacter(characters, bestIndex);
      if (character && character !== '#') {
        text += character;
        confidenceSum += bestScore;
        confidenceCount += 1;
      }
    }

    previousIndex = bestIndex;
  }

  return {
    text: text.trim(),
    confidence: confidenceCount > 0 ? confidenceSum / confidenceCount : 0,
  };
}

async function recognizeTextCrop(
  sessions: OcrSessions,
  crop: OffscreenCanvas,
  profile: OcrWorkerProfile,
  language: OcrLanguage
): Promise<RecognitionResult> {
  const width = getRecognitionWidth(crop, profile);
  const tensor = canvasToTensor(crop, width, REC_HEIGHT, 'paddle', 'contain-left');
  if (!tensor) return { text: '', confidence: 0 };

  const result = await sessions.rec.run({ [sessions.rec.inputNames[0]]: tensor });
  const outputName = sessions.rec.outputNames[0] ?? Object.keys(result)[0];
  const output = outputName ? result[outputName] : undefined;

  if (!output) return { text: '', confidence: 0 };
  return decodeRecognitionOutput(output, sessions.characters, sessions.preferredClassMasks[language]);
}

function shouldInsertSpace(left: string, right: string, language: OcrLanguage): boolean {
  if (!left || !right) return false;
  if (language === 'eng') return true;

  const leftLast = [...left].at(-1) ?? '';
  const rightFirst = [...right][0] ?? '';
  return isAsciiLetterOrDigit(leftLast) && isAsciiLetterOrDigit(rightFirst);
}

function joinTextRow(row: OcrTextBlock[], language: OcrLanguage): string {
  const sorted = row.sort((a, b) => a.box.x - b.box.x);

  return sorted.reduce((line, block) => {
    if (!line) return block.text;
    return `${line}${shouldInsertSpace(line, block.text, language) ? ' ' : ''}${block.text}`;
  }, '');
}

function mergeRecognizedBlocks(blocks: OcrTextBlock[], language: OcrLanguage): string {
  if (!blocks.length) return '';

  const rows: OcrTextBlock[][] = [];

  for (const block of blocks) {
    const centerY = block.box.y + block.box.height / 2;
    const row = rows.find((candidate) => {
      const averageCenter = candidate.reduce((sum, item) => sum + item.box.y + item.box.height / 2, 0) / candidate.length;
      const averageHeight = candidate.reduce((sum, item) => sum + item.box.height, 0) / candidate.length;
      return Math.abs(centerY - averageCenter) <= Math.max(12, averageHeight * 0.6);
    });

    if (row) {
      row.push(block);
    } else {
      rows.push([block]);
    }
  }

  return rows
    .map((row) => joinTextRow(row, language))
    .join('\n')
    .trim();
}

async function runAccurateOcr(request: OcrWorkerRequest): Promise<OcrOutcome> {
  const startedAt = performance.now();
  const profile = OCR_PROFILE;
  const sessions = await loadOcrSessions(request.id);
  postProgress(request.id, 'prepare', 38);

  const image = await loadImageCanvas(request.file);
  if (!image) return { ok: false, code: 'load_failed' };

  postProgress(request.id, 'detect', 44);
  const detectedBoxes = await detectTextBoxes(sessions, image, profile);
  if (!detectedBoxes) return { ok: false, code: 'canvas_context' };
  if (!detectedBoxes.length) return { ok: false, code: 'no_text_detected' };

  const blocks: OcrTextBlock[] = [];
  const total = detectedBoxes.length;

  for (let index = 0; index < total; index += 1) {
    const box = detectedBoxes[index];
    const crop = cropCanvas(image.canvas, box);
    if (!crop) continue;

    postProgress(request.id, 'classify', 48 + (index / total) * 12, index, total);
    const oriented = await classifyTextOrientation(sessions, crop);
    postProgress(request.id, 'recognize', 60 + (index / total) * 34, index, total);
    const recognized = await recognizeTextCrop(sessions, oriented.canvas, profile, request.language);

    if (!recognized.text) continue;

    blocks.push({
      text: recognized.text,
      confidence: recognized.confidence,
      angle: oriented.angle,
      box: {
        x: Math.round(box.x),
        y: Math.round(box.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
      },
    });
  }

  postProgress(request.id, 'merge', 98, total, total);
  const text = mergeRecognizedBlocks(blocks, request.language);

  if (!text) return { ok: false, code: 'no_text_detected' };

  return {
    ok: true,
    text,
    blocks,
    imageWidth: image.width,
    imageHeight: image.height,
    durationMs: Math.round(performance.now() - startedAt),
  };
}

workerScope.addEventListener('message', (event: MessageEvent<OcrWorkerRequest>) => {
  const request = event.data;
  if (request.type !== 'recognize') return;

  void runAccurateOcr(request)
    .then((result) => {
      postProgress(request.id, 'merge', 100);
      postResult(request.id, result);
    })
    .catch((error) => {
      postResult(request.id, {
        ok: false,
        code: /model|fetch|session/i.test(error instanceof Error ? error.message : '')
          ? 'model_load_failed'
          : 'recognition_failed',
        detail: error instanceof Error ? error.message : undefined,
      });
    });
});
