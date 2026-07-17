export type OcrLanguage = 'eng' | 'chi_sim' | 'chi_tra' | 'jpn';

export type OcrProgressStage =
  | 'model'
  | 'prepare'
  | 'detect'
  | 'classify'
  | 'recognize'
  | 'merge';

export interface OcrProgress {
  stage: OcrProgressStage;
  percent: number;
  processed?: number;
  total?: number;
}

export interface OcrTextBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrTextBlock {
  text: string;
  confidence: number;
  angle: 0 | 180;
  box: OcrTextBox;
}

export interface OcrSuccess {
  ok: true;
  text: string;
  blocks: OcrTextBlock[];
  imageWidth: number;
  imageHeight: number;
  durationMs: number;
}

export type OcrErrorCode =
  | 'empty_file'
  | 'load_failed'
  | 'worker_unavailable'
  | 'model_load_failed'
  | 'canvas_context'
  | 'recognition_failed'
  | 'no_text_detected';

export type OcrOutcome =
  | OcrSuccess
  | { ok: false; code: OcrErrorCode; detail?: string };

export interface RecognizeImageOcrOptions {
  language: OcrLanguage;
  onProgress?: (progress: OcrProgress) => void;
}
