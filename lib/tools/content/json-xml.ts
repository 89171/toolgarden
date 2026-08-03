import { defineToolContent } from './define';

export const jsonXmlContent = defineToolContent({
  zh: {
    overview: [
      'JSON 是键值与数组组成的数据模型，XML 则由元素、属性和文本节点组成，两者并不存在唯一的一一映射。同一份 XML 可以根据解析规则变成不同 JSON，所以转换结果应视为一种约定，而不是可还原所有排版细节的存档格式。',
      '工具适合处理常规 API 与配置数据。重复同名元素通常映射为数组，元素属性与正文需要用不同字段表示；命名空间、混合内容和 CDATA 较多的文档转换后尤其需要人工核对。',
    ],
    steps: [
      ['选择源格式', '根据输入选择 JSON 转 XML 或 XML 转 JSON，并粘贴完整根对象或根元素。'],
      ['执行结构转换', '解析器会建立树结构；语法错误会指出缺少的括号、引号或闭合标签。'],
      ['检查重复节点与属性', '确认数组、属性、文本节点及命名空间前缀符合下游系统期待，再复制输出。'],
    ],
    example: {
      caption: "注意 XML 侧的类型丢失：3 和 true 都变成了纯文本，转回 JSON 时只能靠推断。",
      inputLabel: "JSON",
      input: "{\n  \"book\": { \"id\": 3, \"title\": \"SQL\", \"inStock\": true }\n}",
      outputLabel: "XML",
      output: "<book>\n  <id>3</id>\n  <title>SQL</title>\n  <inStock>true</inStock>\n</book>",
      language: "xml",
    },
    scenarios: [
      ['连接旧式 XML 接口', '把前端或脚本中的 JSON 数据转换成 XML 请求体，减少手写标签和转义错误。'],
      ['分析配置与响应', '把层级较深的 XML 转成 JSON，便于用现有 JavaScript 工具遍历和检查。'],
      ["把 XML 配置迁移到 JSON 技术栈", "旧系统的 XML 配置转成 JSON 后可以接入现代工具链，再逐步替换掉原有的解析代码。"],
    ],
    notes: [
      '属性、文本和子元素可以同名，复杂 XML 的映射规则必须与接收方约定一致。',
      'JSON 的 null、数字和布尔类型写进 XML 后通常只剩文本，再转回来不一定恢复原类型。',
      '元素顺序在 XML 中可能有语义，对象 key 顺序却通常不应被业务依赖。',
    ],
    specs: [["转换方向", "JSON → XML 与 XML → JSON 双向"], ["结构差异", "JSON 有原生数组，XML 没有：数组需要约定一个包装元素来表示"], ["类型丢失", "XML 里一切都是文本。数字、布尔、null 转成 XML 后失去类型，转回来需要靠推断"], ["属性与元素", "XML 的属性在 JSON 里通常映射为带前缀的键，往返转换后可能与原文档不完全一致"], ["命名空间", "转成 JSON 时命名空间前缀会作为键名的一部分保留，语义信息不再被解析器理解"], ["典型用途", "对接 SOAP 接口、遗留系统和以 XML 为交换格式的行业标准"]],
    faq: [{ question: "往返转换后为什么和原文档不一样？", answer: "两种格式的表达能力不对等。JSON 没有属性和命名空间的概念，XML 没有原生数组和类型。转过去再转回来时，这些差异需要靠约定填补，约定与原文档不一致就会有出入。" }, { question: "数组转成 XML 后结构很奇怪？", answer: "XML 没有数组类型，只能用重复的同名元素表示，通常还需要一个包装元素。不同工具的包装约定不一样，对接时要和接收方确认预期的结构。" }],
    reference: [
      ['attribute', '写在开始标签里的键值信息，例如 <item id="7"> 中的 id。'],
      ['mixed content', '同一个元素同时包含文本和子元素的 XML 结构，映射到普通 JSON 时最容易丢失顺序信息。'],
    ],
  },
  en: {
    overview: [
      'JSON models keyed values and arrays, while XML models elements, attributes, and text nodes. There is no single universal mapping between them, so the output follows a convention rather than preserving every source formatting detail.',
      'The tool is intended for ordinary API and configuration documents. Repeated sibling elements usually become arrays, while attributes and element text need distinct fields. Namespaces, mixed content, and CDATA-heavy XML require extra review after conversion.',
    ],
    steps: [
      ['Choose the source format', 'Select JSON to XML or XML to JSON and enter a complete root object or root element.'],
      ['Convert the structure', 'The parser builds a tree and reports missing brackets, quotes, or closing tags before producing output.'],
      ['Review repeated nodes and attributes', 'Confirm arrays, attributes, text nodes, and namespace prefixes match the contract expected downstream.'],
    ],
    example: {
      caption: "Note the type loss on the XML side: both 3 and true become plain text, and converting back relies on inference.",
      inputLabel: "JSON",
      input: "{\n  \"book\": { \"id\": 3, \"title\": \"SQL\", \"inStock\": true }\n}",
      outputLabel: "XML",
      output: "<book>\n  <id>3</id>\n  <title>SQL</title>\n  <inStock>true</inStock>\n</book>",
      language: "xml",
    },
    scenarios: [
      ['Calling a legacy XML service', 'Turn application JSON into an XML request body without hand-writing every tag and escape.'],
      ['Inspecting configuration or responses', 'Convert deeply nested XML to JSON so existing JavaScript tooling can traverse and validate it.'],
      ["Migrating XML configuration to a JSON stack", "Converting a legacy system's XML config to JSON lets modern tooling consume it while the old parsing code is retired gradually."],
    ],
    notes: [
      'Attributes, text, and child elements can collide in name. Complex XML needs a mapping contract shared with the receiver.',
      'JSON nulls, numbers, and booleans usually become XML text and may not recover the original type on a round trip.',
      'Element order can carry meaning in XML, while business logic should not normally depend on JSON object key order.',
    ],
    specs: [["Directions", "JSON to XML and XML to JSON"], ["Structural mismatch", "JSON has native arrays and XML does not; arrays need an agreed wrapper element"], ["Type loss", "Everything in XML is text. Numbers, booleans and null lose their type, and converting back relies on inference"], ["Attributes vs elements", "XML attributes usually map to prefixed keys in JSON, so a round trip may not reproduce the original document exactly"], ["Namespaces", "Namespace prefixes survive as part of the key name, but the semantics are no longer understood by a parser"], ["Typical use", "SOAP APIs, legacy systems, and industry standards that exchange XML"]],
    faq: [{ question: "Why does a round trip not reproduce the original?", answer: "The two formats are not equally expressive. JSON has no notion of attributes or namespaces; XML has no native arrays or types. Bridging those gaps takes a convention, and any mismatch with the original document shows up as a difference." }, { question: "Why does my array look strange in XML?", answer: "XML has no array type, so it is expressed as repeated same-named elements, usually inside a wrapper. Conventions for that wrapper vary between tools, so confirm the expected structure with whoever consumes it." }],
    reference: [
      ['attribute', 'A key-value pair written in an opening tag, such as id in <item id="7">.'],
      ['mixed content', 'An XML element containing both text and child elements, where ordinary JSON mappings can lose ordering information.'],
    ],
  },
});
