import { defineToolContent } from './define';

export const jsonSchemaValidateContent = defineToolContent({
  zh: {
    overview: [
      'JSON Schema 校验把数据与一组明确规则逐层比对，错误会带上 `$` 开头的字段路径。当前实现支持类型、const、enum、allOf、anyOf、oneOf、字符串长度与 pattern、常见 format、数值范围、数组数量与 items、对象 required、properties 和 additionalProperties 等常用约束。',
      '校验成功只表示输入满足这份 Schema，不代表业务语义一定正确。Schema 本身也需要版本管理和测试，尤其是 oneOf 的互斥、format 的严格程度以及 additionalProperties 是否允许扩展字段。',
    ],
    steps: [
      ['输入待验证 JSON', '左侧放真实数据，JSONC 和 JSON5 也会先被解析为标准数据结构。'],
      ['输入 Schema', '右侧放对象形式的 JSON Schema，确保关键字拼写和嵌套位置正确。'],
      ['按错误路径修复', '逐条查看期望类型、缺失字段或范围错误；修改后重新校验直到无错误。'],
    ],
    example: {
      caption: "错误信息带上字段路径，可以直接定位到出问题的位置。",
      inputLabel: "Schema 与数据",
      input: "// schema\n{ \"type\": \"object\",\n  \"required\": [\"id\"],\n  \"properties\": { \"id\": { \"type\": \"integer\" } } }\n\n// data\n{ \"id\": \"7\" }",
      outputLabel: "校验结果",
      output: "$.id  期望 integer，实际得到 string",
      language: "json",
    },
    scenarios: [
      ['检查 API 请求体', '在发送前确认必填字段、类型、枚举与格式满足后端约定。'],
      ['验证配置迁移', '批量修改配置后，用同一 Schema 发现缺字段、额外字段或数值越界。'],
      ["回归测试 schema 本身", "改动 schema 后拿历史样本逐一回测，确认新约束没有把原本合法的数据判为错误。"],
    ],
    notes: [
      '这不是完整的 JSON Schema 引擎，未实现的高级关键字不应被视为已经校验。',
      'format 校验覆盖 email、date、date-time 和 uri 等常见值，但格式通过不代表地址真实存在。',
      'oneOf 要求恰好一个分支匹配，多个分支同时通过也会被判为错误。',
    ],
    specs: [
      ['输入', '一份 JSON Schema 和一份待校验的 JSON 数据'],
      ['输出', '通过与否，以及每条错误的字段路径和原因'],
      ['支持的约束', '类型、required、枚举、数值范围、字符串长度与格式、数组长度、嵌套对象'],
      ['常见误判来源', 'schema 里漏写 required 时，缺字段的数据也会通过校验'],
      ['additionalProperties', '默认允许额外字段。要拒绝未声明的字段需在 schema 里显式设为 false'],
      ['与生成的配合', '先用 JSON Schema 生成起草，补完约束后用这里回测多份样本'],
    ],
    faq: [{ question: "数据明显缺字段，为什么还是通过了？", answer: "因为 schema 里没有写 required。JSON Schema 默认所有字段都是可选的：不声明 required 就等于允许缺失。这是最常见的一类「校验通过但数据不对」。" }, { question: "怎么禁止多出来的字段？", answer: "在对象上显式设置 `additionalProperties: false`。默认是允许额外字段的，所以拼错的 key 会被当作新增字段静默接受，而不是报错。" }],
    reference: [
      ['instance', '被 Schema 检查的实际 JSON 数据。'],
      ['additionalProperties', '控制 properties 未声明的对象字段是否允许出现，设为 false 时可捕获拼错 key。'],
    ],
  },
  en: {
    overview: [
      'JSON Schema validation walks data against explicit rules and reports each failure with a `$`-based path. The current implementation covers common constraints including type, const, enum, allOf, anyOf, oneOf, string lengths and patterns, selected formats, numeric ranges, array counts and items, required properties, properties, and additionalProperties.',
      'A passing result only means the instance satisfies this schema; it does not prove business meaning is correct. The schema itself needs versioning and tests, especially around oneOf exclusivity, format strictness, and whether extension fields are permitted.',
    ],
    steps: [
      ['Enter the JSON instance', 'Put real data on the left. JSONC and JSON5 are parsed into a standard data structure first.'],
      ['Enter the schema', 'Put an object-shaped JSON Schema on the right and check keyword spelling and nesting.'],
      ['Fix errors by path', 'Review expected types, missing properties, and range failures, then validate again after editing.'],
    ],
    example: {
      caption: "Errors carry the field path, so you can go straight to what failed.",
      inputLabel: "Schema and data",
      input: "// schema\n{ \"type\": \"object\",\n  \"required\": [\"id\"],\n  \"properties\": { \"id\": { \"type\": \"integer\" } } }\n\n// data\n{ \"id\": \"7\" }",
      outputLabel: "Validation result",
      output: "$.id  expected integer, received string",
      language: "json",
    },
    scenarios: [
      ['Checking an API request body', 'Verify required fields, types, enums, and formats before a payload reaches the backend.'],
      ['Validating a configuration migration', 'Use one schema to find missing, unexpected, or out-of-range values after bulk edits.'],
      ["Regression-testing the schema itself", "After changing a schema, run historical samples through it to confirm the new constraints do not reject data that was previously valid."],
    ],
    notes: [
      'This is not a complete JSON Schema engine. An unsupported advanced keyword must not be assumed to have been enforced.',
      'Format checks include common email, date, date-time, and URI shapes, but a valid shape does not prove a resource exists.',
      'oneOf requires exactly one matching branch; matching several branches is also an error.',
    ],
    specs: [
      ['Input', 'A JSON Schema plus the JSON data to check against it'],
      ['Output', 'Pass or fail, with the field path and reason for every error'],
      ['Supported constraints', 'Types, required, enums, numeric ranges, string length and format, array length, nested objects'],
      ['Common false pass', 'A schema that omits required accepts data with fields missing'],
      ['additionalProperties', 'Extra fields are allowed by default; set it to false in the schema to reject undeclared ones'],
      ['Pairs with', 'Draft with JSON Schema Generator, fill in the constraints, then regression-test several samples here'],
    ],
    faq: [{ question: "Data is clearly missing fields; why did it pass?", answer: "Because the schema has no required. JSON Schema treats every property as optional by default, so not declaring required is the same as permitting absence. This is the most common form of \"validated but wrong\"." }, { question: "How do I reject unexpected fields?", answer: "Set `additionalProperties: false` on the object explicitly. Extra fields are allowed by default, so a misspelled key is silently accepted as a new property rather than reported as an error." }],
    reference: [
      ['instance', 'The actual JSON value being checked by a schema.'],
      ['additionalProperties', 'Controls object keys not listed in properties; false is useful for catching misspelled keys.'],
    ],
  },
});
