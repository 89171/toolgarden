import { defineToolContent } from './define';

export const videoMergeContent = defineToolContent({
  zh: {
    overview: [
      '视频合并把多个视频按添加顺序拼接成一个 MP4：所有片段共用一个 WebCodecs 编码器顺序编码，时间戳跨片段连续，不需要先导出片段再二次拼接；音轨逐段抽出、对齐后拼成一条回填。',
      '输出分辨率统一为第一个视频的尺寸，其余画面等比缩放并居中（不足处填充黑边），横竖混拼也能得到规整的结果。',
      '全部处理在浏览器本地完成，视频不会上传到任何服务器。',
    ],
    steps: [
      ['添加至少两个视频', '支持 MP4、WebM、MOV 等常见格式，最多 8 个文件，单个最长 5 分钟、最大 300MB。'],
      ['调整顺序并选择画质', '用上移 / 下移按钮排列片段顺序；默认高档位画质。'],
      ['合并并下载', '逐段解码编码为统一的 MP4，完成后预览、下载。'],
    ],
    scenarios: [
      ['拼接分段时间', '把录屏、vlog 的多段素材按顺序合成一个完整视频。'],
      ['合集输出', '把同一主题的多个短片合并为一个合集文件，方便分享。'],
      ['统一分辨率归档', '分辨率混乱的素材合并后统一到第一段的尺寸，便于后续管理。'],
    ],
    notes: [
      '输出分辨率取第一个视频的尺寸：若后续片段比例不同，会等比缩放并加黑边，不会拉伸变形。',
      '每段开头的音轨会对齐到该段视频时长；无音轨的片段自动补静音，保证后面段落声画对齐。',
      '画面重编码为 H.264，会有轻微的二次压缩；段数越多、总时长越长，处理时间与内存占用越大（总时长上限 15 分钟）。',
    ],
    specs: [['输出', 'H.264 MP4（AAC 音轨）'], ['分辨率', '统一为第一个视频的尺寸，其余等比缩放居中'], ['数量', '2~8 个文件'], ['上限', '单文件 300MB、5 分钟；总时长 15 分钟、总体积 600MB'], ['编码管线', '共享 WebCodecs 编码器顺序编码 + ffmpeg.wasm 音轨拼接'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '分辨率不一致的片段会怎样？', answer: '以第一个视频的尺寸为输出画幅，其余画面等比缩放并居中，比例不同的部分填充黑边；画面不会被拉伸变形。' },
      { question: '有的片段没有声音怎么办？', answer: '无音轨的片段会自动补上等长静音，后续片段的声音仍然对齐；如果所有片段都没有音轨，输出就是无声视频。' },
      { question: '合并是无损的吗？', answer: '不是。所有画面统一重编码为 H.264，会有轻微的二次压缩；好处是输出只有一个统一规格的 MP4，兼容性最好。' },
    ],
    reference: [
      ['信箱模式（letterbox）', '把不同宽高比的画面放进统一画幅时，上下或左右留黑边的处理方式。'],
      ['时间戳连续性', '拼接的视频流要求帧时间戳严格递增；跨片段偏移拼接可避免播放器把片段识别成时间跳变。'],
    ],
  },
  en: {
    overview: [
      'Video merge joins multiple clips into one MP4 in the order you add them: all segments share a single WebCodecs encoder and timestamps stay continuous across segments, so there is no export-then-stitch two-step; audio is extracted per segment, aligned, and concatenated back as one track.',
      'The output resolution follows the first video; every other clip is scaled to fit and centered (letterboxed with black bars), so mixed portrait and landscape sources still produce a tidy result.',
      'Everything runs locally in your browser; the videos are never uploaded.',
    ],
    steps: [
      ['Add at least two videos', 'Common formats such as MP4, WebM and MOV, up to 8 files, each within 5 minutes and 300MB.'],
      ['Order the clips and pick quality', 'Use the up / down buttons to arrange segments; the high quality preset is the default.'],
      ['Merge and download', 'Segments are decoded and encoded into one uniform MP4; preview and download when done.'],
    ],
    scenarios: [
      ['Stitching segments', 'Combine several screen recordings or vlog parts into one complete video.'],
      ['Building a compilation', 'Merge related short clips into a single shareable file.'],
      ['Archiving at one resolution', 'Normalize mixed-resolution footage to the first clip\'s size for easier management.'],
    ],
    notes: [
      'The output size matches the first video: clips with different aspect ratios are scaled to fit and centered with black bars, never stretched.',
      'Each segment\'s audio is aligned to that segment\'s video duration; silent clips get matching silence so later segments stay in sync.',
      'The picture is re-encoded to H.264 with slight second-generation compression; more segments and longer totals mean more time and memory (15-minute total cap).',
    ],
    specs: [['Output', 'H.264 MP4 (AAC audio)'], ['Resolution', 'Unified to the first video\'s size; others scaled and centered'], ['Count', '2 to 8 files'], ['Limits', '300MB and 5 minutes per file; 15 minutes and 600MB in total'], ['Encoding pipeline', 'Shared WebCodecs encoder across segments + ffmpeg.wasm audio concat'], ['Privacy', 'Everything runs locally in the browser; the videos are never uploaded']],
    faq: [
      { question: 'What happens to clips with different resolutions?', answer: 'The first video defines the output frame; other clips are scaled to fit and centered, with black bars where the aspect ratio differs. Nothing is stretched.' },
      { question: 'What if one clip has no audio?', answer: 'Silent clips get matching silence of the same length, so later segments stay in sync; if every clip is silent the output is a silent video.' },
      { question: 'Is the merge lossless?', answer: 'No. All picture is re-encoded to H.264 with slight second-generation compression; in exchange you get a single uniform MP4 with the best compatibility.' },
    ],
    reference: [
      ['Letterboxing', 'Placing a picture with a different aspect ratio into a fixed frame, padding the top/bottom or sides with black.'],
      ['Timestamp continuity', 'A concatenated video stream requires strictly increasing frame timestamps; offsetting across segments avoids players reading segments as time jumps.'],
    ],
  },
});
