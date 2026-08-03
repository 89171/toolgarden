import { defineToolContent } from './define';

export const audioSpeedContent = defineToolContent({
  zh: {
    overview: ['音频变速会改变播放时长和说话或演奏节奏。工具按所选倍率生成新文件，1.25 倍会缩短时长，0.75 倍会延长时长；处理算法可能尝试保持音高，但极端倍率仍容易带来颤动、金属感或发音模糊。', '它适合加快课程回顾、放慢语言练习和制作临时节奏版本。若用于音乐制作并要求精确节拍、音高锁定或高质量时间拉伸，应使用可设置算法和节拍网格的音频工作站。'],
    steps: [['上传并记录时长', '确认内容完整，并选择包含快速和慢速段落的位置作为试听样本。'], ['设置速度倍率', '先从接近 1.0 的小幅变化开始生成。'], ['试听后导出', '检查语音清晰度、音乐瞬态和最终时长，再保存。']],
    scenarios: [['加速学习录音', '把语速较慢的课程或会议做成更紧凑的回顾版本。'], ['放慢发音片段', '降低语言或乐器示范速度，帮助辨认细节。'], ["加速听完长录音", "1.5x 播放能把一小时的讲座压到 40 分钟，导出成文件后可以在任何播放器上保持这个速度。"]],
    notes: ['变速会改变总时长，字幕和时间码不会自动同步。', '极端倍率会明显降低质量，应分段试听而不是只检查开头。', '若算法不保持音高，速度提高会升高音调，降低则会使音调下降。'],
    specs: [["调整范围", "常用 0.5x 到 2x，慢放和快放都会相应改变总时长"], ["音高处理", "使用变速不变调处理，语音听起来仍然自然，不会出现「花栗鼠」效果"], ["极端倍速", "超过约 2x 或低于 0.5x 时，时间伸缩算法容易产生金属声和回声感"], ["输出", "MP3。变速后重新编码，因此会有一次有损转换"], ["时长换算", "新时长 = 原时长 ÷ 倍速，1.5x 会把 60 分钟压到 40 分钟"], ["处理位置", "浏览器内的 FFmpeg WebAssembly，音频文件不上传"]],
    faq: [{ question: "变速后声音会变尖吗？", answer: "不会。使用的是变速不变调算法，音高保持原样，所以语音听起来仍然自然，不会出现老式快进的「花栗鼠」效果。" }, { question: "为什么倍速太高会有金属声？", answer: "时间伸缩需要在时域上重排音频片段。倍速越极端，重排的痕迹越难掩盖，会表现为金属感或轻微回声。建议保持在 0.5x 到 2x 之间。" }, { question: "变速会改变文件大小吗？", answer: "会。时长变了，按同一比特率编码的体积也随之变化。1.5x 的输出大约是原来的三分之二。" }],
    reference: [['playback rate', '输出时间相对于原始播放时间的速度倍率。'], ['time stretching', '在尽量保持音高的同时改变音频时长的处理。']],
  },
  en: {
    overview: ['Audio speed changes duration and the pace of speech or performance. The selected multiplier produces a new file: 1.25x shortens and 0.75x lengthens it. Processing may attempt to preserve pitch, but extreme rates can still introduce flutter, metallic texture, or blurred articulation.', 'It suits faster lesson review, slower language practice, and temporary tempo versions. For music production requiring exact beats, locked pitch, or high-quality stretching, use an audio workstation with algorithm and tempo-grid controls.'],
    steps: [['Upload and note duration', 'Confirm completeness and choose samples containing both fast and slow passages.'], ['Set a speed multiplier', 'Begin with a modest change close to 1.0.'], ['Listen and export', 'Check speech clarity, musical transients, and final duration before saving.']],
    scenarios: [['Accelerating study audio', 'Create a more compact review version of a slow lesson or meeting.'], ['Slowing a pronunciation clip', 'Reduce the speed of language or instrument demonstrations to hear detail.'], ["Getting through a long recording faster", "1.5x turns an hour-long lecture into forty minutes, and exporting it keeps that speed in any player."]],
    notes: ['Speed changes total duration, and subtitles or timecodes are not synchronized automatically.', 'Extreme rates reduce quality, so inspect multiple sections instead of only the opening.', 'Without pitch preservation, faster speed raises pitch and slower speed lowers it.'],
    specs: [["Range", "Typically 0.5x to 2x; both slowing down and speeding up change the total duration"], ["Pitch handling", "Time-stretched without pitch shift, so speech still sounds natural rather than chipmunked"], ["Extreme rates", "Past roughly 2x or below 0.5x the time-stretching algorithm tends to add a metallic, echoey quality"], ["Output", "MP3, re-encoded after the change, so one lossy generation is added"], ["Duration maths", "New duration = original ÷ rate, so 1.5x turns 60 minutes into 40"], ["Where it runs", "FFmpeg compiled to WebAssembly in your browser; the file is never uploaded"]],
    faq: [{ question: "Does speeding it up raise the pitch?", answer: "No. The algorithm time-stretches without shifting pitch, so speech still sounds natural rather than producing the old fast-forward chipmunk effect." }, { question: "Why does an extreme rate sound metallic?", answer: "Time-stretching rearranges audio segments in the time domain. The more extreme the rate, the harder those joins are to hide, and they surface as a metallic or faintly echoey quality. Stay between 0.5x and 2x." }, { question: "Does changing speed change the file size?", answer: "Yes. The duration changes, so at the same bitrate the size changes with it. A 1.5x export is roughly two-thirds the original." }],
    reference: [['playback rate', 'The speed multiplier of output time relative to original playback.'], ['time stretching', 'Changing audio duration while attempting to preserve pitch.']],
  },
});
