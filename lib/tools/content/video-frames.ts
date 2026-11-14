import { defineToolContent } from './define';

export const videoFramesContent = defineToolContent({
  zh: {
    overview: [
      '视频抽帧 / 截图在浏览器本地从视频导出静帧图片：可以精确指定若干时间点，也可以按固定间隔批量抽帧，输出无损 PNG 或可调质量的 JPG。',
      '抓帧通过 seek 到目标时刻后直接取解码帧完成，精度约在一帧以内；带旋转元数据的手机视频会自动按正确方向输出。',
      '视频不会上传到任何服务器，处理全程在你的设备上完成。',
    ],
    steps: [
      ['上传视频', '支持 MP4、WebM、MOV 等常见格式，最长 5 分钟、最大 300MB。'],
      ['选择抽帧方式', '「指定时间点」模式下播放到目标时刻点「添加当前时间」；「固定间隔」模式下拖动滑块设区间并输入间隔秒数。'],
      ['导出与下载', '输出 PNG 或 JPG；单帧点击下载，多帧可一键打包 ZIP。'],
    ],
    scenarios: [
      ['视频封面', '逐个时间点试几个画面，挑一张做封面或缩略图。'],
      ['素材截图', '从教程、演示视频里按间隔批量导出步骤图。'],
      ['画面分析', '把关键动作逐帧导出，用于比对动作细节或检查画质。'],
    ],
    notes: [
      'seek 精度约一帧以内：个别编码格式在关键帧之外 seek 时可能落在相邻帧，必要时把时间点微调零点几秒。',
      'PNG 无损但体积较大，JPG 体积小、适合批量导出；输出分辨率等于源视频分辨率。',
      '单次最多导出 50 帧：固定间隔模式下帧数超限时间隔会自动拉大以覆盖整个区间。',
    ],
    specs: [['输出', 'PNG（无损）或 JPG（60% / 80% / 92% 质量可选）'], ['分辨率', '与源视频一致'], ['模式', '指定时间点（最多 20 个）或固定间隔'], ['数量', '单次最多 50 帧'], ['上限', '单文件 300MB、时长 5 分钟'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '截取的时间点准确吗？', answer: '精度约在一帧以内（30fps 视频约 33ms）。个别格式在非关键帧处 seek 会落在相邻帧，如需精确到某一帧可微调时间点重试。' },
      { question: '该选 PNG 还是 JPG？', answer: '需要无损归档或后续编辑选 PNG；批量导出步骤图、预览图选 JPG 更省空间，60%~92% 质量可选。' },
      { question: '固定间隔模式下帧数太多怎么办？', answer: '单次上限 50 帧。超出时工具会自动拉大间隔，让帧均匀覆盖你选择的整个区间，而不是在中间截断。' },
    ],
    reference: [
      ['Seek', '在视频时间轴上跳转到指定时刻的能力，精度由容器索引与解码器共同决定。'],
      ['关键帧（keyframe）', '完整编码的帧；视频 seek 通常先定位到关键帧再解码到目标帧。'],
    ],
  },
  en: {
    overview: [
      'Video frame extractor exports still images from a video locally in your browser: pick exact timestamps one by one, or batch-extract on a fixed interval, outputting lossless PNG or quality-adjustable JPG.',
      'Frames are grabbed by seeking to the target moment and capturing the decoded frame, accurate to within about one frame; phone videos with rotation metadata come out in the correct orientation automatically.',
      'The video is never uploaded; everything runs on your device.',
    ],
    steps: [
      ['Upload a video', 'Common formats such as MP4, WebM and MOV, up to 5 minutes and 300MB.'],
      ['Choose an extraction mode', 'In "timestamps" mode play to the target moment and click "add current time"; in "interval" mode set the range with sliders and type the spacing.'],
      ['Export and download', 'Output PNG or JPG; download single frames, or pack many into a ZIP in one click.'],
    ],
    scenarios: [
      ['Video thumbnails', 'Try several moments one by one and pick the best frame for a cover or thumbnail.'],
      ['Tutorial stills', 'Batch-export step images from a lecture or demo video at fixed intervals.'],
      ['Frame analysis', 'Export key actions frame by frame to compare motion details or inspect quality.'],
    ],
    notes: [
      'Seeking is accurate to about one frame: some codecs land on a neighboring frame when seeking off a keyframe; nudge the timestamp slightly if needed.',
      'PNG is lossless but larger; JPG is compact for batch exports. Output resolution equals the source resolution.',
      'Up to 50 frames per run: in interval mode, exceeding the cap automatically widens the spacing to cover the whole range.',
    ],
    specs: [['Output', 'PNG (lossless) or JPG (60% / 80% / 92% quality)'], ['Resolution', 'Same as the source video'], ['Modes', 'Timestamps (up to 20) or fixed interval'], ['Count', 'Up to 50 frames per run'], ['Limits', '300MB and 5 minutes per file'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded']],
    faq: [
      { question: 'Are the timestamps accurate?', answer: 'To within about one frame (33ms at 30fps). Some codecs land on a neighboring frame when seeking off a keyframe; nudge the timestamp and retry if you need an exact frame.' },
      { question: 'PNG or JPG?', answer: 'Choose PNG for lossless archiving or further editing; choose JPG for batch step images and previews, with 60%–92% quality options.' },
      { question: 'Too many frames in interval mode?', answer: 'The per-run cap is 50 frames. Beyond that the spacing widens automatically so frames cover your entire range evenly instead of being cut off mid-way.' },
    ],
    reference: [
      ['Seeking', 'Jumping to a timestamp on the timeline; precision is decided by the container index and decoder.'],
      ['Keyframe', 'A fully encoded frame; video seeking usually lands on a keyframe first and decodes forward to the target.'],
    ],
  },
});
