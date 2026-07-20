import type {
  BlogArticle,
  BlogArticleTranslation,
  BlogBlock,
  BlogFaqItem,
} from './articles';

interface ArticleSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
}

interface ArticleCopy {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  tags: string[];
  relatedTools: BlogArticleTranslation['relatedTools'];
  lead: string;
  intro: string;
  sections: ArticleSection[];
  conclusion: string;
  callout?: Extract<BlogBlock, { type: 'callout' }>;
  faq: BlogFaqItem[];
}

function buildTranslation(copy: ArticleCopy): BlogArticleTranslation {
  const blocks: BlogBlock[] = [
    { type: 'lead', text: copy.lead },
    { type: 'paragraph', text: copy.intro },
  ];

  for (const section of copy.sections) {
    blocks.push({ type: 'heading', level: 2, text: section.heading });
    blocks.push(...section.paragraphs.map((text): BlogBlock => ({ type: 'paragraph', text })));
    if (section.items?.length) blocks.push({ type: 'list', items: section.items });
  }

  if (copy.callout) blocks.push(copy.callout);
  blocks.push(
    { type: 'heading', level: 2, text: copy.title.includes('Guide') || copy.title.includes('指南') ? 'Key takeaways' : 'Summary' },
    { type: 'paragraph', text: copy.conclusion }
  );

  if (/[一-鿿]/u.test(copy.title)) {
    blocks[blocks.length - 2] = { type: 'heading', level: 2, text: '总结' };
  }

  return {
    title: copy.title,
    excerpt: copy.excerpt,
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    readingTime: copy.readingTime,
    tags: copy.tags,
    relatedTools: copy.relatedTools,
    blocks,
    faq: copy.faq,
  };
}

function article(
  slug: string,
  en: ArticleCopy,
  zh: ArticleCopy,
  publishedAt = '2026-07-20'
): BlogArticle {
  return {
    slug,
    publishedAt,
    updatedAt: publishedAt,
    translations: {
      en: buildTranslation(en),
      zh: buildTranslation(zh),
    },
  };
}

const jsonFormatterEn = {
  label: 'JSON Formatter',
  href: '/json-format',
  description: 'Format, minify, and validate JSON, JSONC, and JSON5 locally in your browser.',
};

const jsonFormatterZh = {
  label: 'JSON 格式化',
  href: '/json-format',
  description: '在浏览器本地格式化、压缩和验证 JSON、JSONC 与 JSON5。',
};

const imageToolsEn = {
  label: 'Local image tools',
  href: '/image',
  description: 'Resize, compress, convert, and edit images without sending source files to a processing API.',
};

const imageToolsZh = {
  label: '本地图片工具',
  href: '/image',
  description: '无需把源文件发送到处理接口，即可调整尺寸、压缩、转换和编辑图片。',
};

const pdfToolsEn = {
  label: 'Local PDF tools',
  href: '/pdf',
  description: 'Merge, split, organize, and extract content from PDFs in a browser-local workflow.',
};

const pdfToolsZh = {
  label: '本地 PDF 工具',
  href: '/pdf',
  description: '在浏览器本地合并、拆分、整理 PDF，并提取其中的内容。',
};

export const topicClusterBlogArticles: BlogArticle[] = [
  article(
    'complete-guide-browser-local-data-processing',
    {
      title: 'The Complete Guide to Browser-Local Data Processing',
      excerpt: 'Learn how browser-local tools process JSON, images, PDFs, and other files on your device, where the privacy benefits come from, and what limits still matter.',
      metaTitle: 'Browser-Local Data Processing: The Complete Guide',
      metaDescription: 'A practical guide to browser local processing, including no-upload architecture, privacy benefits, offline behavior, security limits, and how to verify a client-side tool.',
      readingTime: '10 min read',
      tags: ['browser local processing', 'privacy-first tools', 'no upload', 'client-side'],
      relatedTools: [jsonFormatterEn, imageToolsEn, pdfToolsEn],
      lead: 'Browser-local data processing means the useful work happens on your device after the application code loads. A file picker can read a PDF, Canvas can transform an image, and JavaScript or WebAssembly can parse data without sending the source material to a processing server.',
      intro: 'This model is valuable because it changes the data path. Traditional online converters normally upload input, process it remotely, and return a download. A local-first tool can serve the application as static assets, then keep the working data inside the browser tab. That reduces exposure, enables useful offline behavior, and gives teams a simpler privacy story, but it does not remove every security concern.',
      sections: [
        {
          heading: 'What browser-local processing actually means',
          paragraphs: [
            'A browser-local application can use File and Blob objects, Web Workers, Canvas, Web Crypto, IndexedDB, JavaScript libraries, WebAssembly, and on-device models. These capabilities cover a surprising range of work, from formatting JSON to merging PDFs or compressing batches of images.',
            'The important distinction is not whether the page is online. The page can be delivered from a website and still process input locally. The test is whether the selected file or pasted text is included in a network request after the tool begins its work.',
          ],
        },
        {
          heading: 'Why the architecture improves privacy',
          paragraphs: [
            'When input does not leave the device, it is less likely to appear in server logs, upload buckets, background queues, observability tools, support snapshots, or third-party processing services. This matters for API samples, internal screenshots, draft contracts, identity documents, access tokens, and customer exports.',
          ],
          items: [
            'Data minimization is built into the data flow instead of depending only on a retention promise.',
            'There is no upload wait for ordinary files, so local workflows often feel faster.',
            'Static delivery reduces the number of systems that need access to user content.',
            'Some tools remain usable after their code and supporting assets have been cached.',
          ],
        },
        {
          heading: 'How to verify a no-upload claim',
          paragraphs: [
            'A privacy badge is not evidence by itself. Open the browser developer tools, select the Network panel, clear earlier requests, and perform the conversion with a harmless sample. Look for POST, PUT, WebSocket, or large request bodies. Model and WebAssembly downloads can be legitimate, but the input file should not be attached to them.',
            'Also check the product documentation for explicit exceptions. Analytics may record page views while tool input remains local. A responsible product should distinguish those two facts clearly.',
          ],
        },
        {
          heading: 'Why browser-local processing is becoming the future of everyday web tools',
          paragraphs: [
            'Browsers now provide enough storage, cryptography, media, worker, and WebAssembly capabilities for many tasks that once required an upload API. At the same time, users and organizations increasingly want faster feedback, fewer data copies, and clearer boundaries around confidential material. Those forces make local processing a practical default for a growing class of utilities rather than a niche privacy feature.',
            'The likely future is hybrid, not absolute. Lightweight and privacy-sensitive operations can stay on the device, while large, collaborative, or specialized workloads use an explicit server path. Good products make that boundary visible and let the user understand when data leaves the browser.',
          ],
        },
        {
          heading: 'Security and performance limits',
          paragraphs: [
            'Local processing reduces one exposure path, but the application code still needs to be trusted. Use the correct HTTPS origin, keep the browser updated, avoid unknown extensions, and follow organizational policy for highly sensitive data. A compromised page can still read data that a user deliberately opens in it.',
            'Browsers also have memory and CPU limits. Multi-gigabyte files, complex Office layout, large AI models, and long batch jobs may be better suited to audited desktop software or a controlled backend. Good local tools disclose these boundaries instead of claiming that every workload belongs in a tab.',
          ],
        },
        {
          heading: 'A practical selection checklist',
          paragraphs: ['Choose a browser-local tool based on observable behavior and workflow fit, not just marketing copy.'],
          items: [
            'Confirm that input processing works without an upload request.',
            'Check whether the output format preserves the details you need.',
            'Review file-size and browser compatibility limits before a large batch.',
            'Use sample data first when evaluating an unfamiliar tool.',
            'Keep an original copy and inspect the exported result before deleting anything.',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: 'Try a browser-local workflow',
        text: 'Paste a JSON sample into ToolGarden JSON Formatter and inspect the result with the Network panel open. Formatting and validation happen inside the tab.',
        href: '/json-format',
        linkLabel: 'Open JSON Formatter',
      },
      conclusion: 'Browser local processing is a concrete architecture, not a synonym for a privacy policy. It works best when the input stays on the device, the tool explains any network activity, the user can verify the claim, and the workload fits within browser limits. The cluster guides below cover privacy, offline JSON editing, converter risks, and GDPR considerations in more detail.',
      faq: [
        { question: 'Does browser-local mean the website works completely offline?', answer: 'Not always. The application, fonts, libraries, WebAssembly modules, or local AI models may need to be downloaded first. Once required assets are cached, some workflows can continue offline, but this depends on the site and browser.' },
        { question: 'Can a browser-local tool still use analytics?', answer: 'Yes. Page analytics and input processing are separate data flows. A site can record a page view without uploading the text or file used in a tool. The privacy notice should explain what analytics collects.' },
        { question: 'Is browser-local processing safe for confidential data?', answer: 'It reduces upload exposure but does not replace security review. Confirm the domain, HTTPS connection, page behavior, browser integrity, and your organization policy before handling highly confidential material.' },
      ],
    },
    {
      title: '浏览器本地数据处理完整指南',
      excerpt: '了解 JSON、图片、PDF 等文件如何在设备上完成处理，本地方案的隐私收益来自哪里，以及仍需注意哪些安全和性能边界。',
      metaTitle: '浏览器本地数据处理完整指南：无需上传与隐私保护',
      metaDescription: '系统介绍浏览器本地处理的实现方式、无需上传的隐私收益、离线能力、安全边界，以及如何验证一个工具是否真的在客户端运行。',
      readingTime: '约 10 分钟阅读',
      tags: ['浏览器本地处理', '隐私工具', '无需上传', '客户端处理'],
      relatedTools: [jsonFormatterZh, imageToolsZh, pdfToolsZh],
      lead: '浏览器本地数据处理，是指应用代码加载完成后，真正的解析、转换和导出工作在用户设备上执行。文件选择器可以读取 PDF，Canvas 可以转换图片，JavaScript 或 WebAssembly 可以解析数据，而源文件不必发送到处理服务器。',
      intro: '这种模式改变了数据路径。传统在线转换器通常先上传输入，再由远端服务处理并返回下载；本地优先工具则可以只提供静态应用资源，让工作数据留在浏览器标签页中。它能减少暴露面、缩短等待时间并支持一定程度的离线使用，但并不意味着所有安全问题都会自动消失。',
      sections: [
        {
          heading: '浏览器本地处理到底是什么',
          paragraphs: [
            '现代浏览器提供 File、Blob、Web Worker、Canvas、Web Crypto、IndexedDB、WebAssembly 和设备端模型推理等能力。它们足以覆盖很多日常工作，例如格式化 JSON、合并 PDF、批量压缩图片或生成二维码。',
            '判断关键不在于页面是不是从互联网打开，而在于工具开始工作后，用户选择的文件或粘贴的文本是否被放进网络请求。网页可以在线加载，同时把输入完全留在本地。',
          ],
        },
        {
          heading: '为什么这种架构更有利于隐私',
          paragraphs: ['输入不离开设备，就更不容易进入服务器日志、上传存储桶、任务队列、监控平台、客服快照或第三方处理服务。这对接口样本、内部截图、合同草稿、证件材料、访问令牌和客户数据导出尤其重要。'],
          items: [
            '通过数据流直接落实最小化原则，而不是只依赖删除承诺。',
            '普通文件无需等待上传，本地流程通常响应更快。',
            '静态交付减少了需要接触用户内容的系统数量。',
            '应用资源缓存后，部分工具可以在断网时继续使用。',
          ],
        },
        {
          heading: '如何验证“无需上传”',
          paragraphs: [
            '隐私徽章本身不能证明数据没有上传。可以打开浏览器开发者工具的 Network 面板，清空历史请求，再用无敏感信息的样本执行一次转换。重点查看 POST、PUT、WebSocket 或体积异常的请求。模型和 WebAssembly 资源下载可能是正常的，但输入文件不应附在这些请求中。',
            '同时阅读产品说明，确认是否存在明确例外。页面访问统计与工具输入是两条不同的数据流，负责任的产品应该把两者分开说明。',
          ],
        },
        {
          heading: '为什么浏览器本地处理正在成为 Web 工具的发展方向',
          paragraphs: [
            '浏览器已经具备存储、密码学、媒体处理、Worker 和 WebAssembly 等能力，许多过去必须上传接口的任务现在可以直接在设备上完成。同时，用户和组织越来越重视更快反馈、更少数据副本，以及机密材料的清晰边界。本地处理因此正从小众隐私功能变成越来越多日常工具的合理默认值。',
            '未来更可能是混合模式，而不是全部本地或全部云端。轻量和隐私敏感操作留在设备，大型、协作型或专业任务再明确启用服务端路径。可靠产品会让这条边界可见，让用户知道数据何时离开浏览器。',
          ],
        },
        {
          heading: '安全与性能边界',
          paragraphs: [
            '本地处理减少了上传暴露，但页面代码本身仍需要可信。应确认域名和 HTTPS，保持浏览器更新，警惕未知扩展，并对高度敏感数据遵守组织规范。被篡改的页面依然可能读取用户主动打开的内容。',
            '浏览器也有内存和 CPU 上限。超大文件、复杂 Office 排版、大型 AI 模型和长时间批处理，可能更适合经过审计的桌面软件或受控后端。可靠的本地工具会说明这些边界，而不是宣称所有任务都适合在标签页里完成。',
          ],
        },
        {
          heading: '选择本地工具的检查清单',
          paragraphs: ['选择工具时应关注可观察的行为和真实工作流，而不只是营销文案。'],
          items: [
            '确认处理过程中没有上传输入内容。',
            '检查输出格式是否保留所需细节。',
            '大批量处理前了解文件大小和浏览器兼容限制。',
            '评估陌生工具时先使用无敏感信息的样本。',
            '保留原文件，并在删除任何内容前检查导出结果。',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: '体验一次本地处理',
        text: '把一段 JSON 样本粘贴到 ToolGarden JSON 格式化，同时打开 Network 面板观察。格式化与验证都在当前标签页中完成。',
        href: '/json-format',
        linkLabel: '打开 JSON 格式化',
      },
      conclusion: '浏览器本地处理是一种可验证的架构，而不只是隐私政策中的一句话。理想状态是输入留在设备上、工具解释网络活动、用户可以验证声明，并且任务规模适合浏览器。下方集群文章会继续介绍本地处理的隐私意义、离线 JSON 编辑、在线转换器风险和 GDPR 相关考虑。',
      faq: [
        { question: '浏览器本地是否等于网站可以完全离线？', answer: '不一定。应用代码、字体、库、WebAssembly 模块或本地 AI 模型可能需要先下载。所需资源缓存后，部分流程可以离线继续，但具体取决于站点和浏览器。' },
        { question: '本地处理工具还能使用访问统计吗？', answer: '可以。页面访问统计与输入处理是不同的数据流。站点可以记录一次页面访问，同时不上传工具中的文本或文件，但隐私说明应明确统计会收集什么。' },
        { question: '浏览器本地处理适合机密数据吗？', answer: '它能减少上传风险，但不能替代安全审查。处理高度机密材料前，仍需确认域名、HTTPS、页面行为、浏览器环境和组织安全规范。' },
      ],
    }
  ),
  article(
    'why-browser-local-processing-matters-for-privacy',
    {
      title: 'Why Browser-Local Processing Matters for Privacy',
      excerpt: 'Local processing removes an avoidable data transfer from everyday tool workflows and makes privacy claims easier to inspect.',
      metaTitle: 'Why Browser-Local Processing Matters for Privacy',
      metaDescription: 'Understand how browser local processing reduces data exposure, supports data minimization, and differs from privacy promises made by upload-based online tools.',
      readingTime: '7 min read',
      tags: ['browser local processing', 'privacy', 'data minimization', 'no upload'],
      relatedTools: [jsonFormatterEn, imageToolsEn],
      lead: 'Every time a tool uploads a document, screenshot, or JSON sample, another system gains an opportunity to copy, log, cache, or expose it. Browser-local processing removes that transfer for tasks the browser can complete by itself.',
      intro: 'The benefit is not that browsers are magically secure. The benefit is narrower and more useful: fewer systems receive the data. That makes data minimization easier to enforce and reduces the number of retention, access-control, and breach scenarios a user must evaluate.',
      sections: [
        { heading: 'Upload creates more copies and responsibilities', paragraphs: ['A remote converter may touch a load balancer, application server, object store, task queue, logging platform, antivirus scanner, support tool, and backup system. Even short retention can create several copies. Users rarely have enough visibility to verify when every copy disappears.'] },
        { heading: 'Local processing changes the trust boundary', paragraphs: ['With a local-first tool, the website still supplies code, but the working file can remain inside the browser process. The user mainly needs to trust the delivered application and their device, rather than a larger processing and storage chain. This is a meaningful reduction in exposure, especially for quick one-off tasks.'] },
        { heading: 'Data minimization becomes technical behavior', paragraphs: ['Privacy policies often promise that data is deleted quickly. A no-upload workflow can go further by avoiding collection in the first place. This aligns with the practical idea of data minimization: do not receive content that is unnecessary for providing the feature.'], items: ['Less content available to server logs and support systems.', 'Fewer subprocessors that need access to user files.', 'Smaller incident scope if the website backend is breached.', 'Clearer explanations for users and compliance reviewers.'] },
        { heading: 'What local processing does not solve', paragraphs: ['A malicious page, compromised dependency, unsafe browser extension, or infected device can still expose selected content. Local tools should use HTTPS, restrict network connections, minimize dependencies, and explain when additional assets are downloaded. Users should verify unfamiliar sites with harmless samples first.'] },
      ],
      callout: { type: 'callout', title: 'Read the complete privacy model', text: 'The pillar guide explains architecture, verification steps, offline behavior, and browser limits.', href: '/blog/complete-guide-browser-local-data-processing', linkLabel: 'Open the complete guide' },
      conclusion: 'Browser-local processing matters because it removes an unnecessary transfer and narrows the trust boundary. It is not a universal security guarantee, but for everyday conversion, formatting, and editing, collecting less data is a strong default.',
      faq: [
        { question: 'Is no-upload processing always more private?', answer: 'It usually reduces server-side exposure, but the page and device still need to be trustworthy. Privacy depends on both the architecture and the integrity of the code running in the browser.' },
        { question: 'How can I check whether a file is uploaded?', answer: 'Use the browser Network panel with a harmless sample. Look for requests sent when processing starts, especially large POST or PUT bodies and WebSocket messages.' },
      ],
    },
    {
      title: '为什么浏览器本地处理对隐私很重要',
      excerpt: '本地处理能从日常工具流程中移除一次不必要的数据传输，也让隐私声明更容易被用户验证。',
      metaTitle: '为什么浏览器本地处理对隐私很重要',
      metaDescription: '了解浏览器本地处理如何减少数据暴露、落实数据最小化，以及它与依赖上传的在线工具隐私承诺有何不同。',
      readingTime: '约 7 分钟阅读',
      tags: ['浏览器本地处理', '隐私', '数据最小化', '无需上传'],
      relatedTools: [jsonFormatterZh, imageToolsZh],
      lead: '每当工具上传文档、截图或 JSON 样本，就会多一个系统有机会复制、记录、缓存或暴露这些内容。对于浏览器可以独立完成的任务，本地处理能直接移除这次传输。',
      intro: '优势并不是浏览器天然绝对安全，而是更具体的一点：接收数据的系统更少。这样更容易落实数据最小化，也减少了用户需要评估的保留策略、访问控制和泄露场景。',
      sections: [
        { heading: '上传会增加副本和责任', paragraphs: ['远端转换器可能经过负载均衡、应用服务器、对象存储、任务队列、日志平台、病毒扫描、客服工具和备份系统。即使保留时间很短，也可能产生多个副本，而用户通常无法验证每一份副本何时真正消失。'] },
        { heading: '本地处理改变信任边界', paragraphs: ['本地优先工具仍由网站提供代码，但工作文件可以留在浏览器进程中。用户主要需要信任页面代码和自己的设备，而不是一条更长的处理与存储链。对一次性的临时任务来说，这种暴露面缩减很有价值。'] },
        { heading: '数据最小化变成技术行为', paragraphs: ['隐私政策常承诺快速删除数据，而无需上传的流程可以更进一步，从一开始就不收集。它符合数据最小化的实际含义：提供功能不需要的内容，就不要接收。'], items: ['减少服务器日志和客服系统能接触的内容。', '减少需要访问用户文件的第三方处理方。', '后端发生安全事件时缩小可能影响的内容范围。', '让用户和合规评估人员更容易理解数据路径。'] },
        { heading: '本地处理没有解决什么', paragraphs: ['恶意页面、被入侵的依赖、不安全的浏览器扩展或受感染设备仍可能暴露用户选择的内容。本地工具应使用 HTTPS、限制网络连接、减少依赖，并解释额外资源下载。用户评估陌生站点时也应先使用无敏感信息的样本。'] },
      ],
      callout: { type: 'callout', title: '阅读完整隐私模型', text: '支柱指南详细介绍架构、验证步骤、离线行为和浏览器限制。', href: '/blog/complete-guide-browser-local-data-processing', linkLabel: '打开完整指南' },
      conclusion: '浏览器本地处理的价值，在于移除不必要的数据传输并缩小信任边界。它不是万能安全承诺，但对日常转换、格式化和编辑来说，少收集数据是一个更稳妥的默认选择。',
      faq: [
        { question: '无需上传一定更保护隐私吗？', answer: '它通常能减少服务端暴露，但页面和设备本身仍需可信。隐私既取决于架构，也取决于浏览器中实际运行代码的完整性。' },
        { question: '如何确认文件是否被上传？', answer: '可以用无敏感信息的样本配合浏览器 Network 面板检查。重点观察处理开始时出现的请求，特别是较大的 POST、PUT 请求体和 WebSocket 消息。' },
      ],
    }
  ),
  article(
    'edit-json-without-uploading-to-server',
    {
      title: 'How to Edit Sensitive JSON Data Without Uploading to a Server',
      excerpt: 'Use an offline JSON editor to format, validate, redact, and inspect sensitive API samples or configuration files without sending them to a backend.',
      metaTitle: 'Edit Sensitive JSON Without Uploading | Offline JSON Editor',
      metaDescription: 'Edit sensitive JSON without uploading it. Learn a browser-local workflow for redacting secrets, formatting, validating, repairing, and inspecting JSON safely.',
      readingTime: '8 min read',
      tags: ['offline JSON editor', 'JSON formatter', 'no upload', 'developer privacy'],
      relatedTools: [jsonFormatterEn, { label: 'JSON Repair', href: '/json-repair', description: 'Repair comments, trailing commas, single quotes, and other common JSON syntax issues locally.' }],
      lead: 'JSON often contains more than test data. API responses can include customer identifiers, logs can contain internal URLs, and configuration files can expose credentials. An offline JSON editor keeps that material out of a remote processing pipeline.',
      intro: 'You do not necessarily need a desktop application. A browser tool can load once, parse and transform JSON inside the tab, and continue working without sending the document to a server. The safest workflow combines local processing with a few simple checks.',
      sections: [
        { heading: 'Choose a local-capable editor', paragraphs: ['Look for a clear statement that parsing happens in the browser, then verify it with the Network panel. A useful editor should support formatting, minifying, syntax validation, tree inspection, and copy or download without requiring an account. Support for JSONC or JSON5 is helpful when working with developer configuration.'] },
        { heading: 'Threat-model the JSON before opening it', paragraphs: ['Sensitive JSON is not limited to obvious password fields. API payloads can contain bearer tokens, signed URLs, session cookies, personal identifiers, internal hostnames, database connection strings, stack traces, and free-text notes. Decide which fields the task actually needs, then replace the rest with consistent synthetic values before editing or sharing.'], items: ['Search recursively for token, secret, authorization, cookie, email, phone, address, host, URL, and connection fields.', 'Replace repeated identifiers consistently so relationships remain useful for debugging.', 'Remove live credentials entirely instead of masking only their first or last characters.', 'Keep the redacted copy separate from the original and compare them before sharing.'] },
        { heading: 'Use a safe editing workflow', paragraphs: ['Start with a copy of the source. Remove secrets that are not required for the task, open the tool from the correct HTTPS domain, clear the Network panel, and then paste or load the JSON. Format it before editing so nesting and missing delimiters are easier to see.'], items: ['Keep the untouched original in a separate file.', 'Format first, then inspect the tree structure.', 'Validate after each meaningful change.', 'Minify only when the receiving system needs compact JSON.', 'Copy the final result into a new file and run one last validation.'] },
        { heading: 'Work offline after the app is loaded', paragraphs: ['If the application and its parser have already loaded, a local editor may continue to work after the network is disconnected. Test this before relying on it during travel or inside a restricted environment. Some sites require a connection for initial assets, service-worker updates, fonts, or optional libraries.'] },
        { heading: 'Understand JSON, JSONC, and JSON5', paragraphs: ['Strict JSON requires double-quoted keys and strings, disallows comments, and rejects trailing commas. JSONC adds comments for configuration files. JSON5 permits additional JavaScript-like syntax. An editor may accept all three, but APIs usually require strict JSON, so export or normalize accordingly.'] },
        { heading: 'Do not paste live secrets unnecessarily', paragraphs: ['Local processing reduces server exposure but does not make secret handling irrelevant. Prefer redacted samples, avoid production tokens, and close the tab when finished. For regulated or highly confidential data, use an approved offline application and follow organization policy.'] },
      ],
      callout: { type: 'callout', title: 'Edit JSON locally', text: 'ToolGarden JSON Formatter supports JSON, JSONC, and JSON5 formatting, validation, minification, and tree inspection in the browser.', href: '/json-format', linkLabel: 'Open the offline JSON editor' },
      conclusion: 'A good offline JSON editor workflow is simple: verify local behavior, keep an original, remove unnecessary secrets, format before editing, validate after changes, and export strict JSON for systems that require it. This gives developers speed without adding an avoidable upload.',
      faq: [
        { question: 'Can a browser JSON editor work without internet?', answer: 'It can if the page and required scripts are already cached and all processing is local. Disconnect the network and test with a harmless sample before depending on offline use.' },
        { question: 'Will an offline JSON editor support comments?', answer: 'Some support JSONC and JSON5, while strict editors do not. Check the accepted input format and normalize the output to strict JSON before sending it to an API.' },
        { question: 'Is it safe to paste an API token into a local editor?', answer: 'Avoid live tokens whenever possible. Local processing removes a server upload, but the page, browser extensions, clipboard, and device still need to be trusted.' },
      ],
    },
    {
      title: '如何在不上传服务器的情况下编辑敏感 JSON 数据',
      excerpt: '使用离线 JSON 编辑器在本地脱敏、格式化、验证、修复和检查接口样本或配置文件。',
      metaTitle: '敏感 JSON 本地编辑：无需上传的离线 JSON 编辑器',
      metaDescription: '学习如何在不上传服务器的情况下编辑敏感 JSON，包括密钥脱敏、本地格式化、验证、修复与树形检查。',
      readingTime: '约 8 分钟阅读',
      tags: ['离线 JSON 编辑器', 'JSON 格式化', '无需上传', '开发者隐私'],
      relatedTools: [jsonFormatterZh, { label: 'JSON 修复', href: '/json-repair', description: '在本地修复注释、尾逗号、单引号等常见 JSON 语法问题。' }],
      lead: 'JSON 中经常不只是测试数据。接口响应可能包含客户标识，日志可能出现内部地址，配置文件也可能暴露凭据。离线 JSON 编辑器可以让这些内容不进入远端处理链。',
      intro: '你不一定需要安装桌面应用。浏览器工具可以在加载后直接在标签页内解析和转换 JSON，不把文档发送到服务器。更稳妥的工作流，还需要配合几个简单检查。',
      sections: [
        { heading: '选择支持本地处理的编辑器', paragraphs: ['先查看工具是否明确说明在浏览器中解析，再用 Network 面板验证。实用的编辑器应支持格式化、压缩、语法验证、树形检查、复制和下载，且无需登录。处理开发配置时，JSONC 和 JSON5 支持也很有帮助。'] },
        { heading: '打开 JSON 前先建立威胁模型', paragraphs: ['敏感 JSON 不只是包含 password 的对象。接口载荷还可能出现 Bearer Token、签名 URL、Session Cookie、个人标识、内部主机名、数据库连接串、堆栈信息和自由文本备注。先判断任务真正需要哪些字段，再把其余内容替换为保持一致关系的合成值。'], items: ['递归搜索 token、secret、authorization、cookie、邮箱、电话、地址、host、URL 和连接字段。', '同一标识符使用同一个合成值替换，保留调试所需关系。', '真实凭据应彻底移除，不要只遮住开头或结尾。', '脱敏副本与原件分开保存，分享前再次对比。'] },
        { heading: '使用安全的编辑流程', paragraphs: ['先复制一份源文件，删除任务不需要的敏感字段，确认打开的是正确 HTTPS 域名，清空 Network 记录，然后再粘贴或加载 JSON。先格式化再编辑，嵌套关系和缺失分隔符会更容易发现。'], items: ['单独保留未经修改的原始文件。', '先格式化，再检查树形结构。', '每次重要修改后重新验证。', '只有接收系统要求紧凑 JSON 时才压缩。', '把最终结果复制到新文件，并再做一次验证。'] },
        { heading: '页面加载后尝试离线工作', paragraphs: ['如果应用和解析器已经加载，本地编辑器可能在断网后继续工作。出行或受限网络环境使用前应提前测试。部分站点首次加载资源、更新 Service Worker、获取字体或可选库时仍需要网络。'] },
        { heading: '区分 JSON、JSONC 和 JSON5', paragraphs: ['严格 JSON 要求 key 和字符串使用双引号，不允许注释，也拒绝尾逗号。JSONC 为配置文件增加注释，JSON5 则允许更多接近 JavaScript 的语法。编辑器可以同时接受三者，但 API 通常只接收严格 JSON，因此导出时要按目标系统规范化。'] },
        { heading: '不要无必要地粘贴真实密钥', paragraphs: ['本地处理能减少服务端暴露，但不代表可以忽略密钥管理。优先使用脱敏样本，避免生产令牌，完成后关闭标签页。对受监管或高度机密数据，应使用组织批准的离线应用并遵循安全规范。'] },
      ],
      callout: { type: 'callout', title: '在本地编辑 JSON', text: 'ToolGarden JSON 格式化支持在浏览器中完成 JSON、JSONC 和 JSON5 的格式化、验证、压缩与树形检查。', href: '/json-format', linkLabel: '打开离线 JSON 编辑器' },
      conclusion: '可靠的离线 JSON 编辑流程包括：验证本地行为、保留原件、移除不必要的敏感字段、格式化后再编辑、修改后验证，并为目标系统导出严格 JSON。这样可以保留在线工具的速度，同时避免一次多余上传。',
      faq: [
        { question: '浏览器 JSON 编辑器可以完全断网使用吗？', answer: '如果页面和所需脚本已经缓存，并且处理完全在本地进行，就有可能。正式依赖离线使用前，建议断开网络并用无敏感信息的样本测试。' },
        { question: '离线 JSON 编辑器支持注释吗？', answer: '部分工具支持 JSONC 和 JSON5，严格编辑器则不支持。应确认输入格式，并在发送给 API 前把结果规范化为严格 JSON。' },
        { question: '可以把 API Token 粘贴到本地编辑器吗？', answer: '应尽量避免使用真实令牌。本地处理移除了服务器上传，但页面、浏览器扩展、剪贴板和设备本身仍需可信。' },
      ],
    }
  ),
  article(
    'privacy-risks-online-file-converters',
    {
      title: '5 Privacy Risks of Online File Converters (And How to Avoid Them)',
      excerpt: 'Before uploading a document or image, understand where copies can be created and use a practical checklist to reduce each privacy risk.',
      metaTitle: '5 Online File Converter Privacy Risks and How to Avoid Them',
      metaDescription: 'Learn five privacy risks of online file converters and how to avoid them with no-upload processing, redaction, retention checks, and safer sharing.',
      readingTime: '8 min read',
      tags: ['secure file converter no upload', 'online converter privacy', 'file security'],
      relatedTools: [imageToolsEn, pdfToolsEn],
      lead: 'Online file converters solve a real problem, but an upload can turn a quick format change into a data-sharing event. The main risks are not always visible in the interface.',
      intro: 'A service may be responsible and well secured, yet remote processing still creates storage, logging, access, and retention questions. Understanding the data path helps you decide whether an upload is reasonable or whether a no-upload converter is the better fit.',
      sections: [
        { heading: '1. Temporary storage can outlive the task', paragraphs: ['Many converters upload files to object storage before a worker processes them. A deletion timer may remove the main object later, but copies can remain in retries, caches, backups, or failed jobs. “Deleted after one hour” is a policy statement unless the architecture and audit controls support it.'] },
        { heading: '2. Logs and diagnostics can capture content', paragraphs: ['Request logs, exception reports, antivirus scans, and support traces may store filenames, metadata, extracted text, or portions of a failed document. These systems are useful for reliability but expand who and what can access uploaded material.'] },
        { heading: '3. Third-party subprocessors add another boundary', paragraphs: ['A converter may rely on cloud OCR, document conversion APIs, content moderation, malware scanning, or AI services. Each subprocessor can introduce a separate region, retention schedule, contract, and incident surface.'] },
        { heading: '4. Links and download tokens can leak', paragraphs: ['Generated files are often retrieved through temporary URLs. Weak tokens, referrer leakage, browser history, shared devices, or copied links can expose output even if the source upload was protected. Sensitive conversions need strict access control at both ends.'] },
        { heading: '5. Business changes can change data use', paragraphs: ['Privacy terms, ownership, vendors, and monetization models can change. A workflow that was acceptable last year may now involve new analytics or AI processing. Recheck services used for recurring sensitive tasks.'] },
        { heading: 'How to avoid each risk before converting', paragraphs: ['Use a short decision sequence before every sensitive conversion: classify the file, remove content the task does not need, prefer a browser-local tool when the format permits it, and evaluate the operator when an upload is unavoidable. After conversion, inspect the output and clean up every temporary copy you control.'], items: ['Storage risk: choose no-upload processing or verify the exact deletion window and backup policy.', 'Logging risk: remove identifying filenames, metadata, and unnecessary text before processing.', 'Subprocessor risk: review the current vendor list and processing regions.', 'Link risk: avoid public URLs, use authenticated downloads, and delete finished jobs.', 'Policy-change risk: re-evaluate recurring vendors instead of relying on an old review.'] },
        { heading: 'How to choose a safer converter', paragraphs: ['Prefer local processing when the browser can handle the format. If remote processing is necessary, review encryption, retention, subprocessors, region, account controls, deletion options, and incident history.'], items: ['Use harmless samples when testing a new service.', 'Remove metadata and secrets before upload.', 'Prefer tools that do not require input collection.', 'Inspect exported files and delete remote jobs when controls exist.', 'Use approved enterprise systems for regulated records.'] },
      ],
      callout: { type: 'callout', title: 'Choose a no-upload workflow', text: 'ToolGarden image and PDF tools process supported workflows in the browser, so source files do not need to be sent to a conversion backend.', href: '/image', linkLabel: 'Browse local tools' },
      conclusion: 'The safest upload is often the one a tool never asks for. Browser-local converters cannot replace every server or desktop workflow, but they remove storage, logging, subprocessor, link, and retention risks for many everyday tasks.',
      faq: [
        { question: 'Are online file converters unsafe?', answer: 'Not automatically. Some are well secured, but any upload adds systems and policies to the data path. The right choice depends on file sensitivity, service controls, and whether local processing can do the job.' },
        { question: 'What does a secure file converter with no upload mean?', answer: 'It means supported conversion work happens on the user device, usually in the browser, and the source file is not sent to a remote processing API.' },
      ],
    },
    {
      title: '在线文件转换器的 5 个隐私风险，以及如何规避',
      excerpt: '上传文档或图片前，了解副本可能出现在哪里，并用一份实用清单逐项降低隐私风险。',
      metaTitle: '在线文件转换器的 5 个隐私风险与规避方法',
      metaDescription: '了解在线文件转换器的五类隐私风险，以及如何通过无需上传、脱敏、保留策略检查和安全分享来规避。',
      readingTime: '约 8 分钟阅读',
      tags: ['无需上传文件转换', '在线转换隐私', '文件安全'],
      relatedTools: [imageToolsZh, pdfToolsZh],
      lead: '在线文件转换器确实方便，但一次上传会把简单的格式转换变成一次数据共享。主要风险往往不会直接显示在操作界面中。',
      intro: '服务商可能认真负责并采用良好安全措施，但远端处理依然带来存储、日志、访问和保留问题。理解完整数据路径，才能判断这次上传是否合理，或者无需上传的转换器是否更适合。',
      sections: [
        { heading: '1. 临时存储可能比任务存在更久', paragraphs: ['许多转换器会先把文件上传到对象存储，再交给任务进程处理。删除计时器可以稍后移除主文件，但重试、缓存、备份或失败任务中仍可能保留副本。“一小时后删除”只有得到架构和审计控制支持时才不只是政策声明。'] },
        { heading: '2. 日志和诊断可能记录内容', paragraphs: ['请求日志、异常报告、病毒扫描和客服追踪可能保存文件名、元数据、提取文本或失败文档片段。这些系统有助于稳定性，却也扩大了能够接触上传材料的系统和人员范围。'] },
        { heading: '3. 第三方处理方增加信任边界', paragraphs: ['转换器可能依赖云端 OCR、文档转换 API、内容审核、恶意软件扫描或 AI 服务。每个第三方都可能引入不同的数据区域、保留计划、合同和安全事件表面。'] },
        { heading: '4. 下载链接和令牌可能泄露', paragraphs: ['转换结果常通过临时 URL 下载。令牌强度不足、Referrer 泄露、浏览器历史、共享设备或被复制的链接，都可能让输出文件暴露。敏感转换需要同时保护输入和输出。'] },
        { heading: '5. 商业变化可能改变数据用途', paragraphs: ['隐私条款、所有权、供应商和商业模式都会变化。去年可以接受的流程，今年可能已经加入新的统计或 AI 处理。对反复处理敏感文件的服务，应定期重新检查。'] },
        { heading: '转换前如何逐项规避风险', paragraphs: ['每次敏感转换前执行一个简短顺序：先分类文件，删除任务不需要的内容，格式允许时优先浏览器本地工具，必须上传时再评估运营方。完成后检查输出，并清理自己能控制的所有临时副本。'], items: ['存储风险：选择无需上传，或核实准确删除时间和备份策略。', '日志风险：处理前移除可识别文件名、元数据和无关文本。', '第三方风险：检查当前供应商清单和处理区域。', '链接风险：避免公开 URL，使用身份验证下载并删除完成任务。', '政策变化风险：定期重新评估供应商，不依赖旧审查结论。'] },
        { heading: '如何选择更安全的转换器', paragraphs: ['当浏览器能够处理目标格式时，优先选择本地方案。如果必须远端处理，则检查加密、保留、第三方、区域、账号控制、删除能力和历史安全事件。'], items: ['测试新服务时使用无敏感信息的样本。', '上传前移除元数据和密钥。', '优先选择不收集输入也能提供功能的工具。', '检查导出文件，并在有控制项时删除远端任务。', '受监管材料应使用组织批准的企业系统。'] },
      ],
      callout: { type: 'callout', title: '选择无需上传的流程', text: 'ToolGarden 图片和 PDF 工具会在浏览器中完成支持的操作，源文件无需发送到转换后端。', href: '/image', linkLabel: '浏览本地工具' },
      conclusion: '更安全的上传，往往是工具从一开始就不要求的上传。本地转换器不能替代所有服务端或桌面流程，但能为许多日常任务移除存储、日志、第三方、链接和保留风险。',
      faq: [
        { question: '在线文件转换器都不安全吗？', answer: '并不是。有些服务具备良好安全措施，但任何上传都会让数据路径增加系统和政策。应根据文件敏感程度、服务控制能力以及本地处理是否可行来选择。' },
        { question: '无需上传的安全文件转换器是什么意思？', answer: '它表示支持的转换工作在用户设备上完成，通常运行于浏览器中，源文件不会发送到远端处理 API。' },
      ],
    }
  ),
  article(
    'gdpr-compliance-client-side-tools',
    {
      title: 'GDPR Compliance: Why Client-Side Tools Win',
      excerpt: 'Client-side tools can support data minimization and privacy by design by avoiding unnecessary collection, but GDPR compliance still depends on the full processing context.',
      metaTitle: 'GDPR Compliant Tools: Why Client-Side Processing Helps',
      metaDescription: 'Learn why client-side tools support GDPR data minimization and privacy by design, what no-upload processing changes, and what compliance duties still remain.',
      readingTime: '8 min read',
      tags: ['GDPR compliant tools', 'client-side processing', 'data minimization', 'privacy by design'],
      relatedTools: [jsonFormatterEn, pdfToolsEn],
      lead: 'A tool that never receives a user file has fewer personal-data processing activities to explain, secure, retain, and delete. That makes client-side architecture a strong starting point for GDPR-aware workflows.',
      intro: 'Architecture alone does not certify a product as GDPR compliant. Roles, purposes, lawful bases, transparency, security, data-subject rights, analytics, and organizational procedures still matter. Local processing helps because it can remove an unnecessary collection event from the system design.',
      sections: [
        { heading: 'Data minimization starts before collection', paragraphs: ['GDPR data minimization asks organizations to process personal data that is adequate, relevant, and limited to what is necessary. If a formatting or conversion feature can run on the device, the service provider may not need the input at all. Avoiding receipt is often clearer than receiving a file and promising rapid deletion.'] },
        { heading: 'Privacy by design becomes an architectural choice', paragraphs: ['Client-side processing can make privacy the default behavior. The user selects a file, code already delivered to the browser performs the operation, and the result is created locally. This reduces storage, processor access, international transfer, and breach-notification questions related to the tool input.'] },
        { heading: 'Compliance duties that still remain', paragraphs: ['The website may still process IP addresses, cookies, analytics events, feedback messages, account data, or error reports. Those activities need their own purposes and controls. The site must also secure delivered code, document subprocessors, and avoid misleading claims.'], items: ['Explain which data stays local and which telemetry does not.', 'Apply a lawful basis and consent rules where required.', 'Protect the site and software supply chain.', 'Honor rights for any personal data the service actually stores.', 'Maintain records and contracts for real server-side processing.'] },
        { heading: 'When local tools support a DPIA', paragraphs: ['For higher-risk workflows, a data protection impact assessment may compare local, desktop, and server approaches. A no-upload design can reduce likelihood and scope, but reviewers should still consider malicious code, device compromise, browser storage, shared computers, and output handling.'] },
        { heading: 'Avoid absolute compliance claims', paragraphs: ['“GDPR compliant” should not be treated as a universal product badge. Compliance depends on who uses the tool, what data is involved, the purpose, jurisdiction, surrounding systems, and organizational controls. A more precise claim is that local processing supports data minimization and reduces server-side handling of tool input.'] },
      ],
      callout: { type: 'callout', title: 'Review the underlying architecture', text: 'The browser-local processing guide shows how no-upload tools work and how to verify their network behavior.', href: '/blog/complete-guide-browser-local-data-processing', linkLabel: 'Read the architecture guide' },
      conclusion: 'Client-side tools help GDPR programs because they can avoid collecting data that the feature does not need. That is a strong privacy-by-design decision, but compliance still requires honest documentation, secure delivery, appropriate telemetry controls, and an assessment of the complete user workflow.',
      faq: [
        { question: 'Does client-side processing make a tool automatically GDPR compliant?', answer: 'No. It can reduce processing of the tool input, but compliance also depends on analytics, cookies, accounts, support data, security, transparency, legal roles, and how the organization uses the output.' },
        { question: 'Is a no-upload tool a data processor?', answer: 'That depends on the full service. If the provider truly never receives the tool input, it may not process that specific content, but it can still process other personal data such as access logs or account details.' },
      ],
    },
    {
      title: 'GDPR 合规：为什么客户端工具更有优势',
      excerpt: '客户端工具可以通过避免不必要收集来支持数据最小化和隐私设计，但 GDPR 合规仍取决于完整处理场景。',
      metaTitle: 'GDPR 合规工具：客户端处理为什么更有优势',
      metaDescription: '了解客户端工具如何支持 GDPR 数据最小化与隐私设计、无需上传改变了什么，以及仍然存在的合规责任。',
      readingTime: '约 8 分钟阅读',
      tags: ['GDPR 合规工具', '客户端处理', '数据最小化', '隐私设计'],
      relatedTools: [jsonFormatterZh, pdfToolsZh],
      lead: '一个从不接收用户文件的工具，需要解释、保护、保留和删除的个人数据处理活动会更少。因此，客户端架构可以成为重视 GDPR 工作流的良好起点。',
      intro: '架构本身不能自动认证一个产品符合 GDPR。角色、目的、合法基础、透明度、安全、数据主体权利、访问统计和组织流程仍然重要。本地处理的帮助在于，它可以从系统设计中移除一次不必要的数据收集。',
      sections: [
        { heading: '数据最小化从收集之前开始', paragraphs: ['GDPR 的数据最小化要求个人数据与目的相关、必要且范围受限。如果格式化或转换功能能够在设备上运行，服务提供方可能根本不需要接收输入。相比先接收文件再承诺快速删除，从一开始不接收往往更清晰。'] },
        { heading: '隐私设计成为架构选择', paragraphs: ['客户端处理可以让隐私成为默认行为。用户选择文件，已经交付到浏览器的代码执行操作，结果在本地生成。这样会减少与工具输入有关的存储、处理方访问、跨境传输和泄露通知问题。'] },
        { heading: '仍然存在的合规责任', paragraphs: ['网站仍可能处理 IP 地址、Cookie、访问统计、反馈消息、账号数据或错误报告。这些活动需要各自的目的和控制。站点也必须保护交付代码、记录第三方处理方，并避免误导性声明。'], items: ['说明哪些数据留在本地，哪些遥测信息不会。', '在需要时应用合法基础和同意规则。', '保护站点和软件供应链。', '对服务实际存储的个人数据响应相关权利。', '为真实的服务端处理维护记录和合同。'] },
        { heading: '本地工具如何支持 DPIA', paragraphs: ['对于较高风险流程，数据保护影响评估可以比较本地、桌面和服务端方案。无需上传的设计能降低发生概率和影响范围，但评估仍应考虑恶意代码、设备受损、浏览器存储、共享电脑和输出文件处理。'] },
        { heading: '避免绝对化合规声明', paragraphs: ['“符合 GDPR”不应被当作一个通用产品徽章。合规取决于使用者、数据类型、处理目的、司法辖区、周边系统和组织控制。更准确的表述是：本地处理支持数据最小化，并减少服务端对工具输入的处理。'] },
      ],
      callout: { type: 'callout', title: '查看底层架构', text: '浏览器本地处理指南介绍无需上传工具如何运行，以及怎样验证网络行为。', href: '/blog/complete-guide-browser-local-data-processing', linkLabel: '阅读架构指南' },
      conclusion: '客户端工具能够避免收集功能本身不需要的数据，因此有助于 GDPR 项目落实隐私设计。但完整合规仍需要诚实文档、安全交付、适当的遥测控制，并评估用户的完整工作流程。',
      faq: [
        { question: '客户端处理会让工具自动符合 GDPR 吗？', answer: '不会。它可以减少对工具输入的处理，但合规还取决于统计、Cookie、账号、客服数据、安全、透明度、法律角色和组织如何使用输出。' },
        { question: '无需上传的工具属于数据处理者吗？', answer: '要看完整服务。如果提供方确实从不接收工具输入，它可能不处理这部分具体内容，但仍可能处理访问日志或账号资料等其他个人数据。' },
      ],
    }
  ),
  article(
    'json-tools-master-guide',
    {
      title: 'JSON Tools Master Guide',
      excerpt: 'A practical map of JSON formatting, validation, repair, conversion, schema, path queries, diffing, and safe browser-local workflows.',
      metaTitle: 'JSON Tools Master Guide: Format, Validate, Repair, Convert',
      metaDescription: 'Master JSON tools for formatting, validation, repair, schema checks, conversion, JSONPath, diffing, and browser-local editing with practical workflows.',
      readingTime: '11 min read',
      tags: ['JSON tools', 'JSON formatter online', 'JSON validation', 'JSON repair'],
      relatedTools: [jsonFormatterEn, { label: 'JSON Schema Validator', href: '/json-schema-validate', description: 'Validate JSON data against a JSON Schema locally.' }, { label: 'JSON Repair', href: '/json-repair', description: 'Clean JSONC, JSON5, comments, trailing commas, and malformed syntax.' }],
      lead: 'JSON work is rarely just “make this pretty.” Real workflows involve identifying the accepted dialect, finding syntax failures, checking data shape, comparing versions, selecting fields, and converting output without losing meaning.',
      intro: 'The right tool depends on the question. A formatter answers whether text can be parsed and makes structure readable. A schema validator checks whether parsed data matches a contract. A repair tool normalizes loose or broken syntax. Converters, diff tools, and JSONPath solve different steps around the same document.',
      sections: [
        { heading: 'Start by identifying the format', paragraphs: ['Strict JSON follows a narrow grammar: double-quoted strings and keys, no comments, no trailing commas, and a limited number syntax. JSONC adds comments for configuration. JSON5 adds more JavaScript-like syntax. A file can look like JSON and still require a different parser.'] },
        { heading: 'Formatting and syntax validation', paragraphs: ['Formatting parses the input and serializes it with consistent indentation. If parsing fails, the position and nearby token give the first clue. Minification performs the same parse but emits compact output. Neither operation proves that required fields or business rules are correct.'] },
        { heading: 'Repair loose or damaged input', paragraphs: ['Repair is useful for copied object literals, model output, comments, trailing commas, single quotes, and unquoted keys. Apply repair to a copy, review every change, and validate the final strict JSON. Automatic repair should not silently invent missing business values.'] },
        { heading: 'Validate structure with JSON Schema', paragraphs: ['JSON Schema describes allowed types, required properties, nested objects, arrays, enumerations, and many constraints. It is useful at API boundaries, import pipelines, configuration checks, and test fixtures. A valid JSON document can still fail its schema, which is why syntax and contract validation should be separate steps.'] },
        { heading: 'Choose the right transformation tool', paragraphs: ['Conversion tools are useful when another system expects YAML, XML, CSV, Excel, or TypeScript types. JSONPath selects values from a large document. Flattening turns nested paths into keys. Diffing compares two parsed structures so key order and indentation do not hide real changes.'], items: ['Use JSON to CSV only when records have a tabular shape.', 'Generate TypeScript types from representative samples, then review optional and nullable fields.', 'Use JSONPath for repeatable selection instead of manual scrolling.', 'Use structured diff for objects and arrays, not a plain text comparison.', 'Keep the original document before any lossy conversion.'] },
        { heading: 'Build a repeatable debugging sequence', paragraphs: ['When JSON fails, work in layers: preserve the raw input, confirm whether the response is actually JSON, detect the dialect, format or repair syntax, validate the schema, inspect the target path, and only then convert or integrate it. This sequence separates transport, syntax, and data-contract problems.'] },
      ],
      callout: { type: 'callout', title: 'Start with parse and format', text: 'ToolGarden JSON Formatter accepts JSON, JSONC, and JSON5, then provides readable output, validation feedback, minification, and a tree view.', href: '/json-format', linkLabel: 'Open JSON Formatter' },
      conclusion: 'A JSON toolkit is most useful when each tool has a clear job. Formatters handle readability and syntax, repair tools normalize loose input, schema validators enforce contracts, and transformation tools move verified data into the next system. The cluster guides cover JSON variants, browser formatting, and common syntax errors in depth.',
      faq: [
        { question: 'What is the difference between formatting and validating JSON?', answer: 'Formatting proves that input can be parsed and rewrites whitespace. Syntax validation reports grammar errors. Schema validation is a separate step that checks the parsed value against expected types, properties, and rules.' },
        { question: 'Should I automatically repair JSON from an API?', answer: 'Usually no. API responses should be strict JSON. Repair can help diagnose a sample, but production clients should surface invalid responses rather than silently changing server data.' },
        { question: 'Which JSON tool should I use first?', answer: 'Start with a formatter and syntax validator. If parsing fails, determine whether the input is JSONC, JSON5, copied JavaScript, HTML, or truncated data before using repair.' },
      ],
    },
    {
      title: 'JSON 工具大师指南',
      excerpt: '系统掌握 JSON 格式化、验证、修复、转换、Schema、路径查询、差异对比和浏览器本地安全工作流。',
      metaTitle: 'JSON 工具大师指南：格式化、验证、修复与转换',
      metaDescription: '完整介绍 JSON 格式化、验证、修复、Schema、格式转换、JSONPath、差异对比和浏览器本地编辑的实用流程。',
      readingTime: '约 11 分钟阅读',
      tags: ['JSON 工具', 'JSON 在线格式化', 'JSON 验证', 'JSON 修复'],
      relatedTools: [jsonFormatterZh, { label: 'JSON Schema 验证', href: '/json-schema-validate', description: '在本地使用 JSON Schema 验证 JSON 数据。' }, { label: 'JSON 修复', href: '/json-repair', description: '清理 JSONC、JSON5、注释、尾逗号和错误语法。' }],
      lead: 'JSON 工作很少只是“把它排版好看”。真实流程还包括判断输入方言、定位语法失败、检查数据结构、比较版本、选择字段，以及在不丢失含义的前提下转换输出。',
      intro: '不同问题需要不同工具。格式化工具判断文本能否解析并提升可读性；Schema 验证检查解析后的数据是否符合契约；修复工具负责规范化宽松或损坏语法；转换、差异对比和 JSONPath 则解决文档周边的其他步骤。',
      sections: [
        { heading: '先识别输入格式', paragraphs: ['严格 JSON 语法范围很窄：字符串和 key 使用双引号，不允许注释和尾逗号，数字格式也有限制。JSONC 为配置文件增加注释，JSON5 允许更多接近 JavaScript 的语法。一个文件看起来像 JSON，也可能需要不同解析器。'] },
        { heading: '格式化与语法验证', paragraphs: ['格式化会先解析输入，再用统一缩进重新序列化。如果解析失败，错误位置和附近 token 是第一条线索。压缩也会进行同样解析，只是输出更紧凑。两者都不能证明必填字段或业务规则正确。'] },
        { heading: '修复宽松或损坏的输入', paragraphs: ['复制的对象字面量、模型输出、注释、尾逗号、单引号和未加引号 key，都可能需要修复。应在副本上处理、检查每项改动，并验证最终严格 JSON。自动修复不应悄悄创造缺失的业务值。'] },
        { heading: '使用 JSON Schema 验证结构', paragraphs: ['JSON Schema 可以描述允许的类型、必填属性、嵌套对象、数组、枚举和多种约束，适用于 API 边界、导入流程、配置检查和测试数据。语法有效的 JSON 仍可能不符合 Schema，因此两类验证应分开。'] },
        { heading: '选择正确的转换工具', paragraphs: ['当下游系统需要 YAML、XML、CSV、Excel 或 TypeScript 类型时，可以使用转换工具；JSONPath 用于从大型文档选择值；Flatten 把嵌套路径转为 key；结构化 Diff 会比较解析结果，避免 key 顺序和缩进掩盖真实变化。'], items: ['只有记录具备表格形状时才使用 JSON 转 CSV。', '从有代表性的样本生成 TypeScript 类型，并检查可选和 nullable 字段。', '重复选取数据时使用 JSONPath，避免手工滚动。', '对象和数组应使用结构化 Diff，不要只做纯文本比较。', '任何有损转换前都保留原始文档。'] },
        { heading: '建立可重复的调试顺序', paragraphs: ['JSON 失败时应分层处理：保留原始输入，确认响应确实是 JSON，识别方言，格式化或修复语法，验证 Schema，检查目标路径，最后再转换或接入系统。这样可以把传输、语法和数据契约问题分开。'] },
      ],
      callout: { type: 'callout', title: '先从解析和格式化开始', text: 'ToolGarden JSON 格式化接受 JSON、JSONC 和 JSON5，并提供可读输出、验证反馈、压缩与树形视图。', href: '/json-format', linkLabel: '打开 JSON 格式化' },
      conclusion: 'JSON 工具箱真正有用的前提，是每个工具职责清晰。格式化处理可读性和语法，修复工具规范化宽松输入，Schema 验证执行契约，转换工具把已验证数据送入下一系统。下方集群指南会深入介绍 JSON 方言、浏览器格式化和常见语法错误。',
      faq: [
        { question: 'JSON 格式化和验证有什么区别？', answer: '格式化证明输入可以解析，并重写空白。语法验证报告语法错误。Schema 验证是独立步骤，会检查解析值是否符合预期类型、属性和规则。' },
        { question: '应该自动修复 API 返回的 JSON 吗？', answer: '通常不应该。API 应返回严格 JSON。修复可以帮助诊断样本，但生产客户端更适合直接暴露无效响应，而不是悄悄改变服务端数据。' },
        { question: '第一个应该使用哪个 JSON 工具？', answer: '先用格式化和语法验证。如果解析失败，再判断输入是 JSONC、JSON5、复制的 JavaScript、HTML 还是被截断的数据，然后决定是否修复。' },
      ],
    }
  ),
  article(
    'format-and-validate-json-in-browser',
    {
      title: 'How to Format and Validate JSON in Your Browser',
      excerpt: 'Format JSON for readability, identify syntax errors, and verify data contracts in a no-upload browser workflow.',
      metaTitle: 'JSON Formatter Online: Format and Validate in Your Browser',
      metaDescription: 'Use a JSON formatter online to format and validate JSON in your browser, understand syntax errors, and keep sensitive samples off a processing server.',
      readingTime: '7 min read',
      tags: ['JSON formatter online', 'JSON validation', 'browser JSON editor'],
      relatedTools: [jsonFormatterEn, { label: 'JSON Schema Validator', href: '/json-schema-validate', description: 'Check parsed JSON against types, required fields, and constraints.' }],
      lead: 'Formatting and validation are related but different. Formatting makes a parsed document readable. Syntax validation explains why parsing failed. Schema validation checks whether valid JSON contains the structure an application expects.',
      intro: 'A browser-local JSON formatter can perform all three stages without uploading the sample. This is useful for API payloads, configuration fragments, logs, and generated data that may contain internal or personal information.',
      sections: [
        { heading: 'Format the document first', paragraphs: ['Paste the sample, choose a consistent indentation level, and format it. A successful result confirms that the selected parser accepted the input. Readable nesting makes missing values, unexpected arrays, and misplaced fields easier to spot.'] },
        { heading: 'Read syntax errors from the first failure', paragraphs: ['Parsers usually stop near the first impossible token. Check the reported line and column, then inspect the character just before it. Common causes include trailing commas, single quotes, comments, missing closing brackets, unescaped line breaks, and an HTML error page returned instead of JSON.'] },
        { heading: 'Validate the data contract separately', paragraphs: ['After syntax passes, use JSON Schema or application-specific checks for required fields, allowed types, string formats, numeric ranges, and array contents. Formatting cannot tell whether an email field is missing or an ID has the wrong type.'] },
        { heading: 'Protect sensitive samples', paragraphs: ['Prefer a tool that processes input locally, confirm behavior in the Network panel, and remove secrets not needed for debugging. Keep production tokens, passwords, private keys, and full customer exports out of ad hoc tools even when the workflow is local.'] },
        { heading: 'Export for the receiving system', paragraphs: ['Use formatted output for reviews and version control. Use minified output when size matters. If the input was JSONC or JSON5, convert it to strict JSON before sending it to an API unless that API explicitly accepts the relaxed format.'] },
      ],
      callout: { type: 'callout', title: 'Format JSON in the browser', text: 'Format, minify, validate, and inspect JSON, JSONC, or JSON5 without sending the sample to a backend.', href: '/json-format', linkLabel: 'Open JSON Formatter' },
      conclusion: 'A reliable JSON workflow separates readability, syntax, and contract checks. Format first, fix the earliest syntax error, validate the schema, remove unnecessary secrets, and export the dialect expected by the destination.',
      faq: [
        { question: 'Does formatting JSON validate it?', answer: 'Formatting confirms that a parser accepted the syntax. It does not validate required fields or business rules unless a schema or additional checks are applied.' },
        { question: 'Why is valid JSON still rejected by my API?', answer: 'The JSON can be syntactically valid but fail the API contract because a field is missing, has the wrong type, uses an invalid value, or appears at the wrong nesting level.' },
      ],
    },
    {
      title: '如何在浏览器中格式化和验证 JSON',
      excerpt: '通过无需上传的浏览器流程提升 JSON 可读性、定位语法错误，并验证数据契约。',
      metaTitle: 'JSON 在线格式化：在浏览器中格式化和验证',
      metaDescription: '使用 JSON 在线格式化工具在浏览器中整理和验证数据，理解语法错误，并避免把敏感样本发送到处理服务器。',
      readingTime: '约 7 分钟阅读',
      tags: ['JSON 在线格式化', 'JSON 验证', '浏览器 JSON 编辑'],
      relatedTools: [jsonFormatterZh, { label: 'JSON Schema 验证', href: '/json-schema-validate', description: '检查解析后的 JSON 是否符合类型、必填字段和约束。' }],
      lead: '格式化与验证有关联，但并不相同。格式化让解析后的文档更易读，语法验证解释为什么解析失败，Schema 验证则检查有效 JSON 是否具备应用期待的结构。',
      intro: '浏览器本地 JSON 格式化工具可以在不上传样本的情况下完成这三个阶段，适合处理可能包含内部或个人信息的接口 payload、配置片段、日志和生成数据。',
      sections: [
        { heading: '先格式化文档', paragraphs: ['粘贴样本、选择统一缩进并执行格式化。成功输出说明所选解析器接受了输入。清晰的嵌套可以让缺失值、意外数组和放错位置的字段更容易被发现。'] },
        { heading: '从第一个失败位置读取语法错误', paragraphs: ['解析器通常会在第一个无法继续理解的 token 附近停止。查看报错行列，再检查它之前的字符。常见原因包括尾逗号、单引号、注释、缺少结束括号、未转义换行，以及服务端返回了 HTML 错误页而不是 JSON。'] },
        { heading: '单独验证数据契约', paragraphs: ['语法通过后，再用 JSON Schema 或应用规则检查必填字段、允许类型、字符串格式、数字范围和数组内容。格式化无法判断 email 是否缺失，或者 ID 类型是否错误。'] },
        { heading: '保护敏感样本', paragraphs: ['优先选择在本地处理输入的工具，用 Network 面板确认行为，并删除调试不需要的秘密。即使流程在本地，也不应随意把生产令牌、密码、私钥和完整客户导出放进临时工具。'] },
        { heading: '按接收系统要求导出', paragraphs: ['评审和版本控制适合使用格式化输出，需要更小体积时使用压缩输出。如果输入是 JSONC 或 JSON5，除非目标 API 明确接受宽松格式，否则应先转换为严格 JSON。'] },
      ],
      callout: { type: 'callout', title: '在浏览器中格式化 JSON', text: '无需把样本发送到后端，即可格式化、压缩、验证并检查 JSON、JSONC 或 JSON5。', href: '/json-format', linkLabel: '打开 JSON 格式化' },
      conclusion: '可靠的 JSON 流程会分开处理可读性、语法和数据契约。先格式化，修复最早出现的语法错误，再验证 Schema，移除不必要的敏感字段，并导出目标系统需要的方言。',
      faq: [
        { question: '格式化 JSON 是否等于验证？', answer: '格式化能确认解析器接受语法，但不会验证必填字段和业务规则，除非额外应用 Schema 或其他检查。' },
        { question: '为什么有效 JSON 仍被 API 拒绝？', answer: 'JSON 语法可以完全有效，但仍可能因为字段缺失、类型错误、值不被允许或嵌套位置不对而违反 API 契约。' },
      ],
    }
  ),
  article(
    'common-json-errors-and-fixes',
    {
      title: 'Common JSON Errors and How to Fix Them',
      excerpt: 'Diagnose trailing commas, quote problems, unexpected tokens, invalid escapes, truncated payloads, and schema failures in a repeatable order.',
      metaTitle: 'Common JSON Syntax Errors and How to Fix Them',
      metaDescription: 'Fix common JSON syntax errors including unexpected token, trailing comma, single quotes, invalid escapes, HTML responses, truncation, and schema mismatches.',
      readingTime: '8 min read',
      tags: ['JSON syntax error fix', 'unexpected token', 'JSON repair'],
      relatedTools: [{ label: 'JSON Repair', href: '/json-repair', description: 'Repair common loose syntax and review normalized strict JSON.' }, jsonFormatterEn],
      lead: 'A JSON error message often points at the place where the parser gave up, not the place where the mistake began. The fastest fix is to classify the failure before changing the document.',
      intro: 'Start by confirming that the input is complete and is actually JSON. Then separate strict-syntax issues from JSONC or JSON5, transport failures, encoding problems, and schema mismatches. This prevents random edits that hide the original cause.',
      sections: [
        { heading: 'Unexpected token near a comma or bracket', paragraphs: ['A trailing comma before } or ] is valid in some JavaScript contexts but invalid in strict JSON. Remove it, then inspect the previous property for a missing value. An unexpected closing bracket can also mean an earlier object or array was closed in the wrong order.'] },
        { heading: 'Single quotes and unquoted keys', paragraphs: ['JavaScript object literals and JSON5 can use syntax that JSON.parse rejects. Replace single-quoted strings with properly escaped double-quoted strings and quote every object key. Do not use a global text replacement when apostrophes can appear inside values.'] },
        { heading: 'Comments and control characters', paragraphs: ['Strict JSON does not allow line or block comments. Literal newlines, tabs, and some control characters inside strings must be escaped. If comments are meaningful, keep the source as JSONC and generate a strict JSON artifact for APIs.'] },
        { heading: 'HTML or empty responses labeled as JSON', paragraphs: ['The famous “Unexpected token <” error often means a server returned an HTML login or error page. An unexpected end error can mean an empty or truncated response. Check status, Content-Type, redirects, body length, and network failures before editing the payload.'] },
        { heading: 'Valid syntax but wrong data', paragraphs: ['If parsing succeeds but the application rejects the value, inspect the schema. Strings and numbers are not interchangeable, null differs from a missing property, array items may need one type, and dates are ordinary strings unless the application validates their format.'] },
        { heading: 'A repeatable repair sequence', paragraphs: ['Preserve the raw response, check transport metadata, detect the JSON dialect, format with error positions, repair only known syntax issues, validate the result, and compare repaired output against the source. In production, fix the producer instead of permanently repairing malformed API data downstream.'] },
      ],
      callout: { type: 'callout', title: 'Inspect and repair a sample', text: 'Use JSON Repair for comments, trailing commas, single quotes, and unquoted keys, then validate the strict output.', href: '/json-repair', linkLabel: 'Open JSON Repair' },
      conclusion: 'Most JSON failures fall into a few groups: wrong dialect, broken delimiters or quotes, invalid string escapes, non-JSON server responses, truncation, or schema mismatch. Diagnose the group first, fix the earliest cause, and preserve the raw input for comparison.',
      faq: [
        { question: 'What does Unexpected token < in JSON mean?', answer: 'It usually means the response starts with HTML, often a login page, proxy error, or server error document. Check the HTTP status and Content-Type before changing parser code.' },
        { question: 'Can JSON repair be used in production?', answer: 'It is better to fix the producer. Automatic repair may hide contract failures or change ambiguous input. Use it for investigation, migration, or controlled imports with review.' },
      ],
    },
    {
      title: '常见 JSON 错误及修复方法',
      excerpt: '按可重复的顺序诊断尾逗号、引号问题、Unexpected token、无效转义、数据截断和 Schema 失败。',
      metaTitle: '常见 JSON 语法错误及修复方法',
      metaDescription: '修复 Unexpected token、尾逗号、单引号、无效转义、HTML 响应、数据截断和 Schema 不匹配等常见 JSON 错误。',
      readingTime: '约 8 分钟阅读',
      tags: ['JSON 语法错误修复', 'Unexpected token', 'JSON 修复'],
      relatedTools: [{ label: 'JSON 修复', href: '/json-repair', description: '修复常见宽松语法，并检查规范化后的严格 JSON。' }, jsonFormatterZh],
      lead: 'JSON 错误信息经常指向解析器放弃的位置，而不是错误真正开始的位置。最快的修复方式，是先给失败分类，再修改文档。',
      intro: '首先确认输入完整且确实是 JSON，然后把严格语法问题与 JSONC 或 JSON5、传输失败、编码问题和 Schema 不匹配分开。这样可以避免随机改动掩盖原始原因。',
      sections: [
        { heading: '逗号或括号附近出现 Unexpected token', paragraphs: ['在 } 或 ] 前的尾逗号可以出现在部分 JavaScript 场景中，但严格 JSON 不允许。删除它后，再检查前一个属性是否缺少值。意外的结束括号也可能说明更早的对象或数组关闭顺序错误。'] },
        { heading: '单引号和未加引号的 key', paragraphs: ['JavaScript 对象字面量和 JSON5 可以使用 JSON.parse 会拒绝的语法。应把单引号字符串转换为正确转义的双引号字符串，并为每个对象 key 加双引号。当值中可能出现撇号时，不要直接全局替换。'] },
        { heading: '注释和控制字符', paragraphs: ['严格 JSON 不允许单行或块注释。字符串中的真实换行、Tab 和部分控制字符必须转义。如果注释有意义，应把源文件保留为 JSONC，并为 API 生成严格 JSON 产物。'] },
        { heading: '被当作 JSON 的 HTML 或空响应', paragraphs: ['常见的“Unexpected token <”通常说明服务端返回了 HTML 登录页或错误页。Unexpected end 可能表示响应为空或被截断。修改 payload 前先检查状态码、Content-Type、重定向、正文长度和网络失败。'] },
        { heading: '语法有效但数据错误', paragraphs: ['如果解析成功但应用拒绝数据，应检查 Schema。字符串和数字不能随意互换，null 与属性缺失不同，数组元素可能要求统一类型，日期也只是普通字符串，除非应用进一步验证格式。'] },
        { heading: '可重复的修复顺序', paragraphs: ['保留原始响应，检查传输元数据，识别 JSON 方言，利用错误位置格式化，只修复已知语法问题，验证结果，并把修复输出与源文件对比。生产环境应修复数据生产方，而不是永久在下游修补错误 API 数据。'] },
      ],
      callout: { type: 'callout', title: '检查并修复样本', text: '使用 JSON 修复处理注释、尾逗号、单引号和未加引号 key，然后验证严格输出。', href: '/json-repair', linkLabel: '打开 JSON 修复' },
      conclusion: '大多数 JSON 失败可以归为几类：方言不匹配、分隔符或引号错误、字符串转义无效、服务端返回非 JSON、内容截断或 Schema 不匹配。先判断类别，修复最早的原因，并保留原始输入用于对比。',
      faq: [
        { question: 'JSON 中 Unexpected token < 是什么意思？', answer: '通常表示响应以 HTML 开头，例如登录页、代理错误或服务端错误文档。修改解析代码前先检查 HTTP 状态和 Content-Type。' },
        { question: 'JSON 自动修复可以用于生产环境吗？', answer: '更好的做法是修复生产方。自动修复可能掩盖契约失败或改变有歧义的输入，更适合调查、迁移或经过人工复核的受控导入。' },
      ],
    }
  ),
  article(
    'image-processing-without-upload',
    {
      title: 'Image Processing Without Upload',
      excerpt: 'A complete guide to resizing, compressing, converting, cropping, and editing images locally in the browser, with practical privacy and quality checks.',
      metaTitle: 'Image Processing Without Upload: Complete Local Guide',
      metaDescription: 'Process images without upload using browser-local resize, compression, conversion, cropping, Canvas, WebAssembly, and on-device models while preserving quality.',
      readingTime: '10 min read',
      tags: ['image processing without upload', 'local image tools', 'image privacy'],
      relatedTools: [imageToolsEn, { label: 'Image Compressor', href: '/image/compress', description: 'Compress JPG, PNG, and WebP images locally with preview and batch download.' }, { label: 'Image Resize', href: '/image/resize', description: 'Resize images by dimensions or percentage without uploading the source.' }],
      lead: 'Modern browsers can decode, resize, crop, compress, convert, and export many image formats on the user device. For everyday work, that makes uploading a private screenshot or unreleased product image unnecessary.',
      intro: 'Local image processing combines browser file APIs with Canvas, ImageBitmap, workers, WebAssembly codecs, and sometimes on-device models. The privacy benefit is straightforward, but quality still depends on choosing the right dimensions, format, compression mode, and export checks.',
      sections: [
        { heading: 'What the browser can process locally', paragraphs: ['Common workflows include resizing, cropping, rotation, compression, watermarking, metadata inspection, Base64 conversion, format conversion, icon creation, and simple background removal. Support varies by browser and codec, so a tool may load a WebAssembly encoder for AVIF or use a local model for segmentation.'] },
        { heading: 'Resize before aggressive compression', paragraphs: ['Pixel dimensions often matter more than a small quality adjustment. A 4000-pixel photo displayed at 1200 pixels carries unnecessary data. Resize to the largest real display size, preserve aspect ratio, then lower quality gradually while comparing the result.'] },
        { heading: 'Choose a format based on content', paragraphs: ['Photos usually compress well as JPEG, WebP, or AVIF. Screenshots and graphics with sharp text may need PNG or a high-quality WebP. Transparency requires PNG, WebP, or AVIF support. Animated sources require a workflow that preserves animation rather than flattening the first frame.'] },
        { heading: 'Protect quality during batch work', paragraphs: ['Batch processing should use consistent settings but still reveal per-file output size and preview. Keep originals, avoid repeated lossy exports, inspect the largest and smallest files, and confirm color, transparency, orientation, and metadata behavior before replacing a whole directory.'], items: ['Process copies, not the only source files.', 'Use one target use case per batch.', 'Preview text edges, faces, gradients, and transparency.', 'Confirm filenames and output formats before download.', 'Keep a manifest when order or traceability matters.'] },
        { heading: 'Verify the privacy claim', paragraphs: ['Use a harmless sample and the Network panel to confirm that the source image is not sent to a server. Codec, model, and worker downloads can be normal. The key question is whether the selected file appears in a request body or remote job.'] },
        { heading: 'Know when a desktop tool is better', paragraphs: ['Very large RAW files, color-managed print work, complex layered documents, high-volume production, and forensic metadata workflows may exceed browser limits. Local web tools are strongest for fast, common transformations where convenience and reduced upload exposure matter.'] },
      ],
      callout: { type: 'callout', title: 'Process an image locally', text: 'ToolGarden image tools cover resize, compression, format conversion, cropping, watermarking, background removal, and more inside the browser.', href: '/image', linkLabel: 'Browse image tools' },
      conclusion: 'Image processing without upload is practical for a broad range of everyday tasks. Resize to the real display need, choose a format for the content, preview quality, preserve originals, and verify that the selected file never enters a network request. The cluster guides cover local resize, PNG versus WebP, and offline batch compression.',
      faq: [
        { question: 'Can browsers compress images without uploading them?', answer: 'Yes. Canvas, native encoders, JavaScript, and WebAssembly can decode and encode common formats inside the browser. Exact format support and speed depend on the device and browser.' },
        { question: 'Does local processing remove image metadata?', answer: 'It depends on the implementation. Canvas-based export often drops much metadata, but users should inspect the output rather than assume every EXIF or color-profile field was removed.' },
        { question: 'Why can a local image tool use network requests?', answer: 'The page may download code, codecs, workers, fonts, or an on-device model. Those asset requests are different from uploading the user image. Verify request bodies with a sample.' },
      ],
    },
    {
      title: '无需上传的图片处理完整指南',
      excerpt: '完整了解如何在浏览器本地调整尺寸、压缩、转换、裁剪和编辑图片，并做好隐私与画质检查。',
      metaTitle: '无需上传的图片处理：浏览器本地完整指南',
      metaDescription: '使用浏览器本地尺寸调整、压缩、格式转换、裁剪、Canvas、WebAssembly 和设备端模型处理图片，同时保护隐私与画质。',
      readingTime: '约 10 分钟阅读',
      tags: ['无需上传图片处理', '本地图片工具', '图片隐私'],
      relatedTools: [imageToolsZh, { label: '图片压缩', href: '/image/compress', description: '在本地压缩 JPG、PNG 和 WebP，支持预览与批量下载。' }, { label: '图片尺寸调整', href: '/image/resize', description: '无需上传源图，即可按尺寸或百分比调整图片。' }],
      lead: '现代浏览器可以在用户设备上解码、缩放、裁剪、压缩、转换和导出多种图片格式。对日常工作来说，私密截图或未发布产品图通常不必上传到远端服务器。',
      intro: '本地图片处理会结合浏览器文件 API、Canvas、ImageBitmap、Worker、WebAssembly 编解码器，有时也会使用设备端模型。隐私收益很直接，但画质仍取决于尺寸、格式、压缩模式和导出检查。',
      sections: [
        { heading: '浏览器可以在本地完成什么', paragraphs: ['常见流程包括尺寸调整、裁剪、旋转、压缩、水印、元数据检查、Base64 转换、格式转换、图标制作和简单去背景。浏览器与编解码器支持不完全相同，因此 AVIF 可能需要 WebAssembly 编码器，分割功能也可能加载本地模型。'] },
        { heading: '先调整尺寸，再做激进压缩', paragraphs: ['像素尺寸往往比小幅调整质量更重要。一张 4000 像素宽、实际只显示 1200 像素的照片携带了不必要的数据。应先按真实最大显示尺寸缩放并保持比例，再逐步降低质量并比较结果。'] },
        { heading: '根据内容选择格式', paragraphs: ['照片通常适合 JPEG、WebP 或 AVIF。包含清晰文字的截图和图形可能需要 PNG 或高质量 WebP。透明内容需要 PNG、WebP 或 AVIF 支持。动画源文件则要选择能保留动画的流程，避免只导出第一帧。'] },
        { heading: '批量处理时保护画质', paragraphs: ['批处理可以使用统一设置，但仍应展示每个文件的输出体积并支持预览。保留原件，避免重复有损导出，检查最大与最小文件，并在替换整个目录前确认颜色、透明、方向和元数据行为。'], items: ['处理副本，不要直接覆盖唯一源文件。', '一个批次只服务一个明确用途。', '重点预览文字边缘、人脸、渐变和透明区域。', '下载前确认文件名和输出格式。', '顺序或追溯很重要时保留清单。'] },
        { heading: '验证隐私声明', paragraphs: ['使用无敏感信息的样本配合 Network 面板，确认源图片没有发送到服务器。编解码器、模型和 Worker 下载可能是正常的，关键是用户选择的文件是否出现在请求体或远端任务中。'] },
        { heading: '什么时候桌面工具更合适', paragraphs: ['超大 RAW、色彩管理印刷、复杂图层文档、高吞吐生产和取证元数据流程可能超过浏览器限制。本地网页工具最适合快速、常见的转换任务，在便利性与减少上传暴露之间取得平衡。'] },
      ],
      callout: { type: 'callout', title: '在本地处理图片', text: 'ToolGarden 图片工具支持在浏览器中完成尺寸调整、压缩、格式转换、裁剪、水印、去背景等操作。', href: '/image', linkLabel: '浏览图片工具' },
      conclusion: '无需上传的图片处理已经能覆盖大量日常任务。按真实显示需求调整尺寸，根据内容选择格式，预览画质，保留原件，并验证所选文件没有进入网络请求。下方集群指南会进一步介绍本地缩放、PNG 与 WebP 选择和离线批量压缩。',
      faq: [
        { question: '浏览器可以不上传就压缩图片吗？', answer: '可以。Canvas、原生编码器、JavaScript 和 WebAssembly 都能在浏览器中解码并编码常见格式，具体支持和速度取决于设备与浏览器。' },
        { question: '本地处理会删除图片元数据吗？', answer: '取决于具体实现。Canvas 导出经常会丢弃大量元数据，但用户仍应检查输出，不能假定所有 EXIF 或色彩配置都已移除。' },
        { question: '为什么本地图片工具仍有网络请求？', answer: '页面可能下载代码、编解码器、Worker、字体或设备端模型，这些资源请求不同于上传用户图片。应使用样本检查请求体。' },
      ],
    }
  ),
  article(
    'resize-images-locally-no-upload',
    {
      title: 'How to Resize Images Locally (No Server Upload)',
      excerpt: 'Resize an image without upload by choosing dimensions, preserving aspect ratio, selecting a resampling mode, and checking the local export.',
      metaTitle: 'Resize Image Without Upload: Local Browser Workflow',
      metaDescription: 'Learn how to resize an image without upload using a browser-local tool, with aspect ratio, pixels, resampling, format, metadata, and quality guidance.',
      readingTime: '7 min read',
      tags: ['resize image without upload', 'local image resize', 'image privacy'],
      relatedTools: [{ label: 'Image Resize', href: '/image/resize', description: 'Resize JPG, PNG, and WebP images locally by dimensions or percentage.' }, { label: 'Image Crop', href: '/image/crop', description: 'Crop and resize in one browser-local workflow.' }],
      lead: 'Resizing changes pixel dimensions, not just how large an image appears on screen. A local resize tool decodes the source, resamples pixels, and exports a new file without sending the image to a server.',
      intro: 'The best settings come from the destination. A profile picture, email attachment, responsive website image, and print asset need different dimensions. Decide the use case first, then protect aspect ratio and inspect the result at its real display size.',
      sections: [
        { heading: 'Choose target dimensions from the destination', paragraphs: ['For web use, resize near the largest rendered CSS size multiplied by the expected device pixel ratio. For a 600-pixel layout slot on a 2x display, a 1200-pixel source can be reasonable. Avoid keeping 4000 pixels just because the camera produced them.'] },
        { heading: 'Preserve aspect ratio unless cropping is intentional', paragraphs: ['Locking aspect ratio prevents stretching. If a destination requires a square or fixed banner ratio, crop intentionally before resizing. Changing width and height independently distorts faces, logos, and text.'] },
        { heading: 'Understand downscaling and upscaling', paragraphs: ['Downscaling combines source pixels and usually produces a smaller, cleaner file. Upscaling creates additional pixels through interpolation or a model but cannot recover detail that was never captured. Sharp graphics may need a different resampling mode from photographs.'] },
        { heading: 'Select output format and quality', paragraphs: ['Keep PNG when transparency or sharp interface edges matter. Use JPEG or WebP for photographs when smaller size is important. After resizing, moderate quality often reduces the file substantially without visible loss. Avoid repeatedly exporting a lossy result.'] },
        { heading: 'Verify local processing and export', paragraphs: ['Use the Network panel with a sample to confirm no upload occurs. Preview the output at 100 percent, check orientation and transparency, compare file size, and save with a new name. Keep the original until the resized file has been used successfully.'] },
      ],
      callout: { type: 'callout', title: 'Resize without uploading', text: 'Choose dimensions or a percentage, preserve aspect ratio, preview the image, and download the result locally.', href: '/image/resize', linkLabel: 'Open Image Resize' },
      conclusion: 'Local image resizing is safest and most effective when the destination determines the pixel dimensions. Preserve aspect ratio, crop deliberately, choose a format for the content, inspect at real size, and keep the original.',
      faq: [
        { question: 'Does resizing an image reduce file size?', answer: 'Usually yes when dimensions are reduced, because the output contains fewer pixels. Format, quality, metadata, and image complexity also affect final size.' },
        { question: 'Can resizing improve a blurry image?', answer: 'Reducing dimensions can make some defects less visible. Upscaling cannot recreate missing detail, although interpolation or local AI enhancement may improve perceived sharpness.' },
      ],
    },
    {
      title: '如何在本地调整图片尺寸（无需上传）',
      excerpt: '通过选择尺寸、保持比例、使用合适重采样方式并检查本地导出，在不上传的情况下调整图片大小。',
      metaTitle: '无需上传调整图片尺寸：浏览器本地流程',
      metaDescription: '了解如何使用浏览器本地工具调整图片尺寸，包括比例、像素、重采样、格式、元数据和画质建议。',
      readingTime: '约 7 分钟阅读',
      tags: ['无需上传调整图片', '本地图片缩放', '图片隐私'],
      relatedTools: [{ label: '图片尺寸调整', href: '/image/resize', description: '按尺寸或百分比在本地调整 JPG、PNG 和 WebP 图片。' }, { label: '图片裁剪', href: '/image/crop', description: '在一次浏览器本地流程中完成裁剪与缩放。' }],
      lead: '调整图片尺寸会改变像素数量，而不只是屏幕上的显示大小。本地尺寸工具会解码源图、重采样像素并导出新文件，全程无需把图片发送到服务器。',
      intro: '最佳设置由目标用途决定。头像、邮件附件、响应式网页图和印刷素材需要不同尺寸。先确定使用场景，再保护宽高比，并按真实显示大小检查结果。',
      sections: [
        { heading: '根据目标位置选择尺寸', paragraphs: ['网页使用时，可以按最大 CSS 显示宽度乘以预期设备像素比计算。例如 600 像素的布局槽位在 2x 屏幕上使用 1200 像素源图通常合理，没有必要因为相机生成了 4000 像素就全部保留。'] },
        { heading: '除非有意裁剪，否则保持宽高比', paragraphs: ['锁定比例可以避免拉伸。如果目标需要正方形或固定横幅比例，应先明确裁剪再缩放。分别随意修改宽度和高度会扭曲人脸、Logo 和文字。'] },
        { heading: '理解缩小与放大', paragraphs: ['缩小会合并源像素，通常得到更小、更干净的文件。放大通过插值或模型生成额外像素，但无法恢复拍摄时不存在的细节。清晰图形和照片也可能需要不同的重采样模式。'] },
        { heading: '选择输出格式和质量', paragraphs: ['透明或界面锐利边缘重要时保留 PNG，照片追求更小体积时使用 JPEG 或 WebP。尺寸调整后，适度质量通常能明显减小文件而不产生肉眼可见损失。避免反复导出有损结果。'] },
        { heading: '验证本地处理与导出结果', paragraphs: ['可以用样本配合 Network 面板确认没有上传。按 100% 比例预览输出，检查方向和透明，比较文件大小，并用新文件名保存。在缩放结果成功用于目标场景前，保留原图。'] },
      ],
      callout: { type: 'callout', title: '无需上传调整尺寸', text: '选择尺寸或百分比，保持宽高比，预览图片并在本地下载结果。', href: '/image/resize', linkLabel: '打开图片尺寸调整' },
      conclusion: '当目标用途决定像素尺寸时，本地图片缩放最安全也最有效。保持宽高比，明确裁剪，根据内容选择格式，按真实大小检查，并保留原图。',
      faq: [
        { question: '调整图片尺寸会减小文件体积吗？', answer: '缩小尺寸通常会，因为输出像素更少。最终体积还受到格式、质量、元数据和画面复杂度影响。' },
        { question: '调整尺寸可以让模糊图片变清晰吗？', answer: '缩小尺寸可能让部分缺陷不明显。放大无法创造原本缺失的细节，但插值或本地 AI 增强可以改善感知清晰度。' },
      ],
    }
  ),
  article(
    'batch-image-compression-browser',
    {
      title: 'Batch Image Compression in the Browser',
      excerpt: 'Compress a folder of images with consistent local settings, previews, format decisions, and quality checks, even in a privacy-sensitive workflow.',
      metaTitle: 'Batch Image Compressor Offline: Browser-Local Workflow',
      metaDescription: 'Use a batch image compressor offline or browser-locally with consistent quality, dimensions, formats, previews, filenames, and no server upload.',
      readingTime: '8 min read',
      tags: ['batch image compressor offline', 'browser image compression', 'no upload'],
      relatedTools: [{ label: 'Image Compressor', href: '/image/compress', description: 'Compress multiple images locally, compare results, and download outputs together.' }, { label: 'Image Resize', href: '/image/resize', description: 'Reduce pixel dimensions before compression when images are larger than their destination.' }],
      lead: 'Batch compression is not just running the same quality slider many times. A reliable workflow groups images by use case, protects originals, reveals per-file results, and makes it easy to detect the exceptions that need different settings.',
      intro: 'Browser-local compression is especially useful for internal screenshots, client assets, draft campaign images, and private photos because the sources do not need to enter an upload queue. Once the application and codecs are loaded, some batches can also be processed offline.',
      sections: [
        { heading: 'Group files by destination', paragraphs: ['Do not mix website thumbnails, full-width hero images, transparent logos, and archive originals in one batch. Each group needs a different dimension, format, and quality target. Consistent purpose produces consistent settings.'] },
        { heading: 'Reduce dimensions before lowering quality', paragraphs: ['If images are much larger than their final display size, resize first. Removing unnecessary pixels often saves more than pushing JPEG or WebP quality to a visibly damaged level. Keep high-resolution originals outside the batch.'] },
        { heading: 'Pick a format policy', paragraphs: ['Keeping the original format avoids compatibility surprises. Converting photos to WebP can reduce size for modern web delivery. PNG screenshots with transparency or sharp UI details may need to stay PNG or use a high-quality WebP after inspection.'] },
        { heading: 'Inspect the outliers, not only the average', paragraphs: ['A single quality value behaves differently on flat illustrations, noisy photos, text screenshots, and gradients. Sort or scan results by compression ratio and file size. Preview unusually small outputs, files that barely changed, and any image with important text or faces.'] },
        { heading: 'Use a safe batch checklist', paragraphs: ['Process copies, keep filenames traceable, download to a new directory, and compare the final count with the source count. If a browser tab is handling a large set, split the job into smaller groups to control memory use.'], items: ['Confirm every file shows a completed or clear error state.', 'Check transparency and orientation on representative files.', 'Avoid repeated lossy compression of prior outputs.', 'Keep originals until the published or delivered batch is approved.', 'Test offline mode before depending on it.'] },
      ],
      callout: { type: 'callout', title: 'Compress a batch locally', text: 'Add multiple images, preview each output, keep the source format or choose WebP, and download the completed batch.', href: '/image/compress', linkLabel: 'Open Image Compressor' },
      conclusion: 'A good batch compression workflow is organized around destination, not file count. Resize oversized sources, choose a clear format policy, review outliers, preserve originals, and keep processing local when the images should not be uploaded.',
      faq: [
        { question: 'Can a browser batch compressor work offline?', answer: 'It may work after the page, codecs, and workers have loaded or been cached. Test by disconnecting the network before relying on offline processing.' },
        { question: 'Should every image in a batch use the same quality?', answer: 'A shared starting point is useful, but visual complexity differs. Review outliers and separate screenshots, graphics, and photographs when they need different policies.' },
      ],
    },
    {
      title: '在浏览器中批量压缩图片',
      excerpt: '使用一致的本地设置、预览、格式策略和画质检查批量压缩图片，也适合隐私敏感流程。',
      metaTitle: '离线批量图片压缩：浏览器本地工作流',
      metaDescription: '使用离线或浏览器本地批量图片压缩工具，统一管理质量、尺寸、格式、预览和文件名，全程无需服务器上传。',
      readingTime: '约 8 分钟阅读',
      tags: ['离线批量图片压缩', '浏览器图片压缩', '无需上传'],
      relatedTools: [{ label: '图片压缩', href: '/image/compress', description: '在本地压缩多张图片、比较结果并统一下载。' }, { label: '图片尺寸调整', href: '/image/resize', description: '当图片尺寸大于目标用途时，先减少像素再压缩。' }],
      lead: '批量压缩不只是把同一个质量滑块重复运行很多次。可靠流程会按用途分组、保护原文件、展示每个文件结果，并帮助发现需要不同设置的例外。',
      intro: '浏览器本地压缩尤其适合内部截图、客户素材、活动草稿图和私人照片，因为源文件不需要进入上传队列。应用和编解码器加载后，部分批次也可以断网处理。',
      sections: [
        { heading: '按目标用途给文件分组', paragraphs: ['不要把网站缩略图、全宽首图、透明 Logo 和归档原图混在同一批次。每组需要不同尺寸、格式和质量目标。用途一致，设置才容易一致。'] },
        { heading: '降低质量前先减少尺寸', paragraphs: ['如果图片远大于最终显示尺寸，应先缩放。移除不必要像素，通常比把 JPEG 或 WebP 质量压到明显受损更有效。高分辨率原件应保留在批次之外。'] },
        { heading: '确定格式策略', paragraphs: ['保留原格式可以减少兼容意外。照片转换为 WebP 往往有利于现代网页交付。带透明或锐利 UI 细节的 PNG 截图，可能需要继续使用 PNG，或在检查后输出高质量 WebP。'] },
        { heading: '检查异常文件，而不只看平均值', paragraphs: ['同一个质量值在扁平插画、高噪点照片、文字截图和渐变上表现不同。可以按压缩率或文件大小浏览结果，重点预览异常小、几乎没有变化，以及包含重要文字或人脸的输出。'] },
        { heading: '使用安全批处理清单', paragraphs: ['处理副本，保持文件名可追溯，下载到新目录，并核对输出和源文件数量。浏览器处理大批量时，可以拆成更小分组以控制内存。'], items: ['确认每个文件都有完成状态或清晰错误。', '在代表性文件上检查透明和方向。', '避免对之前的有损输出反复压缩。', '发布或交付批次获批前保留原件。', '依赖离线模式前先实际测试。'] },
      ],
      callout: { type: 'callout', title: '在本地压缩一批图片', text: '添加多张图片，预览每个输出，保留源格式或选择 WebP，并统一下载完成结果。', href: '/image/compress', linkLabel: '打开图片压缩' },
      conclusion: '好的批量压缩流程围绕目标用途组织，而不是围绕文件数量。先缩放过大的源图，确定格式策略，检查异常结果，保留原件，并在图片不适合上传时坚持本地处理。',
      faq: [
        { question: '浏览器批量压缩可以离线使用吗？', answer: '页面、编解码器和 Worker 加载或缓存后可能可以。依赖离线处理前，应先断开网络测试。' },
        { question: '一批图片应该使用同一质量吗？', answer: '统一起点很有用，但画面复杂度不同。应检查异常结果，并在截图、图形和照片需要不同策略时分开处理。' },
      ],
    }
  ),
  article(
    'pdf-tools-guide',
    {
      title: 'PDF Tools Guide',
      excerpt: 'Choose the right browser-local workflow for merging, splitting, organizing, extracting, converting, encrypting, and watermarking PDF files.',
      metaTitle: 'PDF Tools Guide: Merge, Split, Extract, Convert Locally',
      metaDescription: 'A practical PDF tools guide for browser-local merge, split, organize, page extraction, text extraction, conversion, encryption, and watermark workflows.',
      readingTime: '10 min read',
      tags: ['PDF tools guide', 'local PDF tools', 'PDF privacy'],
      relatedTools: [pdfToolsEn, { label: 'Merge PDF', href: '/pdf/merge', description: 'Merge and reorder PDF files locally in the browser.' }, { label: 'PDF to Word', href: '/pdf/to-word', description: 'Extract PDF text and generate an editable DOCX locally.' }],
      lead: 'PDF is a container for pages, fonts, images, vector graphics, forms, metadata, outlines, attachments, and security settings. The correct tool depends on which layer you need to change.',
      intro: 'Browser-local PDF tools can cover many routine jobs without uploading contracts, applications, reports, or scans. They are strongest when the task is structural, such as copying pages into a new file, extracting text, adding a watermark, or applying a password. Complex layout conversion and damaged files still need careful review.',
      sections: [
        { heading: 'Merge, split, extract, or organize pages', paragraphs: ['Merge combines complete documents in a chosen order. Split creates several documents from ranges or pages. Extract copies selected pages into one new PDF. Organize supports reordering, duplication, and deletion. Choose the operation that matches the intended output so page order stays predictable.'] },
        { heading: 'Extract text versus convert layout', paragraphs: ['Text extraction reads the selectable text layer. It does not guarantee that columns, tables, footnotes, or reading order will reproduce the visual page. Scanned PDFs need OCR because each page may be only an image. PDF to Word tools can create an editable document, but complex formatting must be reviewed.'] },
        { heading: 'Convert to and from PDF', paragraphs: ['Images and simple text documents can often be rendered into PDF locally. Office files are harder because browser libraries do not reproduce every desktop layout engine. Check fonts, line breaks, page size, charts, formulas, and embedded media in the exported result.'] },
        { heading: 'Apply watermarks and encryption carefully', paragraphs: ['A watermark communicates ownership or handling context but does not prevent copying. Password encryption controls access only when a compatible viewer honors it and the password is shared safely. Neither feature replaces document access policy, redaction, or rights management.'] },
        { heading: 'Use a safe PDF workflow', paragraphs: ['Work on copies, keep original page counts, preview representative pages, and compare the final order before distribution. For legal or archival documents, confirm signatures, annotations, forms, attachments, bookmarks, and accessibility structure after any transformation.'], items: ['Verify that the file is not uploaded when privacy matters.', 'Use smaller batches if browser memory becomes constrained.', 'Check scanned pages separately from searchable text pages.', 'Never assume visual redaction removed hidden text.', 'Retain originals until the new file is accepted.'] },
        { heading: 'Know the browser limits', paragraphs: ['Very large PDFs, unusual fonts, malformed cross-reference tables, protected documents, advanced forms, digital signatures, and print-production requirements may need audited desktop software. A local browser workflow is best when its limitations match the document and task.'] },
      ],
      callout: { type: 'callout', title: 'Choose a local PDF tool', text: 'Merge, split, organize, extract pages, convert, watermark, or encrypt supported PDFs directly in your browser.', href: '/pdf', linkLabel: 'Browse PDF tools' },
      conclusion: 'Start with the exact PDF layer you need to change: page structure, text, layout, security, or presentation. Keep the work local when possible, preserve the original, and inspect the final document beyond the first page. The cluster guides cover offline merge and local text extraction.',
      faq: [
        { question: 'Can PDFs be processed without upload?', answer: 'Many page-level operations, text extraction, watermarking, and encryption tasks can run in the browser using local PDF libraries. Support depends on file size, protection, and document complexity.' },
        { question: 'Does merging PDFs preserve digital signatures?', answer: 'Usually not as valid signatures. Changing document bytes and page structure can invalidate signatures. Preserve signed originals and use an approved workflow when signature validity matters.' },
        { question: 'Can PDF text extraction read scans?', answer: 'Not without OCR. A scanned page is an image unless a text layer was previously added. OCR can recognize text but requires accuracy review.' },
      ],
    },
    {
      title: 'PDF 工具完整指南',
      excerpt: '为 PDF 合并、拆分、整理、提取、转换、加密和水印选择合适的浏览器本地工作流。',
      metaTitle: 'PDF 工具指南：本地合并、拆分、提取与转换',
      metaDescription: '实用 PDF 工具指南，覆盖浏览器本地合并、拆分、整理、页面提取、文本提取、转换、加密和水印流程。',
      readingTime: '约 10 分钟阅读',
      tags: ['PDF 工具指南', '本地 PDF 工具', 'PDF 隐私'],
      relatedTools: [pdfToolsZh, { label: '合并 PDF', href: '/pdf/merge', description: '在浏览器本地合并和调整 PDF 文件顺序。' }, { label: 'PDF 转 Word', href: '/pdf/to-word', description: '在本地提取 PDF 文本并生成可编辑 DOCX。' }],
      lead: 'PDF 是页面、字体、图片、矢量图形、表单、元数据、目录、附件和安全设置的容器。应该使用哪个工具，取决于你需要修改哪一层。',
      intro: '浏览器本地 PDF 工具可以在不上传合同、申请材料、报告或扫描件的情况下完成许多日常任务。它们擅长复制页面到新文件、提取文本、添加水印或设置密码等结构性操作，但复杂版式转换和损坏文件仍需要认真检查。',
      sections: [
        { heading: '合并、拆分、提取还是整理页面', paragraphs: ['合并按指定顺序组合完整文档，拆分按范围或页面生成多个文件，提取把选定页面复制到一个新 PDF，整理则支持重排、复制和删除。应根据目标输出选择操作，让页序保持可预测。'] },
        { heading: '文本提取与版式转换不同', paragraphs: ['文本提取读取可选择的文本层，但不能保证栏、表格、脚注和阅读顺序与视觉页面一致。扫描 PDF 需要 OCR，因为页面可能只有图片。PDF 转 Word 可以生成可编辑文档，但复杂格式必须复核。'] },
        { heading: '转为 PDF 或从 PDF 转换', paragraphs: ['图片和简单文本文档通常可以在本地渲染为 PDF。Office 文件更复杂，因为浏览器库无法完整复制桌面排版引擎。导出后应检查字体、换行、页面大小、图表、公式和嵌入媒体。'] },
        { heading: '谨慎使用水印与加密', paragraphs: ['水印可以表达归属或处理上下文，但无法阻止复制。密码加密只有在兼容阅读器正确执行，并且密码被安全分享时才能控制访问。两者都不能替代文档访问策略、遮盖或权限管理。'] },
        { heading: '使用安全 PDF 工作流', paragraphs: ['在副本上操作，记录原始页数，预览代表性页面，并在分发前核对最终顺序。法律或归档文档转换后，还要检查签名、批注、表单、附件、书签和无障碍结构。'], items: ['隐私重要时验证文件没有上传。', '浏览器内存紧张时拆成较小批次。', '把扫描页与可搜索文本页分开检查。', '不要假定视觉遮挡已经删除隐藏文本。', '新文件被接受前保留原件。'] },
        { heading: '了解浏览器限制', paragraphs: ['超大 PDF、特殊字体、损坏的交叉引用表、受保护文档、高级表单、数字签名和印刷生产要求可能需要经过审计的桌面软件。本地浏览器流程只有在能力边界与文件和任务匹配时才最合适。'] },
      ],
      callout: { type: 'callout', title: '选择本地 PDF 工具', text: '直接在浏览器中合并、拆分、整理、提取页面、转换、添加水印或加密支持的 PDF。', href: '/pdf', linkLabel: '浏览 PDF 工具' },
      conclusion: '先确定要改变的 PDF 层：页面结构、文本、版式、安全还是展示。尽可能在本地处理，保留原件，并检查最终文档，而不只是第一页。下方集群指南会介绍离线合并和本地文本提取。',
      faq: [
        { question: 'PDF 可以不上传就处理吗？', answer: '许多页面级操作、文本提取、水印和加密任务可以使用本地 PDF 库在浏览器中运行，具体取决于文件大小、保护状态和复杂度。' },
        { question: '合并 PDF 会保留数字签名吗？', answer: '通常无法保持签名有效。修改文档字节和页面结构可能让签名失效。签名有效性重要时应保留原件并使用批准的流程。' },
        { question: 'PDF 文本提取可以读取扫描件吗？', answer: '没有 OCR 就不行。扫描页通常是一张图片，除非之前添加了文本层。OCR 可以识别文字，但结果需要准确性复核。' },
      ],
    }
  ),
  article(
    'extract-text-from-pdf-in-browser',
    {
      title: 'Extract Text from PDF in Your Browser',
      excerpt: 'Use a local PDF text extractor, understand selectable text versus OCR, preserve privacy, and review reading order before reusing the output.',
      metaTitle: 'PDF Text Extractor Local: Extract Text in Your Browser',
      metaDescription: 'Extract text from PDF locally in your browser, understand text layers and OCR, protect private documents, and review columns, tables, and reading order.',
      readingTime: '8 min read',
      tags: ['PDF text extractor local', 'extract PDF text', 'PDF privacy'],
      relatedTools: [{ label: 'PDF to Word', href: '/pdf/to-word', description: 'Extract local PDF text and create an editable Word document.' }, { label: 'PDF Extract Pages', href: '/pdf/extract-pages', description: 'Copy selected pages to a smaller PDF before further work.' }],
      lead: 'A PDF can display text without storing it as readable characters. Local extraction works well when the file contains a text layer, while image-only scans require OCR and more careful accuracy review.',
      intro: 'Browser-local extraction is useful for contracts, research papers, reports, invoices, and internal documents that should not be uploaded to an unknown service. The output still needs inspection because visual order and logical reading order are not always the same.',
      sections: [
        { heading: 'Check whether the PDF has a text layer', paragraphs: ['Try selecting and copying a sentence in a trusted viewer. If individual characters can be selected, the file probably contains text. If selection covers the whole page as one image, OCR is required. Some files contain a hidden OCR layer with imperfect text beneath the scan.'] },
        { heading: 'Extract locally in the browser', paragraphs: ['A local PDF library reads page objects and text items from the selected file. The tool can group them into lines or paragraphs and export plain text or an editable document. Use the Network panel with a sample if you need to verify that the file is not uploaded.'] },
        { heading: 'Review reading order', paragraphs: ['PDF stores positioned items, not necessarily semantic paragraphs. Two-column layouts can interleave text, headers and footers can repeat, and tables can lose row structure. Compare the extracted output against representative pages before using it for search, summaries, or data import.'] },
        { heading: 'Use OCR for scanned pages', paragraphs: ['OCR converts image regions into characters and may run locally with a downloaded model. Accuracy depends on resolution, language, contrast, skew, handwriting, and layout. Names, totals, dates, legal clauses, and identifiers require manual verification.'] },
        { heading: 'Handle protected and sensitive documents', paragraphs: ['Respect document permissions and applicable law. A password-protected file may need to be opened legitimately before extraction. Remove unnecessary metadata from outputs, store extracted text securely, and remember that plain text may be easier to search and copy than the original PDF.'] },
      ],
      callout: { type: 'callout', title: 'Create an editable document locally', text: 'ToolGarden PDF to Word extracts supported PDF text in the browser and generates a DOCX for editing.', href: '/pdf/to-word', linkLabel: 'Open PDF to Word' },
      conclusion: 'Local PDF text extraction works best with a real text layer and a deliberate review step. Identify scans, verify reading order, apply OCR only when needed, protect the more portable output, and compare critical content against the source.',
      faq: [
        { question: 'Why does extracted PDF text appear in the wrong order?', answer: 'PDF often stores text as positioned fragments rather than semantic paragraphs. Columns, tables, headers, and drawing order can produce an output sequence that differs from visual reading order.' },
        { question: 'Can OCR run without uploading the PDF?', answer: 'Yes, some browser tools download an OCR model and run inference locally. Initial model download may require a connection, and recognized text still needs review.' },
      ],
    },
    {
      title: '在浏览器中提取 PDF 文本',
      excerpt: '使用本地 PDF 文本提取工具，理解可选文本与 OCR 的区别，保护隐私，并在复用前检查阅读顺序。',
      metaTitle: '本地 PDF 文本提取：在浏览器中导出文字',
      metaDescription: '在浏览器本地提取 PDF 文本，理解文本层与 OCR，保护私密文档，并检查分栏、表格和阅读顺序。',
      readingTime: '约 8 分钟阅读',
      tags: ['本地 PDF 文本提取', '提取 PDF 文字', 'PDF 隐私'],
      relatedTools: [{ label: 'PDF 转 Word', href: '/pdf/to-word', description: '在本地提取 PDF 文本并创建可编辑 Word 文档。' }, { label: 'PDF 提取页面', href: '/pdf/extract-pages', description: '在进一步处理前把选定页面复制到更小的 PDF。' }],
      lead: 'PDF 即使显示文字，也不一定把它存为可读取字符。文件包含文本层时，本地提取效果较好；只有图片的扫描件则需要 OCR，并进行更严格的准确性检查。',
      intro: '浏览器本地提取适合合同、论文、报告、发票和不应上传到陌生服务的内部文档。输出仍需检查，因为视觉顺序与逻辑阅读顺序并不总是一致。',
      sections: [
        { heading: '先确认 PDF 是否有文本层', paragraphs: ['在可信阅读器里尝试选择并复制一句话。如果能逐个选择字符，文件很可能包含文本；如果选中的是整页图片，则需要 OCR。部分文件在扫描图下方带有不够准确的隐藏 OCR 文本层。'] },
        { heading: '在浏览器中本地提取', paragraphs: ['本地 PDF 库会读取用户选择文件中的页面对象和文本项，工具可以把它们组合成行或段落，并导出纯文本或可编辑文档。隐私要求较高时，可以使用样本配合 Network 面板验证文件未上传。'] },
        { heading: '检查阅读顺序', paragraphs: ['PDF 保存的是定位后的内容项，不一定是语义段落。双栏页面可能把两栏交错，页眉页脚可能重复，表格也会失去行结构。用于搜索、摘要或数据导入前，应把提取结果与代表性页面对比。'] },
        { heading: '扫描页需要 OCR', paragraphs: ['OCR 会把图片区域识别为字符，也可以使用下载到本地的模型运行。准确率受分辨率、语言、对比度、倾斜、手写和版式影响。姓名、金额、日期、法律条款和标识符必须人工核对。'] },
        { heading: '处理受保护与敏感文档', paragraphs: ['应尊重文档权限和适用法律。密码保护文件可能需要通过合法方式打开后才能提取。输出中应移除不必要元数据并安全存储，因为纯文本通常比原 PDF 更容易搜索和复制。'] },
      ],
      callout: { type: 'callout', title: '在本地创建可编辑文档', text: 'ToolGarden PDF 转 Word 会在浏览器中提取支持的 PDF 文本，并生成可编辑 DOCX。', href: '/pdf/to-word', linkLabel: '打开 PDF 转 Word' },
      conclusion: '本地 PDF 文本提取在存在真实文本层并配合认真复核时效果最好。识别扫描件，检查阅读顺序，只在需要时使用 OCR，保护更易传播的输出，并把关键内容与源文件对照。',
      faq: [
        { question: '为什么提取的 PDF 文本顺序错误？', answer: 'PDF 经常把文字存为定位片段，而不是语义段落。分栏、表格、页眉和绘制顺序都可能让输出次序与视觉阅读顺序不同。' },
        { question: 'OCR 可以在不上传 PDF 的情况下运行吗？', answer: '可以。部分浏览器工具会下载 OCR 模型并在本地推理。首次下载模型可能需要网络，识别结果仍需检查。' },
      ],
    }
  ),
  article(
    'qr-code-subtitle-tools-guide',
    {
      title: 'QR Code & Subtitle Tools Guide',
      excerpt: 'Create reliable QR codes and edit or convert timed subtitles locally, with practical guidance for payloads, scan quality, timing, formats, and privacy.',
      metaTitle: 'QR Code and Subtitle Tools Guide: Local Workflows',
      metaDescription: 'A practical guide to local QR generation and decoding plus SRT, VTT, and LRC subtitle editing, timing, conversion, testing, and privacy.',
      readingTime: '10 min read',
      tags: ['QR code tools', 'subtitle tools', 'WiFi QR code', 'SRT to VTT'],
      relatedTools: [{ label: 'QR Code Generator', href: '/qr-code/generate', description: 'Generate URL, Wi-Fi, contact, and text QR codes locally.' }, { label: 'Subtitle Maker', href: '/subtitle-maker', description: 'Edit and convert SRT, VTT, and LRC subtitles with local media preview.' }],
      lead: 'QR codes and subtitle files look unrelated, but both are compact interchange formats where small syntax details control whether another device can understand the result.',
      intro: 'A Wi-Fi QR payload needs the right field escaping and enough visual contrast. A subtitle file needs precise timestamps, encoding, and cue order. Browser-local tools make both workflows easy to test without uploading network passwords, videos, audio, or subtitle drafts.',
      sections: [
        { heading: 'Choose the QR payload before styling', paragraphs: ['A QR code stores text. URLs, Wi-Fi credentials, vCards, email links, and plain text each use a different payload convention. Build and verify the payload first, then choose size, error correction, foreground color, background, and download format.'] },
        { heading: 'Make QR codes easy to scan', paragraphs: ['Use a quiet zone, strong contrast, sufficient pixel dimensions, and an error-correction level appropriate for the environment. Avoid shrinking dense payloads or placing codes over busy backgrounds. Always scan the exported image with more than one device when it will be printed or widely distributed.'] },
        { heading: 'Protect sensitive QR content', paragraphs: ['A QR code is not encryption. Anyone who can scan a Wi-Fi code can read the network name and password. Generate it locally, share it only with the intended audience, rotate credentials when needed, and do not publish private payloads simply because the text is encoded as a pattern.'] },
        { heading: 'Understand subtitle formats', paragraphs: ['SRT uses numbered cues and comma-separated milliseconds. WebVTT begins with WEBVTT, uses dot-separated milliseconds, and supports web-oriented cue settings. LRC is line-oriented and commonly used for lyrics. Converting the timestamps is straightforward, but styling and positioning may need separate handling.'] },
        { heading: 'Edit timing against local media', paragraphs: ['Load audio or video through an object URL, select each cue, and set start and end times from playback. Because the media can remain in the browser, private recordings do not need to be uploaded just to calibrate subtitles. Review overlaps, gaps, reading speed, line breaks, and the first and last cue.'] },
        { heading: 'Validate the exported result', paragraphs: ['Open the QR image or subtitle file in the real destination. For subtitles, confirm UTF-8 text, millisecond separators, cue order, multiline behavior, and player compatibility. For QR codes, test at final physical size and lighting rather than only on a large desktop preview.'] },
      ],
      callout: { type: 'callout', title: 'Work locally with compact formats', text: 'Generate QR codes or edit and convert subtitles directly in the browser, without uploading passwords, media, or subtitle files.', href: '/qr-code', linkLabel: 'Open QR tools' },
      conclusion: 'Reliable QR and subtitle workflows begin with valid source data, then add presentation. Build the right payload or timestamps, keep sensitive input local, test the actual exported artifact, and verify it in the device or player that will consume it. The cluster guides cover Wi-Fi QR codes and SRT to VTT conversion.',
      faq: [
        { question: 'Are QR codes secure?', answer: 'A QR code only encodes data. It does not encrypt the payload. Treat Wi-Fi passwords, access links, and personal contact details as visible to anyone who can scan the code.' },
        { question: 'Can subtitles be edited without uploading the video?', answer: 'Yes. A browser can preview a local audio or video file through an object URL while subtitle parsing, timing, and export stay on the device.' },
        { question: 'What is the main SRT and VTT difference?', answer: 'SRT normally uses cue numbers and commas for milliseconds. WebVTT starts with a WEBVTT header, uses dots for milliseconds, and supports additional web cue settings.' },
      ],
    },
    {
      title: '二维码与字幕工具指南',
      excerpt: '在本地生成可靠二维码并编辑或转换时间轴字幕，掌握 payload、扫描质量、时间、格式与隐私要点。',
      metaTitle: '二维码与字幕工具指南：浏览器本地工作流',
      metaDescription: '实用指南覆盖本地二维码生成与识别，以及 SRT、VTT、LRC 字幕编辑、计时、转换、测试和隐私。',
      readingTime: '约 10 分钟阅读',
      tags: ['二维码工具', '字幕工具', 'WiFi 二维码', 'SRT 转 VTT'],
      relatedTools: [{ label: '二维码生成', href: '/qr-code/generate', description: '在本地生成网址、Wi-Fi、联系人和文本二维码。' }, { label: '字幕制作', href: '/subtitle-maker', description: '结合本地媒体预览编辑并转换 SRT、VTT 和 LRC 字幕。' }],
      lead: '二维码和字幕文件看起来没有关联，但它们都是紧凑的交换格式，细小语法差异会直接决定另一台设备能否理解结果。',
      intro: 'Wi-Fi 二维码 payload 需要正确字段转义和足够视觉对比，字幕文件则需要精确时间戳、编码和 cue 顺序。浏览器本地工具可以方便测试两类流程，而且无需上传网络密码、视频、音频或字幕草稿。',
      sections: [
        { heading: '先确定二维码 payload，再设置样式', paragraphs: ['二维码实际存储文本。网址、Wi-Fi 凭据、vCard、邮件链接和普通文本分别有不同 payload 约定。应先构建并验证 payload，再选择尺寸、纠错等级、前景色、背景和下载格式。'] },
        { heading: '让二维码更容易扫描', paragraphs: ['保留静区，使用强对比，确保足够像素尺寸，并按环境选择纠错等级。不要把密集 payload 缩得过小，也不要把二维码放在复杂背景上。用于印刷或广泛分发前，应使用多台设备扫描导出图片。'] },
        { heading: '保护敏感二维码内容', paragraphs: ['二维码不是加密。任何可以扫描 Wi-Fi 码的人都能读取网络名称和密码。应在本地生成，只分享给目标用户，需要时轮换凭据，也不要因为文本变成图案就公开私密 payload。'] },
        { heading: '理解字幕格式', paragraphs: ['SRT 使用带编号的 cue 和逗号毫秒，WebVTT 以 WEBVTT 开头、使用点号毫秒，并支持网页 cue 设置；LRC 以行为单位，常用于歌词。转换时间戳并不复杂，但样式和定位可能需要另外处理。'] },
        { heading: '结合本地媒体编辑时间', paragraphs: ['通过 object URL 加载音频或视频，选择每个 cue，并从播放位置设置开始和结束时间。媒体可以留在浏览器中，私密录音无需为了校准字幕而上传。应检查重叠、空白、阅读速度、换行和首尾 cue。'] },
        { heading: '验证导出结果', paragraphs: ['在真实目标环境中打开二维码或字幕文件。字幕需要检查 UTF-8 文本、毫秒分隔符、cue 顺序、多行行为和播放器兼容；二维码则应按最终印刷尺寸与光线测试，而不只是看桌面大图。'] },
      ],
      callout: { type: 'callout', title: '在本地处理紧凑格式', text: '直接在浏览器中生成二维码，或编辑和转换字幕，无需上传密码、媒体或字幕文件。', href: '/qr-code', linkLabel: '打开二维码工具' },
      conclusion: '可靠的二维码和字幕流程都从有效源数据开始，再处理展示。构建正确 payload 或时间戳，让敏感输入留在本地，测试真实导出产物，并在最终设备或播放器中验证。下方集群指南会介绍 Wi-Fi 二维码和 SRT 转 VTT。',
      faq: [
        { question: '二维码安全吗？', answer: '二维码只是编码数据，不会加密 payload。Wi-Fi 密码、访问链接和个人联系信息，对任何能扫描二维码的人都可见。' },
        { question: '可以不上传视频就编辑字幕吗？', answer: '可以。浏览器可以通过 object URL 预览本地音频或视频，同时让字幕解析、计时和导出留在设备上。' },
        { question: 'SRT 与 VTT 的主要区别是什么？', answer: 'SRT 通常带 cue 编号并使用逗号表示毫秒；WebVTT 以 WEBVTT 头开始，使用点号表示毫秒，还支持额外的网页 cue 设置。' },
      ],
    }
  ),
  article(
    'srt-to-vtt-browser-workflow',
    {
      title: 'SRT to VTT Converter: Browser-Based Workflow',
      excerpt: 'Convert SRT to WebVTT locally by parsing cues, changing timestamp syntax, adding the WEBVTT header, and checking web-player compatibility.',
      metaTitle: 'SRT to VTT Converter: Browser-Based Local Workflow',
      metaDescription: 'Use an SRT to VTT converter in your browser without uploading media or subtitles. Learn timestamp changes, WEBVTT headers, cue settings, encoding, and validation.',
      readingTime: '8 min read',
      tags: ['SRT to VTT converter', 'WebVTT', 'subtitle converter', 'no upload'],
      relatedTools: [{ label: 'Subtitle Maker', href: '/subtitle-maker', description: 'Load, edit, preview, and convert SRT, VTT, and LRC subtitles locally.' }],
      lead: 'SRT and WebVTT describe timed text with similar cue blocks, so conversion is usually reliable when a tool parses timestamps rather than performing blind text replacement.',
      intro: 'A browser-based converter can read the SRT file, normalize cue order and timing, emit a WEBVTT header, change millisecond separators, and download the result without uploading either the subtitle or its media.',
      sections: [
        { heading: 'Know the format differences', paragraphs: ['An SRT cue commonly contains a numeric index, a time range such as 00:00:01,000 to 00:00:04,000, and text. A WebVTT file begins with WEBVTT and uses dots in timestamps, such as 00:00:01.000. Cue identifiers are optional, and WebVTT can carry settings for position, alignment, and style.'] },
        { heading: 'Use a parser-based conversion', paragraphs: ['Load or paste the SRT, parse each timing line, retain multiline cue text, sort cues by start time, and ensure each end time follows its start. Then export WebVTT with the required header and dot-separated milliseconds. This avoids changing commas that belong inside subtitle text.'] },
        { heading: 'Review settings and markup', paragraphs: ['Basic dialogue usually converts directly. SRT formatting tags, speaker labels, positioning conventions, and application-specific metadata may not map perfectly. WebVTT supports its own cue settings and limited inline markup, so advanced files need manual review.'] },
        { heading: 'Check encoding and line endings', paragraphs: ['Use UTF-8 so names and multilingual text survive. Browsers and most web players accept common line endings, but the first non-empty content should be the WEBVTT signature. Remove an unexpected byte-order mark if a strict player rejects the file.'] },
        { heading: 'Test in the target player', paragraphs: ['Attach the VTT file to the real HTML video, learning platform, or publishing system. Check the first cue, multiline text, overlapping timings, long reading durations, and the final cue. Conversion proves syntax, not presentation quality.'] },
        { heading: 'Keep media and subtitles local', paragraphs: ['The media file is not needed for syntax conversion, but it helps with timing review. A browser can preview local audio or video through an object URL, so private recordings and draft captions do not need to be uploaded.'] },
      ],
      callout: { type: 'callout', title: 'Convert SRT to VTT locally', text: 'Load SRT, switch the output to VTT, review cues with optional local media, and download the WebVTT file.', href: '/subtitle-maker', linkLabel: 'Open Subtitle Maker' },
      conclusion: 'Reliable SRT to VTT conversion parses cue structure, changes timestamp syntax, adds the WEBVTT signature, preserves text, and validates the result in the target player. Keep advanced styling under review and use local media preview when timing matters.',
      faq: [
        { question: 'Can I convert SRT to VTT by replacing commas with dots?', answer: 'That works only for very simple files and can change commas inside subtitle text. A parser-based converter changes timestamp fields specifically and also adds the required WEBVTT header.' },
        { question: 'Do I need to upload the video to convert subtitles?', answer: 'No. The subtitle syntax can be converted by itself. A local video is optional for timing review and can be previewed inside the browser without upload.' },
        { question: 'Why does a valid VTT file look wrong in my player?', answer: 'Syntax can be valid while cue settings, styling, line length, overlap, or player-specific behavior differs. Test the exported file in the final playback environment.' },
      ],
    },
    {
      title: 'SRT 转 VTT：浏览器本地转换流程',
      excerpt: '在本地解析 cue、修改时间戳语法、添加 WEBVTT 文件头，并检查网页播放器兼容性。',
      metaTitle: 'SRT 转 VTT 工具：浏览器本地工作流',
      metaDescription: '在浏览器中使用 SRT 转 VTT 工具，无需上传媒体或字幕，并了解时间戳、WEBVTT 文件头、cue 设置、编码与验证。',
      readingTime: '约 8 分钟阅读',
      tags: ['SRT 转 VTT', 'WebVTT', '字幕转换', '无需上传'],
      relatedTools: [{ label: '字幕制作', href: '/subtitle-maker', description: '在本地加载、编辑、预览并转换 SRT、VTT 和 LRC 字幕。' }],
      lead: 'SRT 和 WebVTT 都使用相似的时间文本 cue，因此只要工具真正解析时间戳，而不是盲目替换字符，转换通常很可靠。',
      intro: '浏览器转换器可以读取 SRT、规范化 cue 顺序和时间、输出 WEBVTT 文件头、修改毫秒分隔符并下载结果，全程无需上传字幕或对应媒体。',
      sections: [
        { heading: '了解格式差异', paragraphs: ['一个 SRT cue 通常包含数字编号、类似 00:00:01,000 到 00:00:04,000 的时间范围和文本。WebVTT 文件以 WEBVTT 开头，时间戳使用点号，例如 00:00:01.000。cue 标识可以省略，WebVTT 还支持位置、对齐和样式设置。'] },
        { heading: '使用基于解析器的转换', paragraphs: ['加载或粘贴 SRT，解析每条时间行，保留多行 cue 文本，按开始时间排序，并确保结束时间晚于开始时间。然后添加文件头并使用点号毫秒导出 WebVTT。这样不会误改字幕正文中的逗号。'] },
        { heading: '检查设置与标记', paragraphs: ['普通对白通常可以直接转换。SRT 格式标签、说话人标识、定位约定和应用特有元数据未必能完美映射。WebVTT 有自己的 cue 设置和有限行内标记，因此高级文件需要人工复核。'] },
        { heading: '检查编码和换行', paragraphs: ['使用 UTF-8 以保留姓名和多语言文字。浏览器和大多数网页播放器接受常见换行，但第一个非空内容应是 WEBVTT 标识。如果严格播放器拒绝文件，可以检查并移除意外 BOM。'] },
        { heading: '在目标播放器中测试', paragraphs: ['把 VTT 文件真正挂载到 HTML 视频、学习平台或发布系统，检查第一条 cue、多行文本、重叠时间、长阅读时长和最后一条 cue。语法转换成功不代表展示质量已经合格。'] },
        { heading: '让媒体和字幕留在本地', paragraphs: ['纯语法转换不需要媒体文件，但媒体有助于检查时间。浏览器可以通过 object URL 预览本地音视频，因此私密录音和字幕草稿无需上传。'] },
      ],
      callout: { type: 'callout', title: '在本地把 SRT 转为 VTT', text: '加载 SRT，把输出切换为 VTT，结合可选本地媒体检查 cue，然后下载 WebVTT 文件。', href: '/subtitle-maker', linkLabel: '打开字幕制作' },
      conclusion: '可靠的 SRT 转 VTT 会解析 cue 结构、修改时间戳语法、添加 WEBVTT 标识、保留文本，并在目标播放器中验证结果。高级样式需要复核，时间重要时应结合本地媒体预览。',
      faq: [
        { question: '把逗号替换成点号就能完成 SRT 转 VTT 吗？', answer: '只对非常简单的文件可能有效，而且会误改字幕正文中的逗号。基于解析器的转换会只修改时间戳字段，并添加必要的 WEBVTT 文件头。' },
        { question: '转换字幕需要上传视频吗？', answer: '不需要。字幕语法可以独立转换。本地视频只用于时间复核，也可以直接在浏览器中预览而不上传。' },
        { question: '为什么有效 VTT 在播放器中显示不对？', answer: '语法可以有效，但 cue 设置、样式、行长、重叠或播放器实现仍可能不同。应在最终播放环境中测试导出文件。' },
      ],
    }
  ),
];
