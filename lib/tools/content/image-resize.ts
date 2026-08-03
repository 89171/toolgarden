import { defineToolContent } from './define';

export const imageResizeContent = defineToolContent({
  zh: {
    overview: [
      '图片改尺寸会重新采样像素，把画面输出为指定的宽度和高度。保持宽高比可以避免人物和圆形被拉伸；关闭比例锁定虽然能强制填满目标框，但会改变几何形状，通常不适合照片和品牌标识。',
      '缩小图片既能减少像素数量，也常能降低文件体积，是网页优化和上传前处理的重要步骤。放大则需要算法估计新像素，不能恢复原始细节，若目标尺寸远大于来源应使用更高分辨率素材。',
    ],
    steps: [
      ['读取原始尺寸', '确认宽高与比例，并根据实际展示或上传要求确定目标像素。'],
      ['设置目标宽高', '默认保持比例，只在明确需要变形或已有正确目标比例时解锁。'],
      ['预览后导出', '检查线条、文字和人物比例，并比较尺寸变化后的文件体积。'],
    ],
    scenarios: [
      ['优化网页资源', '把相机大图缩到页面真实需要的像素宽度，减少解码和传输开销。'],
      ['满足上传限制', '按头像、证件或内容系统规定生成准确的宽高像素。'],
      ["把相机原图缩到网页可用尺寸", "4000 px 宽的原图在网页上最多只用到 1600 px，缩小后体积能降一个数量级，观感却看不出差别。"],
    ],
    notes: [
      '尺寸单位是像素，不等同于印刷中的厘米；印刷尺寸还取决于 DPI。',
      '先裁到正确比例再改尺寸，通常比直接拉伸到目标宽高更自然。',
      '连续多次缩小会反复重采样，最好从原图一次输出到最终尺寸。',
    ],
    specs: [["缩放方式", "按指定宽度或高度等比例缩放，不改变画面构图"], ["缩小", "画质损失很小，是减小体积最有效的手段：通常比单纯降质量更划算"], ["放大", "只是插值补点，不会增加真实细节。需要放大后仍清晰请用图片无损放大"], ["与裁剪的区别", "缩放保留全部内容改变像素数，裁剪保留像素密度丢弃画面外内容"], ["透明通道", "输出 PNG 或 WebP 时保留；输出 JPG 时透明区域被填充"], ["搭配建议", "先缩小尺寸再用图片压缩，两步叠加的降体积效果最明显"]],
    faq: [{ question: "缩小和压缩哪个更有效？", answer: "缩小尺寸通常更有效，而且画质损失更小。先把尺寸缩到实际显示所需，再用图片压缩微调质量，两步叠加的效果远好于只调质量。" }, { question: "放大后为什么变模糊？", answer: "放大只是按插值补出更多像素，不会凭空产生细节。需要放大后仍然清晰，请用图片无损放大的增强模式：但那也是模型估计出来的纹理，不是真实细节。" }],
    reference: [
      ['pixel dimensions', '图像网格的宽度和高度，例如 1920 × 1080 像素。'],
      ['resampling', '把源像素重新计算到新尺寸网格的过程。'],
    ],
  },
  en: {
    overview: [
      'Image resizing resamples pixels into a specified width and height. Preserving aspect ratio prevents people and circles from stretching. Unlocking the ratio can force a fill, but it changes geometry and is usually inappropriate for photos and brand marks.',
      'Downsizing reduces the pixel count and often the file size, making it important for web optimization and upload preparation. Upsizing must estimate new pixels and cannot restore source detail, so obtain a higher-resolution asset when the target is much larger.',
    ],
    steps: [
      ['Read the source dimensions', 'Check width, height, and ratio, then determine target pixels from the actual display or upload requirement.'],
      ['Set target width and height', 'Keep proportions locked unless distortion or an already-correct target ratio is explicitly intended.'],
      ['Preview and export', 'Inspect lines, text, and human proportions and compare file size after the dimension change.'],
    ],
    scenarios: [
      ['Optimizing a web asset', 'Reduce a camera image to the pixel width the page actually needs, lowering transfer and decode work.'],
      ['Meeting an upload limit', 'Generate the exact pixel width and height required for an avatar, document, or content system.'],
      ["Bringing a camera original down to web size", "A 4000 px original is displayed at 1600 px at most, and scaling it down drops the file size by an order of magnitude with no visible difference."],
    ],
    notes: [
      'Dimensions here are pixels, not print centimeters; physical print size also depends on DPI.',
      'Cropping to the correct ratio before resizing normally looks more natural than stretching to fit.',
      'Repeated downsizing resamples multiple times. Export once from the source to the final size when possible.',
    ],
    specs: [["How it scales", "Proportionally to a target width or height; the framing is unchanged"], ["Scaling down", "Loses very little quality and is the most effective way to cut file size; usually better value than lowering quality alone"], ["Scaling up", "Interpolates extra pixels without adding real detail. Use Image Upscale when the result still has to look sharp"], ["vs Crop", "Resizing keeps all the content and changes the pixel count; cropping keeps pixel density and discards what falls outside"], ["Transparency", "Preserved for PNG and WebP output; filled in for JPG"], ["Pairs well with", "Resize first, then Image Compress; the two together give by far the biggest size reduction"]],
    faq: [{ question: "Resize or compress; which helps more?", answer: "Resizing usually helps more and costs less quality. Scale down to the size actually displayed, then use Image Compress to fine-tune quality; the two together beat quality alone by a wide margin." }, { question: "Why is it blurry after scaling up?", answer: "Upscaling interpolates extra pixels and cannot invent detail. For a sharp result use Image Upscale's enhanced mode; though that texture is a model's estimate too, not recovered detail." }],
    reference: [
      ['pixel dimensions', 'The width and height of the image grid, such as 1920 × 1080 pixels.'],
      ['resampling', 'Recalculating source pixels onto a grid with different dimensions.'],
    ],
  },
});
