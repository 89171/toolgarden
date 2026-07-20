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
  conclusion: string;
  callout?: Extract<BlogBlock, { type: 'callout' }>;
  faq: BlogFaqItem[];
}

function buildTranslation(copy: ArticleCopy): BlogArticleTranslation {
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

  if (copy.callout) blocks.push(copy.callout);
  blocks.push(
    { type: 'heading', level: 2, text: /[一-鿿]/u.test(copy.title) ? '总结' : 'Key takeaways' },
    { type: 'paragraph', text: copy.conclusion }
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
    publishedAt: '2026-07-20',
    updatedAt: '2026-07-20',
    translations: {
      en: buildTranslation(en),
      zh: buildTranslation(zh),
    },
  };
}

const localImageToolsEn = {
  label: 'Browser-local image tools',
  href: '/image',
  description: 'Resize, compress, convert, and inspect images without sending the source file to a processing API.',
};

const localImageToolsZh = {
  label: '浏览器本地图片工具',
  href: '/image',
  description: '无需把源文件发送到处理接口，即可调整尺寸、压缩、转换和检查图片。',
};

const qrGeneratorEn = {
  label: 'WiFi QR Code Generator',
  href: '/qr-code/generate',
  description: 'Generate a WiFi QR code locally from a network name, security type, and password.',
};

const qrGeneratorZh = {
  label: 'WiFi 二维码生成器',
  href: '/qr-code/generate',
  description: '根据网络名称、加密类型和密码在浏览器本地生成 WiFi 二维码。',
};

export const growthSeoBlogArticles: BlogArticle[] = [
  article(
    'developer-client-side-image-processing',
    {
      title: "The Developer's Guide to Client-Side Image Processing",
      excerpt: 'A practical architecture guide to decoding, resizing, compressing, and exporting images in the browser with Canvas, workers, and modern codecs.',
      metaTitle: 'Client-Side Image Processing: A Developer Guide',
      metaDescription: 'Build client-side image processing with File, Blob, createImageBitmap, Canvas, OffscreenCanvas, Web Workers, format detection, and safe memory limits.',
      readingTime: '12 min read',
      tags: ['client-side image processing', 'Canvas', 'Web Workers', 'OffscreenCanvas', 'privacy-first tools'],
      relatedTools: [
        localImageToolsEn,
        {
          label: 'Image Resizer',
          href: '/image/resize',
          description: 'Resize images locally and compare the output before downloading.',
        },
        {
          label: 'EXIF Viewer & Cleaner',
          href: '/image/exif',
          description: 'Inspect image metadata and remove GPS or camera details before sharing.',
        },
      ],
      lead: 'Client-side image processing is no longer limited to drawing a thumbnail on a canvas. A modern browser can read a selected file, decode it into pixels, transform it off the main thread, encode a new format, preview the result, and return a downloadable Blob without uploading the source image.',
      intro: 'The architecture is attractive for privacy and latency, but production quality depends on more than one Canvas call. Developers need to control decode cost, orientation, color and metadata behavior, memory pressure, cancellation, browser support, and output verification. This guide focuses on those engineering decisions rather than a single code snippet.',
      sections: [
        {
          heading: 'The browser-local image pipeline',
          paragraphs: ['A reliable pipeline separates acquisition, validation, decoding, transformation, encoding, and export. Each stage has its own failure modes and should return a typed result instead of mutating UI state.'],
          table: {
            type: 'table',
            headers: ['Stage', 'Browser primitive', 'Main responsibility'],
            rows: [
              ['Acquire', 'File, Blob, drag and drop', 'Accept bytes without converting the whole file to a data URL'],
              ['Decode', 'createImageBitmap or Image', 'Turn encoded bytes into a drawable bitmap'],
              ['Transform', 'Canvas or OffscreenCanvas', 'Resize, crop, rotate, composite, or filter pixels'],
              ['Encode', 'canvas.toBlob or a WASM codec', 'Produce JPEG, PNG, WebP, AVIF, or another target'],
              ['Export', 'Object URL and download', 'Preview and save the resulting Blob'],
            ],
          },
        },
        {
          heading: 'Keep heavy work away from the main thread',
          paragraphs: [
            'Large decodes and repeated resampling can block input, scrolling, and progress indicators. Web Workers provide a separate execution context, while createImageBitmap and OffscreenCanvas make it possible to decode and render in worker-based pipelines on supporting browsers.',
            'Design the worker protocol around transferable objects, explicit progress events, cancellation, and structured error responses. Do not send a base64 copy of every frame between contexts; that increases memory and serialization work.',
          ],
          items: [
            'Use one job identifier per file so late worker messages cannot overwrite a newer result.',
            'Cancel superseded previews when a quality slider changes quickly.',
            'Revoke object URLs and close ImageBitmap objects when their lifetime ends.',
            'Fall back to the main thread for small jobs when worker features are unavailable.',
          ],
        },
        {
          heading: 'Resize for the real output, not the preview',
          paragraphs: [
            'Preview CSS dimensions do not change the encoded pixel dimensions. Compute a target width and height from the source aspect ratio, draw at that exact resolution, and encode from the target canvas. For aggressive downscaling, multiple smaller steps can preserve fine detail better than one very large jump, depending on the browser and source.',
            'Treat crop coordinates in source-image space, not screen space. A responsive preview may be scaled or letterboxed, so pointer coordinates need to be mapped back to the decoded bitmap before cropping.',
          ],
        },
        {
          heading: 'Choose formats by content and delivery constraints',
          paragraphs: ['PNG is useful for lossless edges and transparency. WebP offers a practical balance for broad web delivery. AVIF can reduce photographic assets further but can cost more CPU to encode and may need a fallback for older clients. JPEG remains useful when compatibility and predictable photo workflows matter.'],
          items: [
            'Do not assume a quality value has the same visual meaning across codecs.',
            'Test transparent pixels when converting to formats without alpha support.',
            'Use MIME type and actual decode results instead of trusting only a filename extension.',
            'For web delivery, consider picture sources and a fallback rather than one universal format.',
          ],
        },
        {
          heading: 'Orientation, color, and metadata are product decisions',
          paragraphs: [
            'Phone photos may rely on orientation metadata. Decoders can normalize that orientation while an exported canvas omits the original tag, so tests should include all rotated and mirrored cases. Color profiles and HDR content can also shift when a pipeline converts everything through an ordinary canvas.',
            'Canvas re-encoding usually drops most EXIF metadata. That can be a privacy benefit for GPS data, but it can also remove copyright or workflow fields. State the behavior clearly and offer an inspection step when metadata matters.',
          ],
        },
        {
          heading: 'Set memory and workload limits before production',
          paragraphs: ['Encoded file size is a poor estimate of processing cost. A 12,000 by 8,000 RGBA bitmap needs roughly 384 MB for one uncompressed pixel buffer, before temporary canvases and encoder memory. Reject impossible dimensions early and avoid holding the original, several previews, and multiple outputs at once.'],
          items: [
            'Validate MIME type, byte size, width, height, and total pixel count.',
            'Process batches with bounded concurrency rather than decoding every file together.',
            'Release intermediate buffers immediately after each stage.',
            'Explain browser memory limits instead of failing silently on large files.',
          ],
        },
        {
          heading: 'Security and privacy checklist',
          paragraphs: ['Local processing removes the ordinary upload step, but the page code, dependencies, origin, extensions, and export behavior still matter. A trustworthy implementation makes its data path observable and keeps network behavior separate from user input.'],
          items: [
            'Serve the application over HTTPS with a restrictive Content Security Policy.',
            'Pin and review image decoders, WASM codecs, and other dependencies.',
            'Keep analytics events free of filenames, image bytes, and extracted metadata.',
            'Test the full workflow in the Network panel with a harmless sample.',
            'Use a controlled backend or audited desktop software when browser limits or policy require it.',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: 'Inspect a working local pipeline',
        text: 'Resize an image with the Network panel open, compare the preview, and inspect the exported dimensions and file type.',
        href: '/image/resize',
        linkLabel: 'Open Image Resizer',
      },
      conclusion: 'A production-ready client-side image pipeline is a resource-management system as much as an image editor. Separate the stages, keep expensive work responsive, validate dimensions before decoding, make metadata behavior explicit, and verify the exported Blob. When those boundaries are designed well, browser-local processing provides fast feedback without turning the source file into a server-side data liability.',
      faq: [
        { question: 'Is Canvas enough for every client-side image workflow?', answer: 'No. Canvas covers common resize, crop, composition, and export jobs. Specialized codecs, very large images, RAW files, advanced color management, and some filters may need WebAssembly, WebGL, WebGPU, desktop software, or a controlled backend.' },
        { question: 'Why use createImageBitmap instead of a normal Image element?', answer: 'createImageBitmap returns a promise-based drawable bitmap and can participate in worker-based pipelines. A normal Image element remains a useful compatibility fallback, especially when a feature is not available in the target browser.' },
        { question: 'Does local re-encoding remove EXIF GPS data?', answer: 'Canvas-based exports commonly omit original EXIF metadata, but applications should not present that as a universal guarantee for every codec or path. Inspect the exported file when metadata removal is a security requirement.' },
        { question: 'When should image processing move to a server?', answer: 'Use a controlled server when files exceed realistic browser memory, a centrally managed audit trail is required, output must be identical across clients, or the needed codec and color workflow is not dependable in target browsers.' },
      ],
    },
    {
      title: '开发者客户端图片处理指南',
      excerpt: '从工程角度介绍如何使用 Canvas、Worker 和现代编码器，在浏览器中完成图片解码、缩放、压缩与导出。',
      metaTitle: '客户端图片处理开发指南：Canvas、Worker 与本地编码',
      metaDescription: '系统讲解客户端图片处理架构，包括 File、Blob、createImageBitmap、Canvas、OffscreenCanvas、Web Worker、格式判断和内存限制。',
      readingTime: '约 12 分钟阅读',
      tags: ['客户端图片处理', 'Canvas', 'Web Worker', 'OffscreenCanvas', '隐私工具'],
      relatedTools: [
        localImageToolsZh,
        { label: '图片尺寸调整', href: '/image/resize', description: '在本地调整图片尺寸，对比结果后再下载。' },
        { label: 'EXIF 查看与清理', href: '/image/exif', description: '分享前检查图片元数据，并移除 GPS 或相机信息。' },
      ],
      lead: '客户端图片处理早已不只是“在 Canvas 上画一张缩略图”。现代浏览器可以读取用户选择的文件、解码像素、在后台线程完成变换、编码新格式、预览结果，并以 Blob 形式返回下载，全程不必上传源图片。',
      intro: '这种架构兼顾隐私和响应速度，但生产级质量并不等于调用一次 Canvas API。开发者还要处理解码成本、方向、色彩、元数据、内存压力、任务取消、浏览器兼容和输出验证。本指南重点讨论这些工程决策。',
      sections: [
        {
          heading: '浏览器本地图片处理流水线',
          paragraphs: ['可靠的流程应拆分为获取、校验、解码、变换、编码和导出。每个阶段都有不同失败模式，适合返回明确结果，而不是直接操作界面状态。'],
          table: {
            type: 'table',
            headers: ['阶段', '浏览器能力', '主要职责'],
            rows: [
              ['获取', 'File、Blob、拖放', '读取字节，不把整份文件转成 Data URL'],
              ['解码', 'createImageBitmap 或 Image', '把编码数据转为可绘制位图'],
              ['变换', 'Canvas 或 OffscreenCanvas', '缩放、裁剪、旋转、合成或滤镜'],
              ['编码', 'canvas.toBlob 或 WASM 编码器', '生成 JPEG、PNG、WebP、AVIF 等目标'],
              ['导出', 'Object URL 与下载', '预览并保存最终 Blob'],
            ],
          },
        },
        {
          heading: '把重任务移出主线程',
          paragraphs: [
            '大图解码和反复重采样会阻塞输入、滚动与进度提示。Web Worker 提供独立执行上下文；在支持的浏览器里，createImageBitmap 与 OffscreenCanvas 可以参与后台线程解码和绘制。',
            'Worker 协议应包含任务 ID、可转移对象、进度事件、取消和结构化错误。不要在不同上下文之间反复传递每帧的 Base64 副本，这会增加内存与序列化成本。',
          ],
          items: [
            '每个文件使用唯一任务 ID，防止旧消息覆盖新结果。',
            '质量滑块快速变化时取消已过期的预览任务。',
            '对象 URL 和 ImageBitmap 生命周期结束后立即释放。',
            '特性不可用时，为小任务提供主线程回退路径。',
          ],
        },
        {
          heading: '按真实输出尺寸缩放，而不是按预览尺寸',
          paragraphs: [
            'CSS 预览尺寸不会改变最终编码像素。应根据源图宽高比计算目标尺寸，在对应分辨率上绘制，再从目标 Canvas 编码。大幅缩小时，分阶段缩小有时能比一次跳变保留更多细节，具体仍需以目标浏览器和样本测试为准。',
            '裁剪坐标必须从屏幕坐标映射回源图坐标。响应式预览可能被缩放或留黑边，直接使用鼠标位置会得到错误的裁剪区域。',
          ],
        },
        {
          heading: '按内容和交付约束选择格式',
          paragraphs: ['PNG 适合无损边缘和透明内容；WebP 在网页交付中兼顾体积与兼容性；AVIF 能进一步压缩照片，但编码成本更高，老客户端可能需要回退；JPEG 在强调通用兼容和稳定照片流程时依然实用。'],
          items: [
            '不要假设不同编码器的相同质量数值代表相同观感。',
            '转为不支持透明度的格式时测试透明像素如何填充。',
            '结合 MIME 类型和实际解码结果判断格式，不只相信扩展名。',
            '网页交付可使用 picture 多源和回退，而不是强求一个万能格式。',
          ],
        },
        {
          heading: '方向、色彩与元数据都是产品决策',
          paragraphs: [
            '手机照片可能依赖方向元数据。解码器会把方向归一化，而 Canvas 导出又可能不保留原方向标签，因此测试集应覆盖旋转和镜像情况。色彩配置和 HDR 内容经过普通 Canvas 流程后也可能发生变化。',
            'Canvas 重新编码通常会丢弃大部分 EXIF。这可能有助于移除 GPS，但也可能同时移除版权或工作流字段。产品应明确说明行为，并在元数据重要时提供检查步骤。',
          ],
        },
        {
          heading: '上线前先设置内存和任务边界',
          paragraphs: ['压缩文件大小不能代表处理成本。一张 12000 × 8000 的 RGBA 位图，仅一个未压缩像素缓冲区就大约需要 384 MB，还不包括临时 Canvas 和编码器内存。应尽早拒绝不可处理的尺寸，避免同时保留原图、多份预览与多个输出。'],
          items: [
            '校验 MIME、字节大小、宽度、高度和总像素数。',
            '批处理使用受限并发，不要一次解码全部文件。',
            '每一阶段结束后立即释放中间缓冲区。',
            '明确解释浏览器限制，不要让大文件静默失败。',
          ],
        },
        {
          heading: '安全与隐私检查清单',
          paragraphs: ['本地处理减少了普通上传路径，但页面代码、依赖、来源、扩展和导出行为仍然重要。可信实现应让数据路径可观察，并把网络行为与用户输入彻底分开。'],
          items: [
            '使用 HTTPS 和严格的 Content Security Policy。',
            '锁定并审查图片解码器、WASM 编码器和其他依赖。',
            '统计事件不得包含文件名、图片字节或提取出的元数据。',
            '用无敏感信息样本在 Network 面板验证完整流程。',
            '浏览器能力或组织政策不满足时，改用受控后端或经过审计的桌面软件。',
          ],
        },
      ],
      callout: { type: 'callout', title: '检查一个真实本地流程', text: '打开 Network 面板调整一张图片尺寸，对比预览，并检查导出尺寸和文件类型。', href: '/image/resize', linkLabel: '打开图片尺寸调整' },
      conclusion: '生产级客户端图片流程既是图片编辑器，也是资源管理系统。拆分处理阶段、避免阻塞、解码前校验尺寸、明确元数据行为并验证最终 Blob，才能在浏览器边界内获得快速、隐私友好的体验。',
      faq: [
        { question: 'Canvas 能完成所有客户端图片任务吗？', answer: '不能。Canvas 足以覆盖常见缩放、裁剪、合成与导出；特殊编码器、超大图片、RAW、高级色彩管理和部分滤镜可能需要 WebAssembly、WebGL、WebGPU、桌面软件或受控后端。' },
        { question: '为什么使用 createImageBitmap，而不是普通 Image？', answer: 'createImageBitmap 以 Promise 返回可绘制位图，并可参与 Worker 流程。普通 Image 仍是实用的兼容回退，特别适合目标浏览器不支持相关特性时。' },
        { question: '本地重新编码一定会移除 EXIF GPS 吗？', answer: 'Canvas 导出通常不会保留原始 EXIF，但不应把它描述成适用于每种编码器和路径的绝对保证。元数据删除属于安全要求时，应检查最终导出文件。' },
        { question: '什么时候应把图片处理放到服务器？', answer: '当文件超过浏览器现实内存、必须集中审计、要求不同客户端生成完全一致的结果，或目标编码与色彩流程在浏览器中不可靠时，应考虑受控服务器。' },
      ],
    }
  ),
  article(
    'toolgarden-vs-online-converters',
    {
      title: 'ToolGarden vs Online Converters: Why Local Processing Matters',
      excerpt: 'Compare a browser-local workflow with conventional upload-and-convert services using observable criteria instead of privacy slogans.',
      metaTitle: 'ToolGarden vs Online Converters: Local Processing Compared',
      metaDescription: 'Compare ToolGarden browser-local tools with conventional online converters across uploads, privacy, speed, offline use, limits, and verification.',
      readingTime: '9 min read',
      tags: ['ToolGarden', 'online converters', 'browser local processing', 'no upload tools', 'privacy comparison'],
      relatedTools: [
        { label: 'JSON Formatter', href: '/json-format', description: 'Format and validate JSON in the browser without sending the input to a conversion API.' },
        localImageToolsEn,
        { label: 'Local PDF tools', href: '/pdf', description: 'Merge, split, organize, and extract PDFs in browser-local workflows.' },
      ],
      lead: '“Online converter” describes a user experience, not a data architecture. Two tools can look almost identical while one uploads every file to an API and the other performs the work inside the browser tab. That difference affects exposure, latency, offline behavior, workload limits, and what users can verify.',
      intro: 'This comparison is not a claim that local processing wins every workload. It is a criteria-based guide to deciding when ToolGarden’s browser-local model fits better, when a conventional server converter can be useful, and how to inspect either option before providing real data.',
      sections: [
        {
          heading: 'The architectural difference',
          paragraphs: ['A conventional converter sends input to remote infrastructure, processes it there, and returns an output. ToolGarden aims to deliver application code and supporting assets, then keep compatible tool input and output on the device. Individual tools can have different capabilities, so the Network panel and each page description remain the most reliable checks.'],
          table: {
            type: 'table',
            headers: ['Criterion', 'ToolGarden local workflow', 'Conventional server converter'],
            rows: [
              ['Input data path', 'Stays in the browser for supported tools', 'Usually uploaded for remote processing'],
              ['Account requirement', 'Core utilities generally work without an account', 'Varies; accounts or email delivery may be required'],
              ['Upload latency', 'No source-file upload step', 'Depends on file size and connection speed'],
              ['Offline potential', 'Some workflows can continue after assets are cached', 'Usually needs a live connection to process'],
              ['Large workloads', 'Bounded by browser memory and device CPU', 'Can use scalable server memory and compute'],
              ['Verification', 'Inspect requests while running a harmless sample', 'Review requests, retention terms, and subprocessors'],
            ],
          },
        },
        {
          heading: 'Why no-upload processing changes privacy risk',
          paragraphs: ['When a compatible tool does not transmit its input, that input cannot enter the converter’s upload bucket, processing queue, server log, support snapshot, or downstream processor through the ordinary workflow. This reduces a class of exposure rather than merely promising shorter retention.'],
          items: [
            'Sensitive JSON examples avoid an unnecessary copy on a remote system.',
            'Image and document contents do not wait in an upload queue.',
            'There is less server-side content to retain, back up, disclose, or delete.',
            'Teams still need to trust the loaded application code and their own browser environment.',
          ],
        },
        {
          heading: 'Performance is a tradeoff, not a slogan',
          paragraphs: ['Local tools avoid upload and download round trips, which is valuable for ordinary files and slower connections. They also use the user’s device, so a low-memory phone may struggle with a job that a server handles easily. Remote services can centralize heavy compute, but network time, queues, and rate limits become part of the workflow.'],
        },
        {
          heading: 'How to verify the comparison yourself',
          paragraphs: ['Open developer tools, clear the Network panel, perform a conversion with a harmless but recognizable sample, and inspect the requests. Downloads for application code, fonts, a WASM codec, or a local model do not automatically mean input was uploaded; examine request method, size, timing, and payload.'],
          items: [
            'Look for POST, PUT, WebSocket, or large request bodies after selecting the file.',
            'Repeat the task after disconnecting the network, once required assets have loaded.',
            'Read the privacy notice for analytics, crash reports, storage, and documented exceptions.',
            'Check the output before assuming local processing preserved every feature.',
          ],
        },
        {
          heading: 'When a conventional online converter may be the better fit',
          paragraphs: ['Server processing can be appropriate for very large files, specialized proprietary formats, consistent high-powered compute, centralized collaboration, audit workflows, or jobs that must continue after a browser tab closes. The right question is whether the benefit justifies sending the particular data to that operator.'],
        },
        {
          heading: 'A fair evaluation checklist',
          paragraphs: ['Compare products against the same questions instead of relying on the words “secure,” “private,” or “AI-powered.”'],
          items: [
            'Where do input bytes travel during the task?',
            'Which third parties receive content or metadata?',
            'Can the process be verified with browser tools?',
            'What are the file, memory, format, and quality limits?',
            'Does the output preserve the required layout, metadata, or color?',
            'What happens if the connection, tab, or device fails?',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Run a transparent comparison', text: 'Open JSON Formatter with the Network panel visible and test it with a harmless sample before deciding whether the workflow fits your data.', href: '/json-format', linkLabel: 'Try JSON Formatter' },
      conclusion: 'ToolGarden’s browser-local approach is most useful when avoiding an unnecessary upload matters and the task fits the user’s device. Conventional converters remain useful for heavy or centrally managed jobs. Decide by observing the data path, checking output quality, and matching the architecture to the sensitivity and size of the workload.',
      faq: [
        { question: 'Does ToolGarden upload files for processing?', answer: 'Supported browser-local tools are designed to process input in the browser. Because capabilities can differ by tool, verify the specific workflow with its page description and the browser Network panel before using sensitive data.' },
        { question: 'Is a local tool automatically more secure?', answer: 'No. It removes the ordinary upload path, but users must still trust the origin, loaded code, dependencies, browser, and extensions. Highly regulated data may require an approved environment regardless of architecture.' },
        { question: 'Why can an online converter handle a larger file?', answer: 'A remote service can allocate server memory and compute beyond what a browser tab or phone can safely use. Local processing intentionally trades that scalability for a simpler data path.' },
        { question: 'Can a browser-local tool work offline?', answer: 'Sometimes. The application and any libraries, fonts, codecs, or models must be available first. Once required assets are cached, compatible workflows may continue without a connection, but offline support varies by page and browser.' },
      ],
    },
    {
      title: 'ToolGarden 与在线转换器对比：为什么本地处理很重要',
      excerpt: '基于可观察的数据路径、速度、离线能力和限制，对比浏览器本地工具与传统上传型在线转换器。',
      metaTitle: 'ToolGarden 与在线转换器对比：本地处理有什么不同',
      metaDescription: '从上传、隐私、速度、离线能力、文件限制和验证方法，对比 ToolGarden 浏览器本地工具与传统在线转换器。',
      readingTime: '约 9 分钟阅读',
      tags: ['ToolGarden', '在线转换器', '浏览器本地处理', '无需上传工具', '隐私对比'],
      relatedTools: [
        { label: 'JSON 格式化', href: '/json-format', description: '在浏览器本地格式化和校验 JSON，不把输入发送到转换接口。' },
        localImageToolsZh,
        { label: '本地 PDF 工具', href: '/pdf', description: '在浏览器本地合并、拆分、整理 PDF 并提取内容。' },
      ],
      lead: '“在线转换器”描述的是使用方式，而不是数据架构。两个工具看起来可能完全相同，一个会把文件上传到接口，另一个则在浏览器标签页里完成全部处理。这项差异会影响暴露面、等待时间、离线能力、任务上限和用户能否自行验证。',
      intro: '这篇对比并不宣称本地处理适合所有任务，而是用统一标准判断：什么时候 ToolGarden 的浏览器本地模式更合适，什么时候传统服务端转换有优势，以及在提交真实数据前如何检查两种方案。',
      sections: [
        {
          heading: '两种架构的核心区别',
          paragraphs: ['传统转换器把输入发送到远端基础设施，处理完成后返回结果。ToolGarden 的目标是交付应用代码与必要资源，再让兼容工具的输入和输出留在设备上。不同工具的能力可能不同，因此 Network 面板和具体页面说明仍是最可靠的判断依据。'],
          table: {
            type: 'table',
            headers: ['比较项', 'ToolGarden 本地流程', '传统服务端转换器'],
            rows: [
              ['输入路径', '兼容工具的输入留在浏览器', '通常上传后在远端处理'],
              ['账号要求', '核心工具通常无需账号', '因服务而异，可能要求登录或邮件接收'],
              ['上传等待', '没有源文件上传步骤', '取决于文件大小和网络速度'],
              ['离线潜力', '资源缓存后，部分流程可继续运行', '通常必须联网处理'],
              ['大型任务', '受浏览器内存和设备 CPU 限制', '可使用可扩展服务器资源'],
              ['验证方式', '运行无敏感样本时检查请求', '同时检查请求、保留条款与分包商'],
            ],
          },
        },
        {
          heading: '无需上传为什么会改变隐私风险',
          paragraphs: ['兼容工具不传输输入时，普通工作流不会让内容进入转换器的上传存储、任务队列、服务器日志、客服快照或下游处理商。这是在数据路径上减少一类暴露，而不只是承诺缩短保留时间。'],
          items: [
            '敏感 JSON 样本不会在陌生远端系统产生不必要副本。',
            '图片和文档内容不需要进入上传队列。',
            '需要保留、备份、披露或删除的服务端内容更少。',
            '用户仍需信任已加载的应用代码和自己的浏览器环境。',
          ],
        },
        {
          heading: '性能是一项权衡，不是口号',
          paragraphs: ['本地工具省去上传和下载往返，对普通文件和慢速网络尤其有价值；但它使用用户设备，低内存手机可能无法完成服务器轻松处理的任务。远端服务可以集中提供算力，同时网络时间、任务队列和频率限制也会成为流程的一部分。'],
        },
        {
          heading: '如何亲自验证对比结果',
          paragraphs: ['打开开发者工具，清空 Network 面板，用无敏感但易识别的样本执行转换，再检查请求。应用代码、字体、WASM 编码器或本地模型的下载，并不自动代表输入被上传；应结合请求方法、大小、时间和载荷判断。'],
          items: [
            '选择文件后检查 POST、PUT、WebSocket 或体积较大的请求体。',
            '必要资源加载完成后断网，再重复相同任务。',
            '阅读隐私说明，检查统计、崩溃报告、存储和明确例外。',
            '检查输出结果，不要假设本地处理必然保留所有特性。',
          ],
        },
        {
          heading: '传统在线转换器可能更合适的场景',
          paragraphs: ['服务端处理适合超大文件、专有格式、稳定高算力、集中协作、审计流程，或关闭标签页后仍需继续的任务。真正的问题是：这些收益是否值得把当前数据交给对应运营方。'],
        },
        {
          heading: '公平比较检查清单',
          paragraphs: ['用同一组问题比较产品，不要只相信“安全”“私密”或“AI 驱动”等字眼。'],
          items: [
            '任务执行时，输入字节实际去了哪里？',
            '哪些第三方会收到内容或元数据？',
            '能否通过浏览器工具验证处理路径？',
            '文件、内存、格式和质量上限是什么？',
            '结果能否保留所需排版、元数据或色彩？',
            '连接、标签页或设备中断后会发生什么？',
          ],
        },
      ],
      callout: { type: 'callout', title: '亲自完成透明对比', text: '打开 Network 面板，用无敏感样本测试 JSON 格式化，再判断这条数据路径是否适合你的任务。', href: '/json-format', linkLabel: '体验 JSON 格式化' },
      conclusion: '当任务适合用户设备、同时又希望避免不必要上传时，ToolGarden 的浏览器本地模式最有价值；重型或集中管理任务则可能更适合服务端。应通过观察数据路径、检查输出质量，并结合数据敏感度和工作量做决定。',
      faq: [
        { question: 'ToolGarden 会上传文件进行处理吗？', answer: '支持浏览器本地处理的工具会把输入留在浏览器中。由于不同工具能力可能不同，在处理敏感数据前仍应查看具体页面说明，并用 Network 面板验证对应流程。' },
        { question: '本地工具一定更安全吗？', answer: '不一定。它减少了普通上传路径，但用户仍需信任来源、页面代码、依赖、浏览器和扩展。高度受监管的数据无论采用什么架构，都可能需要经过批准的环境。' },
        { question: '为什么在线转换器能处理更大的文件？', answer: '远端服务可以分配超过浏览器标签页或手机安全范围的内存和算力。本地处理是用这种扩展性换取更简单的数据路径。' },
        { question: '浏览器本地工具可以离线使用吗？', answer: '部分可以。应用和库、字体、编码器或模型需要先加载；必要资源缓存后，兼容流程可能在断网时继续，但具体取决于页面和浏览器。' },
      ],
    }
  ),
  article(
    'developer-privacy-toolkit',
    {
      title: 'The Complete Privacy Toolkit for Developers in 2026',
      excerpt: 'A practical privacy-first toolkit for inspecting, transforming, and sharing developer data while minimizing unnecessary copies and uploads.',
      metaTitle: 'The Complete Developer Privacy Toolkit for 2026',
      metaDescription: 'Use a privacy-first developer toolkit for JSON, tokens, images, PDFs, QR codes, redaction, local processing, and safer data-sharing workflows in 2026.',
      readingTime: '11 min read',
      tags: ['developer privacy toolkit', 'privacy-first tools', 'local processing', 'data minimization', '2026'],
      relatedTools: [
        { label: 'JSON tools', href: '/json', description: 'Format, compare, query, validate, and convert structured data locally.' },
        { label: 'JWT Decoder', href: '/jwt-decode', description: 'Inspect JWT header and payload fields locally before sharing or debugging.' },
        localImageToolsEn,
        { label: 'PDF tools', href: '/pdf', description: 'Organize and extract PDF content through browser-local workflows.' },
      ],
      lead: 'A privacy toolkit is not one “secure converter.” It is a repeatable workflow for classifying data, minimizing what enters a tool, keeping compatible transformations on the device, verifying the data path, inspecting output, and deleting temporary copies when the task ends.',
      intro: 'Developers regularly handle API payloads, access tokens, logs, screenshots, database exports, PDFs, QR credentials, and configuration files. Each item carries a different risk. This 2026 resource organizes ToolGarden’s local-first utilities around those workflows while keeping the URL evergreen for annual review.',
      sections: [
        {
          heading: 'Start with data classification, not a tool search',
          paragraphs: ['Before pasting or opening anything, decide whether the material is public, internal, confidential, regulated, or credential-bearing. The classification determines whether a browser utility is appropriate, whether fields must be replaced, and whether organizational policy requires an approved workstation or system.'],
          table: {
            type: 'table',
            headers: ['Data type', 'Common example', 'Minimum precaution'],
            rows: [
              ['Public', 'Published API example', 'Verify output and source integrity'],
              ['Internal', 'Application logs or test fixtures', 'Remove identifiers and use local processing'],
              ['Confidential', 'Customer export or contract', 'Use an approved environment and minimize fields'],
              ['Credential-bearing', 'JWT, API key, cookie, connection string', 'Use synthetic values; rotate if exposed'],
              ['Regulated', 'Health, payment, identity data', 'Follow policy and legal controls before using any tool'],
            ],
          },
        },
        {
          heading: 'JSON, logs, and configuration data',
          paragraphs: ['Formatting and validation are low-compute tasks that fit browser-local processing well, but the content may contain secrets hidden several levels deep. Search for authorization headers, tokens, emails, IDs, internal hosts, database URLs, and free-text fields before sharing the result.'],
          items: [
            'Replace real identifiers with consistent synthetic values so relationships remain testable.',
            'Keep comments only when the receiving parser accepts JSONC or JSON5.',
            'Compare a redacted copy against the original to confirm only intended fields changed.',
            'Never paste a live secret into an issue merely because the JSON was formatted locally.',
          ],
        },
        {
          heading: 'Tokens, Base64, and encoded data',
          paragraphs: ['Encoding is not encryption. JWT payloads and Base64 strings are commonly readable without a key, so treat them as data containers rather than privacy controls. Decode locally, identify sensitive claims, and share a synthetic or expired example whenever possible.'],
          items: [
            'Do not confuse decoding a JWT with verifying its signature.',
            'Remove authorization headers and cookies from copied network requests.',
            'Rotate any secret that entered an unapproved destination.',
            'Preserve only the structural shape needed to reproduce a bug.',
          ],
        },
        {
          heading: 'Images and screenshots',
          paragraphs: ['Screenshots can reveal names, browser tabs, notifications, filesystem paths, coordinates, and background documents. Image files can also contain camera and GPS metadata. Crop and redact intentionally, inspect EXIF, then verify the final pixels and metadata instead of assuming compression removed everything.'],
          items: [
            'Use opaque redaction, not blur, when hidden text must be unrecoverable.',
            'Check every frame of an animated image.',
            'Inspect metadata after the final export, not only before editing.',
            'Keep the original outside the share folder to avoid attaching the wrong file.',
          ],
        },
        {
          heading: 'PDFs and office-derived documents',
          paragraphs: ['A PDF page can contain selectable text, annotations, attachments, metadata, hidden layers, and content outside the visible crop. Merging or extracting pages locally avoids an ordinary upload, but it does not sanitize the document. Reopen the result, search for names, inspect properties, and use a dedicated redaction workflow for sensitive documents.'],
        },
        {
          heading: 'QR codes and shareable credentials',
          paragraphs: ['A QR code makes a payload convenient, not secret. Anyone who can photograph it may recover the embedded URL, WiFi password, contact data, or token. Generate codes locally when credentials are involved, limit where they are displayed, and rotate the underlying credential when the audience changes.'],
        },
        {
          heading: 'A privacy-first workflow you can repeat',
          paragraphs: ['A short, consistent sequence is safer than deciding from scratch every time.'],
          items: [
            'Classify: identify sensitivity, ownership, and policy constraints.',
            'Minimize: copy only the fields, pages, pixels, or rows required.',
            'Transform locally: prefer a verifiable no-upload path when the task fits.',
            'Inspect: review network activity, output content, metadata, and format changes.',
            'Share narrowly: choose the intended recipient, channel, and expiration.',
            'Clean up: revoke object URLs, close tabs, and remove temporary exports.',
            'Respond: rotate credentials and report exposure when a mistake occurs.',
          ],
        },
        {
          heading: '2026 maintenance checklist',
          paragraphs: ['Privacy guidance ages when browsers, dependencies, company policy, and regulations change. Review this toolkit at least annually and after a material architecture change.'],
          items: [
            'Re-test local-processing claims with current browsers and the Network panel.',
            'Review third-party dependencies, analytics fields, CSP, and hosting changes.',
            'Confirm retention and subprocessors for any workflow that still needs a server.',
            'Update internal examples so credentials and customer data never become fixtures.',
            'Keep the article URL evergreen while recording the latest review date.',
          ],
        },
      ],
      callout: { type: 'callout', title: 'Begin with the data you inspect most', text: 'Use the JSON tools for a synthetic sample, then verify that formatting, comparison, and queries stay inside the browser workflow.', href: '/json', linkLabel: 'Open JSON tools' },
      conclusion: 'The strongest developer privacy toolkit combines data minimization, browser-local processing, observable behavior, careful output inspection, and a response plan for mistakes. Tools reduce friction; classification and workflow discipline determine whether sensitive data is actually protected.',
      faq: [
        { question: 'Are browser-local tools enough for regulated data?', answer: 'Not by themselves. Local processing can reduce data transfer, but regulated data may require approved devices, access controls, audit records, contracts, retention rules, or tools selected by your organization.' },
        { question: 'Is Base64 safe for secrets?', answer: 'No. Base64 is reversible encoding, not encryption. Anyone who receives the string can usually decode it without a key.' },
        { question: 'Can I safely share a decoded JWT after removing the signature?', answer: 'Not necessarily. The header and payload may still contain names, emails, tenant IDs, roles, and internal identifiers. Create a synthetic token or replace sensitive claims before sharing.' },
        { question: 'Why does the article use an evergreen URL instead of including 2026?', answer: 'The workflow should accumulate authority at one stable address. The title and updated date can show the current review year without creating a new competing URL every January.' },
      ],
    },
    {
      title: '2026 开发者隐私工具箱完整指南',
      excerpt: '一套面向开发者的隐私优先工作流，用于检查、转换和分享数据，同时减少不必要的副本与上传。',
      metaTitle: '2026 开发者隐私工具箱：本地处理与安全分享指南',
      metaDescription: '覆盖 JSON、Token、图片、PDF、二维码、脱敏、本地处理与安全分享的 2026 开发者隐私工具箱。',
      readingTime: '约 11 分钟阅读',
      tags: ['开发者隐私工具箱', '隐私优先工具', '本地处理', '数据最小化', '2026'],
      relatedTools: [
        { label: 'JSON 工具', href: '/json', description: '在本地格式化、对比、查询、校验和转换结构化数据。' },
        { label: 'JWT 解码', href: '/jwt-decode', description: '分享或调试前，在本地检查 JWT Header 和 Payload 字段。' },
        localImageToolsZh,
        { label: 'PDF 工具', href: '/pdf', description: '通过浏览器本地流程整理 PDF 并提取内容。' },
      ],
      lead: '隐私工具箱并不是某一个“安全转换器”，而是一套可重复工作流：先判断数据类型，减少进入工具的内容，在兼容场景中留在设备处理，验证数据路径，检查输出，并在任务结束后清理临时副本。',
      intro: '开发者经常接触接口载荷、访问令牌、日志、截图、数据库导出、PDF、二维码凭据和配置文件，每类材料都有不同风险。这份 2026 资源按照真实任务组织 ToolGarden 的本地优先工具，同时使用永久 URL，便于每年持续更新。',
      sections: [
        {
          heading: '先做数据分类，再搜索工具',
          paragraphs: ['粘贴或打开内容前，先判断它属于公开、内部、机密、受监管，还是包含凭据。分类决定浏览器工具是否合适、哪些字段必须替换，以及组织政策是否要求受批准的设备或系统。'],
          table: {
            type: 'table',
            headers: ['数据类型', '常见例子', '最低防护'],
            rows: [
              ['公开', '已发布的 API 示例', '验证输出和页面来源'],
              ['内部', '应用日志或测试数据', '移除标识符并优先本地处理'],
              ['机密', '客户导出或合同', '使用批准环境并最小化字段'],
              ['含凭据', 'JWT、API Key、Cookie、连接串', '使用合成值；暴露后立即轮换'],
              ['受监管', '健康、支付、身份数据', '使用任何工具前遵守政策和法律控制'],
            ],
          },
        },
        {
          heading: 'JSON、日志与配置数据',
          paragraphs: ['格式化和校验计算量较低，很适合浏览器本地处理，但内容可能在多层结构中隐藏秘密。分享前搜索授权头、Token、邮箱、ID、内部主机、数据库 URL 和自由文本字段。'],
          items: [
            '用保持一致关系的合成值替换真实标识符。',
            '只有接收解析器支持 JSONC 或 JSON5 时才保留注释。',
            '将脱敏副本与原文对比，确认只修改了预期字段。',
            '即使 JSON 在本地格式化过，也不要把真实密钥粘贴到工单。',
          ],
        },
        {
          heading: 'Token、Base64 与编码数据',
          paragraphs: ['编码不等于加密。JWT Payload 和 Base64 字符串通常无需密钥就能读取，应把它们视为数据容器，而不是隐私保护。尽量在本地解码、识别敏感声明，并分享合成或过期样本。'],
          items: [
            '不要把 JWT 解码误认为签名验证。',
            '复制网络请求时移除 Authorization 和 Cookie。',
            '任何进入未批准位置的秘密都应立即轮换。',
            '只保留复现问题所需的数据结构。',
          ],
        },
        {
          heading: '图片与截图',
          paragraphs: ['截图可能暴露姓名、浏览器标签、通知、文件路径、坐标和背景文档；图片还可能包含相机与 GPS 元数据。应有意裁剪和遮盖、检查 EXIF，再验证最终像素和元数据，不要假设压缩会删除所有信息。'],
          items: [
            '必须不可恢复的文字使用实色遮盖，不要只做模糊。',
            '动画图片需要检查每一帧。',
            '在最终导出后检查元数据，而不只是在编辑前。',
            '原图放在分享目录外，避免附错文件。',
          ],
        },
        {
          heading: 'PDF 与 Office 派生文档',
          paragraphs: ['PDF 页面可能包含可选文本、批注、附件、元数据、隐藏图层和可见裁剪区以外的内容。本地合并或提取页面避免了普通上传，但不等于完成清理。应重新打开结果、搜索姓名、检查属性，并对敏感文档使用专门脱敏流程。'],
        },
        {
          heading: '二维码与可分享凭据',
          paragraphs: ['二维码让载荷更方便，但不会让它保密。任何能拍到二维码的人都可能读取其中的网址、WiFi 密码、联系人数据或 Token。凭据相关二维码应优先本地生成、限制展示位置，并在受众变化时轮换底层凭据。'],
        },
        {
          heading: '一套可以重复执行的隐私流程',
          paragraphs: ['简短而固定的顺序，比每次临时判断更可靠。'],
          items: [
            '分类：确认敏感度、所有权和政策要求。',
            '最小化：只复制必要字段、页面、像素或行。',
            '本地转换：任务合适时优先选择可验证的无需上传路径。',
            '检查：查看网络活动、输出内容、元数据和格式变化。',
            '窄范围分享：确认接收人、渠道和有效期。',
            '清理：释放对象 URL、关闭标签页并删除临时导出。',
            '响应：发生错误时轮换凭据并按流程报告。',
          ],
        },
        {
          heading: '2026 年维护清单',
          paragraphs: ['浏览器、依赖、公司政策和法规变化都会让隐私建议过时。至少每年复查一次，并在架构发生重大变化后立即复查。'],
          items: [
            '使用当前浏览器和 Network 面板重新验证本地处理声明。',
            '复查第三方依赖、统计字段、CSP 和托管变化。',
            '仍需服务器的流程要确认保留期限和分包商。',
            '更新内部示例，避免凭据和客户数据变成长期测试夹具。',
            '保持文章 URL 不变，通过更新时间记录最近审查年份。',
          ],
        },
      ],
      callout: { type: 'callout', title: '从最常检查的数据开始', text: '先用合成样本体验 JSON 工具，再验证格式化、对比和查询都留在浏览器流程中。', href: '/json', linkLabel: '打开 JSON 工具' },
      conclusion: '可靠的开发者隐私工具箱，需要把数据最小化、浏览器本地处理、可观察行为、输出检查和事故响应结合起来。工具能降低操作成本，但真正保护敏感数据的是分类和流程纪律。',
      faq: [
        { question: '浏览器本地工具足以处理受监管数据吗？', answer: '不能一概而论。本地处理可以减少数据传输，但受监管数据还可能要求批准设备、访问控制、审计记录、合同、保留规则或组织指定工具。' },
        { question: 'Base64 可以保护秘密吗？', answer: '不能。Base64 是可逆编码，不是加密；收到字符串的人通常不需要密钥就能还原内容。' },
        { question: '移除签名后可以安全分享解码的 JWT 吗？', answer: '不一定。Header 和 Payload 仍可能包含姓名、邮箱、租户 ID、角色和内部标识。应创建合成 Token 或先替换敏感声明。' },
        { question: '为什么 URL 不包含 2026？', answer: '稳定地址可以持续积累权威度。标题和更新时间能够表达当前审查年份，不必每年创建一个相互竞争的新 URL。' },
      ],
    }
  ),
  article(
    'wifi-qr-code-generator-guide',
    {
      title: 'Building QR Codes for WiFi: A Step-by-Step Guide',
      excerpt: 'Create reliable WiFi QR codes for WPA, open, and hidden networks, including correct payload syntax, escaping rules, security checks, and scan testing.',
      metaTitle: 'WiFi QR Code Generator Guide: Syntax, Escaping, and Testing',
      metaDescription: 'Build a WiFi QR code step by step. Learn WIFI payload syntax, WPA and open networks, hidden SSIDs, special-character escaping, security, and scan testing.',
      readingTime: '9 min read',
      tags: ['WiFi QR code generator', 'WiFi QR syntax', 'QR Code', 'WPA', 'local QR generator'],
      relatedTools: [
        qrGeneratorEn,
        { label: 'QR Code Decoder', href: '/qr-code/decode', description: 'Decode the exported QR image locally and verify the exact WiFi payload.' },
      ],
      lead: 'A WiFi QR code is a QR image containing a structured text payload. When a compatible phone scans that payload, it can recognize the network name, security type, password, and hidden-network flag, then ask the user whether to join.',
      intro: 'The image is usually easy to generate; most failures come from malformed payload text, missing escaping, low contrast, or insufficient testing. The following workflow uses the de facto WIFI format implemented by widely used QR readers and mobile cameras.',
      sections: [
        {
          heading: 'Understand the WIFI payload',
          paragraphs: ['A common password-protected network uses this structure. T is the authentication type, S is the SSID, P is the password, and the final double semicolon closes the payload.'],
          code: { type: 'code', language: 'text', code: 'WIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;' },
          table: {
            type: 'table',
            headers: ['Field', 'Meaning', 'Example'],
            rows: [
              ['T', 'Authentication type', 'WPA, WEP, WPA2-EAP, or nopass'],
              ['S', 'Network SSID; required', 'Studio Network'],
              ['P', 'Password; omit for nopass', 'correct-horse-battery-staple'],
              ['H', 'Hidden SSID flag; optional', 'true'],
            ],
          },
        },
        {
          heading: 'Step 1: collect and classify the network details',
          paragraphs: ['Copy the SSID exactly, including capitalization and spaces. Confirm whether the network uses WPA-family security, WEP, enterprise authentication, or no password. If it is hidden, record that explicitly. Do not guess the security type from the password format.'],
          items: [
            'Prefer a guest network instead of exposing a primary household or office credential.',
            'Check whether captive-portal terms still appear after joining.',
            'Decide where the printed or displayed code will be visible.',
            'Plan a credential rotation date before distributing permanent signage.',
          ],
        },
        {
          heading: 'Step 2: escape special characters',
          paragraphs: ['Backslash, semicolon, comma, double quote, and colon have structural meaning and should be escaped with a backslash when they occur inside values. Escaping is the most common reason a visually correct code produces a truncated password or wrong SSID.'],
          code: { type: 'code', language: 'text', code: 'SSID: Cafe;Guest\\5G\nPayload value: Cafe\\;Guest\\\\5G\n\nPassword: tea:milk,2026\nPayload value: tea\\:milk\\,2026' },
        },
        {
          heading: 'Step 3: build the payload for your network type',
          paragraphs: ['Use one of these patterns, substituting escaped values. Field order is flexible, but consistent order makes manual review easier.'],
          code: { type: 'code', language: 'text', code: 'WPA network\nWIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;\n\nOpen network\nWIFI:T:nopass;S:Guest Lounge;;\n\nHidden WPA network\nWIFI:T:WPA;S:Hidden Lab;P:sample-password;H:true;;' },
        },
        {
          heading: 'Step 4: generate locally and choose robust visual settings',
          paragraphs: ['Paste the payload into a QR generator or use a structured WiFi form. Use a dark foreground on a light background, preserve a quiet zone around all four sides, and avoid decorative patterns that change the finder squares. More characters create a denser symbol and may require a larger image.'],
          items: [
            'Start with black on white for the most predictable result.',
            'Keep logos small and raise error correction only when decoration requires it.',
            'Export at a resolution appropriate to the final physical size.',
            'Do not screenshot a tiny preview and scale it up for print.',
          ],
        },
        {
          heading: 'Step 5: verify the payload and real-world scan',
          paragraphs: ['Decode the exported QR file to confirm the exact text, then scan it from the expected distance on at least one iOS and one Android device when possible. Verify that the phone shows the intended SSID before accepting the connection prompt. Test the printed material, not just the source PNG on a bright monitor.'],
        },
        {
          heading: 'Troubleshooting WiFi QR codes',
          paragraphs: ['If scanning fails, separate image-recognition problems from payload problems. First decode the image as plain text. If decoding fails, increase size, contrast, and quiet zone. If the payload decodes but the phone does not offer to connect, compare every field and escape character.'],
          table: {
            type: 'table',
            headers: ['Symptom', 'Likely cause', 'Fix'],
            rows: [
              ['No scanner recognizes the image', 'Low contrast, blur, crop, or dense output', 'Regenerate larger with a clear quiet zone'],
              ['Text decodes but no join prompt appears', 'Invalid WIFI syntax or unsupported authentication', 'Check T, S, P, H, escapes, and terminator'],
              ['SSID is truncated', 'Unescaped semicolon or backslash', 'Escape every structural character in the value'],
              ['Correct payload joins the wrong network', 'Duplicate SSID nearby', 'Rename the guest SSID or verify before joining'],
              ['Old device fails', 'Reader or authentication support differs', 'Provide the SSID and password as a text fallback'],
            ],
          },
        },
        {
          heading: 'Treat the QR code as a visible password',
          paragraphs: ['A WiFi QR code does not encrypt the password. Anyone who can photograph or decode the image can recover the payload. Use a guest network, isolate untrusted clients, restrict where the code is displayed, and replace both the sign and credential when access should end.'],
        },
      ],
      callout: { type: 'callout', title: 'Generate and verify locally', text: 'Create the WiFi QR code in your browser, download it, then decode the image to verify the exact payload before printing.', href: '/qr-code/generate', linkLabel: 'Open WiFi QR Code Generator' },
      conclusion: 'A reliable WiFi QR code needs correct field syntax, complete escaping, clear artwork, and real-device testing. Build it from an isolated guest credential, verify both the decoded text and the join prompt, and remember that convenience does not make the embedded password confidential.',
      faq: [
        { question: 'What is the correct WiFi QR code format?', answer: 'A typical WPA payload is WIFI:T:WPA;S:Network Name;P:password;;. Use nopass for an open network and add H:true for a hidden SSID. Escape backslash, semicolon, comma, double quote, and colon inside values.' },
        { question: 'Does a WiFi QR code hide or encrypt the password?', answer: 'No. The QR symbol encodes readable text. A scanner can recover the password, so use a guest network and control where the code is displayed.' },
        { question: 'Why does the QR code scan but not connect?', answer: 'The image layer is working, but the WIFI payload may have the wrong security type, an unescaped character, a misspelled SSID, an unsupported enterprise configuration, or a missing terminator. Decode it as text and compare every field.' },
        { question: 'Can I make a QR code for a hidden WiFi network?', answer: 'Yes. Add H:true to the payload and still include the exact SSID. Hidden networks are not a substitute for strong authentication, and device behavior can vary, so test the final code on target phones.' },
        { question: 'Should I put my main WiFi password in a QR code?', answer: 'A separate guest network is safer because the QR can be copied. Use client isolation where appropriate and rotate the guest credential when the intended audience changes.' },
      ],
    },
    {
      title: 'WiFi 二维码生成：从格式到扫码测试的完整步骤',
      excerpt: '正确生成 WPA、开放和隐藏网络的 WiFi 二维码，掌握载荷格式、特殊字符转义、安全检查与扫码测试。',
      metaTitle: 'WiFi 二维码生成教程：格式、转义与扫码测试',
      metaDescription: '分步骤生成 WiFi 二维码，了解 WIFI 载荷格式、WPA 与开放网络、隐藏 SSID、特殊字符转义、安全建议和扫码测试。',
      readingTime: '约 9 分钟阅读',
      tags: ['WiFi 二维码生成器', 'WiFi 二维码格式', '二维码', 'WPA', '本地二维码'],
      relatedTools: [
        qrGeneratorZh,
        { label: '二维码解码', href: '/qr-code/decode', description: '在本地解码导出的二维码图片，核对完整 WiFi 载荷。' },
      ],
      lead: 'WiFi 二维码本质上是一张包含结构化文本载荷的二维码。兼容手机扫码后，可以识别网络名称、加密类型、密码和隐藏网络标记，再询问用户是否连接。',
      intro: '生成图片通常不难，失败更多来自格式错误、字符未转义、对比度不足或没有充分测试。下面的流程采用常见 QR 阅读器和手机相机实现的事实标准 WIFI 格式。',
      sections: [
        {
          heading: '先理解 WIFI 载荷',
          paragraphs: ['常见密码网络使用下面的结构。T 表示认证类型，S 是 SSID，P 是密码，末尾两个分号用于结束载荷。'],
          code: { type: 'code', language: 'text', code: 'WIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;' },
          table: {
            type: 'table',
            headers: ['字段', '含义', '示例'],
            rows: [
              ['T', '认证类型', 'WPA、WEP、WPA2-EAP 或 nopass'],
              ['S', '网络 SSID，必填', 'Studio Network'],
              ['P', '密码；nopass 时省略', 'correct-horse-battery-staple'],
              ['H', '隐藏 SSID 标志，可选', 'true'],
            ],
          },
        },
        {
          heading: '第 1 步：收集并判断网络信息',
          paragraphs: ['准确复制 SSID，包括大小写和空格；确认网络使用 WPA 系列、WEP、企业认证还是无密码；如果网络隐藏，也要明确记录。不要根据密码形式猜测安全类型。'],
          items: [
            '优先使用访客网络，不暴露家庭或办公室主网络凭据。',
            '确认连接后是否还需要通过 Portal 接受条款。',
            '提前考虑打印或展示位置能被哪些人看到。',
            '制作长期标牌前先规划凭据轮换时间。',
          ],
        },
        {
          heading: '第 2 步：转义特殊字符',
          paragraphs: ['反斜杠、分号、逗号、双引号和冒号具有结构含义，出现在字段值中时应在前面加反斜杠。未转义是二维码看似正常、实际密码或 SSID 被截断的最常见原因。'],
          code: { type: 'code', language: 'text', code: 'SSID：Cafe;Guest\\5G\n载荷字段：Cafe\\;Guest\\\\5G\n\n密码：tea:milk,2026\n载荷字段：tea\\:milk\\,2026' },
        },
        {
          heading: '第 3 步：按网络类型构造载荷',
          paragraphs: ['使用下面对应模板，并把字段替换为已转义的值。字段顺序可以调整，但保持固定顺序更方便人工检查。'],
          code: { type: 'code', language: 'text', code: 'WPA 网络\nWIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;\n\n开放网络\nWIFI:T:nopass;S:Guest Lounge;;\n\n隐藏 WPA 网络\nWIFI:T:WPA;S:Hidden Lab;P:sample-password;H:true;;' },
        },
        {
          heading: '第 4 步：在本地生成并选择可靠样式',
          paragraphs: ['把载荷粘贴到二维码生成器，或使用结构化 WiFi 表单。深色前景搭配浅色背景，四周保留静默区，不要修改三个定位方块。内容越长，二维码越密，需要更大的输出尺寸。'],
          items: [
            '优先使用黑底模块和白色背景。',
            'Logo 保持较小，只有装饰确有需要时才提高纠错级别。',
            '根据最终物理尺寸导出足够分辨率。',
            '不要截取很小的预览图再放大打印。',
          ],
        },
        {
          heading: '第 5 步：验证载荷和真实扫码',
          paragraphs: ['先解码导出的二维码文件，确认文本完全正确；再尽量用至少一台 iOS 和一台 Android 设备，从实际使用距离扫码。接受连接前核对手机显示的 SSID。必须测试最终印刷品，而不只是明亮显示器上的源 PNG。'],
        },
        {
          heading: 'WiFi 二维码故障排查',
          paragraphs: ['失败时应区分图片识别问题和载荷问题。先尝试把图片解码为普通文本：解码失败就提高尺寸、对比度和静默区；文本能解码但手机不提示连接，则逐项检查字段与转义。'],
          table: {
            type: 'table',
            headers: ['现象', '可能原因', '处理方式'],
            rows: [
              ['任何扫码器都无法识别', '对比低、模糊、裁切或内容太密', '增大尺寸并保留完整静默区'],
              ['能解码文本但不提示连接', 'WIFI 格式错误或认证不兼容', '检查 T、S、P、H、转义和结束符'],
              ['SSID 被截断', '分号或反斜杠未转义', '转义字段值中的全部结构字符'],
              ['载荷正确但连接到错误网络', '附近存在同名 SSID', '重命名访客网络或连接前确认'],
              ['旧设备无法连接', '扫码器或认证支持不同', '同时提供 SSID 和密码文字备用'],
            ],
          },
        },
        {
          heading: '把二维码当作可见密码',
          paragraphs: ['WiFi 二维码不会加密密码。任何能拍摄或解码图片的人都能恢复载荷。应使用访客网络、隔离不受信任客户端、限制展示位置，并在访问应结束时同时更换标牌和凭据。'],
        },
      ],
      callout: { type: 'callout', title: '在本地生成并验证', text: '在浏览器里生成 WiFi 二维码，下载后再解码图片，确认载荷无误再打印。', href: '/qr-code/generate', linkLabel: '打开 WiFi 二维码生成器' },
      conclusion: '可靠的 WiFi 二维码需要正确字段、完整转义、清晰图形和真机测试。优先使用隔离的访客凭据，同时验证解码文本与连接提示，并记住便利性不会让二维码中的密码自动保密。',
      faq: [
        { question: '正确的 WiFi 二维码格式是什么？', answer: '典型 WPA 载荷是 WIFI:T:WPA;S:Network Name;P:password;;。开放网络使用 nopass，隐藏 SSID 增加 H:true。字段值中的反斜杠、分号、逗号、双引号和冒号需要转义。' },
        { question: 'WiFi 二维码会隐藏或加密密码吗？', answer: '不会。二维码编码的是可读文本，扫码器可以恢复密码，因此应使用访客网络并控制二维码展示范围。' },
        { question: '为什么二维码能识别却不能连接？', answer: '图片层已经正常，但 WIFI 载荷可能使用错误加密类型、字符未转义、SSID 拼写错误、企业认证不兼容或缺少结束符。先解码为文本再逐项对比。' },
        { question: '隐藏 WiFi 可以生成二维码吗？', answer: '可以。在载荷中加入 H:true，同时仍需包含准确 SSID。隐藏网络不能替代强认证，不同设备行为也可能不同，因此必须在目标手机上测试。' },
        { question: '应该把主 WiFi 密码放进二维码吗？', answer: '更安全的做法是建立独立访客网络，因为二维码很容易被复制。适当开启客户端隔离，并在受众变化时轮换访客密码。' },
      ],
    }
  ),
];
