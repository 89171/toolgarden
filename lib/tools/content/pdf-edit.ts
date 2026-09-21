import { defineToolContent } from './define';

export const pdfEditContent = defineToolContent({
  zh: {
    overview: [
      'PDF 不是为逐字改写设计的格式：它记录的是「在这个位置用这个字体画这些字形」，没有段落回流的概念。所以浏览器里可靠的「编辑 PDF」，做的是在原页面之上叠加一层新内容——补一段说明、签个名、圈出问题、用色块盖掉写错的数字，而不是像 Word 那样重排正文。',
      '这个工具用 pdf.js 把每一页渲染成图片供你定位，你在页面上添加的文字、画笔、高亮和图片会作为一层透明标注保存下来；导出时用 pdf-lib 把这层标注盖回对应页面。原页面的文字、书签和页面结构不会被重写，导出后的正文依然可以选中和复制。整个过程在你的浏览器里完成，文件不会上传服务器。',
    ],
    steps: [
      ['上传 PDF 并等待渲染', '页面逐页渲染成可定位的底图，页数越多耗时越长，大文件建议先用拆分工具取出需要修改的部分。'],
      ['选择工具并在页面上标注', '文字用于补充说明和填写空白，画笔用于签名和手写批注，高亮用于半透明标记，方框勾选「填充」后可以盖住写错的内容。'],
      ['逐页检查后导出', '用上一页 / 下一页切换，每页的标注会各自保存；点击保存后只有有标注的页面会被写入新的图层。'],
    ],
    scenarios: [
      ['签署和回填表单', '把签名照片或透明背景签名图插入到签字栏，再用文字工具填写日期和姓名，不必打印后再扫描。'],
      ['评审意见直接写在稿件上', '用高亮标出有问题的段落，旁边加一段文字说明，对方打开 PDF 就能看到批注位置。'],
      ['遮盖写错的信息', '用填充方框盖住打错的金额或过期的联系方式，再在上面写正确内容，适合来不及重新生成源文件的场合。'],
    ],
    notes: [
      '这是叠加编辑，不能改动原有文字的内容和排版。要改正文请回到源文件重新导出 PDF。',
      '填充方框只是盖住视觉上的内容，被盖住的文字仍在文件的文字层里，可以被复制或提取，不能当作脱敏和涂黑使用。',
      '导出会重写文件，已有的数字签名会因此失效；加密 PDF 需要先解除密码再编辑。',
    ],
    specs: [
      ['编辑方式', '在原页面上叠加标注图层，不改写原有页面对象'],
      ['可用标注', '文字、自由画笔、半透明高亮、矩形（描边或填充）、插入图片'],
      ['原文字层', '保持不变，导出后正文仍可选中、复制和检索'],
      ['多页处理', '每页标注独立保存，导出时只处理有标注的页面'],
      ['标注清晰度', '按页面显示尺寸的 2 倍导出标注图层，约 144–216 DPI'],
      ['旋转页面', '按页面的 /Rotate 值换算坐标，横向扫描件上的标注不会错位'],
      ['文字语言', '文字标注以图层形式绘制，中文、日文等非拉丁字符不需要额外嵌入字体'],
      ['处理位置', '渲染、标注和写回全部在浏览器本地完成，文件不上传'],
    ],
    faq: [
      {
        question: '为什么不能直接修改 PDF 里已有的文字？',
        answer: 'PDF 保存的是字形和它们的绝对坐标，没有段落和行的概念。改一个字就要重新计算后面所有字形的位置和换行，在线工具做这件事往往会毁掉排版。叠加一层内容是更可控的做法，需要真正改写正文时应该回到源文件。',
      },
      {
        question: '用方框盖住的敏感信息安全吗？',
        answer: '不安全。方框只是画在上面的一个图形，下面的文字仍然存在于文件里，用复制或文本提取工具就能拿到。真正的脱敏需要删除文字对象本身，如果只是不想被看到又要保证不可恢复，更稳妥的做法是先用 PDF 转图片再重新生成 PDF。',
      },
      {
        question: '导出后的文件为什么变大了？',
        answer: '每个有标注的页面会多出一张整页大小的透明 PNG 图层。透明区域压缩得很好，但标注密集或插入了高分辨率图片时增量会比较明显；没有标注的页面完全不受影响。',
      },
    ],
    reference: [
      ['内容流（content stream）', 'PDF 页面里记录绘制指令的部分。叠加编辑是在原内容流之后追加新的绘制指令，原指令保持不变。'],
      ['/Rotate', '页面的显示旋转角度，取值 0/90/180/270。阅读器按它旋转页面显示，但页面坐标系本身不变，所以标注需要换算后才能对齐。'],
    ],
  },
  en: {
    overview: [
      'PDF was never designed for word-processor editing. A page stores "draw these glyphs at these coordinates in this font", with no notion of reflowing paragraphs. So what "edit a PDF" reliably means in a browser is adding a layer on top of the existing page: a note, a signature, a circle around a problem, a block covering a wrong number — not re-typesetting the body text the way Word would.',
      'This tool renders each page with pdf.js so you can position your edits, keeps whatever you add — text, pen strokes, highlights, images — as a transparent annotation layer, and stamps that layer back onto the matching page with pdf-lib on export. The original text, bookmarks, and page structure are not rewritten, so body text stays selectable and copyable in the exported file. Everything runs in your browser; the file is never uploaded.',
    ],
    steps: [
      ['Upload the PDF and wait for rendering', 'Pages are rendered one by one into a positionable backdrop. Long documents take longer, so consider splitting out the pages you need first.'],
      ['Pick a tool and mark up the page', 'Use text to add notes or fill blanks, the pen for signatures and handwriting, highlight for translucent marking, and a rectangle with "fill" checked to cover something wrong.'],
      ['Review page by page, then export', 'Switch pages with previous / next; each page keeps its own annotations, and only pages that actually have annotations get a new layer on save.'],
    ],
    scenarios: [
      ['Signing and completing a form', 'Drop in a signature image and type the date and name next to it, instead of printing, signing, and scanning again.'],
      ['Reviewing a draft in place', 'Highlight the problematic paragraph and write the comment beside it, so the recipient sees exactly what the note refers to.'],
      ['Covering an incorrect value', 'Put a filled rectangle over a wrong amount or an outdated contact line and write the correct text on top when regenerating the source file is not an option.'],
    ],
    notes: [
      'This is overlay editing. It cannot change the wording or layout of the existing text; fix the source document and re-export for that.',
      'A filled rectangle hides content visually only. The covered text remains in the text layer and can still be copied or extracted, so it is not redaction.',
      'Exporting rewrites the file, which invalidates an existing digital signature. Remove the password from an encrypted PDF before editing it.',
    ],
    specs: [
      ['Editing model', 'An annotation layer drawn over the page; original page objects are left untouched'],
      ['Available annotations', 'Text, freehand pen, translucent highlight, rectangle (outline or filled), inserted image'],
      ['Original text layer', 'Unchanged — body text stays selectable, copyable, and searchable after export'],
      ['Multi-page handling', 'Annotations are stored per page; export only touches pages that have them'],
      ['Annotation resolution', 'The layer is exported at 2× the page display size, roughly 144–216 DPI'],
      ['Rotated pages', 'Coordinates are converted from the page /Rotate value, so marks on landscape scans stay aligned'],
      ['Text languages', 'Text is drawn into the layer, so Chinese, Japanese, and other non-Latin scripts need no extra font embedding'],
      ['Where it runs', 'Rendering, annotating, and writing back all happen locally in the browser'],
    ],
    faq: [
      {
        question: 'Why can I not edit the existing text directly?',
        answer: 'A PDF stores glyphs at absolute coordinates with no paragraphs or lines. Changing one word means recomputing the position of every glyph after it, and online tools that try usually wreck the layout. Adding a layer is the predictable option; when the body text genuinely has to change, go back to the source document.',
      },
      {
        question: 'Is information covered by a rectangle safe?',
        answer: 'No. The rectangle is just a shape drawn on top; the text underneath is still in the file and any copy or extraction tool will reveal it. Real redaction removes the text object itself — if it must be unrecoverable, convert the page to an image and rebuild the PDF from that.',
      },
      {
        question: 'Why is the exported file larger?',
        answer: 'Each annotated page gains one full-page transparent PNG. Transparent areas compress well, but dense markup or a high-resolution inserted image makes the increase noticeable. Pages without annotations are untouched.',
      },
    ],
    reference: [
      ['Content stream', 'The part of a PDF page holding its drawing instructions. Overlay editing appends new instructions after the originals, which stay intact.'],
      ['/Rotate', 'A page attribute of 0, 90, 180, or 270 degrees. Readers rotate the displayed page by it while the page coordinate system stays put, so annotations must be converted to line up.'],
    ],
  },
});
