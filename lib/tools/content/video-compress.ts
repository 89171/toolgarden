import { defineToolContent } from './define';

export const videoCompressContent = defineToolContent({
  zh: {
    overview: [
      '视频压缩在浏览器本地重编码视频：WebCodecs 硬件编码为 H.264 MP4，按画质档位决定码率，可选把长边缩放到 1080p / 720p / 480p 进一步减小体积，再用本地 ffmpeg 把音轨压低到对应码率。',
      '压缩是重新编码，不是魔法：码率降得越多，体积越小、细节损失越明显。中等档位通常能覆盖日常分享场景，低档位适合只求能看的场合。',
      '视频不会上传到任何服务器，处理全程在你的设备上完成，关闭页面后数据即被清除。',
    ],
    steps: [
      ['上传视频', '支持 MP4、WebM、MOV 等常见格式，最长 5 分钟、最大 300MB。'],
      ['选择画质与分辨率', '先看预估体积再决定：分辨率缩放对体积的影响通常比降码率更明显。'],
      ['生成并下载', '处理完成后预览对比画质，满意再下载，不满意可换档位重新压缩。'],
    ],
    scenarios: [
      ['聊天工具发大文件', '把超过平台限制的视频压到限额以内，优先缩分辨率。'],
      ['节省存储空间', '旧素材归档前统一压到 720p 中档位，体积通常能降到原来的几分之一。'],
      ['网页或 App 上传提速', '上传前的预压缩能显著缩短弱网环境下的等待时间。'],
    ],
    notes: [
      '压缩是有损的：已压缩过的视频再次压缩损失会叠加，尽量从原始素材出发。',
      '预估体积是按码率推算的参考值，画面复杂度（运动、噪点）会显著影响实际结果。',
      '输出统一为 H.264 MP4，兼容性最好；个别格式音轨回填失败时会输出无声视频。',
    ],
    specs: [['输出', 'H.264 MP4（AAC 音轨）'], ['画质档位', '高 / 中 / 低三档码率系数'], ['分辨率', '保持原尺寸或缩放到长边 1080p / 720p / 480p'], ['上限', '单文件 300MB、时长 5 分钟'], ['编码管线', 'WebCodecs 调用硬件编码器输出 H.264，ffmpeg.wasm 重编码音轨'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '能压到指定大小吗？', answer: '目前按画质档位工作而不是精确到目标字节数。可以先用中档位试一次，看实际输出体积再决定换高档还是低档，通常一两轮就能找到合适的档位。' },
      { question: '为什么压缩后画质明显变差？', answer: '码率系数决定了每像素分配的数据量。低档位为了体积牺牲细节，快速运动和噪点最容易出现块状伪影；对画质敏感的素材请用高档位并保持原分辨率。' },
      { question: '压缩会保留声音吗？', answer: '会尽量保留：音轨会用 AAC 重新编码到与画质档位匹配的码率。个别容器或音频格式回填失败时会导出无声视频，结果信息里会标注。' },
    ],
    reference: [
      ['码率（bitrate）', '每秒视频使用的数据量，直接决定体积与清晰度的平衡。'],
      ['H.264 / AVC', '兼容性最广的视频编码标准，WebCodecs 在浏览器内调用硬件编码器输出。'],
    ],
  },
  en: {
    overview: [
      'Video compression re-encodes your video locally in the browser: WebCodecs hardware-encodes to H.264 MP4 at a bitrate chosen by the quality preset, optionally downscales the long side to 1080p / 720p / 480p, and re-encodes the audio track to a matching bitrate with a local ffmpeg pass.',
      'Compression is re-encoding, not magic: the lower the bitrate, the smaller the file and the more visible the quality loss. The medium preset covers most sharing scenarios; the low preset is for when watchability is all that matters.',
      'The video is never uploaded; everything runs on your device and data is cleared when the page closes.',
    ],
    steps: [
      ['Upload a video', 'Common formats such as MP4, WebM and MOV, up to 5 minutes and 300MB.'],
      ['Pick quality and resolution', 'Check the size estimate first: downscaling usually shrinks files more than lowering bitrate.'],
      ['Render and download', 'Preview the result before downloading; switch presets and re-run if the quality is not right.'],
    ],
    scenarios: [
      ['Sending large files', 'Shrink a video below a chat app limit — start by reducing resolution.'],
      ['Saving storage', 'Archive old footage at 720p medium quality; files typically drop to a fraction of the original size.'],
      ['Faster uploads', 'Pre-compressing before upload cuts waiting time on slow connections.'],
    ],
    notes: [
      'Compression is lossy: compressing an already-compressed video stacks the loss, so start from original footage.',
      'The size estimate is a bitrate-based reference; motion and noise in the footage significantly affect the real result.',
      'Output is always H.264 MP4 for compatibility; if audio muxing fails for some formats, the result is silent and labeled as such.',
    ],
    specs: [['Output', 'H.264 MP4 (AAC audio)'], ['Quality presets', 'High / medium / low bitrate factors'], ['Resolution', 'Original, or long side capped to 1080p / 720p / 480p'], ['Limits', '300MB and 5 minutes per file'], ['Encoding pipeline', 'WebCodecs drives hardware H.264 encoding; ffmpeg.wasm re-encodes the audio'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded']],
    faq: [
      { question: 'Can I target an exact file size?', answer: 'The tool works with quality presets rather than exact byte targets. Try the medium preset once, check the real output size, then step up or down — one or two rounds usually finds the right preset.' },
      { question: 'Why does quality drop noticeably?', answer: 'The bitrate factor decides how much data each pixel gets. The low preset trades detail for size, and fast motion plus noise show blocky artifacts first; use the high preset at original resolution for quality-sensitive footage.' },
      { question: 'Is the audio kept?', answer: 'Usually yes: the audio track is re-encoded to AAC at a bitrate matched to the preset. If muxing fails for some formats the export is silent, and the result panel labels it.' },
    ],
    reference: [
      ['Bitrate', 'Data used per second of video; the core trade-off between size and clarity.'],
      ['H.264 / AVC', 'The most widely compatible video codec; WebCodecs drives hardware encoders to produce it in-browser.'],
    ],
  },
});
