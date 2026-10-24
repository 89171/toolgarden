import { defineToolContent } from './define';

export const videoToGifContent = defineToolContent({
  zh: {
    overview: [
      '视频转 GIF 在浏览器本地把视频片段编码为 GIF 动图：按选定的帧率（8 / 12 / 15 fps）对视频做确定性逐帧采样，再用 gifenc 在本地做调色板量化，输出体积友好的 GIF。',
      'GIF 是 256 色的动图格式，色彩丰富的画面会有轻微色带，文字和界面录屏这类高对比内容效果最好。建议先截取 3~10 秒的片段再转换。',
      '视频不会上传到任何服务器，逐帧采样与量化全部在你的设备上完成。',
    ],
    steps: [
      ['上传视频', '支持 MP4、WebM、MOV 等常见格式，最长 5 分钟、最大 300MB。'],
      ['选区间与参数', '拖动滑块截取片段，选择帧率与输出宽度：帧率越高、宽度越大，体积越大。'],
      ['生成并下载', '逐帧采样与量化需要一些时间，完成后可直接预览动图效果。'],
    ],
    scenarios: [
      ['社交平台表情包', '截取几秒动作片段，360p 宽度、12fps 是体积与流畅度的常用平衡点。'],
      ['界面操作演示', '录屏配文字说明场景色彩少，GIF 压缩效率高，效果接近无损。'],
      ['文档与工单配图', 'GIF 自动循环播放、无需播放器，比嵌入视频更适合说明文档。'],
    ],
    notes: [
      'GIF 只有 256 色，照片级的渐变与噪点会出现色带；对画质要求高的演示请改用视频格式。',
      'GIF 不含音轨；需要声音的内容请保留原视频或用其它工具处理。',
      '帧数上限 900 帧、单帧画幅有上限保护；片段过长时工具会自动降帧率以控制体积与耗时。',
    ],
    specs: [['输出', 'GIF（每帧独立调色板量化）'], ['帧率', '8 / 12 / 15 fps 三档'], ['宽度', '240 / 360 / 480 px 三档，等比缩放'], ['上限', '源文件 300MB、时长 5 分钟、900 帧'], ['量化', 'gifenc 逐帧局部调色板，最多 256 色'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '为什么输出的 GIF 比原视频片段还大？', answer: 'GIF 对照片级内容的压缩效率远低于现代视频编码，大面积运动画面经常出现 GIF 更大的情况。降低帧率、缩小宽度、缩短片段都能显著减小体积；色块少的界面录屏则通常很小。' },
      { question: '转换后画面有色带或闪烁怎么办？', answer: '色带来自 256 色量化，属于格式限制；闪烁多与帧率过高或采样不均有关，可尝试降到 8fps 或换用 12fps。静态背景下的演示内容效果最好。' },
      { question: '可以转整个视频吗？', answer: '技术上受 900 帧上限保护（15fps 下约 1 分钟）。GIF 的典型用法是几秒的片段，建议先截取需要的部分，整体转 GIF 体积和耗时都不划算。' },
    ],
    reference: [
      ['调色板量化', '把真彩色的每帧像素收敛到最多 256 种颜色的过程，GIF 格式的基础约束。'],
      ['确定性采样', '按固定时间点逐帧 seek 取画面，而不是边播放边抓帧，保证输出节奏均匀。'],
    ],
  },
  en: {
    overview: [
      'Video-to-GIF encodes a video segment into an animated GIF locally in your browser: frames are sampled deterministically at your chosen rate (8 / 12 / 15 fps) and quantized on-device with gifenc, producing size-friendly GIFs.',
      'GIF is a 256-color format, so rich gradients band slightly; text, UI recordings and other high-contrast content work best. Trim a 3–10 second segment before converting.',
      'The video is never uploaded; sampling and quantization all happen on your device.',
    ],
    steps: [
      ['Upload a video', 'Common formats such as MP4, WebM and MOV, up to 5 minutes and 300MB.'],
      ['Pick range and settings', 'Trim the segment with sliders, choose fps and output width: higher values mean bigger files.'],
      ['Render and download', 'Per-frame sampling and quantization take a moment; preview the loop when done.'],
    ],
    scenarios: [
      ['Reaction loops', 'Grab a few seconds of action; 360px wide at 12fps is the usual balance of size and smoothness.'],
      ['UI walkthroughs', 'Screen recordings with text have few colors, so GIF compresses them almost losslessly.'],
      ['Docs and tickets', 'GIFs loop automatically and need no player, which beats embedding video in documentation.'],
    ],
    notes: [
      'GIF is limited to 256 colors, so photographic gradients and noise band; use video formats when fidelity matters.',
      'GIF has no audio; keep the original video for sound or process it with another tool.',
      'Frame count is capped at 900 and frame size has a protective limit; long segments are automatically slowed in fps to control size and time.',
    ],
    specs: [['Output', 'GIF (per-frame palette quantization)'], ['Frame rate', '8 / 12 / 15 fps presets'], ['Width', '240 / 360 / 480 px presets, aspect preserved'], ['Limits', '300MB and 5 minutes per source, 900 frames'], ['Quantization', 'gifenc with a local palette of up to 256 colors per frame'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded']],
    faq: [
      { question: 'Why is the GIF bigger than the video clip?', answer: 'GIF compresses photographic content far less efficiently than modern video codecs; wide-motion footage often ends up larger. Lower fps, smaller width and shorter segments all shrink it — UI recordings with flat colors usually stay tiny.' },
      { question: 'The GIF has banding or flicker — what can I do?', answer: 'Banding comes from 256-color quantization and is a format limit; flicker usually means fps is too high for the content. Try 8fps or switch to 12fps. Static-background demos work best.' },
      { question: 'Can I convert a whole video?', answer: 'Technically capped at 900 frames (about a minute at 15fps). GIFs are meant to be short segments; trim the part you need, as converting everything wastes both size and time.' },
    ],
    reference: [
      ['Palette quantization', 'Reducing each frame’s true-color pixels to at most 256 colors — the core constraint of the GIF format.'],
      ['Deterministic sampling', 'Seeking to fixed timestamps per frame instead of grabbing frames during playback, keeping the output rhythm even.'],
    ],
  },
});
