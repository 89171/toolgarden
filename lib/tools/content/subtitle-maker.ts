import { defineToolContent } from './define';

export const subtitleMakerContent = defineToolContent({
  zh: {
    overview: ['字幕制作器用于建立带开始时间、结束时间和文本的字幕条目，并导出常见字幕格式。清晰字幕不仅需要准确文字，还要控制每条持续时间、阅读速度、换行位置以及与画面和说话节奏的同步。', '自动或手工生成的字幕都需要完整校对。姓名、数字、方言、多人重叠和背景声音容易出错；无障碍字幕还应标注关键非语言声音与说话人，而不只是转写对白。'],
    steps: [['准备视频或音频参考', '确认最终剪辑已经稳定，避免之后改变时间线导致整体偏移。'], ['逐条设置时间和文字', '让字幕在发声附近出现，保持适当时长并在语义边界换行。'], ['导出并回放检查', '在目标播放器加载字幕，检查全片同步、字符编码和遮挡位置。']],
    example: {
      caption: "三种格式的同一条字幕。SRT 带序号，VTT 用点号分隔毫秒，LRC 精度只到十分之一秒。",
      inputLabel: "SRT",
      input: "1\n00:00:02,500 --> 00:00:05,000\n欢迎观看本教程",
      outputLabel: "VTT 与 LRC",
      output: "// VTT\nWEBVTT\n\n00:00:02.500 --> 00:00:05.000\n欢迎观看本教程\n\n// LRC\n[00:02.50]欢迎观看本教程",
      language: "text",
    },
    scenarios: [['为教程添加字幕', '让无声观看者和听障用户也能理解操作与关键提示。'], ['制作多语言字幕稿', '基于校对后的源语言时间轴翻译文本，同时保留同步结构。'], ["把自动转写结果整理成成品字幕", "音频转文本给出的是连续文本，在这里切分成条目、对齐时间轴，才能成为可用的字幕文件。"]],
    notes: ['重新剪辑视频后字幕时间码可能全部偏移，应在最终版本上制作或重新同步。', '每行过长和显示过短会降低可读性，不能只追求逐字同步。', 'SRT 等格式的样式能力有限，播放器支持也可能不同。'],
    specs: [["支持格式", "SRT、VTT、LRC，三种格式之间可互转"], ["格式差异", "SRT 用于视频且带序号，VTT 是 Web 标准并支持样式提示，LRC 用于歌词且时间戳精度到十分之一秒"], ["媒体预览", "可载入本地音视频对照校准时间轴，媒体文件不上传"], ["时间轴调整", "支持整体偏移与逐条微调，用于修正与画面不同步的字幕"], ["编码", "按 UTF-8 读写。旧播放器导出的 GBK 字幕可能出现乱码，需先转码"], ["不做什么", "不做语音识别。需要从音频生成初稿请先用音频转文本"]],
    faq: [{ question: "三种格式该选哪个？", answer: "视频平台和播放器用 SRT，兼容性最好；网页 <track> 元素要求 VTT；音乐播放器的歌词用 LRC。不确定时先做 SRT，需要时再转成其它两种。" }, { question: "字幕整体比画面快或慢怎么办？", answer: "用整体偏移一次性修正：这种情况通常是起始点对不上，而不是每条都有独立误差。如果越到后面偏差越大，则是帧率不匹配导致的累积误差，需要按比例缩放而不是平移。" }],
    reference: [['timecode', '标记字幕出现和消失时刻的时间位置。'], ['caption', '包含对白及必要非语言声音信息的可访问性文字轨。']],
  },
  en: {
    overview: ['The subtitle maker builds entries with start time, end time, and text and exports common subtitle formats. Clear subtitles require accurate words plus controlled duration, reading speed, line breaks, and synchronization with picture and speech rhythm.', 'Automatic and manual subtitles both need full proofreading. Names, numbers, dialects, overlapping speakers, and background sounds are error-prone. Accessible captions also identify relevant non-speech audio and speakers instead of transcribing dialogue alone.'],
    steps: [['Prepare the media reference', 'Use a stable final edit so later timeline changes do not shift all cues.'], ['Set each cue and text', 'Appear near the speech, allow enough reading time, and break lines at semantic boundaries.'], ['Export and playback-test', 'Load subtitles in the target player and inspect full-program sync, encoding, and screen placement.']],
    example: {
      caption: "One cue in all three formats. SRT carries a sequence number, VTT separates milliseconds with a dot, and LRC only resolves to a tenth of a second.",
      inputLabel: "SRT",
      input: "1\n00:00:02,500 --> 00:00:05,000\nWelcome to this tutorial",
      outputLabel: "VTT and LRC",
      output: "// VTT\nWEBVTT\n\n00:00:02.500 --> 00:00:05.000\nWelcome to this tutorial\n\n// LRC\n[00:02.50]Welcome to this tutorial",
      language: "text",
    },
    scenarios: [['Captioning a tutorial', 'Make actions and important instructions available to muted viewers and people with hearing loss.'], ['Building a translated subtitle track', 'Translate from a proofread source-language timeline while preserving synchronization.'], ["Turning an auto-transcript into finished subtitles", "Audio to Text produces continuous prose; splitting it into cues and aligning the timeline here is what makes it a usable subtitle file."]],
    notes: ['A new video edit can shift every timecode, requiring subtitles to be recreated or resynchronized.', 'Overlong lines and short display time reduce readability even when word timing is exact.', 'Formats such as SRT have limited styling, and player support varies.'],
    specs: [["Supported formats", "SRT, VTT and LRC, convertible between all three"], ["Format differences", "SRT is for video and carries sequence numbers, VTT is the web standard and supports styling cues, LRC is for lyrics with tenth-of-a-second timestamps"], ["Media preview", "Load local audio or video to calibrate the timeline against it; the media file is never uploaded"], ["Timing adjustment", "Global offset plus per-cue nudging, for fixing subtitles that drift out of sync"], ["Encoding", "Read and written as UTF-8. GBK subtitles exported by older players may need converting first"], ["What it does not do", "No speech recognition. To draft from audio, run Audio to Text first"]],
    faq: [{ question: "Which of the three formats should I use?", answer: "SRT for video platforms and players, where compatibility is best; VTT for the web <track> element; LRC for lyrics in music players. When unsure, produce SRT and convert later if needed." }, { question: "The subtitles run ahead of or behind the picture.", answer: "Fix it with a global offset; that pattern usually means the start point is wrong rather than each cue being individually off. If the drift grows toward the end, it is accumulated error from a frame-rate mismatch and needs proportional scaling instead of a shift." }],
    reference: [['timecode', 'A time position marking when a subtitle appears and disappears.'], ['caption', 'An accessibility text track covering dialogue and relevant non-speech sound.']],
  },
});
