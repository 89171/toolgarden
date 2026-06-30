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
