import { defineToolContent } from './define';

export const imageToPngContent = defineToolContent({
  zh: {
    overview: [
      'PNG 使用无损压缩并支持完整透明通道，适合截图、图标、线稿、文字和需要干净边缘的合成素材。它会精确保留重新编码后的像素，但对照片通常比 JPG 或 WebP 更大。',
      '转换器在浏览器中把可读取的源图重新编码为静态 PNG。转换为无损格式不会恢复源 JPG 已经丢失的细节，只会避免下一次 PNG 保存继续引入有损压缩。动画、原始色彩配置和部分元数据可能不会随转换保留。',
    ],
    steps: [
      ['上传源图片', '确认图片可以正常预览，并判断是否需要保留透明区域。'],
      ['执行 PNG 转换', '让浏览器重新绘制图像并编码为无损 PNG。'],
      ['核对体积与边缘', '检查透明像素、文字锐度和文件大小，满足用途后下载。'],
    ],
    scenarios: [
      ['保存透明素材', '把支持透明的源图片转换为兼容广泛的 PNG，用于网页或演示合成。'],
      ['保护截图锐度', '将界面截图和带文字图形保存为无损文件，避免 JPG 边缘噪声。'],
      ["保存需要反复编辑的中间稿", "无损格式不会在每次保存时累积损失，适合还要继续修改的素材。"],
    ],
    notes: [
      '把 JPG 转成 PNG 不会提升真实画质，文件变大也不代表细节增加。',
      '照片型 PNG 可能很大，若不需要透明和无损像素可考虑 WebP 或 JPG。',
      '动态图片经过静态转换通常只保留当前可解码画面。',
    ],
    specs: [["输入格式", "JPG、WebP、GIF、BMP、SVG、AVIF 等浏览器可解码的图片"], ["压缩类型", "无损。像素不会因为转换而改变"], ["透明通道", "支持。从 WebP 或 AVIF 转来的透明区域会完整保留"], ["体积注意", "从 JPG 转 PNG 通常会明显变大：照片类内容不适合无损编码"], ["动图", "GIF 只取第一帧；需要逐帧导出请用 GIF 分帧 / 合成"], ["适合的内容", "截图、线稿、图标、需要透明背景的素材"]],
    faq: [{ question: "PNG 文件为什么这么大？", answer: "PNG 是无损压缩，照片这类信息密集的内容几乎没有可压缩的冗余。截图和线稿转 PNG 效果很好，照片则更适合 JPG 或 WebP。" }, { question: "从 JPG 转成 PNG 能提升画质吗？", answer: "不能。JPG 已经丢掉的信息不会因为换成无损容器而回来。转 PNG 的意义在于之后的编辑不再叠加损失，而不是修复已有的压缩痕迹。" }],
    reference: [
      ['lossless compression', '编码和解码后像素值保持一致的压缩方式。'],
      ['alpha transparency', '允许每个像素拥有从完全透明到完全不透明的连续透明度。'],
    ],
  },
  en: {
    overview: [
      'PNG uses lossless compression and supports full alpha transparency, making it suitable for screenshots, icons, line art, text, and compositing assets with clean edges. It preserves the re-encoded pixels exactly but is commonly larger than JPG or WebP for photographs.',
      'The converter re-encodes a readable source as a static PNG in the browser. Moving to a lossless format does not restore detail already removed from a JPG; it only avoids new lossy degradation in the PNG save. Animation, original color profiles, and some metadata may not carry over.',
    ],
    steps: [
      ['Upload the source', 'Confirm it previews correctly and determine whether transparent regions must be retained.'],
      ['Convert to PNG', 'Let the browser redraw the image and encode it as a lossless PNG.'],
      ['Check size and edges', 'Inspect transparent pixels, text sharpness, and file size before downloading.'],
    ],
    scenarios: [
      ['Preserving a transparent asset', 'Convert an alpha-capable source to broadly supported PNG for web or presentation compositing.'],
      ['Keeping a screenshot sharp', 'Store interfaces and text-heavy graphics without the edge noise introduced by JPG.'],
      ["Keeping a working copy you will edit again", "A lossless format accumulates no damage across repeated saves, which is what you want for material still in progress."],
    ],
    notes: [
      'Converting JPG to PNG does not improve real quality; a larger file does not mean that lost detail returned.',
      'Photographic PNG files can be large. Consider WebP or JPG if transparency and exact pixels are unnecessary.',
      'A static conversion of an animated image normally retains only the decoded still frame.',
    ],
    specs: [["Input formats", "JPG, WebP, GIF, BMP, SVG, AVIF; anything the browser can decode"], ["Compression", "Lossless. Pixels are not altered by the conversion"], ["Transparency", "Supported; alpha from a WebP or AVIF source comes through intact"], ["Size warning", "JPG to PNG usually gets noticeably larger; photographic content is a poor fit for lossless encoding"], ["Animation", "Only the first frame of a GIF; use GIF Frames to export every frame"], ["Best for", "Screenshots, line art, icons, and anything needing a transparent background"]],
    faq: [{ question: "Why is the PNG so large?", answer: "PNG is lossless, and information-dense content like photographs has almost no redundancy to squeeze. Screenshots and line art compress well as PNG; photographs belong in JPG or WebP." }, { question: "Does JPG to PNG improve quality?", answer: "No. What JPG already discarded does not return because you moved it into a lossless container. The point is that further editing adds no new loss, not that existing artefacts are repaired." }],
    reference: [
      ['lossless compression', 'Compression that preserves pixel values through an encode-decode round trip.'],
      ['alpha transparency', 'Per-pixel opacity ranging continuously from fully transparent to fully opaque.'],
    ],
  },
});
