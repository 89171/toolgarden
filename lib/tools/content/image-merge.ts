import { defineToolContent } from './define';

export const imageMergeContent = defineToolContent({
  zh: {
    overview: ['图片合并把多张图片按列表顺序整理，并可对单张素材旋转或翻转后输出为 PDF 或组合图。来源图片尺寸与方向不一致时，需要根据输出画布进行缩放和留白，文字清晰度取决于最终像素与页面尺寸。', '它适合把扫描页、截图和照片打包成便于分享的文件。若图片含透明区域、EXIF 方向或精细色彩，重新绘制后可能发生背景、方向、元数据或色彩变化，输出前应逐页预览。'],
    steps: [['添加并整理图片', '按阅读顺序排列，逐张纠正旋转和镜像。'], ['选择输出类型', '多页资料通常选 PDF，需要单张长图时选择相应图片输出。'], ['预览并下载', '检查页序、缩放、留白、透明背景和小字清晰度。']],
    scenarios: [['把扫描页合成 PDF', '按页码整理票据、手写笔记或证明照片。'], ['制作连续长图', '将步骤截图按顺序拼接，用于说明流程或反馈问题。'], ["把分屏截图拼成完整长图", "网页或聊天记录分几屏截下来后，纵向拼成一张长图，便于一次性查看和分享。"]],
    notes: ['来源分辨率太低时，合并不会提升小字清晰度。', '相机照片可能包含位置元数据，重新输出后仍应检查隐私需求。', '处理大量高分辨率图片会占用显著浏览器内存，应分批生成。'],
    specs: [["两种输出", "纵向拼接成一张长图 PNG，或合成 PDF（每张图一页）"], ["顺序依据", "列表顺序，不按文件名排序"], ["宽度不一致", "长图模式下会按最大宽度对齐，较窄的图两侧留白；先统一尺寸可避免"], ["输入格式", "JPG、PNG、WebP、GIF、BMP 等浏览器可解码的图片"], ["长图体积", "PNG 无损，拼接十几张截图后文件可能达到数十 MB"], ["体积上限", "所有图片需同时读入内存，张数过多或分辨率过高可能失败"]],
    faq: [{ question: "长图两侧为什么有白边？", answer: "各张图宽度不一致时，拼接会按最大宽度对齐，较窄的图两侧就出现留白。先用图片尺寸修改把所有图统一到同一宽度即可避免。" }, { question: "长图和合成 PDF 该选哪个？", answer: "需要连续阅读、一次看完选长图；需要按页翻阅、打印或作为正式文档提交选 PDF。PDF 每张图一页，不会因为图片高度差异产生视觉断层。" }],
    reference: [['canvas', '用于把多张图片绘制到统一输出表面的像素区域。'], ['page order', '图片在 PDF 或长图中出现的最终先后顺序。']],
  },
  en: {
    overview: ['Image merge arranges uploads in list order, with per-image rotation or flipping, and outputs a PDF or combined image. Mixed dimensions and orientation require scaling and padding on the output canvas, and text clarity depends on final pixels and page size.', 'It packages scanned pages, screenshots, and photographs for sharing. Transparency, EXIF orientation, and detailed color can change when images are redrawn, so preview every page for background, direction, metadata, and color.'],
    steps: [['Add and organize images', 'Place them in reading order and correct rotation or mirroring individually.'], ['Choose output type', 'Use PDF for multipage material or an image output for one continuous composition.'], ['Preview and download', 'Check sequence, scaling, padding, transparent background, and small-text clarity.']],
    scenarios: [['Turning scans into a PDF', 'Arrange receipts, handwritten notes, or evidence photos by page number.'], ['Creating a continuous long image', 'Join procedural screenshots for workflow documentation or issue reporting.'], ["Stitching a scrolling screenshot together", "Several screens captured from a page or chat log stack into one tall image that can be viewed and shared in one go."]],
    notes: ['A low-resolution source remains hard to read after merging.', 'Camera images may contain location metadata, so review privacy requirements around output.', 'Many high-resolution images consume substantial browser memory and should be processed in batches.'],
    specs: [["Two outputs", "One tall PNG strip, or a PDF with one image per page"], ["Ordering", "List order; never sorted by filename"], ["Mismatched widths", "The strip aligns to the widest image, leaving margins beside narrower ones; normalise sizes first to avoid it"], ["Input formats", "JPG, PNG, WebP, GIF, BMP; anything the browser can decode"], ["Strip file size", "PNG is lossless, so a dozen stacked screenshots can reach tens of megabytes"], ["Size limit", "Every image is held in memory at once, so very many or very large images can fail"]],
    faq: [{ question: "Why are there white margins on the strip?", answer: "When widths differ the strip aligns to the widest image and narrower ones get margins. Normalise every image to the same width with Image Resize first." }, { question: "Strip or PDF?", answer: "Choose the strip for continuous reading in one view; choose PDF for page-by-page browsing, printing, or submitting as a formal document. PDF puts one image per page, so differing image heights do not create visual breaks." }],
    reference: [['canvas', 'The pixel surface used to draw multiple images into one output.'], ['page order', 'The final sequence of images in a PDF or long composition.']],
  },
});
