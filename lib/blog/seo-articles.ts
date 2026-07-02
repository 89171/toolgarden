import type { BlogArticle } from './articles';

const jsonToTsInput = `{
  "id": 1001,
  "name": "ToolGarden",
  "active": true,
  "tags": ["json", "typescript"],
  "profile": {
    "score": 98.5,
    "city": null
  }
}`;

const jsonToTsOutput = `interface Root {
  id: number;
  name: string;
  active: boolean;
  tags: string[];
  profile: Profile;
}

interface Profile {
  score: number;
  city: null;
}`;

const invalidUnexpectedTokenJson = `{
  "name": "Tom",
  "age": 18,
}`;

const fixedUnexpectedTokenJson = `{
  "name": "Tom",
  "age": 18
}`;

const jsonSchemaInput = `{
  "id": 1001,
  "email": "user@example.com",
  "roles": ["admin"],
  "active": true
}`;

const jsonSchemaExample = `{
  "type": "object",
  "required": ["id", "email", "roles", "active"],
  "properties": {
    "id": { "type": "number" },
    "email": { "type": "string", "format": "email" },
    "roles": {
      "type": "array",
      "items": { "type": "string" }
    },
    "active": { "type": "boolean" }
  }
}`;

const jwtShape = `xxxxx.yyyyy.zzzzz
header.payload.signature`;

const qrWifiText = `WIFI:T:WPA;S:MyNetwork;P:myPassword;;`;

const qrVCardText = `BEGIN:VCARD
VERSION:3.0
FN:ToolGarden
URL:https://toolgarden.xyz
END:VCARD`;

const textDiffBefore = `Checkout success
Payment pending
Send email receipt`;

const textDiffAfter = `Checkout success
Payment completed
Send email receipt`;

export const seoBlogArticles = [
  {
    slug: 'convert-json-to-typescript-interface',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何把 JSON 转成 TypeScript Interface？',
        excerpt: '把接口返回的 JSON 样本转成 TypeScript interface，可以减少手写类型的重复劳动，也能让前端代码更容易获得类型提示。',
        metaTitle: '如何把 JSON 转成 TypeScript Interface？在线生成 TS 类型教程',
        metaDescription: '讲解如何从 JSON 样本自动生成 TypeScript Interface，包括对象、数组、null、嵌套结构和接口命名的处理建议。',
        readingTime: '约 6 分钟阅读',
        tags: ['JSON 转 TypeScript', 'TypeScript Interface', '前端开发', 'JSON'],
        relatedTools: [
          {
            label: 'JSON → TypeScript',
            href: '/json-to-ts',
            description: '粘贴 JSON 样本，自动推断并生成 TypeScript interface。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '先格式化和校验 JSON，再生成更稳定的类型定义。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '把 JSON 转成 TypeScript Interface，本质上是从一份真实数据样本里推断字段名、字段类型和嵌套结构。',
          },
          {
            type: 'paragraph',
            text: '前端接接口时，经常会先拿到一段返回 JSON，再手写对应的 TypeScript 类型。字段少的时候还好，字段一多、嵌套一深，就很容易漏字段、写错数组类型，或者把可能为 null 的值误写成 string。',
          },
          { type: 'heading', level: 2, text: '一个简单例子' },
          { type: 'code', language: 'json', code: jsonToTsInput },
          {
            type: 'paragraph',
            text: '这段 JSON 可以推断出根对象、嵌套 profile 对象、字符串数组 tags，以及 null 字段 city。',
          },
          { type: 'code', language: 'typescript', code: jsonToTsOutput },
          { type: 'heading', level: 2, text: '类型推断通常怎么判断？' },
          {
            type: 'table',
            headers: ['JSON 值', 'TypeScript 类型', '说明'],
            rows: [
              ['字符串', 'string', '例如 name、email、url'],
              ['数字', 'number', 'TypeScript 不区分 int 和 float'],
              ['true / false', 'boolean', '适合状态字段'],
              ['数组', 'T[]', '根据数组元素继续推断'],
              ['对象', 'interface', '嵌套对象通常会生成新接口'],
              ['null', 'null 或联合类型', '如果样本不足，需要人工确认是否还可能是 string 或 number'],
            ],
          },
          { type: 'heading', level: 2, text: '生成后还要检查哪些地方？' },
          {
            type: 'list',
            items: [
              '数组为空时无法知道元素类型，需要补充更完整的样本。',
              '同一字段有时是字符串、有时是 null，应改成联合类型，例如 string | null。',
              '接口命名最好和业务语义一致，不要全部保留 Root、Item 这类临时名字。',
              '日期字符串通常仍然是 string，不要直接当成 Date，除非代码里会主动转换。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON → TypeScript',
            text: '粘贴 JSON、JSONC 或 JSON5 样本后，可以直接生成 TypeScript interface，适合快速给 API 响应、配置文件和 mock 数据补类型。',
            href: '/json-to-ts',
            linkLabel: '打开 JSON → TypeScript',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '自动生成 interface 适合做第一版类型草稿。真正用于项目时，建议再根据接口文档和业务规则检查可选字段、null、枚举值和命名。',
          },
        ],
      },
      en: {
        title: 'How to Convert JSON to a TypeScript Interface',
        excerpt: 'Converting a JSON sample into TypeScript interfaces saves repetitive typing and gives frontend code better autocomplete and safer API handling.',
        metaTitle: 'How to Convert JSON to a TypeScript Interface',
        metaDescription: 'Learn how JSON samples become TypeScript interfaces, including nested objects, arrays, null values, generated names, and post-generation checks.',
        readingTime: '6 min read',
        tags: ['JSON to TypeScript', 'TypeScript Interface', 'Frontend', 'JSON'],
        relatedTools: [
          {
            label: 'JSON to TypeScript',
            href: '/json-to-ts',
            description: 'Paste a JSON sample and generate TypeScript interfaces automatically.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format and validate JSON before generating cleaner type definitions.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Converting JSON to TypeScript interfaces means inferring field names, value types, arrays, and nested objects from a real sample.',
          },
          {
            type: 'paragraph',
            text: 'When frontend developers integrate an API, they often receive a JSON response first and write the TypeScript type by hand. That works for small objects, but nested responses make it easy to miss fields or misread nullable values.',
          },
          { type: 'heading', level: 2, text: 'A Simple Example' },
          { type: 'code', language: 'json', code: jsonToTsInput },
          {
            type: 'paragraph',
            text: 'This sample contains a root object, a nested profile object, a string array, and a null field.',
          },
          { type: 'code', language: 'typescript', code: jsonToTsOutput },
          { type: 'heading', level: 2, text: 'How Types Are Inferred' },
          {
            type: 'table',
            headers: ['JSON value', 'TypeScript type', 'Notes'],
            rows: [
              ['String value', 'string', 'Common for names, emails, and URLs'],
              ['Number value', 'number', 'TypeScript does not separate int and float'],
              ['true / false', 'boolean', 'Common for status fields'],
              ['Array value', 'T[]', 'Element types are inferred from array items'],
              ['Object value', 'interface', 'Nested objects usually become new interfaces'],
              ['null value', 'null or union type', 'A single sample may not reveal every possible value'],
            ],
          },
          { type: 'heading', level: 2, text: 'What Should You Check After Generation?' },
          {
            type: 'list',
            items: [
              'Empty arrays cannot reveal their item type, so provide a more complete sample when possible.',
              'Fields that may be null should often become union types such as string | null.',
              'Rename temporary interfaces such as Root or Item to match your domain model.',
              'Date-like strings are still strings unless your code actively converts them to Date objects.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON to TypeScript',
            text: 'Paste JSON, JSONC, or JSON5 and generate TypeScript interfaces for API responses, config files, and mock data.',
            href: '/json-to-ts',
            linkLabel: 'Open JSON to TypeScript',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Generated interfaces are an excellent first draft. Before using them in production code, review optional fields, nullable values, enum-like strings, and naming.',
          },
        ],
      },
    },
  },
  {
    slug: 'fix-json-unexpected-token-error',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: 'JSON 报错 Unexpected token 怎么修复？常见 JSON 错误排查',
        excerpt: 'Unexpected token 通常说明 JSON 解析器遇到了不符合标准 JSON 语法的字符，比如尾逗号、注释、单引号或未加引号的 key。',
        metaTitle: 'JSON Unexpected token 怎么修复？常见 JSON 报错原因',
        metaDescription: '整理 JSON Unexpected token 常见原因，包括尾逗号、注释、单引号、未加引号 key、智能引号和 [object Object]，并给出修复方法。',
        readingTime: '约 7 分钟阅读',
        tags: ['JSON 报错', 'Unexpected token', 'JSON 修复', 'JSON 校验'],
        relatedTools: [
          {
            label: 'JSON 修复清洗',
            href: '/json-repair',
            description: '修复注释、尾逗号、单引号、未加引号 key 等常见 JSON 问题。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '格式化并验证 JSON，快速定位语法问题。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Unexpected token 的意思是：解析器读到某个字符时，发现它不应该出现在当前位置。',
          },
          {
            type: 'paragraph',
            text: '这个错误经常出现在 JSON.parse、接口调试、配置文件导入和在线校验时。错误提示有时会写 Unexpected token }、Unexpected token o、Unexpected token <，不同字符对应的原因也不一样。',
          },
          { type: 'heading', level: 2, text: '最常见原因：尾逗号' },
          { type: 'code', language: 'json', code: invalidUnexpectedTokenJson },
          {
            type: 'paragraph',
            text: '标准 JSON 不允许对象或数组最后一个元素后面保留逗号。删除最后一个逗号后才是合法 JSON。',
          },
          { type: 'code', language: 'json', code: fixedUnexpectedTokenJson },
          { type: 'heading', level: 2, text: '不同 token 通常代表什么？' },
          {
            type: 'table',
            headers: ['错误提示', '常见原因', '修复思路'],
            rows: [
              ['Unexpected token }', '尾逗号或缺少值', '检查对象和数组结尾'],
              ['Unexpected token o', '把对象当字符串再次 JSON.parse', '确认传入的是 JSON 字符串而不是对象'],
              ['Unexpected token <', '拿到的是 HTML 错误页', '检查接口地址、登录状态或服务端错误'],
              ['Unexpected token /', 'JSON 中包含注释', '移除 // 或 /* */ 注释'],
              ['Unexpected token n', 'Python 风格 None', '改成 JSON 的 null'],
            ],
          },
          { type: 'heading', level: 2, text: '排查顺序' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先确认内容是不是 JSON，而不是 HTML、日志或普通文本。',
              '检查是否存在注释、尾逗号、单引号、未加引号 key。',
              '检查 True、False、None 是否来自 Python 风格数据。',
              '如果来自接口，先看 HTTP 状态码和响应头。',
              '修复后再格式化一次，确认结构完整。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON 修复清洗',
            text: '粘贴报错 JSON 后，可以自动清理常见非标准语法，并输出标准格式化 JSON，适合快速处理配置和接口样本。',
            href: '/json-repair',
            linkLabel: '打开 JSON 修复清洗',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'Unexpected token 不是一个具体错误，而是一类语法错误的入口提示。先看 token 字符，再结合数据来源排查，通常很快就能定位问题。',
          },
        ],
      },
      en: {
        title: 'How to Fix JSON Unexpected token Errors',
        excerpt: 'Unexpected token usually means the JSON parser found a character that is not valid at that position, such as a trailing comma, comment, single quote, or HTML response.',
        metaTitle: 'How to Fix JSON Unexpected token Errors',
        metaDescription: 'Learn common causes of JSON Unexpected token errors, including trailing commas, comments, single quotes, unquoted keys, [object Object], and HTML responses.',
        readingTime: '7 min read',
        tags: ['JSON error', 'Unexpected token', 'JSON repair', 'JSON validation'],
        relatedTools: [
          {
            label: 'JSON Repair',
            href: '/json-repair',
            description: 'Clean comments, trailing commas, single quotes, unquoted keys, and other common JSON issues.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format and validate JSON to locate syntax problems quickly.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Unexpected token means the parser reached a character that should not appear at that point in valid JSON.',
          },
          {
            type: 'paragraph',
            text: 'You may see this in JSON.parse, API debugging, config imports, or validation tools. The character in the message matters: Unexpected token }, Unexpected token o, and Unexpected token < usually point to different root causes.',
          },
          { type: 'heading', level: 2, text: 'The Most Common Cause: A Trailing Comma' },
          { type: 'code', language: 'json', code: invalidUnexpectedTokenJson },
          {
            type: 'paragraph',
            text: 'Standard JSON does not allow a comma after the final object property or array item.',
          },
          { type: 'code', language: 'json', code: fixedUnexpectedTokenJson },
          { type: 'heading', level: 2, text: 'What Different Tokens Often Mean' },
          {
            type: 'table',
            headers: ['Error message', 'Common cause', 'How to fix it'],
            rows: [
              ['Unexpected token }', 'Trailing comma or missing value', 'Check object and array endings'],
              ['Unexpected token o', 'Parsing an object again as JSON text', 'Make sure JSON.parse receives a string'],
              ['Unexpected token <', 'The response is HTML', 'Check the API URL, auth state, or server error page'],
              ['Unexpected token /', 'The JSON contains comments', 'Remove line or block comments'],
              ['Unexpected token n', 'Python-style None', 'Use JSON null instead'],
            ],
          },
          { type: 'heading', level: 2, text: 'A Practical Debugging Order' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Confirm the content is JSON, not HTML, logs, or plain text.',
              'Check for comments, trailing commas, single quotes, and unquoted keys.',
              'Look for Python-style True, False, or None values.',
              'If it came from an API, inspect the HTTP status code and response headers.',
              'Format the fixed JSON to confirm the structure is complete.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON Repair',
            text: 'Paste broken JSON-like text, clean common non-standard syntax, and output formatted standard JSON.',
            href: '/json-repair',
            linkLabel: 'Open JSON Repair',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Unexpected token is not one single bug. It is a parser signal. Start with the reported character, then verify the source data and syntax rules.',
          },
        ],
      },
    },
  },
  {
    slug: 'what-is-json-schema-api-validation',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: 'JSON Schema 是什么？如何用它校验接口数据',
        excerpt: 'JSON Schema 是描述 JSON 数据结构的规则文档，可以规定字段类型、必填项、数组元素、字符串格式和对象结构。',
        metaTitle: 'JSON Schema 是什么？如何校验接口 JSON 数据',
        metaDescription: '介绍 JSON Schema 的用途、基本结构、required、properties、数组 items 和接口数据校验流程，并提供在线生成与校验建议。',
        readingTime: '约 7 分钟阅读',
        tags: ['JSON Schema', '接口校验', 'JSON 校验', 'API'],
        relatedTools: [
          {
            label: 'JSON Schema 生成',
            href: '/json-schema',
            description: '从 JSON 样本自动推断生成 JSON Schema。',
          },
          {
            label: 'JSON Schema 校验',
            href: '/json-schema-validate',
            description: '用 Schema 校验 JSON 数据，查看错误路径和原因。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSON Schema 可以理解为 JSON 数据的结构说明书：哪些字段必须存在、每个字段是什么类型、数组里应该放什么，都可以写成规则。',
          },
          {
            type: 'paragraph',
            text: '在接口联调、配置校验、低代码表单和数据导入场景中，JSON Schema 可以帮助你在数据进入业务逻辑前先发现结构错误。',
          },
          { type: 'heading', level: 2, text: '从一段 JSON 开始' },
          { type: 'code', language: 'json', code: jsonSchemaInput },
          {
            type: 'paragraph',
            text: '这段数据包含数字、字符串、数组和布尔值。对应的 Schema 可以描述每个字段的类型以及必填规则。',
          },
          { type: 'code', language: 'json', code: jsonSchemaExample },
          { type: 'heading', level: 2, text: '常用字段是什么意思？' },
          {
            type: 'table',
            headers: ['Schema 字段', '作用', '例子'],
            rows: [
              ['type', '限制值的基础类型', 'object、array、string、number'],
              ['properties', '描述对象里的字段', 'email、roles、active'],
              ['required', '规定必须出现的字段', 'id、email'],
              ['items', '描述数组元素类型', 'roles 里的每一项是 string'],
              ['format', '补充字符串格式语义', 'email、uri、date-time'],
            ],
          },
          { type: 'heading', level: 2, text: '接口校验怎么用？' },
          {
            type: 'list',
            ordered: true,
            items: [
              '用真实接口样本生成第一版 Schema。',
              '根据接口文档补充 required、format、enum、minLength 等规则。',
              '用 Schema 校验真实请求或响应数据。',
              '根据错误路径定位具体字段，再修正数据或调整规则。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON Schema 工具',
            text: '可以先从 JSON 样本生成 Schema，再用校验工具检查另一份 JSON 是否符合规则，适合接口联调和数据导入前检查。',
            href: '/json-schema',
            linkLabel: '打开 JSON Schema 生成',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'JSON Schema 的价值不只是说明数据长什么样，更重要的是把结构约束变成可执行校验，减少接口和数据流里的隐性错误。',
          },
        ],
      },
      en: {
        title: 'What Is JSON Schema and How Do You Validate API Data?',
        excerpt: 'JSON Schema is a rules document for JSON data. It can describe required fields, value types, arrays, string formats, and nested object structures.',
        metaTitle: 'What Is JSON Schema? API JSON Validation Guide',
        metaDescription: 'Learn what JSON Schema is, how required, properties, items, and format work, and how to validate API request or response JSON data.',
        readingTime: '7 min read',
        tags: ['JSON Schema', 'API validation', 'JSON validation', 'API'],
        relatedTools: [
          {
            label: 'JSON Schema Generator',
            href: '/json-schema',
            description: 'Generate JSON Schema from a JSON sample.',
          },
          {
            label: 'JSON Schema Validator',
            href: '/json-schema-validate',
            description: 'Validate JSON data against a Schema and inspect error paths.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSON Schema is a structural contract for JSON: it describes required fields, field types, arrays, nested objects, and optional format rules.',
          },
          {
            type: 'paragraph',
            text: 'It is useful for API debugging, config validation, low-code forms, and data imports because it catches shape problems before data reaches business logic.',
          },
          { type: 'heading', level: 2, text: 'Start With a JSON Sample' },
          { type: 'code', language: 'json', code: jsonSchemaInput },
          {
            type: 'paragraph',
            text: 'This object contains a number, a string, an array, and a boolean. A Schema can describe each field and decide which fields are required.',
          },
          { type: 'code', language: 'json', code: jsonSchemaExample },
          { type: 'heading', level: 2, text: 'Common JSON Schema Keywords' },
          {
            type: 'table',
            headers: ['Keyword', 'Purpose', 'Example'],
            rows: [
              ['type', 'Restricts the base value type', 'object, array, string, number'],
              ['properties', 'Describes fields in an object', 'email, roles, active'],
              ['required', 'Lists fields that must exist', 'id, email'],
              ['items', 'Describes array item types', 'each role is a string'],
              ['format', 'Adds semantic hints for strings', 'email, uri, date-time'],
            ],
          },
          { type: 'heading', level: 2, text: 'How to Use It for API Validation' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Generate a first Schema from a realistic API sample.',
              'Refine required, format, enum, minLength, and other constraints from the API contract.',
              'Validate real request or response JSON against the Schema.',
              'Use the error path to locate the exact field that needs attention.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON Schema Tools',
            text: 'Generate a Schema from one JSON sample, then validate another JSON document against it during API debugging or data import checks.',
            href: '/json-schema',
            linkLabel: 'Open JSON Schema Generator',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'JSON Schema turns a data shape into executable validation rules. That makes API and data pipeline errors easier to catch and explain.',
          },
        ],
      },
    },
  },
  {
    slug: 'what-is-jwt-header-payload',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: 'JWT 是什么？如何安全查看 Header 和 Payload',
        excerpt: 'JWT 是由 Header、Payload 和 Signature 组成的令牌。Header 和 Payload 只是 Base64URL 编码，不是加密，任何拿到 token 的人都能解码查看。',
        metaTitle: 'JWT 是什么？如何安全查看 Header 和 Payload',
        metaDescription: '解释 JWT 的三段结构、Header、Payload、Signature、Base64URL 编码和 HS256 签名验证，并给出安全查看 Token 的注意事项。',
        readingTime: '约 7 分钟阅读',
        tags: ['JWT', 'Token', 'Base64URL', '认证'],
        relatedTools: [
          {
            label: 'JWT 解析',
            href: '/jwt',
            description: '在浏览器本地解码 JWT Header / Payload，并支持 HS256 签名验证。',
          },
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '处理 Base64、URL、Unicode、哈希等常见编码和解码。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JWT 常用于登录态和接口鉴权，但它不是加密容器。Header 和 Payload 可以被直接解码查看。',
          },
          { type: 'code', language: 'text', code: jwtShape },
          {
            type: 'paragraph',
            text: 'JWT 通常由三段组成，中间用点号分隔：第一段是 Header，第二段是 Payload，第三段是 Signature。',
          },
          { type: 'heading', level: 2, text: '三段分别代表什么？' },
          {
            type: 'table',
            headers: ['部分', '内容', '是否加密'],
            rows: [
              ['Header', '算法和 token 类型，例如 alg、typ', '不是加密'],
              ['Payload', '业务声明，例如 sub、exp、role', '不是加密'],
              ['Signature', '用密钥或私钥计算出的签名', '用于验证完整性'],
            ],
          },
          { type: 'heading', level: 2, text: '安全查看 JWT 的注意事项' },
          {
            type: 'list',
            items: [
              '不要把真实生产 token 粘贴到不可信网站。',
              'Payload 里不要放密码、身份证号、银行卡号等敏感信息。',
              '看到 Payload 不代表 token 有效，还需要检查过期时间和签名。',
              'HS256 验签需要密钥；不要把生产密钥暴露给前端或第三方页面。',
              '本地浏览器解码比上传到服务器的在线工具更适合排查敏感 token。',
            ],
          },
          { type: 'heading', level: 2, text: '常见字段怎么看？' },
          {
            type: 'table',
            headers: ['字段', '含义', '排查重点'],
            rows: [
              ['sub', '主体或用户 ID', '确认是不是当前用户'],
              ['exp', '过期时间', '通常是 Unix 时间戳'],
              ['iat', '签发时间', '判断 token 是否过旧'],
              ['aud', '受众', '确认是否给当前服务使用'],
              ['iss', '签发方', '确认来源是否可信'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JWT 解析',
            text: 'JWT 解析在浏览器本地完成，可以查看 Header 和 Payload，并在你提供 HS256 secret 时验证签名。',
            href: '/jwt',
            linkLabel: '打开 JWT 解析',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'JWT 的 Header 和 Payload 便于调试，但不应被当作保密空间。安全使用 JWT 的关键是控制签名密钥、过期时间和敏感字段。',
          },
        ],
      },
      en: {
        title: 'What Is a JWT and How Do You Safely Inspect Header and Payload?',
        excerpt: 'A JWT has three parts: Header, Payload, and Signature. Header and Payload are Base64URL encoded, not encrypted, so anyone with the token can decode them.',
        metaTitle: 'What Is a JWT? Safely Inspect Header and Payload',
        metaDescription: 'Understand JWT Header, Payload, Signature, Base64URL encoding, HS256 verification, and the safety rules for inspecting tokens.',
        readingTime: '7 min read',
        tags: ['JWT', 'Token', 'Base64URL', 'Authentication'],
        relatedTools: [
          {
            label: 'JWT Parser',
            href: '/jwt',
            description: 'Decode JWT Header and Payload locally in the browser and verify HS256 signatures.',
          },
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Work with Base64, URL encoding, Unicode, hashes, and other text encodings.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JWTs are often used for authentication and API authorization, but they are not encrypted containers. Header and Payload can be decoded directly.',
          },
          { type: 'code', language: 'text', code: jwtShape },
          {
            type: 'paragraph',
            text: 'A JWT usually has three dot-separated parts: Header, Payload, and Signature.',
          },
          { type: 'heading', level: 2, text: 'What Do the Three Parts Mean?' },
          {
            type: 'table',
            headers: ['Part', 'Contains', 'Encrypted?'],
            rows: [
              ['Header segment', 'Algorithm and token type, such as alg and typ', 'No'],
              ['Payload segment', 'Claims such as sub, exp, and role', 'No'],
              ['Signature segment', 'A signature calculated with a secret or private key', 'Used for integrity'],
            ],
          },
          { type: 'heading', level: 2, text: 'Safety Rules for Inspecting JWTs' },
          {
            type: 'list',
            items: [
              'Do not paste real production tokens into untrusted websites.',
              'Do not store passwords, identity numbers, payment data, or other sensitive values in Payload.',
              'Being able to read Payload does not mean the token is valid; expiration and signature still matter.',
              'HS256 verification requires a secret; never expose a production secret to frontend code or third-party pages.',
              'Browser-local decoding is better than uploading sensitive tokens to a server-based tool.',
            ],
          },
          { type: 'heading', level: 2, text: 'Common Claims' },
          {
            type: 'table',
            headers: ['Claim', 'Meaning', 'What to check'],
            rows: [
              ['sub', 'Subject or user ID', 'Is it the expected user?'],
              ['exp', 'Expiration time', 'Usually a Unix timestamp'],
              ['iat', 'Issued-at time', 'Is the token too old?'],
              ['aud', 'Audience', 'Is it meant for this service?'],
              ['iss', 'Issuer', 'Does it come from the expected authority?'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JWT Parser',
            text: 'Decode Header and Payload locally in the browser, and verify HS256 signatures when you provide the secret.',
            href: '/jwt',
            linkLabel: 'Open JWT Parser',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'JWT Header and Payload are convenient for debugging, but they are not private. Safe JWT usage depends on signature keys, expiration, and careful claim design.',
          },
        ],
      },
    },
  },
  {
    slug: 'how-to-generate-qr-code-url-wifi-contact',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何生成二维码？网址、Wi-Fi、联系方式二维码格式怎么写',
        excerpt: '二维码可以保存网址、普通文本、Wi-Fi 配置和联系方式。不同内容只要按约定格式写成文本，就可以生成可扫描的二维码。',
        metaTitle: '如何生成二维码？网址、Wi-Fi、联系方式二维码格式教程',
        metaDescription: '介绍网址二维码、Wi-Fi 二维码、vCard 联系方式二维码的写法，以及生成二维码时的尺寸、边距、纠错等级和可识别性建议。',
        readingTime: '约 6 分钟阅读',
        tags: ['二维码生成', 'Wi-Fi 二维码', 'vCard', 'QR Code'],
        relatedTools: [
          {
            label: '二维码生成',
            href: '/qr-code/generate',
            description: '将网址、文本、联系信息或 Wi-Fi 配置文本生成二维码 PNG。',
          },
          {
            label: '二维码解码',
            href: '/qr-code/decode',
            description: '上传二维码图片，在浏览器本地识别二维码内容。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '生成二维码的核心不是图片本身，而是先准备一段能被扫码软件理解的文本。',
          },
          { type: 'heading', level: 2, text: '网址二维码' },
          {
            type: 'paragraph',
            text: '网址二维码最简单，直接把完整 URL 写进去即可。建议包含 https://，不要只写域名，减少扫码软件误判。',
          },
          { type: 'code', language: 'text', code: 'https://toolgarden.xyz/en' },
          { type: 'heading', level: 2, text: 'Wi-Fi 二维码' },
          {
            type: 'paragraph',
            text: 'Wi-Fi 二维码通常使用 WIFI 格式，包含加密类型、网络名称和密码。扫码后，手机可以直接提示连接网络。',
          },
          { type: 'code', language: 'text', code: qrWifiText },
          { type: 'heading', level: 2, text: '联系方式二维码' },
          {
            type: 'paragraph',
            text: '联系方式可以使用 vCard 文本。不同手机对字段支持略有差异，姓名、电话、邮箱、网址这类基础字段兼容性最好。',
          },
          { type: 'code', language: 'text', code: qrVCardText },
          { type: 'heading', level: 2, text: '生成时注意什么？' },
          {
            type: 'list',
            items: [
              '内容越长，二维码越密，越需要更大的尺寸。',
              '保留足够白边，不要把二维码贴到图片边缘。',
              '前景和背景要有明显对比，黑白最稳。',
              '用于打印时，先用手机测试真实扫描距离。',
              '如果要放 logo，不要遮住太大区域，并提高纠错等级。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 二维码生成',
            text: '输入网址、文本、Wi-Fi 配置或联系方式内容后，可以在浏览器本地生成二维码 PNG，并下载用于网页、海报或文档。',
            href: '/qr-code/generate',
            linkLabel: '打开二维码生成',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '二维码只是把文本编码成图形。只要内容格式正确、尺寸足够、对比清晰，大多数手机都可以稳定识别。',
          },
        ],
      },
      en: {
        title: 'How to Generate QR Codes for URLs, Wi-Fi, and Contact Cards',
        excerpt: 'A QR code can store URLs, plain text, Wi-Fi credentials, and contact cards. The key is writing the content in a format scanners understand.',
        metaTitle: 'How to Generate QR Codes for URLs, Wi-Fi, and Contact Cards',
        metaDescription: 'Learn URL QR codes, Wi-Fi QR format, vCard contact QR codes, and practical tips for QR size, margin, contrast, and scan reliability.',
        readingTime: '6 min read',
        tags: ['QR code generator', 'Wi-Fi QR code', 'vCard', 'QR Code'],
        relatedTools: [
          {
            label: 'QR Code Generator',
            href: '/qr-code/generate',
            description: 'Generate QR code PNGs from URLs, text, contact data, or Wi-Fi configuration text.',
          },
          {
            label: 'QR Code Decoder',
            href: '/qr-code/decode',
            description: 'Upload a QR image and decode its content locally in the browser.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The core of QR generation is not the image. It is the text payload that scanning apps can understand.',
          },
          { type: 'heading', level: 2, text: 'URL QR Codes' },
          {
            type: 'paragraph',
            text: 'A URL QR code is the simplest case. Use the full URL and include https:// to reduce ambiguity.',
          },
          { type: 'code', language: 'text', code: 'https://toolgarden.xyz/en' },
          { type: 'heading', level: 2, text: 'Wi-Fi QR Codes' },
          {
            type: 'paragraph',
            text: 'Wi-Fi QR codes usually use the WIFI text format with the security type, network name, and password.',
          },
          { type: 'code', language: 'text', code: qrWifiText },
          { type: 'heading', level: 2, text: 'Contact Card QR Codes' },
          {
            type: 'paragraph',
            text: 'Contact cards can use vCard text. Phones vary in what they import, but name, phone, email, and URL fields are broadly compatible.',
          },
          { type: 'code', language: 'text', code: qrVCardText },
          { type: 'heading', level: 2, text: 'Generation Tips' },
          {
            type: 'list',
            items: [
              'Longer content creates denser QR codes, so use a larger output size.',
              'Keep a quiet zone around the code and avoid cropping the edges.',
              'Use strong foreground and background contrast; black on white is safest.',
              'For print, test scanning from the real viewing distance.',
              'If you add a logo, keep it small and use a higher error correction level.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden QR Code Generator',
            text: 'Enter a URL, text, Wi-Fi configuration, or contact payload and generate a downloadable QR PNG locally in the browser.',
            href: '/qr-code/generate',
            linkLabel: 'Open QR Code Generator',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'A QR code is text encoded as an image. Correct payload format, enough size, clear contrast, and a quiet zone make scanning reliable.',
          },
        ],
      },
    },
  },
  {
    slug: 'why-qr-code-cannot-be-decoded',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '二维码识别不出来是什么原因？如何提高识别率',
        excerpt: '二维码扫不出来，常见原因包括图片模糊、分辨率太低、白边被裁掉、对比度不足、压缩过度、内容太密或二维码损坏。',
        metaTitle: '二维码识别不出来是什么原因？提高二维码识别率的方法',
        metaDescription: '分析二维码无法识别的常见原因，包括模糊、低分辨率、白边缺失、低对比、压缩、反色和内容过密，并给出修复建议。',
        readingTime: '约 6 分钟阅读',
        tags: ['二维码识别', '二维码解码', 'QR Code', '图片清晰度'],
        relatedTools: [
          {
            label: '二维码解码',
            href: '/qr-code/decode',
            description: '上传二维码图片，在浏览器本地识别并复制二维码内容。',
          },
          {
            label: '图片无损放大',
            href: '/image/upscale',
            description: '把低分辨率二维码按整数倍放大，尽量保留硬边。',
          },
          {
            label: '图片裁剪',
            href: '/image/crop',
            description: '裁掉无关区域，保留完整二维码和白边。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '二维码识别失败，通常不是扫码工具单方面的问题，而是二维码图像里的定位点、模块边界或白边已经不够清楚。',
          },
          { type: 'heading', level: 2, text: '常见原因' },
          {
            type: 'table',
            headers: ['问题', '表现', '处理建议'],
            rows: [
              ['图片模糊', '黑白格边缘发灰', '使用更清晰原图或像素无损放大'],
              ['分辨率太低', '二维码很小', '按整数倍放大，不要非等比例拉伸'],
              ['白边缺失', '贴着图片边缘', '重新导出或裁剪时保留 quiet zone'],
              ['对比度不足', '前景和背景太接近', '换成深色前景和浅色背景'],
              ['压缩过度', '出现色块和噪点', '使用 PNG 或更高质量导出'],
              ['内容太长', '二维码非常密', '缩短内容或使用短链接'],
            ],
          },
          { type: 'heading', level: 2, text: '先确认图片本身是否可解码' },
          {
            type: 'paragraph',
            text: '如果你不确定问题出在二维码还是扫码 App，可以先用二维码解码工具上传原图，看能否解析出文本。能解析说明二维码内容本身还在，不能解析再考虑修复图片质量。',
          },
          { type: 'heading', level: 2, text: '提高识别率的实用方法' },
          {
            type: 'list',
            ordered: true,
            items: [
              '尽量使用原始 PNG 或高清截图，不要用被社交软件多次压缩的图片。',
              '放大时选择像素无损模式，二维码更适合硬边放大。',
              '不要裁掉二维码四周白边，白边是识别定位的一部分。',
              '打印前做真实距离测试，避免尺寸太小。',
              '如果二维码内容很长，优先改成短链接再生成。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 二维码解码',
            text: '上传二维码图片后，工具会在浏览器本地尝试识别二维码内容，不需要把图片上传到服务器。',
            href: '/qr-code/decode',
            linkLabel: '打开二维码解码',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '二维码要能识别，关键是清晰边界、足够尺寸、完整白边和高对比度。修复时先保留结构，再考虑美化。',
          },
        ],
      },
      en: {
        title: 'Why Can a QR Code Fail to Decode and How Can You Improve Scan Rate?',
        excerpt: 'QR codes fail to scan when the image is blurry, too small, cropped, low contrast, heavily compressed, too dense, or physically damaged.',
        metaTitle: 'Why QR Codes Fail to Decode and How to Improve Scan Rate',
        metaDescription: 'Learn common reasons QR codes cannot be decoded, including blur, low resolution, missing quiet zone, low contrast, compression, inversion, and dense content.',
        readingTime: '6 min read',
        tags: ['QR code decode', 'QR scan', 'QR Code', 'image clarity'],
        relatedTools: [
          {
            label: 'QR Code Decoder',
            href: '/qr-code/decode',
            description: 'Upload a QR image and decode its content locally in the browser.',
          },
          {
            label: 'Image Upscale',
            href: '/image/upscale',
            description: 'Upscale low-resolution QR codes with pixel-perfect hard edges.',
          },
          {
            label: 'Image Crop',
            href: '/image/crop',
            description: 'Crop irrelevant areas while preserving the full QR code and quiet zone.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'When a QR code fails to scan, the problem is often that the image no longer has clean finder patterns, clear module edges, or enough quiet zone.',
          },
          { type: 'heading', level: 2, text: 'Common Causes' },
          {
            type: 'table',
            headers: ['Problem', 'What it looks like', 'What to try'],
            rows: [
              ['Blurred image', 'Gray or soft grid edges', 'Use a sharper source or pixel-perfect upscaling'],
              ['Low resolution', 'The QR code is tiny', 'Upscale by an integer factor and keep aspect ratio'],
              ['Missing quiet zone', 'Code touches image edges', 'Export again or crop with the margin preserved'],
              ['Low contrast', 'Foreground and background are too close', 'Use a dark foreground and light background'],
              ['Over-compression', 'Artifacts or noisy blocks appear', 'Use PNG or higher-quality export'],
              ['Too much content', 'The QR code is very dense', 'Shorten the payload or use a short URL'],
            ],
          },
          { type: 'heading', level: 2, text: 'First Check Whether the Image Decodes' },
          {
            type: 'paragraph',
            text: 'If you are not sure whether the issue is the QR code or the scanner app, upload the original image to a decoder first. If it decodes, the payload is still present. If it does not, improve the image quality.',
          },
          { type: 'heading', level: 2, text: 'Practical Ways to Improve Scan Rate' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Use the original PNG or a high-quality screenshot instead of an image repeatedly compressed by messaging apps.',
              'Use pixel-perfect upscaling for QR codes because hard edges matter.',
              'Do not crop away the quiet zone around the code.',
              'Test printed QR codes from the actual viewing distance.',
              'If the payload is long, use a short URL before generating the QR code.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden QR Code Decoder',
            text: 'Upload a QR image and decode the content locally in the browser without sending the image to a server.',
            href: '/qr-code/decode',
            linkLabel: 'Open QR Code Decoder',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Reliable QR scanning depends on sharp edges, enough size, a complete quiet zone, and strong contrast. Preserve structure first; style second.',
          },
        ],
      },
    },
  },
  {
    slug: 'how-to-use-text-diff-tool',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '文本对比工具怎么用？如何快速找出两段内容差异',
        excerpt: '文本对比可以把两段内容按行和词拆开，高亮新增、删除和修改，适合检查配置、文案、合同片段、日志和代码输出差异。',
        metaTitle: '文本对比工具怎么用？快速找出两段内容差异',
        metaDescription: '介绍文本对比工具的使用场景、行级和词级差异、复制粘贴对比流程，以及配置、文案、日志和 JSON 差异排查建议。',
        readingTime: '约 6 分钟阅读',
        tags: ['文本对比', 'Diff', '内容差异', '文本工具'],
        relatedTools: [
          {
            label: '文本对比',
            href: '/text/diff',
            description: '对比两段文本差异，按行和词高亮增删改。',
          },
          {
            label: 'JSON 对比',
            href: '/json-diff',
            description: '如果内容是 JSON，可以按路径更精确地比较结构差异。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '文本对比工具的目标很直接：把两段看起来相似的内容拆开，告诉你哪里新增、哪里删除、哪里被修改。',
          },
          { type: 'heading', level: 2, text: '一个简单例子' },
          { type: 'code', language: 'text', code: textDiffBefore },
          { type: 'code', language: 'text', code: textDiffAfter },
          {
            type: 'paragraph',
            text: '如果只靠肉眼看，很容易漏掉 Payment pending 变成 Payment completed。Diff 工具会把这类变化直接高亮出来。',
          },
          { type: 'heading', level: 2, text: '适合哪些场景？' },
          {
            type: 'list',
            items: [
              '对比两版产品文案，确认改动是否符合预期。',
              '对比配置文件，找出某个环境多了或少了什么。',
              '对比日志片段，定位一次失败请求和成功请求的差别。',
              '对比翻译文本，检查是否漏译或误删。',
              '对比代码生成结果，确认自动化输出是否稳定。',
            ],
          },
          { type: 'heading', level: 2, text: '行级差异和词级差异有什么区别？' },
          {
            type: 'table',
            headers: ['方式', '适合内容', '优点'],
            rows: [
              ['行级对比', '日志、配置、列表、段落', '快速看到哪几行发生变化'],
              ['词级对比', '句子、文案、说明文字', '更容易看到一句话内部改了哪个词'],
              ['结构化对比', 'JSON 数据', '按字段路径比较，比纯文本更准确'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 文本对比',
            text: '分别粘贴旧文本和新文本，即可按行和词查看新增、删除、修改内容。JSON 数据建议配合 JSON 对比工具使用。',
            href: '/text/diff',
            linkLabel: '打开文本对比',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '文本越长，肉眼越不可靠。把对比交给 Diff 工具，可以减少漏看、误判和重复检查。',
          },
        ],
      },
      en: {
        title: 'How to Use a Text Diff Tool to Find Differences Quickly',
        excerpt: 'A text diff tool compares two blocks of text and highlights additions, removals, and edits. It is useful for configs, copy, logs, generated output, and more.',
        metaTitle: 'How to Use a Text Diff Tool to Find Differences Quickly',
        metaDescription: 'Learn when to use text diff, how line-level and word-level differences work, and when JSON diff is better for structured data.',
        readingTime: '6 min read',
        tags: ['text diff', 'Diff', 'content comparison', 'text tools'],
        relatedTools: [
          {
            label: 'Text Diff',
            href: '/text/diff',
            description: 'Compare two blocks of text and highlight line and word changes.',
          },
          {
            label: 'JSON Diff',
            href: '/json-diff',
            description: 'Compare JSON documents by path when the content is structured data.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'A text diff tool has one job: compare two similar-looking texts and show what was added, removed, or changed.',
          },
          { type: 'heading', level: 2, text: 'A Simple Example' },
          { type: 'code', language: 'text', code: textDiffBefore },
          { type: 'code', language: 'text', code: textDiffAfter },
          {
            type: 'paragraph',
            text: 'By eye, it is easy to miss that Payment pending changed to Payment completed. A diff view makes that change explicit.',
          },
          { type: 'heading', level: 2, text: 'When Is Text Diff Useful?' },
          {
            type: 'list',
            items: [
              'Compare two versions of product copy before publishing.',
              'Compare configuration files across environments.',
              'Compare failure and success logs to find the meaningful difference.',
              'Compare translations to catch missing or accidentally removed lines.',
              'Compare generated output to confirm an automation is stable.',
            ],
          },
          { type: 'heading', level: 2, text: 'Line Diff vs Word Diff' },
          {
            type: 'table',
            headers: ['Mode', 'Best for', 'Benefit'],
            rows: [
              ['Line-level diff', 'Logs, configs, lists, paragraphs', 'Shows which lines changed'],
              ['Word-level diff', 'Sentences, copy, prose', 'Shows the exact words changed inside a line'],
              ['Structured diff', 'JSON data', 'Compares by field path instead of raw text position'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Text Diff',
            text: 'Paste old text and new text to highlight additions, removals, and edits. For JSON data, use JSON Diff for path-aware comparison.',
            href: '/text/diff',
            linkLabel: 'Open Text Diff',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'The longer the text, the less reliable manual checking becomes. Diff tools reduce missed changes and repeated review work.',
          },
        ],
      },
    },
  },
  {
    slug: 'word-count-character-byte-difference',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '字数、词数、字符数、字节数有什么区别？',
        excerpt: '字数、词数、字符数和字节数看起来相近，但统计规则不同。中文、英文、Emoji、换行和 UTF-8 编码都会影响最终结果。',
        metaTitle: '字数、词数、字符数、字节数有什么区别？文本统计说明',
        metaDescription: '解释字数、词数、字符数、行数、段落数和 UTF-8 字节数的区别，帮助理解中文、英文、Emoji 和接口长度限制的统计方式。',
        readingTime: '约 6 分钟阅读',
        tags: ['字数统计', '词数统计', '字符数', '字节数'],
        relatedTools: [
          {
            label: '字数统计',
            href: '/text/word-count',
            description: '统计文本字数、词数、字符数、行数、段落、句子和字节大小。',
          },
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '查看编码、Base64、URL、Unicode 和字节相关转换。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '文本统计没有一个放之四海皆准的数字。你要先弄清楚限制的是字数、词数、字符数，还是字节数。',
          },
          { type: 'heading', level: 2, text: '这些指标分别是什么？' },
          {
            type: 'table',
            headers: ['指标', '关注点', '常见用途'],
            rows: [
              ['字数', '中文语境下的文字数量', '作文、标题、简介限制'],
              ['词数', '英文等以空格分词的单词数量', '英文文章、摘要、SEO 内容'],
              ['字符数', '包含字母、数字、标点、空格等字符', '输入框长度限制'],
              ['字节数', '文本编码后占用的存储大小', '数据库、接口、短信或文件限制'],
              ['行数', '换行分隔后的行数量', '日志、歌词、字幕和配置检查'],
            ],
          },
          { type: 'heading', level: 2, text: '为什么中文和英文统计不一样？' },
          {
            type: 'paragraph',
            text: '英文通常用空格分词，所以词数比较直观。中文没有天然空格分隔，很多场景会更关注字数或字符数，而不是英文意义上的 word count。',
          },
          { type: 'heading', level: 2, text: '字节数为什么会更大？' },
          {
            type: 'paragraph',
            text: '在 UTF-8 编码里，英文字母通常占 1 个字节，常见中文字符通常占 3 个字节，Emoji 可能占 4 个或更多字节。接口限制如果写的是 bytes，就不能只看字符数。',
          },
          { type: 'heading', level: 2, text: '什么时候看哪个数字？' },
          {
            type: 'list',
            items: [
              '公众号标题、简介、表单提示：优先看字数或字符数。',
              '英文文章、SEO 摘要：优先看词数和字符数。',
              '接口字段、数据库字段、文件大小：一定要看字节数。',
              '字幕、歌词、日志：同时看行数和每行长度。',
              '包含 Emoji 的文本：不要只按肉眼看到的符号数量估算。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 字数统计',
            text: '粘贴文本后，可以同时查看字数、词数、字符数、行数、段落、句子和字节大小，适合写作、SEO、表单和接口限制检查。',
            href: '/text/word-count',
            linkLabel: '打开字数统计',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '写作场景多看字数和词数，产品输入限制多看字符数，技术接口和存储限制一定要看字节数。',
          },
        ],
      },
      en: {
        title: 'Word Count, Character Count, and Byte Count: What Is the Difference?',
        excerpt: 'Word count, character count, and byte count measure different things. Language, spaces, emoji, line breaks, and UTF-8 encoding all affect the result.',
        metaTitle: 'Word Count vs Character Count vs Byte Count',
        metaDescription: 'Understand word count, character count, line count, paragraph count, and UTF-8 byte size for writing, forms, APIs, and storage limits.',
        readingTime: '6 min read',
        tags: ['word count', 'character count', 'byte count', 'text statistics'],
        relatedTools: [
          {
            label: 'Word Count',
            href: '/text/word-count',
            description: 'Count words, characters, lines, paragraphs, sentences, and byte size.',
          },
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Work with encodings, Base64, URL encoding, Unicode, and byte-related conversions.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'There is no single universal text length number. You need to know whether a limit means words, characters, lines, or bytes.',
          },
          { type: 'heading', level: 2, text: 'What Do These Metrics Mean?' },
          {
            type: 'table',
            headers: ['Metric', 'What it measures', 'Common use'],
            rows: [
              ['Word count', 'Words separated by spaces or language rules', 'Articles, abstracts, SEO copy'],
              ['Character count', 'Letters, numbers, punctuation, spaces, and symbols', 'Form and title limits'],
              ['Byte count', 'Encoded storage size', 'APIs, databases, SMS, and file limits'],
              ['Line count', 'Text split by line breaks', 'Logs, subtitles, lyrics, configs'],
              ['Paragraph count', 'Blocks of text separated by blank lines', 'Writing and editing checks'],
            ],
          },
          { type: 'heading', level: 2, text: 'Why Languages Behave Differently' },
          {
            type: 'paragraph',
            text: 'English is often counted by space-separated words. Chinese and other languages without spaces often care more about characters than English-style word count.',
          },
          { type: 'heading', level: 2, text: 'Why Byte Count Can Be Larger' },
          {
            type: 'paragraph',
            text: 'In UTF-8, an English letter usually uses 1 byte, many Chinese characters use 3 bytes, and emoji may use 4 or more bytes. If an API limit says bytes, character count is not enough.',
          },
          { type: 'heading', level: 2, text: 'Which Number Should You Use?' },
          {
            type: 'list',
            items: [
              'For titles, descriptions, and form hints, check character count.',
              'For English articles and SEO summaries, check word count and character count.',
              'For API fields, database columns, and storage limits, check byte count.',
              'For subtitles, lyrics, and logs, check line count and line length.',
              'For emoji-heavy text, do not estimate length only by visible symbols.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Word Count',
            text: 'Paste text to see words, characters, lines, paragraphs, sentences, and byte size for writing, SEO, forms, and technical limits.',
            href: '/text/word-count',
            linkLabel: 'Open Word Count',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Writing usually cares about words and characters. Product input limits care about characters. APIs and storage limits often care about bytes.',
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
