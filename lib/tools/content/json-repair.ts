import type { ToolContent } from './types';

const BROKEN = `{
  // 服务端口，改这里要同步改 nginx
  'host': "127.0.0.1",
  port: 8080,
  tags: ['api', 'internal',],
}`;

const REPAIRED = `{
  "host": "127.0.0.1",
  "port": 8080,
  "tags": [
    "api",
    "internal"
  ]
}`;

export const jsonRepairContent: ToolContent = {
  zh: {
    overview: [
      '「JSON 解析失败」有两种完全不同的原因：一种是文本确实坏了（引号没配对、括号缺一半），另一种是文本本身是合法的，只不过用的是标准 JSON 之外的写法：注释、尾逗号、单引号、未加引号的 key。后者在配置文件里极其常见，而严格的解析器会一视同仁地拒绝。这个工具处理的正是第二类。',
      '还有一类高频问题来自复制粘贴：从日志、数据库字段或另一段 JSON 的字符串值里取出来的内容，往往整体被转义过一层，每个双引号前都多了反斜杠。这种文本肉眼看着像 JSON，实际是一个 JSON 字符串的字面量，需要先反转义再解析。',
    ],
    steps: [
      {
        title: '把无法解析的文本整段粘进来',
        detail: '不需要先手动清理。注释、尾逗号、单引号、未加引号的 key、多余的转义反斜杠可以同时存在，一次处理完。',
      },
      {
        title: '查看修复结果与改动',
        detail: '输出是符合 RFC 8259 的标准 JSON。对照左右两侧可以确认工具改了什么：修复只调整语法，不会增删字段或改变值。',
      },
      {
        title: '仍然失败时看错误位置',
        detail: '如果文本是真的损坏（括号数量不匹配、字符串没有结束引号），修复无法凭猜测补全，此时会给出出错位置，需要你回到数据来源确认。',
      },
      {
        title: '把标准 JSON 交给下一步',
        detail: '修好之后可以直接用 JSON 格式化查看树形结构、用 JSONPath 查询取字段，或转成 YAML、CSV、TypeScript 类型。',
      },
    ],
    example: {
      caption: '一个典型的 JSONC 配置片段：带注释、单引号 key、尾逗号，标准解析器会直接拒绝。',
      inputLabel: '无法被标准解析器接受',
      input: BROKEN,
      outputLabel: '修复为标准 JSON',
      output: REPAIRED,
      language: 'json',
    },
    specs: [
      { label: '注释', value: '识别并移除 `//` 行注释与 `/* */` 块注释' },
      { label: '尾逗号', value: '移除对象和数组最后一个成员之后的多余逗号' },
      { label: '引号', value: '单引号字符串转为双引号，未加引号的 key 补上双引号' },
      { label: '多余转义', value: '识别整体被转义过一层的文本，反转义后再解析' },
      { label: '无法修复的情况', value: '括号 / 引号数量不匹配、内容被截断：这类需要回到数据源，不做猜测性补全' },
      { label: '处理位置', value: '全部在浏览器内完成，粘贴的内容不发送到服务器' },
    ],
    scenarios: [
      {
        title: '把编辑器配置放进只认标准 JSON 的地方',
        detail: 'tsconfig.json、.eslintrc.json、VS Code 的 settings.json 都是 JSONC。要把它们交给一个严格解析器（或写进环境变量）之前，得先把注释和尾逗号去掉。',
      },
      {
        title: '还原从日志里复制出来的响应',
        detail: '日志常把整个响应体当字符串打印，于是每个双引号都带上了反斜杠。反转义之后才能得到真正可解析的 JSON。',
      },
      {
        title: '接手来源不明的数据文件',
        detail: '别人给的 .json 文件可能是手写的，混着单引号和尾逗号。先修复再校验，比逐行手改快得多，也不容易在改的过程中弄错值。',
      },
    ],
    notes: [
      '修复只改语法，不改语义。它不会补上缺失的字段、不会猜测被截断的内容、也不会纠正明显不合理的值：那些需要你自己判断。',
      '注释在输出中会消失，因为标准 JSON 没有注释语法。如果那些注释对维护配置文件很重要，请保留原始的 JSONC 文件，只把修复结果用于需要标准 JSON 的场景。',
      '重复 key 会按「后者覆盖前者」处理，这是 JSON 解析的通行做法。如果原文本里同一个 key 出现了两次，修复后只会剩下一个，这一点在对照输出时值得留意。',
      '数字仍然按 JavaScript number 解析。JSON5 的十六进制写法会被转成十进制，超长整数会丢精度：需要原样保留时应当用字符串承载。',
    ],
    reference: [
      { term: 'RFC 8259', definition: 'JSON 的现行标准。它不允许注释、尾逗号、单引号字符串和未加引号的 key，这就是「合法的配置文件」被标准解析器拒绝的原因。' },
      { term: '尾逗号 (trailing comma)', definition: '数组或对象最后一个成员后面的逗号。JavaScript 和 JSON5 允许，标准 JSON 不允许，它是 JSON 解析失败最常见的单一原因。' },
      { term: '双重转义', definition: '一段 JSON 作为字符串值被嵌进另一段 JSON 时产生的结果，表现为每个双引号前都有反斜杠。需要先反转义一层才能得到原始 JSON。' },
    ],
    faq: [
      {
        question: '修复会改动我的数据吗？',
        answer: '不会。工具只调整语法层面的写法：引号、逗号、注释、转义。字段名和值原样保留，唯一的例外是重复 key 会按 JSON 惯例只保留后出现的那一个。',
      },
      {
        question: '为什么有些文本修不了？',
        answer: '因为缺失的信息无法凭推断补回来。括号数量不匹配、字符串没有结束引号、内容在中途被截断，都意味着原文本已经丢了字符。工具不做猜测性补全，因为猜错比报错更危险。',
      },
      {
        question: '和 JSON 格式化有什么区别？',
        answer: '格式化假设输入是能解析的，负责重新排版；修复处理的是根本解析不了的输入。实践中的顺序通常是先修复、再格式化，格式化工具本身也接受 JSONC 和 JSON5。',
      },
    ],
  },
  en: {
    overview: [
      '"JSON failed to parse" covers two very different situations. In one the text is genuinely broken; an unclosed quote, half a bracket. In the other the text is perfectly sensible but written in a dialect outside strict JSON: comments, trailing commas, single quotes, unquoted keys. The second case is everywhere in config files, and a strict parser rejects it just as flatly as real corruption. This tool is for that second case.',
      'A second common source is copy and paste. Content lifted out of a log line, a database column, or a string value inside another JSON document usually arrives escaped one level deep, with a backslash before every double quote. It looks like JSON, but it is the literal of a JSON string and has to be unescaped before it will parse.',
    ],
    steps: [
      {
        title: 'Paste the whole thing that will not parse',
        detail: 'No manual cleanup first. Comments, trailing commas, single quotes, unquoted keys and stray escape backslashes can all be present at once and are handled in a single pass.',
      },
      {
        title: 'Check the repair against the original',
        detail: 'The output is strict RFC 8259 JSON. Comparing the two sides shows exactly what changed; repair only touches syntax, never adding, removing or altering a value.',
      },
      {
        title: 'Read the error position if it still fails',
        detail: 'When the text is genuinely damaged; unbalanced brackets, an unterminated string, a truncated body; there is nothing to infer from. You get the failing position instead, and have to go back to the source.',
      },
      {
        title: 'Hand the strict JSON onward',
        detail: 'From here it goes straight into JSON Formatter for the tree view, JSONPath Query to pull a field, or conversion to YAML, CSV or a TypeScript type.',
      },
    ],
    example: {
      caption: 'A typical JSONC config fragment: a comment, a single-quoted key, a trailing comma. A strict parser refuses all three.',
      inputLabel: 'Rejected by a strict parser',
      input: BROKEN,
      outputLabel: 'Repaired to strict JSON',
      output: REPAIRED,
      language: 'json',
    },
    specs: [
      { label: 'Comments', value: 'Recognises and removes `//` line comments and `/* */` block comments' },
      { label: 'Trailing commas', value: 'Drops the extra comma after the final member of an object or array' },
      { label: 'Quoting', value: 'Converts single-quoted strings to double quotes and adds quotes to bare keys' },
      { label: 'Over-escaping', value: 'Detects text escaped one level deep, unescapes it, then parses' },
      { label: 'Not repairable', value: 'Unbalanced brackets or quotes and truncated content; these need the original source; nothing is guessed' },
      { label: 'Where it runs', value: 'Entirely in your browser; what you paste is never sent to a server' },
    ],
    scenarios: [
      {
        title: 'Moving an editor config somewhere strict',
        detail: 'tsconfig.json, .eslintrc.json and VS Code settings.json are all JSONC. Comments and trailing commas have to go before a strict parser; or an environment variable; will accept them.',
      },
      {
        title: 'Recovering a response copied out of a log',
        detail: 'Logs routinely print a whole response body as a string, which puts a backslash before every double quote. Unescaping that layer is what turns it back into parseable JSON.',
      },
      {
        title: 'Inheriting a data file of unknown provenance',
        detail: 'A hand-written .json from someone else often mixes single quotes with trailing commas. Repairing then validating is far quicker than editing line by line, and far less likely to corrupt a value on the way.',
      },
    ],
    notes: [
      'Repair changes syntax, not meaning. It will not supply a missing field, guess at truncated content, or correct a value that looks implausible; those calls are yours.',
      'Comments disappear from the output, because strict JSON has no syntax to hold them. If those comments matter for maintaining the config, keep the original JSONC file and use the repaired output only where strict JSON is required.',
      'Duplicate keys resolve last-one-wins, which is standard JSON parsing behaviour. A key that appeared twice in the input appears once in the output; worth watching for when you compare the two sides.',
      'Numbers still go through JavaScript number semantics. JSON5 hexadecimal literals come back as decimal, and very long integers lose precision; carry those as strings if the exact digits matter.',
    ],
    reference: [
      { term: 'RFC 8259', definition: 'The current JSON standard. It permits no comments, no trailing commas, no single-quoted strings and no bare keys; which is exactly why a perfectly valid config file gets rejected.' },
      { term: 'Trailing comma', definition: 'A comma after the last member of an array or object. Legal in JavaScript and JSON5, illegal in strict JSON, and the single most common cause of a parse failure.' },
      { term: 'Double escaping', definition: 'What you get when one JSON document is embedded as a string value inside another: a backslash before every double quote. One level of unescaping recovers the original.' },
    ],
    faq: [
      {
        question: 'Does repairing change my data?',
        answer: 'No. Only syntax is touched; quoting, commas, comments, escaping. Field names and values come through unchanged, with the single exception that duplicate keys collapse to the last occurrence, per standard JSON behaviour.',
      },
      {
        question: 'Why can some text not be repaired?',
        answer: 'Because missing information cannot be inferred. Unbalanced brackets, an unterminated string or a body cut off mid-way all mean characters are gone from the original. The tool does not guess, because a wrong guess is more dangerous than an error.',
      },
      {
        question: 'How is this different from the JSON formatter?',
        answer: 'The formatter assumes the input parses and re-lays it out; repair deals with input that does not parse at all. In practice you repair first and format second; though the formatter also accepts JSONC and JSON5 directly.',
      },
    ],
  },
};
