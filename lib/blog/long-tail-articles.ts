import type { BlogArticle } from './articles';

const jsonSampleInput = `{
  "id": 1001,
  "name": "ToolGarden",
  "isActive": true,
  "tags": ["json", "pdf"],
  "owner": {
    "email": "hi@example.com",
    "verified": false
  },
  "lastLogin": null
}`;

const tsInterfaceOutput = `interface Owner {
  email: string;
  verified: boolean;
}

interface Root {
  id: number;
  name: string;
  isActive: boolean;
  tags: string[];
  owner: Owner;
  lastLogin: null;
}`;

export const longTailBlogArticles: BlogArticle[] = [
  {
    slug: 'json-to-typescript-interface-guide',
    publishedAt: '2026-07-27',
    updatedAt: '2026-07-27',
    translations: {
      zh: {
        title: '如何把 JSON 转成 TypeScript 接口（interface）',
        excerpt: '手写 API 响应的 TypeScript 类型既慢又容易出错。用一段真实 JSON 样本自动推断 interface，几秒就能得到可直接使用的类型定义。',
        metaTitle: 'JSON 转 TypeScript 接口：从 API 响应自动生成 interface',
        metaDescription: '介绍如何把 JSON 样本自动转成 TypeScript interface，包括嵌套对象、数组、可选字段和 null 的处理方式，并提供浏览器本地、不上传数据的在线转换方法。',
        readingTime: '约 6 分钟阅读',
        tags: ['JSON', 'TypeScript', 'interface', '类型生成', 'API'],
        relatedTools: [
          {
            label: 'JSON → TypeScript',
            href: '/json-to-ts',
            description: '粘贴 JSON 样本，自动推断并生成 TypeScript interface，可直接复制到项目。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '先格式化和校验 JSON，确保样本合法，再生成类型更稳妥。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '前端接入一个新接口时，最枯燥的一步往往是照着 JSON 响应手写 TypeScript 类型。字段一多，很容易漏写、写错类型，或者忘记某个字段是可选的。',
          },
          {
            type: 'paragraph',
            text: '其实这一步完全可以自动化：给一段真实的 JSON 样本，工具就能推断出每个字段的类型，并生成对应的 TypeScript interface。下面先看它是怎么工作的，再讲清楚几种容易出错的边界情况。',
          },
          { type: 'heading', level: 2, text: '一个最简单的例子' },
          {
            type: 'paragraph',
            text: '假设接口返回下面这段 JSON：',
          },
          { type: 'code', language: 'json', code: jsonSampleInput },
          {
            type: 'paragraph',
            text: '根据字段的值，可以推断出对应的 TypeScript 类型。嵌套对象会被拆成独立 interface，数组会推断出元素类型：',
          },
          { type: 'code', language: 'typescript', code: tsInterfaceOutput },
          { type: 'heading', level: 2, text: '类型是怎么推断出来的？' },
          {
            type: 'list',
            items: [
              '字符串 → string，数字 → number，布尔值 → boolean。',
              '对象 → 独立的 interface，字段名作为类型名（如 owner → Owner）。',
              '数组 → 元素类型加 []，例如字符串数组是 string[]。',
              'null → null（无法从单个 null 值推断出真实类型，需要人工补充）。',
              '同名字段在不同对象里类型不同时 → 生成联合类型（如 string | number）。',
            ],
          },
          { type: 'heading', level: 2, text: '几个容易出错的边界情况' },
          {
            type: 'heading',
            level: 3,
            text: '1. 可选字段',
          },
          {
            type: 'paragraph',
            text: '单个 JSON 样本无法告诉工具“哪些字段可能缺失”。如果某个字段有时会返回、有时不返回，建议手动把它标成可选（在字段名后加 ?）。用包含多种情况的样本，或多个样本合并推断，可以减少这类遗漏。',
          },
          {
            type: 'heading',
            level: 3,
            text: '2. null 与真实类型',
          },
          {
            type: 'paragraph',
            text: '像 lastLogin: null 这样的字段，工具只能推断成 null。实际业务里它多半是 string | null 或 number | null。拿到一份 lastLogin 有值的样本再生成，或手动改成联合类型，会更贴近真实接口。',
          },
          {
            type: 'heading',
            level: 3,
            text: '3. 空数组和混合数组',
          },
          {
            type: 'paragraph',
            text: '空数组 [] 无法推断元素类型，通常会退化成 unknown[] 或 any[]。混合类型数组（如 [1, "a"]）会生成 (number | string)[]。数组能提供的样本元素越丰富，推断结果越准确。',
          },
          { type: 'heading', level: 2, text: '生成类型时的实用建议' },
          {
            type: 'table',
            headers: ['场景', '建议做法'],
            rows: [
              ['字段可能缺失', '手动加 ? 标为可选，或用多份样本合并推断'],
              ['字段值为 null', '改成 T | null（如 string | null）'],
              ['数组为空', '手动指定元素类型，避免 any[]'],
              ['枚举类字符串', '按需改成字面量联合类型（如 "draft" | "published"）'],
              ['样本不合法', '先用 JSON 格式化工具校验，再生成'],
            ],
          },
          { type: 'heading', level: 2, text: '在浏览器本地生成，不上传接口数据' },
          {
            type: 'paragraph',
            text: 'API 响应里经常带着 token、邮箱、用户 ID 等敏感信息，把它粘贴到会上传数据的在线工具并不安全。ToolGarden 的 JSON → TypeScript 工具在浏览器本地完成推断，样本不会上传到服务器，适合直接拿真实响应来生成类型。',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz JSON → TypeScript',
            text: '粘贴一段 JSON 样本即可自动生成 TypeScript interface，全程在浏览器本地进行。生成后可以直接复制，再按上文建议手动补充可选字段和 null 类型。',
            href: '/json-to-ts',
            linkLabel: '打开 JSON → TypeScript 工具',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '从 JSON 自动生成 TypeScript interface，能省下大量手写类型的时间，也能减少人为错误。真正需要你关注的，是样本无法覆盖的部分：可选字段、null 的真实类型和空数组。把这几点补齐，生成的类型就能直接放心用在项目里。',
          },
        ],
        faq: [
          {
            question: 'JSON 转 TypeScript 会上传我的接口数据吗？',
            answer: 'ToolGarden 的 JSON → TypeScript 工具在浏览器本地完成类型推断，粘贴的 JSON 样本不会上传到任何服务器，也不会被记录。API 响应里常带有 token、邮箱、用户 ID 等敏感字段，用本地工具生成类型可以避免把这些信息发送到外部服务。生成的 interface 直接显示在页面上，复制走即可。',
          },
          {
            question: '为什么生成的字段类型是 any 或 unknown？',
            answer: '这通常出现在两种情况：一是字段值为空数组 []，工具无法从空数组推断出元素类型；二是字段值为 null，无法判断它真实应该是 string、number 还是别的类型。解决办法是提供一份字段有真实值的样本再生成，或者在生成后手动把它改成明确的类型，例如 string[] 或 string | null。',
          },
          {
            question: '如何处理有时才返回的可选字段？',
            answer: '单个 JSON 样本无法表达“这个字段可能不存在”，所以默认生成的字段都是必填的。如果你知道某些字段是可选的，可以在生成后手动在字段名后加上 ?，把它标记为可选。更稳妥的做法是收集多份包含不同情况的样本，或在生成前把这些字段的典型缺失场景考虑进去，减少后续手动调整。',
          },
        ],
      },
      en: {
        title: 'How to Convert JSON to a TypeScript Interface',
        excerpt: 'Hand-writing TypeScript types for an API response is slow and error-prone. Infer an interface from a real JSON sample and get usable types in seconds.',
        metaTitle: 'JSON to TypeScript Interface: Generate Types from an API Response',
        metaDescription: 'Learn how to turn a JSON sample into a TypeScript interface, including how nested objects, arrays, optional fields and null are handled, using a browser-local converter that never uploads your data.',
        readingTime: '6 min read',
        tags: ['JSON', 'TypeScript', 'interface', 'type generation', 'API'],
        relatedTools: [
          {
            label: 'JSON → TypeScript',
            href: '/json-to-ts',
            description: 'Paste a JSON sample to infer and generate a TypeScript interface you can copy straight into your project.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format and validate the JSON first so your sample is valid before generating types.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The most tedious part of wiring up a new endpoint is often hand-writing TypeScript types from the JSON response. With many fields it is easy to miss one, use the wrong type, or forget that a field is optional.',
          },
          {
            type: 'paragraph',
            text: 'This step can be fully automated: give the tool a real JSON sample and it infers the type of every field and emits a matching TypeScript interface. Below is how it works, plus the edge cases that trip people up.',
          },
          { type: 'heading', level: 2, text: 'A minimal example' },
          {
            type: 'paragraph',
            text: 'Suppose the endpoint returns this JSON:',
          },
          { type: 'code', language: 'json', code: jsonSampleInput },
          {
            type: 'paragraph',
            text: 'From the values, matching TypeScript types can be inferred. Nested objects become their own interfaces and arrays infer their element type:',
          },
          { type: 'code', language: 'typescript', code: tsInterfaceOutput },
          { type: 'heading', level: 2, text: 'How are the types inferred?' },
          {
            type: 'list',
            items: [
              'string → string, number → number, boolean → boolean.',
              'object → its own interface, named after the field (e.g. owner → Owner).',
              'array → element type with [], e.g. an array of strings is string[].',
              'null → null (a lone null value cannot reveal the real type; add it manually).',
              'A field that has different types across objects → a union type (e.g. string | number).',
            ],
          },
          { type: 'heading', level: 2, text: 'Edge cases to watch for' },
          {
            type: 'heading',
            level: 3,
            text: '1. Optional fields',
          },
          {
            type: 'paragraph',
            text: 'A single JSON sample cannot tell the tool which fields might be missing. If a field is sometimes returned and sometimes not, mark it optional by hand (add ? after the name). Using samples that cover more cases, or merging several samples, reduces these misses.',
          },
          {
            type: 'heading',
            level: 3,
            text: '2. null vs the real type',
          },
          {
            type: 'paragraph',
            text: 'A field like lastLogin: null can only be inferred as null. In reality it is usually string | null or number | null. Generate from a sample where the field has a value, or switch it to a union type by hand, to match the real API.',
          },
          {
            type: 'heading',
            level: 3,
            text: '3. Empty and mixed arrays',
          },
          {
            type: 'paragraph',
            text: 'An empty array [] gives no element type and usually degrades to unknown[] or any[]. A mixed array such as [1, "a"] becomes (number | string)[]. The richer the sample elements, the more accurate the result.',
          },
          { type: 'heading', level: 2, text: 'Practical tips when generating types' },
          {
            type: 'table',
            headers: ['Situation', 'Recommended approach'],
            rows: [
              ['Field may be missing', 'Add ? to mark it optional, or merge multiple samples'],
              ['Field value is null', 'Change to T | null (e.g. string | null)'],
              ['Array is empty', 'Specify the element type by hand to avoid any[]'],
              ['Enum-like strings', 'Use a literal union where useful (e.g. "draft" | "published")'],
              ['Sample is invalid', 'Validate with a JSON formatter first, then generate'],
            ],
          },
          { type: 'heading', level: 2, text: 'Generated locally, your API data is never uploaded' },
          {
            type: 'paragraph',
            text: 'API responses often carry tokens, emails and user IDs, so pasting them into a tool that uploads your data is risky. ToolGarden\'s JSON → TypeScript tool infers everything locally in your browser, so the sample never leaves your device — safe to run on a real response.',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz JSON → TypeScript',
            text: 'Paste a JSON sample to generate a TypeScript interface entirely in your browser. Copy the result, then follow the tips above to add optional fields and real null types by hand.',
            href: '/json-to-ts',
            linkLabel: 'Open the JSON → TypeScript tool',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Generating a TypeScript interface from JSON saves a lot of hand-typing and cuts down on mistakes. What still needs your attention is what a sample cannot cover: optional fields, the real type behind null, and empty arrays. Fill those in and the generated types are ready to trust in your project.',
          },
        ],
        faq: [
          {
            question: 'Does JSON-to-TypeScript upload my API data?',
            answer: 'No. ToolGarden\'s JSON → TypeScript tool infers types locally in your browser, so the JSON sample you paste is never uploaded to any server or logged. Because API responses often include tokens, emails and user IDs, generating types locally keeps those sensitive fields off external services. The resulting interface is shown right on the page for you to copy.',
          },
          {
            question: 'Why is a generated field typed as any or unknown?',
            answer: 'This usually happens in two cases: the value is an empty array [], so no element type can be inferred, or the value is null, so it is impossible to tell whether it should be string, number or something else. The fix is to generate from a sample where the field has a real value, or to change it by hand afterwards to an explicit type such as string[] or string | null.',
          },
          {
            question: 'How do I handle fields that are only sometimes returned?',
            answer: 'A single JSON sample cannot express that a field might be absent, so by default every generated field is required. If you know some fields are optional, add ? after the field name after generating to mark them optional. A more robust approach is to collect several samples covering different cases, or account for the typical missing fields before generating, which reduces later manual edits.',
          },
        ],
      },
    },
  },
];
