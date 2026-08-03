import { defineToolContent } from './define';

export const imageRemoveWatermarkContent = defineToolContent({
  zh: {
    overview: [
      '去水印工具在选定区域内根据周围像素重建画面，提供不同的修复方法以适应纯色背景、纹理和较复杂的遮挡。先精确框选水印范围通常比选择大面积区域更容易得到自然结果，因为算法可利用的相邻信息更相关。',
      '重建内容是算法推测，无法恢复被水印完全遮住的原始像素。此工具只应处理你拥有版权、获得明确授权，或法律允许修改的图片；移除归属标识不等于获得传播或商业使用权。',
    ],
    steps: [
      ['确认使用权限', '仅上传你有权编辑的图片，并保留必要的作者署名和许可证记录。'],
      ['精确选择区域', '让选框覆盖完整水印及边缘，同时尽量减少无关背景和主体细节。'],
      ['比较修复方法', '预览不同方法的纹理连续性和边缘伪影，选择结果后按需要导出格式。'],
    ],
    scenarios: [
      ['清理自有素材', '从品牌源文件中移除已经停用的旧日期、内部标记或错误版本标签。'],
      ['修复授权图片', '在得到权利方许可后，清除覆盖在简单背景上的指定标识并重新排版。'],
      ["去掉自己素材上的旧标识", "过往作品上打了已经不用的旧 logo，重新发布前需要清掉。"],
    ],
    notes: [
      '请勿移除他人版权水印、摄影署名或来源标识以规避许可要求。',
      '复杂人脸、文字和规则线条被遮挡后通常无法准确还原，优先寻找无水印原件。',
      '多次处理重叠区域会累积模糊和重复纹理，建议从原图重新尝试更小的选区。',
    ],
    specs: [["操作方式", "框选水印区域，模型根据周围像素补全该区域"], ["输出", "JPG、PNG 或 WebP"], ["效果较好", "背景规律、纹理连续的区域，如纯色、天空、平滑渐变"], ["效果不佳", "水印压在人脸、文字或复杂纹理上：补全结果是模型的猜测，会与原内容不符"], ["不能还原原始像素", "被水印覆盖的内容已经不存在，输出是合成的近似结果，不是恢复"], ["版权提示", "移除水印不改变图片的版权归属，使用前请确认自己有相应权利"]],
    faq: [{ question: "补全出来的内容和原图不一样？", answer: "这是必然的。水印覆盖的原始像素已经不存在，模型只能根据周围内容推测那里「应该」是什么。背景规律时猜得准，压在人脸、文字或复杂纹理上时几乎一定不对。" }, { question: "可以用它去掉别人图片上的水印吗？", answer: "技术上可以，但移除水印不改变图片的版权归属。使用他人作品前请确认自己有相应授权：工具能做到不等于使用上被允许。" }],
    reference: [
      ['inpainting', '利用选区周围的结构和纹理估计缺失像素的图像修复过程。'],
      ['artifact', '修复后出现的模糊、重复纹理、边缘断裂或不自然色块。'],
    ],
  },
  en: {
    overview: [
      'The watermark remover reconstructs a selected region from surrounding pixels and provides different repair methods for flat backgrounds, texture, and more complex obstruction. A tight selection generally produces a more natural result than a large area because the neighboring evidence is more relevant.',
      'Reconstructed content is an estimate and cannot recover original pixels that were fully covered. Use this tool only on images you own, are explicitly authorized to edit, or are legally permitted to modify. Removing an attribution mark does not grant distribution or commercial rights.',
    ],
    steps: [
      ['Confirm editing rights', 'Upload only an image you may modify and retain any required attribution and license records.'],
      ['Select the exact region', 'Cover the complete mark and its edge while excluding unrelated background and subject detail.'],
      ['Compare repair methods', 'Inspect texture continuity and boundary artifacts, then export the best result in the needed format.'],
    ],
    scenarios: [
      ['Cleaning an owned asset', 'Remove an obsolete date, internal mark, or incorrect version label from a brand source file.'],
      ['Repairing an authorized image', 'With permission from the rights holder, clear a specified mark over a simple background before relayout.'],
      ["Removing your own outdated mark", "Older work carries a logo you no longer use, and it has to come off before republishing."],
    ],
    notes: [
      'Do not remove another creator’s copyright watermark, photo credit, or source mark to bypass licensing requirements.',
      'Covered faces, text, and geometric lines usually cannot be reconstructed accurately; seek the unmarked original first.',
      'Repeated processing accumulates blur and duplicated texture. Restart from the source with a smaller selection when possible.',
    ],
    specs: [["How it works", "Mark the watermark region and the model inpaints it from the surrounding pixels"], ["Output", "JPG, PNG or WebP"], ["Works well on", "Regular, continuous backgrounds; flat colour, sky, smooth gradients"], ["Works poorly on", "Watermarks over faces, text or complex texture, where the fill is a guess that will not match the real content"], ["It does not recover pixels", "Whatever the watermark covered is gone; the output is a synthesised approximation, not a restoration"], ["Rights reminder", "Removing a watermark does not change who owns the image; confirm you have the right to use it"]],
    faq: [{ question: "The fill does not match the original; why?", answer: "It cannot. The pixels the watermark covered are gone, so the model infers what should plausibly be there from the surroundings. On regular backgrounds it guesses well; over faces, text or complex texture it will almost certainly be wrong." }, { question: "Can I use this on someone else's watermark?", answer: "Technically yes, but removing a watermark does not change who owns the image. Confirm you have the rights before using someone else's work; what a tool can do is not the same as what you are permitted to do." }],
    reference: [
      ['inpainting', 'An image-repair process that estimates missing pixels from nearby structure and texture.'],
      ['artifact', 'An unintended blur, repeated texture, broken edge, or unnatural patch introduced by repair.'],
    ],
  },
});
