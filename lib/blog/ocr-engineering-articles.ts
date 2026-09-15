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

const workerRequestCode = `const worker = new Worker(
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

const paddlePipelineCode = `const ocr = await PaddleOCR.create({
  lang: toPaddleLanguage(language),
  ocrVersion: 'PP-OCRv5',
  textDetectionModelName: 'PP-OCRv5_mobile_det',
  textDetectionModelAsset: {
    url: '/models/paddleocr/ppocr-v5/PP-OCRv5_mobile_det_onnx_infer.tar',
  },
  textRecognitionModelName: 'PP-OCRv5_mobile_rec',
  textRecognitionModelAsset: {
    url: '/models/paddleocr/ppocr-v5/PP-OCRv5_mobile_rec_onnx_infer.tar',
  },
  sourceToMat: sourceToMatInWorker,
  ortOptions: {
    backend: 'wasm',
    wasmPaths: {
      mjs: '/models/paddleocr/onnxruntime-web/ort-wasm-simd-threaded.mjs',
      wasm: '/models/paddleocr/onnxruntime-web/ort-wasm-simd-threaded.wasm',
    },
    numThreads: 1,
    simd: true,
    proxy: false,
  },
});

const [result] = await ocr.predict(image, {
  textDetLimitSideLen: 1280,
  textDetThresh: 0.24,
  textDetBoxThresh: 0.34,
  textDetUnclipRatio: 1.8,
  textRecScoreThresh: 0.28,
});`;

const heartbeatCode = `async function withProgressHeartbeat(progress, operation) {
  postProgress(progress);
  const heartbeat = setInterval(() => postProgress(progress), 10_000);
  try {
    return await operation();
  } finally {
    clearInterval(heartbeat);
  }
}

const IDLE_TIMEOUT = 180_000;
const MODEL_PHASE_TIMEOUT = 12 * 60_000;
const PROCESSING_PHASE_TIMEOUT = 6 * 60_000;

function failTimeout() {
  worker.terminate();
  cachedWorker = null;
  resolve({ ok: false, code: 'worker_timeout' });
}`;

const assetCheckCode = `for (const asset of pinnedOcrAssets) {
  if (!existsSync(asset.path)) {
    throw new Error(\`Pinned OCR asset is missing: \${asset.path}\`);
  }

  const actual = createHash('sha256')
    .update(readFileSync(asset.path))
    .digest('hex');

  if (actual !== asset.sha256) {
    throw new Error(\`OCR asset checksum mismatch: \${asset.path}\`);
  }
}`;

export const ocrEngineeringArticles: BlogArticle[] = [
  {
    slug: 'pp-ocrv5-paddleocr-js-browser-ocr-production',
    publishedAt: '2026-09-15',
    updatedAt: '2026-09-15',
    translations: {
      en: buildTranslation({
        title: 'How We Built Browser OCR with PP-OCRv5 and PaddleOCR JS',
        excerpt: 'A production PP-OCRv5 browser implementation with Web Workers, PaddleOCR JS, ONNX Runtime Web, same-origin models, runtime pinning, heartbeat timeouts, and deployment checks.',
        metaTitle: 'PP-OCRv5 Browser OCR with PaddleOCR JS',
        metaDescription: 'Build production browser OCR with PP-OCRv5, PaddleOCR JS, Web Workers, ONNX Runtime Web, same-origin models, heartbeat timeouts, and build checks.',
        readingTime: '16 min read',
        tags: ['PP-OCRv5', 'PaddleOCR JS', 'ONNX Runtime Web', 'Web Worker', 'browser OCR'],
        relatedTools: [
          { label: 'Image OCR', href: '/image/ocr', description: 'Recognize English, simplified Chinese, traditional Chinese, or Japanese text locally in the browser.' },
          { label: 'Image Tools', href: '/image', description: 'Process, inspect, convert, and export images with browser-local workflows.' },
        ],
        lead: 'Running a model locally is the easy part of browser OCR. Shipping a reliable feature means delivering the model and its runtime as one compatible unit, adapting a DOM-oriented library to a Worker, keeping the page responsive, and distinguishing a slow first load from a genuinely stalled task.',
        intro: 'ToolGarden now runs the PP-OCRv5 mobile detection and recognition pipeline through PaddleOCR JS inside a module Web Worker. The selected image never goes to an OCR API. This article explains the production architecture and the failures that shaped it, including a JavaScript/WASM ABI mismatch that originally appeared to users as a harmless timeout.',
        sections: [
          {
            heading: 'Use the complete PP-OCRv5 pipeline instead of a single recognizer',
            paragraphs: [
              'A recognition network expects an already cropped text line. Real screenshots and document photos first need text detection, geometric cropping, resizing, normalization, recognition, dictionary decoding, confidence filtering, and reading-order reconstruction. Calling one recognizer over the full image loses both resolution and layout.',
              'The production path delegates model-specific preprocessing and post-processing to PaddleOCR JS and uses the PP-OCRv5 mobile detection and recognition archives. This replaced an earlier hand-built ONNX pipeline. Reusing the maintained Paddle implementation reduced the thresholding, tensor shaping, crop handling, and decoder logic that the application had to own.',
            ],
            table: { type: 'table', headers: ['Layer', 'Responsibility', 'Production choice'], rows: [
              ['Application', 'Requests, progress, errors, and result formatting', 'Typed messages and request IDs'],
              ['PaddleOCR JS', 'Image conversion, model orchestration, and OCR post-processing', 'PP-OCRv5 pipeline'],
              ['ONNX Runtime Web', 'Execute ONNX graphs in the browser', 'WASM, SIMD, one thread'],
              ['Static delivery', 'Serve runtime and model bytes', 'Pinned same-origin assets'],
            ] },
          },
          {
            heading: 'Keep decoding and inference inside a module Worker',
            paragraphs: [
              'OpenCV preprocessing and ONNX inference are CPU-heavy enough to freeze input, scrolling, and React updates when they run on the main thread. The page therefore maintains a reusable module Worker. Every recognition request gets an ID, and responses that do not match that ID are ignored.',
              'The image enters the Worker as a transferable ArrayBuffer. Ownership moves instead of cloning the whole file, which avoids a second large allocation. Temporary listeners are removed when the Promise settles, while a failed Worker is terminated and removed from the cache so the next click starts from a clean runtime.',
            ],
            code: { type: 'code', language: 'typescript', code: workerRequestCode },
          },
          {
            heading: 'Bridge browser DOM assumptions inside the Worker',
            paragraphs: [
              'A Worker has Blob, createImageBitmap, ImageData, and OffscreenCanvas, but it does not have document, HTMLCanvasElement, HTMLImageElement, or HTMLVideoElement. Some image libraries still perform instanceof checks against those globals even when the actual source is a Blob. That caused the sequence of document is not defined and HTMLImageElement is not defined failures.',
              'The Worker installs a narrow compatibility shim before PaddleOCR initializes. Canvas creation maps to OffscreenCanvas, image decoding uses createImageBitmap, and the custom sourceToMat adapter draws into a 2D offscreen context before calling OpenCV matFromImageData. The adapter returns a dispose function that deletes the Mat and closes the ImageBitmap, because WASM and bitmap memory should not wait for ordinary JavaScript garbage collection.',
            ],
            items: [
              'Only emulate the DOM members the dependency actually reads.',
              'Reject unsupported source types instead of creating a broad fake document.',
              'Delete every OpenCV Mat and close every ImageBitmap after use.',
              'Treat OffscreenCanvas support as a browser capability requirement.',
            ],
          },
          {
            heading: 'Configure PP-OCRv5 and ONNX Runtime explicitly',
            paragraphs: [
              'The detection and recognition archive URLs are passed explicitly instead of allowing the package to discover remote defaults. UI languages map to Paddle language identifiers, while OCR instances are cached by language. The first request pays the initialization cost and later requests reuse the prepared pipeline.',
              'ONNX Runtime uses its WASM backend with SIMD enabled, proxy mode disabled, and one thread. A single thread works without cross-origin isolation and is easier to deploy on static hosting. The 1280-pixel detection limit retains useful text detail; relaxed detection thresholds reduce missed small text, while the recognition score threshold removes weak output.',
            ],
            code: { type: 'code', language: 'typescript', code: paddlePipelineCode },
          },
          {
            heading: 'Ship model and runtime files from the same origin',
            paragraphs: [
              'Depending on a third-party model host makes OCR availability depend on CORS policy, regional routing, CDN uptime, and whether that host keeps the same files forever. The PP-OCRv5 detection and recognition archives are therefore published under the application model path. They are about 4.8 MB and 16.7 MB, so each remains below the hosting platform single-file limit.',
              'The ONNX Runtime JavaScript entry and WASM loader must also be delivered as a matched set. Their APIs form an ABI. During debugging, a hoisted 1.21 JavaScript entry loaded a 1.24.3 WASM binary and failed with _OrtGetInputName is not a function. The UI only showed OCR worker timed out because no result message escaped failed initialization. Vendoring the exact 1.24.3 browser entry removed dependency-hoisting ambiguity.',
            ],
            table: { type: 'table', headers: ['Asset', 'Delivery rule', 'Reason'], rows: [
              ['PP-OCRv5 detection model', 'Same-origin static file', 'No third-party runtime dependency'],
              ['PP-OCRv5 recognition model', 'Same-origin static file', 'Predictable caching and availability'],
              ['ORT JavaScript entry', 'Vendored exact version', 'Prevents package-hoisting drift'],
              ['ORT MJS and WASM', 'Pinned matching pair', 'Preserves JS/WASM ABI compatibility'],
            ] },
          },
          {
            heading: 'Model progress, inactivity, and total duration are different clocks',
            paragraphs: [
              'A single four-minute timer looked simple but was semantically wrong. On a slow first visit, model download, archive extraction, OpenCV startup, and session compilation can take a long time while the task remains healthy. Conversely, a dead Worker should not occupy the UI until a generous total timer expires.',
              'The Worker now emits a progress heartbeat every ten seconds around long model initialization and prediction calls. The page resets a three-minute inactivity timer whenever a matching message arrives. It also maintains separate hard limits for the model and processing phases. This permits slow but active work while still bounding a task that keeps emitting stale heartbeats forever.',
            ],
            code: { type: 'code', language: 'typescript', code: heartbeatCode },
          },
          {
            heading: 'Convert Paddle results into a stable application contract',
            paragraphs: [
              'Library output is translated into an application-owned discriminated union. A successful response contains plain text, individual blocks, confidence, axis-aligned boxes, source dimensions, and duration. Failures use stable codes such as model_load_failed, worker_timeout, recognition_failed, and no_text_detected, so the UI can localize messages without parsing exception strings.',
              'Paddle polygons are reduced to display boxes, blank and low-confidence items are removed, and remaining blocks are grouped into rows using vertical center and average line height. Each row is sorted left to right and rows are sorted top to bottom before their text is joined with newlines. This is deliberately modest layout reconstruction: predictable for common documents, but not a claim of perfect table or multi-column recovery.',
            ],
          },
          {
            heading: 'Make deployment verify the OCR supply chain',
            paragraphs: [
              'Pinning package.json is not enough when static binaries can be copied, cached, or replaced independently. The production hardening step computes SHA-256 for the vendored ONNX Runtime entry, its MJS and WASM files, and both PP-OCRv5 archives. A missing or changed asset fails the build instead of producing a deployment that breaks only after a user uploads an image.',
              'The export also checks hosting limits and stamps the Service Worker cache name from the built static contents. Without a content-derived cache generation, an old Worker bundle can survive a deployment under a stable chunk URL and continue reporting errors after the source has been fixed.',
            ],
            code: { type: 'code', language: 'javascript', code: assetCheckCode },
          },
        ],
        callout: { type: 'callout', title: 'Run the production PP-OCRv5 pipeline', text: 'Upload a screenshot or document photo, choose a language, and watch the model and recognition stages run locally without sending the image to an OCR API.', href: '/image/ocr', linkLabel: 'Open Image OCR' },
        conclusion: 'Reliable browser OCR is a systems problem as much as a model problem. PP-OCRv5 supplies recognition quality, while the surrounding engineering supplies responsiveness, deterministic assets, ABI compatibility, recoverable failures, truthful progress, and deployment safety. Treating those pieces as one pipeline is what turns a local demo into a usable product.',
        faq: [
          { question: 'Does the selected image leave the browser?', answer: 'No. The application downloads model and runtime assets, then transfers the image bytes to a Worker in the same page. It does not post the image to a remote OCR service.' },
          { question: 'Why use a Web Worker for OCR?', answer: 'Image preprocessing, OpenCV operations, and ONNX inference are CPU-heavy. A Worker keeps the main thread responsive and allows OffscreenCanvas preprocessing away from React rendering.' },
          { question: 'Why not use a fixed total timeout?', answer: 'A slow first load may still be making progress, while a crashed Worker may be completely silent. Heartbeats plus inactivity and phase limits distinguish those cases and give each one the correct recovery behavior.' },
          { question: 'Why must ONNX Runtime JavaScript and WASM versions match?', answer: 'The JavaScript wrapper calls exported functions in the WASM binary. Different releases can expose different symbols and calling conventions, so mixing versions can fail during session initialization even though both files load successfully.' },
          { question: 'Why self-host the PP-OCRv5 models?', answer: 'Same-origin assets remove runtime dependence on a third-party host, CORS configuration, regional routing, and mutable remote files. They also make cache policy and integrity verification part of the application deployment.' },
          { question: 'Will it preserve tables and document layout?', answer: 'It returns text blocks and approximate reading order, not a full document reconstruction. Tables, columns, handwriting, curved text, perspective distortion, and low-contrast photos still require review or a more specialized pipeline.' },
        ],
      }, 'Key takeaways'),
      zh: buildTranslation({
        title: '我们如何用 PP-OCRv5 和 PaddleOCR JS 实现浏览器本地 OCR',
        excerpt: '一套可用于生产环境的 PP-OCRv5 浏览器实现，涵盖 Web Worker、PaddleOCR JS、ONNX Runtime Web、模型同源托管、运行时锁定、心跳超时和部署校验。',
        metaTitle: 'PP-OCRv5 浏览器 OCR 技术实现',
        metaDescription: '介绍生产级浏览器 OCR：PP-OCRv5、PaddleOCR JS、Web Worker、ONNX Runtime Web、模型同源托管、心跳超时与构建校验。',
        readingTime: '约 16 分钟阅读',
        tags: ['PP-OCRv5', 'PaddleOCR JS', 'ONNX Runtime Web', 'Web Worker', '浏览器 OCR'],
        relatedTools: [
          { label: '图片 OCR', href: '/image/ocr', description: '在浏览器本地识别英文、简体中文、繁体中文或日文。' },
          { label: '图片工具', href: '/image', description: '通过浏览器本地流程处理、检查、转换和导出图片。' },
        ],
        lead: '让模型在浏览器里跑起来，只是本地 OCR 最容易的一步。真正稳定的功能还要把模型和运行时作为一个兼容整体交付，让偏向 DOM 的库适配 Worker，保持页面响应，并能区分首次加载较慢和任务已经失去响应。',
        intro: 'ToolGarden 目前通过 PaddleOCR JS，在 module Web Worker 中运行 PP-OCRv5 移动端检测与识别产线，用户选择的图片不会提交给 OCR API。本文基于真实生产代码，介绍这套架构以及排障过程中暴露的问题，包括一个最终表现为普通超时的 JavaScript/WASM ABI 不匹配。',
        sections: [
          {
            heading: '使用完整 PP-OCRv5 产线，而不是单独识别模型',
            paragraphs: [
              '识别网络接收的是已经裁好的文本行。真实截图和文档照片还需要先完成文本检测、几何裁剪、尺寸调整、归一化、文字识别、字典解码、置信度过滤和阅读顺序重建。直接对整张图调用一个识别模型，会同时损失文字分辨率和版面结构。',
              '生产实现把与模型强相关的预处理和后处理交给 PaddleOCR JS，并使用 PP-OCRv5 移动端检测与识别模型。这套方案替代了早期手写的 ONNX 流水线，应用不再自己维护大量阈值处理、张量整形、裁剪和解码代码。',
            ],
            table: { type: 'table', headers: ['层级', '职责', '生产实现'], rows: [
              ['应用层', '请求、进度、错误和结果格式', '类型化消息与请求 ID'],
              ['PaddleOCR JS', '图片转换、模型编排和 OCR 后处理', 'PP-OCRv5 完整产线'],
              ['ONNX Runtime Web', '在浏览器执行 ONNX 图', 'WASM、SIMD、单线程'],
              ['静态资源交付', '提供运行时和模型文件', '锁定版本的同源资源'],
            ] },
          },
          {
            heading: '把图片解码与推理留在 module Worker',
            paragraphs: [
              'OpenCV 预处理和 ONNX 推理都足以阻塞输入、滚动和 React 更新，因此页面只维护一个可复用的 module Worker。每次识别都会生成请求 ID，不匹配当前 ID 的响应不会结束错误的 Promise。',
              '图片以可转移 ArrayBuffer 进入 Worker，所有权直接转移，避免结构化克隆再复制一份大文件。请求结束时移除临时监听器；如果 Worker 崩溃或超时，则终止实例并清空缓存，让下一次点击从干净的运行时重新开始。',
            ],
            code: { type: 'code', language: 'typescript', code: workerRequestCode },
          },
          {
            heading: '在 Worker 中补齐必要的 DOM 边界',
            paragraphs: [
              'Worker 有 Blob、createImageBitmap、ImageData 和 OffscreenCanvas，却没有 document、HTMLCanvasElement、HTMLImageElement 或 HTMLVideoElement。部分图片库即使输入是 Blob，也会先对这些浏览器全局对象做 instanceof 检查，这正是 document is not defined 和 HTMLImageElement is not defined 两类报错的来源。',
              'PaddleOCR 初始化前，Worker 会安装一层很窄的兼容适配：canvas 创建映射到 OffscreenCanvas，图片通过 createImageBitmap 解码，自定义 sourceToMat 把像素画入离屏 2D context，再调用 OpenCV 的 matFromImageData。适配器同时返回 dispose，负责删除 Mat 并关闭 ImageBitmap，因为 WASM 和位图内存不能只等待普通 JavaScript 垃圾回收。',
            ],
            items: [
              '只模拟依赖真正读取的 DOM 成员。',
              '不支持的图片来源直接拒绝，不伪造完整 document。',
              '每个 OpenCV Mat 都要 delete，每个 ImageBitmap 都要 close。',
              '把 OffscreenCanvas 明确列为浏览器能力要求。',
            ],
          },
          {
            heading: '显式配置 PP-OCRv5 和 ONNX Runtime',
            paragraphs: [
              '检测与识别模型地址全部显式传入，不让依赖包自行发现远程默认文件。界面语言映射成 Paddle 的语言标识，OCR 实例按语言缓存，所以第一张图片承担初始化成本，后续请求直接复用准备好的产线。',
              'ONNX Runtime 使用 WASM 后端，开启 SIMD，关闭 proxy，并固定为一个线程。单线程不要求跨源隔离，在静态托管环境更容易部署，内存表现也更可控。检测最长边设为 1280，配合偏宽松的检测阈值保留小字；识别置信度阈值再过滤非常不可靠的结果。',
            ],
            code: { type: 'code', language: 'typescript', code: paddlePipelineCode },
          },
          {
            heading: '模型与运行时全部改为同源交付',
            paragraphs: [
              '运行时依赖第三方模型站点，会把 OCR 可用性同时交给 CORS、区域网络、CDN 状态以及对方是否长期保留同一文件。PP-OCRv5 检测和识别归档因此发布在应用自己的模型路径下，大小约为 4.8 MB 和 16.7 MB，均低于托管平台的单文件限制。',
              'ONNX Runtime 的 JavaScript 入口与 WASM loader 也必须作为匹配的一组资源交付。两者之间存在 ABI 契约：排障时，依赖提升让 1.21 的 JavaScript 入口加载了 1.24.3 的 WASM，最终报出 _OrtGetInputName is not a function。由于初始化没有返回结果消息，界面只显示 OCR worker timed out。把准确的 1.24.3 浏览器入口内置到仓库后，依赖提升不再能改变运行时组合。',
            ],
            table: { type: 'table', headers: ['资源', '交付规则', '目的'], rows: [
              ['PP-OCRv5 检测模型', '同源静态文件', '不依赖第三方模型站'],
              ['PP-OCRv5 识别模型', '同源静态文件', '缓存和可用性可控'],
              ['ORT JavaScript 入口', '内置精确版本', '避免依赖提升造成漂移'],
              ['ORT MJS 与 WASM', '锁定为匹配组合', '维持 JS/WASM ABI 兼容'],
            ] },
          },
          {
            heading: '模型进度、无响应和总时长是三种时钟',
            paragraphs: [
              '一个固定四分钟计时器看似简单，语义却不正确。首次访问时，模型下载、归档解包、OpenCV 启动和 session 编译可能很慢，但任务仍在健康推进；反过来，已经崩溃的 Worker 不应该等到一个宽松总时限结束才释放界面。',
              'Worker 现在会在模型初始化和 predict 这类长操作外，每十秒发送一次进度心跳。页面收到当前请求的任意消息后，就重置三分钟无响应计时器；同时，模型阶段和处理阶段各有独立硬上限。这样既允许缓慢但仍活跃的任务继续，也能阻止只发送陈旧心跳的异常任务无限运行。',
            ],
            code: { type: 'code', language: 'typescript', code: heartbeatCode },
          },
          {
            heading: '把 Paddle 结果转换成稳定的应用契约',
            paragraphs: [
              '依赖库输出会转换成应用自己拥有的判别联合类型。成功结果包含纯文本、各文字块、置信度、轴对齐坐标框、原图尺寸和耗时；失败则使用 model_load_failed、worker_timeout、recognition_failed、no_text_detected 等稳定代码，界面不需要解析异常字符串就能显示对应的本地化提示。',
              'Paddle 多边形会转换成展示用矩形框，空文本和低置信度结果会被过滤。剩余文本按垂直中心和平均行高归到不同行内，每行从左到右排序，各行再从上到下排序，最后用换行合并。这是一种克制的版面重建：常规文档结果稳定，但不会假装能完美还原表格或复杂分栏。',
            ],
          },
          {
            heading: '让部署过程校验 OCR 供应链',
            paragraphs: [
              '只在 package.json 锁定版本还不够，因为静态二进制文件可能被单独复制、缓存或替换。生产构建会对内置 ONNX Runtime 入口、MJS、WASM，以及两个 PP-OCRv5 模型归档计算 SHA-256。任一资源缺失或内容变化都会让构建失败，而不是部署一个只有用户上传图片后才会暴露问题的版本。',
              '静态导出还会检查托管文件限制，并根据实际构建内容给 Service Worker 缓存名打指纹。如果缓存代际不是由内容决定，旧 Worker bundle 可能在部署后继续命中稳定 chunk URL，让已经修复的代码看起来仍然报错。',
            ],
            code: { type: 'code', language: 'javascript', code: assetCheckCode },
          },
        ],
        callout: { type: 'callout', title: '运行生产版 PP-OCRv5 产线', text: '上传截图或文档照片，选择识别语言，观察模型和识别阶段在本地执行，图片不会发送给 OCR API。', href: '/image/ocr', linkLabel: '打开图片 OCR' },
        conclusion: '可靠的浏览器 OCR 既是模型问题，也是系统工程问题。PP-OCRv5 提供识别质量，外围工程则负责页面响应、资源确定性、ABI 兼容、错误恢复、真实进度和部署安全。只有把这些部分视为同一条产线，本地模型演示才能变成真正可用的产品。',
        faq: [
          { question: '用户选择的图片会离开浏览器吗？', answer: '不会。应用只从网络下载模型和运行时资源，图片字节会被转移到同一页面的 Worker，不会提交给远程 OCR 服务。' },
          { question: '为什么要把 OCR 放进 Web Worker？', answer: '图片预处理、OpenCV 操作和 ONNX 推理都很消耗 CPU。Worker 能保持主线程响应，并允许使用 OffscreenCanvas 远离 React 渲染完成像素处理。' },
          { question: '为什么不能只设置一个固定总超时？', answer: '缓慢的首次加载可能一直有进展，而崩溃的 Worker 可能完全沉默。心跳、无响应时限和阶段硬上限组合后，才能区分这两种情况并执行正确恢复。' },
          { question: '为什么 ONNX Runtime JavaScript 和 WASM 必须版本一致？', answer: 'JavaScript 包装层会调用 WASM 导出的函数。不同版本可能使用不同符号和调用约定，即使两个文件都能成功下载，也可能在创建 session 时失败。' },
          { question: '为什么要自己托管 PP-OCRv5 模型？', answer: '同源资源消除了第三方站点、CORS、区域网络和远程文件变化带来的运行时风险，也让缓存策略和完整性校验能够进入应用自己的部署流程。' },
          { question: 'OCR 能保留表格和原始文档版式吗？', answer: '当前输出包含文字块和近似阅读顺序，不是完整文档重建。表格、分栏、手写、曲线文字、透视变形和低对比照片仍需要人工检查或更专业的产线。' },
        ],
      }, '总结'),
    },
  },
];
