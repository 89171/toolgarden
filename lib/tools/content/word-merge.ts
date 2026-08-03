import { defineToolContent } from './define';

export const wordMergeContent = defineToolContent({
  zh: {
    overview: ['Word 合并会按列表顺序读取多个 DOCX 文档并生成一个新文件，适合汇总章节、报告附件和团队提交稿。DOCX 内部包含段落、样式、关系、图片和节定义，来源文档使用相同样式名称但不同定义时可能发生格式冲突。', '合并前应统一模板、页面尺寸、页眉页脚和标题层级。复杂目录、脚注、域、批注、修订、嵌入对象及宏不一定完整保留，正式交付必须在 Word 中更新目录并逐页复核。'],
    steps: [['整理来源文档', '只使用受支持的 DOCX，并先接受或明确保留修订。'], ['按章节顺序排列', '统一模板和样式命名，再调整文件列表。'], ['生成并在 Word 检查', '更新目录和域，核对分页、图片、编号、页眉与页脚。']],
    scenarios: [['汇总团队报告', '把按章节撰写的多个 DOCX 合成一个审阅文件。'], ['组合标准附件', '按固定顺序连接封面、正文、声明和附录。'], ["把历年版本合成一份存档", "同一份制度或手册的多个年度版本合并成单一文件，便于对照历史修订和长期归档。"]],
    notes: ['旧版 DOC、受密码保护文件和含宏 DOCM 可能不受支持。', '同名样式冲突会改变字体、间距和编号，统一模板比事后修复更可靠。', '合并会生成新文件，已有数字签名和部分文档级功能可能失效。'],
    specs: [["输入 / 输出", "多个 DOCX，输出单个 DOCX"], ["顺序依据", "列表顺序，不按文件名排序"], ["样式冲突", "同名样式以先出现的文档为准，后面文档的同名样式会被覆盖，段落外观可能变化"], ["会保留", "正文、标题层级、内嵌图片、基础表格"], ["可能丢失", "页眉页脚、分节设置、脚注编号连续性、目录域和交叉引用"], ["旧格式", "不支持 .doc（二进制格式），需要先在 Word 里另存为 .docx"]],
    faq: [{ question: "为什么合并后字体和间距变了？", answer: "各文档带着自己的样式表。同名样式（如「正文」「标题 1」）在合并时以先出现的文档为准，后面文档里同名但定义不同的样式会被覆盖，段落外观因此改变。合并后统一走查一遍样式即可。" }, { question: "页眉页脚为什么没了？", answer: "页眉页脚属于分节属性而不是正文内容，合并时不随文档流迁移。需要保留的话，请在合并结果里重新设置一次。" }],
    reference: [['DOCX', '以 Open XML 文件集合保存 Word 内容的压缩容器。'], ['section break', '控制页面尺寸、方向、页眉页脚和编号范围的 Word 结构。']],
  },
  en: {
    overview: ['Word merge reads multiple DOCX files in list order and creates a new document for chapters, report attachments, and team submissions. DOCX stores paragraphs, styles, relationships, images, and sections; identical style names with different definitions can conflict across sources.', 'Standardize template, page size, headers, footers, and heading levels first. Complex contents, footnotes, fields, comments, revisions, embedded objects, and macros may not survive fully, so update fields and inspect every page in Word before delivery.'],
    steps: [['Prepare source documents', 'Use supported DOCX files and accept or deliberately retain revisions first.'], ['Arrange chapter order', 'Standardize templates and style names, then order the files.'], ['Generate and inspect in Word', 'Update contents and fields and check pagination, images, numbering, headers, and footers.']],
    scenarios: [['Compiling a team report', 'Combine separately authored DOCX chapters into one review file.'], ['Assembling standard attachments', 'Join cover, body, declarations, and appendices in a fixed order.'], ["Archiving successive versions together", "Merge several annual revisions of one policy or handbook into a single file for comparing history and long-term storage."]],
    notes: ['Legacy DOC, password-protected files, and macro-enabled DOCM may be unsupported.', 'Conflicting named styles change fonts, spacing, and numbering; a shared template is more reliable than later repair.', 'The new file can invalidate signatures and lose some document-level behavior.'],
    specs: [["Input / output", "Several DOCX files in, one DOCX out"], ["Ordering", "List order; never sorted by filename"], ["Style conflicts", "Same-named styles resolve to the earlier document, so paragraphs from later files can change appearance"], ["Preserved", "Body text, heading levels, embedded images, basic tables"], ["May be lost", "Headers and footers, section setup, footnote numbering continuity, table-of-contents fields and cross-references"], ["Legacy format", "No .doc support (the old binary format); save as .docx in Word first"]],
    faq: [{ question: "Why did fonts and spacing change?", answer: "Each document carries its own stylesheet. Same-named styles such as Normal or Heading 1 resolve to the earlier document, so a later file's differently-defined style of the same name is overridden and its paragraphs change appearance. A single style pass after merging fixes it." }, { question: "Where did the headers and footers go?", answer: "They are section properties rather than body content, so they do not travel with the document stream. Set them again on the merged result if you need them." }],
    reference: [['DOCX', 'A compressed collection of Open XML files storing Word content.'], ['section break', 'A Word structure controlling page size, orientation, headers, footers, and numbering scope.']],
  },
});
