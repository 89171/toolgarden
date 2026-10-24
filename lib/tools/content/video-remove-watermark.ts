import { defineToolContent } from './define';

export const videoRemoveWatermarkContent = defineToolContent({
  zh: {
    overview: [
      '视频去水印针对画面中位置固定的水印（角标、logo、平台标识）工作。工具先在时间轴上采样水印选区内的像素：如果背景在动，就用时域中值直接重建干净的背景，无闪烁也不需要 AI 模型；如果背景静止，就用 MI-GAN 模型对代表帧做一次 AI 补全，再把修复后的补丁贴回整段视频。大水印或压在人脸、建筑边缘的水印可以切换 LaMa 高清档，结构重建效果更好，但模型更大、速度更慢。',
      '处理全程在浏览器本地完成，视频不会上传到任何服务器。输出为 H.264 MP4，并尝试用本地 ffmpeg 回填原视频音轨；个别浏览器不支持 WebCodecs 编码时将无法处理。',
      '此工具只应处理你拥有版权、获得明确授权，或法律允许修改的视频；移除归属标识不等于获得传播或商业使用权。',
    ],
    steps: [
      ['确认使用权限', '仅上传你有权编辑的视频，并保留必要的作者署名和许可记录。'],
      ['框选水印区域', '在预览画面上拖拽框选完整水印及边缘，选区越小、越贴合水印，重建效果越稳。'],
      ['选择处理方式并生成', '默认自动判定：背景会动走时域重建，背景静止走 AI 补全；也可手动指定。'],
    ],
    scenarios: [
      ['清理自有素材', '从自己导出的视频里去掉不再使用的旧 logo、内部标记或测试水印。'],
      ['修复授权视频', '在得到权利方许可后，清除覆盖在简单背景上的指定标识再发布。'],
      ['统一素材版式', '批量素材来自不同来源时，先去掉原有角标再统一加水印。'],
    ],
    notes: [
      '本工具只处理位置固定的水印；位置随时间移动或形状变化的水印无法用单一选区覆盖。',
      '水印压在人脸、文字或持续变化的复杂纹理上时，补全是模型的推测，结果可能与真实内容不符。',
      '导出采用 H.264 重编码，画面会有轻微的二次压缩；对画质要求极高的场景请使用原始工程文件处理。',
    ],
    specs: [['处理方式', '时域中值重建（背景运动时）、MI-GAN 单帧 AI 补全（默认）或 LaMa 高清补全（选装 HQ）'], ['输出', 'H.264 MP4，尽力回填原音轨（AAC）'], ['适用', '位置固定的静态水印：角标、logo、平台标识'], ['不适用', '移动水印、滚动字幕、覆盖主体的半透明大水印'], ['隐私', '全部处理在浏览器本地完成，视频不上传'], ['版权提示', '移除水印不改变视频的版权归属，使用前请确认自己有相应权利']],
    faq: [
      { question: '为什么自动模式有时不用 AI？', answer: '工具会先采样水印选区内的像素随时间的变化。背景在动时，同一像素位置在不同时刻会露出水印背后的内容，取时域中值就能直接还原干净背景，比 AI 逐帧补全更快也更稳定；只有背景静止、中值仍是水印本身时才需要 AI 补全。' },
      { question: '处理会花多长时间？', answer: '时域重建模式下约等于视频播放时长的量级；AI 模式额外需要一次模型加载和单帧推理。视频越长、分辨率越高，编码耗时越久，建议先处理 1 分钟以内的片段验证效果。' },
      { question: '输出的视频还有声音吗？', answer: '正常情况下会保留：视频画面重编码后，再用本地 ffmpeg 把原音轨回填进 MP4。个别容器或音频格式回填失败时会导出无声视频，结果信息里会标注是否保留音轨。' },
      { question: '可以用它去掉别人视频上的水印吗？', answer: '技术上可以，但移除水印不改变视频的版权归属。使用他人作品前请确认自己有相应授权：工具能做到不等于使用上被允许。' },
    ],
    reference: [
      ['时域中值', '对同一像素在多个时间点取中值；背景运动时能还原被静态水印遮挡的干净背景。'],
      ['视频修复（video inpainting）', '利用相邻帧信息重建视频缺失或被遮挡区域的过程，ProPainter 等模型属于此类。'],
    ],
  },
  en: {
    overview: [
      'The video watermark remover targets watermarks that stay in a fixed position (corner marks, logos, platform badges). The tool first samples pixels inside the selection across time: when the background moves, a temporal median rebuilds the clean background directly — no flicker and no AI model needed; when the background is static, the MI-GAN model inpaints one representative frame and the repaired patch is applied to the whole clip. For large watermarks or marks over faces and building edges, the optional LaMa HQ mode gives better structural reconstruction at the cost of a bigger download and slower inference.',
      'Everything runs locally in your browser; the video is never uploaded. Output is an H.264 MP4, and the original audio track is added back with a local ffmpeg pass. Browsers without WebCodecs encoding cannot process video.',
      'Use this tool only on videos you own, are explicitly authorized to edit, or are legally permitted to modify. Removing an attribution mark does not grant distribution or commercial rights.',
    ],
    steps: [
      ['Confirm editing rights', 'Upload only a video you may modify and retain any required attribution and license records.'],
      ['Select the watermark area', 'Drag a box over the complete mark and its edge; a tight selection gives steadier results.'],
      ['Choose a method and render', 'Auto decides for you: temporal reconstruction on moving backgrounds, AI inpainting on static ones.'],
    ],
    scenarios: [
      ['Cleaning an owned asset', 'Remove an outdated logo, internal mark, or test watermark from your own exports.'],
      ['Repairing an authorized clip', 'With permission from the rights holder, clear a specified mark over a simple background before publishing.'],
      ['Unifying branding', 'Material from different sources gets its old badges removed before a shared watermark is applied.'],
    ],
    notes: [
      'Only fixed-position watermarks are supported; watermarks that move or change shape cannot be covered by a single selection.',
      'Marks over faces, text, or continuously changing texture are rebuilt by estimation and may not match the real content.',
      'Export re-encodes to H.264, adding slight second-generation compression; use original project files when maximum fidelity matters.',
    ],
    specs: [['How it works', 'Temporal median rebuild on moving backgrounds, single-frame MI-GAN inpainting by default, or opt-in LaMa HQ inpainting'], ['Output', 'H.264 MP4, with the original audio track re-added as AAC when possible'], ['Works well on', 'Fixed static watermarks: corner badges, logos, platform marks'], ['Works poorly on', 'Moving watermarks, rolling credits, large translucent overlays on subjects'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded'], ['Rights reminder', 'Removing a watermark does not change who owns the video; confirm you have the right to use it']],
    faq: [
      { question: 'Why does Auto sometimes skip the AI model?', answer: 'The tool samples how pixels inside the selection change over time. When the background moves, the same pixel shows what is behind the watermark at different moments, so a temporal median restores the clean background directly — faster and steadier than per-frame AI. AI is only needed when the background is static and the median is still the watermark itself.' },
      { question: 'How long does processing take?', answer: 'Temporal mode takes roughly the playback duration of the clip; AI mode adds one model load and a single-frame inference. Longer and higher-resolution videos take longer to encode, so validate on a clip under one minute first.' },
      { question: 'Does the output keep sound?', answer: 'Normally yes: after the picture is re-encoded, a local ffmpeg pass adds the original audio track back into the MP4. If the container or audio codec cannot be muxed, a silent video is exported and the result details show whether audio was kept.' },
      { question: 'Can I remove someone else\'s watermark?', answer: 'Technically yes, but removing a watermark does not change who owns the video. Confirm you have the rights before using someone else\'s work; what a tool can do is not the same as what you are permitted to do.' },
    ],
    reference: [
      ['Temporal median', 'A per-pixel median across sampled times; on moving backgrounds it recovers what a static watermark hid.'],
      ['Video inpainting', 'Reconstructing missing or occluded regions from neighbouring frames; ProPainter and similar models do this.'],
    ],
  },
});
