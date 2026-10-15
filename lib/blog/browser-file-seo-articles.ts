import type { BlogArticle, BlogArticleTranslation, BlogBlock, BlogFaqItem } from './articles';

type ToolLink = BlogArticleTranslation['relatedTools'][number];
type Section = {
  heading: string;
  paragraphs: string[];
  items?: string[];
  table?: { headers: string[]; rows: string[][] };
  code?: { language: string; code: string };
};

type Copy = {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  tags: string[];
  relatedTools: ToolLink[];
  lead: string;
  intro: string;
  sections: Section[];
  conclusion: string;
  callout: Extract<BlogBlock, { type: 'callout' }>;
  faq: BlogFaqItem[];
};

function build(copy: Copy, summaryHeading: string): BlogArticleTranslation {
  const blocks: BlogBlock[] = [
    { type: 'lead', text: copy.lead },
    { type: 'paragraph', text: copy.intro },
  ];
  for (const section of copy.sections) {
    blocks.push({ type: 'heading', level: 2, text: section.heading });
    blocks.push(...section.paragraphs.map((text): BlogBlock => ({ type: 'paragraph', text })));
    if (section.table) blocks.push({ type: 'table', ...section.table });
    if (section.code) blocks.push({ type: 'code', ...section.code });
    if (section.items) blocks.push({ type: 'list', items: section.items });
  }
  blocks.push(copy.callout, { type: 'heading', level: 2, text: summaryHeading }, { type: 'paragraph', text: copy.conclusion });
  return { ...copy, blocks };
}

function article(slug: string, en: Copy, zh: Copy): BlogArticle {
  return {
    slug,
    publishedAt: '2026-09-20',
    updatedAt: slug === 'blob-url-createobjecturl-explained' ? '2026-10-10' : '2026-09-20',
    translations: { en: build(en, 'Key takeaways'), zh: build(zh, '总结') },
  };
}
const codecEn: ToolLink = { label: 'Encoding Tools', href: '/info-codec', description: 'Test Base64, URL encoding, Unicode, hexadecimal, and hashes locally.' };
const codecZh: ToolLink = { label: '编码解码工具', href: '/info-codec', description: '在本地测试 Base64、URL 编码、Unicode、十六进制和哈希。' };

export const browserFileSeoArticles = [
  article(
    'why-base64-increases-file-size-33-percent',
    {
      title: 'Why Does Base64 Increase File Size by About 33%?', excerpt: 'Derive Base64 expansion from bits, bytes, padding, line wrapping, and container overhead.',
      metaTitle: 'Why Base64 Is 33% Larger: Exact Math', metaDescription: 'Learn why Base64 expands data by roughly 33%, including 24-bit groups, 6-bit symbols, padding formulas, small-file edge cases, and gzip effects.',
      readingTime: '8 min read', tags: ['Base64 size', 'Base64 overhead', '6-bit encoding'], relatedTools: [codecEn, { label: 'Image to Base64', href: '/image/to-base64', description: 'Measure a real image encoding locally.' }],
      lead: 'Base64 turns every three input bytes into four text characters. In ASCII-compatible storage that is a 4-to-3 ratio, or approximately 33.33% more data.',
      intro: 'The familiar 33% figure is an asymptote, not a universal exact result. Padding makes tiny inputs proportionally larger, while Data URL prefixes, MIME line breaks, JSON syntax, and transport compression change the complete envelope.',
      sections: [
        { heading: 'Why 24 bits become four characters', paragraphs: ['Three bytes contain 24 bits. Base64 splits those bits into four 6-bit groups. Each group selects one of 64 alphabet characters. No compression occurs; the same information is regrouped for a text-only channel.', 'For lengths divisible by three, encoded length is input length / 3 × 4. A 3 MB payload therefore becomes about 4 MB before prefixes or surrounding syntax.'], code: { language: 'text', code: '3 bytes = 24 bits\n24 / 6 = 4 Base64 symbols\n4 / 3 = 1.3333...' } },
        { heading: 'The exact formula and padding', paragraphs: ['For n input bytes, padded Base64 length is 4 × ceil(n / 3). One remaining byte creates two data symbols and two equals signs; two remaining bytes create three data symbols and one equals sign.', 'One byte becoming four characters is 300% overhead, while two bytes becoming four is 100%. As n grows, the ratio approaches 33.33%.'], table: { headers: ['Input bytes', 'Output characters', 'Increase'], rows: [['1', '4', '300%'], ['2', '4', '100%'], ['3', '4', '33.33%'], ['6', '8', '33.33%'], ['1,000', '1,336', '33.6%']] } },
        { heading: 'Padding removal changes little', paragraphs: ['Base64URL and some protocols omit equals padding when length is known elsewhere. This saves at most two characters, not the main 4-to-3 expansion.', 'Padding is block-completion metadata, not encryption and not hidden content. A decoder can often restore omitted padding from the encoded length.'] },
        { heading: 'Prefixes and containers add more', paragraphs: ['A Data URL adds a prefix such as data:image/png;base64,. JSON adds quotes and possible escapes. MIME may insert CRLF line wrapping. Measure the complete representation rather than only the alphabet characters.', 'Runtime string memory is implementation-dependent; character count does not always equal exact JavaScript heap bytes.'] },
        { heading: 'What gzip changes', paragraphs: ['General compression can exploit patterns in Base64, so compressed network overhead may be lower than 33%. Compare compressed binary with compressed Base64 under identical conditions.', 'Already-compressed JPG, PNG, ZIP, PDF, and video bytes provide little redundancy. Storage, parsing, memory, and CPU overhead remain even if gzip narrows transfer size.'] },
        { heading: 'When to avoid Base64', paragraphs: ['Use binary request bodies, multipart uploads, or Blob URLs when available. Base64 is appropriate for small values in text-only protocols or APIs that explicitly require it.'], items: ['Do not use Base64 as compression.', 'Do not use it as encryption.', 'Limit decoded size, not only string length.', 'Keep large local previews as Blob URLs.'] },
      ],
      callout: { type: 'callout', title: 'Follow the complete encoding process', text: 'See UTF-8 bytes, 6-bit groups, alphabet lookup, padding, and decoding step by step.', href: '/blog/base64-encoding-explained-common-pitfalls', linkLabel: 'Read the Base64 guide' },
      conclusion: 'The 33% comes from storing four 6-bit symbols as four text bytes for every three input bytes. Use 4 × ceil(n / 3) for exact padded length, then calculate prefixes and container syntax separately.',
      faq: [{ question: 'Is Base64 always exactly 33% larger?', answer: 'No. Large inputs approach 33.33%; padding makes small inputs proportionally larger.' }, { question: 'Does removing padding solve it?', answer: 'No. It saves at most two characters.' }, { question: 'Can gzip remove all overhead?', answer: 'Not reliably, especially for already-compressed files.' }],
    },
    {
      title: 'Base64 为什么会让文件变大约 33%？', excerpt: '从位、字节、6-bit 分组、padding、换行和容器开销推导 Base64 体积。',
      metaTitle: 'Base64 为什么变大 33%？精确公式', metaDescription: '解释 Base64 体积为何增加约 33%，包含 24-bit 和 6-bit 分组、padding 公式、小文件边界、Data URL 与 gzip 影响。',
      readingTime: '约 8 分钟阅读', tags: ['Base64 体积', 'Base64 膨胀', '6-bit 编码'], relatedTools: [codecZh, { label: '图片转 Base64', href: '/image/to-base64', description: '在本地测量真实图片编码长度。' }],
      lead: 'Base64 把每三个输入字节变成四个文本字符。在 ASCII 兼容存储中，这就是 4:3，约增加 33.33%。',
      intro: '33% 是渐近值，不是所有输入的精确比例。小输入会因 padding 膨胀更多，Data URL 前缀、MIME 换行、JSON 语法和传输压缩也会改变完整大小。',
      sections: [
        { heading: '为什么 24 bit 变成四个字符', paragraphs: ['三个字节包含 24 bit，Base64 把它们切成四组 6 bit，每组从 64 个字符中选择一个。它不压缩，只为纯文本通道重新分组。', '长度能被三整除时，输出长度 = 输入长度 / 3 × 4；3 MB 负载在前缀和容器语法之前约变成 4 MB。'], code: { language: 'text', code: '3 字节 = 24 bit\n24 / 6 = 4 个 Base64 符号\n4 / 3 = 1.3333...' } },
        { heading: '精确公式与 padding', paragraphs: ['n 字节输入的标准长度是 4 × ceil(n / 3)。剩一个字节时产生两个数据符号和两个等号；剩两个字节时产生三个数据符号和一个等号。', '1 字节变 4 字符是 300% 开销，2 字节变 4 字符是 100%；输入增大后趋近 33.33%。'], table: { headers: ['输入字节', '输出字符', '增加'], rows: [['1', '4', '300%'], ['2', '4', '100%'], ['3', '4', '33.33%'], ['6', '8', '33.33%'], ['1,000', '1,336', '33.6%']] } },
        { heading: '去掉 padding 作用很小', paragraphs: ['Base64URL 和部分协议在其他地方已知长度时会省略等号，最多节省两个字符，无法消除 4:3 膨胀。', 'Padding 是块补齐信息，不是加密或隐藏内容，解码器通常能按长度补回。'] },
        { heading: '前缀与容器继续增加大小', paragraphs: ['Data URL 增加 data:image/png;base64, 前缀，JSON 增加引号与转义，MIME 可能加入 CRLF 换行。应测量完整表示。', '运行时字符串内存由引擎实现决定，字符数不一定等于精确堆内存字节。'] },
        { heading: 'gzip 会改变什么', paragraphs: ['通用压缩能利用 Base64 模式，因此线上压缩后的差距可能低于 33%；必须在相同条件下比较压缩二进制和压缩 Base64。', 'JPG、PNG、ZIP、PDF 和视频等已压缩数据冗余很少；即使网络差距缩小，存储、解析、内存和 CPU 开销仍在。'] },
        { heading: '什么时候应避免 Base64', paragraphs: ['接口允许时使用二进制请求体、multipart 或 Blob URL。Base64 更适合纯文本协议中的小值，或 API 明确要求的场景。'], items: ['不要把 Base64 当压缩。', '不要把它当加密。', '限制解码后大小，不只限制字符串。', '大型本地预览使用 Blob URL。'] },
      ],
      callout: { type: 'callout', title: '查看完整编码过程', text: '逐步了解 UTF-8 字节、6-bit 分组、字母表索引、padding 和解码。', href: '/blog/base64-encoding-explained-common-pitfalls', linkLabel: '阅读 Base64 原理' },
      conclusion: '33% 来自每三个输入字节需要四个文本字节。精确带 padding 长度用 4 × ceil(n / 3)，前缀和容器语法另行计算。',
      faq: [{ question: 'Base64 一定正好增加 33% 吗？', answer: '不是，大输入趋近 33.33%，小输入因 padding 比例更高。' }, { question: '去掉 padding 能解决吗？', answer: '不能，最多节省两个字符。' }, { question: 'gzip 能消除全部开销吗？', answer: '不能保证，尤其是已压缩文件。' }],
    }
  ),
  article(
    'base64-vs-url-encoding-vs-text-encoding',
    {
      title: 'Base64 vs URL Encoding vs Text Encoding', excerpt: 'Compare Base64, percent-encoding, UTF-8, Unicode escapes, and HTML entities by data layer and purpose.',
      metaTitle: 'Base64 vs URL Encoding vs UTF-8', metaDescription: 'Compare Base64, URL percent-encoding, UTF-8, Unicode escapes, and HTML entities with examples, correct ordering, and common mistakes.',
      readingTime: '9 min read', tags: ['Base64 vs URL encoding', 'UTF-8', 'percent encoding'], relatedTools: [codecEn, { label: 'URL Builder', href: '/url-builder', description: 'Build correctly encoded query parameters.' }],
      lead: 'UTF-8 maps characters to bytes, Base64 maps bytes to restricted text, and URL percent-encoding protects data inside URI components. They are different layers, not interchangeable styles.',
      intro: 'Broken APIs often apply a correct algorithm at the wrong layer: calling btoa on Unicode, encoding an entire URL as one component, or treating reversible representation as encryption.',
      sections: [
        { heading: 'A layer model', paragraphs: ['A JavaScript string represents Unicode text. TextEncoder produces UTF-8 bytes. Base64 can represent those bytes as ASCII. If that value enters a query parameter, it may then need percent-encoding.', 'Order matters. The text 你好 must become UTF-8 bytes before Base64; standard Base64 plus, slash, and equals characters may need escaping in a URL.'], code: { language: 'text', code: 'Unicode text -> UTF-8 bytes -> Base64 text -> URL component' } },
        { heading: 'What each mechanism does', paragraphs: ['UTF-8 enables interoperable text storage. Base64 carries arbitrary bytes through text-only channels. Percent-encoding protects URI syntax. Unicode escapes are source notation; HTML entities belong to HTML parsing contexts.', 'None provides confidentiality. They solve representation and syntax problems.'], table: { headers: ['Mechanism', 'Input', 'Output', 'Purpose'], rows: [['UTF-8', 'Unicode text', 'Bytes', 'Text interchange'], ['Base64', 'Bytes', 'ASCII text', 'Binary in text'], ['Percent encoding', 'URL component', '%HH', 'URI safety'], ['Unicode escape', 'Code point/unit', '\\uXXXX', 'Source notation'], ['HTML entity', 'HTML character', '&name;', 'HTML context']] } },
        { heading: 'Base64 is not a charset', paragraphs: ['Base64 only sees bytes. Encode text with TextEncoder first and decode bytes with TextDecoder after Base64 decoding.', 'btoa assumes byte-like Latin-1 input and can fail on non-ASCII. Byte-first code avoids this legacy trap.'] },
        { heading: 'URL context matters', paragraphs: ['encodeURIComponent is for one path or query component; encodeURI preserves complete URL separators. Encoding a complete URL with encodeURIComponent breaks its structure.', 'In form-encoded queries, plus can represent space. URLSearchParams applies the correct serialization rules and avoids manual substitutions.'] },
        { heading: 'Base64URL is still not encryption', paragraphs: ['Base64URL replaces plus and slash with URL-friendly characters and often omits padding. JWT uses Base64URL segments.', 'Anyone can normally decode JWT header and payload; signature verification is separate.'] },
        { heading: 'Selection rules', paragraphs: ['Choose according to the receiving interface, not appearance. Send binary when supported, Base64 only to text-only fields, percent-encode URL components, and use UTF-8 for text boundaries.'], items: ['Text to bytes: UTF-8.', 'Bytes to text field: Base64.', 'Query value: URLSearchParams.', 'JWT segment: Base64URL plus signature verification.', 'HTML: escape for HTML context.'] },
      ],
      callout: { type: 'callout', title: 'Measure Base64 overhead', text: 'See the exact 4-to-3 size calculation and padding cases.', href: '/blog/why-base64-increases-file-size-33-percent', linkLabel: 'Read the size guide' },
      conclusion: 'Choose by layer: UTF-8 defines bytes for text, Base64 turns bytes into restricted text, and percent-encoding protects a URI component. This prevents corrupted Unicode, broken links, and false security assumptions.',
      faq: [{ question: 'Should URL parameters be Base64?', answer: 'Only if the API requires it; the result may still need URL encoding.' }, { question: 'Are encodeURI and encodeURIComponent interchangeable?', answer: 'No. One preserves URL structure; the other encodes one component.' }, { question: 'Is Base64 encryption?', answer: 'No, it is reversible encoding.' }],
    },
    {
      title: 'Base64、URL Encode 和普通文本编码有什么区别？', excerpt: '从数据层次和用途对比 Base64、百分号编码、UTF-8、Unicode 转义与 HTML 实体。',
      metaTitle: 'Base64、URL Encode、UTF-8 区别', metaDescription: '对比 Base64、URL 百分号编码、UTF-8、Unicode 转义和 HTML 实体，解释正确顺序、字节行为与常见错误。',
      readingTime: '约 9 分钟阅读', tags: ['Base64 与 URL 编码', 'UTF-8', '百分号编码'], relatedTools: [codecZh, { label: 'URL 构建器', href: '/url-builder', description: '生成正确编码的查询参数。' }],
      lead: 'UTF-8 把字符映射成字节，Base64 把字节映射成受限文本，URL 百分号编码保护 URI 组件。它们位于不同层次，不是可以互换的样式。',
      intro: '许多 API 问题来自把正确算法用错层：对 Unicode 直接 btoa、把整个 URL 当单个组件编码，或把可逆表示当作加密。',
      sections: [
        { heading: '分层模型', paragraphs: ['JavaScript 字符串表示 Unicode。TextEncoder 生成 UTF-8 字节，Base64 再把字节表示为 ASCII；该值进入查询参数时还可能需要百分号编码。', '顺序很重要。“你好”要先变成 UTF-8 字节再做 Base64；标准 Base64 的加号、斜杠和等号进入 URL 时可能仍需转义。'], code: { language: 'text', code: 'Unicode 文本 -> UTF-8 字节 -> Base64 文本 -> URL 组件' } },
        { heading: '每种机制的职责', paragraphs: ['UTF-8 用于文本互操作，Base64 让任意字节进入纯文本通道，百分号编码保护 URI 语法，Unicode 转义是源码表示，HTML 实体属于 HTML 解析上下文。', '它们都不提供保密性，只解决表示和语法问题。'], table: { headers: ['机制', '输入', '输出', '用途'], rows: [['UTF-8', 'Unicode 文本', '字节', '文本互操作'], ['Base64', '字节', 'ASCII 文本', '二进制进文本'], ['百分号编码', 'URL 组件', '%HH', 'URI 安全'], ['Unicode 转义', 'Code point/unit', '\\uXXXX', '源码表示'], ['HTML 实体', 'HTML 字符', '&name;', 'HTML 上下文']] } },
        { heading: 'Base64 不是字符集', paragraphs: ['Base64 只处理字节。文本应先经 TextEncoder，Base64 解码后的字节再由 TextDecoder 恢复。', 'btoa 假设输入是类似 Latin-1 的单字节字符，非 ASCII 可能失败；字节优先实现能避开问题。'] },
        { heading: 'URL 上下文很重要', paragraphs: ['encodeURIComponent 用于单个路径或查询组件，encodeURI 保留完整 URL 分隔符。对完整 URL 使用 encodeURIComponent 会破坏结构。', '表单查询中加号可以表示空格，URLSearchParams 能按规则序列化，避免手工替换。'] },
        { heading: 'Base64URL 仍不是加密', paragraphs: ['Base64URL 替换加号和斜杠，并常省略 padding；JWT 使用 Base64URL 分段。', 'JWT Header 与 Payload 通常任何人都能解码，签名验证是另一回事。'] },
        { heading: '选择规则', paragraphs: ['按接收接口选择：支持二进制就直接发送，纯文本字段明确要求才用 Base64，URL 组件做百分号编码，文本边界使用 UTF-8。'], items: ['文本转字节：UTF-8。', '字节进文本字段：Base64。', '查询值：URLSearchParams。', 'JWT：Base64URL 加签名验证。', 'HTML：按 HTML 上下文转义。'] },
      ],
      callout: { type: 'callout', title: '计算 Base64 开销', text: '查看精确 4:3 体积公式和 padding 情况。', href: '/blog/why-base64-increases-file-size-33-percent', linkLabel: '阅读体积指南' },
      conclusion: '按层次选择：UTF-8 定义文本字节，Base64 把字节变成受限文本，百分号编码保护 URI 组件，才能避免 Unicode 损坏、链接失效和虚假安全感。',
      faq: [{ question: 'URL 参数应该先 Base64 吗？', answer: '只有 API 要求时才需要，结果仍可能需要 URL 编码。' }, { question: 'encodeURI 和 encodeURIComponent 能互换吗？', answer: '不能，一个保留 URL 结构，一个编码单个组件。' }, { question: 'Base64 是加密吗？', answer: '不是，它是可逆编码。' }],
    }
  ),
  article(
    'browser-image-compression-canvas-blob',
    {
      title: 'How Does Browser Image Compression Work?', excerpt: 'Follow an image from File input through decode, Canvas resize, quality settings, Blob output, metadata changes, and visual checks.',
      metaTitle: 'Browser Image Compression: Canvas and Blob', metaDescription: 'Learn browser image compression with File, createImageBitmap, Canvas, quality settings, WebP and JPEG encoders, Blob output, metadata, and memory limits.',
      readingTime: '11 min read', tags: ['browser image compression', 'Canvas', 'Blob', 'image quality'], relatedTools: [{ label: 'Image Compressor', href: '/image/compress', description: 'Compress supported images locally.' }, { label: 'Image Resizer', href: '/image/resize', description: 'Reduce pixel dimensions before encoding.' }],
      lead: 'Browser image compression is a decode-transform-encode pipeline: read a File, decode compressed bytes into pixels, resize or edit on Canvas, then encode a new JPEG, WebP, PNG, or AVIF Blob.',
      intro: 'The quality slider controls only part of the result. Pixel dimensions, source noise, format, alpha, metadata, repeated encoding, and codec support often matter more than changing quality from 0.82 to 0.78.',
      sections: [
        { heading: 'The local pipeline', paragraphs: ['createImageBitmap, an img element, or ImageDecoder decodes the File. Canvas provides a normalized surface for resize, crop, rotation, and compositing. Canvas.toBlob or a local codec creates output.', 'The Blob can be previewed through createObjectURL and downloaded. No upload is necessary because each stage runs in browser APIs.'], code: { language: 'typescript', code: "const bitmap = await createImageBitmap(file);\nctx.drawImage(bitmap, 0, 0, width, height);\nconst blob = await new Promise<Blob>((resolve) =>\n  canvas.toBlob((value) => resolve(value!), 'image/webp', 0.82)\n);" } },
        { heading: 'Resize before aggressive quality loss', paragraphs: ['A 4000 × 3000 photo contains 12 million pixels; a 1000 × 750 display needs 750,000, one sixteenth as many. Removing unnecessary dimensions often saves more with fewer artifacts than forcing full resolution to very low quality.', 'Preserve aspect ratio unless distortion is intended. Screenshots and line art need different filtering and format choices from photographs.'] },
        { heading: 'Quality is an encoder hint', paragraphs: ['Canvas quality is generally a 0-to-1 hint for lossy encoders, not a universal visual percentage. Quality 0.8 can produce different size and artifacts across browsers and formats.', 'PNG is normally lossless and may ignore quality. AVIF may need a WASM codec when Canvas encoding is unavailable. Verify the returned Blob type instead of assuming the requested MIME worked.'] },
        { heading: 'Format changes the answer', paragraphs: ['JPEG is effective for photos without transparency; PNG preserves sharp edges and alpha but can be large for photos; WebP supports lossy, lossless, and alpha; AVIF can be efficient but slower.', 'Text screenshots may look poor as low-quality JPEG. Transparent images cannot become ordinary JPEG without compositing a background.'] },
        { heading: 'Metadata, orientation, and color', paragraphs: ['Canvas re-encoding commonly drops EXIF such as GPS, camera settings, timestamps, and copyright. That may improve privacy but remove needed provenance. Orientation must be applied before export.', 'Color profiles and wide-gamut data may be normalized. Print, medical, legal, and archival workflows need controlled software and profile verification.'] },
        { heading: 'Memory and verification', paragraphs: ['Compressed files decode to width × height × roughly four RGBA bytes, plus source, Canvas, intermediate, and output buffers. Set pixel limits, process batches sequentially, use Workers where practical, close ImageBitmap, and revoke stale URLs.', 'Inspect text, faces, gradients, and edges at intended size and 100%. Verify dimensions, MIME, alpha, orientation, and bytes. Avoid repeated lossy exports.'], items: ['Resize before lowering quality heavily.', 'Keep the original.', 'Verify output MIME and dimensions.', 'Check metadata behavior.', 'Avoid repeated JPEG/WebP encoding.'] },
      ],
      callout: { type: 'callout', title: 'Choose the right format', text: 'Compare JPEG, PNG, WebP, and AVIF by content, alpha, quality, compatibility, and encoding cost.', href: '/blog/jpg-png-webp-avif-differences', linkLabel: 'Compare image formats' },
      conclusion: 'Reliable compression combines dimension reduction, a content-appropriate format, measured quality, explicit metadata behavior, memory controls, and output inspection. Canvas and Blob provide the core path.',
      faq: [{ question: 'Does Canvas upload an image?', answer: 'No. Upload occurs only if application code separately sends data over the network.' }, { question: 'Why can output be larger?', answer: 'Format, dimensions, source compression, and encoder settings can produce a larger result.' }, { question: 'Does quality 0.8 mean 80%?', answer: 'No, it is an encoder hint, not a standardized visual score.' }],
    },
    {
      title: '浏览器如何实现图片压缩？', excerpt: '跟踪图片从 File 输入到解码、Canvas 缩放、质量参数、Blob 输出、元数据变化和视觉检查。',
      metaTitle: '浏览器图片压缩：Canvas 与 Blob', metaDescription: '详解浏览器图片压缩：File、createImageBitmap、Canvas、质量参数、JPEG/WebP 编码、Blob 输出、元数据与内存限制。',
      readingTime: '约 11 分钟阅读', tags: ['浏览器图片压缩', 'Canvas', 'Blob', '图片质量'], relatedTools: [{ label: '图片压缩', href: '/image/compress', description: '在本地压缩受支持图片。' }, { label: '图片尺寸调整', href: '/image/resize', description: '编码前减少像素尺寸。' }],
      lead: '浏览器图片压缩是“解码—变换—编码”链路：读取 File，把压缩字节解码为像素，在 Canvas 上缩放或编辑，再编码为新的 JPEG、WebP、PNG 或 AVIF Blob。',
      intro: '质量滑块只控制一部分结果。像素尺寸、原图噪声、格式、透明通道、元数据、重复编码和编解码支持，往往比把质量从 0.82 调到 0.78 更重要。',
      sections: [
        { heading: '本地处理链', paragraphs: ['createImageBitmap、img 或 ImageDecoder 解码 File；Canvas 提供缩放、裁剪、旋转和合成表面；Canvas.toBlob 或本地编解码器生成输出。', 'Blob 通过 createObjectURL 预览和下载，每个阶段都由浏览器 API 完成，无需上传。'], code: { language: 'typescript', code: "const bitmap = await createImageBitmap(file);\nctx.drawImage(bitmap, 0, 0, width, height);\nconst blob = await new Promise<Blob>((resolve) =>\n  canvas.toBlob((value) => resolve(value!), 'image/webp', 0.82)\n);" } },
        { heading: '先缩尺寸，再激进降质量', paragraphs: ['4000 × 3000 照片有 1200 万像素，1000 × 750 只需 75 万，是十六分之一。先删除不必要尺寸，通常比把全分辨率压到极低质量更小且瑕疵更少。', '除非故意变形，否则保持宽高比；截图与线条图的滤波和格式策略应区别于照片。'] },
        { heading: '质量只是编码器提示', paragraphs: ['Canvas 质量通常是 0 到 1 的有损编码提示，不是统一画质百分比。同一个 0.8 在不同浏览器和格式中会产生不同体积和瑕疵。', 'PNG 通常无损，可能忽略质量。Canvas 无法编码 AVIF 时可用 WASM；应验证返回 Blob 的真实 type。'] },
        { heading: '格式决定结果', paragraphs: ['JPEG 适合无透明照片；PNG 保留锐利边缘和 alpha，但照片体积大；WebP 支持有损、无损和透明；AVIF 效率高但编码慢。', '文字截图用低质量 JPEG 容易变糊，透明图片转 JPEG 前必须先合成背景。'] },
        { heading: '元数据、方向与色彩', paragraphs: ['Canvas 重编码通常移除 GPS、相机参数、时间与版权等 EXIF，可能改善隐私，也可能清除来源信息；导出前要应用方向。', '色彩 Profile 和广色域可能被规范化，印刷、医疗、法律与归档流程应使用受控软件验证。'] },
        { heading: '内存与验收', paragraphs: ['压缩文件解码后约占宽 × 高 × 四字节 RGBA，再加源、Canvas、中间和输出。应限制像素、串行处理批次、使用 Worker、关闭 ImageBitmap 并释放旧 URL。', '按实际尺寸和 100% 检查文字、人脸、渐变与边缘，验证尺寸、MIME、透明、方向和体积，避免反复有损导出。'], items: ['先缩尺寸。', '保留原图。', '验证 MIME 与尺寸。', '检查元数据。', '避免反复 JPEG/WebP 编码。'] },
      ],
      callout: { type: 'callout', title: '选择正确格式', text: '按内容、透明、质量、兼容性和编码成本对比 JPEG、PNG、WebP 与 AVIF。', href: '/blog/jpg-png-webp-avif-differences', linkLabel: '对比图片格式' },
      conclusion: '可靠压缩结合尺寸缩减、适合内容的格式、经过测量的质量、明确元数据行为、内存控制和输出检查。Canvas 与 Blob 提供核心链路。',
      faq: [{ question: 'Canvas 会上传图片吗？', answer: '不会，只有应用代码另行把数据发往网络才会上传。' }, { question: '为什么输出可能更大？', answer: '格式、尺寸、源压缩和编码设置都可能导致更大。' }, { question: '质量 0.8 等于 80% 吗？', answer: '不等于，它是编码器提示，不是标准画质分数。' }],
    }
  ),
  article(
    'uuid-v4-generation-and-collision-probability',
    {
      title: 'How Is UUID v4 Generated, and Why Is It Unlikely to Repeat?', excerpt: 'Understand UUID v4 bit layout, browser crypto, birthday-bound collision math, unsafe generators, and database constraints.',
      metaTitle: 'UUID v4 Generation and Collision Probability', metaDescription: 'Learn UUID v4 generation with crypto.randomUUID and crypto.getRandomValues, 122 random bits, version masks, collision probability, and secure implementation.',
      readingTime: '9 min read', tags: ['UUID v4', 'crypto.getRandomValues', 'collision probability'], relatedTools: [{ label: 'UUID Generator', href: '/uuid', description: 'Generate v1, v4, v7, and Nano ID values locally.' }],
      lead: 'UUID v4 has fixed version and variant bits plus 122 random bits. Its enormous random space makes collisions extremely unlikely when the random-number generator is cryptographically strong.',
      intro: '“Practically unique” is probability, not proof. Correct randomness, preserving every bit, database constraints, and system scope matter more than copying a familiar UUID-shaped snippet.',
      sections: [
        { heading: 'The 128-bit layout', paragraphs: ['A UUID is 32 hexadecimal digits in 8-4-4-4-12 groups. v4 fixes four version bits to 0100 and variant high bits to 10, leaving 122 random bits.', 'Hyphens and hexadecimal case do not change entropy.'], code: { language: 'text', code: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\n4 = version 4; y begins with variant bits 10' } },
        { heading: 'Secure browser generation', paragraphs: ['crypto.randomUUID() directly returns a v4 UUID. A fallback fills 16 bytes with crypto.getRandomValues, then masks version and variant bits.', 'Math.random is not designed for security and may have far less state, so it should not generate identifiers whose collision or unpredictability properties matter.'], code: { language: 'typescript', code: 'const b = crypto.getRandomValues(new Uint8Array(16));\nb[6] = (b[6] & 0x0f) | 0x40;\nb[8] = (b[8] & 0x3f) | 0x80;' } },
        { heading: 'How large is 122 bits?', paragraphs: ['The space contains 2^122 values, about 5.3 × 10^36. Matching one particular UUID is about one chance in that number.', 'For n generated values, the small-probability birthday approximation is p ≈ n(n−1)/(2 × 2^122). One billion ideal UUIDs still gives roughly 9.4 × 10^-20.'] },
        { heading: 'Real failures beat random collisions', paragraphs: ['Broken RNG seeding, deterministic test mocks, cloned machine state, implementation bugs, and truncation can dominate the ideal collision risk.', 'Never shorten a UUID without recalculating the new random space and expected scale.'] },
        { heading: 'Databases still need uniqueness', paragraphs: ['Use a unique index and retry the exceptionally rare conflict. This also catches duplicate imports and accidental reuse.', 'A random ID is not authorization. It may resist enumeration, but access checks must remain independent.'] },
        { heading: 'v4 versus v7', paragraphs: ['v4 is random and not naturally ordered. v7 combines Unix-millisecond high bits with randomness, improving sort locality for many databases.', 'Choose based on ordering, index behavior, information exposure, and ecosystem support.'] },
      ],
      callout: { type: 'callout', title: 'Generate UUIDs locally', text: 'ToolGarden uses randomUUID when available and a getRandomValues fallback.', href: '/uuid', linkLabel: 'Open UUID Generator' },
      conclusion: 'UUID v4 works because 122 high-quality random bits create a vast space, not because collision is impossible. Use browser crypto, keep all bits, enforce uniqueness, and separate authorization.',
      faq: [{ question: 'Can UUID v4 collide?', answer: 'Yes in principle, but correct full-length generation makes it extremely unlikely at normal scale.' }, { question: 'Is Math.random enough?', answer: 'No. Use crypto.randomUUID or crypto.getRandomValues.' }, { question: 'Do I need a unique index?', answer: 'Yes, to catch both improbable collisions and ordinary software mistakes.' }],
    },
    {
      title: 'UUID v4 是怎么生成的？为什么几乎不会重复？', excerpt: '理解 UUID v4 位布局、浏览器 Crypto、生日碰撞计算、不安全随机数和数据库约束。',
      metaTitle: 'UUID v4 生成原理与碰撞概率', metaDescription: '详解 UUID v4：crypto.randomUUID、crypto.getRandomValues、122 个随机位、版本掩码、碰撞概率与安全实现。',
      readingTime: '约 9 分钟阅读', tags: ['UUID v4', 'crypto.getRandomValues', '碰撞概率'], relatedTools: [{ label: 'UUID 生成器', href: '/uuid', description: '在本地生成 v1、v4、v7 和 Nano ID。' }],
      lead: 'UUID v4 包含固定版本与变体位，以及 122 个随机位。只要随机源足够强，巨大空间会让碰撞概率极低。',
      intro: '“几乎唯一”是概率，不是证明。正确随机、保留全部位、数据库约束和系统规模，比复制一个 UUID 形状的代码片段更重要。',
      sections: [
        { heading: '128-bit 布局', paragraphs: ['UUID 是按 8-4-4-4-12 分组的 32 个十六进制数字。v4 固定四个版本位为 0100，变体高位为 10，剩余 122 bit 随机。', '连字符和大小写不会改变熵。'], code: { language: 'text', code: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx\n4 = version 4；y 高位是变体位 10' } },
        { heading: '安全浏览器生成', paragraphs: ['crypto.randomUUID() 直接返回 v4；Fallback 用 crypto.getRandomValues 填充 16 字节，再设置版本与变体位。', 'Math.random 不是安全随机源，状态可能小得多，不适合依赖低碰撞或不可预测性的 ID。'], code: { language: 'typescript', code: 'const b = crypto.getRandomValues(new Uint8Array(16));\nb[6] = (b[6] & 0x0f) | 0x40;\nb[8] = (b[8] & 0x3f) | 0x80;' } },
        { heading: '122 bit 有多大', paragraphs: ['空间包含 2^122 个值，约 5.3 × 10^36。与某个指定 UUID 相同约为这个数字的倒数。', '生成 n 个值时，小概率生日近似为 p ≈ n(n−1)/(2 × 2^122)。理想条件下 10 亿个 UUID 仍只有约 9.4 × 10^-20。'] },
        { heading: '真实故障比随机碰撞更重要', paragraphs: ['错误 RNG 播种、确定性测试 Mock、机器状态克隆、实现 bug 与截断，远比理想随机碰撞常见。', '截短 UUID 前必须重新计算新空间与规模风险。'] },
        { heading: '数据库仍需唯一约束', paragraphs: ['建立唯一索引并在极少冲突时重试，也能阻止重复导入与意外复用。', '随机 ID 不是授权。它可能难枚举，但访问控制必须独立。'] },
        { heading: 'v4 与 v7', paragraphs: ['v4 随机且无自然顺序；v7 用 Unix 毫秒高位加随机数，通常改善数据库排序局部性。', '应按排序、索引、信息暴露和生态支持选择。'] },
      ],
      callout: { type: 'callout', title: '在本地生成 UUID', text: 'ToolGarden 优先使用 randomUUID，并提供 getRandomValues fallback。', href: '/uuid', linkLabel: '打开 UUID 生成器' },
      conclusion: 'UUID v4 可靠是因为 122 个高质量随机位形成巨大空间，不是因为绝不碰撞。使用浏览器 Crypto、保留完整位、强制唯一，并把授权独立处理。',
      faq: [{ question: 'UUID v4 会碰撞吗？', answer: '理论上会，正确完整生成在普通规模下概率极低。' }, { question: 'Math.random 足够吗？', answer: '不够，应使用 crypto.randomUUID 或 crypto.getRandomValues。' }, { question: '需要唯一索引吗？', answer: '需要，用于防范极小碰撞和常见软件错误。' }],
    }
  ),
  article(
    'unix-timestamp-seconds-vs-milliseconds',
    {
      title: 'What Is a Unix Timestamp? Seconds vs Milliseconds', excerpt: 'Understand epoch time, seconds, milliseconds, microseconds, timezone display, digit heuristics, precision, and conversion bugs.',
      metaTitle: 'Unix Timestamp: Seconds vs Milliseconds', metaDescription: 'Learn Unix timestamps, epoch time, seconds versus milliseconds, 10-digit and 13-digit detection, JavaScript Date conversion, timezone, and precision.',
      readingTime: '9 min read', tags: ['Unix timestamp', 'seconds vs milliseconds', 'JavaScript Date'], relatedTools: [{ label: 'Timestamp Converter', href: '/timestamp', description: 'Convert seconds, milliseconds, microseconds, ISO, UTC, and local time.' }],
      lead: 'A Unix timestamp measures elapsed time from 1970-01-01 00:00:00 UTC. The number normally contains no timezone; its unit determines whether conversion produces the intended date.',
      intro: 'The classic bug is a factor of 1,000: one system sends seconds while another expects milliseconds, producing 1970 or a far-future date. Digit count helps diagnosis, but explicit units are safer.',
      sections: [
        { heading: 'Epoch and timezone', paragraphs: ['Timestamp 0 identifies the UTC epoch. Positive values follow it and supported negative values precede it.', 'Timezone enters during human display. Shanghai and New York show different clocks for the same instant. Recurring local schedules need a timezone database, not only a timestamp.'] },
        { heading: 'Seconds, milliseconds, microseconds', paragraphs: ['Traditional Unix time uses seconds; JavaScript Date uses milliseconds; logs and traces may use microseconds or nanoseconds. A bare number cannot identify its unit.', 'Current dates are commonly 10 digits in seconds, 13 in milliseconds, and 16 in microseconds. Far dates break that heuristic.'], table: { headers: ['Unit', 'Current digits', 'To milliseconds'], rows: [['Seconds', '10', '× 1,000'], ['Milliseconds', '13', 'unchanged'], ['Microseconds', '16', '÷ 1,000'], ['Nanoseconds', '19', '÷ 1,000,000']] } },
        { heading: 'JavaScript conversion', paragraphs: ['new Date(number) treats the number as milliseconds. Multiply seconds by 1,000. Date.getTime returns milliseconds; floor(Date.now()/1000) returns integer seconds.', 'Machine APIs should exchange ISO strings with Z or offsets, or numeric fields with named units. Date-time strings without offsets invite local-time ambiguity.'], code: { language: 'typescript', code: 'const ms = Date.now();\nconst sec = Math.floor(ms / 1000);\nnew Date(sec * 1000);\nnew Date(ms);' } },
        { heading: 'Auto-detection limits', paragraphs: ['Magnitude is useful for pasted contemporary values. ToolGarden interprets below roughly 1e11 as seconds, below 1e14 as milliseconds, and larger values as microseconds, while allowing manual unit selection.', 'Do not rely only on string length: negatives, decimals, leading zeros, and distant dates complicate it. Show the interpreted unit before conversion.'] },
        { heading: 'Precision and leap seconds', paragraphs: ['JavaScript Number exactly represents integers only through 2^53−1. Practical millisecond epochs fit, but contemporary nanoseconds do not. Use BigInt or decimal strings when sub-millisecond digits matter.', 'Date stores milliseconds, so microsecond conversion loses detail. Unix time also does not normally represent leap seconds as distinct ordinary values.'] },
        { heading: 'Debugging checklist', paragraphs: ['Confirm unit first, then timezone, then parser assumptions. Compare raw number, ISO output, UTC, and local display. Name fields createdAtSeconds or createdAtMs rather than ambiguous createdAt.'], items: ['1970: seconds likely treated as milliseconds.', 'Far future: milliseconds likely multiplied again.', 'Hour shift: inspect timezone.', 'Lost ordering: sub-millisecond precision was discarded.', 'Day shift: inspect date-only parsing.'] },
      ],
      callout: { type: 'callout', title: 'Inspect a timestamp locally', text: 'See detected unit, ISO, UTC, local, relative time, and equivalent values.', href: '/timestamp', linkLabel: 'Open Timestamp Converter' },
      conclusion: 'Unix timestamps are simple only when units are explicit. Normalize at boundaries, use milliseconds with JavaScript Date, preserve higher precision separately, and apply timezone rules during presentation or scheduling.',
      faq: [{ question: 'Is 13 digits always milliseconds?', answer: 'It is a strong current-era heuristic, not a universal rule.' }, { question: 'Does a timestamp contain timezone?', answer: 'No, it identifies an instant relative to UTC.' }, { question: 'Why does new Date(seconds) show 1970?', answer: 'JavaScript expects milliseconds; multiply by 1,000.' }],
    },
    {
      title: 'Unix Timestamp 是什么？秒和毫秒时间戳有什么区别？', excerpt: '理解 Epoch、秒、毫秒、微秒、时区显示、位数判断、精度与转换错误。',
      metaTitle: 'Unix Timestamp：秒与毫秒区别', metaDescription: '详解 Unix 时间戳、Epoch、秒与毫秒、10 位和 13 位判断、JavaScript Date 转换、时区和精度。',
      readingTime: '约 9 分钟阅读', tags: ['Unix 时间戳', '秒与毫秒', 'JavaScript Date'], relatedTools: [{ label: '时间戳转换', href: '/timestamp', description: '转换秒、毫秒、微秒、ISO、UTC 和本地时间。' }],
      lead: 'Unix Timestamp 表示从 1970-01-01 00:00:00 UTC 起经过的时间。数字通常不含时区，单位决定转换后是否为预期日期。',
      intro: '经典错误是相差 1000 倍：一个系统发秒，另一个按毫秒读，结果落在 1970 或遥远未来。位数有助诊断，明确单位更可靠。',
      sections: [
        { heading: 'Epoch 与时区', paragraphs: ['时间戳 0 表示 UTC Epoch，正数在之后，平台支持的负数在之前。', '时区在向人展示时介入。上海和纽约会为同一瞬间显示不同钟表时间；重复本地日程需要时区数据库。'] },
        { heading: '秒、毫秒与微秒', paragraphs: ['传统 Unix 时间用秒，JavaScript Date 用毫秒，日志和 Trace 可能用微秒或纳秒。裸数字无法说明单位。', '当前日期通常是 10 位秒、13 位毫秒、16 位微秒；远期日期会破坏该启发式。'], table: { headers: ['单位', '当前位数', '转毫秒'], rows: [['秒', '10', '× 1,000'], ['毫秒', '13', '不变'], ['微秒', '16', '÷ 1,000'], ['纳秒', '19', '÷ 1,000,000']] } },
        { heading: 'JavaScript 转换', paragraphs: ['new Date(number) 把数字当毫秒，秒值要先乘 1000；Date.getTime 返回毫秒，floor(Date.now()/1000) 返回整数秒。', '机器接口应交换带 Z/Offset 的 ISO，或单位命名明确的数值字段；无 Offset 日期会产生本地时区歧义。'], code: { language: 'typescript', code: 'const ms = Date.now();\nconst sec = Math.floor(ms / 1000);\nnew Date(sec * 1000);\nnew Date(ms);' } },
        { heading: '自动判断的边界', paragraphs: ['数值大小适合粘贴当前时间。ToolGarden 把约 1e11 以下当秒、1e14 以下当毫秒、更大当微秒，并允许手动选择。', '不要只看字符串长度：负号、小数、前导零和远期日期会干扰。转换前应显示解释出的单位。'] },
        { heading: '精度与闰秒', paragraphs: ['JavaScript Number 只能精确表示到 2^53−1。实用毫秒值安全，当前纳秒值已不安全；需要亚毫秒精度时使用 BigInt 或字符串。', 'Date 只保存毫秒，微秒转换会丢失细节；Unix 时间通常也不把闰秒作为普通独立值。'] },
        { heading: '排查清单', paragraphs: ['先确认单位，再检查时区和解析器。对比原始值、ISO、UTC 与本地显示。字段应命名 createdAtSeconds 或 createdAtMs。'], items: ['1970：很可能把秒当毫秒。', '遥远未来：可能把毫秒再次乘 1000。', '相差小时：检查时区。', '排序丢失：亚毫秒精度被丢弃。', '相差一天：检查仅日期解析。'] },
      ],
      callout: { type: 'callout', title: '在本地检查时间戳', text: '查看检测单位、ISO、UTC、本地、相对时间和等价值。', href: '/timestamp', linkLabel: '打开时间戳转换' },
      conclusion: 'Unix 时间戳只有单位明确时才简单。系统边界统一单位，JavaScript Date 使用毫秒，高精度另行保留，时区规则用于展示和日程。',
      faq: [{ question: '13 位一定是毫秒吗？', answer: '对当前年代是强启发式，不是普遍规则。' }, { question: '时间戳含时区吗？', answer: '不含，它标识相对 UTC 的瞬间。' }, { question: '为什么 new Date(秒) 显示 1970？', answer: 'JavaScript 期待毫秒，需要先乘 1000。' }],
    }
  ),
] satisfies BlogArticle[];
