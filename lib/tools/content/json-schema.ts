import { defineToolContent } from './define';

export const jsonSchemaContent = defineToolContent({
  zh: {
    overview: [
      'JSON Schema 用机器可读的规则描述 JSON 允许出现的类型和结构。生成器遍历样本，为对象建立 properties 和 required，为数组推断 items，并识别 integer、number、boolean、null 以及常见的日期、邮箱和 URI 字符串格式。',
      '样本能说明“这次出现了什么”，不能证明所有合法情况。生成的 Draft 2020-12 Schema 会把当前对象字段列为必填，数组中的不同样本可能形成 oneOf，发布前仍需根据业务规则补充可选字段、范围、枚举和 additionalProperties。',
    ],
    steps: [
      ['选择覆盖充分的样本', '让样本包含典型字段、数组成员和边界值，避免只用一条过于简单的记录。'],
      ['生成基础 Schema', '工具递归推断类型与 properties，并输出带 Draft 2020-12 标识的 JSON。'],
      ['加入真实约束', '按接口契约调整 required、enum、format、数值范围和额外属性策略，再用校验工具测试。'],
    ],
    example: {
      caption: "从样本推断出的 schema。它给出了字段和类型，但没有 required、没有取值范围：这些要你补。",
      inputLabel: "JSON 样本",
      input: "{ \"id\": 7, \"name\": \"kit\" }",
      outputLabel: "生成的 Schema",
      output: "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"id\": { \"type\": \"integer\" },\n    \"name\": { \"type\": \"string\" }\n  }\n}",
      language: "json",
    },
    scenarios: [
      ['为接口补契约', '从已有响应快速建立 Schema 骨架，再用于请求校验、文档和测试数据检查。'],
      ['审查配置结构', '把一份可用配置变成明确的类型规则，帮助发现拼错字段和意外类型。'],
      ["为前端表单生成校验规则底稿", "从一份提交示例推断出字段和类型，再补上必填、长度和格式约束，作为表单校验的起点。"],
    ],
    notes: [
      '生成器把样本中出现的对象字段设为 required，但真实接口中的字段可能可选。',
      '空数组没有成员类型信息，只能生成不带具体约束的 items。',
      '字符串格式检测是启发式的，日期或邮箱外观相似的普通文本可能被标记为 format。',
    ],
    specs: [["输出", "从 JSON 样本推断出的 JSON Schema 定义"], ["推断范围", "字段名、类型、嵌套结构和数组元素类型"], ["无法推断的部分", "字段是否必填、取值范围、字符串格式（邮箱 / 日期）、枚举值：这些需要人工补充"], ["单样本局限", "样本里未出现的字段不会进入 schema，可选字段会被当成必填"], ["建议流程", "先用多个有代表性的样本生成，再人工合并、补 required 与约束，最后用 Schema 校验回测"], ["用途", "为接口契约、配置文件校验和表单验证生成初始定义"]],
    faq: [{ question: "生成的 schema 可以直接用吗？", answer: "不建议。它只包含从样本能看出的字段名、类型和结构，缺少 required、取值范围、字符串格式和枚举：这些恰恰是校验真正起作用的部分。请把它当作起草结果，人工补完再用。" }, { question: "怎么用多个样本生成更完整的 schema？", answer: "分别用几个有代表性的样本各生成一份，然后人工合并：所有样本都出现的字段进 required，只在部分样本出现的保持可选，类型不一致的改成联合类型。最后用 Schema 校验回测全部样本。" }],
    reference: [
      ['Draft 2020-12', 'JSON Schema 当前常用规范版本，定义关键字语义与元 Schema 地址。'],
      ['required', '对象中必须存在的属性名数组；它与属性值是否允许 null 是两件不同的事。'],
    ],
  },
  en: {
    overview: [
      'JSON Schema describes allowed JSON types and structures as machine-readable rules. The generator walks a sample, creates object properties and required lists, infers array items, and distinguishes integer, number, boolean, null, plus common date, email, and URI string formats.',
      'A sample proves what appeared once, not every valid case. The generated Draft 2020-12 schema marks observed object fields as required and may use oneOf for differing array samples. Optional fields, ranges, enums, and additionalProperties still need business review.',
    ],
    steps: [
      ['Choose a representative sample', 'Include typical fields, array members, and boundary values rather than one unusually simple record.'],
      ['Generate the base schema', 'The tool recursively infers types and properties and emits JSON identified as Draft 2020-12.'],
      ['Add contract rules', 'Adjust required, enum, format, numeric ranges, and extra-property behavior, then test it with the validator.'],
    ],
    example: {
      caption: "A schema inferred from a sample. It captures fields and types but no required and no ranges; those are yours to add.",
      inputLabel: "JSON sample",
      input: "{ \"id\": 7, \"name\": \"kit\" }",
      outputLabel: "Generated schema",
      output: "{\n  \"type\": \"object\",\n  \"properties\": {\n    \"id\": { \"type\": \"integer\" },\n    \"name\": { \"type\": \"string\" }\n  }\n}",
      language: "json",
    },
    scenarios: [
      ['Adding a contract to an API', 'Create a schema skeleton from an existing response for validation, documentation, and fixture checks.'],
      ['Reviewing configuration shape', 'Turn a known-good config into explicit rules that catch misspelled fields and unexpected types.'],
      ["Drafting validation rules for a front-end form", "Infer fields and types from one submitted example, then add required, length and format constraints as the starting point for form validation."],
    ],
    notes: [
      'Observed object fields are marked required even though the real service may treat some as optional.',
      'An empty array contains no item evidence, so its items schema cannot be constrained automatically.',
      'String format detection is heuristic; ordinary text resembling a date or email can receive a format keyword.',
    ],
    specs: [["Output", "A JSON Schema definition inferred from a JSON sample"], ["What it infers", "Field names, types, nesting, and array element types"], ["What it cannot infer", "Whether a field is required, value ranges, string formats such as email or date, and enum values; all added by hand"], ["Single-sample limits", "Fields missing from the sample never enter the schema, and optional fields look required"], ["Suggested workflow", "Generate from several representative samples, merge and add required plus constraints by hand, then verify with Schema Validator"], ["Used for", "Seeding API contracts, config validation and form validation"]],
    faq: [{ question: "Can I use the generated schema as-is?", answer: "Not advisable. It captures only what a sample reveals; field names, types, structure; and omits required, ranges, string formats and enums, which is precisely where validation earns its keep. Treat it as a draft and finish it by hand." }, { question: "How do I build a fuller schema from several samples?", answer: "Generate one schema per representative sample, then merge by hand: fields present in every sample go into required, fields present in only some stay optional, and conflicting types become unions. Finally regression-test every sample with Schema Validator." }],
    reference: [
      ['Draft 2020-12', 'A widely used JSON Schema specification version defining keyword behavior and the meta-schema URI.'],
      ['required', 'An array of property names that must exist on an object, separate from whether their values may be null.'],
    ],
  },
});
