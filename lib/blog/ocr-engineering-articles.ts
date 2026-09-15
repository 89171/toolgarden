import type { BlogArticle, BlogArticleTranslation, BlogBlock, BlogFaqItem } from './articles';

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

  blocks.push(copy.callout, { type: 'heading', level: 2, text: summaryHeading }, { type: 'paragraph', text: copy.conclusion });

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

const workerCanvasCode = `function installWorkerCanvasDomShim() {
  Object.defineProperty(globalThis, 'HTMLCanvasElement', {
    configurable: true,
    value: OffscreenCanvas,
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement(tagName: string) {
        if (tagName.toLowerCase() !== 'canvas') throw new Error('Unsupported element');
        return new OffscreenCanvas(1, 1);
      },
    },
  });
}`;

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
  const actual = createHash('sha256')
    .update(readFileSync(asset.path))
    .digest('hex');

  if (actual !== asset.sha256) {
    throw new Error(\`OCR asset checksum mismatch: \${asset.path}\`);
  }
}`;

export const ocrEngineeringArticles: BlogArticle[] = [{
  slug: 'pp-ocrv5-paddleocr-js-browser-ocr-production',
  publishedAt: '2026-09-15',
  updatedAt: '2026-09-15',
  translations: {
    en: buildTranslation({
      title: 'OCR Technology Choices and a Production PP-OCRv5 Implementation',
      excerpt: 'Compare cloud OCR, PaddleOCR, Tesseract, and custom ONNX pipelines, then follow a real PP-OCRv5 implementation from model delivery and Workers to debugging and deployment.',
      metaTitle: 'OCR Choices and PP-OCRv5 Implementation',
      metaDescription: 'Compare OCR architectures, choose by accuracy, privacy and deployment needs, then implement PP-OCRv5 with PaddleOCR JS, ONNX Runtime, Workers and reliable asset delivery.',
      readingTime: '22 min read',
      tags: ['OCR architecture', 'PP-OCRv5', 'PaddleOCR JS', 'ONNX Runtime', 'technical selection'],
      relatedTools: [
        { label: 'Image OCR', href: '/image/ocr', description: 'Run the PP-OCRv5 implementation described in this article on an image.' },
        { label: 'Image Tools', href: '/image', description: 'Prepare, rotate, crop, resize, and inspect images before recognition.' },
      ],
      lead: 'There is no universally best OCR engine. The right choice depends on document complexity, language coverage, privacy constraints, traffic, latency, available infrastructure, and how much of the recognition pipeline a team is prepared to maintain.',
      intro: 'This article starts with the decision rather than the code. It compares common OCR approaches, explains which environments each one fits, and then records how ToolGarden implemented PP-OCRv5 with PaddleOCR JS and ONNX Runtime. The browser is the concrete case study, not a restriction on the conclusions: the same evaluation method applies to servers, desktop applications, mobile clients, internal systems, and public web products.',
      sections: [
        {
          heading: 'Start with requirements, not a model name',
          paragraphs: [
            'OCR quality is not one number. A model can read a clean English scan well and fail on Chinese storefront text, rotated receipts, dense tables, handwriting, or a low-light phone photo. Before selecting a stack, build a representative evaluation set and define what a useful output means: plain text, positioned blocks, tables, key-value fields, searchable PDF, or a fully reconstructed document.',
            'Operational constraints are equally important. Ask whether images may leave the device, whether the product must work offline, how much first-load download is acceptable, which browsers or operating systems must be supported, whether GPUs are available, and who will update models and runtime binaries. These answers often eliminate more options than an accuracy demo does.',
          ],
          items: [
            'Accuracy: languages, fonts, rotation, perspective, handwriting, tables, and small text.',
            'Output: plain text, coordinates, reading order, structured fields, or layout recovery.',
            'Operations: latency, throughput, cold start, memory, package size, and offline behavior.',
            'Governance: upload policy, data region, retention, auditability, and vendor dependency.',
            'Ownership: integration effort, model upgrades, preprocessing, post-processing, and testing.',
          ],
        },
        {
          heading: 'Compare the main OCR implementation routes',
          paragraphs: [
            'The useful comparison is not simply local versus cloud. A cloud document API, a Python PaddleOCR service, Tesseract, PaddleOCR JS, and a custom ONNX pipeline expose different abstraction levels. They move cost between infrastructure, network transfer, client resources, engineering time, and vendor dependency.',
            'This table is a selection guide, not a universal ranking. Accuracy must be measured on the same images, languages, preprocessing, and output requirements. Comparing a cloud table parser with a local plain-text recognizer answers the wrong question.',
          ],
          table: { type: 'table', headers: ['Route', 'Best fit', 'Strengths', 'Costs and limits'], rows: [
            ['Cloud OCR or document API', 'Forms, tables, IDs, receipts, rapid delivery', 'Managed scaling, structured extraction, little client compute', 'Uploads, recurring cost, latency, retention review, lock-in'],
            ['PaddleOCR Python or native service', 'Servers, desktop backends, private infrastructure', 'Complete open pipeline, broad controls, easier GPU use', 'Native dependencies, service operations, larger deployment'],
            ['PaddleOCR JS with PP-OCRv5', 'Web, Electron, offline-first, no-upload products', 'Local inference, reusable pipeline, static delivery', 'WASM speed, model download, browser memory and compatibility'],
            ['Tesseract or Tesseract.js', 'Clean scans, simple layouts, established language packs', 'Mature ecosystem and predictable classic workflow', 'Usually weaker on scene text and complex layouts'],
            ['Custom ONNX pipeline', 'Special models, hardware, or strict control', 'Maximum control over tensors, batching, and output', 'Highest pre/post-processing and compatibility maintenance'],
          ] },
        },
        {
          heading: 'Choose by environment and product boundary',
          paragraphs: [
            'When uploads are acceptable and structured tables or form semantics are required immediately, a managed document API is often the shortest path. When data must remain inside controlled infrastructure and GPU throughput matters, PaddleOCR Python or another native stack is usually a better server foundation than forcing a browser runtime onto the backend.',
            'Electron can reuse JavaScript and WASM, while a desktop sidecar can run Python or C++. Mobile products should benchmark native runtimes and device acceleration. Tesseract remains reasonable for clean, predictable scans. A custom ONNX pipeline is justified only when the extra control solves a measured problem.',
            'ToolGarden chose PaddleOCR JS with PP-OCRv5 because its boundary was explicit: static hosting, no image upload, no OCR backend, multilingual printed text, and an acceptable one-time model download. Under different constraints, the recommendation changes.',
          ],
        },
        {
          heading: 'Implementation path: establish a baseline first',
          paragraphs: [
            'Build a small golden set before writing adapters. Include screenshots, phone photos, simplified and traditional Chinese, English, Japanese, small type, rotation, low contrast, and at least one layout the product does not promise to preserve. Record expected text and critical fields rather than relying on visual impression.',
            'Measure cold initialization, warm recognition, peak memory, model transfer size, detected blocks, and character or field accuracy. Run every candidate on the same originals. This is the only fair way to compare a website or model because preprocessing, detection, decoding, and reading order can matter as much as archive size.',
          ],
          table: { type: 'table', headers: ['Measurement', 'Why it matters', 'Test condition'], rows: [
            ['Cold start', 'Includes runtime, download, extraction, and sessions', 'Fresh cache and slow network'],
            ['Warm latency', 'Represents repeated use', 'Second and later images'],
            ['Recognition quality', 'Shows substitutions, omissions, and ordering errors', 'Each language and image category'],
            ['Resource use', 'Reveals mobile instability', 'Large image and many text boxes'],
            ['Failure recovery', 'Confirms retry really works', 'Offline, corrupt asset, terminated Worker'],
          ] },
        },
        {
          heading: 'Implementation path: isolate expensive work and define a protocol',
          paragraphs: [
            'The page owns UI state, validation, progress, and localized errors. A module Worker owns decoding, OpenCV preprocessing, model initialization, inference, and result conversion. Every message carries an ID so stale progress cannot settle a newer request.',
            'The file becomes a transferable ArrayBuffer, moving ownership instead of cloning a large image. Temporary listeners are removed on completion. A crashed or timed-out Worker is terminated and uncached so retry starts from clean WASM state.',
          ],
          code: { type: 'code', language: 'typescript', code: workerRequestCode },
        },
        {
          heading: 'Implementation path: adapt decoding to the runtime',
          paragraphs: [
            'A Worker provides Blob, createImageBitmap, ImageData, and OffscreenCanvas, but not document or HTML element constructors. Some image dependencies still check those globals. That difference caused document is not defined and HTMLImageElement is not defined.',
            'The adapter installs only the globals the dependency reads. Canvas maps to OffscreenCanvas; sourceToMat decodes a Blob, draws it offscreen, reads ImageData, and creates an OpenCV Mat. Disposal deletes the Mat and closes the bitmap. Node, Electron main processes, and native applications should replace this adapter with their own decoder rather than expanding the shim.',
          ],
          code: { type: 'code', language: 'typescript', code: workerCanvasCode },
        },
        {
          heading: 'Implementation path: load PP-OCRv5 as one versioned unit',
          paragraphs: [
            'Exact detection and recognition assets are passed to PaddleOCR JS instead of relying on remote defaults. Languages map to Paddle identifiers and initialized OCR instances are cached by language. Detection and recognition batch sizes can be tuned separately.',
            'ONNX Runtime uses WASM with SIMD, no proxy, and one thread. One thread avoids cross-origin-isolation requirements. The shown side limit and thresholds are product tuning values, not universal constants; tiny text, scene images, and mobile memory limits need their own benchmark.',
          ],
          code: { type: 'code', language: 'typescript', code: paddlePipelineCode },
        },
        {
          heading: 'Implementation path: own the result contract',
          paragraphs: [
            'Library output is converted into an application-owned discriminated union. Success contains text, blocks, confidence, boxes, source dimensions, and duration. Failures use stable codes such as model_load_failed, worker_timeout, recognition_failed, and no_text_detected, so UI copy never parses exceptions.',
            'Polygons become display boxes, weak items are filtered, and blocks are grouped into rows by vertical center and average height. Rows sort top to bottom and blocks left to right. This provides useful plain text, but it does not claim to reconstruct tables, columns, or original document styling.',
          ],
        },
        {
          heading: 'Important details: liveness, delivery, caching, and memory',
          paragraphs: [
            'A fixed timeout confuses slow progress with failure. The Worker sends a heartbeat every ten seconds around initialization and prediction. The page resets an inactivity timer on each matching message and maintains separate hard limits for model and processing phases. Every failure path discards the Worker, so retry is defined.',
            'Self-hosted models remove third-party CORS and availability risk, but URLs, MIME types, cache updates, file limits, and first-load UX remain. ONNX Runtime JavaScript and WASM must come from the same release. OpenCV Mats, ImageBitmaps, URLs, listeners, timers, rejected initialization Promises, and Service Worker caches all require explicit lifecycle management.',
          ],
          code: { type: 'code', language: 'typescript', code: heartbeatCode },
          items: [
            'Pin package and binary versions together and inspect the final bundle.',
            'Serve models, MJS, and WASM with stable URLs and correct content types.',
            'Cache successful initialization but remove rejected Promises.',
            'Limit image pixels before canvas allocation and avoid default concurrency.',
            'Version Service Worker caches from built content, not a handwritten constant.',
          ],
        },
        {
          heading: 'Problems encountered and what they actually meant',
          paragraphs: [
            'Failures occurred at installation, bundling, asset delivery, Worker compatibility, runtime ABI, and caching layers. Treating every message as an isolated npm issue caused rework. The useful debugging move was to identify the layer before changing dependencies.',
            'The final timeout was deceptive. A longer timer could never fix an incompatible runtime. A deterministic image with known text, sent through the production Worker and public asset paths, exposed the hidden _OrtGetInputName failure.',
          ],
          table: { type: 'table', headers: ['Symptom', 'Root cause', 'Durable fix'], rows: [
            ['npm edgesOut failure', 'Installer dependency-tree failure', 'Use exact compatible dependencies and reproducible install mode'],
            ['Cannot resolve ort.bundle.min.mjs', 'Expected runtime entry was unavailable', 'Alias a real browser entry from the selected release'],
            ['No matching ORT version', 'Requested release did not exist', 'Verify the registry and pin a published version'],
            ['WASM exceeded file limit', 'Wrong runtime variant entered output', 'Ship only required files and check build sizes'],
            ['Dynamic MJS fetch failed', 'URL or module deployment was wrong', 'Use same-origin explicit URLs and verify responses'],
            ['document or HTMLImageElement missing', 'DOM code ran inside a Worker', 'Provide a narrow OffscreenCanvas adapter'],
            ['_OrtGetInputName missing', 'JavaScript and WASM ABIs differed', 'Vendor and checksum one matching runtime set'],
            ['Worker timed out', 'Fixed timer hid initialization failure', 'Expose layer errors and use heartbeat liveness'],
          ] },
        },
        {
          heading: 'Verify the complete path, not only the build',
          paragraphs: [
            'Type checking cannot prove that archives download, MJS locates WASM, or a Worker decodes an image. Verification must use production public paths, cache behavior, Worker entry, and OCR API. Start with a generated image containing known text, then use the golden set for quality.',
            'Test cold and warm caches, slow network, offline-after-cache, rotation, languages, large images, forced Worker termination, and retry. Validate deployments on a fresh origin or after clearing the Service Worker. Build-time SHA-256 checks prevent missing or mixed assets from reaching users.',
          ],
          code: { type: 'code', language: 'javascript', code: assetCheckCode },
        },
      ],
      callout: { type: 'callout', title: 'Try the concrete PP-OCRv5 implementation', text: 'Run it on your own representative files and judge it against your accuracy, privacy, latency, and layout requirements.', href: '/image/ocr', linkLabel: 'Open Image OCR' },
      conclusion: 'Choose OCR by task and operating boundary, not by model size or one demo. Cloud document APIs fit managed structured extraction. Native PaddleOCR fits controlled servers and GPU workloads. Tesseract remains useful for predictable scans. PaddleOCR JS with PP-OCRv5 fits local web delivery. In every route, preprocessing, runtime compatibility, result contracts, liveness, caching, memory, and end-to-end verification are parts of the OCR system. That decision trail is more reusable than any single code sample.',
      faq: [
        { question: 'Is PP-OCRv5 always more accurate than Tesseract or cloud OCR?', answer: 'No. Evaluate candidates on the same representative files and score the languages, layouts, and fields that matter to the product.' },
        { question: 'Should a server project use PaddleOCR JS?', answer: 'Not by default. Servers with Python or native support can usually use the full PaddleOCR stack and acceleration more directly. JavaScript and WASM fit code sharing, sandboxing, Electron, or browser delivery.' },
        { question: 'Does local OCR mean completely offline?', answer: 'Only after the application, runtime, models, and related assets are cached or bundled. First use normally requires a download.' },
        { question: 'Why can a smaller model appear better?', answer: 'Detection, crop quality, vocabulary, decoding, thresholds, reading order, preprocessing, and quantization can matter more than archive size on a particular image.' },
        { question: 'Why use a Worker?', answer: 'It isolates expensive image and WASM work from rendering and provides a boundary that can be terminated and recreated after failure.' },
        { question: 'What must be checked after an OCR dependency update?', answer: 'Verify the deployed JavaScript, MJS, WASM, model hashes, URLs, MIME types, cold start, real recognition, retry, and Service Worker replacement.' },
      ],
    }, 'Summary'),
    zh: buildTranslation({
      title: 'OCR 技术选型与 PP-OCRv5 生产落地实践',
      excerpt: '先对比云 OCR、PaddleOCR、Tesseract 与自研 ONNX 产线，再完整记录 PP-OCRv5 从模型交付、Worker 集成到故障排查和部署验证的实现路径。',
      metaTitle: 'OCR 技术选型与 PP-OCRv5 落地实践',
      metaDescription: '对比常见 OCR 技术方案，按准确率、隐私和部署条件完成选型，并记录 PP-OCRv5、PaddleOCR JS、ONNX Runtime 与 Worker 的生产实现。',
      readingTime: '约 22 分钟阅读',
      tags: ['OCR 技术选型', 'PP-OCRv5', 'PaddleOCR JS', 'ONNX Runtime', '工程实践'],
      relatedTools: [
        { label: '图片 OCR', href: '/image/ocr', description: '用实际图片运行本文介绍的 PP-OCRv5 实现。' },
        { label: '图片工具', href: '/image', description: '识别前对图片进行旋转、裁剪、缩放和检查。' },
      ],
      lead: 'OCR 没有适用于所有场景的最佳引擎。正确选择取决于文档复杂度、语言、隐私边界、流量、延迟、基础设施，以及团队愿意维护多少识别流程。',
      intro: '本文不从代码开始，而是先建立选型逻辑：对比常见 OCR 方案，说明它们分别适合什么环境，再记录 ToolGarden 如何使用 PaddleOCR JS、PP-OCRv5 和 ONNX Runtime 完成一次生产落地。浏览器只是本文的具体案例，不是结论的边界；同一套判断方法也适用于服务端、桌面应用、移动端、内部系统和公开网站。',
      sections: [
        {
          heading: '先定义需求，不要先决定模型',
          paragraphs: [
            'OCR 准确率不是一个脱离场景的数字。同一个模型可能擅长清晰英文扫描件，却不适合中文店铺招牌、旋转小票、密集表格、手写内容或弱光手机照片。选型前应准备有代表性的测试集，并明确什么才算可用结果：纯文本、带坐标文字块、表格、键值字段、可搜索 PDF，还是完整文档重建。',
            '运行约束同样重要。需要确认图片能否离开设备、是否必须离线、首次允许下载多大模型、支持哪些浏览器或操作系统、是否有 GPU、并发量有多大，以及由谁负责更新模型和运行时二进制文件。这些问题通常比一次准确率演示更能决定技术路线。',
          ],
          items: ['识别质量：语言、字体、旋转、透视、手写、表格与小字。', '输出要求：纯文本、坐标、阅读顺序、结构化字段或版面恢复。', '运行成本：延迟、吞吐、冷启动、内存、包体和离线能力。', '数据治理：上传策略、数据区域、保留周期、审计与供应商依赖。', '维护责任：集成、模型升级、预处理、后处理和测试由谁承担。'],
        },
        {
          heading: '对比几条常见 OCR 技术路线',
          paragraphs: [
            '有价值的比较不能只分成本地和云端。云文档 API、PaddleOCR Python 服务、Tesseract、PaddleOCR JS 和自研 ONNX 流水线提供了不同抽象层，也分别把成本放在基础设施、网络传输、客户端资源、研发维护和供应商依赖上。',
            '下表是选型参考，不是绝对排名。最终准确率必须在同一批图片、语言、预处理和输出要求下测量。拿云端表格解析器与本地纯文本模型直接比较，会因为任务不一致而得到没有意义的结论。',
          ],
          table: { type: 'table', headers: ['技术路线', '更适合的场景', '主要优势', '成本与限制'], rows: [
            ['云 OCR 或文档 API', '复杂表单、表格、证件、小票和快速上线', '托管扩缩容、结构化能力成熟、客户端负担小', '文件上传、持续费用、网络延迟、留存审查、供应商锁定'],
            ['PaddleOCR Python 或原生服务', '服务端、桌面后端、私有基础设施', '开源完整产线、可调能力强、更容易使用 GPU', '原生依赖、需要运维、部署体积较大'],
            ['PaddleOCR JS 与 PP-OCRv5', '网页、Electron、离线优先和不上传产品', '本地推理、复用 Paddle 产线、可静态交付', 'WASM 性能、首次模型下载、浏览器内存与兼容性'],
            ['Tesseract 或 Tesseract.js', '清晰扫描件、简单版式、已有语言包场景', '生态成熟、经典 OCR 流程稳定', '场景文字与复杂版式通常较弱，依赖预处理'],
            ['自研 ONNX 流水线', '特殊模型、特殊硬件或强控制要求', '模型、张量、批处理与输出完全可控', '预处理、后处理和兼容性维护成本最高'],
          ] },
        },
        {
          heading: '根据运行环境和产品边界做选择',
          paragraphs: [
            '如果允许上传文件，并且必须快速获得表格结构、表单字段或文档语义，托管式文档 OCR API 往往是最短路径。如果数据必须留在受控基础设施内，而且需要 GPU 吞吐，PaddleOCR Python 或其他原生产线通常比强行把浏览器运行时搬到服务端更合适。',
            'Electron 可以复用 JavaScript 与 WASM，桌面 sidecar 也可以运行 Python/C++。移动端应评估原生推理和设备加速。对于清晰、规则扫描件，只要实测达到要求，Tesseract 仍然合理。只有额外控制能解决明确问题时，才值得承担自研 ONNX 流水线的维护成本。',
            'ToolGarden 选择 PaddleOCR JS 与 PP-OCRv5，是因为产品边界明确：静态网站、图片不上传、没有 OCR 后端、需要识别多语言印刷体，并且能接受首次模型下载。约束改变时，推荐方案也应改变。',
          ],
        },
        {
          heading: '实现路径一：先建立基准，再开始集成',
          paragraphs: [
            '编写适配代码前，先准备一组小而稳定的基准图片。至少包含清晰截图、手机拍照、简体中文、繁体中文、英文、日文、小字号、旋转、低对比度，以及一种产品明确不承诺还原的复杂版式。应记录期望文本和关键字段，不能只凭肉眼判断看起来不错。',
            '同时测量首次初始化、缓存后识别、峰值内存、模型传输量、检测框数量，以及字符或关键字段准确率。所有候选方案必须使用相同原图比较。模型更大不保证更好，因为预处理、检测、裁剪、字典、解码和阅读顺序都会影响结果。',
          ],
          table: { type: 'table', headers: ['指标', '意义', '测试方式'], rows: [
            ['冷启动', '包含运行时、模型下载、解包和 session 创建', '空缓存与慢速网络'], ['热启动耗时', '代表重复使用体验', '第二张及后续图片'], ['识别质量', '发现错字、漏字与顺序错误', '按语言和图片类型统计'], ['资源使用', '发现移动端不稳定', '大图与大量文本框'], ['错误恢复', '确认失败后能够重试', '断网、损坏资源、终止 Worker'],
          ] },
        },
        {
          heading: '实现路径二：隔离重计算并定义通信协议',
          paragraphs: [
            '页面负责 UI 状态、文件校验、进度展示和本地化错误；module Worker 负责图片解码、OpenCV 预处理、模型初始化、推理和结果转换。每条请求和响应都携带 ID，旧请求的延迟进度不能结束新请求。',
            '文件转换成 ArrayBuffer 并加入 transfer list，所有权移动到 Worker，避免大图片再次克隆。任务结束后移除监听器。Worker 崩溃或超时时，终止实例并清空缓存，重试会创建干净运行时。',
          ],
          code: { type: 'code', language: 'typescript', code: workerRequestCode },
        },
        {
          heading: '实现路径三：按运行环境适配图片解码',
          paragraphs: [
            'Web Worker 有 Blob、createImageBitmap、ImageData 和 OffscreenCanvas，却没有 document、HTMLCanvasElement、HTMLImageElement 或 HTMLVideoElement。部分图片依赖仍会检查这些对象，这就是 document is not defined 和 HTMLImageElement is not defined 的来源。',
            '适配层只补充依赖实际读取的对象：canvas 映射到 OffscreenCanvas，sourceToMat 解码 Blob、绘制离屏画布、读取 ImageData 并创建 OpenCV Mat，dispose 删除 Mat 并关闭 bitmap。Node、Electron 主进程或原生应用应替换为各自的解码器，而不是扩大 DOM shim。',
          ],
          code: { type: 'code', language: 'typescript', code: workerCanvasCode },
        },
        {
          heading: '实现路径四：把 PP-OCRv5 作为完整版本单元加载',
          paragraphs: [
            '应用显式传入检测和识别模型，不依赖远程默认地址。语言映射成 Paddle 标识，OCR 实例按语言缓存，检测与识别批量大小可以分别调节。',
            'ONNX Runtime 使用 WASM、SIMD、单线程并关闭 proxy。单线程不要求跨源隔离。示例阈值是针对当前图片场景的调优结果，并非通用常量；小字、场景文字和移动端限制都需要重新基准测试。',
          ],
          code: { type: 'code', language: 'typescript', code: paddlePipelineCode },
        },
        {
          heading: '实现路径五：在应用边界统一结果',
          paragraphs: [
            '依赖输出被转换成应用自己的判别联合类型。成功包含文本、文字块、置信度、坐标、图片尺寸和耗时；失败使用 model_load_failed、worker_timeout、recognition_failed、no_text_detected 等稳定代码，UI 不需要解析异常字符串。',
            '多边形转换成展示矩形，过滤空内容和低置信度项，再按垂直中心和平均行高归并。行内从左到右，各行从上到下，最后用换行连接。结果适合纯文本复制，但不承诺重建表格、分栏和原文档样式。',
          ],
        },
        {
          heading: '需要注意：存活、交付、缓存和内存',
          paragraphs: [
            '固定总超时会混淆缓慢进展与真正失败。Worker 在初始化和识别期间每十秒发送心跳；页面收到消息后重置无响应计时器，并对模型和处理阶段设置独立硬上限。每条失败路径都丢弃 Worker，确保可以干净重试。',
            '同源模型消除了第三方 CORS 和可用性风险，但 URL、MIME、缓存更新、文件限制和首次下载仍要治理。ONNX Runtime JavaScript 与 WASM 必须同版本。OpenCV Mat、ImageBitmap、URL、监听器、定时器、失败 Promise 和 Service Worker 缓存都要管理生命周期。',
          ],
          code: { type: 'code', language: 'typescript', code: heartbeatCode },
          items: ['把 npm 依赖与二进制资源作为一组锁定，并检查最终 bundle。', '用稳定 URL 和正确 Content-Type 提供模型、MJS 与 WASM。', '缓存成功初始化，失败 Promise 必须移除。', '分配 Canvas 前限制像素，默认不要并发识别。', '根据构建内容生成 Service Worker 缓存版本。'],
        },
        {
          heading: '遇到的问题，以及报错真正说明什么',
          paragraphs: [
            '故障分别来自安装、打包、资源交付、Worker 兼容、运行时 ABI 和缓存。把所有消息当成孤立 npm 问题会持续返工。有效方法是先判断症状属于哪一层，再决定是否改依赖。',
            '最后的超时最容易误导。延长时间无法修复不兼容运行时。真正定位依靠一张带固定文字的最小图片，通过生产 Worker 和公开路径完成全链路识别，最终暴露隐藏的 _OrtGetInputName 错误。',
          ],
          table: { type: 'table', headers: ['表面报错', '根因', '长期解决方式'], rows: [
            ['npm edgesOut 错误', '安装器解析依赖树失败', '使用确切兼容依赖和可复现安装模式'], ['找不到 ort.bundle.min.mjs', '运行时入口不存在', '映射到所选版本真实入口'], ['找不到 ORT 指定版本', '请求了未发布版本', '确认 registry 后锁定版本'], ['WASM 超过文件限制', '错误运行时变体进入产物', '只交付所需文件并检查体积'], ['动态 MJS 加载失败', 'URL 或模块部署错误', '使用同源 URL 并检查生产响应'], ['document 或 HTMLImageElement 缺失', 'DOM 代码进入 Worker', '使用受限 OffscreenCanvas 适配'], ['_OrtGetInputName 缺失', 'JS 与 WASM ABI 不同', '内置并校验匹配运行时'], ['Worker 超时', '固定计时器掩盖异常', '分层错误与心跳存活判断'],
          ] },
        },
        {
          heading: '验证完整路径，而不是只验证构建',
          paragraphs: [
            '类型检查不能证明模型能下载、MJS 能找到 WASM、Worker 能解码图片。验证必须经过生产公开路径、缓存层、Worker 入口和 OCR API。先用带固定短语的生成图片做确定性冒烟，再用基准集评估质量。',
            '测试空缓存、热缓存、慢网络、缓存后离线、旋转、语言、大图、强制终止和再次识别。部署验证使用新 origin 或清除 Service Worker。构建期 SHA-256 校验可以阻止资源缺失或混合版本进入生产。',
          ],
          code: { type: 'code', language: 'javascript', code: assetCheckCode },
        },
      ],
      callout: { type: 'callout', title: '体验本文的 PP-OCRv5 实现', text: '用自己的代表性图片运行实际产线，再根据准确率、隐私、延迟和版式要求判断它是否适合你的项目。', href: '/image/ocr', linkLabel: '打开图片 OCR' },
      conclusion: 'OCR 应按任务和运行边界选型，而不是按模型大小或单张演示图决定。需要托管式结构化文档能力时可选云文档 API；受控服务端和 GPU 场景优先评估原生 PaddleOCR；规则扫描件仍可评估 Tesseract；本地处理与 Web 交付是硬要求时，PaddleOCR JS 与 PP-OCRv5 是合理选择。无论哪条路线，预处理、运行时兼容、结果契约、存活判断、缓存、内存和端到端验证都是 OCR 系统的一部分。完整记录这条决策链，比复制某段代码更有长期价值。',
      faq: [
        { question: 'PP-OCRv5 一定比 Tesseract 或云 OCR 更准确吗？', answer: '不一定。必须让候选方案处理同一批代表性文件，并统计业务真正关心的语言、版式和字段。' },
        { question: '服务端项目应该使用 PaddleOCR JS 吗？', answer: '通常不应默认这样选。支持 Python 或原生部署的服务端可更直接使用完整 PaddleOCR 和硬件加速。代码复用、沙箱、Electron 或浏览器交付是要求时，JavaScript 与 WASM 才更有优势。' },
        { question: '本地 OCR 是否意味着完全离线？', answer: '只有应用、运行时、模型和相关资源已经缓存或随产品打包后才可能离线。第一次通常需要下载。' },
        { question: '为什么更小的模型有时效果更好？', answer: '检测、裁剪、字典、解码、阈值、阅读顺序、预处理和量化方式，都可能比归档大小更影响某张图的结果。' },
        { question: '为什么使用 Worker？', answer: 'Worker 把图片和 WASM 重计算与渲染隔离，也提供可终止的边界，超时或异常后能重建执行环境。' },
        { question: '升级 OCR 依赖后至少检查什么？', answer: '检查部署的 JavaScript、MJS、WASM、模型哈希、URL、MIME、冷启动、真实识别、失败重试和 Service Worker 更新。' },
      ],
    }, '总结'),
  },
}];
