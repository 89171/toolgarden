import { defineToolContent } from './define';

export const jsonStatsContent = defineToolContent({
  zh: {
    overview: [
      'JSON 统计分析递归遍历文档，计算原始 UTF-8 字节数、压缩后的字节数、最大嵌套层级、key 总数、对象与数组数量、各值类型数量以及最长字符串。它回答的是结构规模问题，不会读取字段的业务含义。',
      '原始体积包含输入中的空白，压缩体积来自重新序列化后的标准 JSON，两者差值可以估算格式化空白开销。统计会访问每个节点，超大文档的耗时和内存都随节点数量增长。',
    ],
    steps: [
      ['粘贴完整文档', '输入标准 JSON、JSONC 或 JSON5，先由解析器确认结构有效。'],
      ['读取结构指标', '结合层级、key 数、数组和对象数量判断数据复杂度，不只看文件字节。'],
      ['定位异常信号', '最长字符串、极深层级或某类值数量异常时，回到源数据检查生成逻辑。'],
    ],
    example: {
      caption: "结构摘要而不是数据本身。体积对比能告诉你压缩是否值得。",
      inputLabel: "JSON 输入",
      input: "{\n  \"users\": [\n    { \"id\": 1, \"tags\": [\"a\"] },\n    { \"id\": 2, \"tags\": [] }\n  ]\n}",
      outputLabel: "统计结果",
      output: "最大层级      4\nkey 总数      7\n类型分布      object 3 / array 3 / number 2 / string 1\n格式化体积    92 B\n压缩后体积    54 B",
      language: "text",
    },
    scenarios: [
      ['评估接口载荷', '比较格式化与压缩体积，并观察结构是否因重复嵌套快速膨胀。'],
      ['审查生成数据', '用类型分布和最长字符串发现意外的 null、巨型内联文本或对象层级。'],
      ["判断是否值得在传输层做压缩", "对比格式化与压缩后的体积差，决定接口是否需要开启最小化或 gzip。"],
    ],
    notes: [
      '字节数按 UTF-8 计算，中文字符通常不等于一个字节。',
      '最大深度从根值开始计数，和某些库把根计为第一层的口径可能相差一。',
      '统计不去重，同一结构重复出现多少次就遍历和计数多少次。',
    ],
    specs: [["统计项", "最大嵌套层级、key 总数、各类型分布、数组长度、格式化与压缩后的体积对比"], ["主要用途", "接手陌生数据时先摸清规模和形状，再决定用什么方式处理"], ["嵌套层级的意义", "层级过深会拖慢树形展示和序列化，也提示数据模型可能需要拆分"], ["类型分布的用处", "同一字段在不同元素里类型不一致，通常是数据质量问题的信号"], ["体积对比", "看出压缩能省多少，判断是否值得在传输层做最小化"], ["不做什么", "只统计不修改，输入数据保持原样"]],
    faq: [{ question: "嵌套层级多深算有问题？", answer: "没有硬性标准，但超过 8 到 10 层通常意味着数据模型可以拆分。层级越深，树形展示、序列化和前端取值的成本都越高，出错时也更难定位。" }, { question: "类型分布能看出什么问题？", answer: "最有价值的信号是同一字段在不同数组元素里类型不一致：比如 id 有时是数字有时是字符串。这类不一致在下游几乎一定会引发 bug，而且往往在测试环境里碰不到。" }],
    reference: [
      ['UTF-8 byte size', '文本编码后的实际字节长度，比 JavaScript 字符串 length 更接近网络传输体积。'],
      ['maximum depth', '从根到最深叶子经历的嵌套层数，可用于识别过度复杂的数据形状。'],
    ],
  },
  en: {
    overview: [
      'JSON Stats walks the document recursively and measures original UTF-8 bytes, minified bytes, maximum nesting depth, total keys, object and array counts, value type counts, and the longest string. It describes structural scale rather than interpreting business meaning.',
      'Original size includes source whitespace while minified size comes from serializing strict JSON again, so their difference estimates formatting overhead. Every node is visited, making time and memory grow with the number of values in a large document.',
    ],
    steps: [
      ['Paste the full document', 'Enter strict JSON, JSONC, or JSON5 and let the parser establish that the structure is valid.'],
      ['Read structural metrics', 'Use depth, key count, and object or array counts together rather than judging complexity from file size alone.'],
      ['Investigate unusual signals', 'If the longest string, nesting depth, or a type count looks abnormal, inspect the producer of the source data.'],
    ],
    example: {
      caption: "A structural summary rather than the data itself. The size comparison tells you whether minifying is worth it.",
      inputLabel: "JSON input",
      input: "{\n  \"users\": [\n    { \"id\": 1, \"tags\": [\"a\"] },\n    { \"id\": 2, \"tags\": [] }\n  ]\n}",
      outputLabel: "Statistics",
      output: "Max depth        4\nTotal keys       7\nTypes            object 3 / array 3 / number 2 / string 1\nFormatted size   92 B\nMinified size    54 B",
      language: "text",
    },
    scenarios: [
      ['Estimating an API payload', 'Compare formatted and minified bytes and see whether repeated nesting is inflating the response.'],
      ['Auditing generated data', 'Use type distribution and longest-string output to spot unexpected nulls, embedded text blobs, or deep objects.'],
      ["Deciding whether transport compression is worth it", "Comparing formatted against minified size tells you whether an endpoint needs minification or gzip enabled."],
    ],
    notes: [
      'Size uses UTF-8 bytes, so a Chinese character does not normally equal one byte.',
      'Depth begins at the root value and can differ by one from libraries that call the root level one.',
      'Statistics do not deduplicate repeated structures; every occurrence is traversed and counted.',
    ],
    specs: [["What it reports", "Maximum nesting depth, total key count, type distribution, array lengths, and formatted vs minified size"], ["Main use", "Sizing up unfamiliar data before deciding how to process it"], ["Why depth matters", "Deep nesting slows tree rendering and serialisation, and hints that the data model may need splitting"], ["Why type distribution matters", "One field holding different types across elements is usually a data-quality signal"], ["Size comparison", "Shows how much minifying saves, which tells you whether it is worth doing at the transport layer"], ["What it does not do", "Only measures; the input is never modified"]],
    faq: [{ question: "How deep is too deep?", answer: "There is no hard rule, but past eight to ten levels the data model can usually be split. Greater depth raises the cost of tree rendering, serialisation and front-end access, and makes failures harder to localise." }, { question: "What does the type distribution reveal?", answer: "The most valuable signal is one field holding different types across array elements; an id that is sometimes a number and sometimes a string. That inconsistency almost always causes a downstream bug, and it often never surfaces in a test environment." }],
    reference: [
      ['UTF-8 byte size', 'The encoded byte length of text, which is closer to transfer size than JavaScript string length.'],
      ['maximum depth', 'The number of nested levels on the deepest route from root to leaf, useful for spotting excessive complexity.'],
    ],
  },
});
