import { defineToolContent } from './define';

export const imageToWebpContent = defineToolContent({
  zh: {
    overview: [
      'WebP 同时支持有损与无损压缩、透明通道和动画，常用于在网页中减少图片传输体积。对于照片，它通常能在相近观感下比传统 JPG 更小；对于透明图，也可能比 PNG 更紧凑，但结果取决于内容和质量设置。',
      '本工具把静态源图在浏览器中编码为 WebP，并提供质量控制。现代浏览器普遍支持 WebP，但旧版软件、部分印刷流程和内容管理系统可能仍要求 JPG 或 PNG，发布前应检查下游兼容性。',
    ],
    steps: [
      ['上传并识别用途', '判断源图是照片、透明素材还是文字图形，并记录原始体积。'],
      ['设置输出质量', '从较高质量开始，逐步降低并重点检查细节、渐变和透明边缘。'],
      ['验证兼容性', '比较体积后下载，并在真实浏览器、CMS 或接收软件中打开测试。'],
    ],
    scenarios: [
      ['优化网页图片', '将照片和卡片配图转换为 WebP，降低页面加载所需的字节数。'],
      ['压缩透明资源', '为网页导出带 alpha 的图形，同时尝试获得比 PNG 更小的文件。'],
      ["批量替换网站图片资源", "把站点上的 JPG 和 PNG 统一转成 WebP，在观感基本不变的前提下明显减少首屏加载体积。"],
    ],
    notes: [
      '动画源图通过静态转换器处理时不会保留完整帧序列。',
      '极低质量会在文字、边缘和渐变处产生模糊或色带，应按实际显示尺寸检查。',
      '若接收方明确只支持 JPG 或 PNG，应优先满足兼容要求，而不是仅追求更小体积。',
    ],
    specs: [["输入格式", "JPG、PNG、GIF、BMP、SVG、AVIF 等浏览器可解码的图片"], ["两种模式", "有损与无损。有损适合照片，无损适合截图和线稿"], ["体积对比", "结果取决于源格式、画面复杂度和质量设置；应以实际导出的文件和观感为准"], ["透明通道", "支持，且与有损压缩可同时使用：这是 WebP 相对 JPG 的主要优势"], ["兼容性", "所有现代浏览器均支持；部分老旧图像软件和系统预览可能仍不识别"], ["典型用途", "网页图片交付，在不明显损失观感的前提下降低加载体积"]],
    faq: [{ question: "有损和无损模式怎么选？", answer: "照片选有损，体积优势最明显；截图、线稿、含大量文字的图选无损，避免边缘出现杂色。需要透明背景时两种模式都支持。" }, { question: "还需要为老浏览器准备 JPG 备份吗？", answer: "所有现代浏览器都支持 WebP，一般不再需要。但如果你的访客里有相当比例使用很老的系统，或者图片会被下载后用旧图像软件打开，保留一份 JPG 更稳妥。" }],
    reference: [
      ['WebP', 'Google 推出的现代图像格式，支持有损、无损、透明与动画能力。'],
      ['alpha channel', '独立于颜色的透明度信息，允许图像与页面背景自然叠加。'],
    ],
  },
  en: {
    overview: [
      'WebP supports lossy and lossless compression, alpha transparency, and animation, and is commonly used to reduce image transfer size on the web. For photographs it can be smaller than traditional JPG at similar appearance, while transparent graphics may be more compact than PNG depending on content and settings.',
      'This tool encodes a static source as WebP in the browser with a quality control. Modern browsers broadly support WebP, but old software, some print workflows, and some content systems still require JPG or PNG, so downstream compatibility should be checked before publishing.',
    ],
    steps: [
      ['Upload and identify the use', 'Determine whether the source is a photograph, transparent asset, or text graphic and note its original size.'],
      ['Set output quality', 'Begin high, lower gradually, and inspect fine detail, gradients, and transparent edges.'],
      ['Validate compatibility', 'Compare sizes, download, and open the result in the actual browser, CMS, or receiving software.'],
    ],
    scenarios: [
      ['Optimizing web imagery', 'Convert photographs and card artwork to WebP to reduce bytes needed for page loading.'],
      ['Compressing a transparent asset', 'Export an alpha graphic for the web while trying to improve on PNG file size.'],
      ["Swapping a site's image assets in bulk", "Converting a site's JPGs and PNGs to WebP cuts first-paint payload noticeably with no visible change in quality."],
    ],
    notes: [
      'A static converter does not retain the full frame sequence from an animated source.',
      'Very low quality creates blur or banding around text, edges, and gradients, so judge at the real display size.',
      'If the recipient explicitly requires JPG or PNG, prioritize compatibility over file-size gains.',
    ],
    specs: [["Input formats", "JPG, PNG, GIF, BMP, SVG, AVIF; anything the browser can decode"], ["Two modes", "Lossy and lossless. Lossy suits photographs, lossless suits screenshots and line art"], ["Size comparison", "Depends on the source format, image complexity, and quality setting; compare the real export and its appearance"], ["Transparency", "Supported, and usable together with lossy compression; the main advantage over JPG"], ["Compatibility", "Every modern browser supports it; some older image software and OS previews still do not"], ["Typical use", "Reducing web-image payload while checking the actual export against the source"]],
    faq: [{ question: "Lossy or lossless mode?", answer: "Lossy for photographs, where the size advantage is largest. Lossless for screenshots, line art and text-heavy images, to avoid artefacts at the edges. Transparency works in both." }, { question: "Do I still need a JPG fallback for old browsers?", answer: "Every modern browser supports WebP, so usually not. Keep a JPG copy if a meaningful share of your visitors run very old systems, or if the images get downloaded and opened in legacy image software." }],
    reference: [
      ['WebP', 'A modern image format from Google supporting lossy, lossless, alpha, and animation features.'],
      ['alpha channel', 'Opacity information separate from color, allowing an image to blend over a page background.'],
    ],
  },
});
