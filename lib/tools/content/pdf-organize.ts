import { defineToolContent } from './define';

export const pdfOrganizeContent = defineToolContent({
  zh: {
    overview: ['PDF 页面整理用于通过缩略图重新排序、旋转或删除页面，再生成一个新的文档。它适合纠正扫描顺序、把附录移到末尾，或清除误扫的空白页，同时保留每页的基本视觉内容。', '页面级重组会改变文档结构，目录书签、页码文字、内部链接、表单计算和数字签名不会自动按新顺序更新。复杂报告应在整理后重新生成目录并逐页检查引用关系。'],
    steps: [['浏览完整缩略图', '识别倒置、重复、空白和顺序错误的页面。'], ['拖动并执行页面操作', '先排序，再旋转和删除，避免误操作后难以核对。'], ['导出后逐页检查', '确认总页数、方向、章节顺序和目录链接，再替换工作副本。']],
    scenarios: [['整理扫描文档', '纠正批量扫描产生的倒序、横页和空白页。'], ['调整报告附件', '在不编辑页面正文的情况下重新排列封面、正文与附录。'], ["整理扫描顺序错乱的文档", "扫描仪按批次输出导致页面顺序错乱时，拖动重排后一次性导出正确的文档。"]],
    notes: ['删除页面会永久不出现在新文件中，应保留原始 PDF。', '页面上印刷的页码不会因拖动自动改写。', '重组会改变签名保护的字节，已签名文件通常需要重新签署。'],
    specs: [["可做的操作", "重新排序、复制和删除页面，然后导出整理后的文档"], ["是否无损", "无损。页面对象只是被重新组织，画质和排版不变"], ["复制页面", "复制出的页面与原页面内容完全相同，不是重新渲染的副本"], ["删除页面", "只影响导出结果，原文件不变；但导出后无法从新文档恢复被删的页"], ["书签与表单", "页面重排后书签指向的位置可能失效，需要合并后确认"], ["加密文档", "带打开密码的文件需要先移除密码才能读取页面"]],
    faq: [{ question: "删掉的页面还能找回来吗？", answer: "在这个页面上，导出前随时可以撤销。但导出之后，新文档里不再包含那些页面，只能回到原文件重做：所以请保留原件。" }, { question: "重排会影响书签吗？", answer: "会。书签记录的是页面位置，页面顺序变了之后指向可能不再正确。导出后请点几个书签实际验证一下。" }],
    reference: [['thumbnail view', '用缩小页面预览帮助识别和调整整体页序。'], ['document outline', 'PDF 书签形成的导航层级，可能需要在重排后更新。']],
  },
  en: {
    overview: ['PDF organization uses thumbnails to reorder, rotate, or remove pages and create a new document. It corrects scan sequence, moves appendices, and removes accidental blank pages while preserving the basic visual page content.', 'Page-level restructuring changes document relationships. Bookmarks, printed page numbers, internal links, calculated forms, and digital signatures do not automatically update for the new order. Rebuild the contents and inspect references in a complex report.'],
    steps: [['Review all thumbnails', 'Identify upside-down, duplicate, blank, and misplaced pages.'], ['Reorder and apply page actions', 'Arrange first, then rotate and delete to make checking easier.'], ['Export and inspect page by page', 'Confirm count, direction, chapter order, and contents links before replacing a working copy.']],
    scenarios: [['Cleaning a scanned document', 'Correct reversed batches, landscape pages, and blank scans.'], ['Rearranging report attachments', 'Move cover, body, and appendices without editing page contents.'], ["Fixing a scan that came out in the wrong order", "When a scanner emits pages out of sequence, drag them into place and export the corrected document in one pass."]],
    notes: ['Removed pages are absent from the new file, so retain the original PDF.', 'Printed page numbers on a page do not change when the page is moved.', 'Reorganization changes signed bytes, and a signed document normally needs a new signature.'],
    specs: [["What you can do", "Reorder, duplicate and delete pages, then export the reorganised document"], ["Lossless", "Yes. Page objects are only rearranged; quality and layout are unchanged"], ["Duplicating pages", "A duplicate is the identical page content, not a re-rendered copy"], ["Deleting pages", "Affects the export only; the original file is untouched, but deleted pages cannot be recovered from the new document"], ["Bookmarks and forms", "Bookmark targets can break once pages move; verify after exporting"], ["Encrypted files", "An open password must be removed before the pages can be read"]],
    faq: [{ question: "Can I recover a deleted page?", answer: "Before exporting, yes; undo on this page. After exporting, the new document simply does not contain those pages and you would have to start again from the original, so keep it." }, { question: "Does reordering break bookmarks?", answer: "It can. Bookmarks reference page positions, and moving pages can leave them pointing at the wrong place. Click a few in the exported file to check." }],
    reference: [['thumbnail view', 'Reduced page previews used to identify and change overall sequence.'], ['document outline', 'The bookmark navigation hierarchy, which may need updating after reordering.']],
  },
});
