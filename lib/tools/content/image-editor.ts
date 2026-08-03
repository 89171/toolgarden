import { defineToolContent } from './define';

export const imageEditorContent = defineToolContent({
  zh: {
    overview: [
      '在线图片编辑器把裁剪、旋转、翻转、尺寸调整和常用画面参数集中到一次编辑流程中，适合在不启动桌面软件时完成轻量处理。所有修改基于上传的当前图像生成新文件，原始文件不会被直接覆盖。',
      '编辑顺序会影响结果。建议先确定构图和方向，再调整输出尺寸及画面效果，最后选择格式与质量；过早缩小图片会减少后续操作可用的像素，反复有损导出也会累积压缩痕迹。',
    ],
    steps: [
      ['上传原始图片', '优先使用尺寸最大、压缩次数最少的来源文件，并确认方向显示正确。'],
      ['完成结构调整', '先裁剪、旋转或翻转，再设置目标尺寸和必要的画面参数。'],
      ['检查并导出', '在常用缩放比例下检查主体、边缘与颜色，选择匹配用途的格式和质量。'],
    ],
    scenarios: [
      ['准备网页配图', '把素材裁成固定比例并缩小到实际展示尺寸，减少不必要的传输体积。'],
      ['快速修正照片', '纠正方向、构图和轻微画面问题，输出一份可分享的副本。'],
      ["在分享截图前遮盖敏感信息", "工单截图里的手机号、订单号和内部地址，用马赛克或不透明色块盖掉再发出去。"],
    ],
    notes: [
      '浏览器预览可能受显示器色彩配置影响，严格印刷流程应使用支持色彩管理的专业软件。',
      '每次 JPG 导出都会重新进行有损压缩，应保留原图并避免多轮保存。',
      '包含透明区域时选择 PNG 或 WebP，否则透明像素可能被不透明背景替代。',
    ],
    specs: [["可用工具", "形状、折线、画笔、记号笔、文字、马赛克、模糊、橡皮擦"], ["主要用途", "截图标注，以及在分享前遮盖敏感信息"], ["马赛克与模糊", "会真正改写像素，不是覆盖一层：导出后原始内容无法从图片中恢复"], ["需要注意的遮盖方式", "用不透明色块或马赛克遮盖；用半透明形状或低强度模糊仍可能被还原推测"], ["输出", "合成后的图片，标注被烧录进像素，不保留可编辑图层"], ["处理位置", "全部在浏览器内完成，图片不上传"]],
    faq: [{ question: "马赛克盖过的内容能被还原吗？", answer: "工具的马赛克会真正改写像素，导出后原始内容不在文件里，无法还原。但要注意：低强度的模糊或半透明色块留下的信息量仍可能被推测，遮盖敏感信息请用马赛克或不透明填充。" }, { question: "导出后还能修改标注吗？", answer: "不能。导出的是合成后的图片，标注被烧录进像素，不保留可编辑图层。需要反复调整请保留原图，每次从原图重新标注。" }],
    reference: [
      ['non-destructive workflow', '保留原始素材并把编辑结果另存为新文件，便于回退和重新输出。'],
      ['aspect ratio', '宽度与高度的比例，用于保持构图或适配固定展示容器。'],
    ],
  },
  en: {
    overview: [
      'The online image editor combines cropping, rotation, flipping, resizing, and common visual adjustments in one lightweight workflow. Edits produce a new file from the uploaded image and do not overwrite the original source.',
      'Operation order affects quality. Establish composition and orientation first, then set output dimensions and visual adjustments, and choose format and quality last. Shrinking too early removes pixels needed for later work, while repeated lossy exports accumulate compression artifacts.',
    ],
    steps: [
      ['Upload the best source', 'Prefer the largest, least-compressed file available and confirm that its orientation displays correctly.'],
      ['Make structural edits', 'Crop, rotate, or flip before setting the target dimensions and necessary visual adjustments.'],
      ['Inspect and export', 'Check subject, edges, and color at normal viewing sizes, then choose the format and quality for the destination.'],
    ],
    scenarios: [
      ['Preparing a web image', 'Crop to a fixed ratio and reduce to the real display dimensions to avoid unnecessary transfer size.'],
      ['Making a quick photo correction', 'Fix orientation, composition, and minor visual issues, then export a separate shareable copy.'],
      ["Redacting a screenshot before you share it", "Phone numbers, order IDs and internal hostnames in a support screenshot get covered with mosaic or an opaque block first."],
    ],
    notes: [
      'Browser preview can be affected by display color configuration. Use color-managed professional software for strict print workflows.',
      'Every JPG export applies lossy compression again, so retain the source and avoid repeated save cycles.',
      'Choose PNG or WebP for transparent regions, otherwise transparent pixels can be replaced by an opaque background.',
    ],
    specs: [["Available tools", "Shapes, polylines, freehand brush, marker, text, mosaic, blur and eraser"], ["Main uses", "Annotating screenshots, and covering sensitive information before sharing"], ["Mosaic and blur", "Genuinely rewrite the pixels rather than covering them; the original content cannot be recovered from the exported file"], ["How to redact safely", "Use an opaque fill or mosaic. A semi-transparent shape or a light blur can still be reversed or guessed at"], ["Output", "A flattened image with the annotations burned into the pixels; no editable layers are kept"], ["Where it runs", "Entirely in the browser; the image is never uploaded"]],
    faq: [{ question: "Can mosaicked content be recovered?", answer: "The mosaic genuinely rewrites the pixels, so the original is not in the exported file and cannot be recovered. But note that a light blur or a semi-transparent block still leaks enough to guess at; use mosaic or an opaque fill for anything sensitive." }, { question: "Can I edit the annotations after exporting?", answer: "No. The export is a flattened image with the annotations burned into the pixels and no editable layers. Keep the original and re-annotate from it when you need changes." }],
    reference: [
      ['non-destructive workflow', 'Keeping the source intact and saving edits to a new file so the work can be revised or re-exported.'],
      ['aspect ratio', 'The relationship between width and height, used to preserve composition or fit a fixed container.'],
    ],
  },
});
