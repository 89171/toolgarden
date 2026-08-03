import { defineToolContent } from './define';

export const imageToAvifContent = defineToolContent({
  zh: {
    overview: [
      'AVIF 基于 AV1 图像编码，面向高压缩效率和现代网页交付，支持有损、无损、高动态范围与透明度等能力。照片和复杂渐变在合适设置下可能比 JPG 或 WebP 更小，但编码通常更耗时。',
      '工具在浏览器能力允许时把静态图片编码为 AVIF。由于浏览器、操作系统和旧版创作软件的支持差异比 JPG、PNG 更明显，AVIF 更适合作为网页优化版本，同时保留一个兼容回退格式。',
    ],
    steps: [
      ['上传静态图片', '先确认源图质量与最终展示尺寸，避免为不会显示的像素付出编码成本。'],
      ['选择质量并转换', '从中高质量开始编码，耐心等待大图处理完成。'],
      ['检查画质与支持', '观察细纹理和渐变，并在目标浏览器或应用中验证能否正常打开。'],
    ],
    scenarios: [
      ['建立现代网页资源', '为支持 AVIF 的浏览器提供更小图片，并用 WebP 或 JPG 作为回退。'],
      ['压缩高分辨率照片', '在可接受处理时间内尝试降低图库或文章首图的传输体积。'],
      ["压到最小的网页图片交付", "带宽敏感的场景下，AVIF 通常比同画质 WebP 再小一截，适合首屏大图。"],
    ],
    notes: [
      'AVIF 编码可能明显慢于 JPG 和 WebP，处理超大图片时应关注设备内存与响应时间。',
      '并非所有图片都能获得更小体积，应比较同等可接受画质，而不是只比较相同质量数字。',
      '发布到第三方平台前先确认其不会拒绝、错误转码或移除 AVIF 文件。',
    ],
    specs: [["输入格式", "JPG、PNG、WebP、GIF、BMP、SVG 等浏览器可解码的图片"], ["体积表现", "同等观感下通常比 WebP 再小一截，是目前主流格式里最小的"], ["编码耗时", "明显慢于 JPG 和 WebP，大图或批量处理需要等待"], ["兼容性", "现代浏览器普遍支持，但老浏览器、部分设计软件和系统预览仍不识别"], ["透明与色深", "支持透明通道和 10 bit 色深，渐变过渡比 8 bit 格式更平滑"], ["使用建议", "适合可控的网页交付场景；作为需要给他人打开的通用文件时风险较高"]],
    faq: [{ question: "为什么转换这么慢？", answer: "AVIF 的编码复杂度远高于 JPG 和 WebP，这是它换取更小体积的代价。大图或批量处理需要耐心等待，低配设备上尤其明显。" }, { question: "别人打不开我发的 AVIF 文件？", answer: "浏览器普遍支持，但很多设计软件、系统预览和聊天工具仍不识别。AVIF 适合你能控制展示环境的网页交付；作为需要给他人打开的通用文件，用 JPG 或 PNG 更稳妥。" }],
    reference: [
      ['AVIF', '使用 AV1 编码技术的图像文件格式，重点面向高压缩效率。'],
      ['fallback', '在首选格式不被支持时提供的兼容替代资源。'],
    ],
  },
  en: {
    overview: [
      'AVIF uses AV1 image coding for high compression efficiency and modern web delivery, with capabilities including lossy or lossless coding, high dynamic range, and transparency. Photographs and complex gradients can be smaller than JPG or WebP at suitable settings, although encoding is usually slower.',
      'The tool encodes a static image as AVIF when browser capability allows. Support varies more across browsers, operating systems, and older creative software than it does for JPG or PNG, so AVIF works best as an optimized web source with a compatible fallback retained.',
    ],
    steps: [
      ['Upload a static image', 'Confirm the source quality and final display dimensions so encoding is not spent on unused pixels.'],
      ['Choose quality and convert', 'Start in the medium-to-high range and allow extra time for a large source.'],
      ['Check quality and support', 'Inspect fine texture and gradients, then open the file in the actual target browser or application.'],
    ],
    scenarios: [
      ['Building modern web assets', 'Serve a smaller AVIF to capable browsers while retaining WebP or JPG as a fallback.'],
      ['Compressing a high-resolution photo', 'Reduce transfer size for a gallery or article hero where the encoding time is acceptable.'],
      ["Delivering the smallest possible web images", "Where bandwidth matters, AVIF typically undercuts WebP at matching quality, which suits large above-the-fold images."],
    ],
    notes: [
      'AVIF encoding can be much slower than JPG or WebP, so watch device memory and response time with very large images.',
      'Not every source becomes smaller. Compare formats at equally acceptable visual quality, not at matching numeric quality values.',
      'Before publishing to a third-party platform, confirm that it will not reject, mishandle, or strip the AVIF file.',
    ],
    specs: [["Input formats", "JPG, PNG, WebP, GIF, BMP, SVG; anything the browser can decode"], ["Size", "Usually smaller again than WebP at matching quality; the smallest of the mainstream formats today"], ["Encoding time", "Noticeably slower than JPG or WebP; expect a wait on large images or batches"], ["Compatibility", "Widely supported in modern browsers, but older browsers, some design software and OS previews still cannot open it"], ["Transparency and bit depth", "Supports alpha and 10-bit colour, so gradients band less than in 8-bit formats"], ["When to use it", "Good for controlled web delivery; risky as a general-purpose file you hand to someone else"]],
    faq: [{ question: "Why is encoding so slow?", answer: "AVIF encoding is far more computationally demanding than JPG or WebP; that is what buys the smaller file. Expect a wait on large images or batches, especially on modest hardware." }, { question: "The AVIF I sent will not open for someone; why?", answer: "Browser support is broad, but many design applications, OS previews and chat clients still cannot read it. AVIF suits web delivery where you control the environment; for a file someone else must open, send JPG or PNG." }],
    reference: [
      ['AVIF', 'An image file format based on AV1 coding technology and designed for high compression efficiency.'],
      ['fallback', 'A compatible alternative resource used when the preferred format is unsupported.'],
    ],
  },
});
