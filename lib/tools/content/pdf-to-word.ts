import { defineToolContent } from './define';

export const pdfToWordContent = defineToolContent({
  zh: {
    overview: ['PDF 保存页面最终布局，Word 文档则需要可编辑的段落、表格和样式结构。PDF 转 Word 必须从坐标和字体信息推断阅读顺序与文档结构，因此复杂分栏、公式、脚注、表格和扫描页很难完全还原。', '工具适合为后续编辑生成 DOCX 初稿。文本型 PDF 的效果通常优于只有图片的扫描件；扫描件应先进行 OCR，再人工恢复标题层级、列表、表格和分页。'],
    steps: [['检查 PDF 类型', '尝试选择文字，判断是文本型页面还是扫描图片。'], ['执行转换', '处理前记录页数和关键格式，等待 DOCX 生成。'], ['在 Word 中校对', '检查阅读顺序、字体替换、表格、页眉页脚和分页，再继续编辑。']],
    scenarios: [['复用报告内容', '把已有 PDF 转为可编辑初稿，用于更新段落或重新排版。'], ['提取合同模板结构', '在获得授权后恢复基本文字，再人工核对所有条款与编号。'], ["改一份只剩 PDF 的旧文档", "原始文件已经找不到时，转成 DOCX 至少能在此基础上编辑，而不是从头重排。"]],
    notes: ['转换结果不能保证像素级还原，PDF 和 Word 使用不同布局模型。', '扫描 PDF 没有可直接提取的文字，需要 OCR 且必须校对。', '受版权或权限限制的文件应先确认允许转换和编辑。'],
    specs: [["输出", "可编辑的 DOCX"], ["还原方式", "按页面上每个字的位置反推段落、字号和基础样式：PDF 本身不存储段落结构"], ["还原较好", "单栏正文、连续段落、纯文字页面"], ["需要人工校对", "多栏排版、复杂表格、文本框、图文混排、页眉页脚"], ["扫描件无效", "拍照或扫描生成的 PDF 没有文字层，取不到内容，需要先做图片 OCR 文字识别"], ["加密文档", "带打开密码的文件需要先用 PDF 加密 / 解密移除密码"]],
    faq: [{ question: "为什么表格和分栏乱了？", answer: "PDF 只记录每个字的位置，不记录「这是一个表格」或「这是两栏」。转换要靠位置反推结构，遇到复杂排版必然出错。这不是某个工具的缺陷，而是格式本身的限制。" }, { question: "为什么一个字都提取不出来？", answer: "这份 PDF 大概率是扫描件或拍照件，整页其实是一张图片，里面没有文字层。请先用图片 OCR 文字识别把文字提取出来，再自行排版。" }],
    reference: [['reading order', '辅助技术和文档转换用于确定文本先后顺序的结构。'], ['DOCX', '基于 Open XML 的 Word 文档容器，保存段落、样式和其它可编辑对象。']],
  },
  en: {
    overview: ['PDF stores final page layout, while Word needs editable paragraphs, tables, and style structure. PDF to Word must infer reading order and document structure from coordinates and font data, so columns, formulas, footnotes, tables, and scanned pages are difficult to reproduce exactly.', 'The tool is best for generating a DOCX editing draft. Text PDFs generally convert better than image-only scans; scans need OCR followed by manual restoration of heading hierarchy, lists, tables, and pagination.'],
    steps: [['Identify the PDF type', 'Try selecting text to distinguish a text page from a scanned image.'], ['Run conversion', 'Record page count and critical formatting, then wait for the DOCX.'], ['Proofread in Word', 'Check reading order, font substitution, tables, headers, footers, and page breaks before editing.']],
    scenarios: [['Reusing report content', 'Create an editable draft from an existing PDF for paragraph updates and relayout.'], ['Recovering an authorized template', 'Restore basic text, then manually verify every clause and number.'], ["Editing an old document that only exists as a PDF", "When the source file is long gone, DOCX at least gives you something to edit rather than retyping from scratch."]],
    notes: ['Pixel-identical conversion is not guaranteed because PDF and Word use different layout models.', 'A scanned PDF has no directly extractable text and needs OCR with proofreading.', 'Confirm that copyright and access permissions allow conversion and editing.'],
    specs: [["Output", "An editable DOCX"], ["How it reconstructs", "Paragraphs, sizes and basic styles are inferred from where each glyph sits; PDF does not store paragraph structure at all"], ["Reconstructs well", "Single-column body text, continuous paragraphs, text-only pages"], ["Needs a human pass", "Multi-column layouts, complex tables, text boxes, wrapped images, headers and footers"], ["Scans do not work", "A camera or scanner PDF has no text layer, so nothing can be extracted; run Image OCR first"], ["Encrypted files", "Remove an open password with PDF Encrypt / Decrypt before converting"]],
    faq: [{ question: "Why are the tables and columns a mess?", answer: "A PDF records where each glyph sits, not that something is a table or that the page has two columns. Conversion has to infer structure from position, and complex layouts inevitably break. That is a limit of the format, not a defect in one tool." }, { question: "Why did no text come out at all?", answer: "That PDF is almost certainly a scan or a photo; the page is one image with no text layer. Run Image OCR to extract the text, then lay it out yourself." }],
    reference: [['reading order', 'Structure used by assistive technology and conversion to determine text sequence.'], ['DOCX', 'An Open XML Word container storing paragraphs, styles, and other editable objects.']],
  },
});
