import { defineToolContent } from './define';

export const imageToBase64Content = defineToolContent({
  zh: {
    overview: [
      '图片转 Base64 会把二进制字节编码为可放入文本的 ASCII 字符，并可生成带 MIME 类型的 data URL。它适合把很小的图标嵌入 CSS、HTML、JSON 或测试数据，但编码后文本通常比原始二进制大约三分之一。',
      'Base64 不会压缩图片，也不提供加密。把大图直接嵌入页面会增大 HTML 或脚本、失去独立缓存并拖慢解析，因此应先比较普通图片 URL、构建工具内联和 Base64 的实际成本。',
    ],
    steps: [
      ['选择图片文件', '确认格式和体积，并先压缩不必要的大尺寸素材。'],
      ['生成编码文本', '根据目标字段选择纯 Base64 或包含 MIME 前缀的 data URL。'],
      ['放入目标位置测试', '检查引号、长度限制和渲染结果，确保接收方不会再次编码。'],
    ],
    scenarios: [
      ['制作自包含样例', '把小图片放入 API 测试夹具或单文件 HTML，避免额外资源依赖。'],
      ['准备接口字段', '按接口约定提交纯 Base64 图片内容及独立 MIME 类型。'],
      ["把小图标内联进样式表", "几百字节的图标转成 Data URL 写进 CSS，可以省掉一次网络请求，避免首屏图标闪烁。"],
    ],
    notes: [
      'Base64 文本可被直接还原，不能用于隐藏敏感图片。',
      'data URL 包含 `data:`、MIME 类型和逗号前缀，纯 Base64 字段通常不能接收这些字符。',
      '超长字符串可能超过数据库、表单或网关限制，应先确认接收系统的最大长度。',
    ],
    specs: [["输出形式", "Base64 字符串或完整的 Data URL（含 data:image/...;base64, 前缀）"], ["体积代价", "Base64 编码后约比原文件大 33%，这是编码方式决定的固定开销"], ["输入方式", "选择文件、拖入，或直接从剪贴板粘贴图片"], ["典型用途", "内联进 HTML / CSS 省一次请求、写进 JSON 字段、嵌入邮件模板"], ["不适合的场景", "大图内联会显著撑大 HTML / CSS 文件，且无法被浏览器单独缓存"], ["处理位置", "编码在浏览器内完成，图片不上传"]],
    faq: [{ question: "多大的图适合转 Base64？", answer: "一般只建议几 KB 以内的小图标。Base64 会让体积增加约三分之一，而且内联后无法被浏览器单独缓存：大图内联会让 HTML 或 CSS 每次都重新下载。" }, { question: "要用带前缀的 Data URL 还是裸字符串？", answer: "写进 HTML 的 src 或 CSS 的 url() 需要完整 Data URL（含 data:image/png;base64, 前缀）。存进 JSON 字段或数据库时通常用裸字符串，由读取方自行拼前缀。" }],
    reference: [
      ['Base64', '用 64 个可打印字符表示任意二进制字节的编码方法。'],
      ['data URL', '把 MIME 类型和编码数据直接写入 URL 的 `data:` 方案。'],
    ],
  },
  en: {
    overview: [
      'Image to Base64 represents binary bytes with printable ASCII and can produce a data URL containing the MIME type. It is useful for embedding a very small icon in CSS, HTML, JSON, or a test fixture, but the encoded text is commonly about one-third larger than the binary file.',
      'Base64 neither compresses nor encrypts an image. Embedding a large image expands markup or scripts, removes independent caching, and increases parsing work, so compare a normal image URL, build-time inlining, and Base64 for the real use case.',
    ],
    steps: [
      ['Choose an image file', 'Check its format and size, and reduce unnecessary dimensions before encoding.'],
      ['Generate the text', 'Select raw Base64 or a data URL with MIME prefix according to the destination field.'],
      ['Test in the destination', 'Check quoting, length limits, and rendering, and make sure the receiver does not encode it again.'],
    ],
    scenarios: [
      ['Creating a self-contained example', 'Embed a small image in an API fixture or single-file HTML document without another resource dependency.'],
      ['Preparing an API field', 'Submit raw Base64 image data and a separate MIME type when required by an endpoint.'],
      ["Inlining a small icon into a stylesheet", "A few hundred bytes of icon as a Data URL in CSS saves a request and avoids the icon flashing in on first paint."],
    ],
    notes: [
      'Base64 is directly reversible and must not be used to conceal a sensitive image.',
      'A data URL includes the `data:` scheme, MIME type, and comma prefix; a raw Base64 field usually must not include them.',
      'Long strings can exceed database, form, or gateway limits, so confirm the receiver’s maximum length.',
    ],
    specs: [["Output form", "A Base64 string, or a complete Data URL with the data:image/...;base64, prefix"], ["Size cost", "Base64 is about 33% larger than the source file; a fixed overhead of the encoding"], ["Input methods", "Pick a file, drag one in, or paste an image straight from the clipboard"], ["Typical use", "Inlining into HTML or CSS to save a request, storing in a JSON field, embedding in an email template"], ["Poor fit", "Inlining large images bloats the HTML or CSS and prevents the browser caching them separately"], ["Where it runs", "Encoding happens in the browser; the image is never uploaded"]],
    faq: [{ question: "How large an image is worth Base64-encoding?", answer: "Generally only small icons of a few kilobytes. Base64 adds about a third to the size, and inlined data cannot be cached separately; a large inlined image means re-downloading it with every HTML or CSS fetch." }, { question: "Data URL with the prefix, or a bare string?", answer: "An HTML src or a CSS url() needs the full Data URL including the data:image/png;base64, prefix. Storing in a JSON field or a database column usually uses the bare string, with the consumer adding the prefix." }],
    reference: [
      ['Base64', 'An encoding that represents arbitrary binary bytes with an alphabet of 64 printable characters.'],
      ['data URL', 'A `data:` URL scheme that embeds a MIME type and encoded payload directly in the URL.'],
    ],
  },
});
