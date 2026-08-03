import { defineToolContent } from './define';

export const audioTrimContent = defineToolContent({
  zh: {
    overview: ['音频裁剪保留所选开始与结束时间之间的片段，用于删除录音前后的空白、提取一句话或制作短样例。时间范围以秒为基础，输出通常重新编码，因此切点精度和波形边界受解码器与格式影响。', '在非零振幅处直接切断可能产生咔哒声，句子和音乐也需要保留自然的呼吸或衰减。简单裁剪适合粗略片段，要求毫秒级切点、淡入淡出和无损帧切割时应使用专业编辑器。'],
    steps: [['试听并定位范围', '记录需要保留内容的开始和结束时间，留出少量自然边界。'], ['输入有效时间', '确保开始小于结束且范围没有超过总时长。'], ['导出并检查切点', '试听头尾是否截字、爆音或残留过长静音。']],
    scenarios: [['清理录音首尾', '去掉开始准备和结束后的无关静音。'], ['提取音频片段', '从长录音保留一段引用、示例或提示音。'], ["截取录音里的有效片段", "从一小时的会议录音里只取需要引用的两分钟，避免分享整段内容。"]],
    notes: ['裁剪输出是新文件，应保留原始录音以便调整时间范围。', '切点落在强波形中可能产生瞬态噪声，可稍微移动到自然静音附近。', '有损格式重新编码后不会与原片段字节完全相同。'],
    specs: [["选取方式", "按开始与结束时间截取，时间精度到秒 / 毫秒级"], ["输出", "MP3。截取后重新编码，因此会有一次有损转换"], ["边界对齐", "MP3 以帧为单位，实际切点可能与输入时间相差几十毫秒"], ["保留范围", "只保留区间内的音频，区间外的内容不会写入输出"], ["与去除静音的区别", "这里按你指定的时间点切，去除静音是自动检测空白段落"], ["处理位置", "浏览器内的 FFmpeg WebAssembly，音频文件不上传"]],
    faq: [{ question: "切点为什么和我输入的时间差一点？", answer: "MP3 以帧为编码单位，一帧约 26 毫秒，实际切点会落在最近的帧边界上。需要采样级精度请先转成 WAV 再用音频编辑软件处理。" }, { question: "剪辑会降低音质吗？", answer: "剪辑本身不改变保留部分的内容，但输出为 MP3 时会重新编码一次，因此有一代有损损失。从无损源剪辑影响很小。" }, { question: "能一次剪出多个片段吗？", answer: "每次处理一个区间。需要多个片段请分次操作，或者剪出后用音频合并拼接。" }],
    reference: [['time range', '由开始时间和结束时间定义的保留区间。'], ['zero crossing', '波形振幅穿过零的位置，在附近切割通常较少产生咔哒声。']],
  },
  en: {
    overview: ['Audio trimming retains the segment between selected start and end times, removing leading silence, extracting a sentence, or creating a short sample. The range is set in seconds and output is commonly re-encoded, so cut precision and waveform boundaries depend on decoding and format.', 'A hard cut at nonzero amplitude can click, while speech and music need natural breath or decay. Simple trimming suits rough segments; millisecond precision, fades, and lossless frame cuts call for a professional editor.'],
    steps: [['Listen and locate the range', 'Note the desired start and end while leaving a small natural boundary.'], ['Enter valid times', 'Ensure start is before end and neither exceeds the total duration.'], ['Export and inspect cuts', 'Listen for clipped words, clicks, or excessive remaining silence at both ends.']],
    scenarios: [['Cleaning recording ends', 'Remove preparation at the beginning and unrelated silence after the content.'], ['Extracting an audio excerpt', 'Keep a quotation, example, or alert from a longer recording.'], ["Pulling the useful part out of a recording", "Take the two minutes you need to quote from an hour-long meeting rather than sharing the whole thing."]],
    notes: ['The trimmed output is a new file, so retain the original for later range changes.', 'Cuts inside a strong waveform can click; moving near natural silence often helps.', 'A re-encoded lossy output is not byte-identical to the corresponding source segment.'],
    specs: [["How you select", "By start and end time, at second / millisecond precision"], ["Output", "MP3. The result is re-encoded, so one lossy generation is added"], ["Boundary alignment", "MP3 works in frames, so the real cut can land a few tens of milliseconds from the time you typed"], ["What is kept", "Only audio inside the range; everything outside it is not written to the output"], ["vs Remove Silence", "This cuts at times you specify; Remove Silence detects blank passages automatically"], ["Where it runs", "FFmpeg compiled to WebAssembly in your browser; the file is never uploaded"]],
    faq: [{ question: "Why is the cut slightly off from the time I entered?", answer: "MP3 encodes in frames of roughly 26 ms, so the real cut lands on the nearest frame boundary. For sample-accurate edits, convert to WAV and use an audio editor." }, { question: "Does trimming reduce quality?", answer: "Trimming does not alter the audio you keep, but MP3 output re-encodes it, adding one lossy generation. Starting from a lossless source keeps the effect small." }, { question: "Can I cut several segments at once?", answer: "One range per run. For multiple segments, trim them separately and then join the results with Audio Merge." }],
    reference: [['time range', 'The retained interval defined by start and end time.'], ['zero crossing', 'A point where waveform amplitude crosses zero, often a cleaner place to cut.']],
  },
});
