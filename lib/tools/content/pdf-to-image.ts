import { defineToolContent } from './define';

export const pdfToImageContent = defineToolContent({
  zh: {
    overview: ['PDF 转图片会把每一页按指定分辨率渲染为位图，适合生成预览、缩略图或供不支持 PDF 的系统使用。文字和矢量图在渲染后变成固定像素，无法再像 PDF 内容那样无损缩放或选择。', '清晰度和文件体积取决于渲染尺寸、页面数量与图片格式。PNG 适合文字和线条，JPG 更适合照片型页面；扫描 PDF 本身已经是位图，提高输出分辨率不会恢复扫描时缺失的细节。'],
    steps: [['上传并检查页数', '确认所有页面方向与尺寸，并估算输出文件数量。'], ['选择格式与清晰度', '文字页面优先 PNG，照片页面可比较 JPG 的质量和体积。'], ['查看代表性页面', '放大检查小字、细线和图表，再下载单页或打包结果。']],
    scenarios: [['制作页面预览', '为内容列表生成无需 PDF 查看器即可显示的封面和缩略图。'], ['提交图片格式材料', '把指定 PDF 页面转换为只接受 JPG 或 PNG 的系统附件。'], ["把 PDF 页面插进幻灯片", "报告中的图表页导出为图片后，可以直接放进演示文稿，不必截图再裁剪。"]],
    notes: ['位图化会失去可选文字、链接、表单、书签和无障碍结构。', '高分辨率多页转换可能占用大量内存和存储，应按实际展示尺寸输出。', '将敏感 PDF 转为图片不会自动移除底层可见信息，仍需检查每页内容。'],
    specs: [["输出", "每页一张 PNG 或 JPG，多页可打包下载"], ["分辨率", "按缩放倍数渲染。倍数越高越清晰，文件也越大，A4 页面在高倍下单张可达数 MB"], ["PNG 还是 JPG", "含文字和线条的页面选 PNG（无损、边缘锐利）；整页是照片时 JPG 体积小得多"], ["文字层", "转成图片后文字不再可选中或搜索，这是不可逆的"], ["典型用途", "插进幻灯片、发给没有阅读器的人、或作为不希望被直接编辑的分发形式"], ["体积上限", "逐页渲染，页数极多时耗时长且可能因内存不足中断"]],
    faq: [{ question: "该选多大的分辨率？", answer: "屏幕查看 1.5x 到 2x 通常够用；需要打印或放大细看选 3x 以上。倍数越高文件越大，A4 页面在 4x 下单张可能达到数 MB，按用途取舍。" }, { question: "转成图片后还能搜索文字吗？", answer: "不能。文字被光栅化成像素后不再可选中、不可搜索，这是不可逆的。需要保留文字层就不要转图片；已经转了又需要文字，只能用图片 OCR 重新识别。" }],
    reference: [['rasterization', '把文字和矢量页面绘制为固定像素网格的过程。'], ['render scale', '控制页面渲染像素尺寸和清晰度的倍率。']],
  },
  en: {
    overview: ['PDF to image renders each page at a chosen resolution as a bitmap for previews, thumbnails, or systems without PDF support. Text and vector graphics become fixed pixels and can no longer scale or remain selectable like PDF content.', 'Clarity and size depend on render dimensions, page count, and image format. PNG suits text and lines, while JPG can suit photographic pages. A scanned PDF is already raster, and a larger output cannot restore detail absent from the scan.'],
    steps: [['Upload and inspect page count', 'Confirm orientation and dimensions and estimate how many image files will be generated.'], ['Choose format and clarity', 'Prefer PNG for text pages and compare JPG quality and size for photographic pages.'], ['Inspect representative pages', 'Zoom into small type, thin lines, and charts before downloading individual or packaged output.']],
    scenarios: [['Creating page previews', 'Generate covers and thumbnails that display without a PDF viewer.'], ['Submitting image-only material', 'Convert requested PDF pages for a system that accepts only JPG or PNG.'], ["Dropping PDF pages into slides", "Export the chart pages from a report as images and place them directly in a deck, with no screenshotting and cropping."]],
    notes: ['Rasterization loses selectable text, links, forms, bookmarks, and accessibility structure.', 'High-resolution multipage conversion can consume substantial memory and storage; render for the actual display size.', 'Converting a sensitive PDF to images does not remove visible information, so inspect every page.'],
    specs: [["Output", "One PNG or JPG per page, downloadable together for multi-page files"], ["Resolution", "Rendered at a scale factor. Higher is sharper and larger; an A4 page can reach several megabytes at high scale"], ["PNG or JPG", "PNG for pages with text and line art (lossless, crisp edges); JPG is far smaller when the page is a photograph"], ["Text layer", "Once rasterised the text is no longer selectable or searchable, and that is irreversible"], ["Typical use", "Dropping pages into slides, sending to someone without a reader, or distributing in a form that is not directly editable"], ["Size limit", "Pages render one at a time, so very long documents are slow and can run out of memory"]],
    faq: [{ question: "What resolution should I use?", answer: "1.5x to 2x is usually enough for screen viewing; 3x and up for printing or close inspection. Higher scale means larger files; an A4 page at 4x can reach several megabytes; so choose by purpose." }, { question: "Can I still search the text afterwards?", answer: "No. Once rasterised the text is pixels: not selectable, not searchable, and not reversible. Keep the PDF if you need the text layer; if you have already converted and need the text back, run Image OCR." }],
    reference: [['rasterization', 'Drawing text and vector pages into a fixed pixel grid.'], ['render scale', 'A multiplier controlling page pixel dimensions and apparent clarity.']],
  },
});
