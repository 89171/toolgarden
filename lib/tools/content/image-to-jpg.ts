import { defineToolContent } from './define';

export const imageToJpgContent = defineToolContent({
  zh: {
    overview: [
      'JPG 使用有损压缩，特别适合照片、渐变和色彩丰富的网页图片，通常能以较小文件保持可接受的视觉质量。它不支持透明通道，也不擅长保存像素级锐利的文字、界面线条和重复几何图案。',
      '转换器会在浏览器中解码源图并重新编码为 JPG，可调整质量以平衡清晰度和体积。转换不是简单改扩展名，透明像素需要填充为不透明背景，原有动画和部分元数据也不会保留。',
    ],
    steps: [
      ['上传兼容图片', '检查源图是否包含透明背景、动画或必须保留的元数据。'],
      ['调整 JPG 质量', '先用较高质量生成，再逐步降低并放大检查细节与色块。'],
      ['比较后下载', '根据实际显示尺寸比较文件体积和观感，保存为新的 JPG 文件。'],
    ],
    scenarios: [
      ['压缩照片用于网页', '把 PNG 或其它大体积照片转换为更适合传输的 JPG。'],
      ['满足上传格式要求', '将静态图片转换为只接受 JPEG 的表单或旧系统可读取的格式。'],
      ["为冲印和打印准备文件", "照片冲印店和打印服务的处理流程普遍围绕 JPG 建立，提交前转换可以避免因格式被退回重做。"],
    ],
    notes: [
      '透明区域会变成不透明背景，转换前应确认背景颜色符合使用场景。',
      'JPG 是有损格式，反复打开并保存会累积块状和边缘噪声。',
      '带文字、图标或大面积纯色的图片可能更适合 PNG 或 WebP。',
    ],
    specs: [["输入格式", "PNG、WebP、GIF、BMP、SVG、AVIF 等浏览器可解码的图片"], ["透明通道", "JPG 不支持透明。原图的透明区域会被填充为不透明底色"], ["压缩类型", "有损。质量参数越低体积越小，文字和线条边缘最先出现杂色"], ["兼容性", "所有浏览器、图像软件、打印流程和证照系统都能读，是兼容性最好的选择"], ["动图", "GIF 只取第一帧，动画不会保留"], ["元数据", "重新编码会丢弃 EXIF，包括定位和设备信息"]],
    faq: [{ question: "透明背景变成黑色或白色了怎么办？", answer: "JPG 没有透明通道，原本透明的像素必须被填充成某种颜色。需要保留透明请改用 PNG 或 WebP；如果必须是 JPG，请先在图片编辑里给它铺一层你想要的底色。" }, { question: "转成 JPG 后文件反而变大了？", answer: "源图如果是压缩得很好的 WebP 或 AVIF，转成 JPG 通常会变大：JPG 的压缩效率本来就不如它们。选 JPG 的理由应该是兼容性，不是体积。" }],
    reference: [
      ['lossy compression', '通过舍弃部分视觉信息减小文件，质量越低通常体积越小。'],
      ['quality setting', '编码器在细节保留与文件大小之间的控制参数，不等同于精确百分比。'],
    ],
  },
  en: {
    overview: [
      'JPG uses lossy compression and is well suited to photographs, gradients, and colorful web images, often preserving acceptable appearance at a compact size. It has no transparency and is less effective for pixel-sharp text, interface lines, and repeated geometry.',
      'The converter decodes the source in the browser and encodes a new JPG with an adjustable quality setting. This is not an extension rename: transparent pixels need an opaque background, while animation and some metadata are not preserved.',
    ],
    steps: [
      ['Upload a compatible image', 'Check whether the source contains transparency, animation, or metadata that must be retained.'],
      ['Adjust JPG quality', 'Generate at a higher value first, then lower it gradually while inspecting fine details and blocks at high zoom.'],
      ['Compare and download', 'Judge appearance and file size at the real display dimensions, then save the new JPG.'],
    ],
    scenarios: [
      ['Compressing a photo for the web', 'Convert a large PNG or another photographic source into a smaller JPG for delivery.'],
      ['Meeting an upload requirement', 'Create a JPEG version for a form or legacy system that accepts only that format.'],
      ["Preparing files for a print lab", "Photo printing and print-shop workflows are built around JPG, so converting before submission avoids a rejected order."],
    ],
    notes: [
      'Transparent regions become opaque, so confirm the replacement background works in the destination.',
      'JPG is lossy and repeated open-save cycles accumulate blocks and edge noise.',
      'Images dominated by text, icons, or flat color may be better served by PNG or WebP.',
    ],
    specs: [["Input formats", "PNG, WebP, GIF, BMP, SVG, AVIF; anything the browser can decode"], ["Transparency", "JPG has no alpha channel, so transparent areas become an opaque fill"], ["Compression", "Lossy. Lower quality means smaller files, and text and line edges show artefacts first"], ["Compatibility", "Read by every browser, image editor, print workflow and document system; the safest choice"], ["Animation", "Only the first frame of a GIF is taken; animation is not preserved"], ["Metadata", "Re-encoding discards EXIF, including location and device data"]],
    faq: [{ question: "My transparent background turned black or white; why?", answer: "JPG has no alpha channel, so transparent pixels must be filled with some colour. Use PNG or WebP to keep transparency; if it has to be JPG, composite the backdrop you want in the image editor first." }, { question: "Why did the file get bigger after converting to JPG?", answer: "If the source was a well-compressed WebP or AVIF, JPG will usually be larger; its compression is simply less efficient. Choose JPG for compatibility, not for size." }],
    reference: [
      ['lossy compression', 'Reducing size by discarding some visual information; lower quality usually produces a smaller file.'],
      ['quality setting', 'An encoder control that balances retained detail and size, not a literal percentage of fidelity.'],
    ],
  },
});
