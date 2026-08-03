import { defineToolContent } from './define';

export const imageOcrContent = defineToolContent({
  zh: {
    overview: [
      'OCR 通过分析图片中的字形把像素转换为可复制文本，支持英文、简体中文、繁体中文和日文识别。工具在浏览器中加载所选语言模型并处理图片，适合从截图、扫描件和照片中提取初稿。',
      '识别准确率受清晰度、字体、方向、语言、排版和背景干扰影响。表格、手写体、竖排文字、艺术字体和低对比照片容易丢失结构或混淆字符，因此 OCR 输出必须与原图校对，不能直接作为金额、合同条款或身份信息的唯一依据。',
    ],
    steps: [
      ['准备清晰图片', '裁掉无关区域，纠正方向，并尽量提高文字与背景的对比度。'],
      ['选择主要语言', '选择与大多数文字匹配的模型，再开始识别并等待进度完成。'],
      ['逐段校对文本', '对照原图检查数字、标点、专有名词和换行，修正后再用于后续流程。'],
    ],
    scenarios: [
      ['提取截图文字', '从无法选择文本的界面、报错截图或图片说明中复制内容。'],
      ['录入扫描资料', '把印刷文档转换为可搜索初稿，再由人工恢复段落和表格结构。'],
      ["从截图里取回可编辑的文字", "只有截图没有原文时，识别出文字再校对，比照着屏幕重新敲一遍快得多。"],
    ],
    notes: [
      '首次选择某种语言可能需要下载模型，耗时取决于网络和设备性能。',
      'OCR 结果可能把 `0` 与 `O`、`1` 与 `l` 等相似字符混淆，关键编号必须逐字核验。',
      '对含个人信息或保密材料的图片，仍应遵守组织的数据处理和保存要求。',
    ],
    specs: [["识别引擎", "开源 OCR 引擎，首次使用需下载数十 MB 识别数据，之后会被浏览器缓存"], ["识别较好", "扫描件、截图、印刷体、对比度高且水平摆正的文字"], ["识别较差", "手写体、艺术字、倾斜或弯曲的文字、低分辨率照片、复杂背景上的文字"], ["排版还原", "输出的是文本，多栏、表格和图文混排的原始版式不会保留"], ["提高准确率", "先用图片旋转摆正、用裁剪去掉无关区域、必要时放大分辨率，比直接识别效果好得多"], ["处理位置", "识别数据从网络下载，图片本身在浏览器内处理，不上传"]],
    faq: [{ question: "识别率低怎么改善？", answer: "按顺序试这几步：先用图片旋转把文字摆正，再裁掉无关区域只留文字部分，分辨率过低时先放大。这三步对准确率的提升通常比换工具更明显。" }, { question: "手写体能识别吗？", answer: "效果很差。引擎主要针对印刷体训练，手写体的字形变化远超它的处理范围。工整的手写可能勉强识别出部分内容，潦草的基本无法使用。" }],
    reference: [
      ['OCR', 'Optical Character Recognition，依据图片字形推断文本字符的技术。'],
      ['language model', '针对特定文字系统提供字符和词形信息的识别资源。'],
    ],
  },
  en: {
    overview: [
      'OCR analyzes letter shapes in an image and converts pixels into selectable text. The tool supports English, Simplified Chinese, Traditional Chinese, and Japanese, loading the selected language model and processing in the browser for screenshots, scans, and photographs.',
      'Accuracy depends on sharpness, font, orientation, language, layout, and background interference. Tables, handwriting, vertical text, decorative type, and low-contrast photos commonly lose structure or confuse characters, so output must be checked against the image and must not be the sole source for amounts, contracts, or identity data.',
    ],
    steps: [
      ['Prepare a clear image', 'Crop unrelated regions, correct orientation, and improve contrast between text and background where possible.'],
      ['Select the main language', 'Choose the model matching most of the text, start recognition, and wait for processing to finish.'],
      ['Proofread every section', 'Compare digits, punctuation, proper names, and line breaks against the source before further use.'],
    ],
    scenarios: [
      ['Extracting screenshot text', 'Copy content from an interface, error image, or caption where text selection is unavailable.'],
      ['Transcribing scanned material', 'Create a searchable draft from printed pages, then restore paragraphs and table structure manually.'],
      ["Getting editable text back out of a screenshot", "When only the screenshot survives, recognising and proofreading is far quicker than retyping from the screen."],
    ],
    notes: [
      'Selecting a language for the first time may download a model, with time depending on the network and device.',
      'OCR can confuse similar glyphs such as `0` and `O` or `1` and `l`; verify critical identifiers character by character.',
      'Images containing personal or confidential information remain subject to organizational handling and retention rules.',
    ],
    specs: [["Recognition engine", "An open-source OCR engine; the first run downloads tens of megabytes of recognition data, cached thereafter"], ["Recognises well", "Scans, screenshots, printed type, and text that is high-contrast and level"], ["Recognises poorly", "Handwriting, decorative type, skewed or curved text, low-resolution photos, and text over busy backgrounds"], ["Layout", "The output is text; multi-column layouts, tables and wrapped images do not survive"], ["Improving accuracy", "Straighten with Image Rotate, crop away irrelevant areas, and upscale if needed; this beats running OCR on the raw photo"], ["Where it runs", "Recognition data is downloaded, but the image itself is processed in the browser and never uploaded"]],
    faq: [{ question: "How do I improve poor recognition?", answer: "Try these in order: straighten the text with Image Rotate, crop away everything that is not text, and upscale if the resolution is low. Those three usually help more than switching tools." }, { question: "Does it read handwriting?", answer: "Poorly. The engine is trained mainly on printed type, and handwriting varies far beyond what it handles. Neat handwriting may yield fragments; anything hurried will not be usable." }],
    reference: [
      ['OCR', 'Optical Character Recognition, the process of inferring text characters from shapes in an image.'],
      ['language model', 'Recognition data describing characters and word forms for a particular writing system.'],
    ],
  },
});
