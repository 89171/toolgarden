import { defineToolContent } from './define';

export const videoTrimContent = defineToolContent({
  zh: {
    overview: [
      '视频截取在浏览器本地按起止时间重编码视频：拖动两个滑块选定片段，WebCodecs 硬件编码为 H.264 MP4，再用本地 ffmpeg 从原视频里裁出对应区间的音轨回填进输出文件。',
      '画面与声音都来自你选的区间，不会带入区间外的内容。输出画质可选高 / 中 / 低三档，默认高档位、保持原分辨率。',
      '视频不会上传到任何服务器，处理全程在你的设备上完成，适合处理未发布的素材。',
    ],
    steps: [
      ['上传视频', '支持 MP4、WebM、MOV 等常见格式，最长 5 分钟、最大 300MB。'],
      ['拖动滑块选区间', '分别设定开始与结束时间，片段至少 0.2 秒；可对照预览画面校准。'],
      ['生成并下载', '重编码只处理选中的区间，完成后预览、下载。'],
    ],
    scenarios: [
      ['截取精彩片段', '从长视频里取几秒高光时刻发社交媒体或消息。'],
      ['去掉头尾冗余', '剪掉录制时的开场等待和结尾操作，只保留正片。'],
      ['为 GIF 转换做准备', '先截取需要的片段，再用视频转 GIF 工具生成动图。'],
    ],
    notes: [
      '输出是重编码的片段而非无损切割：会有轻微的二次压缩，画面剪接点之外的内容不受影响。',
      '截取精度取决于浏览器解码器的 seek 能力，绝大多数情况下误差在一帧以内。',
      '音轨按所选区间从原视频裁剪回填；个别格式回填失败时会输出无声视频并标注。',
    ],
    specs: [['输出', 'H.264 MP4（AAC 音轨）'], ['区间', '起止时间自由设定，最短 0.2 秒'], ['画质', '高 / 中 / 低三档，默认高档原分辨率'], ['上限', '单文件 300MB、时长 5 分钟'], ['编码管线', 'WebCodecs 只重编码所选区间，ffmpeg.wasm 按区间裁剪音轨'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '是无损切割吗？', answer: '不是。输出片段经过 H.264 重编码，会有轻微的二次压缩；好处是输出兼容性最好、可直接分享。默认高档位下画质损失通常难以察觉。' },
      { question: '片段最长能有多长？', answer: '受总时长 5 分钟与 300MB 的限制。截取只重编码选中区间，所以 5 分钟视频里截 10 秒的处理速度和 10 秒短片一样快。' },
      { question: '声音会跟着一起截吗？', answer: '会。音轨按所选区间从原视频裁剪后回填，画面和声音对齐；个别格式回填失败时会输出无声视频，结果信息里会标注。' },
    ],
    reference: [
      ['重编码（transcode）', '把解码后的画面重新编码为目标格式，与直接复制数据流的“无损切割”相对。'],
      ['Seek', '在视频时间轴上跳转到指定时刻的能力，精度由容器索引与解码器共同决定。'],
    ],
  },
  en: {
    overview: [
      'Video trimming re-encodes a chosen segment locally in your browser: drag two sliders to set start and end, WebCodecs hardware-encodes the clip to H.264 MP4, and a local ffmpeg pass cuts the matching audio range from the source and muxes it back in.',
      'Both picture and sound come strictly from the selected range. Quality presets are high / medium / low, defaulting to high quality at the original resolution.',
      'The video is never uploaded; everything runs on your device, which makes it suitable for unpublished material.',
    ],
    steps: [
      ['Upload a video', 'Common formats such as MP4, WebM and MOV, up to 5 minutes and 300MB.'],
      ['Set the range with sliders', 'Pick start and end times, at least 0.2 seconds apart; check against the preview.'],
      ['Render and download', 'Only the selected range is re-encoded; preview and download when done.'],
    ],
    scenarios: [
      ['Grabbing a highlight', 'Lift a few seconds from a long recording for social media or messaging.'],
      ['Removing dead air', 'Cut the setup at the beginning and the fumbling at the end, keep the take.'],
      ['Preparing a GIF', 'Trim the exact segment first, then turn it into a GIF with the video-to-GIF tool.'],
    ],
    notes: [
      'The output is a re-encoded clip rather than a lossless cut: slight second-generation compression applies, though nothing outside the range is affected.',
      'Cut precision depends on the browser decoder’s seeking; in practice the error is within a frame.',
      'Audio is cut from the source for the chosen range and muxed back; if muxing fails the export is silent and labeled as such.',
    ],
    specs: [['Output', 'H.264 MP4 (AAC audio)'], ['Range', 'Free start and end times, minimum 0.2 seconds'], ['Quality', 'High / medium / low presets, high at original resolution by default'], ['Limits', '300MB and 5 minutes per file'], ['Encoding pipeline', 'WebCodecs re-encodes only the selected range; ffmpeg.wasm cuts the audio to match'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded']],
    faq: [
      { question: 'Is this a lossless cut?', answer: 'No. The clip is re-encoded to H.264, adding slight second-generation compression; in exchange the output is universally compatible and ready to share. At the default high preset the loss is usually imperceptible.' },
      { question: 'How long can a clip be?', answer: 'Within the 5-minute and 300MB limits. Trimming only re-encodes the selected range, so cutting 10 seconds out of a 5-minute video processes as fast as a 10-second clip.' },
      { question: 'Does the audio get cut too?', answer: 'Yes. The audio track is cut from the source for the chosen range and muxed back in sync; if muxing fails for some formats the export is silent, and the result panel labels it.' },
    ],
    reference: [
      ['Transcoding', 'Re-encoding decoded frames into a target format, as opposed to stream-copy lossless cutting.'],
      ['Seeking', 'Jumping to a timestamp on the timeline; precision is decided by the container index and decoder.'],
    ],
  },
});
