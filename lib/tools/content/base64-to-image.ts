import { defineToolContent } from './define';

export const base64ToImageContent = defineToolContent({
  zh: {
    overview: [
      'Base64 转图片会解码文本并把得到的二进制数据作为图片预览和文件下载。输入可以是纯 Base64，也可能是以 `data:image/...;base64,` 开头的 data URL；正确的 MIME 类型有助于浏览器选择解码器和输出扩展名。',
      '解码成功只说明字节能够形成浏览器可读的图片，不证明内容安全、来源可信或扩展名正确。处理来自接口和日志的长字符串时，应去掉意外的引号、空格与换行，并确认没有被 URL 编码或重复 Base64 编码。',
    ],
    steps: [
      ['粘贴编码内容', '保留完整 data URL，或只粘贴纯 Base64 字符串。'],
      ['解码并预览', '检查识别出的格式、尺寸和画面，若失败则核对前缀与填充字符。'],
      ['下载并验证', '使用匹配格式的扩展名保存，再用目标软件打开确认。'],
    ],
    scenarios: [
      ['还原接口图片', '把 API 响应中的头像、验证码样例或附件字段恢复为可查看文件。'],
      ['检查 data URL', '验证 CSS、HTML 或数据库里保存的内联图片是否完整。'],
      ["还原接口返回的图片数据", "有些接口把验证码或缩略图以 Base64 形式返回，调试时需要先解码出来看实际内容。"],
    ],
    notes: [
      '不要把无法信任的解码结果当作安全文件转发，仍应遵守上传扫描和内容校验流程。',
      '缺少 `=` 填充的 Base64 有时仍可解码，但截断的数据无法通过补填充恢复。',
      '如果文本以 `%2F`、`%2B` 等形式出现，可能需要先做 URL 解码。',
    ],
    specs: [["接受的输入", "裸 Base64 字符串，或带 data:image/...;base64, 前缀的完整 Data URL"], ["容错处理", "会忽略换行和多余空白：从代码或日志里复制出来的多行字符串可以直接粘贴"], ["格式识别", "根据解码后的文件头判断实际类型，不依赖 Data URL 里声明的 MIME"], ["常见失败原因", "字符串被截断、复制时漏掉结尾的 = 号填充、或内容根本不是图片数据"], ["输出", "可预览并下载为原始格式的图片文件"], ["处理位置", "解码在浏览器内完成，字符串不上传"]],
    faq: [{ question: "解码失败通常是什么原因？", answer: "最常见的是字符串被截断：从日志或控制台复制时没选全。其次是漏掉结尾的 = 填充符，或者误把标准字符集和 URL 安全字符集（- _ 替代 + /）混用了。" }, { question: "多行的 Base64 需要先合成一行吗？", answer: "不需要。换行和多余空白会被自动忽略，从代码或邮件源码里复制出来的多行字符串可以直接粘贴。" }],
    reference: [
      ['padding', 'Base64 末尾用于补齐编码分组的 `=` 字符。'],
      ['MIME type', '描述媒体格式的标识，例如 `image/png` 或 `image/jpeg`。'],
    ],
  },
  en: {
    overview: [
      'Base64 to image decodes text and treats the resulting bytes as an image for preview and download. Input may be raw Base64 or a data URL beginning with `data:image/...;base64,`; an accurate MIME type helps the browser select a decoder and file extension.',
      'Successful decoding only means the bytes form a browser-readable image. It does not prove safety, origin, or a correct extension. For long values copied from APIs or logs, remove accidental quotes and whitespace and check for URL encoding or a second Base64 layer.',
    ],
    steps: [
      ['Paste the encoded value', 'Keep the complete data URL or provide only the raw Base64 characters.'],
      ['Decode and preview', 'Check the detected format, dimensions, and image; if it fails, inspect the prefix and padding.'],
      ['Download and verify', 'Save with an extension matching the format and open it in the destination software.'],
    ],
    scenarios: [
      ['Restoring an API image', 'Recover an avatar, verification-code sample, or attachment field from an API response.'],
      ['Checking a data URL', 'Verify that an inline image stored in CSS, HTML, or a database is complete.'],
      ["Inspecting image data returned by an API", "Some endpoints return captchas or thumbnails as Base64, and debugging means decoding one to see what actually came back."],
    ],
    notes: [
      'Do not forward an untrusted decoded result as a safe file; normal upload scanning and validation still apply.',
      'Base64 without `=` padding may still decode, but padding cannot repair a truncated payload.',
      'Text containing sequences such as `%2F` or `%2B` may need URL decoding first.',
    ],
    specs: [["Accepted input", "A bare Base64 string, or a full Data URL with the data:image/...;base64, prefix"], ["Tolerance", "Line breaks and stray whitespace are ignored, so multi-line strings copied out of code or logs paste in directly"], ["Format detection", "The real type is read from the decoded file header rather than trusting the MIME type in the Data URL"], ["Common failures", "A truncated string, missing = padding at the end, or content that is simply not image data"], ["Output", "A previewable image you can download in its original format"], ["Where it runs", "Decoding happens in the browser; the string is never uploaded"]],
    faq: [{ question: "Why did decoding fail?", answer: "Most often the string was truncated when copied out of a log or console. Next most common is missing = padding at the end, or mixing the standard alphabet with the URL-safe one where - and _ replace + and /." }, { question: "Do I need to join multi-line Base64 into one line first?", answer: "No. Line breaks and stray whitespace are ignored, so a multi-line string copied from code or an email source pastes in directly." }],
    reference: [
      ['padding', 'The trailing `=` characters used to complete Base64 encoding groups.'],
      ['MIME type', 'A media-format identifier such as `image/png` or `image/jpeg`.'],
    ],
  },
});
