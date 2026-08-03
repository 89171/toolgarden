import { defineToolContent } from './define';

export const imageCropContent = defineToolContent({
  zh: {
    overview: [
      '裁剪通过保留选定矩形区域重新组织画面，并直接减少输出像素。它可以移除多余边缘、改变横竖构图或适配头像、文章封面和社交平台需要的固定比例。',
      '裁剪不会把原图中的主体移动到新的位置，只是舍弃选区之外的内容。使用固定宽高比可让多张图片保持一致，但最终仍要检查人物关节、文字、安全边距和视觉重心是否被意外切断。',
    ],
    steps: [
      ['上传并选择比例', '根据最终容器选择自由裁剪或 1:1、4:3、16:9 等固定比例。'],
      ['移动和缩放选区', '把关键主体放在安全区域内，并为文字、头像和边缘留出必要空间。'],
      ['按实际尺寸检查', '确认输出像素足够，再预览并下载裁剪后的新文件。'],
    ],
    scenarios: [
      ['统一内容封面', '把来源不同的图片裁成相同比例，让卡片网格保持整齐。'],
      ['提取画面局部', '保留截图中的错误区域、图表或人物主体，去掉无关信息。'],
      ["裁掉截图里的无关界面", "只保留需要说明的那块区域，读者的注意力不会被浏览器边框和其它面板分散。"],
    ],
    notes: [
      '裁掉的像素不会存在于导出文件中，应保留原图以便以后重新构图。',
      '社交平台可能在不同设备上二次裁切，重要内容应远离边缘。',
      '非常小的选区放大显示会变模糊，裁剪后要核对剩余像素尺寸。',
    ],
    specs: [["操作方式", "拖动裁剪框选取区域，可移动和调整边界"], ["是否有损", "裁剪本身只丢弃框外像素，框内像素不变；但输出为 JPG 时会经历一次有损重编码"], ["输出尺寸", "等于裁剪框的像素尺寸，不做缩放"], ["与尺寸修改的区别", "裁剪改变画面范围（丢内容），尺寸修改改变像素密度（保内容）"], ["透明通道", "输出 PNG 或 WebP 时保留；输出 JPG 时透明区域被填充"], ["不可逆", "框外内容不会写入输出，恢复需要回到原图重做"]],
    faq: [{ question: "裁剪和调整尺寸有什么区别？", answer: "裁剪是丢掉画面外的内容，画面范围变小、像素密度不变；调整尺寸是保留全部内容按比例缩放，画面不变、像素数变化。想让文件变小通常用调整尺寸，想突出局部才用裁剪。" }, { question: "能按固定比例裁剪吗？", answer: "可以拖动裁剪框自由调整。需要严格的 1:1 或 16:9 时，请注意观察框的像素尺寸并手动对齐：工具不强制锁定比例。" }],
    reference: [
      ['aspect ratio', '裁剪框宽度与高度的固定比例。'],
      ['safe area', '即使显示容器再次裁切，也应保持可见的关键内容区域。'],
    ],
  },
  en: {
    overview: [
      'Cropping recomposes an image by retaining a selected rectangle and directly reducing output pixels. It removes unwanted edges, switches horizontal or vertical framing, and fits fixed ratios required by avatars, article covers, and social platforms.',
      'A crop does not move subjects inside the original; it discards everything outside the selection. A locked ratio keeps a series consistent, but people, text, safety margins, and visual balance still need inspection so important content is not cut unintentionally.',
    ],
    steps: [
      ['Upload and choose a ratio', 'Use free crop or a fixed ratio such as 1:1, 4:3, or 16:9 according to the final container.'],
      ['Move and size the selection', 'Keep the subject in a safe region with enough space around text, faces, and edges.'],
      ['Check real dimensions', 'Confirm the remaining pixels are sufficient, then preview and download the cropped copy.'],
    ],
    scenarios: [
      ['Standardizing content covers', 'Crop mixed source images to one ratio so a card grid remains visually aligned.'],
      ['Extracting part of an image', 'Retain an error area, chart, or subject from a screenshot while excluding unrelated information.'],
      ["Cutting the irrelevant UI out of a screenshot", "Keep only the region you are explaining so the reader is not distracted by browser chrome and side panels."],
    ],
    notes: [
      'Discarded pixels are absent from the export, so keep the original for future recomposition.',
      'Social platforms may crop again on different devices; keep critical content away from edges.',
      'A very small crop becomes blurry when enlarged, so check the output pixel dimensions.',
    ],
    specs: [["How it works", "Drag a crop box to select the region, then move or resize its edges"], ["Lossy?", "Cropping itself only discards pixels outside the box; pixels inside are untouched; but exporting as JPG adds one lossy re-encode"], ["Output size", "Exactly the crop box in pixels; no scaling is applied"], ["vs Resize", "Cropping changes what is in frame (content is lost); resizing changes pixel density (content is kept)"], ["Transparency", "Preserved for PNG and WebP output; filled in for JPG"], ["Irreversible", "Content outside the box is not written to the output; go back to the original to redo it"]],
    faq: [{ question: "How is cropping different from resizing?", answer: "Cropping discards what falls outside the frame; smaller framing, same pixel density. Resizing keeps everything and scales it; same framing, different pixel count. To shrink a file you usually want resize; crop is for emphasising a region." }, { question: "Can I crop to a fixed aspect ratio?", answer: "The crop box is freely draggable. For a strict 1:1 or 16:9, watch the box's pixel dimensions and align manually; the ratio is not locked for you." }],
    reference: [
      ['aspect ratio', 'The fixed relationship between crop width and height.'],
      ['safe area', 'A region where critical content should remain visible even if a display container crops again.'],
    ],
  },
});
