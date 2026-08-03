import { defineToolContent } from './define';

export const imageToIconContent = defineToolContent({
  zh: {
    overview: [
      '图标转换会把普通图片缩放并封装为适合网站或桌面环境使用的图标文件。图标经常在 16、32、48、128 或 256 像素等小尺寸显示，因此清晰的轮廓、有限的细节和透明背景比原图分辨率更重要。',
      '工具用于从源图片生成常见图标尺寸和格式。方形素材最稳定；非方形图片如果直接缩放可能变形或留下空白，最好先裁成 1:1，并在浅色和深色背景上验证边缘。',
    ],
    steps: [
      ['准备方形源图', '裁掉多余留白，保持主体居中，并尽量使用透明背景的高分辨率 PNG。'],
      ['选择图标尺寸', '根据浏览器 favicon、应用快捷方式或桌面程序要求选择目标规格。'],
      ['检查小尺寸效果', '按实际像素预览，确认线条没有糊成一团，随后下载并在目标环境测试。'],
    ],
    scenarios: [
      ['生成网站 favicon', '从品牌标识创建浏览器标签需要的小尺寸图标，并检查 16 像素下的辨识度。'],
      ['制作应用图标素材', '为快捷方式或桌面程序导出要求的方形尺寸，保持透明边缘干净。'],
      ["为网站生成 favicon", "从品牌标识生成多尺寸 ICO，覆盖浏览器标签页、书签栏和桌面快捷方式几种展示位置。"],
    ],
    notes: [
      '复杂照片在极小尺寸下通常不可辨认，图标应使用简化图形和明显轮廓。',
      '不同平台可能要求多尺寸 ICO、PNG 或专用资源包，应以目标平台文档为准。',
      '透明边缘若存在半透明杂色，会在深色主题上形成光晕，导出前需要检查。',
    ],
    specs: [["输出格式", "ICO（Windows）、ICNS（macOS）或多尺寸 PNG 的 ZIP 包"], ["常见尺寸", "16、32、48、64、128、256、512 px，图标文件内可同时容纳多个尺寸"], ["输入建议", "使用正方形、大尺寸、构图简洁的源图。SVG 或 512 px 以上的 PNG 效果最好"], ["小尺寸的取舍", "16 px 下细节几乎全部消失，复杂图形会糊成一团；图标设计需要在小尺寸下仍可辨识"], ["透明通道", "保留。图标通常需要透明背景，源图建议直接用透明 PNG"], ["用途", "网站 favicon、桌面应用图标、快捷方式图标"]],
    faq: [{ question: "为什么小尺寸下图标糊成一团？", answer: "16 px 只有 256 个像素，容不下细节。图标设计需要在这个尺寸下仍可辨识：通常意味着放弃细线条和文字，只保留一个强轮廓。这是设计问题，不是转换质量问题。" }, { question: "ICO、ICNS 和 PNG 该选哪个？", answer: "Windows 应用和网站 favicon 用 ICO，macOS 应用用 ICNS，跨平台或由框架自己处理时用多尺寸 PNG 的 ZIP 包。前两种可以在单个文件内同时容纳多个尺寸。" }],
    reference: [
      ['favicon', '浏览器标签、收藏夹和历史记录中代表网站的小型图标。'],
      ['raster icon', '由固定像素网格组成的图标，在非整数倍缩放时可能变得模糊。'],
    ],
  },
  en: {
    overview: [
      'Icon conversion scales and packages a regular image for browser or desktop icon use. Icons are often shown at 16, 32, 48, 128, or 256 pixels, so a strong silhouette, limited detail, and a clean transparent background matter more than the original photo resolution.',
      'The tool generates common icon dimensions and formats from a source image. A square asset is most predictable. Crop non-square artwork to 1:1 first to avoid distortion or excess padding, and inspect the edges over both light and dark backgrounds.',
    ],
    steps: [
      ['Prepare a square source', 'Remove extra whitespace, center the subject, and preferably start from a high-resolution transparent PNG.'],
      ['Choose icon dimensions', 'Select the sizes required for a browser favicon, application shortcut, or desktop program.'],
      ['Inspect at real size', 'Preview at the actual pixel dimensions, confirm lines remain distinct, and test the download in its destination.'],
    ],
    scenarios: [
      ['Generating a website favicon', 'Create tab-sized icons from a brand mark and check recognition at 16 pixels.'],
      ['Preparing application assets', 'Export square sizes required by a shortcut or desktop app with clean transparent edges.'],
      ["Generating a favicon set for a site", "One brand mark becomes a multi-size ICO covering the browser tab, the bookmarks bar and desktop shortcuts."],
    ],
    notes: [
      'Detailed photographs are usually unreadable at tiny sizes; icons benefit from simplified shapes and strong contours.',
      'Platforms may require multi-size ICO, PNG, or a dedicated asset package, so follow the target platform documentation.',
      'Contaminated semi-transparent edges create halos in dark themes and should be checked before release.',
    ],
    specs: [["Output formats", "ICO (Windows), ICNS (macOS), or a ZIP of multi-size PNGs"], ["Common sizes", "16, 32, 48, 64, 128, 256 and 512 px; an icon file can hold several sizes at once"], ["Source advice", "Use a square, large, visually simple image. SVG or a PNG of 512 px and up works best"], ["The small-size trade-off", "At 16 px almost all detail disappears and complex artwork turns to mush; an icon has to stay legible that small"], ["Transparency", "Preserved. Icons usually need a transparent background, so start from a transparent PNG"], ["Used for", "Website favicons, desktop application icons, shortcut icons"]],
    faq: [{ question: "Why is the small size an unreadable blob?", answer: "16 px is 256 pixels total, which holds no detail. An icon has to stay legible at that size, which usually means dropping thin strokes and lettering in favour of one strong silhouette. That is a design constraint, not a conversion problem." }, { question: "ICO, ICNS or PNG?", answer: "ICO for Windows applications and site favicons, ICNS for macOS applications, and a ZIP of multi-size PNGs when the target is cross-platform or a framework handles it. The first two can hold several sizes inside one file." }],
    reference: [
      ['favicon', 'The small website icon displayed in browser tabs, bookmarks, and history.'],
      ['raster icon', 'An icon made from a fixed pixel grid that may blur when scaled by a non-integer factor.'],
    ],
  },
});
