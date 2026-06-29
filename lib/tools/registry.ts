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
  {
    id: 'pdf-to-pdf',
    name: '转为 PDF',
    description: '将 Word、Excel、PowerPoint、EPUB、MOBI、JPG、PNG、WebP、TXT、Markdown、HTML 转换为 PDF',
    path: '/pdf/to-pdf',
    icon: 'PDF',
    category: 'convert',
    featured: true,
  },
  {
    id: 'pdf-to-word',
    name: 'PDF 转 Word',
    description: '从 PDF 中提取文本并生成可编辑的 Word DOCX 文档',
    path: '/pdf/to-word',
    icon: 'DOC',
    category: 'convert',
    featured: true,
  },
  {
    id: 'pdf-merge',
    name: '合并 PDF',
    description: '将多个 PDF 文件合并成一个文档，支持拖放重新排序',
    path: '/pdf/merge',
    icon: 'MRG',
    category: 'convert',
    featured: true,
  },
  {
    id: 'pdf-split',
    name: '拆分 PDF',
    description: '将 PDF 拆分为多个文档，支持按页面范围分割',
    path: '/pdf/split',
    icon: 'SPL',
    category: 'convert',
  },
  {
    id: 'pdf-extract-pages',
    name: '提取页面',
    description: '从 PDF 文件中提取特定页面并保存为新文档',
    path: '/pdf/extract-pages',
    icon: 'EXT',
    category: 'convert',
  },
  {
    id: 'pdf-organize',
    name: '整理 PDF',
    description: '重新排序、复制和删除 PDF 页面，导出整理后的文档',
    path: '/pdf/organize',
    icon: 'ORG',
    category: 'convert',
  },
  {
    id: 'word-merge',
    name: 'Word 合并',
    description: '将多个 Word DOCX 文档合并成一个 DOCX 文件',
    path: '/file-merge/word',
    icon: 'DOC',
    category: 'convert',
  },
  {
    id: 'ppt-merge',
    name: 'PPT 合并',
    description: '将多个 PPTX 演示文稿合并成一个 PPTX 文件',
    path: '/file-merge/ppt',
    icon: 'PPT',
    category: 'convert',
  },
  {
    id: 'txt-merge',
    name: 'TXT 合并',
    description: '将多个 TXT 文本文件合并成一个 TXT 文件',
    path: '/file-merge/txt',
    icon: 'TXT',
    category: 'convert',
  },
  {
    id: 'markdown-merge',
    name: 'Markdown 合并',
    description: '将多个 Markdown 文件合并成一个 MD 文件',
    path: '/file-merge/markdown',
    icon: 'MD',
    category: 'convert',
  },
  {
    id: 'csv-merge',
    name: 'CSV 合并',
    description: '将多个 CSV 文件按表格行合并成一个 CSV 文件',
    path: '/file-merge/csv',
    icon: 'CSV',
    category: 'convert',
  },
  {
    id: 'rtf-merge',
    name: 'RTF 合并',
    description: '将多个 RTF 富文本文件合并成一个 RTF 文件',
    path: '/file-merge/rtf',
    icon: 'RTF',
    category: 'convert',
  },
  {
    id: 'excel-merge',
    name: 'Excel 合并',
    description: '合并多个 Excel / CSV 文件，支持汇总到同一个 Sheet 或保留多个 Sheet',
    path: '/file-merge/excel',
    icon: 'XLS',
    category: 'convert',
  },
  {
    id: 'image-merge',
    name: '图片合并长图',
    description: '将多张图片垂直拼接成长图 PNG，或合成为 PDF',
    path: '/file-merge/images',
    icon: 'IMG',
    category: 'convert',
  },
  {
    id: 'image-compress',
    name: '图片压缩',
    description: '在浏览器本地智能压缩 JPG、PNG、WebP 等图片，默认保持原格式，也可选择输出 WebP',
    path: '/image/compress',
    icon: 'ZIP',
    category: 'convert',
    featured: true,
  },
  {
    id: 'image-remove-bg',
    name: '图片去背景',
    description: '在浏览器本地使用开源模型移除图片背景，导出透明 PNG',
    path: '/image/remove-bg',
    icon: 'BG',
    category: 'convert',
    featured: true,
  },
  {
    id: 'image-remove-watermark',
    name: '图片去水印',
    description: '在浏览器本地使用 AI 模型补全水印选区，导出 JPG、PNG 或 WebP',
    path: '/image/remove-watermark',
    icon: 'WM-',
    category: 'convert',
    featured: true,
  },
  {
    id: 'image-watermark',
    name: '图片加水印',
    description: '为图片添加文字或图片水印，支持自由拖动、九宫格定位、平铺与对角线平铺，可调透明度、旋转、间距',
    path: '/image/watermark',
    icon: 'WM+',
    category: 'convert',
    featured: true,
  },
  {
    id: 'image-editor',
    name: '图片编辑',
    description: '在浏览器本地为图片绘制形状、折线、画笔、记号笔、文字、马赛克、模糊和橡皮擦标注',
    path: '/image/edit',
    icon: 'EDT',
    category: 'convert',
    featured: true,
  },
  {
    id: 'image-to-icon',
    name: '图片转 Icon',
    description: '在浏览器本地将 PNG、SVG、JPG 等图片制作成 ICO、ICNS 或多尺寸 PNG ZIP 图标',
    path: '/image/to-icon',
    icon: 'ICO',
    category: 'convert',
    featured: true,
  },
  {
    id: 'image-to-jpg',
    name: '图片转 JPG',
    description: '在浏览器本地将 PNG、WebP、GIF、BMP、SVG、AVIF 等图片转换为 JPG',
    path: '/image/to-jpg',
    icon: 'JPG',
    category: 'convert',
  },
  {
    id: 'image-to-png',
    name: '图片转 PNG',
    description: '在浏览器本地将 JPG、WebP、GIF、BMP、SVG、AVIF 等图片转换为 PNG',
    path: '/image/to-png',
    icon: 'PNG',
    category: 'convert',
  },
  {
    id: 'image-to-webp',
    name: '图片转 WebP',
    description: '在浏览器本地将 JPG、PNG、GIF、BMP、SVG、AVIF 等图片转换为 WebP',
    path: '/image/to-webp',
    icon: 'WEB',
    category: 'convert',
  },
  {
    id: 'image-to-base64',
    name: '图片转 Base64',
    description: '在浏览器本地将图片转换为 Base64 Data URL，支持选择、拖拽和粘贴图片',
    path: '/image/to-base64',
    icon: 'B64',
    category: 'convert',
  },
  {
    id: 'base64-to-image',
    name: 'Base64 转图片',
    description: '在浏览器本地将 Base64 或 Data URL 还原为可预览和下载的图片文件',
    path: '/image/base64-to-image',
    icon: 'IMG',
    category: 'convert',
  },
  {
    id: 'image-crop',
    name: '图片裁剪',
    description: '在浏览器本地拖拽裁剪框，移动或调整裁剪区域后导出图片',
    path: '/image/crop',
    icon: 'CUT',
    category: 'convert',
  },
  {
    id: 'image-resize',
    name: '图片尺寸修改',
    description: '在浏览器本地按指定宽度或高度等比例缩放图片并导出',
    path: '/image/resize',
    icon: 'SIZ',
    category: 'convert',
  },
  {
    id: 'subtitle-maker',
    name: '字幕编辑器',
    description: '免费在线编辑 LRC 和 SRT 字幕，支持媒体预览、时间轴校准和字幕导出',
    path: '/subtitle-maker',
    icon: 'SUB',
    category: 'convert',
    featured: true,
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
    id: 'info-codec',
    name: '信息编码转换',
    description: '集中处理 Unicode、URL、Base64、哈希、JWT、Cookie、Gzip 等信息编码和解码',
    path: '/info-codec',
    icon: 'ENC',
    category: 'encode',
    featured: true,
  },
  {
    id: 'qr-code-generator',
    name: '二维码生成',
    description: '将网址、文本、联系信息或 Wi-Fi 配置文本生成二维码 PNG',
    path: '/qr-code/generate',
    icon: 'QR+',
    category: 'encode',
  },
  {
    id: 'qr-code-decoder',
    name: '二维码解码',
    description: '上传二维码图片，在浏览器本地识别并复制二维码内容',
    path: '/qr-code/decode',
    icon: 'QR?',
    category: 'encode',
  },
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

/** 获取图片工具集合页中的工具 */
export function getImageTools(): ToolMeta[] {
  const imageMergeTool = getToolById('image-merge');
  return [
    ...toolRegistry.filter((tool) => tool.path.startsWith('/image/')),
    ...(imageMergeTool ? [imageMergeTool] : []),
  ];
}

/** 获取 PDF 工具集合页中的工具 */
export function getPdfTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/pdf/'));
}

/** 获取文件合并工具集合页中的工具 */
export function getFileMergeTools(): ToolMeta[] {
  const pdfMergeTool = getToolById('pdf-merge');
  return [
    ...(pdfMergeTool ? [pdfMergeTool] : []),
    ...toolRegistry.filter((tool) => tool.path.startsWith('/file-merge/')),
  ];
}

/** 获取字幕工具集合 */
export function getSubtitleTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/subtitle'));
}

/** 获取二维码工具集合 */
export function getQrCodeTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/qr-code/'));
}

/** 获取信息编码工具集合 */
export function getInfoCodecTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/info-codec'));
}

function isNonJsonTopLevelTool(tool: ToolMeta): boolean {
  return (
    tool.path.startsWith('/image/') ||
    tool.path.startsWith('/pdf/') ||
    tool.path.startsWith('/file-merge/') ||
    tool.path.startsWith('/subtitle') ||
    tool.path.startsWith('/qr-code/') ||
    tool.path.startsWith('/info-codec')
  );
}

/** 获取 JSON 工具集合，不包含图片、PDF、文件合并、字幕、二维码和信息编码工具 */
export function getJsonTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => !isNonJsonTopLevelTool(tool));
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

/** 首页与顶部 JSON 菜单使用的 JSON 工具分组 */
export function getJsonToolGroups(): ToolGroup[] {
  return getAllCategories()
    .map((category) => ({
      category,
      tools: getToolsByCategory(category).filter((tool) => !isNonJsonTopLevelTool(tool)),
    }))
    .filter((group) => group.tools.length > 0);
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
