import { ToolMeta, ToolCategory } from './types';

/**
 * 工具注册中心 — Harness Engineering 核心
 *
 * 新增工具只需两步：
 *  1. 在此数组中追加一条 ToolMeta 记录
 *  2. 在 app/<id>/page.tsx 中实现页面
 *
 * 首页、导航、面包屑等均由此注册表自动驱动，无需手动维护。
 */
export const toolRegistry: ToolMeta[] = [
  // ── 格式化 ─────────────────────────────────────────────────────
  {
    id: 'json-format',
    name: 'JSON 格式化',
    description: '格式化、压缩、验证 JSON，支持树形展示与节点操作',
    path: '/json-format',
    icon: '{}',
    category: 'format',
    featured: true,
  },
  {
    id: 'json-escape',
    name: 'JSON 压缩转义',
    description: '压缩 JSON 并转义特殊字符，反转义还原可读格式',
    path: '/json-escape',
    icon: '\\"',
    category: 'format',
  },
  {
    id: 'json-repair',
    name: 'JSON 修复清洗',
    description: '修复注释、尾逗号、单引号、未加引号 key 等常见 JSON 问题',
    path: '/json-repair',
    icon: 'FIX',
    category: 'format',
    featured: true,
  },
  {
    id: 'json-diff',
    name: 'JSON 对比',
    description: '可视化对比两份 JSON 的差异，高亮增删改',
    path: '/json-diff',
    icon: '≠',
    category: 'format',
  },

  // ── 转换 ───────────────────────────────────────────────────────
  {
    id: 'json-yaml',
    name: 'JSON ↔ YAML',
    description: 'JSON 与 YAML 格式双向互转',
    path: '/json-yaml',
    icon: 'YML',
    category: 'convert',
    featured: true,
  },
  {
    id: 'json-xml',
    name: 'JSON ↔ XML',
    description: 'JSON 与 XML 格式双向互转',
    path: '/json-xml',
    icon: 'XML',
    category: 'convert',
  },
  {
    id: 'json-to-csv',
    name: 'JSON → CSV',
    description: '将 JSON 数组导出为 CSV 文件',
    path: '/json-to-csv',
    icon: 'CSV',
    category: 'convert',
  },
  {
    id: 'json-to-excel',
    name: 'JSON → Excel',
    description: '将 JSON 数组导出为 Excel (.xlsx) 文件',
    path: '/json-to-excel',
    icon: 'XLS',
    category: 'convert',
  },
  {
    id: 'excel-to-json',
    name: 'Excel → JSON',
    description: '读取 Excel (.xlsx/.xls) 文件，转换为 JSON 数组',
    path: '/excel-to-json',
    icon: 'XLS',
    category: 'convert',
  },
  {
    id: 'json-to-ts',
    name: 'JSON → TypeScript',
    description: '从 JSON 自动推断并生成 TypeScript interface 类型',
    path: '/json-to-ts',
    icon: 'TS',
    category: 'convert',
    featured: true,
  },
  {
    id: 'json-flatten',
    name: 'JSON Flatten / Unflatten',
    description: '将嵌套 JSON 平铺为路径键，或从路径键还原嵌套结构',
    path: '/json-flatten',
    icon: 'FLT',
    category: 'convert',
  },

  // ── 验证 ───────────────────────────────────────────────────────
  {
    id: 'json-schema',
    name: 'JSON Schema 生成',
    description: '从 JSON 样本自动推断生成 JSON Schema 定义',
    path: '/json-schema',
    icon: 'SCH',
    category: 'validate',
  },
  {
    id: 'json-schema-validate',
    name: 'JSON Schema 校验',
    description: '使用 JSON Schema 校验 JSON 数据，输出错误路径和原因',
    path: '/json-schema-validate',
    icon: 'VAL',
    category: 'validate',
  },
  {
    id: 'json-path',
    name: 'JSONPath 查询',
    description: '使用 JSONPath 表达式精准提取嵌套字段',
    path: '/json-path',
    icon: '$.',
    category: 'validate',
  },
  {
    id: 'json-stats',
    name: 'JSON 统计分析',
    description: '分析 JSON 结构：嵌套层级、Key 数量、类型分布、体积对比',
    path: '/json-stats',
    icon: 'SUM',
    category: 'validate',
  },

  // ── 编解码 ─────────────────────────────────────────────────────
  {
    id: 'jwt',
    name: 'JWT 解析',
    description: '解码 JWT Token，查看 Header / Payload，支持 HS256 签名验证',
    path: '/jwt',
    icon: 'JWT',
    category: 'encode',
    featured: true,
  },
];

export interface ToolGroup {
  category: ToolCategory;
  tools: ToolMeta[];
}

/** 按分类获取工具列表 */
export function getToolsByCategory(category: ToolCategory): ToolMeta[] {
  return toolRegistry.filter((t) => t.category === category);
}

/** 按 id 获取单个工具元数据 */
export function getToolById(id: string): ToolMeta | undefined {
  return toolRegistry.find((t) => t.id === id);
}

/** 获取所有分类（去重，按首次出现顺序） */
export function getAllCategories(): ToolCategory[] {
  return [...new Set(toolRegistry.map((t) => t.category))];
}

/** 首页发现逻辑的唯一入口：按注册顺序返回分类分组 */
export function getToolGroups(): ToolGroup[] {
  return getAllCategories().map((category) => ({
    category,
    tools: getToolsByCategory(category),
  }));
}

/** 生成带 locale 前缀的工具路径 */
export function getLocalizedToolPath(tool: ToolMeta, locale: string): string {
  return `/${locale}${tool.path}`;
}

/** 判断 id 是否对应已注册工具 */
export function isRegisteredToolId(id: string): boolean {
  return getToolById(id) !== undefined;
}

export const categoryLabels: Record<ToolCategory, string> = {
  format: '格式化',
  convert: '转换',
  validate: '验证',
  encode: '编解码',
};
