import { defineToolContent } from './define';

export const imageRemoveBgContent = defineToolContent({
  zh: {
    overview: [
      '图片去背景会识别主要前景并生成透明蒙版，使人物、商品或物体能够叠加到新的背景上。工具提供偏质量和偏速度的模型选择，处理在浏览器端执行，首次使用某个模型时通常需要加载相应资源。',
      '分离质量取决于主体边界、前后景对比和原图分辨率。头发、透明材质、阴影、细网格及与背景颜色接近的区域最容易出现缺口或残留，导出前应在棋盘格和深浅两种背景上检查轮廓。',
    ],
    steps: [
      ['选择清晰原图', '优先上传主体完整、光线均匀且边界与背景有明显区别的图片。'],
      ['选择处理模型', '普通预览可优先速度模式，细发丝或商品边缘可尝试质量模式。'],
      ['检查透明边缘', '放大观察轮廓、内部孔洞与半透明区域，确认后导出带透明通道的结果。'],
    ],
    scenarios: [
      ['制作商品素材', '分离商品后统一放到品牌色、场景图或电商白底中。'],
      ['准备人物头像', '移除杂乱环境，让人物可用于简历、演示文稿或社交资料。'],
      ["为商品图换背景", "电商详情页需要统一的纯色或场景背景，先去掉原背景再合成到目标底图上。"],
    ],
    notes: [
      '自动分割是估计结果，不适合作为法律证据、医学影像或需要像素级准确性的抠图依据。',
      '透明结果应保存为 PNG 或支持 alpha 的 WebP，保存成 JPG 会失去透明通道。',
      '首次模型加载耗时取决于网络与设备性能，批量处理前可先用一张代表性图片测试。',
    ],
    specs: [["输出", "透明背景的 PNG"], ["模型", "浏览器内运行的开源分割模型，首次使用需要下载数十 MB 模型文件"], ["效果较好", "主体与背景对比清晰的人像、商品图、单一主体照片"], ["常见瑕疵", "发丝、毛边、半透明材质（玻璃、纱、烟雾）和与背景同色的边缘容易抠不干净"], ["耗时", "推理在本地完成，大图和低配设备会明显变慢"], ["后续处理", "需要换底色或按证件尺寸构图，直接用证件照制作更省事"]],
    faq: [{ question: "发丝和毛边为什么抠不干净？", answer: "分割模型按区域判断前景背景，而发丝是细密的半透明结构，逐像素判断本来就困难。深色头发配深色背景尤其容易出错，换一张背景对比清晰的原图效果会好很多。" }, { question: "处理为什么第一次特别慢？", answer: "首次使用需要把数十 MB 的模型文件下载到浏览器。下载后会被缓存，同一浏览器再次使用就快得多。清理站点数据会让缓存失效，下次需要重新下载。" }],
    reference: [
      ['alpha channel', '每个像素记录不透明度的通道，0 表示完全透明，最大值表示完全不透明。'],
      ['segmentation mask', '模型对每个像素属于前景或背景的估计，用于合成透明结果。'],
    ],
  },
  en: {
    overview: [
      'Background removal identifies the main foreground and creates a transparency mask so a person, product, or object can be placed over another scene. The tool offers quality-oriented and speed-oriented models and processes in the browser; the selected model may need to load on first use.',
      'Separation quality depends on boundary clarity, foreground-background contrast, and source resolution. Hair, transparent materials, shadows, fine mesh, and similarly colored regions are hardest, so inspect edges on a checkerboard and on both light and dark backgrounds before export.',
    ],
    steps: [
      ['Choose a clear source', 'Prefer an evenly lit image with the whole subject visible and strong separation from the background.'],
      ['Select a model', 'Use the faster model for routine previews and try the quality model for hair or detailed product edges.'],
      ['Inspect transparent edges', 'Zoom into the outline, internal gaps, and translucent regions, then export a format with alpha support.'],
    ],
    scenarios: [
      ['Creating product artwork', 'Isolate a product and place it on a brand color, lifestyle scene, or consistent store background.'],
      ['Preparing a profile portrait', 'Remove a distracting environment so the person can be used in a résumé, presentation, or social profile.'],
      ["Re-backgrounding product photos", "Store listings need a consistent flat or styled backdrop, so the original background comes off first and the subject is composited onto the target."],
    ],
    notes: [
      'Automatic segmentation is an estimate and is not suitable as pixel-accurate evidence for legal, medical, or forensic work.',
      'Save transparent output as PNG or alpha-capable WebP. JPG discards transparency.',
      'Initial model loading depends on the network and device. Test one representative image before a large batch.',
    ],
    specs: [["Output", "A PNG with a transparent background"], ["Model", "An open-source segmentation model running in-browser; the first run downloads tens of megabytes"], ["Works well on", "Portraits, product shots and single-subject photos where subject and background contrast clearly"], ["Common artefacts", "Hair strands, fur, semi-transparent materials (glass, mesh, smoke) and edges the same colour as the background"], ["Time required", "Inference runs locally, so large images and modest hardware are noticeably slower"], ["Next step", "If you need a solid backdrop or a passport-sized crop, ID Photo Maker does both in one pass"]],
    faq: [{ question: "Why are hair strands and fur left ragged?", answer: "Segmentation models decide foreground and background by region, and hair is a fine semi-transparent structure that is genuinely hard to resolve per pixel. Dark hair against a dark background is the worst case; reshooting against a contrasting background helps enormously." }, { question: "Why is the first run so slow?", answer: "The first use downloads tens of megabytes of model files into the browser. They are cached afterwards, so subsequent runs in the same browser are much faster. Clearing site data invalidates the cache and forces a fresh download." }],
    reference: [
      ['alpha channel', 'A per-pixel opacity channel where zero is transparent and the maximum is fully opaque.'],
      ['segmentation mask', 'A model estimate of which pixels belong to foreground or background, used to compose transparent output.'],
    ],
  },
});
