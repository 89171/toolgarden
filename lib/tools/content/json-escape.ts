import { defineToolContent } from './define';

export const jsonEscapeContent = defineToolContent({
  zh: {
    overview: [
      'JSON 转义解决的是“把一段 JSON 放进另一个字符串”时的语法冲突。双引号、反斜杠、换行和制表符在字符串里都有特殊含义，直接粘贴会截断宿主字符串；转义后它们分别写成带反斜杠的序列，数据本身并没有改变。',
      '工具会先解析并压缩输入，再对字符串边界做转义，因此既能发现原始 JSON 的语法错误，也能避免把无效内容包装成看似正确的字符串。反转义用于还原日志、环境变量或源码中的 JSON 字符串。',
    ],
    steps: [
      ['确认处理方向', '需要嵌入源码或配置时选择压缩转义；拿到带反斜杠的字符串并想恢复结构时选择反转义。'],
      ['粘贴完整内容', '转义模式应输入可解析的 JSON；反转义模式输入字符串内容本身，不要额外添加宿主语言外层引号。'],
      ['检查输出再复制', '重点确认换行、引号和反斜杠是否符合目标系统的语法，随后复制结果。'],
    ],
    example: {
      caption: "同一段 JSON 作为字符串值嵌进另一段 JSON 时的形态变化。注意每个双引号前多出的反斜杠。",
      inputLabel: "原始 JSON",
      input: "{\n  \"host\": \"db.internal\",\n  \"port\": 5432\n}",
      outputLabel: "转义后（可作为字符串值）",
      output: "\"{\\\"host\\\":\\\"db.internal\\\",\\\"port\\\":5432}\"",
      language: "json",
    },
    scenarios: [
      ['写入环境变量', '把多行配置压成单行并转义，便于放进只接受字符串的 CI 参数或容器配置。'],
      ['分析日志字段', '日志系统常把请求体再次 JSON 编码，反转义后才能格式化并检查真实字段。'],
      ["把 JSON 嵌进另一段 JSON", "接口需要在某个字段里携带一整段 JSON 时，必须先转义成字符串才能作为值传输。"],
    ],
    notes: [
      'JSON 转义不等于 URL 编码或 Base64。目标系统要求哪种表示方式，应以它的接口文档为准。',
      '反转义会解释反斜杠序列；原本需要保留的反斜杠必须成对出现，否则可能被当成控制字符。',
      '输入中的 JSONC 或 JSON5 扩展语法会在解析后按标准 JSON 输出，注释不会保留。',
    ],
    specs: [["两个方向", "压缩并转义为可嵌入的字符串，或反转义还原成可读 JSON"], ["转义的字符", "双引号、反斜杠、换行、制表符、回车等控制字符"], ["为什么需要", "把一段 JSON 作为字符串值放进另一段 JSON、写进配置字段或数据库列时必须先转义"], ["反转义的用途", "还原从日志、数据库字段里复制出来的、每个引号前都带反斜杠的文本"], ["多层嵌套", "嵌套两层就需要转义两次，反转义同理，层数不对会解析失败"], ["处理位置", "全部在浏览器内完成，输入不上传"]],
    faq: [{ question: "为什么反斜杠越来越多？", answer: "每嵌套一层就要转义一次。JSON 放进 JSON 是两层，再放进第三层就是四个反斜杠。转义几次就要反转义几次，层数搞错就会解析失败。" }, { question: "转义和 URL 编码是一回事吗？", answer: "不是。JSON 转义处理的是 JSON 语法里的特殊字符（引号、反斜杠、换行），URL 编码处理的是 URL 里的保留字符。放进 URL 参数的 JSON 通常两步都要做，顺序是先转义再 URL 编码。" }],
    reference: [
      ['escape sequence', '用反斜杠加字符表示无法直接写入字符串的内容，例如换行写成 \\n，双引号写成 \\"。'],
      ['double encoding', '同一段数据被重复包装为 JSON 字符串，表现为大量连续反斜杠。每反转义一层只应移除一层包装。'],
    ],
  },
  en: {
    overview: [
      'JSON escaping solves the syntax collision that appears when one JSON document must live inside another string. Quotes, backslashes, line breaks, and tabs already have meaning to the host string; escaping replaces them with backslash sequences without changing the underlying data.',
      'The tool parses and minifies the document before escaping it, so malformed JSON is reported instead of being wrapped as a plausible-looking string. Unescape performs the reverse operation for JSON copied from logs, environment variables, or source code.',
    ],
    steps: [
      ['Choose the direction', 'Use minify and escape before embedding JSON in a string. Use unescape when backslash sequences need to become readable JSON again.'],
      ['Paste the complete value', 'Escape mode expects parseable JSON. Unescape mode expects the string contents without an extra pair of host-language quotes.'],
      ['Inspect and copy', 'Check quotes, line breaks, and backslashes against the syntax required by the destination, then copy the result.'],
    ],
    example: {
      caption: "What one JSON document looks like once escaped to sit inside another as a string value. Note the backslash before every double quote.",
      inputLabel: "Original JSON",
      input: "{\n  \"host\": \"db.internal\",\n  \"port\": 5432\n}",
      outputLabel: "Escaped, usable as a string value",
      output: "\"{\\\"host\\\":\\\"db.internal\\\",\\\"port\\\":5432}\"",
      language: "json",
    },
    scenarios: [
      ['Storing configuration in an environment variable', 'Turn a multi-line config into one escaped line for a CI setting or container variable that only accepts strings.'],
      ['Reading a structured log field', 'Logging systems often JSON-encode a request body a second time. Unescape it before formatting and inspecting its fields.'],
      ["Embedding JSON inside JSON", "When an API field has to carry a whole JSON document, it must be escaped into a string before it can travel as a value."],
    ],
    notes: [
      'JSON escaping is not URL encoding or Base64. Use the representation named by the receiving system documentation.',
      'Unescape interprets backslash sequences. A literal backslash must already be doubled or it can be consumed as a control escape.',
      'JSONC and JSON5 extensions are normalized to strict JSON during parsing, so comments are not retained.',
    ],
    specs: [["Two directions", "Minify and escape into an embeddable string, or unescape back into readable JSON"], ["Characters escaped", "Double quotes, backslashes, newlines, tabs, carriage returns and other control characters"], ["Why you need it", "Putting JSON inside another JSON document, a config field or a database column requires escaping first"], ["What unescaping is for", "Recovering text copied from logs or database columns where every quote carries a backslash"], ["Nesting", "Two levels of nesting need two rounds of escaping, and the same in reverse; the wrong count fails to parse"], ["Where it runs", "Entirely in the browser; the input is never uploaded"]],
    faq: [{ question: "Why do the backslashes keep multiplying?", answer: "Each level of nesting escapes again. JSON inside JSON is two levels; a third level gives you four backslashes. Unescape exactly as many times as you escaped, or parsing fails." }, { question: "Is escaping the same as URL encoding?", answer: "No. JSON escaping handles characters special to JSON syntax; quotes, backslashes, newlines. URL encoding handles characters reserved in a URL. JSON going into a query parameter usually needs both, escaping first and URL encoding second." }],
    reference: [
      ['escape sequence', 'A backslash-prefixed spelling for characters that cannot be written literally inside a string, such as \\n for a line break.'],
      ['double encoding', 'The same data is wrapped as a JSON string more than once, usually visible as repeated backslashes. Remove only one layer at a time.'],
    ],
  },
});
