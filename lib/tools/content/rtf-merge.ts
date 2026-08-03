import { defineToolContent } from './define';

export const rtfMergeContent = defineToolContent({
  zh: {
    overview: ['RTF 合并把多个富文本文件组合为一个 RTF，保留比 TXT 更丰富的字体、段落和基础格式。RTF 由控制字、字体表、颜色表和正文组成，直接拼接文件字节会破坏结构，因此需要解析并重新生成。', '不同来源的字体编号、颜色和样式可能冲突，复杂图片、对象、脚注与特定编辑器扩展也可能降级。合并结果应在目标文字处理软件中检查，而不能只依赖浏览器预览。'],
    steps: [['分别打开来源', '确认文字、字体和段落在目标软件中正常。'], ['按顺序加入文件', '尽量统一字体和页面设置，再排列章节。'], ['生成并复核', '检查中文、列表、图片、分页和文件交界处。']],
    scenarios: [['组合旧系统导出', '把多个只支持 RTF 的业务系统报告连接为一份文档。'], ['汇总富文本笔记', '保留基础粗体、列表和段落格式合并小型文档。'], ["整合旧系统导出的富文本", "把从数据库富文本字段或旧编辑器批量导出的 RTF 片段合并成一份，便于统一阅读和归档。"]],
    notes: ['RTF 在不同应用中的实现存在差异，复杂布局不保证一致。', '嵌入对象和编辑器私有控制字可能无法保留。', '来源包含不可信 RTF 时，应在受保护环境中打开并进行安全扫描。'],
    specs: [["输入 / 输出", "多个 RTF 富文本文件，输出单个 RTF"], ["拼接方式", "按列表顺序合并文档流，各段的字体和段落格式随内容一起带入"], ["会保留", "字体、字号、加粗斜体、颜色、段落对齐等基础富文本格式"], ["可能丢失", "嵌入对象、复杂表格嵌套、旧编辑器的私有控制字"], ["典型来源", "从早期文字处理软件、邮件客户端或数据库富文本字段导出的内容"], ["更现代的选择", "如果各源文件本来就是 DOCX，用 Word 合并保真度更高"]],
    faq: [{ question: "为什么有些格式没保留？", answer: "RTF 有大量厂商私有的控制字，不同软件写出的文件差异很大。基础格式（字体、字号、加粗、颜色、对齐）可靠，嵌入对象和复杂表格嵌套则不一定。" }, { question: "应该用 RTF 还是转成 DOCX？", answer: "如果源文件本来就是 DOCX，用 Word 合并保真度更高。只有当来源确实是 RTF（旧系统导出、邮件客户端富文本）时才用这里。" }],
    reference: [['control word', '以反斜杠开头并控制 RTF 格式或结构的指令。'], ['font table', 'RTF 文档中把字体编号映射到字体名称的表。']],
  },
  en: {
    overview: ['RTF merge combines rich-text files while retaining more font, paragraph, and basic formatting than TXT. RTF consists of control words, font and color tables, and content, so raw byte concatenation would break the structure and requires parsing and regeneration.', 'Font numbers, colors, and styles can conflict across sources, while complex images, objects, footnotes, and editor extensions may degrade. Inspect the output in the destination word processor rather than relying only on browser preview.'],
    steps: [['Open every source', 'Confirm text, fonts, and paragraphs display correctly in the destination software.'], ['Add files in order', 'Standardize fonts and page settings where possible, then arrange chapters.'], ['Generate and review', 'Check non-ASCII text, lists, images, pagination, and file boundaries.']],
    scenarios: [['Combining legacy-system exports', 'Join reports from business systems that provide only RTF.'], ['Compiling rich-text notes', 'Merge small documents while preserving basic bold, list, and paragraph formatting.'], ["Consolidating rich text from a legacy system", "Merge RTF fragments exported from a database column or an older editor into one readable, archivable document."]],
    notes: ['RTF implementations vary across applications, so complex layout is not guaranteed to match.', 'Embedded objects and editor-specific control words may not be retained.', 'Open untrusted RTF only in a protected environment and follow normal file scanning.'],
    specs: [["Input / output", "Several RTF files in, one RTF out"], ["How it joins", "Document streams concatenated in list order, with each section's fonts and paragraph formatting carried along"], ["Preserved", "Fonts, sizes, bold and italic, colour, paragraph alignment and other basic rich-text formatting"], ["May be lost", "Embedded objects, deeply nested tables, and private control words from older editors"], ["Where RTF comes from", "Exports from early word processors, email clients, and rich-text database columns"], ["A better option when available", "If the sources are already DOCX, Word Merge preserves more"]],
    faq: [{ question: "Why was some formatting dropped?", answer: "RTF has a great many vendor-private control words and files written by different software vary widely. Basic formatting; font, size, bold, colour, alignment; is reliable; embedded objects and nested tables are not." }, { question: "Should I use RTF or convert to DOCX?", answer: "If the sources are already DOCX, Word Merge preserves more. Come here when the source genuinely is RTF, such as a legacy export or email-client rich text." }],
    reference: [['control word', 'A backslash-prefixed instruction controlling RTF formatting or structure.'], ['font table', 'The RTF table mapping numeric font identifiers to font names.']],
  },
});
