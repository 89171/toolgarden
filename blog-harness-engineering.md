# 我让 Claude 对项目做了一次 Harness Engineering 改造

> 本文记录了一次真实的 AI 辅助重构过程：一个只有单页格式化功能的 Next.js 项目，如何在 Harness Engineering 思想指导下，演变为拥有 16 个工具、双语支持、全套 SEO 的专业工具箱——以及这个过程中架构思想与代码规范是如何一步步沉淀的。

---

## 起点：一个典型的「人肉驱动」项目

改造前，这个 JSON 工具箱只有一个 `/json-format` 页面。所有逻辑塞在一个 **553 行的单体组件**里——UI 状态、JSON 解析、格式化算法、错误处理全部耦合：

```
app/
  page.tsx          ← Next.js 默认占位模板
  json-format/
    page.tsx        ← 553 行，所有东西混在一起
components/
  Header.tsx        ← 硬编码中文标题
  Footer.tsx        ← 硬编码版权
```

如果要加第二个工具（比如 JSON 对比），需要：复制页面、手动加首页卡片、手动加导航链接、记得改面包屑……每增加一个功能，都需要人来记住哪里要改、要改几处。这是典型的**认知债务**——架构依赖开发者的记忆，而不是代码自身的约束。

---

## 什么是 Harness Engineering

Harness Engineering（脚手架工程化）的核心思想是：

> **把重复的、容易遗忘的人工操作，收归到一个单一的注册点，让框架自动完成所有派生工作。**

它不是某个具体的设计模式，而是一种架构哲学——让「正确的做法」本身就是「最省力的做法」，让「错误的做法」变得显眼。

这个思想在不同领域有不同的表现：

- **Rails** 的约定优于配置：文件放对位置，路由自动生成
- **Django** 的 `admin.site.register()`：注册一次，管理界面自动出现
- **Gatsby** 的文件系统路由：文件即路由，无需手动配置
- **本项目**：在注册表里追加一条记录，首页、导航、SEO、Sitemap 全部自动跟上

---

## 改造一：建立注册中心（单一事实来源）

第一步是建立 `lib/tools/registry.ts`——整个系统的**唯一真相来源**（Single Source of Truth）。

```typescript
export const toolRegistry: ToolMeta[] = [
  {
    id: 'json-format',
    name: 'JSON 格式化',
    path: '/json-format',
    icon: '{}',
    category: 'format',
    featured: true,
  },
  // 新增工具只需在这里追加 ↓
];
```

从这一刻起，所有「发现」逻辑都从这里自动派生：首页工具卡片按注册表渲染、分类分组从 `category` 字段提取、面包屑从工具 id 反查名称。

**验证标准**：删掉 registry 里的一条记录，首页的对应卡片应立即消失，面包屑里的对应分类应不再出现。如果删掉之后还需要手动清理其他地方，说明违反了 Harness 约束。

---

## 改造二：强制分层，建立纯函数工具库

原来的单体组件同时做三件事：计算（JSON 解析/格式化）、状态管理（React state）、渲染（JSX）。这让逻辑无法复用、无法测试。

改造后形成了清晰的四层架构：

```
lib/utils/          ← 纯函数层（零副作用，禁止 import React）
  json.ts           ← parseLooseJSON, formatJSON, minifyJSON
  yaml.ts           ← jsonToYaml, yamlToJson
  xml.ts            ← jsonToXml, xmlToJson
  csv.ts            ← jsonToCsv
  excel.ts          ← jsonToExcelBuffer, excelBufferToJson
  diff.ts           ← computeDiff, diffJson
  schema.ts         ← generateSchema
  typescript.ts     ← jsonToTypeScript
  stats.ts          ← analyzeJson
  escape.ts         ← escapeJson, unescapeJson
  repair.ts         ← repairJson（处理注释、尾逗号、宽松语法）
  flatten.ts        ← flattenJson, unflattenJson
  jsonpath.ts       ← queryJsonPath
  jwt.ts            ← decodeJwt, verifyJwtHs256

lib/tools/          ← 工具元数据 + 跨切面逻辑
  types.ts          ← ToolMeta 接口
  registry.ts       ← 注册中心
  seo.ts            ← SEO 工具函数（metadata、JSON-LD、hreflang）
  routing.ts        ← 路由工具（redirectToDefaultLocale）

components/ui/      ← 无业务逻辑的原子组件
  Button.tsx / Panel.tsx

components/         ← 有业务逻辑的复合组件
  ToolLayout.tsx    ← 所有工具页共用骨架
  JsonNode.tsx      ← JSON 树形展示
  ToolDirectory.tsx ← 首页工具目录（搜索 + Featured + 分组）
  NotFoundContent.tsx ← 404 内容，推荐工具从 registry 派生

app/[locale]/       ← 页面层（只管 UI 状态）
  page.tsx          ← 首页 Server Component
  [tool]/page.tsx   ← 工具页：useState + useEffect + 调用 lib/utils/
  [tool]/layout.tsx ← generateMetadata → createToolMetadata(id, locale)

app/[tool]/         ← 根路径兼容层（SEO 友好重定向）
  page.tsx          ← redirectToolToDefaultLocale
```

**核心约束**：
- `lib/utils/` 里**禁止** import React，**禁止**抛异常，只返回值
- `app/<tool>/page.tsx` 里**禁止**直接写 `JSON.parse`，必须调用 `lib/utils/`
- 所有函数返回判别联合类型 `{ ok: true, output } | { ok: false, message }`

---

## 改造三：SEO 作为 Harness 层的一等公民

SEO 信息和工具逻辑一样，也是「容易遗忘的人工操作」。改造前每加一个工具需要手动填 title、description、og:*、JSON-LD。

改造后，`lib/tools/seo.ts` 成为**SEO 的唯一生成入口**：

```typescript
// 所有工具 metadata 的统一模式
export function createToolMetadata(toolId: ToolMessageId, locale: string): Metadata {
  const m = getLocaleMessages(locale);
  const tool = m.tools[toolId];
  // title、description、og:*、hreflang 全部自动生成
}

// 工具页 JSON-LD（WebApplication schema）
export function createToolJsonLd(toolId: string, locale: string) { ... }

// 面包屑 JSON-LD（BreadcrumbList schema）
export function createBreadcrumbJsonLd(toolId: string, locale: string) { ... }

// 首页工具列表 JSON-LD（ItemList schema）
export function createToolItemListJsonLd(locale: string) { ... }

// FAQ JSON-LD（FAQPage schema）
export function createFaqJsonLd(locale: string) { ... }
```

每个工具的 `layout.tsx` 现在只有 8 行：

```tsx
import { createToolMetadata } from '@/lib/tools/seo';
const TOOL_ID = 'json-format';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return createToolMetadata(TOOL_ID, locale); // 一行搞定全部 SEO
}
export default function Layout({ children }) { return <>{children}</>; }
```

**新增工具时 SEO 自动就绪**，无需任何额外工作。

---

## 改造四：双层主题系统（设计 token）

原项目直接在组件里写 `text-gray-500`、`bg-gray-100`。换颜色 = 全文件搜索替换，深色模式无从下手。

改造后 `globals.css` 分两层：

```css
/* Layer 1：原始值（只改这里）*/
:root {
  --surface: #f9fafb;         /* 面板背景 */
  --content-muted: #6b7280;   /* 辅助文字 */
  --action: #1f2937;           /* 主按钮 */
  --syntax-string: #16a34a;   /* JSON 字符串 */
  /* ... */
}

/* 深色模式：只覆盖 Layer 1，组件代码零改动 */
@media (prefers-color-scheme: dark) {
  :root {
    --surface: #111827;
    --content-muted: #9ca3af;
    /* ... */
  }
}

/* Layer 2：注册为 Tailwind 工具类 */
@theme inline {
  --color-surface: var(--surface);
  --color-content-muted: var(--content-muted);
  /* ... */
}
```

所有组件只使用语义 token，永远不用 `gray-*`：

```tsx
// ✅
<div className="bg-surface text-content-muted border-border-input">

// ❌ 原始颜色类——禁止
<div className="bg-gray-50 text-gray-500 border-gray-300">
```

---

## 改造五：多语言作为框架层，而非功能层

多语言本质上也是「发现」问题——每新增一个工具，需要记得在两份语言文件里都加上文案。

改造后，messages 文件的结构与 registry 的 id 一一对应：

```json
// messages/zh.json
{
  "tools": {
    "json-format": { "name": "JSON 格式化", "description": "..." },
    "json-repair":  { "name": "JSON 修复清洗", "description": "..." }
    // 新增工具 → 在这里补一个对象
  }
}
```

工具页通过 `useTranslations('tools.json-format')` 直接消费，`ToolLayout` 通过 `useTranslations()` 动态读取任意工具的名称和描述。新增语言只需：新建 `messages/<locale>.json` + 在 routing.ts 追加 locale。

---

## 改造六：工具库从 1 个扩展到 16 个

在 Harness 架构下，每个新工具的边际成本接近于零——只写业务逻辑和 UI，其余全部自动。最终工具库：

| 分类 | 工具 |
|------|------|
| **格式化** | JSON 格式化、JSON 压缩转义、JSON 修复清洗、JSON 对比 |
| **转换** | JSON↔YAML、JSON↔XML、JSON→CSV、JSON→Excel、Excel→JSON、JSON→TypeScript、JSON Flatten/Unflatten |
| **验证** | JSON Schema 生成、JSON Schema 校验、JSONPath 查询、JSON 统计分析 |
| **编解码** | JWT 解析与验证 |

每个工具的技术实现都在 `lib/utils/` 下的纯函数里，可独立测试，互不干扰。

---

## 最终架构一览

```
lib/tools/registry.ts     ← 唯一真相来源
       │
       ├─► 首页工具卡片（ToolDirectory）
       ├─► 面包屑导航（ToolLayout）
       ├─► SEO metadata（createToolMetadata）
       ├─► JSON-LD 结构化数据（createToolJsonLd、createBreadcrumbJsonLd）
       ├─► Sitemap 条目（sitemap.ts）
       ├─► 404 推荐工具（NotFoundContent）
       └─► llms.txt 描述（public/llms.txt）

lib/utils/*.ts            ← 纯函数工具库（可独立测试）
components/ToolLayout.tsx ← 统一工具页骨架
messages/*.json           ← 多语言文案
app/globals.css           ← 双层主题 token
```

---

## 落地准则：对 AI 和人类开发者同等有效

这次改造最有价值的副产品是一份写进 `CLAUDE.md` 的**可执行准则**：

**准则一：注册中心是唯一真相来源**

首页、面包屑、Sitemap、JSON-LD、404 推荐——一切「发现」逻辑只从 `registry.ts` 读取，禁止在任何其他地方硬编码工具列表。

**准则二：新增工具只改 6 处，其余自动派生**

```
registry.ts 追加记录 → messages/zh+en.json 追加文案 → lib/utils/<id>.ts 实现逻辑
→ app/[locale]/<id>/page.tsx 实现 UI → app/[locale]/<id>/layout.tsx 接入 createToolMetadata
→ app/<id>/page.tsx 设置重定向
```

如果需要改第 7 处，说明违反了 Harness 约束，需要把那处逻辑收回到框架中。

**准则三：分层禁止越层**

```
❌ 工具页面直接写 JSON.parse
❌ lib/utils/ 中 import React
❌ 组件中使用 gray-*/red-* 原始颜色类
❌ generateMetadata 中硬编码 title/description
```

**准则四：SEO 是框架层，不是功能层**

新增工具不需要「记得补 SEO」，因为 SEO 由 `createToolMetadata` 自动生成。SEO 的正确性由框架保证，而不是开发者的记忆。

---

## 为什么 Harness Engineering 和 AI 协作特别契合

这次改造有一个意外收获：**Harness Engineering 的约束对 AI 同样有效，甚至比对人类更有效。**

AI 生成代码的最大风险是「忘记改某个地方」。传统架构加一个工具需要改 8 处，AI 可能只改了 5 处，剩下 3 处它不知道、你也可能没注意到——这就是「幽灵 bug」的来源。

而在 Harness 架构下，加一个工具只需要 6 处，而且每一处都有明确的模式（复制 layout.tsx 的模板，改一个 TOOL_ID）。AI 不会遗漏，因为本来就只有这几处，其余所有变化由框架自动完成。

**这就是 Harness Engineering 最深层的价值：把正确的架构决策编码进框架约束，让正确的做法成为最省力的做法，让遗漏变成显而易见的编译错误或类型错误，而不是运行时 bug。** 无论是人类开发者还是 AI，都被自然地引导走向正确的路径。

---

*技术栈：Next.js 16 · TypeScript · Tailwind CSS v4 · next-intl · SheetJS · jsonpath-plus · yaml · fast-xml-parser*
