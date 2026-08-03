import { defineToolContent } from './define';

export const txtMergeContent = defineToolContent({
  zh: {
    overview: ['TXT 合并按文件顺序连接纯文本内容，适合整理日志、章节草稿和导出的数据片段。纯文本没有标题层级或分页结构，文件之间是否加入换行直接决定末行与下一文件首行会不会粘连。', '字符编码是最常见风险。来源若混用 UTF-8、GBK 或其它编码，读取后可能出现乱码；合并前还应统一换行符、末尾空行和是否需要插入文件名作为分隔。'],
    steps: [['确认编码和内容', '分别打开每个文件，确保中文、符号和换行显示正确。'], ['按顺序排列', '决定文件边界是否需要空行或标题，再调整列表。'], ['检查连接位置', '生成后搜索每个原文件的末尾与开头，确认没有粘行或遗漏。']],
    scenarios: [['汇总分段日志', '把按日期或大小滚动生成的日志按时间顺序连接。'], ['组合纯文本章节', '将多个无格式草稿合并为一个可搜索文件。'], ["合并按日期切分的日志", "把一批按天导出的纯文本日志接成一份，再交给文本工具做统计或检索。"]],
    notes: ['合并不会按时间戳自动排序，实际顺序由列表决定。', '不同编码的乱码不能通过简单连接修复，应先单独转为 UTF-8。', '大文件合并可能占用较多浏览器内存，应保留来源并核对输出大小。'],
    specs: [["输入 / 输出", "多个纯文本文件，输出单个 TXT"], ["拼接方式", "按列表顺序首尾相接，文件之间插入换行分隔"], ["编码", "按 UTF-8 读取与输出。源文件若是 GBK 等其它编码，可能出现乱码，需先转码"], ["换行符", "Windows 的 CRLF 与 Unix 的 LF 混用时，合并结果会同时存在两种换行"], ["不做处理", "不去重、不排序、不裁剪空行：内容原样保留"], ["适合的场景", "分章节的草稿、按天切分的日志、分批导出的纯文本记录"]],
    faq: [{ question: "合并后出现乱码怎么办？", answer: "源文件不是 UTF-8 编码。中文环境下常见的是 GBK，需要先在编辑器里转成 UTF-8 再合并。混合编码的一批文件必须逐个转换，无法在合并时自动判断。" }, { question: "会自动去掉重复行吗？", answer: "不会。内容原样保留，不去重、不排序、不裁剪空行。需要这些处理请在合并后用其它工具完成。" }],
    reference: [['UTF-8', '兼容 ASCII 并能表示完整 Unicode 的常用文本编码。'], ['line ending', '表示换行的字符序列，常见为 LF 或 CRLF。']],
  },
  en: {
    overview: ['TXT merge concatenates plain text in file order for logs, draft chapters, and exported data fragments. Plain text has no heading or pagination structure, and separator newlines determine whether the last line of one file runs into the first line of the next.', 'Character encoding is the main risk. Mixed UTF-8, GBK, or other encodings can display incorrectly; also standardize line endings, trailing blank lines, and whether filenames should mark boundaries.'],
    steps: [['Confirm encoding and content', 'Open each source and verify non-ASCII text, symbols, and line breaks.'], ['Arrange the order', 'Decide on blank lines or titles between files, then order the list.'], ['Inspect every join', 'Search the end and beginning of each source in output for joined lines or omissions.']],
    scenarios: [['Combining rotated logs', 'Join logs split by date or size in chronological order.'], ['Assembling plain-text chapters', 'Combine unformatted drafts into one searchable file.'], ["Merging logs split by date", "Join a set of daily plain-text exports into one file, then run counting or searching over the whole thing."]],
    notes: ['The tool does not sort by timestamps automatically; list order controls output.', 'Concatenation cannot repair misdecoded text; convert each source to UTF-8 first.', 'Large files consume browser memory, so retain sources and compare output size.'],
    specs: [["Input / output", "Several plain-text files in, one TXT out"], ["How it joins", "End to end in list order, with a line break inserted between files"], ["Encoding", "Read and written as UTF-8. Sources in GBK or another encoding may come out garbled and need converting first"], ["Line endings", "Mixing Windows CRLF with Unix LF leaves both kinds in the merged output"], ["Not done for you", "No deduplication, no sorting, no trimming of blank lines; content is preserved verbatim"], ["Good for", "Drafts split by chapter, logs split by day, plain-text records exported in batches"]],
    faq: [{ question: "The merged file is garbled; why?", answer: "The sources are not UTF-8. GBK is the common culprit for Chinese text; convert to UTF-8 in an editor before merging. A batch with mixed encodings has to be converted file by file, since it cannot be detected reliably at merge time." }, { question: "Does it remove duplicate lines?", answer: "No. Content is preserved verbatim; no deduplication, no sorting, no trimming of blank lines. Do those afterwards with another tool." }],
    reference: [['UTF-8', 'A common text encoding covering Unicode while remaining ASCII compatible.'], ['line ending', 'A sequence marking a new line, commonly LF or CRLF.']],
  },
});
