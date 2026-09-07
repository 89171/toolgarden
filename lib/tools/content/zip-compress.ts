import { defineToolContent } from './define';

export const zipCompressContent = defineToolContent({
  zh: {
    overview: [
      'ZIP 压缩适合把一组文件临时打包成单个附件或归档。这个工具直接调用浏览器里的文件读取能力和 ZIP 压缩算法，输入文件只进入当前页面内存，不会上传到服务器。',
      'ZIP 和 RAR 不是同一种格式。ZIP 的创建端开放、兼容性好，浏览器本地生成后几乎所有系统都能直接解开；RAR 的创建端授权和前端库生态都不适合网页工具，所以这里明确只生成 .zip。',
    ],
    steps: [
      ['选择文件', '点击上传区域或把多个文件拖入页面。文件名会作为 ZIP 内路径保存，重复名称会自动加后缀避免覆盖。'],
      ['调整输出', '确认输出文件名，并按需要调整压缩等级。等级越高通常体积越小，但耗时也会增加。'],
      ['生成 ZIP', '点击压缩按钮后，页面会在浏览器本地读取文件并生成 ZIP Blob，不经过网络请求。'],
      ['下载归档', '生成完成后下载 .zip 文件，并在本机用系统解压工具或其它归档软件验证内容。'],
    ],
    scenarios: [
      ['发送一组附件', '把多份文档、图片或素材打成一个 ZIP，邮件和表单上传时更容易管理。'],
      ['临时归档项目资料', '把当前需要交付的一批文件压缩成一个包，保留原始文件名，方便保存和转移。'],
      ['隐私敏感文件打包', '文件不离开浏览器，适合身份证明、合同草稿、内部资料等不希望上传到第三方服务的场景。'],
    ],
    notes: [
      'ZIP 对已经压缩过的内容未必能继续明显变小。JPG、PNG、MP4、PDF、DOCX、XLSX 本身通常已经包含压缩结构，打包后的体积可能接近原始总和。',
      '大文件会占用浏览器内存。几百 MB 以上或大量文件同时处理时，低内存设备可能变慢或失败。',
      '当前工具负责生成 ZIP，不生成 RAR。后续解压工具可以考虑支持读取 ZIP，并评估是否只读支持 RAR。',
    ],
    specs: [
      ['处理位置', '浏览器本地'],
      ['输出格式', '.zip'],
      ['RAR 支持', '不支持生成 .rar'],
      ['压缩等级', '0 到 9，默认 6'],
      ['文件类型', '任意浏览器可读取的本地文件'],
      ['路径处理', '过滤空路径、当前目录和上级目录片段，重复名称自动重命名'],
    ],
    reference: [
      ['ZIP', '开放且广泛兼容的归档格式，既可以只打包，也可以对文件内容做无损压缩。'],
      ['RAR', '另一种归档格式，解压支持较常见，但创建端生态和授权条件不适合直接作为浏览器本地输出格式。'],
      ['无损压缩', '压缩后再解压可以还原原始字节，适合归档文件、文本和代码。'],
    ],
    faq: [
      {
        question: '文件会上传到服务器吗？',
        answer: '不会。页面使用 File API 读取本地文件，并在浏览器内生成 ZIP Blob，服务器不会收到文件内容。',
      },
      {
        question: '为什么不能压缩成 RAR？',
        answer: 'RAR 的创建端不像 ZIP 那样适合浏览器端开放实现。为了稳定、兼容和授权清晰，这个工具只生成 ZIP。',
      },
    ],
  },
  en: {
    overview: [
      'ZIP compression is useful when you want to package several files into one attachment or archive. This tool uses browser file APIs and ZIP compression directly, so the selected files stay in the current page memory and are not uploaded.',
      'ZIP and RAR are different archive formats. ZIP creation is open, broadly compatible, and practical in browsers; RAR creation has licensing and library ecosystem constraints that make it a poor fit for a local web tool, so this tool exports .zip only.',
    ],
    steps: [
      ['Choose files', 'Click the upload area or drag several files onto the page. File names are kept inside the ZIP, and duplicate names are renamed to avoid overwriting.'],
      ['Adjust output', 'Confirm the output filename and choose a compression level. Higher levels often save more space but take longer.'],
      ['Create the ZIP', 'Click the compression button and the page reads the files locally, producing a ZIP Blob without a network upload.'],
      ['Download the archive', 'Download the .zip file and verify it with your system unzip tool or another archive app.'],
    ],
    scenarios: [
      ['Sending grouped attachments', 'Package documents, images, or assets into one ZIP so email and form uploads are easier to manage.'],
      ['Temporary project archiving', 'Compress a delivery set into one archive while preserving the original file names for storage or transfer.'],
      ['Private file packaging', 'Because files do not leave the browser, the workflow is suitable for IDs, contract drafts, and internal material you do not want to upload to a third-party service.'],
    ],
    notes: [
      'ZIP may not shrink already-compressed formats very much. JPG, PNG, MP4, PDF, DOCX, and XLSX usually contain compression already, so the archive can be close to the original total size.',
      'Large files consume browser memory. Hundreds of MB or many files at once may be slow or fail on low-memory devices.',
      'This tool creates ZIP files, not RAR files. A later extraction tool can support ZIP reading and separately evaluate read-only RAR support.',
    ],
    specs: [
      ['Processing location', 'Browser local'],
      ['Output format', '.zip'],
      ['RAR support', 'Creating .rar is not supported'],
      ['Compression level', '0 to 9, default 6'],
      ['File types', 'Any local file the browser can read'],
      ['Path handling', 'Filters empty, current-directory, and parent-directory path segments; duplicate names are renamed'],
    ],
    reference: [
      ['ZIP', 'An open and widely compatible archive format that can package files and compress their contents losslessly.'],
      ['RAR', 'A separate archive format with common extraction support, but creation constraints that make it unsuitable as a browser-local output here.'],
      ['Lossless compression', 'A compression method where decompression restores the original bytes, useful for archives, text, and code.'],
    ],
    faq: [
      {
        question: 'Are my files uploaded?',
        answer: 'No. The page reads local files with the File API and creates a ZIP Blob in the browser; the server does not receive file contents.',
      },
      {
        question: 'Why not create RAR files?',
        answer: 'RAR creation is not as open and browser-friendly as ZIP creation. For stability, compatibility, and clear licensing, this tool exports ZIP only.',
      },
    ],
  },
});
