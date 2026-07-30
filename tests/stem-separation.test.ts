import { describe, expect, it } from 'vitest';
import enMessages from '../messages/en.json';
import zhMessages from '../messages/zh.json';
import {
  STEM_MEMORY_BUDGET_BYTES,
  STEM_OVERLAP_SAMPLES,
  STEM_SAMPLE_RATE,
  STEM_SEGMENT_SAMPLES,
  STEM_STRIDE_SAMPLES,
  STEM_WAVEFORM_BUCKETS,
  accumulateWeight,
  accumulateWindowed,
  buildStemFilename,
  buildWaveformPath,
  clampSelection,
  computeWaveformPeaks,
  createFadeWindow,
  defaultStemSelection,
  encodeWavPcm16,
  estimateStemMemoryBytes,
  fitsMemoryBudget,
  formatClock,
  looksLikeOnnxModel,
  maxDurationSecondsFor,
  normalizeByWeight,
  planStemChunks,
  sourcesForModel,
  stemModelIds,
  stemModels,
  stemSources,
  toOverallPercent,
  type StemErrorCode,
  type StemSource,
  type StemStage,
} from '../lib/utils/stem-separation';

describe('stem separation model constants', () => {
  it('matches the htdemucs_6s ONNX contract', () => {
    // 模型输入维度固定为 343980，改动这些常量等于换模型。
    expect(STEM_SEGMENT_SAMPLES).toBe(343_980);
    expect(STEM_OVERLAP_SAMPLES).toBe(85_995);
    expect(STEM_STRIDE_SAMPLES).toBe(257_985);
    expect(STEM_SAMPLE_RATE).toBe(44_100);
  });

  it('keeps stem order identical to the ONNX output axis', () => {
    expect([...stemSources]).toEqual(['drums', 'bass', 'other', 'vocals', 'guitar', 'piano']);
  });
});

describe('stem model registry', () => {
  it('pins each model to its exact published byte size', () => {
    // 这两个数用于下载进度和缓存完整性校验，写错会导致缓存永远失效。
    expect(stemModels.htdemucs.bytes).toBe(165_612_636);
    expect(stemModels.htdemucs_6s.bytes).toBe(136_428_532);
  });

  it('matches each model to its published output stem order', () => {
    expect([...stemModels.htdemucs.sources]).toEqual(['drums', 'bass', 'other', 'vocals']);
    expect([...stemModels.htdemucs_6s.sources]).toEqual([
      'drums',
      'bass',
      'other',
      'vocals',
      'guitar',
      'piano',
    ]);
  });

  it('exposes every registered model id with a self-consistent entry', () => {
    expect([...stemModelIds].sort()).toEqual(Object.keys(stemModels).sort());
    for (const id of stemModelIds) {
      expect(stemModels[id].id).toBe(id);
      expect(stemModels[id].url).toMatch(/^https:\/\/huggingface\.co\//);
    }
  });

  it('keeps the 4-stem order a prefix of the 6-stem order', () => {
    // UI 用同一个 stemSources 数组给两个模型排序，靠的就是这个前缀关系。
    const six = stemModels.htdemucs_6s.sources;
    expect([...stemModels.htdemucs.sources]).toEqual(six.slice(0, 4));
  });

  it('lists model sources in UI order', () => {
    expect(sourcesForModel('htdemucs')).toEqual(['drums', 'bass', 'other', 'vocals']);
    expect(sourcesForModel('htdemucs_6s')).toEqual([...stemSources]);
  });

  it('defaults to a selection both models support', () => {
    for (const id of stemModelIds) {
      expect(clampSelection(defaultStemSelection, id)).toHaveLength(defaultStemSelection.length);
    }
  });
});

describe('clampSelection', () => {
  it('drops guitar and piano when switching to the 4-stem model', () => {
    const selected: StemSource[] = ['vocals', 'guitar', 'piano', 'drums'];
    expect(clampSelection(selected, 'htdemucs')).toEqual(['drums', 'vocals']);
  });

  it('keeps guitar and piano on the 6-stem model', () => {
    const selected: StemSource[] = ['piano', 'vocals', 'guitar'];
    expect(clampSelection(selected, 'htdemucs_6s')).toEqual(['vocals', 'guitar', 'piano']);
  });

  it('normalizes order regardless of click order', () => {
    expect(clampSelection(['piano', 'drums', 'vocals'], 'htdemucs_6s')).toEqual([
      'drums',
      'vocals',
      'piano',
    ]);
  });

  it('can empty the selection entirely', () => {
    expect(clampSelection(['guitar', 'piano'], 'htdemucs')).toEqual([]);
    expect(clampSelection([], 'htdemucs_6s')).toEqual([]);
  });
});

describe('looksLikeOnnxModel', () => {
  /** 两个真实模型的开头字节（已对上游实测）：ir_version=8 + producer "pytorch" 2.4.1。 */
  const realHead = Uint8Array.from([
    0x08, 0x08, 0x12, 0x07, 0x70, 0x79, 0x74, 0x6f, 0x72, 0x63, 0x68, 0x1a, 0x05, 0x32, 0x2e, 0x34,
    0x2e, 0x31, 0x3a, 0xd9,
  ]);

  it('accepts the real model header', () => {
    expect(looksLikeOnnxModel(realHead)).toBe(true);
  });

  it('rejects an HTML error page that happens to be the right length', () => {
    const html = new TextEncoder().encode('<!DOCTYPE html><html><body>502 Bad Gateway</body></html>');
    expect(looksLikeOnnxModel(html)).toBe(false);
  });

  it('rejects truncated and empty payloads', () => {
    expect(looksLikeOnnxModel(new Uint8Array(0))).toBe(false);
    expect(looksLikeOnnxModel(realHead.subarray(0, 8))).toBe(false);
  });

  it('rejects bytes with the wrong leading protobuf field', () => {
    const wrong = Uint8Array.from(realHead);
    wrong[0] = 0x0a;
    expect(looksLikeOnnxModel(wrong)).toBe(false);
  });

  it('rejects right-length garbage', () => {
    // 分段下载拼错时长度可能刚好对，但内容全是零。
    expect(looksLikeOnnxModel(new Uint8Array(64))).toBe(false);
  });
});

describe('planStemChunks', () => {
  it('returns nothing for empty audio', () => {
    expect(planStemChunks(0)).toEqual([]);
    expect(planStemChunks(-1)).toEqual([]);
  });

  it('uses a single truncated chunk for audio shorter than one segment', () => {
    const chunks = planStemChunks(1000);
    expect(chunks).toEqual([{ index: 0, start: 0, end: 1000 }]);
  });

  it('advances by stride and clamps the final chunk', () => {
    const total = STEM_STRIDE_SAMPLES * 2 + 5000;
    const chunks = planStemChunks(total);

    expect(chunks).toHaveLength(3);
    expect(chunks.map((chunk) => chunk.start)).toEqual([
      0,
      STEM_STRIDE_SAMPLES,
      STEM_STRIDE_SAMPLES * 2,
    ]);
    expect(chunks[chunks.length - 1].end).toBe(total);
  });

  it('covers every sample', () => {
    for (const total of [1, 44_100, STEM_SEGMENT_SAMPLES, STEM_SEGMENT_SAMPLES + 1, 3_000_000]) {
      const chunks = planStemChunks(total);
      expect(chunks[0].start).toBe(0);
      expect(chunks[chunks.length - 1].end).toBe(total);
      // 相邻段必须重叠或至少相接，不能留空洞。
      for (let i = 1; i < chunks.length; i += 1) {
        expect(chunks[i].start).toBeLessThanOrEqual(chunks[i - 1].end);
      }
    }
  });
});

describe('createFadeWindow', () => {
  it('fades in from 0 and out to 0, staying flat in the middle', () => {
    const window = createFadeWindow(100, 10);

    expect(window[0]).toBe(0);
    expect(window[9]).toBeCloseTo(1, 6);
    expect(window[50]).toBe(1);
    expect(window[99]).toBe(0);
    expect(window[90]).toBeCloseTo(1, 6);
  });

  it('is symmetric', () => {
    const window = createFadeWindow(100, 10);
    for (let i = 0; i < 100; i += 1) {
      expect(window[i]).toBeCloseTo(window[99 - i], 6);
    }
  });

  it('degrades to all-ones when the overlap cannot fit', () => {
    expect(Array.from(createFadeWindow(4, 0))).toEqual([1, 1, 1, 1]);
    expect(Array.from(createFadeWindow(4, 4))).toEqual([1, 1, 1, 1]);
  });
});

describe('overlap-add reconstruction', () => {
  /**
   * 核心不变式：若模型是恒等映射（输出 = 输入），则分段加窗累加再按权重归一化
   * 必须还原出原始信号。这验证了整条 overlap-add 流水线。
   */
  function reconstruct(total: number, segment: number, overlap: number): Float32Array {
    const stride = segment - overlap;
    const source = new Float32Array(total);
    for (let i = 0; i < total; i += 1) {
      source[i] = Math.sin(i / 7) * 0.8;
    }

    const window = createFadeWindow(segment, overlap);
    const out = new Float32Array(total);
    const weight = new Float32Array(total);

    const count = Math.max(1, Math.ceil(total / stride));
    for (let index = 0; index < count; index += 1) {
      const start = index * stride;
      if (start >= total) break;
      const end = Math.min(start + segment, total);
      const writeLength = end - start;

      // 恒等"模型"：直接把这一段原样当作输出。
      const chunkOutput = source.subarray(start, end);
      accumulateWindowed(out, chunkOutput, window, start, writeLength);
      accumulateWeight(weight, window, start, writeLength);
    }

    normalizeByWeight(out, weight);
    return out;
  }

  it('reconstructs the signal wherever the window has weight', () => {
    const total = 1000;
    const segment = 400;
    const overlap = 100;
    const out = reconstruct(total, segment, overlap);

    const source = new Float32Array(total);
    for (let i = 0; i < total; i += 1) source[i] = Math.sin(i / 7) * 0.8;

    // 首样本权重恒为 0（窗起点为 0），参考实现 infer.py 有同样的性质，
    // 单个样本 = 1/44100 秒，听不出来；这里显式锁定该行为。
    expect(out[0]).toBe(0);

    // 末尾若干样本落在权重趋于 0 的淡出区，除法会放大浮点误差，跳过。
    for (let i = 1; i < total - 20; i += 1) {
      expect(out[i]).toBeCloseTo(source[i], 4);
    }
  });

  it('reconstructs audio shorter than one segment untouched past the fade-in', () => {
    const total = 200;
    const out = reconstruct(total, 400, 100);

    const source = new Float32Array(total);
    for (let i = 0; i < total; i += 1) source[i] = Math.sin(i / 7) * 0.8;

    // 单段且被截断，末段不含淡出，因此除首样本外应逐点还原。
    for (let i = 1; i < total; i += 1) {
      expect(out[i]).toBeCloseTo(source[i], 5);
    }
  });
});

describe('normalizeByWeight', () => {
  it('never divides by zero', () => {
    const target = new Float32Array([5, 5]);
    const weight = new Float32Array([0, 1]);
    normalizeByWeight(target, weight);

    expect(Number.isFinite(target[0])).toBe(true);
    expect(target[1]).toBe(5);
  });
});

describe('encodeWavPcm16', () => {
  it('writes a valid 44-byte RIFF header', () => {
    const wav = encodeWavPcm16([new Float32Array([0, 0]), new Float32Array([0, 0])], 44_100);
    const view = new DataView(wav.buffer);
    const ascii = (offset: number, length: number) =>
      String.fromCharCode(...Array.from(wav.subarray(offset, offset + length)));

    expect(ascii(0, 4)).toBe('RIFF');
    expect(ascii(8, 4)).toBe('WAVE');
    expect(ascii(12, 4)).toBe('fmt ');
    expect(ascii(36, 4)).toBe('data');

    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(2); // 立体声
    expect(view.getUint32(24, true)).toBe(44_100);
    expect(view.getUint16(34, true)).toBe(16); // 位深
    expect(view.getUint32(28, true)).toBe(44_100 * 4); // byte rate
    expect(view.getUint16(32, true)).toBe(4); // block align

    // 声明的数据长度必须与实际字节数吻合。
    expect(view.getUint32(40, true)).toBe(wav.byteLength - 44);
    expect(view.getUint32(4, true)).toBe(wav.byteLength - 8);
  });

  it('interleaves channels frame by frame', () => {
    const wav = encodeWavPcm16([new Float32Array([1, 0]), new Float32Array([-1, 0])], 44_100);
    const view = new DataView(wav.buffer);

    expect(view.getInt16(44, true)).toBe(32_767); // 左 = +1.0
    expect(view.getInt16(46, true)).toBe(-32_768); // 右 = -1.0
    expect(view.getInt16(48, true)).toBe(0);
    expect(view.getInt16(50, true)).toBe(0);
  });

  it('clamps out-of-range samples instead of wrapping', () => {
    const wav = encodeWavPcm16([new Float32Array([4, -4])], 44_100);
    const view = new DataView(wav.buffer);

    expect(view.getInt16(44, true)).toBe(32_767);
    expect(view.getInt16(46, true)).toBe(-32_768);
  });

  it('produces header-only output for empty audio', () => {
    expect(encodeWavPcm16([], 44_100).byteLength).toBe(44);
  });
});

describe('computeWaveformPeaks', () => {
  it('returns one peak per bucket', () => {
    const samples = new Float32Array(1000).fill(0.5);
    expect(computeWaveformPeaks([samples], 64)).toHaveLength(64);
    expect(computeWaveformPeaks([samples])).toHaveLength(STEM_WAVEFORM_BUCKETS);
  });

  it('scales full-scale audio to 255 and silence to 0', () => {
    expect(computeWaveformPeaks([new Float32Array(100).fill(1)], 4)).toEqual(
      Uint8Array.from([255, 255, 255, 255]),
    );
    expect(computeWaveformPeaks([new Float32Array(100)], 4)).toEqual(
      Uint8Array.from([0, 0, 0, 0]),
    );
  });

  it('takes the absolute peak, so negative-only content still shows', () => {
    const negative = new Float32Array(100).fill(-1);
    expect(computeWaveformPeaks([negative], 2)).toEqual(Uint8Array.from([255, 255]));
  });

  it('takes the max across channels so one-sided stereo content survives', () => {
    const loud = new Float32Array(100).fill(1);
    const silent = new Float32Array(100);
    expect(computeWaveformPeaks([silent, loud], 2)).toEqual(Uint8Array.from([255, 255]));
  });

  it('localises peaks to their own bucket', () => {
    const samples = new Float32Array(100);
    // 只在后四分之一放满量程，前面三个桶必须仍为 0。
    samples.fill(1, 75);
    const peaks = computeWaveformPeaks([samples], 4);
    expect(Array.from(peaks)).toEqual([0, 0, 0, 255]);
  });

  it('handles empty input without throwing', () => {
    expect(computeWaveformPeaks([], 8)).toEqual(new Uint8Array(8));
    expect(computeWaveformPeaks([new Float32Array(0)], 8)).toEqual(new Uint8Array(8));
  });
});

describe('buildWaveformPath', () => {
  it('produces a closed path covering both envelopes', () => {
    const d = buildWaveformPath(Uint8Array.from([255, 0, 255]), 100);
    expect(d.startsWith('M')).toBe(true);
    expect(d.endsWith('Z')).toBe(true);
    // 每个桶在上下包络各有一个点。
    expect(d.split('L')).toHaveLength(6);
  });

  it('spans the full height at full scale and stays centred at silence', () => {
    expect(buildWaveformPath(Uint8Array.from([255]), 100)).toContain('0 0.00');
    // 静音也要留 0.5 半高，否则轨道看起来是空的。
    const silent = buildWaveformPath(Uint8Array.from([0]), 100);
    expect(silent).toContain('0 49.50');
    expect(silent).toContain('0 50.50');
  });

  it('returns an empty string for no peaks', () => {
    expect(buildWaveformPath(new Uint8Array(0))).toBe('');
  });
});

describe('formatClock', () => {
  it('formats as mm:ss.d', () => {
    expect(formatClock(2.24)).toBe('00:02.2');
    expect(formatClock(0)).toBe('00:00.0');
    expect(formatClock(65.7)).toBe('01:05.7');
    expect(formatClock(600)).toBe('10:00.0');
  });

  it('treats invalid or negative input as zero', () => {
    // audio.duration 在元数据就绪前是 NaN，必须不能渲染出 "NaN:NaN"。
    expect(formatClock(Number.NaN)).toBe('00:00.0');
    expect(formatClock(Number.POSITIVE_INFINITY)).toBe('00:00.0');
    expect(formatClock(-5)).toBe('00:00.0');
  });
});

describe('memory budgeting', () => {
  it('grows with both duration and stem count', () => {
    const oneStem = estimateStemMemoryBytes(44_100 * 60, 1);
    const sixStems = estimateStemMemoryBytes(44_100 * 60, 6);
    const longer = estimateStemMemoryBytes(44_100 * 120, 1);

    expect(sixStems).toBeGreaterThan(oneStem);
    expect(longer).toBeGreaterThan(oneStem);
  });

  it('allows more duration when fewer stems are selected', () => {
    expect(maxDurationSecondsFor(1)).toBeGreaterThan(maxDurationSecondsFor(6));
  });

  it('agrees with fitsMemoryBudget at the boundary', () => {
    for (const stemCount of [1, 6]) {
      const limit = maxDurationSecondsFor(stemCount);
      expect(fitsMemoryBudget(limit * STEM_SAMPLE_RATE, stemCount)).toBe(true);
      // 超出上限一秒就必须被拒。
      expect(fitsMemoryBudget((limit + 1) * STEM_SAMPLE_RATE, stemCount)).toBe(false);
    }
  });

  it('keeps a typical 4 minute song within budget for all six stems', () => {
    expect(estimateStemMemoryBytes(44_100 * 240, 6)).toBeLessThanOrEqual(STEM_MEMORY_BUDGET_BYTES);
  });
});

describe('toOverallPercent', () => {
  it('increases monotonically across stages', () => {
    // 顺序必须与真实执行顺序一致，否则进度条会回退。
    const points = [
      toOverallPercent('decode', 0),
      toOverallPercent('decode', 1),
      toOverallPercent('model', 1),
      toOverallPercent('session', 1),
      toOverallPercent('separating', 1),
      toOverallPercent('encode', 1),
      toOverallPercent('done', 1),
    ];

    for (let i = 1; i < points.length; i += 1) {
      expect(points[i]).toBeGreaterThanOrEqual(points[i - 1]);
    }
    expect(points[0]).toBe(0);
    expect(points[points.length - 1]).toBe(100);
  });

  it('clamps out-of-range ratios', () => {
    expect(toOverallPercent('separating', -1)).toBe(toOverallPercent('separating', 0));
    expect(toOverallPercent('separating', 2)).toBe(toOverallPercent('separating', 1));
  });
});

describe('stem splitter copy coverage', () => {
  /**
   * 组件里所有 t() 引用的 key 都必须在两个语种里存在。
   * next-intl 取不到 key 会在渲染期抛错，表现为页面能显示但完全没有交互，
   * 所以这条覆盖测试直接防住那类故障。
   */
  const stageKeys: StemStage[] = ['decode', 'model', 'session', 'separating', 'encode', 'done'];
  const errorKeys: StemErrorCode[] = [
    'empty_file',
    'unsupported_input',
    'file_too_large',
    'decode_failed',
    'no_stems_selected',
    'audio_too_long',
    'webgpu_and_wasm_unavailable',
    'model_download_failed',
    'session_failed',
    'inference_failed',
    'model_failed',
    'cancelled',
  ];

  const flatKeys = [
    'upload_title',
    'model_title',
    'stems_title',
    'output_title',
    'drop_title',
    'drop_hint',
    'action_separate',
    'download_all',
    'clear_cache',
    'download_one',
    'play_all',
    'pause_all',
    'stop',
    'volume',
    'mute',
    'unmute',
    'select_all',
    'select_none',
    'selected_count',
    'model_download_note',
    'privacy_note',
    'backend_webgpu',
    'backend_wasm',
    'unsupported_title',
    'unsupported_hint',
    'elapsed',
    'needs_file',
    'needs_stem',
  ];

  function resolve(messages: Record<string, unknown>, dottedPath: string): unknown {
    return dottedPath
      .split('.')
      .reduce<unknown>(
        (node, part) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
        messages,
      );
  }

  const catalogs = { zh: zhMessages, en: enMessages } as Record<string, Record<string, unknown>>;

  for (const [locale, messages] of Object.entries(catalogs)) {
    it(`covers every stem splitter key in ${locale}`, () => {
      const namespace = messages.stem_splitter as Record<string, unknown>;
      expect(namespace).toBeTruthy();

      const required = [
        ...flatKeys,
        ...stemSources.map((source) => `stems.${source}`),
        ...stemSources.map((source) => `stem_hint.${source}`),
        ...stemModelIds.flatMap((id) => [`models.${id}.name`, `models.${id}.hint`]),
        ...stageKeys.map((stage) => `stage.${stage}`),
        ...errorKeys.map((code) => `errors.${code}`),
      ];

      const missing = required.filter((key) => typeof resolve(namespace, key) !== 'string');
      expect(missing).toEqual([]);
    });
  }

  it('registers the tool in both catalogs and in organic keywords', () => {
    for (const messages of Object.values(catalogs)) {
      // ToolLayout 与 seo.ts 都是无保护地读这两处，缺任一项都会整页报错。
      expect(resolve(messages, 'tools.audio-split-stems.name')).toBeTruthy();
      expect(resolve(messages, 'tools.audio-split-stems.description')).toBeTruthy();
      expect(resolve(messages, 'organic_keywords.audio-split-stems')).toBeTruthy();
    }
  });
});

describe('buildStemFilename', () => {
  it('replaces the extension and appends the stem name', () => {
    expect(buildStemFilename('My Song.mp3', 'vocals')).toBe('My Song-vocals.wav');
    expect(buildStemFilename('no-extension', 'drums')).toBe('no-extension-drums.wav');
    expect(buildStemFilename('a.b.flac', 'piano')).toBe('a.b-piano.wav');
  });
});
