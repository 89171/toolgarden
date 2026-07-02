import type { BlogArticle } from './articles';

const watermarkAiStepsZh = `1. 选择水印区域
2. 浏览器把原图和选区送入本地模型或快速修复算法
3. 模型根据周围像素推断缺失背景
4. 边缘做轻量融合
5. 导出 JPG、PNG 或 WebP`;

const watermarkAiStepsEn = `1. Select the watermark area
2. The browser sends the image and mask to a local model or fast repair algorithm
3. The model predicts background pixels from surrounding context
4. Edges are lightly blended
5. Export JPG, PNG, or WebP`;

const lrcSnippet = `[00:12.00]First lyric line
[00:15.50]Second lyric line`;

const lrcOffsetSnippet = `[00:12.00]First lyric line
[00:14.80]Second lyric line
[00:18.20]Third lyric line`;

const srtSnippet = `1
00:00:12,000 --> 00:00:15,500
First subtitle line

2
00:00:15,500 --> 00:00:18,000
Second subtitle line`;

const base64Example = `Hello -> SGVsbG8=`;

const excelJsonExample = `[
  {
    "name": "Alice",
    "email": "alice@example.com",
    "active": true
  }
]`;

const excelNestedJsonExample = `[
  {
    "user": {
      "name": "Alice",
      "email": "alice@example.com"
    },
    "order": {
      "id": "A-1001",
      "total": 59.9
    }
  }
]`;

const jsonVariantsExample = `{
  // JSONC / JSON5 allow comments in some tools
  name: 'ToolGarden',
  tags: ['json', 'tools'],
}`;

const wordCountMixedExample = `中文 ABC 😊
ToolGarden JSON 工具`;

export const workflowSeoBlogArticles = [
  {
    slug: 'remove-image-watermark-local-ai-inpainting',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何在线去除图片水印？浏览器本地 AI 补全原理',
        excerpt: '去除图片水印通常不是简单擦除，而是先选中水印区域，再根据周围纹理补全背景。浏览器本地处理可以减少上传隐私风险。',
        metaTitle: '如何在线去除图片水印？浏览器本地 AI 补全原理',
        metaDescription: '介绍在线去除图片水印的基本流程、本地 AI 补全原理、适合处理的水印类型、局限性和导出格式选择。',
        readingTime: '约 7 分钟阅读',
        tags: ['去水印', 'AI 补全', '图片修复', '本地处理'],
        relatedTools: [
          {
            label: '图片去水印',
            href: '/image/remove-watermark',
            description: '选择水印区域，用浏览器本地 AI 模型或快速修复算法补全背景。',
          },
          {
            label: '图片编辑',
            href: '/image/edit',
            description: '需要手动标注、模糊或马赛克时，可以继续使用图片编辑工具。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '在线去除图片水印的关键步骤是选中水印区域，再让算法根据周围内容推断这块区域原本可能是什么样。',
          },
          {
            type: 'paragraph',
            text: '水印去除适合处理你拥有版权或有修改权限的图片，例如自己导出的草稿图、测试截图、内部素材或误加水印的图片。不要用它处理没有授权的图片。',
          },
          { type: 'heading', level: 2, text: '本地 AI 补全大致怎么工作？' },
          { type: 'code', language: 'text', code: watermarkAiStepsZh },
          {
            type: 'paragraph',
            text: '这类处理通常叫 inpainting，也就是图像补全。模型不是恢复真实原图，而是根据周围颜色、纹理、边缘方向和语义信息生成一个看起来合理的替代区域。',
          },
          { type: 'heading', level: 2, text: '哪些水印更容易处理？' },
          {
            type: 'table',
            headers: ['水印场景', '效果预期', '原因'],
            rows: [
              ['纯色背景上的文字水印', '较好', '周围纹理简单，容易补全'],
              ['渐变或轻微纹理背景', '中等到较好', '边缘融合比较关键'],
              ['复杂人脸、手部、文字下方水印', '不稳定', '模型难以知道真实细节'],
              ['大面积半透明水印', '较难', '遮挡范围大，补全信息不足'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片去水印',
            text: '上传图片后拖拽选择水印区域，可以使用本地 AI 补全或快速像素修复导出结果。图片处理在浏览器中完成。',
            href: '/image/remove-watermark',
            linkLabel: '打开图片去水印',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '去水印工具适合修复小范围遮挡和简单背景。对于关键照片、复杂纹理或大面积遮挡，最好保留原图备份，并接受需要二次微调的可能。',
          },
        ],
      },
      en: {
        title: 'How Does Online Image Watermark Removal Work with Local AI Inpainting?',
        excerpt: 'Removing a watermark is usually image inpainting: select the watermark area, then reconstruct the background from surrounding pixels locally in the browser.',
        metaTitle: 'How Online Image Watermark Removal Works with Local AI',
        metaDescription: 'Learn the workflow behind browser-local image watermark removal, AI inpainting, suitable watermark areas, limitations, and export format choices.',
        readingTime: '7 min read',
        tags: ['watermark removal', 'AI inpainting', 'image repair', 'local processing'],
        relatedTools: [
          {
            label: 'Image Watermark Remover',
            href: '/image/remove-watermark',
            description: 'Select a watermark area and repair it with a browser-local AI model or fast pixel repair.',
          },
          {
            label: 'Image Editor',
            href: '/image/edit',
            description: 'Use manual annotation, blur, mosaic, and editing tools after repair if needed.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Online watermark removal works by selecting a watermark area and reconstructing plausible background pixels from the surrounding image.',
          },
          {
            type: 'paragraph',
            text: 'Use watermark removal only for images you own or have permission to modify, such as your own drafts, screenshots, internal assets, or files that were watermarked by mistake.',
          },
          { type: 'heading', level: 2, text: 'How Local AI Inpainting Works' },
          { type: 'code', language: 'text', code: watermarkAiStepsEn },
          {
            type: 'paragraph',
            text: 'Inpainting does not recover the true original pixels. It predicts a visually plausible replacement based on nearby colors, texture, edge direction, and image context.',
          },
          { type: 'heading', level: 2, text: 'Which Watermarks Work Best?' },
          {
            type: 'table',
            headers: ['Watermark case', 'Expected result', 'Reason'],
            rows: [
              ['Text on a flat background', 'Good', 'Simple surroundings are easier to reconstruct'],
              ['Gradient or light texture', 'Medium to good', 'Edge blending matters'],
              ['Watermark over faces, hands, or text', 'Unstable', 'The model cannot know the real hidden detail'],
              ['Large translucent watermark', 'Hard', 'Too much image context is missing'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Image Watermark Remover',
            text: 'Upload an image, drag over the watermark area, and export a repaired result with browser-local AI inpainting or fast pixel repair.',
            href: '/image/remove-watermark',
            linkLabel: 'Open Image Watermark Remover',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Watermark removal is best for small obstructions and simple backgrounds. For complex photos or large covered areas, keep the original and expect possible manual cleanup.',
          },
        ],
      },
    },
  },
  {
    slug: 'add-watermark-to-image-text-tile-diagonal',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何给图片加水印：文字/图片、九宫格、平铺、对角线',
        excerpt: '图片水印可以是文字，也可以是 Logo 图片。位置、透明度、旋转、平铺方式会直接影响版权提示和图片可读性。',
        metaTitle: '如何给图片加水印？文字/图片、九宫格、平铺、对角线教程',
        metaDescription: '介绍图片加水印的常用方式，包括文字水印、图片水印、九宫格定位、平铺、对角线平铺、透明度、旋转和导出格式选择。',
        readingTime: '约 6 分钟阅读',
        tags: ['图片水印', '文字水印', 'Logo 水印', '图片工具'],
        relatedTools: [
          {
            label: '图片加水印',
            href: '/image/watermark',
            description: '添加文字或图片水印，支持九宫格、拖动、平铺、对角线和透明度设置。',
          },
          {
            label: '图片编辑',
            href: '/image/edit',
            description: '为图片继续添加文字、形状、标注、马赛克和模糊。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '给图片加水印，不只是把 Logo 放上去。更重要的是让水印可见但不干扰主体内容。',
          },
          { type: 'heading', level: 2, text: '文字水印和图片水印怎么选？' },
          {
            type: 'table',
            headers: ['类型', '适合场景', '注意事项'],
            rows: [
              ['文字水印', '作者名、网址、订单号、内部标记', '字号和透明度要适中'],
              ['图片水印', '品牌 Logo、活动标识、版权图章', '优先使用透明 PNG'],
              ['平铺水印', '防止截图二次传播', '透明度要低，避免遮挡内容'],
              ['对角线水印', '合同、样张、审核图', '旋转角度和间距要稳定'],
            ],
          },
          { type: 'heading', level: 2, text: '九宫格定位适合什么？' },
          {
            type: 'paragraph',
            text: '九宫格定位适合单个水印，比如左上、右下、居中。右下角常用于版权标识，居中适合样张或内部审核图，边角水印对主体遮挡更少。',
          },
          { type: 'heading', level: 2, text: '导出格式怎么选？' },
          {
            type: 'list',
            items: [
              '照片优先导出 JPG 或 WebP，文件体积更小。',
              '截图、透明图和 UI 素材优先导出 PNG。',
              '如果水印包含透明 Logo，建议保留 PNG 源文件再导出。',
              '公开发布前，先在手机和桌面上检查水印是否过浅或过重。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片加水印',
            text: '支持文字水印和图片水印，提供单个水印、九宫格定位、拖拽、平铺、对角线平铺、透明度和旋转控制。',
            href: '/image/watermark',
            linkLabel: '打开图片加水印',
          },
        ],
      },
      en: {
        title: 'How to Add Text, Image, Tiled, and Diagonal Watermarks to Images',
        excerpt: 'Image watermarks can be text or logos. Position, opacity, rotation, and tiling decide whether the mark is useful without distracting from the image.',
        metaTitle: 'How to Add Text, Image, Tiled, and Diagonal Watermarks',
        metaDescription: 'Learn text watermarks, image watermarks, nine-grid positioning, tiling, diagonal patterns, opacity, rotation, and output format choices.',
        readingTime: '6 min read',
        tags: ['image watermark', 'text watermark', 'logo watermark', 'image tools'],
        relatedTools: [
          {
            label: 'Image Watermark',
            href: '/image/watermark',
            description: 'Add text or image watermarks with grid positions, dragging, tiling, diagonal layout, and opacity controls.',
          },
          {
            label: 'Image Editor',
            href: '/image/edit',
            description: 'Continue editing with text, shapes, annotations, mosaic, and blur tools.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Adding a watermark is not just placing a logo on top. The mark should be visible without damaging the main image.',
          },
          { type: 'heading', level: 2, text: 'Text Watermark or Image Watermark?' },
          {
            type: 'table',
            headers: ['Type', 'Best for', 'Tip'],
            rows: [
              ['Text watermark', 'Author names, URLs, order IDs, internal labels', 'Tune size and opacity carefully'],
              ['Image watermark', 'Brand logos, campaign marks, copyright stamps', 'Use transparent PNG when possible'],
              ['Tiled watermark', 'Discouraging reposts and screenshots', 'Keep opacity low'],
              ['Diagonal watermark', 'Contracts, samples, review images', 'Keep rotation and spacing consistent'],
            ],
          },
          { type: 'heading', level: 2, text: 'When to Use Nine-Grid Positioning' },
          {
            type: 'paragraph',
            text: 'Nine-grid positioning is useful for a single watermark. Bottom-right works well for copyright marks, center works for samples, and corner marks usually cover less important content.',
          },
          { type: 'heading', level: 2, text: 'Which Output Format Should You Use?' },
          {
            type: 'list',
            items: [
              'Use JPG or WebP for photos when smaller files matter.',
              'Use PNG for screenshots, transparent images, and UI assets.',
              'Keep the transparent logo source if your watermark is an image.',
              'Preview on mobile and desktop before publishing.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Image Watermark',
            text: 'Create text or image watermarks with single placement, nine-grid snapping, dragging, tiling, diagonal tiling, opacity, and rotation controls.',
            href: '/image/watermark',
            linkLabel: 'Open Image Watermark',
          },
        ],
      },
    },
  },
  {
    slug: 'remove-image-background-browser-local-model',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何一键去除图片背景？在浏览器本地跑模型的原理',
        excerpt: '图片去背景通常会先识别前景主体，再生成透明 alpha mask。浏览器本地模型可以在不上传图片的情况下导出透明 PNG。',
        metaTitle: '如何一键去除图片背景？浏览器本地模型原理',
        metaDescription: '解释图片去背景的基本原理，包括前景分割、alpha mask、透明 PNG、浏览器本地模型、适合图片和常见边缘问题。',
        readingTime: '约 7 分钟阅读',
        tags: ['图片去背景', '透明 PNG', '本地 AI', '前景分割'],
        relatedTools: [
          {
            label: '图片去背景',
            href: '/image/remove-bg',
            description: '在浏览器本地使用开源模型移除图片背景，导出透明 PNG。',
          },
          {
            label: '图片转 PNG',
            href: '/image/to-png',
            description: '需要透明背景时，PNG 通常是更稳的输出格式。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '一键去背景的核心是把图片分成前景和背景，然后把背景像素变成透明。',
          },
          {
            type: 'paragraph',
            text: '现代去背景工具通常使用图像分割模型。模型会预测每个像素属于前景的概率，再生成一张 alpha mask，用它决定哪些区域保留、哪些区域透明。',
          },
          { type: 'heading', level: 2, text: '本地模型处理流程' },
          {
            type: 'list',
            ordered: true,
            items: [
              '浏览器读取图片并解码成像素。',
              '模型在本地推断前景区域。',
              '生成透明度遮罩，也就是 alpha mask。',
              '把背景像素设为透明，保留主体。',
              '导出透明 PNG，方便继续设计或排版。',
            ],
          },
          { type: 'heading', level: 2, text: '哪些图片效果更好？' },
          {
            type: 'table',
            headers: ['图片类型', '效果预期', '建议'],
            rows: [
              ['人像、商品、宠物、单一主体', '较好', '主体边界清晰更稳定'],
              ['纯色或简单背景', '较好', '模型更容易分辨前景'],
              ['发丝、透明物、复杂阴影', '中等', '边缘可能需要后期微调'],
              ['主体和背景颜色接近', '较难', '尝试更高清原图'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片去背景',
            text: '上传图片后，工具会在浏览器本地加载模型并导出透明 PNG。图片不需要上传到服务器。',
            href: '/image/remove-bg',
            linkLabel: '打开图片去背景',
          },
        ],
      },
      en: {
        title: 'How One-Click Background Removal Works with a Browser-Local Model',
        excerpt: 'Background removal detects the foreground subject and creates an alpha mask. A browser-local model can export transparent PNGs without uploading images.',
        metaTitle: 'How One-Click Image Background Removal Works Locally',
        metaDescription: 'Learn foreground segmentation, alpha masks, transparent PNG export, browser-local models, best image types, and common edge issues.',
        readingTime: '7 min read',
        tags: ['background removal', 'transparent PNG', 'local AI', 'segmentation'],
        relatedTools: [
          {
            label: 'Remove Image Background',
            href: '/image/remove-bg',
            description: 'Remove image backgrounds locally in the browser and export transparent PNG.',
          },
          {
            label: 'Image to PNG',
            href: '/image/to-png',
            description: 'PNG is usually the safest output format for transparent images.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'One-click background removal separates foreground from background and turns background pixels transparent.',
          },
          {
            type: 'paragraph',
            text: 'Modern background removal tools use segmentation models. The model predicts how likely each pixel is to belong to the foreground, then creates an alpha mask for transparency.',
          },
          { type: 'heading', level: 2, text: 'Local Model Workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'The browser reads and decodes the image.',
              'The model predicts the foreground area locally.',
              'An alpha mask is generated.',
              'Background pixels are made transparent.',
              'The result is exported as a transparent PNG.',
            ],
          },
          { type: 'heading', level: 2, text: 'Which Images Work Best?' },
          {
            type: 'table',
            headers: ['Image type', 'Expected result', 'Tip'],
            rows: [
              ['Portraits, products, pets, single subjects', 'Good', 'Clear subject edges help'],
              ['Plain or simple background', 'Good', 'Foreground is easier to separate'],
              ['Hair, transparent objects, complex shadows', 'Medium', 'Edges may need cleanup'],
              ['Subject and background have similar colors', 'Harder', 'Use a higher-resolution source'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Remove Image Background',
            text: 'Upload an image, run the browser-local model, and export a transparent PNG without sending the image to a server.',
            href: '/image/remove-bg',
            linkLabel: 'Open Remove Background',
          },
        ],
      },
    },
  },
  {
    slug: 'base64-encoding-explained-common-pitfalls',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: 'Base64 编码原理和常见坑',
        excerpt: 'Base64 是把二进制数据转成文本的一种编码方式，常用于图片 Data URL、接口传输和配置嵌入，但它不是加密。',
        metaTitle: 'Base64 编码原理和常见坑：图片、Data URL、接口传输',
        metaDescription: '解释 Base64 编码原理、为什么体积会变大、Data URL 和纯 Base64 的区别、常见复制错误以及为什么 Base64 不是加密。',
        readingTime: '约 7 分钟阅读',
        tags: ['Base64', '编码', 'Data URL', '图片转 Base64'],
        relatedTools: [
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '处理 Base64、URL、Unicode、哈希、Cookie、Gzip 等编码解码。',
          },
          {
            label: '图片转 Base64',
            href: '/image/to-base64',
            description: '把图片转换为 Data URL 或纯 Base64 字符串。',
          },
          {
            label: 'Base64 转图片',
            href: '/image/base64-to-image',
            description: '把图片 Base64 或 Data URL 还原成可预览和下载的图片。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Base64 是编码，不是加密。任何人拿到 Base64 字符串，都可以把它解码回原始内容。',
          },
          { type: 'code', language: 'text', code: base64Example },
          {
            type: 'paragraph',
            text: '它的作用是把二进制数据转换成只包含常见 ASCII 字符的文本，方便放进 JSON、HTML、CSS、配置文件或接口字段里。',
          },
          { type: 'heading', level: 2, text: '为什么 Base64 会变大？' },
          {
            type: 'paragraph',
            text: 'Base64 大约每 3 个字节编码成 4 个字符，所以体积通常会增加约三分之一。如果把大图片直接塞进 JSON，请求体可能会明显膨胀。',
          },
          { type: 'heading', level: 2, text: 'Data URL 和纯 Base64 有什么区别？' },
          {
            type: 'table',
            headers: ['形式', '例子', '用途'],
            rows: [
              ['纯 Base64', 'iVBORw0KGgo...', '只包含编码内容'],
              ['Data URL', 'data:image/png;base64,iVBOR...', '包含 MIME 类型，可直接用于 img src'],
              ['URL Safe Base64', '使用 - 和 _', '常见于 JWT 和 URL 场景'],
            ],
          },
          { type: 'heading', level: 2, text: '常见坑' },
          {
            type: 'list',
            items: [
              '把 Base64 当作加密，导致敏感信息直接暴露。',
              '复制时漏掉末尾 = 填充字符，导致解码失败。',
              '把 Data URL 当成纯 Base64 传给后端，后端解析失败。',
              '图片太大仍然转 Base64，导致页面和接口变慢。',
              '混用标准 Base64 和 URL Safe Base64。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Base64 工具',
            text: '可以用信息编码转换处理文本 Base64，也可以用图片 Base64 工具在本地完成图片和 Base64 的互转。',
            href: '/info-codec',
            linkLabel: '打开信息编码转换',
          },
        ],
      },
      en: {
        title: 'Base64 Encoding Explained and Common Pitfalls',
        excerpt: 'Base64 turns binary data into text for Data URLs, APIs, and embedded configuration. It is encoding, not encryption.',
        metaTitle: 'Base64 Encoding Explained: Data URLs, APIs, and Pitfalls',
        metaDescription: 'Understand how Base64 works, why it increases size, the difference between Data URLs and raw Base64, copy errors, and why Base64 is not encryption.',
        readingTime: '7 min read',
        tags: ['Base64', 'encoding', 'Data URL', 'image to Base64'],
        relatedTools: [
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Encode and decode Base64, URL, Unicode, hashes, Cookie, Gzip, and more.',
          },
          {
            label: 'Image to Base64',
            href: '/image/to-base64',
            description: 'Convert images to Data URLs or raw Base64 strings.',
          },
          {
            label: 'Base64 to Image',
            href: '/image/base64-to-image',
            description: 'Restore image Base64 or Data URLs into previewable downloadable image files.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Base64 is encoding, not encryption. Anyone with the string can decode it back to the original content.',
          },
          { type: 'code', language: 'text', code: base64Example },
          {
            type: 'paragraph',
            text: 'Base64 converts binary bytes into text made from common ASCII characters, which makes it convenient for JSON, HTML, CSS, configs, and API fields.',
          },
          { type: 'heading', level: 2, text: 'Why Does Base64 Get Larger?' },
          {
            type: 'paragraph',
            text: 'Base64 encodes about every 3 bytes into 4 characters, so the result is usually about one third larger than the original binary data.',
          },
          { type: 'heading', level: 2, text: 'Data URL vs Raw Base64' },
          {
            type: 'table',
            headers: ['Form', 'Example', 'Use case'],
            rows: [
              ['Raw Base64', 'iVBORw0KGgo...', 'Only the encoded content'],
              ['Data URL', 'data:image/png;base64,iVBOR...', 'Includes MIME type and can be used as img src'],
              ['URL Safe Base64', 'Uses - and _', 'Common in JWT and URL contexts'],
            ],
          },
          { type: 'heading', level: 2, text: 'Common Pitfalls' },
          {
            type: 'list',
            items: [
              'Treating Base64 as encryption and exposing sensitive data.',
              'Missing trailing padding characters when copying.',
              'Sending a Data URL when the backend expects raw Base64.',
              'Embedding very large images as Base64 and slowing down pages or APIs.',
              'Mixing standard Base64 and URL Safe Base64.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Base64 Tools',
            text: 'Use Info Encoder / Decoder for text Base64, or image Base64 tools to convert images and Data URLs locally in the browser.',
            href: '/info-codec',
            linkLabel: 'Open Info Encoder / Decoder',
          },
        ],
      },
    },
  },
  {
    slug: 'lrc-vs-srt-subtitle-format-edit-online',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: 'LRC vs SRT 字幕格式区别，如何在线编辑',
        excerpt: 'LRC 常用于歌词逐行同步，SRT 常用于视频字幕。两者时间格式、结构和适用场景不同，但都可以在线解析、校准和导出。',
        metaTitle: 'LRC vs SRT 字幕格式区别，如何在线编辑字幕',
        metaDescription: '比较 LRC 和 SRT 字幕格式的时间码、结构、适用场景，介绍在线编辑、媒体预览、时间轴校准和导出流程。',
        readingTime: '约 8 分钟阅读',
        tags: ['LRC', 'SRT', '字幕编辑', '歌词同步'],
        relatedTools: [
          {
            label: '字幕编辑器',
            href: '/subtitle-maker',
            description: '在线编辑 LRC 和 SRT 字幕，支持媒体预览、时间轴校准和字幕导出。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'LRC 和 SRT 都是带时间信息的文本文件，但它们服务的场景不同：LRC 更像歌词，SRT 更像视频字幕。',
          },
          { type: 'heading', level: 2, text: 'LRC 格式示例' },
          { type: 'code', language: 'text', code: lrcSnippet },
          { type: 'heading', level: 2, text: 'SRT 格式示例' },
          { type: 'code', language: 'text', code: srtSnippet },
          { type: 'heading', level: 2, text: '核心区别' },
          {
            type: 'table',
            headers: ['格式', '时间信息', '适合场景'],
            rows: [
              ['LRC', '每行通常只有一个时间点', '歌词、逐行高亮、音乐播放'],
              ['SRT', '每条字幕有开始和结束时间', '视频字幕、课程、短片、访谈'],
              ['LRC', '结构更轻', '适合快速同步文本'],
              ['SRT', '结构更完整', '适合控制字幕显示时长'],
            ],
          },
          { type: 'heading', level: 2, text: '时间轴校准时看什么？' },
          {
            type: 'paragraph',
            text: '字幕是否好用，不只看格式是否正确，更看时间轴是否贴合声音。LRC 通常只需要让每句歌词在唱到时高亮；SRT 则要同时关心出现时间和消失时间，避免字幕太早消失或和下一句重叠。',
          },
          { type: 'code', language: 'text', code: lrcOffsetSnippet },
          {
            type: 'list',
            items: [
              '如果整首歌都慢半秒，可以整体平移时间轴，而不是逐行修改。',
              '如果只有某几句不准，优先修正段落开头和换气点。',
              '视频字幕每条建议控制在一到两行，太长会影响阅读。',
              '人物访谈或课程字幕要避免相邻两条时间重叠。',
            ],
          },
          { type: 'heading', level: 2, text: 'LRC 转 SRT 会遇到什么问题？' },
          {
            type: 'paragraph',
            text: 'LRC 每行只有开始时间，没有明确结束时间。把 LRC 转成 SRT 时，常见做法是把下一行的开始时间当成上一行的结束时间；如果是最后一行，就需要根据音频长度或手动设置一个结束时间。',
          },
          {
            type: 'table',
            headers: ['问题', '表现', '处理方式'],
            rows: [
              ['时间格式混用', '小数点和逗号混在一起', 'LRC 用 00:12.00，SRT 用 00:00:12,000'],
              ['字幕太长', '画面底部堆成多行', '拆成更短的句子，保留自然停顿'],
              ['编码不一致', '中文显示乱码', '保存为 UTF-8 后重新导入'],
              ['空行或编号错误', 'SRT 播放器无法识别', '检查编号、空行和时间箭头格式'],
            ],
          },
          { type: 'heading', level: 2, text: '在线编辑流程' },
          {
            type: 'list',
            ordered: true,
            items: [
              '上传或粘贴 LRC / SRT 字幕文本。',
              '上传本地音频或视频作为预览参考。',
              '播放媒体，逐行校准开始或结束时间。',
              '检查空行、重叠时间和过长字幕。',
              '选择目标格式并导出。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 字幕编辑器',
            text: '支持 LRC 和 SRT 文件上传或粘贴解析，可以配合本地媒体预览校准时间轴，并导出目标格式。',
            href: '/subtitle-maker',
            linkLabel: '打开字幕编辑器',
          },
        ],
      },
      en: {
        title: 'LRC vs SRT Subtitle Formats and How to Edit Them Online',
        excerpt: 'LRC is often used for synced lyrics, while SRT is common for video subtitles. Their timing structure and editing needs are different.',
        metaTitle: 'LRC vs SRT Subtitle Formats and Online Editing Guide',
        metaDescription: 'Compare LRC and SRT subtitle timing, structure, use cases, online editing, media preview, timeline calibration, and export workflow.',
        readingTime: '8 min read',
        tags: ['LRC', 'SRT', 'subtitle editor', 'lyrics sync'],
        relatedTools: [
          {
            label: 'Subtitle Maker',
            href: '/subtitle-maker',
            description: 'Edit LRC and SRT subtitles online with media preview, timeline calibration, and export.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'LRC and SRT are both timed text formats, but LRC is closer to synced lyrics and SRT is closer to video subtitles.',
          },
          { type: 'heading', level: 2, text: 'LRC Example' },
          { type: 'code', language: 'text', code: lrcSnippet },
          { type: 'heading', level: 2, text: 'SRT Example' },
          { type: 'code', language: 'text', code: srtSnippet },
          { type: 'heading', level: 2, text: 'Key Differences' },
          {
            type: 'table',
            headers: ['Format', 'Timing', 'Best for'],
            rows: [
              ['LRC', 'Usually one timestamp per line', 'Lyrics and line-by-line music sync'],
              ['SRT', 'Each cue has start and end time', 'Video subtitles, courses, clips, interviews'],
              ['LRC', 'Lightweight structure', 'Fast line syncing'],
              ['SRT', 'More complete cue structure', 'Precise subtitle display duration'],
            ],
          },
          { type: 'heading', level: 2, text: 'What to Check When Calibrating Timing' },
          {
            type: 'paragraph',
            text: 'A valid subtitle file can still feel wrong if the timing is off. LRC usually needs each lyric line to highlight when it is sung. SRT needs both start and end time, so a cue should not disappear too early or overlap the next line.',
          },
          { type: 'code', language: 'text', code: lrcOffsetSnippet },
          {
            type: 'list',
            items: [
              'If the whole song is late by half a second, shift the timeline globally instead of editing every line.',
              'If only a few lines are off, fix section starts and natural pauses first.',
              'For video subtitles, keep each cue to one or two readable lines when possible.',
              'For interviews and courses, avoid overlapping adjacent cues.',
            ],
          },
          { type: 'heading', level: 2, text: 'What Happens When Converting LRC to SRT?' },
          {
            type: 'paragraph',
            text: 'LRC lines usually have a start time but no explicit end time. When converting LRC to SRT, the next line start time is often used as the previous line end time. The last line needs an end time based on media duration or manual adjustment.',
          },
          {
            type: 'table',
            headers: ['Issue', 'Symptom', 'Fix'],
            rows: [
              ['Mixed time formats', 'Dots and commas are mixed', 'Use 00:12.00 for LRC and 00:00:12,000 for SRT'],
              ['Long cues', 'Subtitle takes too many lines', 'Split into shorter readable phrases'],
              ['Wrong encoding', 'Chinese text is garbled', 'Save as UTF-8 and import again'],
              ['Bad SRT spacing', 'Player cannot read the file', 'Check cue numbers, blank lines, and the time arrow'],
            ],
          },
          { type: 'heading', level: 2, text: 'Online Editing Workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Upload or paste LRC / SRT subtitle text.',
              'Load a local audio or video file for preview.',
              'Play the media and calibrate row timing.',
              'Check empty lines, overlapping timestamps, and long subtitles.',
              'Choose the target format and export.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Subtitle Maker',
            text: 'Upload or paste LRC and SRT subtitles, preview against local media, calibrate timing, and export the result.',
            href: '/subtitle-maker',
            linkLabel: 'Open Subtitle Maker',
          },
        ],
      },
    },
  },
  {
    slug: 'convert-excel-data-to-json-online',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: 'Excel 数据如何一键转成 JSON',
        excerpt: 'Excel 转 JSON 通常会读取第一行作为字段名，再把后续每一行转换成对象，适合接口 mock、数据导入和配置迁移。',
        metaTitle: 'Excel 数据如何一键转成 JSON？在线转换教程',
        metaDescription: '介绍 Excel 转 JSON 的常见规则，包括表头字段、空单元格、数字和日期、第一张 Sheet、数据清洗以及在线本地转换流程。',
        readingTime: '约 8 分钟阅读',
        tags: ['Excel 转 JSON', 'XLSX', '数据转换', 'JSON'],
        relatedTools: [
          {
            label: 'Excel → JSON',
            href: '/excel-to-json',
            description: '读取 Excel (.xlsx/.xls) 文件并转换为 JSON 数组。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '转换后可以继续格式化、压缩和校验 JSON。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Excel 转 JSON 的核心规则是：表头变成字段名，每一行变成一个 JSON 对象。',
          },
          { type: 'code', language: 'json', code: excelJsonExample },
          { type: 'heading', level: 2, text: '转换前最好整理表格' },
          {
            type: 'list',
            items: [
              '第一行作为字段名，避免空表头和重复表头。',
              '每一列只放一种类型的数据，例如不要混用数字和说明文字。',
              '日期列要确认是否需要保留为文本，还是转成日期字符串。',
              '删除合并单元格、注释行和统计行，避免混入 JSON。',
              '如果有多个 Sheet，先确认工具读取哪一张表。',
            ],
          },
          { type: 'heading', level: 2, text: '如何表达嵌套字段？' },
          {
            type: 'paragraph',
            text: '很多接口需要嵌套对象，而 Excel 天然是二维表。比较常见的做法是在表头中使用路径式字段名，例如 user.name、user.email、order.id。转换时再把这些路径还原成嵌套 JSON。',
          },
          { type: 'code', language: 'json', code: excelNestedJsonExample },
          {
            type: 'table',
            headers: ['Excel 表头', 'JSON 结果', '适合场景'],
            rows: [
              ['user.name', 'user: { name: ... }', '用户资料、联系人信息'],
              ['order.total', 'order: { total: ... }', '订单、报价、结算数据'],
              ['tags', 'tags: ...', '简单标签列，可后续拆成数组'],
              ['address.city', 'address: { city: ... }', '地址、地区、配送信息'],
            ],
          },
          { type: 'heading', level: 2, text: '空值、日期和数字要特别小心' },
          {
            type: 'paragraph',
            text: 'Excel 看起来像文本的内容，底层可能是数字、日期序列值或带格式的单元格。比如身份证号、手机号、邮编这类字段不应该当数字处理，否则前导零可能丢失；金额字段则要确认小数精度是否满足业务要求。',
          },
          {
            type: 'list',
            items: [
              'ID、手机号、邮编建议在 Excel 中按文本保存。',
              '金额、数量、比例字段转换后要抽查小数位。',
              '日期最好统一成 yyyy-mm-dd 或 ISO 字符串，再交给接口处理。',
              '空单元格要确认是保留 null、空字符串，还是直接省略字段。',
            ],
          },
          { type: 'heading', level: 2, text: '常见问题' },
          {
            type: 'table',
            headers: ['问题', '原因', '建议'],
            rows: [
              ['字段名很奇怪', '表头含空格、换行或重复名称', '先规范表头'],
              ['数字变成文本', 'Excel 单元格格式不统一', '转换后抽查关键字段'],
              ['空值丢失或变空字符串', '空单元格处理规则不同', '根据接口要求统一处理'],
              ['日期不符合预期', 'Excel 日期本质上可能是序列值', '提前转为文本日期'],
            ],
          },
          { type: 'heading', level: 2, text: '导入接口前的检查清单' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先转换少量样本，确认字段名和嵌套结构正确。',
              '用 JSON 格式化工具检查输出是否为合法 JSON。',
              '随机抽查首行、中间行和最后一行，避免空行或统计行混入。',
              '对照接口文档确认必填字段、字段类型和日期格式。',
              '正式导入前保留原始 Excel 文件，方便回溯。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Excel → JSON',
            text: '上传 Excel 文件后，工具会在浏览器本地读取表格并输出 JSON 数组，适合快速生成接口样本和导入数据。',
            href: '/excel-to-json',
            linkLabel: '打开 Excel → JSON',
          },
        ],
      },
      en: {
        title: 'How to Convert Excel Data to JSON Online',
        excerpt: 'Excel to JSON usually turns the first row into field names and each following row into a JSON object for mock APIs, imports, and config migration.',
        metaTitle: 'How to Convert Excel Data to JSON Online',
        metaDescription: 'Learn Excel to JSON conversion rules, headers, empty cells, numbers, dates, first-sheet behavior, data cleanup, and browser-local conversion.',
        readingTime: '8 min read',
        tags: ['Excel to JSON', 'XLSX', 'data conversion', 'JSON'],
        relatedTools: [
          {
            label: 'Excel to JSON',
            href: '/excel-to-json',
            description: 'Read Excel files and convert sheet rows into JSON arrays.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and validate the converted JSON.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The basic rule for Excel to JSON is simple: headers become field names, and each row becomes a JSON object.',
          },
          { type: 'code', language: 'json', code: excelJsonExample },
          { type: 'heading', level: 2, text: 'Clean the Sheet Before Conversion' },
          {
            type: 'list',
            items: [
              'Use the first row as field names and avoid empty or duplicate headers.',
              'Keep each column to one kind of data.',
              'Decide whether date columns should remain text or become date strings.',
              'Remove merged cells, notes, and summary rows before conversion.',
              'If the file has multiple sheets, confirm which sheet the tool reads.',
            ],
          },
          { type: 'heading', level: 2, text: 'How to Represent Nested Fields' },
          {
            type: 'paragraph',
            text: 'Many APIs expect nested objects, while Excel is a flat table. A common approach is to use path-like headers such as user.name, user.email, and order.id, then rebuild those paths into nested JSON.',
          },
          { type: 'code', language: 'json', code: excelNestedJsonExample },
          {
            type: 'table',
            headers: ['Excel header', 'JSON result', 'Best for'],
            rows: [
              ['user.name', 'user: { name: ... }', 'Profiles and contacts'],
              ['order.total', 'order: { total: ... }', 'Orders, quotes, and billing data'],
              ['tags', 'tags: ...', 'Simple tag columns that can later become arrays'],
              ['address.city', 'address: { city: ... }', 'Addresses, regions, and shipping data'],
            ],
          },
          { type: 'heading', level: 2, text: 'Handle Empty Values, Dates, and Numbers Carefully' },
          {
            type: 'paragraph',
            text: 'A cell that looks like text in Excel may actually be a number, a date serial value, or a formatted cell. IDs, phone numbers, and postal codes should usually stay as text so leading zeros are not lost. Amount fields need decimal checks.',
          },
          {
            type: 'list',
            items: [
              'Save IDs, phone numbers, and postal codes as text when needed.',
              'Check decimal places for amounts, quantities, and ratios.',
              'Normalize dates to yyyy-mm-dd or ISO strings before sending them to an API.',
              'Decide whether blank cells should become null, empty strings, or omitted fields.',
            ],
          },
          { type: 'heading', level: 2, text: 'Common Issues' },
          {
            type: 'table',
            headers: ['Issue', 'Cause', 'Suggestion'],
            rows: [
              ['Strange field names', 'Headers contain spaces, line breaks, or duplicates', 'Normalize headers first'],
              ['Numbers become text', 'Cell formats are inconsistent', 'Check key fields after conversion'],
              ['Empty values change', 'Different blank-cell rules', 'Normalize according to API needs'],
              ['Dates look wrong', 'Excel dates may be serial values', 'Convert dates to text first'],
            ],
          },
          { type: 'heading', level: 2, text: 'Checklist Before Importing to an API' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Convert a small sample first and confirm field names and nested structure.',
              'Use a JSON formatter to verify that the output is valid JSON.',
              'Spot-check the first row, a middle row, and the last row to catch empty or summary rows.',
              'Compare required fields, field types, and date formats with the API documentation.',
              'Keep the original Excel file before a production import.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Excel to JSON',
            text: 'Upload an Excel file and convert rows into a JSON array locally in the browser.',
            href: '/excel-to-json',
            linkLabel: 'Open Excel to JSON',
          },
        ],
      },
    },
  },
  {
    slug: 'text-diff-algorithm-add-delete-change',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '文本对比工具原理：diff 算法怎么找出增删改',
        excerpt: 'diff 算法会寻找两段文本之间尽量长的共同部分，再把剩余内容标记为新增、删除或修改，用于代码、日志、文案和配置对比。',
        metaTitle: '文本对比工具原理：diff 算法怎么找出增删改',
        metaDescription: '解释文本 diff 算法的基本思路，包括按行对比、按词对比、最长公共子序列、增删改标记和 JSON 结构化对比的区别。',
        readingTime: '约 7 分钟阅读',
        tags: ['diff 算法', '文本对比', '增删改', '开发工具'],
        relatedTools: [
          {
            label: '文本对比',
            href: '/text/diff',
            description: '使用 diff 算法对比两段文本，按行和词高亮差异。',
          },
          {
            label: 'JSON 对比',
            href: '/json-diff',
            description: '结构化 JSON 更适合按字段路径进行对比。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'diff 算法的目标不是理解文本含义，而是找出两个序列里哪些部分相同，哪些部分发生了变化。',
          },
          { type: 'heading', level: 2, text: '基本思路' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先把文本拆成行、词或字符。',
              '寻找两份内容中可以对齐的共同部分。',
              '共同部分之间的缺口标记为新增或删除。',
              '相邻的删除和新增通常可以被展示为修改。',
              '最后把结果渲染成高亮视图。',
            ],
          },
          { type: 'heading', level: 2, text: '行级、词级、字符级有什么区别？' },
          {
            type: 'table',
            headers: ['粒度', '适合内容', '特点'],
            rows: [
              ['行级', '日志、配置、列表', '速度快，结构清楚'],
              ['词级', '文案、说明、句子', '能看出一句话里改了哪个词'],
              ['字符级', '短字符串、标识符', '很细，但长文本会显得碎'],
              ['结构化', 'JSON、对象数据', '按字段路径比纯文本更准确'],
            ],
          },
          {
            type: 'paragraph',
            text: '很多 diff 实现会使用最长公共子序列或类似策略。它们尽量保留共同内容，再用最少的插入和删除说明变化。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 文本对比',
            text: '粘贴旧文本和新文本后，可以查看行级和词级差异。JSON 数据建议使用 JSON 对比来减少格式噪声。',
            href: '/text/diff',
            linkLabel: '打开文本对比',
          },
        ],
      },
      en: {
        title: 'How Text Diff Algorithms Find Additions, Deletions, and Changes',
        excerpt: 'Diff algorithms look for shared subsequences between two texts, then mark the remaining parts as additions, deletions, or changes.',
        metaTitle: 'How Text Diff Algorithms Find Additions and Deletions',
        metaDescription: 'Understand line diff, word diff, longest common subsequence ideas, addition/deletion/change rendering, and when JSON diff is better.',
        readingTime: '7 min read',
        tags: ['diff algorithm', 'text comparison', 'additions', 'developer tools'],
        relatedTools: [
          {
            label: 'Text Diff',
            href: '/text/diff',
            description: 'Compare two text blocks and highlight line and word changes.',
          },
          {
            label: 'JSON Diff',
            href: '/json-diff',
            description: 'Compare structured JSON by field path.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'A diff algorithm does not understand meaning. It finds which parts of two sequences are shared and which parts changed.',
          },
          { type: 'heading', level: 2, text: 'The Basic Idea' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Split text into lines, words, or characters.',
              'Find common parts that can be aligned.',
              'Mark gaps between common parts as additions or deletions.',
              'Adjacent deletions and additions can be displayed as modifications.',
              'Render the result as a highlighted view.',
            ],
          },
          { type: 'heading', level: 2, text: 'Line, Word, and Character Diff' },
          {
            type: 'table',
            headers: ['Granularity', 'Best for', 'Trait'],
            rows: [
              ['Line-level', 'Logs, configs, lists', 'Fast and easy to scan'],
              ['Word-level', 'Copy, prose, sentences', 'Shows changed words inside a line'],
              ['Character-level', 'Short strings and identifiers', 'Precise but noisy for long text'],
              ['Structured', 'JSON and object data', 'More accurate by field path'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Many diff implementations use longest common subsequence ideas or similar strategies: preserve shared content and explain changes with insertions and deletions.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Text Diff',
            text: 'Paste old text and new text to inspect line and word differences. Use JSON Diff for structured JSON to avoid formatting noise.',
            href: '/text/diff',
            linkLabel: 'Open Text Diff',
          },
        ],
      },
    },
  },
  {
    slug: 'json-json5-jsonc-differences',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: 'JSON、JSON5、JSONC 到底有什么区别？',
        excerpt: 'JSON 是严格数据格式，JSONC 主要给配置文件增加注释，JSON5 则放宽了更多 JavaScript 风格语法。',
        metaTitle: 'JSON、JSON5、JSONC 区别：注释、尾逗号、单引号怎么选',
        metaDescription: '系统比较 JSON、JSON5、JSONC 的区别，包括注释、尾逗号、单引号、未加引号 key、配置文件场景和标准 JSON 输出建议。',
        readingTime: '约 9 分钟阅读',
        tags: ['JSON', 'JSON5', 'JSONC', '配置文件'],
        relatedTools: [
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '格式化、压缩和验证 JSON / JSONC / JSON5 风格内容。',
          },
          {
            label: 'JSON 修复清洗',
            href: '/json-repair',
            description: '把注释、尾逗号、单引号等非标准语法清理成标准 JSON。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSON、JSONC、JSON5 看起来很像，但它们的定位不同。把它们混用，是很多解析报错的来源。',
          },
          { type: 'code', language: 'json5', code: jsonVariantsExample },
          { type: 'heading', level: 2, text: '核心区别' },
          {
            type: 'table',
            headers: ['格式', '是否标准 JSON', '主要特点'],
            rows: [
              ['JSON', '是', '严格、通用、适合接口和数据交换'],
              ['JSONC', '不是标准 JSON', '常见于配置文件，允许注释，语法整体接近 JSON'],
              ['JSON5', '不是标准 JSON', '更接近 JavaScript 对象字面量，允许单引号、尾逗号、未加引号 key 等'],
            ],
          },
          { type: 'heading', level: 2, text: '为什么 API 通常只接受标准 JSON？' },
          {
            type: 'paragraph',
            text: 'API、数据库、消息队列和第三方平台需要跨语言解析。同一份数据可能会被 JavaScript、Java、Go、Python、Rust 等不同运行时读取。标准 JSON 的好处是规则少、歧义低、解析器行为更一致。',
          },
          {
            type: 'list',
            items: [
              '注释不是数据，发送给 API 后没有统一语义。',
              '尾逗号、单引号、未加引号 key 在不同解析器中支持不一致。',
              'NaN、Infinity 等值不是标准 JSON，很多后端会直接拒绝。',
              '配置文件可以照顾人类阅读，接口数据更强调机器稳定解析。',
            ],
          },
          { type: 'heading', level: 2, text: '为什么 tsconfig.json 可以写注释？' },
          {
            type: 'paragraph',
            text: '很多人第一次看到 tsconfig.json 里的注释会疑惑：文件扩展名明明是 .json，为什么还能写 // 注释？原因是 TypeScript 工具链按 JSONC 方式读取配置，它不是普通 JSON API 的解析规则。',
          },
          {
            type: 'table',
            headers: ['文件或场景', '常见格式', '能否直接发给普通 API'],
            rows: [
              ['tsconfig.json', 'JSONC 风格配置', '不能假设可以'],
              ['VS Code settings.json', 'JSONC 风格配置', '不能假设可以'],
              ['package.json', '标准 JSON', '通常可以'],
              ['接口请求体', '标准 JSON', '应该使用标准 JSON'],
            ],
          },
          { type: 'heading', level: 2, text: '把 JSONC / JSON5 转成标准 JSON 的步骤' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先解析宽松语法，确认内容能被 JSONC 或 JSON5 解析器理解。',
              '移除注释、尾逗号，补齐未加引号的 key。',
              '把单引号字符串转换成双引号字符串。',
              '检查是否存在 NaN、Infinity、undefined 这类标准 JSON 不支持的值。',
              '最后用标准 JSON 校验器再验证一遍。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候用哪一个？' },
          {
            type: 'list',
            items: [
              '接口请求和响应：使用标准 JSON。',
              '需要给人读的配置文件：可以考虑 JSONC，但要确认工具链支持。',
              '希望写法更像 JavaScript：可以用 JSON5，但不适合直接发给普通 API。',
              '要发送给后端、数据库或第三方系统：先转换成标准 JSON。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON 工具',
            text: '可以格式化 JSON / JSONC / JSON5 风格内容，也可以用修复清洗工具把非标准语法输出为标准 JSON。',
            href: '/json-format',
            linkLabel: '打开 JSON 格式化',
          },
        ],
      },
      en: {
        title: 'What Is the Difference Between JSON, JSON5, and JSONC?',
        excerpt: 'JSON is strict data interchange, JSONC adds comments mainly for config files, and JSON5 allows more JavaScript-like syntax.',
        metaTitle: 'JSON vs JSON5 vs JSONC: Comments, Trailing Commas, and Syntax',
        metaDescription: 'Compare JSON, JSON5, and JSONC by comments, trailing commas, single quotes, unquoted keys, config use cases, and standard JSON output.',
        readingTime: '9 min read',
        tags: ['JSON', 'JSON5', 'JSONC', 'configuration'],
        relatedTools: [
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and validate JSON / JSONC / JSON5-like content.',
          },
          {
            label: 'JSON Repair',
            href: '/json-repair',
            description: 'Clean comments, trailing commas, single quotes, and other non-standard syntax into standard JSON.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSON, JSONC, and JSON5 look similar, but they are not interchangeable. Mixing them is a common cause of parser errors.',
          },
          { type: 'code', language: 'json5', code: jsonVariantsExample },
          { type: 'heading', level: 2, text: 'Core Differences' },
          {
            type: 'table',
            headers: ['Format', 'Standard JSON?', 'Main trait'],
            rows: [
              ['JSON', 'Yes', 'Strict and widely supported for APIs and data exchange'],
              ['JSONC', 'No', 'Common for config files, allows comments, stays close to JSON'],
              ['JSON5', 'No', 'More JavaScript-like, allows single quotes, trailing commas, unquoted keys, and more'],
            ],
          },
          { type: 'heading', level: 2, text: 'Why Do APIs Usually Require Standard JSON?' },
          {
            type: 'paragraph',
            text: 'APIs, databases, queues, and third-party platforms need data that can be parsed consistently across languages such as JavaScript, Java, Go, Python, and Rust. Standard JSON has fewer rules and fewer ambiguous edge cases.',
          },
          {
            type: 'list',
            items: [
              'Comments are not data and have no shared meaning in API payloads.',
              'Trailing commas, single quotes, and unquoted keys are supported inconsistently across parsers.',
              'NaN and Infinity are not standard JSON values and are often rejected by backends.',
              'Config files can optimize for humans; API payloads should optimize for stable machine parsing.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why Can tsconfig.json Contain Comments?' },
          {
            type: 'paragraph',
            text: 'Many developers first notice comments in tsconfig.json and wonder why a .json file can contain //. TypeScript reads that file with JSONC-like rules, which is not the same as ordinary JSON parsing for API payloads.',
          },
          {
            type: 'table',
            headers: ['File or case', 'Common format', 'Can you send it to a normal API?'],
            rows: [
              ['tsconfig.json', 'JSONC-style config', 'Do not assume so'],
              ['VS Code settings.json', 'JSONC-style config', 'Do not assume so'],
              ['package.json', 'Standard JSON', 'Usually yes'],
              ['API request body', 'Standard JSON', 'Should be standard JSON'],
            ],
          },
          { type: 'heading', level: 2, text: 'How to Convert JSONC / JSON5 to Standard JSON' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Parse the loose syntax and confirm that a JSONC or JSON5 parser understands it.',
              'Remove comments and trailing commas, and quote unquoted keys.',
              'Convert single-quoted strings to double-quoted JSON strings.',
              'Check for unsupported values such as NaN, Infinity, and undefined.',
              'Validate the final output with a strict JSON validator.',
            ],
          },
          { type: 'heading', level: 2, text: 'Which One Should You Use?' },
          {
            type: 'list',
            items: [
              'For API requests and responses, use standard JSON.',
              'For human-maintained config files, JSONC can work when the toolchain supports it.',
              'For JavaScript-like authoring convenience, JSON5 can be useful but is not accepted by ordinary JSON APIs.',
              'Before sending data to a backend, database, or third-party system, convert to standard JSON.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden JSON Tools',
            text: 'Format JSON / JSONC / JSON5-like content, or clean non-standard syntax into standard JSON.',
            href: '/json-format',
            linkLabel: 'Open JSON Formatter',
          },
        ],
      },
    },
  },
  {
    slug: 'convert-word-excel-ppt-image-to-pdf-free',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何免费把 Word / Excel / PPT / 图片 转成 PDF',
        excerpt: '把文档和图片转成 PDF，适合归档、提交材料和跨设备查看。浏览器本地转换适合快速处理常见格式。',
        metaTitle: '如何免费把 Word / Excel / PPT / 图片 转成 PDF',
        metaDescription: '介绍 Word、Excel、PPT、图片、TXT、Markdown、HTML 转 PDF 的常见流程、浏览器本地转换原理、格式限制和导出检查建议。',
        readingTime: '约 9 分钟阅读',
        tags: ['转 PDF', 'Word 转 PDF', 'Excel 转 PDF', '图片转 PDF'],
        relatedTools: [
          {
            label: '转为 PDF',
            href: '/pdf/to-pdf',
            description: '将 Word、Excel、PowerPoint、图片、TXT、Markdown、HTML 等格式转换为 PDF。',
          },
          {
            label: '图片合并长图',
            href: '/file-merge/images',
            description: '多张图片可以拼成长图 PNG，也可以合成为 PDF。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'PDF 的优势是版式相对稳定，适合提交、归档和跨设备查看。在线转换时，最重要的是理解原格式能保留到什么程度。',
          },
          { type: 'heading', level: 2, text: '哪些格式适合转 PDF？' },
          {
            type: 'table',
            headers: ['输入格式', '适合场景', '注意事项'],
            rows: [
              ['Word DOCX', '文字文档、说明、报告', '复杂排版可能需要复查'],
              ['Excel XLSX / XLS', '表格归档、数据快照', '宽表可能分页较多'],
              ['PowerPoint PPTX', '演示内容归档', '动画和复杂布局不一定保留'],
              ['JPG / PNG / WebP', '证件照、扫描件、图片合集', '注意图片方向和清晰度'],
              ['TXT / Markdown / HTML', '文本内容归档', '先检查换行和标题层级'],
            ],
          },
          { type: 'heading', level: 2, text: '不同格式转换 PDF 的风险不同' },
          {
            type: 'paragraph',
            text: 'PDF 转换不是简单改后缀，而是把原文件重新排版成固定页面。Word 更关注字体和段落，Excel 更关注分页和表格宽度，PPT 更关注幻灯片比例，图片则更关注方向、尺寸和清晰度。',
          },
          {
            type: 'table',
            headers: ['来源', '最容易出问题的地方', '建议'],
            rows: [
              ['Word', '缺字体、页眉页脚、复杂表格', '导出后检查目录、页码和表格边界'],
              ['Excel', '列太宽、分页过多、隐藏 Sheet', '先设置打印区域或只保留需要的表'],
              ['PPT', '动画、视频、特殊字体', '把它当成静态页面归档，不依赖动画'],
              ['图片', '方向错误、过大、压缩后模糊', '先旋转和压缩，再合成 PDF'],
              ['HTML / Markdown', '样式差异、分页位置', '检查标题层级和代码块换行'],
            ],
          },
          { type: 'heading', level: 2, text: '浏览器本地转换适合什么场景？' },
          {
            type: 'paragraph',
            text: '浏览器本地转换的好处是文件不需要上传，适合临时归档、轻量文档、图片合集和内部材料。它不适合完全替代专业排版软件：如果文件包含复杂字体、宏、嵌入对象、公式或大量图表，导出后最好人工复查。',
          },
          {
            type: 'list',
            items: [
              '隐私敏感文件：优先选择本地处理，减少上传风险。',
              '正式提交材料：导出后用阅读器打开检查页面。',
              '扫描件或图片合集：先统一方向和尺寸，再转 PDF。',
              '体积过大：先压缩图片或拆分文档，再上传平台。',
            ],
          },
          { type: 'heading', level: 2, text: '转换后要检查什么？' },
          {
            type: 'list',
            items: [
              '页数是否符合预期。',
              '表格是否被过度截断或分页。',
              '图片方向是否正确。',
              '文字是否有乱码或丢行。',
              '文件大小是否适合上传平台限制。',
            ],
          },
          { type: 'heading', level: 2, text: '转成 PDF 后还可以做什么？' },
          {
            type: 'paragraph',
            text: 'PDF 生成后，常见后续操作包括合并、拆分、提取页面和重新排序。例如把多张图片转成一个 PDF 后，可以和 Word 导出的 PDF 合并；如果平台只需要某几页，也可以再提取页面。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 转为 PDF',
            text: '支持常见 Office、图片和文本格式转 PDF。当前浏览器版本更适合快速归档和轻量转换，复杂排版建议导出后复查。',
            href: '/pdf/to-pdf',
            linkLabel: '打开转为 PDF',
          },
        ],
      },
      en: {
        title: 'How to Convert Word, Excel, PowerPoint, and Images to PDF for Free',
        excerpt: 'PDF is useful for archiving, submissions, and cross-device viewing. Browser-local conversion is convenient for common document and image formats.',
        metaTitle: 'Convert Word, Excel, PowerPoint, and Images to PDF for Free',
        metaDescription: 'Learn how Word, Excel, PowerPoint, images, TXT, Markdown, and HTML can be converted to PDF, plus format limitations and output checks.',
        readingTime: '9 min read',
        tags: ['convert to PDF', 'Word to PDF', 'Excel to PDF', 'image to PDF'],
        relatedTools: [
          {
            label: 'Convert to PDF',
            href: '/pdf/to-pdf',
            description: 'Convert Word, Excel, PowerPoint, images, TXT, Markdown, HTML, and more to PDF.',
          },
          {
            label: 'Merge Images',
            href: '/file-merge/images',
            description: 'Combine multiple images into a long PNG or a PDF.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'PDF keeps layout relatively stable, which makes it useful for submissions, archives, and cross-device viewing.',
          },
          { type: 'heading', level: 2, text: 'Which Formats Work Well?' },
          {
            type: 'table',
            headers: ['Input format', 'Best for', 'Watch out for'],
            rows: [
              ['Word DOCX', 'Reports and text documents', 'Complex layouts need review'],
              ['Excel XLSX / XLS', 'Table snapshots and archives', 'Wide sheets may create many pages'],
              ['PowerPoint PPTX', 'Deck archives', 'Animations and complex layouts may not be preserved'],
              ['JPG / PNG / WebP', 'Scans and image collections', 'Check orientation and clarity'],
              ['TXT / Markdown / HTML', 'Text archives', 'Check line breaks and headings'],
            ],
          },
          { type: 'heading', level: 2, text: 'Different Formats Have Different PDF Risks' },
          {
            type: 'paragraph',
            text: 'PDF conversion is not just changing a file extension. The source file is rendered into fixed pages. Word is sensitive to fonts and paragraphs, Excel to page breaks and sheet width, PowerPoint to slide ratio, and images to orientation, size, and clarity.',
          },
          {
            type: 'table',
            headers: ['Source', 'Common risk', 'Suggestion'],
            rows: [
              ['Word', 'Missing fonts, headers, footers, complex tables', 'Check table boundaries, page numbers, and headings'],
              ['Excel', 'Wide columns, too many pages, hidden sheets', 'Set a print area or keep only needed sheets'],
              ['PowerPoint', 'Animations, videos, special fonts', 'Treat output as a static archive'],
              ['Images', 'Wrong orientation, huge pages, blurry compression', 'Rotate and resize before PDF export'],
              ['HTML / Markdown', 'Style differences and page breaks', 'Check headings and code block wrapping'],
            ],
          },
          { type: 'heading', level: 2, text: 'When Is Browser-Local Conversion a Good Fit?' },
          {
            type: 'paragraph',
            text: 'Browser-local conversion keeps files on your device, which is useful for temporary archives, lightweight documents, image collections, and internal material. It is not a full replacement for professional layout software when a file depends on complex fonts, macros, embedded objects, formulas, or charts.',
          },
          {
            type: 'list',
            items: [
              'For sensitive files, local processing reduces upload exposure.',
              'For formal submissions, open the exported PDF and inspect every important page.',
              'For scans and image sets, normalize orientation and size before conversion.',
              'For large files, compress images or split documents before uploading to a platform.',
            ],
          },
          { type: 'heading', level: 2, text: 'What to Check After Conversion' },
          {
            type: 'list',
            items: [
              'Does the page count match expectations?',
              'Are tables split or clipped?',
              'Are image orientations correct?',
              'Is any text missing or garbled?',
              'Is the file size accepted by the upload platform?',
            ],
          },
          { type: 'heading', level: 2, text: 'What Can You Do After Creating the PDF?' },
          {
            type: 'paragraph',
            text: 'After export, common next steps include merging, splitting, extracting pages, and reordering pages. For example, you can convert several images into one PDF, merge it with a Word-exported PDF, then extract only the required pages for submission.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Convert to PDF',
            text: 'Convert common Office, image, and text formats to PDF locally in the browser. Review complex layouts after export.',
            href: '/pdf/to-pdf',
            linkLabel: 'Open Convert to PDF',
          },
        ],
      },
    },
  },
  {
    slug: 'merge-multiple-pdf-files-keep-order-bookmarks',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何合并多个 PDF，并保留书签和顺序',
        excerpt: '合并 PDF 时最重要的是文件顺序和页面完整性。书签、目录和表单能否保留取决于 PDF 结构和合并工具能力，需要导出后复查。',
        metaTitle: '如何合并多个 PDF？保留顺序、书签和页面完整性',
        metaDescription: '讲解多个 PDF 合并流程、拖放排序、页面顺序检查、书签目录兼容性、表单和注释注意事项，以及浏览器本地合并建议。',
        readingTime: '约 9 分钟阅读',
        tags: ['合并 PDF', 'PDF 顺序', 'PDF 书签', 'PDF 工具'],
        relatedTools: [
          {
            label: '合并 PDF',
            href: '/pdf/merge',
            description: '上传多个 PDF，拖放重新排序后合并成一个文档。',
          },
          {
            label: '整理 PDF',
            href: '/pdf/organize',
            description: '需要重新排序、复制或删除页面时，可以整理后再导出。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '合并多个 PDF 的第一目标是保留页面顺序。书签和目录属于 PDF 的附加结构，不同工具支持情况不同。',
          },
          { type: 'heading', level: 2, text: '推荐合并流程' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先按最终阅读顺序给文件命名，例如 01-cover、02-contract。',
              '上传所有 PDF 后检查页数。',
              '拖放调整文件顺序。',
              '合并后打开结果，检查第一页、最后一页和章节边界。',
              '如果源 PDF 有书签、表单或注释，导出后单独复查。',
            ],
          },
          { type: 'heading', level: 2, text: '合并前如何避免顺序出错？' },
          {
            type: 'paragraph',
            text: 'PDF 合并最常见的问题不是工具失败，而是文件顺序放错。尤其是合同、附件、发票和扫描件混在一起时，建议先用文件名或页码规则确认顺序，再上传到工具中调整。',
          },
          {
            type: 'table',
            headers: ['场景', '推荐排序方式', '检查点'],
            rows: [
              ['合同和附件', '主合同在前，附件按编号排列', '章节边界和签字页位置'],
              ['发票和凭证', '按日期或报销单顺序排列', '金额页和说明页是否成对出现'],
              ['扫描件', '按扫描顺序或页码排序', '是否有倒置、空白页或重复页'],
              ['课程资料', '封面、目录、章节、练习顺序', '目录页是否指向正确内容'],
            ],
          },
          { type: 'heading', level: 2, text: '关于书签保留' },
          {
            type: 'paragraph',
            text: '有些 PDF 合并方式只复制页面内容，不会完整合并原文件的书签树、目录、表单动作或复杂交互。对于正式文档，建议把书签保留当成导出后必须检查的项目。',
          },
          {
            type: 'paragraph',
            text: '书签本质上是 PDF 的导航结构，和页面内容不是同一层东西。两个文件合并后，原书签的目标页码可能需要重算；如果工具没有处理这些目标，书签可能丢失、跳错页，或者只保留其中一个文件的目录。',
          },
          { type: 'heading', level: 2, text: '哪些 PDF 结构需要额外检查？' },
          {
            type: 'list',
            items: [
              '表单字段：同名字段合并后可能互相影响。',
              '批注和高亮：有些工具只保留页面外观，不保留可编辑批注。',
              '附件和嵌入文件：合并页面不一定合并附件。',
              '加密或受保护 PDF：可能需要先解除限制或输入密码。',
              '数字签名：合并通常会破坏原签名的完整性。',
            ],
          },
          { type: 'heading', level: 2, text: '导出后快速验收' },
          {
            type: 'list',
            ordered: true,
            items: [
              '确认总页数等于所有源 PDF 页数之和。',
              '检查每个文件接缝处的前后两页。',
              '打开书签面板，确认目录能跳到正确位置。',
              '搜索一个关键词，确认文本层仍可检索。',
              '把最终文件另存一份，避免覆盖源文件。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 合并 PDF',
            text: '可以上传多个 PDF，拖放调整顺序，并在浏览器本地合并导出。当前重点是页面顺序和页面内容合并，书签类结构建议导出后复查。',
            href: '/pdf/merge',
            linkLabel: '打开合并 PDF',
          },
        ],
      },
      en: {
        title: 'How to Merge Multiple PDFs While Keeping Page Order and Checking Bookmarks',
        excerpt: 'When merging PDFs, page order and completeness matter most. Bookmarks and outlines depend on the PDF structure and tool support, so review them after export.',
        metaTitle: 'How to Merge PDFs and Preserve Order, Bookmarks, and Pages',
        metaDescription: 'Learn PDF merge workflow, drag sorting, page order checks, bookmark compatibility, forms, annotations, and browser-local merge tips.',
        readingTime: '9 min read',
        tags: ['merge PDF', 'PDF order', 'PDF bookmarks', 'PDF tools'],
        relatedTools: [
          {
            label: 'Merge PDF',
            href: '/pdf/merge',
            description: 'Upload multiple PDFs, reorder them, and merge them into one document.',
          },
          {
            label: 'Organize PDF',
            href: '/pdf/organize',
            description: 'Reorder, duplicate, or delete pages before exporting a new PDF.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The first goal of PDF merging is preserving page order. Bookmarks and outlines are extra PDF structures, and support varies by tool.',
          },
          { type: 'heading', level: 2, text: 'Recommended Workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Name files in final reading order, such as 01-cover and 02-contract.',
              'Upload all PDFs and check page counts.',
              'Drag files into the correct order.',
              'Open the merged result and inspect the first page, last page, and chapter boundaries.',
              'If source PDFs have bookmarks, forms, or annotations, review them after export.',
            ],
          },
          { type: 'heading', level: 2, text: 'How to Avoid Order Mistakes Before Merging' },
          {
            type: 'paragraph',
            text: 'The most common merge problem is not a failed export; it is the wrong file order. When contracts, attachments, invoices, and scans are mixed together, define the order with filenames or page rules before uploading.',
          },
          {
            type: 'table',
            headers: ['Case', 'Recommended order', 'Check'],
            rows: [
              ['Contracts and attachments', 'Main contract first, attachments by number', 'Chapter boundaries and signature pages'],
              ['Invoices and receipts', 'By date or reimbursement order', 'Amounts and explanation pages stay paired'],
              ['Scans', 'By scan order or page number', 'Upside-down, blank, or duplicate pages'],
              ['Course material', 'Cover, table of contents, chapters, exercises', 'Table of contents points to the right content'],
            ],
          },
          { type: 'heading', level: 2, text: 'About Bookmark Preservation' },
          {
            type: 'paragraph',
            text: 'Some PDF merge workflows copy page content but do not fully merge original outline trees, forms, actions, or complex interactions. For formal documents, always verify bookmarks after export.',
          },
          {
            type: 'paragraph',
            text: 'Bookmarks are a navigation structure, not the page content itself. After two files are merged, bookmark destinations may need page-number recalculation. If the tool does not update those destinations, bookmarks can disappear, jump to the wrong page, or only preserve one source outline.',
          },
          { type: 'heading', level: 2, text: 'PDF Structures That Need Extra Review' },
          {
            type: 'list',
            items: [
              'Forms: fields with the same name may conflict after merging.',
              'Comments and highlights: some workflows preserve appearance but not editable annotations.',
              'Attachments: merging pages does not always merge embedded files.',
              'Encrypted PDFs: restrictions or passwords may need to be handled first.',
              'Digital signatures: merging usually invalidates the original signature integrity.',
            ],
          },
          { type: 'heading', level: 2, text: 'Quick Validation After Export' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Confirm the total page count equals the sum of source page counts.',
              'Check the pages around every file boundary.',
              'Open the bookmark panel and test key destinations.',
              'Search for a keyword to confirm the text layer is still searchable.',
              'Save the merged file separately so source files stay untouched.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Merge PDF',
            text: 'Upload multiple PDFs, drag to reorder them, and merge locally in the browser. The current workflow focuses on page order and page content; review bookmark structures after export.',
            href: '/pdf/merge',
            linkLabel: 'Open Merge PDF',
          },
        ],
      },
    },
  },
  {
    slug: 'split-pdf-by-pages-ranges-size',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何拆分 PDF：按页数、按范围、按大小',
        excerpt: 'PDF 拆分可以按每页导出、按页码范围导出，也可以通过拆成多个部分来满足平台大小限制。',
        metaTitle: '如何拆分 PDF：按页数、按范围、按大小',
        metaDescription: '介绍 PDF 按页拆分、按页码范围拆分、按大小限制拆分的思路，包含页码范围写法、导出检查和浏览器本地处理建议。',
        readingTime: '约 8 分钟阅读',
        tags: ['拆分 PDF', 'PDF 分割', '按页拆分', 'PDF 工具'],
        relatedTools: [
          {
            label: '拆分 PDF',
            href: '/pdf/split',
            description: '将 PDF 拆分为多个文档，支持按页面范围分割或每页导出。',
          },
          {
            label: '提取页面',
            href: '/pdf/extract-pages',
            description: '只需要某几页时，可以提取为一个新 PDF。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '拆分 PDF 的关键是先决定目标：是每页一个文件、几个范围各一个文件，还是为了降低单个文件大小。',
          },
          { type: 'heading', level: 2, text: '三种常见拆分方式' },
          {
            type: 'table',
            headers: ['方式', '例子', '适合场景'],
            rows: [
              ['按每页拆分', '1、2、3 分别导出', '扫描件逐页提交'],
              ['按范围拆分', '1-3, 4-8, 9-12', '按章节或附件拆分'],
              ['按大小拆分', '控制每份低于上传限制', '平台限制 5MB、10MB 等'],
            ],
          },
          {
            type: 'paragraph',
            text: '严格按文件大小自动拆分通常需要先估算每页内容大小。图片页、扫描页和矢量文本页体积差异很大，所以更稳的方式是按范围拆分后检查每份大小。',
          },
          { type: 'heading', level: 2, text: '按大小拆分为什么不精确？' },
          {
            type: 'paragraph',
            text: 'PDF 每一页的体积差异可能很大：纯文字页可能只有几十 KB，扫描图片页可能有好几 MB。即使页数相同，两份拆分结果的大小也可能相差很多。因此“每份低于 10MB”通常需要拆分后再检查，必要时重新调整范围。',
          },
          {
            type: 'table',
            headers: ['页面类型', '体积特点', '拆分建议'],
            rows: [
              ['纯文字 PDF', '通常较小且稳定', '可以按章节范围拆分'],
              ['扫描件 PDF', '单页可能很大', '先少量页测试大小'],
              ['图片很多的报告', '图表页体积更大', '按图片密集章节拆开'],
              ['混合文档', '每页差异明显', '拆分后逐份检查文件大小'],
            ],
          },
          { type: 'heading', level: 2, text: '页码范围怎么写？' },
          {
            type: 'paragraph',
            text: '常见写法是 1-3,5,8-10，表示提取第 1 到 3 页、第 5 页、第 8 到 10 页。正式导出前先确认 PDF 页码和阅读器显示页码是否一致。',
          },
          {
            type: 'list',
            items: [
              '1-3 表示连续范围，包含第 1 页和第 3 页。',
              '1,3,5 表示只选择这几页。',
              '1-3,8-10 表示多个范围合并输出。',
              '如果阅读器显示罗马数字目录页，实际页码可能和显示页码不同。',
            ],
          },
          { type: 'heading', level: 2, text: '拆分后的文件怎么命名？' },
          {
            type: 'paragraph',
            text: '如果拆分结果要上传或发给别人，文件名要能说明内容和顺序。比如 contract-part-01.pdf、contract-part-02.pdf，比 split-1.pdf 更容易复查，也能避免上传时顺序错乱。',
          },
          { type: 'heading', level: 2, text: '什么时候应该用提取页面而不是拆分？' },
          {
            type: 'paragraph',
            text: '如果你只需要把第 2、5、9 页组成一个新文件，提取页面更合适；如果你要把一个大 PDF 拆成多个独立文件，拆分 PDF 更合适。两者都处理页码，但目标文件数量不同。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 拆分 PDF',
            text: '上传一个 PDF 后，可以按页码范围拆分，或把每一页导出为单独 PDF，并下载结果 ZIP。',
            href: '/pdf/split',
            linkLabel: '打开拆分 PDF',
          },
        ],
      },
      en: {
        title: 'How to Split a PDF by Pages, Ranges, or File Size',
        excerpt: 'PDF splitting can export every page, split selected page ranges, or create smaller parts to satisfy upload size limits.',
        metaTitle: 'How to Split a PDF by Pages, Ranges, or Size',
        metaDescription: 'Learn PDF splitting by page, page ranges, and file-size limits, including range syntax, output checks, and browser-local processing tips.',
        readingTime: '8 min read',
        tags: ['split PDF', 'PDF splitter', 'page ranges', 'PDF tools'],
        relatedTools: [
          {
            label: 'Split PDF',
            href: '/pdf/split',
            description: 'Split one PDF into multiple documents by page ranges or every page.',
          },
          {
            label: 'Extract Pages',
            href: '/pdf/extract-pages',
            description: 'Extract selected pages into one new PDF.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Before splitting a PDF, decide whether you need every page as a file, several page ranges, or smaller parts for an upload limit.',
          },
          { type: 'heading', level: 2, text: 'Three Common Split Modes' },
          {
            type: 'table',
            headers: ['Mode', 'Example', 'Best for'],
            rows: [
              ['Every page', 'Export pages 1, 2, 3 separately', 'Submitting scanned pages one by one'],
              ['Page ranges', '1-3, 4-8, 9-12', 'Splitting by chapters or attachments'],
              ['By size target', 'Keep each part below a limit', '5MB or 10MB upload limits'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Exact automatic size-based splitting is hard because scanned pages, photos, and text pages vary widely. A practical workflow is to split by ranges, then check each output file size.',
          },
          { type: 'heading', level: 2, text: 'Why Is Size-Based Splitting Not Exact?' },
          {
            type: 'paragraph',
            text: 'PDF page size can vary dramatically. A text-only page may be only a few dozen KB, while a scanned image page can be several MB. Even with the same page count, output files can have very different sizes.',
          },
          {
            type: 'table',
            headers: ['Page type', 'Size behavior', 'Splitting tip'],
            rows: [
              ['Text-only PDF', 'Usually small and stable', 'Split by chapter ranges'],
              ['Scanned PDF', 'One page can be large', 'Test with a small page range first'],
              ['Image-heavy report', 'Chart pages are larger', 'Separate image-heavy sections'],
              ['Mixed document', 'Each page can differ greatly', 'Check each output file size after splitting'],
            ],
          },
          { type: 'heading', level: 2, text: 'How to Write Page Ranges' },
          {
            type: 'paragraph',
            text: 'A common syntax is 1-3,5,8-10, which means pages 1 through 3, page 5, and pages 8 through 10. Check whether PDF page numbers match the reader display before exporting.',
          },
          {
            type: 'list',
            items: [
              '1-3 means a continuous range and includes both page 1 and page 3.',
              '1,3,5 selects only those pages.',
              '1-3,8-10 combines multiple ranges in the output.',
              'If the viewer shows Roman numerals for front matter, displayed page labels may not match actual PDF pages.',
            ],
          },
          { type: 'heading', level: 2, text: 'How Should You Name Split Files?' },
          {
            type: 'paragraph',
            text: 'If split files will be uploaded or sent to someone else, use names that preserve meaning and order. contract-part-01.pdf and contract-part-02.pdf are much safer than split-1.pdf.',
          },
          { type: 'heading', level: 2, text: 'When Should You Extract Pages Instead?' },
          {
            type: 'paragraph',
            text: 'If you only need pages 2, 5, and 9 in one new document, extraction is a better fit. If you need one large PDF broken into multiple independent files, splitting is the right workflow.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Split PDF',
            text: 'Upload one PDF, split by page ranges, or export every page as a separate PDF and download the ZIP result.',
            href: '/pdf/split',
            linkLabel: 'Open Split PDF',
          },
        ],
      },
    },
  },
  {
    slug: 'extract-selected-pages-from-pdf',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '如何从 PDF 中提取指定页面',
        excerpt: '从 PDF 中提取指定页面，适合只提交合同某几页、导出附件、抽取扫描页或保留文档的一部分。',
        metaTitle: '如何从 PDF 中提取指定页面？页码范围提取教程',
        metaDescription: '讲解如何从 PDF 提取指定页面或页码范围，包含页码写法、顺序保留、重复页面、导出检查和浏览器本地处理。',
        readingTime: '约 8 分钟阅读',
        tags: ['PDF 提取页面', 'PDF 页码', 'PDF 工具'],
        relatedTools: [
          {
            label: '提取页面',
            href: '/pdf/extract-pages',
            description: '从 PDF 文件中提取特定页面并保存为新文档。',
          },
          {
            label: '整理 PDF',
            href: '/pdf/organize',
            description: '需要拖拽重新排序、复制或删除页面时，可以使用整理 PDF。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '提取页面和拆分 PDF 的区别是：提取通常把选中的几页合成一个新 PDF，而拆分会生成多个文件。',
          },
          { type: 'heading', level: 2, text: '哪些场景适合提取页面？' },
          {
            type: 'paragraph',
            text: '提取页面适合“只需要原 PDF 的一部分”的场景。例如合同只提交签字页和关键条款，扫描件只导出身份证明页，课程资料只截取某个章节，或者从完整报告中抽出附录给同事查看。',
          },
          {
            type: 'table',
            headers: ['场景', '推荐操作', '注意事项'],
            rows: [
              ['合同提交', '提取指定条款页和签字页', '确认页码和签章完整'],
              ['扫描资料', '提取需要上传的几页', '检查方向和清晰度'],
              ['报告分享', '提取摘要、图表或附录', '避免泄露不相关页面'],
              ['学习资料', '提取某一章或练习页', '保持页面顺序便于阅读'],
            ],
          },
          { type: 'heading', level: 2, text: '页码怎么写？' },
          {
            type: 'table',
            headers: ['写法', '含义', '结果'],
            rows: [
              ['3', '只提取第 3 页', '一个 1 页 PDF'],
              ['1-3', '提取第 1 到 3 页', '一个 3 页 PDF'],
              ['1,3,5-7', '提取第 1、3、5 到 7 页', '按输入顺序组成新 PDF'],
            ],
          },
          {
            type: 'paragraph',
            text: '有些工具会允许重复页或调整顺序，例如 5,1,5 可能表示先放第 5 页，再放第 1 页，最后再复制一遍第 5 页。正式提交前一定要打开结果确认顺序。',
          },
          { type: 'heading', level: 2, text: '实际页码和显示页码为什么会不同？' },
          {
            type: 'paragraph',
            text: 'PDF 阅读器可能把封面、目录页显示为 i、ii、iii，正文才从 1 开始。但工具通常按 PDF 的实际页面序号处理，也就是第一张页面就是第 1 页。遇到论文、合同册或扫描件时，这个差异尤其常见。',
          },
          {
            type: 'list',
            items: [
              '先用预览确认目标页面在 PDF 中的实际位置。',
              '封面和目录页也要计入实际页码。',
              '如果目标是“显示第 10 页”，先确认它是不是实际第 12 页或第 13 页。',
              '导出后检查第一页和最后一页是否符合预期。',
            ],
          },
          { type: 'heading', level: 2, text: '提取前后要检查什么？' },
          {
            type: 'list',
            items: [
              '阅读器显示页码可能和实际 PDF 页码不同，尤其是封面和目录页。',
              '确认选中的页面顺序是否符合提交要求。',
              '如果需要删除或复制页面，整理 PDF 工具更适合。',
              '导出后检查页数、文件大小和第一页内容。',
            ],
          },
          { type: 'heading', level: 2, text: '提取页面会改变原 PDF 吗？' },
          {
            type: 'paragraph',
            text: '正常的提取流程会生成一个新 PDF，不会修改原文件。为了保险，建议把导出的文件重新命名，例如 contract-pages-3-5.pdf，并保留原始 PDF，方便之后重新提取或核对。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 提取页面',
            text: '上传 PDF 后输入页码或范围，可以把指定页面导出成一个新的 PDF 文件。',
            href: '/pdf/extract-pages',
            linkLabel: '打开提取页面',
          },
        ],
      },
      en: {
        title: 'How to Extract Selected Pages from a PDF',
        excerpt: 'Extracting selected PDF pages is useful when you only need a few contract pages, attachments, scans, or a section of a larger document.',
        metaTitle: 'How to Extract Selected Pages from a PDF',
        metaDescription: 'Learn how to extract selected pages and page ranges from a PDF, including range syntax, order preservation, output checks, and browser-local processing.',
        readingTime: '8 min read',
        tags: ['extract PDF pages', 'PDF page range', 'PDF tools'],
        relatedTools: [
          {
            label: 'Extract Pages',
            href: '/pdf/extract-pages',
            description: 'Extract selected pages from a PDF and save them as a new document.',
          },
          {
            label: 'Organize PDF',
            href: '/pdf/organize',
            description: 'Reorder, duplicate, or delete pages before exporting.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Extracting pages usually creates one new PDF from selected pages, while splitting a PDF often creates multiple files.',
          },
          { type: 'heading', level: 2, text: 'When Should You Extract Pages?' },
          {
            type: 'paragraph',
            text: 'Page extraction is useful when you only need part of the original PDF. You might submit only key contract pages, export selected scan pages, share one report appendix, or pull a chapter from a larger course handout.',
          },
          {
            type: 'table',
            headers: ['Case', 'Recommended action', 'Check'],
            rows: [
              ['Contract submission', 'Extract key clauses and signature pages', 'Confirm page numbers and signatures'],
              ['Scanned documents', 'Extract only required upload pages', 'Check orientation and clarity'],
              ['Report sharing', 'Extract summary, charts, or appendix', 'Avoid exposing unrelated pages'],
              ['Study material', 'Extract one chapter or exercise set', 'Keep reading order intact'],
            ],
          },
          { type: 'heading', level: 2, text: 'Page Range Syntax' },
          {
            type: 'table',
            headers: ['Input', 'Meaning', 'Result'],
            rows: [
              ['3', 'Extract only page 3', 'One 1-page PDF'],
              ['1-3', 'Extract pages 1 through 3', 'One 3-page PDF'],
              ['1,3,5-7', 'Extract pages 1, 3, and 5 through 7', 'One new PDF in selected order'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Some workflows allow repeated pages or custom order. For example, 5,1,5 may place page 5 first, page 1 second, and page 5 again at the end. Always open the result before submitting it.',
          },
          { type: 'heading', level: 2, text: 'Why Can Actual Page Numbers Differ from Displayed Labels?' },
          {
            type: 'paragraph',
            text: 'PDF viewers may label covers and tables of contents as i, ii, and iii, while the main body starts at page 1. Tools usually use actual PDF page order, where the first physical page is page 1.',
          },
          {
            type: 'list',
            items: [
              'Preview the document to confirm the target page position.',
              'Count covers and table-of-contents pages as actual pages.',
              'If you need displayed page 10, confirm whether it is actual page 12 or 13.',
              'After export, check the first and last selected pages.',
            ],
          },
          { type: 'heading', level: 2, text: 'What to Check' },
          {
            type: 'list',
            items: [
              'Viewer page labels may differ from actual PDF page numbers, especially with covers and tables of contents.',
              'Confirm the selected page order meets the submission requirement.',
              'Use an organize tool if you need to delete, duplicate, or reorder pages manually.',
              'After export, check page count, file size, and first-page content.',
            ],
          },
          { type: 'heading', level: 2, text: 'Does Extraction Change the Original PDF?' },
          {
            type: 'paragraph',
            text: 'A normal extraction workflow creates a new PDF and leaves the original untouched. Rename the output clearly, such as contract-pages-3-5.pdf, and keep the source file for later checks.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Extract Pages',
            text: 'Upload a PDF, enter page numbers or ranges, and export selected pages as a new PDF locally in the browser.',
            href: '/pdf/extract-pages',
            linkLabel: 'Open Extract Pages',
          },
        ],
      },
    },
  },
  {
    slug: 'chinese-english-word-count-character-byte',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-02',
    translations: {
      zh: {
        title: '中英文字数统计的差异：字符、词、字节各是什么',
        excerpt: '中文常看字数和字符数，英文常看词数。技术系统还会看 UTF-8 字节数，尤其是接口、数据库和短信限制。',
        metaTitle: '中英文字数统计差异：字符、词、字节各是什么',
        metaDescription: '解释中文和英文字数统计差异，包括字符数、词数、字节数、Emoji、空格、标点和 UTF-8 编码在不同场景下的影响。',
        readingTime: '约 8 分钟阅读',
        tags: ['字数统计', '中英文统计', '字符数', '字节数'],
        relatedTools: [
          {
            label: '字数统计',
            href: '/text/word-count',
            description: '统计字数、词数、字符数、行数、段落、句子和字节大小。',
          },
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '查看文本编码、Unicode、Base64 和字节相关转换。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '中文和英文的“字数”不是同一套统计逻辑。写作平台、SEO 工具、数据库和接口限制也可能看不同指标。',
          },
          { type: 'heading', level: 2, text: '先看一个混合文本例子' },
          { type: 'code', language: 'text', code: wordCountMixedExample },
          {
            type: 'paragraph',
            text: '这段文本同时包含中文、英文、空格、换行和 Emoji。不同工具可能分别统计“字符数”“词数”“字数”“不含空格字符数”“UTF-8 字节数”，结果自然不会完全一样。',
          },
          { type: 'heading', level: 2, text: '三个指标先分清' },
          {
            type: 'table',
            headers: ['指标', '中文场景', '英文场景'],
            rows: [
              ['字符数', '每个汉字、标点、空格都可能算字符', '字母、空格、标点都算字符'],
              ['词数', '中文不一定按空格分词，统计口径差异大', '通常按空格和标点拆分单词'],
              ['字节数', 'UTF-8 下常见汉字通常 3 字节', '英文字母通常 1 字节'],
            ],
          },
          { type: 'heading', level: 2, text: '字符数、字数、词数不是一回事' },
          {
            type: 'paragraph',
            text: '中文内容里，一个汉字常被用户理解为一个“字”，但字符数还会把标点、数字、英文字母、空格和换行都算进去。英文内容里，写作平台更常看 word count，也就是按空格、标点和分隔符拆出来的词。',
          },
          {
            type: 'table',
            headers: ['文本', '常见字符理解', '常见词数理解'],
            rows: [
              ['你好世界', '4 个汉字字符', '可能被当作 1 个中文片段，也可能分词为多个词'],
              ['Hello world', '包含 10 个字母和 1 个空格', '2 个英文单词'],
              ['JSON 工具', '中文、英文和空格混合', '取决于中文分词和英文拆词规则'],
              ['😊', '看起来 1 个图标', '底层可能包含多个 Unicode 码点'],
            ],
          },
          { type: 'heading', level: 2, text: '为什么字节数对接口和数据库很重要？' },
          {
            type: 'paragraph',
            text: '很多系统限制的不是“看起来多少字”，而是存储或传输需要多少字节。UTF-8 下英文字母通常 1 字节，常见中文汉字通常 3 字节，Emoji 可能 4 字节或更多。一个 100 字的中文字段，字节数可能远高于 100。',
          },
          {
            type: 'list',
            items: [
              '数据库字段限制可能写的是 varchar(255)，但不同数据库对字符和字节的理解不同。',
              '短信、推送、URL 参数和接口 payload 经常会受到字节大小限制。',
              'Emoji、组合字符和特殊符号可能让“肉眼字符数”和技术字符数不一致。',
              '做国际化产品时，最好同时检查字符数和字节数。',
            ],
          },
          { type: 'heading', level: 2, text: '为什么同一段文字数字不同？' },
          {
            type: 'list',
            items: [
              '空格和换行是否计入字符数，会影响表单限制。',
              'Emoji 可能由多个 Unicode 码点组成，不能只按肉眼看到的图标数。',
              '中文没有天然空格，词数统计依赖分词规则。',
              '接口和数据库经常限制字节数，而不是字数。',
            ],
          },
          { type: 'heading', level: 2, text: '不同场景应该看哪个指标？' },
          {
            type: 'table',
            headers: ['场景', '优先指标', '原因'],
            rows: [
              ['中文 SEO 标题', '字符数和可读长度', '搜索结果展示空间有限'],
              ['英文文章', '词数', '阅读时间和内容长度更常按词估算'],
              ['表单输入限制', '字符数或字节数', '取决于前后端限制方式'],
              ['数据库字段', '字节数和字符数都要看', '避免多语言内容超出存储限制'],
              ['接口传输', '字节数', 'payload 大小影响请求和响应'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 字数统计',
            text: '粘贴文本即可同时查看字数、词数、字符数、行数、段落、句子和字节大小，适合中英文内容检查。',
            href: '/text/word-count',
            linkLabel: '打开字数统计',
          },
        ],
      },
      en: {
        title: 'Chinese vs English Text Counting: Characters, Words, and Bytes',
        excerpt: 'Chinese text often focuses on characters, English text often focuses on words, and technical systems often care about UTF-8 bytes.',
        metaTitle: 'Chinese vs English Text Counting: Characters, Words, Bytes',
        metaDescription: 'Understand character count, word count, byte count, emoji, spaces, punctuation, and UTF-8 differences across Chinese and English text.',
        readingTime: '8 min read',
        tags: ['word count', 'Chinese text', 'character count', 'byte count'],
        relatedTools: [
          {
            label: 'Word Count',
            href: '/text/word-count',
            description: 'Count words, characters, lines, paragraphs, sentences, and byte size.',
          },
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Inspect text encoding, Unicode, Base64, and byte-related conversions.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Chinese and English text length are not counted the same way. Writing tools, SEO tools, databases, and APIs may all care about different metrics.',
          },
          { type: 'heading', level: 2, text: 'Start with a Mixed Text Example' },
          { type: 'code', language: 'text', code: wordCountMixedExample },
          {
            type: 'paragraph',
            text: 'This sample contains Chinese, English, spaces, a line break, and an emoji. A tool may report characters, words, characters without spaces, lines, and UTF-8 bytes, so the numbers will not be identical.',
          },
          { type: 'heading', level: 2, text: 'Three Metrics to Separate' },
          {
            type: 'table',
            headers: ['Metric', 'Chinese context', 'English context'],
            rows: [
              ['Characters', 'Each Han character, punctuation mark, or space may count', 'Letters, spaces, and punctuation count'],
              ['Words', 'No universal space-based word boundary', 'Usually split by spaces and punctuation'],
              ['Bytes', 'Many common Han characters use 3 UTF-8 bytes', 'English letters usually use 1 byte'],
            ],
          },
          { type: 'heading', level: 2, text: 'Characters, Chinese Characters, and Words Are Different' },
          {
            type: 'paragraph',
            text: 'In Chinese, users often think of each Han character as one unit, but a character counter may also include punctuation, digits, Latin letters, spaces, and line breaks. In English, writing tools usually focus on word count split by spaces and punctuation.',
          },
          {
            type: 'table',
            headers: ['Text', 'Common character view', 'Common word-count view'],
            rows: [
              ['你好世界', '4 Han characters', 'May be treated as one Chinese segment or segmented into multiple words'],
              ['Hello world', '10 letters plus 1 space', '2 English words'],
              ['JSON 工具', 'Mixed Chinese, English, and a space', 'Depends on Chinese segmentation and English tokenization'],
              ['😊', 'Looks like one symbol', 'May contain multiple Unicode code points internally'],
            ],
          },
          { type: 'heading', level: 2, text: 'Why Byte Count Matters for APIs and Databases' },
          {
            type: 'paragraph',
            text: 'Many systems limit storage or transfer size, not visual length. In UTF-8, English letters are usually 1 byte, common Chinese characters are often 3 bytes, and emoji can be 4 bytes or more. A 100-character Chinese field can be much larger than 100 bytes.',
          },
          {
            type: 'list',
            items: [
              'A database field such as varchar(255) may behave differently depending on database and encoding settings.',
              'SMS, push messages, URL parameters, and API payloads often have byte-size limits.',
              'Emoji, combining characters, and special symbols can make visual length differ from technical length.',
              'For international products, check both character count and byte count.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why Results Differ' },
          {
            type: 'list',
            items: [
              'Whether spaces and line breaks count affects form limits.',
              'Emoji may contain multiple Unicode code points.',
              'Chinese word count depends on segmentation rules.',
              'APIs and databases often limit bytes, not visible characters.',
            ],
          },
          { type: 'heading', level: 2, text: 'Which Metric Should You Use?' },
          {
            type: 'table',
            headers: ['Use case', 'Primary metric', 'Why'],
            rows: [
              ['Chinese SEO title', 'Characters and readable length', 'Search result display space is limited'],
              ['English article', 'Words', 'Reading time and content length are usually estimated by words'],
              ['Form input limit', 'Characters or bytes', 'Depends on frontend and backend validation'],
              ['Database field', 'Both bytes and characters', 'Multilingual content may exceed storage limits'],
              ['API transfer', 'Bytes', 'Payload size affects requests and responses'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Word Count',
            text: 'Paste text to see words, characters, lines, paragraphs, sentences, and byte size for Chinese and English content checks.',
            href: '/text/word-count',
            linkLabel: 'Open Word Count',
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
