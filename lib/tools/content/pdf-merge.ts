import type { ToolContent } from './types';

export const pdfMergeContent: ToolContent = {
  zh: {
    overview: [
      'PDF 内部是一组页面对象加一份索引，合并的本质就是把多份文档的页面对象放进同一个文件、重建索引。因为不涉及重新渲染，合并后的页面和原文件逐像素一致：字体、矢量图形、排版、图片质量都不会变化。这是 PDF 页面级操作可以做到无损的原因。',
      '不无损的部分在页面之外：书签（outline）、部分表单域、注释的层级关系、以及文档级的元数据，在合并时不一定跟着页面迁移。如果这些结构对你重要，合并后需要专门确认一次。',
    ],
    steps: [
      {
        title: '添加要合并的 PDF',
        detail: '可以一次选择多个文件，也可以分几次添加。文件在浏览器内读取，不会上传到服务器。',
      },
      {
        title: '拖动调整顺序',
        detail: '合并顺序完全由列表顺序决定，与文件名和添加时间无关。文件名带序号也不会自动排序，请以列表里看到的顺序为准。',
      },
      {
        title: '确认页数与首末页',
        detail: '导出前核对总页数，并检查相邻文档的衔接处：最常见的错误不是合并失败，而是顺序放错或者漏加了一份。',
      },
      {
        title: '导出合并后的文档',
        detail: '导出为单个 PDF。如果之后需要重新切开，可以用拆分 PDF 按页码范围还原，前提是你记得每一段的页数。',
      },
    ],
    specs: [
      { label: '页面内容', value: '无损：不重新渲染，页面与原文件逐像素一致' },
      { label: '页面尺寸', value: '各文档原有尺寸和方向保留，合并后可以是混合尺寸' },
      { label: '书签与表单', value: '可能不随页面迁移，合并后需要确认' },
      { label: '加密文档', value: '需要先用 PDF 加密 / 解密移除打开密码，否则无法读取页面' },
      { label: '顺序依据', value: '列表顺序，可拖动调整；不按文件名自动排序' },
      { label: '体积上限', value: '受浏览器可用内存限制，页数极多或含大量高分辨率图片时可能失败' },
    ],
    scenarios: [
      {
        title: '把分开签署的文件合成一份',
        detail: '合同正文、附件、签署页常常是分别生成的。合并成一份便于归档和发送，而且因为不重新渲染，签署页上的印章和签名图像不会有任何画质损失。',
      },
      {
        title: '把扫描件拼回完整文档',
        detail: '扫描仪常按批次输出多个文件。按正确顺序合并可以还原成一份完整文档，比在阅读器里逐个打开更好用。',
      },
      {
        title: '把不同来源的材料整理成一份提交件',
        detail: '报告、图表导出的 PDF、以及从 Word 转来的说明，可以合并成单一提交文件。页面尺寸不一致时合并仍然成立，只是阅读时页面大小会变化。',
      },
    ],
    notes: [
      '合并前先确认顺序。工具不按文件名排序，即使文件名带 01、02 这样的序号也不会自动排列：顺序完全取决于你在列表里看到的样子。这是合并出错最常见的原因。',
      '带打开密码的 PDF 无法直接合并，因为页面内容是加密的。请先用 PDF 加密 / 解密移除密码（前提是你知道密码并有权打开该文档），再进行合并。',
      '书签、部分表单域和注释的关联关系可能在合并后丢失。如果原文档有依赖表单逻辑的填写项，合并后请实际填一遍验证。',
      '合并是单向的。虽然可以用拆分 PDF 按页码范围重新切开，但原始的文件边界信息在合并后已经不存在，需要你自己记录每一段的页数。请保留原件。',
    ],
    reference: [
      { term: '页面对象', definition: 'PDF 内部表示一页内容的结构。合并操作搬动的是这些对象本身，而不是重新绘制页面，所以画质不会变化。' },
      { term: '书签 / outline', definition: 'PDF 的目录导航结构，独立于页面内容存在。它引用页面位置，所以在页面被重新组织时最容易失效。' },
      { term: '打开密码 vs 权限密码', definition: '打开密码加密文档内容，没有它无法读取页面；权限密码只是限制打印、复制等操作的声明。合并受前者阻挡，不受后者影响。' },
    ],
    faq: [
      {
        question: '合并会降低画质吗？',
        answer: '不会。合并搬动的是页面对象本身，不重新渲染也不重新压缩图片，输出页面与原文件逐像素一致。这是页面级操作和「PDF 转 Word」这类需要重建结构的操作的根本区别。',
      },
      {
        question: '为什么合并顺序不对？',
        answer: '因为顺序取决于列表顺序，而不是文件名。即使文件名带序号也不会自动排序：导出前请在列表里拖动确认，这是最常见的一类错误。',
      },
      {
        question: '合并后还能拆回来吗？',
        answer: '可以用拆分 PDF 按页码范围切开，但工具不记录原始文件的边界，需要你自己知道每一段占多少页。所以请保留原件，把合并结果当作产物而不是唯一副本。',
      },
    ],
  },
  en: {
    overview: [
      'Inside a PDF there is a set of page objects plus an index. Merging is essentially putting the page objects from several documents into one file and rebuilding that index. Because nothing is re-rendered, the merged pages are pixel-identical to the originals; fonts, vector artwork, layout and image quality all come through untouched. That is why page-level PDF work can be genuinely lossless.',
      'What is not lossless lives outside the pages: bookmarks, some form fields, annotation relationships and document-level metadata do not always follow the pages across. If any of that matters to you, it is worth verifying after the merge.',
    ],
    steps: [
      {
        title: 'Add the PDFs you want joined',
        detail: 'Select several at once, or add them in batches. Files are read in the browser and never uploaded.',
      },
      {
        title: 'Drag to set the order',
        detail: 'The merge order is exactly the list order; filenames and the order you added them are irrelevant. Numbered filenames are not sorted automatically, so trust the list, not the names.',
      },
      {
        title: 'Check the page count and the seams',
        detail: 'Confirm the total before exporting, and look at the joins between documents. The usual failure is not a failed merge; it is a document in the wrong place or one that never got added.',
      },
      {
        title: 'Export the merged document',
        detail: 'You get a single PDF. If you need to separate it again later, Split PDF cuts by page range; provided you know how many pages each original contributed.',
      },
    ],
    specs: [
      { label: 'Page content', value: 'Lossless; nothing is re-rendered, pages are pixel-identical to the originals' },
      { label: 'Page size', value: 'Each document keeps its own size and orientation, so a merged file can be mixed-size' },
      { label: 'Bookmarks and forms', value: 'May not follow the pages; verify after merging' },
      { label: 'Encrypted files', value: 'The open password must be removed first with PDF Encrypt / Decrypt, or the pages cannot be read' },
      { label: 'Ordering', value: 'List order, drag to change; never sorted by filename' },
      { label: 'Size limit', value: 'Bounded by browser memory; very high page counts or lots of high-resolution images can fail' },
    ],
    scenarios: [
      {
        title: 'Combining separately signed documents',
        detail: 'The body, the annexes and the signature page are often produced separately. Merging makes one file to archive and send; and because nothing is re-rendered, stamps and signature images lose no quality at all.',
      },
      {
        title: 'Reassembling a scan',
        detail: 'Scanners frequently emit one file per batch. Merging in the right order restores a single complete document, which beats opening five files in a reader.',
      },
      {
        title: 'Assembling a submission from mixed sources',
        detail: 'A report, chart exports and a converted Word explainer can become one submission file. Mismatched page sizes still merge fine; the pages simply change size as the reader moves through them.',
      },
    ],
    notes: [
      'Confirm the order before exporting. Nothing is sorted by filename; 01, 02, 03 in the names will not arrange themselves, and the sequence is purely what you see in the list. This is the most common way a merge goes wrong.',
      'A PDF with an open password cannot be merged directly, because its page content is encrypted. Remove the password first with PDF Encrypt / Decrypt; assuming you know it and are entitled to open the document; then merge.',
      'Bookmarks, some form fields and annotation relationships can be lost. If the original relied on form logic, fill the merged version in once to check it still behaves.',
      'Merging is one-way. Split PDF can cut by page range afterwards, but the original file boundaries are no longer recorded anywhere, so you need to know the page counts yourself. Keep the originals.',
    ],
    reference: [
      { term: 'Page object', definition: 'The internal structure representing one page of a PDF. Merging moves these objects rather than redrawing the page, which is why quality is unaffected.' },
      { term: 'Bookmarks / outline', definition: 'A PDF\'s navigation tree, stored separately from page content. It references page positions, which is why it is the first thing to break when pages are reorganised.' },
      { term: 'Open password vs permissions password', definition: 'An open password encrypts the content and is required to read the pages at all; a permissions password only declares restrictions on printing and copying. Merging is blocked by the former and unaffected by the latter.' },
    ],
    faq: [
      {
        question: 'Does merging reduce quality?',
        answer: 'No. Merging relocates page objects without re-rendering or recompressing images, so the output pages are pixel-identical to the originals. That is the fundamental difference between page-level operations and something like PDF to Word, which has to rebuild structure.',
      },
      {
        question: 'Why is the order wrong?',
        answer: 'Because the order comes from the list, not from filenames. Numbered names are not sorted automatically; drag the list into place before exporting. This accounts for most merge mistakes.',
      },
      {
        question: 'Can I split the merged file back apart?',
        answer: 'Split PDF can cut it by page range, but the tool does not record where the original boundaries were, so you need to know each document\'s page count. Keep the originals and treat the merged file as a product, not your only copy.',
      },
    ],
  },
};
