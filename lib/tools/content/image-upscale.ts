import { defineToolContent } from './define';

export const imageUpscaleContent = defineToolContent({
  zh: {
    overview: [
      '图片放大通过增加像素尺寸生成更高分辨率文件。像素、平滑和锐化模式主要使用重采样算法，适合图标、截图和轻度放大；AI 模式会尝试补充纹理细节，但新增细节是模型推测，不等于找回原图中从未记录的信息。',
      '工具支持按倍数或目标宽高设置尺寸，并输出 PNG、JPG 或 WebP。放大前应根据用途确定最终像素尺寸，过度放大会增加文件体积、处理时间和伪影，却未必改善真实观看效果。',
    ],
    steps: [
      ['上传并检查原图', '确认原始宽高、格式和清晰度，优先使用未经多次压缩的版本。'],
      ['设置尺寸与模式', '选择 2、3、4 倍或自定义宽高，再按图像类型选择像素、平滑、锐化或 AI。'],
      ['预览并导出', '放大查看边缘、文字与皮肤纹理，选择合适格式和质量后下载。'],
    ],
    scenarios: [
      ['放大界面截图', '为文档或演示增加截图尺寸，并在锐利边缘和噪点之间取得平衡。'],
      ['准备印刷或大屏素材', '按目标显示尺寸生成更大文件，再由最终排版环境检查实际清晰度。'],
      ["放大老素材用于印刷", "手上只有低分辨率的旧图，放大后勉强满足印刷尺寸要求：但需要人工确认细节是否可接受。"],
    ],
    notes: [
      '放大不能可靠恢复已经丢失的文字、焦点或高频纹理，重要内容应回到原始素材获取。',
      '透明图建议导出 PNG 或 WebP，JPG 会用不透明背景替代透明区域。',
      'AI 结果可能改变细小线条、面部或产品细节，准确性要求高的素材必须逐处比对。',
    ],
    specs: [["放大倍数", "普通模式支持 2x、3x、4x 或自定义目标尺寸；AI 模式只提供模型支持的固定倍数"], ["四种模式", "像素无损、平滑高清、清晰增强和 AI 放大，分别适合硬边图、照片、需要轻量锐化的素材和模型增强"], ["能恢复原始细节吗", "不能。插值只重采样现有像素，AI 新增的纹理也是估计结果，不是找回真实信息"], ["效果较好", "线稿、图标、插画、噪点少的清晰照片"], ["效果不佳", "严重压缩过的图、模糊的照片、低分辨率人脸：模型容易补出错误的纹理"], ["耗时与内存", "只有 AI 模式需要下载模型并做推理，大图在低配设备上可能很慢或失败"]],
    faq: [{ question: "四种模式有什么区别？", answer: "像素无损直接复制硬边像素；平滑高清做高质量插值；清晰增强在插值后轻量锐化；AI 放大再用模型估计纹理。前两种不生成新细节，后两种看起来更锐利，但文字、人脸和严重压缩素材需要重点检查。" }, { question: "为什么我的图放大后很奇怪？", answer: "模型在严重压缩、模糊或低分辨率人脸上容易补出错误纹理：它在猜测原本可能是什么。这类素材建议用像素无损模式，或者干脆接受原始分辨率。" }],
    reference: [
      ['resampling', '根据邻近像素计算新像素的过程，影响放大后的锐度与锯齿。'],
      ['scale factor', '输出尺寸与原始尺寸的比例，例如 2 倍会使宽和高都变为原来的两倍。'],
    ],
  },
  en: {
    overview: [
      'Image upscaling creates a higher-resolution file by increasing pixel dimensions. Pixel, smooth, and sharpen modes mainly use resampling and suit icons, screenshots, and moderate enlargement. AI mode can infer texture, but inferred detail is not the recovery of information that the source never recorded.',
      'The tool accepts a scale factor or target dimensions and exports PNG, JPG, or WebP. Choose the final pixel size from the intended use first. Extreme enlargement increases file size, processing time, and artifacts without necessarily improving the viewed result.',
    ],
    steps: [
      ['Upload and inspect the source', 'Check its dimensions, format, and sharpness, preferably using a version that has not been repeatedly compressed.'],
      ['Set size and mode', 'Choose 2x, 3x, 4x, or custom dimensions, then select pixel, smooth, sharpen, or AI for the image type.'],
      ['Preview and export', 'Zoom into edges, text, and skin texture, then choose a suitable format and quality.'],
    ],
    scenarios: [
      ['Enlarging a UI screenshot', 'Increase dimensions for documentation or slides while balancing crisp edges against amplified noise.'],
      ['Preparing print or display artwork', 'Generate a larger asset for the target placement, then judge sharpness in the final layout environment.'],
      ["Enlarging old material for print", "When all you have is a low-resolution original, upscaling can just reach a print size; though someone has to judge whether the detail is acceptable."],
    ],
    notes: [
      'Upscaling cannot reliably restore lost text, focus, or high-frequency texture. Retrieve the original asset when accuracy matters.',
      'Export transparent images as PNG or WebP because JPG replaces transparency with an opaque background.',
      'AI output may alter thin lines, faces, or product details, so compare every critical area against the source.',
    ],
    specs: [["Scale factors", "Standard modes support 2x, 3x, 4x, or a custom target; AI mode is limited to the fixed factors supported by its model"], ["Four modes", "Pixel-faithful, Smooth HD, Sharp enhance, and AI upscale cover hard-edged graphics, photos, light sharpening, and model enhancement"], ["Can it recover real detail", "No. Interpolation only resamples existing pixels, and texture added by AI is an estimate rather than recovered information"], ["Works well on", "Line art, icons, illustrations, and clean low-noise photographs"], ["Works poorly on", "Heavily compressed images, blurred photos and low-resolution faces, where the model readily invents wrong texture"], ["Time and memory", "Only AI mode downloads a model and runs inference; large images can be very slow or fail on modest hardware"]],
    faq: [{ question: "What is the difference between the four modes?", answer: "Pixel-faithful copies hard-edged pixels; Smooth HD uses high-quality interpolation; Sharp enhance adds light sharpening after interpolation; AI upscale has a model estimate texture. The first two do not generate detail, while text, faces, and heavily compressed material need close review in the latter modes." }, { question: "Why does my upscaled image look odd?", answer: "The model readily invents wrong texture on heavily compressed, blurred or low-resolution faces; it is guessing at what was probably there. Use pixel-faithful mode for that material, or accept the original resolution." }],
    reference: [
      ['resampling', 'The process of calculating new pixels from neighboring source pixels, affecting sharpness and aliasing.'],
      ['scale factor', 'The ratio of output to source dimensions; 2x doubles both width and height.'],
    ],
  },
});
