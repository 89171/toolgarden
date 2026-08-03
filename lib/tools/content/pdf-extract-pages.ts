import { defineToolContent } from './define';

export const pdfExtractPagesContent = defineToolContent({
  zh: {
    overview: ['PDF 页面提取会从原文档选择指定页面，并按所选顺序组成一个新的 PDF。与按范围批量拆分不同，它更适合从分散位置收集封面、摘要、签字页或证据页。', '提取的是完整页面对象，而不是页面内的文字区域。新文件可能失去原有目录上下文、文档级附件、脚本、签名和跨页链接；提取后仍需检查输出是否包含页边注释或不可见的敏感信息。'],
    steps: [['浏览并标记页面', '依据缩略图内容确认实际页序，不要只依赖印刷编号。'], ['输入选择顺序', '列出需要的页码，并按期望的新文件顺序排列。'], ['验证新 PDF', '打开每页，检查清晰度、方向、顺序及是否需要进一步脱敏。']],
    scenarios: [['汇总关键页', '从长报告提取封面、执行摘要和结论，形成审阅副本。'], ['准备证明材料', '将多个不连续的签字或票据页组合成一个提交文件。'], ["只发送需要的几页", "一份合同里只需要对方确认签署页和附录，提取出来单独发送，避免暴露无关内容。"]],
    notes: ['页面提取不是内容涂黑，敏感文字需要使用真正的 PDF 脱敏工具。', '提取后原数字签名通常不再覆盖新文件。', '重复输入同一页可能在结果中生成重复页面，应检查列表。'],
    specs: [["用途", "从一份 PDF 中挑出指定页面，保存为一个新文档"], ["与拆分的区别", "拆分把整份文档切成多份，提取只取你要的那几页，其余丢弃"], ["页面选择", "支持单页与页码范围，从 1 开始计数"], ["是否无损", "无损。不重新渲染，提取出的页面与原件逐像素一致"], ["页面顺序", "按你指定的顺序输出，因此也可用于挑选后重新排列"], ["加密文档", "带打开密码的文件需要先移除密码才能读取页面"]],
    faq: [{ question: "提取和拆分该用哪个？", answer: "只要几页、其余不需要，用提取。要把整份文档切成若干份、每份都要保留，用拆分。提取还可以按你指定的顺序输出，因此也能顺便重排。" }, { question: "提取出的页面是原件的完整副本吗？", answer: "页面内容是。它不重新渲染，字体、图片和排版与原件一致。但页面之外的书签、表单逻辑和文档元数据不一定跟着过来。" }],
    reference: [['page object', 'PDF 中描述单页内容、资源和尺寸的结构。'], ['redaction', '永久移除敏感内容及其底层数据，与遮盖或提取页面不同。']],
  },
  en: {
    overview: ['PDF page extraction selects specific pages from a source and assembles them in a chosen order as a new PDF. Unlike splitting a document into ranges, it suits collecting a cover, summary, signature page, or evidence from scattered positions.', 'The operation extracts complete page objects, not text regions. The new file can lose directory context, document attachments, scripts, signatures, and cross-page links; also inspect margin notes and hidden sensitive information after extraction.'],
    steps: [['Browse and mark pages', 'Use thumbnail content to confirm actual sequence instead of relying only on printed numbers.'], ['Enter the selection order', 'List required page numbers in the order desired in the new document.'], ['Validate the new PDF', 'Open every page and check clarity, orientation, order, and any remaining privacy work.']],
    scenarios: [['Collecting key pages', 'Create a review copy from a report cover, executive summary, and conclusion.'], ['Preparing evidence material', 'Combine noncontiguous signature or receipt pages into one submission.'], ["Sending only the pages that matter", "When a counterparty needs just the signature page and an annex, extract those instead of exposing the whole contract."]],
    notes: ['Page extraction is not redaction; sensitive content requires a real PDF redaction tool.', 'The original digital signature normally does not cover the newly assembled file.', 'Selecting a page twice can duplicate it in output, so inspect the list.'],
    specs: [["What it does", "Pulls specified pages out of a PDF and saves them as a new document"], ["vs Split", "Split cuts the whole document into parts; Extract keeps only the pages you name and discards the rest"], ["Page selection", "Individual pages and ranges, counting from 1"], ["Lossless", "Yes. Nothing is re-rendered, so extracted pages are pixel-identical to the original"], ["Page order", "Output follows the order you specify, so this doubles as a way to pick and reorder"], ["Encrypted files", "An open password must be removed before the pages can be read"]],
    faq: [{ question: "Extract or split?", answer: "Extract when you want a few pages and can discard the rest. Split when the whole document has to become several files you all keep. Extract also outputs in the order you specify, so it doubles as a reordering step." }, { question: "Is an extracted page a faithful copy?", answer: "The page content is; nothing is re-rendered, so fonts, images and layout match the original. Bookmarks, form logic and document metadata living outside the pages may not follow." }],
    reference: [['page object', 'The PDF structure describing one page’s content, resources, and dimensions.'], ['redaction', 'Permanent removal of sensitive content and underlying data, unlike covering or extracting pages.']],
  },
});
