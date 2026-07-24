import type {
  BlogArticle,
  BlogArticleTranslation,
  BlogBlock,
  BlogFaqItem,
} from './articles';

interface GuideSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
  table?: Extract<BlogBlock, { type: 'table' }>;
  code?: Extract<BlogBlock, { type: 'code' }>;
  callout?: Extract<BlogBlock, { type: 'callout' }>;
}

interface GuideCopy {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  tags: string[];
  relatedTools: BlogArticleTranslation['relatedTools'];
  lead: string;
  intro: string;
  sections: GuideSection[];
  conclusion: string;
  faq: BlogFaqItem[];
}

function buildGuideTranslation(copy: GuideCopy): BlogArticleTranslation {
  const blocks: BlogBlock[] = [
    { type: 'lead', text: copy.lead },
    { type: 'paragraph', text: copy.intro },
  ];

  for (const section of copy.sections) {
    blocks.push({ type: 'heading', level: 2, text: section.heading });
    blocks.push(...section.paragraphs.map((text): BlogBlock => ({ type: 'paragraph', text })));
    if (section.table) blocks.push(section.table);
    if (section.code) blocks.push(section.code);
    if (section.items?.length) blocks.push({ type: 'list', items: section.items });
    if (section.callout) blocks.push(section.callout);
  }

  blocks.push(
    { type: 'heading', level: 2, text: /[一-鿿]/u.test(copy.title) ? '总结' : 'Key takeaways' },
    { type: 'paragraph', text: copy.conclusion }
  );

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

export const seoOptimizationGuideArticles = [
  {
    slug: '2026-seo-optimization-guide',
    publishedAt: '2026-07-23',
    updatedAt: '2026-07-23',
    translations: {
      zh: buildGuideTranslation({
        title: '2026年SEO优化指南：技术SEO、内容、AEO与GEO实战',
        excerpt: '以 ToolGarden 的真实工程实践为例，系统讲解双语 URL、canonical、hreflang、结构化数据、内容集群、性能，以及 AI 搜索时代应该做和不必做的优化。',
        metaTitle: '2026年SEO优化指南：技术SEO、内容与AEO/GEO',
        metaDescription: '结合 ToolGarden 浏览器本地隐私工具站实战，讲解技术SEO、内容集群、canonical、hreflang、JSON-LD、性能、AEO与GEO。',
        readingTime: '约 16 分钟阅读',
        tags: ['2026 SEO', '技术 SEO', 'AEO', 'GEO', 'Next.js', '搜索引擎优化'],
        relatedTools: [
          {
            label: 'ToolGarden 工具首页',
            href: '/',
            description: '查看注册中心如何驱动工具分类、入口、双语路径和发现页面。',
          },
          {
            label: 'JSON 工具包',
            href: '/json-tools',
            description: '查看 Hub 页面如何聚合工具、回答常见问题并建立主题相关性。',
          },
          {
            label: '开发者博客',
            href: '/blog',
            description: '浏览由文章注册表、主题集群、内部链接和结构化数据共同驱动的内容中心。',
          },
        ],
        lead: '2026 年的 SEO 核心没有被 AI 搜索推翻：让页面可抓取、可索引、意图明确、内容独特、体验稳定，并用一致的 URL 和结构化信号描述真实页面。AEO 和 GEO 不是替代 SEO 的新通道，而是同一套发现体系在回答式与生成式搜索界面中的延伸。',
        intro: '这篇指南不是通用清单的再次改写，而是以 ToolGarden 当前代码为样本，拆解一个双语工具站如何把 SEO 接入产品架构。项目把工具注册表、双语文案、页面、博客和生成脚本连接起来，让 metadata、sitemap、JSON-LD、robots 与 AI 发现文件尽量从同一事实源派生。文中也会区分已经实施的方案、仍需监测的指标，以及 2026 年已经失效或被夸大的做法。',
        sections: [
          {
            heading: '2026 年 SEO、AEO 与 GEO 的关系',
            paragraphs: [
              'Google 在 2026 年发布的生成式搜索优化指南明确表示，AI Overviews 和 AI Mode 仍建立在核心搜索索引、质量系统与检索增强生成之上。页面首先必须能够进入搜索索引，才有机会被生成式功能检索和引用。因此技术 SEO、内容质量、内部链接和页面体验仍然是基础。',
              'AEO 更关注内容能否直接、准确地回答问题，GEO 更关注生成式系统能否理解、检索并引用内容。它们改变的是内容被呈现和衡量的方式，而不是绕过抓取、索引和质量判断的捷径。',
            ],
            table: {
              type: 'table',
              headers: ['概念', '主要目标', '仍然依赖什么'],
              rows: [
                ['SEO', '获得可见、可点击的自然搜索结果', '抓取、索引、相关性、质量与体验'],
                ['AEO', '成为问题的清晰直接答案', '可索引内容、准确表达、实体与上下文'],
                ['GEO', '在生成式回答中被引用或推荐', '搜索索引、原创证据、可信来源与内容新鲜度'],
                ['Agent SEO', '让浏览器代理理解并完成任务', '可访问 DOM、明确交互、稳定状态与安全边界'],
              ],
            },
            callout: {
              type: 'callout',
              title: 'Google 2026 年生成式搜索官方指南',
              text: '官方指南说明传统 SEO 仍然有效，并专门澄清了 AEO、GEO、内容切块和 llms.txt 等常见误区。',
              href: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',
              linkLabel: '查看 Google 官方指南',
            },
          },
          {
            heading: '把 SEO 变成产品架构，而不是发布后的补丁',
            paragraphs: [
              'ToolGarden 使用注册中心驱动工具发现。一个工具的 id、路径、分类和基础描述只在 toolRegistry 中维护；中英文名称和说明来自 messages；页面、Hub、面包屑、sitemap、JSON-LD 和 llms 索引再从这些来源派生。这样新增工具时，不需要在多个 SEO 文件里重复复制名称和 URL。',
              '这类单一事实源的价值不只是减少开发工作。它还能避免页面已经改名、sitemap 仍保留旧地址，或者中文页面的结构化数据误用了英文标题等长期难以发现的问题。',
            ],
            table: {
              type: 'table',
              headers: ['事实源', '自动派生的发现入口', '主要避免的问题'],
              rows: [
                ['工具注册表', '首页卡片、Hub、导航、sitemap、工具 JSON-LD', '漏页、路径不一致、重复硬编码'],
                ['中英文 messages', '标题、描述、FAQ、Open Graph、工具文案', '语言混用、翻译结构不一致'],
                ['博客文章注册表', '博客列表、静态路由、Article JSON-LD、llms 文章索引', '文章孤岛、发布日期和索引脱节'],
                ['主题集群配置', 'Pillar/Cluster 导航、相关文章、about/hasPart 关系', '内部链接随机、主题权重分散'],
                ['统一 SEO helper', 'canonical、hreflang、title、description、OG', '不同页面采用不同规则'],
              ],
            },
            items: [
              '新增能力必须先进入注册表，再进入搜索和 AI 发现入口。',
              'SEO 文案必须描述真实功能边界，不能把“浏览器本地处理”写成“完全不联网”。',
              '构建时生成发现文件，使代码审查和生产输出使用同一份数据。',
            ],
          },
          {
            heading: '先匹配搜索意图，再设计页面类型',
            paragraphs: [
              '关键词不是把同一个短语重复写进标题和正文，而是识别用户真正想完成的任务。工具站常见意图可以分为立即操作、比较选择、故障排查和原理学习。每种意图应该落在不同页面，而不是让一个工具页承担所有内容。',
              'ToolGarden 将工具页作为任务终点，Hub 负责分类与选择，文章负责解释原理、场景和失败原因。文章通过相关工具入口把读者带回可执行任务，工具页再通过主题指南补充背景，形成闭环。',
            ],
            table: {
              type: 'table',
              headers: ['搜索意图', '合适页面', '页面必须提供的内容'],
              rows: [
                ['立即操作：在线格式化 JSON', '工具页', '快速输入、明确按钮、示例、错误反馈'],
                ['选择比较：WebP 和 AVIF 怎么选', '对比文章', '定义、数据表、兼容性、选择建议'],
                ['故障排查：JSON Unexpected token', '问题指南', '症状、原因、修复步骤、验证方式'],
                ['系统学习：JSON 工具完整指南', 'Pillar 页面', '概念地图、子主题入口、工具与文章导航'],
              ],
            },
            items: [
              '一个可索引 URL 只承载一个主要意图，避免多个近似页面互相竞争。',
              '标题回答“这是什么”，摘要回答“能解决什么”，正文证明“为什么可信”。',
              '内部链接使用描述性锚文本，并连接当前任务的上游知识与下游工具。',
            ],
          },
          {
            heading: '双语 URL、canonical 与 hreflang 必须表达同一套事实',
            paragraphs: [
              '项目使用 /zh 和 /en 作为明确语言前缀。每个语言页面设置自引用 canonical，同时通过 hreflang 互相声明，并把 x-default 指向默认语言版本。canonical 用来表达同语言内的首选 URL，hreflang 用来表达不同语言的对应关系，两者不能互相替代。',
              'Google 将重定向视为强 canonical 信号、rel=canonical 视为强信号、sitemap 收录视为较弱信号。三处应保持一致。不要在 sitemap 中提交一个 URL，却在页面 canonical 中指向另一个 URL；也不要用 robots.txt 处理 canonical。',
              'meta keywords 不应被当作 Google 排名手段。项目中的文章 tags 和工具关键词主要用于内容组织、相关文章计算和其他消费端，真正影响页面理解的仍是标题、正文、链接和一致的实体信息。',
            ],
            code: {
              type: 'code',
              language: 'ts',
              code: `alternates: {
  canonical: \`/\${locale}\${path}\`,
  languages: {
    en: \`/en\${path}\`,
    zh: \`/zh\${path}\`,
    'x-default': \`/en\${path}\`,
  },
}`,
            },
            callout: {
              type: 'callout',
              title: '检查 canonical 的信号是否一致',
              text: 'Google 官方文档解释了重定向、rel=canonical 与 sitemap 的信号强度，以及多语言页面选择 canonical 时的注意事项。',
              href: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
              linkLabel: '查看 canonical 官方文档',
            },
          },
          {
            heading: '抓取与索引：sitemap、robots、404 和重定向各司其职',
            paragraphs: [
              'sitemap 是发现清单，不是收录保证；robots.txt 控制抓取，不负责删除页面或合并重复 URL；noindex 控制页面是否进入索引；404/410 表示资源不存在；301/308 才用于永久迁移。混用这些机制会产生“页面被屏蔽却仍显示 URL”或“旧页面长期不退出索引”等问题。',
              '当前项目的 sitemap 从 Hub、站点页面、文章注册表和工具注册表合并生成，包含中英文绝对 URL、语言替代关系和文章更新时间。robots.txt 允许公开页面、阻止 API 路径并声明 sitemap。自定义 404 返回真实 404，同时添加 noindex,follow，让用户仍可通过推荐工具继续浏览。',
            ],
            table: {
              type: 'table',
              headers: ['机制', '正确职责', '不能替代什么'],
              rows: [
                ['sitemap.xml', '列出希望被发现的 canonical URL 和更新时间', '不能保证索引或排名'],
                ['robots.txt', '控制爬虫是否请求某类路径', '不能可靠删除已索引 URL，也不能 canonicalize'],
                ['noindex', '允许抓取后要求不进入索引', '不能用于合并重复页面信号'],
                ['404/410', '表示页面不存在或已移除', '不能用于仍有替代页面的迁移'],
                ['301/308', '把旧 URL 永久迁移到最相关新 URL', '不能把所有失效页统一跳到首页'],
              ],
            },
            items: [
              '只把可访问、可索引、返回 200 的首选 URL 放进 sitemap。',
              '发布后抽查 HTTP 状态、canonical、hreflang 和 sitemap URL 是否完全一致。',
              '删除页面时判断是有明确替代内容、永久消失，还是暂时不可用，再选择重定向、410 或 503。',
            ],
          },
          {
            heading: '结构化数据要描述可见内容，而不是制造隐藏内容',
            paragraphs: [
              'ToolGarden 在站点层使用 Organization、WebSite 和 WebApplication，在 Hub 使用 ItemList，在工具页使用 WebApplication 与 BreadcrumbList，在文章页使用 BlogPosting、BreadcrumbList，并从页面可见 FAQ 生成 FAQPage。所有名称、URL、描述和发布日期都来自页面使用的同一份数据。',
              '结构化数据的作用是减少歧义和取得适用的搜索展示资格，不是通用排名按钮，也不是生成式搜索专用标记。字段必须与页面可见内容一致；不存在的评分、价格、作者或功能不能为了“丰富结果”写进 JSON-LD。',
              '2026 年 5 月起，Google 已停止展示 FAQ 富结果。页面中的 FAQ 仍可帮助用户、站内检索和其他消费者理解常见问题，但不应再以获得 Google FAQ 展示为目标，也不必为每一页机械添加大量问答。',
            ],
            table: {
              type: 'table',
              headers: ['页面类型', '适合的 Schema', '需要保持一致的字段'],
              rows: [
                ['站点首页', 'Organization、WebSite、WebApplication', '品牌、URL、Logo、语言与真实产品'],
                ['工具 Hub', 'CollectionPage 或 ItemList', '列表顺序、名称、链接和可见卡片'],
                ['单个工具', 'WebApplication、BreadcrumbList', '功能、价格、操作系统、面包屑'],
                ['博客文章', 'BlogPosting、BreadcrumbList', '标题、作者、发布日期、更新时间'],
                ['可见问答', 'FAQPage（其他消费者可用）', '问题与回答必须出现在页面中'],
              ],
            },
            callout: {
              type: 'callout',
              title: '遵循结构化数据通用规则',
              text: '先保证标记代表页面的主要可见内容，再使用 Rich Results Test 和 Schema 校验工具检查语法与适用资格。',
              href: 'https://developers.google.com/search/docs/appearance/structured-data/sd-policies',
              linkLabel: '查看结构化数据官方规则',
            },
          },
          {
            heading: '内容 SEO：用真实经验建立不可替代性',
            paragraphs: [
              '2026 年最有价值的内容不是把公开资料换一种说法，而是提供别人无法低成本复制的证据。对工具站来说，这些证据包括真实实现代码、浏览器兼容性、性能边界、失败样本、测试文件、转换损失和安全限制。',
              '项目现有文章从工具实现反推选题，例如 FFmpeg.wasm 的虚拟文件系统、Whisper 的浏览器推理、Open XML 的文档合并和 PDF 文本层恢复。这类文章同时具备搜索需求、产品相关性和一手经验，比批量生成“十个最佳工具”更容易建立长期主题权威。',
            ],
            items: [
              'Pillar 解释完整知识地图，Cluster 深入一个问题，工具页完成实际任务。',
              '新文章至少提供一个原创示例、对比表、失败原因或可复现验证过程。',
              '相近文章先判断能否合并更新，避免标题不同但答案几乎相同的关键词内耗。',
              '保留真实发布日期；只有内容发生实质变化时才更新 updatedAt。',
              '作者、关于页面、隐私与安全说明应让读者知道内容由谁维护、数据如何处理。',
            ],
          },
          {
            heading: 'AEO 与 GEO：让答案可引用，但不要追逐伪技巧',
            paragraphs: [
              '适合回答式和生成式搜索的内容通常有一个共同特征：读者不用猜作者的结论。文章应在开头直接回答核心问题，再用定义、条件、数据、示例和来源支撑，而不是先写数百字背景后才给答案。',
              '实体名称、工具能力、语言版本和 URL 应在正文、metadata、结构化数据与站内链接中保持一致。清晰的小标题、表格和步骤能提升可读性，但 Google 明确表示不需要为了 AI 把文章强行切成极小片段，也不需要覆盖每一种长尾问法。',
              '项目会从注册表生成 llms.txt 和 llms-full.txt，便于支持这些文件的其他系统发现工具与文章，也能作为构建时一致性检查。Google 在 2026 年官方指南中明确表示 Google Search 不使用 llms.txt；它既不会提升也不会降低 Google 排名，因此不能把它当成 GEO 成功指标。',
            ],
            items: [
              '首段给出可独立理解的直接答案。',
              '对概念写清适用条件、限制和例外，不只给绝对结论。',
              '引用官方标准和一手数据，明确区分事实、经验与推断。',
              '用真实页面中的 FAQ 回答用户问题，不为 Schema 批量制造问答。',
              '监测真实引用、入口与转化，不使用无法验证的“AI 可见度分数”。',
            ],
          },
          {
            heading: '性能和广告：优化真实体验，而不是只追 Lighthouse 分数',
            paragraphs: [
              '当前核心 Web 指标仍是 LCP、INP 和 CLS。推荐目标是在移动端和桌面端各自的第 75 百分位达到 LCP 不超过 2.5 秒、INP 不超过 200 毫秒、CLS 不超过 0.1。实验室测试适合阻止回归，真实用户数据才代表最终体验。',
              'ToolGarden 使用静态导出降低文档首屏成本，对带哈希的静态资源设置长期缓存，并对模型、worker 和大型运行时采用按需加载。分析和 AdSense 脚本异步加载，但异步不代表没有性能代价；仍需监测主线程、网络竞争和同意管理带来的影响。',
              '广告区域应预留稳定尺寸，避免广告加载后把正文推开造成 CLS。核心任务按钮和输入区域不能被广告遮挡，移动端尤其要避免首屏主要内容被第三方模块挤出视口。',
            ],
            table: {
              type: 'table',
              headers: ['指标', '2026 推荐目标', '工具站常见优化'],
              rows: [
                ['LCP', '≤ 2.5 秒', '静态 HTML、关键 CSS、延迟加载重型编辑器和模型'],
                ['INP', '≤ 200 毫秒', 'Web Worker、任务取消、减少主线程 JSON/媒体处理'],
                ['CLS', '≤ 0.1', '预留图片与广告空间、稳定字体和工具面板尺寸'],
                ['资源成本', '按任务控制', '缓存 WASM/worker/model，离开页面后释放 Blob URL'],
              ],
            },
            callout: {
              type: 'callout',
              title: '用字段数据判断页面体验',
              text: 'web.dev 给出了 LCP、INP、CLS 的当前阈值，并建议同时使用 CrUX、Search Console、真实用户监测和实验室工具。',
              href: 'https://web.dev/articles/vitals',
              linkLabel: '查看 Core Web Vitals 指南',
            },
          },
          {
            heading: '监测闭环：从收录到引用，再到真实任务完成',
            paragraphs: [
              'SEO 不是构建通过就结束。Google Search Console 用于检查索引、sitemap、查询、页面体验和生成式搜索表现；Bing Webmaster Tools 在 2026 年提供 AI Performance 预览，可观察页面在 Copilot、Bing AI 摘要和合作体验中的引用；百度站长平台则适合中文 URL 的主动提交与抓取诊断。',
              '项目已经具备 Google Analytics 配置、百度验证与 URL 提交脚本。下一步可以根据实际流量接入 Search Console、Bing Webmaster Tools 和 IndexNow，并把发布、更新、删除事件连接到提交流程，而不是定期无差别重复推送全部 URL。',
            ],
            table: {
              type: 'table',
              headers: ['频率', '检查项目', '需要回答的问题'],
              rows: [
                ['每次发布', '状态码、canonical、hreflang、JSON-LD、sitemap', '新页面是否能被正确发现和解释？'],
                ['每周', '索引覆盖、抓取错误、热门查询、404', '是否有技术问题阻止增长？'],
                ['每月', '点击率、落地页、CWV、引用和转化', '哪些内容带来有价值的任务完成？'],
                ['每季度', '内容重叠、过期文章、内部链接和主题空白', '应该更新、合并、删除还是扩展？'],
              ],
            },
            callout: {
              type: 'callout',
              title: '2026 年开始直接监测 AI 引用',
              text: 'Bing Webmaster Tools 的 AI Performance 会报告总引用量、被引用页面和趋势，可作为 GEO 结果的可验证数据之一。',
              href: 'https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview',
              linkLabel: '查看 Bing 官方说明',
            },
          },
          {
            heading: '2026 SEO 发布检查清单',
            paragraphs: [
              '下面这份清单适合放进 CI、Pull Request 模板或内容发布流程。它检查的是可验证输出，而不是模糊的 SEO 分数。',
            ],
            items: [
              '页面返回正确的 200、3xx、404 或 410 状态，不使用软 404。',
              'title、description、H1 和正文准确表达同一个主要意图。',
              'canonical 自引用且与 sitemap、内部链接中的 URL 完全一致。',
              '中英文页面 reciprocal hreflang 完整，x-default 指向默认版本。',
              'robots 没有阻止需要索引的页面与渲染资源。',
              '结构化数据与页面可见内容一致，并通过语法校验。',
              '新页面从 Hub、相关文章或导航获得至少一个可抓取内部链接。',
              '文章包含原创示例、测试、比较或明确来源，不只是公开资料摘要。',
              '图片包含明确尺寸和替代文本，广告位预留空间。',
              '重型模型、WASM、编辑器和媒体库按需加载，不阻塞文章首屏。',
              '移动端完成一次真实任务，检查按钮、输入、下载和错误状态。',
              '构建后验证 sitemap、robots、llms 文件和静态 HTML 输出。',
              '发布后在站长平台检查索引与抓取，并记录基线数据。',
            ],
          },
        ],
        conclusion: '2026 年有效的 SEO 不是增加更多标签，而是让产品、内容和发现信号保持一致。ToolGarden 的核心方法是把注册表和双语文案作为事实源，再自动派生 metadata、canonical、hreflang、sitemap、结构化数据和文章关系；同时用静态输出、按需加载和真实监测保证用户体验。AEO 与 GEO 可以改变答案的呈现位置，但无法替代可抓取页面、原创证据、清晰意图和长期维护。',
        faq: [
          {
            question: '2026 年 AEO 和 GEO 会取代传统 SEO 吗？',
            answer: '不会。Google 官方说明生成式搜索仍依赖核心搜索索引和质量系统。AEO、GEO 更强调直接回答、可引用证据和生成式界面的监测，但页面仍要先满足抓取、索引、相关性、质量与体验要求。',
          },
          {
            question: 'llms.txt 能提高 Google 或 AI 搜索排名吗？',
            answer: '不能提高 Google Search 排名。Google 在 2026 年官方指南中明确表示不使用 llms.txt，它对 Google 可见度既没有正面也没有负面影响。可以为明确支持它的其他系统维护该文件，但必须从真实内容自动生成，不能替代 HTML、sitemap 和内部链接。',
          },
          {
            question: 'canonical 和 301 重定向应该怎么选？',
            answer: '旧 URL 不再需要访问时使用永久重定向；多个相似版本必须继续存在时使用 rel=canonical 表达首选版本。Google 将重定向和 rel=canonical 都视为强信号，而 sitemap 是较弱信号。所有信号应指向同一个首选 URL。',
          },
          {
            question: 'FAQPage 结构化数据在 2026 年还有用吗？',
            answer: 'Google 已在 2026 年 5 月停止 FAQ 富结果展示，因此不应以获得 FAQ 搜索样式为目标。真实、可见的 FAQ 仍能改善用户体验，并可能被站内搜索或其他消费者使用；保留时必须确保结构化数据与页面回答完全一致。',
          },
          {
            question: '提交 sitemap 后为什么页面仍未被收录？',
            answer: 'sitemap 只帮助发现 URL，不保证收录。还要检查页面是否返回 200、是否允许抓取、canonical 是否指向自己、内容是否独特且有价值、内部链接是否可达，以及是否存在软 404、重复内容或渲染问题。',
          },
          {
            question: '双语网站每种语言都需要独立 canonical 吗？',
            answer: '需要。中文页 canonical 指向中文首选 URL，英文页 canonical 指向英文首选 URL，再用 reciprocal hreflang 互相连接，并为 x-default 指定默认版本。不要让所有语言页面 canonical 到同一个英文 URL。',
          },
        ],
      }),
      en: buildGuideTranslation({
        title: '2026 SEO Optimization Guide: Technical SEO, Content, AEO, and GEO',
        excerpt: 'A practical guide based on ToolGarden’s production architecture, covering localized URLs, canonical and hreflang, structured data, topic clusters, performance, and what AI search does and does not change.',
        metaTitle: '2026 SEO Guide: Technical, Content & AI Search',
        metaDescription: 'A practical 2026 SEO guide based on a privacy-first browser tool site, covering technical SEO, content clusters, canonical, hreflang, JSON-LD, AEO, and GEO.',
        readingTime: '16 min read',
        tags: ['2026 SEO', 'technical SEO', 'AEO', 'GEO', 'Next.js', 'search optimization'],
        relatedTools: [
          {
            label: 'ToolGarden home',
            href: '/',
            description: 'See how one registry drives tool categories, navigation, localized routes, and discovery pages.',
          },
          {
            label: 'JSON tools',
            href: '/json-tools',
            description: 'Inspect a hub that groups tools, answers common questions, and builds topical relevance.',
          },
          {
            label: 'Developer blog',
            href: '/blog',
            description: 'Browse a content hub driven by an article registry, topic clusters, internal links, and structured data.',
          },
        ],
        lead: 'SEO in 2026 has not been replaced by AI search. Pages still need to be crawlable, indexable, focused on a clear intent, genuinely useful, and stable to use, with consistent URLs and semantic signals that describe the real page. AEO and GEO extend this discovery system into answer and generative interfaces; they do not bypass it.',
        intro: 'This guide uses the current ToolGarden codebase as a working example of how a bilingual utility site can make SEO part of the product architecture. Tool metadata, translations, pages, blog records, and build scripts feed metadata, sitemaps, JSON-LD, robots directives, and optional AI discovery files from shared sources. It also separates implemented practices from measurements that still require production data and from tactics that became obsolete or overstated in 2026.',
        sections: [
          {
            heading: 'How SEO, AEO, and GEO fit together in 2026',
            paragraphs: [
              'Google’s 2026 guide to generative search states that AI Overviews and AI Mode still depend on the core Search index, ranking and quality systems, retrieval-augmented generation, and related query fan-out. A page must first be eligible for indexing before a generative feature can retrieve and cite it. Technical SEO, content quality, internal linking, and page experience therefore remain foundational.',
              'AEO emphasizes whether a page gives a direct, accurate answer. GEO emphasizes whether generative systems can understand, retrieve, and cite the page. They change how visibility is presented and measured, not the requirement to earn discovery and trust.',
            ],
            table: {
              type: 'table',
              headers: ['Discipline', 'Primary goal', 'Still depends on'],
              rows: [
                ['SEO', 'Earn visible, clickable organic results', 'Crawling, indexing, relevance, quality, and experience'],
                ['AEO', 'Provide a clear direct answer', 'Indexable content, accurate language, entities, and context'],
                ['GEO', 'Be cited or recommended in generated answers', 'Search indexes, original evidence, trustworthy sources, and freshness'],
                ['Agent SEO', 'Help browser agents understand and complete tasks', 'Accessible DOM, explicit controls, stable state, and safe boundaries'],
              ],
            },
            callout: {
              type: 'callout',
              title: 'Google’s official 2026 generative search guide',
              text: 'The guide confirms that established SEO still applies and directly addresses misconceptions about AEO, GEO, content chunking, and llms.txt.',
              href: 'https://developers.google.com/search/docs/fundamentals/ai-optimization-guide',
              linkLabel: 'Read the Google guide',
            },
          },
          {
            heading: 'Make SEO part of the product architecture',
            paragraphs: [
              'ToolGarden drives tool discovery from a registry. A tool’s id, route, category, and base description live in toolRegistry; English and Chinese names come from messages; pages, hubs, breadcrumbs, sitemap entries, JSON-LD, and generated llms indexes derive from those sources. Adding a tool does not require copying its name and URL into a separate stack of SEO files.',
              'A single source of truth is not merely a developer convenience. It prevents long-lived defects such as a renamed page with a stale sitemap entry, an English title in Chinese structured data, or a related article pointing at a route that no longer exists.',
            ],
            table: {
              type: 'table',
              headers: ['Source of truth', 'Derived discovery surfaces', 'Main failure prevented'],
              rows: [
                ['Tool registry', 'Home cards, hubs, navigation, sitemap, tool JSON-LD', 'Missing pages, inconsistent routes, duplicate metadata'],
                ['Localized messages', 'Titles, descriptions, FAQs, Open Graph, visible copy', 'Mixed languages and mismatched translation structures'],
                ['Blog article registry', 'Blog index, static routes, Article JSON-LD, llms article index', 'Orphan articles and stale dates'],
                ['Topic cluster config', 'Pillar/cluster navigation, related content, about/hasPart links', 'Random internal links and diluted topics'],
                ['Shared SEO helpers', 'Canonical, hreflang, title, description, and Open Graph', 'Different rules on different page types'],
              ],
            },
            items: [
              'Register a capability before exposing it through search and AI discovery surfaces.',
              'Make SEO copy describe the real technical boundary; browser-local processing does not mean the page never makes a network request.',
              'Generate discovery artifacts during the build so reviews and production output use the same source data.',
            ],
          },
          {
            heading: 'Match search intent before choosing a page type',
            paragraphs: [
              'Keywords are not instructions to repeat one phrase in the title and body. They represent the task a visitor is trying to complete. Utility-site intent usually falls into immediate action, comparison, troubleshooting, and conceptual learning. Each intent deserves a suitable page instead of forcing one tool page to carry every explanation.',
              'ToolGarden treats tool pages as task destinations, hubs as category and choice pages, and articles as explanations of concepts, workflows, and failure modes. Articles link into executable tools, while tools point back to relevant guides, creating a usable loop rather than a collection of isolated landing pages.',
            ],
            table: {
              type: 'table',
              headers: ['Search intent', 'Best page type', 'Required content'],
              rows: [
                ['Action: format JSON online', 'Tool page', 'Fast input, clear action, example, and error feedback'],
                ['Comparison: WebP or AVIF', 'Comparison article', 'Definitions, data table, compatibility, and recommendation'],
                ['Troubleshooting: JSON Unexpected token', 'Problem guide', 'Symptoms, causes, repair steps, and verification'],
                ['Learning: complete JSON tools guide', 'Pillar page', 'Concept map, subtopics, tools, and article navigation'],
              ],
            },
            items: [
              'Give each indexable URL one primary intent so near-duplicate pages do not compete.',
              'Let the title state what the page is, the excerpt state what it solves, and the body prove why it is trustworthy.',
              'Use descriptive internal-link anchors to connect prerequisite knowledge, the current explanation, and the next tool action.',
            ],
          },
          {
            heading: 'Localized URLs, canonical, and hreflang must agree',
            paragraphs: [
              'The site uses explicit /en and /zh prefixes. Every localized page has a self-referencing canonical, reciprocal hreflang annotations, and an x-default pointing to the default locale. Canonical identifies the preferred URL within a language; hreflang connects corresponding language versions. One cannot replace the other.',
              'Google describes redirects as a strong canonical signal, rel=canonical as a strong signal, and sitemap inclusion as a weaker signal. All three should agree. Do not submit one URL in a sitemap while a page canonicalizes elsewhere, and do not use robots.txt for canonicalization.',
              'The meta keywords field is not a Google ranking lever. Article tags and tool keywords can still organize content, score related articles, and serve other consumers, but titles, visible copy, links, and consistent entities do the real explanatory work.',
            ],
            code: {
              type: 'code',
              language: 'ts',
              code: `alternates: {
  canonical: \`/\${locale}\${path}\`,
  languages: {
    en: \`/en\${path}\`,
    zh: \`/zh\${path}\`,
    'x-default': \`/en\${path}\`,
  },
}`,
            },
            callout: {
              type: 'callout',
              title: 'Keep canonical signals consistent',
              text: 'Google’s documentation explains the relative strength of redirects, rel=canonical, and sitemap inclusion, including multilingual canonical guidance.',
              href: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
              linkLabel: 'Read the canonical documentation',
            },
          },
          {
            heading: 'Crawling and indexing: give every mechanism one job',
            paragraphs: [
              'A sitemap is a discovery inventory, not an indexing guarantee. Robots.txt controls crawling, not deletion or canonicalization. Noindex controls index eligibility. A 404 or 410 says a resource is gone. A 301 or 308 performs a permanent move. Mixing these controls creates URLs that remain visible without content or old pages that never consolidate.',
              'The current sitemap merges hubs, site pages, blog records, and tool registry routes, emitting absolute English and Chinese URLs, language alternates, and article modification dates. Robots.txt permits public pages, excludes API paths, and advertises the sitemap. The custom not-found page returns a real 404 with noindex,follow while still helping visitors continue to registry-derived tools.',
            ],
            table: {
              type: 'table',
              headers: ['Mechanism', 'Correct responsibility', 'Does not replace'],
              rows: [
                ['sitemap.xml', 'List canonical URLs and meaningful modification dates', 'Indexing or ranking guarantees'],
                ['robots.txt', 'Control crawler requests to path groups', 'Removal or canonicalization'],
                ['noindex', 'Request exclusion after a crawler reads the page', 'Consolidating duplicate signals'],
                ['404/410', 'Declare that a resource is missing or removed', 'A migration with a relevant replacement'],
                ['301/308', 'Permanently move an old URL to its closest replacement', 'Redirecting every dead page to the home page'],
              ],
            },
            items: [
              'Include only accessible, indexable, 200-status preferred URLs in the sitemap.',
              'After release, compare status, canonical, hreflang, internal links, and sitemap URLs exactly.',
              'When removing a page, choose redirect, 410, or 503 based on whether a replacement exists and whether the condition is permanent.',
            ],
          },
          {
            heading: 'Structured data must describe visible content',
            paragraphs: [
              'ToolGarden uses Organization, WebSite, and WebApplication at the site level; ItemList on hubs; WebApplication and BreadcrumbList on tools; and BlogPosting plus BreadcrumbList on articles. Visible FAQs can also produce FAQPage data. Names, URLs, descriptions, and dates come from the same records used to render the page.',
              'Structured data reduces ambiguity and may establish eligibility for an applicable search presentation. It is not a universal ranking button or special generative-search markup. Every field must match the primary visible content; invented ratings, prices, authors, or features do not become true because they appear in JSON-LD.',
              'Google stopped showing FAQ rich results in May 2026. Visible FAQs can still help visitors, site search, and other consumers, but they should no longer be created for a Google FAQ presentation or mass-produced on every page.',
            ],
            table: {
              type: 'table',
              headers: ['Page type', 'Suitable schema', 'Fields that must agree'],
              rows: [
                ['Site home', 'Organization, WebSite, WebApplication', 'Brand, URL, logo, languages, and real product'],
                ['Tool hub', 'CollectionPage or ItemList', 'Visible card order, names, and links'],
                ['Individual tool', 'WebApplication, BreadcrumbList', 'Features, price, operating system, and breadcrumbs'],
                ['Blog article', 'BlogPosting, BreadcrumbList', 'Headline, author, publication date, and modification date'],
                ['Visible Q&A', 'FAQPage for other consumers', 'Questions and answers shown on the page'],
              ],
            },
            callout: {
              type: 'callout',
              title: 'Follow the general structured data policies',
              text: 'Mark up the page’s primary visible content first, then validate syntax and feature eligibility with official testing tools.',
              href: 'https://developers.google.com/search/docs/appearance/structured-data/sd-policies',
              linkLabel: 'Read the structured data policies',
            },
          },
          {
            heading: 'Content SEO: publish evidence competitors cannot cheaply copy',
            paragraphs: [
              'The most defensible content in 2026 is not a paraphrase of public documentation. It contributes evidence that is difficult to reproduce without doing the work: implementation code, browser compatibility, performance boundaries, failed fixtures, test files, conversion losses, and security constraints.',
              'Existing ToolGarden articles start with real features: FFmpeg.wasm virtual file handling, browser Whisper inference, Open XML document merging, and PDF text-layer recovery. These subjects combine real demand, product relevance, and first-hand engineering knowledge more effectively than mass-produced lists of the ten best tools.',
            ],
            items: [
              'Use a pillar to map the subject, clusters to answer one deep question, and tools to complete the task.',
              'Give every new article an original example, benchmark, comparison, failure analysis, or reproducible verification.',
              'Review similar pages for consolidation before publishing another title with nearly the same answer.',
              'Keep the real publication date and change updatedAt only after a substantial revision.',
              'Use author, About, privacy, and security pages to explain who maintains the content and how user data is handled.',
            ],
          },
          {
            heading: 'AEO and GEO: make answers citable without chasing hacks',
            paragraphs: [
              'Answer-friendly and generative-search-friendly pages tend to make their conclusion easy to find. State the core answer early, then support it with definitions, conditions, data, examples, and sources. Do not bury the useful answer after hundreds of words of generic scene-setting.',
              'Entity names, capabilities, localized routes, visible copy, metadata, structured data, and internal links should agree. Helpful headings, tables, and steps improve readability, but Google says there is no need to split content into tiny AI chunks or publish a page for every long-tail query variation.',
              'The project generates llms.txt and llms-full.txt from its registries for other systems that choose to consume them and as a build-time consistency artifact. Google’s 2026 guidance explicitly says Google Search does not use llms.txt; it neither helps nor harms Google visibility and should never be reported as a GEO ranking win.',
            ],
            items: [
              'Put a self-contained direct answer near the beginning.',
              'State scope, limitations, and exceptions instead of giving an absolute claim without conditions.',
              'Cite primary standards and first-party evidence, separating fact, experience, and inference.',
              'Use FAQs to answer real user problems, not to manufacture schema at scale.',
              'Measure real citations, entrances, and completed tasks rather than opaque AI visibility scores.',
            ],
          },
          {
            heading: 'Performance and ads: optimize real experience',
            paragraphs: [
              'The current Core Web Vitals are LCP, INP, and CLS. Recommended targets at the 75th percentile, separately for mobile and desktop, remain LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1. Lab tests prevent regressions; field data represents the experience people actually receive.',
              'ToolGarden uses static export to reduce document startup cost, long-lived caching for hashed assets, and on-demand loading for models, workers, editors, and media runtimes. Analytics and AdSense scripts load asynchronously, but async third-party code still consumes network and main-thread resources and must be measured.',
              'Reserve stable dimensions for ad placements so late ad rendering does not push the article down and create CLS. Ads must not cover the primary input or action, especially when a mobile viewport already has limited space.',
            ],
            table: {
              type: 'table',
              headers: ['Metric', '2026 target', 'Typical utility-site optimization'],
              rows: [
                ['LCP', '≤ 2.5 s', 'Static HTML, critical styles, delayed editors and models'],
                ['INP', '≤ 200 ms', 'Workers, cancellation, and less JSON/media work on the main thread'],
                ['CLS', '≤ 0.1', 'Reserved image and ad space, stable fonts and panels'],
                ['Resource cost', 'Bounded per task', 'Cached WASM/worker/model assets and released Blob URLs'],
              ],
            },
            callout: {
              type: 'callout',
              title: 'Use field data to judge page experience',
              text: 'web.dev documents the current LCP, INP, and CLS thresholds and recommends combining CrUX, Search Console, real-user monitoring, and lab tools.',
              href: 'https://web.dev/articles/vitals',
              linkLabel: 'Read the Core Web Vitals guide',
            },
          },
          {
            heading: 'Close the measurement loop from indexing to citations',
            paragraphs: [
              'SEO does not end when the build passes. Google Search Console covers indexing, sitemaps, queries, page experience, and generative search reporting. Bing Webmaster Tools introduced AI Performance in 2026 to expose citations across Copilot, Bing AI summaries, and selected partner experiences. Baidu Webmaster tools remain relevant for proactive submission and crawl diagnosis of Chinese URLs.',
              'The project already contains Google Analytics configuration, Baidu verification, and a Baidu URL submission script. Depending on production traffic, the next step is to connect Search Console, Bing Webmaster Tools, and IndexNow to publish, update, and delete events instead of blindly resubmitting every URL on a schedule.',
            ],
            table: {
              type: 'table',
              headers: ['Cadence', 'Review', 'Question to answer'],
              rows: [
                ['Every release', 'Status, canonical, hreflang, JSON-LD, sitemap', 'Can the new page be discovered and interpreted correctly?'],
                ['Weekly', 'Coverage, crawl errors, queries, and 404s', 'Is a technical defect blocking growth?'],
                ['Monthly', 'CTR, landing pages, CWV, citations, and conversions', 'Which content produces useful completed tasks?'],
                ['Quarterly', 'Overlap, stale content, internal links, and topic gaps', 'Should a page be updated, merged, removed, or expanded?'],
              ],
            },
            callout: {
              type: 'callout',
              title: 'Measure AI citations directly in 2026',
              text: 'Bing Webmaster Tools AI Performance reports citation totals, cited pages, and trends, providing one verifiable GEO outcome.',
              href: 'https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview',
              linkLabel: 'Read the Bing announcement',
            },
          },
          {
            heading: '2026 SEO release checklist',
            paragraphs: [
              'This checklist belongs in CI, a pull request template, or the publishing workflow. It tests observable output instead of an opaque SEO score.',
            ],
            items: [
              'Return the correct 200, 3xx, 404, or 410 status and avoid soft 404s.',
              'Make title, description, H1, and visible copy describe one primary intent.',
              'Use a self-referencing canonical that exactly matches sitemap and internal-link URLs.',
              'Emit reciprocal English and Chinese hreflang plus an intentional x-default.',
              'Keep robots rules from blocking indexable pages and rendering resources.',
              'Match structured data to visible content and validate its syntax.',
              'Give every new page at least one crawlable link from a hub, related article, or navigation surface.',
              'Add an original example, test, comparison, or primary source instead of only summarizing public material.',
              'Set explicit image dimensions and reserve ad space.',
              'Load models, WASM, editors, and media libraries only when the task needs them.',
              'Complete one real mobile workflow, including input, action, download, and error states.',
              'After building, inspect sitemap, robots, llms files, and static HTML.',
              'After release, check indexing and crawling in webmaster tools and record a performance baseline.',
            ],
          },
        ],
        conclusion: 'Effective SEO in 2026 is not a larger pile of tags. It is agreement between the product, content, and every discovery signal. ToolGarden’s central method is to treat registries and localized messages as facts, derive metadata, canonical, hreflang, sitemaps, structured data, and article relationships from them, and protect the user experience with static output, on-demand code, and production measurement. AEO and GEO may change where an answer appears, but they cannot replace crawlable pages, original evidence, clear intent, and sustained maintenance.',
        faq: [
          {
            question: 'Will AEO and GEO replace traditional SEO in 2026?',
            answer: 'No. Google states that generative search depends on its core Search index and quality systems. AEO and GEO emphasize direct answers, citable evidence, and new reporting surfaces, but pages still need crawling, indexing, relevance, quality, and a good experience.',
          },
          {
            question: 'Does llms.txt improve Google or AI search rankings?',
            answer: 'It does not improve Google Search rankings. Google’s 2026 guidance says Google Search does not use llms.txt, so it has neither a positive nor negative effect there. Maintain it only for systems that explicitly consume it, generate it from real content, and never use it as a substitute for HTML, sitemaps, and internal links.',
          },
          {
            question: 'When should I use canonical instead of a 301 redirect?',
            answer: 'Use a permanent redirect when the old URL should no longer be visited. Use rel=canonical when similar versions must remain accessible but one should consolidate signals. Google treats redirects and rel=canonical as strong signals and sitemap inclusion as a weaker one; all signals should identify the same preferred URL.',
          },
          {
            question: 'Is FAQPage structured data still useful in 2026?',
            answer: 'Google stopped showing FAQ rich results in May 2026, so it should not be added to chase that presentation. Real visible FAQs can still improve the page and serve site search or other consumers. If retained, every structured question and answer must exactly match visible content.',
          },
          {
            question: 'Why is a page not indexed after I submit a sitemap?',
            answer: 'A sitemap helps discovery but does not guarantee indexing. Check for a 200 response, crawl permission, self-referencing canonical, unique and useful content, crawlable internal links, soft 404 classification, duplication, and rendering failures.',
          },
          {
            question: 'Does every language version need its own canonical?',
            answer: 'Yes. The English page should canonicalize to the preferred English URL and the Chinese page to the preferred Chinese URL. Connect them with reciprocal hreflang annotations and choose an intentional x-default. Do not canonicalize every language to one English page.',
          },
        ],
      }),
    },
  },
] satisfies BlogArticle[];
