import { defineToolContent } from './define';

export const textMarkdownToHtmlContent = defineToolContent({
  zh: {
    overview: ['Markdown 转 HTML 会把标题、段落、列表、链接、引用、代码和表格等标记解析为网页元素。输出适合放入博客、邮件模板或内容系统，但视觉样式仍由目标页面的 CSS 决定。', 'HTML 可以包含可执行或危险结构。把不可信 Markdown 转换后直接插入网站时必须进行严格净化，尤其要处理原始 HTML、链接协议、图片地址和事件属性；本工具生成结果不等于可安全发布。'],
    steps: [['输入并校验 Markdown', '确认链接、图片、代码围栏和标题结构完整。'], ['生成并预览 HTML', '检查语义元素和目标渲染效果，不只看源码字符串。'], ['在发布系统中净化', '根据允许标签和属性白名单处理输出，再应用站点样式。']],
    example: {
      caption: "输出是语义化的结构标签，不内联主题样式，方便你套用自己的 CSS。",
      inputLabel: "Markdown",
      input: "## 安装\n\n运行 `npm install`，然后：\n\n- 启动开发服务器\n- 打开 localhost:3000",
      outputLabel: "HTML",
      output: "<h2>安装</h2>\n<p>运行 <code>npm install</code>，然后：</p>\n<ul>\n  <li>启动开发服务器</li>\n  <li>打开 localhost:3000</li>\n</ul>",
      language: "html",
    },
    scenarios: [['迁移博客内容', '把 Markdown 正文转换为内容管理系统可接收的 HTML。'], ['制作邮件或文档片段', '生成基础语义结构，再按目标平台限制调整样式。'], ["把技术笔记发布到只接受 HTML 的系统", "内部 wiki 或工单系统的富文本编辑器通常只吃 HTML，转换后粘贴即可保留标题、列表和代码块结构。"]],
    notes: ['转换器不会自动提供完整页面的 `head`、CSS 和响应式布局。', '不可信输出必须使用成熟的 HTML sanitizer，不能只删除 `<script>`。', '相对链接和图片路径会按最终 HTML 所在位置解析。'],
    specs: [["输出", "完整的 HTML 文档，可预览、复制或下载"], ["支持的语法", "常见 Markdown，包括表格、代码块、任务列表和链接"], ["内联 HTML", "Markdown 中的原生 HTML 标签会原样保留：从不可信来源转换时需自行过滤"], ["样式", "输出结构化 HTML，不内联主题样式，方便你套用自己的 CSS"], ["与转 PDF 的区别", "HTML 可继续编辑和套样式，PDF 是最终固定版式"], ["典型用途", "贴进 CMS、邮件模板，或作为静态页面的正文片段"]],
    faq: [{ question: "为什么输出的 HTML 没有样式？", answer: "刻意如此。输出的是结构化的语义标签，不内联任何主题样式，这样你自己的 CSS 才能干净地生效。需要独立成页时，自己补一段 style 或引一份样式表即可。" }, { question: "Markdown 里写的 HTML 标签会怎么处理？", answer: "原样保留。Markdown 规范允许内联 HTML，转换不做过滤。如果源内容来自用户输入或其它不可信来源，发布前必须自行做 XSS 过滤：转换工具不承担这个责任。" }],
    reference: [['semantic HTML', '用标题、段落、列表和代码等元素表达内容结构的 HTML。'], ['sanitization', '按明确规则移除危险标签、属性和 URL 的安全处理。']],
  },
  en: {
    overview: ['Markdown to HTML parses headings, paragraphs, lists, links, quotations, code, and tables into web elements. Output can feed a blog, email template, or content system, while visual appearance remains controlled by CSS in the destination.', 'HTML can contain executable or dangerous structures. Strictly sanitize converted untrusted Markdown before inserting it into a site, especially raw HTML, URL schemes, image sources, and event attributes. Generated output is not automatically safe to publish.'],
    steps: [['Enter and validate Markdown', 'Confirm links, images, code fences, and heading structure are complete.'], ['Generate and preview HTML', 'Inspect semantic elements and actual rendering rather than only the source string.'], ['Sanitize in the publishing system', 'Apply an allowed tag and attribute policy before destination styling.']],
    example: {
      caption: "The output is semantic structural markup with no theme styles inlined, so your own CSS applies cleanly.",
      inputLabel: "Markdown",
      input: "## Install\n\nRun `npm install`, then:\n\n- Start the dev server\n- Open localhost:3000",
      outputLabel: "HTML",
      output: "<h2>Install</h2>\n<p>Run <code>npm install</code>, then:</p>\n<ul>\n  <li>Start the dev server</li>\n  <li>Open localhost:3000</li>\n</ul>",
      language: "html",
    },
    scenarios: [['Migrating blog content', 'Convert Markdown body content into HTML accepted by a content system.'], ['Creating an email or document fragment', 'Generate base semantic structure and adapt it to target platform limits.'], ["Publishing technical notes into an HTML-only system", "Rich-text editors in internal wikis and ticketing systems usually accept only HTML, and the conversion preserves headings, lists and code blocks on paste."]],
    notes: ['Conversion does not automatically provide a complete page `head`, CSS, or responsive layout.', 'Untrusted output needs a mature HTML sanitizer; removing only `<script>` is insufficient.', 'Relative links and image paths resolve from the final HTML location.'],
    specs: [["Output", "A complete HTML document you can preview, copy or download"], ["Supported syntax", "The common Markdown set, including tables, code blocks, task lists and links"], ["Inline HTML", "Raw HTML tags in the Markdown are passed through unchanged; sanitise yourself when the source is untrusted"], ["Styling", "Structured HTML with no theme styles inlined, so your own CSS applies cleanly"], ["vs Markdown to PDF", "HTML stays editable and restyleable; PDF is a final fixed layout"], ["Typical use", "Pasting into a CMS or an email template, or as the body fragment of a static page"]],
    faq: [{ question: "Why does the HTML have no styling?", answer: "Deliberately. The output is semantic structural markup with no theme styles inlined, so your own CSS applies cleanly. For a standalone page, add a style block or link a stylesheet yourself." }, { question: "What happens to HTML tags written inside the Markdown?", answer: "They pass through unchanged. The Markdown spec permits inline HTML and no filtering is applied. If the source came from user input or another untrusted origin, you must sanitise against XSS before publishing; the converter does not do that for you." }],
    reference: [['semantic HTML', 'HTML elements such as headings, paragraphs, lists, and code that express content structure.'], ['sanitization', 'Security processing that removes dangerous tags, attributes, and URLs according to an explicit policy.']],
  },
});
