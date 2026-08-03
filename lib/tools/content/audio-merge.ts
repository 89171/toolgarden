import { defineToolContent } from './define';

export const audioMergeContent = defineToolContent({
  zh: {
    overview: ['音频合并会按列表顺序把多个文件首尾连接为一条连续音轨。来源文件的格式、采样率和声道可能不同，工具需要统一解码并重新编码输出，因此边界处的音量、底噪和节奏差异不会自动消失。', '它适合拼接分段录音、章节或同一项目中的语音片段。若需要交叉淡化、多轨叠加、精确节拍或背景音乐混音，应使用具备时间线的音频编辑器。'],
    steps: [['按顺序添加文件', '确认每段可播放，并把列表调整为最终先后顺序。'], ['统一输出设置', '选择比特率，并试听各段音量和静音边界是否接近。'], ['生成后通听', '重点检查每个连接点、总时长和最后一段是否完整。']],
    scenarios: [['合并分段录音', '把因设备或上传限制拆分的会议录音重新连接。'], ['整理语文章节', '将同一课程或播客的连续片段按编号组合为单文件。'], ["把分段录音接成完整音频", "分几次录制的旁白或访谈，按顺序合并成一条，再统一做后续处理。"]],
    notes: ['合并是顺序连接，不会让多个声音同时播放。', '来源音量差异需要先做增益或响度处理，否则连接处会突变。', '重新编码可能移除单个文件的封面、标签和章节元数据。'],
    specs: [["输入", "多个文件，格式可以互不相同"], ["输出", "单个 MP3"], ["顺序依据", "列表顺序，不按文件名排序"], ["采样率与声道", "各段会统一到同一套参数后再拼接，单声道与立体声混用时以立体声为准"], ["段间处理", "首尾直接相接，不做交叉淡化；需要淡入淡出请在音频编辑软件里完成"], ["处理位置", "浏览器内的 FFmpeg WebAssembly，音频文件不上传"]],
    faq: [{ question: "不同格式的文件能一起合并吗？", answer: "可以。每个文件会先解码，统一到同一套采样率和声道后再拼接，输出为单个 MP3。" }, { question: "段落之间会有停顿或杂音吗？", answer: "首尾直接相接，不额外插入静音，也不做交叉淡化。如果原素材结尾有突然的电平变化，接缝处可能听到轻微的咔声，需要淡入淡出请在音频编辑软件里做。" }, { question: "合并顺序怎么定？", answer: "完全按列表顺序，不看文件名。即使文件名带 01、02 的序号也不会自动排列，导出前请确认列表。" }],
    reference: [['concatenation', '按时间顺序把一个音频片段接在另一个片段之后。'], ['crossfade', '让前段淡出、后段淡入并短暂重叠的过渡，本工具的简单连接不等同于此。']],
  },
  en: {
    overview: ['Audio merging places multiple files end to end in list order as one continuous track. Sources can differ in format, sample rate, and channels, requiring common decoding and output encoding; differences in volume, noise floor, and rhythm do not disappear automatically at boundaries.', 'It suits segmented recordings, chapters, and related spoken clips. Use a timeline audio editor for crossfades, simultaneous tracks, beat-accurate placement, or music mixing.'],
    steps: [['Add files in order', 'Confirm each plays and arrange the list in the intended final sequence.'], ['Choose common output', 'Set bitrate and compare level and silence at the boundaries.'], ['Listen through the result', 'Pay particular attention to every join, total duration, and the end of the last segment.']],
    scenarios: [['Joining segmented recordings', 'Reconnect a meeting split by a device or upload duration limit.'], ['Assembling spoken chapters', 'Combine numbered course or podcast segments into one sequential file.'], ["Joining a recording made in sessions", "Narration or an interview captured across several takes can be merged in order and then processed as one file."]],
    notes: ['Merge means sequential concatenation and does not make sounds play simultaneously.', 'Level differences require gain or loudness work first to avoid abrupt joins.', 'Re-encoding can remove cover art, tags, and chapter metadata from individual files.'],
    specs: [["Input", "Several files, which do not have to share a format"], ["Output", "A single MP3"], ["Ordering", "List order; never sorted by filename"], ["Sample rate and channels", "Segments are normalised to one set of parameters before joining; mixed mono and stereo resolves to stereo"], ["Joins", "Butt-joined end to end with no crossfade; do fades in an audio editor if you need them"], ["Where it runs", "FFmpeg compiled to WebAssembly in your browser; the files are never uploaded"]],
    faq: [{ question: "Can I merge files of different formats?", answer: "Yes. Each file is decoded and normalised to one sample rate and channel layout before joining, and the output is a single MP3." }, { question: "Will there be gaps or noise between segments?", answer: "Segments are butt-joined with no inserted silence and no crossfade. If a take ends on an abrupt level change you may hear a faint click at the seam; do fades in an audio editor if that matters." }, { question: "How is the order decided?", answer: "Purely by the list, never by filename. Numbered names will not sort themselves, so check the list before exporting." }],
    reference: [['concatenation', 'Placing one audio segment directly after another in time.'], ['crossfade', 'Overlapping a fade-out and fade-in between clips, which differs from a simple join.']],
  },
});
