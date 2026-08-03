import { defineToolContent } from './define';

export const imageGifContent = defineToolContent({
  zh: {
    overview: [
      'GIF 工具提供拆帧与合成两种流程。拆帧会按动画顺序解码每一帧并可打包下载，适合检查关键画面；合成则把多张静态图片按顺序、延迟和循环设置编码为动画。',
      'GIF 使用最多 256 色的调色板并只支持简单透明度，照片和渐变容易出现色带或抖动。它适合短小的界面演示和简单图形，不适合长视频、音频或高保真摄影内容，后者通常应选择视频格式。',
    ],
    steps: [
      ['选择拆分或合成', '拆帧时上传一个 GIF；合成时按播放顺序加入尺寸一致的图片。'],
      ['检查帧与时间', '确认画面顺序、单帧延迟、循环设置和最终画布尺寸。'],
      ['生成并预览', '完整播放一次，检查跳帧、闪烁、颜色和体积后再下载。'],
    ],
    scenarios: [
      ['分析动画素材', '拆出每帧定位界面变化、提取某个画面或制作静态缩略图。'],
      ['制作短演示', '把几张操作截图组合成循环动画，用于文档或问题反馈。'],
      ["把操作录屏做成演示动图", "几张关键步骤的截图合成 GIF，放进文档或工单里说明操作流程，比文字描述直观。"],
    ],
    notes: [
      '合成图片尺寸不一致时可能出现缩放、留白或构图跳动，建议预先统一画布。',
      '帧数、尺寸和颜色复杂度都会快速增加文件体积，应控制时长与分辨率。',
      'GIF 没有音轨且色彩有限，长教程应使用 WebM 或 MP4 等视频格式。',
    ],
    specs: [["两个方向", "把 GIF 拆成逐帧 PNG，或把多张 PNG / JPG 合成为 GIF 动图"], ["合成参数", "帧顺序按列表顺序，可设置帧间延迟控制播放速度"], ["GIF 的颜色限制", "每帧最多 256 色。照片和渐变合成 GIF 后会出现明显色带和抖动噪点"], ["体积", "GIF 压缩效率低，帧数多或分辨率高时文件会非常大"], ["更好的替代", "需要动图且体积敏感时，动态 WebP 或短视频 MP4 在同画质下小得多"], ["尺寸一致性", "合成时各帧尺寸应当相同，否则播放会出现跳动"]],
    faq: [{ question: "合成的 GIF 为什么颜色发花？", answer: "GIF 每帧最多 256 色。照片和渐变超出这个范围后，编码器只能用抖动（dither）近似，看起来就是密集的噪点和色带。这类内容更适合导出为动态 WebP 或短视频。" }, { question: "GIF 文件为什么这么大？", answer: "GIF 的压缩算法很老，效率远低于现代视频编码。帧数多或分辨率高时体积会失控。同样内容做成 MP4 通常只有 GIF 的十分之一大小。" }],
    reference: [
      ['frame delay', '某一帧保持显示的时长，所有延迟共同决定动画节奏。'],
      ['color palette', 'GIF 一帧可引用的有限颜色集合，复杂画面需要量化到调色板。'],
    ],
  },
  en: {
    overview: [
      'The GIF tool supports frame extraction and animation composition. Extraction decodes frames in playback order and can package them for download. Composition encodes ordered still images with selected delay and looping behavior.',
      'GIF uses palettes of up to 256 colors and only simple transparency, so photographs and gradients can show banding or dithering. It suits brief UI demonstrations and simple graphics, not long video, audio, or high-fidelity photography, which are better served by a video format.',
    ],
    steps: [
      ['Choose extract or compose', 'Upload one GIF for extraction, or add equally sized images in playback order for composition.'],
      ['Check frames and timing', 'Confirm image order, per-frame delay, loop setting, and final canvas dimensions.'],
      ['Generate and preview', 'Watch a complete cycle and check skipped frames, flicker, color, and size before downloading.'],
    ],
    scenarios: [
      ['Analyzing an animation', 'Extract every frame to locate a UI change, save one moment, or create a static thumbnail.'],
      ['Creating a short demonstration', 'Combine a few workflow screenshots into a loop for documentation or bug reporting.'],
      ["Turning a screen capture into a demo animation", "A few key-step screenshots composed into a GIF explain a workflow in a document or ticket far better than prose."],
    ],
    notes: [
      'Mismatched source dimensions can cause scaling, padding, or composition jumps, so standardize the canvas first.',
      'Frame count, dimensions, and color complexity quickly increase size; keep duration and resolution controlled.',
      'GIF has no audio track and limited color. Use WebM or MP4 for a longer tutorial.',
    ],
    specs: [["Two directions", "Split a GIF into per-frame PNGs, or compose several PNG / JPG images into an animated GIF"], ["Composition settings", "Frame order follows the list, and an inter-frame delay controls playback speed"], ["GIF's colour limit", "256 colours per frame. Photographs and gradients composed to GIF show obvious banding and dither noise"], ["File size", "GIF compresses poorly, so many frames or a high resolution produces very large files"], ["Better alternatives", "When size matters, animated WebP or a short MP4 is far smaller at equivalent quality"], ["Frame consistency", "All frames should share one size, or playback will jump"]],
    faq: [{ question: "Why does the composed GIF look mottled?", answer: "GIF allows 256 colours per frame. Photographs and gradients exceed that, so the encoder approximates with dithering, which reads as dense noise and banding. That content belongs in animated WebP or a short video." }, { question: "Why is the GIF file so large?", answer: "GIF's compression is old and far less efficient than modern video codecs. Size runs away with frame count and resolution. The same content as MP4 is typically a tenth the size." }],
    reference: [
      ['frame delay', 'How long an individual frame remains visible, with all delays determining animation rhythm.'],
      ['color palette', 'The limited set of colors a GIF frame can reference, requiring complex imagery to be quantized.'],
    ],
  },
});
