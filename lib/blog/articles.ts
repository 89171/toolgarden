import { routing } from '@/i18n/routing';
import { audioBlogArticles } from './audio-articles';
import { audioStemGuideArticles } from './audio-stem-guides';
import { implementationEngineeringArticles } from './implementation-engineering-articles';
import { creativeToolEngineeringArticles } from './creative-tool-engineering-articles';
import { topicClusterBlogArticles } from './topic-cluster-articles';
import { growthSeoBlogArticles } from './growth-seo-articles';
import { seoOptimizationGuideArticles } from './seo-optimization-guide-articles';
import {
  blogTopics,
  getBlogTopicByArticleSlug,
  type BlogTopicRole,
} from './topics';
import { workflowSeoBlogArticles } from './workflow-seo-articles';
import { seoBlogArticles } from './seo-articles';
import { longTailBlogArticles } from './long-tail-articles';
import { isConsolidatedBlogSlug } from './consolidations';

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

export interface BlogFaqItem {
  question: string;
  answer: string;
}

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
  faq?: BlogFaqItem[];
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

export interface LocalizedBlogTopic {
  id: string;
  targetKeywords: string[];
  pillar: LocalizedBlogArticle;
  clusters: LocalizedBlogArticle[];
}

export interface LocalizedBlogTopicMembership extends LocalizedBlogTopic {
  role: BlogTopicRole;
  targetKeyword: string | null;
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

const faviconHtmlSnippet = `<link rel="icon" href="/favicon.ico">
<link rel="icon" href="/icon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">`;

export const blogArticles: BlogArticle[] = [
  ...audioBlogArticles,
  ...audioStemGuideArticles,
  ...seoOptimizationGuideArticles,
  ...implementationEngineeringArticles,
  ...creativeToolEngineeringArticles,
  ...topicClusterBlogArticles,
  ...growthSeoBlogArticles,
  ...workflowSeoBlogArticles,
  ...seoBlogArticles,
  ...longTailBlogArticles,
  {
    slug: 'why-image-compression-looks-blurry',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
        faq: [
          {
            question: "为什么把图片压缩后再放大查看会特别糊？",
            answer: "压缩本身通常只损失一部分细节，但如果你同时缩小了图片尺寸，或者以 100% 以上的比例查看，视觉上会明显放大压缩瑕疵。屏幕上每一个物理像素只能显示一个图像像素，缩小过的图被拉大时，浏览器只能通过插值算法猜测中间的像素，边缘、文字和渐变就会出现发虚、锯齿、色块。想避免这个问题，尽量按原始压缩尺寸使用图片，不要事后放大；如果需要更高清版本，回到原图重新压缩，而不是拿已经压缩过的小图放大。",
          },
          {
            question: "同一张图片压缩两次，会比压缩一次糊多少？",
            answer: "如果是 JPG、WebP 等有损格式，第二次压缩会在已经损失过的数据基础上再丢一部分细节。损失并不是线性叠加，但每一次导出都会额外引入压缩块、色带和边缘噪点，重复三四次之后画质通常明显下降。截图、文字类图片最容易发生二次压缩变糊。建议始终保留原图作为唯一压缩来源，需要调整参数时从原图重新导出，而不是把上次的输出继续压。",
          },
          {
            question: "手机拍的照片压缩后色彩变淡是正常的吗？",
            answer: "手机原图通常带有较宽的色域（如 Display P3）和 EXIF 中的色彩配置。很多在线压缩工具在导出时会丢弃或转换配置文件，把颜色映射回 sRGB，观感上就像饱和度降低了。如果颜色偏移让你困扰，检查压缩工具是否保留 ICC 配置，或在导出前手动把图片转为 sRGB，再进行压缩，可以避免不同软件之间的显示差异。这种色彩变化不代表画质下降，只是色彩空间的转换。",
          },
          {
            question: "为什么截图压缩后文字比照片压缩得更明显糊？",
            answer: "截图是硬边内容，每个字符的边缘都是纯色到纯色的高频跳变，正是 JPG、WebP 等有损压缩最不擅长处理的场景。为了减小体积，算法会在边缘周围引入平滑过渡，人眼一眼就能识别成“糊”。相比之下，照片有大量渐变纹理，压缩造成的少量损失不容易被察觉。截图建议保留 PNG，或者使用较高质量（90 以上）的 WebP，避免使用 JPG。",
          },
          {
            question: "压缩后图片看着清楚，但打印出来变模糊，怎么回事？",
            answer: "屏幕显示分辨率通常是 96–150 DPI，而打印一般需要 300 DPI。压缩本身不改变 DPI，但如果压缩时顺便缩小了像素尺寸，比如从 3000px 压到 1200px，打印时每英寸能分配的像素就变少，成品自然变糊。想同时兼顾体积和打印质量，可以保留一份未压缩的高分辨率原图用于打印，另导出一份压缩版用于网页。",
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
        faq: [
          {
            question: "Why does a compressed image look worse when I zoom in on it?",
            answer: "Compression removes detail the algorithm judges to be perceptually redundant, but zooming exposes those approximations. When you view at 200% or more, every artifact — soft edges, color banding, block boundaries — is enlarged along with the image. If you also resized the image smaller during compression, upscaling later forces the browser to invent pixels through interpolation, which compounds the blur. Always use images at or near the pixel dimensions you compressed them at, and re-export from the original when a larger version is needed.",
          },
          {
            question: "How much quality do I lose by compressing the same JPG twice?",
            answer: "Each JPG save discards data based on the current pixels, so a second pass compresses an already-lossy result. Loss is not exactly cumulative, but each round introduces fresh block artifacts, edge halos, and color drift on top of the previous ones. After three or four saves, most people can spot the difference. To avoid stacking damage, keep the original file as the single source of truth and always re-export from it — never edit and re-save a previously compressed JPG when a different quality target is needed.",
          },
          {
            question: "Why do the colors look washed out after I compress a phone photo?",
            answer: "Modern phones capture in wide-gamut color spaces like Display P3 and embed an ICC profile. Many browser-based compressors strip or convert the profile during export, mapping everything back to sRGB. The pixels themselves are fine, but colors that lived outside sRGB get clipped, so the image looks flatter. If this bothers you, either compress in a tool that preserves ICC data, or convert the source to sRGB deliberately before compressing so you see the final look in every viewer.",
          },
          {
            question: "Why does compressing a screenshot blur text more than compressing a photo does?",
            answer: "Screenshots contain hard edges — sharp transitions from one flat color to another. Lossy codecs like JPG and WebP are tuned for natural images and smooth those transitions to save bytes, which reads to the eye as fuzzy text. Photos hide compression better because random noise and gradients absorb the loss. For screenshots, stick with PNG, or use WebP at quality 90 or higher. Do not use JPG for anything with UI, code, or small type.",
          },
          {
            question: "The compressed image looks fine on screen but prints blurry. Why?",
            answer: "Screens are around 96–150 DPI while print usually needs 300 DPI. Compression by itself does not change DPI, but many pipelines also downscale pixel dimensions during the compression step. A photo shrunk from 3000px to 1200px has plenty of pixels for a phone screen and far too few for an A4 print. Keep an uncompressed, full-resolution master for print output and produce a separate compressed copy for the web.",
          },
        ],
      },
    },
  },
  {
    slug: 'compress-image-to-target-size',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
        faq: [
          {
            question: "为什么我把质量拉到最低，图片还是压不到 200KB？",
            answer: "质量参数只是影响文件大小的其中一个因素。当图片像素数量很大、内容复杂、或者格式选择不对时，即使质量拉到 30 也可能压不下去。例如一张 4000x3000 的照片，即使 JPG 质量 30，仍然可能超过 500KB。更有效的做法是先把尺寸缩到实际需要的宽度，再选一个更适合网页的格式（WebP 通常比 JPG 更小），最后再微调质量。多个维度一起降，比单一维度硬压效果更好。",
          },
          {
            question: "压缩到 100KB 以下会不会让照片变得不能用？",
            answer: "取决于图片尺寸和用途。一张 800px 宽的头像压到 100KB 通常还很清晰；但一张 3000px 宽的风景照被硬压到 100KB，会出现明显色块和边缘噪点。想在极小体积下保住画质，先把尺寸缩到目标使用场景需要的最小宽度（比如网页头像 300–500px），再用 WebP 或 AVIF，同时质量控制在 60–75。极端情况下也可以考虑分辨率更低但保留细节的方案，而不是保留大尺寸但降低质量。",
          },
          {
            question: "透明背景的 PNG 压缩到指定大小，应该转成 JPG 吗？",
            answer: "如果透明背景对最终展示是必需的（例如放在有色背景上的 logo），不要转 JPG，因为 JPG 会把透明区域填成白色。更合理的做法是转成 WebP 或 AVIF，二者都保留 Alpha 通道并支持较高压缩率。如果目标平台不支持这些格式，可以保留 PNG 并优化：先用工具减少调色板颜色数量（PNG-8），再检查是否可以缩小尺寸。硬转 JPG 通常意味着牺牲透明背景，只有在背景色确定不变时才可考虑。",
          },
          {
            question: "为什么我把两张一样大的图压到同一质量，结果文件差好几倍？",
            answer: "两张图的像素尺寸相同，不代表它们的“信息量”相同。压缩算法根据画面复杂度决定占用多少字节：纯色背景、平滑渐变、简单几何图形非常好压；而茂密树叶、细密纹理、噪点强的照片则很难压小。所以同样质量 80，一张风景照可能 400KB，另一张人像特写却只有 120KB。想强行让两张图都压到同一目标，需要允许工具对复杂图片降更多质量，或额外缩小它们的像素尺寸。",
          },
          {
            question: "上传时限制是 2MB，我压到 1.9MB 就够了吗？",
            answer: "技术上够了，但不是最佳做法。许多上传平台在服务器端还会再做一次处理，比如生成缩略图或重新压缩，如果你贴着上限提交，最终显示效果可能受二次压缩影响。建议留出 20% 缓冲，把目标定在 1.5–1.6MB 左右；同时优先降低尺寸，而不是硬压质量。这样即使平台再处理一次，成品也不会明显变糊。此外，接近上限的文件如果网络波动，还可能上传失败或超时。",
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
        faq: [
          {
            question: "Why can't I hit 200KB even at the lowest quality setting?",
            answer: "Quality is only one lever. When pixel count is high or the image is visually complex, low quality alone will not get you under a specific size. A 4000x3000 photo can still exceed 500KB at JPG quality 30. Do it in stages: first resize to the largest dimension you actually need, then pick a modern codec (WebP or AVIF usually beat JPG by 30–50%), and finally tune quality. Combining smaller dimensions, a better codec, and moderate quality reduction beats slamming quality to the floor.",
          },
          {
            question: "Will compressing to under 100KB make my photo unusable?",
            answer: "It depends on the pixel size and how the image will be viewed. An 800px avatar at 100KB usually still looks crisp. A 3000px landscape photo forced to 100KB will show obvious blocks and edge noise. To stay usable at very small sizes, resize first — a 500px web avatar needs far fewer bytes than a 3000px hero image — then use WebP or AVIF at quality 60–75. Preferring smaller dimensions over collapsed quality almost always looks better at the same file size.",
          },
          {
            question: "Should I convert a transparent PNG to JPG to hit the size target?",
            answer: "Not if transparency matters — JPG has no alpha channel, so the transparent area becomes solid white. Convert to WebP or AVIF instead: both preserve transparency and compress much better than PNG. If your destination only accepts PNG, try reducing the palette (PNG-8) or lowering pixel dimensions rather than dropping the format. Forcing PNG to JPG to shrink a file is only safe when the background color is known and permanent, like a logo that always sits on white.",
          },
          {
            question: "Why do two same-size photos end up with very different file sizes at the same quality?",
            answer: "Pixel dimensions and information content are not the same thing. Compressors spend bytes proportionally to visual complexity. Smooth gradients, flat backgrounds, and simple shapes compress tightly. Dense foliage, textured fabric, and noisy phone photos do not. At quality 80 a portrait against a plain wall might land at 120KB while a landscape at the same resolution and quality lands at 400KB. To force both to a shared target, you need to either lower quality further on the complex one or shrink its dimensions more aggressively.",
          },
          {
            question: "If the upload limit is 2MB, is compressing to 1.9MB good enough?",
            answer: "It works, but leave headroom. Many platforms re-compress or generate derivatives server-side, and a file that lands right at the limit is more likely to fail on flaky networks or get further degraded. Aim for around 1.5–1.6MB, and get most of the savings by resizing rather than crushing quality. That way, even if the server re-encodes your upload, the result still looks acceptable and the transfer is more reliable.",
          },
        ],
      },
    },
  },
  {
    slug: 'why-favicon-looks-blurry',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
          {
            label: "颜色转换器",
            href: "/color-converter",
            description: "在 HEX/RGB/HSL 之间互转，为 favicon 选出更契合品牌的主色。",
          },
          {
            label: "图片取色器",
            href: "/image/color-picker",
            description: "从 Logo 中吸取一个高对比度的主色，让缩到 16px 的 favicon 仍能辨认。",
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
        faq: [
          {
            question: "我的 favicon 在 Chrome 里清晰，但在 Safari 里糊，为什么？",
            answer: "不同浏览器对 favicon 的加载策略不一样。Safari 和 macOS 更倾向于使用 apple-touch-icon 或高分辨率 PNG，而不是老式的 favicon.ico；如果你只提供了一个 16x16 或 32x32 的 ICO，Safari 会把它拉大显示，看起来就发糊。同时 Retina 屏的物理像素密度是普通屏的两倍，需要两倍分辨率的图标才够清晰。解决方法是在 HTML 中同时声明多个 rel=icon 和 apple-touch-icon 链接，并提供 180x180、192x192、512x512 等大尺寸 PNG。",
          },
          {
            question: "为什么 SVG favicon 有时反而看着模糊？",
            answer: "SVG 是矢量格式，理论上任意缩放都清晰，但浏览器在 16px 或 32px 场景下把复杂 SVG 渲染成位图时会启用抗锯齿，细线条和小文字反而容易被平滑成灰色边缘。如果你的 logo 有 1px 的描边、极细的字母，或者非常密集的形状，在小尺寸下 SVG 反而不如手工优化过的 PNG 清晰。建议提供 SVG 作为主图标，但仍然附上 16x16 和 32x32 的 PNG 或 ICO 备用，让浏览器在小尺寸下选择位图。",
          },
          {
            question: "改了 favicon 之后浏览器还显示旧的，是缓存问题吗？",
            answer: "多半是。浏览器和操作系统会强缓存 favicon，通常几天甚至几周不刷新。清缓存并不能保证解决，因为 favicon 缓存独立于普通页面缓存。可以在 HTML 里给 favicon 加上版本号查询串（例如 favicon.ico?v=2），强制浏览器重新拉取；也可以在开发者工具里用硬刷新（Cmd+Shift+R），或者直接在地址栏访问 favicon.ico 的路径查看新版是否已到达服务器。上线后普通用户通常需要等待几天缓存自然过期。",
          },
          {
            question: "16x16 的 favicon 太小，画上 logo 是不是应该简化？",
            answer: "是的。设计初衷是让 logo 在极小尺寸下仍然可识别，而不是把桌面 logo 直接缩小。16px 场景大约只有 256 个像素点，容不下细文字、细线、复杂渐变或小装饰。常见做法是提取 logo 的主视觉元素——比如一个字母、一个符号或一个色块——并做视觉重心居中。可以用桌面版 logo 作为品牌延伸，但 favicon 单独设计一版，或至少准备一个简化版本。",
          },
          {
            question: "把 PNG 改后缀成 .ico 直接用作 favicon 可以吗？",
            answer: "浏览器现在的确会尝试解析后缀为 .ico 的 PNG，但这不是标准做法，也可能在某些工具、旧浏览器或系统里出问题。真正的 ICO 是一个容器格式，可以在一个文件里包含 16、32、48 等多个尺寸，让浏览器和系统按场景选择最合适的。直接改后缀只塞进一个尺寸，不同显示场景仍然靠浏览器缩放。建议使用真正的 ICO 编码工具，或者直接在 HTML 中同时声明多个 PNG 和 ICO 图标。",
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
          {
            label: "Color Converter",
            href: "/color-converter",
            description: "Convert HEX/RGB/HSL to pick a favicon accent that matches your brand.",
          },
          {
            label: "Image Color Picker",
            href: "/image/color-picker",
            description: "Sample a high-contrast color from your logo so the favicon still reads at 16px.",
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
        faq: [
          {
            question: "Why does my favicon look sharp in Chrome but blurry in Safari?",
            answer: "Different browsers pick different icon files. Safari and iOS lean on apple-touch-icon and higher-resolution PNGs before falling back to favicon.ico. If you only ship a 16x16 or 32x32 ICO, Safari upscales it and it looks fuzzy. Retina displays make it worse — they need roughly double the resolution to look crisp. Fix it by declaring multiple <link rel=\"icon\"> entries plus apple-touch-icon in your HTML, and providing sizes like 180x180, 192x192, and 512x512 PNGs alongside the ICO.",
          },
          {
            question: "Why does my SVG favicon sometimes look blurry?",
            answer: "SVG is vector, but browsers still rasterize it to a bitmap at display time. At 16px or 32px, hairline strokes, small letterforms, or dense shapes get anti-aliased into gray edges, which reads as blur. Complex SVGs often look worse than a hand-tuned PNG at tiny sizes. Keep SVG for its scalability but also ship 16x16 and 32x32 PNG or ICO fallbacks so the browser can use a pixel-perfect bitmap in small contexts.",
          },
          {
            question: "I updated the favicon but browsers still show the old one — is it a cache issue?",
            answer: "Almost always. Favicons are aggressively cached, sometimes for weeks, and favicon cache is often separate from regular page cache — clearing history may not help. Append a version query string like favicon.ico?v=2 to force a refetch, or hard-reload with Cmd+Shift+R and visit the favicon URL directly to confirm the server is returning the new file. Real users typically have to wait for the cache to expire naturally over several days.",
          },
          {
            question: "Should I simplify the logo for a 16x16 favicon?",
            answer: "Yes. A 16x16 favicon has only 256 pixels — nowhere near enough for fine text, thin strokes, or subtle gradients. Do not just shrink your desktop logo. Extract one recognizable element — a letter, a monogram, a signature shape — and center it visually. Many brands treat the favicon as a separate design that echoes the master logo rather than a literal reduction of it. Simplification is what preserves recognition at tiny sizes.",
          },
          {
            question: "Can I just rename a PNG to .ico and use it as a favicon?",
            answer: "Modern browsers often do accept PNGs with an .ico extension, but it is non-standard and can break in older browsers or icon-processing tools. A real ICO is a container that can hold 16, 32, 48, and larger sizes in one file so the browser or OS can pick the best match. Renaming a single PNG still leaves the browser to rescale for every other size. Use a proper ICO encoder, or declare multiple PNG icons in your HTML instead.",
          },
        ],
      },
    },
  },
  {
    slug: 'convert-image-to-ico',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-28',
    translations: {
      zh: {
        title: 'ICO 文件是什么？favicon 格式选择与图片转 ICO 教程',
        excerpt: '了解 ICO 为什么能包含多个尺寸，比较 favicon.ico、SVG favicon 和 PNG favicon，并用 ToolGarden 把 PNG、JPG、WebP 或 SVG 转换成 ICO。',
        metaTitle: 'ICO 文件与 favicon 选择：图片转 ICO',
        metaDescription: '了解 ICO 多尺寸容器，比较 favicon.ico、SVG 和 PNG，并用 ToolGarden 隐私友好的图片转 Icon 工具生成 ICO。',
        readingTime: '约 10 分钟阅读',
        tags: ['ICO 文件', 'favicon', 'SVG favicon', '图片转 ICO'],
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
          {
            label: "图片取色器",
            href: "/image/color-picker",
            description: "为 ICO 选出更醒目的主色，避免多尺寸缩小后失去辨识度。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '制作网站图标时，你可能同时看到 favicon.ico、SVG favicon 和 PNG favicon。它们不是同一种文件换了扩展名，而是结构、缩放方式和兼容场景都不同的图标方案。',
          },
          { type: 'heading', level: 2, text: 'ICO 文件是什么？' },
          {
            type: 'paragraph',
            text: 'ICO 是一种图标容器格式，常用于网站 favicon、Windows 应用、桌面快捷方式和文件图标。它不是单独一张位图，而是由文件头、图标目录和一组独立图像数据组成。',
          },
          {
            type: 'paragraph',
            text: '一个 ICO 可以同时保存 16x16、32x32、48x48、128x128 和 256x256 等多张图标。浏览器或操作系统读取目录后，会为当前界面选择最合适的条目，而不必每次都把同一张图片强行缩放。',
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
              'ICO 打包：写入 ICONDIR header 和各尺寸的 ICONDIRENTRY，记录位深、长度与偏移；小尺寸可用 32 位 BGRA DIB，256px 常直接保存 PNG 字节。',
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
          { type: 'heading', level: 2, text: 'favicon.ico、SVG favicon、PNG favicon 怎么选？' },
          {
            type: 'paragraph',
            text: '三种格式没有绝对的优劣。选择时要看浏览器兼容、图标是不是矢量、是否需要固定像素效果，以及它会不会被用于主屏图标或 PWA。',
          },
          {
            type: 'table',
            headers: ['格式', '适合场景', '主要特点'],
            rows: [
              ['favicon.ico', '通用网站兼容入口、旧环境、Windows 快捷方式', '兼容性稳，一个文件可包含多个位图尺寸'],
              ['SVG favicon', '现代浏览器、矢量 logo、需要适配高分屏', '缩放始终清晰，一个文件即可覆盖多种显示密度'],
              ['PNG favicon', '固定像素图标、Apple Touch Icon、PWA', '透明和像素效果可控，但不同尺寸通常需要独立文件'],
            ],
          },
          {
            type: 'paragraph',
            text: '对普通网站来说，最稳妥的方案不是只选一个，而是组合使用：保留 favicon.ico 作为兼容入口，为现代浏览器提供 SVG，并为 Apple Touch Icon 和 PWA 准备明确尺寸的 PNG。',
          },
          {
            type: 'list',
            items: [
              'favicon.ico：放在网站根目录，作为浏览器和旧环境的兼容入口。',
              'icon.svg：用于现代浏览器，适合轮廓清晰的矢量 logo。',
              'favicon-32x32.png：当 SVG 不适合或需要精确像素效果时使用。',
              'apple-touch-icon.png：通常使用 180x180 PNG，供 iOS 主屏快捷方式使用。',
              'PWA 图标：在 manifest 中提供 192x192 和 512x512 PNG。',
            ],
          },
          {
            type: 'code',
            language: 'html',
            code: faviconHtmlSnippet,
          },
          { type: 'heading', level: 2, text: '用 ToolGarden 把图片转换成 ICO' },
          {
            type: 'paragraph',
            text: 'ToolGarden 的图片转 Icon 工具支持 PNG、SVG、JPG、WebP、BMP、AVIF 等常见输入格式。图片会在浏览器本地读取、缩放、圆角裁剪和打包，整个过程不会上传到服务器。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片转 ICO',
            text: '上传图片后选择 ICO 输出，ToolGarden 会生成包含 16 到 256 像素多尺寸资源的 ICO 容器，并额外提供多尺寸 ICO ZIP，方便你按需取用单个尺寸。',
            href: '/image/to-icon',
            linkLabel: '打开图片转 Icon',
          },
          { type: 'heading', level: 2, text: '生成后怎么检查 favicon？' },
          {
            type: 'paragraph',
            text: 'favicon 很容易受到浏览器缓存影响。替换文件后看不到变化，不一定是生成失败，也可能是浏览器仍在使用旧图标。',
          },
          {
            type: 'list',
            items: [
              '确认图标 URL 可以直接访问，并返回正确的 MIME 类型。',
              '在普通标签页、高分屏设备、书签和桌面快捷方式中分别检查。',
              '清除 favicon 缓存，或临时修改文件名和 href 进行验证。',
              '同时预览浅色与深色浏览器界面，避免透明边缘或主体对比度不足。',
            ],
          },
          { type: 'heading', level: 2, text: '透明背景注意事项' },
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
            text: 'ICO 是能保存多套位图尺寸的图标容器，因此适合兼容性要求高的 favicon 和 Windows 场景。SVG 适合现代浏览器中的矢量品牌图标，PNG 则适合固定像素效果、Apple Touch Icon 和 PWA。',
          },
          {
            type: 'paragraph',
            text: '把图片转换成 ICO 时，不要只修改扩展名。使用 ToolGarden 图片转 Icon 上传源图、调整构图并生成真正的多尺寸 ICO，再配合 SVG 和 PNG 资源，就能覆盖常见的网站与桌面图标场景。',
          },
        ],
        faq: [
          {
            question: "为什么我用 Photoshop 存的 .ico 在浏览器里显示不对？",
            answer: "Photoshop 需要额外插件才能真正导出 ICO；很多人只是保存了 PNG 然后改名成 .ico，或者用插件生成的 ICO 只包含一个尺寸。浏览器读到只有 32x32 的 ICO，在需要 16x16 或 48x48 的场景就得拉大或缩小，效果不理想。正确的 ICO 应包含 16、32、48 等多个尺寸，可以用专门的在线工具或命令行工具（例如 ImageMagick 的 convert）生成真正的多尺寸 ICO。",
          },
          {
            question: "透明背景的 logo 转成 ICO 后周围出现白边，怎么办？",
            answer: "白边通常来源于源图边缘的半透明像素被错误处理。ICO 支持 Alpha 通道，但一些转换工具在缩放时会把半透明像素与白色混合，形成明显白边。解决方法有几种：一是提供更大尺寸的源图，让缩放算法有更多像素可用；二是在导出前先给 logo 加一层背景色相同的“扩展”（背景色如果不确定，用透明并确认工具支持保留 Alpha）；三是使用支持完整 Alpha 通道的工具，检查是否生成的是 32 位 BGRA 位图。",
          },
          {
            question: "ICO 一定要正方形吗？非正方形 logo 怎么办？",
            answer: "严格来说 ICO 允许非正方形，但绝大多数浏览器和操作系统都按正方形显示图标。如果你直接把长方形 logo 塞进 ICO，最终会被系统裁切、拉伸或加边距，效果不受控。更好的做法是先在正方形画布里居中放置 logo，让上下或左右留白，保证在圆形、圆角矩形等系统裁切下主体依然完整。生成图标前先把源图裁切或扩展成 1:1 是最稳定的方案。",
          },
          {
            question: "多尺寸 ICO 应该包含哪几个尺寸？",
            answer: "常见的最小配置是 16、32、48，用于浏览器标签页、任务栏和桌面快捷方式。想要覆盖更多场景，可以增加 64、128、256，其中 256 通常以 PNG 数据存储在 ICO 容器内。Windows 高分屏和大图标视图会使用 128 或 256，如果不提供，就只能靠系统放大较小尺寸，效果发糊。对于品牌网站，推荐至少包含 16、32、48、64、128、256 六个尺寸。",
          },
          {
            question: "网站只放 favicon.ico 可以吗？",
            answer: "可以，favicon.ico 仍能覆盖大多数基础标签页和旧环境。但现代网站通常会同时提供 SVG favicon 和 PNG：SVG 在高分屏上缩放更清晰，180x180 PNG 用于 Apple Touch Icon，192x192 与 512x512 PNG 用于 PWA。兼容性要求高时，推荐 ICO、SVG、PNG 组合使用，而不是只依赖一个文件。",
          },
        ],
      },
      en: {
        title: 'What Is an ICO File? Favicon Formats and Image to ICO Guide',
        excerpt: 'Learn why ICO files contain multiple sizes, compare favicon.ico with SVG and PNG favicons, and convert PNG, JPG, WebP, or SVG images with ToolGarden.',
        metaTitle: 'ICO Files, Favicon Formats, and Image to ICO',
        metaDescription: 'Learn why ICO files contain multiple sizes, when to use ICO, SVG, or PNG favicons, and how to convert images with the privacy-friendly ToolGarden converter.',
        readingTime: '10 min read',
        tags: ['ICO file', 'favicon', 'SVG favicon', 'image to ICO'],
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
          {
            label: "Image Color Picker",
            href: "/image/color-picker",
            description: "Sample a punchy color to keep ICOs recognizable at 16px and 32px sizes.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'When creating a website icon, you may encounter favicon.ico, SVG favicon, and PNG favicon. They are not interchangeable extensions. Each format has a different structure, scaling model, and compatibility role.',
          },
          { type: 'heading', level: 2, text: 'What is an ICO file?' },
          {
            type: 'paragraph',
            text: 'ICO is an icon container format commonly used for website favicons, Windows applications, desktop shortcuts, and file icons. It is not one bitmap. The file contains a header, an icon directory, and several independent image entries.',
          },
          {
            type: 'paragraph',
            text: 'One ICO can store 16x16, 32x32, 48x48, 128x128, and 256x256 images together. A browser or operating system reads the directory and chooses the closest entry instead of rescaling one image for every interface.',
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
              'ICO packaging: the file receives an ICONDIR header and an ICONDIRENTRY for every size; smaller entries can use 32-bit BGRA DIB data, while 256px entries often store PNG bytes.',
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
          { type: 'heading', level: 2, text: 'favicon.ico vs SVG favicon vs PNG favicon' },
          {
            type: 'paragraph',
            text: 'No format wins every case. Choose based on browser compatibility, whether the artwork is vector, whether exact pixel rendering matters, and whether the icon will also be used for home screens or a PWA.',
          },
          {
            type: 'table',
            headers: ['Format', 'Best for', 'Main characteristic'],
            rows: [
              ['favicon.ico', 'General fallback, older environments, Windows shortcuts', 'Broad compatibility and several bitmap sizes in one file'],
              ['SVG favicon', 'Modern browsers, vector logos, high-density displays', 'Stays sharp at every scale and usually needs one file'],
              ['PNG favicon', 'Pixel-specific artwork, Apple Touch Icon, PWA', 'Predictable alpha and raster rendering, but sizes are separate files'],
            ],
          },
          {
            type: 'paragraph',
            text: 'For a typical website, the most resilient setup is a combination: keep favicon.ico as the compatibility entry, add SVG for modern browsers, and provide explicit PNG sizes for Apple Touch Icon and PWA installation.',
          },
          {
            type: 'list',
            items: [
              'favicon.ico: place it at the site root as the browser and legacy fallback.',
              'icon.svg: use it for modern browsers when the brand mark is vector-friendly.',
              'favicon-32x32.png: use it when SVG is unsuitable or pixel-level control matters.',
              'apple-touch-icon.png: commonly use a 180x180 PNG for iOS home-screen shortcuts.',
              'PWA icons: declare 192x192 and 512x512 PNG files in the web app manifest.',
            ],
          },
          {
            type: 'code',
            language: 'html',
            code: faviconHtmlSnippet,
          },
          { type: 'heading', level: 2, text: 'Convert an image to ICO with ToolGarden' },
          {
            type: 'paragraph',
            text: 'ToolGarden Image to Icon supports common input formats including PNG, SVG, JPG, WebP, BMP, and AVIF. Image loading, scaling, corner clipping, preview, and packaging happen locally in the browser, so the image is not uploaded to a server.',
          },
          {
            type: 'callout',
            title: 'ToolGarden PNG/JPG/WebP to ICO',
            text: 'Upload an image and choose ICO output. ToolGarden generates a multi-size ICO container from 16 to 256 pixels and also offers a ZIP with separate ICO files for each size.',
            href: '/image/to-icon',
            linkLabel: 'Open Image to Icon',
          },
          { type: 'heading', level: 2, text: 'How to check the generated favicon' },
          {
            type: 'paragraph',
            text: 'Favicons are cached aggressively. If a replacement does not appear immediately, the ICO may be correct while the browser is still showing the previous asset.',
          },
          {
            type: 'list',
            items: [
              'Open the icon URL directly and confirm that it returns the expected MIME type.',
              'Check tabs, high-density displays, bookmarks, and desktop shortcuts separately.',
              'Clear the favicon cache or temporarily change the filename and href during testing.',
              'Preview both light and dark browser chrome for weak contrast or transparent-edge artifacts.',
            ],
          },
          { type: 'heading', level: 2, text: 'Transparency considerations' },
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
            text: 'ICO is a multi-image container suited to compatibility-focused favicons and Windows. SVG is a strong choice for vector brand marks in modern browsers, while PNG fits fixed-pixel artwork, Apple Touch Icon, and PWA assets.',
          },
          {
            type: 'paragraph',
            text: 'When converting a picture to ICO, do not rename the extension. Use ToolGarden Image to Icon to upload the source, adjust the composition, and generate a real multi-size ICO, then pair it with SVG and PNG assets for broader website coverage.',
          },
        ],
        faq: [
          {
            question: "Why does my Photoshop-exported .ico look wrong in browsers?",
            answer: "Photoshop needs a plugin to actually write ICO, and many people just save a PNG and rename it. Even with the plugin, the output often has a single size. Browsers then upscale or downscale it for favicons, bookmarks, and shortcuts, which makes the result look fuzzy. A proper ICO packs multiple sizes (16, 32, 48, and larger) into one file. Use a dedicated ICO tool or ImageMagick (`convert source.png -define icon:auto-resize=256,128,64,48,32,16 favicon.ico`) to get a real multi-size ICO.",
          },
          {
            question: "My transparent logo has a white halo after converting to ICO. How do I fix it?",
            answer: "The halo usually comes from semi-transparent edge pixels being blended against white during resizing. ICO does support alpha, but some encoders mishandle it. Try three things: use a larger source image so the downscaler has more pixels to work with; use a converter that emits 32-bit BGRA bitmaps rather than 24-bit RGB; and if the destination background is known, pre-composite the logo against that color instead of relying on transparency.",
          },
          {
            question: "Does an ICO have to be square? What about a rectangular logo?",
            answer: "The ICO format technically allows non-square entries, but browsers and operating systems display favicons as squares. A rectangular logo will be cropped, stretched, or padded unpredictably. Instead, place the logo on a square canvas with intentional padding so the composition survives circular masks, rounded corners, and edge cropping across platforms. Pre-squaring the source is the only reliable way to control the final look.",
          },
          {
            question: "Which sizes should a multi-size ICO contain?",
            answer: "A minimum useful set is 16, 32, and 48 for browser tabs, taskbars, and shortcuts. For broader coverage, add 64, 128, and 256. The 256 entry is normally stored as embedded PNG data rather than a raw bitmap. Windows high-DPI and large-icon views use 128 or 256, and if you skip those, the OS scales up smaller entries and the icon looks soft. A production favicon.ico typically ships all six: 16, 32, 48, 64, 128, 256.",
          },
          {
            question: "Can a website use only favicon.ico?",
            answer: "Yes. favicon.ico still covers basic browser tabs and many older environments. Modern sites usually add SVG and PNG as well: SVG stays sharp on high-density displays, a 180x180 PNG serves Apple Touch Icon, and 192x192 plus 512x512 PNG files serve PWA installation. For broad coverage, use ICO, SVG, and PNG together instead of relying on one file.",
          },
        ],
      },
    },
  },
  {
    slug: 'ico-vs-icns-vs-png-icons',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
          {
            label: "颜色转换器",
            href: "/color-converter",
            description: "为图标在 Windows、macOS 和 Web 之间统一色号（HEX / sRGB）。",
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
        faq: [
          {
            question: "为什么 Electron 应用要同时准备 ICO、ICNS 和 PNG 三种图标？",
            answer: "因为 Electron 打包出的应用在不同系统上使用不同的图标格式：Windows 使用 ICO（.exe 内嵌或安装包图标），macOS 使用 ICNS（.app/Contents/Resources），Linux 常用 PNG。打包工具（electron-builder、electron-forge）会根据构建目标读取不同格式的资源。如果只提供一种，其它平台要么使用默认灰色图标，要么被打包工具低质量转换。为每个平台准备各自的原生格式，并放入相应目录，是保证跨平台图标质量的标准做法。",
          },
          {
            question: "PWA 是不是不需要 ICO 和 ICNS，只用 PNG 就行？",
            answer: "对，PWA 图标基本只需要 PNG。manifest.webmanifest 里的 icons 字段引用一组不同尺寸的 PNG（常见 192x192 和 512x512），系统在安装到桌面或主屏幕时会挑选合适的尺寸。ICO 和 ICNS 是桌面原生应用的格式，PWA 走的是浏览器安装流程，不需要这些容器格式。不过你的网站本身仍然需要 favicon.ico 用于浏览器标签页，以及 apple-touch-icon PNG 用于 iOS 主屏快捷方式。",
          },
          {
            question: "ICNS 里的 1024x1024 图标真的有必要吗？",
            answer: "对 macOS 应用来说非常必要。Finder 的图标视图和 Launchpad 可以放大到 512x512 甚至更大，Retina 屏进一步翻倍到 1024x1024。如果 ICNS 里最大尺寸只有 256，那么在这些场景下会被拉大，出现明显模糊。Apple 的应用图标模板本身就是 1024x1024 起步。使用 iconutil 或 png2icns 之类工具生成 ICNS 时，建议至少包含 16、32、64、128、256、512、1024 七套，以及各自的 @2x 版本。",
          },
          {
            question: "为什么有的网站 HTML 里同时有 rel=icon 和 rel=shortcut icon？",
            answer: "rel=\"shortcut icon\" 是早期 IE 的历史遗留写法，标准 HTML 定义的是 rel=\"icon\"。现代浏览器两种都认，但只使用 rel=\"icon\" 就足够了。同时保留是为了兼容极旧的 IE 版本。除非你的用户还大量使用 IE9 或更早浏览器，否则可以只写 rel=\"icon\"，并搭配 sizes、type 属性。关键是提供 apple-touch-icon（Safari 和 iOS 主屏）以及 manifest icons（PWA），这两个反而更容易被开发者忽略。",
          },
          {
            question: "如果只做纯静态网站，最少要准备哪些图标文件？",
            answer: "最低配置是三个文件：favicon.ico（16/32/48 多尺寸，用于浏览器标签页和历史兼容），apple-touch-icon.png（180x180，用于 iOS 主屏），以及一到两张 manifest 使用的 PNG（192x192 和 512x512，用于 PWA 和 Android 主屏）。这套组合可以覆盖 99% 的浏览器与设备。如果网站需要打包成桌面应用，再额外补 ICO 大尺寸和 ICNS；否则不需要 ICNS。",
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
          {
            label: "Color Converter",
            href: "/color-converter",
            description: "Align icon colors across Windows, macOS, and web with a single HEX/sRGB reference.",
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
        faq: [
          {
            question: "Why do Electron apps ship ICO, ICNS, and PNG icons together?",
            answer: "Electron builds land on three platforms with three native icon formats. Windows expects ICO (embedded in the .exe or installer), macOS wants ICNS inside the .app bundle, and Linux typically reads PNG. Packagers like electron-builder pick the right file per target based on your build config. Shipping only one format means the other platforms either fall back to a default gray icon or get a low-quality on-the-fly conversion. Prepare each format from the same master artwork to keep quality consistent across OSes.",
          },
          {
            question: "Does a PWA need ICO and ICNS, or just PNG?",
            answer: "PWAs use PNG only. The manifest.webmanifest references a set of PNG sizes (typically 192x192 and 512x512), and the OS picks the closest match when installing to the home screen or desktop. ICO and ICNS are for native desktop apps and are not used by the PWA install flow. Your site still needs a favicon.ico for browser tabs and an apple-touch-icon PNG for iOS home-screen shortcuts, but no ICNS is required.",
          },
          {
            question: "Do I really need a 1024x1024 entry in my ICNS?",
            answer: "For a macOS app, yes. Finder's icon view and Launchpad can render icons up to 512x512, and Retina displays double that requirement to 1024x1024. If your ICNS tops out at 256, those large views scale it up and look soft. Apple's app icon template starts at 1024x1024 for a reason. When building with iconutil or png2icns, ship 16, 32, 64, 128, 256, 512, and 1024 plus their @2x variants for a complete set.",
          },
          {
            question: "Why do some sites declare both rel=\"icon\" and rel=\"shortcut icon\"?",
            answer: "rel=\"shortcut icon\" is a legacy Internet Explorer convention. The HTML standard defines only rel=\"icon\", and every modern browser accepts it. Sites keep both for compatibility with very old IE versions. Unless you have to support IE9 or earlier, rel=\"icon\" alone is enough. What actually matters more is declaring apple-touch-icon for Safari/iOS and manifest icons for PWAs — those two are more commonly forgotten than the redundant shortcut icon.",
          },
          {
            question: "What is the minimum icon set for a plain static website?",
            answer: "Three files cover 99% of browsers and devices: a multi-size favicon.ico (16/32/48) for browser tabs and legacy compatibility, one apple-touch-icon.png at 180x180 for iOS home screens, and one or two PWA manifest PNGs (192x192 and 512x512) for Android and installable web apps. If you later package the site as a desktop app, add larger ICO sizes and a full ICNS; a pure website never needs ICNS.",
          },
        ],
      },
    },
  },
  {
    slug: 'jpg-png-webp-avif-differences',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-20',
    translations: {
      zh: {
        title: 'PNG vs WebP vs AVIF：什么时候该用哪种格式？',
        excerpt: 'PNG、WebP、AVIF 在压缩、透明背景、清晰度、编码速度和兼容性上各有优势，JPG 仍可作为照片与旧环境的实用回退。',
        metaTitle: 'PNG vs WebP vs AVIF：图片格式选择完整指南',
        metaDescription: '对比 PNG、WebP、AVIF 的压缩、透明度、画质、兼容性和适用场景，并说明 JPG 何时仍是实用回退。',
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
          {
            label: "图片 EXIF 查看 / 清除",
            href: "/image/exif",
            description: "在换格式前查看原文件的元信息，或一键清除 GPS 等隐私字段。",
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
        faq: [
          {
            question: "既然 AVIF 压缩率最高，为什么大网站还在用 JPG？",
            answer: "兼容性和成本。JPG 从 1992 年就存在，任何浏览器、系统和图片处理管线都能读，服务器端 CDN、缩略图服务、CMS、邮件客户端也都支持。AVIF 编码非常慢，服务器实时生成缩略图会消耗大量 CPU，历史图片全量重新编码工程量巨大。很多大站的做法是用 <picture> 标签同时提供 AVIF、WebP 和 JPG，让新浏览器用 AVIF，老环境自动 fallback。完全放弃 JPG 目前还不现实。",
          },
          {
            question: "为什么截图存成 JPG 会比存成 PNG 大？",
            answer: "截图通常是大面积纯色加少量高对比边缘，PNG 的无损压缩能很好利用这种重复性——同一颜色的相邻像素可以用极少字节表示。JPG 的算法是为渐变照片设计的，把纯色区域拆成 8x8 块单独编码，反而引入了更多冗余数据。结果就是同一张截图，PNG 可能只有 200KB，JPG 反而 500KB 且文字发糊。截图、UI、图表、代码块永远优先 PNG。",
          },
          {
            question: "WebP 有损和无损模式怎么选？",
            answer: "取决于内容和后续处理需求。有损 WebP（lossy）适合照片、网页大图、社交分享图，通常比同质量 JPG 小 25–35%。无损 WebP（lossless）适合截图、图标、需要精确像素还原的图，通常比 PNG 小 20–30%，但依然比有损模式大。工具里如果没有明确开关，通常质量 100 会走无损，其它质量走有损。批量转换网站图片时，让工具根据源图类型自动选（照片用有损，截图用无损）通常效果最好。",
          },
          {
            question: "AVIF 支持动画吗？可以替代 GIF 吗？",
            answer: "支持。AVIF 基于 AV1 视频编码，天然支持动画帧序列，压缩率比 GIF 高非常多，同一动画 AVIF 可能只有 GIF 的 1/10 甚至更小。但兼容性还在推进中，一些老浏览器和聊天工具不认识 AVIF 动画。目前的最佳实践是用 <video autoplay muted loop playsinline> 或 <picture> 组合替代 GIF，AVIF、WebP 动画和 MP4 都是选项，具体看目标平台。纯静态图场景 AVIF 已经很成熟。",
          },
          {
            question: "为什么 SVG 没出现在这个对比里？SVG 和这四种有什么区别？",
            answer: "因为 SVG 是矢量格式，本文对比的都是位图。位图存储的是像素网格，放大会糊；SVG 存储的是几何指令（路径、多边形、曲线），任意尺寸都清晰。SVG 适合图标、logo、简单插图、图表；照片和自然场景不适合 SVG，因为像素级细节没法用少量路径表示。实际项目中，图标用 SVG，照片用 WebP/AVIF/JPG，透明位图用 PNG——四类需求各有对应格式。",
          },
        ],
      },
      en: {
        title: 'PNG vs WebP vs AVIF: When to Use Each Format (and Where JPG Fits)',
        excerpt: 'PNG, WebP, and AVIF each balance compression, transparency, visual quality, encoding cost, and compatibility differently, while JPG remains a practical fallback.',
        metaTitle: 'PNG vs WebP vs AVIF: Complete Image Format Guide',
        metaDescription: 'Compare PNG, WebP, and AVIF for compression, transparency, quality, compatibility, and use cases, with guidance on when JPG remains useful.',
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
          {
            label: "Image EXIF Viewer & Cleaner",
            href: "/image/exif",
            description: "Inspect metadata before converting, or strip GPS and camera info in one click.",
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
        faq: [
          {
            question: "If AVIF compresses best, why do big websites still use JPG?",
            answer: "Compatibility and processing cost. JPG has been around since 1992 and every browser, CMS, thumbnail service, email client, and CDN handles it. AVIF encoding is CPU-expensive — generating thumbnails on demand at scale is far more costly than JPG, and re-encoding a huge back catalog is an enormous project. Most large sites use <picture> to serve AVIF, then WebP, then JPG as a fallback. Modern browsers get the best format while older clients still work. Abandoning JPG outright is not yet realistic.",
          },
          {
            question: "Why is a screenshot bigger as a JPG than as a PNG?",
            answer: "Screenshots are mostly flat colors with sharp text — exactly what PNG's lossless compression exploits. Long runs of the same color are stored in a handful of bytes. JPG's algorithm assumes photographic gradients, splits the image into 8x8 blocks, and encodes each independently, which actually adds overhead on flat regions. A screenshot might be 200KB as PNG and 500KB as JPG with visibly worse text. Always use PNG (or lossless WebP) for screenshots, UI captures, and diagrams.",
          },
          {
            question: "When should I pick lossy WebP versus lossless WebP?",
            answer: "Lossy WebP wins for photos, hero images, and social sharing — usually 25–35% smaller than a JPG of comparable quality. Lossless WebP wins for screenshots, icons, and content where exact pixel fidelity matters — typically 20–30% smaller than PNG. In most tools, quality 100 triggers lossless mode and any other value triggers lossy. If you are converting a mixed batch, let the tool auto-select based on content type: photos to lossy, screenshots to lossless.",
          },
          {
            question: "Does AVIF support animation? Can it replace GIF?",
            answer: "Yes. AVIF is based on AV1 video and handles animated frames natively, often at one-tenth the size of the equivalent GIF or less. Compatibility is still catching up — some older browsers and messaging apps do not accept animated AVIF. The pragmatic replacement for GIF today is a <video autoplay muted loop playsinline> element with MP4 or WebM, optionally with AVIF and animated WebP as alternates via <picture>. For static images AVIF is already production-ready.",
          },
          {
            question: "Why isn't SVG in this comparison? How is it different from the other four?",
            answer: "SVG is a vector format; JPG, PNG, WebP, and AVIF are raster. Raster formats store a pixel grid and lose quality when scaled up. SVG stores geometric instructions — paths, polygons, curves — that render crisply at any size. SVG excels at icons, logos, simple illustrations, and charts. It is a bad fit for photos, since real-world detail cannot be expressed as a few paths. In practice: SVG for icons, WebP/AVIF/JPG for photos, PNG for transparent raster art.",
          },
        ],
      },
    },
  },
  {
    slug: 'convert-images-to-webp',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
          {
            label: "图片 EXIF 查看 / 清除",
            href: "/image/exif",
            description: "转换成 WebP 前先清掉 EXIF、GPS 等敏感信息。",
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
        faq: [
          {
            question: "转 WebP 后不但没变小，反而变大了，怎么办？",
            answer: "这种情况多发生在原图本身已经是高压缩率的小 JPG，或者你选择了无损 WebP 模式。极小的 JPG 缩略图（如 20KB 的头像）已经压得非常紧，再转 WebP 边界收益很小甚至为负。无损模式（质量 100）保留全部像素，对复杂照片体积可能反而增加。解决方法：小图直接跳过转换；照片用有损 WebP，质量 75–85 通常显著变小；PNG 转 WebP 如果需要保留细节，可对比无损和有损模式的输出，取较小者。",
          },
          {
            question: "把动画 GIF 转成 WebP，动画会保留吗？",
            answer: "WebP 格式本身支持动画，但大多数浏览器 Canvas.toBlob('image/webp') 只导出单帧静态 WebP，动画会丢失。想保留动画，需要专门的动画 WebP 编码器（如 libwebp 的 gif2webp），把每一帧独立编码并合成为动画 WebP。ToolGarden 这类浏览器端工具通常只处理第一帧或截取当前帧。如果动画重要，考虑保留原 GIF，或用命令行工具转为 MP4/AVIF 动画等更高效的现代方案。",
          },
          {
            question: "WebP 的质量 80 对应 JPG 的质量多少？",
            answer: "两者的质量数值不是线性对应的，因为编码算法完全不同。经验上，WebP 质量 80 视觉上大致等于 JPG 质量 85–90，但文件体积通常小 25–35%。你可以把 WebP 质量 75 作为“视觉几乎无损”的起点，60 作为“可接受的明显压缩”，40 以下才开始出现明显块状伪影。要在两种格式间准确对比，最好用同一张图分别导出多组参数，肉眼判断，不要死盯数字。",
          },
          {
            question: "iOS Safari 现在支持 WebP 吗？还需要 JPG 备用吗？",
            answer: "iOS 14 及以上的 Safari 已完整支持 WebP（包括系统级 QuickLook 和邮件预览）。如果你的用户几乎都在最近三年更新过设备，可以放心使用 WebP。但如果需要覆盖 iOS 13 及更早、老 Android 或某些国产内嵌浏览器，仍然建议用 <picture> 标签同时提供 JPG。CDN 或图片服务通常可以自动生成多格式，让 Accept 头决定发送哪个版本。纯用 WebP 而不留 fallback，只在受控 B 端场景比较安全。",
          },
          {
            question: "把 PNG 转 WebP 后透明背景变成了黑色，是 bug 吗？",
            answer: "不是 bug，通常是导出时选择了不支持 Alpha 的模式，或者中间 Canvas 没有正确初始化。Canvas 默认是黑色背景，如果你在绘制前没有 clearRect 或者导出参数漏掉 alpha，透明像素会被填成黑色。正确的流程是：创建 Canvas 后先 clearRect 保证透明，然后 drawImage 绘制源图，最后用 toBlob('image/webp', quality) 导出，浏览器会保留 Alpha 通道。工具端如果仍然错误，尝试换个转换器，或先确保源 PNG 确实有 Alpha 通道。",
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
          {
            label: "Image EXIF Viewer & Cleaner",
            href: "/image/exif",
            description: "Strip EXIF and GPS metadata before converting to WebP.",
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
        faq: [
          {
            question: "My file got bigger after converting to WebP. What went wrong?",
            answer: "This usually happens with tiny, already-tight JPGs or when you picked lossless WebP mode. A 20KB avatar has almost no fat left to trim, so re-encoding overhead can push it up. Lossless mode (quality 100) preserves every pixel and often exceeds the original for complex photos. Fixes: skip conversion for very small files, use lossy WebP at quality 75–85 for photos, and when converting PNGs test both lossy and lossless modes and keep whichever is smaller.",
          },
          {
            question: "Will animation survive when I convert an animated GIF to WebP?",
            answer: "WebP supports animation, but the browser's Canvas.toBlob('image/webp') only emits a single static frame — the animation is lost. Preserving animation requires a dedicated encoder like libwebp's gif2webp, which encodes each frame and packages them as animated WebP. Browser-based converters usually keep only the first frame or the frame currently displayed. If the animation matters, either keep the GIF or use a CLI tool to convert to animated WebP, AVIF, or MP4 — modern formats give far smaller files.",
          },
          {
            question: "What JPG quality does WebP quality 80 correspond to?",
            answer: "There is no direct mapping — the algorithms are different. Empirically, WebP quality 80 looks close to JPG quality 85–90 while being 25–35% smaller. Useful anchors: WebP 75 is the practical visually-lossless floor, 60 is noticeable but acceptable compression, and below 40 you start seeing blocks. For accurate comparisons, export the same source at several qualities in both formats and evaluate visually rather than trusting the numbers.",
          },
          {
            question: "Does iOS Safari support WebP now? Do I still need a JPG fallback?",
            answer: "Yes — iOS 14 and later Safari fully supports WebP, including system QuickLook and mail preview. If your audience is mostly on devices updated in the last three years, WebP alone is fine. If you must reach iOS 13 or older, ancient Android, or certain in-app WebViews, keep a JPG fallback via the <picture> element. A CDN with content negotiation can serve WebP or JPG based on the Accept header. Only skip the fallback in tightly controlled internal or B2B contexts.",
          },
          {
            question: "Why did the transparent background turn black after I converted PNG to WebP?",
            answer: "It is not a WebP bug. Canvas defaults to a black background, so if the converter forgot to clearRect before drawImage — or exported without preserving alpha — transparent pixels become black. The correct sequence is: create the canvas, clearRect to make it transparent, drawImage the source, then toBlob('image/webp', quality). Alpha is preserved automatically. If your tool still gets it wrong, try a different converter and confirm the source PNG actually has an alpha channel.",
          },
        ],
      },
    },
  },
  {
    slug: 'convert-images-to-avif',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
          {
            label: "图片 EXIF 查看 / 清除",
            href: "/image/exif",
            description: "发布 AVIF 前先清除 EXIF 元信息，避免泄露拍摄位置和设备。",
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
        faq: [
          {
            question: "为什么 AVIF 编码这么慢？可以只在关键图片上使用吗？",
            answer: "AVIF 基于 AV1 视频编码，压缩率高但计算量大——编码器需要评估多种块划分方式、变换和帧内预测模式，才能找到接近最优的表示。同一张图 AVIF 编码可能比 JPG 慢 10–50 倍。因此完全没必要给每张图都转 AVIF。合理策略是：首屏大图、封面图、Hero image 转 AVIF（价值最大）；缩略图、UI 装饰图用 WebP；小图标继续 PNG/SVG。构建工具可以在打包阶段异步生成 AVIF，运行时用 <picture> 提供多格式。",
          },
          {
            question: "AVIF 和 HEIC 是什么关系？苹果拍的 HEIC 可以直接当 AVIF 用吗？",
            answer: "都是基于视频编码的图片格式，但底层不同：AVIF 基于 AV1（开源、免版税），HEIC 基于 HEVC（有专利授权）。苹果设备默认拍 HEIC，Windows 和大多数浏览器不原生支持 HEIC，直接把 .heic 传到网页通常无法显示。要在网页使用，需要先转成 AVIF、WebP 或 JPG。ToolGarden 或 macOS 预览、iOS 相册导出都可以完成转换。二者不能互换后缀使用。",
          },
          {
            question: "AVIF 支持 HDR 和宽色域吗？和 JPG 相比呢？",
            answer: "支持，这是 AVIF 相对 JPG 的重要优势之一。AVIF 支持 10-bit 甚至 12-bit 色深、Rec.2020 广色域和 HDR 元数据（PQ、HLG），可以准确保存现代手机和相机拍摄的 HDR 照片。JPG 只支持 8-bit sRGB，广色域和 HDR 内容转成 JPG 会被压缩到较窄色域，损失色彩细节。如果你的目标是保留 iPhone 或专业相机的原始 HDR 效果，AVIF 是消费级格式里最合适的选择之一。",
          },
          {
            question: "AVIF 文件的解码速度会不会成为网页加载瓶颈？",
            answer: "AVIF 解码比 JPG、WebP 慢，但现代 CPU（尤其是 2020 年后的移动设备）已经能在几十毫秒内解码一张 1080p AVIF，通常不会成为可感知瓶颈。真正的瓶颈往往是下载时间——AVIF 体积小 30–50%，下载省下的时间远超解码增加的时间，尤其在移动网络下。低端设备或大批量图片同时解码可能出现短暂卡顿，可以配合懒加载（loading=\"lazy\"）和 Intersection Observer 缓解。",
          },
          {
            question: "为什么某些 AVIF 图片在 Firefox 打不开，Chrome 却可以？",
            answer: "Firefox 和 Chrome 对 AVIF 的支持进度和实现细节不同。Firefox 从 93 版开始默认启用 AVIF，但对某些高级特性（10-bit 色深、HDR、动画 AVIF）的支持晚于 Chrome。如果 AVIF 在 Chrome 显示、Firefox 打不开，通常是文件用了 Firefox 版本尚未支持的 profile 或 tile 参数。解决方法：编码时用更保守的设置（8-bit、无 HDR、单 tile），或者用 <picture> 提供 WebP 备用，让 Firefox 自动 fallback。",
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
          {
            label: "Image EXIF Viewer & Cleaner",
            href: "/image/exif",
            description: "Strip EXIF before publishing AVIFs to avoid leaking location and device data.",
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
        faq: [
          {
            question: "Why is AVIF encoding so slow? Can I use it only on key images?",
            answer: "AVIF is built on AV1 video coding, which trades encode time for compression quality by evaluating many block partitions and intra-prediction modes. Expect AVIF to be 10–50x slower than JPG. You do not need it everywhere. A sensible strategy: use AVIF for hero images, article covers, and above-the-fold content where the bandwidth savings matter most; use WebP for thumbnails and decorative images; and keep PNG or SVG for small icons. Generate AVIF asynchronously in the build step and serve it via <picture> at runtime.",
          },
          {
            question: "How is AVIF related to HEIC? Can I use iPhone HEIC files as AVIF?",
            answer: "Both are still-image wrappers around video codecs, but they use different codecs. AVIF is based on AV1 (open, royalty-free); HEIC is based on HEVC (patent-encumbered). iPhones shoot HEIC by default, but Windows and most browsers cannot decode HEIC natively — dropping a .heic into a web page usually shows nothing. To use HEIC content on the web you must convert it to AVIF, WebP, or JPG. The extensions are not interchangeable.",
          },
          {
            question: "Does AVIF support HDR and wide-gamut color? How does it compare to JPG here?",
            answer: "Yes — this is one of AVIF's biggest advantages over JPG. AVIF supports 10-bit and 12-bit color depth, the Rec.2020 wide gamut, and HDR metadata like PQ and HLG. It can faithfully store the HDR photos modern phones and cameras produce. JPG is stuck at 8-bit sRGB, so converting HDR content to JPG clips the gamut and loses tonal range. For preserving iPhone or professional HDR captures for consumer delivery, AVIF is the strongest mainstream option.",
          },
          {
            question: "Will AVIF decoding become a page-load bottleneck?",
            answer: "AVIF decode is slower than JPG or WebP, but modern CPUs (especially 2020+ mobile chips) decode a 1080p AVIF in tens of milliseconds and it rarely dominates perceived load time. The real bottleneck is usually download — because AVIF is 30–50% smaller, the bandwidth savings typically outweigh the decode cost, especially on cellular networks. On low-end devices with many images on screen you can hit brief jank; mitigate with loading=\"lazy\" and Intersection Observer so decoding is deferred until scroll.",
          },
          {
            question: "Why do some AVIF files fail in Firefox but work in Chrome?",
            answer: "Firefox and Chrome shipped AVIF support at different times with different feature coverage. Firefox 93+ decodes basic AVIF, but advanced features — 10-bit depth, HDR metadata, animated AVIF — arrived later than in Chrome. Files that only work in Chrome are usually encoded with a profile or tiling configuration Firefox does not yet handle. Encode with conservative settings (8-bit, no HDR, single tile) or serve a WebP fallback via <picture> so Firefox picks a format it understands.",
          },
        ],
      },
    },
  },
  {
    slug: 'png-to-jpg-jpg-to-png-transparency',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
          {
            label: "图片 EXIF 查看 / 清除",
            href: "/image/exif",
            description: "在 PNG ↔ JPG 转换前查看或清除原文件的元数据。",
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
        faq: [
          {
            question: "PNG 转 JPG 时可以指定填充颜色不是白色吗？",
            answer: "可以，但需要工具支持自定义 matte 颜色。默认多数在线工具会用白色填充透明区域，因为白色是最常见的网页背景。如果你的图片最终会放在深色背景（如 GitHub 深色主题、深色文档），用白色 matte 会出现明显的白边。想避免，选择支持自定义背景色的工具，或者在转 JPG 前先把透明区域手动填充为目标背景色（Photoshop、Figma、命令行 ImageMagick 都可以做）。ToolGarden 等浏览器工具通常提供背景色选项。",
          },
          {
            question: "已经压过一次的 JPG 转 PNG 后再转 JPG，画质会恢复吗？",
            answer: "不会。JPG 转 PNG 只是把当前的（已损失细节的）像素无损打包为 PNG，PNG 里没有魔法能还原已经丢失的信息。再从这张 PNG 转回 JPG，等于再经历一次有损压缩，画质只会更差不会更好。想避免累积损失，始终从原始未压缩文件（RAW、TIFF 或原始 PNG）作为唯一编辑源，需要 JPG 就直接从源导出。避免 A→B→A→B 反复往返。",
          },
          {
            question: "把手机相册的 HEIC 照片转 PNG 会比转 JPG 更清晰吗？",
            answer: "对，因为 PNG 是无损的，转换过程不会引入压缩伪影。HEIC 本身也是有损压缩，转 PNG 得到的是当前 HEIC 解码后的像素的完整无损副本；转 JPG 会在此基础上再次有损编码。但代价是文件大小：一张 5MB 的 HEIC 转 PNG 通常变成 20–40MB，转 JPG 可能只有 3–4MB。如果目的是编辑或存档，选 PNG；如果是网页展示或分享，选 JPG 或 WebP 更合理。",
          },
          {
            question: "为什么 PNG 转 JPG 后文字周围出现红色或蓝色的边？",
            answer: "那是 JPG 的色度子采样（chroma subsampling）造成的。JPG 默认使用 4:2:0 采样，即把颜色信息（尤其是红蓝分量）以原来 1/4 的分辨率保存，而亮度保留全分辨率。文字的锐利边缘正好是高对比区域，色度信息在缩减时会“漏”到旁边像素，形成红蓝色晕。解决方法：使用支持 4:4:4 采样的 JPG 编码器（体积更大但无此问题），或者干脆保留 PNG——文字图片本来就不适合 JPG。",
          },
          {
            question: "有没有办法把 JPG 里的白色背景自动变成 PNG 的透明背景？",
            answer: "严格意义上没有“自动完全准确”的方法，因为 JPG 已经把白色边缘和背景压成有损数据，主体和背景的边界不再干净。可以用抠图工具（remove.bg、Photoshop 的选择工具、Figma 的删除背景插件）做半自动分离，但边缘细节（毛发、烟雾、玻璃）通常需要手工修补。如果目标是 logo、简单形状，效果会好；如果是复杂人像或半透明物体，很难恢复干净透明背景。最好的做法是保留原始设计文件（PSD、AI、SVG）作为透明素材来源。",
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
          {
            label: "Image EXIF Viewer & Cleaner",
            href: "/image/exif",
            description: "Check or strip metadata before converting between PNG and JPG.",
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
        faq: [
          {
            question: "Can I choose a fill color other than white when converting PNG to JPG?",
            answer: "Yes, if the tool exposes a matte color option. Most converters default to white because it matches typical web backgrounds. If your target is a dark theme like GitHub dark mode, a white matte produces a visible halo. Pick a converter that lets you specify the background color, or pre-composite the transparent PNG onto your target background in Photoshop, Figma, or ImageMagick (`convert in.png -background \"#000000\" -flatten out.jpg`) before converting. Most modern browser tools include a color picker for this.",
          },
          {
            question: "If I convert a JPG to PNG and back to JPG, does quality come back?",
            answer: "No. Converting JPG to PNG just packages the already-lossy pixels losslessly — PNG cannot invent detail that JPG discarded. Going back to JPG applies another round of lossy compression on top of the first, so quality only gets worse. To avoid cumulative damage, keep the original uncompressed source (RAW, TIFF, or original PNG) as your single edit master and export a fresh JPG whenever you need one. Never edit-and-resave a JPG in a round-trip loop.",
          },
          {
            question: "Is converting an iPhone HEIC to PNG sharper than converting to JPG?",
            answer: "Yes, because PNG is lossless — the conversion introduces no new artifacts. HEIC is already lossy, so PNG captures the decoded HEIC pixels exactly; JPG re-encodes them lossily on top. The tradeoff is file size: a 5MB HEIC often becomes 20–40MB as PNG versus 3–4MB as JPG. Choose PNG for editing or archival, JPG or WebP for sharing and the web where the size penalty of PNG rarely justifies the quality difference.",
          },
          {
            question: "Why does text get red or blue fringes after PNG to JPG conversion?",
            answer: "That is chroma subsampling. JPG defaults to 4:2:0, storing color (especially red and blue) at a quarter resolution while keeping luminance full-res. Sharp text edges are high-contrast transitions where color information bleeds into neighboring pixels, producing colored halos. Encode with 4:4:4 subsampling (larger files but no color fringing), or just keep the image as PNG — text-heavy images are a bad fit for JPG regardless of quality setting.",
          },
          {
            question: "Can I automatically turn a JPG's white background into a transparent PNG background?",
            answer: "Not perfectly. JPG already blended the edges of your subject with the white background lossily, so the boundary is no longer clean. Background-removal tools (remove.bg, Photoshop's selection tools, Figma plugins) can do a semi-automatic separation, but detailed edges like hair, smoke, or glass usually need manual retouching. Simple logos and geometric shapes work well; complex portraits or semi-transparent objects rarely produce a clean cutout. The reliable fix is keeping the original design file (PSD, AI, SVG) as the transparent source.",
          },
        ],
      },
    },
  },
  {
    slug: 'keep-image-clear-after-upscaling',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '图片放大后，如何尽量保持清晰',
        excerpt: '图片放大变糊通常不是单一原因造成的。放大倍数、重采样算法、输出格式和原图质量都会影响最终清晰度。',
        metaTitle: '图片放大后如何尽量保持清晰？图片无损放大和清晰增强方法',
        metaDescription: '解释图片放大后变模糊的原因，比较像素无损、平滑高清和清晰增强模式，并给出截图、二维码、图标和照片的清晰放大建议。',
        readingTime: '约 8 分钟阅读',
        tags: ['图片放大', '无损放大', '清晰增强', '图片优化'],
        relatedTools: [
          {
            label: '图片无损放大',
            href: '/image/upscale',
            description: '按 2x、3x、4x 或自定义尺寸放大图片，支持像素无损、平滑高清和清晰增强模式。',
          },
          {
            label: '图片压缩',
            href: '/image/compress',
            description: '图片放大后体积通常会变大，可以继续压缩输出文件。',
          },
          {
            label: '图片尺寸修改',
            href: '/image/resize',
            description: '如果只是调整到指定宽高，可以使用尺寸修改工具按比例缩放。',
          },
          {
            label: "图片旋转 / 翻转",
            href: "/image/rotate",
            description: "放大后如果需要摆正或翻转，可以直接在浏览器本地处理。",
          },
          {
            label: "图片裁剪",
            href: "/image/crop",
            description: "放大后再裁掉边缘噪声，得到干净可用的最终图。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '图片放大后想保持清晰，关键不是单纯把宽高改大，而是根据图片内容选择合适的放大方式、输出格式和后续压缩策略。',
          },
          {
            type: 'paragraph',
            text: '很多人遇到的问题是：小图放大后文字发虚、二维码边缘糊掉、照片细节像被抹平、图标变得不干净。这些现象背后有一个共同原因：原图像素有限，放大时必须用某种算法去生成更多像素。',
          },
          { type: 'heading', level: 2, text: '为什么图片放大后会变模糊？' },
          {
            type: 'paragraph',
            text: '一张 500 × 500 的图片放大到 1000 × 1000，像素数量从 25 万变成 100 万。多出来的 75 万像素并不存在于原图中，放大算法只能根据周围像素推算。',
          },
          {
            type: 'list',
            items: [
              '原图分辨率太低：源图本身没有足够细节，放大后缺点会被一起放大。',
              '放大倍数过高：2x 通常比较自然，4x 以上更容易暴露模糊、噪点和压缩痕迹。',
              '算法不适合内容：照片需要平滑过渡，二维码和像素图需要保留硬边。',
              '输出格式再次压缩：放大后保存为低质量 JPG，可能让边缘和文字再次变糊。',
              '原图已经压缩过：如果源图有 JPG 噪点和色块，放大后这些瑕疵也会更明显。',
            ],
          },
          { type: 'heading', level: 2, text: '先判断图片类型，再选择放大模式' },
          {
            type: 'paragraph',
            text: '没有一种放大方式适合所有图片。想尽量清晰，第一步是判断图片内容：它是照片、截图、二维码、图标，还是带文字的说明图。',
          },
          {
            type: 'table',
            headers: ['图片类型', '推荐模式', '原因'],
            rows: [
              ['二维码、条形码', '像素无损', '边缘必须保持硬朗，平滑会让黑白边界变灰'],
              ['图标、像素图', '像素无损', '保留原始像素块，不引入模糊边缘'],
              ['网页截图、文字截图', '清晰增强', '高质量重采样后轻量锐化，文字边缘更清楚'],
              ['照片、商品图', '平滑高清或清晰增强', '自然图片需要平滑过渡，清晰增强可让边缘略利落'],
              ['透明 PNG 素材', '像素无损或清晰增强', '根据边缘是否需要平滑决定，导出时保留 PNG 更稳'],
            ],
          },
          { type: 'heading', level: 2, text: '三种放大方式有什么区别？' },
          { type: 'heading', level: 3, text: '1. 像素无损：保留硬边，不做平滑' },
          {
            type: 'paragraph',
            text: '像素无损模式会关闭浏览器的平滑插值，相当于把每个像素直接放大成更大的像素块。它不会让照片更自然，但非常适合二维码、图标、像素图和硬边截图。',
          },
          {
            type: 'paragraph',
            text: '如果你的目标是让二维码仍然容易识别、让小图标边缘不发灰、让像素风图片保持原味，优先选择像素无损。',
          },
          { type: 'heading', level: 3, text: '2. 平滑高清：让照片过渡更自然' },
          {
            type: 'paragraph',
            text: '平滑高清模式会使用浏览器的高质量插值。它会让相邻像素之间有更柔和的过渡，适合照片、渐变、背景图和自然场景。',
          },
          {
            type: 'paragraph',
            text: '它的缺点是文字和硬边可能变软。如果你放大的是截图、表格、界面或说明图，平滑高清不一定是最清楚的选择。',
          },
          { type: 'heading', level: 3, text: '3. 清晰增强：重采样后轻量锐化' },
          {
            type: 'paragraph',
            text: '清晰增强模式会使用更高质量的重采样算法，再加一层轻量锐化。它的目标不是凭空生成新细节，而是让已有边缘、文字轮廓和纹理看起来更利落。',
          },
          {
            type: 'paragraph',
            text: '这种模式适合网页截图、文档截图、商品图、头像和通用图片。对于已经很糊的低清照片，它能改善边缘观感，但不能恢复原图没有记录下来的真实细节。',
          },
          { type: 'heading', level: 2, text: '放大倍数怎么选？' },
          {
            type: 'paragraph',
            text: '放大倍数越高，算法需要补出来的像素越多，失真风险也越高。通常建议从 2x 开始，如果还不够，再尝试 3x 或自定义尺寸。',
          },
          {
            type: 'table',
            headers: ['需求', '推荐倍数', '说明'],
            rows: [
              ['小图预览变大', '2x', '最稳，画质风险最低'],
              ['截图用于文章配图', '2x 或 3x', '清晰增强通常比单纯平滑更适合文字'],
              ['二维码打印或展示', '整数倍 2x/3x/4x', '使用像素无损，避免非整数缩放破坏边缘'],
              ['头像或商品图', '2x 或目标宽度', '优先检查人脸、商品边缘和背景噪点'],
              ['极小图标', '整数倍', '像素无损可保留形状，但不适合追求照片感'],
            ],
          },
          { type: 'heading', level: 2, text: '输出格式怎么选？' },
          {
            type: 'list',
            items: [
              'PNG：适合截图、二维码、图标、透明图和需要尽量保留边缘的图片。',
              'JPG：适合照片和商品图，但不要把质量调得太低。',
              'WebP：适合网页使用，在体积和画质之间通常更均衡。',
            ],
          },
          {
            type: 'paragraph',
            text: '如果你不确定，放大后的第一版建议先导出 PNG。确认清晰度后，如果文件太大，再用图片压缩工具转为 WebP 或压缩输出。',
          },
          { type: 'heading', level: 2, text: 'ToolGarden 的图片放大是怎么处理的？' },
          {
            type: 'paragraph',
            text: 'ToolGarden 图片放大工具在浏览器本地完成处理。图片会被浏览器解码到 Canvas，再根据你选择的模式生成目标尺寸。',
          },
          {
            type: 'list',
            items: [
              '像素无损：关闭 Canvas 平滑插值，直接按像素放大。',
              '平滑高清：启用浏览器高质量插值，让照片和渐变过渡更自然。',
              '清晰增强：使用 pica 高质量重采样，并加入轻量 unsharp 锐化，让已有边缘和纹理更清楚。',
              '格式输出：支持 PNG、JPG 和 WebP；PNG 默认保持无损输出。',
              '本地处理：图片不上传服务器，关闭页面后数据不会保留。',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz 图片无损放大',
            text: '上传图片后可以选择 2x、3x、4x 或自定义宽高，并在像素无损、平滑高清和清晰增强模式之间切换。适合截图、二维码、图标、照片和网页配图的本地放大处理。',
            href: '/image/upscale',
            linkLabel: '打开图片放大工具',
          },
          { type: 'heading', level: 2, text: '放大后文件变大怎么办？' },
          {
            type: 'paragraph',
            text: '图片放大后像素数量增加，文件变大是正常的。尤其是 PNG，无损保存会尽量保留每个像素，体积可能明显增长。',
          },
          {
            type: 'list',
            items: [
              '先确认清晰度，再压缩体积，不要一开始就用低质量 JPG。',
              '照片类图片可以尝试 WebP 输出或图片压缩工具。',
              '截图和文字图如果必须保持清晰，优先保留 PNG 或高质量 WebP。',
              '如果只是网页展示，按实际显示宽度输出，不要过度放大。',
            ],
          },
          {
            type: 'callout',
            title: '放大后继续压缩',
            text: '如果放大后的 PNG 或 JPG 文件太大，可以继续使用图片压缩工具，选择保留原格式或输出 WebP，在清晰度和体积之间做最后平衡。',
            href: '/image/compress',
            linkLabel: '打开图片压缩工具',
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '图片放大想尽量清晰，重点是匹配内容：二维码和图标用像素无损，照片用平滑高清，截图和文字图片优先尝试清晰增强。',
          },
          {
            type: 'paragraph',
            text: '同时要记住：放大只能更好地利用已有像素，不能真正恢复原图没有的细节。选择合适模式、合适倍数和合适格式，才是保持清晰度的核心。',
          },
        ],
        faq: [
          {
            question: "AI 放大和传统算法放大有什么本质区别？",
            answer: "传统算法（双线性、双三次、Lanczos）根据周围像素做数学插值，本质上是“平均”出中间像素，永远不会生成原图不存在的细节，放大倍数越高越糊。AI 放大（Real-ESRGAN、waifu2x、Topaz Gigapixel 等）基于神经网络，模型见过大量高低分辨率对，能“预测”高分辨率图应该长什么样，能补出看似合理的边缘、纹理和文字。代价是可能引入不真实的细节（AI 幻觉），有时把不清楚的车牌“补”成错误号码，用于司法或档案存证需谨慎。",
          },
          {
            question: "为什么二维码放大后有时反而扫不出来了？",
            answer: "二维码依赖黑白像素的硬边缘和精确的模块比例。用平滑算法放大时，纯黑与纯白之间会出现灰色过渡带，扫描器可能把灰色误判为黑或白，破坏定位图案和数据模块的识别。放大二维码必须使用像素无损（nearest-neighbor）模式，让每个原始像素变成完整的像素块，边界依然清晰锐利。放大倍数最好是整数（2x、3x、4x），非整数倍会导致像素块大小不均，同样影响识别。",
          },
          {
            question: "小尺寸截图放大到 4K 显示会好看吗？",
            answer: "取决于原截图内容和放大幅度。1080p 截图放大到 4K（约 2x）用清晰增强算法通常还可接受，文字保持可读。但 720p 或更小的截图放到 4K（3x 以上），文字边缘、图标、表格线都会明显发虚，即使 AI 放大也很难完全恢复。更稳妥的做法是从源头重截：如果是网页，把浏览器窗口放大到 200% 再截图，直接得到 2x 像素；如果是应用，切换到 Retina 显示或者用系统截图工具的高分辨率选项。",
          },
          {
            question: "放大后再压缩，和压缩后再放大，哪个损失小？",
            answer: "放大后再压缩损失更小。放大是从像素较少的图生成像素较多的图，放大操作本身不引入不可恢复的信息损失；再压缩时，算法有更多像素可用来评估细节，选择性丢弃更精准。反过来，压缩后再放大是双重损失：先由压缩丢弃细节，再由放大算法基于已损失的数据推测更多像素，边缘和文字更容易糊。工作流应该是：原图 → 放大到目标尺寸 → 适度压缩输出，而不是先压缩再放大。",
          },
          {
            question: "为什么放大后的图片文件体积增长得比像素数还快？",
            answer: "文件体积不仅取决于像素数量，还取决于内容的“复杂度”和压缩效率。放大过程中，特别是使用清晰增强或 AI 模式，算法会在边缘引入新的过渡像素和轻微纹理，让画面看起来更清楚，但从压缩角度看，这些新加的细节增加了熵，压缩算法要用更多字节存储。所以 2x 放大后，像素数是原来 4 倍，文件可能变成 5–8 倍。缓解方法是放大后适度降低 JPG/WebP 质量，或选择更高效的 AVIF 格式。",
          },
        ],
      },
      en: {
        title: 'How to Keep Images Clear After Upscaling',
        excerpt: 'Image upscaling can make edges soft or details look smeared. The best result depends on scale, resampling mode, output format, and source quality.',
        metaTitle: 'How to Keep Images Clear After Upscaling',
        metaDescription: 'Learn why images become blurry after upscaling, how pixel-perfect, Smooth HD, and Sharp enhance modes differ, and how to choose settings for screenshots, QR codes, icons, and photos.',
        readingTime: '8 min read',
        tags: ['image upscale', 'lossless upscale', 'sharp enhance', 'image optimization'],
        relatedTools: [
          {
            label: 'Image Upscale',
            href: '/image/upscale',
            description: 'Upscale images at 2x, 3x, 4x, or custom dimensions with pixel-perfect, Smooth HD, and Sharp enhance modes.',
          },
          {
            label: 'Image Compressor',
            href: '/image/compress',
            description: 'Upscaled images usually become larger, so compress the final output when needed.',
          },
          {
            label: 'Image Resize',
            href: '/image/resize',
            description: 'Resize images proportionally when you only need a specific width or height.',
          },
          {
            label: "Image Rotate / Flip",
            href: "/image/rotate",
            description: "Rotate or flip an upscaled image without leaving the browser.",
          },
          {
            label: "Image Crop",
            href: "/image/crop",
            description: "Trim edge noise after upscaling to produce a clean final image.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Keeping an image clear after upscaling is not just about making the width and height larger. You need the right scaling mode, output format, and compression workflow for the kind of image you have.',
          },
          {
            type: 'paragraph',
            text: 'Common problems include soft screenshot text, blurry QR code edges, smeared photo detail, and icons that no longer look clean. All of these start from the same limitation: the source image has a fixed number of pixels, and upscaling has to create more pixels from them.',
          },
          { type: 'heading', level: 2, text: 'Why do images become blurry after upscaling?' },
          {
            type: 'paragraph',
            text: 'When a 500 by 500 image becomes 1000 by 1000, the pixel count grows from 250,000 to 1,000,000. The extra pixels were not in the original file, so the upscaling algorithm has to estimate them from nearby pixels.',
          },
          {
            type: 'list',
            items: [
              'The source resolution is too low, so the missing detail becomes more obvious.',
              'The scale is too aggressive; 2x is usually safer than 4x or higher.',
              'The algorithm does not match the content; photos and QR codes need different treatment.',
              'The output is compressed again, especially as low-quality JPG.',
              'The source file already has compression blocks or noise, which become larger after upscaling.',
            ],
          },
          { type: 'heading', level: 2, text: 'Choose the mode based on image content' },
          {
            type: 'paragraph',
            text: 'There is no single best upscaling mode for every image. First decide whether the image is a photo, screenshot, QR code, icon, or text-heavy graphic.',
          },
          {
            type: 'table',
            headers: ['Image type', 'Recommended mode', 'Why'],
            rows: [
              ['QR codes and barcodes', 'Pixel-perfect', 'Keeps hard black-and-white edges instead of making them gray'],
              ['Icons and pixel art', 'Pixel-perfect', 'Preserves blocky source pixels without soft edges'],
              ['Web screenshots and text screenshots', 'Sharp enhance', 'High-quality resampling plus light sharpening keeps text clearer'],
              ['Photos and product images', 'Smooth HD or Sharp enhance', 'Natural images need smooth transitions, while light sharpening can help edges'],
              ['Transparent PNG assets', 'Pixel-perfect or Sharp enhance', 'Choose based on whether the edge should stay hard or become smoother'],
            ],
          },
          { type: 'heading', level: 2, text: 'What do the three modes do?' },
          { type: 'heading', level: 3, text: '1. Pixel-perfect: hard edges, no smoothing' },
          {
            type: 'paragraph',
            text: 'Pixel-perfect mode disables smoothing interpolation. Each source pixel is enlarged directly, which keeps hard boundaries intact. It is not meant to make photos look natural, but it is ideal for QR codes, icons, pixel art, and hard-edged screenshots.',
          },
          {
            type: 'paragraph',
            text: 'Use this when scan reliability, icon shape, or pixel-art style matters more than photographic smoothness.',
          },
          { type: 'heading', level: 3, text: '2. Smooth HD: natural transitions for photos' },
          {
            type: 'paragraph',
            text: 'Smooth HD uses high-quality browser interpolation. It creates softer transitions between pixels, which is usually better for photos, gradients, backgrounds, and natural scenes.',
          },
          {
            type: 'paragraph',
            text: 'The tradeoff is that text and hard edges can become softer. For screenshots, tables, interface images, and diagrams, Smooth HD may not be the clearest option.',
          },
          { type: 'heading', level: 3, text: '3. Sharp enhance: resampling plus light sharpening' },
          {
            type: 'paragraph',
            text: 'Sharp enhance uses higher-quality resampling and then applies light sharpening. It does not create new AI detail; it makes existing edges, text contours, and textures look a little cleaner.',
          },
          {
            type: 'paragraph',
            text: 'This mode works well for web screenshots, document screenshots, product images, avatars, and general images. For an already very blurry photo, it can improve edge perception, but it cannot recover real detail that the source file never captured.',
          },
          { type: 'heading', level: 2, text: 'How much should you upscale?' },
          {
            type: 'paragraph',
            text: 'Higher scale means the algorithm has to invent more pixels. Start with 2x when possible, then try 3x or a custom size if you still need a larger result.',
          },
          {
            type: 'table',
            headers: ['Need', 'Suggested scale', 'Note'],
            rows: [
              ['Make a small preview larger', '2x', 'Safest option with the least quality risk'],
              ['Screenshot for an article', '2x or 3x', 'Sharp enhance often works better for text than simple smoothing'],
              ['QR code display or print', 'Integer 2x/3x/4x', 'Use pixel-perfect to avoid damaged edges'],
              ['Avatar or product image', '2x or target width', 'Check face detail, product edges, and background noise'],
              ['Tiny icon', 'Integer scale', 'Pixel-perfect keeps shape but will not make it photographic'],
            ],
          },
          { type: 'heading', level: 2, text: 'Which output format should you choose?' },
          {
            type: 'list',
            items: [
              'PNG is best for screenshots, QR codes, icons, transparent images, and sharp edges.',
              'JPG is fine for photos and product images, but avoid very low quality.',
              'WebP is often a good web format when you want smaller files with good visual quality.',
            ],
          },
          {
            type: 'paragraph',
            text: 'If you are unsure, export the first upscaled version as PNG. Check clarity first, then compress or convert to WebP if the file is too large.',
          },
          { type: 'heading', level: 2, text: 'How ToolGarden upscales images' },
          {
            type: 'paragraph',
            text: 'ToolGarden Image Upscale runs locally in your browser. The image is decoded into Canvas and then rendered to the target dimensions based on the selected mode.',
          },
          {
            type: 'list',
            items: [
              'Pixel-perfect disables Canvas smoothing and enlarges pixels directly.',
              'Smooth HD enables high-quality browser interpolation for more natural transitions.',
              'Sharp enhance uses pica high-quality resampling with light unsharp sharpening for clearer existing edges and textures.',
              'Format output supports PNG, JPG, and WebP; PNG is the default lossless option.',
              'Local processing means the image is not uploaded to a server.',
            ],
          },
          {
            type: 'callout',
            title: 'toolgarden.xyz Image Upscale',
            text: 'Upload an image, choose 2x, 3x, 4x, or custom dimensions, then switch between Pixel-perfect, Smooth HD, and Sharp enhance modes. It is useful for screenshots, QR codes, icons, photos, and web images.',
            href: '/image/upscale',
            linkLabel: 'Open Image Upscale',
          },
          { type: 'heading', level: 2, text: 'What if the upscaled file becomes too large?' },
          {
            type: 'paragraph',
            text: 'Upscaling increases pixel count, so larger files are normal. This is especially true for PNG, which tries to preserve pixels losslessly.',
          },
          {
            type: 'list',
            items: [
              'Check clarity first, then reduce file size afterward.',
              'For photos, try WebP output or the image compressor.',
              'For screenshots and text images, keep PNG or high-quality WebP when readability matters.',
              'For web display, export only the dimensions you actually need.',
            ],
          },
          {
            type: 'callout',
            title: 'Compress after upscaling',
            text: 'If the upscaled PNG or JPG is too large, use Image Compressor afterward. You can preserve the original format or export WebP to balance clarity and file size.',
            href: '/image/compress',
            linkLabel: 'Open Image Compressor',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'To keep an upscaled image clear, match the mode to the content: pixel-perfect for QR codes and icons, Smooth HD for photos, and Sharp enhance for screenshots and text-heavy images.',
          },
          {
            type: 'paragraph',
            text: 'Upscaling can use existing pixels more carefully, but it cannot truly restore detail that is not in the source. The best results come from choosing the right mode, scale, and output format together.',
          },
        ],
        faq: [
          {
            question: "What is the fundamental difference between AI upscaling and traditional algorithms?",
            answer: "Traditional algorithms — bilinear, bicubic, Lanczos — mathematically average nearby pixels to invent intermediate ones. They never add detail that was not there and get blurrier as the scale factor grows. AI upscalers (Real-ESRGAN, waifu2x, Topaz Gigapixel) use neural networks trained on huge low/high-resolution pairs, so they can hallucinate plausible edges, textures, and letters. The tradeoff is exactly that: they are hallucinating. AI upscalers can invent wrong details — famously turning unreadable license plates into confidently-wrong numbers — so avoid them for forensic or archival use.",
          },
          {
            question: "Why does a QR code sometimes stop scanning after I upscale it?",
            answer: "QR codes rely on hard black-and-white edges and precise module ratios. Smooth upscaling introduces gray transition pixels between black and white, and scanners can misread those grays, corrupting the finder patterns and data modules. Always upscale QR codes with nearest-neighbor (pixel-perfect) interpolation so each source pixel becomes a solid larger block with clean edges. Use integer scale factors (2x, 3x, 4x) — non-integer factors produce uneven block sizes that also break recognition.",
          },
          {
            question: "Will a small screenshot look decent when upscaled to 4K?",
            answer: "It depends on the source and scale factor. A 1080p screenshot upscaled to 4K (about 2x) with a sharpening algorithm usually stays readable. A 720p or smaller source at 3x or more will show blurred text edges, muddy icons, and soft table lines that even AI upscaling cannot fully rescue. The better solution is to recapture at higher resolution: zoom the browser to 200% before screenshotting, use a Retina display, or engage your OS's high-resolution capture mode.",
          },
          {
            question: "Which is better — upscale then compress, or compress then upscale?",
            answer: "Upscale first, then compress. Upscaling itself does not introduce recoverable loss — it generates more pixels from fewer. Compressing afterward has more pixels to work with and can drop detail more selectively. The reverse order is doubly lossy: compression discards detail first, then upscaling amplifies whatever remains, exaggerating artifacts along edges and text. The correct pipeline is original → upscale to target size → moderate compression, not compress-then-upscale.",
          },
          {
            question: "Why does the upscaled file grow faster than the pixel count suggests?",
            answer: "File size depends on visual complexity, not just pixel count. Sharpening and AI modes introduce new edge pixels and subtle texture that make the image look crisper but raise the entropy the encoder has to represent. Compression then spends more bytes per pixel. A 2x upscale multiplies pixels by 4 but file size can grow 5–8x. Compensate by lowering JPG or WebP quality after upscaling, or switching to a more efficient codec like AVIF for the final export.",
          },
        ],
      },
    },
  },
  {
    slug: 'why-json-can-have-comments',
    publishedAt: '2026-07-01',
    updatedAt: '2026-07-03',
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
        faq: [
          {
            question: "既然 JSONC 已经能写注释，为什么还要单独有 JSON5？",
            answer: "JSONC 只在标准 JSON 基础上加了注释和尾随逗号，其它语法规则不变。JSON5 走得更远：允许单引号字符串、无引号的对象键（像 JavaScript 一样）、多行字符串、十六进制数字、正负无穷、NaN 等，几乎就是一个静态的 JavaScript 对象字面量。JSONC 目标是让配置文件更好维护，JSON5 目标是让手写数据更友好。二者应用场景不同：VS Code、TypeScript 用 JSONC，某些数据交换、脚本引擎默认使用 JSON5。",
          },
          {
            question: "在代码里用 JSON.parse 读 tsconfig.json 会失败吗？",
            answer: "会。JSON.parse 严格按 RFC 8259 解析，遇到注释和尾随逗号会抛 SyntaxError。tsconfig.json 内部使用的是 JSONC，需要 TypeScript 自带的解析器（ts.parseConfigFileTextToJson 或 jsonc-parser 库）。想在 Node.js 里读带注释的配置，可以先用 strip-json-comments 或 jsonc-parser 清理注释和尾随逗号，再交给 JSON.parse。或者直接用 JSON5 库，兼容更多写法。",
          },
          {
            question: "package.json 可以写注释吗？为什么和 tsconfig.json 不一样？",
            answer: "不可以。package.json 由 npm、yarn、pnpm 等大量工具解析，它们都用严格的 JSON 解析器，遇到 // 或 /* */ 会直接报错，整个项目可能无法安装依赖。tsconfig.json 是 TypeScript 独家读取的，可以指定用 JSONC 解析器；而 package.json 是生态标准，不能强制所有工具改。想给 package.json 加说明，可以用扩展字段（如 \"comment\": \"...\"）或在旁边放一个 README。",
          },
          {
            question: "把 JSONC 转成标准 JSON 会丢失什么？",
            answer: "只会丢失注释和格式（缩进、空行、尾随逗号）。数据结构和值完全保留。转换后的标准 JSON 可以被任意 JSON.parse 读取，也能作为数据交换传给第三方 API。缺点是如果转换是单向的，原本用注释说明的意图会消失；下次修改配置的人只能靠猜。生产环境建议保留 JSONC 源文件（供人阅读），构建时自动生成 JSON 版本供严格解析器使用。",
          },
          {
            question: "为什么 API 返回的 JSON 不能带注释？",
            answer: "因为 API 需要跨语言、跨平台通用。服务端可能用 Go，客户端用 iOS Swift 或 Android Kotlin，中间还有 Nginx、CDN、API 网关。它们都依赖严格 RFC 8259 兼容的 JSON 解析器，注释会让整条链路报错。此外，注释暴露内部字段含义和历史，可能带来安全和维护风险。配置文件是给人看的，可以宽松；API 载荷是给机器读的，必须严格。如果 API 需要说明字段，写在文档而不是 payload 里。",
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
        faq: [
          {
            question: "If JSONC already allows comments, why does JSON5 exist separately?",
            answer: "JSONC only adds comments and trailing commas to standard JSON — everything else stays strict. JSON5 goes much further: single-quoted strings, unquoted object keys (like JavaScript), multi-line strings, hex numbers, +/-Infinity, and NaN. It is essentially a static JavaScript object literal. JSONC targets maintainable config files; JSON5 targets hand-authored data. Different tools pick different variants: VS Code and TypeScript use JSONC, some scripting engines and data pipelines default to JSON5.",
          },
          {
            question: "Will JSON.parse fail on tsconfig.json?",
            answer: "Yes, in most cases. JSON.parse strictly implements RFC 8259 and throws SyntaxError the moment it sees a comment or trailing comma. tsconfig.json is JSONC internally, which requires TypeScript's own parser (ts.parseConfigFileTextToJson) or the jsonc-parser library. To read commented configs from your own Node.js code, either strip comments first with strip-json-comments or jsonc-parser and then call JSON.parse, or use a JSON5 library that handles a superset of these relaxations directly in one step.",
          },
          {
            question: "Can package.json have comments? Why is it different from tsconfig.json?",
            answer: "No. package.json is parsed by npm, yarn, pnpm, and countless other tools, all using strict JSON parsers. A single // or /* */ can break `npm install` for the entire project. tsconfig.json is read exclusively by TypeScript, which chose to use a JSONC parser. package.json is an ecosystem standard — you cannot force every tool to relax its parser. Add explanations via extra fields like \"description\" or a sibling README, not inline comments.",
          },
          {
            question: "What do I lose when converting JSONC to standard JSON?",
            answer: "Only comments and formatting details (indentation, blank lines, trailing commas). All data structures and values are preserved exactly. The resulting JSON is portable to any RFC 8259 parser and safe to send over the wire. The downside is one-way: intent captured in comments disappears, leaving future maintainers to guess. Best practice is to keep the JSONC file as the human source of truth and generate a clean JSON build artifact for strict consumers.",
          },
          {
            question: "Why can't API responses use JSON with comments?",
            answer: "APIs cross language and platform boundaries. A Go server, an iOS Swift client, an Android Kotlin client, and Nginx or an API gateway in between all rely on strict RFC 8259 parsers — comments would break the entire chain. Comments also leak internal reasoning and history, which is a maintenance and sometimes security concern. Config files are for humans and can be relaxed; API payloads are for machines and must be strict. Document API fields in your docs, not in the payload.",
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
  return blogArticles
    .filter((article) => !isConsolidatedBlogSlug(article.slug))
    .map((article) => toLocalizedArticle(article, normalizedLocale));
}

export function getLocalizedBlogArticle(slug: string, locale: string): LocalizedBlogArticle | null {
  const article = blogArticles.find((item) => item.slug === slug);
  if (!article) return null;

  return toLocalizedArticle(article, normalizeBlogLocale(locale));
}

export function getLocalizedBlogTopics(locale: string): LocalizedBlogTopic[] {
  const normalizedLocale = normalizeBlogLocale(locale);

  return blogTopics.flatMap((topic) => {
    const pillar = getLocalizedBlogArticle(topic.pillarSlug, normalizedLocale);
    const clusters = topic.clusterSlugs
      .map((slug) => getLocalizedBlogArticle(slug, normalizedLocale))
      .filter((item): item is LocalizedBlogArticle => Boolean(item));

    if (!pillar || clusters.length !== topic.clusterSlugs.length) return [];

    return [{
      id: topic.id,
      targetKeywords: topic.targetKeywords,
      pillar,
      clusters,
    }];
  });
}

export function getLocalizedBlogTopicForArticle(
  slug: string,
  locale: string
): LocalizedBlogTopicMembership | null {
  const membership = getBlogTopicByArticleSlug(slug);
  if (!membership) return null;

  const topic = getLocalizedBlogTopics(locale).find((item) => item.id === membership.topic.id);
  if (!topic) return null;

  return {
    ...topic,
    role: membership.role,
    targetKeyword: membership.targetKeyword,
  };
}

/**
 * 根据 tag 重叠数和 relatedTools 交集为一篇文章挑选相关文章。
 * - 优先按 tag 重叠数排序
 * - 次要按 relatedTools href 交集数排序
 * - 排除自身
 */
export function getRelatedBlogArticles(
  slug: string,
  locale: string,
  limit = 4
): LocalizedBlogArticle[] {
  const normalizedLocale = normalizeBlogLocale(locale);
  const target = blogArticles.find((item) => item.slug === slug);
  if (!target) return [];
  const targetTranslation = target.translations[normalizedLocale];
  const targetTags = new Set(targetTranslation.tags);
  const targetTools = new Set(targetTranslation.relatedTools.map((tool) => tool.href));

  const scored = blogArticles
    .filter((item) => item.slug !== slug && !isConsolidatedBlogSlug(item.slug))
    .map((item) => {
      const t = item.translations[normalizedLocale];
      const tagOverlap = t.tags.filter((tag) => targetTags.has(tag)).length;
      const toolOverlap = t.relatedTools.filter((tool) => targetTools.has(tool.href)).length;
      return { article: item, score: tagOverlap * 10 + toolOverlap };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((entry) => toLocalizedArticle(entry.article, normalizedLocale));
}
