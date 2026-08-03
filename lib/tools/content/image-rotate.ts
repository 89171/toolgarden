import { defineToolContent } from './define';

export const imageRotateContent = defineToolContent({
  zh: {
    overview: [
      '图片旋转和翻转会重新排列像素方向。90 度和 270 度旋转会交换宽高，水平翻转产生镜像效果，垂直翻转则上下颠倒；这些操作适合纠正拍摄方向、扫描页和素材朝向。',
      '工具依据画面本身生成新文件，而不是只修改 EXIF 方向标记，因此导出结果在忽略元数据的应用中也应保持正确方向。JPG 输出会重新压缩，PNG 则更适合需要透明度或锐利线条的图片。',
    ],
    steps: [
      ['上传并观察方向', '以文字、人物和重力方向为参照，判断需要的旋转角度。'],
      ['应用旋转或翻转', '使用 90 度步进纠正方向，只有需要镜像时才启用水平或垂直翻转。'],
      ['检查后下载', '确认宽高、文字方向和边缘完整，保存为匹配原用途的格式。'],
    ],
    scenarios: [
      ['纠正手机照片', '把依赖方向元数据显示的照片转成像素方向正确的文件。'],
      ['整理扫描页面', '统一横向或倒置页面的阅读方向，再进入 OCR 或 PDF 合并流程。'],
      ["修正手机竖拍变横躺的照片", "在某些软件里显示正常、换个地方就躺倒的照片，旋转后导出即可彻底固定方向。"],
    ],
    notes: [
      '镜像会让文字反向，也会改变人物左右关系，不应与普通旋转混淆。',
      '非直角旋转通常需要扩展画布或裁边，本工具的预设操作应按界面实际可用角度选择。',
      '重要照片应保留原件，避免多次 JPG 重新编码造成质量下降。',
    ],
    specs: [["可用操作", "旋转 90°、180°、270°，以及水平翻转和垂直翻转"], ["是否有损", "90 度倍数的旋转和翻转是像素重排，不损失画质；但输出为 JPG 时会有一次重编码"], ["为什么图片方向会错", "手机拍摄时方向记录在 EXIF 里，部分软件不读这个字段，于是显示成横躺的"], ["彻底修正方向", "旋转后导出的新文件方向被写死在像素里，不再依赖 EXIF 字段"], ["不支持", "任意角度旋转（如 15°），那需要插值重采样并裁切边角"], ["常见搭配", "作为 OCR 前的预处理，先摆正再识别，准确率明显提升"]],
    faq: [{ question: "为什么同一张照片在不同软件里方向不一样？", answer: "手机把方向记录在 EXIF 的 Orientation 字段里，像素本身没有旋转。读这个字段的软件显示正常，不读的就显示成原始方向。这里旋转后导出，方向被写进像素，不再依赖那个字段。" }, { question: "旋转会损失画质吗？", answer: "90 度倍数的旋转和翻转只是像素重排，不损失任何信息。唯一的损失来自输出为 JPG 时的重新编码，从 PNG 到 PNG 则完全无损。" }],
    reference: [
      ['pixel orientation', '像素在文件画布中的实际排列方向，不依赖查看器读取元数据。'],
      ['mirror flip', '围绕水平轴或垂直轴反射图像，结果与旋转不同。'],
    ],
  },
  en: {
    overview: [
      'Rotation and flipping rearrange pixel orientation. A 90- or 270-degree turn swaps width and height, horizontal flip creates a mirror image, and vertical flip reverses top and bottom. These operations correct camera orientation, scanned pages, and asset direction.',
      'The tool renders a new file from the actual pixels rather than only changing an EXIF orientation tag, so the export should remain correct in applications that ignore metadata. JPG output is recompressed, while PNG is preferable for transparency or sharp line work.',
    ],
    steps: [
      ['Upload and assess direction', 'Use text, people, and gravity as references to determine the required turn.'],
      ['Apply rotation or flip', 'Use 90-degree increments for orientation and enable a horizontal or vertical flip only when a mirror is intended.'],
      ['Inspect and download', 'Confirm dimensions, text direction, and complete edges, then save in a format suited to the source use.'],
    ],
    scenarios: [
      ['Correcting a phone photo', 'Turn a metadata-dependent photo into a file whose pixel orientation is correct.'],
      ['Organizing scanned pages', 'Normalize sideways or upside-down pages before OCR or PDF assembly.'],
      ["Fixing a portrait phone photo that displays sideways", "A photo that looks right in one application and lies on its side in another is fixed permanently by rotating and exporting."],
    ],
    notes: [
      'Mirroring reverses text and left-right relationships and must not be confused with ordinary rotation.',
      'A non-right-angle rotation needs expanded canvas or cropping; choose from the angles actually provided by the interface.',
      'Keep the original of an important photo and avoid quality loss from repeated JPG encoding.',
    ],
    specs: [["Available operations", "Rotate 90°, 180°, 270°, plus horizontal and vertical flip"], ["Lossy?", "Rotations by multiples of 90° and flips only rearrange pixels and lose nothing; though JPG output adds one re-encode"], ["Why orientation goes wrong", "Phones record orientation in an EXIF field, and software that ignores that field shows the photo lying on its side"], ["Fixing it permanently", "The exported file has its orientation baked into the pixels and no longer depends on the EXIF field"], ["Not supported", "Arbitrary angles such as 15°, which would require resampling and cropping the corners"], ["Pairs well with", "Straightening before OCR; running recognition on a level image is markedly more accurate"]],
    faq: [{ question: "Why does the same photo face different ways in different apps?", answer: "Phones record orientation in the EXIF Orientation field without rotating the pixels. Software that reads the field shows it correctly; software that ignores it shows the raw orientation. Rotating and exporting here bakes the orientation into the pixels so the field no longer matters." }, { question: "Does rotating lose quality?", answer: "Rotations by multiples of 90° and flips only rearrange pixels and lose nothing. The only loss comes from re-encoding on JPG output; PNG to PNG is entirely lossless." }],
    reference: [
      ['pixel orientation', 'The real arrangement of pixels on the file canvas, independent of metadata support in the viewer.'],
      ['mirror flip', 'Reflecting the image across a horizontal or vertical axis, which differs from rotation.'],
    ],
  },
});
