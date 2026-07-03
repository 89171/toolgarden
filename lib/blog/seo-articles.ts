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
    updatedAt: '2026-07-03',
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
          {
            label: "正则表达式测试",
            href: "/regex",
            description: "生成 interface 时用正则批量整理字段名（驼峰化、去前缀）。",
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
        faq: [
          {
            question: "JSON 转 TypeScript 时，遇到数组里对象结构不一致怎么办？",
            answer: "很多接口返回的数组元素并不完全相同，比如 items 里既有普通商品也有促销商品。工具默认会取第一个元素作为样本，因此建议先在真实数据中筛出一个覆盖所有字段的对象再粘贴，或者手工把生成的 interface 拆成联合类型（例如 Product | Promotion）。也可以把可选字段标记为可选属性（field?），再在业务代码里根据 type 字段进行 narrowing。这样既避免了 any，也不至于漏掉某些运行时才出现的字段。",
          },
          {
            question: "为什么生成的 interface 里出现了 null 类型，应该保留还是改成可选？",
            answer: "工具从样本推断类型，如果字段值是 null，就只能给出 null 类型。真实业务里通常有两种情况：一是字段一定存在但值可能为 null，此时应改为 string | null 之类的联合类型；二是字段可能整个缺失，此时应加上问号，写成 city?: string | null。建议在粘贴前先跑几个真实样本，把偶发的 null 归纳成 nullable，把偶发的缺字段归纳成可选，两者含义不同不能互相替代。",
          },
          {
            question: "JSON 转 TS 和 quicktype 这类命令行工具相比有什么区别？",
            answer: "命令行工具功能强，能合并多个样本、生成 class、支持多语言输出，但需要安装依赖并写脚本，适合大型项目的构建流程。在线工具的优势是零安装、粘贴即出结果，适合排查 bug、快速对接后端、写文档时抄一份类型。日常前端开发中，先用在线工具生成基础 interface，再用手工调整可选字段、联合类型和命名，是一种性价比很高的组合。真正需要自动化时再引入 quicktype 或 openapi-typescript。",
          },
          {
            question: "生成的 interface 命名一直是 Root，怎么改成有业务含义的名字？",
            answer: "工具默认使用 Root 作为顶层接口名，是为了保证在没有上下文时不会误导阅读。落库前请统一改成资源名，比如 User、Order、PaymentIntent。二级 interface 也建议按业务命名，比如 profile 对应 UserProfile 而不是 Profile1。命名一致后配合 IDE 的重命名功能，可以让整个前端项目的类型体系更容易维护。另外建议把生成的 interface 集中放在 types 目录，避免每个页面自己复制一份，出现同名但字段不同的类型。",
          },
          {
            question: "接口偶尔返回数字字符串（如 \"123\"），推断为 string 还是 number？",
            answer: "JSON 类型系统里 \"123\" 是字符串，工具只能推断为 string，不能自动帮你转成 number。这类问题应该在业务层显式转换，比如使用 Number(id) 或 parseInt。更好的做法是和后端约定字段类型：金额、超长 ID、精度敏感的场景保留字符串；普通计数、状态码可以用数字。生成 interface 后可以再写一个 Dto 到 Model 的映射函数，在这一层完成转换和校验，避免在页面里到处出现类型断言。",
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
          {
            label: "Regex Tester",
            href: "/regex",
            description: "Use a regex to normalize field names (camelCase, prefix removal) before generating interfaces.",
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
        faq: [
          {
            question: "What if the JSON array contains objects with different shapes?",
            answer: "The tool samples the first element of an array, so mixed shapes get flattened into one interface and later break at runtime. The safest workflow is to inspect the real data first, identify each variant (for example Product vs Promotion), then paste one representative sample per variant. Merge them into a union type such as Item = Product | Promotion and use a discriminator field like type for narrowing. If a field only appears sometimes, mark it as optional with a question mark rather than pretending it is always present.",
          },
          {
            question: "The generated interface has a null type. Should I keep it or make the field optional?",
            answer: "A null type means the sample explicitly had null, not that the key was missing. Two cases you should separate: fields that always exist but can be null should become a union like string | null, while fields that can be absent should become optional with a question mark, for example city?: string | null. Feed the generator two or three real samples to catch both patterns, and never treat optional and nullable as interchangeable, because consumers handle them very differently.",
          },
          {
            question: "How does an online JSON to TypeScript tool compare to quicktype?",
            answer: "quicktype is powerful for build pipelines: it merges multiple samples, generates classes, supports many target languages, and can be scripted. An online tool has zero setup, is faster for one-off debugging, and pairs well with reading API docs. For everyday frontend work, paste a sample online, hand-tune optional and nullable fields, then commit. When your team needs guarantees across dozens of endpoints, wire quicktype or openapi-typescript into CI so types are regenerated from the source of truth automatically.",
          },
          {
            question: "How do I rename the generated Root interface to something meaningful?",
            answer: "Root is a safe default that avoids misleading names, but you should rename it before committing. Use the resource name your backend uses, such as User, Order, or PaymentIntent, and keep nested interfaces aligned, so profile becomes UserProfile rather than Profile1. Place the generated types in a shared types directory instead of copying them into each page. That way when the API evolves you rename in one place, and IDE refactors propagate everywhere. Consistent naming also makes code reviews and search across the frontend much easier.",
          },
          {
            question: "The API sometimes returns numeric strings like \"123\". Should the field be string or number?",
            answer: "In JSON, \"123\" is a string, so the generator can only produce string. It cannot know your intent. Fix this at the boundary rather than by editing the interface: agree with backend engineers that money, precision-sensitive amounts and very large IDs stay as strings, while counters and status codes stay as numbers. Then write a small mapper that turns the raw DTO into a domain Model, converting fields with Number() or parseInt where needed. Your UI code stays free of ad hoc type assertions.",
          },
        ],
      },
    },
  },
  {
    slug: 'fix-json-unexpected-token-error',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
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
          {
            label: "正则表达式测试",
            href: "/regex",
            description: "手动排查坏字符时，用正则快速定位控制字符、BOM、全角标点等。",
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
        faq: [
          {
            question: "为什么本地跑 JSON.parse 没问题，部署到线上就报 Unexpected token？",
            answer: "线上和本地拿到的字符串往往不一样。常见原因有：CDN 或反向代理在响应里插入了 HTML 错误页，导致解析器看到 < 就报错；接口返回带 BOM 的 UTF-8，本地编辑器隐藏了 BOM 而运行时没有；或者服务端拼接 JSON 时把 undefined 写了进去。定位方法是先打印 typeof 和 length，再用 charCodeAt(0) 查是否为 0xFEFF，最后确认返回状态码是 200 且 Content-Type 是 application/json，不要盲目改代码。",
          },
          {
            question: "JSON 里能用单引号吗？为什么复制到工具里就报错？",
            answer: "标准 JSON 只允许双引号，单引号会立即触发 Unexpected token。它常出现在从 Python dict、JavaScript 对象字面量、日志、YAML 里直接复制过来的场景。修复方式有两种：如果只是零星几处，手工把 ' 替换为 \"；如果是大段代码，可以用 JSON5 或宽松解析器先解析再输出为严格 JSON。长期来说建议在源头约定统一格式：接口和配置文件必须是严格 JSON，示例代码里再用编程语言原生语法，避免混用。",
          },
          {
            question: "报错说位置是 position 42，怎么快速定位到具体哪一行？",
            answer: "position 指的是从字符串开头算起的第 42 个字符，不是行号。可以把 JSON 字符串放进能显示光标位置的编辑器（VS Code 状态栏、在线工具都可），跳到该偏移量即可。如果 JSON 已经压缩成一行，先用格式化工具展开再定位。经验上，报错位置往往指向的是错误的下一位，比如提示 position 42 报 Unexpected token }，真正问题通常是 41 位的多余逗号或缺失引号，务必往前看一两个字符。",
          },
          {
            question: "把 JSON 修好后能自动帮我修复所有错误吗？",
            answer: "自动修复工具擅长处理常见小错：尾随逗号、注释、单引号、未加引号的 key。但遇到语义型错误时，比如字符串中间缺了一个结束引号导致后面的字段都被当成同一个字符串，或者数组和对象嵌套错位，机器就无法猜测原始意图，可能修出来的仍然不是你要的结构。建议先跑一次自动修复解决语法层面的问题，再用格式化工具展开，肉眼扫一遍关键字段，最后配合 JSON Schema 校验业务字段是否齐全。",
          },
          {
            question: "报 Unexpected end of JSON input 和 Unexpected token 有什么区别？",
            answer: "Unexpected token 表示解析器看到了一个不该出现的字符，比如多余的逗号、丢引号；Unexpected end of JSON input 则表示解析器还没读到期望的结束符就走到了字符串末尾，通常意味着 JSON 被截断了。前者多因手写错误或拼接问题；后者常见于网络请求被中断、后端流式输出没结束、大文件读取只读了一半。排查时前者关注错误位置附近的字符，后者关注整体长度和最后一个字符是否为 } 或 ]。",
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
          {
            label: "Regex Tester",
            href: "/regex",
            description: "When hand-fixing broken JSON, use a regex to locate control characters, BOMs, or fullwidth punctuation.",
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
        faq: [
          {
            question: "Why does JSON.parse work locally but throw Unexpected token in production?",
            answer: "The string you receive in production is often not the string you tested. A CDN or reverse proxy may inject an HTML error page, so the parser hits < and fails. UTF-8 with a BOM is another classic: your editor hides the invisible 0xFEFF while the runtime does not. Server code may also stringify undefined into the output. Before changing parser logic, log typeof and length, check charCodeAt(0), and confirm the response is really 200 with Content-Type application/json. Fix the pipeline, not the parser.",
          },
          {
            question: "Can JSON use single quotes? Why does pasting fail immediately?",
            answer: "Strict JSON only allows double quotes, so single quotes trigger Unexpected token right away. This usually happens when you copy from a Python dict, a JavaScript object literal, a log line, or a YAML snippet. For small fixes replace ' with \" manually. For larger blobs, parse with a lenient library such as JSON5 and re-serialize as strict JSON. Long term, agree on one contract: APIs and config files stay strict JSON, while examples use each language's native syntax. Mixing the two is what causes recurring incidents.",
          },
          {
            question: "The error says position 42. How do I map that to a line and column?",
            answer: "Position 42 is the 42nd character from the start of the string, not the 42nd line. Paste the JSON into an editor that shows the caret offset, such as VS Code, then jump to that offset. If the JSON is minified into a single line, format it first. Also remember that the error location usually points to the character just after the real mistake, so when position 42 says Unexpected token }, the real culprit is often a stray comma or missing quote one or two characters earlier.",
          },
          {
            question: "Can auto-repair fix every JSON error for me?",
            answer: "Auto-repair reliably fixes shallow issues like trailing commas, comments, single quotes and unquoted keys. It struggles with semantic problems, for example a missing closing quote that swallows the next few fields into one giant string, or a bracket that closes the wrong container. In those cases the tool has to guess and may produce something that parses but is not what you meant. Run repair, format the result, eyeball the structure, and validate business fields with a JSON Schema before trusting the output.",
          },
          {
            question: "What is the difference between Unexpected end of JSON input and Unexpected token?",
            answer: "Unexpected token means the parser saw a character where it did not belong, such as a stray comma or an unterminated string. Unexpected end of JSON input means the parser ran out of characters before the structure was complete, so the payload was truncated. The first is usually a hand-editing or concatenation bug near the reported offset. The second is typically a network abort, a streaming response that was cut off, or a file read that stopped early. Check the offending character for the first, and the total length and final character for the second.",
          },
        ],
      },
    },
  },
  {
    slug: 'what-is-json-schema-api-validation',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
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
          {
            label: "正则表达式测试",
            href: "/regex",
            description: "写 `pattern` 关键字时，先用正则测试器确认表达式匹配范围。",
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
        faq: [
          {
            question: "JSON Schema 和 TypeScript interface 有什么本质区别？",
            answer: "TypeScript interface 只在编译期存在，运行时无法阻止一个不合法的 JSON 进入系统；JSON Schema 是运行时契约，可以在接收接口、写入数据库前真正执行校验。前者服务于开发体验，后者服务于系统健壮性。实际项目里两者结合使用效果最好：用 JSON Schema 作为唯一事实源，通过 json-schema-to-typescript 生成 interface，同时用 ajv 在运行时校验。这样类型提示、运行时保护、文档、mock 数据都能从同一份定义派生，避免多头维护。",
          },
          {
            question: "什么时候不适合用 JSON Schema，而是应该写自定义校验函数？",
            answer: "JSON Schema 擅长结构性规则：字段是否存在、类型是否正确、字符串长度、数字范围、枚举、正则等。但它不擅长跨字段的业务规则，比如结束日期必须晚于开始日期、优惠券金额不能超过订单金额、下单人和收货人身份证一致等。这些应该在业务层写显式函数，或者用支持自定义关键字的库来扩展 Schema。经验做法是：Schema 负责挡住格式错误，业务函数负责挡住业务错误，两层过滤后再进入核心逻辑。",
          },
          {
            question: "JSON Schema 版本这么多（draft-04、07、2019-09、2020-12），选哪个？",
            answer: "如果没有历史包袱，直接选 draft 2020-12，它是目前最新的标准，也是 OpenAPI 3.1 采用的版本。draft-07 应用最广，几乎所有语言库都支持，是最保险的默认值。draft-04 只在维护老系统时才考虑。切换版本时注意 items 和 additionalItems 的语义有过调整，$ref 和 $id 的行为也变化过。建议在项目里显式声明 $schema，让工具链和校验器都能知道用哪套规则解析。",
          },
          {
            question: "怎么把 JSON Schema 用在前端表单校验上？",
            answer: "常见做法是使用 react-jsonschema-form、Formily、AJV 加自研渲染层。Schema 描述字段类型和约束，UI Schema 描述控件类型和布局，两者分离让业务规则可以复用到前后端。前端提交前跑一次 ajv 校验，把 errorMessage 关键字里的中文提示直接呈现给用户；后端收到时再校验一次，防止绕过前端。这样前后端共享同一份规则，避免出现前端过但后端拒的情况，也让新增字段只需改 Schema。",
          },
          {
            question: "JSON Schema 校验失败时错误信息太长，怎么给用户友好提示？",
            answer: "ajv 默认返回的错误路径像 /profile/0/email，普通用户看不懂。改进方法有几种：在 Schema 里加 errorMessage 关键字（需要 ajv-errors 插件）覆盖默认文案；写一个 formatError 函数把路径映射成业务字段名，比如把 /orderItems/0/qty 转成第 1 件商品的数量；聚合同一字段的多个错误，只展示最关键的一条；对国际化用户使用不同语言的 messages 文件。原始错误可以打到日志用于排查，展示给用户的版本必须简短明确。",
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
          {
            label: "Regex Tester",
            href: "/regex",
            description: "Validate your `pattern` regex against sample values before shipping the schema.",
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
        faq: [
          {
            question: "How is JSON Schema fundamentally different from a TypeScript interface?",
            answer: "A TypeScript interface exists only at compile time. At runtime nothing stops an invalid payload from entering your system. JSON Schema is a runtime contract, so you can validate every request before it reaches your database. Interfaces improve developer experience, schemas improve resilience. The two work best together: treat the schema as the source of truth, generate a TypeScript interface with json-schema-to-typescript, and validate at runtime with ajv. Docs, mocks, code generation and validation all derive from one file, so you never keep two definitions in sync by hand.",
          },
          {
            question: "When is JSON Schema the wrong tool, and you should write a custom validator instead?",
            answer: "JSON Schema is great at structural rules: field presence, primitive types, string length, numeric range, enum, pattern. It struggles with cross-field business rules such as end date must be after start date, coupon amount must not exceed order total, or the payer and recipient must share an ID. Encode those as explicit business functions, or extend the schema with custom keywords. A clean layering is: schema blocks malformed data, business functions block invalid business states, and only after both checks does the request reach core logic.",
          },
          {
            question: "There are many JSON Schema drafts (04, 07, 2019-09, 2020-12). Which one should I pick?",
            answer: "For a green-field project pick draft 2020-12, the current standard and the one OpenAPI 3.1 uses. draft-07 is still the safest default because virtually every language has a mature library for it. draft-04 is only worth using when maintaining an old system. When you upgrade, watch out for changes to items and additionalItems, and to how $ref and $id resolve. Always declare $schema at the top of your document so validators and tools know exactly which ruleset applies.",
          },
          {
            question: "How do I use JSON Schema for frontend form validation?",
            answer: "Popular options are react-jsonschema-form, Formily, or a custom renderer on top of ajv. The schema describes constraints, a UI schema describes widgets and layout, and separating the two lets business rules travel from frontend to backend unchanged. Validate on submit with ajv, surface friendly messages via the errorMessage keyword, then validate again on the server so no one can bypass the UI. Sharing one schema removes the common failure mode where the client accepts input the server later rejects.",
          },
          {
            question: "Ajv error messages are too verbose. How do I show something friendly to users?",
            answer: "By default ajv returns paths like /profile/0/email that end users cannot parse. Fix it in layers: add errorMessage in the schema (with ajv-errors) to override default text; write a formatError helper that maps JSON pointer paths to human field labels, so /orderItems/0/qty becomes quantity of item 1; collapse multiple errors on the same field into the single most important one; and load locale-specific message bundles for internationalized apps. Keep the raw payload in logs for debugging, but only show a short, actionable message in the UI.",
          },
        ],
      },
    },
  },
  {
    slug: 'what-is-jwt-header-payload',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
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
          {
            label: "时间戳转换",
            href: "/timestamp",
            description: "把 JWT 里的 `iat` / `exp` 数字翻译成人类可读时间，快速判断是否过期。",
          },
          {
            label: "UUID 生成",
            href: "/uuid",
            description: "为 JWT 的 `jti` claim 生成唯一 ID，避免 token 被重放。",
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
        faq: [
          {
            question: "JWT 里的 payload 是加密的吗？可以放密码吗？",
            answer: "不是加密，只是 Base64Url 编码。任何人拿到 JWT 都可以在浏览器控制台里 atob 出来看到 payload 全部内容。因此绝对不能放密码、身份证号、支付密码、完整银行卡号这类敏感数据。适合放在 payload 的是用户 ID、角色、租户 ID、过期时间等标识信息。如果确实需要传输敏感数据，可以使用 JWE（JSON Web Encryption），它对 payload 做真正的加密；或者把敏感数据留在服务端，JWT 只承担身份识别的职责。",
          },
          {
            question: "JWT 过期了怎么办？前端要不要自己续签？",
            answer: "常见方案是 access token + refresh token 双令牌：access token 短期（15 分钟到 2 小时）用来访问接口，refresh token 长期（几天到几周）只用来换新的 access token。前端在收到 401 且 refresh token 未过期时，静默调用刷新接口，拿到新 token 后重放原始请求。切忌只用一个长期 JWT，否则一旦泄露就长期有效。也不要在前端定时轮询刷新，容易造成时间窗错乱，出错时用户会突然掉登录。",
          },
          {
            question: "JWT 和 session cookie 相比，什么时候该选哪个？",
            answer: "Session cookie 依赖服务端存储，登出时清一下 session 即可，安全模型成熟；缺点是难以水平扩展和跨域使用。JWT 是无状态的，天然支持微服务和多端共享，但撤销困难，一般要配合黑名单或短过期时间。经验取舍：单体后端、同域网页首选 session cookie；多个服务、多个客户端、需要跨域或移动端共用后端用 JWT。也可以混合使用，用 JWT 做外部访问、内部服务之间用短期签名令牌。",
          },
          {
            question: "为什么有人说 JWT 不安全，是危言耸听吗？",
            answer: "并非危言耸听，但也不能一概而论。真正的问题多半来自误用：把敏感数据塞进 payload、用了 alg: none、密钥太短或写在前端、把 JWT 放在 localStorage 被 XSS 偷走、忘了做 exp 校验等。规范使用下 JWT 是安全的：选择强算法（HS256 或 RS256）、密钥足够长、只放非敏感标识、走 HttpOnly Cookie 或短时 access token、服务端记得校验签名和过期。评估安全性时应该看落地方式，而不是抽象地判断技术本身。",
          },
          {
            question: "解码 JWT 只需要 Base64 就够了，为什么还需要专门的工具？",
            answer: "解出 payload 只是第一步，专业工具通常还会：把时间戳字段（iat、exp、nbf）转成本地时间；标出 payload 是否过期、还有多久过期；识别签名算法；校验签名是否正确（需要提供密钥或公钥）；对常见 claim 名做解释。手工 Base64 解码只能看内容，不能告诉你这个 token 是否还有效、签名是否被篡改。日常开发排查登录问题、复现线上 bug 时，专业工具能显著缩短定位时间。",
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
          {
            label: "Timestamp Converter",
            href: "/timestamp",
            description: "Turn JWT `iat` / `exp` numbers into readable dates to check if a token expired.",
          },
          {
            label: "UUID Generator",
            href: "/uuid",
            description: "Generate a unique `jti` claim to protect JWTs from replay attacks.",
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
        faq: [
          {
            question: "Is the JWT payload encrypted? Can I store a password in it?",
            answer: "The payload is Base64Url encoded, not encrypted. Anyone with the token can paste it into a browser console, decode it and read everything. Never put passwords, national ID numbers, payment PINs or full card numbers there. Payloads should hold identifiers such as user ID, role, tenant ID and expiry timestamps. If you truly need to transport sensitive data, use JWE (JSON Web Encryption) which actually encrypts the payload, or keep the sensitive fields on the server and let the JWT carry only an opaque identity reference.",
          },
          {
            question: "What should the frontend do when a JWT expires? Should it refresh on its own?",
            answer: "Use an access token plus refresh token pair. The access token is short-lived (15 minutes to a couple of hours) and calls your APIs. The refresh token is longer-lived and only used to obtain new access tokens. When a request returns 401 and the refresh token is still valid, silently call the refresh endpoint and replay the original request. Do not rely on a single long-lived token, because a leak grants indefinite access. Avoid frontend polling to refresh eagerly, as clock drift can silently log users out.",
          },
          {
            question: "When should I choose JWT over a session cookie?",
            answer: "Session cookies rely on server storage. Logout is simple, security is well understood, but horizontal scaling and cross-origin usage are painful. JWTs are stateless, natural for microservices and multiple clients, but revocation is hard and usually requires a short expiry or a blocklist. Rule of thumb: for a single backend serving one web app on one origin, prefer session cookies. For multiple services, mobile plus web, or cross-origin flows, prefer JWT. A hybrid also works, where JWTs face external clients and short-lived signed tokens run inside the mesh.",
          },
          {
            question: "People say JWT is insecure. Are they exaggerating?",
            answer: "Not exaggeration, but not the whole story either. The real problems are almost always misuse: putting sensitive data in the payload, accepting alg: none, using a short or leaked secret, embedding the secret in the frontend, storing the token in localStorage where XSS can steal it, or forgetting to check exp. Used properly, JWT is safe: choose a strong algorithm (HS256 or RS256), keep the key long, carry only non-sensitive identifiers, ship it via HttpOnly cookie or a short-lived access token, and always verify the signature and expiry.",
          },
          {
            question: "If Base64 decoding is enough, why do I need a dedicated JWT tool?",
            answer: "Decoding the payload is only step one. A good tool converts iat, exp and nbf into local time; shows how long until the token expires; highlights the signing algorithm; verifies the signature when you paste a secret or public key; and labels common claims. Raw Base64 tells you what is inside but not whether the token is still valid or has been tampered with. When investigating login bugs or reproducing production issues, a dedicated inspector saves significant time compared to a generic decoder.",
          },
        ],
      },
    },
  },
  {
    slug: 'how-to-generate-qr-code-url-wifi-contact',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
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
          {
            label: "URL / Query String 构造器",
            href: "/url-builder",
            description: "生成二维码前先把 UTM 参数和 tracker 加到 URL 上，扫码即可带上跟踪信息。",
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
        faq: [
          {
            question: "生成的 WiFi 二维码手机扫不出怎么办？",
            answer: "先检查协议字段是否完全匹配：T 大写、加密类型必须是 WPA/WEP/nopass 之一、SSID 和密码里的分号或反斜杠要转义；再确认结尾有两个分号。iOS 原生相机只支持标准 WiFi 二维码语法，而某些扫码 App 只识别 URL，所以最好在多个手机上测试。SSID 里带中文时部分老手机识别失败，可以改成隐藏 SSID+手动连接或者提供辅助 URL。密码含 & : ; , 等符号务必转义，否则解析器会截断。",
          },
          {
            question: "vCard 二维码扫出来通讯录里字段错乱，是什么原因？",
            answer: "vCard 对换行和字段顺序敏感。换行必须是 CRLF（\\r\\n），有些编辑器保存时会变成 LF；BEGIN:VCARD 和 VERSION 必须是前两行；FN 是必填字段。字段错乱多半是编辑时把 N: 和 FN: 弄混了，或者中文名字里出现英文分号。建议先在纯文本编辑器里检查一遍，或者直接用工具的表单模式填字段，让它生成规范的 vCard 文本，再打包成二维码。iOS 与 Android 对多值字段（TEL、EMAIL）的展示方式略有差异，跨平台测试可以更早发现问题。",
          },
          {
            question: "二维码里放长 URL 会有什么问题，需要短链吗？",
            answer: "URL 越长，二维码就越密，图形容错率下降，打印时更容易识别失败，尤其在小尺寸或反光背景下。带 UTM 参数的营销链接常常几百字符，建议先用短链服务（bit.ly、自建 302 服务）压缩，再生成二维码。短链的另一个好处是可换目标，即使二维码印在物料上，也可以随时改跳转，不需要重印。反之，如果二维码要长期保存、离线可读，建议直接放最终 URL 并选择较高纠错级别。",
          },
          {
            question: "二维码上加了 Logo，为什么有的能扫有的不能？",
            answer: "Logo 会占用二维码的一部分数据模块。二维码本身有纠错能力，级别越高（L/M/Q/H）能容忍的遮挡越多。加 Logo 时通常需要将纠错级别提升到 Q 或 H，Logo 面积控制在总面积的 20% 以内，颜色反差要足够，避免 Logo 挡住三个定位点（角上的方块）。此外要注意留白（quiet zone）不能被裁掉。同一张图有的手机能扫、有的扫不出，多半是弱光或纠错级别不够，先在打印前用低端手机测试一下。",
          },
          {
            question: "二维码印刷时应该用什么颜色和最小尺寸？",
            answer: "颜色遵循两条原则：前景足够深、背景足够浅、两者反差大。经典的黑白最保险，深蓝或深紫也可以，但反色（浅色前景+深色背景）识别率低，尽量避免。尺寸方面，扫码距离与二维码边长的比例大约是 10:1，桌面物料 2.5cm 即可，海报 5cm 以上，户外广告牌需要 30cm 以上。周围要留够静默区（约 4 个模块宽度），紧贴其他图案会导致扫描仪找不到边界。",
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
          {
            label: "URL / Query String Builder",
            href: "/url-builder",
            description: "Attach UTM parameters or trackers to the URL before generating the QR code.",
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
        faq: [
          {
            question: "My phone cannot scan the WiFi QR code I generated. What went wrong?",
            answer: "Check the syntax closely: T must be uppercase, the encryption type must be WPA, WEP or nopass, and any semicolons or backslashes inside the SSID or password must be escaped. The string must end with two semicolons. Native iOS camera only reads the standard WiFi syntax, while some third-party scanners only recognise URLs, so test on multiple devices. SSIDs with Chinese or emoji characters fail on some older phones. If the password contains & : ; , escape them, otherwise the parser truncates the value.",
          },
          {
            question: "Why do vCard fields land in the wrong place after scanning?",
            answer: "vCard is picky about line endings and field order. Lines must end with CRLF, but many editors silently save as LF. BEGIN:VCARD and VERSION must be the first two lines, and FN is required. Scrambled fields usually come from confusing N: with FN:, or from an unescaped semicolon in a Chinese name. Use a plain text editor to inspect the output, or better, use a form-based tool that writes the vCard for you. Multi-value fields such as TEL and EMAIL render slightly differently on iOS and Android, so test on both.",
          },
          {
            question: "Are there downsides to encoding a long URL directly, or should I shorten it first?",
            answer: "Longer URLs mean denser QR codes with smaller modules, which hurts recognition on small prints, glossy surfaces or dim light. Marketing links with UTM parameters can easily hit several hundred characters. Shorten them through bit.ly or an in-house 302 service before encoding. Short links also let you change the destination without reprinting. However, if the QR must work offline forever, keep the final URL inside and raise the error correction level, so it survives even after the shortener service is retired.",
          },
          {
            question: "Why does a QR code with a logo scan on some phones but not others?",
            answer: "The logo covers part of the encoding modules. QR codes have four error correction levels (L, M, Q, H), and higher levels tolerate more occlusion. When adding a logo, raise the level to Q or H, keep the logo below 20 percent of the total area, ensure high contrast, and never place it over the three finder squares in the corners. Also preserve the quiet zone around the code. Mixed results across phones usually mean the level is too low or the ambient light is weak.",
          },
          {
            question: "What colours and minimum size should I use when printing a QR code?",
            answer: "Two rules for colour: foreground dark, background light, high contrast between them. Classic black on white is safest; dark blue or dark purple also work. Inverted schemes with a light foreground on a dark background scan poorly and should be avoided. For size, plan for a 10:1 ratio of scanning distance to code width. Table tents can be 2.5 cm, posters need 5 cm or more, and outdoor billboards need 30 cm and up. Always keep a quiet zone about four modules wide around the code.",
          },
        ],
      },
    },
  },
  {
    slug: 'why-qr-code-cannot-be-decoded',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
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
          {
            label: "颜色转换器",
            href: "/color-converter",
            description: "为二维码前景 / 背景检查对比度，避免相近颜色导致识别失败。",
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
        faq: [
          {
            question: "二维码看着清晰，但扫描器就是识别不出来，可能是什么原因？",
            answer: "常见有几种：一是被压缩或截图后失去边缘锐利度，模块之间的黑白边界模糊；二是缺少 quiet zone，紧挨着图片其他元素；三是分辨率过低，每个模块占不到 3 像素；四是拍照时相机没对焦或有反光；五是纠错级别设定过低，一点点污渍就失效。可以先用同一图片喂给两个不同引擎（比如 ZXing 和 zbar）交叉验证，如果都失败，就说明是图像本身的问题而不是扫描器兼容性。",
          },
          {
            question: "拍照识别失败，直接读原始文件却能识别，为什么？",
            answer: "原始文件保留了完整的分辨率和无损像素；拍照会引入几种损失：镜头畸变、白平衡偏色、JPEG 压缩、屏幕摩尔纹、手抖导致的模糊。当二维码印在屏幕上再拍时，屏幕像素和相机像素的干涉还会产生波纹，让识别引擎误判模块。解决办法：用截图代替拍照、把二维码放大再拍、开启相机的宏模式或对焦锁定、避免反光的塑料膜、拍摄时手机与二维码保持平行。",
          },
          {
            question: "同一张二维码，iPhone 能扫、Android 扫不出，正常吗？",
            answer: "常见且可以修复。iOS 从系统层集成了苹果自研的识别算法，容错高；Android 各厂商用不同引擎，从相机到微信、支付宝，识别能力差异很大。若目标用户使用 Android 的比例高，应把二维码做得更保守：更高纠错级别、更大尺寸、更清晰的对比度、避免复杂 Logo。发布前用三到四台低端安卓机、两三种扫码 App 交叉测试，能覆盖绝大多数兼容性问题。",
          },
          {
            question: "二维码被水印、透明遮罩盖住还能救回来吗？",
            answer: "取决于遮挡范围。二维码本身有纠错能力，最高级别 H 可以恢复约 30% 的数据丢失，但如果遮罩正好挡住了三个定位点、时序图案或对齐图案，识别就会彻底失败。可以尝试用图像处理提高对比度、拉伸校正透视、把水印区域用邻域填补；如果原图仍在，重新生成一份是最快的办法。日常制作素材时，尽量把水印放在二维码之外，或者预留品牌区域，不要把 Logo 放在角上。",
          },
          {
            question: "为什么同一段 URL 生成的二维码，每次图案都不太一样？",
            answer: "在数据一致的前提下，QR 编码器可以选择不同的 mask pattern（掩码图案），目的是让 0 和 1 的分布更均衡，识别更稳定。不同库、不同版本、甚至同一库不同参数都会挑不同的掩码，因此外观略有差异。这属于正常现象，只要能被正确解码即可。想固定图案时，可以在生成参数里指定 mask 或 version，也可以让整个流水线使用同一个库和版本，保证素材可复现。",
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
          {
            label: "Color Converter",
            href: "/color-converter",
            description: "Check foreground/background contrast so low-contrast colors do not break scanning.",
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
        faq: [
          {
            question: "The QR code looks sharp, but scanners still fail. What could be wrong?",
            answer: "A few suspects: screenshots or aggressive compression that soften the black-white edges; a missing quiet zone that touches other graphics; a resolution so low that each module is under three pixels; a photo with poor focus or heavy glare; or an error correction level so low that a small smudge destroys the payload. Feed the image into two different decoders such as ZXing and zbar. If both fail, the problem is in the image itself, not scanner compatibility, and you should regenerate the code.",
          },
          {
            question: "Why does the raw file decode fine while a photo of the same code fails?",
            answer: "The raw file keeps original pixels and lossless edges. A photo introduces lens distortion, white balance drift, JPEG compression, motion blur and, when photographing a screen, moiré interference between the display grid and the camera sensor. The decoder then misreads modules. Prefer screenshots over photos, enlarge the code before shooting, use macro mode or lock focus, remove glossy plastic covers and hold the phone parallel to the code. These simple habits recover most failed scans.",
          },
          {
            question: "The same QR code scans on iPhone but not on Android. Is that expected?",
            answer: "Common and fixable. iOS uses Apple's built-in engine with high tolerance, while Android vendors ship different engines, and apps like WeChat, Alipay or Google Lens each add their own preprocessing. If your audience is Android-heavy, harden the code: increase the error correction level, print larger, boost contrast and avoid heavy logos. Before release, test on three or four low-end Android phones with two or three scanner apps. That coverage catches the vast majority of compatibility issues.",
          },
          {
            question: "Can a QR code covered by a watermark or overlay still be recovered?",
            answer: "It depends on where the overlay lands. QR codes carry error correction, and the highest level H can restore about 30 percent of lost data. But if the overlay hides the three finder patterns, the timing pattern or the alignment pattern, recovery becomes impossible. Try boosting contrast, correcting perspective, or inpainting the watermarked area. If you still have the source data, regenerating is the fastest fix. When designing materials, keep watermarks away from the code and reserve a clean brand area beside it.",
          },
          {
            question: "Why does the same URL produce slightly different QR images each time?",
            answer: "Even with identical input, encoders may pick different mask patterns to balance the distribution of black and white modules for better readability. Different libraries, versions or parameters choose different masks, so the visual look varies while the payload is identical. This is normal. If you need a stable image, pin the mask and the version, and standardise the library across your pipeline, so print materials and asset stores always render the same fingerprint.",
          },
        ],
      },
    },
  },
  {
    slug: 'how-to-use-text-diff-tool',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
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
          {
            label: "正则表达式测试",
            href: "/regex",
            description: "对比前先用正则把时间戳、随机 ID 等噪声抹掉，diff 结果会更清晰。",
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
        faq: [
          {
            question: "文本 diff 工具能对比 Word 或 PDF 文档吗？",
            answer: "大多数通用 diff 工具只处理纯文本，直接把 Word/PDF 粘进去会带着大量格式字符，导致 diff 结果里充满噪声。正确做法是先把两份文档另存为 txt 或用 pandoc、pdftotext 转成纯文本，再比对。如果只关心结构性变化，可以先转成 Markdown。想要保留格式的可视化比对，需要专门的 Word Compare 或 PDF diff 工具，这些工具会解析文档 XML 结构，展示批注、样式的变化，而不是逐字比对。",
          },
          {
            question: "diff 出现大量 whitespace 差异，怎么忽略？",
            answer: "常见有三类空白：行尾空格、多余空行、Tab 与空格混用。多数在线 diff 工具提供 ignore whitespace 选项，勾选后可以按逻辑差异对齐。命令行 git diff 使用 -w 或 --ignore-all-space，代码编辑器（VS Code、IntelliJ）也有对应开关。长期看，最好在项目里加 .editorconfig 与 lint 规则统一缩进和换行，同时开启保存时去除行尾空格，比每次比对手动忽略更彻底。",
          },
          {
            question: "两份合同看起来内容一样，diff 却说完全不同，哪里出错了？",
            answer: "先检查换行符：Windows 是 CRLF、Mac/Linux 是 LF，一份文件从 Windows 拷贝、另一份从邮件网页复制，会导致每一行都被视为不同。其次检查是否有 BOM 或不可见字符，比如全角空格、零宽空格。最后确认字符编码：一份 UTF-8 一份 GBK 也会让 diff 引擎按字节比较后全红。修复：先用记事本或工具转为 UTF-8 无 BOM、统一换行符，再做比对。",
          },
          {
            question: "怎么只对比两段代码的逻辑变化，忽略变量名和注释？",
            answer: "普通行级 diff 无法理解语义，需要工具级支持。可以先跑一次 Prettier 或语言格式化工具让代码风格一致，再 diff；或者使用 AST diff 工具（如 difftastic、semantic diff），它们在语法树层面比对，能识别 rename、参数顺序调整等重构。对注释可以先用正则批量去掉再比对。如果目标是评审 PR，直接看 GitHub 的 diff 并配合忽略空白选项，通常已经足够，不必额外工具。",
          },
          {
            question: "diff 工具能标出移动过的段落，还是只能标增删？",
            answer: "标准 unified diff 只有增删两种标记，如果一段代码从文件顶部移动到底部，会显示成上方大段删除、下方大段新增，容易误判为大改。要识别 move，需要更智能的算法，比如 patience diff、histogram diff，或 semantic diff 工具。GitHub 从 2022 年起对某些语言支持 move detection。日常代码评审如果发现 diff 里出现大段一红一绿又长得几乎一样，先切换算法看看，很可能只是搬家。",
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
          {
            label: "Regex Tester",
            href: "/regex",
            description: "Strip timestamps or random IDs with a regex before diffing so the output stays clean.",
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
        faq: [
          {
            question: "Can a text diff tool compare Word or PDF documents?",
            answer: "Most generic diff tools only work with plain text. Pasting Word or PDF content copies formatting characters that turn the diff into noise. First export both files to txt, or convert them with pandoc or pdftotext. If only structural changes matter, convert to Markdown first. For visual comparison that preserves formatting, use a dedicated Word Compare or PDF diff tool. Those parse the underlying XML, surface style and comment changes and align paragraphs, rather than diffing character by character.",
          },
          {
            question: "How can I ignore whitespace noise in a diff?",
            answer: "There are three common flavours: trailing spaces, extra blank lines and mixed tabs versus spaces. Most online diff tools have an ignore whitespace toggle. Command-line git diff supports -w and --ignore-all-space, and editors like VS Code and IntelliJ have equivalent options. As a longer-term fix, add an .editorconfig and lint rules to enforce indentation and line endings across the project, and enable trim-trailing-whitespace on save. That prevents the noise from being introduced in the first place.",
          },
          {
            question: "Two contracts look identical, but the diff says they differ entirely. Why?",
            answer: "Start with line endings: Windows uses CRLF, macOS and Linux use LF. If one copy came from Windows and another from a web mail preview, every line becomes different. Next, look for invisible characters such as BOM, full-width spaces or zero-width spaces. Finally, check encoding: comparing a UTF-8 file with a GBK file byte by byte turns the whole diff red. Fix by normalising both files to UTF-8 without BOM and unifying line endings before comparing again.",
          },
          {
            question: "How do I diff only the logic of two code snippets while ignoring variable names and comments?",
            answer: "A plain line-level diff has no semantic understanding, so use tool-level help. Run Prettier or the language formatter first to unify style, then diff. Alternatively use an AST diff such as difftastic or a semantic diff tool that compares syntax trees and recognises renames or reordered arguments. Strip comments with a regex if they are noisy. For pull request reviews, GitHub's diff with the ignore-whitespace toggle is usually enough and does not require extra tooling.",
          },
          {
            question: "Can a diff tool detect moved paragraphs, or only additions and deletions?",
            answer: "The standard unified diff only marks add and delete, so a block that moves from the top to the bottom of a file appears as a huge deletion above and a huge addition below, which looks like a rewrite. Detecting moves needs smarter algorithms such as patience diff, histogram diff, or semantic diff tools. GitHub has supported move detection for some languages since 2022. When you see a diff with symmetrical red and green blocks, try switching algorithms before assuming a rewrite.",
          },
        ],
      },
    },
  },
  {
    slug: 'word-count-character-byte-difference',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
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
          {
            label: "UUID 生成",
            href: "/uuid",
            description: "需要固定长度随机字符串（22 位 NanoID / 32 位 UUID）时的直接来源。",
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
        faq: [
          {
            question: "为什么 Word 和在线计数工具算出来的字数不一样？",
            answer: "Word 默认按 CJK 字符 + 英文单词的混合规则统计，一个汉字算 1 个字，一段英文按空格切成若干单词；而在线工具可能只统计 Unicode 字符总数，也可能把英文按字符算。差异还来自：是否计入空格、是否计入标点、连字符是否折算、Emoji 是否算 1 个字符（在 UTF-16 里 Emoji 可能占两个 code unit）。写作业或论文时，以老师指定的工具为准；写广告文案时按平台规则（微博、Twitter、公众号）预留缓冲。",
          },
          {
            question: "一个中文字在 UTF-8 里到底占几个字节，怎么算表单最大长度？",
            answer: "绝大多数常用汉字在 UTF-8 下占 3 字节，少量生僻字或 Emoji 占 4 字节；ASCII 字符仍是 1 字节。数据库里用 VARCHAR(N) 时，MySQL 5.7 之前 N 表示字节数，之后 N 表示字符数，行为不一致。表单校验建议同时告诉用户两个数：字符数和字节数，或者直接用 characters 校验；后端存储要按最大字节数留足空间，比如允许 100 字符时，UTF-8 空间至少留 400 字节。",
          },
          {
            question: "Emoji 和组合字符（比如带肤色的表情）算几个字符？",
            answer: "从视觉上是一个字符，从 Unicode 层可能是多个 code point，从 UTF-16 层可能是多个 code unit。比如 👨‍👩‍👧 由 5 个 code point 拼成，JavaScript 的 str.length 会返回 8，但用户会觉得是 1 个字符。要按用户直觉计数，应使用 Intl.Segmenter 或 grapheme-splitter 之类的库按 grapheme cluster 分割。表单限制也建议按 grapheme 计数，避免用户输入一个表情就报超长。",
          },
          {
            question: "微博、Twitter、公众号的字数规则各不相同，怎么统一处理？",
            answer: "各平台规则确实不同：Twitter 早期把中文算 2 字符、英文 1 字符，2018 年后统一按 weighted characters 计算；微博按字符数，一个汉字 1 字，英文 2 个算 1 字；公众号推送有字数上限但含空格标点。做多平台发布工具时，最稳妥的方式是为每个平台实现一个专属计数函数，并展示各平台的剩余额度，而不是用一个通用算法。发布前预留 5%-10% 缓冲，防止链接展开或 UTM 追加后超长。",
          },
          {
            question: "统计字数时要不要计入空格和换行？行业惯例是什么？",
            answer: "翻译行业按源语种字数计费，通常不计入空格但计入标点；出版社按印刷版面估算，会计入空格。学术论文一般按含空格字数统计以贴近排版长度。程序化场景里，短信按含空格算字节数（GSM-7 编码里空格也占位）；SEO 内容长度按含空格字符更准确。判断标准：如果目的是排版或播报，计入空格；如果目的是版权、翻译计费，按行业约定。工具最好同时展示两个数值，让用户自选。",
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
          {
            label: "UUID Generator",
            href: "/uuid",
            description: "Grab fixed-length random strings (22-char NanoID or 32-char UUID) when you need them.",
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
        faq: [
          {
            question: "Why do Word and online counters produce different word counts?",
            answer: "Word applies a mixed rule for CJK plus English: one Chinese character counts as one word, English is split by spaces. Online tools may just count total Unicode characters, or count English letter by letter. Other divergences: whether spaces and punctuation count, how hyphenated words are treated, and whether an emoji counts as one character even though it may span multiple UTF-16 code units. Use the tool your professor or platform mandates. For marketing copy, add a safety margin because Weibo, Twitter and WeChat all count differently.",
          },
          {
            question: "How many bytes does one Chinese character take in UTF-8, and how do I size a form field?",
            answer: "Common Chinese characters take three bytes in UTF-8, rare characters and emoji take four, ASCII stays at one. In MySQL, VARCHAR(N) meant N bytes before 5.7 and N characters after, which trips up many teams. In forms, show both character count and byte count, or validate by characters and let the backend reserve enough bytes. For a 100-character limit, reserve at least 400 bytes in UTF-8 so users never hit an obscure database error.",
          },
          {
            question: "How do emoji and combining characters (like skin-tone emojis) affect the count?",
            answer: "Visually one character. In Unicode it can be multiple code points, and in UTF-16 multiple code units. For example 👨‍👩‍👧 uses five code points, so JavaScript's str.length returns 8, but a user considers it one character. To count by user intuition, split with Intl.Segmenter or a grapheme-splitter library. Form limits should also count grapheme clusters, otherwise a single emoji can trigger a spurious over-limit error. Backend storage should still budget by bytes.",
          },
          {
            question: "Twitter, Weibo and WeChat all count characters differently. How do I handle this in a cross-platform tool?",
            answer: "The rules really do differ. Twitter used to count Chinese as 2 characters and English as 1, but since 2018 it uses weighted characters. Weibo counts one Chinese character as 1 and two English characters as 1. WeChat has length limits including spaces and punctuation. In a cross-poster, implement one counter per platform and surface remaining budget for each, rather than a single universal function. Reserve 5 to 10 percent of headroom before publishing, in case a link expander or appended UTM parameters push you over.",
          },
          {
            question: "Should spaces and line breaks be counted? What is the industry convention?",
            answer: "Translation agencies typically charge by source words excluding spaces but including punctuation. Publishers estimate by typeset length and include spaces. Academic writing usually includes spaces to reflect page length. SMS billing counts bytes including spaces because GSM-7 space still uses a slot. For SEO the with-spaces count is more meaningful. Rule of thumb: for typesetting or broadcast, include spaces; for translation billing, follow the industry contract. Ideally the tool shows both numbers so the user can pick the one that matches their pipeline.",
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
