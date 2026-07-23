# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # 启动开发服务器 http://localhost:3000
npm run build    # 生产构建
npm run lint     # ESLint 检查
```

目前无测试框架，如需新增请使用 Vitest（`npx vitest`）。

---

## 架构：Harness Engineering 模式

本项目采用**注册中心驱动**的工程化架构。核心约束：**首页、导航、面包屑等所有"发现"逻辑，必须从 `lib/tools/registry.ts` 中自动派生，不得硬编码。**

### 新增一个工具的完整步骤

1. 在 `lib/tools/registry.ts` 的 `toolRegistry` 数组中追加一条 `ToolMeta` 记录
2. 在 `messages/zh.json` 和 `messages/en.json` 中补齐对应工具文案
3. 在 `lib/utils/` 中实现纯函数逻辑，页面不得直接写复杂解析/转换逻辑
4. 创建 `app/[locale]/<tool-id>/page.tsx`，用 `<ToolLayout toolId="<tool-id>">` 包裹内容
5. 创建 `app/[locale]/<tool-id>/layout.tsx`，复用工具 metadata 生成逻辑
6. 不创建 `app/<tool-id>/page.tsx`；无 locale 前缀的工具路径应返回真实 404
7. 跑 `npm run lint`、`npx tsc --noEmit`、`npm run build`，并用浏览器验证本地化页面可用、无前缀路径返回 404

完成以上步骤后，首页卡片、面包屑、分类分组、SEO 发现入口应自动出现，不得再手动维护重复入口。

### 目录职责

| 路径 | 职责 |
|------|------|
| `lib/tools/types.ts` | `ToolMeta` 接口——工具的唯一标准契约 |
| `lib/tools/registry.ts` | 工具注册表，驱动首页和导航 |
| `lib/utils/json.ts` | **纯函数**工具库，无副作用，不得 import React |
| `components/ToolLayout.tsx` | 所有工具页面必须使用的骨架（面包屑 + 标题） |
| `components/ui/Button.tsx` | 统一按钮，variant: `primary` / `secondary` / `danger` |
| `components/ui/Panel.tsx` | 输入/输出面板骨架 |
| `components/JsonNode.tsx` | JSON 树形展示组件 |
| `app/page.tsx` | 首页，纯展示，从 registry 读数据，不含业务逻辑 |
| `app/[locale]/<tool-id>/page.tsx` | 工具页面，只管 UI 状态，逻辑委托给 `lib/utils/` |

### 分层规则

- **`lib/utils/`** → 纯函数，返回值而不是操作 state，便于测试
- **`lib/tools/`** → 工具元数据，不含渲染代码
- **`components/ui/`** → 无业务逻辑的原子组件
- **`app/[locale]/<tool>/page.tsx`** → 只负责 `useState` / `useEffect`，调用 `lib/utils/` 取结果

工具页面中**禁止**直接写 `JSON.parse` / `JSON.stringify` 等逻辑——应在 `lib/utils/json.ts` 中定义函数后调用。

### ToolMeta 字段说明

```ts
interface ToolMeta {
  id: string;          // 与 app/<id>/ 路由对应
  name: string;        // 首页卡片标题
  description: string; // 首页卡片描述（一句话）
  path: string;        // 通常为 '/<id>'
  icon: string;        // emoji 或 ASCII 符号
  category: 'format' | 'convert' | 'validate' | 'encode';
  featured?: boolean;  // 保留字段，用于未来首页置顶
}
```

### `lib/utils/json.ts` 的返回约定

格式化类函数返回判别联合类型，**不抛异常、不操作 state**：

```ts
type FormatOutcome = { ok: true; output: string; parsed: unknown }
                   | { ok: false; message: string };
```

新增工具函数时沿用此模式。

---

## 主题系统

`app/globals.css` 采用**双层架构**，修改主题只需改 Layer 1：

```
Layer 1  :root { --surface: #f9fafb; ... }        ← 改颜色只动这里
Layer 2  @theme inline { --color-surface: var(--surface); }  ← 注册为 Tailwind 工具类
```

**组件中禁止使用原始 Tailwind 颜色类**（如 `gray-*`、`red-*`），必须使用语义 token：

| 场景 | 使用类名 |
|------|---------|
| 面板/输入框背景 | `bg-surface` |
| 输出区域背景 | `bg-surface-raised` |
| hover 高亮 | `bg-surface-hover` |
| 默认边框 | `border-border-base` |
| 表单输入边框 | `border-border-input` |
| 分隔线/面包屑边框 | `border-border-subtle` |
| hover 边框 | `border-border-strong` |
| 主标题文字 | `text-content` |
| 正文文字 | `text-content-secondary` |
| 辅助说明 | `text-content-muted` |
| 占位符/注释 | `text-content-faint` |
| 主操作按钮背景 | `bg-action` |
| 危险操作背景 | `bg-danger-surface` |
| JSON 字符串 | `text-syntax-string` |
| JSON 数字 | `text-syntax-number` |
| JSON 布尔值 | `text-syntax-boolean` |
| JSON null | `text-syntax-null` |
| JSON key / 括号 | `text-syntax-key` / `text-syntax-bracket` |
| 折叠注释 | `text-syntax-comment` |

**深色模式**：只需在 `globals.css` 的 `@media (prefers-color-scheme: dark)` 中覆盖 Layer 1 变量，组件代码无需任何改动。

---

## Harness Engineering 落地准则

### 1. 单一事实源

凡是会被多个地方使用的信息，必须有唯一来源：

- 工具元数据唯一来源：`lib/tools/registry.ts`
- 工具类型契约唯一来源：`lib/tools/types.ts`
- 文案唯一来源：`messages/zh.json`、`messages/en.json`
- 工具逻辑唯一来源：`lib/utils/`
- 工具页面骨架唯一来源：`components/ToolLayout.tsx`
- 原子 UI 唯一来源：`components/ui/`

首页、导航、分类、面包屑、推荐工具、SEO、sitemap、llms 文档都不得重复硬编码工具信息。

### 2. Registry 驱动

所有工具发现逻辑必须从 `toolRegistry` 自动派生，包括：

- 首页工具卡片
- 分类分组
- 常用工具
- 面包屑
- 本地化工具路径
- sitemap
- JSON-LD
- `llms.txt` / `llms-full.txt`

一个工具如果没有注册到 registry，就不应被视为正式功能。

### 3. 页面薄化

工具页面只负责：

- `useState` / `useEffect`
- 用户输入
- 按钮事件
- 展示结果
- 展示错误

工具页面禁止直接实现复杂业务逻辑，尤其禁止把 JSON 解析、格式转换、schema 校验、diff 算法、文件解析等逻辑写在页面组件里。

### 4. 纯函数返回约定

`lib/utils/` 中的函数应保持纯函数风格：

- 不操作 React state
- 不依赖 DOM
- 不直接读写 UI
- 不把未处理异常抛给页面
- 输入明确，输出明确

新增工具函数应优先返回判别联合类型：

```ts
type Outcome =
  | { ok: true; output: string; parsed?: unknown }
  | { ok: false; message: string };
```

页面只根据 `ok` 分支展示结果。

### 5. Layout 统一

所有工具页面必须使用：

```tsx
<ToolLayout toolId="<tool-id>">
  ...
</ToolLayout>
```

`ToolLayout` 统一负责面包屑、标题、描述、分类、页面宽度、结构化数据和基础页面结构。工具页面不得重复实现这些骨架逻辑。

### 6. i18n 文案规则

页面文案不得硬编码，必须进入 `messages/zh.json` 和 `messages/en.json`，且两份 JSON 结构保持一致。

注意：`next-intl` 使用 ICU 语法。文案里不要直接写未转义的 JSON 花括号示例，例如 `{"id": 1}`。更推荐写成描述性 placeholder，例如“粘贴 JSON 样本，例如 id 和 name 字段”。

### 7. SEO / GEO / AEO 规则

SEO 信息应从 registry 和 messages 派生，不手写重复数据。新增工具必须考虑以下发现入口：

- title / description
- canonical
- hreflang
- Open Graph
- JSON-LD
- sitemap
- robots
- `llms.txt`
- `llms-full.txt`

不能只新增页面，而不让搜索引擎和 AI 检索入口发现它。

### 8. 响应式与大屏布局

工具型页面优先服务长时间使用和高密度信息处理：

- 大屏下工具页应充分利用宽度
- 双栏工具应支持宽屏并排
- 输入框/输出框应撑满剩余高度
- 避免固定死 `40vh` 这类高度
- 优先使用 `flex-grow`、`min-h-0`、grid tracks、responsive constraints
- 移动端允许上下堆叠，但不能溢出、遮挡或重叠

### 9. 404 与错误路径

必须提供自定义 404 页面。404 页面应：

- 支持中英文
- 返回真实 HTTP 404
- 提供返回首页入口
- 推荐常用工具
- 推荐工具从 registry 派生

不能只使用默认 Next.js 404。

### 10. 验证规则

每次结构性改动后必须跑：

```bash
npm run lint
npx tsc --noEmit
npm run build
```

涉及 UI 的改动还必须用浏览器验证：

- 页面是否可访问
- 布局是否正常
- 按钮是否可交互
- 控制台是否报错
- 404 是否返回真实 404
- SEO 标签是否存在

### 11. 新增工具 Checklist

新增工具时使用以下检查清单：

```txt
[ ] registry 已注册
[ ] 中英文 messages 已补充
[ ] 工具逻辑放在 lib/utils
[ ] 页面使用 ToolLayout
[ ] locale layout metadata 已补充
[ ] 根路径 redirect 已补充
[ ] 没有重复硬编码工具信息
[ ] 没有页面内复杂 JSON 逻辑
[ ] 没有原始 Tailwind 颜色类
[ ] SEO / sitemap / llms 可发现
[ ] lint 通过
[ ] tsc 通过
[ ] build 通过
[ ] 浏览器验证通过
```

核心原则：任何新增能力，都必须接入项目已有 Harness，而不是绕开它单独生长。
