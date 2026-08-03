import { defineToolContent } from './define';

export const infoCodecContent = defineToolContent({
  zh: {
    overview: [
      '信息编解码工具把常见的文本编码、摘要、转义和结构解析集中到一个工作台中，覆盖 URL、Unicode、UTF-16、Base64、十六进制、HTML 实体、查询参数、Cookie、JWT、MD5、SHA-1 与 gzip 等模式。不同模式解决的问题并不相同：编码用于表示，转义用于安全嵌入，摘要用于指纹，压缩用于减小数据。',
      '所有操作在当前浏览器会话内完成，适合开发调试和一次性数据检查。选择模式前先识别输入的真实格式，因为对错误格式反复编码往往会制造看似随机的 `%25`、反斜杠或乱码。',
    ],
    steps: [
      ['识别输入格式', '根据来源判断内容是普通文本、URL 参数、Base64、十六进制、JWT 还是压缩数据。'],
      ['选择单一操作', '选择编码、解码、摘要、格式化或解压，避免在不明确时连续套用多个模式。'],
      ['验证输出语义', '检查字符集、字节长度和结构字段，确认结果可被目标系统重新读取。'],
    ],
    example: {
      caption: "几种编码对同一段文本的结果。注意哈希是单向的，不在「解码」的能力范围内。",
      inputLabel: "输入文本",
      input: "hello 世界",
      outputLabel: "各种编码结果",
      output: "URL 编码    hello%20%E4%B8%96%E7%95%8C\nBase64      aGVsbG8g5LiW55WM\nURL 安全 Base64  aGVsbG8g5LiW55WM\nUnicode 转义  hello \\u4e16\\u754c\nSHA-256     f5e8...（单向，无法还原）",
      language: "text",
    },
    scenarios: [
      ['排查接口参数', '解码 URL、查询字符串、Cookie 或 JWT，定位重复编码和字段边界问题。'],
      ['准备数据片段', '把文本转换为 Base64、Unicode 转义或十六进制，供配置、协议或测试样例使用。'],
      ["核对签名计算的中间结果", "接口签名不通过时，逐步比对参数拼接、URL 编码和哈希的每一步输出，定位是哪一环与文档不一致。"],
    ],
    notes: [
      'Base64、十六进制和 URL 编码都不提供保密性，拿到内容的人可以轻易还原。',
      'MD5 和 SHA-1 不适合新的密码存储或抗碰撞安全用途，只应在兼容和校验场景中使用。',
      'JWT 解码不验证签名，gzip 解压也应避免处理来源不明且体积异常的数据。',
    ],
    specs: [["涵盖的编码", "Unicode 转义、URL percent-encoding、Base64、常用哈希、JWT 解析、Cookie 解析、Gzip"], ["Base64 变体", "标准字符集与 URL 安全字符集（- _ 替代 + /）的结果不同，用错会解码失败"], ["哈希不是加密", "哈希是单向的，无法还原原文。它用于校验完整性和比对，不能用来保护需要取回的内容"], ["URL 编码的两种", "encodeURIComponent 转义 & = ? 等分隔符，encodeURI 保留它们：用错会破坏 URL 结构"], ["JWT 解析", "只解码 Header 与 Payload 并可验证 HS256 签名；payload 本身是 Base64 而非加密，任何人都能读"], ["处理位置", "全部在浏览器内完成，输入不上传"]],
    faq: [{ question: "为什么 Base64 解码失败？", answer: "最常见的是字符集不匹配。标准 Base64 用 `+` 和 `/`，URL 安全变体用 `-` 和 `_`。JWT 和 URL 参数里的是后者，用标准字符集解会失败。其次是复制时漏掉了结尾的 `=` 填充。" }, { question: "哈希能解开还原原文吗？", answer: "不能。哈希是单向函数，设计上就不可逆。它的用途是校验完整性和比对是否相同。看到「解密 MD5」的说法，实际是在查预先算好的彩虹表，不是数学上的还原。" }],
    reference: [
      ['character encoding', '字符与字节之间的映射规则，必须与数据生产方约定一致。'],
      ['digest', '从输入计算出的固定长度指纹；它不可逆，但旧算法可能不具备足够的碰撞安全性。'],
    ],
  },
  en: {
    overview: [
      'The information codec collects common text encodings, digests, escaping, and structure parsers in one workspace, including URL, Unicode, UTF-16, Base64, hexadecimal, HTML entities, query strings, cookies, JWT, MD5, SHA-1, and gzip modes. These operations serve different purposes: encoding represents data, escaping embeds it safely, a digest fingerprints it, and compression reduces size.',
      'Processing happens within the current browser session and is intended for development diagnostics and one-off inspection. Identify the actual input format before choosing a mode, because repeatedly encoding an unknown value often creates `%25`, extra backslashes, or unreadable text.',
    ],
    steps: [
      ['Identify the input format', 'Use the source context to decide whether the value is text, a URL parameter, Base64, hexadecimal, JWT, or compressed data.'],
      ['Choose one operation', 'Select encode, decode, digest, format, or decompress instead of stacking uncertain transformations.'],
      ['Validate the meaning', 'Check character encoding, byte length, and parsed fields, then confirm the destination can read the result.'],
    ],
    example: {
      caption: "One string through several encodings. Note that hashing is one-way and is not something the decoder can reverse.",
      inputLabel: "Input text",
      input: "hello 世界",
      outputLabel: "Encoded forms",
      output: "URL encoding      hello%20%E4%B8%96%E7%95%8C\nBase64            aGVsbG8g5LiW55WM\nURL-safe Base64   aGVsbG8g5LiW55WM\nUnicode escapes   hello \\u4e16\\u754c\nSHA-256           f5e8... (one-way, not reversible)",
      language: "text",
    },
    scenarios: [
      ['Debugging request data', 'Decode URLs, query strings, cookies, or JWT payloads to find double encoding and field-boundary errors.'],
      ['Preparing a data fragment', 'Convert text to Base64, Unicode escapes, or hexadecimal for configuration, protocol, and test fixtures.'],
      ["Checking the intermediate steps of a signature", "When an API signature is rejected, compare each stage; parameter concatenation, URL encoding, hashing; against the documentation to find where they diverge."],
    ],
    notes: [
      'Base64, hexadecimal, and URL encoding provide no confidentiality and are straightforward to reverse.',
      'MD5 and SHA-1 are unsuitable for new password storage or collision-resistant security uses; keep them for compatibility and basic checks only.',
      'JWT decoding does not verify a signature, and gzip decompression should avoid untrusted inputs with suspicious expansion size.',
    ],
    specs: [["What it covers", "Unicode escapes, URL percent-encoding, Base64, common hashes, JWT decoding, cookie parsing and Gzip"], ["Base64 variants", "The standard alphabet and the URL-safe one (- and _ replacing + and /) produce different output; mixing them fails to decode"], ["Hashing is not encryption", "Hashes are one-way and cannot be reversed. They verify integrity and compare values; they cannot protect something you need back"], ["Two URL encoders", "encodeURIComponent escapes & = ? and other delimiters, encodeURI keeps them; the wrong one breaks URL structure"], ["JWT decoding", "Decodes the header and payload and can verify an HS256 signature; the payload is Base64, not encrypted, so anyone can read it"], ["Where it runs", "Entirely in the browser; nothing you paste is uploaded"]],
    faq: [{ question: "Why did Base64 decoding fail?", answer: "Usually an alphabet mismatch. Standard Base64 uses `+` and `/`; the URL-safe variant uses `-` and `_`. JWTs and URL parameters use the latter, and decoding them with the standard alphabet fails. The next most common cause is missing `=` padding lost in copying." }, { question: "Can a hash be decrypted back to the original?", answer: "No. Hashing is a one-way function and irreversible by design. Its purpose is verifying integrity and comparing values. Claims of \"decrypting MD5\" mean looking up a precomputed rainbow table, not mathematical recovery." }],
    reference: [
      ['character encoding', 'The mapping between characters and bytes, which must match the convention used by the data producer.'],
      ['digest', 'A fixed-length fingerprint computed from input; it is one-way, but older algorithms may lack adequate collision resistance.'],
    ],
  },
});
