import { defineToolContent } from './define';

export const regexContent = defineToolContent({
  zh: {
    overview: [
      '正则表达式用一段模式描述文本中的匹配位置。工具直接使用浏览器 JavaScript RegExp，支持常用 flags、命名分组、全局匹配和高亮，并提供可修改的模板用于邮箱、URL、数字等常见结构。',
      '正则适合识别局部文本模式，不是通用解析器。嵌套语法、完整 HTML、不同方言的日期或自然语言通常更适合专用解析库；过于宽泛或存在灾难性回溯的表达式还会让长文本明显卡顿。',
    ],
    steps: [
      ['输入模式和 flags', '模式不要包含宿主语言的外层斜杠；按需要开启 g、i、m、s、u 或 y。'],
      ['提供代表性测试文本', '同时加入应匹配、边界情况和不应匹配的样本，避免只验证成功路径。'],
      ['检查高亮与分组', '确认匹配次数、完整片段和捕获组，再复制到目标代码并保留同样 flags。'],
    ],
    example: {
      caption: "命名分组让匹配结果可以按名称取用，比记住第几个括号更可靠。",
      inputLabel: "正则与测试文本",
      input: "/(?<year>\\d{4})-(?<month>\\d{2})/g\n\n2026-08 起效，2027-01 到期",
      outputLabel: "匹配结果",
      output: "匹配 1: 2026-08   year=2026  month=08\n匹配 2: 2027-01   year=2027  month=01",
      language: "text",
    },
    scenarios: [
      ['清理日志与列表', '定位时间戳、ID、空白行或固定前缀，配合代码做替换和提取。'],
      ['验证输入形状', '对格式有限且规则稳定的编号、路径或标记做客户端快速检查。'],
      ["把线上匹配失败的用例复现出来", "线上正则漏匹配或误匹配时，把实际输入贴进来逐步调整，比改代码重新部署快得多。"],
    ],
    notes: [
      'JavaScript 正则与 PCRE、Python、Java 的语法和特性不完全相同，跨语言使用前要重新测试。',
      '没有 g flag 时通常只返回第一个匹配；需要查看全部结果时应开启全局模式。',
      '不要用一个巨大正则完整解析 HTML、XML 或编程语言，结构化解析器更可靠。',
    ],
    specs: [["正则方言", "JavaScript 的 RegExp。Python、PCRE、Java 的部分语法在这里不适用"], ["支持的 flags", "g 全局、i 忽略大小写、m 多行、s 点匹配换行、u Unicode、y 粘连"], ["命名分组", "支持 (?<name>...) 命名捕获，结果中按名称展示"], ["不支持的语法", "递归匹配、条件匹配、部分 PCRE 独有的断言写法"], ["性能陷阱", "嵌套量词（如 (a+)+）在不匹配的长输入上会导致灾难性回溯，页面可能卡住"], ["处理位置", "在浏览器内用原生 RegExp 执行，测试文本不上传"]],
    faq: [{ question: "为什么我的正则在 Python 里能用，这里不行？", answer: "这里执行的是 JavaScript 的 RegExp。Python 的 `(?P<name>...)` 命名分组、部分断言写法和 PCRE 独有的递归匹配在 JavaScript 里语法不同或不支持。移植正则前需要按目标语言的方言调整。" }, { question: "为什么页面卡住了？", answer: "很可能触发了灾难性回溯。像 `(a+)+` 这样的嵌套量词在不匹配的长输入上，回溯次数会指数级增长。请避免嵌套量词，改用更具体的字符类，或者给匹配加上明确的边界。" }],
    reference: [
      ['capture group', '用括号记录匹配的一部分，命名分组可通过名称读取，便于后续替换或提取。'],
      ['catastrophic backtracking', '某些重复与分支组合会产生指数级尝试，使特定输入占用大量 CPU。'],
    ],
  },
  en: {
    overview: [
      'A regular expression describes matching locations in text. The tester uses the browser JavaScript RegExp engine with common flags, named groups, global matching, and highlighting, plus editable starting patterns for common shapes such as email, URLs, and numbers.',
      'Regex is useful for local text patterns, not as a universal parser. Nested syntax, complete HTML, variable date dialects, and natural language usually need dedicated parsers. Overly broad expressions or catastrophic backtracking can also stall on long text.',
    ],
    steps: [
      ['Enter the pattern and flags', 'Do not include host-language slash delimiters. Enable g, i, m, s, u, or y only when their behavior is needed.'],
      ['Add representative test text', 'Include positive examples, boundary cases, and values that must not match instead of testing success alone.'],
      ['Review highlights and groups', 'Check match count, complete spans, and capture groups, then preserve the same flags in destination code.'],
    ],
    example: {
      caption: "Named groups let you read results by name instead of remembering which bracket was which.",
      inputLabel: "Pattern and test text",
      input: "/(?<year>\\d{4})-(?<month>\\d{2})/g\n\nEffective 2026-08, expires 2027-01",
      outputLabel: "Matches",
      output: "Match 1: 2026-08   year=2026  month=08\nMatch 2: 2027-01   year=2027  month=01",
      language: "text",
    },
    scenarios: [
      ['Cleaning logs and lists', 'Locate timestamps, IDs, blank lines, or fixed prefixes before extracting or replacing them in code.'],
      ['Checking an input shape', 'Perform a quick client-side check for a stable identifier, path, or tag format with limited rules.'],
      ["Reproducing a match failure from production", "When a live regex misses or over-matches, paste the real input and adjust it here; far quicker than editing code and redeploying."],
    ],
    notes: [
      'JavaScript regex syntax and features differ from PCRE, Python, and Java. Retest before moving a pattern across languages.',
      'Without the g flag, a search normally returns only the first match. Use global mode when all results matter.',
      'Do not parse complete HTML, XML, or a programming language with one large regex; a structural parser is safer.',
    ],
    specs: [["Regex dialect", "JavaScript RegExp. Parts of Python, PCRE and Java syntax do not apply here"], ["Supported flags", "g global, i case-insensitive, m multiline, s dotall, u Unicode, y sticky"], ["Named groups", "(?<name>...) named capture is supported and shown by name in the results"], ["Not supported", "Recursion, conditionals, and some PCRE-only assertion forms"], ["Performance trap", "Nested quantifiers such as (a+)+ cause catastrophic backtracking on long non-matching input and can freeze the page"], ["Where it runs", "Executed with the browser's native RegExp; your test text is never uploaded"]],
    faq: [{ question: "My regex works in Python but not here; why?", answer: "This runs JavaScript's RegExp. Python's `(?P<name>...)` named groups, some assertion forms, and PCRE-only recursion either use different syntax or do not exist in JavaScript. Porting a regex means adapting it to the target dialect." }, { question: "Why did the page freeze?", answer: "Most likely catastrophic backtracking. A nested quantifier such as `(a+)+` on long non-matching input makes the backtracking count grow exponentially. Avoid nested quantifiers, use more specific character classes, or anchor the match explicitly." }],
    reference: [
      ['capture group', 'A parenthesized part of a match retained for extraction or replacement; named groups are addressed by name.'],
      ['catastrophic backtracking', 'An exponential search caused by certain nested repetitions and alternatives, consuming heavy CPU on crafted input.'],
    ],
  },
});
