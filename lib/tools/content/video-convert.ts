import { defineToolContent } from './define';

export const videoConvertContent = defineToolContent({
  zh: {
    overview: [
      '视频转 MP4 在浏览器本地把任意浏览器能解码的视频重编码为 H.264 MP4：MOV、MKV、WebM、AVI 等格式上传后直接输出通用 MP4，优先走 WebCodecs 硬件解码加速，再由本地 ffmpeg 回填音轨。',
      '它解决的是兼容性问题：手机录制的 MOV、屏幕录制的 MKV、网页下载的 WebM，在很多播放器、剪辑软件和社交平台上传口都不被接受。重编码后的 H.264 MP4 几乎在所有设备上都能直接播放。',
      '视频不会上传到任何服务器，处理全程在你的设备上完成，适合处理未发布的素材。',
    ],
    steps: [
      ['上传视频', '支持 MP4、WebM、MOV、MKV 等浏览器可解码的格式，最长 5 分钟、最大 300MB。'],
      ['选择画质', '默认高档位、保持原分辨率；中低档位可明显减小输出体积。'],
      ['转换并下载', '重编码完成后预览、下载，输出文件可直接分享或继续剪辑。'],
    ],
    scenarios: [
      ['统一格式', '把 MOV、MKV、WebM 等混杂格式统一转成 MP4，方便归档与分享。'],
      ['修复兼容性', '社交平台或老设备不认源格式时，转 MP4 是最稳妥的出路。'],
      ['剪辑前预处理', '先把素材转成 MP4，再交给视频截取、压缩或画面裁剪工具继续处理。'],
    ],
    notes: [
      '输出是重编码的 H.264 MP4 而非容器封装转换：画质会有轻微的二次压缩，换来的是最佳兼容性。',
      '源视频的画面编码（如 HEVC、AV1）浏览器能播就能转；个别编码转换失败时请先在播放器里确认视频可正常播放。',
      '音轨重编码为 AAC 并回填；个别格式回填失败时会输出无声视频并标注。',
    ],
    specs: [['输出', 'H.264 MP4（AAC 音轨）'], ['画质', '高 / 中 / 低三档，默认高档原分辨率'], ['上限', '单文件 300MB、时长 5 分钟'], ['编码管线', 'WebCodecs 解码重编码 + ffmpeg.wasm 音轨回填'], ['音轨', '重编码为 AAC 并回填；个别格式失败时输出无声视频并标注'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '和直接改扩展名有什么区别？', answer: '改扩展名只是换个名字，视频编码不变，不兼容的播放器照样打不开。本工具真正把画面重编码为 H.264、音轨重编码为 AAC，输出的是标准 MP4。' },
      { question: '会损失画质吗？', answer: '重编码会有轻微的二次压缩，默认高档位、保持原分辨率时通常难以察觉；选择中低档位可以明显减小体积，适合对画质要求不高的分享场景。' },
      { question: 'MKV 里的多条音轨和字幕怎么处理？', answer: '工具取第一条视频轨和第一条音轨转成 MP4；MKV 内封的字幕轨道不会带入输出。需要保留字幕请使用字幕工具单独处理。' },
    ],
    reference: [
      ['容器与编码', 'MP4、MKV 是容器（封装格式），H.264、HEVC 是编码（画面压缩方式）。兼容性问题通常来自编码，而不是容器本身。'],
      ['转码（transcode）', '把解码后的画面重新编码为目标编码，与只换封装的 remux 相对。'],
    ],
  },
  en: {
    overview: [
      'Video to MP4 re-encodes anything your browser can decode into a universal H.264 MP4, locally: MOV, MKV, WebM and AVI files go in, a standard MP4 comes out, accelerated by WebCodecs hardware decoding with the audio track re-added by a local ffmpeg pass.',
      'It solves compatibility: phone MOVs, screen-recording MKVs and downloaded WebM files are frequently rejected by players, editors, and social upload forms. An H.264 MP4 plays back on practically every device.',
      'The video is never uploaded; everything runs on your device, which makes it suitable for unpublished material.',
    ],
    steps: [
      ['Upload a video', 'Browser-decodable formats such as MP4, WebM, MOV and MKV, up to 5 minutes and 300MB.'],
      ['Pick quality', 'High preset at original resolution by default; medium and low shrink the output noticeably.'],
      ['Convert and download', 'Preview and download the re-encoded file, ready to share or edit further.'],
    ],
    scenarios: [
      ['Normalizing formats', 'Turn a mix of MOV, MKV and WebM files into uniform MP4s for archiving and sharing.'],
      ['Fixing compatibility', 'When a platform or an old device rejects the source format, MP4 is the safest answer.'],
      ['Pre-processing for editing', 'Convert footage to MP4 first, then continue with the trim, compress, or crop tools.'],
    ],
    notes: [
      'The output is a re-encoded H.264 MP4, not a container swap: slight second-generation compression applies, in exchange for the best compatibility.',
      'Any picture codec the browser can play (HEVC, AV1 and so on) can be converted; if a conversion fails, first confirm the video plays in a player.',
      'Audio is re-encoded to AAC and muxed back; if muxing fails the export is silent and labeled as such.',
    ],
    specs: [['Output', 'H.264 MP4 (AAC audio)'], ['Quality', 'High / medium / low presets, high at original resolution by default'], ['Limits', '300MB and 5 minutes per file'], ['Encoding pipeline', 'WebCodecs decode + re-encode, audio remuxed with ffmpeg.wasm'], ['Audio', 'Re-encoded to AAC and muxed back; failures export a silent video, labeled'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded']],
    faq: [
      { question: 'How is this different from renaming the extension?', answer: 'Renaming only changes the label; the codec stays incompatible. This tool genuinely re-encodes the picture to H.264 and the audio to AAC, producing a standards-compliant MP4.' },
      { question: 'Will quality drop?', answer: 'Re-encoding adds slight second-generation compression. At the default high preset with the original resolution it is usually imperceptible; medium and low presets shrink files noticeably for casual sharing.' },
      { question: 'What happens to multiple audio tracks and subtitles in MKV?', answer: 'The tool takes the first video and first audio track into the MP4; embedded subtitle tracks are not carried over. Use the subtitle tool to handle captions separately.' },
    ],
    reference: [
      ['Container vs codec', 'MP4 and MKV are containers; H.264 and HEVC are codecs. Compatibility problems usually come from the codec, not the container.'],
      ['Transcoding', 'Re-encoding decoded frames into a target codec, as opposed to remuxing into a different container.'],
    ],
  },
});
