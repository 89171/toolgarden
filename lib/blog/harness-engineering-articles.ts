import type { BlogArticle, BlogBlock } from './articles';

const lead = (text: string): BlogBlock => ({ type: 'lead', text });
const paragraph = (text: string): BlogBlock => ({ type: 'paragraph', text });
const heading = (level: 2 | 3, text: string): BlogBlock => ({ type: 'heading', level, text });
const quote = (text: string): BlogBlock => ({ type: 'quote', text });
const list = (items: string[], ordered = false): BlogBlock => ({ type: 'list', ordered, items });
const code = (language: string, value: string): BlogBlock => ({ type: 'code', language, code: value });
const table = (headers: string[], rows: string[][]): BlogBlock => ({ type: 'table', headers, rows });

const initialStructure = `app/
  page.tsx
  json-format/
    page.tsx

components/
  Header.tsx
  Footer.tsx`;

const registrySnippet = `export const toolRegistry = [
  {
    id: "json-format",
    category: "format",
    path: "/json-format"
  }
]`;

const layoutSnippet = `export default function JsonFormatPage() {
  return (
    <ToolLayout toolId="json-format">
      <JsonFormatClient />
    </ToolLayout>
  );
}`;

const layeredStructure = `lib/
  utils/
  tools/
    registry.ts
    seo.ts
    sitemap.ts

components/
  ui/
  tools/

app/
  [locale]/`;

const formatJsonSnippet = `export function formatJSON(input: string) {
  // Parsing and formatting live in a pure utility.
  // The function returns an outcome instead of mutating UI state.
}`;

const formatJsonCallSnippet = `const result = formatJSON(input);`;

const rawColorSnippet = `bg-gray-100
text-gray-500`;

const semanticTokenSnippet = `--surface
--content-muted
--action`;

const documentationSnippet = `AGENTS.md
CLAUDE.md`;

const utilityDirectorySnippet = `lib/utils`;

const toolLayoutSnippet = `<ToolLayout />`;

const invalidColorSnippet = `text-gray-500
bg-red-100`;

const preferredColorSnippet = `text-content-muted
bg-surface`;

const validationSnippet = `npm run lint
npx tsc --noEmit
npm run build`;

const zhRegistrySnippet = `export const toolRegistry: ToolMeta[] = [
  {
    id: 'json-format',
    name: 'JSON 格式化',
    path: '/json-format',
    icon: '{}',
    category: 'format',
    featured: true,
  },
  // 新增工具只需在这里追加
];`;

const zhLayeredStructure = `lib/utils/          ← 纯函数层（零副作用，禁止 import React）
lib/tools/          ← 工具元数据与跨切面逻辑
components/ui/      ← 无业务逻辑的原子组件
components/         ← ToolLayout 等复合组件
app/[locale]/       ← 只负责状态、事件和渲染的页面层`;

const zhSeoSnippet = `export function createToolMetadata(toolId: ToolMessageId, locale: string): Metadata {
  const messages = getLocaleMessages(locale);
  const tool = messages.tools[toolId];
  // title、description、Open Graph、canonical 与 hreflang 统一生成
}`;

const zhThemeSnippet = `:root {
  --surface: #f9fafb;
  --content-muted: #6b7280;
  --action: #1f2937;
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface: #111827;
    --content-muted: #9ca3af;
  }
}

@theme inline {
  --color-surface: var(--surface);
  --color-content-muted: var(--content-muted);
}`;

const zhArchitectureOverview = `lib/tools/registry.ts
       │
       ├─► 首页工具卡片
       ├─► 分类与面包屑
       ├─► SEO metadata 与 JSON-LD
       ├─► Sitemap
       ├─► 404 推荐工具
       └─► llms.txt / llms-full.txt

lib/utils/*.ts            ← 可独立测试的纯函数工具库
components/ToolLayout.tsx ← 统一工具页骨架
messages/*.json           ← 双语文案
app/globals.css           ← 双层语义主题 token`;

const zhWorkflowSnippet = `registry.ts 注册工具
→ messages/zh.json 与 messages/en.json 补充文案
→ lib/utils/ 实现纯函数逻辑
→ app/[locale]/<id>/page.tsx 实现交互
→ app/[locale]/<id>/layout.tsx 接入统一 metadata`;

const englishBlocks: BlogBlock[] = [
  lead('This article documents a real AI-assisted refactoring journey. Starting from a simple Next.js application with only a JSON formatter, I used Claude and the principles of Harness Engineering to evolve it into a multilingual toolbox with more than 80 online utilities, automated SEO, and a scalable architecture. More importantly, it shows how engineering rules gradually replaced developer memory.'),
  heading(2, 'Background: A Simple Project That Couldn’t Scale'),
  paragraph('Website: https://toolgarden.xyz'),
  paragraph('During everyday development, I constantly found myself opening different online tools:'),
  list([
    'JSON Formatter',
    'Image Converter',
    'PDF Tools',
    'Base64 Encoder and Decoder',
    'URL Encoder',
    'File Conversion',
    'Markdown Utilities',
  ]),
  paragraph('Every tool lived on a different website. Switching back and forth was annoying, and most searches ended with pages full of ads.'),
  paragraph('So I decided to build my own online toolbox with AI—one website where I could access everything without searching every time.'),
  paragraph('Initially, the project was extremely simple. It was a standard create-next-app project with a single /json-format page.'),
  code('text', initialStructure),
  paragraph('The json-format/page.tsx file handled everything:'),
  list([
    'UI rendering',
    'State management',
    'JSON parsing',
    'JSON formatting',
    'Error handling',
    'Tree view rendering',
  ]),
  paragraph('Adding a second tool, such as JSON Diff, meant copying an existing page, updating the homepage, adding navigation links, updating breadcrumbs, editing the sitemap, and configuring SEO.'),
  paragraph('Every new feature required remembering several unrelated modifications scattered across the project. This is a classic example of cognitive debt: the architecture depended on the developer’s memory instead of constraints enforced by the code itself.'),
  paragraph('Internationalization and SEO were equally painful. Almost every page needed manual updates. The project worked, but it clearly was not designed to scale.'),

  heading(2, 'What Is Harness Engineering?'),
  quote('Building a control layer around AI so software development becomes stable, repeatable, and reliable.'),
  paragraph('The Harness is not the AI itself. It is the infrastructure connecting developers, AI, the codebase, and development tools.'),
  paragraph('A Harness is responsible for:'),
  list([
    'Providing consistent context',
    'Invoking tools',
    'Executing code',
    'Validating outputs',
    'Automatically fixing errors',
    'Ensuring output quality',
  ]),
  table(
    ['Prompt Engineering', 'Harness Engineering'],
    [
      ['Optimizing prompts', 'Designing the entire AI workflow'],
      ['Better input', 'Better system'],
      ['One-shot generation', 'Multi-step execution'],
      ['AI output is the end', 'AI output is the beginning'],
      ['Manual verification', 'Automated validation'],
    ],
  ),
  paragraph('Harness Engineering is not a specific design pattern. It is an engineering philosophy that encourages projects to grow under constraints instead of relying on developer discipline.'),
  paragraph('Anything repetitive, easy to forget, or purely mechanical should be automated.'),

  heading(2, 'What Claude Changed'),
  heading(3, '1. Creating a Single Source of Truth'),
  paragraph('The first step was introducing lib/tools/registry.ts. This became the project’s single source of truth.'),
  code('typescript', registrySnippet),
  paragraph('The homepage tool list, categories, navigation, breadcrumbs, sitemap, recommended tools, and SEO metadata are now derived from this registry.'),
  paragraph('Adding a new tool only requires registering it once. Everything else updates automatically.'),
  quote('Which files do I need to modify this time?'),

  heading(3, '2. Introducing a Unified Tool Layout'),
  paragraph('Previously every page maintained its own title, description, breadcrumbs, JSON-LD, SEO metadata, and responsive layout.'),
  paragraph('Now every tool page follows the same small composition:'),
  code('tsx', layoutSnippet),
  paragraph('ToolLayout became responsible for everything shared across the project. Each tool only implements its own interactions.'),

  heading(3, '3. Building a Clear Layered Architecture'),
  paragraph('Claude reorganized the project into clear layers:'),
  code('text', layeredStructure),
  paragraph('Each layer has a single responsibility. Pages handle state, events, and rendering. Business logic lives in lib/utils, while components focus on presentation.'),
  paragraph('For example, JSON formatting became a pure utility function:'),
  code('typescript', formatJsonSnippet),
  paragraph('The page simply calls it:'),
  code('typescript', formatJsonCallSnippet),
  paragraph('This makes the logic easy to unit test, independent of React and the DOM, and reusable in command-line tools or Workers. Business logic became framework-independent.'),

  heading(3, '4. Replacing Colors with Semantic Design Tokens'),
  paragraph('Hard-coded colors disappeared. Instead of raw Tailwind color classes:'),
  code('text', rawColorSnippet),
  paragraph('The project now uses semantic tokens:'),
  code('text', semanticTokenSnippet),
  list([
    'Easier dark mode support',
    'Easier branding',
    'Better theme customization',
    'No global search-and-replace for colors',
  ]),
  paragraph('Components no longer need to know what the colors actually are.'),

  heading(3, '5. Engineering SEO Instead of Maintaining It'),
  paragraph('For a toolbox website, search engines are a primary discovery channel, so SEO should not be manually maintained.'),
  paragraph('The project automatically generates:'),
  list([
    'sitemap.xml',
    'robots.txt',
    'canonical URLs',
    'hreflang',
    'Open Graph metadata',
    'JSON-LD',
    'llms.txt',
    'llms-full.txt',
  ]),
  paragraph('Everything is derived from the registry. Adding a tool requires zero repeated SEO maintenance.'),

  heading(3, '6. Standardizing Responsive Design'),
  paragraph('Many UX improvements also became conventions:'),
  list([
    'Editors automatically fill available space',
    'Two-column layouts adapt to large screens',
    'Fixed 40vh layouts are avoided',
    'The editing experience remains usable on small screens',
    'Spacing stays consistent across tools',
  ]),
  paragraph('These can look like small details, but once a site has dozens of tools, consistency becomes a product feature.'),

  heading(3, '7. Turning Experience into Documentation'),
  paragraph('Finally, all engineering constraints were documented in two repository-level guides:'),
  code('text', documentationSnippet),
  paragraph('These documents define the project architecture, development workflow, naming conventions, the process for adding a tool, and guidelines for AI-assisted coding.'),
  paragraph('This was arguably the most valuable step. The most durable asset is not just the current code; it is the set of rules that guides future development.'),

  heading(2, 'The Harness Engineering Rules'),
  paragraph('The refactoring eventually evolved into a set of explicit engineering principles.'),
  heading(3, 'Rule 1 — Single Source of Truth'),
  paragraph('All tool definitions live in lib/tools/registry.ts. Configuration should never be duplicated.'),
  heading(3, 'Rule 2 — Everything Is Registry Driven'),
  paragraph('The homepage, categories, recommendations, breadcrumbs, and sitemap should always be generated automatically. Nothing should be manually synchronized.'),
  heading(3, 'Rule 3 — Adding a Tool Has a Fixed Workflow'),
  paragraph('A new tool requires a fixed sequence:'),
  list([
    'Register it',
    'Add translations',
    'Implement utilities',
    'Create the page',
    'Wrap it with ToolLayout and reuse the metadata harness',
  ], true),
  paragraph('If adding a tool requires another manually synchronized discovery step, the architecture should be improved.'),
  heading(3, 'Rule 4 — Keep Pages Thin'),
  paragraph('Pages should contain state, events, and rendering. Business logic should not live directly inside page components.'),
  heading(3, 'Rule 5 — Prefer Pure Functions'),
  paragraph('Business logic belongs in:'),
  code('text', utilityDirectorySnippet),
  list(['No React', 'No DOM', 'No side effects', 'Fully testable']),
  heading(3, 'Rule 6 — Every Tool Uses the Same Layout'),
  paragraph('Every tool page uses the shared layout contract:'),
  code('tsx', toolLayoutSnippet),
  paragraph('Consistency comes by default instead of through repeated page code.'),
  heading(3, 'Rule 7 — SEO Must Be Automatic'),
  paragraph('Every new tool automatically receives metadata, JSON-LD, sitemap entries, and llms.txt discovery without a separate checklist of handwritten SEO files.'),
  heading(3, 'Rule 8 — Always Use Semantic Tokens'),
  paragraph('Avoid raw color utilities:'),
  code('text', invalidColorSnippet),
  paragraph('Prefer semantic tokens:'),
  code('text', preferredColorSnippet),
  paragraph('This keeps themes independent from components.'),
  heading(3, 'Rule 9 — Even the 404 Page Is Part of the System'),
  paragraph('404 pages should support internationalization and show registry-driven tool recommendations. No page should become an isolated exception.'),
  heading(3, 'Rule 10 — Validation Is Part of Development'),
  paragraph('Every structural change must pass the same validation gates:'),
  code('bash', validationSnippet),
  paragraph('The final step is testing the result in a real browser, including layout, interaction, console errors, 404 behavior, and SEO metadata.'),

  heading(2, 'The Results'),
  paragraph('After this refactoring, the project evolved from a single JSON formatter into a toolbox containing more than 80 online utilities.'),
  paragraph('Adding new tools became a repeatable workflow instead of a collection of manual updates. More importantly, the project became capable of continuous evolution.'),
  list([
    'Maintenance cost no longer grows linearly with the number of tools',
    'SEO is inherited automatically',
    'Navigation updates itself',
    'Internationalization scales naturally',
    'Business logic stays reusable',
    'AI follows established rules instead of rediscovering the project structure every time',
  ]),

  heading(2, 'Final Thoughts'),
  paragraph('Harness Engineering is not about making architecture look elegant. Its purpose is practical: keeping a project consistent, maintainable, and scalable while it continues to grow.'),
  quote('Build the rails first, then let new features grow along them.'),
  paragraph('Once those rails exist, developers no longer need to remember which files must be updated, worry about missing SEO metadata, or chase inconsistent UI patterns.'),
  paragraph('Let the system remember the repetitive work. Save human attention for solving real problems.'),
];

const chineseBlocks: BlogBlock[] = [
  lead('本文记录了一次真实的 AI 辅助重构：一个最初只有 JSON 格式化单页的 Next.js 项目，如何在 Claude 与 Harness Engineering 思想的帮助下，演变成拥有 80+ 在线工具、双语支持、自动化 SEO 和可持续架构的工具箱。更重要的是，这个过程展示了工程规则如何逐步替代开发者记忆。'),
  heading(2, '起点：一个典型的“人肉驱动”项目'),
  paragraph('改造前，项目只有一个 /json-format 页面。UI 状态、JSON 解析、格式化算法、错误处理和树形展示全部耦合在同一个页面组件中。'),
  code('text', initialStructure),
  paragraph('如果要增加第二个工具，例如 JSON 对比，就需要复制页面、手动增加首页卡片、补导航链接、更新面包屑、编辑 sitemap，再单独配置 SEO。'),
  paragraph('每增加一个功能，都要靠人记住需要修改哪些文件、修改多少处。这是典型的认知债务：架构依赖开发者的记忆，而不是代码自身的约束。国际化和 SEO 同样需要反复手工同步。项目能运行，却明显无法稳定扩展。'),

  heading(2, '什么是 Harness Engineering'),
  quote('围绕 AI 建立一层控制与验证系统，让软件开发变得稳定、可重复、可检查。'),
  paragraph('Harness 不是 AI 本身，而是连接开发者、AI、代码库与开发工具的工程基础设施。它持续提供上下文、调用工具、执行代码、验证输出、修复错误并把质量门槛固化到工作流里。'),
  table(
    ['Prompt Engineering', 'Harness Engineering'],
    [
      ['优化一次输入', '设计完整的 AI 工作流'],
      ['追求更好的提示词', '追求更可靠的系统'],
      ['一次性生成', '多步骤执行与反馈'],
      ['AI 输出是终点', 'AI 输出是验证的起点'],
      ['依赖人工检查', '自动化验证'],
    ],
  ),
  paragraph('它不是某个单一设计模式，而是一种架构哲学：让项目在约束下增长，不依赖个人纪律。凡是重复、容易遗漏或纯机械的工作，都应该被自动化。'),

  heading(2, 'Claude 对项目做了哪些改造'),
  heading(3, '1. 建立注册中心：单一事实来源'),
  paragraph('第一步是建立 lib/tools/registry.ts，让它成为所有工具元数据的唯一真相来源。'),
  code('typescript', zhRegistrySnippet),
  paragraph('从这一刻起，首页工具卡片、分类分组、导航、面包屑、推荐工具、sitemap 和 SEO metadata 都从 registry 自动派生。新增工具只注册一次，其余入口自动更新。'),
  quote('这次还需要改哪些文件？'),
  paragraph('这个过去每次扩展都会出现的问题，被架构本身消除了。'),

  heading(3, '2. 引入统一的 ToolLayout'),
  paragraph('过去每个页面都要重复维护标题、描述、面包屑、JSON-LD、SEO metadata 和响应式布局。改造后，工具页统一使用 ToolLayout：'),
  code('tsx', layoutSnippet),
  paragraph('ToolLayout 负责所有跨页面的共同结构，具体工具只需要实现自己的交互。页面骨架不再随着工具数量增长而复制。'),

  heading(3, '3. 强制分层，把业务逻辑变成纯函数'),
  paragraph('Claude 将项目整理为职责清晰的分层结构：'),
  code('text', zhLayeredStructure),
  paragraph('页面只管理 state、事件和渲染；复杂解析与转换逻辑进入 lib/utils；组件专注展示；工具元数据和 SEO 跨切面能力集中在 lib/tools。'),
  paragraph('以 JSON 格式化为例，逻辑被提取成纯函数，页面只消费返回结果。这样可以独立测试，不依赖 React 或 DOM，也能复用于 CLI 和 Worker。业务逻辑因此脱离了具体框架。'),

  heading(3, '4. 用语义设计 Token 替代原始颜色'),
  paragraph('原先组件直接使用 text-gray-500、bg-gray-100 等原始 Tailwind 颜色类。修改品牌色需要全局搜索替换，深色模式也难以维护。'),
  code('css', zhThemeSnippet),
  paragraph('现在组件只表达语义，例如 bg-surface、text-content-muted、border-border-input，而不关心最终颜色值。深色模式、品牌调整和主题扩展都只需要修改第一层变量。'),

  heading(3, '5. 把 SEO 工程化，而不是手工维护'),
  paragraph('SEO 同样属于容易遗漏的重复工作。改造后，lib/tools/seo.ts 成为 metadata、canonical、hreflang、Open Graph 和 JSON-LD 的统一生成入口。'),
  code('typescript', zhSeoSnippet),
  paragraph('sitemap.xml、robots.txt、llms.txt 与 llms-full.txt 也从 registry 和博客文章注册表生成。新增工具或文章后，发现入口随构建自动更新，不需要再复制一套 SEO 配置。'),

  heading(3, '6. 把响应式体验沉淀为约定'),
  list([
    '编辑器自动填满剩余空间',
    '双栏布局在宽屏并排、窄屏堆叠',
    '避免固定 40vh 之类的死高度',
    '移动端不溢出、不遮挡',
    '所有工具保持一致的间距与信息密度',
  ]),
  paragraph('单看每一条都很小，但当工具数量达到几十个时，一致性本身就是产品能力。'),

  heading(3, '7. 把经验写进 AGENTS.md 与 CLAUDE.md'),
  code('text', documentationSnippet),
  paragraph('这些文档明确项目架构、开发流程、命名约定、新增工具的步骤，以及 AI 编码时必须遵守的边界。最有价值的资产不只是一份当前可运行的代码，更是能持续指导后续演进的规则。'),

  heading(2, '最终形成的 Harness Engineering 规则'),
  heading(3, '规则一：单一事实来源'),
  paragraph('所有工具定义只存在于 lib/tools/registry.ts。会被多个地方使用的信息不得复制配置。'),
  heading(3, '规则二：所有发现入口都由 Registry 驱动'),
  paragraph('首页、分类、推荐、面包屑、sitemap、JSON-LD 与 AI 检索文档必须自动生成，不允许手动同步。'),
  heading(3, '规则三：新增工具有固定流程'),
  code('text', zhWorkflowSnippet),
  paragraph('如果增加工具还需要第六个手工同步的发现步骤，就应该继续改造 Harness，把它收回到框架里。'),
  heading(3, '规则四：保持页面薄化'),
  paragraph('页面只包含 state、事件和渲染，不能把 JSON 解析、格式转换、Schema 校验、Diff 算法或文件处理直接写进页面。'),
  heading(3, '规则五：优先使用纯函数'),
  paragraph('lib/utils 中的逻辑不依赖 React、不依赖 DOM、没有副作用，也不把未处理异常直接抛给页面。输入与输出必须清晰、可测试。'),
  heading(3, '规则六：所有工具使用统一布局'),
  paragraph('每个工具页都通过 ToolLayout 获得面包屑、标题、描述、分类、结构化数据和页面宽度。统一性成为默认结果。'),
  heading(3, '规则七：SEO 必须自动生成'),
  paragraph('新工具自动获得 metadata、canonical、hreflang、Open Graph、JSON-LD、sitemap 与 llms 文档入口。SEO 是框架层，不是功能层的补丁。'),
  heading(3, '规则八：只使用语义 Token'),
  code('text', `避免：
text-gray-500
bg-red-100

推荐：
text-content-muted
bg-surface`),
  paragraph('组件表达用途，主题系统决定颜色。这样主题与组件可以独立演进。'),
  heading(3, '规则九：404 也属于系统'),
  paragraph('404 页面同样支持中英文、返回真实 HTTP 404，并从 registry 推荐常用工具，不能成为孤立例外。'),
  heading(3, '规则十：验证是开发的一部分'),
  code('bash', validationSnippet),
  paragraph('结构性改动必须经过 lint、TypeScript 与生产构建，再用真实浏览器检查页面、交互、控制台、错误路径和 SEO 标签。'),

  heading(2, '最终架构一览'),
  code('text', zhArchitectureOverview),
  paragraph('这套结构把重复的发现逻辑、页面骨架、主题规则与验证门槛全部收进 Harness。开发者与 AI 都只需要在明确的扩展点工作。'),

  heading(2, '为什么 Harness Engineering 特别适合 AI 协作'),
  paragraph('AI 生成代码的常见风险是遗漏分散在项目各处的同步修改。传统架构增加一个工具可能要改八处，AI 只完成五处，剩下三处就会变成难以察觉的“幽灵 bug”。'),
  paragraph('在 Harness 架构下，扩展点数量固定，而且每一步都有可复用的模式。其余变化由框架自动派生，遗漏会更容易转化为编译错误、类型错误或验证失败，而不是上线后的运行时问题。'),
  quote('把正确的架构决策编码进框架约束，让正确的做法成为最省力的做法。'),

  heading(2, '改造结果'),
  paragraph('项目从一个 JSON 格式化页面扩展为拥有 80+ 在线工具的双语工具箱。增加新工具从一组分散的人工操作，变成了稳定、可重复、可验证的工作流。'),
  list([
    '维护成本不再随工具数量线性增长',
    'SEO 与 AI 检索入口自动继承',
    '导航与分类自动更新',
    '国际化按固定契约扩展',
    '业务逻辑保持可复用与可测试',
    'AI 遵循项目规则，而不是每次重新猜测结构',
  ]),

  heading(2, '结语'),
  paragraph('Harness Engineering 不是为了让架构看起来更漂亮，而是为了让项目在持续增长时仍然保持一致、可维护和可扩展。'),
  quote('先铺好轨道，再让新功能沿着轨道生长。'),
  paragraph('轨道建立后，开发者不必再记住所有同步文件，不必担心漏掉 SEO，也不必追逐页面之间的样式偏差。让系统记住重复工作，把人的注意力留给真正需要判断的问题。'),
];

export const harnessEngineeringArticles: BlogArticle[] = [
  {
    slug: 'harness-engineering-with-claude',
    publishedAt: '2026-08-04',
    updatedAt: '2026-08-04',
    translations: {
      en: {
        title: 'Harness Engineering in Practice: How Claude Helped Transform My Next.js Project',
        excerpt: 'A real AI-assisted refactoring journey from one JSON formatter to a multilingual toolbox with 80+ utilities, registry-driven discovery, automated SEO, and repeatable validation.',
        metaTitle: 'Harness Engineering in Practice with Claude and Next.js',
        metaDescription: 'See how Claude and Harness Engineering transformed a small Next.js JSON formatter into a multilingual toolbox with 80+ utilities, automated SEO, shared layouts, and reliable validation.',
        readingTime: '12 min read',
        tags: ['Harness Engineering', 'Claude', 'Next.js', 'AI-assisted development', 'Software architecture'],
        relatedTools: [
          {
            label: 'JSON Tools Directory',
            href: '/json-tools',
            description: 'Explore the registry-driven JSON toolkit that grew from the original formatter.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Use the browser-local formatter that served as the project’s starting point.',
          },
        ],
        blocks: englishBlocks,
        faq: [
          {
            question: 'What is Harness Engineering in software development?',
            answer: 'Harness Engineering is the practice of building context, tooling, constraints, execution steps, and automated validation around developers and AI. The goal is to make correct changes repeatable and easy to verify instead of relying on memory or a single prompt.',
          },
          {
            question: 'How is Harness Engineering different from Prompt Engineering?',
            answer: 'Prompt Engineering improves an individual instruction. Harness Engineering designs the larger system that supplies context, lets the AI use tools, checks the result, and feeds failures back into another iteration. The generated output is an intermediate artifact, not the end of the workflow.',
          },
          {
            question: 'Why does a registry help an AI modify a large project?',
            answer: 'A registry turns scattered discovery updates into derived behavior. The AI registers a tool once, while navigation, breadcrumbs, sitemap entries, recommendations, and other consumers update from the same source. That reduces omissions and makes invalid changes easier for types and build checks to catch.',
          },
        ],
      },
      zh: {
        title: 'Harness Engineering 实践：我让 Claude 对项目做了一次改造',
        excerpt: '一次真实的 AI 辅助重构：从单个 JSON 格式化页面，到拥有 80+ 工具、注册表驱动发现、自动化 SEO 和固定验证流程的双语 Next.js 工具箱。',
        metaTitle: 'Harness Engineering 实践：Claude 如何改造 Next.js 项目',
        metaDescription: '记录 Claude 如何用 Harness Engineering 改造 Next.js 项目：建立工具注册表、统一布局、纯函数分层、语义主题、自动化 SEO 与完整验证流程。',
        readingTime: '约 10 分钟阅读',
        tags: ['Harness Engineering', 'Claude', 'Next.js', 'AI 辅助开发', '软件架构'],
        relatedTools: [
          {
            label: 'JSON 工具大全',
            href: '/json-tools',
            description: '查看从最初 JSON 格式化功能发展而来的注册表驱动工具集。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '使用这个项目最初的起点：完全在浏览器本地运行的 JSON 格式化工具。',
          },
        ],
        blocks: chineseBlocks,
        faq: [
          {
            question: '软件开发中的 Harness Engineering 是什么？',
            answer: 'Harness Engineering 是围绕开发者与 AI 建立上下文、工具、约束、执行步骤和自动化验证的工程方法。它的目标是让正确修改可以重复执行、容易检查，而不是依赖个人记忆或一次提示词。',
          },
          {
            question: 'Harness Engineering 和 Prompt Engineering 有什么区别？',
            answer: 'Prompt Engineering 主要优化单次指令，Harness Engineering 设计的是更完整的系统：提供稳定上下文、允许 AI 调用工具、检查输出，并把失败反馈到下一轮执行。AI 的生成结果是验证起点，而不是工作流终点。',
          },
          {
            question: '为什么注册表能降低 AI 修改大型项目时的遗漏？',
            answer: '注册表把分散的发现入口变成自动派生行为。AI 只需注册一次工具，导航、面包屑、sitemap、推荐与其他消费者都从同一个来源更新，因此更少遗漏，也更容易由类型检查和构建验证发现错误。',
          },
        ],
      },
    },
  },
];
