import { defineToolContent } from './define';

export const pdfSplitContent = defineToolContent({
  zh: {
    overview: ['PDF 拆分会按页码范围把一个多页文档分成多个较小文件。它适合按章节、附件或收件人分发页面，也能减少只需处理部分内容时的文件体积。页码按 PDF 实际页面顺序计算，不一定与印刷在页脚的编号相同。', '拆分不会自动理解章节语义，书签、跨页链接、表单字段、签名和附件可能无法独立保留。包含机密信息时，应确认每个输出文件没有带入不应共享的页面或元数据。'],
    steps: [['查看总页数', '对照缩略图和印刷页码，建立实际 PDF 页码范围。'], ['设置拆分规则', '按连续范围或需要的分组输入页码，避免重叠和遗漏。'], ['逐个打开结果', '检查文件名、页序、首尾页面和敏感内容后再分发。']],
    scenarios: [['按章节分发', '把手册或培训资料拆成独立主题文件。'], ['提取提交附件', '只保留表单系统要求的证明页面，减少无关个人信息。'], ["按章节拆分长报告", "把一份几百页的报告按章节切成独立文件，便于分发给对应负责人。"]],
    notes: ['PDF 第 1 页可能显示罗马数字或更大的印刷编号，应以缩略图实际顺序为准。', '拆分已签名 PDF 会改变文件并可能使签名失效。', '跨页书签和链接在独立文件中可能指向不存在的目标。'],
    specs: [["拆分方式", "按页码范围切分，可一次产出多个文档"], ["是否无损", "无损。只重新组织页面对象，不重新渲染，页面与原件逐像素一致"], ["页码基准", "从 1 开始，范围含首尾两端"], ["书签与表单", "可能不随页面迁移到拆分后的文档中"], ["加密文档", "带打开密码的文件需要先移除密码才能读取页面"], ["逆操作", "拆出的文档可以用合并 PDF 重新接回，但书签等结构不会因此恢复"]],
    faq: [{ question: "拆分会降低画质吗？", answer: "不会。拆分只重新组织页面对象，不重新渲染，每一页与原件逐像素一致。这一点和 PDF 转 Word 那种需要重建结构的操作有本质区别。" }, { question: "拆出来的文件还能合回去吗？", answer: "可以用合并 PDF 按顺序接回，页面内容完全一致。但书签、表单域这些页面之外的结构不会因此恢复，原件请保留。" }],
    reference: [['page range', '按实际 PDF 页序指定的一段连续或离散页面。'], ['bookmark', '指向 PDF 内部页面或位置的导航条目。']],
  },
  en: {
    overview: ['PDF splitting divides a multipage document into smaller files by page range. It is useful for distributing chapters, attachments, or recipient-specific pages and reduces size when only part of a document is needed. PDF sequence numbers may differ from numbers printed in the footer.', 'Splitting does not understand chapter meaning automatically, and bookmarks, cross-page links, form fields, signatures, and attachments may not remain independently useful. For confidential material, confirm that no output includes unintended pages or metadata.'],
    steps: [['Review total pages', 'Compare thumbnails with printed numbering and map the actual PDF page ranges.'], ['Define split rules', 'Enter continuous ranges or required groups without overlaps or omissions.'], ['Open every result', 'Check filenames, order, first and last pages, and sensitive content before distribution.']],
    scenarios: [['Distributing by chapter', 'Divide a manual or training pack into independent topic files.'], ['Extracting a submission attachment', 'Retain only evidence pages requested by a form and reduce unrelated personal information.'], ["Splitting a long report by section", "Cut a several-hundred-page report into per-section files so each goes to the right owner."]],
    notes: ['PDF page one may display a Roman numeral or a larger printed number, so use actual thumbnail order.', 'Splitting a signed PDF changes the document and may invalidate signatures.', 'Bookmarks and links crossing file boundaries can point to targets that no longer exist.'],
    specs: [["How it splits", "By page range, producing several documents in one pass"], ["Lossless", "Yes. Page objects are reorganised, never re-rendered, so pages stay pixel-identical to the original"], ["Page numbering", "Starts at 1, and ranges include both endpoints"], ["Bookmarks and forms", "May not follow the pages into the split documents"], ["Encrypted files", "An open password must be removed before the pages can be read"], ["Reversing it", "Merge PDF can rejoin the parts, though structures such as bookmarks do not come back"]],
    faq: [{ question: "Does splitting reduce quality?", answer: "No. It reorganises page objects without re-rendering, so every page stays pixel-identical to the original. This is fundamentally different from something like PDF to Word, which has to rebuild structure." }, { question: "Can the parts be joined back together?", answer: "Merge PDF rejoins them in order with identical page content. Structures outside the pages, such as bookmarks and form fields, do not come back; keep the original." }],
    reference: [['page range', 'A continuous or discrete set identified by actual PDF sequence.'], ['bookmark', 'A navigation entry targeting a page or position inside a PDF.']],
  },
});
