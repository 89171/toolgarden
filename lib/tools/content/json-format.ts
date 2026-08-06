import type { ToolContent } from './types';

const MINIFIED = '{"name":"ToolGarden","tags":["json","pdf"],"limits":{"maxDepth":64,"strict":false}}';

const FORMATTED = `{
  "name": "ToolGarden",
  "tags": [
    "json",
    "pdf"
  ],
  "limits": {
    "maxDepth": 64,
    "strict": false
  }
}`;

export const jsonFormatContent: ToolContent = {
  zh: {
    overview: [
      'JSON 本身没有规定缩进和换行，所以接口返回的数据经常是压缩成一行的。格式化的作用是把这种单行文本重新排布成带缩进的层级结构，让嵌套关系可读；压缩是反过来去掉所有非必要空白，减少传输体积。两个操作都只改动空白字符，不改动数据。',
      '标准 JSON（RFC 8259）不允许注释、尾逗号、单引号字符串和未加引号的 key，但配置文件里这些写法很常见：tsconfig.json 和 VS Code 的 settings.json 用的是 JSONC，部分工具链用的是 JSON5。这里的解析器同时接受这三种写法，读进来之后统一按标准 JSON 输出，所以可以直接粘贴一个带注释的配置文件，不必先手动删注释。',
      '解析失败时错误信息会指出出错位置。最常见的三种原因是：字符串内部有未转义的双引号、对象最后一个成员后面多了逗号、以及从日志里复制时带上了外层的转义反斜杠。后两种可以交给 JSON 修复清洗先处理一遍。',
    ],
    steps: [
      {
        title: '粘贴或输入 JSON',
        detail: '输入框支持直接粘贴和输入。停止输入约 300 毫秒后会自动格式化一次，常规使用不需要每次点按钮。',
      },
      {
        title: '选择输出形式',
        detail: '「格式化」输出两空格缩进的多行 JSON，「压缩」输出去掉全部空白的单行 JSON。URL 与 Uni 编解码只递归处理 JSON 中的字符串值，不改变 key、数组和对象结构。',
      },
      {
        title: '在树形视图里定位字段',
        detail: '格式化结果默认以树形展示，点击节点可以逐层展开或折叠。层级很深时先用「全部折叠」收起来，再展开到目标路径，比在纯文本里数括号更快。',
      },
      {
        title: '复制或下载结果',
        detail: '「复制」把当前输出写入剪贴板；「下载」把格式化、压缩或字段值编解码后的完整 JSON 保存为 formatted.json。',
      },
    ],
    example: {
      caption: '同一份数据的两种形式。压缩形式适合写进环境变量或请求体，格式化形式适合阅读和 code review。',
      inputLabel: '压缩的单行 JSON',
      input: MINIFIED,
      outputLabel: '格式化后（2 空格缩进）',
      output: FORMATTED,
      language: 'json',
    },
    specs: [
      { label: '接受的输入', value: '标准 JSON（RFC 8259）、JSONC（注释与尾逗号）、JSON5（单引号、未加引号 key、十六进制数字）' },
      { label: '缩进', value: '格式化固定输出 2 空格缩进；压缩输出不含任何空白字符' },
      { label: '数字精度', value: '按 JavaScript number 解析，超过 2^53-1 的整数会丢精度' },
      { label: 'key 顺序', value: '保持输入中的出现顺序，不做字母排序' },
      { label: '注释', value: '输入可以带注释，但标准 JSON 没有注释语法，输出时会丢弃' },
      { label: '处理位置', value: '解析、格式化、压缩全部在浏览器内完成，输入不发送到服务器' },
    ],
    scenarios: [
      {
        title: '读接口返回的压缩响应',
        detail: '从开发者工具或 curl 拿到的响应通常是单行的。格式化后配合树形折叠，可以快速确认字段是否存在、类型对不对、数组里有几项。',
      },
      {
        title: '把带注释的配置写进环境变量',
        detail: 'tsconfig.json、eslintrc 这类 JSONC 配置不能直接放进只接受标准 JSON 的地方。先解析成标准 JSON 再压缩成一行，就能安全写进 CI 的环境变量或命令行参数。',
      },
      {
        title: '让 diff 只显示字段变化',
        detail: '把两份 JSON 都按同一套缩进格式化之后再对比，diff 才不会被空白差异淹没。格式化完可以直接接 JSON 对比查看增删改。',
      },
    ],
    notes: [
      '格式化只重排空白，不改 key 名、值和数组顺序。如果输出的数据和输入看起来不一致，通常说明输入里有重复 key：后出现的会覆盖先出现的。',
      '数字按 JavaScript number 处理，`1.0` 会输出成 `1`，雪花 ID 这类长整数可能丢末几位。需要原样保留的话，在传输层就应该用字符串承载。',
      '输入是 JSONC / JSON5 时注释会在输出中消失，这是标准 JSON 的语法限制，不是工具丢内容。需要保留注释就不要转成标准 JSON。',
      '所有计算在你的浏览器里完成，页面不上传输入内容，关掉标签页后内容不会留在任何服务器上。',
    ],
    reference: [
      { term: 'RFC 8259', definition: 'JSON 的现行标准，规定了值类型、字符串转义和字符编码要求。它不定义注释，也不允许尾逗号。' },
      { term: 'JSONC', definition: '"JSON with Comments"。在 JSON 之上允许 // 与 /* */ 注释和尾逗号，主要用于编辑器和构建工具的配置文件。' },
      { term: 'JSON5', definition: '更接近 ES5 字面量的扩展写法，允许单引号字符串、未加引号的 key、十六进制数字和多行字符串。' },
      { term: 'minify', definition: '去掉全部非必要空白得到最小的等价文本，不做有损处理。与 gzip 这类字节级压缩算法是两个不同层面的操作。' },
    ],
    faq: [
      {
        question: '为什么格式化之后数字变了？',
        answer: '解析使用 JavaScript 的 number 类型，它只能精确表示 2^53-1 以内的整数。雪花 ID、订单号这类长整数应当以字符串形式传输，否则任何基于 JavaScript 的 JSON 解析器都会丢精度。',
      },
      {
        question: '能处理多大的 JSON？',
        answer: '上限取决于你的浏览器可用内存，而不是服务器配额。几十 MB 的文本一般可以处理，但树形视图节点极多时会明显变慢，这种情况建议先用 JSONPath 查询取出需要的子树再看。',
      },
      {
        question: '输出的 key 顺序会被改动吗？',
        answer: '不会。输出保持输入中 key 的出现顺序，工具不做字母排序，所以格式化前后可以逐行对照。',
      },
    ],
  },
  en: {
    overview: [
      'JSON says nothing about indentation or line breaks, which is why API responses usually arrive minified onto a single line. Formatting re-lays that text out as an indented hierarchy so the nesting becomes readable; minifying does the reverse and strips every unnecessary whitespace character to cut transfer size. Both operations touch whitespace only; never the data.',
      'Strict JSON (RFC 8259) forbids comments, trailing commas, single-quoted strings and unquoted keys, yet config files use all of them: tsconfig.json and VS Code settings.json are JSONC, and some toolchains use JSON5. The parser here accepts all three and re-emits strict JSON, so you can paste a commented config file directly instead of stripping comments by hand first.',
      'When parsing fails the error points at the offending position. The three usual causes are an unescaped double quote inside a string, a trailing comma after the last member of an object, and escape backslashes picked up when copying out of a log line. The last two are what JSON Repair is for.',
    ],
    steps: [
      {
        title: 'Paste or type your JSON',
        detail: 'The input accepts pasted and typed text. Roughly 300 ms after you stop typing it formats once automatically, so normal use needs no button press.',
      },
      {
        title: 'Pick an output shape',
        detail: 'Format emits multi-line JSON with two-space indentation; Minify emits a single line with all whitespace removed. URL and Uni codecs recursively transform string values only, preserving keys, arrays, and object structure.',
      },
      {
        title: 'Locate fields in the tree view',
        detail: 'Formatted output renders as a collapsible tree. For deeply nested documents, collapse everything first and expand down to the path you care about; faster than counting brackets in plain text.',
      },
      {
        title: 'Copy or download the result',
        detail: 'Copy writes the current output to the clipboard. Download saves the complete formatted, minified, or value-transformed JSON as formatted.json.',
      },
    ],
    example: {
      caption: 'The same document in both shapes. The minified form fits in an environment variable or request body; the formatted form is what you want in review.',
      inputLabel: 'Minified, single line',
      input: MINIFIED,
      outputLabel: 'Formatted, two-space indent',
      output: FORMATTED,
      language: 'json',
    },
    specs: [
      { label: 'Accepted input', value: 'Strict JSON (RFC 8259), JSONC (comments and trailing commas), JSON5 (single quotes, unquoted keys, hex numbers)' },
      { label: 'Indentation', value: 'Formatting always emits two spaces; minified output contains no whitespace at all' },
      { label: 'Number precision', value: 'Parsed as JavaScript numbers, so integers above 2^53-1 lose precision' },
      { label: 'Key order', value: 'Preserved exactly as it appears in the input; never alphabetised' },
      { label: 'Comments', value: 'Accepted on input, but strict JSON has no comment syntax so they are dropped on output' },
      { label: 'Where it runs', value: 'Parsing, formatting and minifying all happen in your browser; the input is never sent to a server' },
    ],
    scenarios: [
      {
        title: 'Reading a minified API response',
        detail: 'Responses copied from devtools or curl arrive on one line. Formatting plus tree collapse tells you quickly whether a field exists, whether its type is right, and how many entries an array holds.',
      },
      {
        title: 'Putting a commented config into an env var',
        detail: 'JSONC files like tsconfig.json or eslintrc cannot go somewhere that only accepts strict JSON. Parse to strict JSON, then minify to one line, and it is safe to drop into a CI environment variable or a CLI argument.',
      },
      {
        title: 'Making a diff show only field changes',
        detail: 'Format both documents with the same indentation before comparing, otherwise whitespace noise swamps the real changes. From here you can hand the result straight to JSON Diff.',
      },
    ],
    notes: [
      'Formatting only rearranges whitespace; keys, values and array order are untouched. If the output data looks different from the input, the input almost certainly had duplicate keys, and the later one wins.',
      'Numbers go through JavaScript number semantics, so `1.0` comes back as `1` and snowflake-style IDs can lose their last digits. If exact digits matter, carry them as strings at the transport layer.',
      'Comments in JSONC or JSON5 input disappear from the output. That is a limitation of strict JSON syntax, not the tool dropping content; keep the original file if you need the comments.',
      'Everything runs in your browser. The page does not upload what you paste, and nothing remains on any server after you close the tab.',
    ],
    reference: [
      { term: 'RFC 8259', definition: 'The current JSON standard. It defines value types, string escaping and encoding requirements, and it defines no comment syntax and permits no trailing commas.' },
      { term: 'JSONC', definition: '"JSON with Comments". Adds // and /* */ comments plus trailing commas on top of JSON, mainly for editor and build-tool configuration files.' },
      { term: 'JSON5', definition: 'An extension closer to ES5 literals: single-quoted strings, unquoted keys, hexadecimal numbers and multi-line strings.' },
      { term: 'Minify', definition: 'Removing every unnecessary whitespace character to reach the smallest equivalent text. Lossless, and a different layer from byte-level compression such as gzip.' },
    ],
    faq: [
      {
        question: 'Why did my numbers change after formatting?',
        answer: 'Parsing uses the JavaScript number type, which represents integers exactly only up to 2^53-1. Snowflake IDs and order numbers should travel as strings, otherwise any JavaScript-based JSON parser loses precision on them.',
      },
      {
        question: 'How large a document can this handle?',
        answer: 'The ceiling is your browser memory, not a server quota. Tens of megabytes of text is usually fine, but the tree view slows noticeably at very high node counts; extract the subtree you need with JSONPath Query first.',
      },
      {
        question: 'Does the key order get rearranged?',
        answer: 'No. Output keeps the key order from your input and never sorts alphabetically, so you can compare before and after line by line.',
      },
    ],
  },
};
