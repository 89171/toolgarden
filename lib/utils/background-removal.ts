import type {
  ImageBackgroundRemovalModel,
  ImageBackgroundRemovalProgress,
} from './image';

export type ImglyBackgroundRemovalModel = Exclude<
  ImageBackgroundRemovalModel,
  'birefnet-lite'
>;

export const BACKGROUND_REMOVAL_PUBLIC_PATH =
  'https://staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/';

export const BIREFNET_LITE_MODEL_ID = 'studioludens/birefnet-lite-512';
export const BIREFNET_LITE_MODEL_REVISION = '4a3c40c36c94093cc1e724d9ea428b8fa4b57dc7';
export const BIREFNET_LITE_MODEL_URL =
  `https://huggingface.co/${BIREFNET_LITE_MODEL_ID}/resolve/${BIREFNET_LITE_MODEL_REVISION}/onnx/model_fp16.onnx`;

const BACKGROUND_REMOVAL_MODEL_MAP: Record<
  ImglyBackgroundRemovalModel,
  'isnet_fp16' | 'isnet_quint8'
> = {
  medium: 'isnet_fp16',
  small: 'isnet_quint8',
};

export function isImglyBackgroundRemovalModel(
  model: ImageBackgroundRemovalModel
): model is ImglyBackgroundRemovalModel {
  return model !== 'birefnet-lite';
}

export function isCorruptBiRefNetModelError(error: unknown): boolean {
  return error instanceof Error && /protobuf parsing failed/i.test(error.message);
}

export function createImglyBackgroundRemovalConfig(
  model: ImglyBackgroundRemovalModel,
  progress?: (label: string, current: number, total: number) => void
) {
  return {
    publicPath: BACKGROUND_REMOVAL_PUBLIC_PATH,
    model: BACKGROUND_REMOVAL_MODEL_MAP[model],
    output: {
      format: 'image/png',
      quality: 1,
    },
    progress,
  } as const;
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * IMG.LY reports each downloaded resource from 0-100 independently. Convert
 * those resets into one monotonic job progress value and reserve the last 5%
 * for model initialization and inference.
 */
export function createImglyBackgroundRemovalProgress(
  label: string,
  current: number,
  total: number
): ImageBackgroundRemovalProgress {
  const safeTotal = Math.max(1, total);
  const ratio = Math.max(0, Math.min(1, current / safeTotal));

  if (label.startsWith('compute:')) {
    const percent = label.includes('inference')
      ? 96
      : label.includes('mask')
        ? 98
        : label.includes('encode')
          ? current >= total
            ? 100
            : 99
          : 95;

    return {
      stage: 'compute',
      label,
      current,
      total: safeTotal,
      percent,
    };
  }

  const isModel = label.includes('/models/');
  const isWasm = label.endsWith('.wasm');
  const isModule = label.endsWith('.mjs');
  const percent = isModel
    ? ratio * 70
    : isWasm
      ? 70 + ratio * 23
      : isModule
        ? 93 + ratio * 2
        : ratio * 95;
  const normalizedLabel = isModule && ratio >= 1 ? 'model:compile' : label;

  return {
    stage: 'model',
    label: normalizedLabel,
    current,
    total: safeTotal,
    percent: clampProgress(percent),
  };
}

export type BackgroundRemovalWorkerRequest =
  | {
      id: string;
      type: 'preload';
      model: ImglyBackgroundRemovalModel;
    }
  | {
      id: string;
      type: 'remove';
      model: ImglyBackgroundRemovalModel;
      input: Blob;
    };

export type BackgroundRemovalWorkerResponse =
  | {
      id: string;
      type: 'progress';
      progress: ImageBackgroundRemovalProgress;
    }
  | {
      id: string;
      type: 'preloaded';
    }
  | {
      id: string;
      type: 'done';
      data: ArrayBuffer;
    }
  | {
      id: string;
      type: 'error';
      message: string;
    };

export type BiRefNetWorkerRequest =
  | {
      id: string;
      type: 'preload';
    }
  | {
      id: string;
      type: 'remove';
      input: Blob;
    };
