import { defineToolContent } from './define';

export const jsonToTsContent = defineToolContent({
  zh: {
    overview: [
      'JSON 转 TypeScript 根据一个实际样本递归推断 interface。字符串、数字、布尔值和 null 映射为对应类型，对象生成具名接口，数组使用第一个元素推断成员类型；根数组的对象类型命名为 Item，根对象命名为 Root。',
      '这是从样本得到的起点，不是接口契约。只在其它记录出现的字段、可能缺失的字段以及联合类型无法从单个样本可靠推断，因此生成后必须结合真实 API 文档补上可选标记和更精确类型。',
    ],
    steps: [
      ['提供代表性样本', '尽量选择字段完整、包含典型数组元素的响应，避免用空数组或只含 null 的记录。'],
      ['生成接口声明', '工具递归创建嵌套 interface，并把不合法的标识符 key 保留为带引号属性。'],
      ['按契约修订', '补充可选属性、联合类型、日期别名和不同数组成员，再复制到项目。'],
    ],
    example: {
      caption: "注意生成的字段全部是必填，且 null 值无法推断出真实类型：这两处通常需要人工修正。",
      inputLabel: "JSON 样本",
      input: "{\n  \"id\": 7,\n  \"name\": \"kit\",\n  \"tags\": [\"a\"],\n  \"owner\": null\n}",
      outputLabel: "生成的 interface",
      output: "interface Root {\n  id: number;\n  name: string;\n  tags: string[];\n  owner: null;\n}",
      language: "typescript",
    },
    scenarios: [
      ['快速接入新接口', '先从实际响应得到基础类型，再由开发者按文档收紧，减少重复手写字段。'],
      ['整理旧数据模型', '把缺少类型声明的 JSON 配置转换成可读接口，帮助识别嵌套结构。'],
      ["给没有类型定义的第三方接口补类型", "对方只提供文档和示例响应时，先从样本生成 interface，再按文档补上可选性和联合类型。"],
    ],
    notes: [
      '数组只用第一个元素推断，后续元素不同不会自动生成联合类型。',
      '所有出现的对象字段默认必填，工具无法仅凭样本知道字段是否可能缺失。',
      '日期和 UUID 在 JSON 中都是字符串，不会自动变成 Date 或品牌类型。',
    ],
    specs: [["输出", "从 JSON 样本推断出的 TypeScript interface 定义"], ["推断依据", "只看这一个样本。样本里没出现的字段不会出现在类型里"], ["可选性", "无法从单个样本判断字段是否可选，生成的字段默认都是必填，需要人工标注 ?"], ["null 处理", "值为 null 的字段推断不出真实类型，通常需要手工改成联合类型"], ["数组", "取首个元素推断元素类型。数组内元素结构不一致时需要人工改成联合类型"], ["更可靠的做法", "接口有 OpenAPI / JSON Schema 时应以规范为准生成类型，样本推断只适合快速起步"]],
    faq: [{ question: "为什么所有字段都是必填的？", answer: "单个样本无法体现某个字段是否可能缺失。工具不会替你猜测，需要你对照接口文档给可选字段手工加上 `?`。这也是样本推断只适合起步、不能替代规范的原因。" }, { question: "值为 null 的字段推断成了什么？", answer: "只能推断出 null 本身，因为样本没有提供真实类型的线索。这类字段通常需要手工改成 `string | null` 这样的联合类型，具体类型要看接口文档或多找几个样本。" }],
    reference: [
      ['interface', 'TypeScript 对对象形状的声明，可以描述属性名称、类型与可选性。'],
      ['type inference', '从具体值推测静态类型；样本覆盖不足时，推断结果也必然不完整。'],
    ],
  },
  en: {
    overview: [
      'JSON to TypeScript recursively infers interfaces from one concrete sample. Strings, numbers, booleans, and null map to their basic types; objects become named interfaces; arrays use the first element to infer their item type. A root object is named Root and an object inside a root array is named Item.',
      'The result is a starting point inferred from data, not an API contract. Fields that only appear in other records, optional properties, and unions cannot be established reliably from one sample, so the declaration must be reviewed against real documentation.',
    ],
    steps: [
      ['Provide a representative sample', 'Choose a response with complete fields and typical array items rather than empty arrays or null-only records.'],
      ['Generate declarations', 'Nested interfaces are created recursively and keys that are not valid identifiers remain quoted properties.'],
      ['Refine against the contract', 'Add optional marks, unions, date aliases, and alternate array members before copying the types into a project.'],
    ],
    example: {
      caption: "Note that every field comes out required, and a null value yields no real type; both usually need fixing by hand.",
      inputLabel: "JSON sample",
      input: "{\n  \"id\": 7,\n  \"name\": \"kit\",\n  \"tags\": [\"a\"],\n  \"owner\": null\n}",
      outputLabel: "Generated interface",
      output: "interface Root {\n  id: number;\n  name: string;\n  tags: string[];\n  owner: null;\n}",
      language: "typescript",
    },
    scenarios: [
      ['Starting integration with a new API', 'Generate a basic model from a real response, then tighten it using the API contract instead of typing every field manually.'],
      ['Documenting a legacy data model', 'Turn untyped JSON configuration into readable interfaces that expose the nested shape.'],
      ["Typing a third-party API that ships no types", "When all you have is documentation and a sample response, generate interfaces from the sample and then add optionality and unions from the docs."],
    ],
    notes: [
      'Only the first array item drives inference, so different later items do not automatically create a union.',
      'Every observed object field is required because a sample cannot prove that a field may be absent.',
      'Dates and UUIDs are JSON strings and are not promoted automatically to Date or branded types.',
    ],
    specs: [["Output", "TypeScript interface definitions inferred from a JSON sample"], ["What it infers from", "This one sample only. A field absent from the sample is absent from the type"], ["Optionality", "A single sample cannot show whether a field is optional, so everything is emitted as required and you mark ? by hand"], ["Nulls", "A field whose value is null yields no real type and usually needs widening to a union manually"], ["Arrays", "The element type comes from the first item; mixed-shape arrays need a hand-written union"], ["A more reliable route", "When the API has OpenAPI or JSON Schema, generate from the spec; sample inference is for getting started quickly"]],
    faq: [{ question: "Why is every field required?", answer: "One sample cannot show that a field is sometimes absent. The tool will not guess for you; mark optional fields with `?` yourself against the API documentation. That is exactly why sample inference is a starting point rather than a substitute for a spec." }, { question: "What did a null value infer to?", answer: "Just null, because the sample gives no clue about the real type. Those fields usually need widening by hand to something like `string | null`, with the actual type coming from the docs or from more samples." }],
    reference: [
      ['interface', 'A TypeScript declaration describing an object shape, including property names, types, and optionality.'],
      ['type inference', 'Deducing a static type from concrete values; an incomplete sample necessarily produces an incomplete result.'],
    ],
  },
});
