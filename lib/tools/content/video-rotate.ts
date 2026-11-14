import { defineToolContent } from './define';

export const videoRotateContent = defineToolContent({
  zh: {
    overview: [
      '视频旋转 / 翻转在浏览器本地调整视频画面方向：按 90° 步进旋转，或做水平、垂直镜像，重编码为 H.264 MP4 并保留原音轨。',
      '它解决的是方向问题：手机横持竖拍、倒置拍摄、需要镜像效果的素材，导出后方向就固定在画面里，任何播放器都会按正确方向显示。',
      '视频不会上传到任何服务器，处理全程在你的设备上完成。',
    ],
    steps: [
      ['上传视频', '支持 MP4、WebM、MOV 等常见格式，最长 5 分钟、最大 300MB。'],
      ['旋转或翻转', '用左转 / 右转按钮按 90° 步进调整，或勾选水平 / 垂直翻转；预览实时反映效果。'],
      ['导出并下载', '重编码完成后预览、下载，方向已固化进画面。'],
    ],
    scenarios: [
      ['修正竖拍视频', '手机竖持拍摄的画面在电脑上横躺，旋转 90° 即可恢复正确方向。'],
      ['镜像素材', '自拍、舞蹈练习等场景需要水平镜像时一键翻转。'],
      ['倒放素材预处理', '倒置拍摄的画面先旋转 180° 修正，再交给其他工具继续处理。'],
    ],
    notes: [
      '旋转 90° / 270° 时输出宽高互换：横屏视频转成竖屏画幅，播放器会按竖屏尺寸显示。',
      '输出画面重编码为 H.264，会有轻微的二次压缩；方向直接烧进像素，而不是写入旋转元数据，因此任何播放器都能正确显示。',
      '音轨保持原样回填，旋转不影响声音；个别格式音轨回填失败时会输出无声视频并标注。',
    ],
    specs: [['输出', 'H.264 MP4（AAC 音轨）'], ['旋转', '0° / 90° / 180° / 270°，90° 步进'], ['翻转', '水平、垂直，可与旋转叠加'], ['画质', '高 / 中 / 低三档，默认高档'], ['上限', '单文件 300MB、时长 5 分钟'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '为什么选择烧进画面而不是写旋转元数据？', answer: '旋转元数据只有部分播放器会读取，老设备和剪辑软件经常忽略它。把方向直接画进每一帧，输出在任何地方显示都一致。' },
      { question: '旋转后文件尺寸会变吗？', answer: '旋转 90° / 270° 时画幅宽高互换（横 1920×1080 变竖 1080×1920），0° / 180° 尺寸不变。' },
      { question: '能同时旋转和翻转吗？', answer: '可以。旋转与水平 / 垂直翻转可任意叠加，预览窗口会实时显示叠加后的效果。' },
    ],
    reference: [
      ['旋转元数据（display matrix）', 'MP4 容器里声明画面应旋转多少度的字段；播放器自行决定是否应用，兼容性参差。'],
      ['烧录（burn-in）', '把效果直接渲染进每一帧像素，输出不再依赖播放器行为。'],
    ],
  },
  en: {
    overview: [
      'Video rotate & flip changes picture orientation locally in your browser: rotate in 90° steps or mirror horizontally / vertically, re-encoded to an H.264 MP4 with the original audio kept.',
      'It fixes orientation problems: sideways phone footage, upside-down takes, or clips that need a mirror effect come out with the orientation baked into the picture, so every player shows them correctly.',
      'The video is never uploaded; everything runs on your device.',
    ],
    steps: [
      ['Upload a video', 'Common formats such as MP4, WebM and MOV, up to 5 minutes and 300MB.'],
      ['Rotate or flip', 'Use the left / right buttons for 90° steps, or check horizontal / vertical flip; the preview updates live.'],
      ['Export and download', 'Preview and download the re-encoded file with the orientation fixed.'],
    ],
    scenarios: [
      ['Fixing sideways footage', 'Vertical phone recordings lie on their side on desktop; a 90° rotation restores the right orientation.'],
      ['Mirroring clips', 'Selfies and dance practice videos often need a horizontal mirror; flip in one click.'],
      ['Pre-processing upside-down takes', 'Rotate 180° to correct inverted footage before handing it to other tools.'],
    ],
    notes: [
      'Rotating 90° / 270° swaps width and height: a landscape video becomes a portrait frame, and players show it at the portrait size.',
      'The picture is re-encoded to H.264 with slight second-generation compression; the orientation is burned into the pixels rather than stored as rotation metadata, so every player displays it the same way.',
      'Audio is passed through untouched; if muxing fails for some formats the export is silent and labeled as such.',
    ],
    specs: [['Output', 'H.264 MP4 (AAC audio)'], ['Rotation', '0° / 90° / 180° / 270°, in 90° steps'], ['Flip', 'Horizontal and vertical, combinable with rotation'], ['Quality', 'High / medium / low presets, high by default'], ['Limits', '300MB and 5 minutes per file'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded']],
    faq: [
      { question: 'Why burn the orientation instead of writing rotation metadata?', answer: 'Only some players honor rotation metadata; older devices and editors often ignore it. Drawing the orientation into every frame makes the output display consistently everywhere.' },
      { question: 'Does the file size change after rotating?', answer: 'Rotating 90° / 270° swaps the frame dimensions (1920×1080 landscape becomes 1080×1920 portrait); 0° / 180° keeps the size unchanged.' },
      { question: 'Can I rotate and flip at the same time?', answer: 'Yes. Rotation and horizontal / vertical flips can be combined freely, and the preview shows the combined effect live.' },
    ],
    reference: [
      ['Display matrix', 'A field in the MP4 container declaring how far the picture should be rotated; players decide whether to apply it, with mixed compatibility.'],
      ['Burn-in', 'Rendering an effect directly into every frame\'s pixels so the output no longer depends on player behavior.'],
    ],
  },
});
