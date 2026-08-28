# ToolGarden / JSON Toolkit

[English](./README.md)

ToolGarden 是一个浏览器本地运行的开发者与日常文件处理工具箱。它覆盖 JSON、PDF、图片、音频、文本、二维码、白板、思维导图等常用场景，适合临时处理数据、文件和素材，而不必安装桌面软件。

项目最初是一个 JSON 工具箱，现在已经扩展为包含 88 个工具的双语 Web 应用。它采用注册中心驱动架构，支持静态 SEO 输出，并尽量把文件处理和模型推理放在浏览器本地完成。

## 项目特点

- 大多数 JSON、PDF、图片、音频、字幕和文本任务都在浏览器本地处理。
- 无需账号，打开即可使用。
- 支持中文和英文界面。
- 部分 AI 类工具会在浏览器中加载本地模型，不依赖后端服务处理用户文件。
- 首页卡片、分类、相关工具、面包屑、sitemap、metadata、JSON-LD 和 `llms.txt` 都从工具注册表自动派生。
- 支持 PWA，方便作为常用工具站长期使用。

## 工具分类

### JSON 与开发者工具

- JSON 格式化、压缩、转义、修复、对比、统计和 JSONPath 查询。
- JSON 转 YAML、XML、CSV、Excel、TypeScript interface 和 JSON Schema。
- JSON Schema 校验。
- JWT 解析和 HS256 签名验证。
- 时间戳转换、UUID 生成、正则表达式测试、Cron 表达式解析、颜色转换、URL 参数构造和信息编解码。

### PDF 与文件工具

- Word、Excel、PowerPoint、图片、Markdown、HTML、TXT、CSV、RTF、EPUB 和部分 MOBI 文件转 PDF。
- PDF 转 Word、PDF 转图片。
- PDF 合并、拆分、页面提取、整理、加密、解密和加水印。
- Word、PPT、Excel、CSV、TXT、Markdown、RTF 和图片合并。

### 图片工具

- 图片压缩、尺寸修改、裁剪、旋转、翻转、格式转换和图片合并。
- 图片转 JPG、PNG、WebP、AVIF、Base64、ICO、ICNS 和多尺寸 PNG 图标包。
- 图片去背景、证件照制作、去水印、加水印、清晰增强、无损放大、OCR、EXIF 查看/清除、图片取色、GIF 分帧/合成。

### 音频、文本与其他工具

- 音频转 MP3 或 WAV。
- 视频提取音频、音频合并、剪辑、压缩、录音、调音量、变速、修改采样率、调整比特率和去除静音。
- 音频转文本、音频分轨、文字转语音。
- Markdown 转 PDF 或 HTML、文本对比、字数统计、二维码生成/解码、字体子集提取、白板、Excalidraw 画板和思维导图。

## 本地模型与无后端处理

ToolGarden 的设计原则是：如果一个任务可以合理地在浏览器中完成，就不让它依赖后端服务。

例如：

- 图片去背景会在浏览器中加载开源模型，并在本地导出透明 PNG。
- 图片清晰增强和无损放大会在浏览器支持的情况下运行本地图像处理或模型流程。
- 图片 OCR 在浏览器中提取文字。
- 音频转文本会在本地加载 Whisper 风格的开源模型。
- 音频分轨会在浏览器中拆分人声、鼓、贝斯、吉他、钢琴和其他轨道。
- 文字转语音使用本地加载的 Kokoro 语音资源生成音频。
- 很多 PDF、图片、音频、字幕和 JSON 转换都直接在浏览器内存中完成。

这种方式可以让受支持工具中的用户文件留在本机，也避免服务端排队和文件处理基础设施。代价是部分工具首次使用时需要下载模型文件，重任务的速度取决于用户浏览器、内存、CPU 和 GPU 支持情况。

## 架构设计

项目采用注册中心驱动的 Harness Engineering 架构。

工具注册表是单一事实来源：

```ts
// lib/tools/registry.ts
export const toolRegistry = [
  {
    id: 'json-format',
    name: 'JSON 格式化',
    path: '/json-format',
    category: 'format',
    featured: true,
  },
];
```

应用会从这个注册表自动派生：

- 首页工具卡片。
- 分类分组。
- 常用工具。
- 面包屑。
- 相关工具。
- 本地化工具 URL。
- sitemap 条目。
- SEO metadata。
- Open Graph metadata。
- JSON-LD 结构化数据。
- `llms.txt` 和 `llms-full.txt` 发现文件。

工具页面保持轻量。复杂解析、转换、校验、模型路由和文件处理逻辑放在 `lib/utils/` 中，页面主要负责 React state、用户输入和结果展示。

## 项目结构

```text
app/                  Next.js App Router 页面和布局
app/[locale]/         本地化页面
components/           共享 UI 和工具页面骨架
components/ui/        底层 UI 组件
i18n/                 next-intl 路由和请求配置
lib/tools/            工具注册表、metadata、SEO 和内容辅助函数
lib/utils/            纯函数或浏览器本地工具逻辑
lib/workers/          重任务使用的 Web Worker
messages/             中文和英文翻译
public/               静态资源和生成文件
scripts/              构建、sitemap、静态 metadata 和内容脚本
tests/                Vitest 测试
```

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

运行检查：

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test
```

## 新增工具

新增工具时：

1. 在 `lib/tools/registry.ts` 中添加工具 metadata。
2. 在 `messages/zh.json` 和 `messages/en.json` 中添加中英文文案。
3. 将可复用逻辑放到 `lib/utils/`。
4. 在 `app/[locale]/...` 下创建本地化页面。
5. 使用 `ToolLayout` 包裹工具页面。
6. 复用现有 metadata helper 生成 SEO 信息。
7. 运行 lint、TypeScript、build 和相关测试。

不要在首页、导航、面包屑、sitemap 或 SEO 文件里重复硬编码工具发现信息。一个正式工具应该能从注册表中被发现。

## 隐私说明

受支持的本地工具会在浏览器中处理输入，不会把用户文件或文本内容上传到应用后端进行转换。页面级统计、广告、CDN 安全策略、浏览器缓存、Service Worker 数据和第三方脚本是与工具输入处理不同的数据流，具体应以站点隐私政策为准。

处理敏感文件时，仍建议使用维护良好的浏览器，谨慎安装浏览器扩展，并优先处理重要文件的副本。

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- next-intl
- Vitest
- FFmpeg WebAssembly
- PDF.js 和 PDF 相关库
- 浏览器端 Transformers 风格推理
- Web Worker 重任务处理
