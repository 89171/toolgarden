import { defineToolContent } from './define';

export const jsonYamlContent = defineToolContent({
  zh: {
    overview: [
      'JSON 和 YAML 都能表示对象、数组、字符串、数字、布尔值与空值，但书写方式不同。YAML 依靠缩进和短横线表达层级，适合人工维护；JSON 使用明确的括号与引号，更适合程序交换和严格校验。',
      '双向转换会保留数据结构，不保证保留原文件的注释、空行、锚点写法或标量样式。YAML 中可被解析成日期、数字或布尔值的文本也可能改变类型，因此配置迁移后应检查关键字段。',
    ],
    steps: [
      ['选择转换方向', '根据当前输入选择 JSON 转 YAML 或 YAML 转 JSON，工具不会依赖文件扩展名猜测。'],
      ['粘贴并解析', '输入完整文档；错误信息通常会指出缩进层级、冒号或引号附近的问题。'],
      ['核对类型并导出', '重点检查日期、前导零、布尔值和空值，确认无误后复制转换结果。'],
    ],
    example: {
      caption: "同一份配置的两种写法。YAML 用缩进代替括号，并且可以带注释。",
      inputLabel: "JSON",
      input: "{\n  \"service\": \"api\",\n  \"replicas\": 3,\n  \"env\": { \"LOG_LEVEL\": \"debug\" }\n}",
      outputLabel: "YAML",
      output: "service: api\nreplicas: 3\nenv:\n  LOG_LEVEL: debug",
      language: "yaml",
    },
    scenarios: [
      ['维护部署配置', '把程序生成的 JSON 转成更适合人工阅读的 YAML，用于 CI、容器编排或静态站点配置。'],
      ['接入只收 JSON 的 API', '把现有 YAML 配置转换成严格 JSON，再交给接口、校验器或前端代码使用。'],
      ["把接口响应转成可读的配置草稿", "从 API 拿到的 JSON 转成 YAML 后可以加注释说明每个字段的含义，作为团队内部文档。"],
    ],
    notes: [
      '转换目标是等价数据结构，不是原文格式复制。注释、空行和键的排版方式可能消失。',
      'YAML 使用空格表示层级，Tab 缩进容易造成解析失败，建议统一使用两个或四个空格。',
      '锚点与别名在解析后会展开为普通数据，循环引用不能表示为标准 JSON。',
    ],
    specs: [["转换方向", "JSON → YAML 与 YAML → JSON 双向"], ["YAML 独有能力", "注释、锚点与引用、多文档（---）：转成 JSON 时这些都会丢失"], ["缩进敏感", "YAML 用缩进表示层级，混用制表符和空格是最常见的解析失败原因"], ["容易踩的坑", "YAML 里未加引号的 yes / no / on / off 会被解析成布尔值，`1.0` 会变成数字"], ["前导零", "邮编、电话号码这类以 0 开头的值必须加引号，否则会被当作数字丢掉前导零"], ["典型用途", "在服务配置、Kubernetes 清单、CI 流水线定义和接口数据之间互转"]],
    faq: [{ question: "转成 JSON 后注释为什么消失了？", answer: "标准 JSON 没有注释语法，无处存放。这是格式限制而不是工具丢内容：需要保留注释就保留原始 YAML 文件，只把转换结果用于必须是 JSON 的场景。" }, { question: "YAML 里的 no 和 off 为什么变成了 false？", answer: "YAML 会把未加引号的 yes / no / on / off 解析成布尔值。如果它们本来是字符串（比如国家代码 NO 表示挪威），必须加引号。同理，以 0 开头的邮编不加引号会被当作数字丢掉前导零。" }],
    reference: [
      ['scalar', 'YAML 中不可再分的单个值，例如字符串、数字、布尔值或 null。'],
      ['anchor and alias', 'YAML 复用一段数据的机制，使用 & 定义锚点、使用 * 引用；JSON 没有对应语法。'],
    ],
  },
  en: {
    overview: [
      'JSON and YAML can both represent objects, arrays, strings, numbers, booleans, and null values, but their syntax serves different readers. YAML uses indentation and list markers for human-maintained configuration; JSON uses explicit brackets and quotes for strict program interchange.',
      'Conversion preserves the data structure, not comments, blank lines, anchor spelling, or scalar style. YAML text that resembles a date, number, or boolean can also be assigned a different type, so important fields should be checked after migration.',
    ],
    steps: [
      ['Choose the direction', 'Select JSON to YAML or YAML to JSON explicitly; the tool does not guess from a file extension.'],
      ['Paste and parse the document', 'Enter the complete input. Parse errors usually point near a bad indentation level, colon, or quote.'],
      ['Check types and copy', 'Review dates, leading zeroes, booleans, and nulls before copying the converted document.'],
    ],
    example: {
      caption: "One configuration in both notations. YAML swaps brackets for indentation and can carry comments.",
      inputLabel: "JSON",
      input: "{\n  \"service\": \"api\",\n  \"replicas\": 3,\n  \"env\": { \"LOG_LEVEL\": \"debug\" }\n}",
      outputLabel: "YAML",
      output: "service: api\nreplicas: 3\nenv:\n  LOG_LEVEL: debug",
      language: "yaml",
    },
    scenarios: [
      ['Maintaining deployment configuration', 'Turn generated JSON into readable YAML for CI, container orchestration, or static-site configuration.'],
      ['Calling a JSON-only API', 'Convert an existing YAML configuration to strict JSON for an API, validator, or frontend application.'],
      ["Turning an API response into a readable config draft", "JSON from an endpoint becomes YAML you can annotate field by field, which then serves as internal documentation."],
    ],
    notes: [
      'The result is an equivalent data structure, not a source-format clone. Comments, blank lines, and layout choices may disappear.',
      'YAML hierarchy uses spaces. Tab indentation commonly causes parse failures, so keep indentation consistent.',
      'Anchors and aliases are expanded into ordinary data. Cyclic references cannot be represented in strict JSON.',
    ],
    specs: [["Directions", "JSON to YAML and YAML to JSON"], ["YAML-only features", "Comments, anchors and references, multi-document streams (---); all lost when converting to JSON"], ["Indentation sensitive", "YAML expresses nesting through indentation, and mixing tabs with spaces is the most common parse failure"], ["Easy traps", "Unquoted yes / no / on / off parse as booleans in YAML, and `1.0` becomes a number"], ["Leading zeros", "Postcodes and phone numbers starting with 0 must be quoted, or they are read as numbers and lose the zero"], ["Typical use", "Moving between service config, Kubernetes manifests, CI pipeline definitions and API data"]],
    faq: [{ question: "Where did my comments go after converting to JSON?", answer: "Strict JSON has no comment syntax and nowhere to keep them. That is a format limit, not the tool dropping content; keep the original YAML and use the conversion only where JSON is required." }, { question: "Why did no and off become false?", answer: "YAML parses unquoted yes / no / on / off as booleans. If they were meant as strings; NO as the country code for Norway, say; they have to be quoted. The same applies to postcodes starting with 0, which lose the zero if left unquoted." }],
    reference: [
      ['scalar', 'A single YAML value that cannot be divided further, such as a string, number, boolean, or null.'],
      ['anchor and alias', 'YAML syntax for reusing data with & and *. JSON has no equivalent source notation.'],
    ],
  },
});
