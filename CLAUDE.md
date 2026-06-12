# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
2. 创建 `app/<tool-id>/page.tsx`，用 `<ToolLayout toolId="<tool-id>">` 包裹内容

完成以上两步后，首页卡片、面包屑、分类分组**自动出现**，无需修改其他任何文件。

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
| `app/<tool-id>/page.tsx` | 工具页面，只管 UI 状态，逻辑委托给 `lib/utils/` |

### 分层规则

- **`lib/utils/`** → 纯函数，返回值而不是操作 state，便于测试
- **`lib/tools/`** → 工具元数据，不含渲染代码
- **`components/ui/`** → 无业务逻辑的原子组件
- **`app/<tool>/page.tsx`** → 只负责 `useState` / `useEffect`，调用 `lib/utils/` 取结果

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
