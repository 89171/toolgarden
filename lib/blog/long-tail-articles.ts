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
  {
    slug: 'password-protect-pdf-without-upload',
    publishedAt: '2026-07-27',
    updatedAt: '2026-07-27',
    translations: {
      zh: {
        title: '如何给 PDF 加密码保护（不上传文件）',
        excerpt: '给合同、证件、财务报表这类 PDF 加密码时，把文件传到陌生服务器并不安全。在浏览器本地就能完成加密和解密，文件始终留在你的电脑上。',
        metaTitle: 'PDF 加密码保护：浏览器本地加密，不上传文件',
        metaDescription: '介绍如何在浏览器本地给 PDF 设置打开密码、移除已有密码，以及限制打印和复制权限，全程不上传文件，适合处理合同、证件和财务等敏感文档。',
        readingTime: '约 5 分钟阅读',
        tags: ['PDF', '加密', '密码保护', '隐私', '文档安全'],
        relatedTools: [
          {
            label: 'PDF 加密 / 解密',
            href: '/pdf/encrypt',
            description: '在浏览器本地为 PDF 设置或移除打开密码，并可限制打印、复制等权限。',
          },
          {
            label: 'PDF 加水印',
            href: '/pdf/watermark',
            description: '给整份 PDF 加上文字水印，配合密码进一步标记文档归属。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '合同、身份证件、银行流水、工资单——这些最需要加密码的 PDF，恰恰也是最不该随便上传到陌生服务器的文件。',
          },
          {
            type: 'paragraph',
            text: '很多“在线加密 PDF”的网站会先把你的文件上传到服务器再处理。文件是否被留存、多久删除、谁能访问，你都无从得知。好在给 PDF 加密码这件事，完全可以在浏览器本地完成，文件根本不需要离开你的电脑。',
          },
          { type: 'heading', level: 2, text: '为什么“不上传”很重要？' },
          {
            type: 'list',
            items: [
              '敏感内容一旦上传，就脱离了你的控制，即使承诺“稍后删除”也难以验证。',
              '传输和存储环节都可能成为泄露点，尤其是免费服务。',
              '本地处理没有上传，也就没有服务器留存，隐私风险从源头被消除。',
              '断网也能用：文件在浏览器里加密，不依赖网络连接。',
            ],
          },
          { type: 'heading', level: 2, text: '给 PDF 设置打开密码' },
          {
            type: 'paragraph',
            text: '设置打开密码后，别人必须输入正确密码才能打开这份 PDF。基本步骤很简单：',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '打开 PDF 加密工具，选择本地的 PDF 文件。',
              '输入你想设置的打开密码，并牢记它。',
              '生成并下载加密后的 PDF——整个过程都在浏览器本地完成。',
            ],
          },
          {
            type: 'paragraph',
            text: '注意：打开密码一旦丢失，没有任何“找回”入口，因为工具不会保存你的密码。请用密码管理器妥善保存。',
          },
          { type: 'heading', level: 2, text: '移除 PDF 的已有密码' },
          {
            type: 'paragraph',
            text: '如果你有一份自己设了密码、但已经不需要保护的 PDF，也可以移除密码。前提是你必须知道正确的原密码：工具会先用它验证，通过后才生成一份去掉密码的 PDF。这一点很重要——它意味着解密功能不能用来破解别人加密的文件。',
          },
          { type: 'heading', level: 2, text: '不只是打开密码：限制权限' },
          {
            type: 'paragraph',
            text: '除了“能不能打开”，PDF 加密还能控制“打开之后能做什么”。',
          },
          {
            type: 'table',
            headers: ['保护方式', '作用', '适合场景'],
            rows: [
              ['打开密码', '没有密码无法打开文件', '合同、证件、私密资料'],
              ['权限限制', '可打开，但限制打印、复制等操作', '对外分发但不希望被二次利用的文档'],
              ['加水印（配合）', '标记归属和用途，威慑截图转发', '带“机密”“仅供内部”标识的文件'],
            ],
          },
          {
            type: 'paragraph',
            text: '需要说明的是，权限限制依赖阅读器遵守规则，安全强度不如打开密码。真正需要严格保密的内容，应以打开密码为主。',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz PDF 加密 / 解密',
            text: '在浏览器本地给 PDF 设置或移除打开密码，并可限制打印和复制权限。文件不会上传到服务器，合同、证件等敏感文档也能放心处理。',
            href: '/pdf/encrypt',
            linkLabel: '打开 PDF 加密工具',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '给 PDF 加密码，目的是保护隐私；而把文件上传到陌生服务器，本身就是在制造隐私风险。选择在浏览器本地完成加密和解密，文件始终留在你手里，才真正对得上“保护”这个词。记得设置足够强的密码，并用密码管理器保存好。',
          },
        ],
        faq: [
          {
            question: '在浏览器本地加密 PDF，安全吗？',
            answer: '安全，而且通常比上传到服务器的在线工具更私密。ToolGarden 的 PDF 加密工具在浏览器本地完成加密和解密，文件不会上传，也不会在任何服务器上留存。加密使用的是 PDF 标准的密码保护机制，别人没有正确密码就无法打开文件。真正的安全强度取决于你设置的密码：越长、越随机的密码越难被暴力破解，建议至少使用大小写字母、数字和符号组合，并通过密码管理器保存。',
          },
          {
            question: '忘记了 PDF 密码还能打开吗？',
            answer: '不能，工具不会保存你设置的任何密码，也没有“找回密码”的入口。这正是密码保护有效的原因——如果谁都能绕过密码，那加密就失去了意义。移除密码功能同样要求你先输入正确的原密码，验证通过后才会生成去密码版本，因此它不能用来打开别人加密的文件。为避免锁死自己的文档，请务必在加密前把密码记录到密码管理器中。',
          },
          {
            question: '打开密码和权限限制有什么区别？',
            answer: '打开密码控制“能不能打开”这份 PDF：没有正确密码，文件根本无法查看，保护强度最高。权限限制控制“打开之后能做什么”，比如禁止打印或复制文本，但文件本身是可以打开的，且这类限制依赖阅读器主动遵守，安全性相对较弱。如果内容高度敏感，应以打开密码为主；如果只是希望文档被查看但不被随意打印、复制，可以叠加权限限制，必要时再加水印标记归属。',
          },
        ],
      },
      en: {
        title: 'How to Password-Protect a PDF Without Uploading It',
        excerpt: 'The PDFs that most need a password — contracts, IDs, financial statements — are the ones you should least upload to an unknown server. Encrypt and decrypt them locally so the file never leaves your computer.',
        metaTitle: 'Password-Protect a PDF Without Upload: Encrypt Locally in the Browser',
        metaDescription: 'Learn how to set an open password on a PDF, remove an existing one, and restrict printing and copying — all locally in your browser with no upload, ideal for contracts, IDs and financial documents.',
        readingTime: '5 min read',
        tags: ['PDF', 'encryption', 'password protection', 'privacy', 'document security'],
        relatedTools: [
          {
            label: 'PDF Encrypt / Decrypt',
            href: '/pdf/encrypt',
            description: 'Set or remove a PDF open password locally in your browser, and restrict printing and copying.',
          },
          {
            label: 'PDF Watermark',
            href: '/pdf/watermark',
            description: 'Add a text watermark across a whole PDF to mark ownership alongside a password.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Contracts, ID scans, bank statements, payslips — the PDFs that most need a password are exactly the ones you should not casually upload to an unknown server.',
          },
          {
            type: 'paragraph',
            text: 'Many "encrypt PDF online" sites upload your file to a server before processing it. Whether it is retained, how long before deletion, and who can access it are all out of your hands. Fortunately, password-protecting a PDF can be done entirely in your browser, so the file never needs to leave your computer.',
          },
          { type: 'heading', level: 2, text: 'Why does "no upload" matter?' },
          {
            type: 'list',
            items: [
              'Once sensitive content is uploaded it is out of your control, and "we delete it later" is hard to verify.',
              'Both transfer and storage are potential leak points, especially with free services.',
              'Local processing means no upload and no server-side copy, removing the privacy risk at the source.',
              'It works offline: the file is encrypted in the browser without any network connection.',
            ],
          },
          { type: 'heading', level: 2, text: 'Setting an open password' },
          {
            type: 'paragraph',
            text: 'With an open password, others must enter the correct password to open the PDF at all. The basic steps are simple:',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open the PDF encrypt tool and select a local PDF file.',
              'Enter the open password you want to set, and remember it.',
              'Generate and download the encrypted PDF — the whole process runs locally in your browser.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Note: if the open password is lost there is no "recover" option, because the tool never stores your password. Keep it safe in a password manager.',
          },
          { type: 'heading', level: 2, text: 'Removing an existing password' },
          {
            type: 'paragraph',
            text: 'If you have a PDF you protected yourself but no longer need to lock, you can remove the password — provided you know the correct original password. The tool verifies it first and only then produces a password-free PDF. This matters: it means the decrypt feature cannot be used to crack someone else\'s protected file.',
          },
          { type: 'heading', level: 2, text: 'Beyond the open password: permissions' },
          {
            type: 'paragraph',
            text: 'Beyond "can it be opened", PDF encryption can also control "what you can do once it is open".',
          },
          {
            type: 'table',
            headers: ['Protection', 'Effect', 'Best for'],
            rows: [
              ['Open password', 'The file cannot be opened without the password', 'Contracts, IDs, private material'],
              ['Permission limits', 'Opens, but printing/copying is restricted', 'Documents shared but not meant to be reused'],
              ['Watermark (paired)', 'Marks ownership and use, deterring reshares', 'Files tagged "confidential" or "internal only"'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Keep in mind that permission limits rely on the reader honoring them, so they are weaker than an open password. For content that truly must stay private, rely on an open password first.',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz PDF Encrypt / Decrypt',
            text: 'Set or remove a PDF open password locally in your browser and restrict printing and copying. Files are never uploaded, so contracts and IDs stay private.',
            href: '/pdf/encrypt',
            linkLabel: 'Open the PDF encrypt tool',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Password-protecting a PDF is about protecting privacy — yet uploading the file to an unknown server creates a privacy risk of its own. Encrypting and decrypting locally in the browser keeps the file in your hands, which is what "protection" should mean. Use a strong password and store it in a password manager.',
          },
        ],
        faq: [
          {
            question: 'Is encrypting a PDF locally in the browser safe?',
            answer: 'Yes, and it is usually more private than an online tool that uploads your file. ToolGarden\'s PDF encrypt tool performs encryption and decryption locally in your browser, so the file is never uploaded or kept on any server. It uses the PDF standard\'s built-in password protection, so anyone without the correct password cannot open the file. The real strength depends on the password you choose: longer, more random passwords are far harder to brute-force, so use a mix of upper- and lower-case letters, numbers and symbols and store it in a password manager.',
          },
          {
            question: 'Can I still open a PDF if I forget its password?',
            answer: 'No. The tool never stores any password you set, and there is no "recover password" option. That is precisely why password protection works — if anyone could bypass it, encryption would be meaningless. The remove-password feature also requires you to enter the correct original password first and only then produces an unprotected version, so it cannot be used to open someone else\'s encrypted file. To avoid locking yourself out, always record the password in a password manager before encrypting.',
          },
          {
            question: 'What is the difference between an open password and permission limits?',
            answer: 'An open password controls whether the PDF can be opened at all: without the correct password the file cannot be viewed, which is the strongest protection. Permission limits control what you can do once it is open — for example blocking printing or text copying — but the file itself can still be opened, and these limits rely on the reader choosing to honor them, so they are weaker. For highly sensitive content, rely on an open password; if you simply want a document viewable but not freely printed or copied, add permission limits and, if needed, a watermark to mark ownership.',
          },
        ],
      },
    },
  },
];
