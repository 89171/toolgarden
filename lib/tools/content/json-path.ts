import { defineToolContent } from './define';

export const jsonPathContent = defineToolContent({
  zh: {
    overview: [
      'JSONPath 用一条表达式从嵌套 JSON 中选择节点，作用类似文件路径和查询条件的结合。根节点写作 `$`，点号或方括号访问属性，`*` 选择同级全部成员，递归下降与过滤表达式可在未知深度或数组中查找匹配项。',
      '工具基于 jsonpath-plus 执行查询，结果始终以数组形式输出，即使只命中一个值。这能区分“没有命中”和“命中一个值”，也便于把同一表达式用于单项与多项数据。',
    ],
    steps: [
      ['输入完整 JSON', '先确认数据能够解析，并找到准备查询的根对象或数组。'],
      ['编写 JSONPath', '从 `$` 开始逐层缩小范围，先用简单属性和索引，再增加通配符或过滤条件。'],
      ['检查结果集合', '确认命中数量和类型；空数组表示表达式有效但没有匹配节点。'],
    ],
    example: {
      caption: "三种常见表达式在同一份数据上的结果。注意返回值始终是数组。",
      inputLabel: "数据与表达式",
      input: "// data\n{ \"books\": [\n    { \"title\": \"A\", \"price\": 8 },\n    { \"title\": \"B\", \"price\": 20 } ] }\n\n$.books[*].title\n$.books[?(@.price < 10)].title",
      outputLabel: "查询结果",
      output: "[\"A\", \"B\"]\n\n[\"A\"]",
      language: "json",
    },
    scenarios: [
      ['从接口响应取字段', '从深层分页响应里一次提取所有商品 ID、错误消息或用户邮箱。'],
      ['验证数据分布', '用过滤表达式找出价格超范围、状态异常或缺少目标字段的数组成员。'],
      ["从超大响应里取出目标子树", "几十 MB 的响应用树形视图翻找很慢，用一条表达式直接取出需要的分支再单独查看。"],
    ],
    notes: [
      '属性名包含点号、空格或短横线时，应使用方括号加引号访问，避免被解析成多个路径段。',
      '过滤表达式可以执行条件判断，不要把不可信表达式直接嵌入生产代码。',
      'JSONPath 有多个实现方言，复杂表达式移植到其它库前应重新测试。',
    ],
    specs: [
      ['表达式语法', 'JSONPath，根节点为 $，用点号或方括号逐层访问'],
      ['常用写法', '$.store.book[0].title 取单值，$..author 递归搜索，$.book[*].price 取全部'],
      ['过滤器', '支持 ?() 条件过滤，如 $.book[?(@.price < 10)]'],
      ['返回形式', '始终返回匹配结果的数组，没有匹配时返回空数组而不是报错'],
      ['与结构查看的区别', '格式化适合浏览整体结构，JSONPath 适合从超大文档里精确取出你要的那部分'],
      ['方言差异', 'JSONPath 没有单一权威规范，不同实现对过滤器和递归的支持略有出入'],
    ],
    faq: [{ question: "结果为什么总是数组？", answer: "因为 JSONPath 的语义是「选择所有匹配的节点」，匹配数量可能是 0、1 或多个。统一返回数组可以区分「没有命中」（空数组）和「命中一个」（长度 1），同一表达式也就能同时处理单值和多值场景。" }, { question: "属性名里有点号或短横线怎么写？", answer: "用方括号加引号：`$['user-name']` 或 `$['a.b']`。直接写 `$.user-name` 会被解析成减法或多个路径段，得不到预期结果。" }],
    reference: [
      ['root selector', '表达式开头的 `$`，代表当前 JSON 文档根值。'],
      ['recursive descent', '使用 `..` 在任意深度查找指定属性，方便但可能命中比预期更多的节点。'],
    ],
  },
  en: {
    overview: [
      'JSONPath selects nodes from nested JSON with an expression combining path navigation and query conditions. `$` names the root, dot or bracket syntax accesses properties, `*` selects siblings, and recursive descent or filters locate matches inside unknown depths and arrays.',
      'Queries run through jsonpath-plus and the result is always emitted as an array, even for one match. This distinguishes no match from one match and lets the same expression handle single and repeated data.',
    ],
    steps: [
      ['Enter valid JSON', 'Confirm the document parses and identify the object or array that contains the values of interest.'],
      ['Write a JSONPath expression', 'Start at `$`, narrow with properties and indexes, then add wildcards or filters only where needed.'],
      ['Review the result set', 'Check match count and value types. An empty array means the expression ran but selected nothing.'],
    ],
    example: {
      caption: "Three common expressions against one document. Note that the result is always an array.",
      inputLabel: "Data and expressions",
      input: "// data\n{ \"books\": [\n    { \"title\": \"A\", \"price\": 8 },\n    { \"title\": \"B\", \"price\": 20 } ] }\n\n$.books[*].title\n$.books[?(@.price < 10)].title",
      outputLabel: "Query results",
      output: "[\"A\", \"B\"]\n\n[\"A\"]",
      language: "json",
    },
    scenarios: [
      ['Extracting fields from an API response', 'Collect every product ID, error message, or email from a deeply nested paginated response.'],
      ['Checking a data distribution', 'Use a filter to find array members with out-of-range prices, unexpected states, or missing target fields.'],
      ["Pulling a subtree out of a very large response", "Clicking through a tree view of tens of megabytes is slow; one expression extracts the branch you need to inspect on its own."],
    ],
    notes: [
      'Property names containing dots, spaces, or hyphens need quoted bracket notation so they are not split into path segments.',
      'Filter expressions can evaluate conditions. Do not embed untrusted expressions directly in production code.',
      'JSONPath has several dialects, so retest complex expressions before moving them to another library.',
    ],
    specs: [
      ['Expression syntax', 'JSONPath, rooted at $, descending with dots or brackets'],
      ['Common forms', '$.store.book[0].title for one value, $..author to search recursively, $.book[*].price for all'],
      ['Filters', '?() conditions are supported, as in $.book[?(@.price < 10)]'],
      ['Return shape', 'Always an array of matches; no match yields an empty array rather than an error'],
      ['vs browsing the structure', 'The formatter is for surveying a document; JSONPath is for pulling one part out of a very large one'],
      ['Dialect differences', 'JSONPath has no single authoritative spec, so implementations differ slightly on filters and recursion'],
    ],
    faq: [{ question: "Why is the result always an array?", answer: "Because JSONPath means \"select every matching node\", and that count may be zero, one or many. Always returning an array distinguishes no match (empty) from one match (length 1), and lets the same expression handle single and repeated values." }, { question: "How do I address a property with a dot or hyphen in its name?", answer: "Quoted bracket notation: `$['user-name']` or `$['a.b']`. Writing `$.user-name` is parsed as subtraction or as separate path segments and will not do what you want." }],
    reference: [
      ['root selector', 'The `$` at the beginning of an expression, representing the current JSON document root.'],
      ['recursive descent', 'The `..` operator for finding a named property at any depth; useful but capable of selecting more than expected.'],
    ],
  },
});
