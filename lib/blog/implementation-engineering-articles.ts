import type {
  BlogArticle,
  BlogArticleTranslation,
  BlogBlock,
  BlogFaqItem,
} from './articles';

interface ArticleSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
  table?: Extract<BlogBlock, { type: 'table' }>;
  code?: Extract<BlogBlock, { type: 'code' }>;
}

interface ArticleCopy {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  tags: string[];
  relatedTools: BlogArticleTranslation['relatedTools'];
  lead: string;
  intro: string;
  sections: ArticleSection[];
  callout: Extract<BlogBlock, { type: 'callout' }>;
  conclusion: string;
  faq: BlogFaqItem[];
}

function buildTranslation(copy: ArticleCopy, summaryHeading: string): BlogArticleTranslation {
  const blocks: BlogBlock[] = [
    { type: 'lead', text: copy.lead },
    { type: 'paragraph', text: copy.intro },
  ];

  for (const section of copy.sections) {
    blocks.push({ type: 'heading', level: 2, text: section.heading });
    blocks.push(...section.paragraphs.map((text): BlogBlock => ({ type: 'paragraph', text })));
    if (section.table) blocks.push(section.table);
    if (section.code) blocks.push(section.code);
    if (section.items?.length) blocks.push({ type: 'list', items: section.items });
  }

  blocks.push(
    copy.callout,
    { type: 'heading', level: 2, text: summaryHeading },
    { type: 'paragraph', text: copy.conclusion },
  );

  return {
    title: copy.title,
    excerpt: copy.excerpt,
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    readingTime: copy.readingTime,
    tags: copy.tags,
    relatedTools: copy.relatedTools,
    blocks,
    faq: copy.faq,
  };
}

function article(slug: string, en: ArticleCopy, zh: ArticleCopy): BlogArticle {
  return {
    slug,
    publishedAt: '2026-07-22',
    updatedAt: '2026-07-22',
    translations: {
      en: buildTranslation(en, 'Key takeaways'),
      zh: buildTranslation(zh, '总结'),
    },
  };
}

const ffmpegLoadCode = `let ffmpegPromise: Promise<FFmpeg> | null = null;

async function loadFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { toBlobURL } = await import('@ffmpeg/util');
      const coreURL = await toBlobURL(CORE_JS_URL, 'text/javascript');
      const wasmURL = await toBlobURL(CORE_WASM_URL, 'application/wasm');
      const instance = new FFmpeg();

      await instance.load({
        classWorkerURL: '/vendor/ffmpeg/worker.js',
        coreURL,
        wasmURL,
      });
      return instance;
    })().catch(error => {
      ffmpegPromise = null;
      throw error;
    });
  }

  return ffmpegPromise;
}`;

const ffmpegRunCode = `const inputNames = files.map((file, index) => \`input-\${index}.\${extension(file)}\`);
const outputName = 'output.mp3';

try {
  for (const [index, file] of files.entries()) {
    await ffmpeg.writeFile(inputNames[index], await fetchFile(file));
  }

  const exitCode = await ffmpeg.exec(buildCommand(inputNames, outputName, options), 600_000);
  if (exitCode !== 0) throw new Error(\`FFmpeg exited with \${exitCode}\`);

  const output = await ffmpeg.readFile(outputName);
  return new Blob([output], { type: 'audio/mpeg' });
} finally {
  await Promise.all([...inputNames, outputName].map(name => ffmpeg.deleteFile(name).catch(() => {})));
}`;

const whisperCode = `const transformers = await import('@xenova/transformers/dist/transformers.min.js');

transformers.env.allowLocalModels = false;
transformers.env.useBrowserCache = true;
transformers.env.backends.onnx.wasm.wasmPaths = '/models/transformers/';
transformers.env.backends.onnx.wasm.numThreads = 1;

const transcriber = await transformers.pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny',
  { progress_callback: reportModelProgress },
);

const result = await transcriber(URL.createObjectURL(file), {
  chunk_length_s: 30,
  stride_length_s: 5,
  language: selectedLanguage === 'auto' ? undefined : selectedLanguage,
});`;

const liveTranscriptionCode = `const recorder = new MediaRecorder(stream, { mimeType });
const chunks: Blob[] = [];

recorder.ondataavailable = event => {
  if (event.data.size > 0) chunks.push(event.data);
};

recorder.start(1000);

const refreshId = window.setInterval(async () => {
  const snapshot = new File([new Blob(chunks, { type: mimeType })], 'live.webm');
  const result = await transcribeAudioFile(snapshot, { language: 'auto' });
  if (result.ok) setTranscript(result.text);
}, REFRESH_INTERVAL_MS);`;

const ocrWorkerCode = `const worker = new Worker(
  new URL('../workers/ocr-accurate.worker.ts', import.meta.url),
  { type: 'module' },
);
const data = await file.arrayBuffer();

worker.postMessage({
  id: requestId,
  type: 'recognize',
  file: { data, type: file.type, name: file.name, size: file.size },
  language,
}, [data]);`;

const ocrPipelineCode = `const [det, cls, rec, dictionary] = await Promise.all([
  ort.InferenceSession.create('/models/ocr/det-mobile.onnx', options),
  ort.InferenceSession.create('/models/ocr/cls.onnx', options),
  ort.InferenceSession.create('/models/ocr/rec-unified-mobile.onnx', options),
  fetch('/models/ocr/rec-unified-dict.txt').then(response => response.text()),
]);

const boxes = await detectTextBoxes(det, sourceImage);
for (const box of boxes) {
  const crop = cropCanvas(sourceImage, box);
  const oriented = await classifyTextOrientation(cls, crop);
  blocks.push(await recognizeTextCrop(rec, oriented.canvas, dictionary, language));
}
return mergeRecognizedBlocks(blocks, language);`;

const openXmlCopyCode = `function copyPart(sourcePath: string, destinationPath: string) {
  destinationZip[destinationPath] = sourceZip[sourcePath];
  copyContentType(sourcePath, destinationPath);

  for (const relationship of readRelationships(sourcePath)) {
    if (relationship.targetMode === 'External') continue;

    const sourceTarget = resolveTarget(sourcePath, relationship.target);
    const destinationTarget = uniquePartPath(sourceTarget);
    copyPart(sourceTarget, destinationTarget);
    relationship.target = relativePath(destinationPath, destinationTarget);
  }

  writeRelationships(destinationPath, relationships);
}`;

const wordMergeCode = `const base = unzipSync(await bytes(files[0]));
const bodyParts = [withoutSectionProperties(readWordBody(base))];

for (const file of files.slice(1)) {
  const source = unzipSync(await bytes(file));
  let body = withoutSectionProperties(readWordBody(source));

  for (const relationship of readDocumentRelationships(source)) {
    const nextId = getNextRelationshipId(baseRelationships);
    copyRelatedPartRecursively(relationship);
    body = replaceRelationshipReferences(body, relationship.id, nextId);
  }

  bodyParts.push(pageBreakXml(), body);
}

writeWordBody(base, bodyParts.join(''));
return zipSync(base);`;

const pdfTextCode = `const page = await pdf.getPage(pageNumber);
const content = await page.getTextContent();

const positioned = content.items.flatMap(item => {
  if (!isTextItem(item) || !item.str.trim()) return [];
  return [{
    text: normalizeText(item.str),
    x: Number(item.transform[4] ?? 0),
    y: Number(item.transform[5] ?? 0),
  }];
});

const lines = groupByNearbyY(positioned)
  .map(line => line.sort((a, b) => a.x - b.x))
  .map(line => line.map(item => item.text).join(' '));`;

const docxCode = `const entries = {
  '[Content_Types].xml': strToU8(contentTypesXml),
  '_rels/.rels': strToU8(packageRelationshipsXml),
  'docProps/core.xml': strToU8(corePropertiesXml),
  'docProps/app.xml': strToU8(appPropertiesXml),
  'word/document.xml': strToU8(buildDocumentXml(pages)),
};

const zipped = zipSync(entries, { level: 6 });
return new Blob([zipped], {
  type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
});`;

const icoCode = `const directorySize = 6 + entries.length * 16;
const header = new Uint8Array(directorySize);
const view = new DataView(header.buffer);

view.setUint16(0, 0, true);              // reserved
view.setUint16(2, 1, true);              // ICO image type
view.setUint16(4, entries.length, true); // image count

entries.forEach((entry, index) => {
  const offset = 6 + index * 16;
  header[offset] = entry.size >= 256 ? 0 : entry.size;
  header[offset + 1] = entry.size >= 256 ? 0 : entry.size;
  view.setUint16(offset + 6, 32, true);
  view.setUint32(offset + 8, entry.bytes.byteLength, true);
  view.setUint32(offset + 12, entry.dataOffset, true);
});`;

const icnsCode = `function createIcnsChunk(type: string, png: Uint8Array) {
  const chunk = new Uint8Array(8 + png.byteLength);
  const view = new DataView(chunk.buffer);
  writeAscii(chunk, 0, type);
  view.setUint32(4, chunk.byteLength, false); // ICNS uses big-endian lengths
  chunk.set(png, 8);
  return chunk;
}

const chunks = entries.map(entry =>
  createIcnsChunk(chunkTypeForSize(entry.size), entry.pngBytes)
);
const header = createIcnsHeader(8 + sumByteLengths(chunks));
return new Blob([header, ...chunks], { type: 'image/icns' });`;

export const implementationEngineeringArticles: BlogArticle[] = [
  article(
    'build-browser-audio-tools-with-ffmpeg-wasm',
    {
      title: 'How to Build Browser Audio Tools with FFmpeg.wasm',
      excerpt: 'An engineering guide to loading FFmpeg WebAssembly, managing its virtual file system, building audio commands, reporting progress, and cleaning up browser memory.',
      metaTitle: 'Build Browser Audio Tools with FFmpeg.wasm',
      metaDescription: 'Learn how to build browser audio conversion, merge, trim, volume, speed, bitrate, sample-rate, and silence-removal tools with FFmpeg.wasm and a safe virtual file system.',
      readingTime: '12 min read',
      tags: ['browser tool development', 'FFmpeg.wasm', 'WebAssembly', 'audio processing', 'frontend engineering'],
      relatedTools: [
        { label: 'Browser Audio Tools', href: '/audio', description: 'Convert, merge, trim, compress, record, and process audio in the browser.' },
        { label: 'Remove Audio Silence', href: '/audio/remove-silence', description: 'Trim quiet sections with configurable decibel and duration thresholds.' },
      ],
      lead: 'FFmpeg.wasm makes a mature media engine available inside a browser tab. One integration can power audio conversion, extraction, merging, trimming, compression, volume changes, speed changes, resampling, bitrate conversion, and silence removal without posting the selected media file to an application API.',
      intro: 'The difficult part is not one ffmpeg command. A production wrapper must load a large runtime once, distinguish runtime downloads from user-data uploads, manage the in-memory file system, map product options to safe argument arrays, expose progress, enforce timeouts, and delete every temporary file.',
      sections: [
        {
          heading: 'Understand what still crosses the network',
          paragraphs: [
            'Browser-local processing means the user file is read into the tab and written to FFmpeg’s virtual file system; it does not mean the tool has no network dependencies. The JavaScript core, WASM binary, worker, and page code must be downloaded unless they are already cached. In this implementation, the core and WASM come from a pinned CDN version while the class worker is served from the application origin.',
            'Make this distinction explicit in privacy copy and deployment docs. A stricter offline build can self-host every runtime asset, but either design should keep filenames, media bytes, and output bytes away from analytics and remote processing endpoints.',
          ],
          table: { type: 'table', headers: ['Resource', 'Location', 'Contains user media?'], rows: [
            ['Application JavaScript', 'Site origin', 'No'],
            ['FFmpeg core and WASM', 'Pinned CDN or self-hosted', 'No'],
            ['Class worker', 'Site origin', 'No'],
            ['Input and output files', 'FFmpeg virtual file system in the tab', 'Yes'],
          ] },
        },
        {
          heading: 'Load one shared FFmpeg instance',
          paragraphs: [
            'Dynamic imports keep the large media runtime out of unrelated pages. Cache the loading promise as well as the resolved instance so two quick button clicks cannot create two WASM runtimes. If loading rejects, clear the promise so a retry can start cleanly.',
            'toBlobURL converts the core assets to URLs that the worker can load consistently across origins. Progress during this phase should say that the runtime is downloading; it is misleading to label model or WASM download as media processing.',
          ],
          code: { type: 'code', language: 'typescript', code: ffmpegLoadCode },
        },
        {
          heading: 'Map product modes to argument arrays',
          paragraphs: [
            'Build commands as string arrays rather than shell text. There is no shell interpolation step, which avoids quoting bugs and makes validation easier. Each mode should clamp numeric inputs before inserting them into the command.',
          ],
          items: [
            'Merge: add every input, concatenate audio streams with filter_complex, then map the named output.',
            'Trim: normalize start and end times, reject end less than or equal to start, and encode only the requested duration.',
            'Speed: chain atempo filters because each instance supports a limited rate range.',
            'Silence removal: clamp threshold and minimum duration before building silenceremove.',
            'WAV: choose explicit PCM format, sample rate, and channel count for predictable output.',
          ],
        },
        {
          heading: 'Treat the virtual file system as scarce memory',
          paragraphs: [
            'fetchFile copies each selected file into the WASM-side file system. The encoded output adds another allocation, and FFmpeg may allocate internal decode and filter buffers. A compressed 300 MB video can therefore require far more than 300 MB of browser memory.',
            'Use collision-free temporary names, copy the returned bytes before cleanup, and delete all touched paths in a finally block. The same long-lived instance can then serve the next job without retaining prior media.',
          ],
          code: { type: 'code', language: 'typescript', code: ffmpegRunCode },
        },
        {
          heading: 'Progress, errors, and cancellation need product semantics',
          paragraphs: [
            'FFmpeg progress is usually a fraction of the media timeline, not a guarantee about remaining wall-clock time. Reserve separate ranges for runtime preparation, input writing, processing, encoding, and completion. Remove the exact progress listener after each job so future jobs do not emit duplicate updates.',
            'Set an execution timeout, surface the non-zero exit code, and translate raw failures into stable error codes. True cancellation needs terminating or replacing the FFmpeg instance; disabling a button does not stop WASM work already in progress.',
          ],
        },
        {
          heading: 'Choose browser processing for the right workloads',
          paragraphs: [
            'Browser FFmpeg is excellent for private, occasional, moderate-size transformations. It avoids upload latency and server storage, but it competes with the page for CPU and memory, can drain mobile batteries, and depends on browser WASM limits.',
            'Use a controlled backend for very large media, guaranteed codecs, batch queues, audit requirements, or jobs that must continue after the tab closes. The product should state limits before the user waits for a runtime download.',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Inspect the same FFmpeg runtime across several tools', text: 'Try conversion, trimming, speed change, and silence removal to see one browser runtime serve different validated command builders.', href: '/audio', linkLabel: 'Open Audio Tools' },
      conclusion: 'A reliable FFmpeg.wasm wrapper is a resource manager around a command engine. Cache one runtime, generate validated argument arrays, isolate temporary files, report honest stages, and clean up in finally. Those boundaries let many audio tools share one implementation without turning every page into a separate media pipeline.',
      faq: [
        { question: 'Does FFmpeg.wasm upload the selected audio file?', answer: 'Not in this architecture. The file is copied into the FFmpeg virtual file system inside the browser. Runtime assets may still be downloaded from the site or a CDN, so runtime network traffic and user-file upload should be described separately.' },
        { question: 'Why is the first conversion slower?', answer: 'The browser must download, compile, and initialize the FFmpeg JavaScript, worker, and WASM runtime. Later jobs can reuse the cached browser assets and the shared loaded instance.' },
        { question: 'Why can a small compressed file use a lot of memory?', answer: 'FFmpeg must decode compressed media into working buffers, hold virtual input and output files, and allocate filter and encoder state. Encoded byte size is not a reliable memory estimate.' },
        { question: 'Can FFmpeg.wasm process files after the tab closes?', answer: 'No. Work belongs to the browser page and ends when its execution context is destroyed. Long-running background jobs require another architecture such as a server queue or desktop application.' },
      ],
    },
    {
      title: '怎么用 FFmpeg.wasm 实现浏览器在线音频处理工具',
      excerpt: '完整拆解 FFmpeg WebAssembly 的动态加载、虚拟文件系统、音频命令构造、进度映射、超时与浏览器内存清理。',
      metaTitle: 'FFmpeg.wasm 在线音频处理工具实现指南',
      metaDescription: '讲解如何用 FFmpeg.wasm 实现浏览器音频转换、合并、剪辑、倍速、采样率、码率和去静音，并正确管理虚拟文件与内存。',
      readingTime: '约 12 分钟阅读',
      tags: ['浏览器工具开发', 'FFmpeg.wasm', 'WebAssembly', '音频处理', '前端工程'],
      relatedTools: [
        { label: '浏览器音频工具', href: '/audio', description: '在浏览器中转换、合并、剪辑、压缩、录制和处理音频。' },
        { label: '音频去静音', href: '/audio/remove-silence', description: '通过可配置的分贝阈值和持续时间裁掉静音片段。' },
      ],
      lead: 'FFmpeg.wasm 把成熟的媒体引擎带进浏览器标签页。一套封装就能支持音频转换、提取、合并、剪辑、压缩、音量、倍速、重采样、码率调整和去静音，而且用户选择的媒体文件无需提交到应用处理接口。',
      intro: '真正困难的不是写出某一条 ffmpeg 命令，而是只加载一次大型运行时、准确区分运行时下载与用户文件上传、管理内存虚拟文件系统、把产品选项转换成安全参数数组、展示进度、设置超时，并删除所有临时文件。',
      sections: [
        {
          heading: '先说清楚哪些资源仍然需要联网',
          paragraphs: [
            '浏览器本地处理表示用户文件在当前标签页读取并写入 FFmpeg 虚拟文件系统，不代表页面完全没有网络依赖。JavaScript core、WASM、worker 和应用代码仍需要下载，除非已经缓存。当前实现从固定版本 CDN 获取 core 与 WASM，class worker 则由站点同源提供。',
            '隐私文案和部署文档应该明确区分这两件事。要求严格离线时可以把运行时资源全部自托管；无论采用哪种方式，文件名、媒体字节和输出内容都不应进入统计或远程处理接口。',
          ],
          table: { type: 'table', headers: ['资源', '位置', '是否包含用户媒体'], rows: [
            ['应用 JavaScript', '站点同源', '否'],
            ['FFmpeg core 与 WASM', '固定版本 CDN 或自托管', '否'],
            ['Class worker', '站点同源', '否'],
            ['输入与输出文件', '标签页内 FFmpeg 虚拟文件系统', '是'],
          ] },
        },
        {
          heading: '全站复用一个 FFmpeg 实例',
          paragraphs: [
            '动态 import 可以避免无关页面加载大型媒体运行时。除了缓存最终实例，还要缓存加载 Promise，防止用户快速点击两次后创建两个 WASM 运行时。如果加载失败，则清空 Promise，允许重试从干净状态开始。',
            'toBlobURL 会把 core 资源转换成 worker 能稳定加载的 URL。这个阶段的进度应该明确显示“下载运行时”，不能把模型或 WASM 下载误写成“正在处理音频”。',
          ],
          code: { type: 'code', language: 'typescript', code: ffmpegLoadCode },
        },
        {
          heading: '把产品模式映射为参数数组',
          paragraphs: [
            '命令应构造成字符串数组，而不是一段 shell 文本。这样不存在 shell 插值，既减少转义问题，也方便逐项校验。所有数字参数都应先限制范围，再写进命令。',
          ],
          items: [
            '合并：添加全部输入，通过 filter_complex 串联音频流，再 map 命名输出。',
            '剪辑：规范开始和结束时间，拒绝结束时间不大于开始时间的输入。',
            '倍速：atempo 单个滤镜支持范围有限，需要串联多个滤镜。',
            '去静音：构造 silenceremove 前限制分贝阈值和最短持续时间。',
            'WAV：明确指定 PCM、采样率和声道数，保证结果可预测。',
          ],
        },
        {
          heading: '把虚拟文件系统当作稀缺内存',
          paragraphs: [
            'fetchFile 会把每个文件复制到 WASM 侧文件系统，编码输出又增加一份分配，FFmpeg 解码和滤镜还有内部缓冲。因此一个 300 MB 的压缩视频可能需要远大于 300 MB 的浏览器内存。',
            '临时文件名必须避免冲突，读取结果后先复制字节，再在 finally 中删除所有碰过的路径。这样同一个长生命周期实例才能继续处理下一项任务，而不会保留上一份媒体。',
          ],
          code: { type: 'code', language: 'typescript', code: ffmpegRunCode },
        },
        {
          heading: '进度、错误与取消需要产品语义',
          paragraphs: [
            'FFmpeg progress 通常表示媒体时间线比例，并不等于准确剩余时间。可以分别为运行时准备、写入输入、处理、编码和完成预留进度区间。每项任务结束后还要移除对应监听器，避免后续任务收到重复事件。',
            '为 exec 设置超时，保留非零退出码，再把底层错误转换成稳定错误码。真正取消任务通常需要终止或重建 FFmpeg 实例；只禁用按钮并不会停止正在执行的 WASM。',
          ],
        },
        {
          heading: '为合适的负载选择浏览器处理',
          paragraphs: [
            'FFmpeg.wasm 很适合隐私敏感、偶发和中等体积的转换任务，可以省去上传耗时与服务端存储。但它会与页面争用 CPU 和内存，在手机上消耗电量，也受浏览器 WASM 上限约束。',
            '超大媒体、固定编码器保证、批量队列、审计要求或必须在关闭标签页后继续的任务，更适合受控后端。产品应在用户等待运行时下载之前就说明限制。',
          ],
        },
      ],
      callout: { type: 'callout', title: '查看同一 FFmpeg 运行时如何支持多个工具', text: '依次体验格式转换、剪辑、倍速与去静音，观察一套浏览器运行时如何复用不同的参数构造器。', href: '/audio', linkLabel: '打开音频工具' },
      conclusion: '可靠的 FFmpeg.wasm 封装，本质上是包围命令引擎的资源管理器：缓存一个运行时、生成校验后的参数数组、隔离临时文件、诚实展示阶段，并在 finally 中清理。做好这些边界，多个音频页面才能共享同一实现。',
      faq: [
        { question: 'FFmpeg.wasm 会上传我选择的音频吗？', answer: '这套架构不会。文件会被复制到浏览器内 FFmpeg 虚拟文件系统。运行时资源仍可能从站点或 CDN 下载，因此应把“运行时网络请求”和“用户文件上传”分开说明。' },
        { question: '为什么第一次转换比较慢？', answer: '浏览器第一次需要下载、编译并初始化 FFmpeg JavaScript、worker 与 WASM。后续任务可以复用浏览器缓存和已经加载的共享实例。' },
        { question: '为什么体积不大的压缩文件也可能占很多内存？', answer: 'FFmpeg 会把压缩媒体解码到工作缓冲，还要保存虚拟输入、输出、滤镜和编码器状态。压缩文件字节数不能代表真实处理内存。' },
        { question: '关闭页面后 FFmpeg.wasm 能继续处理吗？', answer: '不能。任务属于浏览器页面，执行上下文销毁后就会结束。需要后台长任务时，应使用服务端队列或桌面应用等其他架构。' },
      ],
    },
  ),
  article(
    'run-whisper-speech-to-text-in-browser',
    {
      title: 'How to Run Whisper Speech-to-Text in the Browser',
      excerpt: 'Build browser speech recognition with Transformers.js, ONNX WebAssembly, model caching, chunked decoding, microphone snapshots, and honest privacy boundaries.',
      metaTitle: 'Run Whisper Speech-to-Text in the Browser',
      metaDescription: 'Implement browser Whisper transcription with Transformers.js, ONNX WASM, cached model loading, 30-second chunks, overlap, language selection, microphone recording, and cleanup.',
      readingTime: '11 min read',
      tags: ['browser tool development', 'Whisper', 'speech to text', 'Transformers.js', 'ONNX WASM'],
      relatedTools: [
        { label: 'Audio to Text', href: '/audio/to-text', description: 'Transcribe uploaded audio or microphone input with a browser-loaded Whisper model.' },
        { label: 'Audio Recorder', href: '/audio/recorder', description: 'Record microphone audio locally and export the result.' },
      ],
      lead: 'Whisper can run inside a browser through Transformers.js and ONNX WebAssembly. The audio stays in the tab during inference, while the model is downloaded and cached as an application dependency. That architecture offers a useful privacy boundary, but it is not the same as zero network traffic or server-grade streaming transcription.',
      intro: 'A practical wrapper needs one cached pipeline, visible model progress, language control, long-audio chunking, object-URL cleanup, microphone permission handling, and a clear explanation of what “live” means when the browser periodically retranscribes accumulated recording data.',
      sections: [
        {
          heading: 'Separate model delivery from audio processing',
          paragraphs: [
            'The model, tokenizer, configuration, and ONNX runtime assets must reach the browser. In the current design, model files are allowed from the remote model repository and stored in the browser cache, while ONNX WASM files are served from the site. The user audio is represented by a local object URL and passed to the pipeline in the page.',
            'On first use, users pay the model download and initialization cost. Later use may reuse cached model files, but private browsing, cleared site data, cache eviction, or a new model revision can trigger another download.',
          ],
          table: { type: 'table', headers: ['Data', 'Typical path', 'Caching'], rows: [
            ['Whisper model and tokenizer', 'Remote model host to browser', 'Browser cache'],
            ['ONNX WASM runtime', 'Site origin to browser', 'HTTP/browser cache'],
            ['Uploaded audio', 'File to local object URL', 'Not uploaded by the inference wrapper'],
            ['Transcript', 'Pipeline result to React state', 'Only if the product explicitly persists it'],
          ] },
        },
        {
          heading: 'Create and cache one ASR pipeline',
          paragraphs: [
            'Pipeline construction is expensive, so cache the Promise rather than rebuilding it for every file. If initialization fails, reset that Promise to permit a real retry. A progress callback can distinguish model download, model readiness, inference, and completion.',
            'The example deliberately uses one WASM thread for predictable compatibility. More threads can require cross-origin isolation and must be benchmarked across target browsers rather than enabled blindly.',
          ],
          code: { type: 'code', language: 'typescript', code: whisperCode },
        },
        {
          heading: 'Use overlapping chunks for long recordings',
          paragraphs: [
            'Whisper models operate on bounded audio windows. A 30-second chunk with a 5-second stride gives neighboring windows overlap, reducing the chance that a word at a hard boundary is lost. The pipeline reconciles the overlapping context into final text.',
            'Long files still increase total compute time and memory pressure. Validate input type and size before model loading, show that transcription continues after the model reaches 100 percent, and avoid promising real-time speed on low-power devices.',
          ],
          items: [
            'Auto language leaves language selection to the model wrapper.',
            'Explicit zh or en can reduce ambiguity when the recording language is known.',
            'Revoke the input object URL in finally, including error paths.',
            'Keep the pipeline cached, but release per-file URLs and UI previews.',
          ],
        },
        {
          heading: 'Microphone transcription is periodic snapshot inference',
          paragraphs: [
            'MediaRecorder can emit one encoded chunk per second. At an interval, the application joins the chunks collected so far into a new File and runs the same file transcription function. The latest complete transcript replaces the previous preview.',
            'This is easier to implement than a stateful streaming decoder, but compute grows as the accumulated recording grows because earlier audio is processed again. Prevent overlapping snapshot jobs, wait for an active job before finalizing, and always stop every MediaStream track.',
          ],
          code: { type: 'code', language: 'typescript', code: liveTranscriptionCode },
        },
        {
          heading: 'Design microphone lifecycle and permissions carefully',
          paragraphs: [
            'Check MediaRecorder, getUserMedia, and a supported MIME type before showing the feature as available. Request echo cancellation and noise suppression when appropriate, but describe them as browser constraints rather than guarantees.',
            'On stop, request the last data chunk, clear the refresh interval, stop the recorder, stop all tracks, run one final snapshot, and return the UI to idle. On denial or failure, perform the same cleanup before displaying a localized error.',
          ],
        },
        {
          heading: 'Know where a tiny model is and is not enough',
          paragraphs: [
            'A tiny Whisper model prioritizes download size and browser feasibility. Accuracy can fall with noise, accents, multiple speakers, technical vocabulary, music, or distant microphones. Browser inference also varies by CPU, memory, and WASM support.',
            'Use a larger model or controlled service when accuracy, diarization, timestamps, guaranteed latency, or centralized auditing is required. The UI should let users edit and copy the transcript rather than presenting model output as authoritative.',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Compare file and microphone transcription', text: 'Load a short recording, then try microphone mode to compare one-shot inference with periodic accumulated snapshots.', href: '/audio/to-text', linkLabel: 'Open Audio to Text' },
      conclusion: 'Browser Whisper is a model-delivery and lifecycle problem as much as an inference call. Cache one pipeline, distinguish model traffic from audio handling, use overlapping chunks, serialize microphone snapshots, and clean up permissions and object URLs. Those details determine whether transcription feels trustworthy and usable.',
      faq: [
        { question: 'Does browser Whisper work fully offline?', answer: 'It can work after all application, runtime, and model assets are available in cache, but first use normally downloads them. Cache eviction or private browsing can require another download, so offline availability should be tested rather than assumed.' },
        { question: 'Is the microphone mode true streaming speech recognition?', answer: 'Not in this implementation. MediaRecorder gathers chunks and the application periodically retranscribes the accumulated recording. A true streaming decoder maintains model state and processes incremental audio differently.' },
        { question: 'Why use chunk overlap?', answer: 'Words and phonemes can cross a fixed chunk boundary. Overlap gives the next chunk some previous context, reducing truncated transitions at the cost of extra computation.' },
        { question: 'Why use Whisper tiny instead of a larger model?', answer: 'A smaller model downloads and initializes faster and uses less browser memory. Larger models may improve accuracy but can make first use, inference time, and mobile compatibility impractical.' },
      ],
    },
    {
      title: '怎么在浏览器运行 Whisper 实现语音转文字',
      excerpt: '使用 Transformers.js 和 ONNX WASM 实现浏览器语音识别，覆盖模型缓存、音频分块、麦克风快照转写和隐私边界。',
      metaTitle: '浏览器运行 Whisper 语音转文字实现指南',
      metaDescription: '讲解如何用 Transformers.js、ONNX WASM 和 Whisper 在浏览器转写语音，包括模型缓存、30 秒分块、重叠、语言选择和麦克风录音。',
      readingTime: '约 11 分钟阅读',
      tags: ['浏览器工具开发', 'Whisper', '语音转文字', 'Transformers.js', 'ONNX WASM'],
      relatedTools: [
        { label: '音频转文本', href: '/audio/to-text', description: '使用浏览器加载的 Whisper 模型转写音频文件或麦克风输入。' },
        { label: '在线录音笔', href: '/audio/recorder', description: '在浏览器本地录制麦克风音频并导出。' },
      ],
      lead: '通过 Transformers.js 与 ONNX WebAssembly，Whisper 可以直接在浏览器中运行。推理期间音频留在当前标签页，模型则作为应用依赖下载并缓存。这形成了有价值的隐私边界，但不等于零网络流量，也不等于服务端级别的流式识别。',
      intro: '实用封装需要缓存一份 pipeline、展示模型下载进度、处理语言选择与长音频分块、释放 Object URL、管理麦克风权限，并准确解释“实时转写”其实是浏览器周期性重新识别累计录音。',
      sections: [
        {
          heading: '区分模型交付与音频处理',
          paragraphs: [
            '模型、tokenizer、配置和 ONNX 运行时必须先到达浏览器。当前设计允许从远程模型仓库加载模型文件并使用浏览器缓存，ONNX WASM 则由站点提供；用户音频通过本地 Object URL 交给页面中的 pipeline。',
            '第一次使用会承担模型下载和初始化成本。后续可能复用缓存，但无痕模式、清理站点数据、缓存淘汰或模型版本变化都可能重新下载。',
          ],
          table: { type: 'table', headers: ['数据', '典型路径', '缓存方式'], rows: [
            ['Whisper 模型与 tokenizer', '远程模型站点到浏览器', '浏览器缓存'],
            ['ONNX WASM 运行时', '站点到浏览器', 'HTTP/浏览器缓存'],
            ['上传音频', 'File 到本地 Object URL', '推理封装不上传'],
            ['转写文本', 'pipeline 结果到 React state', '只有产品明确保存时才持久化'],
          ] },
        },
        {
          heading: '创建并缓存唯一 ASR Pipeline',
          paragraphs: [
            'pipeline 初始化成本很高，因此应缓存 Promise，而不是每个文件重新创建。初始化失败时重置 Promise，才能真正重试。progress callback 可以把模型下载、模型就绪、推理与完成分开显示。',
            '示例使用单线程 WASM，以获得更可预测的兼容性。多线程通常依赖跨源隔离，必须在目标浏览器实测后再开启。',
          ],
          code: { type: 'code', language: 'typescript', code: whisperCode },
        },
        {
          heading: '长录音使用带重叠的分块',
          paragraphs: [
            'Whisper 模型处理的是有限音频窗口。30 秒 chunk 加 5 秒 stride 会让相邻窗口重叠，降低词语刚好落在硬边界时被截断的概率，pipeline 再整合这些上下文。',
            '长文件仍会增加总计算量与内存压力。应在加载模型前校验格式和大小，说明模型加载到 100% 后仍需继续识别，也不要承诺低性能设备可以实时完成。',
          ],
          items: [
            '自动语言让模型封装自行判断语言。',
            '已知录音语言时明确传入 zh 或 en，可以减少歧义。',
            '无论成功或失败，都要在 finally revoke 输入 URL。',
            'pipeline 可以缓存，但每个文件的 URL 和预览需要释放。',
          ],
        },
        {
          heading: '麦克风转写是周期性快照推理',
          paragraphs: [
            'MediaRecorder 可以每秒产生一块编码数据。应用按照固定间隔，把当前累计 chunks 合并成 File，再调用同一套文件转写函数，用最新完整结果替换预览。',
            '这种方案比有状态流式解码器简单，但录音越长，每次快照重复处理的旧音频越多。必须阻止多个快照任务重叠，最终停止前等待正在运行的快照，并始终停止全部 MediaStream track。',
          ],
          code: { type: 'code', language: 'typescript', code: liveTranscriptionCode },
        },
        {
          heading: '认真管理麦克风权限和生命周期',
          paragraphs: [
            '显示功能可用前，先检查 MediaRecorder、getUserMedia 和浏览器支持的 MIME。可以请求回声消除与降噪，但它们只是浏览器约束，不是质量保证。',
            '停止时请求最后一块数据、清理刷新 interval、停止 recorder、停止所有 track、完成最后一次快照，再让 UI 回到 idle。权限拒绝或异常时也要执行同样清理，然后展示本地化错误。',
          ],
        },
        {
          heading: '理解 Tiny 模型的能力边界',
          paragraphs: [
            'Whisper tiny 优先考虑下载体积和浏览器可运行性。噪声、口音、多人对话、技术词汇、音乐或远距离麦克风都会降低准确率，推理速度也取决于 CPU、内存与 WASM 支持。',
            '如果必须保证准确率、说话人区分、时间戳、延迟或集中审计，应使用更大模型或受控服务。界面要允许用户编辑和复制结果，不能把模型输出当作权威文本。',
          ],
        },
      ],
      callout: { type: 'callout', title: '对比文件与麦克风两种转写方式', text: '先上传一段短音频，再开启麦克风，比较一次性推理与周期性累计快照的表现。', href: '/audio/to-text', linkLabel: '打开音频转文本' },
      conclusion: '浏览器 Whisper 不只是一次推理调用，更是模型交付和生命周期问题。缓存一份 pipeline，区分模型流量与音频处理，使用重叠分块，串行执行麦克风快照，并清理权限与 Object URL，才能让转写过程既可信又可用。',
      faq: [
        { question: '浏览器 Whisper 可以完全离线吗？', answer: '应用、运行时和模型资源全部进入缓存后可能离线运行，但第一次通常需要下载。缓存被清理或使用无痕模式时可能再次下载，因此必须实测，不能直接承诺永久离线。' },
        { question: '麦克风模式是真正的流式语音识别吗？', answer: '这套实现不是。MediaRecorder 收集数据，应用周期性重新识别累计录音。真正的流式解码器会维护模型状态，并以不同方式处理增量音频。' },
        { question: '为什么音频分块要重叠？', answer: '词语和音素可能跨越固定边界。重叠让后一块获得前一块部分上下文，减少边界截断，但会增加一些重复计算。' },
        { question: '为什么选择 Whisper tiny 而不是大模型？', answer: '小模型下载和初始化更快，占用浏览器内存更少。大模型可能更准确，但首次使用、推理时间和移动端兼容性可能难以接受。' },
      ],
    },
  ),
  article(
    'build-browser-ocr-with-onnx-runtime-web',
    {
      title: 'How to Build Browser OCR with ONNX Runtime Web',
      excerpt: 'A complete browser OCR pipeline using a Web Worker, ONNX WASM, text detection, orientation classification, recognition, language-aware decoding, and reading-order merging.',
      metaTitle: 'Build Browser OCR with ONNX Runtime Web',
      metaDescription: 'Implement browser OCR with ONNX Runtime Web: transferable image bytes, OffscreenCanvas preprocessing, detection, orientation classification, CTC decoding, progress, and timeouts.',
      readingTime: '14 min read',
      tags: ['browser tool development', 'OCR', 'ONNX Runtime Web', 'Web Worker', 'computer vision'],
      relatedTools: [
        { label: 'Image OCR', href: '/image/ocr', description: 'Recognize English, simplified Chinese, traditional Chinese, or Japanese text locally in the browser.' },
        { label: 'Image Tools', href: '/image', description: 'Process, inspect, convert, and export images with browser-local workflows.' },
      ],
      lead: 'An OCR feature is not one neural network call. A useful browser pipeline must find text regions, correct upside-down crops, recognize variable-width lines, decode character probabilities, restore reading order, and keep all heavy work away from the UI thread.',
      intro: 'This implementation uses three ONNX sessions—detection, orientation classification, and recognition—inside a module Web Worker. Images move into the worker as transferable bytes, preprocessing uses OffscreenCanvas, model sessions are cached, and progress is reported by request ID.',
      sections: [
        {
          heading: 'Split the pipeline into three model stages',
          paragraphs: [
            'The detection model produces a probability map for text pixels. Post-processing thresholds and dilates that map, finds connected components, filters weak regions, expands boxes, merges fragments on the same line, and sorts them into reading order.',
            'Each detected crop then passes through a 0/180-degree classifier before the recognition model. Recognition returns per-step character scores, which are decoded with CTC-style blank and repeated-class removal. The final merge preserves line breaks and inserts spaces appropriately for English versus CJK text.',
          ],
          table: { type: 'table', headers: ['Stage', 'Input', 'Output'], rows: [
            ['Detection', 'Resized full image tensor', 'Ordered text boxes'],
            ['Classification', 'Fixed-size text crop', '0° or 180°'],
            ['Recognition', '48px-high variable-width crop', 'Text and confidence'],
            ['Merge', 'Recognized blocks and boxes', 'Readable multiline text'],
          ] },
        },
        {
          heading: 'Transfer image bytes to a dedicated worker',
          paragraphs: [
            'The page maintains one worker and gives every request a unique ID. ArrayBuffer is included in the transfer list, moving ownership instead of cloning a potentially large image. Progress and result messages are filtered by ID so an unrelated response cannot resolve the wrong Promise.',
            'Register temporary message and error listeners per request, remove them on completion, and enforce a timeout. If the worker crashes, terminate and clear the cached instance so the next attempt does not reuse a broken worker.',
          ],
          code: { type: 'code', language: 'typescript', code: ocrWorkerCode },
        },
        {
          heading: 'Load and cache ONNX sessions once',
          paragraphs: [
            'Configure ONNX Runtime Web with same-origin WASM paths, sequential execution, graph optimization, and the WASM provider. Load three models and the character dictionary in parallel, then cache the shared Promise. The first request pays the model cost; later requests reuse sessions.',
            'A single-thread configuration avoids cross-origin-isolation requirements and keeps memory behavior predictable. The tradeoff is lower peak throughput, which is acceptable for one image at a time.',
          ],
          code: { type: 'code', language: 'typescript', code: ocrPipelineCode },
        },
        {
          heading: 'Preprocessing must match each model',
          paragraphs: [
            'createImageBitmap decodes the Blob, and OffscreenCanvas keeps pixel work in the worker. Reject images over a pixel limit before allocating more canvases. Detection resizes the longest side and rounds dimensions to a multiple of 32; classification stretches to its fixed input; recognition preserves aspect ratio and pads on the right.',
            'Detection uses ImageNet normalization, while classification and recognition use Paddle-style normalization. Percentile contrast stretching improves faint text crops, but only when the detected contrast range is meaningful.',
          ],
          items: [
            'Close ImageBitmap immediately after drawing it to OffscreenCanvas.',
            'Use CHW Float32 tensors with explicit RGB channel planes.',
            'Keep recognition height fixed and clamp maximum line width.',
            'Fill padded regions white rather than leaving transparent black pixels.',
          ],
        },
        {
          heading: 'Post-processing is as important as inference',
          paragraphs: [
            'A raw detection probability map is not a list of lines. Thresholding, dilation, connected-component search, score filtering, padding, line-fragment merging, and reading-order sorting determine whether the recognizer sees complete text or broken pieces.',
            'The recognizer output also needs careful decoding. Ignore the blank class, collapse consecutive identical classes, accumulate confidence, and optionally prefer characters from the selected language when their score remains close to the global best. This reduces cross-script noise without hard-blocking punctuation and Latin text.',
          ],
        },
        {
          heading: 'Expose progress and limitations honestly',
          paragraphs: [
            'Report model, prepare, detect, classify, recognize, and merge as separate stages. During per-box work, include processed and total counts. This is more useful than one spinner because a page with many text regions can spend most of its time after detection.',
            'Axis-aligned boxes and a 0/180 classifier do not fully solve perspective distortion, curved text, vertical writing, handwriting, or 90-degree rotation. When document-grade accuracy matters, add geometric rectification, broader orientation handling, or a specialized service.',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Watch the three-stage pipeline run locally', text: 'Upload a clear screenshot or document photo, switch languages, and inspect text blocks, confidence, and progress without sending the image to an OCR API.', href: '/image/ocr', linkLabel: 'Open Image OCR' },
      conclusion: 'Browser OCR succeeds when model inference and classical post-processing are designed together. Move the work into a Worker, cache the three sessions, match preprocessing to each model, transfer large buffers, rebuild boxes and reading order, and present the remaining limitations clearly.',
      faq: [
        { question: 'Why does OCR need three models?', answer: 'Detection finds where text is, classification corrects upside-down crops, and recognition turns each crop into characters. One recognition model over the whole image would waste resolution and lose layout structure.' },
        { question: 'Why use a Web Worker for OCR?', answer: 'Image preprocessing, connected-component analysis, and ONNX inference are CPU-heavy. A worker keeps the main thread responsive and allows OffscreenCanvas preprocessing away from React rendering.' },
        { question: 'Are the ONNX models uploaded with each image?', answer: 'No. Models are static application assets downloaded to the browser and cached as sessions. The selected image bytes are transferred from the page to a same-page worker, not posted to a remote OCR endpoint.' },
        { question: 'Why can a language preference improve decoding?', answer: 'A multilingual recognition model may assign similar scores to visually related characters from different scripts. A soft preference can select the requested script when its score is close, while still allowing digits, Latin characters, and punctuation.' },
      ],
    },
    {
      title: '怎么用 ONNX Runtime Web 实现浏览器本地 OCR',
      excerpt: '用 Web Worker、ONNX WASM、文本检测、方向分类、文字识别、语言偏置解码与阅读顺序合并实现完整浏览器 OCR。',
      metaTitle: 'ONNX Runtime Web 浏览器 OCR 实现指南',
      metaDescription: '讲解浏览器 OCR 完整实现：ArrayBuffer 转移、OffscreenCanvas 预处理、文本检测、方向分类、CTC 解码、进度与超时。',
      readingTime: '约 14 分钟阅读',
      tags: ['浏览器工具开发', 'OCR', 'ONNX Runtime Web', 'Web Worker', '计算机视觉'],
      relatedTools: [
        { label: '图片 OCR', href: '/image/ocr', description: '在浏览器本地识别英文、简体中文、繁体中文或日文。' },
        { label: '图片工具', href: '/image', description: '通过浏览器本地流程处理、检查、转换和导出图片。' },
      ],
      lead: 'OCR 并不是调用一次神经网络。真正可用的浏览器流水线要先找到文字区域、纠正倒置裁剪、识别不同宽度的文本行、解码字符概率、恢复阅读顺序，并让这些重计算远离 UI 主线程。',
      intro: '这套实现把检测、方向分类和识别三个 ONNX session 放进 module Web Worker。图片通过可转移字节进入 worker，OffscreenCanvas 完成预处理，模型 session 只加载一次，进度与结果则通过 request ID 对应。',
      sections: [
        {
          heading: '把 OCR 拆成三个模型阶段',
          paragraphs: [
            '检测模型输出文本像素概率图。后处理对概率图做阈值化和膨胀，寻找连通区域，过滤弱区域，扩展边界框，合并同一行碎片，并按阅读顺序排序。',
            '每个检测裁剪先经过 0/180 度分类，再送入识别模型。识别结果按 CTC 方式去掉 blank 和连续重复类。最终合并会保留换行，并根据英文或 CJK 文本决定是否插入空格。',
          ],
          table: { type: 'table', headers: ['阶段', '输入', '输出'], rows: [
            ['检测', '缩放后的整图张量', '排序后的文本框'],
            ['方向分类', '固定尺寸文本裁剪', '0° 或 180°'],
            ['识别', '高度 48px 的变宽裁剪', '文字与置信度'],
            ['合并', '识别块与坐标框', '可读多行文本'],
          ] },
        },
        {
          heading: '把图片字节转移到独立 Worker',
          paragraphs: [
            '页面复用一个 worker，并为每个请求分配唯一 ID。把 ArrayBuffer 放进 transfer list，会转移所有权而不是克隆一份大图片。进度和结果按 ID 过滤，避免无关响应错误地结束另一个 Promise。',
            '每次请求注册临时 message 与 error listener，结束后移除，并设置超时。worker 崩溃时要 terminate 并清空缓存实例，下一次不能继续复用损坏 worker。',
          ],
          code: { type: 'code', language: 'typescript', code: ocrWorkerCode },
        },
        {
          heading: '只加载一次 ONNX Session',
          paragraphs: [
            'ONNX Runtime Web 使用同源 WASM 路径、顺序执行、图优化和 WASM provider。三个模型与字符字典并行加载，再缓存共享 Promise。第一张图片承担模型成本，后续请求复用 session。',
            '单线程配置不需要跨源隔离，内存行为也更可预测，代价是峰值吞吐较低。对一次处理一张图片的工具来说，这通常是合理取舍。',
          ],
          code: { type: 'code', language: 'typescript', code: ocrPipelineCode },
        },
        {
          heading: '每个模型都要匹配自己的预处理',
          paragraphs: [
            'createImageBitmap 解码 Blob，OffscreenCanvas 让像素操作留在 worker。分配更多画布前先检查像素上限。检测阶段缩放最长边并把尺寸对齐到 32；分类阶段拉伸到固定输入；识别阶段保留比例并在右侧补白。',
            '检测使用 ImageNet normalization，分类和识别使用 Paddle 风格 normalization。百分位对比度拉伸能改善浅色文字，但只应在真实对比范围足够时启用。',
          ],
          items: [
            '绘制进 OffscreenCanvas 后立即关闭 ImageBitmap。',
            '生成 CHW Float32 张量并明确拆分 RGB 通道。',
            '识别高度固定，文本行最大宽度受限。',
            '补白区域填充白色，避免透明像素变成黑色。',
          ],
        },
        {
          heading: '后处理和模型推理同样重要',
          paragraphs: [
            '原始概率图并不是文本行列表。阈值、膨胀、连通区域、得分过滤、边界扩展、行碎片合并与阅读排序，决定识别器看到的是完整文本还是破碎片段。',
            '识别输出也要正确解码：忽略 blank、折叠连续相同类别、累计置信度，并在候选分数接近时优先选择目标语言字符。这样既能减少跨文字体系噪声，又不会硬性屏蔽标点与拉丁字符。',
          ],
        },
        {
          heading: '诚实展示进度与能力边界',
          paragraphs: [
            '模型、准备、检测、分类、识别和合并应成为独立进度阶段。逐框处理时还要显示已处理数量与总数，因为文本区域很多的页面，大部分时间可能花在检测之后。',
            '轴对齐文本框和 0/180 分类无法彻底解决透视、曲线文字、竖排、手写或 90 度旋转。要求文档级准确率时，需要几何矫正、更完整的方向处理或专业服务。',
          ],
        },
      ],
      callout: { type: 'callout', title: '观察三阶段 OCR 在本地运行', text: '上传清晰截图或文档照片，切换语言并查看文本块、置信度和阶段进度，图片无需发送到 OCR API。', href: '/image/ocr', linkLabel: '打开图片 OCR' },
      conclusion: '浏览器 OCR 的质量来自模型推理与传统后处理共同设计。把工作移入 Worker，缓存三个 session，分别匹配预处理，转移大缓冲，重建文本框与阅读顺序，并清楚说明剩余限制，才能形成完整工具。',
      faq: [
        { question: '为什么 OCR 需要三个模型？', answer: '检测负责找到文字位置，分类负责纠正倒置裁剪，识别才把每个裁剪变成字符。直接对整图做一次识别会浪费分辨率并丢失布局结构。' },
        { question: '为什么要把 OCR 放进 Web Worker？', answer: '图片预处理、连通区域分析和 ONNX 推理都很消耗 CPU。Worker 能保持主线程响应，并允许使用 OffscreenCanvas 远离 React 渲染完成像素处理。' },
        { question: '每次识别会把 ONNX 模型和图片一起上传吗？', answer: '不会。模型是下载到浏览器并缓存的静态应用资源；选中的图片字节只从页面转移到同一页面的 worker，不会提交到远程 OCR 接口。' },
        { question: '语言偏置为什么能改善识别？', answer: '多语言模型可能给外形接近的不同文字体系字符相似分数。软偏置可以在分数接近时优先选择目标文字，同时继续允许数字、拉丁字符和标点。' },
      ],
    },
  ),
  article(
    'merge-word-ppt-in-browser-openxml',
    {
      title: 'How to Merge Word and PowerPoint Files in the Browser with Open XML',
      excerpt: 'Merge DOCX and PPTX without Office automation by unpacking Open XML ZIP packages, copying relationship graphs, resolving part collisions, and rebuilding valid documents.',
      metaTitle: 'Merge Word and PowerPoint with Open XML',
      metaDescription: 'Learn how browser DOCX and PPTX merging works with ZIP, Open XML parts, relationship IDs, media and theme copying, content types, slide order, page breaks, and validation.',
      readingTime: '14 min read',
      tags: ['browser tool development', 'Open XML', 'DOCX merge', 'PPTX merge', 'document engineering'],
      relatedTools: [
        { label: 'Word Merger', href: '/file-merge/word', description: 'Merge multiple DOCX files locally while preserving related package parts.' },
        { label: 'PowerPoint Merger', href: '/file-merge/ppt', description: 'Append PPTX slides in source order and copy their dependent assets.' },
      ],
      lead: 'DOCX and PPTX files are ZIP packages containing XML parts, media, and relationship graphs. That makes browser merging possible without Microsoft Office, but it also means concatenating document.xml or copying slide XML alone is not enough.',
      intro: 'A correct merger must unzip each package, preserve order, allocate new relationship IDs, recursively copy images and dependent parts, rewrite relative targets, resolve filename collisions, update content types, and zip the result with the original Office MIME type.',
      sections: [
        {
          heading: 'Read Office files as package graphs',
          paragraphs: [
            'Open XML parts are connected by .rels files. A Word body can reference images, hyperlinks, numbering, headers, or embedded objects. A PowerPoint slide can reference a layout, master, theme, chart, notes, and media. Relationship targets are relative to the part that owns them.',
            'The package root also contains [Content_Types].xml, which tells Office how to interpret extensions and individual parts. Every copied destination part must retain an appropriate default or override content type.',
          ],
          table: { type: 'table', headers: ['Package concern', 'Word example', 'PowerPoint example'], rows: [
            ['Main content', 'word/document.xml', 'ppt/presentation.xml'],
            ['Ordered units', 'Body blocks', 'p:sldId list'],
            ['Relationships', 'word/_rels/document.xml.rels', 'ppt/_rels/presentation.xml.rels'],
            ['Dependent content', 'Images, headers, styles', 'Slides, layouts, themes, media'],
          ] },
        },
        {
          heading: 'Build a reusable recursive part copier',
          paragraphs: [
            'Given a source part and destination path, copy its bytes, copy its content type, parse its relationship file, and recursively copy every internal target. External links stay external. If the desired path already exists, allocate a merged suffix and rewrite the relationship target relative to the new owner part.',
            'Cache source-to-destination mappings during one import so shared layouts or media are copied once. A used-path set prevents two imports from claiming the same destination.',
          ],
          code: { type: 'code', language: 'typescript', code: openXmlCopyCode },
        },
        {
          heading: 'Merge Word bodies and rewrite relationship IDs',
          paragraphs: [
            'Use the first DOCX as the base package. Split its w:body from the surrounding document XML, remove section properties from intermediate bodies, and insert an explicit page break before each imported document. The final base section properties remain at the end.',
            'For every source document relationship, allocate a new rId in the base list, copy the target graph, and replace r:id, r:embed, r:link, or o:relid references inside the imported body. Without this rewrite, an image can point to another document’s unrelated relationship.',
          ],
          code: { type: 'code', language: 'typescript', code: wordMergeCode },
        },
        {
          heading: 'Merge PowerPoint by slide order, not filenames',
          paragraphs: [
            'Slide filenames are not the authoritative order. Read p:sldId entries from presentation.xml, resolve each r:id through presentation relationships, and only fall back to numeric slide filenames when the order list is unavailable.',
            'Assign a new slide part index, recursively copy the slide and dependencies, create a new presentation relationship, and append a p:sldId with an unused numeric ID. This preserves source order while avoiding collisions with existing slides.',
          ],
          items: [
            'Copy layouts, masters, themes, charts, notes, and media through relationships.',
            'Preserve external hyperlinks without trying to package their targets.',
            'Update [Content_Types].xml after all copied parts.',
            'Count slides again from the rebuilt package before reporting success.',
          ],
        },
        {
          heading: 'Why regex is acceptable only at controlled boundaries',
          paragraphs: [
            'This implementation uses targeted XML extraction and attribute rewriting for known Open XML structures. It is compact and browser-friendly, but regex is not a general XML parser. Namespace variations, unusual formatting, malformed packages, macros, signatures, and advanced Office features can exceed those assumptions.',
            'Validate expected main parts before modifying a package, keep transformations narrow, and open generated fixtures in multiple Office viewers. For high-fidelity enterprise merging, use a complete Open XML library or a server environment with Office-grade tooling.',
          ],
        },
        {
          heading: 'Security, limits, and output validation',
          paragraphs: [
            'ZIP packages can expand far beyond their compressed size. Limit file count, compressed bytes, and extracted entry count, and be alert to zip bombs. Do not execute macros or fetch external relationships while merging.',
            'A successful zip operation does not prove Office will accept the file. Verify required parts, relationship targets, content types, slide or body counts, and then open representative output in Word, PowerPoint, LibreOffice, and a web viewer.',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Try native Office package merging', text: 'Merge DOCX documents with images or PPTX decks with themes and media, then inspect the result in your preferred Office viewer.', href: '/file-merge', linkLabel: 'Open File Merge Tools' },
      conclusion: 'Browser Office merging works because DOCX and PPTX are package graphs, not opaque binaries. The reusable core is recursive relationship copying with collision-safe paths and content types; Word then merges bodies and rIds, while PowerPoint appends ordered slide relationships. Treat output validation as part of the algorithm.',
      faq: [
        { question: 'Why not concatenate DOCX XML bodies and stop there?', answer: 'Imported body elements reference relationship IDs for images, links, and other parts. Those IDs belong to the source package and can collide or point nowhere in the destination unless relationships and dependent files are copied and rewritten.' },
        { question: 'Why can a PowerPoint slide depend on many other files?', answer: 'A slide commonly references its layout, which references a master and theme, plus images, charts, notes, and embedded data. Copying the slide XML alone produces missing visuals or an invalid deck.' },
        { question: 'Does browser merging preserve every Office feature?', answer: 'No implementation should promise that without exhaustive compatibility work. Macros, signatures, advanced fields, custom XML, embedded objects, comments, and unusual namespace structures need dedicated handling and tests.' },
        { question: 'Are DOCX and PPTX really ZIP files?', answer: 'Yes. They follow the Open Packaging Conventions: XML and binary parts are stored in a ZIP container and connected through relationship files and content-type declarations.' },
      ],
    },
    {
      title: '怎么在浏览器合并 Word 和 PPT：Open XML 实现原理',
      excerpt: '无需 Office 自动化，通过解压 Open XML ZIP、复制关系图、解决 part 冲突并重建有效 DOCX 与 PPTX。',
      metaTitle: '浏览器合并 Word 和 PPT：Open XML 原理',
      metaDescription: '讲解 DOCX、PPTX 浏览器合并：ZIP、Open XML Part、关系 ID、媒体与主题复制、Content Types、幻灯片顺序和分页。',
      readingTime: '约 14 分钟阅读',
      tags: ['浏览器工具开发', 'Open XML', 'Word 合并', 'PPT 合并', '文档工程'],
      relatedTools: [
        { label: 'Word 合并', href: '/file-merge/word', description: '在浏览器本地合并多个 DOCX，并复制关联包资源。' },
        { label: 'PPT 合并', href: '/file-merge/ppt', description: '按源文件顺序追加 PPTX 幻灯片及其依赖资源。' },
      ],
      lead: 'DOCX 和 PPTX 本质上是包含 XML Part、媒体文件与关系图的 ZIP 包，所以浏览器无需安装 Microsoft Office 也能合并。但这也意味着，只拼接 document.xml 或复制 slide XML 远远不够。',
      intro: '正确合并必须解压每个包、保留顺序、分配新关系 ID、递归复制图片和依赖 Part、重写相对 target、解决文件名冲突、更新 Content Types，再用原始 Office MIME 重新打包。',
      sections: [
        {
          heading: '把 Office 文件理解成包关系图',
          paragraphs: [
            'Open XML Part 通过 .rels 文件连接。Word 正文可能引用图片、超链接、编号、页眉或嵌入对象；PowerPoint 幻灯片可能引用 layout、master、theme、chart、notes 和媒体。关系 target 都相对于拥有它的 Part。',
            '包根目录还有 [Content_Types].xml，用来声明扩展名和独立 Part 的内容类型。每个复制到目标包的新 Part 都必须获得正确 default 或 override。',
          ],
          table: { type: 'table', headers: ['包结构', 'Word 示例', 'PowerPoint 示例'], rows: [
            ['主内容', 'word/document.xml', 'ppt/presentation.xml'],
            ['有序单元', '正文块', 'p:sldId 列表'],
            ['关系文件', 'word/_rels/document.xml.rels', 'ppt/_rels/presentation.xml.rels'],
            ['依赖内容', '图片、页眉、样式', '幻灯片、布局、主题、媒体'],
          ] },
        },
        {
          heading: '实现可复用的递归 Part 复制器',
          paragraphs: [
            '给定源 Part 与目标路径，复制字节和 Content Type，解析关系文件，再递归复制全部内部 target。外部链接继续保持外部。如果目标路径已经存在，就分配 merged 后缀，并相对新的拥有者重写关系 target。',
            '一次导入期间缓存源到目标映射，避免共享 layout 或媒体重复复制。used-path 集合则防止多个来源争用同一目标。',
          ],
          code: { type: 'code', language: 'typescript', code: openXmlCopyCode },
        },
        {
          heading: '合并 Word 正文并重写关系 ID',
          paragraphs: [
            '使用第一个 DOCX 作为基础包，从 document XML 中拆出 w:body，移除中间正文的 sectPr，并在每个导入文档前插入明确分页符，最终保留基础文档末尾的 section properties。',
            '对源文档每条 relationship，在基础列表中分配新 rId，复制目标关系图，再替换导入正文里的 r:id、r:embed、r:link 或 o:relid。缺少这一步时，图片可能指向基础文档里完全无关的关系。',
          ],
          code: { type: 'code', language: 'typescript', code: wordMergeCode },
        },
        {
          heading: 'PowerPoint 按幻灯片顺序合并，而不是按文件名',
          paragraphs: [
            'slide 文件名不是权威顺序。应读取 presentation.xml 的 p:sldId，通过 presentation relationships 解析 r:id；只有顺序列表不可用时，才退回按数字 slide 文件名排序。',
            '为每张导入幻灯片分配新 part index，递归复制它与全部依赖，创建新的 presentation relationship，再追加一个未使用 numeric ID 的 p:sldId。这样既保留源顺序，又不会撞上已有幻灯片。',
          ],
          items: [
            '通过关系递归复制 layout、master、theme、chart、notes 和媒体。',
            '外部超链接保留为外部，不尝试把目标打进包里。',
            '所有 Part 复制后更新 [Content_Types].xml。',
            '报告成功前，从重建包重新统计幻灯片数量。',
          ],
        },
        {
          heading: '正则只适合受控 XML 边界',
          paragraphs: [
            '当前实现针对已知 Open XML 结构进行有限提取与属性替换，体积小、适合浏览器，但正则不是通用 XML Parser。命名空间变化、特殊格式、损坏包、宏、签名和高级 Office 功能都可能超出假设。',
            '修改前先验证主 Part，只进行狭窄转换，并用多个 Office 查看器打开测试产物。要求企业级高保真时，应改用完整 Open XML 库或带 Office 级工具的服务端环境。',
          ],
        },
        {
          heading: '安全限制与结果验证',
          paragraphs: [
            'ZIP 解压体积可能远大于压缩文件。应限制文件数、压缩字节与解压条目数，防范 zip bomb；合并过程中不要执行宏，也不要请求外部 relationship。',
            'zip 成功并不代表 Office 会接受文件。要验证必需 Part、关系 target、Content Type、正文或幻灯片数量，再用 Word、PowerPoint、LibreOffice 和网页查看器打开代表性结果。',
          ],
        },
      ],
      callout: { type: 'callout', title: '体验原生 Office 包合并', text: '尝试合并带图片的 DOCX 或带主题和媒体的 PPTX，再用常用 Office 查看器检查结果。', href: '/file-merge', linkLabel: '打开文件合并工具' },
      conclusion: '浏览器能合并 Office 文件，是因为 DOCX 与 PPTX 是包关系图而非不透明二进制。可复用核心是支持路径冲突和 Content Type 的递归关系复制；Word 再合并正文与 rId，PowerPoint 则追加有序 slide relationship。输出验证也是算法的一部分。',
      faq: [
        { question: '为什么不能只拼接 DOCX 的正文 XML？', answer: '导入正文中的图片和链接会引用源包 relationship ID。这些 ID 在目标包里可能冲突或不存在，必须复制关系和依赖文件并重写引用。' },
        { question: '为什么一张 PPT 幻灯片会依赖很多文件？', answer: '幻灯片通常引用 layout，layout 又引用 master 和 theme，同时还可能有图片、图表、备注与嵌入数据。只复制 slide XML 会丢失视觉或生成无效文件。' },
        { question: '浏览器合并能保留所有 Office 功能吗？', answer: '没有经过完整兼容工程就不能承诺。宏、签名、高级字段、自定义 XML、嵌入对象、批注和特殊命名空间都需要专门处理与测试。' },
        { question: 'DOCX 和 PPTX 真的是 ZIP 文件吗？', answer: '是。它们遵循 Open Packaging Conventions，XML 和二进制 Part 存在 ZIP 容器里，并通过关系文件与 Content Type 声明连接。' },
      ],
    },
  ),
  article(
    'convert-pdf-to-word-in-browser',
    {
      title: 'How to Convert PDF to Word in the Browser with pdf.js and Open XML',
      excerpt: 'Extract positioned PDF text with pdf.js, rebuild readable lines, preserve page breaks, and generate a minimal editable DOCX package entirely in the browser.',
      metaTitle: 'Convert PDF to Word in the Browser',
      metaDescription: 'Build browser PDF-to-Word conversion with pdf.js text extraction, coordinate-based line grouping, XML escaping, page breaks, and a minimal zipped Open XML DOCX package.',
      readingTime: '10 min read',
      tags: ['browser tool development', 'PDF to Word', 'pdf.js', 'Open XML', 'document engineering'],
      relatedTools: [
        { label: 'PDF to Word', href: '/pdf/to-word', description: 'Extract text from a PDF and create an editable DOCX locally in the browser.' },
        { label: 'Image OCR', href: '/image/ocr', description: 'Recognize text from scanned page images when the PDF has no text layer.' },
      ],
      lead: 'PDF and Word solve opposite layout problems. PDF stores a fixed visual page; Word stores editable document structure. A browser converter can reliably recover the text layer into a clean DOCX, but it cannot infer every table, column, font, or image relationship from coordinates alone.',
      intro: 'This implementation deliberately targets readable, editable text. pdf.js extracts text items and transforms, a coordinate heuristic rebuilds lines, XML escaping protects the document, and fflate packages a minimal Open XML Word file with explicit page breaks.',
      sections: [
        {
          heading: 'Define the conversion promise narrowly',
          paragraphs: [
            'A text-layer PDF contains glyph strings and placement transforms, not semantic paragraphs. A scan can contain no text items at all. State that the result is editable extracted text with page boundaries, not a pixel-perfect reconstruction of the source design.',
            'This boundary makes the tool useful for quotes, reports, notes, and copy recovery while avoiding a false promise for complex brochures, forms, equations, and multi-column layouts.',
          ],
          table: { type: 'table', headers: ['Source feature', 'This pipeline'], rows: [
            ['Selectable PDF text', 'Extracted into Word paragraphs'],
            ['Original page boundaries', 'Preserved with page breaks'],
            ['Scanned image-only page', 'Requires OCR first'],
            ['Tables and columns', 'May flatten into reading-order lines'],
            ['Images and exact typography', 'Not reconstructed'],
          ] },
        },
        {
          heading: 'Load pdf.js and extract positioned text',
          paragraphs: [
            'Dynamically import the legacy pdf.js browser build and point GlobalWorkerOptions.workerSrc to its bundled worker. Read the selected File into Uint8Array, load the document with system fonts enabled, and process pages in order.',
            'Each text item provides a string plus a transform. The fifth and sixth transform values act as x and y positions for a lightweight reconstruction. Normalize whitespace and ignore empty or non-text items.',
          ],
          code: { type: 'code', language: 'typescript', code: pdfTextCode },
        },
        {
          heading: 'Rebuild lines with a coordinate tolerance',
          paragraphs: [
            'Sort items top-to-bottom by descending y and left-to-right by x. Items whose y values are within a small tolerance join the same line, then each line is sorted by x and concatenated. This handles ordinary single-column text without requiring a layout model.',
            'The tolerance is a heuristic. Superscripts, rotated text, vertical writing, columns, tables, and positioned labels can produce unexpected order. A more advanced system needs block segmentation and column detection before line grouping.',
          ],
          items: [
            'Limit text items per page to bound pathological inputs.',
            'Preserve page order even when one page has no usable text.',
            'Reject the conversion when the entire document has zero paragraphs.',
            'Return page and paragraph counts so the UI can describe the result.',
          ],
        },
        {
          heading: 'Generate a minimal valid DOCX package',
          paragraphs: [
            'A DOCX is an Open XML ZIP. The minimal package needs [Content_Types].xml, root relationships, core and application properties, and word/document.xml. Each reconstructed line becomes a w:p paragraph, and each source page after the first begins with a Word page break.',
            'Escape XML control characters, ampersands, angle brackets, quotes, and apostrophes before inserting user text. xml:space="preserve" prevents Word from discarding intended surrounding spaces.',
          ],
          code: { type: 'code', language: 'typescript', code: docxCode },
        },
        {
          heading: 'Handle scanned PDFs as a separate OCR workflow',
          paragraphs: [
            'If pdf.js returns no usable text, the page may be a scan or the text may be encoded in a way the extractor cannot recover. Silently generating an empty Word file is worse than returning an empty_text error.',
            'A scan-to-Word feature requires rendering each page to an image, running OCR, mapping recognized blocks back into reading order, and then building DOCX. That is a different pipeline with model downloads, image limits, language selection, and lower certainty.',
          ],
        },
        {
          heading: 'Validate inputs and release output resources',
          paragraphs: [
            'Check empty input, PDF type, and maximum bytes before importing pdf.js. Catch encrypted, damaged, or unsupported PDFs as load failures. The UI should create one object URL for the result and revoke the previous URL when a new file is selected or the component unmounts.',
            'Test output in Word, LibreOffice, and web viewers. A syntactically valid Open XML package can still expose ordering or Unicode problems that only appear in a real document application.',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Try text-layer PDF recovery', text: 'Choose a PDF with selectable text, convert it locally, and compare page count and paragraph count before opening the DOCX.', href: '/pdf/to-word', linkLabel: 'Open PDF to Word' },
      conclusion: 'A focused PDF-to-Word converter can be small and honest: extract positioned text, group lines with a documented heuristic, preserve page breaks, escape XML, and package a minimal DOCX. Scans and high-fidelity layout reconstruction belong to separate, more complex pipelines.',
      faq: [
        { question: 'Why does the Word output not look exactly like the PDF?', answer: 'PDF stores fixed-position page content, while Word needs flowing document structure. This converter prioritizes editable text and page boundaries rather than reconstructing fonts, columns, images, and precise geometry.' },
        { question: 'Why does a scanned PDF produce no text?', answer: 'A scan often contains page images without a selectable text layer. pdf.js can render those images but cannot invent text; OCR must recognize the pixels first.' },
        { question: 'Why build DOCX manually instead of using a large document library?', answer: 'For a text-only result, the required Open XML package is small and deterministic. A full library becomes valuable when adding styles, tables, images, headers, numbering, and richer layout.' },
        { question: 'Does the PDF leave the browser?', answer: 'Not in this conversion path. pdf.js reads the selected bytes in the page and the DOCX is generated as a local Blob. Application and worker assets still need to be delivered to the browser.' },
      ],
    },
    {
      title: '怎么用 pdf.js 在浏览器把 PDF 转成 Word',
      excerpt: '使用 pdf.js 提取带坐标的 PDF 文本，重建可读行、保留分页，并在浏览器中生成最小可编辑 DOCX。',
      metaTitle: 'pdf.js 浏览器 PDF 转 Word 实现原理',
      metaDescription: '讲解浏览器 PDF 转 Word：pdf.js 文本提取、坐标分行、XML 转义、分页符与最小 Open XML DOCX ZIP 打包。',
      readingTime: '约 10 分钟阅读',
      tags: ['浏览器工具开发', 'PDF 转 Word', 'pdf.js', 'Open XML', '文档工程'],
      relatedTools: [
        { label: 'PDF 转 Word', href: '/pdf/to-word', description: '在浏览器本地提取 PDF 文本并生成可编辑 DOCX。' },
        { label: '图片 OCR', href: '/image/ocr', description: '当 PDF 没有文本层时，先从扫描页面图片识别文字。' },
      ],
      lead: 'PDF 和 Word 解决的是相反布局问题：PDF 保存固定视觉页面，Word 保存可编辑文档结构。浏览器转换器可以可靠地把文本层恢复成干净 DOCX，但仅靠坐标无法推断所有表格、分栏、字体和图片关系。',
      intro: '这套实现明确以“可读、可编辑文本”为目标。pdf.js 提取文字和 transform，坐标启发式重建行，XML 转义保护文档，fflate 再把最小 Open XML Word 包与分页符打包出来。',
      sections: [
        {
          heading: '先缩小并说明转换承诺',
          paragraphs: [
            '带文本层的 PDF 包含字形字符串和位置 transform，并不包含语义段落；扫描件甚至可能完全没有文字项。应明确结果是带分页的可编辑提取文本，不是源设计的像素级复刻。',
            '这个边界让工具适合引用、报告、笔记和文案恢复，同时不会对复杂宣传册、表单、公式和多栏排版作出错误承诺。',
          ],
          table: { type: 'table', headers: ['源 PDF 能力', '这套流水线的结果'], rows: [
            ['可选择文本', '提取为 Word 段落'],
            ['原始分页', '通过分页符保留'],
            ['纯扫描图片页', '需要先做 OCR'],
            ['表格和分栏', '可能被压平成阅读顺序文本'],
            ['图片和精确字体', '不重建'],
          ] },
        },
        {
          heading: '加载 pdf.js 并提取带坐标文字',
          paragraphs: [
            '动态 import pdf.js legacy browser build，并把 GlobalWorkerOptions.workerSrc 指向打包的 worker。选择的 File 读取成 Uint8Array，开启系统字体加载文档，再按顺序处理每一页。',
            '每个文本项提供字符串和 transform，第五、第六个值可以作为轻量重建所需的 x、y 位置。规范空白，并忽略空字符串和非文本项。',
          ],
          code: { type: 'code', language: 'typescript', code: pdfTextCode },
        },
        {
          heading: '用坐标容差重建文本行',
          paragraphs: [
            '先按 y 从上到下、x 从左到右排序。y 值差小于容差的文本项进入同一行，每行再按 x 排序并拼接。普通单栏文本不需要布局模型也能得到较好结果。',
            '容差只是启发式。上标、旋转文字、竖排、分栏、表格和定位标签可能产生意外顺序。更高级方案要先做 block segmentation 与分栏检测。',
          ],
          items: [
            '限制每页最大文本项，约束异常输入。',
            '某页没有可用文字时仍然保留页序。',
            '整份文档段落数为零时返回 empty_text。',
            '返回页数和段落数，让 UI 描述结果。',
          ],
        },
        {
          heading: '生成最小有效 DOCX 包',
          paragraphs: [
            'DOCX 是 Open XML ZIP。最小包需要 [Content_Types].xml、根关系、核心与应用属性、word/document.xml。每一条重建文本行成为 w:p，第一页之后的每个源页面前插入 Word 分页符。',
            '用户文本写入 XML 前要去除非法控制字符并转义 &、尖括号、引号和单引号。xml:space="preserve" 可以防止 Word 丢掉预期空格。',
          ],
          code: { type: 'code', language: 'typescript', code: docxCode },
        },
        {
          heading: '扫描 PDF 应走单独 OCR 流程',
          paragraphs: [
            'pdf.js 没有返回可用文字时，页面可能是扫描图，或文字编码无法被提取。静默生成空 Word 比返回 empty_text 更糟。',
            '扫描转 Word 需要先把每页渲染成图片，运行 OCR，把识别块映射回阅读顺序，再生成 DOCX。这是另一条带模型下载、图片限制、语言选择和更低确定性的流水线。',
          ],
        },
        {
          heading: '校验输入并释放输出资源',
          paragraphs: [
            'import pdf.js 前先检查空文件、PDF 类型和最大字节数。加密、损坏或不支持的 PDF 统一作为加载失败处理。UI 为结果创建一个 Object URL，并在选择新文件或组件卸载时 revoke 旧 URL。',
            '用 Word、LibreOffice 和网页查看器测试输出。语法有效的 Open XML 包仍可能出现只有真实文档应用才能发现的顺序或 Unicode 问题。',
          ],
        },
      ],
      callout: { type: 'callout', title: '体验文本层 PDF 恢复', text: '选择一份能够选中文字的 PDF，在本地转换，并在打开 DOCX 前比较页数与段落数。', href: '/pdf/to-word', linkLabel: '打开 PDF 转 Word' },
      conclusion: '聚焦文本的 PDF 转 Word 可以既小又诚实：提取带位置文字、用明确启发式分行、保留分页、转义 XML，再生成最小 DOCX。扫描件和高保真版式恢复属于另一条更复杂的流水线。',
      faq: [
        { question: '为什么 Word 结果和 PDF 版式不完全一样？', answer: 'PDF 保存固定坐标内容，Word 需要流式文档结构。这套转换优先恢复可编辑文本与分页，不重建字体、分栏、图片和精确几何。' },
        { question: '为什么扫描 PDF 转换后没有文字？', answer: '扫描件通常只有页面图片，没有可选择文本层。pdf.js 可以渲染图片，但不会凭空产生文字，必须先运行 OCR。' },
        { question: '为什么不直接使用大型 DOCX 库？', answer: '纯文本结果需要的 Open XML 包很小且可预测。需要样式、表格、图片、页眉、编号和复杂布局时，完整文档库更有价值。' },
        { question: 'PDF 会离开浏览器吗？', answer: '这条转换路径不会。pdf.js 在页面中读取文件字节，DOCX 作为本地 Blob 生成；应用和 worker 资源仍需要由站点交付到浏览器。' },
      ],
    },
  ),
  article(
    'generate-ico-icns-in-browser',
    {
      title: 'How to Generate ICO and ICNS Files in the Browser',
      excerpt: 'Render a source image at multiple sizes, write ICO directory and DIB bytes, build big-endian ICNS chunks, and export portable icon packages without a server.',
      metaTitle: 'Generate ICO and ICNS Files in the Browser',
      metaDescription: 'Learn browser ICO and ICNS generation with Canvas resizing, BGRA bottom-up DIB pixels, ICO directories, PNG entries, big-endian ICNS chunks, multi-size output, and ZIP export.',
      readingTime: '12 min read',
      tags: ['browser tool development', 'ICO', 'ICNS', 'binary formats', 'Canvas'],
      relatedTools: [
        { label: 'Image to Icon', href: '/image/to-icon', description: 'Crop, scale, round, and export images as ICO, ICNS, or multi-size PNG ZIP packages.' },
        { label: 'Image Resizer', href: '/image/resize', description: 'Prepare source dimensions before building a multi-resolution icon.' },
      ],
      lead: 'ICO and ICNS are containers, not renamed PNG files. They store multiple representations for different display sizes, use different byte orders and directory structures, and require careful alpha, row order, and size metadata.',
      intro: 'A browser implementation can decode the source image, apply one normalized crop and scale transform to every target size, encode PNG previews, write Windows DIB entries for smaller ICO layers, build macOS ICNS chunks, and package both combined and per-size outputs.',
      sections: [
        {
          heading: 'Render every target from one normalized transform',
          paragraphs: [
            'Load the selected image through an object URL, validate file bytes and decoded pixel count, and keep the decoded element only as long as the editor needs it. A normalized transform contains scale, x/y offsets, and corner radius, so preview and every exported resolution use identical composition.',
            'For each configured size, create a fresh square canvas, clip a rounded rectangle if needed, enable high-quality smoothing, fit the source, apply user scale and offsets, then capture both ImageData and PNG bytes.',
          ],
          table: { type: 'table', headers: ['Format', 'Typical sizes', 'Container payload'], rows: [
            ['ICO', '16 through 256', 'DIB for small entries, PNG for 256'],
            ['ICNS', '16 through 1024', 'Typed PNG chunks'],
            ['PNG ZIP', '16 through 1024', 'Independent PNG files'],
          ] },
        },
        {
          heading: 'Write Windows DIB pixels correctly',
          paragraphs: [
            'Small ICO entries can use a 40-byte BITMAPINFOHEADER followed by 32-bit pixel data and an AND mask. The stored height is doubled because it includes the XOR color bitmap and mask. Pixels are BGRA rather than Canvas RGBA, and rows are stored bottom-up.',
            'Each AND-mask row is padded to a 32-bit boundary. With full alpha pixels the mask can remain zeroed, but its bytes and stride still belong to the DIB payload. For 256px entries, PNG bytes are widely supported and avoid the legacy width byte limit.',
          ],
          items: [
            'Write DIB numbers little-endian.',
            'Reverse row order from Canvas top-down to bitmap bottom-up.',
            'Swap red and blue channels to BGRA.',
            'Store 256 width and height as zero in the one-byte ICO directory fields.',
          ],
        },
        {
          heading: 'Build the ICO directory and offsets',
          paragraphs: [
            'An ICO begins with a six-byte header followed by one 16-byte directory record per image. Every record describes dimensions, color metadata, payload byte length, and absolute payload offset. Payloads are concatenated after the directory.',
            'Compute offsets cumulatively from the full directory size. One incorrect byte length shifts every following image and can make the entire icon unreadable even when individual PNG or DIB data is valid.',
          ],
          code: { type: 'code', language: 'typescript', code: icoCode },
        },
        {
          heading: 'Build ICNS with big-endian typed chunks',
          paragraphs: [
            'ICNS starts with ASCII icns plus the total container length. Each representation is a chunk containing a four-character type, chunk length, and payload. Modern sizes can store PNG data directly under size-specific chunk types.',
            'Unlike ICO fields, ICNS lengths are big-endian. Keep a size-to-chunk-type map, discard unsupported sizes deliberately, calculate total bytes before writing the header, and concatenate chunks in a predictable order.',
          ],
          code: { type: 'code', language: 'typescript', code: icnsCode },
        },
        {
          heading: 'Offer combined files and inspectable archives',
          paragraphs: [
            'The primary ICO or ICNS should contain all supported sizes. A ZIP of per-size ICO, ICNS, or PNG files is useful for debugging and platforms that request individual assets. Build both from the same rendered entry list so they cannot drift visually.',
            'Object URLs for source, combined output, and ZIP output need separate lifecycle tracking. Revoke old URLs when the user changes source, format, or transform, and revoke everything on unmount.',
          ],
        },
        {
          heading: 'Test icons in real consumers',
          paragraphs: [
            'A preview canvas cannot validate the container. Test ICO in Windows Explorer, shortcuts, browser favicon handling, and an icon inspector; test ICNS through macOS Finder or icon tooling. Check 16px legibility, transparency, rounded corners, and high-resolution representations.',
            'Do not upscale a tiny source and call it multi-resolution quality. Large exports preserve the same limited source detail, while small exports often need simpler shapes and stronger contrast than a single automatic downsample provides.',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Generate and inspect a real multi-size container', text: 'Adjust scale, position, and corner radius, export ICO or ICNS, and compare the combined file with its per-size ZIP.', href: '/image/to-icon', linkLabel: 'Open Image to Icon' },
      conclusion: 'Browser icon generation combines visual rendering with binary format engineering. Normalize one transform, render every target size, respect ICO DIB row and channel rules, switch endianness for ICNS, compute offsets exactly, and validate the container in actual operating-system consumers.',
      faq: [
        { question: 'Can I create an ICO by renaming a PNG file?', answer: 'No. An ICO has a header and image directory and may contain multiple PNG or DIB payloads. Renaming changes only the filename, not the container bytes.' },
        { question: 'Why is a 256px ICO directory size stored as zero?', answer: 'ICO directory width and height fields are one byte. The format defines zero as 256, allowing that special size without a wider field.' },
        { question: 'Why do ICO DIB rows run bottom-up?', answer: 'The legacy bitmap representation used by ICO follows Windows DIB conventions. Positive bitmap height stores the first row as the bottom row, unlike Canvas ImageData.' },
        { question: 'Why does ICNS use different byte order from ICO?', answer: 'They are independent platform formats. ICO structures use little-endian integer fields, while ICNS container and chunk lengths use big-endian values.' },
      ],
    },
    {
      title: '怎么在浏览器生成 ICO 和 ICNS 图标文件',
      excerpt: '从多尺寸 Canvas 渲染到 ICO 目录、DIB 像素、ICNS 大端序 Chunk 和 ZIP 导出，完整实现无需服务端的图标生成。',
      metaTitle: '浏览器生成 ICO 和 ICNS 的实现原理',
      metaDescription: '讲解浏览器生成 ICO、ICNS：Canvas 多尺寸、BGRA 倒序 DIB、ICO 目录、PNG 条目、大端序 ICNS Chunk 与 ZIP 导出。',
      readingTime: '约 12 分钟阅读',
      tags: ['浏览器工具开发', 'ICO', 'ICNS', '二进制格式', 'Canvas'],
      relatedTools: [
        { label: '图片转 Icon', href: '/image/to-icon', description: '裁剪、缩放、圆角处理并导出 ICO、ICNS 或多尺寸 PNG ZIP。' },
        { label: '图片尺寸修改', href: '/image/resize', description: '生成多分辨率图标前，先准备合适的源图片尺寸。' },
      ],
      lead: 'ICO 和 ICNS 是容器格式，不是改了扩展名的 PNG。它们会存储多个显示尺寸，使用不同字节序与目录结构，并对透明度、行顺序和尺寸元数据有明确要求。',
      intro: '浏览器可以解码源图，把统一裁剪与缩放变换应用到所有目标尺寸，编码 PNG 预览，为较小 ICO 层写入 Windows DIB，再构造 macOS ICNS Chunk，同时导出组合文件与独立尺寸包。',
      sections: [
        {
          heading: '所有目标尺寸使用同一个标准化变换',
          paragraphs: [
            '通过 Object URL 加载图片，先校验文件字节和解码后像素数，只在编辑期间保留图片元素。标准化 transform 包含 scale、x/y offset 与圆角半径，预览和每个输出分辨率都使用完全相同的构图。',
            '对每个配置尺寸创建独立正方形 Canvas，需要时裁剪圆角，开启高质量平滑，先适配源图，再叠加用户缩放与偏移，最后同时读取 ImageData 与 PNG 字节。',
          ],
          table: { type: 'table', headers: ['格式', '常见尺寸', '容器内容'], rows: [
            ['ICO', '16 到 256', '小尺寸使用 DIB，256 使用 PNG'],
            ['ICNS', '16 到 1024', '带类型的 PNG Chunk'],
            ['PNG ZIP', '16 到 1024', '独立 PNG 文件'],
          ] },
        },
        {
          heading: '正确写入 Windows DIB 像素',
          paragraphs: [
            '小尺寸 ICO 可以使用 40 字节 BITMAPINFOHEADER，后面跟 32 位像素和 AND mask。存储高度需要乘以二，因为同时包括 XOR 颜色位图与 mask。像素通道是 BGRA 而不是 Canvas RGBA，行顺序则是从下到上。',
            '每一行 AND mask 都要补齐到 32 位边界。使用完整 alpha 时 mask 可以全零，但它的字节和 stride 仍然属于 DIB。256px 条目通常直接保存 PNG，可以避开 ICO 单字节宽高上限。',
          ],
          items: [
            'DIB 数字使用小端序。',
            '把 Canvas 从上到下的行反转成位图从下到上。',
            '交换红蓝通道，生成 BGRA。',
            'ICO 目录中 256 的宽高字段写成零。',
          ],
        },
        {
          heading: '构造 ICO 目录与数据偏移',
          paragraphs: [
            'ICO 从六字节 header 开始，后面每张图片占一个 16 字节目录项。目录项描述宽高、颜色信息、payload 长度和绝对 offset，全部 payload 则依次拼在目录之后。',
            'offset 要从完整目录总长度开始累计。任何一个字节长度写错，都会让后面全部图片错位，即使单独的 PNG 或 DIB 数据本身正确，整个图标也可能无法读取。',
          ],
          code: { type: 'code', language: 'typescript', code: icoCode },
        },
        {
          heading: '使用大端序 Typed Chunk 构造 ICNS',
          paragraphs: [
            'ICNS 以 ASCII 字符 icns 和容器总长度开头。每个图像表示是一个 Chunk，包含四字符类型、Chunk 长度与 payload。现代尺寸可以在对应类型下直接存储 PNG 数据。',
            '与 ICO 相反，ICNS 长度是大端序。维护尺寸到 Chunk Type 的映射，明确忽略不支持的尺寸，写 header 前先计算总字节，并按稳定顺序拼接 Chunk。',
          ],
          code: { type: 'code', language: 'typescript', code: icnsCode },
        },
        {
          heading: '同时提供组合文件和可检查归档',
          paragraphs: [
            '主 ICO 或 ICNS 应包含全部支持尺寸。单尺寸 ICO、ICNS 或 PNG ZIP 适合调试，也能满足部分平台要求独立资产的场景。两种产物应来自同一份渲染 entry，避免视觉漂移。',
            '源图、组合输出和 ZIP 输出需要分别追踪 Object URL 生命周期。用户更换源图、格式或变换后 revoke 旧 URL，组件卸载时全部释放。',
          ],
        },
        {
          heading: '必须在真实消费者中测试',
          paragraphs: [
            '预览 Canvas 无法验证容器。ICO 应在 Windows Explorer、快捷方式、浏览器 favicon 和图标检查器中测试；ICNS 则要用 macOS Finder 或图标工具检查。重点关注 16px 可读性、透明、圆角和高分辨率层。',
            '不要把小源图放大后称为多分辨率质量。大尺寸输出仍然只有有限源细节，而小尺寸图标往往需要比自动缩放更简单的形状和更强对比度。',
          ],
        },
      ],
      callout: { type: 'callout', title: '生成并检查真实多尺寸容器', text: '调整缩放、位置与圆角，导出 ICO 或 ICNS，再对比组合文件和单尺寸 ZIP。', href: '/image/to-icon', linkLabel: '打开图片转 Icon' },
      conclusion: '浏览器图标生成同时涉及视觉渲染与二进制格式工程。标准化一份变换，渲染全部目标尺寸，遵守 ICO DIB 行与通道规则，为 ICNS 切换字节序，准确计算 offset，并在真实操作系统消费者中验证。',
      faq: [
        { question: '把 PNG 扩展名改成 ICO 可以吗？', answer: '不可以。ICO 包含 header 与图像目录，还可能装入多个 PNG 或 DIB payload。改名只改变文件名，不会改变容器字节。' },
        { question: '为什么 ICO 目录里的 256px 尺寸写成 0？', answer: 'ICO 的宽高字段只有一个字节，格式规定零代表 256，从而在不扩展字段的情况下支持这个特殊尺寸。' },
        { question: '为什么 ICO DIB 像素行要从下往上？', answer: 'ICO 使用的传统位图表示遵循 Windows DIB 约定。正高度位图的第一行代表底部，与 Canvas ImageData 相反。' },
        { question: '为什么 ICNS 和 ICO 的字节序不同？', answer: '它们是两个独立平台格式。ICO 结构中的整数使用小端序，ICNS 容器与 Chunk 长度则使用大端序。' },
      ],
    },
  ),
];
