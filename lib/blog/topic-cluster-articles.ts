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
  publishedAt = '2026-07-20',
  updatedAt = publishedAt
): BlogArticle {
  return {
    slug,
    publishedAt,
    updatedAt,
    translations: {
      en: buildTranslation(en),
      zh: buildTranslation(zh),
    },
  };
}

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
];
