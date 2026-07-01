import { routing } from '@/i18n/routing';

export const BLOG_INDEX_PATH = '/blog';

export type BlogLocale = (typeof routing.locales)[number];

export type BlogBlock =
  | { type: 'lead'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; title: string; text: string; href?: string; linkLabel?: string };

export interface BlogArticleTranslation {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  tags: string[];
  relatedTools: Array<{
    label: string;
    href: string;
    description: string;
  }>;
  blocks: BlogBlock[];
}

export interface BlogArticle {
  slug: string;
  publishedAt: string;
  updatedAt: string;
  translations: Record<BlogLocale, BlogArticleTranslation>;
}

export interface LocalizedBlogArticle extends BlogArticleTranslation {
  slug: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  locale: BlogLocale;
}

const tsconfigSnippet = `{
  /* Visit https://aka.ms/tsconfig to read more about this file */
  "compilerOptions": {
    "target": "ES2022",
    "strict": true
  }
}`;

const invalidCommentSnippetZh = `// 这是单行注释
{
  "name": "ChatGPT"
}
{
  /*
   这是多行注释
  */
  "name": "ChatGPT"
}`;

const invalidCommentSnippetEn = `// This is a single-line comment
{
  "name": "ChatGPT"
}
{
  /*
   This is a block comment
  */
  "name": "ChatGPT"
}`;

const invalidStandardJsonSnippetZh = `{
  // 用户名
  "name": "Tom",
}`;

const invalidStandardJsonSnippetEn = `{
  // User name
  "name": "Tom",
}`;

const noCommentConfig = `{
  "strict": true,
  "module": "NodeNext",
  "target": "ES2022"
}`;

const commentConfigZh = `{
  // 开启严格模式，推荐保持 true
  "strict": true,
  // 输出 ES2022 代码
  "target": "ES2022"
}`;

const commentConfigEn = `{
  // Enable strict mode. Keeping this true is recommended.
  "strict": true,
  // Emit ES2022 code.
  "target": "ES2022"
}`;

const jsoncSnippetZh = `{
  // 输出目标
  "target": "ES2022",
  /*
    是否开启严格模式
  */
  "strict": true
}`;

const jsoncSnippetEn = `{
  // Output target
  "target": "ES2022",
  /*
    Whether strict mode is enabled
  */
  "strict": true
}`;

const jsoncShortSnippetZh = `{
  // 用户名
  "name": "Tom"
}`;

const jsoncShortSnippetEn = `{
  // User name
  "name": "Tom"
}`;

const json5Snippet = `{
  // User
  name: 'Tom',
  age: 18,
  skills: [
    'JS',
    'TS',
  ],
}`;

export const blogArticles: BlogArticle[] = [
  {
    slug: 'why-image-compression-looks-blurry',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: '为什么图片压缩后会变模糊？如何尽量保持清晰度',
        excerpt: '图片压缩变模糊，通常不是工具坏了，而是压缩算法、质量参数、图片尺寸和格式选择共同作用的结果。',
        metaTitle: '为什么图片压缩后会变模糊？图片压缩保持清晰的方法',
        metaDescription: '解释图片压缩后变模糊的原因，包括有损压缩、质量过低、重复压缩、尺寸缩放和格式选择，并给出 JPG、PNG、WebP 压缩时尽量保持清晰的实用方法。',
        readingTime: '约 7 分钟阅读',
        tags: ['图片压缩', 'JPG', 'PNG', 'WebP', '图片优化'],
        relatedTools: [
          {
            label: '图片压缩',
            href: '/image/compress',
            description: '在浏览器本地压缩 JPG、PNG、WebP 等图片，支持预览对比和批量下载。',
          },
          {
            label: '图片尺寸调整',
            href: '/image/resize',
            description: '按宽度或高度等比例调整图片尺寸，适合在压缩前先减少不必要像素。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '图片压缩后变模糊，是很多人第一次压缩照片、截图或网页图片时都会遇到的问题。明明只是想让文件小一点，结果文字发虚、边缘发糊、细节像被抹掉了一层。',
          },
          {
            type: 'paragraph',
            text: '这并不一定是压缩工具不好。更常见的原因是：压缩算法为了减少文件体积，主动丢掉了一部分视觉信息。如果参数设置太激进，或者选错了图片格式，模糊就会变得很明显。',
          },
          { type: 'heading', level: 2, text: '图片压缩为什么会变模糊？' },
          {
            type: 'paragraph',
            text: '图片文件越小，意味着它需要用更少的数据描述同一张图。为了做到这一点，压缩算法会尝试删掉人眼“不太容易察觉”的细节。但如果删得太多，人眼就会察觉到画质下降。',
          },
          {
            type: 'list',
            items: [
              '质量参数太低：JPG、WebP 等格式会根据质量参数丢弃细节，数值越低，文件越小，但越容易糊。',
              '重复压缩：同一张 JPG 反复导出，每次都会继续损失细节。',
              '尺寸被缩小再放大：如果压缩时顺便缩小尺寸，之后再放大查看，画面会明显发虚。',
              '格式不适合内容：截图、图标、文字图片用 JPG 压缩，很容易出现边缘噪点和文字发糊。',
              '目标体积太小：如果要求把一张复杂照片压到很小，算法只能牺牲更多细节。',
            ],
          },
          { type: 'heading', level: 2, text: '有损压缩和无损压缩有什么区别？' },
          {
            type: 'paragraph',
            text: '理解“有损”和“无损”，就能明白为什么有些图片压缩后肉眼几乎无变化，而有些一压就糊。',
          },
          {
            type: 'table',
            headers: ['类型', '特点', '常见格式', '适合场景'],
            rows: [
              ['有损压缩', '会丢弃部分图像细节，换取更小体积', 'JPG、WebP、AVIF', '照片、网页大图、商品图'],
              ['无损压缩', '尽量保留原始像素信息，体积下降有限', 'PNG、部分 WebP', '截图、图标、透明图、文字图片'],
            ],
          },
          {
            type: 'paragraph',
            text: '照片通常可以接受适度有损压缩，因为自然纹理比较复杂，少量细节损失不明显。但截图、二维码、UI 界面和带文字的图片，对边缘清晰度更敏感，压缩方式就要更保守。',
          },
          { type: 'heading', level: 2, text: '如何尽量保持图片清晰？' },
          {
            type: 'heading',
            level: 3,
            text: '1. 不要一开始就把质量调得太低',
          },
          {
            type: 'paragraph',
            text: '压缩图片时，建议从中高质量开始试。例如 JPG 或 WebP 可以先从 80 到 85 左右开始，再根据文件大小逐步降低。不要直接拉到 40 或 50，否则模糊和色块很容易出现。',
          },
          {
            type: 'heading',
            level: 3,
            text: '2. 根据内容选择格式',
          },
          {
            type: 'list',
            items: [
              '照片、风景、商品图：优先考虑 JPG 或 WebP。',
              '截图、UI、文字说明图：优先保留 PNG，或使用较高质量 WebP。',
              '透明背景图片：使用 PNG 或支持透明的 WebP。',
              '网页图片：可以尝试 WebP，在体积和清晰度之间通常更均衡。',
            ],
          },
          {
            type: 'heading',
            level: 3,
            text: '3. 避免重复压缩同一张图片',
          },
          {
            type: 'paragraph',
            text: '如果你要多次调整参数，最好始终从原图重新压缩，而不是拿已经压缩过的图片继续压。重复压缩会不断累积损失，尤其是 JPG 图片。',
          },
          {
            type: 'heading',
            level: 3,
            text: '4. 先调整尺寸，再压缩质量',
          },
          {
            type: 'paragraph',
            text: '很多时候，图片真正过大的原因不是质量太高，而是尺寸太大。例如一张 4000px 宽的照片，如果只用于网页正文，可能根本不需要这么多像素。先把尺寸调整到实际需要的宽度，再做适度压缩，通常比强行降低质量更清晰。',
          },
          {
            type: 'heading',
            level: 3,
            text: '5. 一定要预览对比',
          },
          {
            type: 'paragraph',
            text: '图片压缩没有一个永远正确的参数。不同图片内容差异很大，最靠谱的方法是同时看原图和压缩结果，重点检查文字边缘、人脸、商品细节、暗部区域和渐变背景。',
          },
          { type: 'heading', level: 2, text: '推荐的压缩参数范围' },
          {
            type: 'table',
            headers: ['图片类型', '推荐做法', '说明'],
            rows: [
              ['照片', 'JPG/WebP 质量 75-85', '多数情况下清晰度和体积比较均衡'],
              ['网页首图', '先缩到实际显示尺寸，再用 WebP', '更容易提升加载速度'],
              ['截图', 'PNG 或高质量 WebP', '保护文字和界面边缘'],
              ['透明图', 'PNG 或透明 WebP', '避免丢失透明背景'],
              ['证件/重要资料', '使用较高质量，少压缩', '可读性比体积更重要'],
            ],
          },
          { type: 'heading', level: 2, text: 'ToolGarden 是怎么尽量压小但不压糊的？' },
          {
            type: 'paragraph',
            text: '在 toolgarden.xyz 的图片压缩工具里，压缩并不是简单地把质量参数一口气拉低。工具会在浏览器本地读取图片，生成多个压缩候选结果，再优先选择“文件更小、视觉差异可控”的版本。这样做的重点不是追求极限小文件，而是在尽量保留清晰度的前提下减少体积。',
          },
          {
            type: 'list',
            items: [
              'JPG/WebP：从较高质量开始生成多档候选结果，逐步降低质量参数，避免一次性压得太狠导致文字发虚、边缘发糊。',
              '视觉差异采样：把压缩候选图和原图缩小到采样尺寸后，对比 RGB、Alpha 和最大通道差异，差异超过阈值的候选会被丢弃。',
              'PNG：优先尝试无损或近无损压缩，必要时使用 UPNG 色彩量化生成候选，只有视觉差异足够安全时才采用。',
              'SVG：保留矢量格式的清晰边缘，同时清理 XML 声明、注释、metadata、无用命名空间和工具私有属性，并使用 SVGO 多轮优化，减少无用节点、路径数字和空白字符。',
              '格式选择：可以保留原格式，也可以输出 WebP，让照片类图片在体积和清晰度之间取得更好的平衡。',
              '保守回退：在保真模式下，如果找不到比原图更小且视觉差异安全的结果，就不会强行输出一个明显变糊的文件。',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz 图片压缩',
            text: '打开图片压缩工具，上传图片后可以保留原格式或尝试 WebP 输出。ToolGarden 会优先寻找更小且视觉差异可控的结果，你也可以通过预览和文件大小对比确认画面是否仍然清晰。',
            href: '/image/compress',
            linkLabel: '打开图片压缩工具',
          },
          {
            type: 'paragraph',
            text: '如果压缩后仍然太大，不要只继续降低质量。可以先用图片尺寸调整工具缩小到实际需要的宽度，再回到图片压缩工具做最终压缩。',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '图片压缩后变模糊，本质上是“文件体积”和“画质细节”之间的取舍。想尽量保持清晰，关键是不要过度降低质量、不要重复压缩、选择合适格式，并在必要时先调整尺寸。',
          },
          {
            type: 'paragraph',
            text: '真正好的压缩，不是把文件压到越小越好，而是在目标体积内，让肉眼看到的损失尽可能少。',
          },
        ],
      },
      en: {
        title: 'Why Do Images Look Blurry After Compression? How to Keep Them Sharp',
        excerpt: 'Blurry compressed images usually come from aggressive quality settings, repeated exports, resizing, or choosing the wrong image format.',
        metaTitle: 'Why Do Images Look Blurry After Compression? How to Keep Image Quality',
        metaDescription: 'Learn why compressed images become blurry, how lossy compression works, and how to keep JPG, PNG, and WebP images as sharp as possible while reducing file size.',
        readingTime: '7 min read',
        tags: ['Image compression', 'JPG', 'PNG', 'WebP', 'Image optimization'],
        relatedTools: [
          {
            label: 'Image Compressor',
            href: '/image/compress',
            description: 'Compress JPG, PNG, WebP, and other images locally in your browser with preview comparison and batch download.',
          },
          {
            label: 'Image Resize',
            href: '/image/resize',
            description: 'Resize images proportionally before compression when the original pixel dimensions are larger than needed.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Blurry images after compression are a common surprise. You only wanted a smaller file, but the text looks soft, edges lose definition, and fine detail seems wiped away.',
          },
          {
            type: 'paragraph',
            text: 'That does not always mean the tool is bad. In most cases, the compression settings, image format, image dimensions, and target file size are all pushing the encoder to discard more visual detail.',
          },
          { type: 'heading', level: 2, text: 'Why does compression make images blurry?' },
          {
            type: 'paragraph',
            text: 'A smaller image file has fewer bytes available to describe the same picture. Lossy encoders reduce size by removing detail that they expect people will not notice. Push that too far, and the missing detail becomes visible.',
          },
          {
            type: 'list',
            items: [
              'The quality setting is too low, so JPG or WebP discards too much detail.',
              'The image has been compressed repeatedly, and each export adds more loss.',
              'The dimensions were reduced and then the image was viewed larger than its new size.',
              'The format does not match the content, such as JPG for UI screenshots or text-heavy images.',
              'The target file size is too small for a complex image.',
            ],
          },
          { type: 'heading', level: 2, text: 'Lossy vs lossless compression' },
          {
            type: 'paragraph',
            text: 'The difference between lossy and lossless compression explains why some images stay visually identical while others degrade quickly.',
          },
          {
            type: 'table',
            headers: ['Type', 'What it does', 'Common formats', 'Best for'],
            rows: [
              ['Lossy', 'Discards some visual data to reduce file size', 'JPG, WebP, AVIF', 'Photos, web banners, product images'],
              ['Lossless', 'Preserves pixel information as much as possible', 'PNG, some WebP modes', 'Screenshots, icons, transparent graphics, text images'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Photos often tolerate moderate lossy compression because natural texture hides small changes. Screenshots, interface captures, QR codes, and images with text are more sensitive because sharp edges matter.',
          },
          { type: 'heading', level: 2, text: 'How to keep images sharp while compressing' },
          { type: 'heading', level: 3, text: '1. Do not start with a very low quality setting' },
          {
            type: 'paragraph',
            text: 'Start around medium-high quality, such as 80 to 85 for JPG or WebP, then reduce gradually only if the file is still too large. Jumping straight to 40 or 50 often creates visible blur, blocks, or color banding.',
          },
          { type: 'heading', level: 3, text: '2. Choose the right format for the image' },
          {
            type: 'list',
            items: [
              'Use JPG or WebP for photos, product images, and natural scenes.',
              'Use PNG or high-quality WebP for screenshots and UI images.',
              'Use PNG or transparent WebP when transparency matters.',
              'Try WebP for web images when you want a strong balance between quality and size.',
            ],
          },
          { type: 'heading', level: 3, text: '3. Avoid repeated compression' },
          {
            type: 'paragraph',
            text: 'When testing different settings, compress from the original image each time. Recompressing an already compressed JPG keeps adding damage.',
          },
          { type: 'heading', level: 3, text: '4. Resize before lowering quality too much' },
          {
            type: 'paragraph',
            text: 'A file is often large because the pixel dimensions are larger than needed. If a 4000px-wide photo will only be displayed at 1200px, resizing first can reduce size while preserving more visible quality than aggressive compression alone.',
          },
          { type: 'heading', level: 3, text: '5. Compare the preview before downloading' },
          {
            type: 'paragraph',
            text: 'There is no universal best quality number. Compare the original and compressed result, paying attention to text edges, faces, product details, dark areas, and gradients.',
          },
          { type: 'heading', level: 2, text: 'Recommended starting points' },
          {
            type: 'table',
            headers: ['Image type', 'Suggested approach', 'Why'],
            rows: [
              ['Photos', 'JPG/WebP quality 75-85', 'Usually balances size and visual quality'],
              ['Hero images', 'Resize to display size, then use WebP', 'Improves page speed without unnecessary pixels'],
              ['Screenshots', 'PNG or high-quality WebP', 'Protects text and UI edges'],
              ['Transparent images', 'PNG or transparent WebP', 'Preserves the alpha channel'],
              ['Important documents', 'Use higher quality and light compression', 'Readability matters more than file size'],
            ],
          },
          { type: 'heading', level: 2, text: 'How ToolGarden compresses without making images look blurry' },
          {
            type: 'paragraph',
            text: 'On toolgarden.xyz, image compression is not just a single aggressive quality drop. The compressor runs locally in your browser, creates multiple candidate outputs, compares them against the source, and prefers the smaller result whose visual difference stays under control. The goal is not the tiniest possible file at any cost, but a smaller image that still looks sharp.',
          },
          {
            type: 'list',
            items: [
              'JPG/WebP: starts from higher-quality candidates and lowers quality gradually, instead of jumping straight to a harsh setting that can soften text and edges.',
              'Visual difference sampling: compares the compressed candidate with the original at a sampled size, including RGB, alpha, and maximum channel difference, then rejects candidates that exceed the threshold.',
              'PNG: tries lossless or near-lossless compression first, and can use UPNG color quantization candidates only when the visual difference remains safe.',
              'SVG: preserves crisp vector edges while stripping XML declarations, comments, metadata, unused namespaces, and tool-specific attributes, then runs SVGO multipass optimization to reduce unused nodes, path numbers, and whitespace.',
              'Format choice: lets you keep the original format or output WebP, which often gives photo-like images a better size-to-quality balance.',
              'Conservative fallback: in quality-preserving mode, if no smaller visually safe candidate exists, ToolGarden avoids forcing a visibly degraded output.',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz Image Compressor',
            text: 'Upload images, keep the original format or try WebP, and ToolGarden will look for a smaller output with controlled visual difference. You can compare the preview and file size before downloading.',
            href: '/image/compress',
            linkLabel: 'Open Image Compressor',
          },
          {
            type: 'paragraph',
            text: 'If the file is still too large, avoid lowering quality forever. Resize the image to the dimensions you actually need, then run the final compression pass.',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Blurry compression is the result of trading image detail for smaller file size. To keep images sharp, use moderate quality settings, avoid repeated exports, choose the right format, and resize when the original dimensions are larger than needed.',
          },
          {
            type: 'paragraph',
            text: 'Good compression is not about making the file as tiny as possible. It is about reaching the size you need with the least visible quality loss.',
          },
        ],
      },
    },
  },
  {
    slug: 'compress-image-to-target-size',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: '如何把图片压缩到指定大小？',
        excerpt: '想把图片压缩到 200KB、500KB 或 1MB，需要同时控制格式、质量、尺寸和画面复杂度，而不是只调一个参数。',
        metaTitle: '如何把图片压缩到指定大小？压缩到 200KB、500KB、1MB 的方法',
        metaDescription: '介绍如何把图片压缩到指定大小，理解图片体积由格式、尺寸、质量和内容复杂度共同决定，并给出 JPG、PNG、WebP 压缩到目标 KB 的实用步骤。',
        readingTime: '约 6 分钟阅读',
        tags: ['图片压缩', '指定大小', 'JPG 压缩', 'WebP', '图片优化'],
        relatedTools: [
          {
            label: '图片压缩',
            href: '/image/compress',
            description: '批量压缩图片，预览压缩结果，并下载压缩后的图片或 ZIP 文件。',
          },
          {
            label: '图片转 WebP',
            href: '/image/to-webp',
            description: '把 JPG、PNG 等图片转换为 WebP，适合网页图片体积优化。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '很多上传场景都会限制图片大小：头像不能超过 200KB，证件照不能超过 500KB，网页图片最好控制在 1MB 以内。问题是，图片体积并不是一个可以直接输入的固定值。',
          },
          {
            type: 'paragraph',
            text: '想把图片压缩到指定大小，需要理解影响文件体积的几个因素，然后按顺序调整：先看尺寸，再看格式，最后微调质量。',
          },
          { type: 'heading', level: 2, text: '为什么不能简单输入“压缩到 200KB”？' },
          {
            type: 'paragraph',
            text: '图片文件大小由多种因素共同决定。即使用同样的格式和质量参数，一张纯色背景图和一张细节复杂的风景照，压缩后的体积也可能差很多。',
          },
          {
            type: 'list',
            items: [
              '图片尺寸：像素越多，需要存储的信息越多。',
              '图片格式：JPG、PNG、WebP、AVIF 的压缩方式不同。',
              '质量参数：质量越高，细节越多，文件通常越大。',
              '画面复杂度：纹理、噪点、渐变和细节越多，越难压小。',
              '透明通道：带透明背景的图片往往不能直接用普通 JPG 替代。',
            ],
          },
          {
            type: 'paragraph',
            text: '所以，把图片压缩到指定大小，本质上是通过多次预览和调整，找到体积与清晰度的平衡点。',
          },
          { type: 'heading', level: 2, text: '第一步：先调整尺寸，而不是盲目降质量' },
          {
            type: 'paragraph',
            text: '如果原图尺寸很大，直接降低质量会让图片变糊，但文件可能还是不够小。更合理的做法是先把图片缩到实际需要的尺寸。',
          },
          {
            type: 'paragraph',
            text: '例如网页正文图片通常不需要 4000px 宽。如果页面最大显示宽度只有 1200px，可以先把图片宽度调整到 1200px 或 1600px，再进行压缩。',
          },
          { type: 'heading', level: 2, text: '第二步：选择更适合的输出格式' },
          {
            type: 'paragraph',
            text: '格式选择会直接影响能否压到目标大小。很多 PNG 截图或照片转成 WebP 后，体积会明显下降；照片转 JPG 或 WebP 往往也比 PNG 更适合。',
          },
          {
            type: 'list',
            items: [
              '照片：优先 JPG 或 WebP。',
              '网页配图：优先尝试 WebP。',
              '截图：先保留 PNG，如果太大再尝试高质量 WebP。',
              '透明图：使用 PNG 或透明 WebP。',
            ],
          },
          { type: 'heading', level: 2, text: '第三步：逐步降低质量参数' },
          {
            type: 'paragraph',
            text: '当尺寸和格式都合适后，再调整质量参数。建议按小步尝试，而不是一次降到很低。',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '先从 85 左右开始压缩。',
              '如果仍然超过目标大小，降到 80 或 75。',
              '继续超过目标，再尝试 70 左右。',
              '如果低于 70 后明显变糊，优先回头缩小尺寸或换格式。',
            ],
          },
          { type: 'heading', level: 2, text: '第四步：接近目标即可，不必追求刚好等于' },
          {
            type: 'paragraph',
            text: '如果平台限制是 500KB，那么 480KB、450KB 通常都可以。不要为了刚好压到 500KB 以下，而牺牲大量清晰度。真正重要的是满足上限，同时保持可接受画质。',
          },
          { type: 'heading', level: 2, text: 'ToolGarden 是怎么在保证质量的前提下压缩图片的？' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片压缩工具不是简单地把质量参数一口气拉低。它会在浏览器本地读取图片、生成多个候选结果，再选择“体积更小且视觉差异可接受”的版本。这样做的核心思路是：优先保留肉眼能感知到的清晰度，只在安全范围内减少文件体积。',
          },
          {
            type: 'list',
            items: [
              'JPG / WebP：从较高质量开始，按多个质量档位生成候选结果，而不是直接使用最低质量。',
              '视觉差异采样：把压缩候选图和原图缩小到采样尺寸后对比 RGB、Alpha 和最大通道差异，超过阈值的候选会被丢弃。',
              'PNG：优先尝试无损或近似无损的 PNG 处理，并用 UPNG 做颜色量化候选，只有视觉差异安全时才接受。',
              'SVG：保留矢量格式时会清理 XML 声明、注释、metadata、无用命名空间和工具私有属性，并使用 SVGO 多轮优化，减少无用节点、路径数字和空白字符。',
              '本地处理：解码、Canvas 重绘、候选生成、差异比较和 ZIP 打包都在浏览器中完成，图片不会上传到服务器。',
              '保守兜底：如果找不到更小且足够安全的候选，在保留原格式模式下会保留原图，避免为了体积强行牺牲画质。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片压缩',
            text: '上传图片后，ToolGarden 会优先寻找更小且视觉差异可控的输出结果。你可以选择保留原格式，也可以输出 WebP，并通过预览和文件大小对比确认是否达到目标。',
            href: '/image/compress',
            linkLabel: '打开图片压缩工具',
          },
          { type: 'heading', level: 3, text: '用 ToolGarden 压缩到指定大小的步骤' },
          {
            type: 'list',
            ordered: true,
            items: [
              '打开图片压缩工具并上传图片。',
              '查看原始体积和预览效果。',
              '如果图片尺寸过大，先使用图片尺寸调整工具缩小宽高。',
              '回到压缩工具，选择原格式或 WebP 输出。',
              '从较高质量开始压缩，逐步降低到目标大小附近。',
              '确认预览效果清晰后，下载单张图片或批量 ZIP。',
            ],
          },
          { type: 'heading', level: 2, text: '如果怎么压都达不到目标怎么办？' },
          {
            type: 'paragraph',
            text: '有些图片很难在保持清晰的同时压到很小，比如高分辨率证件扫描件、复杂截图、带大量文字的海报。遇到这种情况，可以尝试三种办法：',
          },
          {
            type: 'list',
            items: [
              '降低图片尺寸，而不是继续降低质量。',
              '裁剪掉不必要的空白或背景区域。',
              '接受稍大的体积，或确认平台是否允许更高上限。',
            ],
          },
          {
            type: 'paragraph',
            text: '如果一张图片必须清晰可读，就不要为了极小体积过度压缩。尤其是证件、合同、二维码和文字截图，可读性永远比体积更重要。',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '把图片压缩到指定大小，不是单纯把质量拉低，而是按顺序处理：调整尺寸、选择格式、逐步降低质量、预览检查。',
          },
          {
            type: 'paragraph',
            text: '最理想的结果，是刚好满足文件大小限制，同时让图片在实际使用场景中仍然清晰。',
          },
        ],
      },
      en: {
        title: 'How to Compress an Image to a Target File Size',
        excerpt: 'To compress an image to 200KB, 500KB, or 1MB, you need to control format, dimensions, quality, and image complexity together.',
        metaTitle: 'How to Compress an Image to a Target File Size: 200KB, 500KB, 1MB',
        metaDescription: 'Learn how to compress images to a target file size by adjusting dimensions, format, quality, and content complexity for JPG, PNG, and WebP images.',
        readingTime: '6 min read',
        tags: ['Image compression', 'Target size', 'JPG compression', 'WebP', 'Image optimization'],
        relatedTools: [
          {
            label: 'Image Compressor',
            href: '/image/compress',
            description: 'Batch compress images, compare results, and download compressed files or a ZIP archive.',
          },
          {
            label: 'Image to WebP',
            href: '/image/to-webp',
            description: 'Convert JPG, PNG, and other images to WebP for web-friendly file size reduction.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Many upload forms have file size limits: profile images under 200KB, document photos under 500KB, or website images under 1MB. The tricky part is that image file size is not controlled by one single setting.',
          },
          {
            type: 'paragraph',
            text: 'To reach a target size, you usually need to adjust format, dimensions, and quality in the right order instead of simply dragging quality down until the image looks bad.',
          },
          { type: 'heading', level: 2, text: 'Why can’t you just type “compress to 200KB”?' },
          {
            type: 'paragraph',
            text: 'Image size depends on several factors at the same time. With the same quality setting, a flat-color graphic and a detailed landscape photo can produce very different file sizes.',
          },
          {
            type: 'list',
            items: [
              'Pixel dimensions: more pixels usually need more data.',
              'Format: JPG, PNG, WebP, and AVIF compress images differently.',
              'Quality setting: higher quality keeps more detail and usually creates larger files.',
              'Image complexity: texture, noise, gradients, and fine detail are harder to compress.',
              'Transparency: transparent images cannot always be replaced with ordinary JPG output.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Compressing to a target size is really about finding the best tradeoff between file size and visible quality.',
          },
          { type: 'heading', level: 2, text: 'Step 1: Resize before lowering quality too much' },
          {
            type: 'paragraph',
            text: 'If the original dimensions are huge, lowering quality may make the image blurry while the file is still too large. Resize to the dimensions you actually need first.',
          },
          {
            type: 'paragraph',
            text: 'For example, a blog image rarely needs to remain 4000px wide if the page displays it at 1200px. Resize to 1200px or 1600px, then compress.',
          },
          { type: 'heading', level: 2, text: 'Step 2: Choose a better output format' },
          {
            type: 'paragraph',
            text: 'Format choice can decide whether the target size is realistic. PNG screenshots and photos often become much smaller as WebP, while photos usually compress better as JPG or WebP than PNG.',
          },
          {
            type: 'list',
            items: [
              'Photos: use JPG or WebP.',
              'Web images: try WebP first.',
              'Screenshots: keep PNG first, or try high-quality WebP if PNG is too large.',
              'Transparent images: use PNG or transparent WebP.',
            ],
          },
          { type: 'heading', level: 2, text: 'Step 3: Lower quality gradually' },
          {
            type: 'paragraph',
            text: 'After dimensions and format are reasonable, adjust quality in small steps. Do not start with an extremely low value.',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Start around quality 85.',
              'If the file is still too large, try 80 or 75.',
              'If needed, test around 70.',
              'If quality below 70 looks bad, resize more or switch format instead of pushing lower.',
            ],
          },
          { type: 'heading', level: 2, text: 'Step 4: Aim below the limit, not exactly on it' },
          {
            type: 'paragraph',
            text: 'If the limit is 500KB, a 480KB or 450KB result is usually fine. Do not sacrifice a lot of quality just to land exactly at the limit. The goal is to stay under the maximum while keeping the image usable.',
          },
          { type: 'heading', level: 2, text: 'How ToolGarden compresses images while protecting quality' },
          {
            type: 'paragraph',
            text: 'ToolGarden does not simply drag image quality down and call it done. The compressor runs locally in the browser, generates multiple candidate outputs, compares them against the source, and prefers the smallest result that stays within visually safe limits.',
          },
          {
            type: 'list',
            items: [
              'JPG / WebP: starts from higher quality levels and tests several quality candidates instead of jumping straight to a low-quality output.',
              'Visual difference sampling: compares compressed candidates with the source sample across RGB, alpha, and maximum channel difference, then rejects candidates that exceed the threshold.',
              'PNG: tries lossless or near-lossless PNG handling and UPNG color-quantized candidates, accepting them only when the visual difference remains safe.',
              'SVG: preserves the vector format while stripping XML declarations, comments, metadata, unused namespaces, and tool-specific attributes, then runs SVGO multipass optimization to reduce unused nodes, path numbers, and whitespace.',
              'Local processing: decoding, Canvas rendering, candidate generation, visual comparison, and ZIP packaging run in the browser without uploading images to a server.',
              'Conservative fallback: when preserving the original format, if no smaller visually safe candidate exists, ToolGarden keeps the original instead of forcing a lower-quality file.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Image Compressor',
            text: 'Upload images and ToolGarden will look for a smaller output with controlled visual difference. You can preserve the original format or output WebP, then compare preview quality and file size before downloading.',
            href: '/image/compress',
            linkLabel: 'Open Image Compressor',
          },
          { type: 'heading', level: 3, text: 'How to compress to a target size with ToolGarden' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open the Image Compressor and upload your image.',
              'Check the original file size and preview.',
              'If dimensions are too large, resize the image first.',
              'Return to compression and choose original format or WebP output.',
              'Start with higher quality and reduce gradually until you are near the target.',
              'Confirm the preview still looks good, then download one file or a ZIP batch.',
            ],
          },
          { type: 'heading', level: 2, text: 'What if the image still cannot hit the target?' },
          {
            type: 'paragraph',
            text: 'Some images are hard to make tiny while keeping them sharp, especially high-resolution scans, complex screenshots, posters with text, or images with lots of texture. In that case, try one of these options:',
          },
          {
            type: 'list',
            items: [
              'Reduce dimensions instead of lowering quality further.',
              'Crop empty or unnecessary areas.',
              'Accept a slightly larger file or check whether the platform allows a higher limit.',
            ],
          },
          {
            type: 'paragraph',
            text: 'When readability matters, avoid excessive compression. Documents, contracts, QR codes, and text-heavy screenshots need clarity more than the smallest possible file size.',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Compressing an image to a target file size is not just about lowering quality. The better workflow is: resize dimensions, choose the right format, lower quality gradually, and preview the result.',
          },
          {
            type: 'paragraph',
            text: 'The best result is not the smallest image possible. It is an image that fits the limit and still looks clear in its real use case.',
          },
        ],
      },
    },
  },
  {
    slug: 'why-favicon-looks-blurry',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: '为什么 favicon 看起来模糊？如何制作清晰的网站图标',
        excerpt: 'favicon 变模糊通常不是浏览器的问题，而是源图尺寸、图标格式、多尺寸资源和缩放方式没有处理好。',
        metaTitle: '为什么 favicon 看起来模糊？制作清晰网站图标的方法',
        metaDescription: '解释 favicon 模糊的常见原因，包括源图太小、没有多尺寸 ICO、透明边缘处理不当和浏览器缩放，并介绍如何制作清晰的网站图标。',
        readingTime: '约 7 分钟阅读',
        tags: ['favicon', 'ICO', '网站图标', '图片转 Icon'],
        relatedTools: [
          {
            label: '图片转 Icon',
            href: '/image/to-icon',
            description: '把 PNG、SVG、JPG、WebP 等图片转换成 ICO、ICNS 或多尺寸 PNG ZIP 图标。',
          },
          {
            label: '图片尺寸修改',
            href: '/image/resize',
            description: '在制作图标前，把大图缩放到更适合的尺寸。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'favicon 很小，但它对网站识别度很重要。问题是，很多 logo 放进浏览器标签页后会变糊：边缘发虚、文字看不清、圆角像被压扁。',
          },
          {
            type: 'paragraph',
            text: 'favicon 模糊通常不是浏览器坏了，而是图标资源没有为小尺寸场景准备好。浏览器标签页、收藏夹、快捷方式、搜索结果和系统桌面可能会使用不同尺寸，如果只提供一张不合适的图片，浏览器只能临时缩放。',
          },
          { type: 'heading', level: 2, text: 'favicon 为什么会模糊？' },
          {
            type: 'list',
            items: [
              '源图太小：用 32px 图片去生成 128px 或 256px 图标，放大后一定会发虚。',
              '只提供单一尺寸：浏览器需要 16px、32px、48px 等不同尺寸时，只能缩放同一张图。',
              '图案太复杂：细文字、细线条和复杂渐变在 16px 标签页里很难保持清晰。',
              '没有透明边缘：背景没有处理干净，缩小后会出现灰边、白边或锯齿。',
              '格式不合适：直接把 JPG 当 favicon 用，透明背景会丢失，小尺寸边缘也更容易糊。',
              '重复压缩：先压缩再转图标，会把边缘细节提前损坏。',
            ],
          },
          { type: 'heading', level: 2, text: '清晰 favicon 的核心原则' },
          {
            type: 'table',
            headers: ['原则', '建议', '原因'],
            rows: [
              ['从大图开始', '最好使用 512px 或 1024px 的源图', '向下缩小比向上放大更清晰'],
              ['保持图形简单', '减少小字、细线和复杂阴影', '16px 场景没有足够像素展示复杂细节'],
              ['输出多尺寸', '至少包含 16、32、48、64、128、256px', '浏览器和系统可以选择最合适的资源'],
              ['保留透明背景', '优先使用 PNG、SVG 或透明 WebP 源图', '缩小后边缘更干净'],
              ['制作前预览', '同时看浏览器标签页和收藏夹效果', '小尺寸问题必须在真实场景里检查'],
            ],
          },
          { type: 'heading', level: 2, text: '技术上，清晰 favicon 是怎么生成的？' },
          {
            type: 'paragraph',
            text: '一个高质量 favicon 不是简单地把图片改名成 favicon.ico。更稳妥的做法是：先把源图解码到浏览器 Canvas，再按多个目标尺寸重新绘制，最后打包成 ICO 或导出多尺寸 PNG。',
          },
          {
            type: 'list',
            items: [
              '高质量缩放：Canvas 绘制时开启 imageSmoothingEnabled 和 high 级别的 imageSmoothingQuality，让向下缩小时边缘更平滑。',
              '居中裁切：把原图按正方形图标容器适配，允许用户拖动位置和缩放，避免主体被裁掉。',
              '圆角裁剪：先绘制圆角路径，再 clip 到图标画布，适合 App 图标和品牌图标。',
              '透明通道：使用 PNG 数据保留 Alpha，让图标边缘在深色和浅色浏览器主题下都更自然。',
              '多尺寸打包：ICO 容器会写入 ICONDIR 文件头和多个图标条目，浏览器可以按显示场景选择 16px、32px 或更大尺寸。',
              '256px 资源处理：常见 ICO 会把 256px 图标以 PNG 数据写入容器，较小尺寸可以使用 32 位 BGRA 位图数据。',
            ],
          },
          { type: 'heading', level: 2, text: '如何在 HTML 中使用 favicon？' },
          {
            type: 'paragraph',
            text: '常见网站可以同时提供 ICO 和 PNG 图标。ICO 兼容性强，PNG 则适合现代浏览器、Apple Touch Icon 和 PWA 场景。',
          },
          {
            type: 'code',
            language: 'html',
            code: '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
          },
          { type: 'heading', level: 2, text: '用 toolgarden.xyz 制作清晰 favicon' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片转 Icon 工具会在浏览器本地读取图片，不上传文件。它会把源图渲染成多种标准图标尺寸，并生成 ICO、ICNS 或多尺寸 PNG ZIP。制作 favicon 时，推荐选择 ICO，因为 ICO 容器可以同时包含 16 到 256 像素的多套图标资源。',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz 图片转 Icon',
            text: '上传 PNG、SVG、JPG 或 WebP 后，可以拖动主体、调整缩放、设置圆角、移除背景，并生成多尺寸 ICO。预览区会模拟浏览器标签页和收藏夹效果，方便检查小尺寸是否清晰。',
            href: '/image/to-icon',
            linkLabel: '打开图片转 Icon',
          },
          { type: 'heading', level: 2, text: '制作清晰 favicon 的步骤' },
          {
            type: 'list',
            ordered: true,
            items: [
              '准备一张尽量清晰的源图，建议 512px 或更大。',
              '如果背景复杂，先移除背景或换成透明底。',
              '在图标编辑区调整缩放和位置，让主体在小尺寸里仍然可识别。',
              '生成 ICO，并同时保存多尺寸 ZIP 作为备用资源。',
              '把 favicon.ico 放到站点根目录，并在 HTML 或框架 metadata 中引用。',
              '刷新浏览器缓存后，在标签页、收藏夹和移动端快捷方式里检查效果。',
            ],
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'favicon 模糊的根本原因通常是像素不够、尺寸不全或缩放方式不合适。想让网站图标清晰，应该从高分辨率源图开始，简化图形，保留透明边缘，并输出多尺寸图标资源。',
          },
          {
            type: 'paragraph',
            text: '好的 favicon 不是只在 256px 预览里好看，而是在 16px 的浏览器标签页里也能被一眼认出来。',
          },
        ],
      },
      en: {
        title: 'Why Does a Favicon Look Blurry? How to Make a Sharp Website Icon',
        excerpt: 'A blurry favicon is usually caused by the source image, missing icon sizes, transparency issues, or browser scaling rather than the browser itself.',
        metaTitle: 'Why Does a Favicon Look Blurry? How to Make a Sharp Website Icon',
        metaDescription: 'Learn why favicons look blurry, how multi-size ICO files work, and how to create a sharp website icon from PNG, SVG, JPG, or WebP images.',
        readingTime: '7 min read',
        tags: ['favicon', 'ICO', 'website icon', 'image to icon'],
        relatedTools: [
          {
            label: 'Image to Icon',
            href: '/image/to-icon',
            description: 'Convert PNG, SVG, JPG, WebP, and other images into ICO, ICNS, or multi-size PNG ZIP icons.',
          },
          {
            label: 'Image Resize',
            href: '/image/resize',
            description: 'Resize images before icon generation when the source dimensions are larger than needed.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'A favicon is tiny, but it carries a lot of brand recognition. When it looks blurry in the browser tab, the logo feels less polished immediately.',
          },
          {
            type: 'paragraph',
            text: 'The browser is rarely the real problem. A favicon can be shown in tabs, bookmarks, shortcuts, search results, and operating system surfaces. Each place may need a different pixel size. If you only provide one weak image, the browser has to scale it.',
          },
          { type: 'heading', level: 2, text: 'Why favicons become blurry' },
          {
            type: 'list',
            items: [
              'The source image is too small, so larger icon sizes are created by upscaling.',
              'Only one size is available, so the browser stretches or shrinks it for every use case.',
              'The design is too detailed, with small text, thin strokes, or complex gradients.',
              'Transparency is not clean, which creates gray or white edges after resizing.',
              'The wrong format is used, such as JPG for an icon that needs a transparent background.',
              'The image was compressed before conversion, so edge detail was already damaged.',
            ],
          },
          { type: 'heading', level: 2, text: 'Rules for a sharp favicon' },
          {
            type: 'table',
            headers: ['Rule', 'Suggestion', 'Why it helps'],
            rows: [
              ['Start large', 'Use a 512px or 1024px source when possible', 'Downscaling is cleaner than upscaling'],
              ['Simplify the mark', 'Avoid tiny text, hairline strokes, and complex shadows', 'A 16px tab icon has very little room for detail'],
              ['Export multiple sizes', 'Include 16, 32, 48, 64, 128, and 256px', 'Browsers and systems can choose the best resource'],
              ['Keep transparency', 'Use PNG, SVG, or transparent WebP as the source', 'Edges look cleaner on light and dark themes'],
              ['Preview the real context', 'Check tabs and bookmarks, not only the large preview', 'Small-size issues only show up at small sizes'],
            ],
          },
          { type: 'heading', level: 2, text: 'How a sharp favicon is generated technically' },
          {
            type: 'paragraph',
            text: 'A good favicon workflow does more than rename an image to favicon.ico. A better pipeline decodes the source image into a browser Canvas, redraws it at multiple target sizes, and then packages those renders as ICO or multi-size PNG assets.',
          },
          {
            type: 'list',
            items: [
              'High-quality resizing: Canvas rendering can enable imageSmoothingEnabled and high imageSmoothingQuality for cleaner downscaling.',
              'Centered composition: the image is fitted into a square icon canvas, with user-controlled scaling and positioning so the subject is not cropped badly.',
              'Corner clipping: a rounded rectangle path can be applied before drawing when app-style rounded icons are needed.',
              'Alpha preservation: PNG render data keeps transparency so edges work on both light and dark browser themes.',
              'Multi-size packaging: an ICO container writes an ICONDIR header and several icon entries, letting browsers choose 16px, 32px, or larger resources as needed.',
              '256px handling: modern ICO files often store the 256px entry as PNG data, while smaller entries can use 32-bit BGRA bitmap data.',
            ],
          },
          { type: 'heading', level: 2, text: 'How to add favicon files in HTML' },
          {
            type: 'paragraph',
            text: 'Many sites provide both an ICO file and PNG icons. ICO is broadly compatible, while PNG files are useful for modern browsers, Apple Touch Icon, and PWA surfaces.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
          },
          { type: 'heading', level: 2, text: 'Make a sharp favicon with toolgarden.xyz' },
          {
            type: 'paragraph',
            text: 'The Image to Icon tool on ToolGarden reads the image locally in your browser and does not upload files. It renders the source image into standard icon sizes and generates ICO, ICNS, or a multi-size PNG ZIP. For favicons, ICO is usually the safest choice because one container can include icon resources from 16 to 256 pixels.',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz Image to Icon',
            text: 'Upload PNG, SVG, JPG, or WebP, then adjust position, scale, corner radius, or remove the background. ToolGarden generates a multi-size ICO and shows browser-style previews so you can check whether the icon stays readable at small sizes.',
            href: '/image/to-icon',
            linkLabel: 'Open Image to Icon',
          },
          { type: 'heading', level: 2, text: 'Step-by-step workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Start with a clean source image, ideally 512px or larger.',
              'Remove or clean the background if the icon needs transparency.',
              'Adjust scale and position so the mark stays recognizable when small.',
              'Generate an ICO file and keep the multi-size ZIP as backup assets.',
              'Place favicon.ico at the site root or reference it through your framework metadata.',
              'Clear browser cache and check the tab, bookmarks, and mobile shortcut surfaces.',
            ],
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'A favicon usually looks blurry because the source is too small, the icon does not include enough sizes, or the design cannot survive tiny pixel dimensions. Start from a high-resolution source, simplify the mark, preserve transparent edges, and export multiple icon sizes.',
          },
          {
            type: 'paragraph',
            text: 'A good favicon is not just clean at 256px. It should still be recognizable in a 16px browser tab.',
          },
        ],
      },
    },
  },
  {
    slug: 'convert-image-to-ico',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: '如何把图片转换成 ICO 图标？PNG/JPG/WebP 转 ICO 完整教程',
        excerpt: '把普通图片转换成 ICO，不只是改扩展名。真正可用的 ICO 应该包含多尺寸图标资源，并正确处理透明背景和缩放。',
        metaTitle: '如何把图片转换成 ICO 图标？PNG/JPG/WebP 转 ICO 教程',
        metaDescription: '完整介绍 PNG、JPG、WebP、SVG 等图片如何转换成 ICO 图标，包括 favicon 尺寸、透明背景、多尺寸 ICO 容器和 ToolGarden 在线转换方法。',
        readingTime: '约 8 分钟阅读',
        tags: ['ICO', 'PNG 转 ICO', 'favicon', '图片转 Icon'],
        relatedTools: [
          {
            label: '图片转 Icon',
            href: '/image/to-icon',
            description: '在浏览器本地把 PNG、SVG、JPG、WebP 等图片制作成 ICO、ICNS 或多尺寸 PNG ZIP。',
          },
          {
            label: '图片去背景',
            href: '/image/remove-bg',
            description: '生成透明背景图片，适合在制作图标前清理背景。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'ICO 是网站 favicon、Windows 快捷方式和桌面图标里最常见的图标格式之一。很多人以为把 png 改名成 ico 就可以了，但这并不是真正的 ICO 文件。',
          },
          {
            type: 'paragraph',
            text: '真正的 ICO 是一个容器格式。它可以在一个文件里包含多张不同尺寸的图标，比如 16x16、32x32、48x48、128x128 和 256x256。浏览器或系统会根据显示场景自动选择最合适的尺寸。',
          },
          { type: 'heading', level: 2, text: '哪些图片适合转换成 ICO？' },
          {
            type: 'table',
            headers: ['源格式', '是否适合', '注意事项'],
            rows: [
              ['PNG', '非常适合', '支持透明背景，适合 logo、图标和 UI 标识'],
              ['SVG', '适合', '矢量图缩放清晰，但需要浏览器能正确解码'],
              ['JPG/JPEG', '可以使用', '没有透明通道，适合照片类图标，不适合透明 logo'],
              ['WebP', '可以使用', '支持透明和压缩，但兼容性取决于浏览器解码能力'],
              ['BMP/AVIF', '视浏览器而定', '只要当前浏览器能解码，就可以先绘制到 Canvas 再导出'],
            ],
          },
          { type: 'heading', level: 2, text: 'PNG/JPG/WebP 转 ICO 的推荐步骤' },
          {
            type: 'list',
            ordered: true,
            items: [
              '准备清晰源图，建议至少 512x512 像素。',
              '如果是 logo，优先使用透明背景 PNG 或 SVG。',
              '把主体放在正方形画布中央，避免边缘过于贴近画布。',
              '生成多尺寸 ICO，而不是只生成一个 32x32 图标。',
              '在浏览器标签页、收藏夹和 Windows 快捷方式中检查显示效果。',
            ],
          },
          { type: 'heading', level: 2, text: '技术实现：ICO 文件是怎么生成的？' },
          {
            type: 'paragraph',
            text: '图片转 ICO 的核心流程通常包括解码、重绘、导出和打包四步。浏览器里的实现可以完全在本地完成，不需要把图片上传到服务器。',
          },
          {
            type: 'list',
            items: [
              '图片解码：读取用户上传的 PNG、JPG、WebP、SVG 等文件，通过浏览器 Image 对象解码出真实宽高。',
              'Canvas 重绘：为每个目标尺寸创建正方形 Canvas，例如 16、24、32、48、64、128、256px。',
              '高质量缩放：使用 Canvas drawImage 按比例绘制，并开启高质量平滑，减少缩小后的锯齿和发虚。',
              '透明处理：PNG、SVG、WebP 的 Alpha 通道可以保留；JPG 没有透明通道，通常会保留不透明背景。',
              'ICO 目录：文件开头写入 ICONDIR header，再为每个尺寸写入 ICONDIRENTRY，记录宽高、位深、数据长度和偏移。',
              '像素数据：小尺寸可以写入 32 位 BGRA DIB 数据，256px 尺寸常直接写入 PNG 字节，兼顾兼容性和体积。',
            ],
          },
          { type: 'heading', level: 2, text: '为什么 ICO 要包含多个尺寸？' },
          {
            type: 'paragraph',
            text: '如果 ICO 只包含一个尺寸，浏览器和系统遇到其他显示场景时只能强行缩放。例如你只提供 32px 图标，浏览器标签页可能看起来还可以，但 Windows 快捷方式或高分屏场景就可能变糊。',
          },
          {
            type: 'list',
            items: [
              '16x16：浏览器标签页、地址栏、传统小图标场景。',
              '32x32：高分屏浏览器标签页、收藏夹和常规 favicon 场景。',
              '48x48：Windows 资源管理器和快捷方式常见尺寸。',
              '128x128 / 256x256：大图标、高分屏和桌面场景。',
            ],
          },
          { type: 'heading', level: 2, text: '用 toolgarden.xyz 转换成 ICO' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片转 Icon 工具支持 PNG、SVG、JPG、WebP、BMP、AVIF 等常见输入格式。图片会在浏览器本地读取、缩放、圆角裁剪和打包，整个过程不会上传到服务器。',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz 图片转 ICO',
            text: '上传图片后选择 ICO 输出，ToolGarden 会生成包含 16 到 256 像素多尺寸资源的 ICO 容器，并额外提供多尺寸 ICO ZIP，方便你按需取用单个尺寸。',
            href: '/image/to-icon',
            linkLabel: '打开图片转 Icon',
          },
          { type: 'heading', level: 2, text: '网站 favicon 怎么引用 ICO？' },
          {
            type: 'paragraph',
            text: '生成 ICO 后，最简单的做法是把它命名为 favicon.ico，并放到网站根目录。现代框架也可以通过 metadata 或 head 标签引用。',
          },
          {
            type: 'code',
            language: 'html',
            code: '<link rel="icon" href="/favicon.ico" sizes="any">',
          },
          { type: 'heading', level: 2, text: '常见问题' },
          {
            type: 'heading',
            level: 3,
            text: 'ICO 可以保留透明背景吗？',
          },
          {
            type: 'paragraph',
            text: '可以。只要源图有透明通道，并且生成过程使用 32 位颜色数据或 PNG 图标数据，ICO 就可以保留透明背景。',
          },
          {
            type: 'heading',
            level: 3,
            text: 'JPG 转 ICO 后为什么没有透明背景？',
          },
          {
            type: 'paragraph',
            text: '因为 JPG 格式本身没有 Alpha 通道。想要透明图标，建议先使用 PNG、SVG 或 WebP 源图，或者先移除背景再转换。',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'PNG、JPG、WebP 转 ICO 的关键不是扩展名，而是生成真正的 ICO 容器，并包含多套尺寸。这样浏览器、Windows 和快捷方式场景才能选择最合适的图标资源。',
          },
          {
            type: 'paragraph',
            text: '如果你只是临时做一个网站 favicon，用 toolgarden.xyz 这类浏览器本地工具会更方便：上传、预览、生成多尺寸 ICO，一步到位。',
          },
        ],
      },
      en: {
        title: 'How to Convert an Image to ICO: Complete PNG, JPG, and WebP to ICO Guide',
        excerpt: 'Converting an image to ICO is not just changing the extension. A useful ICO file should contain multiple icon sizes and handle transparency correctly.',
        metaTitle: 'How to Convert an Image to ICO: PNG, JPG, WebP to ICO Guide',
        metaDescription: 'Learn how to convert PNG, JPG, WebP, and SVG images to ICO icons, how ICO containers work, which favicon sizes matter, and how to generate ICO files with ToolGarden.',
        readingTime: '8 min read',
        tags: ['ICO', 'PNG to ICO', 'favicon', 'image to icon'],
        relatedTools: [
          {
            label: 'Image to Icon',
            href: '/image/to-icon',
            description: 'Create ICO, ICNS, or multi-size PNG ZIP icons from PNG, SVG, JPG, WebP, and other images locally in the browser.',
          },
          {
            label: 'Remove Image Background',
            href: '/image/remove-bg',
            description: 'Create a transparent image before turning a logo or photo into an icon.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'ICO is one of the most common formats for website favicons, Windows shortcuts, and desktop icons. But renaming image.png to image.ico does not create a real ICO file.',
          },
          {
            type: 'paragraph',
            text: 'A real ICO file is a container. It can hold several icon images at different sizes, such as 16x16, 32x32, 48x48, 128x128, and 256x256. The browser or operating system can then choose the best size for each display context.',
          },
          { type: 'heading', level: 2, text: 'Which images work well as ICO sources?' },
          {
            type: 'table',
            headers: ['Source format', 'Good fit?', 'Notes'],
            rows: [
              ['PNG', 'Excellent', 'Supports transparency and works well for logos, icons, and UI marks'],
              ['SVG', 'Good', 'Vector artwork scales cleanly, as long as the browser decodes it correctly'],
              ['JPG/JPEG', 'Usable', 'No alpha channel, better for photo-like icons than transparent logos'],
              ['WebP', 'Usable', 'Can support transparency, depending on browser decoding support'],
              ['BMP/AVIF', 'Browser-dependent', 'If the browser can decode it, it can be rendered to Canvas first'],
            ],
          },
          { type: 'heading', level: 2, text: 'Recommended PNG/JPG/WebP to ICO workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Start with a clear source image, ideally at least 512x512 pixels.',
              'For logos, prefer transparent PNG or SVG.',
              'Place the subject in the center of a square canvas with enough padding.',
              'Generate a multi-size ICO instead of a single 32x32 icon.',
              'Check the result in browser tabs, bookmarks, and Windows shortcut views.',
            ],
          },
          { type: 'heading', level: 2, text: 'Technical implementation: how ICO files are generated' },
          {
            type: 'paragraph',
            text: 'An image-to-ICO converter usually follows four stages: decode, redraw, export, and package. This can run fully inside the browser without uploading the image to a server.',
          },
          {
            type: 'list',
            items: [
              'Image decoding: the uploaded PNG, JPG, WebP, SVG, or other image is loaded through the browser and its real dimensions are read.',
              'Canvas rendering: a square Canvas is created for each target size, such as 16, 24, 32, 48, 64, 128, and 256px.',
              'High-quality scaling: drawImage renders the source proportionally, with smoothing enabled to reduce jagged edges after downscaling.',
              'Transparency handling: PNG, SVG, and transparent WebP can preserve alpha; JPG has no alpha channel and remains opaque.',
              'ICO directory: the file starts with an ICONDIR header, followed by ICONDIRENTRY records that store size, bit depth, data length, and offset.',
              'Pixel data: smaller entries can use 32-bit BGRA DIB data, while 256px entries are often stored as PNG bytes for better size and compatibility.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why a multi-size ICO matters' },
          {
            type: 'paragraph',
            text: 'If an ICO contains only one size, the browser or operating system must scale it for every other use case. A 32px-only icon may look fine in one tab but soft in Windows shortcuts or high-density displays.',
          },
          {
            type: 'list',
            items: [
              '16x16: browser tabs, address bars, and classic small icon surfaces.',
              '32x32: high-density browser tabs, bookmarks, and common favicon usage.',
              '48x48: Windows Explorer and shortcut views.',
              '128x128 / 256x256: large icons, high-density screens, and desktop surfaces.',
            ],
          },
          { type: 'heading', level: 2, text: 'Convert images to ICO with toolgarden.xyz' },
          {
            type: 'paragraph',
            text: 'ToolGarden Image to Icon supports common input formats including PNG, SVG, JPG, WebP, BMP, and AVIF. Image loading, scaling, corner clipping, preview, and packaging happen locally in the browser, so the image is not uploaded to a server.',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz PNG/JPG/WebP to ICO',
            text: 'Upload an image and choose ICO output. ToolGarden generates a multi-size ICO container from 16 to 256 pixels and also offers a ZIP with separate ICO files for each size.',
            href: '/image/to-icon',
            linkLabel: 'Open Image to Icon',
          },
          { type: 'heading', level: 2, text: 'How to reference an ICO favicon' },
          {
            type: 'paragraph',
            text: 'After generating the ICO file, the simplest setup is to name it favicon.ico and place it at the website root. Modern frameworks can also reference it through metadata or head tags.',
          },
          {
            type: 'code',
            language: 'html',
            code: '<link rel="icon" href="/favicon.ico" sizes="any">',
          },
          { type: 'heading', level: 2, text: 'Common questions' },
          { type: 'heading', level: 3, text: 'Can ICO preserve transparency?' },
          {
            type: 'paragraph',
            text: 'Yes. If the source image has alpha and the output uses 32-bit color data or PNG icon data, the ICO can preserve transparent backgrounds.',
          },
          { type: 'heading', level: 3, text: 'Why does a JPG-to-ICO file have no transparent background?' },
          {
            type: 'paragraph',
            text: 'JPG does not have an alpha channel. For transparent icons, use PNG, SVG, or transparent WebP as the source, or remove the background before converting.',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'The key to converting PNG, JPG, or WebP to ICO is not the file extension. It is generating a real ICO container with several icon sizes so browsers, Windows, and shortcut surfaces can choose the right resource.',
          },
          {
            type: 'paragraph',
            text: 'For a quick favicon or desktop icon, a browser-local tool like toolgarden.xyz is convenient: upload, preview, generate a multi-size ICO, and download.',
          },
        ],
      },
    },
  },
  {
    slug: 'ico-vs-icns-vs-png-icons',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: 'ICO、ICNS、PNG 图标有什么区别？网站、Windows 和 macOS 图标怎么选',
        excerpt: 'ICO、ICNS 和 PNG 都能用作图标，但它们面向的系统、容器结构、尺寸管理和透明支持方式并不相同。',
        metaTitle: 'ICO、ICNS、PNG 图标区别：网站、Windows、macOS 怎么选',
        metaDescription: '对比 ICO、ICNS、PNG 图标格式的区别，解释网站 favicon、Windows 图标、macOS 图标和 PWA 多尺寸图标应该如何选择。',
        readingTime: '约 8 分钟阅读',
        tags: ['ICO', 'ICNS', 'PNG', 'favicon', 'macOS 图标'],
        relatedTools: [
          {
            label: '图片转 Icon',
            href: '/image/to-icon',
            description: '一次生成 ICO、ICNS 或多尺寸 PNG ZIP，适合网站、Windows、macOS 和 PWA 图标资源。',
          },
          {
            label: '图片转 PNG',
            href: '/image/to-png',
            description: '把其他图片转换成 PNG，适合准备透明图标源文件。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '做图标时经常会遇到三个格式：ICO、ICNS 和 PNG。它们看起来都能表示图标，但用途并不一样。选错格式，轻则显示模糊，重则系统或浏览器不识别。',
          },
          {
            type: 'paragraph',
            text: '简单来说：ICO 更适合网站 favicon 和 Windows；ICNS 更适合 macOS 应用；PNG 更适合网页、PWA、移动端和作为图标源文件。',
          },
          { type: 'heading', level: 2, text: 'ICO、ICNS、PNG 快速对比' },
          {
            type: 'table',
            headers: ['格式', '主要用途', '是否是容器', '常见尺寸'],
            rows: [
              ['ICO', 'favicon、Windows 图标、快捷方式', '是，可以包含多尺寸图标', '16、24、32、48、64、128、256px'],
              ['ICNS', 'macOS 应用图标、Finder 图标', '是，可以包含多尺寸资源', '16、32、64、128、256、512、1024px'],
              ['PNG', '网页图标、PWA、移动端、图标源文件', '不是，单个文件通常只有一个尺寸', '32、64、180、192、512、1024px'],
            ],
          },
          { type: 'heading', level: 2, text: '什么时候选择 ICO？' },
          {
            type: 'paragraph',
            text: '如果你要做网站 favicon，ICO 仍然是非常稳妥的选择。它兼容历史浏览器，也能在一个文件里放入多种尺寸。浏览器标签页、收藏夹、桌面快捷方式可能需要不同尺寸，ICO 容器可以让它们自动选择。',
          },
          {
            type: 'list',
            items: [
              '网站 favicon：推荐提供 favicon.ico。',
              'Windows 桌面图标：ICO 是原生常用格式。',
              '快捷方式图标：ICO 可以适配多种显示尺寸。',
              '需要兼容旧环境：ICO 的兼容性更稳。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候选择 ICNS？' },
          {
            type: 'paragraph',
            text: 'ICNS 是 macOS 图标容器格式，常用于 macOS 应用图标和 Finder 显示。它也可以包含多套尺寸，最高常见到 1024px，以适配 Retina 屏和不同 Finder 视图。',
          },
          {
            type: 'list',
            items: [
              'macOS 应用图标：优先使用 ICNS。',
              'Finder 大图标预览：需要高分辨率资源。',
              'Electron 或桌面应用打包：macOS 平台通常需要 ICNS。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候选择 PNG？' },
          {
            type: 'paragraph',
            text: 'PNG 不是图标容器，但它清晰、无损、支持透明背景，所以非常适合作为网页图标、PWA 图标和图标制作的源文件。缺点是每个 PNG 通常只代表一个尺寸，你需要生成多张不同尺寸的 PNG。',
          },
          {
            type: 'list',
            items: [
              'PWA manifest icons：常见 192x192 和 512x512 PNG。',
              'Apple Touch Icon：常见 180x180 PNG。',
              '网页 UI 图标：PNG 适合需要位图透明效果的场景。',
              '图标源文件：后续可以继续转换成 ICO 或 ICNS。',
            ],
          },
          { type: 'heading', level: 2, text: '技术实现差异：它们到底哪里不一样？' },
          {
            type: 'paragraph',
            text: 'ICO、ICNS 和 PNG 的最大区别不只是扩展名，而是文件结构。ICO 和 ICNS 是图标容器，PNG 是单张位图图片。',
          },
          {
            type: 'list',
            items: [
              'ICO：文件头使用 little-endian 结构，包含 ICONDIR 和多个 ICONDIRENTRY，每个条目指向一张指定尺寸的图标数据。',
              'ICO 像素数据：小尺寸常使用 32 位 BGRA DIB 数据，256px 条目经常直接保存 PNG 字节。',
              'ICNS：文件以 icns 标识开头，使用 big-endian 长度字段，每个资源块有自己的类型，例如 icp4、icp5、icp6、ic07、ic08、ic09、ic10。',
              'ICNS 图像数据：现代 ICNS 常把不同尺寸的 PNG 数据放入对应资源块，适配 macOS 多尺寸显示。',
              'PNG：单文件只描述一张图片，包含 IHDR、IDAT、IEND 等块，支持无损压缩和 Alpha 透明，但不会自动包含多尺寸版本。',
              '多尺寸 PNG ZIP：本质上是把 16、32、64、128、256、512、1024px 等 PNG 文件打包成 ZIP，方便网页或 PWA 按需引用。',
            ],
          },
          { type: 'heading', level: 2, text: '不同场景怎么选？' },
          {
            type: 'table',
            headers: ['场景', '推荐格式', '说明'],
            rows: [
              ['网站 favicon', 'ICO + PNG', 'ICO 做兼容，PNG 补充现代浏览器和 Apple Touch Icon'],
              ['Windows 桌面图标', 'ICO', '系统原生支持，适合快捷方式和桌面图标'],
              ['macOS 应用图标', 'ICNS', 'macOS 原生图标容器，支持高分辨率资源'],
              ['PWA 图标', 'PNG ZIP', 'manifest 通常引用多张 PNG，例如 192px 和 512px'],
              ['设计源文件', 'SVG 或高分辨率 PNG', '便于后续生成 ICO、ICNS 和 PNG 多尺寸资源'],
            ],
          },
          { type: 'heading', level: 2, text: '用 toolgarden.xyz 一次生成三类图标' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片转 Icon 工具会在浏览器本地把源图渲染成多种尺寸，然后根据你选择的格式打包：ICO 会生成 16 到 256px 图标条目，ICNS 会生成最高 1024px 的 macOS 图标资源，PNG ZIP 会生成一组独立 PNG 文件。',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz 图片转 Icon',
            text: '上传一张 PNG、SVG、JPG 或 WebP，就可以选择导出 ICO、ICNS 或 PNG ZIP。工具支持拖动缩放、圆角、背景移除和浏览器预览，所有处理都在本地完成。',
            href: '/image/to-icon',
            linkLabel: '打开图片转 Icon',
          },
          { type: 'heading', level: 2, text: '推荐输出组合' },
          {
            type: 'list',
            items: [
              '普通网站：生成 ICO，再额外保存 32x32 PNG 和 Apple Touch Icon。',
              'PWA：生成 PNG ZIP，挑选 192x192 和 512x512 写入 manifest。',
              '跨平台桌面应用：Windows 使用 ICO，macOS 使用 ICNS。',
              '品牌资源包：同时导出 ICO、ICNS 和 PNG ZIP，覆盖网站、桌面和移动端场景。',
            ],
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'ICO、ICNS、PNG 没有绝对谁更好，关键看使用场景。网站和 Windows 优先 ICO，macOS 应用优先 ICNS，网页、PWA 和设计源文件优先 PNG。',
          },
          {
            type: 'paragraph',
            text: '最省心的做法是从一张高质量源图出发，一次生成多种图标格式。这样网站、Windows、macOS 和 PWA 都能拿到合适的图标资源。',
          },
        ],
      },
      en: {
        title: 'ICO vs ICNS vs PNG Icons: Which Format Should You Use for Web, Windows, and macOS?',
        excerpt: 'ICO, ICNS, and PNG can all be used for icons, but they target different platforms and handle sizes, containers, and transparency differently.',
        metaTitle: 'ICO vs ICNS vs PNG Icons: Web, Windows, and macOS Format Guide',
        metaDescription: 'Compare ICO, ICNS, and PNG icon formats for website favicons, Windows icons, macOS app icons, and PWA assets. Learn which format to choose and why.',
        readingTime: '8 min read',
        tags: ['ICO', 'ICNS', 'PNG', 'favicon', 'macOS icon'],
        relatedTools: [
          {
            label: 'Image to Icon',
            href: '/image/to-icon',
            description: 'Generate ICO, ICNS, or multi-size PNG ZIP assets for websites, Windows, macOS, and PWA icon workflows.',
          },
          {
            label: 'Image to PNG',
            href: '/image/to-png',
            description: 'Convert images to PNG when you need a transparent source file for icon generation.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Icon workflows often mention three formats: ICO, ICNS, and PNG. They can all represent icons, but they are not interchangeable. Choosing the wrong one can make icons blurry or unsupported.',
          },
          {
            type: 'paragraph',
            text: 'In short: ICO is best for favicons and Windows, ICNS is best for macOS apps, and PNG is best for web assets, PWA icons, mobile surfaces, and source files.',
          },
          { type: 'heading', level: 2, text: 'ICO, ICNS, and PNG at a glance' },
          {
            type: 'table',
            headers: ['Format', 'Main use', 'Container?', 'Common sizes'],
            rows: [
              ['ICO', 'Favicons, Windows icons, shortcuts', 'Yes, can contain multiple icon sizes', '16, 24, 32, 48, 64, 128, 256px'],
              ['ICNS', 'macOS app icons and Finder icons', 'Yes, can contain multiple icon resources', '16, 32, 64, 128, 256, 512, 1024px'],
              ['PNG', 'Web icons, PWA icons, mobile assets, source images', 'No, one file usually represents one size', '32, 64, 180, 192, 512, 1024px'],
            ],
          },
          { type: 'heading', level: 2, text: 'When to choose ICO' },
          {
            type: 'paragraph',
            text: 'If you are creating a website favicon, ICO is still a safe choice. It has strong compatibility and can store several sizes in one file. Browser tabs, bookmarks, and desktop shortcuts may need different pixel sizes, and the ICO container lets them choose.',
          },
          {
            type: 'list',
            items: [
              'Website favicons: provide favicon.ico for broad compatibility.',
              'Windows desktop icons: ICO is the native common format.',
              'Shortcut icons: ICO adapts well to several display sizes.',
              'Older environments: ICO remains the safest fallback.',
            ],
          },
          { type: 'heading', level: 2, text: 'When to choose ICNS' },
          {
            type: 'paragraph',
            text: 'ICNS is the macOS icon container format. It is commonly used for macOS app icons and Finder display. It can include high-resolution resources up to 1024px for Retina screens and different Finder views.',
          },
          {
            type: 'list',
            items: [
              'macOS app icons: use ICNS.',
              'Finder large icon preview: include high-resolution resources.',
              'Electron or desktop app packaging: macOS builds usually need ICNS.',
            ],
          },
          { type: 'heading', level: 2, text: 'When to choose PNG' },
          {
            type: 'paragraph',
            text: 'PNG is not an icon container, but it is crisp, lossless, and supports transparency. That makes it excellent for web icons, PWA icons, and source files. The tradeoff is that each PNG usually covers one size, so you need multiple PNG files for multiple contexts.',
          },
          {
            type: 'list',
            items: [
              'PWA manifest icons: 192x192 and 512x512 PNG are common.',
              'Apple Touch Icon: 180x180 PNG is commonly used.',
              'Web UI icons: PNG works well when bitmap transparency is needed.',
              'Icon source files: PNG can be converted later to ICO or ICNS.',
            ],
          },
          { type: 'heading', level: 2, text: 'Technical differences: what changes inside the file?' },
          {
            type: 'paragraph',
            text: 'The difference is not just the extension. ICO and ICNS are icon containers. PNG is a single bitmap image format.',
          },
          {
            type: 'list',
            items: [
              'ICO: starts with a little-endian ICONDIR structure and multiple ICONDIRENTRY records, each pointing to one icon image.',
              'ICO pixel data: smaller entries often use 32-bit BGRA DIB data, while 256px entries are often stored as PNG bytes.',
              'ICNS: starts with an icns signature and big-endian length fields. Each resource block has a type such as icp4, icp5, icp6, ic07, ic08, ic09, or ic10.',
              'ICNS image data: modern ICNS files often place PNG data in the resource block for each size.',
              'PNG: a single file describes one image with chunks such as IHDR, IDAT, and IEND, plus lossless compression and optional alpha.',
              'Multi-size PNG ZIP: this is a ZIP archive of separate PNG files such as 16, 32, 64, 128, 256, 512, and 1024px, ready for web or PWA references.',
            ],
          },
          { type: 'heading', level: 2, text: 'Which format should you use?' },
          {
            type: 'table',
            headers: ['Use case', 'Recommended format', 'Why'],
            rows: [
              ['Website favicon', 'ICO + PNG', 'ICO for compatibility, PNG for modern browsers and Apple Touch Icon'],
              ['Windows desktop icon', 'ICO', 'Native system support for shortcuts and desktop icons'],
              ['macOS app icon', 'ICNS', 'Native macOS icon container with high-resolution resources'],
              ['PWA icon', 'PNG ZIP', 'Manifests usually reference separate PNG files, such as 192px and 512px'],
              ['Design source', 'SVG or high-resolution PNG', 'Easy to regenerate ICO, ICNS, and PNG assets later'],
            ],
          },
          { type: 'heading', level: 2, text: 'Generate all three icon formats with toolgarden.xyz' },
          {
            type: 'paragraph',
            text: 'ToolGarden Image to Icon renders the source image locally into multiple sizes, then packages the result based on the selected format. ICO includes entries from 16 to 256px, ICNS includes macOS resources up to 1024px, and PNG ZIP contains separate PNG files for each size.',
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz Image to Icon',
            text: 'Upload PNG, SVG, JPG, or WebP, then export ICO, ICNS, or PNG ZIP. The tool supports drag scaling, corner radius, background removal, and browser previews. All processing runs locally in the browser.',
            href: '/image/to-icon',
            linkLabel: 'Open Image to Icon',
          },
          { type: 'heading', level: 2, text: 'Recommended output sets' },
          {
            type: 'list',
            items: [
              'Standard website: generate ICO, then keep 32x32 PNG and Apple Touch Icon PNG.',
              'PWA: generate PNG ZIP and reference 192x192 and 512x512 in the manifest.',
              'Cross-platform desktop app: use ICO for Windows and ICNS for macOS.',
              'Brand asset package: export ICO, ICNS, and PNG ZIP to cover web, desktop, and mobile use cases.',
            ],
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'ICO, ICNS, and PNG are all useful, but for different targets. Use ICO for websites and Windows, ICNS for macOS apps, and PNG for web, PWA, mobile, and source assets.',
          },
          {
            type: 'paragraph',
            text: 'The easiest workflow is to start from one high-quality source image and generate multiple icon formats at once. That gives websites, Windows, macOS, and PWA surfaces the assets they expect.',
          },
        ],
      },
    },
  },
  {
    slug: 'jpg-png-webp-avif-differences',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: 'JPG、PNG、WebP、AVIF 有什么区别？网页图片格式怎么选',
        excerpt: 'JPG、PNG、WebP、AVIF 都能用于网页图片，但它们在压缩方式、透明背景、清晰度、兼容性和适用场景上差异很大。',
        metaTitle: 'JPG、PNG、WebP、AVIF 区别：网页图片格式怎么选',
        metaDescription: '对比 JPG、PNG、WebP、AVIF 四种图片格式的区别，解释照片、截图、透明图、网页首图、缩略图应该如何选择，并介绍如何用 ToolGarden 转换格式。',
        readingTime: '约 8 分钟阅读',
        tags: ['图片格式', 'JPG', 'PNG', 'WebP', 'AVIF'],
        relatedTools: [
          {
            label: '图片转 WebP',
            href: '/image/to-webp',
            description: '把 JPG、PNG、GIF、BMP、SVG、AVIF 等图片转换为 WebP。',
          },
          {
            label: '图片转 AVIF',
            href: '/image/to-avif',
            description: '把 JPG、PNG、WebP、GIF、BMP、SVG 等图片转换为 AVIF。',
          },
          {
            label: '图片转 JPG',
            href: '/image/to-jpg',
            description: '把 PNG、WebP、SVG、AVIF 等图片转换为 JPG，适合照片类图片。',
          },
          {
            label: '图片转 PNG',
            href: '/image/to-png',
            description: '把 JPG、WebP、SVG、AVIF 等图片转换为 PNG，适合透明图和截图。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '同一张图片，保存成 JPG、PNG、WebP 或 AVIF，文件大小和显示效果可能完全不同。选对格式，网页加载更快；选错格式，可能文件变大、透明背景丢失，或者画质变糊。',
          },
          {
            type: 'paragraph',
            text: '图片格式没有绝对好坏，只有适不适合。照片、截图、透明 logo、商品图、首屏大图、缩略图和图标，对压缩、透明通道和兼容性的要求都不一样。',
          },
          { type: 'heading', level: 2, text: '四种格式快速对比' },
          {
            type: 'table',
            headers: ['格式', '压缩方式', '透明背景', '适合场景'],
            rows: [
              ['JPG', '有损压缩', '不支持', '照片、商品图、社交分享图'],
              ['PNG', '无损压缩', '支持', '截图、图标、透明 logo、文字图片'],
              ['WebP', '有损或无损', '支持', '网页图片、缩略图、需要兼顾体积和质量的图片'],
              ['AVIF', '高效率有损或无损', '支持', '追求更小体积的网页大图、封面图和图片资产'],
            ],
          },
          { type: 'heading', level: 2, text: '什么时候用 JPG？' },
          {
            type: 'paragraph',
            text: 'JPG 适合照片类图片，因为自然纹理和渐变对少量有损压缩不敏感。它的兼容性非常好，几乎所有浏览器、系统和平台都能打开。',
          },
          {
            type: 'list',
            items: [
              '适合：摄影照片、商品图、文章配图、社交分享图。',
              '不适合：透明背景 logo、截图、二维码、文字很多的图片。',
              '注意：JPG 不支持透明通道，透明区域在转换时通常会被填充为白色背景。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候用 PNG？' },
          {
            type: 'paragraph',
            text: 'PNG 使用无损压缩，能保留清晰边缘和透明背景。它非常适合截图、UI 图、图标和需要透明通道的素材，但照片类图片往往会比 JPG 或 WebP 大很多。',
          },
          {
            type: 'list',
            items: [
              '适合：截图、透明 logo、图标、二维码、文字说明图。',
              '不适合：大尺寸照片、背景图、需要极致压缩的网页图片。',
              '注意：PNG 转 JPG 会丢失透明背景，PNG 转 WebP 通常可以保留透明。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候用 WebP？' },
          {
            type: 'paragraph',
            text: 'WebP 是现代网页图片的常见选择。它通常能在比 JPG 更小的体积下保持不错画质，也支持透明背景。对大多数网站图片来说，WebP 是很均衡的默认选择。',
          },
          {
            type: 'list',
            items: [
              '适合：网页图片、缩略图、商品图、博客配图、透明素材。',
              '优点：体积通常小于 JPG/PNG，同时兼顾画质和透明通道。',
              '注意：如果目标平台很老，仍然需要 JPG 或 PNG 作为备用格式。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候用 AVIF？' },
          {
            type: 'paragraph',
            text: 'AVIF 的压缩效率通常比 WebP 更强，适合想进一步减少网页图片体积的场景。它对照片、封面图和复杂纹理图片很有价值，但编码更慢，兼容性和平台支持也要确认。',
          },
          {
            type: 'list',
            items: [
              '适合：网页首图、封面图、图库缩略图、需要强压缩的图片资产。',
              '优点：同等视觉质量下通常能比 JPG 和 WebP 更小。',
              '注意：AVIF 编码依赖浏览器支持，不支持时需要回退到 WebP 或 JPG。',
            ],
          },
          { type: 'heading', level: 2, text: '技术实现：浏览器里格式转换是怎么做的？' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片格式转换工具在浏览器本地完成：先读取并解码图片，再绘制到 Canvas，最后按目标 MIME 类型导出为 JPG、PNG、WebP 或 AVIF。这个过程不需要把图片上传到服务器。',
          },
          {
            type: 'list',
            items: [
              '输入识别：根据文件 MIME 和扩展名识别 JPG、PNG、WebP、GIF、BMP、SVG、AVIF 等常见格式。',
              '本地解码：通过浏览器图片解码能力读取真实宽高，并限制过大的文件和像素数量。',
              'Canvas 重绘：把图片绘制到同尺寸 Canvas，并开启高质量平滑，减少重绘时的边缘问题。',
              'JPG 输出：使用 image/jpeg 导出，质量参数可调，透明区域会先填充为白色。',
              'PNG 输出：使用 image/png 导出，保留透明通道，但文件可能比有损格式更大。',
              'WebP 输出：使用 image/webp 导出，质量参数控制体积和画质平衡。',
              'AVIF 输出：使用浏览器端 AVIF 编码器从 Canvas 像素数据生成 image/avif，并校验输出文件签名。',
            ],
          },
          { type: 'heading', level: 2, text: '用 toolgarden.xyz 转换图片格式' },
          {
            type: 'callout',
            title: 'ToolGarden 图片格式转换',
            text: '你可以直接在 toolgarden.xyz 使用图片转 JPG、PNG、WebP、AVIF 工具。上传图片后，转换、预览、批量 ZIP 下载都在浏览器本地完成，文件不会上传到服务器。',
            href: '/image/to-webp',
            linkLabel: '打开图片转 WebP',
          },
          { type: 'heading', level: 2, text: '推荐选择' },
          {
            type: 'table',
            headers: ['场景', '推荐格式', '原因'],
            rows: [
              ['普通照片', 'JPG 或 WebP', '兼容性好，体积和画质容易平衡'],
              ['网页图片', 'WebP，必要时 AVIF', '现代浏览器加载更快'],
              ['透明 logo', 'PNG 或 WebP', '保留 Alpha 透明通道'],
              ['截图和文字图片', 'PNG 或高质量 WebP', '保护文字边缘和界面线条'],
              ['极致压缩', 'AVIF', '适合对文件大小敏感的图片资产'],
            ],
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'JPG、PNG、WebP、AVIF 的选择，本质上是在兼容性、文件体积、透明背景和画质之间做平衡。照片优先 JPG/WebP，透明和截图优先 PNG/WebP，追求更小体积可以尝试 AVIF。',
          },
          {
            type: 'paragraph',
            text: '如果不确定，先把图片转成 WebP 做对比，再根据透明背景、兼容性和体积要求决定是否保留 PNG/JPG 或进一步尝试 AVIF。',
          },
        ],
      },
      en: {
        title: 'JPG, PNG, WebP, and AVIF: Which Image Format Should You Use for the Web?',
        excerpt: 'JPG, PNG, WebP, and AVIF all work for web images, but they differ in compression, transparency, quality, compatibility, and best use cases.',
        metaTitle: 'JPG vs PNG vs WebP vs AVIF: Web Image Format Guide',
        metaDescription: 'Compare JPG, PNG, WebP, and AVIF for photos, screenshots, transparent images, hero images, thumbnails, and web assets. Learn how to convert images with ToolGarden.',
        readingTime: '8 min read',
        tags: ['image formats', 'JPG', 'PNG', 'WebP', 'AVIF'],
        relatedTools: [
          {
            label: 'Image to WebP',
            href: '/image/to-webp',
            description: 'Convert JPG, PNG, GIF, BMP, SVG, AVIF, and other images to WebP.',
          },
          {
            label: 'Image to AVIF',
            href: '/image/to-avif',
            description: 'Convert JPG, PNG, WebP, GIF, BMP, SVG, and other images to AVIF.',
          },
          {
            label: 'Image to JPG',
            href: '/image/to-jpg',
            description: 'Convert PNG, WebP, SVG, AVIF, and other images to JPG for photo-like output.',
          },
          {
            label: 'Image to PNG',
            href: '/image/to-png',
            description: 'Convert JPG, WebP, SVG, AVIF, and other images to PNG for transparency and sharp edges.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The same image can look and load very differently depending on whether it is saved as JPG, PNG, WebP, or AVIF. The right format can make a page faster. The wrong one can make files larger, remove transparency, or soften details.',
          },
          {
            type: 'paragraph',
            text: 'There is no single best image format. Photos, screenshots, transparent logos, product images, hero images, thumbnails, and icons all have different needs.',
          },
          { type: 'heading', level: 2, text: 'Quick comparison' },
          {
            type: 'table',
            headers: ['Format', 'Compression', 'Transparency', 'Best for'],
            rows: [
              ['JPG', 'Lossy', 'No', 'Photos, product images, social share images'],
              ['PNG', 'Lossless', 'Yes', 'Screenshots, icons, transparent logos, text-heavy images'],
              ['WebP', 'Lossy or lossless', 'Yes', 'Web images, thumbnails, balanced size and quality'],
              ['AVIF', 'High-efficiency lossy or lossless', 'Yes', 'Hero images, cover images, assets that need extra compression'],
            ],
          },
          { type: 'heading', level: 2, text: 'When to use JPG' },
          {
            type: 'paragraph',
            text: 'JPG works well for photos because natural texture and gradients can tolerate moderate lossy compression. It also has excellent compatibility across browsers, operating systems, and platforms.',
          },
          {
            type: 'list',
            items: [
              'Good for: photos, product images, article images, social share images.',
              'Not ideal for: transparent logos, screenshots, QR codes, and text-heavy images.',
              'Remember: JPG has no alpha channel, so transparent areas are usually filled with white during conversion.',
            ],
          },
          { type: 'heading', level: 2, text: 'When to use PNG' },
          {
            type: 'paragraph',
            text: 'PNG uses lossless compression and preserves sharp edges and transparency. It is excellent for screenshots, UI images, icons, and transparent assets, but photo-like images can be much larger than JPG or WebP.',
          },
          {
            type: 'list',
            items: [
              'Good for: screenshots, transparent logos, icons, QR codes, and text images.',
              'Not ideal for: large photos, backgrounds, and assets that need aggressive compression.',
              'Remember: PNG to JPG loses transparency, while PNG to WebP can usually preserve it.',
            ],
          },
          { type: 'heading', level: 2, text: 'When to use WebP' },
          {
            type: 'paragraph',
            text: 'WebP is a strong default for modern web images. It often keeps good visual quality at a smaller size than JPG, and it can preserve transparency.',
          },
          {
            type: 'list',
            items: [
              'Good for: web images, thumbnails, product images, blog images, transparent assets.',
              'Strength: often smaller than JPG or PNG while keeping a good quality balance.',
              'Remember: older target platforms may still need JPG or PNG fallback files.',
            ],
          },
          { type: 'heading', level: 2, text: 'When to use AVIF' },
          {
            type: 'paragraph',
            text: 'AVIF often compresses better than WebP, especially for photos and complex textures. It is useful when image size matters a lot, but encoding can be slower and platform support should be checked.',
          },
          {
            type: 'list',
            items: [
              'Good for: hero images, cover images, gallery thumbnails, highly compressed web assets.',
              'Strength: often smaller than JPG and WebP at similar visual quality.',
              'Remember: AVIF encoding depends on browser support, so WebP or JPG fallback is still useful.',
            ],
          },
          { type: 'heading', level: 2, text: 'Technical workflow: how browser image conversion works' },
          {
            type: 'paragraph',
            text: 'ToolGarden converts image formats locally in the browser. It reads and decodes the image, draws it to Canvas, and exports the result as JPG, PNG, WebP, or AVIF without uploading the file.',
          },
          {
            type: 'list',
            items: [
              'Input detection: file MIME type and extension are used to recognize JPG, PNG, WebP, GIF, BMP, SVG, AVIF, and other common images.',
              'Local decoding: the browser reads real dimensions and rejects empty, oversized, or unsupported inputs.',
              'Canvas rendering: the decoded image is drawn to a same-size Canvas with high-quality smoothing.',
              'JPG output: exported as image/jpeg with an adjustable quality value; transparent pixels are filled with white first.',
              'PNG output: exported as image/png and can preserve alpha, but may produce larger files.',
              'WebP output: exported as image/webp with an adjustable quality value.',
              'AVIF output: generated from Canvas pixel data with a browser-side AVIF encoder, then validated by file signature.',
            ],
          },
          { type: 'heading', level: 2, text: 'Convert image formats with toolgarden.xyz' },
          {
            type: 'callout',
            title: 'ToolGarden Image Format Conversion',
            text: 'Use toolgarden.xyz to convert images to JPG, PNG, WebP, or AVIF. Upload, preview, convert, and download single files or a ZIP batch locally in your browser. Files are not uploaded to a server.',
            href: '/image/to-webp',
            linkLabel: 'Open Image to WebP',
          },
          { type: 'heading', level: 2, text: 'Recommended choices' },
          {
            type: 'table',
            headers: ['Use case', 'Recommended format', 'Why'],
            rows: [
              ['Regular photos', 'JPG or WebP', 'Good compatibility and balanced file size'],
              ['Web images', 'WebP, with AVIF when useful', 'Faster loading on modern browsers'],
              ['Transparent logos', 'PNG or WebP', 'Preserves alpha transparency'],
              ['Screenshots and text images', 'PNG or high-quality WebP', 'Protects UI lines and text edges'],
              ['Maximum compression', 'AVIF', 'Useful for file-size-sensitive image assets'],
            ],
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'Choosing between JPG, PNG, WebP, and AVIF means balancing compatibility, file size, transparency, and visual quality. Use JPG or WebP for photos, PNG or WebP for transparent and sharp-edged images, and AVIF when you need smaller web assets.',
          },
          {
            type: 'paragraph',
            text: 'When unsure, convert to WebP first and compare the result. Then decide whether to keep JPG/PNG for compatibility or try AVIF for extra compression.',
          },
        ],
      },
    },
  },
  {
    slug: 'convert-images-to-webp',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: '如何把图片转换成 WebP？JPG、PNG、GIF 转 WebP 完整教程',
        excerpt: 'WebP 通常能在较小体积下保持不错画质，也支持透明背景，适合网页图片、缩略图和批量图片优化。',
        metaTitle: '如何把图片转换成 WebP？JPG/PNG/GIF 转 WebP 教程',
        metaDescription: '介绍 JPG、PNG、GIF、SVG、AVIF 等图片如何转换成 WebP，解释 WebP 的优势、透明背景、质量参数、批量转换和 ToolGarden 在线转换方法。',
        readingTime: '约 7 分钟阅读',
        tags: ['WebP', '图片转 WebP', 'JPG 转 WebP', 'PNG 转 WebP'],
        relatedTools: [
          {
            label: '图片转 WebP',
            href: '/image/to-webp',
            description: '在浏览器本地把 JPG、PNG、GIF、BMP、SVG、AVIF 等图片转换为 WebP。',
          },
          {
            label: '图片压缩',
            href: '/image/compress',
            description: '智能压缩 JPG、PNG、WebP 等图片，支持预览对比和批量下载。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '如果你在优化网页加载速度，WebP 往往是最值得尝试的图片格式之一。它通常比 JPG 更小，又比 PNG 更适合网页大图，还能保留透明背景。',
          },
          {
            type: 'paragraph',
            text: '把 JPG、PNG、GIF 或 SVG 转成 WebP，并不只是换一个扩展名。真正的转换需要先解码源图，再重新编码成 image/webp，同时根据质量参数控制文件大小和画质。',
          },
          { type: 'heading', level: 2, text: 'WebP 适合哪些图片？' },
          {
            type: 'list',
            items: [
              '网页配图：博客封面、文章插图、商品图片通常能明显减小体积。',
              '缩略图：列表页和图库缩略图很适合批量转 WebP。',
              '透明素材：WebP 支持 Alpha 透明通道，可以替代部分 PNG。',
              '移动端图片：更小的体积能减少加载时间和流量消耗。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候不一定要转 WebP？' },
          {
            type: 'paragraph',
            text: 'WebP 很实用，但不是所有图片都必须转换。比如极小的 PNG 图标、已经高度压缩的小图片，或者需要兼容非常旧平台的图片，转成 WebP 后收益可能不明显。',
          },
          {
            type: 'table',
            headers: ['源格式', '转 WebP 的效果', '注意事项'],
            rows: [
              ['JPG', '通常能减小体积', '质量参数太低会损失细节'],
              ['PNG', '照片类 PNG 收益明显', '截图和文字图要检查边缘清晰度'],
              ['GIF', '静态图可转换', '动画 GIF 是否保留动画取决于工具实现'],
              ['SVG', '会栅格化为位图', '矢量可编辑性会丢失'],
              ['AVIF', '不一定更小', 'AVIF 通常已经很高效，转 WebP 多用于兼容'],
            ],
          },
          { type: 'heading', level: 2, text: '技术实现：WebP 转换过程是什么？' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片转 WebP 工具完全在浏览器本地运行。它会读取源文件，使用浏览器解码图片，再将图像绘制到 Canvas，最后通过 Canvas 导出 image/webp。',
          },
          {
            type: 'list',
            items: [
              '文件读取：支持 JPG、PNG、WebP、GIF、BMP、SVG、AVIF 等浏览器可解码格式。',
              '尺寸校验：空文件、过大文件和像素数过高的图片会被拦截，避免浏览器卡死。',
              'SVG 处理：SVG 会先按实际尺寸渲染成位图，再输出 WebP。',
              'Canvas 重绘：使用 drawImage 绘制源图，并启用高质量平滑。',
              '质量控制：WebP 支持质量参数，数值越低，文件越小，但细节损失越明显。',
              '输出校验：导出后会检查 Blob 类型和 WebP 文件签名，确认浏览器真的生成了 WebP。',
              '批量下载：多张图片转换完成后，可以打包成 ZIP 下载。',
            ],
          },
          { type: 'heading', level: 2, text: '用 toolgarden.xyz 转 WebP 的步骤' },
          {
            type: 'list',
            ordered: true,
            items: [
              '打开 ToolGarden 的图片转 WebP 工具。',
              '上传一张或多张 JPG、PNG、GIF、SVG、AVIF 图片。',
              '根据画质需求调整质量滑块，通常可以先从 85 到 90 开始。',
              '查看输出文件大小和预览效果。',
              '单张下载，或把所有结果打包成 ZIP 下载。',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz 图片转 WebP',
            text: 'ToolGarden 会在浏览器本地完成 WebP 转换、预览和 ZIP 打包。图片不会上传到服务器，适合处理网页素材、产品图和批量缩略图。',
            href: '/image/to-webp',
            linkLabel: '打开图片转 WebP',
          },
          { type: 'heading', level: 2, text: '推荐质量参数' },
          {
            type: 'table',
            headers: ['图片类型', '建议质量', '说明'],
            rows: [
              ['照片和商品图', '80-90', '通常能兼顾清晰度和体积'],
              ['网页缩略图', '70-85', '尺寸较小时可以适度降低质量'],
              ['截图和文字图', '90-100', '保护文字边缘，或保留 PNG'],
              ['透明 logo', '90 以上', '避免边缘变糊或出现色块'],
            ],
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'WebP 是现代网页图片优化的常用格式，适合照片、商品图、缩略图和部分透明素材。转换时重点关注质量参数和预览效果，不要只看文件大小。',
          },
          {
            type: 'paragraph',
            text: '如果你想快速优化网页图片，可以先用 toolgarden.xyz 批量转 WebP，再对比原图和输出体积，保留视觉效果最稳定的版本。',
          },
        ],
      },
      en: {
        title: 'How to Convert Images to WebP: JPG, PNG, and GIF to WebP Guide',
        excerpt: 'WebP often keeps good visual quality at smaller file sizes, supports transparency, and works well for web images, thumbnails, and batch optimization.',
        metaTitle: 'How to Convert Images to WebP: JPG/PNG/GIF to WebP Guide',
        metaDescription: 'Learn how to convert JPG, PNG, GIF, SVG, AVIF, and other images to WebP, how WebP quality works, when to use it, and how to convert with ToolGarden.',
        readingTime: '7 min read',
        tags: ['WebP', 'image to WebP', 'JPG to WebP', 'PNG to WebP'],
        relatedTools: [
          {
            label: 'Image to WebP',
            href: '/image/to-webp',
            description: 'Convert JPG, PNG, GIF, BMP, SVG, AVIF, and other images to WebP locally in your browser.',
          },
          {
            label: 'Image Compressor',
            href: '/image/compress',
            description: 'Compress JPG, PNG, WebP, and other images with preview comparison and batch download.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'If you are optimizing website speed, WebP is one of the first formats worth trying. It is often smaller than JPG, more web-friendly than PNG for photos, and it can preserve transparency.',
          },
          {
            type: 'paragraph',
            text: 'Converting JPG, PNG, GIF, or SVG to WebP is not just changing the file extension. The image must be decoded, rendered, and encoded again as image/webp with a quality setting that controls size and visual detail.',
          },
          { type: 'heading', level: 2, text: 'Which images are good WebP candidates?' },
          {
            type: 'list',
            items: [
              'Website images: blog covers, article images, and product images often become smaller.',
              'Thumbnails: galleries and listing pages are good batch conversion targets.',
              'Transparent assets: WebP supports alpha and can replace some PNG files.',
              'Mobile images: smaller files reduce loading time and bandwidth usage.',
            ],
          },
          { type: 'heading', level: 2, text: 'When WebP may not help much' },
          {
            type: 'paragraph',
            text: 'WebP is useful, but not every image needs conversion. Tiny PNG icons, already compressed small images, or assets that must support very old platforms may not benefit much.',
          },
          {
            type: 'table',
            headers: ['Source format', 'WebP result', 'Notes'],
            rows: [
              ['JPG', 'Often smaller', 'Low quality can lose detail'],
              ['PNG', 'Strong gains for photo-like PNGs', 'Check text and screenshot edges'],
              ['GIF', 'Static conversion is possible', 'Animation support depends on the tool workflow'],
              ['SVG', 'Rasterized to bitmap', 'Vector editability is lost'],
              ['AVIF', 'May not be smaller', 'AVIF is already efficient; WebP can be a compatibility fallback'],
            ],
          },
          { type: 'heading', level: 2, text: 'Technical workflow: how WebP conversion works' },
          {
            type: 'paragraph',
            text: 'ToolGarden Image to WebP runs locally in the browser. It reads the source file, decodes it with browser image APIs, draws it to Canvas, and exports image/webp.',
          },
          {
            type: 'list',
            items: [
              'File input: JPG, PNG, WebP, GIF, BMP, SVG, AVIF, and other browser-decodable images are accepted.',
              'Safety checks: empty files, oversized files, and excessive pixel counts are rejected before conversion.',
              'SVG handling: SVG is rendered at its resolved size before being encoded as WebP.',
              'Canvas rendering: drawImage renders the source with high-quality smoothing.',
              'Quality control: WebP supports a quality value; lower values reduce size but can lose detail.',
              'Output validation: the tool checks Blob type and WebP file signature to confirm the browser produced a real WebP.',
              'Batch download: multiple converted files can be bundled into a ZIP archive.',
            ],
          },
          { type: 'heading', level: 2, text: 'Convert to WebP with toolgarden.xyz' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open the ToolGarden Image to WebP tool.',
              'Upload one or more JPG, PNG, GIF, SVG, or AVIF images.',
              'Adjust the quality slider. Starting around 85 to 90 is usually safe.',
              'Compare output size and preview quality.',
              'Download one result or export all converted files as a ZIP.',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz Image to WebP',
            text: 'ToolGarden converts, previews, and ZIP-packages WebP files locally in the browser. Images are not uploaded to a server, which is useful for web assets, product images, and batch thumbnails.',
            href: '/image/to-webp',
            linkLabel: 'Open Image to WebP',
          },
          { type: 'heading', level: 2, text: 'Recommended quality settings' },
          {
            type: 'table',
            headers: ['Image type', 'Suggested quality', 'Why'],
            rows: [
              ['Photos and product images', '80-90', 'Usually balances clarity and size'],
              ['Web thumbnails', '70-85', 'Small display sizes can tolerate more compression'],
              ['Screenshots and text images', '90-100', 'Protects text edges, or keep PNG'],
              ['Transparent logos', '90+', 'Reduces soft edges and block artifacts'],
            ],
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'WebP is a strong modern format for website optimization, especially for photos, product images, thumbnails, and some transparent assets. Watch the quality setting and preview, not only the file size.',
          },
          {
            type: 'paragraph',
            text: 'A practical workflow is to batch convert images to WebP with toolgarden.xyz, compare size and visual quality, then keep the output that remains visually stable.',
          },
        ],
      },
    },
  },
  {
    slug: 'convert-images-to-avif',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: '如何把图片转换成 AVIF？什么时候应该使用 AVIF',
        excerpt: 'AVIF 通常能比 JPG 和 WebP 更小，但编码更慢、兼容性更需要确认。适合网页首图、封面图和需要强压缩的图片资产。',
        metaTitle: '如何把图片转换成 AVIF？JPG/PNG/WebP 转 AVIF 教程',
        metaDescription: '介绍 JPG、PNG、WebP、SVG 等图片如何转换成 AVIF，解释 AVIF 的优势、浏览器限制、质量参数、透明背景和 ToolGarden 在线转换方法。',
        readingTime: '约 7 分钟阅读',
        tags: ['AVIF', '图片转 AVIF', 'WebP vs AVIF', '图片优化'],
        relatedTools: [
          {
            label: '图片转 AVIF',
            href: '/image/to-avif',
            description: '在浏览器本地把 JPG、PNG、WebP、GIF、BMP、SVG 等图片转换为 AVIF。',
          },
          {
            label: '图片转 WebP',
            href: '/image/to-webp',
            description: '在需要更稳兼容性时，把图片转换成 WebP 作为 AVIF 的备用格式。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'AVIF 是一种高压缩效率的现代图片格式。很多时候，它能在接近相同视觉质量下，比 JPG 和 WebP 生成更小的文件。',
          },
          {
            type: 'paragraph',
            text: '不过 AVIF 不是“无脑替换所有图片”的格式。它更适合体积敏感的网页大图、封面图和缩略图；如果需要极致兼容性，仍然要准备 WebP 或 JPG 备用。',
          },
          { type: 'heading', level: 2, text: 'AVIF 适合什么场景？' },
          {
            type: 'list',
            items: [
              '网页首图和封面图：大图体积下降对加载速度影响明显。',
              '图库缩略图：大量图片同时加载时，AVIF 的体积优势更明显。',
              '照片类内容：自然纹理和渐变通常能获得不错压缩效果。',
              '需要支持透明的现代网页图片：AVIF 可以保留 Alpha 通道。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候不建议只用 AVIF？' },
          {
            type: 'paragraph',
            text: 'AVIF 的压缩率很强，但编码更慢，某些浏览器或平台的支持仍然可能有限。如果目标用户环境复杂，建议同时提供 WebP 或 JPG fallback。',
          },
          {
            type: 'table',
            headers: ['问题', '影响', '建议'],
            rows: [
              ['编码较慢', '批量转换可能耗时更长', '先转换关键大图，不必所有小图都转'],
              ['浏览器依赖', '不支持时无法导出或显示', '准备 WebP/JPG 备用'],
              ['细文字截图', '低质量可能出现边缘损失', '提高质量或保留 PNG'],
              ['小图标', '收益可能不明显', '继续使用 PNG/SVG/WebP'],
            ],
          },
          { type: 'heading', level: 2, text: '技术实现：AVIF 是怎么在浏览器里生成的？' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片转 AVIF 工具会先把源图片解码到 Canvas，再读取像素数据交给浏览器端 AVIF 编码器生成 image/avif 文件。整个过程在本地完成，不上传图片。',
          },
          {
            type: 'list',
            items: [
              '源图解码：支持 JPG、PNG、WebP、GIF、BMP、SVG 等浏览器可解码输入。',
              'SVG 栅格化：如果源图是 SVG，会先渲染成目标尺寸位图。',
              'Canvas 像素读取：通过 getImageData 读取 RGBA 像素数据。',
              'AVIF 编码：使用浏览器端 AVIF 编码模块，把像素数据编码为 AVIF 字节。',
              '质量参数：质量滑块会映射为编码器质量值，影响体积和细节。',
              'Alpha 处理：编码参数会保留透明信息，适合透明图片场景。',
              '文件校验：导出后检查 AVIF 文件签名，确认结果是真正的 image/avif。',
            ],
          },
          { type: 'heading', level: 2, text: '用 toolgarden.xyz 转 AVIF 的步骤' },
          {
            type: 'list',
            ordered: true,
            items: [
              '打开 ToolGarden 的图片转 AVIF 工具。',
              '上传 JPG、PNG、WebP、SVG 或其他支持的图片。',
              '从默认质量开始转换，如果体积仍然偏大，再逐步降低质量。',
              '对比预览，重点检查人脸、文字、暗部和渐变区域。',
              '下载 AVIF 文件，或批量打包成 ZIP。',
              '上线网页时，建议同时准备 WebP 或 JPG fallback。',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz 图片转 AVIF',
            text: 'ToolGarden 在浏览器本地完成 AVIF 编码、预览和批量下载。适合把网页大图、封面图、产品图转换成更小的现代格式。',
            href: '/image/to-avif',
            linkLabel: '打开图片转 AVIF',
          },
          { type: 'heading', level: 2, text: 'AVIF 和 WebP 怎么选？' },
          {
            type: 'table',
            headers: ['目标', '优先选择', '说明'],
            rows: [
              ['最大压缩率', 'AVIF', '通常更小，但编码更慢'],
              ['兼容性更稳', 'WebP', '现代网页支持广泛'],
              ['照片大图', 'AVIF 或 WebP', '都可以尝试，按预览和体积决定'],
              ['透明素材', 'WebP 或 AVIF', '都支持透明，但需要检查平台支持'],
              ['旧平台兼容', 'JPG/PNG', '作为 fallback 更稳'],
            ],
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'AVIF 适合追求更小文件体积的现代网页图片，尤其是首图、封面图和大量缩略图。它的缺点是编码更慢，并且兼容性需要确认。',
          },
          {
            type: 'paragraph',
            text: '实际项目里，可以用 toolgarden.xyz 先把几张关键图片转成 AVIF，与 WebP/JPG 对比后再决定是否批量使用。',
          },
        ],
      },
      en: {
        title: 'How to Convert Images to AVIF and When You Should Use AVIF',
        excerpt: 'AVIF can be smaller than JPG and WebP, but encoding is slower and compatibility should be checked. It is best for hero images, cover images, and highly compressed web assets.',
        metaTitle: 'How to Convert Images to AVIF: JPG/PNG/WebP to AVIF Guide',
        metaDescription: 'Learn how to convert JPG, PNG, WebP, SVG, and other images to AVIF, how AVIF quality works, browser limits, transparency support, and ToolGarden conversion workflow.',
        readingTime: '7 min read',
        tags: ['AVIF', 'image to AVIF', 'WebP vs AVIF', 'image optimization'],
        relatedTools: [
          {
            label: 'Image to AVIF',
            href: '/image/to-avif',
            description: 'Convert JPG, PNG, WebP, GIF, BMP, SVG, and other images to AVIF locally in your browser.',
          },
          {
            label: 'Image to WebP',
            href: '/image/to-webp',
            description: 'Convert images to WebP when you need a more widely compatible fallback for AVIF.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'AVIF is a modern image format with strong compression efficiency. In many cases, it can produce smaller files than JPG or WebP at similar visual quality.',
          },
          {
            type: 'paragraph',
            text: 'That does not mean every image should become AVIF. It is most useful for file-size-sensitive hero images, cover images, and thumbnails. If broad compatibility matters, keep WebP or JPG fallbacks.',
          },
          { type: 'heading', level: 2, text: 'Where AVIF works well' },
          {
            type: 'list',
            items: [
              'Hero images and cover images: large files benefit most from size reduction.',
              'Gallery thumbnails: the size advantage adds up when many images load together.',
              'Photo-like content: natural texture and gradients often compress well.',
              'Modern transparent web images: AVIF can preserve alpha transparency.',
            ],
          },
          { type: 'heading', level: 2, text: 'When not to rely only on AVIF' },
          {
            type: 'paragraph',
            text: 'AVIF compresses well, but encoding can be slower and support varies by environment. If your audience uses many platforms, provide WebP or JPG fallback files.',
          },
          {
            type: 'table',
            headers: ['Issue', 'Impact', 'Suggestion'],
            rows: [
              ['Slower encoding', 'Batch conversion can take longer', 'Convert key large images first'],
              ['Browser dependency', 'Unsupported environments may fail to export or display', 'Prepare WebP/JPG fallback'],
              ['Text-heavy screenshots', 'Low quality can harm edges', 'Raise quality or keep PNG'],
              ['Tiny icons', 'Benefits may be small', 'Keep PNG/SVG/WebP'],
            ],
          },
          { type: 'heading', level: 2, text: 'Technical workflow: how AVIF is generated in the browser' },
          {
            type: 'paragraph',
            text: 'ToolGarden Image to AVIF decodes the source image into Canvas, reads pixel data, and passes it to a browser-side AVIF encoder to produce image/avif output. The image is not uploaded.',
          },
          {
            type: 'list',
            items: [
              'Source decoding: JPG, PNG, WebP, GIF, BMP, SVG, and other browser-decodable images are supported.',
              'SVG rasterization: SVG sources are rendered to a target bitmap size first.',
              'Canvas pixel read: getImageData extracts RGBA pixel data from the Canvas.',
              'AVIF encoding: a browser-side AVIF module encodes the pixel buffer into AVIF bytes.',
              'Quality value: the quality slider maps to the encoder quality setting and changes size/detail tradeoff.',
              'Alpha handling: encoder settings preserve transparency for images with alpha.',
              'File validation: the output signature is checked to confirm a real image/avif file.',
            ],
          },
          { type: 'heading', level: 2, text: 'Convert to AVIF with toolgarden.xyz' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open the ToolGarden Image to AVIF tool.',
              'Upload JPG, PNG, WebP, SVG, or another supported image.',
              'Start from the default quality and lower it gradually only if the file is still too large.',
              'Compare the preview, especially faces, text, shadows, and gradients.',
              'Download the AVIF file or export all results as a ZIP.',
              'For production websites, prepare WebP or JPG fallback files too.',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz Image to AVIF',
            text: 'ToolGarden performs AVIF encoding, preview, and batch download locally in the browser. It is useful for turning hero images, cover images, and product images into smaller modern assets.',
            href: '/image/to-avif',
            linkLabel: 'Open Image to AVIF',
          },
          { type: 'heading', level: 2, text: 'AVIF or WebP?' },
          {
            type: 'table',
            headers: ['Goal', 'Prefer', 'Why'],
            rows: [
              ['Maximum compression', 'AVIF', 'Often smaller, but slower to encode'],
              ['Reliable modern compatibility', 'WebP', 'Widely supported on modern web platforms'],
              ['Large photos', 'AVIF or WebP', 'Try both and compare size and preview'],
              ['Transparent assets', 'WebP or AVIF', 'Both can preserve alpha, but platform support matters'],
              ['Old platform support', 'JPG/PNG', 'More reliable as fallback formats'],
            ],
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'AVIF is best for modern web images where smaller file size matters, especially hero images, cover images, and large thumbnail sets. Its tradeoffs are slower encoding and compatibility checks.',
          },
          {
            type: 'paragraph',
            text: 'A good workflow is to convert a few key images to AVIF with toolgarden.xyz, compare them with WebP and JPG, then decide whether AVIF is worth using broadly.',
          },
        ],
      },
    },
  },
  {
    slug: 'png-to-jpg-jpg-to-png-transparency',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: 'PNG 转 JPG、JPG 转 PNG 会发生什么？透明背景和画质怎么处理',
        excerpt: 'PNG 和 JPG 的差异不只是扩展名。PNG 支持透明和无损压缩，JPG 适合照片但不支持透明背景。',
        metaTitle: 'PNG 转 JPG、JPG 转 PNG 会发生什么？透明背景和画质说明',
        metaDescription: '解释 PNG 转 JPG、JPG 转 PNG 时透明背景、文件体积、画质和压缩方式会发生什么，并介绍如何用 ToolGarden 转换 JPG 和 PNG。',
        readingTime: '约 7 分钟阅读',
        tags: ['PNG 转 JPG', 'JPG 转 PNG', '透明背景', '图片格式转换'],
        relatedTools: [
          {
            label: '图片转 JPG',
            href: '/image/to-jpg',
            description: '把 PNG、WebP、SVG、AVIF 等图片转换为 JPG，可调整质量参数。',
          },
          {
            label: '图片转 PNG',
            href: '/image/to-png',
            description: '把 JPG、WebP、SVG、AVIF 等图片转换为 PNG，适合透明图和截图。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '很多人会把 PNG 和 JPG 当成两种“图片后缀”，需要时互相转换。但 PNG 转 JPG、JPG 转 PNG 之后，透明背景、文件大小和画质都会发生变化。',
          },
          {
            type: 'paragraph',
            text: '理解这两个格式的差异，可以避免常见问题：为什么透明背景变白了？为什么 JPG 转 PNG 后文件变大了？为什么截图转 JPG 后文字变糊了？',
          },
          { type: 'heading', level: 2, text: 'PNG 和 JPG 的核心区别' },
          {
            type: 'table',
            headers: ['对比项', 'PNG', 'JPG'],
            rows: [
              ['压缩方式', '无损压缩', '有损压缩'],
              ['透明背景', '支持 Alpha 透明通道', '不支持透明'],
              ['适合内容', '截图、图标、文字、透明 logo', '照片、商品图、自然场景'],
              ['文件体积', '照片类图片通常较大', '照片类图片通常更小'],
              ['画质风险', '基本保留原始像素', '质量过低会出现模糊和色块'],
            ],
          },
          { type: 'heading', level: 2, text: 'PNG 转 JPG 会发生什么？' },
          {
            type: 'paragraph',
            text: 'PNG 转 JPG 时，最重要的变化是透明背景会消失。因为 JPG 没有 Alpha 通道，透明像素必须被填充成某种颜色。ToolGarden 默认会把透明区域填充为白色。',
          },
          {
            type: 'list',
            items: [
              '透明背景会变成白色背景。',
              '文件体积通常会变小，尤其是照片类 PNG。',
              '质量参数会影响细节，质量越低体积越小，但越容易糊。',
              '截图、二维码、文字图片转 JPG 后，边缘可能出现噪点或压缩块。',
            ],
          },
          { type: 'heading', level: 2, text: 'JPG 转 PNG 会发生什么？' },
          {
            type: 'paragraph',
            text: 'JPG 转 PNG 不会恢复已经丢失的细节，也不会自动生成透明背景。它只是把当前 JPG 像素重新保存为 PNG。因为 PNG 是无损压缩，照片类 JPG 转 PNG 后文件经常会变大。',
          },
          {
            type: 'list',
            items: [
              '不会恢复 JPG 压缩时丢失的画质。',
              '不会自动抠出透明背景。',
              '文件体积可能明显变大。',
              '适合需要继续编辑、避免再次有损压缩的场景。',
            ],
          },
          { type: 'heading', level: 2, text: '技术实现：ToolGarden 怎么处理 JPG 和 PNG 转换？' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片转 JPG 和图片转 PNG 工具都在浏览器本地运行。源图会被解码到 Canvas，再根据目标格式导出。',
          },
          {
            type: 'list',
            items: [
              '本地读取：图片文件通过浏览器解码，不上传到服务器。',
              '格式识别：根据 MIME 类型和扩展名识别 JPG、PNG、WebP、GIF、BMP、SVG、AVIF 等输入。',
              'Canvas 重绘：源图会被绘制到同尺寸 Canvas，保留原始宽高。',
              '转 JPG：透明区域会先填充为白色，工具会先用白色填充画布背景，再绘制图片，避免透明像素变成黑色或不可控颜色。',
              'JPG 质量：使用 image/jpeg 导出时传入质量参数，控制文件体积和画质。',
              '转 PNG：使用 image/png 导出，不使用质量滑块，并尽量保留透明通道。',
              '输出校验：导出后检查 JPG 或 PNG 文件签名，确认浏览器实际生成了目标格式。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候 PNG 转 JPG？什么时候 JPG 转 PNG？' },
          {
            type: 'table',
            headers: ['需求', '建议', '原因'],
            rows: [
              ['照片体积太大', 'PNG 转 JPG 或 WebP', '照片适合有损压缩，文件会小很多'],
              ['透明 logo', '不要转 JPG', 'JPG 会丢失透明背景'],
              ['截图要保持文字清晰', '保留 PNG 或高质量 WebP', 'JPG 容易让文字边缘发糊'],
              ['JPG 需要继续编辑', '可转 PNG', '避免多次 JPG 有损保存'],
              ['上传平台只接受 JPG', 'PNG 转 JPG', '接受透明变白或先换背景色'],
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz JPG / PNG 转换',
            text: 'ToolGarden 提供图片转 JPG 和图片转 PNG 工具。你可以上传多张图片，调整 JPG 质量，预览输出结果，并批量下载 ZIP。所有转换都在浏览器本地完成。',
            href: '/image/to-jpg',
            linkLabel: '打开图片转 JPG',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: 'PNG 转 JPG 适合压缩照片类图片，但会丢失透明背景；JPG 转 PNG 适合后续编辑和无损保存，但不会让画质变好，也可能让文件变大。',
          },
          {
            type: 'paragraph',
            text: '转换前先判断图片内容：照片用 JPG/WebP，截图和透明素材用 PNG/WebP。格式选对，才不会在体积和清晰度之间反复踩坑。',
          },
        ],
      },
      en: {
        title: 'What Happens When You Convert PNG to JPG or JPG to PNG?',
        excerpt: 'PNG and JPG differ in more than file extensions. PNG supports transparency and lossless compression, while JPG is better for photos but does not support alpha.',
        metaTitle: 'PNG to JPG and JPG to PNG: Transparency, Quality, and File Size',
        metaDescription: 'Learn what happens when converting PNG to JPG or JPG to PNG, including transparency loss, file size changes, quality settings, and ToolGarden conversion workflow.',
        readingTime: '7 min read',
        tags: ['PNG to JPG', 'JPG to PNG', 'transparency', 'image conversion'],
        relatedTools: [
          {
            label: 'Image to JPG',
            href: '/image/to-jpg',
            description: 'Convert PNG, WebP, SVG, AVIF, and other images to JPG with adjustable quality.',
          },
          {
            label: 'Image to PNG',
            href: '/image/to-png',
            description: 'Convert JPG, WebP, SVG, AVIF, and other images to PNG for transparency and sharp edges.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'PNG and JPG are often treated as simple file extensions, but converting between them changes transparency, file size, and sometimes visual quality.',
          },
          {
            type: 'paragraph',
            text: 'Knowing the difference helps explain common surprises: why did the transparent background turn white, why did JPG to PNG become larger, and why did screenshot text look worse after JPG conversion?',
          },
          { type: 'heading', level: 2, text: 'PNG vs JPG basics' },
          {
            type: 'table',
            headers: ['Factor', 'PNG', 'JPG'],
            rows: [
              ['Compression', 'Lossless', 'Lossy'],
              ['Transparency', 'Supports alpha', 'No transparency'],
              ['Best for', 'Screenshots, icons, text, transparent logos', 'Photos, product images, natural scenes'],
              ['File size', 'Often large for photos', 'Often smaller for photos'],
              ['Quality risk', 'Preserves pixels closely', 'Low quality can create blur and blocks'],
            ],
          },
          { type: 'heading', level: 2, text: 'What happens when PNG becomes JPG?' },
          {
            type: 'paragraph',
            text: 'The biggest change is that transparency disappears. JPG has no alpha channel, so transparent pixels must be filled with a color. ToolGarden fills transparent areas with white by default.',
          },
          {
            type: 'list',
            items: [
              'Transparent backgrounds become white backgrounds.',
              'File size often becomes smaller, especially for photo-like PNG files.',
              'Quality controls affect detail: lower quality means smaller files but more visible loss.',
              'Screenshots, QR codes, and text images can develop noisy or blocky edges.',
            ],
          },
          { type: 'heading', level: 2, text: 'What happens when JPG becomes PNG?' },
          {
            type: 'paragraph',
            text: 'JPG to PNG does not restore detail that JPG compression already removed, and it does not magically create transparency. It simply saves the current pixels as PNG. Because PNG is lossless, photo-like JPG files often become larger.',
          },
          {
            type: 'list',
            items: [
              'Lost JPG detail does not come back.',
              'The background does not become transparent automatically.',
              'File size can become much larger.',
              'It can be useful before editing, to avoid another lossy JPG save.',
            ],
          },
          { type: 'heading', level: 2, text: 'Technical workflow: how ToolGarden handles JPG and PNG conversion' },
          {
            type: 'paragraph',
            text: 'ToolGarden Image to JPG and Image to PNG both run locally in the browser. The source image is decoded to Canvas and then exported in the target format.',
          },
          {
            type: 'list',
            items: [
              'Local loading: image files are decoded by the browser and are not uploaded.',
              'Format detection: MIME type and extension identify JPG, PNG, WebP, GIF, BMP, SVG, AVIF, and similar inputs.',
              'Canvas redraw: the source is drawn to a same-size Canvas, preserving dimensions.',
              'JPG conversion: the Canvas is filled with white first, then the image is drawn so transparent pixels have a predictable background.',
              'JPG quality: image/jpeg export receives a quality value to balance size and visual detail.',
              'PNG conversion: image/png export does not use a quality slider and can preserve alpha.',
              'Output validation: JPG or PNG signatures are checked after export to confirm the target format.',
            ],
          },
          { type: 'heading', level: 2, text: 'When should you convert PNG to JPG or JPG to PNG?' },
          {
            type: 'table',
            headers: ['Need', 'Recommendation', 'Reason'],
            rows: [
              ['Photo file is too large', 'Convert PNG to JPG or WebP', 'Photos compress well with lossy formats'],
              ['Transparent logo', 'Do not convert to JPG', 'JPG removes transparency'],
              ['Screenshot text must stay sharp', 'Keep PNG or use high-quality WebP', 'JPG can soften text edges'],
              ['JPG needs more editing', 'Convert to PNG if needed', 'Avoid repeated lossy JPG saves'],
              ['Platform only accepts JPG', 'Convert PNG to JPG', 'Accept white background or choose a background color first'],
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz JPG / PNG Conversion',
            text: 'ToolGarden provides Image to JPG and Image to PNG tools. Upload multiple images, adjust JPG quality, preview results, and download a ZIP batch. All conversion runs locally in your browser.',
            href: '/image/to-jpg',
            linkLabel: 'Open Image to JPG',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'PNG to JPG is useful for compressing photo-like images, but it removes transparency. JPG to PNG can be useful before editing, but it does not improve already-lost quality and can make files larger.',
          },
          {
            type: 'paragraph',
            text: 'Choose based on content: JPG or WebP for photos, PNG or WebP for screenshots and transparent assets. The right format prevents repeated quality and file-size surprises.',
          },
        ],
      },
    },
  },
  {
    slug: 'why-json-can-have-comments',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-01',
    translations: {
      zh: {
        title: '为什么有的 JSON 可以带注释？',
        excerpt: 'tsconfig.json、settings.json 和 launch.json 看起来像 JSON，却能写注释。原因是它们通常使用 JSONC，而不是严格标准 JSON。',
        metaTitle: '为什么有的 JSON 可以带注释？JSON、JSONC 和 JSON5 区别',
        metaDescription: '解释为什么 tsconfig.json、VS Code settings.json 等文件可以写注释，梳理标准 JSON、JSONC、JSON5 的区别，并介绍如何把 JSONC 转成标准 JSON。',
        readingTime: '约 6 分钟阅读',
        tags: ['JSON', 'JSONC', 'JSON5', 'TypeScript'],
        relatedTools: [
          {
            label: 'JSON 修复 / 清理',
            href: '/json-repair',
            description: '移除注释、尾随逗号等常见问题，并输出标准 JSON。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '格式化、压缩并检查 JSON 内容，适合日常调试。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '如果你写过 TypeScript，应该对下面这个文件再熟悉不过了：',
          },
          { type: 'code', language: 'json', code: tsconfigSnippet },
          { type: 'paragraph', text: '等等……' },
          { type: 'paragraph', text: 'JSON 不是不能写注释吗？' },
          {
            type: 'paragraph',
            text: '按照 JSON 标准，下面这样的写法其实都是非法的：',
          },
          { type: 'code', language: 'json', code: invalidCommentSnippetZh },
          {
            type: 'paragraph',
            text: '可为什么 tsconfig.json、settings.json、launch.json 等配置文件却可以愉快地写注释？今天就聊聊背后的原因。',
          },
          { type: 'heading', level: 2, text: 'JSON 为什么不能有注释？' },
          {
            type: 'paragraph',
            text: 'JSON（JavaScript Object Notation）最初的目标就是数据交换格式。',
          },
          { type: 'quote', text: '简单、统一、容易解析。' },
          {
            type: 'paragraph',
            text: '因此官方 JSON 规范（RFC 8259）里并没有注释。标准 JSON 只允许这些元素：',
          },
          {
            type: 'list',
            items: ['对象（Object）', '数组（Array）', '字符串', '数字', 'Boolean', 'null'],
          },
          {
            type: 'paragraph',
            text: '除此之外，注释、尾随逗号、单引号全部都不允许。',
          },
          {
            type: 'paragraph',
            text: '所以像下面这样的文件，标准 JSON 解析器都会直接报错。',
          },
          { type: 'code', language: 'json', code: invalidStandardJsonSnippetZh },
          { type: 'heading', level: 2, text: '那为什么带注释更好？' },
          {
            type: 'paragraph',
            text: '虽然 JSON 不支持注释，但配置文件却特别需要它。',
          },
          { type: 'paragraph', text: '举个例子，没有注释：' },
          { type: 'code', language: 'json', code: noCommentConfig },
          {
            type: 'paragraph',
            text: '对于新人来说：strict 是什么？为什么 target 要写 ES2022？完全不知道。',
          },
          { type: 'paragraph', text: '而有了注释以后：' },
          { type: 'code', language: 'json', code: commentConfigZh },
          {
            type: 'paragraph',
            text: '可读性一下子就提升了。带注释主要有几个好处：',
          },
          {
            type: 'list',
            items: [
              '降低学习成本：配置项可以直接解释用途，不需要频繁查文档。',
              '方便团队协作：告诉其他人为什么这样配置，而不仅仅是配置了什么。',
              '保留上下文：记录一些特殊配置的原因，方便后续维护。',
              '更好的开发体验：很多 IDE 会直接显示注释，阅读配置更加直观。',
            ],
          },
          {
            type: 'paragraph',
            text: '所以，虽然 JSON 不支持注释，但配置文件非常需要注释。',
          },
          { type: 'heading', level: 2, text: 'tsconfig.json 为什么可以写注释？' },
          {
            type: 'paragraph',
            text: '答案其实很简单：因为它并不是严格意义上的 JSON。TypeScript 并没有直接使用标准 JSON 解析器，而是使用了一种扩展格式：JSONC（JSON with Comments）。',
          },
          {
            type: 'paragraph',
            text: 'JSONC 在 JSON 的基础上增加了一些能力：',
          },
          {
            type: 'list',
            items: ['单行注释 //', '多行注释 /* */'],
          },
          { type: 'paragraph', text: '例如：' },
          { type: 'code', language: 'json', code: jsoncSnippetZh },
          {
            type: 'paragraph',
            text: 'TypeScript 编译器会先把注释去掉，再按照普通 JSON 解析。',
          },
          {
            type: 'paragraph',
            text: '所以，虽然文件名叫 tsconfig.json，实际内容更接近 tsconfig.jsonc。只是为了兼容生态，它没有改扩展名而已。',
          },
          { type: 'heading', level: 2, text: '除了 JSONC，还有 JSON5' },
          {
            type: 'paragraph',
            text: '目前最常见的 JSON 扩展主要有两个。',
          },
          { type: 'heading', level: 3, text: '1. JSONC' },
          {
            type: 'paragraph',
            text: 'JSONC 的特点很克制：支持单行注释和多行注释，但不鼓励尾随逗号，整体仍然接近标准 JSON。',
          },
          { type: 'code', language: 'json', code: jsoncShortSnippetZh },
          {
            type: 'paragraph',
            text: '典型使用场景包括 TypeScript 的 tsconfig.json、VS Code 的 settings.json、launch.json，以及 VS Code 插件配置。',
          },
          { type: 'heading', level: 3, text: '2. JSON5' },
          {
            type: 'paragraph',
            text: 'JSON5 比 JSONC 更进一步。除了支持注释，还支持单引号、尾随逗号、对象 key 不加引号、十六进制数字、Infinity 和 NaN。',
          },
          { type: 'code', language: 'json', code: json5Snippet },
          {
            type: 'paragraph',
            text: '是不是越来越像 JavaScript 对象了？很多前端工具都会支持 JSON5，例如 Babel、Next.js 的部分配置，以及各种 Node.js 工具链。',
          },
          { type: 'heading', level: 2, text: '哪些工具支持 JSONC？' },
          {
            type: 'paragraph',
            text: '现在支持 JSONC 的工具已经很多了。可以说，只要是现代前端开发，几乎都会接触到 JSONC。',
          },
          {
            type: 'table',
            headers: ['工具', '是否支持 JSONC'],
            rows: [
              ['TypeScript', '支持'],
              ['VS Code', '支持'],
              ['Visual Studio', '支持'],
              ['Azure 配置', '支持'],
              ['ESLint（部分配置）', '支持'],
              ['Monaco Editor', '支持'],
            ],
          },
          { type: 'heading', level: 2, text: 'JSONC 怎么转换成标准 JSON？' },
          {
            type: 'paragraph',
            text: '如果需要把 JSONC 提交给接口、数据库或者其他只支持标准 JSON 的程序，就需要先去掉注释。',
          },
          { type: 'heading', level: 3, text: '方案一：使用 npm 包' },
          {
            type: 'paragraph',
            text: '例如微软提供的 jsonc-parser，或者 strip-json-comments。它们都可以自动移除注释，再输出标准 JSON。',
          },
          { type: 'code', language: 'bash', code: 'npm install jsonc-parser\nnpm install strip-json-comments' },
          { type: 'heading', level: 3, text: '方案二：在线转换工具' },
          {
            type: 'paragraph',
            text: '如果只是偶尔需要转换，不想安装依赖，直接使用在线工具会更加方便。',
          },
          {
            type: 'callout',
            title: 'ToolGarden',
            text: '可以直接粘贴 JSONC，一键移除注释，输出标准 JSON，然后复制即可使用。对于临时处理配置文件来说非常方便。',
            href: '/json-repair',
            linkLabel: '打开 JSON 修复工具',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '很多人第一次看到 tsconfig.json 能写注释都会觉得奇怪，其实原因很简单：标准 JSON 不允许注释；TypeScript 使用的是 JSONC（JSON with Comments）；JSONC 是为了让配置文件更易读、更易维护；JSON5 则提供了更多 JavaScript 风格的语法扩展。',
          },
          {
            type: 'paragraph',
            text: '对于开发者来说，配置文件带注释几乎已经成为现代工具链的标配。理解 JSON、JSONC 和 JSON5 的区别，也能帮助我们在不同场景下选择合适的数据格式。',
          },
          {
            type: 'paragraph',
            text: '下次再看到 tsconfig.json 里的注释，就不用疑惑了。它其实不是严格意义上的 JSON，而是 JSONC。',
          },
        ],
      },
      en: {
        title: 'Why Can Some JSON Files Have Comments?',
        excerpt: 'tsconfig.json, settings.json, and launch.json look like JSON, yet they accept comments. The reason is JSONC, not strict standard JSON.',
        metaTitle: 'Why Can Some JSON Files Have Comments? JSON vs JSONC vs JSON5',
        metaDescription: 'Learn why tsconfig.json and VS Code settings can contain comments, how JSONC differs from standard JSON and JSON5, and how to convert JSONC to valid JSON.',
        readingTime: '6 min read',
        tags: ['JSON', 'JSONC', 'JSON5', 'TypeScript'],
        relatedTools: [
          {
            label: 'JSON Repair / Clean',
            href: '/json-repair',
            description: 'Remove comments, trailing commas, and other common issues to produce valid JSON.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and inspect JSON while debugging data.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'If you have written TypeScript, this file probably looks very familiar:',
          },
          { type: 'code', language: 'json', code: tsconfigSnippet },
          { type: 'paragraph', text: 'Wait...' },
          { type: 'paragraph', text: 'Isn’t JSON supposed to forbid comments?' },
          {
            type: 'paragraph',
            text: 'According to the JSON standard, examples like these are invalid:',
          },
          { type: 'code', language: 'json', code: invalidCommentSnippetEn },
          {
            type: 'paragraph',
            text: 'So why can configuration files such as tsconfig.json, settings.json, and launch.json use comments without any drama? Let’s unpack the reason.',
          },
          { type: 'heading', level: 2, text: 'Why Does JSON Not Allow Comments?' },
          {
            type: 'paragraph',
            text: 'JSON, short for JavaScript Object Notation, was designed first as a data interchange format.',
          },
          { type: 'quote', text: 'Simple, consistent, and easy to parse.' },
          {
            type: 'paragraph',
            text: 'That is why the official JSON specification, RFC 8259, does not include comments. Standard JSON only allows these values:',
          },
          {
            type: 'list',
            items: ['Object', 'Array', 'String', 'Number', 'Boolean', 'null'],
          },
          {
            type: 'paragraph',
            text: 'Everything else, including comments, trailing commas, and single-quoted strings, is outside the standard.',
          },
          {
            type: 'paragraph',
            text: 'A standard JSON parser will reject a file like this:',
          },
          { type: 'code', language: 'json', code: invalidStandardJsonSnippetEn },
          { type: 'heading', level: 2, text: 'Why Are Comments Useful Anyway?' },
          {
            type: 'paragraph',
            text: 'JSON does not support comments, but configuration files often need them badly.',
          },
          { type: 'paragraph', text: 'Without comments, a config may look like this:' },
          { type: 'code', language: 'json', code: noCommentConfig },
          {
            type: 'paragraph',
            text: 'For someone new to the project, strict may be unclear, and target: ES2022 may raise more questions than it answers.',
          },
          { type: 'paragraph', text: 'With comments, the same intent becomes much easier to read:' },
          { type: 'code', language: 'json', code: commentConfigEn },
          {
            type: 'paragraph',
            text: 'Comments help configuration files in a few practical ways:',
          },
          {
            type: 'list',
            items: [
              'They reduce the learning curve because options can explain themselves.',
              'They help teams communicate why a setting exists, not just what the value is.',
              'They preserve maintenance context for unusual project choices.',
              'They improve the editing experience because many IDEs display and preserve those notes.',
            ],
          },
          {
            type: 'paragraph',
            text: 'So while JSON itself does not support comments, real-world configuration often benefits from them.',
          },
          { type: 'heading', level: 2, text: 'Why Can tsconfig.json Use Comments?' },
          {
            type: 'paragraph',
            text: 'The answer is simple: it is not strict JSON. TypeScript does not feed tsconfig.json directly to a standard JSON parser. It uses an extended format called JSONC, short for JSON with Comments.',
          },
          {
            type: 'paragraph',
            text: 'JSONC adds a small set of features on top of JSON:',
          },
          {
            type: 'list',
            items: ['Single-line comments with //', 'Block comments with /* */'],
          },
          { type: 'paragraph', text: 'For example:' },
          { type: 'code', language: 'json', code: jsoncSnippetEn },
          {
            type: 'paragraph',
            text: 'The TypeScript compiler removes the comments first, then parses the remaining text like ordinary JSON.',
          },
          {
            type: 'paragraph',
            text: 'So even though the filename is tsconfig.json, its contents are closer to tsconfig.jsonc. The .json extension remains mostly for ecosystem compatibility.',
          },
          { type: 'heading', level: 2, text: 'JSONC Is Not the Only Extension: Meet JSON5' },
          {
            type: 'paragraph',
            text: 'The two most common JSON extensions you will see are JSONC and JSON5.',
          },
          { type: 'heading', level: 3, text: '1. JSONC' },
          {
            type: 'paragraph',
            text: 'JSONC is intentionally conservative. It supports line comments and block comments while staying very close to standard JSON. Trailing commas are not encouraged by the core format, even though some implementations may tolerate them.',
          },
          { type: 'code', language: 'json', code: jsoncShortSnippetEn },
          {
            type: 'paragraph',
            text: 'Typical JSONC use cases include TypeScript tsconfig.json, VS Code settings.json, launch.json, and VS Code extension configuration files.',
          },
          { type: 'heading', level: 3, text: '2. JSON5' },
          {
            type: 'paragraph',
            text: 'JSON5 goes further. In addition to comments, it supports single quotes, trailing commas, unquoted object keys, hexadecimal numbers, Infinity, and NaN.',
          },
          { type: 'code', language: 'json', code: json5Snippet },
          {
            type: 'paragraph',
            text: 'At that point, it starts to feel much closer to a JavaScript object literal. Many frontend tools support JSON5, including Babel, parts of the Next.js ecosystem, and various Node.js toolchains.',
          },
          { type: 'heading', level: 2, text: 'Which Tools Support JSONC?' },
          {
            type: 'paragraph',
            text: 'JSONC support is common in modern developer tooling. If you work in frontend development, you will probably touch JSONC sooner or later.',
          },
          {
            type: 'table',
            headers: ['Tool', 'JSONC support'],
            rows: [
              ['TypeScript', 'Yes'],
              ['VS Code', 'Yes'],
              ['Visual Studio', 'Yes'],
              ['Azure configuration', 'Yes'],
              ['ESLint, in some configs', 'Yes'],
              ['Monaco Editor', 'Yes'],
            ],
          },
          { type: 'heading', level: 2, text: 'How Do You Convert JSONC to Standard JSON?' },
          {
            type: 'paragraph',
            text: 'If you need to send JSONC to an API, database, or any program that only accepts standard JSON, you need to strip comments first.',
          },
          { type: 'heading', level: 3, text: 'Option 1: Use an npm package' },
          {
            type: 'paragraph',
            text: 'Microsoft’s jsonc-parser package can handle JSONC, and strip-json-comments can remove comments before you parse or serialize the result.',
          },
          { type: 'code', language: 'bash', code: 'npm install jsonc-parser\nnpm install strip-json-comments' },
          { type: 'heading', level: 3, text: 'Option 2: Use an online tool' },
          {
            type: 'paragraph',
            text: 'If you only need to clean a config file occasionally, an online tool is often faster than adding another dependency.',
          },
          {
            type: 'callout',
            title: 'ToolGarden',
            text: 'Paste JSONC, remove comments with one action, output standard JSON, and copy the result. It is handy for quick configuration cleanup.',
            href: '/json-repair',
            linkLabel: 'Open JSON Repair',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'When people first see comments inside tsconfig.json, it can look strange. The key idea is simple: standard JSON does not allow comments; TypeScript uses JSONC; JSONC makes configuration files easier to read and maintain; JSON5 adds even more JavaScript-style syntax.',
          },
          {
            type: 'paragraph',
            text: 'For developers, comments in configuration files have become normal across modern toolchains. Understanding JSON, JSONC, and JSON5 helps you choose the right format for each situation.',
          },
          {
            type: 'paragraph',
            text: 'The next time you see a comment inside tsconfig.json, you do not need to wonder why. It is not strict JSON. It is JSONC.',
          },
        ],
      },
    },
  },
];

function normalizeBlogLocale(locale: string): BlogLocale {
  return routing.locales.includes(locale as BlogLocale) ? (locale as BlogLocale) : routing.defaultLocale;
}

function toLocalizedArticle(article: BlogArticle, locale: BlogLocale): LocalizedBlogArticle {
  return {
    ...article.translations[locale],
    slug: article.slug,
    path: `${BLOG_INDEX_PATH}/${article.slug}`,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    locale,
  };
}

export function getBlogSlugs(): string[] {
  return blogArticles.map((article) => article.slug);
}

export function getBlogPaths(): string[] {
  return [BLOG_INDEX_PATH, ...getBlogSlugs().map((slug) => `${BLOG_INDEX_PATH}/${slug}`)];
}

export function getLocalizedBlogArticles(locale: string): LocalizedBlogArticle[] {
  const normalizedLocale = normalizeBlogLocale(locale);
  return blogArticles.map((article) => toLocalizedArticle(article, normalizedLocale));
}

export function getLocalizedBlogArticle(slug: string, locale: string): LocalizedBlogArticle | null {
  const article = blogArticles.find((item) => item.slug === slug);
  if (!article) return null;

  return toLocalizedArticle(article, normalizeBlogLocale(locale));
}
