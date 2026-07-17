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
    description: '格式化、压缩、验证 JSON / JSONC / JSON5，支持树形展示与节点操作',
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
    description: '修复 JSONC / JSON5 注释、尾逗号、单引号、未加引号 key 等常见问题',
    path: '/json-repair',
    icon: 'FIX',
    category: 'format',
    featured: true,
  },
  {
    id: 'json-diff',
    name: 'JSON 对比',
    description: '可视化对比两份 JSON / JSONC / JSON5 的差异，高亮增删改',
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
    id: 'image-upscale',
    name: '图片无损放大',
    description: '在浏览器本地将 JPG、PNG、WebP 等图片按 2x、3x、4x 或自定义尺寸放大，支持像素无损和清晰增强模式',
    path: '/image/upscale',
    icon: '2X',
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
    id: 'image-id-photo',
    name: '证件照制作',
    description: '在浏览器本地去除照片背景，按常见证件照尺寸自动构图，并支持底色、拖动和缩放调整',
    path: '/image/id-photo',
    icon: 'ID',
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
    id: 'image-to-avif',
    name: '图片转 AVIF',
    description: '在浏览器本地将 JPG、PNG、WebP、GIF、BMP、SVG 等图片转换为 AVIF',
    path: '/image/to-avif',
    icon: 'AVF',
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
  {
    id: 'audio-to-mp3',
    name: '音频转 MP3',
    description: '在浏览器本地将 WAV、M4A、OGG、FLAC、WebM 等音频转换为 MP3',
    path: '/audio/to-mp3',
    icon: 'MP3',
    category: 'convert',
    featured: true,
  },
  {
    id: 'audio-to-wav',
    name: '音频转 WAV',
    description: '在浏览器本地将 MP3、M4A、OGG、FLAC、WebM 等音频转换为 WAV',
    path: '/audio/to-wav',
    icon: 'WAV',
    category: 'convert',
  },
  {
    id: 'audio-extract',
    name: '音频提取',
    description: '从 MP4、MOV、WebM、MKV 等视频中提取音频并导出为 MP3',
    path: '/audio/extract',
    icon: 'EXT',
    category: 'convert',
    featured: true,
  },
  {
    id: 'audio-merge',
    name: '音频合并',
    description: '将多个不同格式的音频文件按顺序合并为一个 MP3 文件',
    path: '/audio/merge',
    icon: 'MRG',
    category: 'convert',
  },
  {
    id: 'audio-trim',
    name: '音频剪辑',
    description: '按开始和结束时间剪切或修剪音频，并导出为 MP3',
    path: '/audio/trim',
    icon: 'CUT',
    category: 'convert',
  },
  {
    id: 'audio-compress',
    name: '音频压缩',
    description: '通过降低码率在浏览器本地减少音频文件大小并导出 MP3',
    path: '/audio/compress',
    icon: 'ZIP',
    category: 'convert',
  },
  {
    id: 'audio-recorder',
    name: '录音笔',
    description: '使用麦克风在浏览器中录制音频，可预览并导出为 MP3',
    path: '/audio/recorder',
    icon: 'REC',
    category: 'convert',
  },
  {
    id: 'audio-to-text',
    name: '音频转文本',
    description: '在浏览器本地加载开源 Whisper 模型，将上传的音频转写为文本',
    path: '/audio/to-text',
    icon: 'TXT',
    category: 'convert',
    featured: true,
  },
  {
    id: 'audio-volume',
    name: '修改音量',
    description: '调整音频音量大小并在浏览器本地导出 MP3',
    path: '/audio/volume',
    icon: 'VOL',
    category: 'convert',
  },
  {
    id: 'audio-speed',
    name: '修改播放速度',
    description: '改变音频播放速度并在浏览器本地导出 MP3',
    path: '/audio/speed',
    icon: 'SPD',
    category: 'convert',
  },
  {
    id: 'audio-sample-rate',
    name: '修改采样率',
    description: '将音频重新采样为指定采样率并导出 MP3',
    path: '/audio/sample-rate',
    icon: 'AR',
    category: 'convert',
  },
  {
    id: 'audio-bitrate',
    name: '调整比特率',
    description: '按指定 MP3 比特率重新编码音频文件',
    path: '/audio/bitrate',
    icon: 'BR',
    category: 'convert',
  },
  {
    id: 'audio-remove-silence',
    name: '去除静音',
    description: '自动裁掉音频中的静音和空白片段并导出 MP3',
    path: '/audio/remove-silence',
    icon: 'SIL',
    category: 'convert',
  },
  {
    id: 'audio-tts',
    name: '文字转语音',
    description: '使用浏览器本地语音合成朗读输入文字',
    path: '/audio/tts',
    icon: 'TTS',
    category: 'convert',
  },
  {
    id: 'text-word-count',
    name: '字数统计',
    description: '统计文本字数、词数、行数、段落、句子和字节大小',
    path: '/text/word-count',
    icon: 'ABC',
    category: 'validate',
    featured: true,
  },
  {
    id: 'text-diff',
    name: '文本对比',
    description: '使用开源 diff 算法对比两段文本差异，按行和词高亮增删改',
    path: '/text/diff',
    icon: 'TXT',
    category: 'format',
    featured: true,
  },

  {
    id: 'image-exif',
    name: '图片 EXIF 查看 / 清除',
    description: '在浏览器本地读取图片 EXIF 元信息，或一键抹除后导出',
    path: '/image/exif',
    icon: 'EXF',
    category: 'convert',
  },
  {
    id: 'image-ocr',
    name: '图片 OCR 文字识别',
    description: '在浏览器本地从图片中提取文字',
    path: '/image/ocr',
    icon: 'OCR',
    category: 'convert',
    featured: true,
  },
  {
    id: 'image-rotate',
    name: '图片旋转 / 翻转',
    description: '在浏览器本地旋转 90°、180°、270°，或水平 / 垂直翻转图片',
    path: '/image/rotate',
    icon: 'ROT',
    category: 'convert',
  },
  {
    id: 'image-color-picker',
    name: '图片取色器',
    description: '在浏览器本地上传图片，点击任意位置读取 HEX、RGB、HSL 颜色',
    path: '/image/color-picker',
    icon: 'EYE',
    category: 'convert',
  },
  {
    id: 'image-gif',
    name: 'GIF 分帧 / 合成',
    description: '将 GIF 拆成逐帧 PNG，或把多张 PNG / JPG 合成为 GIF 动图',
    path: '/image/gif',
    icon: 'GIF',
    category: 'convert',
  },
  {
    id: 'pdf-encrypt',
    name: 'PDF 加密 / 解密',
    description: '在浏览器本地为 PDF 设置或移除打开密码，支持权限限制',
    path: '/pdf/encrypt',
    icon: 'KEY',
    category: 'convert',
    featured: true,
  },
  {
    id: 'pdf-watermark',
    name: 'PDF 加水印',
    description: '在浏览器本地为 PDF 添加文字水印，支持九宫格定位、平铺、对角线和透明度',
    path: '/pdf/watermark',
    icon: 'WMK',
    category: 'convert',
    featured: true,
  },
  {
    id: 'pdf-to-image',
    name: 'PDF 转图片',
    description: '在浏览器本地将 PDF 每一页导出为高清 PNG 或 JPG',
    path: '/pdf/to-image',
    icon: 'P2I',
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

  {
    id: 'regex',
    name: '正则表达式测试',
    description: '在浏览器本地测试正则表达式，支持 flags、命名分组、高亮匹配和常用模板',
    path: '/regex',
    icon: '.*',
    category: 'validate',
    featured: true,
  },
  {
    id: 'cron',
    name: 'Cron 表达式解析',
    description: '解析 Cron 表达式为人类可读描述，并预览下 N 次执行时间',
    path: '/cron',
    icon: '*/',
    category: 'validate',
  },

  // ── 编解码 ─────────────────────────────────────────────────────
  {
    id: 'timestamp',
    name: '时间戳转换',
    description: 'Unix 时间戳与日期双向转换，支持秒 / 毫秒 / 微秒精度、多时区和批量',
    path: '/timestamp',
    icon: 'TSP',
    category: 'encode',
    featured: true,
  },
  {
    id: 'uuid',
    name: 'UUID 生成',
    description: '生成 UUID v1 / v4 / v7 和 NanoID，支持批量、大小写和去连字符',
    path: '/uuid',
    icon: 'UID',
    category: 'encode',
    featured: true,
  },
  {
    id: 'color-converter',
    name: '颜色转换器',
    description: 'HEX、RGB、HSL、HSV、CMYK 颜色格式互转，实时预览色板',
    path: '/color-converter',
    icon: 'RGB',
    category: 'encode',
    featured: true,
  },
  {
    id: 'url-builder',
    name: 'URL / Query String 构造器',
    description: '拆解和构造 URL Query String，添加、编辑、编码参数并实时预览',
    path: '/url-builder',
    icon: '?=',
    category: 'encode',
  },
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
    description: '上传二维码图片或开启摄像头，在浏览器本地实时识别并复制二维码内容',
    path: '/qr-code/decode',
    icon: 'QR?',
    category: 'encode',
  },
  {
    id: 'font-subset',
    name: '字体提取',
    description: '从 TTF / WOFF 字体中提取指定字符，生成更小的 TTF 或 WOFF 子集字体',
    path: '/other/font-subset',
    icon: 'FNT',
    category: 'convert',
  },
  {
    id: 'whiteboard',
    name: '白板工具',
    description: '使用 tldraw 在浏览器本地创建完整白板，支持图形、画笔、便签、图片、页面和导出',
    path: '/other/whiteboard',
    icon: 'WBD',
    category: 'format',
  },
  {
    id: 'excalidraw-board',
    name: 'Excalidraw画板',
    description: '使用开源 Excalidraw 在浏览器本地绘制手绘风画板，支持图形、文字、图片和导出',
    path: '/other/excalidraw-board',
    icon: 'EXD',
    category: 'format',
  },
  {
    id: 'mind-map',
    name: '思维导图',
    description: '使用开源 Mind Elixir 直接编辑思维导图，并可导出 Markdown 大纲',
    path: '/other/mind-map',
    icon: 'MAP',
    category: 'format',
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

/** 获取文本工具集合 */
export function getTextTools(): ToolMeta[] {
  const imageOcrTool = getToolById('image-ocr');
  return [
    ...toolRegistry.filter((tool) => tool.path.startsWith('/text/')),
    ...(imageOcrTool ? [imageOcrTool] : []),
  ];
}

/** 获取音频工具集合 */
export function getAudioTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/audio/'));
}

/** 获取二维码工具集合 */
export function getQrCodeTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/qr-code/'));
}

/** 获取信息编码工具集合 */
export function getInfoCodecTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/info-codec'));
}

/** 获取其他工具集合 */
export function getOtherTools(): ToolMeta[] {
  return toolRegistry.filter((tool) => tool.path.startsWith('/other/'));
}

function isNonJsonTopLevelTool(tool: ToolMeta): boolean {
  return (
    tool.path.startsWith('/image/') ||
    tool.path.startsWith('/pdf/') ||
    tool.path.startsWith('/file-merge/') ||
    tool.path.startsWith('/subtitle') ||
    tool.path.startsWith('/text/') ||
    tool.path.startsWith('/audio/') ||
    tool.path.startsWith('/qr-code/') ||
    tool.path.startsWith('/info-codec') ||
    tool.path.startsWith('/other/')
  );
}

/** 获取 JSON 工具集合，不包含图片、PDF、文件合并、字幕、文本、二维码和信息编码工具 */
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
