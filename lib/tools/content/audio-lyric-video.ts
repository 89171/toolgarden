import { defineToolContent } from './define';

export const audioLyricVideoContent = defineToolContent({
  zh: {
    overview: ['MV 生成器把一首 MP3 和一份 LRC 歌词合成为带动态背景的 MP4 歌词视频。画面由浏览器 Canvas 逐帧绘制，音频通过 Web Audio 同步录入，全程在本机完成，不需要上传素材。', '提供黑胶、粒子、频谱、波形、星空隧道和自定义循环视频六种背景模板，可调整视频比例、歌词样式、位置与行数，并在片头显示歌曲信息。'],
    steps: [['选择模板并上传 MP3', '先挑一种视觉氛围；使用循环视频模板时还需上传一段 MP4、WebM 或 MOV 背景片段。'], ['添加歌词和歌曲信息', '上传 LRC 或直接粘贴歌词；没有时间标签的普通文本会按歌曲时长平均分配。'], ['预览并生成 MP4', '在实时预览里检查效果，确认后点击生成，导出期间保持页面在前台。']],
    example: {
      caption: '带时间标签的 LRC 歌词。一行可以写多个时间标签，同一句歌词会在每个时间点重复出现。',
      inputLabel: 'LRC',
      input: '[00:08.50]第一句歌词\n[00:13.20]第二句歌词\n[00:18.00][00:48.00]副歌重复出现',
      outputLabel: '显示规则',
      output: '8.5 秒 → 第一句\n13.2 秒 → 第二句\n18 秒、48 秒 → 副歌',
      language: 'text',
    },
    scenarios: [['为原创歌曲制作发布视频', '给音乐平台、短视频或社交媒体准备带歌词的画面，而不必打开专业剪辑软件。'], ['制作卡拉 OK 风格的歌词视频', '用高亮当前句、淡化上下句的多行模式，方便观众跟唱。'], ['给播客或配乐添加动态画面', '频谱和波形模板会随音频跳动，适合只有声音的内容。']],
    notes: ['导出采用实时渲染，耗时接近歌曲时长，期间请保持页面在前台。', '浏览器不支持原生 MP4 录制时，会先录 WebM 再用 FFmpeg.wasm 转换，首次需联网下载转码组件。', '长音频、竖屏高分辨率或星空隧道模板会占用较多内存和 GPU。', '星空隧道需要 WebGL；当前仅支持 MP3 音频输入。'],
    specs: [['输入', 'MP3 音频、LRC 或纯文本歌词，可选 MP4/WebM/MOV 背景片段'], ['输出', 'MP4，30 帧/秒，视频码率约 8 Mbps'], ['视频比例', '16:9、9:16、4:3、1:1'], ['背景模板', '黑胶回响、星尘粒子、音频频谱、霓虹波形、星空隧道、自定义循环视频'], ['歌词外观', '简洁、描边、霓虹三种样式，可选顶部、居中、底部和单行、多行展示'], ['隐私', '音频、歌词和视频均在浏览器本地处理，不会上传']],
    faq: [{ question: '为什么导出要这么久？', answer: '画面是按播放进度实时绘制并录制的，所以耗时约等于歌曲长度。这样可以保证音画严格同步，也无需把素材发送到服务器。' }, { question: '没有时间标签的歌词怎么办？', answer: '直接每行写一句即可，工具会按歌曲总时长把它们平均分配。需要精确对齐时请先用字幕编辑器制作 LRC。' }],
    reference: [['LRC', '一种带 [分:秒.毫秒] 时间标签的歌词文本格式。'], ['Web Audio', '浏览器内处理和分析音频的接口，用于驱动频谱和波形。']],
  },
  en: {
    overview: ['The MV generator turns an MP3 and an LRC lyric file into an MP4 lyric video with an animated background. Frames are drawn on a browser canvas and the audio is captured through Web Audio, all on your device with nothing uploaded.', 'Choose from six backgrounds — vinyl, particles, spectrum, waveform, star tunnel, or your own looping clip — then adjust aspect ratio, lyric style, position and line count, and show song credits at the start.'],
    steps: [['Pick a template and upload an MP3', 'Choose a visual mood; the loop-video template also needs an MP4, WebM or MOV background clip.'], ['Add lyrics and credits', 'Upload an LRC or paste lyrics; plain text without timestamps is spread evenly across the song.'], ['Preview and export the MP4', 'Check the live preview, then export and keep the page in the foreground while it renders.']],
    example: {
      caption: 'LRC lyrics with timestamps. One row can carry several tags, so a repeated line shows at each time.',
      inputLabel: 'LRC',
      input: '[00:08.50]First line\n[00:13.20]Second line\n[00:18.00][00:48.00]Chorus returns',
      outputLabel: 'Display timing',
      output: '8.5 s → First line\n13.2 s → Second line\n18 s, 48 s → Chorus',
      language: 'text',
    },
    scenarios: [['Release video for an original song', 'Prepare a lyric visual for music platforms, short video or social media without opening a pro editor.'], ['Karaoke-style lyric video', 'Multi-line mode highlights the current line and dims its neighbours so viewers can sing along.'], ['Visuals for a podcast or soundtrack', 'Spectrum and waveform templates move with the audio, which suits audio-only content.']],
    notes: ['Export renders in real time, so it takes about as long as the song; keep the page in the foreground.', 'Browsers without native MP4 recording capture WebM and convert it with FFmpeg.wasm, which downloads its converter on first use.', 'Long audio, tall high-resolution canvases and the star tunnel use a lot of memory and GPU.', 'The star tunnel needs WebGL; only MP3 audio input is supported.'],
    specs: [['Input', 'MP3 audio, LRC or plain-text lyrics, optional MP4/WebM/MOV background clip'], ['Output', 'MP4 at 30 fps, about 8 Mbps video bitrate'], ['Aspect ratios', '16:9, 9:16, 4:3, 1:1'], ['Templates', 'Vinyl, stardust, spectrum, neon waveform, star tunnel, custom loop video'], ['Lyric look', 'Clean, outline or neon style; top, center or bottom position; single or multi-line display'], ['Privacy', 'Audio, lyrics and video are processed locally in the browser and never uploaded']],
    faq: [{ question: 'Why does export take so long?', answer: 'Frames are drawn and recorded in step with playback, so it takes about as long as the song. That keeps audio and picture exactly in sync and avoids sending files to a server.' }, { question: 'What if my lyrics have no timestamps?', answer: 'Put one line per row and the tool spreads them evenly over the song length. For precise timing, build an LRC first with the subtitle editor.' }],
    reference: [['LRC', 'A lyric text format with [mm:ss.xx] timestamps.'], ['Web Audio', 'The browser API for processing and analysing audio, used to drive the spectrum and waveform.']],
  },
});
