import { defineToolContent } from './define';

export const videoCropContent = defineToolContent({
  zh: {
    overview: [
      '视频画面截取在浏览器本地按空间区域重编码视频：在预览画面上拖出裁剪框，可以整体移动、用八个手柄缩放，或锁定 16:9、9:16、1:1、4:3、3:4 等常见比例，输出只包含框内画面。',
      '裁剪框外的像素不会进入输出文件，输出分辨率就是选区的像素尺寸。画面重编码为 H.264 MP4，音轨完整保留。',
      '视频不会上传到任何服务器，处理全程在你的设备上完成，适合处理未发布的素材。',
    ],
    steps: [
      ['上传视频', '支持 MP4、WebM、MOV 等常见格式，最长 5 分钟、最大 300MB。'],
      ['拖拽确定裁剪区域', '拖动选区框整体移动，拖动手柄缩放；选中比例预设后，缩放会自动锁定比例。'],
      ['生成并下载', '输出只保留框内画面，分辨率与选区像素尺寸一致，完成后预览、下载。'],
    ],
    scenarios: [
      ['竖屏化横版视频', '用 9:16 比例框住画面主体，把横版录屏或素材裁成短视频竖版画面。'],
      ['聚焦局部画面', '只保留演示里的某个窗口、表格或人物区域，观众注意力更集中。'],
      ['去掉边缘杂物', '裁掉画面边缘的台标、时间码、黑边或穿帮内容。'],
    ],
    notes: [
      '输出是重编码的裁剪结果而非无损切割：会有轻微的二次压缩，选区外内容被完全丢弃。',
      '输出分辨率等于选区的像素尺寸，并做偶数对齐（H.264 要求），因此可能与拖拽值相差 1~2 像素。',
      '音轨完整保留原样；个别格式音轨处理失败时会输出无声视频并标注。',
    ],
    specs: [['输出', 'H.264 MP4（AAC 音轨）'], ['选区', '自由拖拽 + 16:9 / 9:16 / 1:1 / 4:3 / 3:4 比例锁定'], ['输出尺寸', '选区像素尺寸，偶数对齐'], ['画质', '高 / 中 / 低三档，默认高档'], ['上限', '单文件 300MB、时长 5 分钟'], ['隐私', '全部处理在浏览器本地完成，视频不上传']],
    faq: [
      { question: '裁剪框外的画面去哪了？', answer: '被完全丢弃。输出文件只包含选区内的像素，选区外的内容不会以任何形式保留在输出里，输出分辨率就是选区的像素尺寸。' },
      { question: '为什么输出尺寸和拖拽的选区差一两个像素？', answer: 'H.264 编码要求宽高都是偶数，选区会做偶数对齐，所以可能有 1~2 像素的取整误差。' },
      { question: '声音会变吗？', answer: '不会。音轨按原样保留，画面裁剪不影响声音内容；个别格式音轨回填失败时会输出无声视频，结果信息里会标注。' },
    ],
    reference: [
      ['空间裁剪', '在画面坐标系内选取矩形区域，只保留区域内像素；与按时间截取的“片段剪辑”相对。'],
      ['偶数对齐', 'H.264 等编码器要求画面宽高为偶数，奇数尺寸需要取整到最近的偶数。'],
    ],
  },
  en: {
    overview: [
      'Video region cropping re-encodes your video locally in the browser: drag a crop box over the preview, move it as a whole or resize it with eight handles, lock it to common ratios like 16:9, 9:16, 1:1, 4:3 or 3:4, and the export contains only the picture inside the box.',
      'Pixels outside the crop box never enter the output file; the output resolution equals the pixel size of the selection. The picture is re-encoded to H.264 MP4 with the audio track kept intact.',
      'The video is never uploaded; everything runs on your device, which makes it suitable for unpublished material.',
    ],
    steps: [
      ['Upload a video', 'Common formats such as MP4, WebM and MOV, up to 5 minutes and 300MB.'],
      ['Drag out the crop region', 'Drag the box to move it, drag a handle to resize it; with a ratio preset selected, resizing snaps to that ratio.'],
      ['Render and download', 'The output keeps only the region inside the box at the selection’s pixel size; preview and download when done.'],
    ],
    scenarios: [
      ['Making vertical cuts', 'Frame the subject with a 9:16 box to turn landscape screen recordings or footage into short-video verticals.'],
      ['Focusing on a region', 'Keep only the window, table or speaker area of a demo so the audience sees what matters.'],
      ['Cleaning the edges', 'Trim away edge watermarks, timecodes, black bars or accidental intrusions.'],
    ],
    notes: [
      'The output is a re-encoded crop rather than a lossless cut: slight second-generation compression applies, and everything outside the selection is discarded.',
      'The output resolution equals the selection’s pixel size, aligned to even numbers (an H.264 requirement), so it may differ from the dragged value by 1–2 pixels.',
      'The audio track is kept as-is; if audio processing fails for some formats the export is silent and labeled as such.',
    ],
    specs: [['Output', 'H.264 MP4 (AAC audio)'], ['Selection', 'Free dragging + 16:9 / 9:16 / 1:1 / 4:3 / 3:4 ratio locks'], ['Output size', 'Selection pixel size, even-aligned'], ['Quality', 'High / medium / low presets, high by default'], ['Limits', '300MB and 5 minutes per file'], ['Privacy', 'Everything runs locally in the browser; the video is never uploaded']],
    faq: [
      { question: 'What happens to the picture outside the crop box?', answer: 'It is discarded completely. The output contains only the pixels inside the selection, and its resolution equals the selection’s pixel size — nothing outside is kept in any form.' },
      { question: 'Why is the output size off by a pixel or two?', answer: 'H.264 requires even width and height, so the selection is even-aligned, which can round the value by 1–2 pixels.' },
      { question: 'Does the audio change?', answer: 'No. The audio track is kept as-is; cropping only affects the picture. If muxing fails for some formats the export is silent, and the result panel labels it.' },
    ],
    reference: [
      ['Spatial cropping', 'Selecting a rectangle in picture coordinates and keeping only the pixels inside it, as opposed to time-based segment cutting.'],
      ['Even alignment', 'Encoders such as H.264 require even picture dimensions, so odd sizes are rounded to the nearest even number.'],
    ],
  },
});
