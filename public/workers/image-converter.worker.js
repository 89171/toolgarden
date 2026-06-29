const ERROR = {
  CONVERSION_FAILED: 'conversion_failed',
  CANVAS_CONTEXT: 'canvas_context',
  LOAD_FAILED: 'load_failed',
  TOO_MANY_PIXELS: 'too_many_pixels',
  UNSUPPORTED_OUTPUT: 'unsupported_output',
  WORKER_UNSUPPORTED: 'worker_unsupported',
};

const TARGETS = {
  jpg: {
    format: 'jpg',
    label: 'JPG',
    mimeType: 'image/jpeg',
    extension: 'jpg',
    supportsQuality: true,
  },
  png: {
    format: 'png',
    label: 'PNG',
    mimeType: 'image/png',
    extension: 'png',
    supportsQuality: false,
  },
  webp: {
    format: 'webp',
    label: 'WebP',
    mimeType: 'image/webp',
    extension: 'webp',
    supportsQuality: true,
  },
  avif: {
    format: 'avif',
    label: 'AVIF',
    mimeType: 'image/avif',
    extension: 'avif',
    supportsQuality: true,
  },
};

const JPEG_COMPRESSION_QUALITIES = [0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];
const WEBP_COMPRESSION_QUALITIES = [0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68];
const SAMPLE_MAX_SIDE = 160;
const VISIBLE_DIFF_THRESHOLD = {
  meanRgb: 2.4,
  meanAlpha: 1.1,
  maxChannel: 52,
};

function createOutputFilename(filename, extension) {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}.${extension}`;
}

function createCompressedFilename(filename, extension) {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}-compressed.${extension}`;
}

function calculateSavingsRatio(originalSize, outputSize) {
  if (originalSize <= 0) return 0;
  return Math.max(0, (originalSize - outputSize) / originalSize);
}

function postError(id, code, detail) {
  self.postMessage({
    id,
    ok: false,
    code,
    detail,
  });
}

function getSampleSize(width, height) {
  const maxSide = Math.max(width, height);
  if (maxSide <= SAMPLE_MAX_SIDE) return { width, height };

  const scale = SAMPLE_MAX_SIDE / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function getCanvasSample(canvas) {
  const sample = getSampleSize(canvas.width, canvas.height);
  const sampleCanvas = new OffscreenCanvas(sample.width, sample.height);
  const context = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(canvas, 0, 0, sample.width, sample.height);
  return context.getImageData(0, 0, sample.width, sample.height);
}

function sampleHasAlpha(sample) {
  const { data } = sample;
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] < 250) return true;
  }

  return false;
}

function getCompressionCandidates(sourceType, outputMode) {
  const jpg = { ...TARGETS.jpg, qualities: JPEG_COMPRESSION_QUALITIES };
  const png = { ...TARGETS.png, qualities: [undefined] };
  const webp = { ...TARGETS.webp, qualities: WEBP_COMPRESSION_QUALITIES };

  if (outputMode === 'webp') return [webp];
  if (sourceType === 'image/jpeg') return [jpg];
  if (sourceType === 'image/png') return [png];
  if (sourceType === 'image/webp') return [webp];
  return [];
}

async function compareBlobToSample(blob, sourceSample) {
  const bitmap = await createImageBitmap(blob);
  const sampleCanvas = new OffscreenCanvas(sourceSample.width, sourceSample.height);
  const context = sampleCanvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    bitmap.close();
    throw new Error('Canvas context failed');
  }

  context.drawImage(bitmap, 0, 0, sourceSample.width, sourceSample.height);
  bitmap.close();

  const candidateSample = context.getImageData(0, 0, sourceSample.width, sourceSample.height);
  const source = sourceSample.data;
  const output = candidateSample.data;
  let rgbDiff = 0;
  let alphaDiff = 0;
  let maxChannel = 0;
  const pixelCount = sourceSample.width * sourceSample.height;

  for (let index = 0; index < source.length; index += 4) {
    const red = Math.abs(source[index] - output[index]);
    const green = Math.abs(source[index + 1] - output[index + 1]);
    const blue = Math.abs(source[index + 2] - output[index + 2]);
    const alpha = Math.abs(source[index + 3] - output[index + 3]);
    rgbDiff += red + green + blue;
    alphaDiff += alpha;
    maxChannel = Math.max(maxChannel, red, green, blue, alpha);
  }

  return {
    meanRgb: rgbDiff / (pixelCount * 3),
    meanAlpha: alphaDiff / pixelCount,
    maxChannel,
  };
}

function isVisuallySafe(diff, hasAlpha) {
  return (
    diff.meanRgb <= VISIBLE_DIFF_THRESHOLD.meanRgb &&
    diff.maxChannel <= VISIBLE_DIFF_THRESHOLD.maxChannel &&
    (!hasAlpha || diff.meanAlpha <= VISIBLE_DIFF_THRESHOLD.meanAlpha)
  );
}

function shouldUseCandidate(blobSize, originalSize, outputMode) {
  if (outputMode === 'webp') return true;
  return blobSize < originalSize;
}

async function exportCompressionCandidate(sourceCanvas, candidate, quality, jpegBackground) {
  let outputCanvas = sourceCanvas;

  if (candidate.mimeType === 'image/jpeg') {
    outputCanvas = new OffscreenCanvas(sourceCanvas.width, sourceCanvas.height);
    const context = outputCanvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = jpegBackground || '#ffffff';
    context.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    context.drawImage(sourceCanvas, 0, 0);
  }

  return outputCanvas.convertToBlob({
    type: candidate.mimeType,
    quality,
  });
}

async function handleCompression(id, file, options) {
  const startedAt = performance.now();
  const source = new Blob([file.data], { type: file.type });
  const bitmap = await createImageBitmap(source);
  const width = bitmap.width;
  const height = bitmap.height;

  if (!width || !height) {
    bitmap.close();
    postError(id, ERROR.LOAD_FAILED);
    return;
  }

  if (width * height > options.maxPixels) {
    bitmap.close();
    postError(id, ERROR.TOO_MANY_PIXELS, String(options.maxPixels));
    return;
  }

  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    bitmap.close();
    postError(id, ERROR.CANVAS_CONTEXT);
    return;
  }

  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const sourceSample = getCanvasSample(canvas);
  if (!sourceSample) {
    postError(id, ERROR.CANVAS_CONTEXT);
    return;
  }

  const hasAlpha = sampleHasAlpha(sourceSample);
  const outputMode = options.outputMode || 'preserve';
  const candidates = getCompressionCandidates(file.type, outputMode);
  let best = null;
  let forcedWebpFallback = null;

  for (const candidate of candidates) {
    for (const quality of candidate.qualities) {
      const blob = await exportCompressionCandidate(canvas, candidate, quality, options.jpegBackground);
      if (
        !blob ||
        (blob.type && blob.type !== candidate.mimeType) ||
        !shouldUseCandidate(blob.size, file.size, outputMode)
      ) continue;

      if (outputMode === 'webp' && !forcedWebpFallback) {
        forcedWebpFallback = { blob, candidate, quality };
      }

      const diff = await compareBlobToSample(blob, sourceSample);
      if (!isVisuallySafe(diff, hasAlpha)) continue;
      if (!best || blob.size < best.blob.size) {
        best = { blob, candidate, quality };
      }
    }
  }

  if (!best && forcedWebpFallback) {
    best = forcedWebpFallback;
  }

  if (!best) {
    if (outputMode === 'webp') {
      postError(id, ERROR.UNSUPPORTED_OUTPUT, 'WebP');
      return;
    }

    self.postMessage({
      id,
      ok: true,
      data: file.data,
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      format: 'original',
      width,
      height,
      originalSize: file.size,
      outputSize: file.size,
      durationMs: Math.round(performance.now() - startedAt),
      savingsRatio: 0,
      strategy: 'kept-original',
    }, [file.data]);
    return;
  }

  const output = await best.blob.arrayBuffer();

  self.postMessage({
    id,
    ok: true,
    data: output,
    filename: createCompressedFilename(file.name, best.candidate.extension),
    mimeType: best.candidate.mimeType,
    format: best.candidate.format,
    width,
    height,
    originalSize: file.size,
    outputSize: best.blob.size,
    durationMs: Math.round(performance.now() - startedAt),
    savingsRatio: calculateSavingsRatio(file.size, best.blob.size),
    quality: best.quality,
    strategy: 'reencoded',
  }, [output]);
}

self.addEventListener('message', async (event) => {
  const { id, file, target, options, task } = event.data ?? {};

  if (!id || !file || (!target && task !== 'compress')) {
    postError(id, ERROR.CONVERSION_FAILED);
    return;
  }

  if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
    postError(id, ERROR.WORKER_UNSUPPORTED);
    return;
  }

  const startedAt = performance.now();

  try {
    if (task === 'compress') {
      await handleCompression(id, file, options);
      return;
    }

    const source = new Blob([file.data], { type: file.type });
    const bitmap = await createImageBitmap(source);
    const width = bitmap.width;
    const height = bitmap.height;

    if (!width || !height) {
      bitmap.close();
      postError(id, ERROR.LOAD_FAILED);
      return;
    }

    if (width * height > options.maxPixels) {
      bitmap.close();
      postError(id, ERROR.TOO_MANY_PIXELS, String(options.maxPixels));
      return;
    }

    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d');

    if (!context) {
      bitmap.close();
      postError(id, ERROR.CANVAS_CONTEXT);
      return;
    }

    if (target.mimeType === 'image/jpeg') {
      context.fillStyle = options.jpegBackground || '#ffffff';
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob = await canvas.convertToBlob({
      type: target.mimeType,
      quality: target.supportsQuality ? options.quality : undefined,
    });

    if (blob.type && blob.type !== target.mimeType) {
      postError(id, ERROR.UNSUPPORTED_OUTPUT, target.label);
      return;
    }

    const output = await blob.arrayBuffer();

    self.postMessage({
      id,
      ok: true,
      data: output,
      filename: createOutputFilename(file.name, target.extension),
      mimeType: target.mimeType,
      width,
      height,
      originalSize: file.size,
      outputSize: blob.size,
      durationMs: Math.round(performance.now() - startedAt),
    }, [output]);
  } catch {
    postError(id, ERROR.LOAD_FAILED);
  }
});
