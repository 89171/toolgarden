import { defineToolContent } from './define';

export const textDiffContent = defineToolContent({
  zh: {
    overview: ['文本对比会找出两个版本之间新增、删除和未变化的内容，适合检查文案、配置、日志和文档修订。差异结果取决于比较粒度与空白处理，按行比较便于代码和段落，按词或字符比较更适合句内修改。', '工具显示的是文本表面变化，不理解条款、数字或代码的业务含义。重新换行、缩进或行尾格式也可能产生大量差异，比较前应决定空白是否重要，并保证两个版本使用相同字符编码。'],
    steps: [['放入基准和新版本', '明确左侧或第一个文本是旧版本，避免反向解读新增与删除。'], ['选择合适视图', '先看整体变化，再聚焦到有差异的行和词。'], ['人工判断影响', '检查数字、否定词、标点和结构变化，确认是否符合预期。']],
    example: {
      caption: "行级定位加词级高亮。第二行只改了一个数字，但整行会先被标为变化。",
      inputLabel: "两段文本",
      input: "// 左\n服务端口 8080\n超时 30 秒\n\n// 右\n服务端口 3000\n超时 30 秒",
      outputLabel: "差异结果",
      output: "~ 第 1 行：服务端口 [8080 → 3000]\n  第 2 行：无变化",
      language: "diff",
    },
    scenarios: [['审阅文案修订', '确认修改者只调整了约定段落，没有遗漏或意外删除。'], ['排查配置差异', '对比两个环境的文本配置或日志片段，快速定位变化位置。'], ["核对合同定稿与上一版", "逐词高亮能暴露金额、日期和责任条款里被改动的单个字符，这类改动在通读时最容易被忽略。"]],
    notes: ['差异相同不证明两个系统行为相同，文本还可能依赖外部环境。', '换行符 LF 与 CRLF、尾随空格和 Unicode 规范化会制造非视觉差异。', '敏感合同和密钥内容应遵守组织的复制与处理规定。'],
    specs: [["比较粒度", "先按行定位差异，再在变化的行内按词高亮，两级同时展示"], ["算法", "基于开源 diff 库的最长公共子序列，与 git diff 的思路一致"], ["能识别", "新增行、删除行、行内词级修改"], ["无法识别", "整段移动会被标成一处删除加一处新增，而不是「位置改变」"], ["不理解语义", "同义改写、语序调整会显示成大段差异；数字或单位的关键改动可能只是一个字符"], ["JSON 的更好选择", "两边都是 JSON 时用 JSON 对比，它按字段比较，不受格式化差异干扰"]],
    faq: [{ question: "整段搬移位置为什么显示成删除加新增？", answer: "算法基于最长公共子序列，它只判断某一行是否存在于两边，不追踪移动。整段位置变化在两边都找不到对应位置，因此表现为一处删除加一处新增。git diff 的行为也是一样的。" }, { question: "为什么改了一个词，整行都标成变化？", answer: "行级比较会先标出变化的行，行内再做词级高亮。看行级标记会觉得整行都变了，看行内高亮才能定位到具体那个词：两级信息是同时给出的。" }],
    reference: [['diff', '描述两个文本序列如何通过增加和删除相互转换的结果。'], ['whitespace', '空格、制表符和换行等不直接显示为字形的字符。']],
  },
  en: {
    overview: ['Text diff finds additions, deletions, and unchanged content between versions of copy, configuration, logs, and documents. Results depend on comparison granularity and whitespace handling: lines suit code and paragraphs, while words or characters reveal inline edits.', 'The tool shows surface changes and does not understand the business meaning of clauses, numbers, or code. Rewrapping, indentation, and line-ending changes can create large diffs, so decide whether whitespace matters and use consistent encoding.'],
    steps: [['Place baseline and revision', 'Make clear that the first or left text is older so additions and deletions are interpreted correctly.'], ['Choose an appropriate view', 'Review the overall change, then focus on differing lines and words.'], ['Judge impact manually', 'Inspect numbers, negations, punctuation, and structure to confirm intent.']],
    example: {
      caption: "Line-level location plus word-level highlighting. Only one number changed on the first line, but the whole line is flagged first.",
      inputLabel: "Two texts",
      input: "// left\nport 8080\ntimeout 30s\n\n// right\nport 3000\ntimeout 30s",
      outputLabel: "Differences",
      output: "~ line 1: port [8080 → 3000]\n  line 2: unchanged",
      language: "diff",
    },
    scenarios: [['Reviewing copy revisions', 'Confirm that only agreed paragraphs changed and nothing was accidentally removed.'], ['Diagnosing configuration drift', 'Compare environment configuration or log fragments to locate changes.'], ["Checking a final contract against the previous draft", "Word-level highlighting exposes single-character changes to amounts, dates and liability clauses; exactly what a read-through misses."]],
    notes: ['Matching text does not prove identical system behavior because external context can differ.', 'LF versus CRLF, trailing spaces, and Unicode normalization create nonvisual differences.', 'Sensitive contracts and secrets remain subject to organizational copying and handling rules.'],
    specs: [["Comparison granularity", "Differences are located line by line, then highlighted word by word within changed lines; both shown at once"], ["Algorithm", "Longest common subsequence from an open-source diff library, the same approach git diff uses"], ["Detects", "Added lines, removed lines, and word-level edits within a line"], ["Does not detect", "A moved block shows as one deletion plus one insertion rather than as a move"], ["No understanding of meaning", "Paraphrases and reordered clauses appear as large differences, while a critical change to a number or unit may be one character"], ["Better for JSON", "When both sides are JSON, use JSON Diff; it compares by field and ignores formatting"]],
    faq: [{ question: "Why does a moved block show as a deletion plus an insertion?", answer: "The algorithm is based on longest common subsequence: it decides whether a line exists on both sides without tracking movement. A relocated block has no corresponding position on either side, so it appears as one removal and one addition. git diff behaves the same way." }, { question: "I changed one word; why is the whole line marked?", answer: "Line-level comparison flags the changed line first, then word-level highlighting runs inside it. The line marker looks like everything changed; the inline highlight is what pinpoints the word. Both levels are shown at once." }],
    reference: [['diff', 'A representation of additions and deletions that transform one text sequence into another.'], ['whitespace', 'Spaces, tabs, and line breaks that do not appear as ordinary glyphs.']],
  },
});
