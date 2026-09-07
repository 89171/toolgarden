import { defineToolContent } from './define';

export const zipExtractContent = defineToolContent({
  zh: {
    overview: [
      'ZIP 解压工具把压缩包直接读取到浏览器内存中，解析目录和文件条目后生成可下载的单文件 Blob。整个过程不需要把 ZIP 上传到服务器，适合快速查看压缩包内容。',
      '解压后的目录树按 ZIP 内部路径还原，支持多级子目录。目录可以展开和折叠，文件可以单独下载，避免为了取一个文件而把整个压缩包完全保存到磁盘再手动查找。',
    ],
    steps: [
      ['上传 ZIP', '选择或拖入一个 .zip 文件。页面会在本地读取压缩包字节，并尝试解析其中的目录和文件。'],
      ['查看目录结构', '解压成功后，右侧会显示目录树。目录行可以展开或折叠，文件行显示名称和解压后的大小。'],
      ['下载单个文件', '找到目标文件后点击下载。下载内容来自浏览器内存中的 Blob，不会经过服务器。'],
      ['清空后处理下一个包', '处理完当前压缩包后可以清空，再上传另一个 ZIP 文件。'],
    ],
    scenarios: [
      ['检查压缩包内容', '收到一个 ZIP 后先在浏览器里查看目录结构，确认里面有哪些文件，再决定是否下载。'],
      ['只取其中一个文件', '大型 ZIP 中只需要某个文档或图片时，可以展开目录并单独下载目标文件。'],
      ['隐私文件快速预览', '合同、证明材料、内部资料等不想上传到第三方服务的压缩包，可以在本地页面解压查看。'],
    ],
    notes: [
      '当前只支持 ZIP 解压，不支持 RAR、7z 或加密压缩包。遇到加密 ZIP 时，浏览器端库通常无法在这里完成密码交互。',
      '超大 ZIP 会占用浏览器内存。文件很多或单个文件很大时，低内存设备可能变慢或失败。',
      'ZIP 内路径会过滤上级目录片段，避免把不安全路径直接用于下载展示。下载时文件名使用条目的基础名称。',
    ],
    specs: [
      ['处理位置', '浏览器本地'],
      ['输入格式', '.zip'],
      ['输出方式', '单文件 Blob 下载'],
      ['目录展示', '按 ZIP 内路径生成多级目录树'],
      ['不支持格式', 'RAR、7z、tar、加密 ZIP'],
      ['隐私边界', '文件内容不上传服务器'],
    ],
    reference: [
      ['目录树', '根据 ZIP 条目路径拆分出的层级结构，用来展示文件所在文件夹和子文件夹。'],
      ['Blob URL', '浏览器为内存中的文件内容创建的临时下载地址，刷新页面或释放后失效。'],
      ['Zip Slip', '压缩包路径包含上级目录时可能造成的路径穿越问题；本工具会过滤这类路径片段。'],
    ],
    faq: [
      {
        question: '解压后的文件会上传吗？',
        answer: '不会。ZIP 读取、解压、目录展示和文件下载都在浏览器本地完成。',
      },
      {
        question: '可以解压 RAR 吗？',
        answer: '当前不支持。RAR 和 7z 的浏览器端解压支持不如 ZIP 稳定，这个工具先聚焦 ZIP。',
      },
    ],
  },
  en: {
    overview: [
      'The ZIP extractor reads the archive directly into browser memory, parses folder and file entries, and creates downloadable Blob objects for individual files. The ZIP does not need to be uploaded to a server.',
      'The extracted tree mirrors paths stored inside the ZIP archive and supports nested folders. You can expand and collapse folders, then download a single file without first saving and browsing the whole archive manually.',
    ],
    steps: [
      ['Upload a ZIP', 'Choose or drag in one .zip file. The page reads archive bytes locally and attempts to parse folders and files.'],
      ['Browse the folder tree', 'After extraction, the right panel shows a tree. Folder rows expand and collapse, while file rows show names and extracted sizes.'],
      ['Download one file', 'Find the target file and click download. The downloaded content comes from a browser Blob, not a server response.'],
      ['Clear and process another archive', 'When finished, clear the current ZIP and upload another one.'],
    ],
    scenarios: [
      ['Inspect archive contents', 'Open a ZIP in the browser to confirm what files it contains before deciding what to download.'],
      ['Pull out one needed file', 'When a large ZIP contains only one document or image you need, expand the folders and download that file directly.'],
      ['Preview private archives', 'Contracts, identity documents, and internal material can be inspected locally without sending the archive to a third-party service.'],
    ],
    notes: [
      'This tool currently supports ZIP only, not RAR, 7z, or encrypted archives. Password flows are not handled by this browser-local implementation.',
      'Very large ZIP files use browser memory. Archives with many files or huge entries may be slow or fail on low-memory devices.',
      'Paths inside the ZIP are cleaned to remove parent-directory segments. Downloads use the entry basename as the saved filename.',
    ],
    specs: [
      ['Processing location', 'Browser local'],
      ['Input format', '.zip'],
      ['Output method', 'Individual file Blob download'],
      ['Folder display', 'Nested tree generated from ZIP entry paths'],
      ['Unsupported formats', 'RAR, 7z, tar, encrypted ZIP'],
      ['Privacy boundary', 'File contents are not uploaded to the server'],
    ],
    reference: [
      ['Folder tree', 'A hierarchy built by splitting ZIP entry paths into folders and subfolders.'],
      ['Blob URL', 'A temporary browser download URL for file content held in memory. It expires after release or page refresh.'],
      ['Zip Slip', 'A path traversal risk from archive entries containing parent-directory segments; this tool filters those segments.'],
    ],
    faq: [
      {
        question: 'Are extracted files uploaded?',
        answer: 'No. Reading, extraction, folder display, and file downloads happen locally in the browser.',
      },
      {
        question: 'Can it extract RAR files?',
        answer: 'Not currently. Browser support for RAR and 7z extraction is less stable than ZIP, so this tool focuses on ZIP first.',
      },
    ],
  },
});
