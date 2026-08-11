import { defineToolContent } from './define';

export const imageEnhanceContent = defineToolContent({
  zh: {
    overview: [
      '图片清晰增强使用 Real-ESRGAN x4plus 修复低清照片中的模糊边缘、噪点和压缩纹理。模型会先在浏览器中以高分辨率重建画面，再按所选尺寸输出原尺寸、2 倍或 4 倍图片。',
      'PyTorch FP32 官方权重只用于离线转换和结果校验；页面实际下载经过验证的 ONNX FP16 模型，并通过 WebGPU 在本地分块推理。图片不会上传到服务器。',
    ],
    steps: [
      ['上传需要修复的图片', '优先使用原始文件，避免先截图或反复压缩。模型适合照片、旧图和带有 JPEG 压缩痕迹的图片。'],
      ['选择输出倍率', '原尺寸适合只改善观感；2 倍适合常规分享和屏幕展示；4 倍适合需要更高像素尺寸的素材。'],
      ['检查细节并导出', '重点放大查看人脸、文字、产品纹理和细线，确认模型没有生成错误细节后再下载。'],
    ],
    scenarios: [
      ['修复低清老照片', '减轻压缩、噪点和柔糊边缘，让照片在现代屏幕上更容易观看。'],
      ['改善网络图片', '处理经历过缩放或 JPEG 压缩的图片，并按 1 倍或 2 倍输出。'],
      ['准备更大尺寸素材', '使用 4 倍输出增加像素尺寸，再在最终排版或展示环境中检查效果。'],
    ],
    notes: [
      '模型生成的是视觉上合理的估计，不是恢复原图从未记录的信息。证件、档案、医疗、司法或取证图片不能把增强结果当作事实依据。',
      '低分辨率人脸、文字和规则图案最容易出现错误重建，必须与原图逐处比较。',
      '高清模型需要 WebGPU。首次使用会下载约 32.2 MiB 模型资源，之后通常由浏览器缓存。',
    ],
    specs: [
      ['浏览器模型', 'RealESRGAN_x4plus ONNX FP16，约 32.2 MiB'],
      ['转换基准', '官方 PyTorch FP32 权重；仅用于离线导出和数值校验，不发送给浏览器'],
      ['输出倍率', '原尺寸、2 倍或 4 倍；模型内部按 4 倍修复，较小倍率使用高质量缩放输出'],
      ['运行方式', 'ONNX Runtime Web + WebGPU，128px 分块并保留重叠边界'],
      ['输入限制', '最多约 4 MP，最终输出最多约 40 MP，具体速度取决于显卡和图片尺寸'],
      ['隐私', '图片解码、模型推理和导出均在浏览器本地完成'],
    ],
    faq: [
      { question: '图片清晰增强与图片放大有什么区别？', answer: '图片放大提供像素复制、平滑、锐化和轻量 AI 等多种尺寸处理方式；图片清晰增强专门使用 Real-ESRGAN 修复真实照片的模糊、噪点和压缩痕迹，也可以保持原尺寸。' },
      { question: '增强后能看清原本无法辨认的文字吗？', answer: '不能保证。模型会估计可能的边缘和纹理，可能生成看似清楚但实际错误的字符，因此不能用于恢复证据、号码或其它要求事实准确的信息。' },
      { question: '为什么需要 WebGPU？', answer: 'Real-ESRGAN x4plus 的计算量远高于普通插值。WebGPU 可以调用设备显卡完成分块推理；仅使用 CPU 或普通 WebAssembly 会非常慢。' },
    ],
    reference: [
      ['Real-ESRGAN', '面向真实世界未知退化图片的盲超分辨率与图像修复模型。'],
      ['ONNX FP16', '采用半精度权重的跨平台模型格式，用较小下载体积和显存换取接近 FP32 的结果。'],
      ['分块推理', '把大图拆成带重叠边缘的小块运行模型，再裁去重叠区域并拼回输出图。'],
    ],
  },
  en: {
    overview: [
      'Image Enhance uses Real-ESRGAN x4plus to reduce soft edges, noise, and compression texture in low-quality photographs. The model first reconstructs the image at high resolution in the browser, then exports at the original size, 2x, or 4x.',
      'The official PyTorch FP32 checkpoint is used only for offline conversion and output validation. The page downloads a verified ONNX FP16 model and runs tiled WebGPU inference locally; the image is never uploaded.',
    ],
    steps: [
      ['Upload the image to restore', 'Use the original file when possible instead of a screenshot or repeatedly compressed copy. The model suits photographs, older images, and JPEG artifacts.'],
      ['Choose an output scale', 'Original size improves appearance without enlarging dimensions; 2x suits sharing and displays; 4x creates a higher-pixel asset.'],
      ['Inspect details and export', 'Zoom into faces, text, product texture, and thin lines, then download only after checking for invented detail.'],
    ],
    scenarios: [
      ['Restoring a low-resolution old photo', 'Reduce compression, noise, and soft edges so the image is easier to view on a modern display.'],
      ['Improving a web image', 'Process an image affected by resizing or JPEG compression and export at 1x or 2x.'],
      ['Preparing a larger asset', 'Use 4x output to increase pixel dimensions, then review it in the final layout or display environment.'],
    ],
    notes: [
      'The model generates visually plausible estimates; it does not recover information the source never recorded. Do not treat enhanced identity, archival, medical, legal, or forensic images as factual evidence.',
      'Low-resolution faces, text, and regular patterns are most likely to be reconstructed incorrectly and must be compared closely with the source.',
      'The HD model requires WebGPU. First use downloads about 32.2 MiB of model assets, which the browser will usually cache.',
    ],
    specs: [
      ['Browser model', 'RealESRGAN_x4plus ONNX FP16, about 32.2 MiB'],
      ['Conversion reference', 'Official PyTorch FP32 checkpoint, used only for offline export and numerical validation'],
      ['Output scales', 'Original size, 2x, or 4x; the model restores internally at 4x and smaller outputs use high-quality downsampling'],
      ['Runtime', 'ONNX Runtime Web + WebGPU with 128px overlapping tiles'],
      ['Input limits', 'About 4 MP maximum input and 40 MP maximum output; speed depends on the GPU and image dimensions'],
      ['Privacy', 'Image decoding, model inference, and export all run locally in the browser'],
    ],
    faq: [
      { question: 'How is Image Enhance different from Image Upscale?', answer: 'Image Upscale offers pixel copying, smoothing, sharpening, and a lightweight AI option for changing dimensions. Image Enhance specifically uses Real-ESRGAN to restore blur, noise, and compression artifacts in real photographs and can preserve the original dimensions.' },
      { question: 'Can enhancement recover text that was unreadable?', answer: 'Not reliably. The model estimates plausible edges and texture and may produce a clear-looking but incorrect character, so it must not be used to recover evidence, numbers, or other fact-critical information.' },
      { question: 'Why is WebGPU required?', answer: 'Real-ESRGAN x4plus is much more compute-intensive than normal interpolation. WebGPU uses the device GPU for tiled inference; CPU-only WebAssembly would be impractically slow.' },
    ],
    reference: [
      ['Real-ESRGAN', 'A blind super-resolution and restoration model for images with unknown real-world degradation.'],
      ['ONNX FP16', 'A portable model format using half-precision weights to reduce download and GPU memory while staying close to FP32 output.'],
      ['tiled inference', 'Running overlapping image patches separately, then cropping their overlap and stitching them into the final output.'],
    ],
  },
});
