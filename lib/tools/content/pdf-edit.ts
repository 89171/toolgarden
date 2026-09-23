import { defineToolContent } from './define';

export const pdfEditContent = defineToolContent({
  zh: {
    overview: [
      'PDF 不是为逐字改写设计的格式：页面记录的是「在这个坐标用这个字体画这些字形」，没有段落回流的概念。所以这个工具提供两条不同的编辑路径——改写页面内容流里已有的文字，或者在页面之上叠加新的文字、签名、批注和遮盖块。前者结果仍是真正的文字，后者不受字体限制。',
      '改原文时，工具用 pdf.js 抽出每段文字的原始字节和位置，再在页面内容流里定位对应的文字绘制操作符（Tj / TJ）并替换其中的字符串，最后由 pdf-lib 重新写出文件。叠加标注则写成 PDF 原生的注释对象（Ink / Square / FreeText / Stamp），是矢量的，放大不糊、体积很小，在其它阅读器里还能单独选中和删除。两者都在浏览器本地完成，文件不会上传服务器。',
    ],
    steps: [
      ['上传 PDF 并等待渲染', '页面逐页渲染成底图，同时抽取文字块位置，页数越多耗时越长。'],
      ['改原文：直接点页面上的文字', '默认就是改原文模式，鼠标移到文字上会出现虚线框，点击输入新内容回车确认。页面随即用改写后的 PDF 重新渲染，字体和颜色就是导出后的样子。'],
      ['加标注：文字 / 画笔 / 高亮 / 方框 / 图片', '需要签名、手写批注或遮盖时用叠加工具，它们不受原字体限制。中文会按需下载字体并只嵌入用到的字形，导出后同样是真正的文字。'],
      ['保存并下载', '导出时先改写内容流里的原文，再把标注图层盖上；无法改写的原文会明确列出原因，不会悄悄写成空白。'],
    ],
    scenarios: [
      ['修正正式文件里的数字或日期', '合同金额、报价、生效日期写错时直接改原文，改完仍是可选中、可检索的文字，不留遮盖痕迹。'],
      ['签署和回填表单', '用画笔手写签名，或插入透明背景签名图片，再用文字工具补上日期和姓名。'],
      ['评审意见直接写在稿件上', '用高亮标出有问题的段落，旁边写一段说明，对方打开就知道批注指向哪里。'],
      ['遮盖来不及重做的内容', '原字体无法改写时，用填充方框盖住旧内容，再在上面写正确文字。'],
    ],
    notes: [
      '改原文不会重排段落：起点坐标不变，新文字变长不会挤开后面的内容，也不会自动换行。',
      '三种情况无法改写原文，工具会在你编辑时就逐条说明：文字不在页面内容流里（例如在表单域或 Form XObject 中）、字体是多字节 CID 字体、原字体里没有新文字需要的字形（中文子集字体常见）。',
      '填充方框只是盖住视觉内容，被盖住的文字仍在文字层里可被复制提取，不能当作脱敏涂黑使用；真正要删掉的文字请用改原文。',
      '导出会重写文件，已有的数字签名会失效；加密 PDF 需要先解除密码再编辑。',
    ],
    specs: [
      ['改原文的实现', '定位并替换页面内容流里的 Tj / TJ 字符串，沿用原有字体，不是盖图层'],
      ['改原文的前提', '文字在页面自己的内容流里、字体为单字节字体，且新文字每个字符在原字体中有字形'],
      ['失败时的行为', '编辑时立刻报出原因并跳过，绝不写出渲染成空白或豆腐块的 PDF'],
      ['字距处理', 'TJ 数组里的字距微调分段会被合并到第一段，新文字按字体自身宽度排布'],
      ['叠加标注', '写成原生注释对象：画笔 / 高亮 → Ink，方框 → Square，文字 → FreeText，图片 → Stamp'],
      ['预览方式', '改完立刻把改写写进 PDF 并重新渲染该页，预览与导出结果一致'],
      ['标注清晰度', '矢量输出，与分辨率无关；只有认不出的对象和缺字形的文字才会单独栅格化'],
      ['旋转页面与裁切页', '按 /Rotate 和 CropBox 换算坐标，横向扫描件、出血裁切稿上的标注都不会错位'],
      ['处理位置', '渲染、改写、标注和写回全部在浏览器本地完成，文件不上传'],
    ],
    faq: [
      {
        question: '为什么中文常常改不了原文？',
        answer: '中文 PDF 多用 CID（Type0）字体，并且只嵌入用到的那部分字形。字节和字符不是一一对应，且你要写的新字很可能根本没被嵌进文件。硬写进去会渲染成空白或豆腐块，所以工具会直接判定失败，让你改用文字叠加。',
      },
      {
        question: '改原文和用方框盖住再写新字有什么区别？',
        answer: '改原文动的是文字本身：旧字符从文件里消失，新字符沿用原字体，可被选中、复制和检索。方框遮盖只是在上面画了一层，旧文字仍留在文字层里，复制或文本提取时会暴露出来。',
      },
      {
        question: '改写后的文件为什么变大或变小了？',
        answer: '改原文只替换字符串，体积几乎不变。标注是矢量注释对象，一条画笔或一个方框只有几百字节；插入图片按图片本身大小计算，写中文时会多出一份只含所用字形的字体子集（几 KB）。',
      },
    ],
    reference: [
      ['内容流（content stream）', 'PDF 页面里记录绘制指令的部分。Tj 和 TJ 是其中的文字绘制操作符，改原文就是替换它们携带的字符串。'],
      ['字体子集（subset）', '生成 PDF 时只嵌入文档实际用到的字形。这让文件更小，但也意味着原字体里没有的字符无法直接写入。'],
      ['/Rotate', '页面的显示旋转角度，取值 0/90/180/270。阅读器按它旋转页面，但页面坐标系不变，所以标注需要换算才能对齐。'],
    ],
  },
  en: {
    overview: [
      'PDF was never designed for word-processor editing: a page records "draw these glyphs at these coordinates in this font", with no notion of reflowing paragraphs. So this tool offers two distinct paths — rewrite the text already in the page content stream, or layer new text, signatures, markup, and cover boxes on top. The first keeps the result as real text; the second is not limited by the original font.',
      'To rewrite, the tool extracts each run\'s raw bytes and position with pdf.js, locates the matching text-showing operator (Tj / TJ) in the page content stream, replaces the string inside it, and writes the file back out with pdf-lib. Annotations are written as native PDF annotation objects (Ink, Square, FreeText, Stamp): vector, tiny, and still selectable or removable in other readers. Both run locally in your browser; the file is never uploaded.',
    ],
    steps: [
      ['Upload the PDF and wait for rendering', 'Pages are rendered into a backdrop while text positions are extracted; longer documents take longer.'],
      ['Rewrite: click the text on the page', 'Rewrite mode is the default. Hover a run to outline it, click, type, and press Enter — the page is then re-rendered from the rewritten PDF, so the font and color you see are what gets exported.'],
      ['Annotate: text, pen, highlight, box, image', 'Use the overlay tools for signatures, handwriting, or covering content. They are not limited by the original font; CJK text pulls a font on demand and embeds only the glyphs used, so it stays real text.'],
      ['Save and download', 'Export rewrites the content stream first, then stamps the annotation layer. Anything that could not be rewritten is listed with its reason rather than silently written as blanks.'],
    ],
    scenarios: [
      ['Correcting a number or date in a formal document', 'Fix a wrong amount, quote, or effective date directly in the text so the result stays selectable and searchable with no cover-up visible.'],
      ['Signing and completing a form', 'Draw the signature with the pen or insert a transparent signature image, then type the date and name beside it.'],
      ['Reviewing a draft in place', 'Highlight the problematic paragraph and write the comment next to it so the note points at something specific.'],
      ['Covering what cannot be regenerated', 'When the original font blocks a rewrite, put a filled box over the old content and write the correct text on top.'],
    ],
    notes: [
      'A rewrite does not reflow: the start position stays put, longer text does not push later content aside, and nothing wraps to a new line.',
      'Three cases cannot be rewritten, and each is reported while you edit: the text is not in the page content stream (a form field or Form XObject, for example), the font is a multi-byte CID font, or the original font has no glyph for the new characters — common with subset CJK fonts.',
      'A filled box hides content visually only; the covered text stays in the text layer and can still be copied or extracted, so it is not redaction. Use a rewrite when the text must actually go.',
      'Exporting rewrites the file, which invalidates an existing digital signature. Remove the password from an encrypted PDF before editing it.',
    ],
    specs: [
      ['How rewriting works', 'The Tj / TJ strings in the page content stream are located and replaced, reusing the original font, rather than stamping a layer'],
      ['Requirements for rewriting', 'The text must live in the page content stream, use a single-byte font, and every new character needs a glyph in that font'],
      ['Behavior on failure', 'The run is skipped and the reason reported while you edit; the tool never writes a PDF that renders as blanks or tofu boxes'],
      ['Kerning', 'Kerned segments inside a TJ array are merged into the first piece and the new text is laid out with the font\'s own widths'],
      ['Annotation tools', 'Written as native annotations: pen and highlight as Ink, box as Square, text as FreeText, image as Stamp'],
      ['Preview', 'Each edit is applied to the PDF and the page re-rendered, so the preview matches the exported file'],
      ['Annotation resolution', 'Vector output, resolution independent; only unknown objects and text without glyphs are rasterised individually'],
      ['Rotated and cropped pages', 'Coordinates follow both /Rotate and the crop box, so marks on landscape scans and trimmed print files stay aligned'],
      ['Where it runs', 'Rendering, rewriting, annotating, and writing back all happen locally in the browser'],
    ],
    faq: [
      {
        question: 'Why do CJK documents usually refuse to rewrite?',
        answer: 'CJK PDFs mostly use CID (Type0) fonts and embed only the glyphs the document actually uses. Bytes do not map one-to-one to characters, and the characters you want to type were probably never embedded. Writing them anyway would render blanks or tofu boxes, so the tool fails the rewrite and points you at the overlay text tool.',
      },
      {
        question: 'How is rewriting different from covering text with a box?',
        answer: 'A rewrite changes the text itself: the old characters leave the file and the new ones reuse the original font, staying selectable, copyable, and searchable. A cover box only paints over the page — the old text remains in the text layer and shows up in any copy or extraction.',
      },
      {
        question: 'Why did the file size change?',
        answer: 'Rewriting only swaps strings, so size barely moves. Annotations are vector objects — a pen stroke or a box costs a few hundred bytes. Inserted images cost what the image costs, and CJK text adds a font subset holding only the glyphs you typed, a few KB.',
      },
    ],
    reference: [
      ['Content stream', 'The part of a PDF page holding its drawing instructions. Tj and TJ are its text-showing operators, and rewriting replaces the strings they carry.'],
      ['Font subset', 'Only the glyphs a document actually uses get embedded. That keeps files small but means characters absent from the original font cannot simply be written in.'],
      ['/Rotate', 'A page attribute of 0, 90, 180, or 270 degrees. Readers rotate the displayed page by it while the coordinate system stays put, so annotations must be converted to line up.'],
    ],
  },
});
