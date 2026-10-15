import type { BlogArticle, BlogBlock } from './articles';

const L = (text: string): BlogBlock => ({ type: 'lead', text });
const P = (text: string): BlogBlock => ({ type: 'paragraph', text });
const H2 = (text: string): BlogBlock => ({ type: 'heading', level: 2, text });
const H3 = (text: string): BlogBlock => ({ type: 'heading', level: 3, text });
const CODE = (language: string, code: string): BlogBlock => ({ type: 'code', language, code });
const LIST = (items: string[], ordered = false): BlogBlock => ({ type: 'list', ordered, items });
const TABLE = (headers: string[], rows: string[][]): BlogBlock => ({ type: 'table', headers, rows });
const CALLOUT = (title: string, text: string, href: string, linkLabel: string): BlogBlock => ({
  type: 'callout',
  title,
  text,
  href,
  linkLabel,
});

const pdfToolsGuide: BlogArticle = {
  slug: 'pdf-tools-guide',
  publishedAt: '2026-07-20',
  updatedAt: '2026-10-14',
  translations: {
    zh: {
      title: 'PDF 工具怎么选：合并、拆分、提取、加密一篇讲清',
      excerpt: '手上有一份 PDF，想合并、拆分、删页、加密码或转成 Word，到底该用哪个工具、按什么顺序做？这篇指南给出决策表、组合流程和各工具的真实限制。',
      metaTitle: 'PDF 工具怎么选：合并拆分提取加密全指南',
      metaDescription: '按需求选 PDF 工具：合并、拆分、提取页面、整理、加水印、加密、转图片和转 Word 的决策表、组合顺序与常见坑，全程浏览器本地处理。',
      readingTime: '12 分钟',
      tags: ['PDF 工具指南', '本地 PDF 工具', 'PDF 隐私'],
      relatedTools: [
        { label: '本地 PDF 工具', href: '/pdf', description: '在浏览器本地合并、拆分、整理 PDF，并提取其中的内容。' },
        { label: '合并 PDF', href: '/pdf/merge', description: '在浏览器本地合并和调整 PDF 文件顺序。' },
        { label: '拆分 PDF', href: '/pdf/split', description: '按页码范围把一个 PDF 拆成多个文档。' },
        { label: 'PDF 加密 / 解密', href: '/pdf/encrypt', description: '在浏览器本地设置或移除 PDF 打开密码。' },
        { label: 'PDF 转 Word', href: '/pdf/to-word', description: '在本地提取 PDF 文本并生成可编辑 DOCX。' },
      ],
      blocks: [
        L('PDF 看起来是一个文件，其实是一个容器：里面装着页面、字体、图片、矢量图形、表单、书签、元数据和安全设置。你要对它做什么操作，决定了该用哪个工具——选错工具，轻则多绕几步，重则丢了书签、废了签名，或者把敏感合同传到了不认识的服务器上。这篇指南按「你想达成什么」来组织，把 ToolGarden 的十几个 PDF 工具串成一张决策表，并讲清楚它们的组合顺序和真实限制。'),
        H2('先回答一个问题：你的文件能不能离开电脑'),
        P('在比较功能之前，先判断文件的敏感程度。合同、身份证扫描件、银行流水、病历、内部财报，这类文件一旦上传到第三方服务器，你就失去了对它的控制：对方保留多久、有没有日志、是否被第三方扫描，你都无从核实。ToolGarden 的 PDF 工具（合并、拆分、提取、整理、加密、水印、转图片、转 Word 等）都在浏览器内用 JavaScript 处理，文件内容不会被发送到服务器。'),
        P('这不是靠「相信」，而是可以自己验证：打开浏览器开发者工具的 Network（网络）面板，选择文件、点击处理，观察是否出现携带文件内容的上传请求。处理完成后的下载也是浏览器直接从内存生成的文件。唯一例外是页面本身的脚本和字体等静态资源，以及 PDF 转 Word 在遇到扫描页时首次加载本地 OCR 模型文件——模型是下载到你的浏览器，不是把你的文件传出去。'),
        H2('决策表：从需求找到工具'),
        TABLE(
          ['你想做的事', '用哪个工具', '输出', '需要注意'],
          [
            ['把多个 PDF 合成一个', '合并 PDF（/pdf/merge）', '一个 merged.pdf', '可拖拽排序；书签、表单域不会自动保留'],
            ['把一个 PDF 切成几份', '拆分 PDF（/pdf/split）', '一个 ZIP，内含多个 PDF', '用分号分隔每一份，如 1-3; 4-6; 7'],
            ['只要其中几页', '提取页面（/pdf/extract-pages）', '一个新 PDF', '页码按输入顺序输出，重复页码只保留一次'],
            ['调整顺序、复制或删除页面', '整理 PDF（/pdf/organize）', '一个新 PDF', '可复制同一页多次，必须至少保留一页'],
            ['直接在页面上改字、签名、标注', '编辑 PDF（/pdf/edit）', '一个新 PDF', '改写原文有字体限制，下文详述'],
            ['每页盖统一文字水印', 'PDF 加水印（/pdf/watermark）', '一个新 PDF', '使用 Helvetica 标准字体，建议用英文与数字'],
            ['设置或移除打开密码', 'PDF 加密 / 解密（/pdf/encrypt）', '一个新 PDF', '已加密文件无法被其他工具读取，需先解密'],
            ['把每页导出成图片', 'PDF 转图片（/pdf/to-image）', 'PNG / JPG，可打包 ZIP', '缩放 1x 到 4x，默认 2x'],
            ['拿到可编辑文字', 'PDF 转 Word（/pdf/to-word）', 'DOCX', '扫描页自动走本地 OCR，复杂排版会有偏差'],
            ['把 Word、Excel、图片等转成 PDF', '转 PDF（/pdf/to-pdf）', 'PDF', '不支持旧版 doc / ppt，单文件上限 80 MB'],
          ]
        ),
        P('表里有一个反复出现的细节值得提前知道：合并、拆分、提取、整理这四个工具的内部做法是一样的——创建一个全新的 PDF 文档，把源文件里选中的页面「复制」进去。这意味着页面内容（文字、图片、字体、页面旋转）会被带过去，但文档级别的结构，比如书签目录、表单域定义、文档属性（标题、作者）、附件，并不会自动出现在新文件里。后面每个章节都会回到这一点。'),
        CALLOUT('从最常用的开始', '如果你只想快速合并几份文件，直接打开合并 PDF，拖入文件、拖动排序、点击合并即可。', '/pdf/merge', '打开合并 PDF'),
        H2('组合流程：顺序比单个工具更重要'),
        P('真实工作很少只做一步。常见需求是「把几份材料整理成一份发给对方的文件，并且保护好」。这类流程有一条硬规则：加密永远放在最后。原因很直接——加密后的 PDF 需要密码才能被打开，合并、拆分、水印这些工具读取文件时拿不到密码，会提示文件可能损坏或已加密。'),
        H3('流程一：投标 / 申请材料包'),
        LIST([
          '用整理 PDF 把扫描件里多余的空白页、重复页删掉，并把倒置的页面调整好。',
          '用合并 PDF 按提交要求的顺序拼接封面、正文、资质附件。文件名先加 01、02、03 前缀，列表顺序一目了然。',
          '用 PDF 加水印为每一页加上「仅用于某某项目投标」之类的英文标记。',
          '最后用 PDF 加密设置打开密码，再通过另一条渠道把密码告诉对方。',
        ], true),
        H3('流程二：从长报告里摘出给不同部门的版本'),
        LIST([
          '用拆分 PDF，在范围框里写 1-5; 6-18; 19-30，一次得到三个文件，打包成 ZIP 下载。',
          '如果某个部门只要不连续的几页，改用提取页面，写成 2,7,15-17。',
          '需要贴到聊天工具或文档里时，再用 PDF 转图片导出为 PNG。',
        ], true),
        H3('流程三：扫描件变成可编辑文字'),
        LIST([
          '先用 PDF 转 Word，工具会逐页判断：有可靠文字层的页面直接抽取，没有的页面再调用本地 OCR，仍然不适合的页面用页面图像兜底。',
          '转换界面会显示「原生文字页 / OCR 页 / 图像兜底页」各有多少，方便你判断结果可信度。',
          '在 Word 中校对数字、姓名、金额，这些地方 OCR 最容易出错。',
        ], true),
        H2('每个工具的真实限制：用之前就该知道的'),
        H3('合并、拆分、提取、整理'),
        P('四个工具共享同样的输入校验：文件必须是 PDF，不能是空文件，大小不超过 80 MB；如果文件已加密或损坏，会提示「PDF 无法读取，可能已损坏或已加密」。页码一律是 1 开始的物理页序号，也就是文件里的第几页，而不是页面上印刷的页码。一本带罗马数字前言的书，阅读器里可能显示「iv（第 4 / 200 页）」，在工具里你应该输入 4。'),
        P('如果合并后的文件需要保留书签，现有做法是不够的：新文档不会自动生成书签。可选方案是在需要书签的场景下，用桌面级 PDF 软件完成最后一步，或者接受没有目录、改用清晰的封面页和文件命名来代替。我们更建议在合并之前就想清楚：这份文件的读者是通过目录导航，还是从头读到尾。'),
        H3('编辑 PDF'),
        P('编辑工具支持改写已有文字、添加新文字、插入签名图片、画笔、高亮和遮盖框。其中「改写已有文字」是最容易踩坑的功能：它直接修改页面内容流，所以当文字存在于表单或图形对象里、使用了多字节的 CID 字体、或者原字体里没有你要输入的字形（比如想把英文字体的文本改成中文）时，该处改写会被跳过，工具会告诉你有几处没能应用以及原因，其余修改仍然会写入文件。重要文件的改写结果一定要放大检查。'),
        H3('水印'),
        P('水印工具提供居中、平铺、对角三种布局，可调字号、透明度、旋转角度和颜色，透明度最低按 0.05 处理。实现上嵌入的是 Helvetica 标准字体，所以水印文字请使用英文字母和数字；中文字符无法被这个字体编码。如果必须是中文水印，可以先在别处生成带中文的图片，再用编辑 PDF 把图片放到页面上。'),
        H3('加密 / 解密'),
        P('加密支持打开密码（用户密码）和可选的所有者密码，并可以勾选是否允许打印、复制文字、修改、批注。所有者密码留空时会沿用打开密码。要记住的是：权限限制只是写在文件里的声明，遵守规范的阅读器会执行，但并不是真正的加密保护；真正挡住陌生人的是打开密码。详细原理见我们专门写的加密文章。'),
        H3('转图片与转 Word'),
        P('转图片用 pdf.js 把每页渲染到画布，格式可选 PNG 或 JPG（JPG 质量 0.92），缩放倍率 1 到 4、步长 0.5，倍率越高图越清晰、文件越大，多页结果可以打包成 ZIP。转 Word 则会输出保留字号、基础样式和图片的 DOCX；扫描页的 OCR 语言可选英文、简体中文、繁体中文、日文。两者都是在本地完成，不上传文件。'),
        H2('一个完整的实例：把 5 份材料交给客户'),
        P('假设你有四份 PDF：合同正文 28 页，附件 A 报价单 6 页，附件 B 资质证明 12 页，以及一份 3 页的扫描签章页，其中第 2 页是空白页。目标是生成一个 48 页的文件给客户审阅，并且防止被随意转发。'),
        CODE('text', `步骤                         页数变化        说明
1 整理 PDF（签章页）         3 -> 2          删除空白页，输出 xxx-organized.pdf
2 合并 PDF（四个文件排序）   28+6+12+2 = 48 合并结果页数 = 各文件页数之和
3 PDF 加水印                 48 -> 48        英文水印 CONFIDENTIAL，对角布局，透明度 0.2
4 PDF 加密                   48 -> 48        设置打开密码，限制修改与批注`),
        P('第 2 步的页数是最便宜的校验：合并结果界面会显示总页数，如果不是 48，说明某个文件被漏选或重复添加。第 3 步结束后随手翻到第 1 页、中间页、最后一页看水印是否都在。第 4 步结束后，用另一个阅读器重新打开一次，确认需要输入密码，并且打印、复制的行为符合预期。'),
        H2('常见坑与排查'),
        TABLE(
          ['现象', '最可能的原因', '怎么处理'],
          [
            ['提示「PDF 无法读取，可能已损坏或已加密」', '文件设置了打开密码，或结构确实损坏', '先在加密 / 解密工具中输入密码解密；仍失败则换一个来源重新导出'],
            ['合并后的文件没有目录', '工具复制的是页面，不复制书签', '提前规划：用封面页和清晰命名替代，或用桌面软件补书签'],
            ['拆分得到的几个文件加起来比原文件大', '共享的字体、图片会在每个输出文件中各存一份', '属于正常现象；需要小体积时减少拆分份数'],
            ['提取的页码和预期差了几页', '输入的是印刷页码而不是物理页序号', '以阅读器的「第 N / 总数 页」为准'],
            ['水印文字显示不出或报错', '水印使用 Helvetica，不能编码中文', '改用英文数字，或先做成图片再用编辑工具放入'],
            ['数字签名失效', '任何重新生成文件的操作都会改变文件字节', '需要保留签名的文件不要经过这些工具，签名放在最后一步'],
          ]
        ),
        H2('什么时候不该用这些工具'),
        LIST([
          '需要保留书签、表单域、PDF/A 合规标记、无障碍标签（带结构树的 PDF）的正式归档文件，应使用能保留这些结构的桌面软件。',
          '需要真正的脱敏（涂黑后不可恢复）时，仅仅删除页面或盖一个遮盖框并不等于删除底层文字，务必导出后再检查文字是否还能被选中复制。',
          '单个文件超过 80 MB，或页数极多（几千页）时，浏览器内存可能成为瓶颈，建议分批处理。',
          '需要法律意义上的电子签名或时间戳，应使用专业签名服务，而不是在页面上放一张签名图片。',
        ]),
        CALLOUT('需要密码保护？', '加密永远放在流程最后一步。打开加密工具，设置打开密码，并按需限制打印和复制。', '/pdf/encrypt', '打开 PDF 加密 / 解密'),
        H2('小结'),
        P('选 PDF 工具的思路可以压缩成三句话：先想清楚文件能否离开电脑，能的话再比较功能；改变页面集合用合并、拆分、提取、整理，改变页面内容用编辑和水印，改变文件形态用转图片和转 Word；加密放在最后，签名更靠后。把这个顺序记住，大部分日常 PDF 需求都能在几分钟内完成。'),
      ],
      faq: [
        { question: 'ToolGarden 的 PDF 工具会上传我的文件吗？', answer: '不会。合并、拆分、提取、整理、加密、水印、转图片、转 Word 等操作都在你的浏览器内完成。你可以在开发者工具的 Network 面板里自行验证：处理过程中不会出现携带文件内容的上传请求。' },
        { question: '合并后的 PDF 为什么没有书签？', answer: '合并工具的做法是新建一个空白文档并把各文件的页面复制进去，页面内容会保留，但文档级的书签目录、表单域和文档属性不会自动带入。需要目录时请用桌面 PDF 软件在合并后补充。' },
        { question: '先加密还是先加水印、合并？', answer: '加密应当放在最后。加密后的文件需要密码才能读取，其他工具无法打开它，会提示文件已加密或损坏。正确顺序是整理、合并、水印，最后加密。' },
        { question: 'PDF 文件大小有上限吗？', answer: '合并、拆分、提取、整理和转 PDF 的单个输入文件上限是 80 MB，超过会提示文件过大。实际可处理的规模还取决于你设备的内存，特别大的文件建议分批处理。' },
        { question: '扫描版 PDF 怎么变成可编辑文字？', answer: '使用 PDF 转 Word。工具会逐页判断是否有可靠的文字层，没有时才调用本地 OCR 并可选择识别语言。OCR 对数字和人名最容易出错，转换后需要人工校对。' },
        { question: '这些工具能改动已经签过名的 PDF 吗？', answer: '技术上可以处理，但任何重新生成文件的操作都会改变文件内容，原有的数字签名会因此失效。需要保留签名的文件，签名应放在所有处理之后。' },
      ],
    },
    en: {
      title: 'Which PDF Tool Should You Use? Merge, Split, Extract, Encrypt Explained',
      excerpt: 'Need to merge, split, delete pages, password-protect, or convert a PDF to Word? This guide gives a decision table, the right order for combining steps, and each tool\'s real limits.',
      metaTitle: 'Which PDF Tool to Use: Merge, Split, Extract, Encrypt',
      metaDescription: 'Pick the right PDF tool: merge, split, extract pages, watermark, encrypt, export images or convert to Word. Decision table, step order and pitfalls.',
      readingTime: '12 min read',
      tags: ['PDF tools guide', 'local PDF tools', 'PDF privacy'],
      relatedTools: [
        { label: 'Local PDF tools', href: '/pdf', description: 'Merge, split, organize, and extract content from PDFs in a browser-local workflow.' },
        { label: 'Merge PDF', href: '/pdf/merge', description: 'Merge and reorder PDF files locally in the browser.' },
        { label: 'Split PDF', href: '/pdf/split', description: 'Split one PDF into several documents by page ranges.' },
        { label: 'PDF Encrypt / Decrypt', href: '/pdf/encrypt', description: 'Set or remove a PDF open password locally in the browser.' },
        { label: 'PDF to Word', href: '/pdf/to-word', description: 'Extract PDF text and generate an editable DOCX locally.' },
      ],
      blocks: [
        L('A PDF looks like one file, but it is really a container holding pages, fonts, images, vector graphics, forms, bookmarks, metadata, and security settings. What you want to do to it decides which tool to use, and the wrong choice costs you anything from a few extra steps to lost bookmarks, a broken signature, or a sensitive contract uploaded to a server you know nothing about. This guide is organized by what you are trying to achieve. It ties ToolGarden\'s PDF tools into one decision table and explains the right order for combining them and where each one stops.'),
        H2('First question: can this file leave your computer?'),
        P('Before comparing features, judge how sensitive the file is. Contracts, ID scans, bank statements, medical records, and internal financials lose their protection the moment they land on someone else\'s server: how long it is kept, whether it is logged, whether it is scanned by third parties, you cannot verify any of it. ToolGarden\'s PDF tools (merge, split, extract, organize, encrypt, watermark, export images, convert to Word) run in the browser with JavaScript, and the file contents are not sent to a server.'),
        P('You do not have to take that on trust. Open your browser developer tools, switch to the Network panel, choose a file and run the operation, then look for any request that carries the file. The download you get is a file generated in browser memory. The exceptions are the page\'s own static assets and, for PDF to Word, the one-time download of a local OCR model when a scanned page needs it. That model comes down to your browser; your file does not go up.'),
        H2('Decision table: from task to tool'),
        TABLE(
          ['What you want', 'Tool', 'Output', 'Watch out for'],
          [
            ['Combine several PDFs into one', 'Merge PDF (/pdf/merge)', 'One merged.pdf', 'Drag to reorder; bookmarks and form fields are not carried over automatically'],
            ['Cut one PDF into several', 'Split PDF (/pdf/split)', 'A ZIP of PDFs', 'Separate each output with a semicolon, e.g. 1-3; 4-6; 7'],
            ['Keep only a few pages', 'Extract Pages (/pdf/extract-pages)', 'One new PDF', 'Pages come out in the order typed; repeated numbers appear once'],
            ['Reorder, duplicate, or delete pages', 'Organize PDF (/pdf/organize)', 'One new PDF', 'You can duplicate a page; at least one page must remain'],
            ['Change text, sign, or mark up on the page', 'Edit PDF (/pdf/edit)', 'One new PDF', 'Rewriting existing text has font limits, covered below'],
            ['Stamp a text watermark on every page', 'PDF Watermark (/pdf/watermark)', 'One new PDF', 'Uses the Helvetica standard font, so stick to Latin text and digits'],
            ['Set or remove an open password', 'PDF Encrypt / Decrypt (/pdf/encrypt)', 'One new PDF', 'Encrypted files cannot be read by the other tools; decrypt first'],
            ['Export each page as an image', 'PDF to Image (/pdf/to-image)', 'PNG or JPG, ZIP for many pages', 'Scale 1x to 4x, default 2x'],
            ['Get editable text', 'PDF to Word (/pdf/to-word)', 'DOCX', 'Scanned pages go through local OCR; complex layouts drift'],
            ['Turn Word, Excel, or images into PDF', 'Convert to PDF (/pdf/to-pdf)', 'PDF', 'Legacy doc/ppt unsupported; 80 MB per file'],
          ]
        ),
        P('One detail in that table is worth knowing up front. Merge, split, extract, and organize all work the same way internally: they create a brand-new PDF document and copy the selected pages into it. Page content (text, images, fonts, page rotation) comes along, but document-level structures such as the bookmark outline, form field definitions, document properties like title and author, and attachments do not automatically appear in the new file. Each section below returns to this.'),
        CALLOUT('Start with the most common job', 'If you just need to join a few files, open Merge PDF, drop them in, drag them into order, and click merge.', '/pdf/merge', 'Open Merge PDF'),
        H2('Combining tools: order matters more than any single tool'),
        P('Real work is rarely one step. A typical request is to turn several documents into one file for someone else and protect it. There is one hard rule for these workflows: encrypt last. An encrypted PDF needs its password to be opened, and the merge, split, and watermark tools cannot supply one, so they will report the file as possibly damaged or encrypted.'),
        H3('Workflow 1: a bid or application package'),
        LIST([
          'Use Organize PDF to remove blank or duplicate pages from the scans and fix any pages that are upside down.',
          'Use Merge PDF to join the cover, main body, and credentials in the order the submission requires. Prefix file names with 01, 02, 03 so the list order is obvious.',
          'Use PDF Watermark to mark every page with an English label such as CONFIDENTIAL.',
          'Finally set an open password with PDF Encrypt and send the password through a different channel.',
        ], true),
        H3('Workflow 2: slicing a long report for different departments'),
        LIST([
          'Use Split PDF and type 1-5; 6-18; 19-30 in the range box to get three files at once, downloaded as a ZIP.',
          'If a department needs scattered pages, use Extract Pages and write 2,7,15-17.',
          'When you need pages in a chat or document, export them with PDF to Image as PNG.',
        ], true),
        H3('Workflow 3: scans to editable text'),
        LIST([
          'Run PDF to Word. It decides page by page: pages with a reliable text layer are extracted directly, pages without one go through local OCR, and anything still unsuitable falls back to a page image.',
          'The result screen reports how many pages took each route, which tells you how far to trust the output.',
          'Proofread numbers, names, and amounts in Word, since that is where OCR errs most.',
        ], true),
        H2('Real limits of each tool'),
        H3('Merge, split, extract, organize'),
        P('These four share the same input checks: the file must be a PDF, must not be empty, and must be 80 MB or smaller. An encrypted or damaged file produces the message that the PDF could not be read. Page numbers are always 1-based physical positions, meaning the Nth page in the file, not the number printed on the page. A book with roman-numeral front matter may show "iv (4 of 200)" in a reader; in the tool you type 4.'),
        P('If you need bookmarks in the merged file, this approach is not enough: the new document does not generate an outline. Either finish that last step in a desktop PDF application, or replace the outline with a clear cover page and file naming. It is better to decide before merging whether readers will navigate by outline or read straight through.'),
        H3('Edit PDF'),
        P('The editor supports rewriting existing text, adding new text, placing signature images, pen strokes, highlights, and cover boxes. Rewriting existing text is the feature most likely to surprise you. It edits the page content stream directly, so a rewrite is skipped when the text lives inside a form or graphics object, uses a multi-byte CID font, or when the original font has no glyph for the characters you typed (for example, replacing text in a Latin font with Chinese). The tool tells you how many rewrites could not be applied and why, and everything else is still written to the file. Always zoom in and check rewrites on important documents.'),
        H3('Watermark'),
        P('The watermark tool offers center, tile, and diagonal layouts with adjustable size, opacity, rotation, and color; opacity is clamped to a minimum of 0.05. It embeds the Helvetica standard font, so write the watermark in Latin letters and digits. CJK characters cannot be encoded by that font. If you need a non-Latin watermark, create an image elsewhere and place it on the pages with Edit PDF.'),
        H3('Encrypt and decrypt'),
        P('Encryption supports an open (user) password and an optional owner password, with checkboxes for allowing printing, copying text, modifying, and annotating. If you leave the owner password empty it reuses the open password. The key point is that permission flags are declarations written into the file: well-behaved readers honor them, but they are not strong protection. What actually stops a stranger is the open password. Our dedicated encryption article goes into the details.'),
        H3('Image export and PDF to Word'),
        P('PDF to Image renders each page on a canvas with pdf.js. Choose PNG or JPG (JPG quality is 0.92) and a scale from 1 to 4 in steps of 0.5; a higher scale is sharper and heavier, and multi-page results can be bundled into a ZIP. PDF to Word outputs a DOCX that keeps font sizes, basic styling, and images, and scanned pages can be recognized in English, Simplified Chinese, Traditional Chinese, or Japanese. Both run locally.'),
        H2('A full example: sending five items to a client'),
        P('Suppose you have a 28-page contract, a 6-page quote as attachment A, 12 pages of credentials as attachment B, and a 3-page scanned signature section whose page 2 is blank. The goal is a 48-page file for the client to review, protected against casual forwarding.'),
        CODE('text', `Step                          Pages            Notes
1 Organize (signature scan)   3 -> 2           delete blank page, outputs xxx-organized.pdf
2 Merge (four files, ordered) 28+6+12+2 = 48   merged page count = sum of inputs
3 Watermark                   48 -> 48         English text CONFIDENTIAL, diagonal, opacity 0.2
4 Encrypt                     48 -> 48         open password, restrict modify and annotate`),
        P('The page count after step 2 is the cheapest check there is: the merge result shows the total, and if it is not 48, a file was missed or added twice. After step 3, flip to the first, a middle, and the last page to confirm the watermark is everywhere. After step 4, reopen the file in a different reader to confirm it asks for a password and that printing and copying behave as intended.'),
        H2('Common pitfalls and how to diagnose them'),
        TABLE(
          ['Symptom', 'Most likely cause', 'What to do'],
          [
            ['"PDF could not be read" message', 'The file has an open password or is genuinely damaged', 'Decrypt it first in the Encrypt / Decrypt tool; if that fails, re-export from the source'],
            ['Merged file has no outline', 'The tool copies pages, not bookmarks', 'Plan around it with a cover page and naming, or add bookmarks in desktop software'],
            ['Split parts add up to more than the original', 'Shared fonts and images are stored in every output file', 'Normal; use fewer parts if size matters'],
            ['Extracted pages are off by a few', 'You typed the printed page number, not the physical position', 'Use the reader\'s "page N of total" number'],
            ['Watermark text missing or an error', 'Helvetica cannot encode CJK characters', 'Use Latin text, or place an image via Edit PDF'],
            ['Digital signature no longer valid', 'Any step that regenerates the file changes its bytes', 'Do not process files that must stay signed; sign as the last step'],
          ]
        ),
        H2('When not to use these tools'),
        LIST([
          'Formal archival files that must keep bookmarks, form fields, PDF/A conformance, or accessibility tags (a structure tree) need desktop software that preserves them.',
          'True redaction, where blacked-out content must be unrecoverable, is a different job: deleting a page or covering text with a box does not remove the text underneath. Export, then check whether the text can still be selected and copied.',
          'Single files over 80 MB, or documents with thousands of pages, can exhaust browser memory; process them in batches.',
          'Legally meaningful e-signatures or timestamps call for a dedicated signing service, not a signature image placed on a page.',
        ]),
        CALLOUT('Need a password on the result?', 'Encryption is always the last step. Open the encrypt tool, set an open password, and limit printing and copying as needed.', '/pdf/encrypt', 'Open PDF Encrypt / Decrypt'),
        H2('Summary'),
        P('Choosing a PDF tool comes down to three sentences. Decide whether the file may leave your computer, and if it may, compare features. Use merge, split, extract, and organize to change which pages exist, edit and watermark to change what is on a page, and image export or Word conversion to change the file\'s form. Encrypt last, and sign even later. Keep that order and most everyday PDF jobs take a few minutes.'),
      ],
      faq: [
        { question: 'Do ToolGarden\'s PDF tools upload my files?', answer: 'No. Merge, split, extract, organize, encrypt, watermark, image export, and Word conversion all run in your browser. You can verify it in the developer tools Network panel: no request carrying file contents appears while a job runs.' },
        { question: 'Why does my merged PDF have no bookmarks?', answer: 'The merge tool creates a blank document and copies each file\'s pages into it. Page content is kept, but the bookmark outline, form fields, and document properties are not carried over. Add an outline afterwards in desktop PDF software if you need one.' },
        { question: 'Should I encrypt before or after watermarking and merging?', answer: 'Encrypt last. An encrypted file needs its password to be read, and the other tools cannot open it; they report it as encrypted or damaged. The right order is organize, merge, watermark, then encrypt.' },
        { question: 'Is there a file size limit?', answer: 'Merge, split, extract, organize, and convert to PDF reject any single input larger than 80 MB. What you can actually process also depends on your device memory, so very large files are best handled in batches.' },
        { question: 'How do I turn a scanned PDF into editable text?', answer: 'Use PDF to Word. It checks each page for a reliable text layer and runs local OCR only when needed, with a choice of recognition language. OCR is weakest on numbers and names, so proofread the result.' },
        { question: 'Can I process a PDF that is already signed?', answer: 'You can, but any step that regenerates the file changes its contents and invalidates an existing digital signature. If a document must stay signed, apply the signature after all other processing.' },
      ],
    },
  },
};
const splitPdf: BlogArticle = {
  slug: 'split-pdf-by-pages-ranges-size',
  publishedAt: '2026-07-02',
  updatedAt: '2026-10-14',
  translations: {
    zh: {
      title: '如何拆分 PDF：按页码范围、每页一份、凑够邮件大小',
      excerpt: '一份几十页的 PDF 要拆成几份发给不同的人，或者因为太大发不出去？这篇讲清页码范围写法、每页导出、按大小拆分的做法，以及拆完必须做的检查。',
      metaTitle: '如何拆分 PDF：按页码范围、每页或大小',
      metaDescription: '手把手教你在浏览器本地拆分 PDF：分号分隔多个范围、每页导出为 ZIP、为邮件大小限制规划拆分点，并检查页数、命名与体积。',
      readingTime: '12 分钟',
      tags: ['拆分 PDF', 'PDF 分割', '按页拆分', 'PDF 工具'],
      relatedTools: [
        { label: '拆分 PDF', href: '/pdf/split', description: '将 PDF 拆分为多个文档，支持按页面范围分割或每页导出。' },
        { label: '提取页面', href: '/pdf/extract-pages', description: '只需要某几页时，可以提取为一个新 PDF。' },
        { label: '整理 PDF', href: '/pdf/organize', description: '拆分前可以先删页、换顺序、纠正方向。' },
        { label: 'PDF 转图片', href: '/pdf/to-image', description: '如果最终只是想把内容分享出去，直接把 PDF 每一页导出成 PNG/JPG 更方便。' },
      ],
      blocks: [
        L('把一份 PDF 拆成几份，听起来简单，真做起来经常卡在三个地方：页码范围到底怎么写才不会报错，拆出来的文件为什么加起来比原文件还大，以及「文件太大发不出去」时到底该在哪一页下刀。这篇文章用 ToolGarden 的拆分 PDF 工具把这些问题逐个讲透，所有处理都在浏览器本地完成，文件不会被上传。'),
        H2('先弄清楚：你要的是哪一种拆分'),
        P('「拆分」其实是三种不同的需求，对应不同的做法。选对了，一步就能完成；选错了，往往要来回重做。'),
        TABLE(
          ['场景', '做法', '在工具里怎么操作', '输出'],
          [
            ['按章节发给不同的人', '按页码范围拆分', '范围框填 1-5; 6-18; 19-30，点「按范围拆分」', 'ZIP，内含 3 个 PDF'],
            ['每页单独成一个文件', '每页导出', '点击「每页拆分」，无需填写', 'ZIP，每页一个 PDF'],
            ['只要其中几页，不要其余', '提取页面', '改用提取页面工具，写 2,7,15-17', '一个新 PDF'],
            ['文件太大，发不出去或传不上去', '按大小拆分（间接做法）', '先估算每份应含多少页，再按范围拆分', 'ZIP，每份体积更小'],
            ['想把每页贴到聊天或文档里', '转图片而不是拆分', '改用 PDF 转图片，导出 PNG 或 JPG', '图片，可打包 ZIP'],
          ]
        ),
        P('请注意最后两行：拆分 PDF 工具本身没有「按大小自动拆分」这个选项，它只接受页码范围。按大小拆分需要你自己规划页码，下文有一整节专门讲怎么做，以及它的局限。'),
        H2('步骤：用拆分 PDF 工具完成一次拆分'),
        LIST([
          '打开拆分 PDF，点击上传区域或把 PDF 拖进去。工具会立即读取文件，在文件名下方显示大小和页数，例如「4.2 MB · 48 页」。',
          '范围框里会自动预填一个示例（页数大于 1 时是 1-2; 3-末页）。把它改成你要的分法。',
          '点击「按范围拆分」。如果想每页一份，点击「每页拆分」。',
          '右侧结果区会列出每个输出文件的名称、页码范围和页数，并给出总大小和耗时。检查无误后点击「下载」，得到一个 ZIP。',
        ], true),
        P('如果输入有误，比如页码超出总页数，工具会在范围框下方给出红色提示，例如「页码 60 超出 1-48 范围」，不会生成任何文件。'),
        H2('页码范围的写法：四条规则讲完'),
        P('拆分工具用的是「组」的概念：每一个组生成一个独立的 PDF，组之间用分号或换行分隔，组内部用逗号和连字符指定页面。'),
        CODE('text', `1-3; 4-6; 7              三个文件：第1-3页、第4-6页、第7页
1-3
4-6
7                         同上，用换行代替分号
1,3,5-7; 2,4              两个文件：第1/3/5/6/7页，以及第2/4页
10-12; 1-9                第一个文件是10-12页，第二个是1-9页（文件顺序按输入顺序）`),
        LIST([
          '规则一：页码从 1 开始，是文件里的物理页序号，不是页面上印的页码。带罗马数字前言的书籍，请以阅读器显示的「第 N / 总数 页」为准。',
          '规则二：范围必须从小到大。写成 5-3 会被判定为无效范围。',
          '规则三：同一个组内重复的页码只保留一次，且保持你输入的先后次序；不同组之间互不影响，同一页可以出现在多个组里，相当于复制到多个文件。',
          '规则四：全角的逗号、顿号和分号会被自动当作半角处理，所以从中文文档里复制过来的「1-3；4-6」也能用。',
        ]),
        CALLOUT('现在就试一次', '把一份多页 PDF 拖入拆分工具，用 1-3; 4-6; 7 这样的写法，几秒钟就能得到一个 ZIP。', '/pdf/split', '打开拆分 PDF'),
        H2('实例一：把 48 页年报拆给三个部门'),
        P('一份 48 页的年度报告，财务部要第 1 到 5 页（摘要）加第 30 到 36 页（财务报表），市场部要第 6 到 18 页，管理层要全部章节的目录和结论页：第 1 页和第 47、48 页。注意这三个需求里，财务部要的是不连续的页，管理层要的是首尾页，这正好用到「组内逗号 + 组间分号」。'),
        CODE('text', `范围框输入：
1-5,30-36; 6-18; 1,47-48

输出（文件名规则：原文件名-part-序号-页码标签.pdf）：
report-part-1-1-5,_30-36.pdf  ->  12 页（5 + 7）
report-part-2-6-18.pdf        ->  13 页
report-part-3-1,_47-48.pdf    ->  3 页`),
        P('文件名里的页码标签由工具按「1-5, 30-36」的形式拼出，其中空格这类非数字、逗号、连字符的字符会被替换成下划线，所以逗号后面会多出一个下划线，这是正常的。结果区显示的「第 N 页 · 共 M 页」可以和你的预期逐一核对：12、13、3 三个数字对不上，就说明页码写错了。'),
        H2('实例二：每页一份，适合扫描件批量归档'),
        P('一批 30 页的扫描件，每页是一张独立的发票。点击「每页拆分」，工具会生成 30 个文件，文件名依次是 scan-part-1-1.pdf 到 scan-part-30-30.pdf，打包进 scan-split.zip。解压后可以用任何批量重命名工具按发票号改名。这里有一个细节：因为序号是排在页码之前的，文件在文件管理器里按名称排序时，part-10 会排在 part-2 之前，因为是字符串排序。处理方式是在解压后用批量重命名补零，或者直接按「修改时间」排序。'),
        H2('实例三：带前言的手册按章节拆分'),
        P('一本 200 页的产品手册，封面 1 页、目录 3 页，正文从第 5 页开始，印刷页码重新从 1 计起。第一章印刷页码 1 到 40，第二章 41 到 95，第三章 96 到 190，附录 191 到 196。你要拆成四章加前置部分，必须先把印刷页码换算成物理页序号：物理页序号 = 印刷页码 + 4。'),
        CODE('text', `前置部分（封面+目录）  物理 1-4
第一章  印刷 1-40      物理 5-44
第二章  印刷 41-95     物理 45-99
第三章  印刷 96-190    物理 100-194
附录    印刷 191-196   物理 195-200

范围框输入：1-4; 5-44; 45-99; 100-194; 195-200
预期输出页数：4、40、55、95、6，合计 200`),
        P('合计等于 200 是这类计划最好的自检：只要所有范围连续、不重叠、首尾相接，页数之和必然等于总页数。如果合计不对，就是某个范围写错了，在点击拆分之前就能发现。'),
        H2('按大小拆分：邮件 25 MB 限制的做法'),
        P('很多邮箱和上传入口对附件有大小限制，常见的比如 25 MB（具体以你使用的服务为准）。拆分工具不提供「每份不超过 X MB」的选项，但你可以用「估算 + 验证」两步解决。'),
        H3('第一步：估算每页平均体积'),
        P('用总大小除以总页数得到平均值。假设一份 120 页的扫描合同是 60 MB，平均每页 0.5 MB。想让每份小于 25 MB，每份最多约 50 页，留出余量就取 40 页。于是范围写成 1-40; 41-80; 81-120。'),
        H3('第二步：验证并调整'),
        P('平均值会骗人：一份文档里图片页和纯文字页的体积可能相差几十倍。拆完后在结果区看每个文件的体积，超标的那一份再单独拆细。下面这张表是一个示意（数字为假设，仅用于说明思路）：'),
        TABLE(
          ['输出文件', '页码', '预期', '实际（示例）', '处理'],
          [
            ['part-1', '1-40', '约 20 MB', '14 MB', '合格'],
            ['part-2', '41-80', '约 20 MB', '31 MB', '超标，拆成 41-60 与 61-80'],
            ['part-3', '81-120', '约 20 MB', '15 MB', '合格'],
          ]
        ),
        P('另外要知道一个反直觉的事实：拆出来的各份体积加起来，往往大于原文件。原因是多个页面共用的字体、图片、资源，在原文件里只存一份，而拆分后每个输出文件都需要带上自己用到的那一份。所以拆得越碎，总体积越大。如果目的只是缩小体积而不是分发，拆分并不是最优解，应考虑降低图片分辨率或用转图片的方式重新生成。'),
        H2('拆完之后必做的五项检查'),
        LIST([
          '页数之和：所有输出文件的页数加起来，应等于你在范围里指定的页数（如果没有重复页，就等于原文件页数）。',
          '首尾页：随机打开两个文件，看第一页和最后一页是不是预期的内容，防止范围整体偏了一页。',
          '文件名：序号和页码是否清楚，发出去之前统一改成对方容易理解的名字。',
          '大小：对有大小限制的场景，确认最大的那个文件在限制内。',
          '内部链接与书签：原文件里的目录跳转在拆分后可能失效，因为目标页可能不在同一个文件里。',
        ], true),
        H2('常见问题与排查'),
        TABLE(
          ['现象', '原因', '解决'],
          [
            ['提示「PDF 无法读取，可能已损坏或已加密」', '文件有打开密码或结构损坏', '先用 PDF 加密 / 解密工具输入密码解密，再来拆分'],
            ['提示「页码 N 超出 1-M 范围」', '页码大于总页数', '看文件名下方显示的页数，重新填写'],
            ['提示「页码范围 5-3 无效」', '范围写反了', '改成 3-5'],
            ['提示「文件过大」', '单个文件超过 80 MB', '先在别处压缩，或分段处理'],
            ['拆出来的文件没有书签', '工具复制页面，不复制书签', '需要书签请在桌面软件中补做'],
            ['拆分出来的内容少了表单填写项', '表单域定义属于文档级结构，不随页面复制', '先把表单打印成 PDF，或在拆分后重新添加'],
          ]
        ),
        H2('什么时候不适合拆分'),
        LIST([
          '只需要少量页面：用提取页面更直接，输出是一个文件而不是一个 ZIP。',
          '想靠拆分来缩小体积：见上文，拆分往往让总体积变大。',
          '文件带有数字签名：拆分会生成新文件，原有签名会失效。',
          '要求自动按章节标题或书签拆分：当前工具只接受页码范围，不会读取书签。你可以自己对照目录页写出范围。',
          '页数极多或单文件接近 80 MB：浏览器内存压力大，建议分几次处理。',
        ]),
        CALLOUT('只要几页？', '如果只需要把某几页保存成一个新文件，提取页面更快，不会生成 ZIP。', '/pdf/extract-pages', '打开提取页面'),
        H2('隐私说明'),
        P('拆分过程完全在浏览器里完成：文件通过浏览器读取到内存，处理后在本地生成 ZIP 供你下载。你可以在开发者工具的 Network 面板观察，处理期间不会出现携带文件内容的上传请求。因此像合同、病历、财务数据这样的敏感文件，也可以放心拆分。'),
      ],
      faq: [
        { question: '拆分 PDF 的页码范围怎么写？', answer: '用逗号和连字符指定一组页面，用分号或换行分隔多个输出文件，例如 1-3; 4-6; 7 会得到三个文件。范围必须从小到大，页码是文件中的物理序号，不是页面上印刷的页码。' },
        { question: '工具能按文件大小自动拆分吗？', answer: '不能。拆分工具只接受页码范围。需要满足大小限制时，先用总大小除以页数估算每页平均体积，规划好范围拆分，再在结果里检查每个文件的体积并调整。' },
        { question: '为什么拆分后的文件加起来比原文件大？', answer: '多个页面共用的字体和图片在原文件中只保存一份，拆分后每个输出文件都要各带一份。拆得越碎，总体积越大，这是正常现象。' },
        { question: '拆分后书签和表单还在吗？', answer: '不会自动保留。工具把选中的页面复制到新文档中，页面内容会保留，但书签目录、表单域定义和文档属性属于文档级结构，不会随之带入。' },
        { question: '加密的 PDF 可以直接拆分吗？', answer: '不可以。带打开密码的文件会被提示为无法读取。请先用 PDF 加密 / 解密工具的解密模式输入密码得到无密码版本，再拆分。' },
        { question: '拆分会上传我的文件吗？', answer: '不会。读取、拆分和打包 ZIP 都在你的浏览器里完成，文件不会发送到服务器。' },
      ],
    },
    en: {
      title: 'How to Split a PDF by Page Ranges, Every Page, or Email Size Limits',
      excerpt: 'Need to cut a long PDF into parts for different people, or shrink it to fit an upload limit? Learn the range syntax, one-file-per-page export, size-driven splitting, and the checks to run afterwards.',
      metaTitle: 'How to Split a PDF by Page Range, Page, or Size',
      metaDescription: 'Split a PDF locally in your browser: semicolon-separated ranges, one file per page as a ZIP, planning splits for email size limits, and post-split checks.',
      readingTime: '11 min read',
      tags: ['split PDF', 'PDF splitter', 'page ranges', 'PDF tools'],
      relatedTools: [
        { label: 'Split PDF', href: '/pdf/split', description: 'Split one PDF into multiple documents by page ranges or every page.' },
        { label: 'Extract Pages', href: '/pdf/extract-pages', description: 'Extract selected pages into one new PDF.' },
        { label: 'Organize PDF', href: '/pdf/organize', description: 'Delete pages, reorder them, or fix orientation before splitting.' },
        { label: 'PDF to Image', href: '/pdf/to-image', description: 'If you just need to share pages, exporting each as PNG or JPG is often simpler than splitting.' },
      ],
      blocks: [
        L('Splitting a PDF sounds simple, but people get stuck in three places: how to write the page ranges without an error, why the parts add up to more than the original file, and where to cut when a file is too big to send. This article works through all three with ToolGarden\'s Split PDF tool. Everything runs locally in your browser, and your file is never uploaded.'),
        H2('First, decide which kind of split you need'),
        P('"Split" covers three different needs, each with a different approach. Pick the right one and it is a single step; pick the wrong one and you redo it.'),
        TABLE(
          ['Scenario', 'Approach', 'In the tool', 'Output'],
          [
            ['Send chapters to different people', 'Split by page ranges', 'Type 1-5; 6-18; 19-30 and click Split by ranges', 'ZIP with 3 PDFs'],
            ['One file per page', 'Every-page export', 'Click Split every page; no input needed', 'ZIP, one PDF per page'],
            ['Keep a few pages, drop the rest', 'Extract pages', 'Use Extract Pages and type 2,7,15-17', 'One new PDF'],
            ['File too big to send or upload', 'Split by size (indirect)', 'Estimate pages per part, then split by ranges', 'ZIP of smaller parts'],
            ['Paste pages into chat or docs', 'Export images, not split', 'Use PDF to Image for PNG or JPG', 'Images, optional ZIP'],
          ]
        ),
        P('Note the last two rows. The Split PDF tool has no "split by size" option; it accepts page ranges only. Splitting for a size limit means planning the page numbers yourself. A full section below covers how, and where that approach stops working.'),
        H2('Steps: running one split with the Split PDF tool'),
        LIST([
          'Open Split PDF and click the upload area or drop a PDF onto it. The tool reads the file immediately and shows its size and page count under the file name, for example "4.2 MB · 48 pages".',
          'The range box is pre-filled with an example (for documents over one page, 1-2; 3-last). Replace it with your own plan.',
          'Click Split by ranges. For one file per page, click Split every page instead.',
          'The result area lists each output file with its name, page range, and page count, plus the total size and time taken. Check it, then click Download to get a ZIP.',
        ], true),
        P('If the input is invalid, such as a page number above the total, the tool shows a red message under the range box saying the page is outside 1-48, and produces nothing. (These range-validation messages are currently written in Chinese, whatever the site language.)'),
        H2('Range syntax: four rules'),
        P('The tool thinks in groups. Each group becomes one separate PDF. Groups are separated by a semicolon or a line break, and inside a group you list pages with commas and hyphens.'),
        CODE('text', `1-3; 4-6; 7              three files: pages 1-3, pages 4-6, page 7
1-3
4-6
7                         same thing, using line breaks instead of semicolons
1,3,5-7; 2,4              two files: pages 1,3,5,6,7 and pages 2,4
10-12; 1-9                first file is pages 10-12, second is 1-9 (file order follows input order)`),
        LIST([
          'Rule 1: pages are 1-based physical positions in the file, not the number printed on the page. For books with roman-numeral front matter, use the "page N of total" your reader shows.',
          'Rule 2: ranges must go low to high. 5-3 is rejected as an invalid range.',
          'Rule 3: within one group, a repeated page appears once and keeps the order you typed. Groups are independent, so the same page can appear in several groups, which copies it into several files.',
          'Rule 4: full-width commas and semicolons used in Chinese text are normalized, so a pasted "1-3；4-6" still works.',
        ]),
        CALLOUT('Try it now', 'Drop a multi-page PDF into the splitter and use a plan like 1-3; 4-6; 7. You will have a ZIP in seconds.', '/pdf/split', 'Open Split PDF'),
        H2('Example 1: a 48-page annual report for three teams'),
        P('Finance wants pages 1 to 5 (summary) plus pages 30 to 36 (statements). Marketing wants pages 6 to 18. Management wants just the first page and the last two, 47 and 48. Finance needs non-contiguous pages and management wants head and tail, which is exactly what commas inside a group and semicolons between groups are for.'),
        CODE('text', `Range box:
1-5,30-36; 6-18; 1,47-48

Output (file name pattern: original-part-N-pagelabel.pdf):
report-part-1-1-5,_30-36.pdf  ->  12 pages (5 + 7)
report-part-2-6-18.pdf        ->  13 pages
report-part-3-1,_47-48.pdf    ->  3 pages`),
        P('The page label in the file name is built as "1-5, 30-36", and any character other than digits, commas, and hyphens (the space) is replaced with an underscore, so an underscore appears after each comma. That is expected. The result area shows the page count for each part, so you can check it against your plan: if 12, 13, and 3 do not match, a page number was mistyped.'),
        H2('Example 2: one file per page for batch archiving'),
        P('Take a 30-page scan where each page is a separate invoice. Click Split every page and the tool produces 30 files named scan-part-1-1.pdf through scan-part-30-30.pdf, bundled in scan-split.zip. Afterwards you can rename them by invoice number with any bulk renamer. One detail: because the sequence number comes before the page label, a file manager sorting by name will place part-10 before part-2, since it is a string sort. Pad the numbers during bulk renaming, or sort by modified time.'),
        H2('Example 3: splitting a manual with front matter by chapter'),
        P('Take a 200-page product manual with a 1-page cover and 3 pages of contents, then body text starting at physical page 5, with printed numbering restarting at 1. Chapter 1 is printed pages 1 to 40, chapter 2 is 41 to 95, chapter 3 is 96 to 190, and the appendix is 191 to 196. To split into the front matter plus four chapters, first convert printed numbers to physical positions: physical position = printed number + 4.'),
        CODE('text', `Front matter (cover+contents)  physical 1-4
Chapter 1  printed 1-40        physical 5-44
Chapter 2  printed 41-95       physical 45-99
Chapter 3  printed 96-190      physical 100-194
Appendix   printed 191-196     physical 195-200

Range box: 1-4; 5-44; 45-99; 100-194; 195-200
Expected output pages: 4, 40, 55, 95, 6, total 200`),
        P('A total of 200 is the best self-check for this kind of plan: if the ranges are contiguous, non-overlapping, and end to end, their page counts must sum to the document total. If the sum is off, one range is wrong, and you find out before clicking split.'),
        H2('Splitting by size: the 25 MB email limit'),
        P('Many mailboxes and upload forms cap attachments, and 25 MB is a common figure (check your own service). The splitter has no "each part under X MB" option, but estimate-then-verify gets you there.'),
        H3('Step 1: estimate average page weight'),
        P('Divide total size by page count. Say a 120-page scanned contract is 60 MB, so 0.5 MB per page. To stay under 25 MB, a part could hold about 50 pages, and 40 leaves headroom. The ranges become 1-40; 41-80; 81-120.'),
        H3('Step 2: verify and adjust'),
        P('Averages lie. In one document, image pages and text-only pages can differ in weight by a large factor. After splitting, look at each file\'s size in the result and re-split any part that is over. The table below is an illustration (the numbers are made up to show the method):'),
        TABLE(
          ['Output file', 'Pages', 'Expected', 'Actual (example)', 'Action'],
          [
            ['part-1', '1-40', '~20 MB', '14 MB', 'OK'],
            ['part-2', '41-80', '~20 MB', '31 MB', 'Over; split into 41-60 and 61-80'],
            ['part-3', '81-120', '~20 MB', '15 MB', 'OK'],
          ]
        ),
        P('One counter-intuitive fact: the parts usually add up to more than the original. Fonts, images, and other resources shared by many pages are stored once in the original, but after splitting each output file must carry its own copy of whatever it uses. The more pieces, the larger the total. If your goal is simply a smaller file rather than distribution in pieces, splitting is not the best tool; reduce image resolution or rebuild the pages through image export instead.'),
        H2('Five checks after splitting'),
        LIST([
          'Sum of pages: the page counts of all outputs should equal the number of pages you specified (the original page count, if no page repeats).',
          'First and last pages: open two files and confirm the first and last pages are what you intended, which catches an off-by-one in the ranges.',
          'File names: confirm the numbering and page labels are clear, and rename them to something the recipient will understand before sending.',
          'Size: for size-limited uploads, confirm the largest file is within the limit.',
          'Internal links and bookmarks: table-of-contents jumps in the original may break, because their target pages may now live in a different file.',
        ], true),
        H2('Common problems and diagnosis'),
        TABLE(
          ['Symptom', 'Cause', 'Fix'],
          [
            ['Message: PDF could not be read; it may be damaged or encrypted', 'The file has an open password or is damaged', 'Decrypt it first in the PDF Encrypt / Decrypt tool, then split'],
            ['Message: page N is outside 1-M', 'Page number above the total', 'Check the page count shown under the file name and retype'],
            ['Message: page range 5-3 is invalid', 'Range written backwards', 'Write 3-5'],
            ['Message: file too large', 'A single file is over 80 MB', 'Compress it elsewhere first, or work in sections'],
            ['Parts have no bookmarks', 'The tool copies pages, not outlines', 'Add bookmarks in desktop software if needed'],
            ['Form fields missing in the parts', 'Form field definitions are document-level and are not copied with pages', 'Flatten the form to PDF first, or re-add fields after splitting'],
          ]
        ),
        H2('When splitting is the wrong tool'),
        LIST([
          'You only need a few pages: Extract Pages is more direct and gives one file instead of a ZIP.',
          'You hope to reduce file size: see above; splitting often makes the total bigger.',
          'The file carries a digital signature: splitting produces a new file and the original signature stops being valid.',
          'You want automatic splitting by chapter title or bookmark: the tool takes page ranges only and does not read bookmarks. Read your table of contents and write the ranges yourself.',
          'Very large page counts or a file near 80 MB: browser memory gets tight, so process in several passes.',
        ]),
        CALLOUT('Only need a few pages?', 'If you just want to save some pages as one new file, Extract Pages is faster and skips the ZIP.', '/pdf/extract-pages', 'Open Extract Pages'),
        H2('Privacy'),
        P('The whole process happens in your browser: the file is read into memory, split, and the ZIP is built locally for you to download. Watch the developer tools Network panel and you will see no request carrying file contents during processing. Sensitive files such as contracts, medical records, and financial data can be split without leaving your machine.'),
      ],
      faq: [
        { question: 'How do I write page ranges to split a PDF?', answer: 'Use commas and hyphens to list the pages of one group and a semicolon or line break between output files, so 1-3; 4-6; 7 gives three files. Ranges must go low to high, and page numbers are physical positions, not printed numbers.' },
        { question: 'Can the tool split by file size automatically?', answer: 'No. It accepts page ranges only. To meet a size limit, divide total size by page count to estimate page weight, plan the ranges, then check each output\'s size and adjust.' },
        { question: 'Why do the split files add up to more than the original?', answer: 'Fonts and images shared by many pages are stored once in the original, but each output file has to include its own copy. More pieces means a larger total, which is normal.' },
        { question: 'Do bookmarks and form fields survive a split?', answer: 'Not automatically. The tool copies selected pages into new documents. Page content is kept, but the outline, form field definitions, and document properties are document-level structures and are not carried over.' },
        { question: 'Can I split an encrypted PDF directly?', answer: 'No. A file with an open password is reported as unreadable. Use the decrypt mode of the PDF Encrypt / Decrypt tool to get a password-free copy, then split that.' },
        { question: 'Does splitting upload my file?', answer: 'No. Reading, splitting, and building the ZIP all happen in your browser, and the file is never sent to a server.' },
      ],
    },
  },
};
const extractPages: BlogArticle = {
  slug: 'extract-selected-pages-from-pdf',
  publishedAt: '2026-07-02',
  updatedAt: '2026-10-14',
  translations: {
    zh: {
      title: '如何从 PDF 中提取指定页面：页码写法、顺序与检查',
      excerpt: '只想把 PDF 里的某几页单独保存成新文件？这篇讲清页码写法、顺序与重复页的处理规则、提取后的检查清单，以及提取、拆分、整理三个工具怎么选。',
      metaTitle: '如何从 PDF 提取指定页面：页码写法与检查',
      metaDescription: '在浏览器本地从 PDF 提取指定页面：1,3,5-7 的写法、按输入顺序输出、重复页只留一次、提取后检查页数与内容，不上传文件。',
      readingTime: '11 分钟',
      tags: ['PDF 提取页面', 'PDF 页码', 'PDF 工具'],
      relatedTools: [
        { label: '提取页面', href: '/pdf/extract-pages', description: '从 PDF 文件中提取特定页面并保存为新文档。' },
        { label: '整理 PDF', href: '/pdf/organize', description: '需要拖拽重新排序、复制或删除页面时，可以使用整理 PDF。' },
        { label: '拆分 PDF', href: '/pdf/split', description: '需要一次得到多个文件时，用拆分更合适。' },
        { label: 'PDF 转图片', href: '/pdf/to-image', description: '提取到的页面还可以再导出为图片，方便直接贴到 Slack、Notion 等平台。' },
      ],
      blocks: [
        L('你有一份 80 页的合同，对方只要第 1 页、第 12 页的签字页和第 40 到 43 页的附件；或者一份扫描的材料里，只有第 5 页是你需要提交的证明。这时不必把整份文件发出去，也不必装一个桌面软件：把需要的页面提取成一个新 PDF 就行。这篇文章讲清楚用 ToolGarden 的提取页面工具怎么做，规则是什么，容易错在哪，以及提取之后该怎么检查。全程在浏览器本地处理，文件不上传。'),
        H2('提取页面解决什么问题'),
        P('提取页面的本质是：从源文件里挑出你指定的页面，复制到一个全新的 PDF 文档里并保存。源文件保持不变，你得到的是一个只包含这些页面的新文件。常见用途有：'),
        LIST([
          '只提交合同或申请材料中要求的几页，避免泄露其余内容；',
          '从一份长报告中摘出某一章，发给相关同事；',
          '从扫描合集里取出某张证明、某页发票；',
          '把签字页单独抽出来，方便对方打印签字后扫描回来；',
          '为后续处理准备素材，比如先提取 3 页再导出成图片贴进文档。',
        ]),
        P('如果你需要的是「同时得到好几个不同的文件」，请用拆分；如果还需要调整页面顺序、复制同一页多次或删除个别页面，请用整理 PDF。三者的区别放在后面的对比表里。'),
        H2('步骤：提取页面的完整操作'),
        LIST([
          '打开提取页面工具，点击上传区域或把 PDF 拖进去。工具会读取文件，显示大小和总页数。',
          '页码输入框会自动给出一个示例（总页数超过 2 页时是 1,3-末页）。把它改成你要的页码。',
          '点击「提取页面」，右侧会显示结果摘要（页数、体积、耗时）和提取后 PDF 的预览。',
          '在预览里翻几页确认内容正确，再点击下载。输出文件名是「原文件名-extracted.pdf」。',
        ], true),
        CALLOUT('现在就提取', '上传 PDF，输入 1,3,5-7 这样的页码，几秒钟得到只含这些页的新文件。', '/pdf/extract-pages', '打开提取页面'),
        H2('页码写法：规则与示例'),
        P('页码输入框接受三种元素：单个页码、连字符范围、以及用逗号把它们连起来。全角的逗号和顿号会被自动当成半角逗号，所以从中文文档里复制的「1，3、5-7」也能识别。'),
        TABLE(
          ['输入', '提取到的页面（按输出顺序）', '输出页数'],
          [
            ['5', '5', '1'],
            ['1,3,5', '1、3、5', '3'],
            ['5-8', '5、6、7、8', '4'],
            ['1,3,5-7', '1、3、5、6、7', '5'],
            ['7,2,5', '7、2、5（保持输入顺序）', '3'],
            ['1-3,2-4', '1、2、3、4（重复的 2、3 只保留第一次）', '4'],
            ['12-10', '无效，提示「页码范围 12-10 无效」', '—'],
            ['0 或 100（共 48 页）', '无效，提示超出 1-48 范围', '—'],
          ]
        ),
        P('由此可以总结出三条规则，也是理解这个工具行为的关键：'),
        LIST([
          '页码是 1 开始的物理页序号，即文件中的第几页，而不是页面上印刷的页码。扫描件、带封面和目录的书，印刷页码与物理页序号经常差好几页。',
          '输出顺序等于你输入的顺序。输入 7,2,5，新文件里第一页是原来的第 7 页。这个特性可以顺手用来「重排」，但如果你只是想按原顺序，请把页码写成升序。',
          '重复的页码只保留第一次出现的位置。如果你需要同一页出现多次，提取页面做不到，请改用整理 PDF，它支持复制页面。',
        ]),
        H2('实例一：从 80 页合同中取出三部分'),
        P('一份 80 页的合同，需要提交：封面（第 1 页）、双方签字页（第 12 页）、附件三（第 40 到 43 页）。输入如下：'),
        CODE('text', `页码输入：1,12,40-43

提取结果：
  输出第 1 页  <-  原第 1 页（封面）
  输出第 2 页  <-  原第 12 页（签字页）
  输出第 3-6 页 <-  原第 40-43 页（附件三）
  共 6 页，文件名：contract-extracted.pdf`),
        P('提取后在预览中翻到第 2 页，确认是签字页，再看第 3 页开头是不是附件三的标题。如果标题差了一页，说明你按印刷页码而不是物理页序号输入了。回到阅读器，用「第 N / 总数 页」的数字重新核对。'),
        H2('实例二：印刷页码和物理页序号对不上'),
        P('这是提取页面时最常见的错误来源。以一本 200 页的扫描手册为例：封面 1 页、目录 3 页，之后正文从印刷页码 1 开始。你想提取「正文第 25 到 30 页」，实际应该输入的物理页序号是 25 + 4 = 29 到 34。'),
        TABLE(
          ['结构', '物理页序号', '印刷页码'],
          [
            ['封面', '1', '无'],
            ['目录', '2-4', 'i - iii'],
            ['正文第 1 页', '5', '1'],
            ['正文第 25 页', '29', '25'],
            ['正文第 30 页', '34', '30'],
          ]
        ),
        P('换算公式很简单：物理页序号 = 印刷页码 + 前置页数。不同阅读器的显示方式不一样，大多数在窗口底部或页码框里显示「4 / 204」这样的格式，分子才是物理页序号。'),
        H2('进阶用法：用提取页面删页与倒序'),
        P('提取页面没有删除按钮，但「写出要保留的页」本身就等于删页。一份 10 页的文件想删掉第 3 页和第 8 页，输入 1-2,4-7,9-10，得到 8 页。检查方法是算一下：2 + 4 + 2 = 8，与预览里的页数一致就对了。'),
        P('因为输出顺序等于输入顺序，你还可以做简单的重排：想让一份 5 页的文件倒序，输入 5,4,3,2,1。注意倒序不能写成 5-1，因为范围必须从小到大；每个页码要单独写出来。把最后一页提到最前面则可以写 5,1-4。页数很多时这种写法会很长，这时整理 PDF 的拖拽界面更合适。'),
        H2('提取、拆分、整理：怎么选'),
        TABLE(
          ['需求', '推荐工具', '原因'],
          [
            ['只要几页，存成一个文件', '提取页面', '一步完成，直接得到一个 PDF，带预览'],
            ['按章节切成多个文件', '拆分 PDF', '一次输出多个 PDF，打包成 ZIP'],
            ['每页都变成独立文件', '拆分 PDF（每页拆分）', '按页数自动生成'],
            ['调整页面顺序、复制页面、删除少数页', '整理 PDF', '图形化管理页面，支持复制，可一键恢复原顺序'],
            ['删除少数几页，保留其余', '整理 PDF 或提取页面', '页数多时用整理删页更直观；也可以在提取里写出要保留的所有页码'],
            ['页面要贴到聊天或文档里', '提取后再用 PDF 转图片', '先缩小范围，再导出 PNG/JPG，文件更小'],
          ]
        ),
        P('「删除几页」是一个值得单独说的场景：提取页面没有「删除」概念，你必须写出要保留的页。保留的页比删除的页多得多时，写页码很麻烦，用整理 PDF 点几下删除按钮反而更快。反过来，只保留很少几页时，提取更快。'),
        H2('提取之后必做的检查'),
        LIST([
          '页数：结果摘要里的页数应该等于你预期的页数。输入 1,12,40-43 应该是 6 页，不是 7 页或 5 页。',
          '首页与尾页：在预览里确认第一页和最后一页是你想要的内容。',
          '页面方向和尺寸：源文件里页面的方向、尺寸会被原样带过来；如果原文件里混有横向页，输出也是如此。',
          '敏感信息：新文件只包含你选的页面，但页面本身的内容完整保留。页面上的姓名、金额、身份证号不会被自动隐藏。需要遮盖时，请先在编辑 PDF 里处理，并确认遮盖后文字无法被选中复制。',
          '文档属性：新文档是重新创建的，原文件的书签、表单域、标题作者等文档级信息不会自动带入。',
        ], true),
        H2('常见问题与排查'),
        TABLE(
          ['现象', '原因', '解决'],
          [
            ['提示「请输入页码」', '输入框为空', '输入如 1,3,5-7 的页码'],
            ['提示「无法识别页码：xx」', '输入里有字母或其他符号，比如 3 to 5、第3页', '只用数字、逗号、连字符'],
            ['提示「页码 N 超出 1-M 范围」', '页码大于总页数或为 0', '以文件名下方显示的页数为准'],
            ['提示「无法读取，可能已损坏或已加密」', '文件有打开密码或结构损坏', '先用 PDF 加密 / 解密工具解密'],
            ['提取的内容整体偏了几页', '混淆了印刷页码和物理页序号', '按「前置页数 + 印刷页码」换算'],
            ['需要的页面出现了两次却只提取出一份', '重复页码只保留一次', '改用整理 PDF，复制页面'],
            ['提取后表单不能填写了', '表单域定义不随页面复制', '提取前先打印成 PDF，或提取后重新添加'],
          ]
        ),
        H2('什么时候不该用提取页面'),
        LIST([
          '要把「提取」当作脱敏手段：它只能让不需要的页面不出现在新文件里，不能处理保留页上的敏感内容。',
          '文件带有有效的数字签名：提取会生成新文件，签名失效。如果对方需要验证签名，应该提供原文件。',
          '需要保留书签、可填表单或无障碍标签：这些文档级结构不会被带过去。',
          '需要同一页出现多次或要调整顺序：提取页面会去重，整理 PDF 更合适。',
          '文件有打开密码：先解密再提取，处理完需要的话再重新加密。',
        ]),
        CALLOUT('要重排或复制页面？', '如果还需要调整页面顺序、复制同一页或删除个别页，整理 PDF 提供拖拽式的页面管理。', '/pdf/organize', '打开整理 PDF'),
        H2('隐私说明'),
        P('提取过程完全发生在你的浏览器里：文件被读入内存，选中的页面被复制到新文档，结果以浏览器本地的文件形式提供下载。处理期间不会产生携带文件内容的上传请求，你可以在开发者工具的 Network 面板里自行验证。对合同、证件、病历这类文件，本地提取比先上传到网站再提取要稳妥得多。'),
        P('还有一个与隐私相关的习惯：提取出的新文件名里带着原文件名，例如「某某公司采购合同-extracted.pdf」。发给外部之前，建议改成不暴露信息的名字，因为文件名本身也会随邮件一起被对方看到。同样，检查一下你要发送的页面里有没有页眉页脚带出的内部编号或路径信息。'),
      ],
      faq: [
        { question: '提取页面时页码怎么写？', answer: '用数字、连字符和逗号，例如 1,3,5-7 表示第 1、3、5、6、7 页。页码是物理页序号（文件中的第几页），范围必须从小到大。全角逗号和顿号会被自动识别。' },
        { question: '提取出来的页面顺序可以改吗？', answer: '输出顺序就是你输入的顺序，输入 7,2,5 得到的新文件第一页是原第 7 页。更复杂的重排、复制和删除请使用整理 PDF。' },
        { question: '同一页可以提取多次吗？', answer: '不可以。重复的页码只保留第一次出现的位置。需要同一页出现多次，请使用整理 PDF 的复制功能。' },
        { question: '提取后原文件会被修改吗？', answer: '不会。工具是读取原文件并生成一个全新的 PDF，原文件保持不变，新文件名是「原文件名-extracted.pdf」。' },
        { question: '提取页面能保留书签和表单吗？', answer: '不能自动保留。工具把页面复制到新文档，页面内容会保留，但书签、表单域定义和文档属性属于文档级结构，不会带入。' },
        { question: '提取页面会上传文件吗？', answer: '不会。读取和生成新 PDF 都在你的浏览器里完成，文件不会发送到服务器。' },
      ],
    },
    en: {
      title: 'How to Extract Selected Pages from a PDF: Syntax, Order, and Checks',
      excerpt: 'Want to save just a few pages of a PDF as a new file? Learn the page syntax, how order and duplicates are handled, what to check afterwards, and when to use extract, split, or organize.',
      metaTitle: 'How to Extract Pages from a PDF: Syntax and Checks',
      metaDescription: 'Extract pages from a PDF in your browser: 1,3,5-7 syntax, output in typed order, duplicates kept once, plus checks for page count and content.',
      readingTime: '10 min read',
      tags: ['extract PDF pages', 'PDF page range', 'PDF tools'],
      relatedTools: [
        { label: 'Extract Pages', href: '/pdf/extract-pages', description: 'Extract selected pages from a PDF and save them as a new document.' },
        { label: 'Organize PDF', href: '/pdf/organize', description: 'Reorder, duplicate, or delete pages by dragging.' },
        { label: 'Split PDF', href: '/pdf/split', description: 'Use split when you need several output files at once.' },
        { label: 'PDF to Image', href: '/pdf/to-image', description: 'Turn extracted pages into images so they can be pasted straight into Slack or Notion.' },
      ],
      blocks: [
        L('You have an 80-page contract and the other side only needs page 1, the signature page at 12, and the attachment on pages 40 to 43. Or a scanned bundle where only page 5 is the proof you must submit. You should not have to send the whole file, or install desktop software: extract the pages you need into a new PDF. This article shows how with ToolGarden\'s Extract Pages tool, what its rules are, where people go wrong, and how to check the result. Everything runs locally in your browser and the file is not uploaded.'),
        H2('What extracting pages is for'),
        P('Extracting means picking the pages you name from the source file and copying them into a brand-new PDF document that you then save. The source stays untouched; you get a new file containing only those pages. Typical uses:'),
        LIST([
          'Submitting only the pages a contract or application asks for, so the rest is not disclosed.',
          'Pulling one chapter out of a long report for a colleague.',
          'Taking one certificate or one invoice out of a scanned bundle.',
          'Isolating the signature page so someone can print, sign, and scan it back.',
          'Preparing material for another step, such as extracting 3 pages and then exporting them as images.',
        ]),
        P('If you need several different files at once, use split. If you also need to reorder, duplicate a page, or delete a few, use Organize PDF. The comparison table below spells out the differences.'),
        H2('Steps: the full procedure'),
        LIST([
          'Open the Extract Pages tool and click the upload area or drop a PDF on it. The tool reads the file and shows its size and page count.',
          'The page input is pre-filled with an example (for documents longer than 2 pages, 1,3-last). Replace it with the pages you want.',
          'Click Extract pages. The right side shows a summary (page count, size, time) and a preview of the extracted PDF.',
          'Flip through the preview to confirm the content, then download. The output file is named original-name-extracted.pdf.',
        ], true),
        CALLOUT('Extract now', 'Upload a PDF, type pages such as 1,3,5-7, and get a new file with only those pages in seconds.', '/pdf/extract-pages', 'Open Extract Pages'),
        H2('Page syntax: rules and examples'),
        P('The input accepts three building blocks: single pages, hyphenated ranges, and commas that join them. Full-width commas and enumeration commas used in Chinese text are treated as ordinary commas, so a pasted "1，3、5-7" still works.'),
        TABLE(
          ['Input', 'Pages extracted (in output order)', 'Output pages'],
          [
            ['5', '5', '1'],
            ['1,3,5', '1, 3, 5', '3'],
            ['5-8', '5, 6, 7, 8', '4'],
            ['1,3,5-7', '1, 3, 5, 6, 7', '5'],
            ['7,2,5', '7, 2, 5 (typed order is kept)', '3'],
            ['1-3,2-4', '1, 2, 3, 4 (the repeated 2 and 3 appear once)', '4'],
            ['12-10', 'Invalid: rejected as a bad range', '—'],
            ['0 or 100 (in a 48-page file)', 'Invalid: outside 1-48', '—'],
          ]
        ),
        P('Three rules follow from this, and they are the key to understanding the tool:'),
        LIST([
          'Page numbers are 1-based physical positions, meaning the Nth page in the file, not the number printed on the page. In scans and in books with a cover and contents, the printed number and the physical position often differ by several pages.',
          'Output order equals input order. Type 7,2,5 and the first page of the new file is the original page 7. That doubles as a quick reorder, but if you want original order, write the numbers ascending.',
          'A repeated page number is kept only at its first position. If you need the same page twice, Extract Pages cannot do it; use Organize PDF, which can duplicate pages.',
        ]),
        H2('Example 1: three parts from an 80-page contract'),
        P('A contract needs to be submitted with the cover (page 1), the signature page (page 12), and attachment 3 (pages 40 to 43). The input:'),
        CODE('text', `Page input: 1,12,40-43

Result:
  output page 1    <-  original page 1 (cover)
  output page 2    <-  original page 12 (signature page)
  output pages 3-6 <-  original pages 40-43 (attachment 3)
  6 pages total, file name: contract-extracted.pdf`),
        P('In the preview, go to output page 2 and confirm it is the signature page, then look at the top of page 3 for the attachment 3 heading. If the heading is a page off, you typed printed page numbers instead of physical positions. Go back to your reader and recheck using its "page N of total" figure.'),
        H2('Example 2: printed numbers and physical positions disagree'),
        P('This is the most common source of mistakes. Take a 200-page scanned manual with a 1-page cover and 3 pages of contents, after which the body starts at printed page 1. You want "body pages 25 to 30". The physical positions to type are 25 + 4 = 29 to 34.'),
        TABLE(
          ['Section', 'Physical position', 'Printed number'],
          [
            ['Cover', '1', 'none'],
            ['Contents', '2-4', 'i - iii'],
            ['Body page 1', '5', '1'],
            ['Body page 25', '29', '25'],
            ['Body page 30', '34', '30'],
          ]
        ),
        P('The conversion is simple: physical position = printed number + number of front pages. Readers display it differently, but most show something like "4 / 204" at the bottom or in the page box, and the first number is the physical position.'),
        H2('Advanced use: deleting and reversing with Extract Pages'),
        P('Extract Pages has no delete button, but listing the pages to keep amounts to deleting the rest. To drop pages 3 and 8 from a 10-page file, type 1-2,4-7,9-10 and you get 8 pages. A quick check: 2 + 4 + 2 = 8, which should match the count in the preview.'),
        P('Because output order follows input order, you can also do simple reordering. To reverse a 5-page file, type 5,4,3,2,1. It cannot be written as 5-1, since ranges must go low to high, so each page is typed on its own. To bring the last page to the front, write 5,1-4. With many pages this gets long, and the drag interface in Organize PDF is a better fit.'),
        H2('Extract, split, or organize: which one?'),
        TABLE(
          ['Need', 'Tool', 'Why'],
          [
            ['A few pages saved as one file', 'Extract Pages', 'One step, one PDF out, with a preview'],
            ['Cut into several files by section', 'Split PDF', 'Several PDFs at once, bundled as a ZIP'],
            ['Every page as its own file', 'Split PDF (Split every page)', 'Generated automatically per page'],
            ['Reorder, duplicate pages, delete a few', 'Organize PDF', 'Visual page management, supports duplication, one-click restore of the original order'],
            ['Delete a few pages and keep the rest', 'Organize PDF or Extract Pages', 'For long files, deleting is easier in Organize; in Extract you must list every page to keep'],
            ['Pages for chat or a document', 'Extract, then PDF to Image', 'Narrow the range first, then export PNG or JPG for smaller files'],
          ]
        ),
        P('"Delete a few pages" deserves its own note. Extract Pages has no delete concept; you list the pages to keep. When you keep far more than you drop, typing the page list is tedious, and a few clicks on delete buttons in Organize PDF is faster. In the opposite case, keeping very few pages, extraction is quicker.'),
        H2('Checks to run after extraction'),
        LIST([
          'Page count: the summary should match what you expect. Input 1,12,40-43 should give 6 pages, not 7 or 5.',
          'First and last page: confirm in the preview that they are the content you wanted.',
          'Orientation and size: page orientation and dimensions come across as they were; mixed landscape and portrait pages stay mixed.',
          'Sensitive content: the new file only contains the pages you chose, but those pages are kept whole. Names, amounts, and ID numbers on them are not hidden. If something must be covered, handle it first in Edit PDF and verify that the text can no longer be selected and copied.',
          'Document properties: the new document is created fresh, so the original\'s bookmarks, form fields, and title or author metadata are not carried over automatically.',
        ], true),
        H2('Common problems and diagnosis'),
        TABLE(
          ['Symptom', 'Cause', 'Fix'],
          [
            ['Message asking you to enter pages', 'The input box is empty', 'Type pages such as 1,3,5-7'],
            ['Message: page not recognized', 'The input has letters or other symbols, like 3 to 5 or p3', 'Use digits, commas, and hyphens only'],
            ['Message: page N is outside 1-M', 'Page number is above the total or is 0', 'Use the page count shown under the file name'],
            ['Message: could not be read; may be damaged or encrypted', 'The file has an open password or is damaged', 'Decrypt it first in the PDF Encrypt / Decrypt tool'],
            ['Everything is off by a few pages', 'Printed numbers confused with physical positions', 'Convert: front pages + printed number'],
            ['A page you wanted twice appears once', 'Repeated numbers are kept once', 'Use Organize PDF and duplicate the page'],
            ['Form can no longer be filled after extracting', 'Form field definitions are not copied with pages', 'Flatten the form to PDF first, or re-add fields afterwards'],
          ]
        ),
        H2('When not to use Extract Pages'),
        LIST([
          'As a redaction method: it keeps unwanted pages out of the new file, but does nothing about sensitive content on the pages you keep.',
          'On a file with a valid digital signature: extraction produces a new file and the signature stops being valid. If the recipient must verify it, send the original.',
          'When you must keep bookmarks, fillable forms, or accessibility tags: those document-level structures are not carried over.',
          'When you need the same page several times or a different order: extraction de-duplicates, and Organize PDF is the better fit.',
          'When the file has an open password: decrypt first, extract, and re-encrypt afterwards if needed.',
        ]),
        CALLOUT('Need to reorder or duplicate pages?', 'Organize PDF gives you drag-style page management when you also need a new order, copies of a page, or a few deletions.', '/pdf/organize', 'Open Organize PDF'),
        H2('Privacy'),
        P('Extraction takes place entirely in your browser: the file is read into memory, the chosen pages are copied into a new document, and the result is offered as a local download. No request carrying the file contents is made during processing, and you can verify that in the developer tools Network panel. For contracts, IDs, and medical records, extracting locally is far safer than uploading to a site first.'),
      ],
      faq: [
        { question: 'How do I write the pages to extract?', answer: 'Use digits, hyphens, and commas, so 1,3,5-7 means pages 1, 3, 5, 6, and 7. Numbers are physical positions in the file, and ranges must go low to high. Full-width commas are recognized too.' },
        { question: 'Can I change the order of extracted pages?', answer: 'The output follows your input order, so 7,2,5 puts original page 7 first. For heavier reordering, duplication, or deletion, use Organize PDF.' },
        { question: 'Can the same page be extracted twice?', answer: 'No. A repeated page number is kept only at its first position. To get a page twice, use the duplicate function in Organize PDF.' },
        { question: 'Does extraction change my original file?', answer: 'No. The tool reads the original and builds a brand-new PDF, leaving the source unchanged. The output is named original-name-extracted.pdf.' },
        { question: 'Does extraction keep bookmarks and forms?', answer: 'Not automatically. Pages are copied into a new document, so page content stays, but bookmarks, form field definitions, and document properties are document-level structures and are not carried over.' },
        { question: 'Does the tool upload my file?', answer: 'No. Reading the file and generating the new PDF both happen in your browser, and nothing is sent to a server.' },
      ],
    },
  },
};
const mergePdf: BlogArticle = {
  slug: 'merge-multiple-pdf-files-keep-order-bookmarks',
  publishedAt: '2026-07-02',
  updatedAt: '2026-10-14',
  translations: {
    zh: {
      title: '如何不上传文件合并多个 PDF：保持顺序并检查书签与页数',
      excerpt: '合同、简历、发票、扫描件要合成一个 PDF，又不想上传到陌生网站？这篇讲清本地合并的步骤、排序技巧、书签与表单的真实情况，以及合并后的检查清单。',
      metaTitle: '无需上传合并 PDF：本地合并与顺序检查指南',
      metaDescription: '在浏览器本地合并多个 PDF，不上传文件：拖拽排序、页数核对、书签和表单的限制、加密文件的处理，以及合并后的检查清单。',
      readingTime: '12 分钟',
      tags: ['合并 PDF', 'PDF 顺序', 'PDF 书签', 'PDF 工具'],
      relatedTools: [
        { label: '合并 PDF', href: '/pdf/merge', description: '上传多个 PDF，拖放重新排序后合并成一个文档。' },
        { label: '整理 PDF', href: '/pdf/organize', description: '需要重新排序、复制或删除页面时，可以整理后再导出。' },
        { label: 'PDF 加水印', href: '/pdf/watermark', description: '合并完的 PDF 一键统一加水印，保证每一页都有版权标识。' },
        { label: 'PDF 加密 / 解密', href: '/pdf/encrypt', description: '合并后马上给整份文档加密码，保护合约、内部资料等敏感内容。' },
      ],
      blocks: [
        L('把几份 PDF 合成一份，是办公里最常见的需求之一：求职要把简历和证书合在一起，报销要把十几张发票拼成一份，签约要把合同正文和附件装订起来。大多数在线合并网站都要求你先上传文件，而这些文件恰恰常常包含身份信息、金额和签名。本文用 ToolGarden 的合并 PDF 工具，完整讲一遍不上传文件的合并流程，并重点回答三个容易被忽略的问题：顺序怎么保证、书签和表单会不会丢、合并后怎么确认没有出错。'),
        H2('为什么「不上传」值得认真对待'),
        P('在线合并服务通常的做法是：你的文件上传到服务器，服务器合并后再让你下载。这个过程中，文件会在对方的服务器上停留一段时间，具体多久、是否备份、谁能访问，普通用户无从核实。对一份公开的产品手册这没问题，对下面这些就不合适：'),
        LIST([
          '带身份证号、住址的证件扫描件和签证材料；',
          '含金额、账号的发票、银行流水和财务报表；',
          '尚未签署的合同、内部制度、尚未公开的方案。',
        ]),
        P('本地合并的做法是：文件由浏览器读入内存，合并也在浏览器里用 JavaScript 完成，生成的新文件直接从内存提供下载。验证方式很直接：打开开发者工具，切到 Network 面板，选择文件并点击合并，看有没有携带文件内容的请求发出。页面本身的脚本和样式是静态资源，这是正常的，但你的 PDF 不会出现在任何上传请求中。'),
        CALLOUT('现在就合并', '把需要合并的 PDF 拖进来，拖动列表调整顺序，点击合并。全程在本地完成。', '/pdf/merge', '打开合并 PDF'),
        H2('步骤：用合并 PDF 完成一次合并'),
        LIST([
          '打开合并 PDF，点击上传区域选择多个 PDF，或把它们一起拖进去。每个文件会出现在「合并顺序」列表里，并显示「读取中 / 就绪 / 失败」的状态和页数。',
          '调整顺序：既可以直接拖动列表项，也可以点每一项的「上移」「下移」按钮。读取失败的文件会被标记，且不会参与合并，可以单独移除。',
          '确认至少有两个就绪的文件，页面会显示「N 个文件已就绪」，然后点击「合并 PDF」。',
          '结果区显示合并后的总页数、体积、耗时，并提供预览。翻几页确认无误后点击下载，输出文件名是 merged.pdf。',
        ], true),
        P('第 1 步有一个小窍门：在选择文件之前，先在文件管理器里把文件名加上 01、02、03 这样的序号前缀。很多系统在多选文件时会按文件名顺序传给浏览器，这样初始列表就已经基本正确，你只需要微调。不要依赖这一点，列表顺序始终以界面显示为准。'),
        H2('顺序到底是怎么决定的'),
        P('合并结果的页面顺序完全由列表顺序决定：先把第一个文件的全部页面按原顺序放进去，再放第二个文件的全部页面，以此类推。工具不会对单个文件内部的页面重新排序，也不会按文件名自动排序。这带来两条实用结论：'),
        LIST([
          '想让某个文件的页面插到另一个文件中间，合并工具做不到。这种情况请先用拆分 PDF 把目标文件切成两段，再按「前段、插入文件、后段」的顺序合并；或者合并后用整理 PDF 调整页面顺序。',
          '想调整单个文件内的页面顺序或删除多余页，请先用整理 PDF 处理好那个文件，再放进合并列表。',
        ]),
        H2('实例：把求职材料合成一份 PDF'),
        P('一份求职申请需要：简历 2 页、学历证书扫描 1 页、学位证书扫描 1 页、两篇作品集节选各 6 页和 9 页。要求按这个顺序合成一个文件，并且总页数 19 页。'),
        CODE('text', `列表顺序                       页数
01-简历.pdf                    2
02-学历证书.pdf                1
03-学位证书.pdf                1
04-作品集节选A.pdf             6
05-作品集节选B.pdf             9
----------------------------------
预期合计                       19

合并结果界面应显示：19 页 · 体积 · 耗时
若显示 17 页或 21 页：说明有文件漏选或被重复添加`),
        P('这个页数对账是合并后最便宜、最可靠的检查。体积也可以做粗略的参考：合并结果的体积通常接近各个输入文件体积之和。如果某个文件异常大，说明它里面嵌入了高分辨率图片，值得考虑先压缩。'),
        H2('书签、表单、签名：到底会不会保留'),
        P('这是最多人误解的一点，必须说清楚。合并工具的实现方式是新建一个空白 PDF 文档，把每个源文件的页面复制进去，再保存。页面自身的内容，包括文字、图片、矢量图形、字体、页面尺寸和旋转，都会带过去。但下面这些属于文档级结构，不会自动出现在合并后的文件里：'),
        TABLE(
          ['内容', '合并后', '说明与建议'],
          [
            ['页面文字、图片、矢量图形', '保留', '这是页面本身的内容，会被复制'],
            ['页面尺寸、方向、旋转', '保留', 'A4 和 Letter 混合时不会被统一，各页保持原尺寸'],
            ['书签 / 大纲目录', '不会自动保留', '需要目录时在桌面软件中补做，或用封面页和清晰命名替代'],
            ['可填写的表单域', '不保证保留', '合并后请重新测试能否填写；稳妥做法是先把表单填好再合并'],
            ['文档属性（标题、作者、关键词）', '不会沿用', '合并生成的是新文档，需要时在其他软件里重新设置'],
            ['页面之间的内部链接', '可能失效', '链接目标若在另一个源文件中，合并后无法再指向'],
            ['数字签名', '失效', '任何重新生成文件的操作都会改变文件内容，签名应放在所有处理之后'],
            ['附件', '不会自动保留', '嵌入的附件属于文档级结构'],
          ]
        ),
        P('如果你的文件必须保留书签，比如一本带目录的手册，更合适的做法是用能够合并并保留大纲的桌面 PDF 软件完成。如果只是日常提交材料，没有人会按书签导航，那么合并后的页数与顺序正确就足够了。'),
        H2('合并带密码的 PDF：先解密'),
        P('如果某个源文件设置了打开密码，它在列表里会显示「读取失败」，提示 PDF 可能已损坏或已加密。这是因为合并工具需要读取页面内容，而加密文件在没有密码时无法读取。处理方法：用 PDF 加密 / 解密工具切换到解密模式，输入当前密码得到无密码版本，再加入合并列表。合并完之后，如果整份文档需要保护，再用加密模式统一设置一个新的打开密码。顺序永远是：解密 → 合并 → 加密。'),
        H2('合并之后：水印与加密的顺序'),
        P('合并常常只是整套流程的中间一步。推荐的顺序是整理（处理单个文件）→ 合并 → 加水印 → 加密。水印要放在加密之前，因为加密后的文件对其他工具来说是不可读的。如果你想让整份材料每一页都有统一的「仅供审阅」之类的标记，合并后一次性加水印比在每个文件上分别加要省事，也不会漏页。'),
        CALLOUT('合并后保护文件', '合并完成后，给整份文件设置打开密码，再通过另一条渠道把密码告诉对方。', '/pdf/encrypt', '打开 PDF 加密 / 解密'),
        H2('三种合并方式的对比'),
        TABLE(
          ['维度', '在线上传合并服务', '本地浏览器合并（本工具）', '桌面 PDF 软件'],
          [
            ['文件是否离开电脑', '会，需上传到服务器', '不会，在浏览器内存中处理', '不会'],
            ['是否需要安装', '不需要', '不需要', '需要'],
            ['书签与表单保留', '取决于服务', '页面内容保留，书签和表单不自动保留', '通常可以保留'],
            ['大文件', '受服务限制和网速影响', '受单文件 80 MB 和设备内存影响', '一般更能处理大文件'],
            ['适合场景', '无敏感内容的一次性任务', '日常办公、含敏感信息的材料', '正式归档、需要保留大纲和表单'],
          ]
        ),
        H2('常见问题与排查'),
        TABLE(
          ['现象', '原因', '解决'],
          [
            ['合并按钮是灰色的', '就绪文件少于两个', '至少添加两个能正常读取的 PDF'],
            ['某个文件显示读取失败', '有打开密码，或文件已损坏', '先解密；仍失败则从源头重新导出该文件'],
            ['提示文件过大', '单个文件超过 80 MB', '先压缩或拆分后再合并'],
            ['合并后页数不对', '漏选或重复添加文件', '对照列表逐项核对，并与各文件页数相加'],
            ['合并后某些页面方向不对', '源文件里该页本来就是横向或被旋转', '先用整理 PDF 处理该文件，再合并'],
            ['合并后文件大得离谱', '某个源文件里嵌入了高分辨率图片', '用转图片重新生成较低倍率版本，或在其他软件里压缩'],
            ['浏览器卡顿甚至崩溃', '文件总量太大，内存不足', '分批合并，再把中间结果再合并一次'],
          ]
        ),
        H2('合并后的七项检查清单'),
        LIST([
          '总页数等于各文件页数之和。',
          '第一页是封面或你期望的开头，最后一页是结尾。',
          '每两个文件的交界处，翻一下前一个文件的最后一页和后一个文件的第一页，确认没有错位。',
          '页面方向正确，没有倒置的扫描页。',
          '需要的话检查体积是否符合上传或邮件限制。',
          '用另一个阅读器打开一次，排除某个阅读器的渲染差异。',
          '如果需要加水印或密码，确认顺序是先水印后加密。',
        ], true),
        H2('什么时候不该用这个方法'),
        LIST([
          '需要保留目录书签、可填表单或带结构树的无障碍文档；',
          '含有需要保持有效的数字签名的文件；',
          '合并后总量超过设备内存可承受的范围，例如几百兆的扫描合集；',
          '需要把页面插在某个文件中间：请先拆分再合并，或合并后用整理 PDF 重排。',
        ]),
      ],
      faq: [
        { question: '不上传文件也能合并 PDF 吗？', answer: '可以。ToolGarden 的合并 PDF 在浏览器里读取文件并完成合并，结果直接在本地生成下载。你可以在开发者工具的 Network 面板里确认处理过程中没有携带文件内容的上传请求。' },
        { question: '合并后的页面顺序由什么决定？', answer: '完全由列表顺序决定：先放第一个文件的全部页面，再放第二个文件的全部页面。你可以拖动列表项，也可以点上移、下移调整。工具不会按文件名自动排序。' },
        { question: '合并后书签还在吗？', answer: '不会自动保留。工具新建一个文档并复制页面，页面内容会保留，但书签、表单域定义、文档属性和附件属于文档级结构，不会自动带入。需要目录时请用桌面 PDF 软件补充。' },
        { question: '带密码的 PDF 能合并吗？', answer: '需要先解密。加密文件在合并工具中会显示读取失败。请先用 PDF 加密 / 解密的解密模式得到无密码版本，合并后再重新加密。' },
        { question: '怎么确认合并结果没有漏页？', answer: '核对页数：合并结果显示的总页数应等于所有源文件页数之和。再检查文件交界处的页面和首尾页，最后用另一个阅读器打开确认。' },
        { question: '合并对文件大小有限制吗？', answer: '单个 PDF 超过 80 MB 会被拒绝。实际能处理的总量还取决于设备内存，文件很多或很大时建议分批合并。' },
      ],
    },
    en: {
      title: 'How to Merge Multiple PDFs Without Uploading: Keep Order and Check Bookmarks and Page Counts',
      excerpt: 'Need to combine contracts, CVs, invoices, or scans into one PDF without handing them to a stranger\'s server? Learn the local merge steps, ordering, what happens to bookmarks and forms, and a post-merge checklist.',
      metaTitle: 'Merge PDFs Without Uploading: Local Merge Guide',
      metaDescription: 'Merge PDFs in your browser with no upload: drag to reorder, verify page counts, know what happens to bookmarks and forms, and run a checklist.',
      readingTime: '11 min read',
      tags: ['merge PDF', 'PDF order', 'PDF bookmarks', 'PDF tools'],
      relatedTools: [
        { label: 'Merge PDF', href: '/pdf/merge', description: 'Upload multiple PDFs, reorder them, and merge them into one document.' },
        { label: 'Organize PDF', href: '/pdf/organize', description: 'Reorder, duplicate, or delete pages before exporting a new PDF.' },
        { label: 'PDF Watermark', href: '/pdf/watermark', description: 'Apply a uniform watermark to the merged PDF so every page carries the same mark.' },
        { label: 'PDF Encrypt / Decrypt', href: '/pdf/encrypt', description: 'Encrypt the merged document to protect contracts or internal materials.' },
      ],
      blocks: [
        L('Combining several PDFs into one is among the most common office tasks: a job application joins a CV and certificates, an expense claim stitches a dozen receipts together, a signing packet binds a contract to its attachments. Most online merge sites make you upload the files first, and those files often hold identity details, amounts, and signatures. This article walks through a no-upload merge with ToolGarden\'s Merge PDF tool and focuses on three questions people overlook: how the order is decided, whether bookmarks and forms survive, and how to confirm nothing went wrong.'),
        H2('Why "no upload" deserves attention'),
        P('An online merge service typically takes your files to its server, merges them there, and lets you download the result. During that time your files sit on someone else\'s machine, and an ordinary user cannot verify how long they stay, whether they are backed up, or who can reach them. That is fine for a public product brochure. It is not fine for:'),
        LIST([
          'ID scans and visa documents with identity numbers and addresses;',
          'Receipts, bank statements, and financial reports with amounts and account numbers;',
          'Unsigned contracts, internal policies, and unpublished proposals.',
        ]),
        P('Local merging works differently: the browser reads the files into memory, the merge runs in JavaScript in the same page, and the new file is offered as a download straight from memory. Verification is simple: open the developer tools, go to the Network panel, choose files and click merge, and see whether any request carrying file contents goes out. The page\'s own scripts and styles are static assets and appear normally, but your PDFs do not appear in any upload request.'),
        CALLOUT('Merge now', 'Drop in the PDFs, drag the list into order, and click merge. It all happens locally.', '/pdf/merge', 'Open Merge PDF'),
        H2('Steps: running one merge'),
        LIST([
          'Open Merge PDF and click the upload area to choose several PDFs, or drop them all at once. Each file appears in the merge-order list with a status of reading, ready, or failed, and its page count.',
          'Adjust the order: drag list items, or use the move up and move down buttons on each row. A file that fails to read is flagged and does not take part in the merge; you can remove it.',
          'Make sure at least two files are ready; the page shows how many files are ready. Then click Merge PDF.',
          'The result area shows the merged page count, size, and time, with a preview. Flip through a few pages, then download. The output file is named merged.pdf.',
        ], true),
        P('A trick for step 1: before choosing files, prefix the names with 01, 02, 03 in your file manager. Many systems hand files to the browser in name order during multi-select, so the initial list is already mostly right and you only fine-tune it. Do not rely on it, though; the order shown in the interface is what counts.'),
        H2('How the order is actually decided'),
        P('The merged page order is determined entirely by the list order: all pages of the first file in their original order, then all pages of the second, and so on. The tool does not reorder pages inside a file and does not sort files by name. Two practical consequences:'),
        LIST([
          'Inserting one file\'s pages into the middle of another is not something the merge tool can do. Split the target file into two parts with Split PDF and merge in the order first part, inserted file, second part; or merge, then reorder pages with Organize PDF.',
          'To reorder pages inside one file or drop surplus ones, clean up that file with Organize PDF first, then put it in the merge list.',
        ]),
        H2('Example: a job application in one PDF'),
        P('An application needs a 2-page CV, a 1-page degree transcript scan, a 1-page diploma scan, and two portfolio extracts of 6 and 9 pages. They must be merged in that order into one file of 19 pages.'),
        CODE('text', `List order                     Pages
01-cv.pdf                      2
02-transcript.pdf              1
03-diploma.pdf                 1
04-portfolio-A.pdf             6
05-portfolio-B.pdf             9
----------------------------------
Expected total                 19

The merge result should show: 19 pages · size · time
If it shows 17 or 21: a file was missed or added twice`),
        P('That page count reconciliation is the cheapest and most reliable check after a merge. Size is a rough guide too: the merged size is usually close to the sum of the inputs. If one file is unusually large, it probably holds high-resolution images and may be worth compressing first.'),
        H2('Bookmarks, forms, signatures: what survives'),
        P('This is the most misunderstood point, so it needs plain language. The merge tool creates a blank PDF document, copies each source file\'s pages into it, and saves. The content of the pages themselves, meaning text, images, vector graphics, fonts, page size, and rotation, comes across. The following are document-level structures and do not automatically appear in the merged file:'),
        TABLE(
          ['Item', 'After merge', 'Notes and advice'],
          [
            ['Page text, images, vector graphics', 'Kept', 'This is page content and it is copied'],
            ['Page size, orientation, rotation', 'Kept', 'A4 and Letter mixed together are not normalized; each page keeps its size'],
            ['Bookmarks / outline', 'Not kept automatically', 'Add them in desktop software if needed, or use a cover page and clear naming instead'],
            ['Fillable form fields', 'Not guaranteed', 'Test after merging; the safe approach is to fill the form first, then merge'],
            ['Document properties (title, author, keywords)', 'Not inherited', 'The merged result is a new document; set them elsewhere if needed'],
            ['Internal links between pages', 'May break', 'If a link target lives in another source file it can no longer point there'],
            ['Digital signatures', 'Invalidated', 'Any step that regenerates the file changes its content; sign last'],
            ['Embedded attachments', 'Not kept automatically', 'Attachments are document-level structures'],
          ]
        ),
        P('If your file must keep bookmarks, such as a manual with a table of contents, a desktop PDF application that merges and preserves outlines is the better route. For everyday submissions nobody navigates by bookmark, and correct page count and order are what matter.'),
        H2('Merging a password-protected PDF: decrypt first'),
        P('If a source file has an open password, it shows as failed to read in the list, with the message that the PDF may be damaged or encrypted. The merge tool has to read the page content, and an encrypted file cannot be read without its password. The fix: switch the PDF Encrypt / Decrypt tool to decrypt mode, enter the current password to get a password-free copy, then add that copy to the merge list. After merging, if the whole document needs protection, use encrypt mode to set one new open password. The order is always decrypt, merge, encrypt.'),
        H2('After merging: watermark and encryption order'),
        P('Merging is often a middle step. The recommended order is organize (per file), merge, watermark, encrypt. The watermark goes before encryption because an encrypted file is unreadable to the other tools. If every page of the packet should carry a uniform mark such as "for review only", watermarking once after the merge is easier than marking each file, and it cannot miss a page.'),
        CALLOUT('Protect the merged file', 'After merging, set an open password on the whole document and share the password over a different channel.', '/pdf/encrypt', 'Open PDF Encrypt / Decrypt'),
        H2('Three ways to merge, compared'),
        TABLE(
          ['Aspect', 'Online upload service', 'Local browser merge (this tool)', 'Desktop PDF software'],
          [
            ['Does the file leave your computer', 'Yes, uploaded to a server', 'No, processed in browser memory', 'No'],
            ['Installation', 'None', 'None', 'Required'],
            ['Bookmarks and forms', 'Depends on the service', 'Page content kept; bookmarks and forms not automatic', 'Usually preserved'],
            ['Large files', 'Limited by service and bandwidth', 'Limited by 80 MB per file and device memory', 'Usually handles large files better'],
            ['Best for', 'One-off jobs with nothing sensitive', 'Everyday office work, material with sensitive details', 'Formal archives needing outlines and forms'],
          ]
        ),
        H2('Common problems and diagnosis'),
        TABLE(
          ['Symptom', 'Cause', 'Fix'],
          [
            ['Merge button is greyed out', 'Fewer than two files are ready', 'Add at least two PDFs that read correctly'],
            ['One file shows as failed', 'It has an open password, or is damaged', 'Decrypt it first; if it still fails, re-export it from the source'],
            ['File too large message', 'A single file exceeds 80 MB', 'Compress or split it before merging'],
            ['Page count is wrong after merging', 'A file was missed or added twice', 'Check the list row by row and add up the per-file page counts'],
            ['Some pages are the wrong way up', 'They were landscape or rotated in the source', 'Fix that file in Organize PDF first, then merge'],
            ['Merged file is huge', 'A source file holds high-resolution images', 'Regenerate it at a lower scale through image export, or compress it elsewhere'],
            ['The browser stutters or crashes', 'Total volume is too large for memory', 'Merge in batches, then merge the intermediate results'],
          ]
        ),
        H2('A seven-point checklist after merging'),
        LIST([
          'The total page count equals the sum of the source files\' page counts.',
          'The first page is the cover or opening you expect, and the last page is the ending.',
          'At each boundary between two files, look at the last page of the earlier file and the first page of the next to confirm nothing slipped.',
          'Page orientation is right, and no scanned page is upside down.',
          'If there is an upload or email limit, check the size against it.',
          'Open the file once in a different reader to rule out one reader\'s rendering quirk.',
          'If you need a watermark or password, confirm the order is watermark first, encryption last.',
        ], true),
        H2('When not to use this approach'),
        LIST([
          'You need to keep a bookmark outline, fillable forms, or an accessibility structure tree;',
          'The files include digital signatures that must stay valid;',
          'The combined volume exceeds what your device memory can take, for example scan collections of hundreds of megabytes;',
          'You need to insert pages into the middle of a file: split it first and merge in pieces, or merge and then reorder in Organize PDF.',
        ]),
      ],
      faq: [
        { question: 'Can I merge PDFs without uploading them?', answer: 'Yes. ToolGarden\'s Merge PDF reads the files and merges them in your browser, and the result is generated locally for download. The developer tools Network panel will show no request carrying file contents while it runs.' },
        { question: 'What decides the page order after merging?', answer: 'Only the list order: all pages of the first file, then all pages of the second, and so on. Drag items or use move up and move down to adjust. The tool does not sort by file name.' },
        { question: 'Do bookmarks survive a merge?', answer: 'Not automatically. The tool creates a new document and copies pages, so page content stays, but bookmarks, form field definitions, document properties, and attachments are document-level structures and are not carried over. Add an outline in desktop PDF software if you need one.' },
        { question: 'Can I merge a password-protected PDF?', answer: 'Decrypt it first. An encrypted file shows as failed to read in the merge tool. Use the decrypt mode of PDF Encrypt / Decrypt to get a password-free copy, merge, then encrypt again.' },
        { question: 'How do I confirm no pages were lost?', answer: 'Compare page counts: the merged total should equal the sum of the source files. Then check the pages at file boundaries and the first and last pages, and open the result in a second reader.' },
        { question: 'Is there a size limit for merging?', answer: 'A single PDF over 80 MB is rejected. The total you can handle also depends on device memory, so with many or very large files, merge in batches.' },
      ],
    },
  },
};
const passwordProtectPdf: BlogArticle = {
  slug: 'password-protect-pdf-without-upload',
  publishedAt: '2026-07-27',
  updatedAt: '2026-10-14',
  translations: {
    zh: {
      title: '如何给 PDF 加密码保护（不上传文件）：设置、移除与权限限制',
      excerpt: '合同、证件、财务报表要发给别人，又怕被转发泄露？在浏览器本地给 PDF 设置打开密码、限制打印和复制，也能移除已有密码，文件不离开你的电脑。',
      metaTitle: 'PDF 加密码保护：浏览器本地加密不上传',
      metaDescription: '在浏览器本地给 PDF 设置打开密码、移除密码、限制打印和复制。讲清用户密码与所有者密码的区别、加密强度、常见错误，文件不上传。',
      readingTime: '12 分钟',
      tags: ['PDF', '加密', '密码保护', '隐私', '文档安全'],
      relatedTools: [
        { label: 'PDF 加密 / 解密', href: '/pdf/encrypt', description: '在浏览器本地为 PDF 设置或移除打开密码，并可限制打印、复制等权限。' },
        { label: 'PDF 加水印', href: '/pdf/watermark', description: '给整份 PDF 加上文字水印，配合密码进一步标记文档归属。' },
        { label: '合并 PDF', href: '/pdf/merge', description: '先合并成一份，再统一加密，比逐个加密更省事。' },
        { label: '整理 PDF', href: '/pdf/organize', description: '加密前删除不该给对方看的页面。' },
      ],
      blocks: [
        L('最需要加密码的 PDF——合同、身份证件、银行流水、病历、尚未发布的方案——恰恰是最不该上传到陌生服务器的那一批。很多「在线 PDF 加密」网站要求你先上传文件，等于为了保护文件，先把它交给了第三方。本文介绍如何用 ToolGarden 的 PDF 加密 / 解密工具，在浏览器里完成设置密码、移除密码和限制权限，文件始终留在你的电脑上。同时会讲清楚几个关键概念：打开密码和所有者密码的区别、权限限制到底能防什么、加密强度取决于什么，以及忘记密码怎么办。'),
        H2('先弄清楚：PDF 加密到底保护什么'),
        P('PDF 的标准加密里有两种密码，作用完全不同：'),
        TABLE(
          ['概念', '别名', '作用', '没有它会怎样'],
          [
            ['打开密码', '用户密码（user password）', '打开文档时必须输入，否则内容无法读取', '无法查看页面，这是真正挡住陌生人的那一道锁'],
            ['所有者密码', '权限密码（owner password）', '用来修改权限设置本身', '文件可以打开，但打印、复制、修改等行为受限于权限标记'],
            ['权限标记', '打印 / 复制 / 修改 / 批注', '声明文件允许哪些操作', '由阅读器自觉遵守，并非不可破解的保护'],
          ]
        ),
        P('最后一行是最容易被误解的地方。权限限制只是写在文件里的声明，遵守规范的阅读器会照做，比如灰掉「打印」按钮，但并不是所有软件都会遵守，也有专门的工具可以忽略这些标记。所以：想要防止陌生人阅读，靠的是打开密码；想要「提醒」对方不要随意复制、修改，才使用权限限制，不要把它当作安全措施。'),
        H2('步骤：给 PDF 设置打开密码'),
        LIST([
          '打开 PDF 加密 / 解密，保持在「加密」模式。点击上传区域选择 PDF，或把文件拖进去。',
          '在「打开密码」中输入密码。这一项是必填的，没有它「加密并下载」按钮是灰色的。',
          '「所有者密码」是可选的。留空时，工具会让所有者密码与打开密码相同；如果你希望持有一个独立的管理密码，可以单独填写。',
          '在「权限」里勾选允许的操作：允许打印、允许复制文本、允许修改、允许批注。默认是允许打印和复制，不允许修改和批注。',
          '点击「加密并下载」。文件在本地处理，完成后出现下载链接，文件名是「原文件名-encrypted.pdf」。',
        ], true),
        CALLOUT('现在就加密', '上传 PDF，输入打开密码，选择需要限制的权限，点击加密并下载。文件不会离开浏览器。', '/pdf/encrypt', '打开 PDF 加密 / 解密'),
        H2('步骤：移除已有密码'),
        P('如果你收到一份带密码的 PDF，并且知道密码，想要一份不再需要密码的副本（方便合并、拆分，或自己归档）：'),
        LIST([
          '切换到「解密」模式，上传加密的 PDF。',
          '在「当前密码」里输入已知的密码。',
          '点击「解密并下载」，得到「原文件名-decrypted.pdf」。',
        ], true),
        P('有两点要知道。第一，这个功能用来移除你本来就有权使用的密码，也就是你知道密码的文件；它不是破解工具，也不可能帮你找回忘记的密码。第二，工具在密码校验失败时会尝试用另一种方式读取文件，只有两种方式都失败才会提示「密码错误或无法解密」。所以如果你输入了错误的密码却得到了输出文件，请务必打开确认内容是否正常，不要想当然地认为解密成功。'),
        H2('加密强度取决于什么'),
        P('这一节是大多数教程不会讲、但值得知道的事实。PDF 的加密算法有多个版本，从古老的 40 位 RC4 到 128 位 RC4、128 位 AES，再到 256 位 AES。我们查看了站点所使用的 PDF 加密库的源码（@cantoo/pdf-lib 2.7.1），它是根据被加密文件头部声明的 PDF 版本来选择算法的：'),
        TABLE(
          ['源文件头部版本', '使用的算法（据该库实现）', '评价'],
          [
            ['PDF 1.4、1.5', 'RC4 128 位', '强度一般，RC4 已不被推荐'],
            ['PDF 1.6、1.7', 'AES 128 位', '日常保密足够，多数阅读器兼容'],
            ['1.7 扩展级别 3', 'AES 256 位', '最强，但少数老旧阅读器不支持'],
            ['其他（如 1.3 及更低）', 'RC4 40 位', '很弱，不建议用于敏感文件'],
          ]
        ),
        P('这意味着：同样是点「加密并下载」，不同来源的文件最终采用的算法可能不同，界面上并不会告诉你。实用的建议有两条。其一，经过合并 PDF、整理 PDF 等工具输出的文件是新创建的文档，文件头部是 1.7，随后再加密会落在 AES 128 位这一档。如果你拿到的是一份很老的、版本号很低的 PDF，可以先用整理 PDF 原样导出一次，再加密。其二，加密后在阅读器里打开「文档属性」，查看「安全」或「加密」一栏，确认实际使用的算法。这一步只需要十几秒，但能避免你以为加密了、实际强度却很弱的情况。'),
        H2('实例：把一份报价合同安全地发给客户'),
        P('一份 12 页的合同和一份 3 页的报价单，需要发给客户。目标：客户能打开、能打印，但不应该被轻易编辑；同时文件在邮件传输途中被他人截获也读不了。'),
        CODE('text', `1 合并 PDF：contract.pdf (12 页) + quote.pdf (3 页) -> merged.pdf (15 页)
2 PDF 加水印：文字 CONFIDENTIAL，对角布局，透明度 0.2 -> merged-watermarked.pdf
3 PDF 加密：
     打开密码        ：自己生成的长口令（见下文）
     所有者密码      ：另设一个，自己保管
     允许打印        ：勾选
     允许复制文本    ：不勾选
     允许修改        ：不勾选
     允许批注        ：不勾选
   -> merged-watermarked-encrypted.pdf（15 页）
4 发送：文件走邮件，打开密码通过电话或即时消息告知`),
        P('顺序很关键：加密永远放在最后。加密后的文件需要密码才能读取，合并、拆分、水印这些工具拿不到密码，会提示文件无法读取。步骤 4 也值得强调：把文件和密码放在同一封邮件里，等于没加密。'),
        H2('怎样设置一个好密码'),
        LIST([
          '长度优先于复杂度：一句由四五个不相关单词组成的口令，通常比 8 位带符号的短密码更难猜，也更容易记住。',
          '不要使用生日、手机号、公司名这类能被社工推出来的信息。',
          '不要在多个文件、多个服务之间重复使用同一个密码。',
          '用密码管理器生成并保存，同时交付时通过另一条渠道。',
          '工具不会保存你的密码，也没有「找回密码」功能：忘记了就无法再打开，所以请确保备份了密码，或者保留一份未加密的原件在安全位置。',
        ]),
        H2('加密 vs 其他保护方式'),
        TABLE(
          ['方式', '防什么', '不防什么', '适用'],
          [
            ['PDF 打开密码', '陌生人打开阅读', '拿到密码的人转发、截图', '发给特定对象的敏感文件'],
            ['权限限制', '一般用户随手复制、打印、编辑', '专门工具会忽略标记', '提醒性质，不是安全措施'],
            ['水印', '追溯来源、提示机密性', '不能阻止阅读或复制', '配合密码使用，标记归属'],
            ['压缩包加密码', '传输中被读取', '解压后文件本身无保护', '一次性传输多个文件'],
            ['链接加访问控制的网盘', '未授权访问', '依赖网盘服务本身', '协作场景'],
          ]
        ),
        H2('常见问题与排查'),
        TABLE(
          ['现象', '原因', '解决'],
          [
            ['「加密并下载」按钮是灰色的', '没有选文件，或打开密码为空', '上传文件并输入打开密码'],
            ['加密时报错', '源文件已经有密码，或结构损坏', '先在解密模式下去掉原密码，再重新加密'],
            ['解密提示密码错误', '输入的密码不对', '核对大小写、输入法状态；工具无法找回密码'],
            ['加密后的文件在合并、拆分工具里读取失败', '加密文件需要密码才能读取', '先解密，处理完后重新加密'],
            ['对方仍能复制文字', '你勾选了允许复制，或对方的软件忽略权限标记', '取消勾选只能起提醒作用；真正保密靠打开密码'],
            ['某些老旧阅读器打不开', '使用了较新的算法', '换一个更新的阅读器，或确认实际算法后再决定'],
            ['文件加密后体积略有变化', '加密会重写文件结构', '属于正常现象'],
          ]
        ),
        H2('关于文档结构：加密后书签和表单还在吗'),
        P('与合并、拆分不同，加密工具是载入原文档、设置加密、再保存同一个文档，而不是把页面复制到新文档里，所以书签、表单域等文档级结构通常能保留。不过这依赖于库对具体文件的解析，我们建议对重要文件在加密后实际检查：书签是否还在、表单能否填写、文件在目标阅读器里显示是否正常。'),
        H2('什么时候不该依赖这种加密'),
        LIST([
          '需要符合合规要求（比如特定行业对加密算法和密钥管理的要求）：请使用经过认证的企业级方案，并核实具体的算法。',
          '密码要和文件同时交给不受信任的对象：这时加密没有意义。',
          '希望用权限限制阻止对方复制内容：它做不到，只能提示。',
          '文件已含有有效数字签名：重新保存文件可能影响签名，签名应在加密流程之外单独验证。',
          '极大的文件：加密在浏览器内存里完成，文件越大越吃内存，建议先拆分。',
        ]),
        CALLOUT('给整份材料统一标记', '加密前，可以先给每一页加上英文水印，标明保密级别或接收方。', '/pdf/watermark', '打开 PDF 加水印'),
        H2('隐私说明'),
        P('整个加密和解密过程都在浏览器里进行：文件和你输入的密码都不会被发送到服务器。验证方法依然是开发者工具的 Network 面板：操作期间不会出现携带文件或密码的请求。需要提醒的是，本地处理保证的是传输环节没有第三方参与，并不等于文件本身变得无懈可击；决定安全性的仍然是密码强度、加密算法以及你如何把密码交给对方。'),
      ],
      faq: [
        { question: 'PDF 加密码为什么最好不要上传到网站？', answer: '因为上传意味着文件离开了你的电脑，在对方服务器上保留多久、是否备份、谁能访问都无法核实。合同、证件、财务类文件应在本地加密。' },
        { question: '打开密码和所有者密码有什么区别？', answer: '打开密码决定能否打开文档，是真正挡住陌生人的一层；所有者密码用来管理权限设置，如打印、复制、修改。工具中所有者密码可留空，留空时沿用打开密码。' },
        { question: '限制复制和打印真的能防止别人复制吗？', answer: '不能保证。权限限制只是写入文件的声明，遵守规范的阅读器会执行，但有些软件会忽略它们。需要保密请依赖打开密码，把权限限制当作提醒。' },
        { question: 'PDF 加密强度是多少？', answer: '取决于源文件头部的 PDF 版本：据站点所用加密库（@cantoo/pdf-lib 2.7.1）的实现，1.4/1.5 使用 128 位 RC4，1.6/1.7 使用 128 位 AES，更低版本为 40 位 RC4。建议加密后在阅读器的文档属性里确认。' },
        { question: '忘记密码还能恢复吗？', answer: '不能。工具不保存密码，也没有找回功能，解密需要你输入正确的密码。请把密码存在密码管理器里，并保留一份安全的未加密原件。' },
        { question: '加密后的 PDF 还能合并或拆分吗？', answer: '不能直接处理。加密文件需要密码才能读取，其他工具会提示无法读取。先用解密模式得到无密码副本，处理完再重新加密。' },
      ],
    },
    en: {
      title: 'How to Password-Protect a PDF Without Uploading It: Set, Remove, and Restrict',
      excerpt: 'Sending a contract, ID, or financial report and worried about it spreading? Set an open password, restrict printing and copying, or remove an existing password, all in your browser with no upload.',
      metaTitle: 'Password-Protect a PDF in Your Browser, No Upload',
      metaDescription: 'Set or remove a PDF password and restrict printing and copying in your browser. Open vs owner password, real encryption strength, common errors.',
      readingTime: '11 min read',
      tags: ['PDF', 'encryption', 'password protection', 'privacy', 'document security'],
      relatedTools: [
        { label: 'PDF Encrypt / Decrypt', href: '/pdf/encrypt', description: 'Set or remove a PDF open password locally in your browser, and restrict printing and copying.' },
        { label: 'PDF Watermark', href: '/pdf/watermark', description: 'Add a text watermark across a whole PDF to mark ownership alongside a password.' },
        { label: 'Merge PDF', href: '/pdf/merge', description: 'Merge into one file first, then encrypt once instead of file by file.' },
        { label: 'Organize PDF', href: '/pdf/organize', description: 'Delete pages the recipient should not see before encrypting.' },
      ],
      blocks: [
        L('The PDFs that most need a password, such as contracts, IDs, bank statements, medical records, and unpublished proposals, are exactly the ones you should least upload to an unknown server. Many online PDF encryption sites ask you to upload the file first, which means handing it to a third party in order to protect it. This article shows how to set a password, remove a password, and restrict permissions with ToolGarden\'s PDF Encrypt / Decrypt tool inside the browser, with the file staying on your computer. It also clarifies a few key ideas: the difference between the open password and the owner password, what permission restrictions can and cannot prevent, what determines encryption strength, and what to do if you forget a password.'),
        H2('First, what PDF encryption actually protects'),
        P('Standard PDF encryption involves two kinds of password with entirely different jobs:'),
        TABLE(
          ['Concept', 'Also called', 'Purpose', 'Without it'],
          [
            ['Open password', 'User password', 'Must be entered to open the document, otherwise the content cannot be read', 'You cannot view the pages; this is the lock that actually keeps strangers out'],
            ['Owner password', 'Permissions password', 'Used to change the permission settings themselves', 'The file opens, but printing, copying, modifying follow the permission flags'],
            ['Permission flags', 'Print / copy / modify / annotate', 'Declare which actions the file allows', 'Left to readers to honor; not unbreakable protection'],
          ]
        ),
        P('The last row is the most misunderstood. Permission restrictions are declarations stored in the file. Well-behaved readers obey them, for example by greying out Print, but not all software does, and some tools deliberately ignore them. So to stop strangers reading, rely on the open password. Use permission restrictions only as a nudge against casual copying or editing, never as a security measure.'),
        H2('Steps: set an open password'),
        LIST([
          'Open PDF Encrypt / Decrypt and stay in Encrypt mode. Click the upload area to choose a PDF, or drop the file on it.',
          'Enter a password under Open password. It is required: the Encrypt & download button stays greyed out without it.',
          'Owner password is optional. If left empty, the tool makes the owner password the same as the open password; fill it in if you want a separate management password.',
          'Under Permissions, tick what is allowed: allow printing, allow copying text, allow modifying, allow annotations. The defaults allow printing and copying, and disallow modifying and annotating.',
          'Click Encrypt & download. The file is processed locally, a download link appears, and the file is named original-name-encrypted.pdf.',
        ], true),
        CALLOUT('Encrypt now', 'Upload a PDF, enter an open password, choose the permissions to restrict, and click Encrypt & download. The file never leaves the browser.', '/pdf/encrypt', 'Open PDF Encrypt / Decrypt'),
        H2('Steps: remove an existing password'),
        P('If you received a password-protected PDF, you know the password, and you want a copy that no longer needs one (to merge, split, or archive it):'),
        LIST([
          'Switch to Decrypt mode and upload the encrypted PDF.',
          'Enter the known password under Current password.',
          'Click Decrypt & download to get original-name-decrypted.pdf.',
        ], true),
        P('Two things to know. First, this is for removing a password you are entitled to use, meaning a file whose password you know. It is not a cracking tool and cannot recover a forgotten password. Second, when the password check fails, the tool tries to read the file another way and only reports "wrong password or the PDF cannot be decrypted" if both attempts fail. So if you typed a wrong password and still got an output file, open it and confirm the content is normal rather than assuming decryption worked.'),
        H2('What determines encryption strength'),
        P('This is a fact most tutorials skip. PDF encryption has several generations, from ancient 40-bit RC4 through 128-bit RC4 and 128-bit AES, up to 256-bit AES. We read the source of the PDF encryption library the site uses (@cantoo/pdf-lib 2.7.1), and it picks the algorithm from the PDF version declared in the header of the file being encrypted:'),
        TABLE(
          ['Header version of the source file', 'Algorithm used (per that library)', 'Assessment'],
          [
            ['PDF 1.4, 1.5', '128-bit RC4', 'Mediocre; RC4 is no longer recommended'],
            ['PDF 1.6, 1.7', '128-bit AES', 'Adequate for everyday confidentiality, widely compatible'],
            ['1.7 extension level 3', '256-bit AES', 'Strongest, but a few old readers do not support it'],
            ['Anything else (such as 1.3 and below)', '40-bit RC4', 'Very weak; avoid for sensitive files'],
          ]
        ),
        P('In other words, the same click on Encrypt & download can end up with different algorithms for different source files, and the interface does not tell you which. Two practical tips. First, a file produced by tools such as Merge PDF or Organize PDF is a newly created document with a 1.7 header, so encrypting it afterwards lands in the 128-bit AES row. If you are handed a very old, low-version PDF, run it through Organize PDF once and export it unchanged, then encrypt that. Second, after encrypting, open the document properties in a reader and look at the Security or Encryption entry to confirm the algorithm actually used. It takes ten seconds and saves you from thinking a file is well protected when it is weakly protected.'),
        H2('Example: sending a quote and contract to a client'),
        P('A 12-page contract and a 3-page quote go to a client. The goal: the client can open and print them but should not edit them casually, and the file cannot be read if someone intercepts the email.'),
        CODE('text', `1 Merge PDF: contract.pdf (12 pages) + quote.pdf (3 pages) -> merged.pdf (15 pages)
2 PDF Watermark: text CONFIDENTIAL, diagonal, opacity 0.2 -> merged-watermarked.pdf
3 PDF Encrypt:
     Open password    : a long passphrase you generated (see below)
     Owner password   : a different one, kept by you
     Allow printing   : ticked
     Allow copying    : unticked
     Allow modifying  : unticked
     Allow annotations: unticked
   -> merged-watermarked-encrypted.pdf (15 pages)
4 Send: the file by email, the open password by phone or instant message`),
        P('The order matters: encryption always goes last. An encrypted file needs its password to be read, and the merge, split, and watermark tools cannot supply one, so they report that the file cannot be read. Step 4 deserves emphasis too: putting the file and its password in the same email is the same as not encrypting.'),
        H2('Choosing a good password'),
        LIST([
          'Length beats complexity: a passphrase of four or five unrelated words is usually harder to guess than a short 8-character password with symbols, and easier to remember.',
          'Avoid birthdays, phone numbers, and company names, which social engineering can infer.',
          'Do not reuse one password across files or services.',
          'Generate and store it in a password manager, and deliver it through a separate channel.',
          'The tool does not store your password and has no recovery feature: if you forget it, the file cannot be opened again. Back up the password or keep an unencrypted original somewhere safe.',
        ]),
        H2('Encryption versus other protections'),
        TABLE(
          ['Method', 'Protects against', 'Does not protect against', 'Fits'],
          [
            ['PDF open password', 'Strangers opening and reading', 'Someone with the password forwarding or screenshotting', 'Sensitive files sent to specific people'],
            ['Permission restrictions', 'Casual copying, printing, editing', 'Tools that ignore the flags', 'A reminder, not a security measure'],
            ['Watermark', 'Tracing a leak, signalling confidentiality', 'Reading or copying', 'Combine with a password to mark ownership'],
            ['Password-protected archive', 'Reading in transit', 'The file itself once extracted', 'Sending several files once'],
            ['Cloud drive with access control', 'Unauthorized access', 'Depends on the drive provider', 'Collaboration'],
          ]
        ),
        H2('Common problems and diagnosis'),
        TABLE(
          ['Symptom', 'Cause', 'Fix'],
          [
            ['Encrypt & download is greyed out', 'No file chosen, or the open password is empty', 'Upload a file and enter an open password'],
            ['An error while encrypting', 'The source already has a password, or is damaged', 'Remove the old password in Decrypt mode, then encrypt again'],
            ['Decrypt says wrong password', 'The password is not correct', 'Check case and input method; the tool cannot recover passwords'],
            ['An encrypted file fails to load in merge or split', 'Encrypted files need a password to be read', 'Decrypt first, process, then encrypt again'],
            ['The recipient can still copy text', 'You allowed copying, or their software ignores the flags', 'Unticking only acts as a nudge; real secrecy comes from the open password'],
            ['An old reader cannot open it', 'A newer algorithm was used', 'Use a newer reader, or confirm the actual algorithm before deciding'],
            ['File size changes slightly after encryption', 'Encryption rewrites the file structure', 'Normal'],
          ]
        ),
        H2('Document structure: do bookmarks and forms survive encryption?'),
        P('Unlike merge and split, the encryption tool loads the original document, applies encryption, and saves that same document, rather than copying pages into a new one. Bookmarks, form fields, and other document-level structures should therefore usually survive. That still depends on how the library parses a particular file, so for important files check the result: are bookmarks still there, can forms be filled, does the file display correctly in the reader your recipient will use.'),
        H2('When not to rely on this kind of encryption'),
        LIST([
          'You need regulatory compliance, such as a particular industry\'s requirements on algorithms and key management: use a certified enterprise solution and verify the exact algorithm.',
          'The password will be handed over together with the file to someone you do not trust: encryption means nothing then.',
          'You hope permission flags will stop the recipient copying: they cannot, they only signal intent.',
          'The file contains a valid digital signature: re-saving can affect it, so verify signatures separately from this workflow.',
          'Very large files: encryption runs in browser memory, so the larger the file the heavier it is; split it first.',
        ]),
        CALLOUT('Mark the whole packet', 'Before encrypting, stamp each page with an English watermark showing the confidentiality level or recipient.', '/pdf/watermark', 'Open PDF Watermark'),
        H2('Privacy'),
        P('Both encrypting and decrypting happen in the browser: neither the file nor the password you type is sent to a server. You can verify it in the developer tools Network panel, where no request carrying the file or the password appears during the operation. A reminder, though: local processing guarantees that no third party is involved in transit, not that the file becomes unbreakable. Security is still decided by password strength, the encryption algorithm, and how you pass the password to the recipient.'),
      ],
      faq: [
        { question: 'Why should I avoid uploading a PDF to a website to password-protect it?', answer: 'Uploading means the file leaves your computer, and you cannot verify how long the server keeps it, whether it is backed up, or who can access it. Contracts, IDs, and financial files should be encrypted locally.' },
        { question: 'What is the difference between the open password and the owner password?', answer: 'The open password decides whether the document can be opened, and it is the layer that keeps strangers out. The owner password manages permission settings such as printing, copying, and modifying. In this tool the owner password can be left empty, in which case it reuses the open password.' },
        { question: 'Do copy and print restrictions really stop people copying?', answer: 'Not reliably. They are declarations stored in the file; well-behaved readers honor them but some software ignores them. Rely on the open password for secrecy and treat restrictions as a reminder.' },
        { question: 'How strong is the PDF encryption?', answer: 'It depends on the PDF version in the source file\'s header. In the implementation of the library the site uses (@cantoo/pdf-lib 2.7.1), 1.4 and 1.5 use 128-bit RC4, 1.6 and 1.7 use 128-bit AES, and lower versions use 40-bit RC4. Confirm in the reader\'s document properties after encrypting.' },
        { question: 'Can I recover a forgotten password?', answer: 'No. The tool does not store passwords and has no recovery feature; decrypting requires the correct password. Keep passwords in a password manager and an unencrypted original in a safe place.' },
        { question: 'Can an encrypted PDF still be merged or split?', answer: 'Not directly. Encrypted files need a password to be read, so the other tools report them as unreadable. Decrypt to get a password-free copy, process it, and encrypt again.' },
      ],
    },
  },
};

export const deepArticles1: BlogArticle[] = [
  pdfToolsGuide,
  splitPdf,
  extractPages,
  mergePdf,
  passwordProtectPdf,
];
