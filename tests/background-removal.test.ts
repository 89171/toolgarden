import { describe, expect, it } from 'vitest';
import {
  createImglyBackgroundRemovalProgress,
  isCorruptBiRefNetModelError,
} from '../lib/utils/background-removal';

describe('background removal progress', () => {
  it('keeps resource progress monotonic across model, WASM and module downloads', () => {
    const model = createImglyBackgroundRemovalProgress(
      'fetch:/models/isnet_fp16',
      88_152_708,
      88_152_708
    );
    const wasm = createImglyBackgroundRemovalProgress(
      'fetch:/onnxruntime-web/ort-wasm-simd-threaded.wasm',
      11_819_815,
      11_819_815
    );
    const runtimeModule = createImglyBackgroundRemovalProgress(
      'fetch:/onnxruntime-web/ort-wasm-simd-threaded.mjs',
      25_539,
      25_539
    );

    expect(model.percent).toBe(70);
    expect(wasm.percent).toBe(93);
    expect(runtimeModule.percent).toBe(95);
    expect(runtimeModule.label).toBe('model:compile');
  });

  it('uses the final progress range for inference and encoding', () => {
    expect(createImglyBackgroundRemovalProgress('compute:decode', 0, 4).percent).toBe(95);
    expect(createImglyBackgroundRemovalProgress('compute:inference', 1, 4).percent).toBe(96);
    expect(createImglyBackgroundRemovalProgress('compute:mask', 2, 4).percent).toBe(98);
    expect(createImglyBackgroundRemovalProgress('compute:encode', 4, 4).percent).toBe(100);
  });

  it('recognizes a corrupted BiRefNet ONNX cache error for one-time recovery', () => {
    expect(isCorruptBiRefNetModelError(new Error(
      "Can't create a session. ERROR_MESSAGE: Failed to load model because protobuf parsing failed."
    ))).toBe(true);
    expect(isCorruptBiRefNetModelError(new Error('birefnet_webgpu_unavailable'))).toBe(false);
  });
});
