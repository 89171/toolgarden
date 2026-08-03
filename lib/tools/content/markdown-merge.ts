import { defineToolContent } from './define';

export const markdownMergeContent = defineToolContent({
  zh: {
    overview: ['Markdown 合并会按顺序连接多个 `.md` 文档，同时保留原始 Markdown 文本。标题、引用链接、脚注和代码围栏依赖整份文档的上下文，同名引用或未闭合代码块可能影响后续文件的渲染。', '工具不会自动重写相对图片路径、标题层级或目录锚点。合并仓库文档时，应以最终文件位置为基准修正资源链接，并在实际使用的 Markdown 渲染器中预览。'],
    steps: [['检查每个文件边界', '确认代码围栏、HTML 标签和列表已经闭合。'], ['排列并设置间隔', '按阅读顺序放置文件，确保章节之间有足够换行。'], ['预览最终 Markdown', '检查标题层级、相对链接、图片、脚注和目录锚点。']],
    scenarios: [['组合项目文档', '把安装、使用和参考章节连接成单一 README 或手册源文件。'], ['汇总写作草稿', '按章节顺序合并多个 Markdown 笔记，进入统一编辑。'], ["把分章节的文档拼成一篇", "按章节分开写的 Markdown 合并成完整文稿，再一次性转成 PDF 或 HTML 交付。"]],
    notes: ['相对链接不会自动根据新文件路径调整。', '重复的引用定义、脚注 ID 或 HTML 锚点可能互相覆盖。', '不同平台的 Markdown 方言不完全一致，应在目标平台验证。'],
    specs: [["输入 / 输出", "多个 .md 文件，输出单个 Markdown"], ["拼接方式", "按列表顺序相接，文件之间留出空行，避免相邻段落被解析成同一段"], ["标题层级", "不做重编号。各文件若都从 # 一级标题开始，合并后会出现多个一级标题，通常需要手工降级"], ["相对链接与图片", "路径原样保留。源文件分处不同目录时，合并后相对路径大概率失效"], ["front matter", "各文件顶部的 YAML front matter 会作为正文文本保留，需要自行清理"], ["后续处理", "可接 Markdown 转 PDF 或 Markdown 转 HTML 直接产出交付件"]],
    faq: [{ question: "为什么合并后有好几个一级标题？", answer: "因为每个源文件都从 # 开始。工具不重编号，需要你把第二个文件起的标题整体降一级（# 改成 ##，以此类推），文档结构才正常。" }, { question: "图片为什么显示不出来？", answer: "Markdown 里的相对路径是相对于文件所在目录的。源文件原本分处不同目录时，合并后这些路径大概率失效。改用绝对路径或统一把图片放到同一目录可以避免。" }],
    reference: [['fenced code block', '由成对反引号或波浪号界定的多行代码区域。'], ['relative link', '相对于当前 Markdown 文件位置解析的资源路径。']],
  },
  en: {
    overview: ['Markdown merge concatenates `.md` documents while preserving source syntax. Headings, reference links, footnotes, and fenced code depend on whole-document context, so duplicate definitions or an unclosed fence can affect later files.', 'The tool does not rewrite relative image paths, heading levels, or table-of-contents anchors. For repository documentation, fix resource links relative to the final file location and preview in the actual Markdown renderer.'],
    steps: [['Check every file boundary', 'Confirm code fences, HTML tags, and lists are closed.'], ['Arrange and separate', 'Place files in reading order with sufficient newlines between chapters.'], ['Preview final Markdown', 'Check heading hierarchy, relative links, images, footnotes, and contents anchors.']],
    scenarios: [['Assembling project documentation', 'Join installation, usage, and reference chapters into one README or manual source.'], ['Compiling writing drafts', 'Combine Markdown notes in chapter order for unified editing.'], ["Reassembling a document written by chapter", "Merge chapter files into one manuscript, then convert to PDF or HTML in a single step."]],
    notes: ['Relative links are not automatically changed for the new file path.', 'Duplicate reference definitions, footnote IDs, or HTML anchors can conflict.', 'Markdown dialects vary by platform, so validate in the target renderer.'],
    specs: [["Input / output", "Several .md files in, one Markdown file out"], ["How it joins", "In list order with a blank line between files, so adjacent paragraphs are not parsed as one"], ["Heading levels", "Not renumbered. If every file starts at a level-1 heading, the merged document has several; usually you will want to demote them by hand"], ["Relative links and images", "Paths are kept verbatim, so relative paths usually break when the sources lived in different directories"], ["Front matter", "YAML front matter at the top of each file survives as body text and needs clearing out"], ["Next step", "Feed the result to Markdown to PDF or Markdown to HTML to produce a deliverable"]],
    faq: [{ question: "Why are there several level-1 headings?", answer: "Because every source file starts at #. Nothing is renumbered, so demote the headings in the second file onward (# becomes ##, and so on) to get a sane document structure." }, { question: "Why are the images broken?", answer: "Relative paths in Markdown resolve against the file's own directory. When the sources lived in different directories those paths break after merging. Use absolute paths, or gather the images into one directory first." }],
    reference: [['fenced code block', 'A multiline code region enclosed by matching backticks or tildes.'], ['relative link', 'A resource path resolved relative to the Markdown file location.']],
  },
});
