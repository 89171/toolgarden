import { defineToolContent } from './define';

export const filePreviewContent = defineToolContent({
  zh: {
    overview: [
      '文件预览工具把常见文件直接读取到浏览器内存中，按格式选择合适的开源解析器或浏览器原生预览能力。图片、音视频、PDF、文本、Markdown、DOCX、XLSX/CSV 都可以在同一个页面查看，文件不会上传到服务器。',
      'ZIP 文件会先显示目录树；点击其中的文件后，工具会复用同一套预览逻辑展示内容。它适合先快速确认压缩包里有什么、检查配置或文档内容，再决定是否下载整个文件。',
    ],
    steps: [
      ['选择或拖入文件', '上传一个文件，页面会根据 MIME 类型和扩展名自动选择预览方式。'],
      ['查看文件内容', '文本和 Markdown 显示可滚动内容，表格支持切换 Sheet，PDF、图片和媒体使用浏览器预览。'],
      ['浏览 ZIP', '上传 ZIP 后展开目录，点击任意文件即可继续预览；不支持的二进制文件可以下载。'],
      ['清空并处理下一个文件', '预览只保留在当前页面内存中，处理结束后可以清空并选择下一个文件。'],
    ],
    scenarios: [
      ['快速检查附件', '在下载或打开桌面应用前，先查看图片、PDF、表格和文档的基本内容。'],
      ['查看压缩包里的单个文件', '收到项目压缩包、资料包或构建产物时，只打开需要确认的文件，不必全部解压到磁盘。'],
      ['本地检查敏感文件', '合同、配置、日志和内部附件在浏览器本地读取，减少上传到第三方预览服务的暴露面。'],
    ],
    notes: [
      '解析在浏览器本地完成。超大文件、复杂 DOCX、带密码的 PDF/ZIP、RAR/7z 和未知二进制格式可能无法直接预览。',
      'XLSX/CSV 预览为有限行列的快速快照，不会完整呈现 Excel 的图表、公式、宏、条件格式和所有单元格样式。',
      'Markdown 预览会过滤危险协议和原始 HTML；不要把预览结果当作对不可信文档的完整安全审计。',
    ],
    specs: [
      ['处理位置', '浏览器本地内存'],
      ['可预览', '图片、音视频、PDF、TXT/代码、Markdown、DOCX、XLSX/XLS/CSV'],
      ['压缩包', 'ZIP 目录树与内部文件预览'],
      ['开源实现', 'fflate、docx-preview、SheetJS、marked，以及浏览器原生媒体/PDF 能力'],
      ['不支持或有限支持', 'RAR、7z、加密压缩包、未知二进制、复杂 Office 特性'],
      ['大文本限制', '超过 300,000 个字符的文本只显示开头部分，避免占满浏览器内存'],
    ],
    reference: [
      ['Blob URL', '浏览器为内存中的文件创建的临时地址，适合把本地文件交给图片、媒体或 PDF 预览器。'],
      ['MIME 类型', '文件携带的内容类型提示；当 MIME 缺失时，工具会结合文件扩展名判断。'],
      ['ZIP 条目', '压缩包内部的文件记录。工具先解压到浏览器内存，再把单个条目交给对应预览器。'],
    ],
    faq: [
      {
        question: '文件会上传到服务器吗？',
        answer: '不会。文件读取、ZIP 解压和格式预览都在当前浏览器中完成，刷新页面后内存中的内容也会被清除。',
      },
      {
        question: '为什么有些文件只能下载？',
        answer: '浏览器没有通用的未知二进制渲染器。对于 RAR、7z、加密文件或不支持的专有格式，工具会保留文件并提供下载。',
      },
    ],
  },
  en: {
    overview: [
      'The file preview tool reads common files into browser memory and chooses a native browser preview or an open-source parser for each format. Images, audio, video, PDFs, text, Markdown, DOCX, and XLSX/CSV can be inspected in one place without uploading the file.',
      'ZIP files first show a folder tree. Select an entry and the same preview pipeline is reused for its contents, so you can inspect one document or image without extracting the whole archive to disk.',
    ],
    steps: [
      ['Choose or drop a file', 'Upload one file and the tool selects a preview strategy from its MIME type and extension.'],
      ['Inspect the contents', 'Text and Markdown are scrollable, spreadsheets have sheet tabs, and PDFs, images, and media use browser previews.'],
      ['Browse a ZIP', 'Upload a ZIP, expand the tree, and select any file to preview it in the same page. Unsupported binary entries remain downloadable.'],
      ['Clear and preview another file', 'The preview stays in the current page memory only; clear it before choosing another file.'],
    ],
    scenarios: [
      ['Check an attachment quickly', 'Inspect an image, PDF, spreadsheet, or document before opening a desktop application or downloading the whole archive.'],
      ['Inspect one archive entry', 'For project bundles, document packs, or build artifacts, open only the file you need to verify.'],
      ['Review sensitive files locally', 'Contracts, configs, logs, and internal attachments stay in the browser instead of being sent to a third-party preview service.'],
    ],
    notes: [
      'Parsing happens locally in the browser. Very large files, complex DOCX files, encrypted PDFs or ZIPs, RAR/7z archives, and unknown binary formats may not preview.',
      'XLSX/CSV output is a bounded quick snapshot. It does not reproduce every Excel chart, formula, macro, conditional format, or cell style.',
      'Markdown preview filters dangerous protocols and raw HTML. Do not treat it as a complete security audit of an untrusted document.',
    ],
    specs: [
      ['Processing', 'Local browser memory'],
      ['Previewable', 'Images, audio/video, PDF, TXT/code, Markdown, DOCX, XLSX/XLS/CSV'],
      ['Archives', 'ZIP tree plus previews for supported entries'],
      ['Open-source pieces', 'fflate, docx-preview, SheetJS, marked, and native browser media/PDF support'],
      ['Unsupported or limited', 'RAR, 7z, encrypted archives, unknown binaries, and complex Office features'],
      ['Large text limit', 'Text files over 300,000 characters show only the beginning to keep the page responsive'],
    ],
    reference: [
      ['Blob URL', 'A temporary browser address for file data held in memory, useful for image, media, and PDF previews.'],
      ['MIME type', 'A content-type hint carried by a file. When it is missing, the tool also checks the filename extension.'],
      ['ZIP entry', 'A file record inside an archive. The tool extracts it in memory and sends it through the matching previewer.'],
    ],
    faq: [
      {
        question: 'Are files uploaded to a server?',
        answer: 'No. File reading, ZIP extraction, and format previews happen in the current browser. Refreshing the page clears the in-memory content.',
      },
      {
        question: 'Why can some files only be downloaded?',
        answer: 'Browsers do not have a universal renderer for unknown binaries. RAR, 7z, encrypted files, and proprietary formats stay downloadable instead of being misinterpreted.',
      },
    ],
  },
});
