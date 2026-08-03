import { defineToolContent } from './define';

export const audioToMp3Content = defineToolContent({
  zh: {
    overview: [
      'MP3 是兼容性广泛的有损音频格式，适合语音、音乐试听和通用分享。转换会先解码源音频再按所选比特率重新编码，较低比特率能减小文件，但高频、瞬态和复杂混音更容易出现失真。',
      '工具在浏览器中处理常见音频输入并输出 MP3。转码不会改善低质量来源，反而会再经历一次有损编码，因此应从质量最好的源文件开始，并按内容类型与收听环境选择比特率。',
    ],
    steps: [['上传源音频', '选择未损坏且质量尽可能高的文件。'], ['选择比特率', '语音可从较低值测试，音乐应从较高值开始比较。'], ['试听并下载', '检查人声齿音、乐器高频和安静段噪声后保存。']],
    scenarios: [['提高播放兼容性', '把浏览器或设备不易读取的音频转换为常见 MP3。'], ['准备分享文件', '在可接受音质下减小语音或音乐样例的体积。'], ["统一一批素材的格式", "把来自不同录音设备和平台的音频转成同一种 MP3 规格，便于批量导入剪辑软件或播客平台。"]],
    notes: ['MP3 不支持无损保存，数值更高也不能恢复源文件已经丢失的细节。', '多次 MP3 转码会累积失真，后续编辑应保留无损母版。', '标签、封面和章节等元数据不一定随浏览器转码保留。'],
    specs: [["输入格式", "WAV、M4A / AAC、OGG、FLAC、WebM、MP3 等浏览器可解码的音频"], ["输出", "MP3（MPEG-1 Layer III），常用档位 96 / 128 / 192 / 320 kbps"], ["采样率与声道", "沿用源文件；MP3 支持的采样率有限，不受支持时会重采样到最接近的一档"], ["元数据", "标题、艺术家、封面等标签不保证保留，转码后需要自行补写"], ["体积估算", "约 = 比特率 ÷ 8 × 秒数，128 kbps 每分钟约 0.9 MB"], ["处理位置", "浏览器内的 FFmpeg WebAssembly，音频文件不上传"]],
    faq: [{ question: "转成 MP3 会让音质变差吗？", answer: "会。MP3 是有损格式，无论从什么源转来都会丢弃一部分信息。高比特率可以减少可闻损失，但结果仍取决于素材、编码器和收听条件；从已经是 MP3 的文件再转一次，则是在已有损失上叠加第二次损失。" }, { question: "比特率该选多少？", answer: "语音通常可以从较低档位开始测试，复杂音乐应从较高档位开始。目标平台有明确要求时以其规范为准；否则实际试听人声齿音、背景噪声和高频乐器后再决定。" }, { question: "为什么转换很慢或直接失败？", answer: "转码由你的设备完成，整个文件需要读进浏览器内存。长音频或高码率素材可能因内存不足中断，这种情况先把文件切短再分段处理。" }],
    reference: [['bitrate', '每秒用于表示音频的数据量，通常以 kbps 表示。'], ['transcoding', '先解码一种音频表示，再编码为另一种表示的过程。']],
  },
  en: {
    overview: ['MP3 is a widely compatible lossy audio format for speech, music previews, and general sharing. Conversion decodes the source and re-encodes at the selected bitrate. Lower bitrate reduces size but more readily damages high frequencies, transients, and complex mixes.', 'The tool processes common audio inputs in the browser and outputs MP3. Transcoding cannot improve a weak source and adds another lossy generation, so begin with the best available file and choose bitrate for the content and listening environment.'],
    steps: [['Upload the source', 'Choose an undamaged file with the highest practical quality.'], ['Choose a bitrate', 'Speech can be tested lower, while music should be compared from a higher setting.'], ['Listen and download', 'Check vocal sibilance, instrument highs, and noise in quiet passages before saving.']],
    scenarios: [['Improving playback compatibility', 'Convert an audio format that a browser or device does not read reliably into common MP3.'], ['Preparing a shareable file', 'Reduce a speech or music sample while retaining acceptable listening quality.'], ["Normalising a batch of material", "Convert audio from different recorders and platforms into one MP3 specification so it imports cleanly into an editor or podcast host."]],
    notes: ['MP3 is not lossless, and a higher setting cannot restore detail absent from the source.', 'Repeated MP3 transcoding accumulates artifacts, so retain a lossless master for editing.', 'Tags, cover art, and chapters may not survive browser transcoding.'],
    specs: [["Input formats", "WAV, M4A / AAC, OGG, FLAC, WebM, MP3; anything the browser can decode"], ["Output", "MP3 (MPEG-1 Layer III) at the usual 96 / 128 / 192 / 320 kbps steps"], ["Sample rate and channels", "Carried over from the source; MP3 supports a limited set of rates, so an unsupported rate is resampled to the nearest one"], ["Metadata", "Title, artist and cover art are not guaranteed to survive; re-tag after converting"], ["Size estimate", "Roughly bitrate ÷ 8 × seconds; about 0.9 MB per minute at 128 kbps"], ["Where it runs", "FFmpeg compiled to WebAssembly in your browser; the file is never uploaded"]],
    faq: [{ question: "Does converting to MP3 hurt quality?", answer: "Yes. MP3 is lossy, so information is discarded whatever the source. A higher bitrate can reduce audible loss, but the result still depends on the material, encoder, and listening conditions. Re-encoding a file that is already MP3 adds a second generation of loss." }, { question: "Which bitrate should I pick?", answer: "Speech can usually be tested from a lower step, while complex music should start higher. Follow the destination platform when it has a requirement; otherwise listen for vocal sibilance, background noise, and high-frequency instruments before deciding." }, { question: "Why is conversion slow, or failing outright?", answer: "Transcoding runs on your device and the whole file is read into browser memory. Long or high-bitrate material can exhaust it; cut the source into shorter pieces and process them separately." }],
    reference: [['bitrate', 'The amount of data used for each second of audio, commonly measured in kbps.'], ['transcoding', 'Decoding one audio representation and encoding the result into another.']],
  },
});
