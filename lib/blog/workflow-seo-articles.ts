import type { BlogArticle } from './articles';

const watermarkAiStepsZh = `1. 选择水印区域
2. 浏览器把原图和选区送入本地模型或快速修复算法
3. 模型根据周围像素推断缺失背景
4. 边缘做轻量融合
5. 导出 JPG、PNG 或 WebP`;

const watermarkAiStepsEn = `1. Select the watermark area
2. The browser sends the image and mask to a local model or fast repair algorithm
3. The model predicts background pixels from surrounding context
4. Edges are lightly blended
5. Export JPG, PNG, or WebP`;

const lrcSnippet = `[00:12.00]First lyric line
[00:15.50]Second lyric line`;

const lrcOffsetSnippet = `[00:12.00]First lyric line
[00:14.80]Second lyric line
[00:18.20]Third lyric line`;

const srtSnippet = `1
00:00:12,000 --> 00:00:15,500
First subtitle line

2
00:00:15,500 --> 00:00:18,000
Second subtitle line`;

const base64Example = `Hello -> SGVsbG8=`;

const excelJsonExample = `[
  {
    "name": "Alice",
    "email": "alice@example.com",
    "active": true
  }
]`;

const excelNestedJsonExample = `[
  {
    "user": {
      "name": "Alice",
      "email": "alice@example.com"
    },
    "order": {
      "id": "A-1001",
      "total": 59.9
    }
  }
]`;

const jsonVariantsExample = `{
  // JSONC / JSON5 allow comments in some tools
  name: 'ToolGarden',
  tags: ['json', 'tools'],
}`;

const wordCountMixedExample = `中文 ABC 😊
ToolGarden JSON 工具`;

const removeBgImplementationSnippet = `const modelMap = {
  medium: 'isnet_fp16',
  small: 'isnet_quint8',
} as const;

const modelInput = await normalizeLoadedImageToPng(image);
const blob = await removeBackground(modelInput, {
  publicPath: BACKGROUND_REMOVAL_PUBLIC_PATH,
  model: modelMap[options.model ?? 'medium'],
  output: { format: 'image/png', quality: 1 },
  progress: (label, current, total) => {
    options.onProgress?.(createBackgroundRemovalProgress(label, current, total));
  },
});`;

const browserLocalArchitectureSnippet = `Tool page
  -> React state and user controls
  -> lib/utils pure functions
  -> Browser APIs, Web Workers, Canvas, Web Crypto, WASM, or local model inference
  -> Blob, download, preview, copy

No API route receives the pasted text or uploaded file.`;

export const workflowSeoBlogArticles = [
  {
    slug: 'how-i-built-browser-local-online-tool-site',
    publishedAt: '2026-07-07',
    updatedAt: '2026-07-20',
    translations: {
      zh: {
        title: 'ToolGarden 是如何构建的：浏览器本地工具套件架构',
        excerpt: '深入了解 ToolGarden 如何通过注册中心、静态页面、纯函数、Worker、Canvas、Web Crypto 和 WASM 构建浏览器本地工具套件。',
        metaTitle: 'ToolGarden 架构：浏览器本地工具套件是如何构建的',
        metaDescription: '解析 ToolGarden 浏览器本地架构：Next.js 静态站、注册中心、纯函数工具层、Web Worker、Canvas、Web Crypto、WASM 与隐私设计。',
        readingTime: '约 12 分钟阅读',
        tags: ['本地处理', '隐私安全', '浏览器工具', 'Next.js', '工程架构'],
        relatedTools: [
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '在浏览器本地格式化、压缩和校验 JSON，输入内容不会上传到服务器。',
          },
          {
            label: '图片工具',
            href: '/image',
            description: '图片编辑、压缩、去背景、格式转换和 Base64 工具都优先在浏览器本地处理。',
          },
          {
            label: 'PDF 工具',
            href: '/pdf',
            description: '合并、拆分、提取页面、转 Word 和转 PDF 等常见 PDF 流程尽量在本地完成。',
          },
          {
            label: '文本工具',
            href: '/text',
            description: '字数统计和文本对比直接在浏览器里运行，适合处理临时文案和内部片段。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '我做 ToolGarden 的起点很简单：很多日常小工具确实方便，但我不想为了格式化一段 JSON、压缩一张证件照、查看一个 JWT，或者合并一份 PDF，就把内容交给一个不知道怎么存储和转发数据的服务器。',
          },
          {
            type: 'paragraph',
            text: '开发时经常会遇到这种场景：接口返回里有用户信息，日志里有订单号，JWT 里有租户 ID，截图里有内部系统页面，PDF 里有合同或报名材料。它们未必都是最高等级的机密，但也不应该随手上传到第三方在线工具。于是我决定做一个在线工具站，但核心约束是：工具输入尽量只在用户自己的浏览器里处理。',
          },
          {
            type: 'quote',
            text: '这个网站不是把本地处理当成一句口号，而是把“不要把用户输入交给服务器”作为架构约束。',
          },
          { type: 'heading', level: 2, text: '为什么一定要本地处理？' },
          {
            type: 'paragraph',
            text: '很多在线工具的风险不在于功能本身，而在于你很难知道数据上传之后发生了什么：有没有写入日志、有没有被临时缓存、有没有经过第三方队列、有没有被用于调试或训练。对开发者来说，一段 JSON 样本可能包含真实用户 ID；对设计和运营同学来说，一张图片可能包含尚未公开的活动素材；对普通用户来说，一个 PDF 可能就是证件、合同或报名表。',
          },
          {
            type: 'paragraph',
            text: '本地处理不能解决所有安全问题，但它能先消掉一个很大的暴露面：文件和文本不必离开设备。只要能力允许，我宁愿让浏览器多做一点工作，也不把处理过程搬到服务器上。',
          },
          { type: 'heading', level: 2, text: '整体架构：静态站点加浏览器运行时' },
          {
            type: 'paragraph',
            text: 'ToolGarden 用 Next.js App Router、TypeScript 和 Tailwind CSS 做界面，但部署形态尽量保持静态化。页面、脚本、模型资产和 WASM 文件可以被浏览器下载，真正的输入处理发生在客户端：解析、转换、渲染、压缩、合并、导出，都由浏览器里的 JavaScript、Web API、Worker 或模型推理完成。',
          },
          { type: 'code', language: 'text', code: browserLocalArchitectureSnippet },
          {
            type: 'paragraph',
            text: '这个结构有一个直接好处：服务端不需要接收用户粘贴的 JSON、不需要接收上传的图片、不需要接收 PDF 原文。服务器提供的是应用代码和静态资源，用户的数据留在浏览器进程里。',
          },
          { type: 'heading', level: 2, text: '页面保持很薄，复杂逻辑放进纯函数' },
          {
            type: 'paragraph',
            text: '为了让“本地处理”不变成页面里到处散落的临时代码，我把工具页面压得很薄。页面主要负责 useState、输入框、按钮、预览和错误展示；真正的解析、转换、校验、压缩逻辑放在 lib/utils 里，按纯函数方式返回结果。',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `type Outcome =
  | { ok: true; output: string; parsed?: unknown }
  | { ok: false; message: string };`,
          },
          {
            type: 'paragraph',
            text: '这样做有两个目的。第一，工具逻辑可以独立理解和测试，不需要依赖 React 状态。第二，页面不会直接写 JSON.parse、文件解析、diff 算法或图片导出细节，避免每新增一个工具就复制一份隐性风险。',
          },
          { type: 'heading', level: 2, text: '注册中心驱动发现入口' },
          {
            type: 'paragraph',
            text: 'ToolGarden 把工具元数据集中在注册中心。首页卡片、分类、面包屑、推荐工具、本地化路径、sitemap、JSON-LD 和 llms 文件都从同一来源派生。新增能力只有完成注册、双语文案、页面、元数据和发现入口后，才算正式进入产品。',
          },
          {
            type: 'paragraph',
            text: '博客专题也采用同样思路：支柱页、集群文章、目标关键词和工具路径映射放在一份拓扑配置中。页面组件只消费关系，避免手工维护两套相互漂移的内链列表。',
          },
          { type: 'heading', level: 2, text: '不同类型的数据如何留在浏览器里' },
          {
            type: 'table',
            headers: ['类型', '浏览器本地实现', '隐私收益'],
            rows: [
              ['JSON / YAML / XML / CSV', '使用本地解析库和纯函数完成格式化、转换、修复和校验。', '接口样本、配置片段和日志不需要上传。'],
              ['JWT / 编码解码', 'Base64URL、URL、Unicode、Gzip、Hash 和 HS256 校验使用浏览器能力与 Web Crypto。', 'Token 排查可以在本地查看 Header 和 Payload。'],
              ['图片', 'File、Blob、ImageBitmap、Canvas、OffscreenCanvas、Worker、WASM 和本地模型完成压缩、转换、编辑和导出。', '截图、证件照、产品图和内部素材不离开设备。'],
              ['PDF / Office / 文档', 'pdf-lib、pdfjs-dist、fflate、SheetJS 等在浏览器里读取、生成、拆分、合并或导出。', '合同、报名材料和内部文档减少上传暴露。'],
              ['文本和字幕', 'diff、字数统计、LRC/SRT 解析和媒体预览都在前端完成。', '临时文案、日志和字幕文件不必经过服务器。'],
            ],
          },
          { type: 'heading', level: 2, text: 'AI 功能也尽量本地化' },
          {
            type: 'paragraph',
            text: '图片去背景、证件照抠图、图片去水印这类功能听起来天然像“要传到云端 AI 服务”。但在这个站里，我优先选择能在浏览器中运行的开源模型或本地算法。第一次使用时，浏览器可能需要下载模型资产；模型加载完成后，用户图片会在本地解码、归一化、推理、合成和导出。',
          },
          {
            type: 'paragraph',
            text: '这并不意味着本地模型永远比商业云服务更强。它的边缘处理、复杂背景鲁棒性和大批量稳定性都有边界。但对日常证件照、商品图、简单背景、截图修补来说，本地模型已经足够有用，而且换来了一个重要优势：图片不用上传。',
          },
          { type: 'heading', level: 2, text: '发现入口也要诚实表达隐私定位' },
          {
            type: 'paragraph',
            text: '做工具站时，SEO、sitemap、JSON-LD、llms.txt、Open Graph 很容易变成“写给搜索引擎看的另一套文案”。我不想让这些入口和实际能力脱节，所以把 SEO 描述统一从 registry 和 messages 派生，再在生成层补充本地处理、无需上传和隐私友好的说明。',
          },
          {
            type: 'paragraph',
            text: '这件事看起来只是营销文案，实际上是工程约束的外显：如果一个工具没有接入 registry、没有对应页面、没有本地处理说明、没有进入 sitemap 和 AI 发现文件，它就不应该被当作正式能力发布。',
          },
          { type: 'heading', level: 2, text: '本地处理不是没有代价' },
          {
            type: 'list',
            items: [
              '浏览器内存有限，大批量图片、超大 PDF 或几百个文件同时处理，可能会变慢甚至让标签页崩溃。',
              '复杂 Office 文档的排版引擎和桌面软件不同，导出 PDF 后仍需要人工复查。',
              'AI 模型首次运行需要下载模型资产，弱网或离线状态下可能无法启动。',
              '某些旧格式或加密格式并不适合浏览器内直接解析，需要明确标注限制，而不是假装支持。',
              '本地处理减少上传风险，但用户仍然需要在可信网络、可信浏览器和 HTTPS 页面中使用工具。',
            ],
          },
          { type: 'heading', level: 2, text: '我最后得到的原则' },
          {
            type: 'list',
            ordered: true,
            items: [
              '能在浏览器完成的，就不要传到服务器。',
              '页面只负责交互，工具逻辑进入纯函数和 Worker。',
              '文件处理要告诉用户边界，不夸大兼容性。',
              'SEO 和博客文案必须如实反映技术实现。',
              '隐私不是最后加的一句标语，而是从架构开始就要守住的约束。',
            ],
          },
          {
            type: 'callout',
            title: '试试本地处理工具',
            text: '如果你只是想格式化 JSON、压缩图片、处理 PDF 或对比文本，可以直接打开对应工具。绝大多数输入会在浏览器本地完成处理，不需要上传。',
            href: '/json-format',
            linkLabel: '打开 JSON 格式化',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '我建立这个站，不是因为本地处理听起来更酷，而是因为它让我在使用在线工具时少一点不安。一个好用的工具站应该让人放心地粘贴一段数据、拖入一个文件、下载结果，然后关掉页面，而不是让用户反复猜测这些内容去了哪里。',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden 还会继续扩展工具数量，但我希望它一直保持这个方向：把复杂处理尽量放到浏览器里，把工具逻辑做清楚，把限制说清楚，让隐私安全成为默认体验的一部分。',
          },
        ],
        faq: [
          {
            question: 'ToolGarden 真的完全不上传用户输入吗？',
            answer: '工具输入的文本和上传文件不会被发送到服务器处理。站点会像普通网页一样加载 JavaScript、CSS、WASM、模型资产和页面资源，也可能有页面级访问统计；但格式化 JSON、处理图片、拆分 PDF、文本对比这类工具输入，设计上都在浏览器本地运行。个别能力如果未来需要服务端支持，应该在界面和文档里单独说明，而不是默认混在本地工具里。',
          },
          {
            question: '本地处理就一定安全吗？',
            answer: '本地处理减少的是“把数据上传给第三方服务器”这个暴露面，但它不是万能安全承诺。用户仍然要确认访问的是正确域名、页面通过 HTTPS 加载、浏览器和系统可信，处理极高敏感等级的材料时也要遵守组织安全规范。我的目标是让日常开发和办公中的普通敏感数据少走一跳网络，而不是替代企业级安全审计。',
          },
          {
            question: '为什么不直接做一个后端，兼容性不是更好吗？',
            answer: '后端当然能处理更多格式，也更容易跑重型模型和复杂排版引擎。但一旦文件上传，隐私模型就变了：要考虑存储、日志、队列、清理策略、访问控制和合规。ToolGarden 的优先级是日常轻量工具和隐私友好，所以能本地完成的先本地完成；只有当浏览器能力明显不够时，才考虑把服务端作为明确标注的独立能力。',
          },
          {
            question: '浏览器本地处理适合哪些场景？',
            answer: '它很适合 JSON 格式化、配置清洗、JWT 查看、图片压缩转换、简单 PDF 拆分合并、文本对比、字幕编辑、Base64 编解码这类临时任务。它不太适合几 GB 文件、上千张图片、复杂 Office 排版保真、严格法律归档或需要多人协作审批的流程。遇到这些场景，桌面软件、命令行工具或受控后端系统会更稳。',
          },
        ],
      },
      en: {
        title: 'How We Built ToolGarden: Architecture of a Browser-Local Tool Suite',
        excerpt: 'See how ToolGarden uses a registry, static pages, pure utilities, Workers, Canvas, Web Crypto, and WASM to build a browser-local tool suite.',
        metaTitle: 'How We Built ToolGarden: Browser-Local Tool Architecture',
        metaDescription: 'Explore ToolGarden architecture: static Next.js pages, a tool registry, pure utilities, Web Workers, Canvas, Web Crypto, WASM, and privacy-first design.',
        readingTime: '12 min read',
        tags: ['Local processing', 'Privacy', 'Browser tools', 'Next.js', 'Architecture'],
        relatedTools: [
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and validate JSON locally in the browser without uploading input.',
          },
          {
            label: 'Image Tools',
            href: '/image',
            description: 'Edit, compress, remove backgrounds, convert formats, and handle Base64 images locally in the browser.',
          },
          {
            label: 'PDF Tools',
            href: '/pdf',
            description: 'Merge, split, extract pages, convert to Word, and create PDFs with browser-local workflows where possible.',
          },
          {
            label: 'Text Tools',
            href: '/text',
            description: 'Count words and compare text directly in the browser for temporary copy, logs, and internal snippets.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The reason I built ToolGarden was simple: online tools are convenient, but I did not want to upload a JSON payload, an ID photo, a JWT, or a PDF just to format, inspect, compress, or merge it.',
          },
          {
            type: 'paragraph',
            text: 'In daily development work, sensitive details appear in ordinary places. API samples contain user IDs. Logs contain order numbers. JWTs contain tenant claims. Screenshots show internal systems. PDFs may be contracts, forms, or application material. None of these should be casually pasted into a tool whose server-side behavior is unknown.',
          },
          {
            type: 'quote',
            text: 'ToolGarden treats local processing as an architectural constraint: do not send user input to the server when the browser can do the work.',
          },
          { type: 'heading', level: 2, text: 'Why Local Processing Matters' },
          {
            type: 'paragraph',
            text: 'The risk with many online tools is not the feature itself. The risk is that you do not know what happens after upload. Is the file logged? Cached? Sent through a queue? Used for debugging? Routed through another provider? For most everyday tasks, the safest upload is the one that never happens.',
          },
          {
            type: 'paragraph',
            text: 'Browser-local processing does not solve every security problem, but it removes a major exposure path. Files and text can stay on the device, while the website provides the interface and the code needed to process them.',
          },
          { type: 'heading', level: 2, text: 'The Architecture: Static Site, Browser Runtime' },
          {
            type: 'paragraph',
            text: 'ToolGarden uses Next.js App Router, TypeScript, and Tailwind CSS for the interface, but the processing model is intentionally client-side. The browser downloads pages, scripts, model assets, and WASM files. The actual work happens through JavaScript, Web APIs, Workers, Canvas, Web Crypto, and local inference where possible.',
          },
          { type: 'code', language: 'text', code: browserLocalArchitectureSnippet },
          {
            type: 'paragraph',
            text: 'That boundary matters. The server does not need to receive pasted JSON, uploaded images, PDF content, or token strings. It serves the app; the browser handles the input.',
          },
          { type: 'heading', level: 2, text: 'Thin Pages, Pure Utility Functions' },
          {
            type: 'paragraph',
            text: 'To keep local processing maintainable, the tool pages stay thin. They handle state, controls, previews, and errors. Parsing, conversion, validation, compression, and export logic lives under lib/utils as pure functions or browser helpers.',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `type Outcome =
  | { ok: true; output: string; parsed?: unknown }
  | { ok: false; message: string };`,
          },
          {
            type: 'paragraph',
            text: 'This keeps React components from becoming piles of one-off parsing code. It also makes failures explicit: a utility returns an ok or error branch instead of throwing raw exceptions into the page.',
          },
          { type: 'heading', level: 2, text: 'A Registry Drives Every Discovery Surface' },
          {
            type: 'paragraph',
            text: 'Tool metadata lives in one registry. Home-page cards, categories, breadcrumbs, related tools, localized paths, sitemap entries, JSON-LD, and llms files derive from that source. A capability is not considered shipped until its registry entry, translations, page, metadata, and discovery surfaces agree.',
          },
          {
            type: 'paragraph',
            text: 'Blog topical authority follows the same rule. Pillars, cluster articles, target keywords, and tool-path mappings live in one topology file. Components consume the relationship instead of maintaining separate hand-written link lists that drift over time.',
          },
          { type: 'heading', level: 2, text: 'How Different Data Types Stay Local' },
          {
            type: 'table',
            headers: ['Data type', 'Browser-local implementation', 'Privacy value'],
            rows: [
              ['JSON / YAML / XML / CSV', 'Local parsers and pure utility functions handle formatting, conversion, repair, and validation.', 'API samples, config snippets, and logs do not need to be uploaded.'],
              ['JWT / Encoding', 'Base64URL, URL, Unicode, Gzip, hashing, and HS256 verification use browser code and Web Crypto.', 'Tokens can be inspected locally while debugging.'],
              ['Images', 'File, Blob, ImageBitmap, Canvas, OffscreenCanvas, Workers, WASM, and local models handle compression, conversion, editing, and export.', 'Screenshots, ID photos, product images, and internal assets stay on the device.'],
              ['PDF / Office / Documents', 'pdf-lib, pdfjs-dist, fflate, SheetJS, and browser rendering handle many read, generate, split, merge, and export flows.', 'Contracts, forms, and internal documents reduce upload exposure.'],
              ['Text and subtitles', 'Diffing, word counting, LRC/SRT parsing, and local media previews run in the frontend.', 'Temporary copy, logs, and subtitle files avoid server processing.'],
            ],
          },
          { type: 'heading', level: 2, text: 'Local AI Where It Makes Sense' },
          {
            type: 'paragraph',
            text: 'Background removal, ID photo cleanup, and watermark repair sound like features that require a cloud AI service. For ToolGarden, I prefer open-source models and local algorithms that can run in the browser. On first use, the browser may download model assets. After that, the user image is decoded, normalized, inferred, composited, and exported locally.',
          },
          {
            type: 'paragraph',
            text: 'This is not a claim that local models always beat commercial cloud services. Edge quality, hard backgrounds, memory pressure, and batch stability all have limits. But for everyday ID photos, product shots, screenshots, and simple background edits, local inference is often good enough, and the image does not need to be uploaded.',
          },
          { type: 'heading', level: 2, text: 'Privacy Messaging Must Match the Implementation' },
          {
            type: 'paragraph',
            text: 'SEO, sitemap entries, JSON-LD, llms.txt, Open Graph, and blog copy can easily become a separate marketing layer. I wanted the opposite: discovery metadata should describe how the site actually works. Tool descriptions come from the registry and message files, and the SEO layer adds the local-processing and no-upload positioning consistently.',
          },
          {
            type: 'paragraph',
            text: 'That is not just wording. It is a product contract. If a tool is not registered, discoverable, documented, and honest about its processing boundary, it should not be treated as a finished ToolGarden feature.',
          },
          { type: 'heading', level: 2, text: 'The Tradeoffs' },
          {
            type: 'list',
            items: [
              'Browser memory is limited, so huge PDFs, very large images, or hundreds of files can slow down or crash a tab.',
              'Complex Office layouts may not match desktop export engines perfectly and should be reviewed after conversion.',
              'Local AI models need model assets, so the first run can require a download and offline use depends on browser cache.',
              'Some legacy or encrypted formats are not suitable for direct browser parsing and must be clearly marked as unsupported.',
              'Local processing reduces upload exposure, but users still need a trusted browser, correct domain, HTTPS, and sensible handling of highly sensitive material.',
            ],
          },
          { type: 'heading', level: 2, text: 'The Principles I Kept' },
          {
            type: 'list',
            ordered: true,
            items: [
              'If the browser can do the job, do not send the input to a server.',
              'Keep pages focused on interaction and move tool logic into utilities and Workers.',
              'State file-format limits clearly instead of pretending everything works.',
              'Make SEO and blog copy reflect the real technical boundary.',
              'Treat privacy as an architecture decision, not a sentence added at the end.',
            ],
          },
          {
            type: 'callout',
            title: 'Try a browser-local tool',
            text: 'If you want to format JSON, compress images, process PDFs, or compare text, open one of the tools and run it directly in your browser.',
            href: '/json-format',
            linkLabel: 'Open JSON Formatter',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'I did not build ToolGarden this way because browser-local processing sounds fashionable. I built it this way because it makes online tools feel calmer to use. You can paste data, drag in a file, download the result, and close the page without wondering where the input went.',
          },
          {
            type: 'paragraph',
            text: 'The site will keep growing, but I want the direction to stay clear: push as much useful work as possible into the browser, keep the implementation understandable, state the limitations honestly, and make privacy part of the default experience.',
          },
        ],
        faq: [
          {
            question: 'Does ToolGarden really avoid uploading user input?',
            answer: 'Tool input text and uploaded files are not sent to a server for processing. Like any website, ToolGarden loads JavaScript, CSS, WASM, model assets, and page resources, and page-level analytics may exist. But formatting JSON, processing images, splitting PDFs, and comparing text are designed to run in the browser. If a future feature requires server-side processing, it should be clearly labeled instead of being mixed into the local tools silently.',
          },
          {
            question: 'Does local processing automatically make everything secure?',
            answer: 'No. Local processing mainly reduces the exposure created by uploading data to a third-party server. Users still need to check that they are on the correct domain, that the page is loaded over HTTPS, and that their browser and device are trusted. For highly regulated material, follow your organization security policy. The goal is to make everyday sensitive work safer by default, not to replace formal security review.',
          },
          {
            question: 'Why not build a backend for better compatibility?',
            answer: 'A backend can handle heavier formats, larger models, and complex layout engines. But the privacy model changes as soon as files are uploaded: storage, logs, queues, cleanup, access control, and compliance all become part of the system. ToolGarden prioritizes lightweight everyday tools and privacy-friendly workflows, so browser-local processing comes first. Server-side support should only appear as a clearly marked separate capability when the browser cannot do the job well.',
          },
          {
            question: 'Which tasks are best suited for browser-local tools?',
            answer: 'Browser-local tools work well for JSON formatting, config cleanup, JWT inspection, image compression and conversion, simple PDF merge or split workflows, text diff, subtitle editing, and Base64 encoding. They are less suitable for multi-gigabyte files, thousands of images, perfect Office layout fidelity, legal archival workflows, or multi-user approval processes. For those cases, desktop software, command-line tools, or controlled backend systems are usually more stable.',
          },
        ],
      },
    },
  },
  {
    slug: 'make-id-photo-online-size-background-guide',
    publishedAt: '2026-07-06',
    updatedAt: '2026-07-06',
    translations: {
      zh: {
        title: '证件照尺寸和底色怎么选？一寸、二寸、中国护照、美国护照在线制作指南',
        excerpt: '制作电子版证件照前，先确认用途、尺寸、底色、头部比例和是否允许数字处理。不同证件的要求并不完全相同。',
        metaTitle: '证件照尺寸和底色怎么选？一寸二寸中国护照美国护照指南',
        metaDescription: '整理一寸、二寸、中国护照/旅行证、美国护照 2x2 inch 等证件照尺寸和底色要求，说明如何在线制作电子版证件照、换底色、裁剪构图和避免审核风险。',
        readingTime: '约 8 分钟阅读',
        tags: ['证件照制作', '一寸照', '二寸照', '护照照片', '换底色'],
        relatedTools: [
          {
            label: '证件照制作',
            href: '/image/id-photo',
            description: '上传生活照或证件照，自动去背景、按尺寸构图、切换底色并下载 JPG/PNG。',
          },
          {
            label: '图片去背景',
            href: '/image/remove-bg',
            description: '需要单独得到透明背景人像时，可以先用本地模型去除背景。',
          },
          {
            label: '图片压缩',
            href: '/image/compress',
            description: '报名系统限制文件大小时，可在下载后压缩到目标体积。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '证件照看起来只是“正脸照片加纯色背景”，但真正容易出错的地方通常是尺寸、底色、头部比例、是否拉伸变形，以及办理机构是否允许数字处理。',
          },
          {
            type: 'paragraph',
            text: '如果只是简历、工牌、考试报名、社保卡上传或内部系统头像，在线制作电子版证件照通常很方便：上传一张清晰正脸照，去掉背景，选择一寸、二寸或自定义尺寸，再换成白底、蓝底或红底即可。但如果是护照、签证等正式证件，一定要先看办理机构的最新要求。',
          },
          {
            type: 'quote',
            text: '结论先说：先按用途选尺寸，再按办理机构选底色；不要拉伸照片，不要过度美化，也不要把不允许数字处理的官方照片做成合成图。',
          },
          { type: 'heading', level: 2, text: '常见证件照尺寸怎么选？' },
          {
            type: 'paragraph',
            text: '下面是日常最常见的几类尺寸。不同国家、地区、考试或平台可能有自己的像素、文件大小和背景要求，表格适合做初步选择，不应替代官方说明。',
          },
          {
            type: 'table',
            headers: ['用途', '常见尺寸', '常见底色', '使用建议'],
            rows: [
              ['中国一寸照', '25 x 35 mm', '白底、蓝底、红底都常见', '适合简历、报名、证书、内部系统等非统一官方场景，提交前看平台说明。'],
              ['中国二寸照', '35 x 49 mm', '白底、蓝底、红底都常见', '适合部分证书、档案、报名材料。和中国护照 33 x 48 mm 不是同一尺寸。'],
              ['中国护照/旅行证', '33 x 48 mm', '白色背景', '中国驻美使馆页面列出白底、头部宽高和边距要求，正式办理应以最新官方说明为准。'],
              ['美国护照', '2 x 2 inch / 51 x 51 mm', '白色或近白色背景', '美国国务院要求头肩居中、头部约 25-35 mm，并提交未经过滤镜或数字改动的原始照片。'],
              ['自定义尺寸', '按平台填写 mm', '按平台要求', '适合考试报名、企业系统、学校系统等只给出宽高和文件大小的场景。'],
            ],
          },
          { type: 'heading', level: 2, text: '本文使用的官方标准来源' },
          {
            type: 'paragraph',
            text: '正式证件照要求会随机构和办理类型变化。本文只摘取两个公开官方页面中的核心尺寸和质量要求，作为制作时的检查参考。',
          },
          {
            type: 'table',
            headers: ['来源', '本文引用的重点', '网址'],
            rows: [
              ['美国国务院护照照片要求', '2 x 2 inch / 51 x 51 mm；头部从下巴到头顶约 25-35 mm；白色或近白背景；提交原始未编辑照片。', 'https://travel.state.gov/en/passports/apply/help/photos.html'],
              ['中国驻美使馆护照人像照片规格', '宽 33mm、高 48mm；白色背景；头部宽 15-22mm、高 28-33mm；头顶距上边 3-5mm。', 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm'],
            ],
          },
          {
            type: 'callout',
            title: '美国国务院护照照片要求',
            text: '美国国务院 Passport Photos 页面说明了美国护照照片的尺寸、背景、头部位置、清晰度、表情和数字处理限制。准备美国护照照片时，请以该页面最新内容为准。',
            href: 'https://travel.state.gov/en/passports/apply/help/photos.html',
            linkLabel: '查看 travel.state.gov 原文',
          },
          {
            type: 'callout',
            title: '中国驻美使馆护照人像照片规格',
            text: '中国驻美使馆页面列出护照/旅行证照片的总体要求、面部要求、背景要求、尺寸和头部位置范围。准备中国护照或旅行证照片时，请以所属使领馆和当前业务要求为准。',
            href: 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm',
            linkLabel: '查看中国驻美使馆原文',
          },
          { type: 'heading', level: 2, text: '底色怎么选：白底、蓝底、红底有什么区别？' },
          {
            type: 'paragraph',
            text: '底色没有一个全球通用规则。白底最常见于护照、签证和国际证件；蓝底和红底在中国的简历、考试、证书、单位系统里也很常见。真正决定底色的不是照片工具，而是接收照片的机构。',
          },
          {
            type: 'list',
            items: [
              '白底：护照、签证、国际证件和很多线上审核系统更常见，背景应干净、无阴影、无图案。',
              '蓝底：常见于国内部分证件、考试报名、企业资料和简历场景，但不是所有平台都接受。',
              '红底：常见于一些证书、档案或单位材料，正式提交前仍要确认要求。',
              '自定义底色：适合企业内部系统、学校系统或平台明确给出颜色值的场景。',
            ],
          },
          { type: 'heading', level: 2, text: '生活照能不能做成证件照？' },
          {
            type: 'paragraph',
            text: '技术上可以，但不是每张生活照都适合。合格的源照片最好是正面、清晰、无夸张表情、无遮挡、光线均匀，并且脸和头发边缘足够清楚。照片如果本身模糊、低光、强滤镜、侧脸、头发遮眼，后期工具很难把它变成可靠的证件照。',
          },
          {
            type: 'table',
            headers: ['源照片情况', '适合程度', '建议'],
            rows: [
              ['正脸、清晰、自然表情、浅色墙面背景', '适合', '可以上传后自动去背景和构图，再按用途调整底色。'],
              ['背景复杂但人物边缘清楚', '中等', 'AI 去背景通常可用，下载前重点检查头发、肩膀和耳朵边缘。'],
              ['自拍大头、广角畸变明显', '不建议', '脸部比例容易变形，最好让他人用后置摄像头重新拍。'],
              ['滤镜、美颜、修脸、夸张表情', '不适合正式证件', '很多官方场景要求原始自然照片，不要改变自然面貌。'],
              ['模糊、强阴影、低分辨率', '不适合', '重新拍比后期修补更可靠。'],
            ],
          },
          { type: 'heading', level: 2, text: '如何用在线工具制作电子版证件照？' },
          {
            type: 'list',
            ordered: true,
            items: [
              '打开证件照制作工具，上传一张清晰正脸照片。',
              '等待浏览器本地 AI 去背景，并自动识别人脸区域进行初步构图。',
              '选择尺寸：一寸、二寸、中国护照/签证、美国 2 x 2 inch，或输入自定义 mm 宽高。',
              '选择底色：白色、蓝色、红色、灰色或自定义颜色。',
              '用画布拖动人物位置，用缩放控制或双指缩放微调大小，保持人物等比缩放，不要拉伸。',
              '检查头顶、下巴、肩膀、耳朵、背景边缘和整体清晰度。',
              '按平台要求下载 JPG 或 PNG；如果报名系统限制体积，再用图片压缩工具压到目标大小。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 证件照制作',
            text: '工具内置中国一寸、二寸、中国签证、美国 2 x 2 inch 等尺寸，支持自定义毫米画布、自动去背景、人脸构图、拖动缩放、底色切换和 JPG/PNG 下载。图片在浏览器本地处理。',
            href: '/image/id-photo',
            linkLabel: '打开证件照制作',
          },
          { type: 'heading', level: 2, text: '哪些情况不要依赖在线换底色？' },
          {
            type: 'paragraph',
            text: '美国国务院页面明确提醒提交原始未编辑照片，不要使用滤镜或数字改动；中国驻美使馆页面也写明不得修改照片、不得使用合成照片。因此，如果办理机构明确不接受数字处理，正确做法是重新拍一张符合背景和光线要求的照片，而不是用 AI 换底色硬改。',
          },
          {
            type: 'list',
            items: [
              '正式护照、旅行证、签证申请：优先重新拍摄符合要求的原始照片。',
              '考试报名、企业系统、简历头像：通常更适合用在线工具制作电子版。',
              '平台明确要求不得修图或不得合成：不要用 AI 换背景替代重新拍摄。',
              '平台只要求尺寸、底色和文件大小：可以用工具生成后再人工检查。',
            ],
          },
          { type: 'heading', level: 2, text: '最常见的证件照错误' },
          {
            type: 'list',
            items: [
              '把照片横向或纵向拉伸，导致脸变窄或变宽。',
              '头部太大，头发或下巴被裁掉；或者头部太小，人物离镜头太远。',
              '背景不是纯色，有墙角、阴影、纹理或其他物体。',
              '人脸有强阴影、反光、红眼、过度曝光或明显偏色。',
              '用美颜、滤镜、修脸、换装改变自然面貌。',
              '尺寸选成二寸，但平台实际要求 33 x 48 mm 或 2 x 2 inch。',
            ],
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '证件照制作的关键不是把照片“修得好看”，而是让尺寸、底色、头部位置、清晰度和用途匹配。对简历、报名和企业系统，在线工具可以大幅节省时间；对护照、签证等正式证件，请先看官方要求，必要时重新拍摄，不要用不被接受的数字处理冒险。',
          },
        ],
        faq: [
          {
            question: '一寸照和二寸照可以直接互相裁剪吗？',
            answer: '不建议简单互裁。一寸照常见尺寸是 25 x 35 mm，二寸照常见尺寸是 35 x 49 mm，比例接近但并不意味着同一张图随便裁一下就合格。不同用途还会限制头部大小、背景色、文件体积和像素尺寸。更稳的做法是回到原始照片，选择目标尺寸重新构图导出，避免二次裁剪导致头顶、下巴或肩膀位置不合适。',
          },
          {
            question: '证件照一定要白底吗？',
            answer: '不一定。护照、签证和很多国际证件常见白底或近白底，但国内一些考试、证书、简历或单位材料可能要求蓝底或红底。不要按习惯猜，应该看报名系统或办理机构的说明。如果页面只写“证件照”但没有写底色，优先查看示例图或咨询客服，避免提交后因为背景色被退回。',
          },
          {
            question: '用 AI 去背景做证件照会不会影响正式审核？',
            answer: '要看用途。简历、企业系统、考试报名等电子版场景通常只关心尺寸、底色和清晰度，AI 去背景很实用。但美国国务院护照照片要求强调提交原始未编辑照片，中国驻美使馆也要求不得修改或使用合成照片。遇到这类正式证件，最好重新拍摄符合背景要求的原始照片，而不是依赖 AI 换底色。',
          },
          {
            question: '为什么不能拉伸照片来适配尺寸？',
            answer: '拉伸会改变脸部和头部比例，是证件照里非常明显的错误。美国国务院照片说明也提醒不要拉伸或压缩图像来改变大小。正确方式是等比缩放人物，再移动位置，让头部和肩膀落在合适区域；画布尺寸不够时应该裁剪边缘，而不是把人物宽高分别拉大或压小。',
          },
          {
            question: '电子版证件照应该下载 JPG 还是 PNG？',
            answer: '大多数报名系统接受 JPG，因为体积小、兼容性好。PNG 更适合需要保留锐利边缘或透明背景的中间文件，但正式证件照通常最终是纯色背景，不一定需要 PNG。如果系统限制文件大小，例如 200KB、500KB 或 1MB，可以先导出 JPG，再用图片压缩工具控制体积，同时确认照片仍然清晰。',
          },
        ],
      },
      en: {
        title: 'How to Choose ID Photo Size and Background: 1-Inch, 2-Inch, China Passport, and U.S. Passport Guide',
        excerpt: 'Before making a digital ID photo, confirm the use case, size, background color, head position, and whether digital edits are allowed.',
        metaTitle: 'ID Photo Size and Background Guide: China and U.S. Passport Photos',
        metaDescription: 'Learn common ID photo sizes, background colors, China passport photo dimensions, U.S. passport 2x2 inch requirements, and how to make a digital ID photo online without stretching the image.',
        readingTime: '8 min read',
        tags: ['ID photo', 'passport photo', 'background color', 'photo size', 'online photo maker'],
        relatedTools: [
          {
            label: 'ID Photo Maker',
            href: '/image/id-photo',
            description: 'Upload a portrait, remove the background, choose an ID photo size, adjust framing, and download JPG or PNG.',
          },
          {
            label: 'Remove Image Background',
            href: '/image/remove-bg',
            description: 'Remove a portrait background locally when you need a transparent cutout first.',
          },
          {
            label: 'Image Compressor',
            href: '/image/compress',
            description: 'Compress the exported photo when an upload form has a strict file-size limit.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'An ID photo is not just a face on a solid background. The details that cause rejection are usually size, background color, head position, stretching, image quality, and whether the target authority allows digital edits.',
          },
          {
            type: 'paragraph',
            text: 'For resumes, badges, exam registration, internal systems, or profile uploads, an online ID photo maker can save a lot of time. For passports, visas, and other official documents, always check the current requirements from the accepting authority before editing or submitting a photo.',
          },
          {
            type: 'quote',
            text: 'Choose the size by use case, choose the background by the receiving authority, keep the person proportional, and avoid edits that change natural appearance.',
          },
          { type: 'heading', level: 2, text: 'Common ID Photo Sizes' },
          {
            type: 'paragraph',
            text: 'The table below is a practical starting point. Exact requirements may vary by country, agency, exam board, or upload form, so use it as a guide rather than a substitute for official instructions.',
          },
          {
            type: 'table',
            headers: ['Use case', 'Common size', 'Common background', 'Notes'],
            rows: [
              ['China 1-inch photo', '25 x 35 mm', 'White, blue, or red are common', 'Often used for resumes, registrations, certificates, and internal systems. Check the receiving platform.'],
              ['China 2-inch photo', '35 x 49 mm', 'White, blue, or red are common', 'Used by some certificates and records. It is not the same as the 33 x 48 mm China passport photo size.'],
              ['China passport / travel document', '33 x 48 mm', 'White background', 'The Chinese Embassy page lists white background, head size, and margin requirements. Use the latest official instructions.'],
              ['U.S. passport', '2 x 2 inch / 51 x 51 mm', 'White or off-white background', 'The U.S. Department of State requires centered head and shoulders, about 25-35 mm head size, and an original unedited photo.'],
              ['Custom upload forms', 'Enter the required mm size', 'Follow the form requirement', 'Useful for exam, school, company, or local platform uploads with custom dimensions.'],
            ],
          },
          { type: 'heading', level: 2, text: 'Official Sources Used in This Guide' },
          {
            type: 'paragraph',
            text: 'Official photo requirements can change and can differ by application type. This article summarizes the practical points from two public official pages and links to the originals.',
          },
          {
            type: 'table',
            headers: ['Source', 'Key points used here', 'URL'],
            rows: [
              ['U.S. Department of State passport photo requirements', '2 x 2 inch / 51 x 51 mm; head about 25-35 mm from chin to top; white or off-white background; original unedited photo.', 'https://travel.state.gov/en/passports/apply/help/photos.html'],
              ['Chinese Embassy in the United States passport photo specifications', '33 x 48 mm; white background; head width 15-22 mm; head height 28-33 mm; top margin 3-5 mm.', 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm'],
            ],
          },
          {
            type: 'callout',
            title: 'U.S. Department of State Passport Photos',
            text: 'The official Passport Photos page explains U.S. passport photo size, background, head position, image quality, expression, and restrictions on digital changes.',
            href: 'https://travel.state.gov/en/passports/apply/help/photos.html',
            linkLabel: 'Open travel.state.gov',
          },
          {
            type: 'callout',
            title: 'Chinese Embassy Passport Photo Specifications',
            text: 'The Chinese Embassy page lists passport and travel document photo requirements, including white background, face visibility, 33 x 48 mm size, head size, and margins.',
            href: 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm',
            linkLabel: 'Open china-embassy.gov.cn',
          },
          { type: 'heading', level: 2, text: 'How to Choose Background Color' },
          {
            type: 'paragraph',
            text: 'There is no universal background color for every ID photo. White is common for passports, visas, and international documents. Blue and red backgrounds are common in some Chinese resumes, certificates, exam registrations, and organization systems. The receiving authority decides the correct color.',
          },
          {
            type: 'list',
            items: [
              'White or off-white: common for passports, visas, and official international documents. Keep it plain, shadow-free, and texture-free.',
              'Blue: common for some domestic Chinese registration, resume, and company scenarios, but not always accepted.',
              'Red: used by some certificates or organizational records. Confirm the requirement before submitting.',
              'Custom color: useful when a company, school, or platform provides a specific color value.',
            ],
          },
          { type: 'heading', level: 2, text: 'Can You Turn a Casual Portrait into an ID Photo?' },
          {
            type: 'paragraph',
            text: 'Technically yes, but not every casual photo is suitable. The best source photo is front-facing, sharp, evenly lit, natural in expression, unobstructed, and detailed around hair and shoulders. If the source is blurry, filtered, side-facing, low-light, or heavily distorted, the result will not be reliable.',
          },
          {
            type: 'table',
            headers: ['Source photo', 'Fit', 'Suggestion'],
            rows: [
              ['Front-facing, sharp, natural expression, simple background', 'Good', 'Use automatic background removal and framing, then adjust the background color.'],
              ['Complex background but clear subject edges', 'Medium', 'Check hair, shoulders, and ears carefully after background removal.'],
              ['Close selfie with wide-angle distortion', 'Poor', 'Retake with the rear camera and another person holding the phone.'],
              ['Filters, beauty edits, face reshaping, exaggerated expression', 'Poor for official documents', 'Official uses often require natural, unedited appearance.'],
              ['Blurry, shadowed, low-resolution photo', 'Poor', 'Retaking is more reliable than trying to repair it later.'],
            ],
          },
          { type: 'heading', level: 2, text: 'How to Make a Digital ID Photo Online' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open the ID Photo Maker and upload a clear front-facing portrait.',
              'Let the browser remove the background locally and frame the face automatically.',
              'Choose a size such as 1-inch, 2-inch, China passport/visa, U.S. 2 x 2 inch, or a custom mm size.',
              'Choose the required background color: white, blue, red, gray, or custom.',
              'Drag the subject and zoom proportionally. Do not stretch the person horizontally or vertically.',
              'Check top margin, chin, shoulders, ears, background edges, and overall sharpness.',
              'Download JPG or PNG. If the upload form limits file size, compress the exported image afterward.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden ID Photo Maker',
            text: 'The tool includes China 1-inch, China 2-inch, China visa, U.S. 2 x 2 inch, custom mm sizes, background removal, face-based framing, background color switching, proportional zoom, and JPG/PNG export. Processing runs locally in the browser.',
            href: '/image/id-photo',
            linkLabel: 'Open ID Photo Maker',
          },
          { type: 'heading', level: 2, text: 'When Not to Rely on Online Background Editing' },
          {
            type: 'paragraph',
            text: 'The U.S. Department of State asks for an original, unedited photo without filters or digital changes. The Chinese Embassy page also says the photo should not be modified or synthetic. If an authority explicitly forbids digital edits, retake the photo against the correct background instead of using AI background replacement.',
          },
          {
            type: 'list',
            items: [
              'Passports, travel documents, and visa applications: retake a compliant original photo whenever the authority requires it.',
              'Resumes, badges, exam forms, and internal systems: online ID photo tools are usually a good fit.',
              'Forms that forbid edits or synthetic photos: do not use AI background replacement as a shortcut.',
              'Forms that only specify size, background, and file size: generate the photo, then inspect it manually before upload.',
            ],
          },
          { type: 'heading', level: 2, text: 'Common ID Photo Mistakes' },
          {
            type: 'list',
            items: [
              'Stretching the person to fit the canvas, making the face too narrow or too wide.',
              'Head too large or too small, with hair, chin, or shoulders incorrectly cropped.',
              'Background has shadows, wall texture, corners, or other objects.',
              'Strong face shadows, glare, red eye, overexposure, or color cast.',
              'Filters, beauty edits, face reshaping, or clothing changes that alter natural appearance.',
              'Using a 2-inch preset when the form actually requires 33 x 48 mm or 2 x 2 inch.',
            ],
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'A good ID photo is not about making the portrait prettier. It is about matching the required size, background, head position, clarity, and submission rules. Online tools are helpful for resumes, registration forms, and internal systems. For passports and visas, always check official requirements first and retake the photo if digital edits are not allowed.',
          },
        ],
        faq: [
          {
            question: 'Can I crop a 1-inch photo into a 2-inch photo?',
            answer: 'It is better to go back to the original portrait and frame it again. A common China 1-inch photo is 25 x 35 mm, while a common 2-inch photo is 35 x 49 mm. Even when the aspect ratio looks close, the target form may also care about head size, background color, pixel dimensions, and file size. Re-exporting from the original avoids cutting off hair, chin, or shoulders.',
          },
          {
            question: 'Does every ID photo need a white background?',
            answer: 'No. Passports, visas, and many international documents commonly require white or off-white backgrounds, but some domestic Chinese forms, resumes, certificates, and company systems may ask for blue or red. Always follow the receiving authority or upload form. If the form does not specify a color, check its example image or support instructions before submitting.',
          },
          {
            question: 'Will AI background removal affect official review?',
            answer: 'It depends on the use case. For resumes, company systems, badges, or some exam uploads, background removal can be practical. For official passports and travel documents, be careful: the U.S. Department of State asks for an original unedited photo, and the Chinese Embassy page says not to use modified or synthetic photos. If the authority forbids digital edits, retake the photo instead.',
          },
          {
            question: 'Why should I never stretch an ID photo?',
            answer: 'Stretching changes the natural proportions of the face and head, which is easy to notice. The U.S. passport photo guidance also warns against stretching or compressing the image to resize it. The correct workflow is proportional zoom plus repositioning, then cropping the canvas if needed. Do not scale width and height separately.',
          },
          {
            question: 'Should I download JPG or PNG for a digital ID photo?',
            answer: 'Most upload forms accept JPG because it is small and compatible. PNG can be useful as an intermediate format or when you need sharper edges, but official ID photos usually end with a solid background, so PNG is not always necessary. If the form has a file-size limit such as 200KB, 500KB, or 1MB, export JPG first and then compress it while checking that the photo remains sharp.',
          },
        ],
      },
    },
  },
  {
    slug: 'remove-image-watermark-local-ai-inpainting',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '如何在线去除图片水印？浏览器本地 AI 补全原理',
        excerpt: '去除图片水印通常不是简单擦除，而是先选中水印区域，再根据周围纹理补全背景。浏览器本地处理可以减少上传隐私风险。',
        metaTitle: '如何在线去除图片水印？浏览器本地 AI 补全原理',
        metaDescription: '介绍在线去除图片水印的基本流程、本地 AI 补全原理、适合处理的水印类型、局限性和导出格式选择。',
        readingTime: '约 7 分钟阅读',
        tags: ['去水印', 'AI 补全', '图片修复', '本地处理'],
        relatedTools: [
          {
            label: '图片去水印',
            href: '/image/remove-watermark',
            description: '选择水印区域，用浏览器本地 AI 模型或快速修复算法补全背景。',
          },
          {
            label: '图片编辑',
            href: '/image/edit',
            description: '需要手动标注、模糊或马赛克时，可以继续使用图片编辑工具。',
          },
          {
            label: "图片 EXIF 查看 / 清除",
            href: "/image/exif",
            description: "去水印后顺手清掉 EXIF，让分享的图片不再暴露拍摄信息。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '在线去除图片水印的关键步骤是选中水印区域，再让算法根据周围内容推断这块区域原本可能是什么样。',
          },
          {
            type: 'paragraph',
            text: '水印去除适合处理你拥有版权或有修改权限的图片，例如自己导出的草稿图、测试截图、内部素材或误加水印的图片。不要用它处理没有授权的图片。',
          },
          { type: 'heading', level: 2, text: '本地 AI 补全大致怎么工作？' },
          { type: 'code', language: 'text', code: watermarkAiStepsZh },
          {
            type: 'paragraph',
            text: '这类处理通常叫 inpainting，也就是图像补全。模型不是恢复真实原图，而是根据周围颜色、纹理、边缘方向和语义信息生成一个看起来合理的替代区域。',
          },
          { type: 'heading', level: 2, text: '哪些水印更容易处理？' },
          {
            type: 'table',
            headers: ['水印场景', '效果预期', '原因'],
            rows: [
              ['纯色背景上的文字水印', '较好', '周围纹理简单，容易补全'],
              ['渐变或轻微纹理背景', '中等到较好', '边缘融合比较关键'],
              ['复杂人脸、手部、文字下方水印', '不稳定', '模型难以知道真实细节'],
              ['大面积半透明水印', '较难', '遮挡范围大，补全信息不足'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片去水印',
            text: '上传图片后拖拽选择水印区域，可以使用本地 AI 补全或快速像素修复导出结果。图片处理在浏览器中完成。',
            href: '/image/remove-watermark',
            linkLabel: '打开图片去水印',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '去水印工具适合修复小范围遮挡和简单背景。对于关键照片、复杂纹理或大面积遮挡，最好保留原图备份，并接受需要二次微调的可能。',
          },
        ],
        faq: [
          {
            question: "去水印工具能完美还原图片原本的内容吗？",
            answer: "不能。AI 补全（inpainting）不是从存档中找回原始像素，而是根据水印周围的颜色、纹理和边缘走向，生成一段看起来合理的替代内容。如果水印底下是一张陌生的人脸、一段特殊文字或独特的图案，模型没有依据去猜真实细节，只能编造一个视觉上过得去的版本。因此对新闻图、证据类照片或需要精确还原的商业素材，不要指望它能得到与原图一致的结果，只能作为演示或版式补救使用。",
          },
          {
            question: "为什么建议用浏览器本地处理而不是上传到服务器？",
            answer: "水印图片经常带有内部标识、订单号、样张标记或未发布素材，如果上传到远程服务器，图片会经过网络传输并临时存放在第三方硬盘上，风险不可控。浏览器本地处理是把模型和运算都放在你自己的设备里，图片不会离开电脑或手机。这样即使工具服务停用、公司要求内网审计、或你在处理敏感截图，也不用担心图片被日志记录、被缓存或被误用。速度上，除了首次加载模型需要几秒，之后几乎和本地软件一样快。",
          },
          {
            question: "去水印和马赛克、模糊有什么区别？",
            answer: "马赛克和模糊是主动遮挡：告诉观众“这里有内容，但我不给你看”，常用于保护隐私信息，比如车牌、身份证号或聊天头像。去水印则是相反目的——让水印看起来消失，让人以为原图就是干净的。两者的算法也不同：马赛克只需要对像素做平均或高斯运算；去水印则要理解周围内容并重建背景。如果目标只是遮住敏感区域，模糊或马赛克更快也更稳定，不需要 AI 模型。",
          },
          {
            question: "如果水印覆盖在人脸、手部或复杂文字上，效果为什么很差？",
            answer: "AI 补全的核心是从周围可见区域推理缺失部分。人脸、手指、印刷文字、条码这类内容的细节没有明确规律，也很难从旁边像素猜出来。模型可能生成一个歪掉的嘴巴、缺一根手指的手，或糊成一片的文字。这种情况下最好的做法是接受“无法还原真相”，把去水印结果当作草稿，然后再用图片编辑工具手动修补，或者干脆换一张没有水印的原始图片。",
          },
          {
            question: "去水印后图片可以商用吗？",
            answer: "去除水印本身不改变图片的版权归属。水印通常是版权声明或授权标记，把它抹掉不代表你就获得了使用权。用去水印工具处理没有授权的素材，然后商用或再发布，在多数国家和地区都可能构成侵权，尤其是新闻图、图库照片、艺术作品和品牌 Logo。合法用法包括：处理你自己拍摄或制作的图片、清理误加水印的内部素材、修复自己的草稿或测试截图。正式发布前，最好确认图片来源和授权链条。",
          },
        ],
      },
      en: {
        title: 'How Does Online Image Watermark Removal Work with Local AI Inpainting?',
        excerpt: 'Removing a watermark is usually image inpainting: select the watermark area, then reconstruct the background from surrounding pixels locally in the browser.',
        metaTitle: 'How Online Image Watermark Removal Works with Local AI',
        metaDescription: 'Learn the workflow behind browser-local image watermark removal, AI inpainting, suitable watermark areas, limitations, and export format choices.',
        readingTime: '7 min read',
        tags: ['watermark removal', 'AI inpainting', 'image repair', 'local processing'],
        relatedTools: [
          {
            label: 'Image Watermark Remover',
            href: '/image/remove-watermark',
            description: 'Select a watermark area and repair it with a browser-local AI model or fast pixel repair.',
          },
          {
            label: 'Image Editor',
            href: '/image/edit',
            description: 'Use manual annotation, blur, mosaic, and editing tools after repair if needed.',
          },
          {
            label: "Image EXIF Viewer & Cleaner",
            href: "/image/exif",
            description: "After watermark removal, also strip EXIF so shared images do not leak camera or GPS data.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Online watermark removal works by selecting a watermark area and reconstructing plausible background pixels from the surrounding image.',
          },
          {
            type: 'paragraph',
            text: 'Use watermark removal only for images you own or have permission to modify, such as your own drafts, screenshots, internal assets, or files that were watermarked by mistake.',
          },
          { type: 'heading', level: 2, text: 'How Local AI Inpainting Works' },
          { type: 'code', language: 'text', code: watermarkAiStepsEn },
          {
            type: 'paragraph',
            text: 'Inpainting does not recover the true original pixels. It predicts a visually plausible replacement based on nearby colors, texture, edge direction, and image context.',
          },
          { type: 'heading', level: 2, text: 'Which Watermarks Work Best?' },
          {
            type: 'table',
            headers: ['Watermark case', 'Expected result', 'Reason'],
            rows: [
              ['Text on a flat background', 'Good', 'Simple surroundings are easier to reconstruct'],
              ['Gradient or light texture', 'Medium to good', 'Edge blending matters'],
              ['Watermark over faces, hands, or text', 'Unstable', 'The model cannot know the real hidden detail'],
              ['Large translucent watermark', 'Hard', 'Too much image context is missing'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Image Watermark Remover',
            text: 'Upload an image, drag over the watermark area, and export a repaired result with browser-local AI inpainting or fast pixel repair.',
            href: '/image/remove-watermark',
            linkLabel: 'Open Image Watermark Remover',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Watermark removal is best for small obstructions and simple backgrounds. For complex photos or large covered areas, keep the original and expect possible manual cleanup.',
          },
        ],
        faq: [
          {
            question: "Can watermark removal tools truly restore the original image?",
            answer: "No. AI inpainting does not retrieve the original pixels from an archive. It generates a plausible replacement based on the colors, textures, and edge direction around the watermark. If a face, unique text, or a distinctive pattern was hidden underneath, the model has no way to know the truth and will invent something that only looks acceptable. For news photos, evidence images, or commercial assets that require exact restoration, do not rely on the output as a faithful copy of the original.",
          },
          {
            question: "Why is browser-local processing better than uploading to a server?",
            answer: "Watermarked images often contain internal labels, order numbers, sample marks, or unreleased artwork. Uploading them means the file crosses the network and lives briefly on a third-party disk, which you cannot audit. Browser-local processing keeps both the model and the computation on your own device, so the image never leaves your machine. Even if the service goes offline, your company enforces air-gapped review, or you are handling sensitive screenshots, you do not have to worry about caching, logging, or accidental misuse of the file.",
          },
          {
            question: "How is watermark removal different from mosaic or blur tools?",
            answer: "Mosaic and blur are intentional coverage — they tell viewers that something is hidden, and are used to protect license plates, ID numbers, or chat avatars. Watermark removal has the opposite goal: it tries to make the mark disappear so the image looks untouched. The algorithms differ too. Mosaic and blur just average pixels or apply a Gaussian kernel. Watermark removal must understand context and reconstruct background. If you only need to obscure sensitive content, blur or mosaic is faster and needs no AI model.",
          },
          {
            question: "Why does it fail so badly on faces, hands, or printed text?",
            answer: "Inpainting works by inferring the missing region from surrounding visible pixels. Faces, fingers, printed text, and barcodes have irregular fine detail that cannot be predicted from nearby areas. The model may generate a lopsided mouth, a hand with a missing finger, or blurry unreadable text. When a watermark sits on top of that kind of content, the best strategy is to accept that recovery is impossible and either treat the result as a rough draft that needs manual touch-up, or find a clean source image.",
          },
          {
            question: "Can I use an image commercially after removing its watermark?",
            answer: "Removing a watermark does not change who owns the image. A watermark is usually a copyright notice or licensing marker, and erasing it does not grant you rights. Using an unlicensed image commercially after removal is very likely infringement in most jurisdictions, especially for news photos, stock imagery, artwork, or brand logos. Legitimate use cases are limited to your own captures, internal assets that were watermarked by mistake, or drafts and screenshots you already own. Always verify the license before publishing.",
          },
        ],
      },
    },
  },
  {
    slug: 'add-watermark-to-image-text-tile-diagonal',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '如何给图片加水印：文字/图片、九宫格、平铺、对角线',
        excerpt: '图片水印可以是文字，也可以是 Logo 图片。位置、透明度、旋转、平铺方式会直接影响版权提示和图片可读性。',
        metaTitle: '如何给图片加水印？文字/图片、九宫格、平铺、对角线教程',
        metaDescription: '介绍图片加水印的常用方式，包括文字水印、图片水印、九宫格定位、平铺、对角线平铺、透明度、旋转和导出格式选择。',
        readingTime: '约 6 分钟阅读',
        tags: ['图片水印', '文字水印', 'Logo 水印', '图片工具'],
        relatedTools: [
          {
            label: '图片加水印',
            href: '/image/watermark',
            description: '添加文字或图片水印，支持九宫格、拖动、平铺、对角线和透明度设置。',
          },
          {
            label: '图片编辑',
            href: '/image/edit',
            description: '为图片继续添加文字、形状、标注、马赛克和模糊。',
          },
          {
            label: "PDF 加水印",
            href: "/pdf/watermark",
            description: "给 PDF 加同款文字水印，支持居中、平铺、对角线三种布局。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '给图片加水印，不只是把 Logo 放上去。更重要的是让水印可见但不干扰主体内容。',
          },
          { type: 'heading', level: 2, text: '文字水印和图片水印怎么选？' },
          {
            type: 'table',
            headers: ['类型', '适合场景', '注意事项'],
            rows: [
              ['文字水印', '作者名、网址、订单号、内部标记', '字号和透明度要适中'],
              ['图片水印', '品牌 Logo、活动标识、版权图章', '优先使用透明 PNG'],
              ['平铺水印', '防止截图二次传播', '透明度要低，避免遮挡内容'],
              ['对角线水印', '合同、样张、审核图', '旋转角度和间距要稳定'],
            ],
          },
          { type: 'heading', level: 2, text: '九宫格定位适合什么？' },
          {
            type: 'paragraph',
            text: '九宫格定位适合单个水印，比如左上、右下、居中。右下角常用于版权标识，居中适合样张或内部审核图，边角水印对主体遮挡更少。',
          },
          { type: 'heading', level: 2, text: '导出格式怎么选？' },
          {
            type: 'list',
            items: [
              '照片优先导出 JPG 或 WebP，文件体积更小。',
              '截图、透明图和 UI 素材优先导出 PNG。',
              '如果水印包含透明 Logo，建议保留 PNG 源文件再导出。',
              '公开发布前，先在手机和桌面上检查水印是否过浅或过重。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片加水印',
            text: '支持文字水印和图片水印，提供单个水印、九宫格定位、拖拽、平铺、对角线平铺、透明度和旋转控制。',
            href: '/image/watermark',
            linkLabel: '打开图片加水印',
          },
        ],
        faq: [
          {
            question: "水印透明度设多少合适？",
            answer: "没有唯一答案，需要结合场景。作品展示、摄影作品建议透明度 30% 到 50%，让水印可见但不抢镜；样张、内部审核图可以到 60% 甚至 80%，因为主要目的是提醒不能外传；如果是防截图、防转载的整页平铺水印，透明度反而要低到 10% 到 20%，避免遮挡正文内容。导出前一定要在手机屏幕和电脑屏幕上都预览一次，因为不同亮度和分辨率下，同样的透明度看起来会差别很大。",
          },
          {
            question: "对角线水印和平铺水印哪种防盗图效果更好？",
            answer: "平铺水印覆盖范围更大，即使别人截取图片的一小块，也会留下水印痕迹，更适合防止截图和二次传播；对角线水印线条清晰、方向统一，视觉冲击更强，常用于合同样张、审核图和明确标记“禁止外传”。如果你的目标是让人一眼看到警告，用对角线水印；如果你担心图片被裁剪或抠图后被再传播，用平铺水印。两种方式都要控制透明度，避免影响正文阅读。",
          },
          {
            question: "为什么给图片加水印后有的看起来很清晰，有的看起来很糊？",
            answer: "水印清晰度受三个因素影响：字体渲染质量、导出格式和最终图片尺寸。文字水印如果字号太小、系统字体不带抗锯齿，导出后就会有毛边；如果导出成 JPG 并压缩率很高，水印边缘会出现色块和噪点；如果原图分辨率低但拉伸得很大，水印也会被拉糊。建议：文字水印字号别太小，Logo 水印优先用透明 PNG 源文件，导出照片时用 WebP 或高质量 JPG，UI 截图用 PNG。",
          },
          {
            question: "文字水印和 Logo 水印可以同时用吗？",
            answer: "可以，很多场景就是双水印组合：右下角放品牌 Logo，居中或对角线加平铺文字（网址、账号或版权声明）。两者不冲突，反而互补——Logo 传达品牌，文字传达版权信息和联系方式。使用时要注意视觉层次：Logo 通常需要更高的透明度和更小的占比，文字水印则可以更淡但更多，避免两个水印同时抢注意力。导出前放到实际发布场景（社媒、公众号、图库）中预览。",
          },
          {
            question: "加了水印的原始文件要不要保留？",
            answer: "强烈建议保留没有水印的原始文件。原因有三：一是你可能之后要换不同的水印样式，比如换 Logo、换网址、换活动标语；二是不同平台对图片的尺寸、比例、格式要求不同，从带水印的图重新裁剪会显得多余；三是如果水印字体或位置出错，只能从原图重来。可以按 photo-original.jpg 和 photo-watermark-v1.jpg 分开命名，或者用文件夹分类，避免正式发布后再找不到干净版本。",
          },
        ],
      },
      en: {
        title: 'How to Add Text, Image, Tiled, and Diagonal Watermarks to Images',
        excerpt: 'Image watermarks can be text or logos. Position, opacity, rotation, and tiling decide whether the mark is useful without distracting from the image.',
        metaTitle: 'How to Add Text, Image, Tiled, and Diagonal Watermarks',
        metaDescription: 'Learn text watermarks, image watermarks, nine-grid positioning, tiling, diagonal patterns, opacity, rotation, and output format choices.',
        readingTime: '6 min read',
        tags: ['image watermark', 'text watermark', 'logo watermark', 'image tools'],
        relatedTools: [
          {
            label: 'Image Watermark',
            href: '/image/watermark',
            description: 'Add text or image watermarks with grid positions, dragging, tiling, diagonal layout, and opacity controls.',
          },
          {
            label: 'Image Editor',
            href: '/image/edit',
            description: 'Continue editing with text, shapes, annotations, mosaic, and blur tools.',
          },
          {
            label: "PDF Watermark",
            href: "/pdf/watermark",
            description: "Add the same style of text watermark to PDFs with center, tile, and diagonal layouts.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Adding a watermark is not just placing a logo on top. The mark should be visible without damaging the main image.',
          },
          { type: 'heading', level: 2, text: 'Text Watermark or Image Watermark?' },
          {
            type: 'table',
            headers: ['Type', 'Best for', 'Tip'],
            rows: [
              ['Text watermark', 'Author names, URLs, order IDs, internal labels', 'Tune size and opacity carefully'],
              ['Image watermark', 'Brand logos, campaign marks, copyright stamps', 'Use transparent PNG when possible'],
              ['Tiled watermark', 'Discouraging reposts and screenshots', 'Keep opacity low'],
              ['Diagonal watermark', 'Contracts, samples, review images', 'Keep rotation and spacing consistent'],
            ],
          },
          { type: 'heading', level: 2, text: 'When to Use Nine-Grid Positioning' },
          {
            type: 'paragraph',
            text: 'Nine-grid positioning is useful for a single watermark. Bottom-right works well for copyright marks, center works for samples, and corner marks usually cover less important content.',
          },
          { type: 'heading', level: 2, text: 'Which Output Format Should You Use?' },
          {
            type: 'list',
            items: [
              'Use JPG or WebP for photos when smaller files matter.',
              'Use PNG for screenshots, transparent images, and UI assets.',
              'Keep the transparent logo source if your watermark is an image.',
              'Preview on mobile and desktop before publishing.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Image Watermark',
            text: 'Create text or image watermarks with single placement, nine-grid snapping, dragging, tiling, diagonal tiling, opacity, and rotation controls.',
            href: '/image/watermark',
            linkLabel: 'Open Image Watermark',
          },
        ],
        faq: [
          {
            question: "What opacity works best for a watermark?",
            answer: "There is no single answer, and it depends on the goal. For portfolio or photography, 30 percent to 50 percent keeps the mark visible without dominating the image. For samples or internal review, 60 percent to 80 percent is fine because the goal is a strong reminder. For full-page tiled watermarks meant to discourage reposts, drop the opacity to 10 percent to 20 percent so it does not obscure the content. Always preview on both mobile and desktop before publishing, because brightness and resolution change how the same opacity actually looks.",
          },
          {
            question: "Is a diagonal watermark or a tiled watermark better at preventing theft?",
            answer: "A tiled watermark covers more area, so even if someone crops a small piece of the image, a mark is still visible — better for screenshot and repost protection. A diagonal watermark has clean, uniform strokes and stronger visual impact, which fits contract samples or review images that need an obvious warning. If your goal is a clear warning, use diagonal. If you worry about cropping and reposting, use tiled. Both need low opacity so they do not damage readability of the actual content.",
          },
          {
            question: "Why do some watermarked images look crisp while others look blurry?",
            answer: "Sharpness depends on three factors: font rendering quality, export format, and final resolution. Text watermarks with small font sizes or non-anti-aliased fonts show jagged edges. High-compression JPG output introduces blocks and noise around edges. If the source image is low-resolution but scaled up, the watermark blurs along with it. Use reasonable font sizes for text marks, prefer transparent PNG for logos, use WebP or high-quality JPG for photos, and PNG for UI screenshots.",
          },
          {
            question: "Can text and logo watermarks be used together?",
            answer: "Yes, and it is a common pattern: a brand logo in the bottom-right corner plus centered or tiled text carrying a URL, handle, or copyright notice. The two complement each other — the logo communicates brand while text carries copyright and contact info. Watch the visual hierarchy: the logo can be smaller and more opaque, while the text watermark can be lighter but repeated more often, so both do not fight for attention. Preview the result inside the actual publishing environment (social media, article page, stock library) before exporting.",
          },
          {
            question: "Should I keep the un-watermarked source file?",
            answer: "Yes, definitely. Three reasons. First, you may want to change the watermark later — a new logo, new URL, or new campaign slogan. Second, different platforms need different sizes, ratios, or formats, and re-cropping from a watermarked image usually looks messy. Third, if the font, size, or position turns out wrong, only the clean source lets you redo the work. Name the files clearly (photo-original.jpg, photo-watermark-v1.jpg) or put them in separate folders so the clean version does not get lost after publishing.",
          },
        ],
      },
    },
  },
  {
    slug: 'remove-image-background-browser-local-model',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-07',
    translations: {
      zh: {
        title: '如何一键去除图片背景？在浏览器本地跑模型的原理',
        excerpt: '图片去背景通常会先识别前景主体，再生成透明 alpha mask。浏览器本地模型可以在不上传图片的情况下导出透明 PNG。',
        metaTitle: '如何一键去除图片背景？浏览器本地模型原理',
        metaDescription: '解释图片去背景的基本原理和 ToolGarden 当前实现，包括 @imgly/background-removal、ISNet 模型、输入校验、PNG 规范化、透明 PNG 导出和常见边缘问题。',
        readingTime: '约 9 分钟阅读',
        tags: ['图片去背景', '透明 PNG', '本地 AI', '前景分割'],
        relatedTools: [
          {
            label: '图片去背景',
            href: '/image/remove-bg',
            description: '在浏览器本地使用开源模型移除图片背景，导出透明 PNG。',
          },
          {
            label: '图片转 PNG',
            href: '/image/to-png',
            description: '需要透明背景时，PNG 通常是更稳的输出格式。',
          },
          {
            label: "图片取色器",
            href: "/image/color-picker",
            description: "在合成新背景前，先从素材里吸取一个协调的主色。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '一键去背景的核心是把图片分成前景和背景，然后把背景像素变成透明。',
          },
          {
            type: 'paragraph',
            text: '现代去背景工具通常使用图像分割模型。模型会预测每个像素属于前景的概率，再生成一张 alpha mask，用它决定哪些区域保留、哪些区域透明。',
          },
          { type: 'heading', level: 2, text: '本地模型处理流程' },
          {
            type: 'list',
            ordered: true,
            items: [
              '浏览器读取图片并解码成像素。',
              '模型在本地推断前景区域。',
              '生成透明度遮罩，也就是 alpha mask。',
              '把背景像素设为透明，保留主体。',
              '导出透明 PNG，方便继续设计或排版。',
            ],
          },
          { type: 'heading', level: 2, text: '当前 /image/remove-bg 的实现细节' },
          {
            type: 'paragraph',
            text: 'ToolGarden 目前的图片去背景页面是一个浏览器端单图工具：页面组件负责文件选择、模型档位、进度条、预览和下载；真正的去背景逻辑集中在 lib/utils/image-browser.ts 的 removeImageBackground()，页面不会把图片文件传到业务服务器处理。',
          },
          {
            type: 'table',
            headers: ['环节', '当前实现', '为什么这样做'],
            rows: [
              ['页面入口', 'components/ImageBackgroundRemover.tsx 只取上传列表中的第一张图片，先 inspectImageFile() 读取尺寸和类型，再允许用户点击移除背景。', '避免一次性把大量图片送入浏览器模型，降低内存压力，也让结果预览和下载更明确。'],
              ['输入保护', '支持 JPG、PNG、WebP、GIF、BMP、SVG、AVIF；文件最大 50MB，解码后的像素数最大 40MP。空文件、不支持格式、解码失败和超大图片都会返回结构化错误。', '模型推理前先挡住浏览器难以稳定处理的输入，避免标签页卡死或 Canvas 失败。'],
              ['预处理', 'removeImageBackground() 用 object URL 加载图片，读取 naturalWidth / naturalHeight，再绘制到 Canvas，并通过 normalizeLoadedImageToPng() 转成 PNG Blob 作为模型输入。', '统一输入格式，避免不同图片编码、透明通道或浏览器解码差异直接影响模型调用。'],
              ['模型选择', '运行时动态 import @imgly/background-removal。默认 high quality 对应 isnet_fp16，快速档对应 isnet_quint8。页面文案标注为 medium 约 80MB、small 约 40MB。', '高质量模型边缘更稳，快速模型下载和推理更轻；用户可以按网络和设备性能选择。'],
              ['模型资源', 'publicPath 指向 staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/。首次运行会下载模型资源，之后通常由浏览器缓存。', '把图片处理留在本机，只把模型资产作为静态文件下载；首次慢、二次快是正常现象。'],
              ['进度与导出', '库回调的 label/current/total 会被转换成 model 或 compute 阶段进度；输出固定为 image/png、quality 1，返回 Blob、原尺寸、原始大小、输出大小和耗时。前端再创建 object URL 用于预览和下载。', '透明背景需要 alpha 通道，PNG 是最稳定的默认输出；统计信息可直接展示给用户。'],
            ],
          },
          {
            type: 'code',
            language: 'ts',
            code: removeBgImplementationSnippet,
          },
          {
            type: 'paragraph',
            text: '因此，这个工具的“本地”含义是：用户图片在浏览器内解码、Canvas 规范化、模型推理和 PNG 导出，图片 Blob 不上传到服务器；但首次使用时浏览器仍需要从模型 CDN 请求开源模型资源。如果断网且模型没有缓存，去背景无法启动。',
          },
          { type: 'heading', level: 2, text: '哪些图片效果更好？' },
          {
            type: 'table',
            headers: ['图片类型', '效果预期', '建议'],
            rows: [
              ['人像、商品、宠物、单一主体', '较好', '主体边界清晰更稳定'],
              ['纯色或简单背景', '较好', '模型更容易分辨前景'],
              ['发丝、透明物、复杂阴影', '中等', '边缘可能需要后期微调'],
              ['主体和背景颜色接近', '较难', '尝试更高清原图'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片去背景',
            text: '上传图片后，工具会在浏览器本地加载模型并导出透明 PNG。图片不需要上传到服务器。',
            href: '/image/remove-bg',
            linkLabel: '打开图片去背景',
          },
        ],
        faq: [
          {
            question: "去背景后为什么头发边缘还有一圈灰色或彩色？",
            answer: "这层残留是原背景颜色渗到了发丝里。分割模型通常按像素级别判断前景，但头发是细小、半透明、密度不均的结构，边缘像素往往同时包含头发颜色和背景颜色。当模型只能给一个 0 到 1 的透明度值，那些混合像素就会保留一部分背景色。改善办法：一是用更高分辨率的原图，二是选拍摄背景与主体颜色差异更大的照片，三是导出后用图片编辑工具的细化边缘或替换背景色再处理一次。",
          },
          {
            question: "本地去背景模型和在线专业服务（如 remove.bg）比效果差距多大？",
            answer: "在标准场景（人像、商品、宠物、清晰背景），两者视觉差距通常不大，本地开源模型足以满足社交发图、电商预处理、PPT 素材等需求。差距主要在两个地方：一是发丝和透明物的边缘精修，商用服务经过更多训练和后处理；二是极端场景，比如背景颜色和主体接近、场景光线复杂、主体面积很小时，商用服务的鲁棒性更好。如果对最终质量要求高，可以本地先做一版，人工微调，或者只把关键几张交给付费服务。",
          },
          {
            question: "为什么导出的透明 PNG 在有些软件里背景变成白色？",
            answer: "PNG 支持透明通道（alpha channel），但显示端不一定支持。老版本的图片查看器、部分手机默认相册、微信朋友圈的部分入口、Instagram 发图都可能把透明区域填成白色或黑色。JPG 格式本身不支持透明，任何工具把 PNG 转成 JPG，都会用背景色（默认白色）填充透明像素。如果目标平台不保留透明，最好在设计时就选好背景色（如白色、灰色或品牌色）合成后再导出。",
          },
          {
            question: "去背景可以处理批量图片吗？",
            answer: "浏览器本地模型能处理批量，但要注意两件事：一是模型只加载一次，之后每张图片都要重新推理，第一次可能几秒，后续大概每张几百毫秒到几秒，取决于图片大小和设备性能；二是浏览器内存会随着处理的图片累积，一次上传上百张可能变卡或崩溃。实践建议是分批 20 到 50 张处理，或用文件夹拖入的方式；对电商这种上千张的场景，本地方案不如批处理服务器或桌面软件（如 rembg CLI）稳定。",
          },
          {
            question: "去背景后主体为什么会缺失或断开？",
            answer: "分割模型判断每个像素“属于前景”的概率，遇到低对比度、透明或色相接近背景的区域，概率会低于阈值，那部分主体就被误判为背景删除掉了。常见表现是白衣服和白背景相接的边缘缺失、玻璃杯身消失、宠物白毛部分变透明。解决方法：一是拍摄时提高主体与背景的颜色反差；二是用亮度、对比度调整原图再去背景；三是导出后用抠图编辑工具手动补上缺失区域。",
          },
        ],
      },
      en: {
        title: 'How One-Click Background Removal Works with a Browser-Local Model',
        excerpt: 'Background removal detects the foreground subject and creates an alpha mask. A browser-local model can export transparent PNGs without uploading images.',
        metaTitle: 'How One-Click Image Background Removal Works Locally',
        metaDescription: 'Learn foreground segmentation and ToolGarden implementation details: @imgly/background-removal, ISNet models, input guards, PNG normalization, transparent export, and edge limits.',
        readingTime: '9 min read',
        tags: ['background removal', 'transparent PNG', 'local AI', 'segmentation'],
        relatedTools: [
          {
            label: 'Remove Image Background',
            href: '/image/remove-bg',
            description: 'Remove image backgrounds locally in the browser and export transparent PNG.',
          },
          {
            label: 'Image to PNG',
            href: '/image/to-png',
            description: 'PNG is usually the safest output format for transparent images.',
          },
          {
            label: "Image Color Picker",
            href: "/image/color-picker",
            description: "Sample a matching accent color from your assets before compositing a new background.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'One-click background removal separates foreground from background and turns background pixels transparent.',
          },
          {
            type: 'paragraph',
            text: 'Modern background removal tools use segmentation models. The model predicts how likely each pixel is to belong to the foreground, then creates an alpha mask for transparency.',
          },
          { type: 'heading', level: 2, text: 'Local Model Workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'The browser reads and decodes the image.',
              'The model predicts the foreground area locally.',
              'An alpha mask is generated.',
              'Background pixels are made transparent.',
              'The result is exported as a transparent PNG.',
            ],
          },
          { type: 'heading', level: 2, text: 'How /image/remove-bg Is Implemented Today' },
          {
            type: 'paragraph',
            text: 'ToolGarden currently implements background removal as a browser-side single-image workflow: the React component handles file selection, model choice, progress, preview, and download, while the actual removal logic lives in removeImageBackground() inside lib/utils/image-browser.ts. The image file is not sent to an application server for processing.',
          },
          {
            type: 'table',
            headers: ['Step', 'Current implementation', 'Reason'],
            rows: [
              ['Page entry', 'components/ImageBackgroundRemover.tsx uses the first file from the upload list, calls inspectImageFile() for dimensions and type, then enables the remove action.', 'This avoids pushing large batches through a browser model at once and keeps preview and download state clear.'],
              ['Input guards', 'Supported inputs are JPG, PNG, WebP, GIF, BMP, SVG, and AVIF. Files are capped at 50MB, and decoded images are capped at 40MP. Empty files, unsupported formats, decode failures, and oversized images return structured errors.', 'The tool rejects inputs that are likely to freeze the tab or fail Canvas/model processing.'],
              ['Pre-processing', 'removeImageBackground() loads the image through an object URL, reads naturalWidth / naturalHeight, draws it to Canvas, and uses normalizeLoadedImageToPng() to create a PNG Blob for the model.', 'A normalized PNG input reduces browser and codec differences before the model runs.'],
              ['Model choice', 'The code dynamically imports @imgly/background-removal. The high-quality option maps to isnet_fp16, and the fast option maps to isnet_quint8. The UI describes them as medium about 80MB and small about 40MB.', 'The high-quality model gives steadier edges, while the fast model downloads and runs lighter on weaker devices.'],
              ['Model assets', 'publicPath points to staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/. The first run downloads model assets, and later runs are usually served from the browser cache.', 'The image stays local, while the model is fetched as static assets. A slow first run and faster later runs are expected.'],
              ['Progress and export', 'The library progress callback is mapped into model or compute stages. Output is fixed to image/png with quality 1, and the result returns the Blob, dimensions, source size, output size, and duration. The UI creates an object URL for preview and download.', 'PNG preserves the alpha channel needed for transparency, and the returned stats can be shown directly in the result panel.'],
            ],
          },
          {
            type: 'code',
            language: 'ts',
            code: removeBgImplementationSnippet,
          },
          {
            type: 'paragraph',
            text: 'So “local” means the user image is decoded, normalized, segmented, and exported inside the browser. The image Blob is not uploaded to a server, but the browser may still download open-source model assets from the model CDN on first use. If the device is offline and the model is not cached, background removal cannot start.',
          },
          { type: 'heading', level: 2, text: 'Which Images Work Best?' },
          {
            type: 'table',
            headers: ['Image type', 'Expected result', 'Tip'],
            rows: [
              ['Portraits, products, pets, single subjects', 'Good', 'Clear subject edges help'],
              ['Plain or simple background', 'Good', 'Foreground is easier to separate'],
              ['Hair, transparent objects, complex shadows', 'Medium', 'Edges may need cleanup'],
              ['Subject and background have similar colors', 'Harder', 'Use a higher-resolution source'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Remove Image Background',
            text: 'Upload an image, run the browser-local model, and export a transparent PNG without sending the image to a server.',
            href: '/image/remove-bg',
            linkLabel: 'Open Remove Background',
          },
        ],
        faq: [
          {
            question: "Why is there a gray or colored halo around hair after background removal?",
            answer: "The halo comes from original background color that bled into strands of hair. Segmentation models decide foreground per pixel, but hair is thin, semi-transparent, and irregular, so edge pixels contain both hair color and background color. When the model assigns a single alpha value, those mixed pixels keep part of the background tint. To improve results, use a higher-resolution source image, shoot against a background color that contrasts with the subject, or refine edges in a photo editor after export.",
          },
          {
            question: "How does a local model compare to paid services like remove.bg?",
            answer: "For standard cases — portraits, products, pets, clean backgrounds — visual quality is close and local open-source models cover social posting, e-commerce prep, and slide assets well. The gap shows up in two places. First, edge refinement on hair and transparent objects is stronger in commercial services thanks to more training and post-processing. Second, robustness on hard cases (similar colors, tricky lighting, tiny subjects) is better. If quality matters a lot, run local first, then hand off only the important shots to a paid service.",
          },
          {
            question: "Why does my transparent PNG show a white background in some apps?",
            answer: "PNG supports an alpha channel, but not every viewer honors it. Older image viewers, some default mobile galleries, certain WeChat entry points, and Instagram uploads fill the transparent area with white or black. JPG itself does not support transparency, so any conversion from PNG to JPG replaces transparent pixels with a background color (usually white). If the destination platform strips transparency, choose a background color (white, gray, or your brand color) at design time and composite before exporting.",
          },
          {
            question: "Can it handle batch background removal?",
            answer: "A browser-local model can do batches, but two things matter. First, the model loads once, then each image is inferred separately — the first takes a few seconds, later ones typically a few hundred milliseconds to a couple of seconds depending on image size and device. Second, browser memory accumulates as you process more images, so uploading hundreds at once can slow down or crash the tab. Do 20 to 50 at a time. For e-commerce workflows with thousands of images, a batch server or desktop tool like rembg CLI is more stable.",
          },
          {
            question: "Why do parts of my subject go missing or break apart?",
            answer: "The model outputs a foreground probability per pixel. Low-contrast, transparent, or similar-hue areas fall below the threshold and get treated as background. Typical symptoms are white clothing merging into a white wall, transparent glassware disappearing, or white pet fur becoming see-through. Fixes: shoot with more contrast between subject and background, adjust brightness and contrast on the source before removal, or manually paint the missing area back in with a photo editor after export.",
          },
        ],
      },
    },
  },
  {
    slug: 'base64-encoding-explained-common-pitfalls',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: 'Base64 编码原理和常见坑',
        excerpt: 'Base64 是把二进制数据转成文本的一种编码方式，常用于图片 Data URL、接口传输和配置嵌入，但它不是加密。',
        metaTitle: 'Base64 编码原理和常见坑：图片、Data URL、接口传输',
        metaDescription: '解释 Base64 编码原理、为什么体积会变大、Data URL 和纯 Base64 的区别、常见复制错误以及为什么 Base64 不是加密。',
        readingTime: '约 7 分钟阅读',
        tags: ['Base64', '编码', 'Data URL', '图片转 Base64'],
        relatedTools: [
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '处理 Base64、URL、Unicode、哈希、Cookie、Gzip 等编码解码。',
          },
          {
            label: '图片转 Base64',
            href: '/image/to-base64',
            description: '把图片转换为 Data URL 或纯 Base64 字符串。',
          },
          {
            label: 'Base64 转图片',
            href: '/image/base64-to-image',
            description: '把图片 Base64 或 Data URL 还原成可预览和下载的图片。',
          },
          {
            label: "URL / Query String 构造器",
            href: "/url-builder",
            description: "把 Base64 字符串作为参数拼进 URL 时，实时预览编码结果，避免二次编码。",
          },
          {
            label: "UUID 生成",
            href: "/uuid",
            description: "需要短随机 ID 时，NanoID 通常比 Base64 编码的随机字节更好用。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Base64 是编码，不是加密。任何人拿到 Base64 字符串，都可以把它解码回原始内容。',
          },
          { type: 'code', language: 'text', code: base64Example },
          {
            type: 'paragraph',
            text: '它的作用是把二进制数据转换成只包含常见 ASCII 字符的文本，方便放进 JSON、HTML、CSS、配置文件或接口字段里。',
          },
          { type: 'heading', level: 2, text: '为什么 Base64 会变大？' },
          {
            type: 'paragraph',
            text: 'Base64 大约每 3 个字节编码成 4 个字符，所以体积通常会增加约三分之一。如果把大图片直接塞进 JSON，请求体可能会明显膨胀。',
          },
          { type: 'heading', level: 2, text: 'Data URL 和纯 Base64 有什么区别？' },
          {
            type: 'table',
            headers: ['形式', '例子', '用途'],
            rows: [
              ['纯 Base64', 'iVBORw0KGgo...', '只包含编码内容'],
              ['Data URL', 'data:image/png;base64,iVBOR...', '包含 MIME 类型，可直接用于 img src'],
              ['URL Safe Base64', '使用 - 和 _', '常见于 JWT 和 URL 场景'],
            ],
          },
          { type: 'heading', level: 2, text: '常见坑' },
          {
            type: 'list',
            items: [
              '把 Base64 当作加密，导致敏感信息直接暴露。',
              '复制时漏掉末尾 = 填充字符，导致解码失败。',
              '把 Data URL 当成纯 Base64 传给后端，后端解析失败。',
              '图片太大仍然转 Base64，导致页面和接口变慢。',
              '混用标准 Base64 和 URL Safe Base64。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Base64 工具',
            text: '可以用信息编码转换处理文本 Base64，也可以用图片 Base64 工具在本地完成图片和 Base64 的互转。',
            href: '/info-codec',
            linkLabel: '打开信息编码转换',
          },
        ],
        faq: [
          {
            question: "Base64 会不会保护我的密码或 Token？",
            answer: "不会。Base64 是一种可逆的编码方式，没有密钥，任何拿到 Base64 字符串的人都可以用一行代码或在线工具解回原文。它和加密（AES、RSA）完全不同：加密需要密钥且没有密钥无法还原。看到密码、Token、API Key 被 Base64 存储，请立刻当作明文对待。如果需要真正的保护，应该用哈希（登录密码）、对称加密（数据传输）、非对称加密（密钥交换）或专门的密钥管理服务（如 AWS KMS、HashiCorp Vault）。",
          },
          {
            question: "为什么 Base64 字符串末尾会有一个或两个等号？",
            answer: "等号是填充字符。Base64 每 3 个字节编码成 4 个字符，如果原始数据长度不是 3 的倍数，末尾就会缺 1 或 2 个字节，编码器用 = 补齐到 4 的倍数。1 个 = 表示原始少 1 字节，2 个 = 表示少 2 字节，没有 = 表示原始长度正好是 3 的倍数。复制字符串时，如果漏掉末尾的 =，很多严格解码器会报错。有些实现会自动补全，但发送到后端前手动检查一下更稳妥。",
          },
          {
            question: "为什么把大图片转 Base64 之后页面变得很慢？",
            answer: "Base64 编码会让数据体积膨胀约 33%，一张 500KB 的图片编码后大约 667KB 文本。这段文本会作为字符串塞进 HTML 或 JSON，浏览器解析、内存占用、传输时间都比链接一张外部图片更重。此外，HTML/JS 中的长字符串不能被浏览器缓存复用——每次页面加载都要重新下载和解码。适用 Base64 的场景是极小的图标（十几 KB 以内）或必须内嵌的邮件、报告、离线应用；大图片建议用 CDN 链接。",
          },
          {
            question: "URL Safe Base64 是什么，什么时候要用？",
            answer: "标准 Base64 用 +、/、= 三个字符，其中 + 和 / 在 URL 里有特殊含义（+ 会被解码成空格，/ 是路径分隔符），= 也可能被浏览器或代理修改。URL Safe Base64 把 + 换成 -，把 / 换成 _，并允许省略末尾 =。它常见于三个场景：JWT（Header 和 Payload 都是 URL Safe Base64 编码）、URL 参数里传递二进制数据、Web Push 的密钥交换。使用时要确认收发双方约定一致，混用会导致解码失败。",
          },
          {
            question: "Data URL 和纯 Base64 到底该给后端哪一种？",
            answer: "看后端接口约定，两者不能混用。纯 Base64 只包含编码字符本身，例如 iVBORw0KGgo... 后端拿到直接解码就是二进制。Data URL 是完整的 data:image/png;base64,iVBOR... 前面带 MIME 类型声明，用于浏览器直接渲染（<img src=\"data:...\"）。如果后端约定收纯 Base64，你传 Data URL，它会把 data:image/png;base64, 当作前缀数据一起解码，得到损坏的二进制。反过来也一样，前端预览却传纯 Base64 会显示破图。传输前一定要看清接口示例。",
          },
        ],
      },
      en: {
        title: 'Base64 Encoding Explained and Common Pitfalls',
        excerpt: 'Base64 turns binary data into text for Data URLs, APIs, and embedded configuration. It is encoding, not encryption.',
        metaTitle: 'Base64 Encoding Explained: Data URLs, APIs, and Pitfalls',
        metaDescription: 'Understand how Base64 works, why it increases size, the difference between Data URLs and raw Base64, copy errors, and why Base64 is not encryption.',
        readingTime: '7 min read',
        tags: ['Base64', 'encoding', 'Data URL', 'image to Base64'],
        relatedTools: [
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Encode and decode Base64, URL, Unicode, hashes, Cookie, Gzip, and more.',
          },
          {
            label: 'Image to Base64',
            href: '/image/to-base64',
            description: 'Convert images to Data URLs or raw Base64 strings.',
          },
          {
            label: 'Base64 to Image',
            href: '/image/base64-to-image',
            description: 'Restore image Base64 or Data URLs into previewable downloadable image files.',
          },
          {
            label: "URL / Query String Builder",
            href: "/url-builder",
            description: "Preview how Base64 strings behave when embedded as URL parameters, avoiding double-encoding.",
          },
          {
            label: "UUID Generator",
            href: "/uuid",
            description: "When you need short random IDs, NanoID often works better than Base64-encoded random bytes.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Base64 is encoding, not encryption. Anyone with the string can decode it back to the original content.',
          },
          { type: 'code', language: 'text', code: base64Example },
          {
            type: 'paragraph',
            text: 'Base64 converts binary bytes into text made from common ASCII characters, which makes it convenient for JSON, HTML, CSS, configs, and API fields.',
          },
          { type: 'heading', level: 2, text: 'Why Does Base64 Get Larger?' },
          {
            type: 'paragraph',
            text: 'Base64 encodes about every 3 bytes into 4 characters, so the result is usually about one third larger than the original binary data.',
          },
          { type: 'heading', level: 2, text: 'Data URL vs Raw Base64' },
          {
            type: 'table',
            headers: ['Form', 'Example', 'Use case'],
            rows: [
              ['Raw Base64', 'iVBORw0KGgo...', 'Only the encoded content'],
              ['Data URL', 'data:image/png;base64,iVBOR...', 'Includes MIME type and can be used as img src'],
              ['URL Safe Base64', 'Uses - and _', 'Common in JWT and URL contexts'],
            ],
          },
          { type: 'heading', level: 2, text: 'Common Pitfalls' },
          {
            type: 'list',
            items: [
              'Treating Base64 as encryption and exposing sensitive data.',
              'Missing trailing padding characters when copying.',
              'Sending a Data URL when the backend expects raw Base64.',
              'Embedding very large images as Base64 and slowing down pages or APIs.',
              'Mixing standard Base64 and URL Safe Base64.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Base64 Tools',
            text: 'Use Info Encoder / Decoder for text Base64, or image Base64 tools to convert images and Data URLs locally in the browser.',
            href: '/info-codec',
            linkLabel: 'Open Info Encoder / Decoder',
          },
        ],
        faq: [
          {
            question: "Does Base64 protect passwords or tokens?",
            answer: "No. Base64 is a reversible encoding with no key. Anyone with the string can decode it back to plaintext in one line of code or with any online tool. It has nothing in common with encryption like AES or RSA, which require a key and cannot be reversed without it. If you see a password, token, or API key stored as Base64, treat it as plaintext. Real protection requires hashing (login passwords), symmetric encryption (data at rest and in transit), asymmetric encryption (key exchange), or a dedicated secret manager such as AWS KMS or HashiCorp Vault.",
          },
          {
            question: "Why do Base64 strings sometimes end with one or two equal signs?",
            answer: "The equal sign is padding. Base64 encodes every 3 bytes into 4 characters, so when the original length is not a multiple of 3, the encoder pads with = to reach a multiple of 4. One = means one byte was missing, two = means two bytes were missing, and no = means the original length was already a multiple of 3. When you copy a Base64 string, missing trailing = often causes strict decoders to reject the input. Some implementations auto-pad, but manually verifying padding before sending to the backend is safer.",
          },
          {
            question: "Why does my page become slow after embedding large images as Base64?",
            answer: "Base64 inflates data size by about 33 percent, so a 500KB image becomes about 667KB of text. That text is embedded in HTML or JSON, and the browser must parse it, hold it in memory, and transfer it every time — much heavier than fetching an external image. HTML and JS strings also cannot be cached separately, so every page load re-downloads and re-decodes them. Base64 embedding fits tiny icons (under about 15KB) or offline/email/report contexts. For big images, use a CDN URL.",
          },
          {
            question: "What is URL Safe Base64 and when should I use it?",
            answer: "Standard Base64 uses +, /, and =. The + and / have special meaning in URLs (+ decodes to space, / is a path separator), and = can be rewritten by browsers or proxies. URL Safe Base64 replaces + with - and / with _, and often drops the trailing =. It appears in three common cases: JWT (headers and payloads use URL Safe Base64), passing binary data in URL parameters, and Web Push key exchange. Both sender and receiver must agree on which variant is used, or decoding fails.",
          },
          {
            question: "Should I send a Data URL or raw Base64 to the backend?",
            answer: "It depends on the API contract, and the two are not interchangeable. Raw Base64 is just the encoded content like iVBORw0KGgo..., which the backend can decode directly into binary. A Data URL is the full data:image/png;base64,iVBOR... form, with a MIME prefix used for direct rendering by <img src=\"data:...\">. If the backend expects raw Base64 but you send a Data URL, it will treat the data:image/png;base64, prefix as data and produce corrupted binary. Check the API example before sending.",
          },
        ],
      },
    },
  },
  {
    slug: 'lrc-vs-srt-subtitle-format-edit-online',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: 'LRC vs SRT 字幕格式区别，如何在线编辑',
        excerpt: 'LRC 常用于歌词逐行同步，SRT 常用于视频字幕。两者时间格式、结构和适用场景不同，但都可以在线解析、校准和导出。',
        metaTitle: 'LRC vs SRT 字幕格式区别，如何在线编辑字幕',
        metaDescription: '比较 LRC 和 SRT 字幕格式的时间码、结构、适用场景，介绍在线编辑、媒体预览、时间轴校准和导出流程。',
        readingTime: '约 8 分钟阅读',
        tags: ['LRC', 'SRT', '字幕编辑', '歌词同步'],
        relatedTools: [
          {
            label: '字幕编辑器',
            href: '/subtitle-maker',
            description: '在线编辑 LRC 和 SRT 字幕，支持媒体预览、时间轴校准和字幕导出。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'LRC 和 SRT 都是带时间信息的文本文件，但它们服务的场景不同：LRC 更像歌词，SRT 更像视频字幕。',
          },
          { type: 'heading', level: 2, text: 'LRC 格式示例' },
          { type: 'code', language: 'text', code: lrcSnippet },
          { type: 'heading', level: 2, text: 'SRT 格式示例' },
          { type: 'code', language: 'text', code: srtSnippet },
          { type: 'heading', level: 2, text: '核心区别' },
          {
            type: 'table',
            headers: ['格式', '时间信息', '适合场景'],
            rows: [
              ['LRC', '每行通常只有一个时间点', '歌词、逐行高亮、音乐播放'],
              ['SRT', '每条字幕有开始和结束时间', '视频字幕、课程、短片、访谈'],
              ['LRC', '结构更轻', '适合快速同步文本'],
              ['SRT', '结构更完整', '适合控制字幕显示时长'],
            ],
          },
          { type: 'heading', level: 2, text: '时间轴校准时看什么？' },
          {
            type: 'paragraph',
            text: '字幕是否好用，不只看格式是否正确，更看时间轴是否贴合声音。LRC 通常只需要让每句歌词在唱到时高亮；SRT 则要同时关心出现时间和消失时间，避免字幕太早消失或和下一句重叠。',
          },
          { type: 'code', language: 'text', code: lrcOffsetSnippet },
          {
            type: 'list',
            items: [
              '如果整首歌都慢半秒，可以整体平移时间轴，而不是逐行修改。',
              '如果只有某几句不准，优先修正段落开头和换气点。',
              '视频字幕每条建议控制在一到两行，太长会影响阅读。',
              '人物访谈或课程字幕要避免相邻两条时间重叠。',
            ],
          },
          { type: 'heading', level: 2, text: 'LRC 转 SRT 会遇到什么问题？' },
          {
            type: 'paragraph',
            text: 'LRC 每行只有开始时间，没有明确结束时间。把 LRC 转成 SRT 时，常见做法是把下一行的开始时间当成上一行的结束时间；如果是最后一行，就需要根据音频长度或手动设置一个结束时间。',
          },
          {
            type: 'table',
            headers: ['问题', '表现', '处理方式'],
            rows: [
              ['时间格式混用', '小数点和逗号混在一起', 'LRC 用 00:12.00，SRT 用 00:00:12,000'],
              ['字幕太长', '画面底部堆成多行', '拆成更短的句子，保留自然停顿'],
              ['编码不一致', '中文显示乱码', '保存为 UTF-8 后重新导入'],
              ['空行或编号错误', 'SRT 播放器无法识别', '检查编号、空行和时间箭头格式'],
            ],
          },
          { type: 'heading', level: 2, text: '在线编辑流程' },
          {
            type: 'list',
            ordered: true,
            items: [
              '上传或粘贴 LRC / SRT 字幕文本。',
              '上传本地音频或视频作为预览参考。',
              '播放媒体，逐行校准开始或结束时间。',
              '检查空行、重叠时间和过长字幕。',
              '选择目标格式并导出。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 字幕编辑器',
            text: '支持 LRC 和 SRT 文件上传或粘贴解析，可以配合本地媒体预览校准时间轴，并导出目标格式。',
            href: '/subtitle-maker',
            linkLabel: '打开字幕编辑器',
          },
        ],
        faq: [
          {
            question: "视频里同时能加 LRC 和 SRT 吗？",
            answer: "技术上可以，但意义不大。大多数视频播放器（VLC、PotPlayer、爱奇艺、B 站客户端）只识别 SRT 或 ASS 作为字幕轨道，LRC 主要用于音乐播放器（网易云音乐、酷狗、iOS 音乐 App）来显示逐行歌词。如果你要给一段 MV 加歌词，把 LRC 转成 SRT 更实用：转换时把每行的开始时间作为字幕开始时间，用下一行的开始时间作为结束时间。这样在视频播放器里也能正常显示每一句歌词。",
          },
          {
            question: "字幕里的中文变成乱码或问号怎么办？",
            answer: "几乎都是编码问题。SRT 和 LRC 都是纯文本文件，如果保存时选了 ANSI、GBK 或者 Windows-1252，在其他系统里打开就可能变成乱码。解决方式统一——用文本编辑器（VS Code、Sublime、Notepad++）打开原文件，另存为 UTF-8（不带 BOM），再重新导入播放器或字幕工具。如果原文件已经乱码了，可以用编码识别工具尝试 GBK、Big5、Shift-JIS 等常见编码强制读取一次再另存。",
          },
          {
            question: "整个字幕都比声音慢 500ms，要怎么快速修正？",
            answer: "不要逐行改。所有字幕编辑器都支持“整体平移时间轴”，输入 -500ms 或 -0.5s，所有条目的时间戳同时前移。ToolGarden 字幕编辑器也提供这个功能。如果只有部分区间偏移（比如后半段慢了），可以只选中那些条目再平移；如果偏移量随时间变化（越到后面越慢），说明视频和字幕的帧率或采样率不一致，需要按比例缩放时间轴，而不是简单平移。",
          },
          {
            question: "SRT 每条字幕应该多长？超过屏幕怎么办？",
            answer: "行业惯例是每条不超过 2 行，每行 42 到 45 个字符（英文）或 15 到 20 个汉字。超过这个长度，观众读不完就消失，特别是快节奏对话或访谈。如果一句话太长，做法有两种：一是按自然停顿拆成前后两条字幕，各占一部分时间；二是保留一条但适当延长显示时间。同时避免相邻两条时间重叠，否则播放器可能同时显示两句，画面变乱。校对时打开视频用正常速度播放一遍，能读得完就合格。",
          },
          {
            question: "LRC 转 SRT 时，最后一行的结束时间怎么办？",
            answer: "LRC 每行只有开始时间，转成 SRT 需要每条都有结束时间。中间行的处理很简单——把下一行的开始时间当作当前行的结束时间。但最后一行没有“下一行”，只能自己指定。常见做法有三种：一是根据音频总时长填写最后一行的结束时间；二是给最后一行加一个固定延时，比如再显示 3 秒或 5 秒；三是手动听最后一句结束的位置。如果最后一行是长句，第三种最准，但也最费时。",
          },
        ],
      },
      en: {
        title: 'LRC vs SRT Subtitle Formats and How to Edit Them Online',
        excerpt: 'LRC is often used for synced lyrics, while SRT is common for video subtitles. Their timing structure and editing needs are different.',
        metaTitle: 'LRC vs SRT Subtitle Formats and Online Editing Guide',
        metaDescription: 'Compare LRC and SRT subtitle timing, structure, use cases, online editing, media preview, timeline calibration, and export workflow.',
        readingTime: '8 min read',
        tags: ['LRC', 'SRT', 'subtitle editor', 'lyrics sync'],
        relatedTools: [
          {
            label: 'Subtitle Maker',
            href: '/subtitle-maker',
            description: 'Edit LRC and SRT subtitles online with media preview, timeline calibration, and export.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'LRC and SRT are both timed text formats, but LRC is closer to synced lyrics and SRT is closer to video subtitles.',
          },
          { type: 'heading', level: 2, text: 'LRC Example' },
          { type: 'code', language: 'text', code: lrcSnippet },
          { type: 'heading', level: 2, text: 'SRT Example' },
          { type: 'code', language: 'text', code: srtSnippet },
          { type: 'heading', level: 2, text: 'Key Differences' },
          {
            type: 'table',
            headers: ['Format', 'Timing', 'Best for'],
            rows: [
              ['LRC', 'Usually one timestamp per line', 'Lyrics and line-by-line music sync'],
              ['SRT', 'Each cue has start and end time', 'Video subtitles, courses, clips, interviews'],
              ['LRC', 'Lightweight structure', 'Fast line syncing'],
              ['SRT', 'More complete cue structure', 'Precise subtitle display duration'],
            ],
          },
          { type: 'heading', level: 2, text: 'What to Check When Calibrating Timing' },
          {
            type: 'paragraph',
            text: 'A valid subtitle file can still feel wrong if the timing is off. LRC usually needs each lyric line to highlight when it is sung. SRT needs both start and end time, so a cue should not disappear too early or overlap the next line.',
          },
          { type: 'code', language: 'text', code: lrcOffsetSnippet },
          {
            type: 'list',
            items: [
              'If the whole song is late by half a second, shift the timeline globally instead of editing every line.',
              'If only a few lines are off, fix section starts and natural pauses first.',
              'For video subtitles, keep each cue to one or two readable lines when possible.',
              'For interviews and courses, avoid overlapping adjacent cues.',
            ],
          },
          { type: 'heading', level: 2, text: 'What Happens When Converting LRC to SRT?' },
          {
            type: 'paragraph',
            text: 'LRC lines usually have a start time but no explicit end time. When converting LRC to SRT, the next line start time is often used as the previous line end time. The last line needs an end time based on media duration or manual adjustment.',
          },
          {
            type: 'table',
            headers: ['Issue', 'Symptom', 'Fix'],
            rows: [
              ['Mixed time formats', 'Dots and commas are mixed', 'Use 00:12.00 for LRC and 00:00:12,000 for SRT'],
              ['Long cues', 'Subtitle takes too many lines', 'Split into shorter readable phrases'],
              ['Wrong encoding', 'Chinese text is garbled', 'Save as UTF-8 and import again'],
              ['Bad SRT spacing', 'Player cannot read the file', 'Check cue numbers, blank lines, and the time arrow'],
            ],
          },
          { type: 'heading', level: 2, text: 'Online Editing Workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Upload or paste LRC / SRT subtitle text.',
              'Load a local audio or video file for preview.',
              'Play the media and calibrate row timing.',
              'Check empty lines, overlapping timestamps, and long subtitles.',
              'Choose the target format and export.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Subtitle Maker',
            text: 'Upload or paste LRC and SRT subtitles, preview against local media, calibrate timing, and export the result.',
            href: '/subtitle-maker',
            linkLabel: 'Open Subtitle Maker',
          },
        ],
        faq: [
          {
            question: "Can I use both LRC and SRT on the same video?",
            answer: "Technically yes, but rarely useful. Most video players (VLC, PotPlayer, MPV, iQiyi, Bilibili) recognize SRT or ASS as a subtitle track. LRC is used by music apps (Spotify-style lyric panels, iOS Music, NetEase Music) for line-by-line synced lyrics. To add lyrics to a music video, convert LRC to SRT: use each line start time as the cue start, and the next line's start as the cue end. This lets a normal video player display the lyrics correctly.",
          },
          {
            question: "What if Chinese characters show as garbled text or question marks?",
            answer: "Almost always an encoding problem. SRT and LRC are plain text files, so if they were saved as ANSI, GBK, or Windows-1252, they may look garbled on another system. The fix is consistent: open the original file in a text editor like VS Code, Sublime, or Notepad++, save as UTF-8 without BOM, then re-import into the player or subtitle tool. If the file is already garbled, use an encoding-detection tool to try GBK, Big5, or Shift-JIS as the source encoding first, then re-save as UTF-8.",
          },
          {
            question: "My whole subtitle track is 500ms late — how do I fix it fast?",
            answer: "Do not edit line by line. Every subtitle editor supports global timeline shift. Enter -500ms or -0.5s and every cue moves earlier at once. ToolGarden Subtitle Maker offers this too. If only part of the file drifts, select those cues and shift just them. If the offset grows over time — later cues drift more — the video and subtitle frame rates or sample rates do not match, and you need proportional time scaling rather than a linear shift.",
          },
          {
            question: "How long should each SRT cue be? What if a line is too long?",
            answer: "The industry norm is up to two lines per cue and 42 to 45 characters per line for English (about 15 to 20 Han characters for Chinese). Beyond that, viewers cannot finish reading before the cue disappears, especially in fast dialogue or interviews. If a line is too long, either split it into two cues at a natural pause, each taking part of the time, or keep one cue but extend the display duration. Avoid overlapping adjacent cues, which makes players show two lines at once. Play the video at normal speed to sanity-check readability.",
          },
          {
            question: "When converting LRC to SRT, what end time should the last line get?",
            answer: "LRC has only start times, but SRT needs an end time for every cue. Middle lines are easy — use the next line's start time as the current line's end time. The last line has no next line, so you must set it yourself. There are three usual choices: use the total audio duration as the last end time; add a fixed display duration like 3 or 5 seconds; or manually listen and mark the exact end position. The third option is most accurate for long final phrases but takes the most time.",
          },
        ],
      },
    },
  },
  {
    slug: 'convert-excel-data-to-json-online',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: 'Excel 数据如何一键转成 JSON',
        excerpt: 'Excel 转 JSON 通常会读取第一行作为字段名，再把后续每一行转换成对象，适合接口 mock、数据导入和配置迁移。',
        metaTitle: 'Excel 数据如何一键转成 JSON？在线转换教程',
        metaDescription: '介绍 Excel 转 JSON 的常见规则，包括表头字段、空单元格、数字和日期、第一张 Sheet、数据清洗以及在线本地转换流程。',
        readingTime: '约 8 分钟阅读',
        tags: ['Excel 转 JSON', 'XLSX', '数据转换', 'JSON'],
        relatedTools: [
          {
            label: 'Excel → JSON',
            href: '/excel-to-json',
            description: '读取 Excel (.xlsx/.xls) 文件并转换为 JSON 数组。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '转换后可以继续格式化、压缩和校验 JSON。',
          },
          {
            label: "时间戳转换",
            href: "/timestamp",
            description: "Excel 里的日期数值转 JSON 后经常变成序列号，用时间戳工具还原成人类可读日期。",
          },
          {
            label: "UUID 生成",
            href: "/uuid",
            description: "导出 JSON 时批量生成主键或 request id，替换掉 Excel 里的自增序号。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Excel 转 JSON 的核心规则是：表头变成字段名，每一行变成一个 JSON 对象。',
          },
          { type: 'code', language: 'json', code: excelJsonExample },
          { type: 'heading', level: 2, text: '转换前最好整理表格' },
          {
            type: 'list',
            items: [
              '第一行作为字段名，避免空表头和重复表头。',
              '每一列只放一种类型的数据，例如不要混用数字和说明文字。',
              '日期列要确认是否需要保留为文本，还是转成日期字符串。',
              '删除合并单元格、注释行和统计行，避免混入 JSON。',
              '如果有多个 Sheet，先确认工具读取哪一张表。',
            ],
          },
          { type: 'heading', level: 2, text: '如何表达嵌套字段？' },
          {
            type: 'paragraph',
            text: '很多接口需要嵌套对象，而 Excel 天然是二维表。比较常见的做法是在表头中使用路径式字段名，例如 user.name、user.email、order.id。转换时再把这些路径还原成嵌套 JSON。',
          },
          { type: 'code', language: 'json', code: excelNestedJsonExample },
          {
            type: 'table',
            headers: ['Excel 表头', 'JSON 结果', '适合场景'],
            rows: [
              ['user.name', 'user: { name: ... }', '用户资料、联系人信息'],
              ['order.total', 'order: { total: ... }', '订单、报价、结算数据'],
              ['tags', 'tags: ...', '简单标签列，可后续拆成数组'],
              ['address.city', 'address: { city: ... }', '地址、地区、配送信息'],
            ],
          },
          { type: 'heading', level: 2, text: '空值、日期和数字要特别小心' },
          {
            type: 'paragraph',
            text: 'Excel 看起来像文本的内容，底层可能是数字、日期序列值或带格式的单元格。比如身份证号、手机号、邮编这类字段不应该当数字处理，否则前导零可能丢失；金额字段则要确认小数精度是否满足业务要求。',
          },
          {
            type: 'list',
            items: [
              'ID、手机号、邮编建议在 Excel 中按文本保存。',
              '金额、数量、比例字段转换后要抽查小数位。',
              '日期最好统一成 yyyy-mm-dd 或 ISO 字符串，再交给接口处理。',
              '空单元格要确认是保留 null、空字符串，还是直接省略字段。',
            ],
          },
          { type: 'heading', level: 2, text: '常见问题' },
          {
            type: 'table',
            headers: ['问题', '原因', '建议'],
            rows: [
              ['字段名很奇怪', '表头含空格、换行或重复名称', '先规范表头'],
              ['数字变成文本', 'Excel 单元格格式不统一', '转换后抽查关键字段'],
              ['空值丢失或变空字符串', '空单元格处理规则不同', '根据接口要求统一处理'],
              ['日期不符合预期', 'Excel 日期本质上可能是序列值', '提前转为文本日期'],
            ],
          },
          { type: 'heading', level: 2, text: '导入接口前的检查清单' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先转换少量样本，确认字段名和嵌套结构正确。',
              '用 JSON 格式化工具检查输出是否为合法 JSON。',
              '随机抽查首行、中间行和最后一行，避免空行或统计行混入。',
              '对照接口文档确认必填字段、字段类型和日期格式。',
              '正式导入前保留原始 Excel 文件，方便回溯。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Excel → JSON',
            text: '上传 Excel 文件后，工具会在浏览器本地读取表格并输出 JSON 数组，适合快速生成接口样本和导入数据。',
            href: '/excel-to-json',
            linkLabel: '打开 Excel → JSON',
          },
        ],
        faq: [
          {
            question: "Excel 里的日期转成 JSON 后变成一串数字怎么办？",
            answer: "这是 Excel 底层用序列值（比如 45678）表示日期的结果——1900-01-01 是 1，之后每天加 1。转换器如果直接把单元格值读成数字，就会把日期变成 45000 这种没意义的整数。解决办法有两种：一是转换前在 Excel 里选中日期列，设置单元格格式为“文本”，或者用公式 =TEXT(A2,\"yyyy-mm-dd\") 生成一个新列再转换；二是使用支持自动识别日期的转换工具，它会读取 Excel 的日期格式并输出 ISO 字符串（2024-11-15）。正式导入接口前，检查几行日期字段的实际值。",
          },
          {
            question: "身份证号、手机号在 Excel 里显示正常，转 JSON 后为什么变成科学计数法？",
            answer: "Excel 对超过 15 位的纯数字会用科学计数法显示（比如 3.10105E+17），并且只保留 15 位精度，后面的位数会被抹成 0。18 位身份证号最后 3 位归零、19 位银行卡号变形都是这样发生的。根本原因是这些字段被当成 number 处理。解决方式：转换前在 Excel 里给这些列设置“文本”格式，或者在数据前面加一个英文单引号（'110101199001011234），Excel 会当作文本存储。转 JSON 时也要确认工具按字符串处理这些列，不要走数字类型。",
          },
          {
            question: "多个 Sheet 的 Excel 转 JSON 时会读取哪一张？",
            answer: "绝大多数在线转换工具默认只读取第一张 Sheet（也就是打开 Excel 时最左边显示的那一张）。如果你的数据在其他 Sheet 上，转换结果会是空的或者错的。解决办法：转换前把目标 Sheet 拖到最前面，或者复制其内容到一个新 Excel 文件里再转换；如果工具支持选择 Sheet，就在设置中指定名称。多 Sheet 想全部转换的话，需要循环处理——ToolGarden 的 Excel → JSON 目前默认第一张，导入多表数据前先合并或分批处理。",
          },
          {
            question: "Excel 转出来的 JSON 字段名带空格或换行，接口报错怎么办？",
            answer: "问题在表头。Excel 允许表头写“用户 姓名”“订单\\n编号”这种带空格或换行的内容，转换后会变成 JSON 里的 key：{ \"用户 姓名\": \"张三\", \"订单\\n编号\": \"A001\" }。大多数接口不接受带空格或特殊字符的字段名。修复方式：转换前统一在 Excel 里改表头，比如把空格改成下划线（user_name），把中文改成英文（orderId），删掉换行。也可以用 JSON 修复清洗工具批量替换 key 名。规范表头一次，之后每次转换都干净。",
          },
          {
            question: "空单元格在 JSON 里应该是 null、空字符串还是省略字段？",
            answer: "看接口约定，三种都合法但含义不同。null 明确表示“这个字段存在但没值”，适合数据库允许 NULL 的字段；空字符串（\"\"）表示“字段有值，值是空”，适合前端表单默认值场景；省略字段（key 都不出现）表示“这个属性根本不存在”，适合可选字段和稀疏数据。选错了后端可能出问题——比如后端用 if field is None 判断空但你传 \"\"，条件不成立。转换前问清接口对空值的处理规则，或者转换后统一用工具批量把 null 改成对应形式。",
          },
        ],
      },
      en: {
        title: 'How to Convert Excel Data to JSON Online',
        excerpt: 'Excel to JSON usually turns the first row into field names and each following row into a JSON object for mock APIs, imports, and config migration.',
        metaTitle: 'How to Convert Excel Data to JSON Online',
        metaDescription: 'Learn Excel to JSON conversion rules, headers, empty cells, numbers, dates, first-sheet behavior, data cleanup, and browser-local conversion.',
        readingTime: '8 min read',
        tags: ['Excel to JSON', 'XLSX', 'data conversion', 'JSON'],
        relatedTools: [
          {
            label: 'Excel to JSON',
            href: '/excel-to-json',
            description: 'Read Excel files and convert sheet rows into JSON arrays.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and validate the converted JSON.',
          },
          {
            label: "Timestamp Converter",
            href: "/timestamp",
            description: "Excel date serials often survive as raw numbers; convert them back to readable dates here.",
          },
          {
            label: "UUID Generator",
            href: "/uuid",
            description: "Generate primary keys or request IDs in bulk to replace auto-increment columns from Excel.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The basic rule for Excel to JSON is simple: headers become field names, and each row becomes a JSON object.',
          },
          { type: 'code', language: 'json', code: excelJsonExample },
          { type: 'heading', level: 2, text: 'Clean the Sheet Before Conversion' },
          {
            type: 'list',
            items: [
              'Use the first row as field names and avoid empty or duplicate headers.',
              'Keep each column to one kind of data.',
              'Decide whether date columns should remain text or become date strings.',
              'Remove merged cells, notes, and summary rows before conversion.',
              'If the file has multiple sheets, confirm which sheet the tool reads.',
            ],
          },
          { type: 'heading', level: 2, text: 'How to Represent Nested Fields' },
          {
            type: 'paragraph',
            text: 'Many APIs expect nested objects, while Excel is a flat table. A common approach is to use path-like headers such as user.name, user.email, and order.id, then rebuild those paths into nested JSON.',
          },
          { type: 'code', language: 'json', code: excelNestedJsonExample },
          {
            type: 'table',
            headers: ['Excel header', 'JSON result', 'Best for'],
            rows: [
              ['user.name', 'user: { name: ... }', 'Profiles and contacts'],
              ['order.total', 'order: { total: ... }', 'Orders, quotes, and billing data'],
              ['tags', 'tags: ...', 'Simple tag columns that can later become arrays'],
              ['address.city', 'address: { city: ... }', 'Addresses, regions, and shipping data'],
            ],
          },
          { type: 'heading', level: 2, text: 'Handle Empty Values, Dates, and Numbers Carefully' },
          {
            type: 'paragraph',
            text: 'A cell that looks like text in Excel may actually be a number, a date serial value, or a formatted cell. IDs, phone numbers, and postal codes should usually stay as text so leading zeros are not lost. Amount fields need decimal checks.',
          },
          {
            type: 'list',
            items: [
              'Save IDs, phone numbers, and postal codes as text when needed.',
              'Check decimal places for amounts, quantities, and ratios.',
              'Normalize dates to yyyy-mm-dd or ISO strings before sending them to an API.',
              'Decide whether blank cells should become null, empty strings, or omitted fields.',
            ],
          },
          { type: 'heading', level: 2, text: 'Common Issues' },
          {
            type: 'table',
            headers: ['Issue', 'Cause', 'Suggestion'],
            rows: [
              ['Strange field names', 'Headers contain spaces, line breaks, or duplicates', 'Normalize headers first'],
              ['Numbers become text', 'Cell formats are inconsistent', 'Check key fields after conversion'],
              ['Empty values change', 'Different blank-cell rules', 'Normalize according to API needs'],
              ['Dates look wrong', 'Excel dates may be serial values', 'Convert dates to text first'],
            ],
          },
          { type: 'heading', level: 2, text: 'Checklist Before Importing to an API' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Convert a small sample first and confirm field names and nested structure.',
              'Use a JSON formatter to verify that the output is valid JSON.',
              'Spot-check the first row, a middle row, and the last row to catch empty or summary rows.',
              'Compare required fields, field types, and date formats with the API documentation.',
              'Keep the original Excel file before a production import.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Excel to JSON',
            text: 'Upload an Excel file and convert rows into a JSON array locally in the browser.',
            href: '/excel-to-json',
            linkLabel: 'Open Excel to JSON',
          },
        ],
        faq: [
          {
            question: "Why do Excel dates turn into a random number in JSON?",
            answer: "Excel stores dates as serial numbers underneath (1900-01-01 is 1, each day adds 1), so 45678 is really a date. If the converter reads the raw cell value, you get a meaningless integer like 45000 instead of a date. Two fixes: before conversion, format the date column as Text in Excel or add a helper column with =TEXT(A2,\"yyyy-mm-dd\") and convert that one; or use a converter that detects Excel date formats and outputs ISO strings like 2024-11-15. Always spot-check a few date fields before pushing the JSON to production.",
          },
          {
            question: "Why do phone numbers and long IDs turn into scientific notation in JSON?",
            answer: "Excel displays numbers longer than 15 digits in scientific notation (3.10105E+17) and only keeps 15 digits of precision. Everything past digit 15 becomes zero. That is why 18-digit Chinese ID numbers lose the last three digits and 19-digit bank card numbers get mangled. The root cause is that these fields are treated as numbers. Fix: set those columns to Text format in Excel before conversion, or prefix values with an apostrophe ('110101199001011234) so Excel stores them as text. Also confirm the converter reads them as strings, not numbers.",
          },
          {
            question: "Which sheet does the tool read when my Excel has multiple sheets?",
            answer: "Most online converters default to the first sheet (the leftmost tab). If your data is on another sheet, the output will be empty or wrong. Fix: drag the target sheet to the first position before uploading, or copy its content into a new Excel file. If the tool supports sheet selection, name the sheet explicitly. To convert all sheets, you often need to loop. ToolGarden Excel to JSON currently reads the first sheet by default, so merge or split before importing multi-sheet data.",
          },
          {
            question: "The JSON output has spaces or line breaks in field names and my API rejects it — how do I fix that?",
            answer: "The header is the problem. Excel allows headers like \"user name\" or \"order\\nid\" with spaces or line breaks, and those become JSON keys directly: { \"user name\": \"Alice\", \"order\\nid\": \"A001\" }. Most APIs reject keys with spaces or special characters. Fix: normalize headers in Excel first — replace spaces with underscores (user_name), rename to lowerCamelCase (orderId), and remove line breaks. You can also run the output through a JSON cleanup tool to rename keys in bulk. Doing it once per template keeps every future conversion clean.",
          },
          {
            question: "Should empty cells become null, empty string, or omitted in JSON?",
            answer: "It depends on the API contract, and all three are valid but mean different things. null explicitly says the field exists but has no value, matching database NULL. An empty string means the field has a value that happens to be empty, common for form defaults. Omitting the key means the property does not exist, useful for optional or sparse data. Picking the wrong one can break the backend — for example, if the server checks `if field is None` but you send \"\", the condition fails. Confirm the contract, or post-process with a JSON tool to standardize.",
          },
        ],
      },
    },
  },
  {
    slug: 'text-diff-algorithm-add-delete-change',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '文本对比工具原理：diff 算法怎么找出增删改',
        excerpt: 'diff 算法会寻找两段文本之间尽量长的共同部分，再把剩余内容标记为新增、删除或修改，用于代码、日志、文案和配置对比。',
        metaTitle: '文本对比工具原理：diff 算法怎么找出增删改',
        metaDescription: '解释文本 diff 算法的基本思路，包括按行对比、按词对比、最长公共子序列、增删改标记和 JSON 结构化对比的区别。',
        readingTime: '约 7 分钟阅读',
        tags: ['diff 算法', '文本对比', '增删改', '开发工具'],
        relatedTools: [
          {
            label: '文本对比',
            href: '/text/diff',
            description: '使用 diff 算法对比两段文本，按行和词高亮差异。',
          },
          {
            label: 'JSON 对比',
            href: '/json-diff',
            description: '结构化 JSON 更适合按字段路径进行对比。',
          },
          {
            label: "正则表达式测试",
            href: "/regex",
            description: "对比前先用正则批量清理空白、时间戳等噪声，让 diff 只显示真实差异。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'diff 算法的目标不是理解文本含义，而是找出两个序列里哪些部分相同，哪些部分发生了变化。',
          },
          { type: 'heading', level: 2, text: '基本思路' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先把文本拆成行、词或字符。',
              '寻找两份内容中可以对齐的共同部分。',
              '共同部分之间的缺口标记为新增或删除。',
              '相邻的删除和新增通常可以被展示为修改。',
              '最后把结果渲染成高亮视图。',
            ],
          },
          { type: 'heading', level: 2, text: '行级、词级、字符级有什么区别？' },
          {
            type: 'table',
            headers: ['粒度', '适合内容', '特点'],
            rows: [
              ['行级', '日志、配置、列表', '速度快，结构清楚'],
              ['词级', '文案、说明、句子', '能看出一句话里改了哪个词'],
              ['字符级', '短字符串、标识符', '很细，但长文本会显得碎'],
              ['结构化', 'JSON、对象数据', '按字段路径比纯文本更准确'],
            ],
          },
          {
            type: 'paragraph',
            text: '很多 diff 实现会使用最长公共子序列或类似策略。它们尽量保留共同内容，再用最少的插入和删除说明变化。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 文本对比',
            text: '粘贴旧文本和新文本后，可以查看行级和词级差异。JSON 数据建议使用 JSON 对比来减少格式噪声。',
            href: '/text/diff',
            linkLabel: '打开文本对比',
          },
        ],
        faq: [
          {
            question: "为什么两段文本明明只改了一个字，diff 工具却显示整行都变了？",
            answer: "这是行级 diff 的正常行为。行级 diff 把文本按换行符切成块，然后逐行比较——只要一行里任何一个字符不同，整行就被标记为删除加新增。要看清具体改了哪个字，需要切换到词级 diff 或字符级 diff。词级 diff 会把行内容再切成单词，只高亮改动的词；字符级 diff 更细，能显示单个字母或汉字变化。ToolGarden 文本对比支持切换粒度。对代码或配置文件用行级，对文案或句子用词级更合适。",
          },
          {
            question: "diff 结果里出现大量“删除+新增”而不是“修改”，正常吗？",
            answer: "正常。经典 diff 算法（Myers 算法、LCS 变种）只输出插入和删除两种操作，“修改”是渲染层把相邻的删除和新增合并显示出来的。如果你的两段文本中，相同内容之间穿插着大量不同内容，算法找不到足够长的公共子序列，就会把大块内容标记为整块删除加整块新增，看起来像“全部改了”。这时可以试试：调整 diff 粒度（词级、字符级）、或者对齐两段文本的段落顺序再对比，能减少虚假差异。",
          },
          {
            question: "对比 JSON 数据时，为什么应该用 JSON diff 而不是文本 diff？",
            answer: "JSON 是结构化数据，字段顺序、缩进、空格都可以变化而不影响语义。文本 diff 会把这些格式差异当成真差异——同一份 JSON 只是重新格式化了一次，文本 diff 就报出满屏改动。JSON diff 先把两份 JSON 解析成对象树，再按字段路径（比如 user.address.city）比较值，忽略格式和字段顺序。这样你看到的差异才是真正的数据变化：某个字段从 A 变成 B、某个字段新增、某个数组多了一项。做接口回归、数据校对时，JSON diff 效率高得多。",
          },
          {
            question: "diff 工具能理解代码语义（比如变量重命名）吗？",
            answer: "标准 diff 不能。经典算法只看字符或行是否相同，不理解语言语法。把变量 userName 改成 user_name，diff 只会告诉你“这行删了 userName，加了 user_name”，不知道是同一个变量的重命名。要做语义级对比，需要专门的工具：GitHub 的 semantic diff、JetBrains IDE 的结构化 diff、AST diff 工具（如 gumtree、difftastic）会把代码解析成语法树后再比较。日常开发中 diff 已经够用，涉及大规模重命名或重构时才需要更高级的工具。",
          },
          {
            question: "两个很长的文件 diff 时，工具很慢或卡住，能优化吗？",
            answer: "diff 算法的最坏时间复杂度是 O(N×M)，两个文件都有几万行时计算量就会爆炸。优化思路有几个：一是先按段落或章节手动切分，只对比变化的部分；二是关闭词级或字符级 diff，只做行级；三是用命令行工具 diff 或 git diff，它们对大文件优化更好；四是如果两文件差异集中在少数几处，用搜索定位后局部对比比整体对比快得多。浏览器端 diff 通常适合几千行以内的文本，超出时改用桌面工具。",
          },
        ],
      },
      en: {
        title: 'How Text Diff Algorithms Find Additions, Deletions, and Changes',
        excerpt: 'Diff algorithms look for shared subsequences between two texts, then mark the remaining parts as additions, deletions, or changes.',
        metaTitle: 'How Text Diff Algorithms Find Additions and Deletions',
        metaDescription: 'Understand line diff, word diff, longest common subsequence ideas, addition/deletion/change rendering, and when JSON diff is better.',
        readingTime: '7 min read',
        tags: ['diff algorithm', 'text comparison', 'additions', 'developer tools'],
        relatedTools: [
          {
            label: 'Text Diff',
            href: '/text/diff',
            description: 'Compare two text blocks and highlight line and word changes.',
          },
          {
            label: 'JSON Diff',
            href: '/json-diff',
            description: 'Compare structured JSON by field path.',
          },
          {
            label: "Regex Tester",
            href: "/regex",
            description: "Strip whitespace or timestamps with a regex before diffing so only real changes remain.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'A diff algorithm does not understand meaning. It finds which parts of two sequences are shared and which parts changed.',
          },
          { type: 'heading', level: 2, text: 'The Basic Idea' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Split text into lines, words, or characters.',
              'Find common parts that can be aligned.',
              'Mark gaps between common parts as additions or deletions.',
              'Adjacent deletions and additions can be displayed as modifications.',
              'Render the result as a highlighted view.',
            ],
          },
          { type: 'heading', level: 2, text: 'Line, Word, and Character Diff' },
          {
            type: 'table',
            headers: ['Granularity', 'Best for', 'Trait'],
            rows: [
              ['Line-level', 'Logs, configs, lists', 'Fast and easy to scan'],
              ['Word-level', 'Copy, prose, sentences', 'Shows changed words inside a line'],
              ['Character-level', 'Short strings and identifiers', 'Precise but noisy for long text'],
              ['Structured', 'JSON and object data', 'More accurate by field path'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Many diff implementations use longest common subsequence ideas or similar strategies: preserve shared content and explain changes with insertions and deletions.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Text Diff',
            text: 'Paste old text and new text to inspect line and word differences. Use JSON Diff for structured JSON to avoid formatting noise.',
            href: '/text/diff',
            linkLabel: 'Open Text Diff',
          },
        ],
        faq: [
          {
            question: "I changed only one character, but the diff shows the whole line as different — why?",
            answer: "This is normal for line-level diff. Line diff splits text at line breaks and compares whole lines, so any single-character change marks the entire line as deleted-plus-added. To see the exact character change, switch to word-level or character-level diff. Word diff splits the line into tokens and only highlights changed words. Character diff is even finer and shows individual letter changes. ToolGarden Text Diff supports switching granularity. Use line diff for code and configs, word diff for prose and copy.",
          },
          {
            question: "Why does diff show many delete+add pairs instead of a modification?",
            answer: "That is how classic diff algorithms (Myers, LCS variants) work — they only emit insertions and deletions, and the modification view is a rendering hint that merges adjacent delete+add pairs. If the two texts share very little in common between differing chunks, the algorithm cannot find long enough common subsequences and marks big blocks as pure delete-and-add. Try adjusting granularity (word or character), or align the paragraph order between the two versions before diffing, which reduces false-positive differences.",
          },
          {
            question: "Why should I use a JSON diff instead of a text diff for JSON data?",
            answer: "JSON is structured data, so formatting, indentation, and key order can change without altering meaning. A text diff reports all those cosmetic differences as real changes — a reformatted JSON file lights up entirely under text diff. A JSON diff parses both sides into object trees and compares by field path like user.address.city, ignoring format and key order. What you see then is a true data change: a field went from A to B, a new field appeared, an array grew. For API regression or data reconciliation, JSON diff is far more efficient.",
          },
          {
            question: "Can diff tools understand semantic changes like variable renaming?",
            answer: "Standard diff cannot. Classic algorithms only compare characters or lines and do not understand syntax. Renaming userName to user_name shows up as a delete of userName plus an insert of user_name, with no signal that it is the same variable. For semantic comparison, use specialized tools: GitHub semantic diff, JetBrains structural diff, or AST diff tools like gumtree and difftastic parse code into syntax trees before comparing. Standard diff is enough for daily coding; large-scale renames and refactors benefit from the smarter tools.",
          },
          {
            question: "Diffing two large files is slow or hangs — can it be optimized?",
            answer: "Diff has worst-case O(N×M) complexity, so two files with tens of thousands of lines can explode. Options: manually split by section and diff only changed parts; drop word or character granularity and use line diff; use command-line diff or git diff, which are heavily optimized for large files; or search for the specific area of interest and diff only that region. Browser-based diff typically handles files up to a few thousand lines well, and larger files are better served by desktop tools.",
          },
        ],
      },
    },
  },
  {
    slug: 'json-json5-jsonc-differences',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-20',
    translations: {
      zh: {
        title: 'JSON vs JSONC vs JSON5：完整对比指南',
        excerpt: 'JSON 是严格数据格式，JSONC 主要给配置文件增加注释，JSON5 则放宽了更多 JavaScript 风格语法。',
        metaTitle: 'JSON vs JSONC vs JSON5 完整指南：语法、兼容与选择',
        metaDescription: '完整比较 JSON、JSONC、JSON5 的注释、尾逗号、单引号、未加引号 key、解析兼容、配置文件场景和转换建议。',
        readingTime: '约 9 分钟阅读',
        tags: ['JSON', 'JSON5', 'JSONC', '配置文件'],
        relatedTools: [
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '格式化、压缩和验证 JSON / JSONC / JSON5 风格内容。',
          },
          {
            label: 'JSON 修复清洗',
            href: '/json-repair',
            description: '把注释、尾逗号、单引号等非标准语法清理成标准 JSON。',
          },
          {
            label: "正则表达式测试",
            href: "/regex",
            description: "手写脚本清理 JSONC 注释、尾逗号前，用正则先验证匹配范围。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSON、JSONC、JSON5 看起来很像，但它们的定位不同。把它们混用，是很多解析报错的来源。',
          },
          { type: 'code', language: 'json5', code: jsonVariantsExample },
          { type: 'heading', level: 2, text: '核心区别' },
          {
            type: 'table',
            headers: ['格式', '是否标准 JSON', '主要特点'],
            rows: [
              ['JSON', '是', '严格、通用、适合接口和数据交换'],
              ['JSONC', '不是标准 JSON', '常见于配置文件，允许注释，语法整体接近 JSON'],
              ['JSON5', '不是标准 JSON', '更接近 JavaScript 对象字面量，允许单引号、尾逗号、未加引号 key 等'],
            ],
          },
          { type: 'heading', level: 2, text: '为什么 API 通常只接受标准 JSON？' },
          {
            type: 'paragraph',
            text: 'API、数据库、消息队列和第三方平台需要跨语言解析。同一份数据可能会被 JavaScript、Java、Go、Python、Rust 等不同运行时读取。标准 JSON 的好处是规则少、歧义低、解析器行为更一致。',
          },
          {
            type: 'list',
            items: [
              '注释不是数据，发送给 API 后没有统一语义。',
              '尾逗号、单引号、未加引号 key 在不同解析器中支持不一致。',
              'NaN、Infinity 等值不是标准 JSON，很多后端会直接拒绝。',
              '配置文件可以照顾人类阅读，接口数据更强调机器稳定解析。',
            ],
          },
          { type: 'heading', level: 2, text: '为什么 tsconfig.json 可以写注释？' },
          {
            type: 'paragraph',
            text: '很多人第一次看到 tsconfig.json 里的注释会疑惑：文件扩展名明明是 .json，为什么还能写 // 注释？原因是 TypeScript 工具链按 JSONC 方式读取配置，它不是普通 JSON API 的解析规则。',
          },
          {
            type: 'table',
            headers: ['文件或场景', '常见格式', '能否直接发给普通 API'],
            rows: [
              ['tsconfig.json', 'JSONC 风格配置', '不能假设可以'],
              ['VS Code settings.json', 'JSONC 风格配置', '不能假设可以'],
              ['package.json', '标准 JSON', '通常可以'],
              ['接口请求体', '标准 JSON', '应该使用标准 JSON'],
            ],
          },
          { type: 'heading', level: 2, text: '把 JSONC / JSON5 转成标准 JSON 的步骤' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先解析宽松语法，确认内容能被 JSONC 或 JSON5 解析器理解。',
              '移除注释、尾逗号，补齐未加引号的 key。',
              '把单引号字符串转换成双引号字符串。',
              '检查是否存在 NaN、Infinity、undefined 这类标准 JSON 不支持的值。',
              '最后用标准 JSON 校验器再验证一遍。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候用哪一个？' },
          {
            type: 'list',
            items: [
              '接口请求和响应：使用标准 JSON。',
              '需要给人读的配置文件：可以考虑 JSONC，但要确认工具链支持。',
              '希望写法更像 JavaScript：可以用 JSON5，但不适合直接发给普通 API。',
              '要发送给后端、数据库或第三方系统：先转换成标准 JSON。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON 工具',
            text: '可以格式化 JSON / JSONC / JSON5 风格内容，也可以用修复清洗工具把非标准语法输出为标准 JSON。',
            href: '/json-format',
            linkLabel: '打开 JSON 格式化',
          },
        ],
        faq: [
          {
            question: "为什么 JSON 里不能写单引号字符串？",
            answer: "JSON 规范（RFC 8259）明确要求字符串必须用双引号包裹。这不是随意决定，而是为了让规则最简单、跨语言解析器行为一致。单引号在很多编程语言里也是合法字符串边界，但每种语言处理方式略有不同（Python 双引号和单引号等价，但 Java、C# 只能用双引号；JavaScript 里两者都行）。JSON 只允许双引号避免了这些差异。JSON5 允许单引号是因为它面向 JavaScript 开发者、优先考虑手写便利；一旦传给后端接口，就必须转成标准双引号 JSON。",
          },
          {
            question: "JSON 里可以用 NaN、Infinity 表示特殊数值吗？",
            answer: "不可以。标准 JSON 只允许有限的实数字面量（0、1、-3.14、1e10 等），不允许 NaN、Infinity、-Infinity 这些 IEEE 754 特殊值，也不允许 undefined。JavaScript 里 JSON.stringify(NaN) 会输出 null，就是为了保证结果符合规范。如果数据里确实有 NaN、Infinity（比如科学计算、机器学习结果），常见做法：一是转成 null；二是转成字符串 \"NaN\"、\"Infinity\"，前端解析时特殊处理；三是用一个约定的极大值代替 Infinity。JSON5 允许这些值，但发到普通 API 前必须处理。",
          },
          {
            question: "tsconfig.json 里能写注释，那我在项目的 .json 文件里也能写注释吗？",
            answer: "不能一概而论。tsconfig.json、VS Code 的 settings.json、部分 launch.json 之所以能有注释，是因为 TypeScript 工具链和 VS Code 使用 JSONC 解析器读取它们，这是特殊约定，不是 JSON 规范的一部分。如果你自己项目里的 config.json 被 JavaScript 的 JSON.parse、Python 的 json.loads、Java 的 Jackson 等标准库读取，注释会直接导致解析失败。想在配置文件里写注释，有几个选择：换成 JSONC 并用兼容的解析库（如 jsonc-parser）、换成 YAML/TOML、或者把注释放在文件外的 README 里。",
          },
          {
            question: "尾逗号（trailing comma）为什么在有些解析器里能过，在有些里不能过？",
            answer: "标准 JSON 严格禁止尾逗号——[1, 2, 3,] 或 {\"a\":1,} 都是非法的。但 JavaScript 语言允许尾逗号，所以 V8、SpiderMonkey 等 JS 引擎的宽松模式和 JSON5 都接受。Python 的 json 库、Java 的 Gson、Go 的 encoding/json 严格执行标准，遇到尾逗号直接报错。开发时你可能在浏览器控制台粘贴带尾逗号的 JSON 能解析，但发给后端就报错，就是这个原因。写标准 JSON 时删掉所有尾逗号，或者用格式化工具自动清理。",
          },
          {
            question: "JSON5 和 JSONC 到底该选哪个？",
            answer: "取决于用途。JSONC 更保守，只加了注释，其他语法基本和 JSON 一样，适合给现有 JSON 文件加人工说明（配置文件、示例数据）。JSON5 更激进，允许单引号、尾逗号、未加引号的 key、多行字符串、十六进制数字等，写起来接近 JavaScript 对象字面量，适合手写数据比较多、工具链自己控制的场景（Babel 配置、Rollup 配置）。如果你只需要注释支持，选 JSONC；如果你觉得双引号和引号 key 太啰嗦，选 JSON5。但两者都不能直接发给 API，必须转成标准 JSON。",
          },
        ],
      },
      en: {
        title: 'JSON vs JSONC vs JSON5: A Complete Guide',
        excerpt: 'JSON is strict data interchange, JSONC adds comments mainly for config files, and JSON5 allows more JavaScript-like syntax.',
        metaTitle: 'JSON vs JSONC vs JSON5: Syntax, Compatibility, and Use Cases',
        metaDescription: 'A complete JSON vs JSONC vs JSON5 comparison covering comments, commas, quotes, parser compatibility, configuration use cases, and conversion.',
        readingTime: '9 min read',
        tags: ['JSON', 'JSON5', 'JSONC', 'configuration'],
        relatedTools: [
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and validate JSON / JSONC / JSON5-like content.',
          },
          {
            label: 'JSON Repair',
            href: '/json-repair',
            description: 'Clean comments, trailing commas, single quotes, and other non-standard syntax into standard JSON.',
          },
          {
            label: "Regex Tester",
            href: "/regex",
            description: "Validate your comment/trailing-comma cleanup regex before running it across configs.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSON, JSONC, and JSON5 look similar, but they are not interchangeable. Mixing them is a common cause of parser errors.',
          },
          { type: 'code', language: 'json5', code: jsonVariantsExample },
          { type: 'heading', level: 2, text: 'Core Differences' },
          {
            type: 'table',
            headers: ['Format', 'Standard JSON?', 'Main trait'],
            rows: [
              ['JSON', 'Yes', 'Strict and widely supported for APIs and data exchange'],
              ['JSONC', 'No', 'Common for config files, allows comments, stays close to JSON'],
              ['JSON5', 'No', 'More JavaScript-like, allows single quotes, trailing commas, unquoted keys, and more'],
            ],
          },
          { type: 'heading', level: 2, text: 'Why Do APIs Usually Require Standard JSON?' },
          {
            type: 'paragraph',
            text: 'APIs, databases, queues, and third-party platforms need data that can be parsed consistently across languages such as JavaScript, Java, Go, Python, and Rust. Standard JSON has fewer rules and fewer ambiguous edge cases.',
          },
          {
            type: 'list',
            items: [
              'Comments are not data and have no shared meaning in API payloads.',
              'Trailing commas, single quotes, and unquoted keys are supported inconsistently across parsers.',
              'NaN and Infinity are not standard JSON values and are often rejected by backends.',
              'Config files can optimize for humans; API payloads should optimize for stable machine parsing.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why Can tsconfig.json Contain Comments?' },
          {
            type: 'paragraph',
            text: 'Many developers first notice comments in tsconfig.json and wonder why a .json file can contain //. TypeScript reads that file with JSONC-like rules, which is not the same as ordinary JSON parsing for API payloads.',
          },
          {
            type: 'table',
            headers: ['File or case', 'Common format', 'Can you send it to a normal API?'],
            rows: [
              ['tsconfig.json', 'JSONC-style config', 'Do not assume so'],
              ['VS Code settings.json', 'JSONC-style config', 'Do not assume so'],
              ['package.json', 'Standard JSON', 'Usually yes'],
              ['API request body', 'Standard JSON', 'Should be standard JSON'],
            ],
          },
          { type: 'heading', level: 2, text: 'How to Convert JSONC / JSON5 to Standard JSON' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Parse the loose syntax and confirm that a JSONC or JSON5 parser understands it.',
              'Remove comments and trailing commas, and quote unquoted keys.',
              'Convert single-quoted strings to double-quoted JSON strings.',
              'Check for unsupported values such as NaN, Infinity, and undefined.',
              'Validate the final output with a strict JSON validator.',
            ],
          },
          { type: 'heading', level: 2, text: 'Which One Should You Use?' },
          {
            type: 'list',
            items: [
              'For API requests and responses, use standard JSON.',
              'For human-maintained config files, JSONC can work when the toolchain supports it.',
              'For JavaScript-like authoring convenience, JSON5 can be useful but is not accepted by ordinary JSON APIs.',
              'Before sending data to a backend, database, or third-party system, convert to standard JSON.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON Tools',
            text: 'Format JSON / JSONC / JSON5-like content, or clean non-standard syntax into standard JSON.',
            href: '/json-format',
            linkLabel: 'Open JSON Formatter',
          },
        ],
        faq: [
          {
            question: "Why doesn't JSON allow single-quoted strings?",
            answer: "The JSON spec (RFC 8259) requires strings to be wrapped in double quotes. This is not arbitrary — it keeps the rules minimal and cross-language parsers consistent. Single quotes are also valid string delimiters in many languages, but each language handles them slightly differently (Python treats both as equivalent; Java and C# only use double quotes; JavaScript accepts both). Restricting JSON to double quotes avoids all that ambiguity. JSON5 allows single quotes because it targets JavaScript developers and prioritizes hand-writing convenience, but any API-bound JSON must use double quotes.",
          },
          {
            question: "Can I use NaN or Infinity in JSON?",
            answer: "No. Standard JSON only allows finite number literals (0, 1, -3.14, 1e10), not IEEE 754 special values like NaN, Infinity, -Infinity, or undefined. JavaScript's JSON.stringify(NaN) returns null on purpose, to keep output valid. If your data legitimately has NaN or Infinity (scientific computing, ML output), common workarounds are: convert them to null; convert to string sentinels like \"NaN\" and \"Infinity\" and handle on the frontend; or replace Infinity with an agreed-upon large value. JSON5 accepts these values, but you must normalize before sending to a standard API.",
          },
          {
            question: "tsconfig.json allows comments — can I put comments in my project's .json files too?",
            answer: "It depends. tsconfig.json, VS Code's settings.json, and some launch.json files support comments because TypeScript and VS Code read them with a JSONC parser — a special convention, not part of the JSON spec. If your own project's config.json is parsed by JavaScript's JSON.parse, Python's json.loads, or Java's Jackson, comments cause parse errors immediately. To use comments in config, pick a JSONC-aware parser like jsonc-parser, switch to YAML or TOML, or keep comments in a separate README.",
          },
          {
            question: "Why do trailing commas work in some parsers but not others?",
            answer: "Standard JSON strictly forbids trailing commas: [1, 2, 3,] and {\"a\":1,} are invalid. JavaScript itself allows trailing commas, so V8, SpiderMonkey, and lenient modes plus JSON5 accept them. Python's json module, Java's Gson, and Go's encoding/json enforce the spec and reject them. That is why pasting a JSON with a trailing comma into a browser console works, while the same string sent to a backend fails. When writing standard JSON, remove all trailing commas or use a formatter to clean them up automatically.",
          },
          {
            question: "Should I use JSON5 or JSONC?",
            answer: "Depends on the use case. JSONC is conservative — it only adds comments, keeps everything else close to JSON, and fits existing JSON files that need human annotations (configs, sample data). JSON5 is more aggressive, allowing single quotes, trailing commas, unquoted keys, multi-line strings, and hex numbers, feeling closer to a JavaScript object literal. It suits hand-written data files where your own toolchain controls parsing (Babel config, Rollup config). If you only need comments, use JSONC. If double quotes and quoted keys feel too noisy, use JSON5. Either way, always convert to standard JSON before hitting an API.",
          },
        ],
      },
    },
  },
  {
    slug: 'convert-word-excel-ppt-image-to-pdf-free',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '如何免费把 Word / Excel / PPT / 图片 转成 PDF',
        excerpt: '把文档和图片转成 PDF，适合归档、提交材料和跨设备查看。浏览器本地转换适合快速处理常见格式。',
        metaTitle: '如何免费把 Word / Excel / PPT / 图片 转成 PDF',
        metaDescription: '介绍 Word、Excel、PPT、图片、TXT、Markdown、HTML 转 PDF 的常见流程、浏览器本地转换原理、格式限制和导出检查建议。',
        readingTime: '约 9 分钟阅读',
        tags: ['转 PDF', 'Word 转 PDF', 'Excel 转 PDF', '图片转 PDF'],
        relatedTools: [
          {
            label: '转为 PDF',
            href: '/pdf/to-pdf',
            description: '将 Word、Excel、PowerPoint、图片、TXT、Markdown、HTML 等格式转换为 PDF。',
          },
          {
            label: '图片合并长图',
            href: '/file-merge/images',
            description: '多张图片可以拼成长图 PNG，也可以合成为 PDF。',
          },
          {
            label: "PDF 加水印",
            href: "/pdf/watermark",
            description: "生成 PDF 之后，直接给它加上文字水印，避免二次上传。",
          },
          {
            label: "PDF 加密 / 解密",
            href: "/pdf/encrypt",
            description: "给敏感 PDF 加密码后再对外分享。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'PDF 的优势是版式相对稳定，适合提交、归档和跨设备查看。在线转换时，最重要的是理解原格式能保留到什么程度。',
          },
          { type: 'heading', level: 2, text: '哪些格式适合转 PDF？' },
          {
            type: 'table',
            headers: ['输入格式', '适合场景', '注意事项'],
            rows: [
              ['Word DOCX', '文字文档、说明、报告', '复杂排版可能需要复查'],
              ['Excel XLSX / XLS', '表格归档、数据快照', '宽表可能分页较多'],
              ['PowerPoint PPTX', '演示内容归档', '动画和复杂布局不一定保留'],
              ['JPG / PNG / WebP', '证件照、扫描件、图片合集', '注意图片方向和清晰度'],
              ['TXT / Markdown / HTML', '文本内容归档', '先检查换行和标题层级'],
            ],
          },
          { type: 'heading', level: 2, text: '不同格式转换 PDF 的风险不同' },
          {
            type: 'paragraph',
            text: 'PDF 转换不是简单改后缀，而是把原文件重新排版成固定页面。Word 更关注字体和段落，Excel 更关注分页和表格宽度，PPT 更关注幻灯片比例，图片则更关注方向、尺寸和清晰度。',
          },
          {
            type: 'table',
            headers: ['来源', '最容易出问题的地方', '建议'],
            rows: [
              ['Word', '缺字体、页眉页脚、复杂表格', '导出后检查目录、页码和表格边界'],
              ['Excel', '列太宽、分页过多、隐藏 Sheet', '先设置打印区域或只保留需要的表'],
              ['PPT', '动画、视频、特殊字体', '把它当成静态页面归档，不依赖动画'],
              ['图片', '方向错误、过大、压缩后模糊', '先旋转和压缩，再合成 PDF'],
              ['HTML / Markdown', '样式差异、分页位置', '检查标题层级和代码块换行'],
            ],
          },
          { type: 'heading', level: 2, text: '浏览器本地转换适合什么场景？' },
          {
            type: 'paragraph',
            text: '浏览器本地转换的好处是文件不需要上传，适合临时归档、轻量文档、图片合集和内部材料。它不适合完全替代专业排版软件：如果文件包含复杂字体、宏、嵌入对象、公式或大量图表，导出后最好人工复查。',
          },
          {
            type: 'list',
            items: [
              '隐私敏感文件：优先选择本地处理，减少上传风险。',
              '正式提交材料：导出后用阅读器打开检查页面。',
              '扫描件或图片合集：先统一方向和尺寸，再转 PDF。',
              '体积过大：先压缩图片或拆分文档，再上传平台。',
            ],
          },
          { type: 'heading', level: 2, text: '转换后要检查什么？' },
          {
            type: 'list',
            items: [
              '页数是否符合预期。',
              '表格是否被过度截断或分页。',
              '图片方向是否正确。',
              '文字是否有乱码或丢行。',
              '文件大小是否适合上传平台限制。',
            ],
          },
          { type: 'heading', level: 2, text: '转成 PDF 后还可以做什么？' },
          {
            type: 'paragraph',
            text: 'PDF 生成后，常见后续操作包括合并、拆分、提取页面和重新排序。例如把多张图片转成一个 PDF 后，可以和 Word 导出的 PDF 合并；如果平台只需要某几页，也可以再提取页面。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 转为 PDF',
            text: '支持常见 Office、图片和文本格式转 PDF。当前浏览器版本更适合快速归档和轻量转换，复杂排版建议导出后复查。',
            href: '/pdf/to-pdf',
            linkLabel: '打开转为 PDF',
          },
        ],
        faq: [
          {
            question: "在线转 PDF 和本地用 Microsoft Word 导出 PDF 有什么区别？",
            answer: "Word 桌面版“导出为 PDF”使用微软自家的排版引擎，字体、页面布局、目录、表格边框基本能 1:1 保留，尤其是复杂样式（多级列表、脚注、SmartArt、公式）。在线转换工具用的是开源库（LibreOffice、pdf-lib、pdfmake 等），排版引擎不同，遇到复杂样式可能出现字体替换、目录页码错位、表格换行等问题。规则是：日常文档、简历、通知、简单报告在线转就够用；正式合同、有严格排版要求的论文、包含公式和图表的技术文档，用 Word 本地导出更稳。",
          },
          {
            question: "Excel 转 PDF 后表格被切成好几页，怎么让它挤在一页里？",
            answer: "问题在 Excel 的“页面布局”设置，不是转换工具的问题。Excel 里选择“页面布局 → 缩放 → 将整个工作表调整为一页”，或者手动设置“1 页宽 × 无限高”让宽度不切分。也可以在“页面布局 → 打印区域”里只选中需要的部分，避免连空白列都被打印。表格太宽时改成 A3 或横向纸张也能改善。设置好之后再上传到转 PDF 工具，输出就是你在 Excel 打印预览里看到的样子。",
          },
          {
            question: "PPT 转 PDF 后动画和视频消失是正常的吗？",
            answer: "正常。PDF 是静态文档格式，无法承载动画、切换效果、内嵌视频或音频。PPT 转 PDF 时，每一张幻灯片会被渲染成一个静态页面——文字、图片、图表都能保留，但动画会消失，视频会被替换成一张封面图或空白。如果需要动态演示，导出为 MP4 视频更合适；如果只是归档存底或分享讲义，PDF 完全够用。转换前记得把 PPT 里的备注（notes）也考虑上——有些工具支持导出成含备注的 PDF，有些不支持。",
          },
          {
            question: "多张图片合并成 PDF 时怎么控制每页大小和方向？",
            answer: "合并工具通常有几个选项：一是“按图片实际尺寸生成页面”，每页大小等于图片大小，适合扫描件；二是“统一 A4/Letter”，把所有图片缩放放入统一尺寸，适合正式提交；三是“自动横竖向”，横图用横向页面、竖图用竖向页面。选错了会导致图片被过度压缩或大量留白。ToolGarden 图片合并支持这些模式。合并前先统一图片方向（把倒置的转正）、统一分辨率（避免有的很清晰有的很糊）、按顺序命名（01.jpg、02.jpg），合成质量会好很多。",
          },
          {
            question: "转 PDF 之后文件太大，怎么压缩又不明显掉画质？",
            answer: "PDF 体积主要来自嵌入的图片和字体。压缩方法有几种：一是图片压缩，用工具把 PDF 中的图片重新编码为 JPG 并降低质量（把 100% 降到 70% 通常肉眼看不出差异，但体积能减一半）；二是子集嵌入字体，只嵌入用到的字符而不是整个字库；三是删除冗余的元数据、注释、旧版本层。ToolGarden 后续会推出 PDF 压缩工具。如果只是要发邮件或上传，转前先把 Word/Excel 里的图片压缩一遍，效果更明显。",
          },
        ],
      },
      en: {
        title: 'How to Convert Word, Excel, PowerPoint, and Images to PDF for Free',
        excerpt: 'PDF is useful for archiving, submissions, and cross-device viewing. Browser-local conversion is convenient for common document and image formats.',
        metaTitle: 'Convert Word, Excel, PowerPoint, and Images to PDF for Free',
        metaDescription: 'Learn how Word, Excel, PowerPoint, images, TXT, Markdown, and HTML can be converted to PDF, plus format limitations and output checks.',
        readingTime: '9 min read',
        tags: ['convert to PDF', 'Word to PDF', 'Excel to PDF', 'image to PDF'],
        relatedTools: [
          {
            label: 'Convert to PDF',
            href: '/pdf/to-pdf',
            description: 'Convert Word, Excel, PowerPoint, images, TXT, Markdown, HTML, and more to PDF.',
          },
          {
            label: 'Merge Images',
            href: '/file-merge/images',
            description: 'Combine multiple images into a long PNG or a PDF.',
          },
          {
            label: "PDF Watermark",
            href: "/pdf/watermark",
            description: "After generating the PDF, add a text watermark without re-uploading.",
          },
          {
            label: "PDF Encrypt / Decrypt",
            href: "/pdf/encrypt",
            description: "Password-protect sensitive PDFs before sharing externally.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'PDF keeps layout relatively stable, which makes it useful for submissions, archives, and cross-device viewing.',
          },
          { type: 'heading', level: 2, text: 'Which Formats Work Well?' },
          {
            type: 'table',
            headers: ['Input format', 'Best for', 'Watch out for'],
            rows: [
              ['Word DOCX', 'Reports and text documents', 'Complex layouts need review'],
              ['Excel XLSX / XLS', 'Table snapshots and archives', 'Wide sheets may create many pages'],
              ['PowerPoint PPTX', 'Deck archives', 'Animations and complex layouts may not be preserved'],
              ['JPG / PNG / WebP', 'Scans and image collections', 'Check orientation and clarity'],
              ['TXT / Markdown / HTML', 'Text archives', 'Check line breaks and headings'],
            ],
          },
          { type: 'heading', level: 2, text: 'Different Formats Have Different PDF Risks' },
          {
            type: 'paragraph',
            text: 'PDF conversion is not just changing a file extension. The source file is rendered into fixed pages. Word is sensitive to fonts and paragraphs, Excel to page breaks and sheet width, PowerPoint to slide ratio, and images to orientation, size, and clarity.',
          },
          {
            type: 'table',
            headers: ['Source', 'Common risk', 'Suggestion'],
            rows: [
              ['Word', 'Missing fonts, headers, footers, complex tables', 'Check table boundaries, page numbers, and headings'],
              ['Excel', 'Wide columns, too many pages, hidden sheets', 'Set a print area or keep only needed sheets'],
              ['PowerPoint', 'Animations, videos, special fonts', 'Treat output as a static archive'],
              ['Images', 'Wrong orientation, huge pages, blurry compression', 'Rotate and resize before PDF export'],
              ['HTML / Markdown', 'Style differences and page breaks', 'Check headings and code block wrapping'],
            ],
          },
          { type: 'heading', level: 2, text: 'When Is Browser-Local Conversion a Good Fit?' },
          {
            type: 'paragraph',
            text: 'Browser-local conversion keeps files on your device, which is useful for temporary archives, lightweight documents, image collections, and internal material. It is not a full replacement for professional layout software when a file depends on complex fonts, macros, embedded objects, formulas, or charts.',
          },
          {
            type: 'list',
            items: [
              'For sensitive files, local processing reduces upload exposure.',
              'For formal submissions, open the exported PDF and inspect every important page.',
              'For scans and image sets, normalize orientation and size before conversion.',
              'For large files, compress images or split documents before uploading to a platform.',
            ],
          },
          { type: 'heading', level: 2, text: 'What to Check After Conversion' },
          {
            type: 'list',
            items: [
              'Does the page count match expectations?',
              'Are tables split or clipped?',
              'Are image orientations correct?',
              'Is any text missing or garbled?',
              'Is the file size accepted by the upload platform?',
            ],
          },
          { type: 'heading', level: 2, text: 'What Can You Do After Creating the PDF?' },
          {
            type: 'paragraph',
            text: 'After export, common next steps include merging, splitting, extracting pages, and reordering pages. For example, you can convert several images into one PDF, merge it with a Word-exported PDF, then extract only the required pages for submission.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Convert to PDF',
            text: 'Convert common Office, image, and text formats to PDF locally in the browser. Review complex layouts after export.',
            href: '/pdf/to-pdf',
            linkLabel: 'Open Convert to PDF',
          },
        ],
        faq: [
          {
            question: "How does online PDF conversion compare to exporting from Microsoft Word?",
            answer: "Word's desktop \"Export as PDF\" uses Microsoft's own layout engine, so fonts, page layout, tables of contents, and table borders are preserved almost exactly — especially for complex styles like multi-level lists, footnotes, SmartArt, and equations. Online tools use open-source libraries (LibreOffice, pdf-lib, pdfmake), and complex styling can show font substitution, TOC page-number drift, or table wrapping. Rule of thumb: everyday documents, resumes, notices, and simple reports convert fine online. Formal contracts, precisely formatted papers, and technical documents with equations and charts are safer with Word's native export.",
          },
          {
            question: "My Excel table splits across multiple pages in the PDF — how do I fit it on one page?",
            answer: "The issue is Excel's page layout settings, not the converter. In Excel, go to Page Layout > Scale and choose \"Fit sheet on one page,\" or set \"1 page wide by unlimited tall\" so width does not split. You can also set the Print Area to just the needed range so blank columns are excluded. For very wide tables, switching to A3 or landscape orientation helps. Once the print preview in Excel looks right, uploading to a converter reproduces exactly that layout.",
          },
          {
            question: "Is it normal for animations and videos to disappear when PowerPoint becomes PDF?",
            answer: "Yes. PDF is a static document format and cannot carry animation, slide transitions, embedded video, or audio. During conversion, each slide is rendered as one static page — text, images, and charts survive, but animations vanish and videos are replaced by a poster frame or blank. For dynamic delivery, export to MP4 instead. For archiving or handouts, PDF is fine. Also decide whether to include speaker notes: some tools support notes-included PDF export, others do not.",
          },
          {
            question: "When combining images into a PDF, how do I control page size and orientation?",
            answer: "Merge tools usually offer several modes: match each page to the image's actual size (great for scans); force a uniform A4 or Letter and scale images to fit (good for formal submissions); or auto-orient (landscape image → landscape page, portrait → portrait). The wrong choice causes excessive compression or lots of whitespace. Before merging, normalize orientation (rotate upside-down images), align resolutions (avoid mixing crisp and blurry pages), and name files in reading order (01.jpg, 02.jpg). The output quality improves a lot.",
          },
          {
            question: "The PDF is too big — how do I compress it without obvious quality loss?",
            answer: "PDF size mostly comes from embedded images and fonts. Options: re-encode images as JPG at lower quality (dropping from 100% to 70% is usually invisible but halves size); subset fonts to include only used characters; strip redundant metadata, annotations, and old revision layers. ToolGarden will add a PDF compression tool later. If you just need to email or upload, compressing images inside the source Word or Excel before conversion often yields the biggest gains.",
          },
        ],
      },
    },
  },
  {
    slug: 'merge-multiple-pdf-files-keep-order-bookmarks',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-20',
    translations: {
      zh: {
        title: '如何在不上传文件的情况下合并 PDF：隐私优先方法',
        excerpt: '在浏览器本地合并多个 PDF，避免上传源文件，同时检查页面顺序、书签、表单、签名和最终结果。',
        metaTitle: '无需上传合并 PDF：隐私优先的本地合并指南',
        metaDescription: '学习如何在浏览器本地合并 PDF，无需上传文件，并检查顺序、书签、表单、数字签名、元数据与输出完整性。',
        readingTime: '约 10 分钟阅读',
        tags: ['合并 PDF', 'PDF 顺序', 'PDF 书签', 'PDF 工具'],
        relatedTools: [
          {
            label: '合并 PDF',
            href: '/pdf/merge',
            description: '上传多个 PDF，拖放重新排序后合并成一个文档。',
          },
          {
            label: '整理 PDF',
            href: '/pdf/organize',
            description: '需要重新排序、复制或删除页面时，可以整理后再导出。',
          },
          {
            label: "PDF 加水印",
            href: "/pdf/watermark",
            description: "合并完的 PDF 一键统一加水印，保证每一页都有版权标识。",
          },
          {
            label: "PDF 加密 / 解密",
            href: "/pdf/encrypt",
            description: "合并后马上给整份文档加密码，保护合约、内部资料等敏感内容。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '合并多个 PDF 的第一目标是保留页面顺序。书签和目录属于 PDF 的附加结构，不同工具支持情况不同。',
          },
          { type: 'heading', level: 2, text: '推荐合并流程' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先按最终阅读顺序给文件命名，例如 01-cover、02-contract。',
              '上传所有 PDF 后检查页数。',
              '拖放调整文件顺序。',
              '合并后打开结果，检查第一页、最后一页和章节边界。',
              '如果源 PDF 有书签、表单或注释，导出后单独复查。',
            ],
          },
          { type: 'heading', level: 2, text: '合并前如何避免顺序出错？' },
          {
            type: 'paragraph',
            text: 'PDF 合并最常见的问题不是工具失败，而是文件顺序放错。尤其是合同、附件、发票和扫描件混在一起时，建议先用文件名或页码规则确认顺序，再上传到工具中调整。',
          },
          {
            type: 'table',
            headers: ['场景', '推荐排序方式', '检查点'],
            rows: [
              ['合同和附件', '主合同在前，附件按编号排列', '章节边界和签字页位置'],
              ['发票和凭证', '按日期或报销单顺序排列', '金额页和说明页是否成对出现'],
              ['扫描件', '按扫描顺序或页码排序', '是否有倒置、空白页或重复页'],
              ['课程资料', '封面、目录、章节、练习顺序', '目录页是否指向正确内容'],
            ],
          },
          { type: 'heading', level: 2, text: '关于书签保留' },
          {
            type: 'paragraph',
            text: '有些 PDF 合并方式只复制页面内容，不会完整合并原文件的书签树、目录、表单动作或复杂交互。对于正式文档，建议把书签保留当成导出后必须检查的项目。',
          },
          {
            type: 'paragraph',
            text: '书签本质上是 PDF 的导航结构，和页面内容不是同一层东西。两个文件合并后，原书签的目标页码可能需要重算；如果工具没有处理这些目标，书签可能丢失、跳错页，或者只保留其中一个文件的目录。',
          },
          { type: 'heading', level: 2, text: '哪些 PDF 结构需要额外检查？' },
          {
            type: 'list',
            items: [
              '表单字段：同名字段合并后可能互相影响。',
              '批注和高亮：有些工具只保留页面外观，不保留可编辑批注。',
              '附件和嵌入文件：合并页面不一定合并附件。',
              '加密或受保护 PDF：可能需要先解除限制或输入密码。',
              '数字签名：合并通常会破坏原签名的完整性。',
            ],
          },
          { type: 'heading', level: 2, text: '为什么选择无需上传的合并流程' },
          {
            type: 'paragraph',
            text: '合同、发票、申请材料和扫描件可能包含身份信息、签名或商业条款。浏览器本地合并可以避免把源文件交给远端任务队列、临时存储、日志或第三方 PDF 接口。它减少的是一次不必要的数据传输，但仍要信任页面来源、浏览器和设备。',
          },
          {
            type: 'list',
            items: [
              '用无敏感信息样本配合 Network 面板验证没有文件上传请求。',
              '在开始前复制源文件，不直接覆盖原件。',
              '合并后检查文档属性、附件、批注和可搜索文本。',
              '高度受监管材料仍应遵循组织批准的软件与流程。',
            ],
          },
          { type: 'heading', level: 2, text: '导出后快速验收' },
          {
            type: 'list',
            ordered: true,
            items: [
              '确认总页数等于所有源 PDF 页数之和。',
              '检查每个文件接缝处的前后两页。',
              '打开书签面板，确认目录能跳到正确位置。',
              '搜索一个关键词，确认文本层仍可检索。',
              '把最终文件另存一份，避免覆盖源文件。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 合并 PDF',
            text: '可以上传多个 PDF，拖放调整顺序，并在浏览器本地合并导出。当前重点是页面顺序和页面内容合并，书签类结构建议导出后复查。',
            href: '/pdf/merge',
            linkLabel: '打开合并 PDF',
          },
        ],
        faq: [
          {
            question: "合并 PDF 时能保留每个源文件的书签目录吗？",
            answer: "取决于合并工具。基础合并只复制页面，源文件的书签树可能全部丢失，或者只保留第一个文件的目录，其他被忽略。专业 PDF 库（如 pdf-lib、iText、Adobe Acrobat）支持合并书签——把每个源文件的书签作为一个顶级节点插入结果 PDF，形成“合同 → 附件 A → 附件 B”这样的层级。ToolGarden 合并 PDF 目前以页面顺序为主，正式文档需要目录导航时，导出后建议用 Acrobat 或专业工具补一次。",
          },
          {
            question: "合并后 PDF 有部分页面变模糊或者颜色变了，为什么？",
            answer: "常见原因有两个：一是源 PDF 里图片使用了 CMYK 色彩空间，合并时被转成 RGB，颜色可能偏移；二是工具对图片进行了重新编码或降采样，尤其是扫描件或大图 PDF，为了控制输出体积会自动压缩。避免方法：合并前统一色彩空间（都转 RGB 或都保持 CMYK）、选择保留原始图片质量的合并选项（如果工具支持）、或者先合并再单独优化。如果对印刷质量敏感（比如画册、样本），最好用专业软件而不是浏览器工具。",
          },
          {
            question: "合并加密的 PDF 会有什么问题？",
            answer: "加密 PDF 分两种：一种只有查看密码（打开就要密码），另一种有编辑/打印限制但可以直接看。带查看密码的 PDF 必须先输入密码解锁才能合并，工具在处理时会要求你输入。带限制的 PDF 通常需要先解除限制——但注意，这里的“限制”是 PDF 制作者设置的软限制，工具能否解除、是否合法要看具体场景。合并加密源 PDF 后，结果通常不再有加密，等于把原来的保护移除了。如果需要保留保护，合并后手动重新加密结果。",
          },
          {
            question: "带数字签名的 PDF 合并后签名还有效吗？",
            answer: "不会。数字签名的原理是对 PDF 的内容和结构做哈希，然后用私钥签名。任何修改（哪怕加一页空白）都会让哈希变化，签名验证失败。合并操作本质上是重新生成一个新 PDF 文件，原签名一定失效。因此正式的签名合同不建议合并——需要合并时，先把签名文件保留一份原件，合并后的版本只作为参考。如果合并结果本身需要签名，用 Adobe Sign、DocuSign 等工具在合并后重新签署。",
          },
          {
            question: "为什么合并了 10 个 PDF，结果文件比 10 个源文件相加还大？",
            answer: "有几种可能：一是每个源 PDF 里嵌入了相同的字体（比如都嵌了思源黑体），合并时如果工具没做字体去重，就变成嵌了 10 份；二是每个 PDF 都有元数据、XMP、版本历史信息，合并保留了全部；三是工具没有优化最终结构，冗余对象没有删除。ToolGarden 后续会加入 PDF 优化步骤。如果结果体积异常大，可以用 PDF 压缩工具或者 qpdf --linearize、Ghostscript 等命令行工具做一次优化，通常能减小 20% 到 50%。",
          },
        ],
      },
      en: {
        title: 'How to Merge PDFs Without Uploading Files: A Privacy-First Approach',
        excerpt: 'Merge multiple PDFs locally in your browser without uploading source files, then verify page order, bookmarks, forms, signatures, and output.',
        metaTitle: 'Merge PDFs Without Uploading: A Privacy-First Local Guide',
        metaDescription: 'Learn how to merge PDFs locally without uploading files, then check page order, bookmarks, forms, digital signatures, metadata, and completeness.',
        readingTime: '10 min read',
        tags: ['merge PDF', 'PDF order', 'PDF bookmarks', 'PDF tools'],
        relatedTools: [
          {
            label: 'Merge PDF',
            href: '/pdf/merge',
            description: 'Upload multiple PDFs, reorder them, and merge them into one document.',
          },
          {
            label: 'Organize PDF',
            href: '/pdf/organize',
            description: 'Reorder, duplicate, or delete pages before exporting a new PDF.',
          },
          {
            label: "PDF Watermark",
            href: "/pdf/watermark",
            description: "Apply a uniform watermark to the merged PDF so every page carries the same mark.",
          },
          {
            label: "PDF Encrypt / Decrypt",
            href: "/pdf/encrypt",
            description: "Encrypt the merged document to protect contracts or internal materials.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The first goal of PDF merging is preserving page order. Bookmarks and outlines are extra PDF structures, and support varies by tool.',
          },
          { type: 'heading', level: 2, text: 'Recommended Workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Name files in final reading order, such as 01-cover and 02-contract.',
              'Upload all PDFs and check page counts.',
              'Drag files into the correct order.',
              'Open the merged result and inspect the first page, last page, and chapter boundaries.',
              'If source PDFs have bookmarks, forms, or annotations, review them after export.',
            ],
          },
          { type: 'heading', level: 2, text: 'How to Avoid Order Mistakes Before Merging' },
          {
            type: 'paragraph',
            text: 'The most common merge problem is not a failed export; it is the wrong file order. When contracts, attachments, invoices, and scans are mixed together, define the order with filenames or page rules before uploading.',
          },
          {
            type: 'table',
            headers: ['Case', 'Recommended order', 'Check'],
            rows: [
              ['Contracts and attachments', 'Main contract first, attachments by number', 'Chapter boundaries and signature pages'],
              ['Invoices and receipts', 'By date or reimbursement order', 'Amounts and explanation pages stay paired'],
              ['Scans', 'By scan order or page number', 'Upside-down, blank, or duplicate pages'],
              ['Course material', 'Cover, table of contents, chapters, exercises', 'Table of contents points to the right content'],
            ],
          },
          { type: 'heading', level: 2, text: 'About Bookmark Preservation' },
          {
            type: 'paragraph',
            text: 'Some PDF merge workflows copy page content but do not fully merge original outline trees, forms, actions, or complex interactions. For formal documents, always verify bookmarks after export.',
          },
          {
            type: 'paragraph',
            text: 'Bookmarks are a navigation structure, not the page content itself. After two files are merged, bookmark destinations may need page-number recalculation. If the tool does not update those destinations, bookmarks can disappear, jump to the wrong page, or only preserve one source outline.',
          },
          { type: 'heading', level: 2, text: 'PDF Structures That Need Extra Review' },
          {
            type: 'list',
            items: [
              'Forms: fields with the same name may conflict after merging.',
              'Comments and highlights: some workflows preserve appearance but not editable annotations.',
              'Attachments: merging pages does not always merge embedded files.',
              'Encrypted PDFs: restrictions or passwords may need to be handled first.',
              'Digital signatures: merging usually invalidates the original signature integrity.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why Use a No-Upload Merge Workflow' },
          {
            type: 'paragraph',
            text: 'Contracts, invoices, applications, and scans can contain identities, signatures, and commercial terms. Browser-local merging avoids sending source files through a remote queue, temporary store, log, or third-party PDF API. It removes an unnecessary transfer, but the page origin, browser, and device still need to be trusted.',
          },
          {
            type: 'list',
            items: [
              'Verify the workflow with a harmless sample and the Network panel.',
              'Work from copies and never overwrite the source documents.',
              'Inspect properties, attachments, annotations, and searchable text after merging.',
              'Use organization-approved software for highly regulated material.',
            ],
          },
          { type: 'heading', level: 2, text: 'Quick Validation After Export' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Confirm the total page count equals the sum of source page counts.',
              'Check the pages around every file boundary.',
              'Open the bookmark panel and test key destinations.',
              'Search for a keyword to confirm the text layer is still searchable.',
              'Save the merged file separately so source files stay untouched.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Merge PDF',
            text: 'Upload multiple PDFs, drag to reorder them, and merge locally in the browser. The current workflow focuses on page order and page content; review bookmark structures after export.',
            href: '/pdf/merge',
            linkLabel: 'Open Merge PDF',
          },
        ],
        faq: [
          {
            question: "Does the merged PDF keep every source file's bookmark outline?",
            answer: "It depends on the merge tool. A basic merge copies pages but may drop bookmarks entirely, or preserve only the first file's outline while ignoring the rest. Professional PDF libraries like pdf-lib, iText, and Adobe Acrobat support merging outlines — each source becomes a top-level node in the result, forming a hierarchy like Contract → Attachment A → Attachment B. ToolGarden Merge PDF currently prioritizes page order. For formal documents that need TOC navigation, run the export through Acrobat or a professional tool afterward.",
          },
          {
            question: "After merging, some pages look blurry or the colors shifted — why?",
            answer: "Two common causes. First, source PDFs may use CMYK color space, and the merge converts to RGB, causing hue shift. Second, the tool may re-encode or downsample images — especially scans or image-heavy PDFs — to control output size. To avoid this: normalize color space in advance (all RGB or all CMYK), choose a merge option that preserves original image quality if available, or merge first and optimize separately. For print-quality output like brochures or samples, use professional software rather than a browser tool.",
          },
          {
            question: "What problems come up when merging encrypted PDFs?",
            answer: "Encrypted PDFs come in two flavors: password-to-open, or permission-restricted but readable. Password-to-open files must be unlocked first, and the tool will prompt for the password. Permission-restricted files usually need restrictions removed before merging — but note these are soft restrictions set by the author, and whether a tool can remove them and whether it is legal depends on context. The merged result usually has no encryption, effectively removing the original protection. If you need protection preserved, re-encrypt manually after merging.",
          },
          {
            question: "Are digital signatures still valid after PDF merge?",
            answer: "No. Digital signatures work by hashing the PDF content and structure, then signing the hash with a private key. Any change — even adding a blank page — changes the hash and invalidates verification. Merging always produces a new PDF file, so original signatures always fail. For signed formal contracts, keep the signed original untouched and treat merged copies as reference only. If the merged result itself needs a signature, re-sign after merging using tools like Adobe Sign or DocuSign.",
          },
          {
            question: "I merged 10 PDFs and the result is bigger than all 10 combined — why?",
            answer: "Several possibilities. If each source embeds the same font (say Noto Sans SC), a merge tool that does not deduplicate ends up embedding it 10 times. Every source has metadata, XMP, and revision history that the merge may preserve in full. The tool may not compact the final structure, leaving redundant objects. ToolGarden will add an optimize step later. If the output feels bloated, run it through a PDF compressor or qpdf --linearize / Ghostscript, which typically shrink files by 20 to 50 percent.",
          },
        ],
      },
    },
  },
  {
    slug: 'split-pdf-by-pages-ranges-size',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '如何拆分 PDF：按页数、按范围、按大小',
        excerpt: 'PDF 拆分可以按每页导出、按页码范围导出，也可以通过拆成多个部分来满足平台大小限制。',
        metaTitle: '如何拆分 PDF：按页数、按范围、按大小',
        metaDescription: '介绍 PDF 按页拆分、按页码范围拆分、按大小限制拆分的思路，包含页码范围写法、导出检查和浏览器本地处理建议。',
        readingTime: '约 8 分钟阅读',
        tags: ['拆分 PDF', 'PDF 分割', '按页拆分', 'PDF 工具'],
        relatedTools: [
          {
            label: '拆分 PDF',
            href: '/pdf/split',
            description: '将 PDF 拆分为多个文档，支持按页面范围分割或每页导出。',
          },
          {
            label: '提取页面',
            href: '/pdf/extract-pages',
            description: '只需要某几页时，可以提取为一个新 PDF。',
          },
          {
            label: "PDF 转图片",
            href: "/pdf/to-image",
            description: "如果最终只是想把内容分享出去，直接把 PDF 每一页导出成 PNG/JPG 更方便。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '拆分 PDF 的关键是先决定目标：是每页一个文件、几个范围各一个文件，还是为了降低单个文件大小。',
          },
          { type: 'heading', level: 2, text: '三种常见拆分方式' },
          {
            type: 'table',
            headers: ['方式', '例子', '适合场景'],
            rows: [
              ['按每页拆分', '1、2、3 分别导出', '扫描件逐页提交'],
              ['按范围拆分', '1-3, 4-8, 9-12', '按章节或附件拆分'],
              ['按大小拆分', '控制每份低于上传限制', '平台限制 5MB、10MB 等'],
            ],
          },
          {
            type: 'paragraph',
            text: '严格按文件大小自动拆分通常需要先估算每页内容大小。图片页、扫描页和矢量文本页体积差异很大，所以更稳的方式是按范围拆分后检查每份大小。',
          },
          { type: 'heading', level: 2, text: '按大小拆分为什么不精确？' },
          {
            type: 'paragraph',
            text: 'PDF 每一页的体积差异可能很大：纯文字页可能只有几十 KB，扫描图片页可能有好几 MB。即使页数相同，两份拆分结果的大小也可能相差很多。因此“每份低于 10MB”通常需要拆分后再检查，必要时重新调整范围。',
          },
          {
            type: 'table',
            headers: ['页面类型', '体积特点', '拆分建议'],
            rows: [
              ['纯文字 PDF', '通常较小且稳定', '可以按章节范围拆分'],
              ['扫描件 PDF', '单页可能很大', '先少量页测试大小'],
              ['图片很多的报告', '图表页体积更大', '按图片密集章节拆开'],
              ['混合文档', '每页差异明显', '拆分后逐份检查文件大小'],
            ],
          },
          { type: 'heading', level: 2, text: '页码范围怎么写？' },
          {
            type: 'paragraph',
            text: '常见写法是 1-3,5,8-10，表示提取第 1 到 3 页、第 5 页、第 8 到 10 页。正式导出前先确认 PDF 页码和阅读器显示页码是否一致。',
          },
          {
            type: 'list',
            items: [
              '1-3 表示连续范围，包含第 1 页和第 3 页。',
              '1,3,5 表示只选择这几页。',
              '1-3,8-10 表示多个范围合并输出。',
              '如果阅读器显示罗马数字目录页，实际页码可能和显示页码不同。',
            ],
          },
          { type: 'heading', level: 2, text: '拆分后的文件怎么命名？' },
          {
            type: 'paragraph',
            text: '如果拆分结果要上传或发给别人，文件名要能说明内容和顺序。比如 contract-part-01.pdf、contract-part-02.pdf，比 split-1.pdf 更容易复查，也能避免上传时顺序错乱。',
          },
          { type: 'heading', level: 2, text: '什么时候应该用提取页面而不是拆分？' },
          {
            type: 'paragraph',
            text: '如果你只需要把第 2、5、9 页组成一个新文件，提取页面更合适；如果你要把一个大 PDF 拆成多个独立文件，拆分 PDF 更合适。两者都处理页码，但目标文件数量不同。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 拆分 PDF',
            text: '上传一个 PDF 后，可以按页码范围拆分，或把每一页导出为单独 PDF，并下载结果 ZIP。',
            href: '/pdf/split',
            linkLabel: '打开拆分 PDF',
          },
        ],
        faq: [
          {
            question: "PDF 拆分后每份文件反而变大了怎么办？",
            answer: "这通常是因为原 PDF 里嵌入了整套字体或大图，而每份拆分件都需要独立保留一份，字体不能像原文件那样只嵌一次。此外，如果原文件本身已经过压缩优化，拆分后的重新写入可能没有做同样级别的对象合并。真正影响体积的是「被拆走的页面上引用了多少共享资源」。要减小总体积，可以在拆分后依次做 PDF 压缩，或者按页面内容重新拆分（例如相邻章节合并成一份，而不是每 5 页固定切一次）。",
          },
          {
            question: "按大小拆分 PDF 是精确切到目标 MB 数吗？",
            answer: "并不是。PDF 是按对象组织的，页面之间的图片、字体经常共享同一份资源。工具的做法是「顺序累加页面，直到超过目标大小就切一刀」，所以最终每份可能略大或略小于目标值。如果你严格要求「每份不超过 5 MB」，建议目标值设成 4 MB 或 4.5 MB 留出缓冲。真正影响精度的是页面之间体积差异——含高清扫描的页面会一下把大小推上去。",
          },
          {
            question: "拆分带书签的 PDF 后书签为什么消失了？",
            answer: "书签（大纲）在 PDF 里是一棵指向具体页码的树。拆分时如果只是把页面复制到新文档，但没有重建大纲，原本指向「第 20 页」的书签在只有 10 页的新文件里就失去意义，多数工具会直接删掉大纲。想保留局部书签，需要工具支持「拆分时按范围重建大纲子树」，pdf-lib 本身不做这件事，需要额外处理。如果书签是关键交付信息，建议先在原文件里用「提取页面」保留完整结构，再拆分。",
          },
          {
            question: "为什么按范围拆分时 `1-5,10-15` 会报错？",
            answer: "常见原因有三：一是范围里有的起始页大于结束页（例如写成 `10-5`）；二是页码超出实际总页数；三是分隔符不对，中文全角逗号 `，` 或全角短横 `—` 会被识别为无效字符。工具通常只接受半角 `,` 和 `-`。另外像 `1-1` 这样看起来「取一页」的写法是合法的，但 `1-` 或 `-5` 这类省略端点的开区间在多数实现里不支持，需要写完整。",
          },
          {
            question: "拆分后想把某几页再合并成一份能一次搞定吗？",
            answer: "拆分工具通常做的是「把 PDF 切成多份」，如果你想「拿到第 1-3、7、12-14 页组成一份新 PDF」，其实更适合用「提取页面」而不是「按范围拆分」。两者的区别是：拆分会输出多个文件；提取只输出一个文件，包含你选中的所有页面。ToolGarden 的 `/pdf/extract-pages` 就是为这种场景设计的，能一次挑出多段范围合并输出。",
          },
        ],
      },
      en: {
        title: 'How to Split a PDF by Pages, Ranges, or File Size',
        excerpt: 'PDF splitting can export every page, split selected page ranges, or create smaller parts to satisfy upload size limits.',
        metaTitle: 'How to Split a PDF by Pages, Ranges, or Size',
        metaDescription: 'Learn PDF splitting by page, page ranges, and file-size limits, including range syntax, output checks, and browser-local processing tips.',
        readingTime: '8 min read',
        tags: ['split PDF', 'PDF splitter', 'page ranges', 'PDF tools'],
        relatedTools: [
          {
            label: 'Split PDF',
            href: '/pdf/split',
            description: 'Split one PDF into multiple documents by page ranges or every page.',
          },
          {
            label: 'Extract Pages',
            href: '/pdf/extract-pages',
            description: 'Extract selected pages into one new PDF.',
          },
          {
            label: "PDF to Image",
            href: "/pdf/to-image",
            description: "If you just need to share pages, exporting each as PNG or JPG is often simpler than splitting.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Before splitting a PDF, decide whether you need every page as a file, several page ranges, or smaller parts for an upload limit.',
          },
          { type: 'heading', level: 2, text: 'Three Common Split Modes' },
          {
            type: 'table',
            headers: ['Mode', 'Example', 'Best for'],
            rows: [
              ['Every page', 'Export pages 1, 2, 3 separately', 'Submitting scanned pages one by one'],
              ['Page ranges', '1-3, 4-8, 9-12', 'Splitting by chapters or attachments'],
              ['By size target', 'Keep each part below a limit', '5MB or 10MB upload limits'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Exact automatic size-based splitting is hard because scanned pages, photos, and text pages vary widely. A practical workflow is to split by ranges, then check each output file size.',
          },
          { type: 'heading', level: 2, text: 'Why Is Size-Based Splitting Not Exact?' },
          {
            type: 'paragraph',
            text: 'PDF page size can vary dramatically. A text-only page may be only a few dozen KB, while a scanned image page can be several MB. Even with the same page count, output files can have very different sizes.',
          },
          {
            type: 'table',
            headers: ['Page type', 'Size behavior', 'Splitting tip'],
            rows: [
              ['Text-only PDF', 'Usually small and stable', 'Split by chapter ranges'],
              ['Scanned PDF', 'One page can be large', 'Test with a small page range first'],
              ['Image-heavy report', 'Chart pages are larger', 'Separate image-heavy sections'],
              ['Mixed document', 'Each page can differ greatly', 'Check each output file size after splitting'],
            ],
          },
          { type: 'heading', level: 2, text: 'How to Write Page Ranges' },
          {
            type: 'paragraph',
            text: 'A common syntax is 1-3,5,8-10, which means pages 1 through 3, page 5, and pages 8 through 10. Check whether PDF page numbers match the reader display before exporting.',
          },
          {
            type: 'list',
            items: [
              '1-3 means a continuous range and includes both page 1 and page 3.',
              '1,3,5 selects only those pages.',
              '1-3,8-10 combines multiple ranges in the output.',
              'If the viewer shows Roman numerals for front matter, displayed page labels may not match actual PDF pages.',
            ],
          },
          { type: 'heading', level: 2, text: 'How Should You Name Split Files?' },
          {
            type: 'paragraph',
            text: 'If split files will be uploaded or sent to someone else, use names that preserve meaning and order. contract-part-01.pdf and contract-part-02.pdf are much safer than split-1.pdf.',
          },
          { type: 'heading', level: 2, text: 'When Should You Extract Pages Instead?' },
          {
            type: 'paragraph',
            text: 'If you only need pages 2, 5, and 9 in one new document, extraction is a better fit. If you need one large PDF broken into multiple independent files, splitting is the right workflow.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Split PDF',
            text: 'Upload one PDF, split by page ranges, or export every page as a separate PDF and download the ZIP result.',
            href: '/pdf/split',
            linkLabel: 'Open Split PDF',
          },
        ],
        faq: [
          {
            question: "Why are my split PDFs each larger than expected?",
            answer: "Two reasons dominate. First, the source PDF likely embeds whole fonts and shared images once; when you split, each output has to embed its own copy of the resources it references. Second, most splitters don't re-run compression or object deduplication on the outputs, so the writer leaves some overhead. If the total across splits is significantly bigger than the source, run each split through a PDF compressor afterwards. It's also worth checking whether contiguous pages could share resources — splitting into fewer, larger files is usually smaller in aggregate than many tiny ones.",
          },
          {
            question: "Does splitting by file size hit the target exactly?",
            answer: "No. PDF pages share fonts, images, and other objects, and each page's contribution to the file depends on how much is unique to it. Splitters accumulate pages until adding the next page would exceed the target, then cut. That means individual outputs can be either slightly under the target or slightly over the previous cut, depending on the boundary page. If you need a hard cap (say, an email attachment limit), set the target 15–20% below the real limit to give yourself a safety buffer.",
          },
          {
            question: "Why do bookmarks disappear when I split a PDF?",
            answer: "PDF bookmarks (outlines) are a tree of pointers into the document by page. When you split, a bookmark that pointed to page 20 no longer makes sense in a 10-page slice, so most tools drop the outline entirely rather than fix up destinations. Preserving a localized outline requires the tool to walk the tree and rewrite each entry to reference only the pages that ended up in each output — pdf-lib does not do this automatically. If bookmarks matter, keep the original whole and use ranges/extract-pages instead.",
          },
          {
            question: "What page-range syntax works reliably across splitters?",
            answer: "Stick to ASCII `,` and `-` — e.g., `1-3,7,12-14`. Avoid full-width Chinese punctuation (`，`, `—`), em-dashes, and en-dashes; those get rejected as invalid characters. Ranges must be increasing (`5-3` fails), and endpoints must be within the document (`1-999` on a 20-page PDF is invalid). Open-ended forms like `10-` (meaning \"page 10 to end\") aren't supported everywhere; always write full ranges. And remember that page numbering starts at 1, not 0.",
          },
          {
            question: "Should I split-then-merge, or use extract-pages, to pull selected pages?",
            answer: "Use extract-pages. Splitting produces multiple files; if what you actually want is a single new PDF containing, say, pages 1–3 + 7 + 12–14, splitting forces you to then merge those splits back together, which duplicates work and often loses metadata twice. Dedicated extract-pages tools accept comma-separated ranges and produce one PDF with just those pages, preserving order. On ToolGarden that's `/pdf/extract-pages`; use split only when you truly need N separate output files.",
          },
        ],
      },
    },
  },
  {
    slug: 'extract-selected-pages-from-pdf',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '如何从 PDF 中提取指定页面',
        excerpt: '从 PDF 中提取指定页面，适合只提交合同某几页、导出附件、抽取扫描页或保留文档的一部分。',
        metaTitle: '如何从 PDF 中提取指定页面？页码范围提取教程',
        metaDescription: '讲解如何从 PDF 提取指定页面或页码范围，包含页码写法、顺序保留、重复页面、导出检查和浏览器本地处理。',
        readingTime: '约 8 分钟阅读',
        tags: ['PDF 提取页面', 'PDF 页码', 'PDF 工具'],
        relatedTools: [
          {
            label: '提取页面',
            href: '/pdf/extract-pages',
            description: '从 PDF 文件中提取特定页面并保存为新文档。',
          },
          {
            label: '整理 PDF',
            href: '/pdf/organize',
            description: '需要拖拽重新排序、复制或删除页面时，可以使用整理 PDF。',
          },
          {
            label: "PDF 转图片",
            href: "/pdf/to-image",
            description: "提取到的页面还可以再导出为图片，方便直接贴到 Slack、Notion 等平台。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '提取页面和拆分 PDF 的区别是：提取通常把选中的几页合成一个新 PDF，而拆分会生成多个文件。',
          },
          { type: 'heading', level: 2, text: '哪些场景适合提取页面？' },
          {
            type: 'paragraph',
            text: '提取页面适合“只需要原 PDF 的一部分”的场景。例如合同只提交签字页和关键条款，扫描件只导出身份证明页，课程资料只截取某个章节，或者从完整报告中抽出附录给同事查看。',
          },
          {
            type: 'table',
            headers: ['场景', '推荐操作', '注意事项'],
            rows: [
              ['合同提交', '提取指定条款页和签字页', '确认页码和签章完整'],
              ['扫描资料', '提取需要上传的几页', '检查方向和清晰度'],
              ['报告分享', '提取摘要、图表或附录', '避免泄露不相关页面'],
              ['学习资料', '提取某一章或练习页', '保持页面顺序便于阅读'],
            ],
          },
          { type: 'heading', level: 2, text: '页码怎么写？' },
          {
            type: 'table',
            headers: ['写法', '含义', '结果'],
            rows: [
              ['3', '只提取第 3 页', '一个 1 页 PDF'],
              ['1-3', '提取第 1 到 3 页', '一个 3 页 PDF'],
              ['1,3,5-7', '提取第 1、3、5 到 7 页', '按输入顺序组成新 PDF'],
            ],
          },
          {
            type: 'paragraph',
            text: '有些工具会允许重复页或调整顺序，例如 5,1,5 可能表示先放第 5 页，再放第 1 页，最后再复制一遍第 5 页。正式提交前一定要打开结果确认顺序。',
          },
          { type: 'heading', level: 2, text: '实际页码和显示页码为什么会不同？' },
          {
            type: 'paragraph',
            text: 'PDF 阅读器可能把封面、目录页显示为 i、ii、iii，正文才从 1 开始。但工具通常按 PDF 的实际页面序号处理，也就是第一张页面就是第 1 页。遇到论文、合同册或扫描件时，这个差异尤其常见。',
          },
          {
            type: 'list',
            items: [
              '先用预览确认目标页面在 PDF 中的实际位置。',
              '封面和目录页也要计入实际页码。',
              '如果目标是“显示第 10 页”，先确认它是不是实际第 12 页或第 13 页。',
              '导出后检查第一页和最后一页是否符合预期。',
            ],
          },
          { type: 'heading', level: 2, text: '提取前后要检查什么？' },
          {
            type: 'list',
            items: [
              '阅读器显示页码可能和实际 PDF 页码不同，尤其是封面和目录页。',
              '确认选中的页面顺序是否符合提交要求。',
              '如果需要删除或复制页面，整理 PDF 工具更适合。',
              '导出后检查页数、文件大小和第一页内容。',
            ],
          },
          { type: 'heading', level: 2, text: '提取页面会改变原 PDF 吗？' },
          {
            type: 'paragraph',
            text: '正常的提取流程会生成一个新 PDF，不会修改原文件。为了保险，建议把导出的文件重新命名，例如 contract-pages-3-5.pdf，并保留原始 PDF，方便之后重新提取或核对。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 提取页面',
            text: '上传 PDF 后输入页码或范围，可以把指定页面导出成一个新的 PDF 文件。',
            href: '/pdf/extract-pages',
            linkLabel: '打开提取页面',
          },
        ],
        faq: [
          {
            question: "提取页面时能保留原 PDF 的书签和链接吗？",
            answer: "这取决于工具的实现。pdf-lib 在复制页面时会把页面本身的内容流原样拷过来，但大纲（书签树）和跨页链接是文档级对象，不会自动跟着页面走。结果就是：提取出来的 PDF 保留了文字、图片、页内注释，但书签会消失、跳转到「原文件第 30 页」的链接可能失效。如果这些是关键信息，建议先在原文件上用「拆分」+ 手动整理，或使用支持大纲重写的更重型工具（如 qpdf、pdfcpu）。",
          },
          {
            question: "为什么提取出来的 PDF 打不开或显示空白？",
            answer: "最常见的原因有三个：一是页码写错了，比如原文件只有 20 页却写成 21，多数工具会输出一份 0 页 PDF；二是原文件加密或有权限限制，未先解密就复制页面，写出去的对象引用了被锁定的资源；三是页面里嵌入了大图或复杂 XObject，工具在克隆时超时或跳过了。遇到空白结果，先确认原文件能正常打开、页码在范围内，再尝试先解密或压缩原文件。",
          },
          {
            question: "支持 `1,3,5-8,20` 这种混合写法吗？",
            answer: "多数现代提取工具都支持逗号分隔的混合写法：单页 + 连续范围。ToolGarden 的实现按你写的顺序解析并去重，最终输出按范围出现的顺序排列——如果你写 `5,1,3` 出来的 PDF 页面顺序就是 5→1→3。这在做「重排 + 抽取」时很有用。不支持的写法通常是：负数、`3-1` 这种倒序范围、`0` 作为页码（PDF 页码从 1 开始）。",
          },
          {
            question: "提取一页 PDF 出来体积和原文件差不多，是不是没提取成功？",
            answer: "有可能是提取成功但资源没有裁剪。PDF 里一页可能引用了整个文件共享的字体子集或图片资源池，pdf-lib 默认会连带把这些资源拷过去，即使新文件只用到其中一小部分。要真正瘦身，需要在提取后再跑一次「压缩」或「优化」，把没被引用的对象删掉。ToolGarden 目前不会在提取时自动做这一步——如果单页也有几 MB，说明字体子集或大图是主要成本。",
          },
          {
            question: "提取的页面顺序能自定义吗？",
            answer: "取决于工具。「按范围提取」类工具会按输入顺序输出：你写 `10,5,20`，PDF 顺序就是 10→5→20，不排序。这个特性适合做「快速重排+抽取」。「按范围拆分」类工具则严格按页码升序输出。如果你要做更复杂的重排（比如把某页插到另一页中间），提取只能做到「新文件里的相对顺序」，插入到具体位置需要用 PDF 整理 / 组织类工具（ToolGarden 的 `/pdf/organize`）。",
          },
        ],
      },
      en: {
        title: 'How to Extract Selected Pages from a PDF',
        excerpt: 'Extracting selected PDF pages is useful when you only need a few contract pages, attachments, scans, or a section of a larger document.',
        metaTitle: 'How to Extract Selected Pages from a PDF',
        metaDescription: 'Learn how to extract selected pages and page ranges from a PDF, including range syntax, order preservation, output checks, and browser-local processing.',
        readingTime: '8 min read',
        tags: ['extract PDF pages', 'PDF page range', 'PDF tools'],
        relatedTools: [
          {
            label: 'Extract Pages',
            href: '/pdf/extract-pages',
            description: 'Extract selected pages from a PDF and save them as a new document.',
          },
          {
            label: 'Organize PDF',
            href: '/pdf/organize',
            description: 'Reorder, duplicate, or delete pages before exporting.',
          },
          {
            label: "PDF to Image",
            href: "/pdf/to-image",
            description: "Turn extracted pages into images so they can be pasted straight into Slack or Notion.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Extracting pages usually creates one new PDF from selected pages, while splitting a PDF often creates multiple files.',
          },
          { type: 'heading', level: 2, text: 'When Should You Extract Pages?' },
          {
            type: 'paragraph',
            text: 'Page extraction is useful when you only need part of the original PDF. You might submit only key contract pages, export selected scan pages, share one report appendix, or pull a chapter from a larger course handout.',
          },
          {
            type: 'table',
            headers: ['Case', 'Recommended action', 'Check'],
            rows: [
              ['Contract submission', 'Extract key clauses and signature pages', 'Confirm page numbers and signatures'],
              ['Scanned documents', 'Extract only required upload pages', 'Check orientation and clarity'],
              ['Report sharing', 'Extract summary, charts, or appendix', 'Avoid exposing unrelated pages'],
              ['Study material', 'Extract one chapter or exercise set', 'Keep reading order intact'],
            ],
          },
          { type: 'heading', level: 2, text: 'Page Range Syntax' },
          {
            type: 'table',
            headers: ['Input', 'Meaning', 'Result'],
            rows: [
              ['3', 'Extract only page 3', 'One 1-page PDF'],
              ['1-3', 'Extract pages 1 through 3', 'One 3-page PDF'],
              ['1,3,5-7', 'Extract pages 1, 3, and 5 through 7', 'One new PDF in selected order'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Some workflows allow repeated pages or custom order. For example, 5,1,5 may place page 5 first, page 1 second, and page 5 again at the end. Always open the result before submitting it.',
          },
          { type: 'heading', level: 2, text: 'Why Can Actual Page Numbers Differ from Displayed Labels?' },
          {
            type: 'paragraph',
            text: 'PDF viewers may label covers and tables of contents as i, ii, and iii, while the main body starts at page 1. Tools usually use actual PDF page order, where the first physical page is page 1.',
          },
          {
            type: 'list',
            items: [
              'Preview the document to confirm the target page position.',
              'Count covers and table-of-contents pages as actual pages.',
              'If you need displayed page 10, confirm whether it is actual page 12 or 13.',
              'After export, check the first and last selected pages.',
            ],
          },
          { type: 'heading', level: 2, text: 'What to Check' },
          {
            type: 'list',
            items: [
              'Viewer page labels may differ from actual PDF page numbers, especially with covers and tables of contents.',
              'Confirm the selected page order meets the submission requirement.',
              'Use an organize tool if you need to delete, duplicate, or reorder pages manually.',
              'After export, check page count, file size, and first-page content.',
            ],
          },
          { type: 'heading', level: 2, text: 'Does Extraction Change the Original PDF?' },
          {
            type: 'paragraph',
            text: 'A normal extraction workflow creates a new PDF and leaves the original untouched. Rename the output clearly, such as contract-pages-3-5.pdf, and keep the source file for later checks.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Extract Pages',
            text: 'Upload a PDF, enter page numbers or ranges, and export selected pages as a new PDF locally in the browser.',
            href: '/pdf/extract-pages',
            linkLabel: 'Open Extract Pages',
          },
        ],
        faq: [
          {
            question: "Does extracting pages preserve bookmarks and internal links?",
            answer: "Usually not. pdf-lib copies page content streams faithfully, but bookmarks (outlines) and cross-page link annotations live at the document level and don't move with individual pages by default. The extracted PDF keeps its text, images, and page-scoped annotations, but the outline tree is dropped and any link pointing to \"page 30 of the original\" becomes stale. If you need outlines preserved, use heavier tools (qpdf, pdfcpu) that can rewrite destinations, or extract into an organizer that lets you rebuild the outline manually.",
          },
          {
            question: "Why does my extracted PDF open blank or fail to open?",
            answer: "Three usual suspects. First, an out-of-range page (you asked for page 21 of a 20-page file) — many tools silently produce a zero-page PDF. Second, the source is encrypted or permission-restricted and page copying references resources the reader can't unlock. Third, the page includes large or exotic XObjects (complex forms, embedded 3D) that the copier skipped or truncated. Verify the original opens correctly, confirm your page numbers, and try decrypting or flattening the source first.",
          },
          {
            question: "Can I mix single pages and ranges like `1,3,5-8,20`?",
            answer: "Yes — most modern extractors accept comma-separated combinations of single pages and ranges. ToolGarden parses in the order you write, deduplicates, and outputs in the order encountered. That means `5,1,3` produces a PDF with pages in 5→1→3 order, which is handy for quick reordering-plus-extraction. What's typically not supported: descending ranges (`8-5`), zero-indexed numbers (PDFs are 1-indexed), negative numbers, and open ranges (`10-`).",
          },
          {
            question: "I extracted one page but the file size is almost the same as the original — why?",
            answer: "Extraction usually copies referenced resources but doesn't garbage-collect unused ones. If your one page references a font subset shared with the rest of the document, pdf-lib will pull that whole subset over. Same for image resource dictionaries and shared color profiles. To actually shrink the output, run it through a compressor or linearizer (like qpdf --optimize) afterwards. ToolGarden's extractor prioritizes fidelity over size; a second pass with a compressor is the standard follow-up if size matters.",
          },
          {
            question: "Can I control the page order in the extracted PDF?",
            answer: "It depends on the tool. Range-extractors typically honor input order — writing `10,5,20` yields a PDF with pages in that exact sequence, which doubles as a quick reorder. Split-by-range tools instead force ascending numeric order. If you need arbitrary reordering (moving page 15 between pages 3 and 4, for example), extraction alone gives you the relative order in the new file but can't insert into an existing one — use an organizer/reorder tool (ToolGarden's `/pdf/organize`) for that.",
          },
        ],
      },
    },
  },
  {
    slug: 'chinese-english-word-count-character-byte',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '中英文字数统计的差异：字符、词、字节各是什么',
        excerpt: '中文常看字数和字符数，英文常看词数。技术系统还会看 UTF-8 字节数，尤其是接口、数据库和短信限制。',
        metaTitle: '中英文字数统计差异：字符、词、字节各是什么',
        metaDescription: '解释中文和英文字数统计差异，包括字符数、词数、字节数、Emoji、空格、标点和 UTF-8 编码在不同场景下的影响。',
        readingTime: '约 8 分钟阅读',
        tags: ['字数统计', '中英文统计', '字符数', '字节数'],
        relatedTools: [
          {
            label: '字数统计',
            href: '/text/word-count',
            description: '统计字数、词数、字符数、行数、段落、句子和字节大小。',
          },
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '查看文本编码、Unicode、Base64 和字节相关转换。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '中文和英文的“字数”不是同一套统计逻辑。写作平台、SEO 工具、数据库和接口限制也可能看不同指标。',
          },
          { type: 'heading', level: 2, text: '先看一个混合文本例子' },
          { type: 'code', language: 'text', code: wordCountMixedExample },
          {
            type: 'paragraph',
            text: '这段文本同时包含中文、英文、空格、换行和 Emoji。不同工具可能分别统计“字符数”“词数”“字数”“不含空格字符数”“UTF-8 字节数”，结果自然不会完全一样。',
          },
          { type: 'heading', level: 2, text: '三个指标先分清' },
          {
            type: 'table',
            headers: ['指标', '中文场景', '英文场景'],
            rows: [
              ['字符数', '每个汉字、标点、空格都可能算字符', '字母、空格、标点都算字符'],
              ['词数', '中文不一定按空格分词，统计口径差异大', '通常按空格和标点拆分单词'],
              ['字节数', 'UTF-8 下常见汉字通常 3 字节', '英文字母通常 1 字节'],
            ],
          },
          { type: 'heading', level: 2, text: '字符数、字数、词数不是一回事' },
          {
            type: 'paragraph',
            text: '中文内容里，一个汉字常被用户理解为一个“字”，但字符数还会把标点、数字、英文字母、空格和换行都算进去。英文内容里，写作平台更常看 word count，也就是按空格、标点和分隔符拆出来的词。',
          },
          {
            type: 'table',
            headers: ['文本', '常见字符理解', '常见词数理解'],
            rows: [
              ['你好世界', '4 个汉字字符', '可能被当作 1 个中文片段，也可能分词为多个词'],
              ['Hello world', '包含 10 个字母和 1 个空格', '2 个英文单词'],
              ['JSON 工具', '中文、英文和空格混合', '取决于中文分词和英文拆词规则'],
              ['😊', '看起来 1 个图标', '底层可能包含多个 Unicode 码点'],
            ],
          },
          { type: 'heading', level: 2, text: '为什么字节数对接口和数据库很重要？' },
          {
            type: 'paragraph',
            text: '很多系统限制的不是“看起来多少字”，而是存储或传输需要多少字节。UTF-8 下英文字母通常 1 字节，常见中文汉字通常 3 字节，Emoji 可能 4 字节或更多。一个 100 字的中文字段，字节数可能远高于 100。',
          },
          {
            type: 'list',
            items: [
              '数据库字段限制可能写的是 varchar(255)，但不同数据库对字符和字节的理解不同。',
              '短信、推送、URL 参数和接口 payload 经常会受到字节大小限制。',
              'Emoji、组合字符和特殊符号可能让“肉眼字符数”和技术字符数不一致。',
              '做国际化产品时，最好同时检查字符数和字节数。',
            ],
          },
          { type: 'heading', level: 2, text: '为什么同一段文字数字不同？' },
          {
            type: 'list',
            items: [
              '空格和换行是否计入字符数，会影响表单限制。',
              'Emoji 可能由多个 Unicode 码点组成，不能只按肉眼看到的图标数。',
              '中文没有天然空格，词数统计依赖分词规则。',
              '接口和数据库经常限制字节数，而不是字数。',
            ],
          },
          { type: 'heading', level: 2, text: '不同场景应该看哪个指标？' },
          {
            type: 'table',
            headers: ['场景', '优先指标', '原因'],
            rows: [
              ['中文 SEO 标题', '字符数和可读长度', '搜索结果展示空间有限'],
              ['英文文章', '词数', '阅读时间和内容长度更常按词估算'],
              ['表单输入限制', '字符数或字节数', '取决于前后端限制方式'],
              ['数据库字段', '字节数和字符数都要看', '避免多语言内容超出存储限制'],
              ['接口传输', '字节数', 'payload 大小影响请求和响应'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 字数统计',
            text: '粘贴文本即可同时查看字数、词数、字符数、行数、段落、句子和字节大小，适合中英文内容检查。',
            href: '/text/word-count',
            linkLabel: '打开字数统计',
          },
        ],
        faq: [
          {
            question: "为什么同一段文本，Word 显示的字数和在线工具不一样？",
            answer: "因为「字数」在不同工具里的定义不一样。Microsoft Word 把中文按「字符」计数（一个汉字算一个），把英文按「空白分词」计数（连续非空白算一个词）。有些在线工具则用简单的「空白 + 标点分词」，混排文本会把「你好world」算成一个词而不是两个。字节数、去空白字符、CJK 字符数在不同实现里的算法也各不相同。要跨工具对齐，最好统一使用「字符数」这一项，它的定义歧义最小。",
          },
          {
            question: "Emoji、颜文字和特殊符号是按几个字符计算的？",
            answer: "JavaScript 里的 `string.length` 按 UTF-16 code unit 计数，一个 emoji（如 「😀」）会算 2 个 code unit；带肤色修饰或性别的复合 emoji（如 「👨‍👩‍👧」）会算 5–8 个。人眼看到的是一个「字符」，但底层字符是好几个。ToolGarden 的字数统计用 `Array.from(str)` 或 grapheme 分段来算「视觉字符」，所以 emoji 通常按 1 个计。如果你在填表单有字符上限，建议以后端实际存储的编码单位为准。",
          },
          {
            question: "字节数怎么算，为什么中文比英文占更多字节？",
            answer: "字节数取决于文本编码。UTF-8 下，英文字母占 1 字节，中文汉字占 3 字节，emoji 通常占 4 字节。所以「你好」占 6 字节，「hi」占 2 字节。UTF-16 则相反，中文汉字占 2 字节，某些英文特殊符号也占 2 字节。数据库字段（如 MySQL 的 `VARCHAR(255)`）按字符还是字节限制，取决于列的字符集设置——`utf8mb4` 按字符，`latin1` 按字节。做长度校验时一定要问清楚到底是哪种。",
          },
          {
            question: "中英文混排时词数应该怎么算？",
            answer: "没有统一标准。学术论文和公文按「中文字符 + 英文单词」分别列出；社交平台通常按字符总数（微博 140 字，X/Twitter 280 字符，其中一个汉字算 2 个「权重字符」）；招标文书和印刷估价按字符数（含或不含空格另计）。混排文本先决定要给谁看：给字数上限，用字符；给排版工，用页数或行数；给翻译公司，用「单词数（英文按空白，中文按字符）」，因为翻译单价按此计。",
          },
          {
            question: "行数、段落数、句子数有什么用？",
            answer: "对写作者：段落数看结构、行数看视觉密度、句子数看节奏（每段一句读起来短促，每段五六句读起来累）。对开发者：行数常用来估阅读时间、判断文件是否太长；句子数在做 NLP 分句、做机器翻译计价时最关键。对 SEO：段落数太少（一整篇一段）会被判定为可读性差，太多（每段一句）又会被判定为凑数。理想比例是每段 2–4 句、每 3–5 段一个二级标题。",
          },
        ],
      },
      en: {
        title: 'Chinese vs English Text Counting: Characters, Words, and Bytes',
        excerpt: 'Chinese text often focuses on characters, English text often focuses on words, and technical systems often care about UTF-8 bytes.',
        metaTitle: 'Chinese vs English Text Counting: Characters, Words, Bytes',
        metaDescription: 'Understand character count, word count, byte count, emoji, spaces, punctuation, and UTF-8 differences across Chinese and English text.',
        readingTime: '8 min read',
        tags: ['word count', 'Chinese text', 'character count', 'byte count'],
        relatedTools: [
          {
            label: 'Word Count',
            href: '/text/word-count',
            description: 'Count words, characters, lines, paragraphs, sentences, and byte size.',
          },
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Inspect text encoding, Unicode, Base64, and byte-related conversions.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Chinese and English text length are not counted the same way. Writing tools, SEO tools, databases, and APIs may all care about different metrics.',
          },
          { type: 'heading', level: 2, text: 'Start with a Mixed Text Example' },
          { type: 'code', language: 'text', code: wordCountMixedExample },
          {
            type: 'paragraph',
            text: 'This sample contains Chinese, English, spaces, a line break, and an emoji. A tool may report characters, words, characters without spaces, lines, and UTF-8 bytes, so the numbers will not be identical.',
          },
          { type: 'heading', level: 2, text: 'Three Metrics to Separate' },
          {
            type: 'table',
            headers: ['Metric', 'Chinese context', 'English context'],
            rows: [
              ['Characters', 'Each Han character, punctuation mark, or space may count', 'Letters, spaces, and punctuation count'],
              ['Words', 'No universal space-based word boundary', 'Usually split by spaces and punctuation'],
              ['Bytes', 'Many common Han characters use 3 UTF-8 bytes', 'English letters usually use 1 byte'],
            ],
          },
          { type: 'heading', level: 2, text: 'Characters, Chinese Characters, and Words Are Different' },
          {
            type: 'paragraph',
            text: 'In Chinese, users often think of each Han character as one unit, but a character counter may also include punctuation, digits, Latin letters, spaces, and line breaks. In English, writing tools usually focus on word count split by spaces and punctuation.',
          },
          {
            type: 'table',
            headers: ['Text', 'Common character view', 'Common word-count view'],
            rows: [
              ['你好世界', '4 Han characters', 'May be treated as one Chinese segment or segmented into multiple words'],
              ['Hello world', '10 letters plus 1 space', '2 English words'],
              ['JSON 工具', 'Mixed Chinese, English, and a space', 'Depends on Chinese segmentation and English tokenization'],
              ['😊', 'Looks like one symbol', 'May contain multiple Unicode code points internally'],
            ],
          },
          { type: 'heading', level: 2, text: 'Why Byte Count Matters for APIs and Databases' },
          {
            type: 'paragraph',
            text: 'Many systems limit storage or transfer size, not visual length. In UTF-8, English letters are usually 1 byte, common Chinese characters are often 3 bytes, and emoji can be 4 bytes or more. A 100-character Chinese field can be much larger than 100 bytes.',
          },
          {
            type: 'list',
            items: [
              'A database field such as varchar(255) may behave differently depending on database and encoding settings.',
              'SMS, push messages, URL parameters, and API payloads often have byte-size limits.',
              'Emoji, combining characters, and special symbols can make visual length differ from technical length.',
              'For international products, check both character count and byte count.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why Results Differ' },
          {
            type: 'list',
            items: [
              'Whether spaces and line breaks count affects form limits.',
              'Emoji may contain multiple Unicode code points.',
              'Chinese word count depends on segmentation rules.',
              'APIs and databases often limit bytes, not visible characters.',
            ],
          },
          { type: 'heading', level: 2, text: 'Which Metric Should You Use?' },
          {
            type: 'table',
            headers: ['Use case', 'Primary metric', 'Why'],
            rows: [
              ['Chinese SEO title', 'Characters and readable length', 'Search result display space is limited'],
              ['English article', 'Words', 'Reading time and content length are usually estimated by words'],
              ['Form input limit', 'Characters or bytes', 'Depends on frontend and backend validation'],
              ['Database field', 'Both bytes and characters', 'Multilingual content may exceed storage limits'],
              ['API transfer', 'Bytes', 'Payload size affects requests and responses'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Word Count',
            text: 'Paste text to see words, characters, lines, paragraphs, sentences, and byte size for Chinese and English content checks.',
            href: '/text/word-count',
            linkLabel: 'Open Word Count',
          },
        ],
        faq: [
          {
            question: "Why does Word's word count differ from online counters for the same text?",
            answer: "Because \"word\" doesn't mean the same thing everywhere. Microsoft Word counts each CJK character as one word for East Asian languages, but uses whitespace tokenization for English. Simpler online counters just split on whitespace, which merges CJK+Latin runs like `你好world` into a single token. Character counts, non-space character counts, and CJK-only counts also vary by implementation. To compare consistently across tools, standardize on character count — it has the fewest edge cases and is what most character-limit UIs actually check.",
          },
          {
            question: "How are emoji and complex graphemes counted?",
            answer: "JavaScript's `string.length` counts UTF-16 code units, so a basic emoji like 😀 is 2, and compound emoji with skin tone or ZWJ sequences (👨‍👩‍👧) can be 5–8 code units. Users see one glyph but the string is longer. ToolGarden's counter uses `Array.from()` or `Intl.Segmenter` to count perceived graphemes, so most emoji count as one visual character. However, form-field validators and database columns often disagree — for hard limits, always test what your backend actually stores.",
          },
          {
            question: "How do bytes work, and why does Chinese take more bytes than English?",
            answer: "Bytes depend on encoding. In UTF-8, ASCII letters are 1 byte, Chinese characters are 3 bytes, and most emoji are 4 bytes — so `hello` is 5 bytes but `你好` is 6. In UTF-16, most Chinese characters are 2 bytes but so are some accented Latin characters. Database column limits also vary: MySQL `VARCHAR(255)` on `utf8mb4` limits to 255 characters, but on `latin1` limits to 255 bytes. Before trusting a byte count, know the target encoding and whether your storage counts characters or bytes.",
          },
          {
            question: "How should mixed Chinese-English text be counted for word count?",
            answer: "There's no universal rule. Academic and government documents typically report Chinese characters and English words separately. Social platforms count characters (Weibo caps at 140, X caps at 280 with CJK counted double). Translation vendors charge by \"source words\": English by whitespace, Chinese by character (usually at 1 character ≈ 1.5 English words). Publishing tools count pages or lines. Decide the audience first: character count for UI limits, word count for translators, page/line count for typesetters. Report both when in doubt.",
          },
          {
            question: "What do line, paragraph, and sentence counts actually tell me?",
            answer: "For writers: paragraphs show structure, lines show visual density, sentences show pacing. For developers: lines gauge reading time or file length; sentence counts drive NLP splitting and translation pricing. For SEO: too few paragraphs (one giant blob) hurts readability scoring; too many (one sentence each) reads as padding. A common sweet spot is 2–4 sentences per paragraph and a subheading every 3–5 paragraphs. If a tool reports zero sentences, it usually means your punctuation is non-ASCII or missing entirely.",
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
