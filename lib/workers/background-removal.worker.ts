import { preload, removeBackground as removeImglyBackground } from '@imgly/background-removal';
import type {
  AutoModel as AutoModelType,
  AutoProcessor as AutoProcessorType,
  RawImage as RawImageType,
} from '@huggingface/transformers';
import {
  BIREFNET_LITE_MODEL_ID,
  BIREFNET_LITE_MODEL_REVISION,
  createImglyBackgroundRemovalConfig,
  createImglyBackgroundRemovalProgress,
  type BackgroundRemovalWorkerRequest,
  type BackgroundRemovalWorkerResponse,
  type BiRefNetWorkerRequest,
  type ImglyBackgroundRemovalModel,
} from '../utils/background-removal';
import type { ImageBackgroundRemovalProgress } from '../utils/image';

type WorkerRequest = BackgroundRemovalWorkerRequest | BiRefNetWorkerRequest;
type TransformersModule = typeof import('@huggingface/transformers');
type BiRefNetModel = Awaited<ReturnType<typeof AutoModelType.from_pretrained>>;
type BiRefNetProcessor = Awaited<ReturnType<typeof AutoProcessorType.from_pretrained>>;

const workerScope = self as unknown as {
  navigator: Navigator;
  postMessage: (message: BackgroundRemovalWorkerResponse, transfer?: Transferable[]) => void;
  addEventListener: (
    type: 'message',
    listener: (event: MessageEvent<WorkerRequest>) => void
  ) => void;
};

const imglyActiveRequestIds: Record<ImglyBackgroundRemovalModel, Set<string>> = {
  medium: new Set(),
  small: new Set(),
};
const biRefNetActiveRequestIds = new Set<string>();
let biRefNetModelPromise: Promise<{
  model: BiRefNetModel;
  processor: BiRefNetProcessor;
  RawImage: typeof RawImageType;
}> | null = null;
let highestBiRefNetModelPercent = 0;

function post(message: BackgroundRemovalWorkerResponse, transfer?: Transferable[]) {
  workerScope.postMessage(message, transfer ?? []);
}

function reportImglyProgress(
  model: ImglyBackgroundRemovalModel,
  label: string,
  current: number,
  total: number
) {
  const progress = createImglyBackgroundRemovalProgress(label, current, total);
  imglyActiveRequestIds[model].forEach((id) => {
    post({ id, type: 'progress', progress });
  });
}

function createBiRefNetProgress(
  stage: ImageBackgroundRemovalProgress['stage'],
  label: string,
  percent: number
): ImageBackgroundRemovalProgress {
  const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent)));
  return {
    stage,
    label,
    current: normalizedPercent,
    total: 100,
    percent: normalizedPercent,
  };
}

function reportBiRefNetProgress(progress: ImageBackgroundRemovalProgress) {
  biRefNetActiveRequestIds.forEach((id) => post({ id, type: 'progress', progress }));
}

async function assertWebGpuFp16Support() {
  const gpu = (workerScope.navigator as Navigator & { gpu?: GPU }).gpu;
  if (!gpu) throw new Error('birefnet_webgpu_unavailable');

  const adapter = await gpu.requestAdapter();
  if (!adapter) throw new Error('birefnet_webgpu_adapter_unavailable');
  if (!adapter.features.has('shader-f16')) throw new Error('birefnet_webgpu_fp16_unavailable');
}

function reportBiRefNetModelDownload(progress: {
  status?: string;
  file?: string;
  progress?: number;
}) {
  const isModelFile = progress.file?.endsWith('.onnx') ?? false;
  if (!isModelFile) return;

  if (progress.status === 'progress' || progress.status === 'progress_total') {
    const nextPercent = 4 + Math.max(0, Math.min(100, progress.progress ?? 0)) * 0.66;
    const roundedPercent = Math.round(nextPercent);
    if (roundedPercent <= Math.round(highestBiRefNetModelPercent)) return;
    highestBiRefNetModelPercent = roundedPercent;
    reportBiRefNetProgress(
      createBiRefNetProgress('model', 'model:birefnet', highestBiRefNetModelPercent)
    );
    return;
  }

  if (progress.status === 'done') {
    highestBiRefNetModelPercent = Math.max(highestBiRefNetModelPercent, 70);
    reportBiRefNetProgress(createBiRefNetProgress('model', 'model:compile', 72));
  }
}

async function getBiRefNetModel(): Promise<{
  model: BiRefNetModel;
  processor: BiRefNetProcessor;
  RawImage: typeof RawImageType;
}> {
  await assertWebGpuFp16Support();

  if (!biRefNetModelPromise) {
    biRefNetModelPromise = (async () => {
      reportBiRefNetProgress(createBiRefNetProgress('model', 'model:prepare', 1));
      const transformers: TransformersModule = await import('@huggingface/transformers');
      const processor = await transformers.AutoProcessor.from_pretrained(BIREFNET_LITE_MODEL_ID, {
        revision: BIREFNET_LITE_MODEL_REVISION,
      });
      reportBiRefNetProgress(createBiRefNetProgress('model', 'model:birefnet', 4));

      const model = await transformers.AutoModel.from_pretrained(BIREFNET_LITE_MODEL_ID, {
        device: 'webgpu',
        dtype: 'fp16',
        revision: BIREFNET_LITE_MODEL_REVISION,
        progress_callback: reportBiRefNetModelDownload,
      });

      reportBiRefNetProgress(createBiRefNetProgress('model', 'model:birefnet-ready', 74));
      return { model, processor, RawImage: transformers.RawImage };
    })().catch((error) => {
      biRefNetModelPromise = null;
      highestBiRefNetModelPercent = 0;
      throw error;
    });
  }

  return biRefNetModelPromise;
}

function isTensorLike(value: unknown): value is {
  data: ArrayLike<number>;
  dims: readonly number[];
} {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { data?: unknown; dims?: unknown };
  return Boolean(candidate.data && Array.isArray(candidate.dims));
}

async function removeBiRefNetBackground(input: Blob): Promise<ArrayBuffer> {
  const { model, processor, RawImage } = await getBiRefNetModel();
  reportBiRefNetProgress(createBiRefNetProgress('compute', 'compute:prepare', 76));

  const rawImage = await RawImage.read(input);
  const { pixel_values: pixelValues } = await processor(rawImage);
  reportBiRefNetProgress(createBiRefNetProgress('compute', 'compute:inference', 80));

  const outputs = await model({ input_image: pixelValues }) as { logits?: unknown };
  const logits = outputs.logits;
  if (!isTensorLike(logits)) throw new Error('birefnet_invalid_output');

  const dims = Array.from(logits.dims);
  const maskHeight = dims.at(-2) ?? 0;
  const maskWidth = dims.at(-1) ?? 0;
  const maskPixelCount = maskWidth * maskHeight;
  if (!maskWidth || !maskHeight || logits.data.length < maskPixelCount) {
    throw new Error('birefnet_invalid_output');
  }

  reportBiRefNetProgress(createBiRefNetProgress('compute', 'compute:mask', 92));
  const maskCanvas = new OffscreenCanvas(maskWidth, maskHeight);
  const maskContext = maskCanvas.getContext('2d');
  if (!maskContext) throw new Error('birefnet_canvas_context');

  const maskImageData = maskContext.createImageData(maskWidth, maskHeight);
  const sourceOffset = logits.data.length - maskPixelCount;
  for (let index = 0; index < maskPixelCount; index += 1) {
    const alpha = Math.max(
      0,
      Math.min(
        255,
        Math.round((1 / (1 + Math.exp(-Number(logits.data[sourceOffset + index])))) * 255)
      )
    );
    const outputIndex = index * 4;
    maskImageData.data[outputIndex] = 255;
    maskImageData.data[outputIndex + 1] = 255;
    maskImageData.data[outputIndex + 2] = 255;
    maskImageData.data[outputIndex + 3] = alpha;
  }
  maskContext.putImageData(maskImageData, 0, 0);

  reportBiRefNetProgress(createBiRefNetProgress('compute', 'compute:encode', 96));
  const outputCanvas = new OffscreenCanvas(rawImage.width, rawImage.height);
  const outputContext = outputCanvas.getContext('2d');
  if (!outputContext) throw new Error('birefnet_canvas_context');

  outputContext.drawImage(rawImage.toCanvas(), 0, 0, rawImage.width, rawImage.height);
  outputContext.globalCompositeOperation = 'destination-in';
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = 'high';
  outputContext.drawImage(maskCanvas, 0, 0, rawImage.width, rawImage.height);
  outputContext.globalCompositeOperation = 'source-over';

  const blob = await outputCanvas.convertToBlob({ type: 'image/png' });
  reportBiRefNetProgress(createBiRefNetProgress('compute', 'compute:done', 100));
  return blob.arrayBuffer();
}

async function handleImglyRequest(request: BackgroundRemovalWorkerRequest) {
  imglyActiveRequestIds[request.model].add(request.id);
  try {
    const config = createImglyBackgroundRemovalConfig(
      request.model,
      (label, current, total) => reportImglyProgress(request.model, label, current, total)
    );

    if (request.type === 'preload') {
      await preload(config);
      post({ id: request.id, type: 'preloaded' });
      return;
    }

    const output = await removeImglyBackground(request.input, config);
    const data = await output.arrayBuffer();
    post({ id: request.id, type: 'done', data }, [data]);
  } finally {
    imglyActiveRequestIds[request.model].delete(request.id);
  }
}

async function handleBiRefNetRequest(request: BiRefNetWorkerRequest) {
  biRefNetActiveRequestIds.add(request.id);
  try {
    if (request.type === 'preload') {
      await getBiRefNetModel();
      post({ id: request.id, type: 'preloaded' });
      return;
    }

    const data = await removeBiRefNetBackground(request.input);
    post({ id: request.id, type: 'done', data }, [data]);
  } finally {
    biRefNetActiveRequestIds.delete(request.id);
  }
}

workerScope.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  const operation = 'model' in request
    ? handleImglyRequest(request)
    : handleBiRefNetRequest(request);

  void operation.catch((error) => {
    post({
      id: request.id,
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  });
});
