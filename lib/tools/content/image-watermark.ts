import { defineToolContent } from './define';

export const imageWatermarkContent = defineToolContent({
  zh: {
    overview: [
      '添加水印可以在图片上叠加文字或图形标识，并控制位置、间距、透明度、尺寸、旋转和重复布局。单点水印适合署名或品牌角标，平铺水印更难通过简单裁剪移除，但也会更明显地干扰画面。',
      '工具在浏览器中生成预览并导出 PNG、JPG 或 WebP。水印能表达来源和使用约束，却不能从技术上阻止截图、裁切或重绘，因此重要素材仍需要合适的许可证、访问控制和原始文件管理。',
    ],
    steps: [
      ['上传主图并选类型', '选择文字或图片水印，图片标识建议使用边缘清晰的透明 PNG。'],
      ['调整样式与布局', '设置颜色、字体、透明度、位置或平铺间距，在不同画面区域检查可读性。'],
      ['预览后导出', '确认没有遮住关键主体或必要信息，再选择保留透明度和体积需求的格式。'],
    ],
    scenarios: [
      ['发布作品预览', '为摄影、插画或设计稿添加低透明度署名，区分预览文件与交付原件。'],
      ['标记内部资料', '平铺项目名、日期或保密级别，降低文件脱离上下文后被误用的概率。'],
      ["给外发的样图加署名", "投稿或提案时在样图上加上署名和用途标记，降低被直接取用的可能。"],
    ],
    notes: [
      '水印文字应简短且与背景保持足够对比度，过低透明度可能在浅色或复杂区域消失。',
      'JPG 不支持透明背景；需要保持主图透明区域时应导出 PNG 或 WebP。',
      '添加水印不替代版权登记、合同或权限控制，也不要覆盖依法必须保留的来源信息。',
    ],
    specs: [["水印类型", "文字水印或图片水印"], ["定位方式", "自由拖动、九宫格定位、平铺、对角线平铺"], ["可调参数", "透明度、旋转角度、间距、字号或图片缩放"], ["能防盗图吗", "不能完全防。水印是叠加在像素上的可见标识，可以被裁剪或用修复工具削弱"], ["更难移除的做法", "覆盖面积大、跨越主体、半透明的对角线平铺，比角落里的小水印难处理得多"], ["输出", "带水印的图片，原图不变"]],
    faq: [{ question: "水印放在哪里比较好？", answer: "角落里的小水印最不影响观感，但也最容易被裁掉。跨越主体的半透明对角线平铺最难去除，代价是明显影响阅读。按素材的用途在两者之间取舍。" }, { question: "文字水印和图片水印怎么选？", answer: "文字水印可以带上具体信息（用途、日期、接收方），适合追溯泄露来源；图片水印适合统一品牌标识。两者的定位和透明度参数是一样的。" }],
    reference: [
      ['opacity', '水印像素的不透明程度，降低数值会让底图透出更多。'],
      ['tiled watermark', '以固定间距重复覆盖画面的水印布局，可减少通过裁边完全移除的可能。'],
    ],
  },
  en: {
    overview: [
      'Watermarking overlays text or a graphic and controls its position, spacing, opacity, scale, rotation, and repeated layout. A single anchor suits a credit or brand bug. A tiled mark is harder to remove with a simple crop but interferes more visibly with the image.',
      'The tool previews in the browser and exports PNG, JPG, or WebP. A watermark communicates source and usage constraints but cannot technically prevent screenshots, cropping, or repainting, so valuable assets still need appropriate licensing, access control, and source-file management.',
    ],
    steps: [
      ['Upload the base image and choose a type', 'Select text or image watermarking; a sharp transparent PNG works well for a graphic mark.'],
      ['Adjust style and layout', 'Set color, font, opacity, anchor, or tile spacing and check readability over different image regions.'],
      ['Preview and export', 'Confirm that critical subjects and required information remain visible, then choose a format for transparency and size needs.'],
    ],
    scenarios: [
      ['Publishing a work preview', 'Add a subtle credit to photography, illustration, or design work to distinguish previews from delivered originals.'],
      ['Marking internal material', 'Tile a project name, date, or confidentiality label so a detached file retains its context.'],
      ["Signing sample images before sending them out", "Adding a byline and a purpose note to samples in a submission or pitch makes casual reuse less likely."],
    ],
    notes: [
      'Keep watermark text concise and sufficiently contrasted; very low opacity can disappear over light or detailed regions.',
      'JPG has no transparent background. Export PNG or WebP when transparency in the base image must remain.',
      'A watermark does not replace registration, contracts, or access control, and it must not cover attribution that the law or license requires.',
    ],
    specs: [["Watermark types", "Text or an image"], ["Positioning", "Free drag, nine-point placement, tiling, or diagonal tiling"], ["Adjustable", "Opacity, rotation, spacing, and text size or image scale"], ["Does it stop image theft", "Not entirely. A watermark is a visible mark on the pixels and can be cropped out or weakened with inpainting"], ["Harder to remove", "Large, semi-transparent diagonal tiling that crosses the subject is far more resistant than a small mark in a corner"], ["Output", "The watermarked image; the original is untouched"]],
    faq: [{ question: "Where should the watermark go?", answer: "A small mark in a corner is least intrusive and easiest to crop away. Semi-transparent diagonal tiling across the subject is hardest to remove but clearly affects readability. Choose by what the image is for." }, { question: "Text or image watermark?", answer: "A text watermark can carry specifics; purpose, date, recipient; which helps trace where a leak came from. An image watermark suits consistent brand marking. Positioning and opacity work the same for both." }],
    reference: [
      ['opacity', 'How opaque the watermark pixels are; lower values allow more of the base image to show through.'],
      ['tiled watermark', 'A mark repeated at fixed spacing across the canvas, reducing the chance of removal through edge cropping alone.'],
    ],
  },
});
