import type { BlogArticle } from './articles';

export const browserResourceArticles = [
  {
    "slug": "image-metadata-exif-explained-remove",
    "publishedAt": "2026-10-10",
    "updatedAt": "2026-10-10",
    "translations": {
      "zh": {
        "title": "图片 Metadata / EXIF 是什么？如何删除照片中的 EXIF 信息？",
        "excerpt": "理解 EXIF、XMP、IPTC 与 ICC 的区别，选择无损清理或重新编码，并验证 GPS、方向和色彩是否符合分享要求。",
        "metaTitle": "图片 Metadata / EXIF 是什么？如何删除照片中的 EXIF 信息？",
        "metaDescription": "理解 EXIF、XMP、IPTC 与 ICC 的区别，选择无损清理或重新编码，并验证 GPS、方向和色彩是否符合分享要求。",
        "readingTime": "约 8 分钟阅读",
        "tags": [
          "EXIF",
          "图片",
          "隐私"
        ],
        "relatedTools": [
          {
            "label": "图片 EXIF 查看 / 清除",
            "href": "/image/exif",
            "description": "检查照片字段并生成清理副本。"
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "照片包含两类信息：构成画面的像素，以及描述拍摄、编辑和显示方式的元数据。清除 EXIF 能减少拍摄信息泄露，但不会抹掉画面里的门牌、人脸或屏幕文字。可靠的流程是检查原文件、选择清理范围、导出副本，再检查实际分享的文件。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Metadata 是总称，EXIF 只是其中一种"
          },
          {
            "type": "paragraph",
            "text": "EXIF 通常记录拍摄时间、相机型号、镜头、曝光参数、方向和 GPS。它并不是每张图片都有的必填表格：关闭定位、编辑器导出或平台转码都可能让部分字段缺失。DateTimeOriginal 也不一定带时区，不能直接把它当作 UTC 时间。"
          },
          {
            "type": "table",
            "headers": [
              "类别",
              "常见内容",
              "清理时注意"
            ],
            "rows": [
              [
                "EXIF",
                "GPS、拍摄时间、设备、方向、缩略图",
                "删除方向标签可能让照片横倒"
              ],
              [
                "XMP / IPTC",
                "作者、版权、关键词、位置、编辑记录",
                "只删 EXIF 不会自动清除此处的副本"
              ],
              [
                "ICC 色彩配置",
                "颜色应如何解释",
                "盲目删除可能改变显示颜色"
              ],
              [
                "文件系统属性",
                "文件名、修改时间",
                "与嵌入图片的拍摄时间不同"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "JPEG 常把 EXIF 放在 APP1 段中，但 APP1 也可容纳 XMP；PNG、WebP 有各自的容器结构。不要用字符串替换或“删除所有 APP 段”来清理二进制文件，这会误删色彩等信息，甚至损坏文件。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "先决定删什么，再选择方法"
          },
          {
            "type": "paragraph",
            "text": "若目的是不暴露家庭位置，检查 GPS 和 XMP/IPTC 中的位置字段；若目的是匿名分享，还要检查作者、设备序列号、拍摄时间和内嵌缩略图。保留版权或 ICC 是合理选择，但应该明确记录保留了什么，而不是宣称文件“没有任何元数据”。"
          },
          {
            "type": "table",
            "headers": [
              "方法",
              "画质影响",
              "适合场景"
            ],
            "rows": [
              [
                "按容器删除元数据",
                "支持的 JPEG 路径可保留压缩图像数据",
                "需要保持画质、批量处理"
              ],
              [
                "解码后通过 Canvas 重新导出",
                "JPEG 会再次有损编码，色彩或格式可能变化",
                "浏览器中生成便于分享的副本"
              ],
              [
                "截图或改扩展名",
                "截图改变像素；改名不改变内容",
                "不能当作可靠的元数据清理方法"
              ]
            ]
          },
          {
            "type": "heading",
            "level": 2,
            "text": "用 ExifTool 生成清理副本"
          },
          {
            "type": "paragraph",
            "text": "下面命令以普通 JPEG 为例，需要本机已安装 ExifTool。两个输出命令是不同清理策略：第一个只删除 EXIF；第二个尝试删除可写元数据，再恢复方向和 ICC。第二个结果仍有方向等元数据，这是有意保留。输出路径须尚不存在；不要直接把这套命令套到 RAW、TIFF 或所有图片格式。"
          },
          {
            "type": "code",
            "language": "bash",
            "code": "# Inspect the source, including duplicate and unknown tags.\nexiftool -a -u -G1 -s photo.jpg\n\n# Create a separate JPEG with EXIF removed; keep the original.\nexiftool -EXIF:all= -o photo-no-exif.jpg photo.jpg\n\n# Alternative: remove writable metadata, preserving orientation and ICC.\nexiftool -all= -tagsfromfile @ -Orientation -ICC_Profile -o photo-share.jpg photo.jpg\n\n# Inspect the actual file you intend to share.\nexiftool -a -u -G1 -s photo-share.jpg"
          },
          {
            "type": "paragraph",
            "text": "检查输出时，File 和 System 分组中的大小、路径或文件修改时间不等于 EXIF 残留。相反，若 XMP 或 IPTC 仍包含地点、作者等敏感字段，就需要继续调整清理范围。任何“全部删除”选项都受工具与格式支持范围约束。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "在 ToolGarden 中如何操作？"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "打开图片 EXIF 查看 / 清除工具，选择本地照片，先查看解析出的字段。",
              "重点检查位置、时间和设备信息；“未读到 EXIF”仅表示当前解析器未返回字段。",
              "点击清除并下载，保留原图。当前实现通过 Canvas 重新编码：按 .jpg / .jpeg 文件名输出 JPEG，其他输入输出 PNG。",
              "重新选中下载后的副本检查字段，并用图片查看器确认方向、颜色、尺寸和透明区域。"
            ]
          },
          {
            "type": "paragraph",
            "text": "这里的清除并非原地编辑 EXIF，也不是无损 JPEG 元数据剥离。当前 JPEG 导出质量参数为 0.95；其他格式转成 PNG 后可能明显变大，动画也不能指望保留。处理重要图片时，可再用独立工具检查导出文件，而不是只依赖同一个解析器的空结果。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "为什么清理后可能横倒或变色？"
          },
          {
            "type": "paragraph",
            "text": "有些相机把像素横着存储，再通过 Orientation 告诉查看器旋转或镜像。直接删标签会丢失这条指令：应保留方向，或先正确变换像素再清理，避免已经应用方向后又旋转一次。ICC 则描述颜色解释方式，移除配置或重新编码都可能影响广色域图片；请比较导出前后的肤色、渐变和饱和色。"
          },
          {
            "type": "paragraph",
            "text": "最终验收包括两部分：元数据里不再有要移除的字段，画面也没有不想分享的可见信息。分享的是导出副本，不是同目录下的原图、备份或附带的 XMP sidecar；接收平台是否再次写入信息也要以最终下载文件为准。"
          },
          {
            "type": "callout",
            "title": "检查照片字段",
            "text": "先查看，再导出并复查清理副本。",
            "href": "/image/exif",
            "linkLabel": "打开 EXIF 工具"
          },
          {
            "type": "callout",
            "title": "参考：ExifTool 文档",
            "text": "删除选项、支持范围及格式限制。",
            "href": "https://exiftool.org/exiftool_pod.html",
            "linkLabel": "阅读官方文档"
          }
        ],
        "faq": [
          {
            "question": "没有 GPS 就安全了吗？",
            "answer": "不一定。作者、时间、设备字段、其他元数据容器和画面本身仍可能暴露信息。按分享目的检查，而不是只看 GPS 提示。"
          },
          {
            "question": "清除 EXIF 一定降低画质吗？",
            "answer": "不会必然降低。删除支持格式的元数据段可以不重编码像素；Canvas 导出 JPEG 则会再次编码，两种方法要区分。"
          }
        ]
      },
      "en": {
        "title": "What Is Image Metadata / EXIF, and How Do You Remove It?",
        "excerpt": "Compare EXIF, XMP, IPTC and ICC, choose metadata stripping or re-encoding, and verify location, orientation and color in the exported photo.",
        "metaTitle": "What Is Image Metadata / EXIF, and How Do You Remove It?",
        "metaDescription": "Compare EXIF, XMP, IPTC and ICC, choose metadata stripping or re-encoding, and verify location, orientation and color in the exported photo.",
        "readingTime": "8 min read",
        "tags": [
          "EXIF",
          "images",
          "privacy"
        ],
        "relatedTools": [
          {
            "label": "EXIF Viewer and Cleaner",
            "href": "/image/exif",
            "description": "Inspect metadata and export a cleaned copy."
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "A photo carries both visible pixels and information describing capture, editing and display. Removing EXIF reduces exposure of capture details, but cannot erase an address, face or document visible in the image. Inspect the source, choose a removal policy, export a separate copy and verify the file that will actually be shared."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "EXIF is one kind of metadata"
          },
          {
            "type": "paragraph",
            "text": "EXIF can contain camera and lens models, exposure settings, capture time, orientation, GPS and thumbnails. Fields are optional and may disappear during editing or platform conversion. A capture timestamp without a timezone is not automatically UTC. Metadata absence also does not prove where a photo originated."
          },
          {
            "type": "table",
            "headers": [
              "Category",
              "Typical contents",
              "Removal concern"
            ],
            "rows": [
              [
                "EXIF",
                "Capture time, camera, GPS, orientation",
                "Deleting orientation can change display"
              ],
              [
                "XMP / IPTC",
                "Creator, copyright, keywords, location",
                "Sensitive values may survive outside EXIF"
              ],
              [
                "ICC profile",
                "Color interpretation",
                "Removal may change appearance"
              ],
              [
                "Filesystem",
                "Filename and modification time",
                "Separate from embedded capture metadata"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "JPEG commonly stores EXIF in an APP1 segment, but XMP may also use APP1. PNG and WebP have different container structures. Removing bytes by text matching or deleting every application segment is not a sound parser and can damage the image."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Choose a removal policy"
          },
          {
            "type": "paragraph",
            "text": "For location privacy, examine location fields across containers. For anonymous sharing, also consider creator identity, camera serial numbers, timestamps and embedded thumbnails. Keeping copyright or a color profile can be intentional; document those exceptions rather than describing the result as having no metadata whatsoever."
          },
          {
            "type": "table",
            "headers": [
              "Method",
              "Image effect",
              "Use case"
            ],
            "rows": [
              [
                "Container-aware stripping",
                "Can preserve JPEG compressed image data",
                "Preserve visual quality"
              ],
              [
                "Canvas re-encoding",
                "JPEG is encoded again; color or format may change",
                "Create a browser-exported copy"
              ],
              [
                "Screenshot or rename",
                "Screenshot changes pixels; rename changes no content",
                "Not a dependable metadata-removal workflow"
              ]
            ]
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Create a copy with ExifTool"
          },
          {
            "type": "paragraph",
            "text": "The following examples require a local ExifTool installation and target ordinary JPEG files. Choose either EXIF-only removal or broader writable-metadata removal with orientation and ICC restored. The latter deliberately retains some metadata. Use output paths that do not already exist, and do not generalize these commands to RAW, TIFF or every supported format."
          },
          {
            "type": "code",
            "language": "bash",
            "code": "# Inspect the source, including duplicate and unknown tags.\nexiftool -a -u -G1 -s photo.jpg\n\n# Create a separate JPEG with EXIF removed; keep the original.\nexiftool -EXIF:all= -o photo-no-exif.jpg photo.jpg\n\n# Alternative: remove writable metadata, preserving orientation and ICC.\nexiftool -all= -tagsfromfile @ -Orientation -ICC_Profile -o photo-share.jpg photo.jpg\n\n# Inspect the actual file you intend to share.\nexiftool -a -u -G1 -s photo-share.jpg"
          },
          {
            "type": "paragraph",
            "text": "In inspection results, filesystem size and modification time are not evidence of remaining EXIF. Location or author values in XMP and IPTC are relevant remaining data. Removal scope depends on the format and the tool, so verification matters even when an option says all."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Use the ToolGarden workflow"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "Select a local photo in the EXIF viewer and inspect the parsed fields.",
              "Review location, capture time and device details; an empty result only means the current parser returned no fields.",
              "Export a cleaned copy and retain the original. The current tool re-encodes through Canvas, choosing JPEG for .jpg/.jpeg filenames and PNG otherwise.",
              "Reopen the downloaded file and inspect metadata, dimensions, orientation, color and transparency."
            ]
          },
          {
            "type": "paragraph",
            "text": "This is not lossless JPEG metadata stripping. The current JPEG quality parameter is 0.95. Other formats converted to PNG can grow substantially, and animation should not be expected to survive. For important files, inspect the output with a second parser rather than treating an empty result from the same viewer as complete proof."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Check orientation and color"
          },
          {
            "type": "paragraph",
            "text": "Some cameras store sideways pixels and use Orientation to request a rotation or mirror operation at display time. Preserve that instruction or apply it correctly to pixels before removal. Do not rotate twice after a decoder has already applied it. ICC profiles describe color interpretation; compare skin tones, gradients and saturated colors after exporting."
          },
          {
            "type": "paragraph",
            "text": "The final check covers both metadata and visible content. Share the exported copy rather than the original or a companion XMP sidecar. If a platform rewrites the image, inspect a downloaded copy from that platform when its final metadata matters."
          },
          {
            "type": "callout",
            "title": "Inspect your photo",
            "text": "Read the fields, export a copy and inspect it again.",
            "href": "/image/exif",
            "linkLabel": "Open EXIF Viewer"
          },
          {
            "type": "callout",
            "title": "Reference: ExifTool",
            "text": "Removal options and format limitations.",
            "href": "https://exiftool.org/exiftool_pod.html",
            "linkLabel": "Read the documentation"
          }
        ],
        "faq": [
          {
            "question": "Does missing GPS mean the photo is private?",
            "answer": "No. Other metadata containers, capture details and visible content may still reveal information."
          },
          {
            "question": "Does removing EXIF always reduce quality?",
            "answer": "Container-aware stripping need not re-encode JPEG pixels. Canvas export does re-encode, so the methods have different tradeoffs."
          }
        ]
      }
    }
  },
  {
    "slug": "avoid-browser-large-file-memory-copies",
    "publishedAt": "2026-10-10",
    "updatedAt": "2026-10-10",
    "translations": {
      "zh": {
        "title": "如何避免浏览器处理大文件时内存翻倍？",
        "excerpt": "从数据副本、流式背压、Worker transfer 和结果生命周期入手，控制浏览器大文件处理的峰值内存。",
        "metaTitle": "如何避免浏览器处理大文件时内存翻倍？",
        "metaDescription": "从数据副本、流式背压、Worker transfer 和结果生命周期入手，控制浏览器大文件处理的峰值内存。",
        "readingTime": "约 8 分钟阅读",
        "tags": [
          "浏览器",
          "内存",
          "文件处理"
        ],
        "relatedTools": [
          {
            "label": "文件压缩 / 解压",
            "href": "/zip-extract",
            "description": "观察压缩包输入、展开内容与下载输出的不同体积。"
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "内存翻倍往往发生在格式转换的交界处：原始字节还在，新的字符串、像素或 Worker 副本已经生成。优化目标不是让变量数量最少，而是让同一时刻必须存活的数据表示最少。先画出读取、处理、导出和预览链路，再逐段削减副本。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "先列出同时存活的数据"
          },
          {
            "type": "paragraph",
            "text": "假设一个 100 MiB 文件先读为 ArrayBuffer，再转成 Base64，并把原 Buffer 克隆给 Worker：主线程 Buffer 和 Worker Buffer 就有约 200 MiB，Base64 又约有 133.3 MiB 个字符；字符串实际占用取决于引擎，不能一律当成每字符两字节。File 可能由磁盘支持，也不能机械地再加一个完整文件大小。"
          },
          {
            "type": "table",
            "headers": [
              "操作",
              "是否新增完整表示",
              "替代方式"
            ],
            "rows": [
              [
                "new Uint8Array(buffer)",
                "只建视图，共享底层 Buffer",
                "需要只读访问时直接使用"
              ],
              [
                "typedArray.slice()",
                "复制选中范围",
                "只需视图时用 subarray()"
              ],
              [
                "blob.arrayBuffer() / file.text()",
                "物化完整字节或文本",
                "支持增量时使用 stream()"
              ],
              [
                "postMessage(buffer)",
                "无 transfer 时通常克隆字节",
                "转移所有权或分块发送"
              ],
              [
                "toDataURL()",
                "生成 Base64 字符串",
                "二进制导出优先 toBlob()"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "共享视图也有代价：保留一个很小的 subarray，会让整个底层大 Buffer 保持可达。如果只需长期留下十几个字节，把这小段复制出来，反而能释放大 Buffer。不能把“零复制”当作不考虑生命周期的固定规则。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "流式处理必须连输出端一起设计"
          },
          {
            "type": "paragraph",
            "text": "下面是一个保留原字节的流式复制函数，destination 必须是真正逐块写出的目标，例如已获得授权的文件写入流。它不是图片压缩器；插入转换器时，还要确认算法能增量运行，并限制转换器内部缓存。pipeTo 会传播背压，并默认在完成时关闭目标，在错误或取消时传播终止。"
          },
          {
            "type": "code",
            "language": "typescript",
            "code": "async function copyWithBackpressure(\n  file: File,\n  destination: WritableStream<Uint8Array>,\n  signal: AbortSignal,\n): Promise<void> {\n  await file.stream().pipeTo(destination, { signal });\n}"
          },
          {
            "type": "paragraph",
            "text": "如果目标只是把 chunks 推进数组，最后 new Blob(chunks)，内存仍随总输出增长。new Response(stream).blob() 也会汇集完整结果。对缺少文件流写入能力的浏览器，可以限制输出大小或切换桌面工具，不要宣称只要用了 stream() 就是恒定内存。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "把所有权交给 Worker，而不是复制输入"
          },
          {
            "type": "code",
            "language": "typescript",
            "code": "// Main thread: worker is an existing Worker.\nconst buffer = await file.arrayBuffer();\nworker.postMessage({ buffer }, [buffer]);\n// buffer.byteLength is now 0: ownership was transferred.\n// Do not read or reuse views backed by buffer here."
          },
          {
            "type": "paragraph",
            "text": "transfer 列表转移的是 ArrayBuffer，不是 Uint8Array 视图；数据还必须出现在消息体中。转移后主线程的 Buffer 及其视图不可继续使用，应只保留任务 ID、进度和必要的文件信息。Worker 内部的解码、WASM 堆拷贝和输出分配仍可能增加内存。"
          },
          {
            "type": "paragraph",
            "text": "此示例仍完整读取文件。真正的大文件增量任务可每次发送一个块，等 Worker 确认消费后再读下一块；只顾 transfer 而不停 postMessage 会把内存压力移到消息队列。普通 JSON.parse、某些 ZIP 库和整图编码器未必支持增量输入，应先检查处理库的契约。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "限制并发与结果保留"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "先把 Promise.all(files.map(process)) 改为逐个处理，记录单任务峰值后再决定是否允许两个并发。",
              "处理完一项就把输出写出；界面只保留文件名、状态和小缩略图，不把所有大 Blob 永久留在 state。",
              "替换预览时释放旧 Object URL，结束使用 ImageBitmap 后 close()；移除事件监听和不再需要的历史结果。",
              "取消任务时停止读取与排队，并让 Worker 丢弃旧任务结果；中断 CPU 密集 Worker 时清理关联预览和输出。"
            ]
          },
          {
            "type": "paragraph",
            "text": "流式输入不代表可以任意切分内容。文本块可能在 UTF-8 多字节字符中间结束，要使用支持跨块状态的 TextDecoder；按行处理还需要限制单行长度。否则一个没有换行的巨大输入会让“残留半行”缓存变成新的完整文件。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "如何证明优化有效？"
          },
          {
            "type": "paragraph",
            "text": "固定同一浏览器、文件和操作顺序，记录处理前、处理中峰值、清理后的内存。重复运行十轮，观察清理后的基线是否持续上升，同时比较耗时和结果正确性。既看 JS 堆，也看标签页进程内存；Blob、图像和原生编解码资源不一定完整体现在堆快照里。具体数字来自实测，不能保证优化后恰好减少一半。"
          },
          {
            "type": "callout",
            "title": "继续排查崩溃",
            "text": "区分瞬时峰值、长期泄漏和主线程卡顿。",
            "href": "/blog/why-browser-large-files-crash",
            "linkLabel": "阅读崩溃排查"
          },
          {
            "type": "callout",
            "title": "参考：可转移对象",
            "text": "查看 Buffer 转移与 detached 状态。",
            "href": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects",
            "linkLabel": "阅读 MDN"
          }
        ],
        "faq": [
          {
            "question": "用了 Worker 就不会内存翻倍吗？",
            "answer": "不会。未 transfer 的消息、Worker 内部副本、输出和消息队列仍会占用内存。Worker 主要隔离主线程计算。"
          },
          {
            "question": "所有文件都能分块处理吗？",
            "answer": "不能。读取 API 支持分块，不等于解析算法和输出库支持增量；需要整份输入的库仍有完整工作集。"
          }
        ]
      },
      "en": {
        "title": "How Do You Avoid Doubling Memory When Processing Large Files in a Browser?",
        "excerpt": "Control peak memory by reducing representations, using backpressure, transferring Worker buffers and limiting retained results.",
        "metaTitle": "How Do You Avoid Doubling Memory When Processing Large Files in a Browser?",
        "metaDescription": "Control peak memory by reducing representations, using backpressure, transferring Worker buffers and limiting retained results.",
        "readingTime": "8 min read",
        "tags": [
          "browser",
          "memory",
          "file processing"
        ],
        "relatedTools": [
          {
            "label": "ZIP Extractor",
            "href": "/zip-extract",
            "description": "Compare compressed inputs, expanded entries and output sizes."
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "Memory often doubles at a conversion boundary: old bytes remain reachable while a new string, pixel buffer or Worker copy is created. The useful optimization target is the number and size of simultaneously live representations, not the number of variables. Draw the path from input through processing, export and preview before changing code."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Inventory live representations"
          },
          {
            "type": "paragraph",
            "text": "A 100 MiB input read into an ArrayBuffer and cloned to a Worker accounts for about 200 MiB of byte buffers. A Base64 version adds about 139.8 million characters (133.3 MiB if stored as one byte each). Actual string storage depends on the engine. A File may be disk-backed, so do not automatically count it as another full resident copy."
          },
          {
            "type": "table",
            "headers": [
              "Operation",
              "Allocation behavior",
              "Alternative"
            ],
            "rows": [
              [
                "new Uint8Array(buffer)",
                "Shares backing buffer",
                "Use for byte access"
              ],
              [
                "typedArray.slice()",
                "Copies the selected range",
                "subarray() creates a view"
              ],
              [
                "blob.arrayBuffer() / file.text()",
                "Materializes complete content",
                "Use incremental reading when supported"
              ],
              [
                "postMessage(buffer)",
                "Clones without transfer",
                "Transfer ownership"
              ],
              [
                "toDataURL()",
                "Creates a Base64 string",
                "Prefer toBlob() for binary output"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "A small view can retain a huge backing buffer. If only a tiny header must survive, copying that header can release more memory than keeping a zero-copy view. Ownership and lifetime are as important as avoiding allocations."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Stream to a real output sink"
          },
          {
            "type": "paragraph",
            "text": "This function copies bytes to a WritableStream, such as an already authorized file destination. It does not compress images. Any inserted transform must support incremental work and bound its own internal state. The destination must actually consume chunks instead of accumulating the entire result."
          },
          {
            "type": "code",
            "language": "typescript",
            "code": "async function copyWithBackpressure(\n  file: File,\n  destination: WritableStream<Uint8Array>,\n  signal: AbortSignal,\n): Promise<void> {\n  await file.stream().pipeTo(destination, { signal });\n}"
          },
          {
            "type": "paragraph",
            "text": "pipeTo applies backpressure and propagates completion and failure under its default options. Collecting chunks in an array and constructing a final Blob still retains the full output. new Response(stream).blob() also gathers the result. When a suitable file sink is unavailable, impose an output limit or offer a desktop workflow instead of promising constant memory."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Transfer ownership to a Worker"
          },
          {
            "type": "code",
            "language": "typescript",
            "code": "// Main thread: worker is an existing Worker.\nconst buffer = await file.arrayBuffer();\nworker.postMessage({ buffer }, [buffer]);\n// buffer.byteLength is now 0: ownership was transferred.\n// Do not read or reuse views backed by buffer here."
          },
          {
            "type": "paragraph",
            "text": "The transferable is the ArrayBuffer rather than its typed-array view, and it must also appear in the message payload. After transfer, the sender cannot continue using the detached buffer. Keep task identifiers and progress in application state rather than a second input copy."
          },
          {
            "type": "paragraph",
            "text": "This example still reads the whole input. An incremental design can send one chunk and wait for acknowledgement before reading the next. Unbounded postMessage calls simply move the backlog into the message queue. Decoding, WASM memory and output buffers can still allocate inside the Worker, and libraries built around whole-document parsing need a different memory budget."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Bound concurrency and retained results"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "Start with one active task instead of Promise.all over all files; measure before increasing concurrency.",
              "Write completed outputs promptly and retain status plus small thumbnails instead of every full Blob.",
              "Release obsolete preview URLs, close unused ImageBitmaps and remove listeners or history entries that retain data.",
              "On cancellation, stop reads and scheduling and discard late results from obsolete task IDs."
            ]
          },
          {
            "type": "paragraph",
            "text": "Chunk boundaries are not content boundaries. A UTF-8 character may span chunks, requiring a streaming decoder. A line reader also needs a maximum record size: a file with no newline can otherwise grow an unbounded partial-line buffer. Input streaming alone cannot fix that algorithmic choice."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Verify the improvement"
          },
          {
            "type": "paragraph",
            "text": "Compare the same file and browser before and after the change. Record idle baseline, processing peak and post-cleanup baseline, then repeat ten cycles. Check output correctness and duration alongside memory. Include process memory because native image and Blob resources may not be fully represented in a JavaScript heap snapshot. A reduction is an empirical result, not a guarantee that usage will be exactly halved."
          },
          {
            "type": "callout",
            "title": "Diagnose crashes",
            "text": "Separate transient peaks, leaks and main-thread stalls.",
            "href": "/blog/why-browser-large-files-crash",
            "linkLabel": "Read the crash guide"
          },
          {
            "type": "callout",
            "title": "Reference: transferable objects",
            "text": "Buffer ownership and detachment semantics.",
            "href": "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects",
            "linkLabel": "Read MDN"
          }
        ],
        "faq": [
          {
            "question": "Does a Worker prevent duplicate memory?",
            "answer": "No. Cloned messages, internal codec allocations, outputs and queued work still consume memory."
          },
          {
            "question": "Can every file be processed in chunks?",
            "answer": "No. Both the algorithm and the output library must support incremental processing; chunked reading alone is insufficient."
          }
        ]
      }
    }
  },
  {
    "slug": "why-browser-large-files-crash",
    "publishedAt": "2026-10-10",
    "updatedAt": "2026-10-10",
    "translations": {
      "zh": {
        "title": "为什么浏览器处理大文件容易崩溃？",
        "excerpt": "用图片、音频和 ZIP 的工作集估算解释浏览器崩溃，区分内存峰值、泄漏和卡顿，并建立可重复的诊断流程。",
        "metaTitle": "为什么浏览器处理大文件容易崩溃？",
        "metaDescription": "用图片、音频和 ZIP 的工作集估算解释浏览器崩溃，区分内存峰值、泄漏和卡顿，并建立可重复的诊断流程。",
        "readingTime": "约 8 分钟阅读",
        "tags": [
          "浏览器",
          "内存",
          "文件处理"
        ],
        "relatedTools": [
          {
            "label": "图片压缩",
            "href": "/image/compress",
            "description": "尝试降低图片尺寸，并比较结果大小与处理成本。"
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "浏览器处理大文件时，文件在磁盘上的体积只是输入量，不是运行时所需内存。解码、算法工作区、导出结果与预览可能同时存在；进程还受到设备可用内存和实现限制。应先找出失败阶段，才能判断该降分辨率、减并发，还是更换处理方式。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "一张 12 MB 照片为什么可能需要几百 MB？"
          },
          {
            "type": "paragraph",
            "text": "假设 JPEG 的尺寸是 6000 × 4000。只按常见的 8 位 RGBA 表示，一份像素数据就是 6000 × 4000 × 4 = 96,000,000 字节，约 91.6 MiB。如果解码图、Canvas 和 getImageData() 返回的像素各有一份，总量就约 274.7 MiB，还没算输入、编码器工作区、输出和浏览器本身。具体实现可能共享资源，也可能产生额外副本，这是一种容量估算而非内存测量。"
          },
          {
            "type": "table",
            "headers": [
              "输入类型",
              "应估算什么",
              "示例或边界"
            ],
            "rows": [
              [
                "图片",
                "宽 × 高 × 每像素字节数 × 同时存在的表面",
                "降低 JPEG quality 不会减少原图解码像素数"
              ],
              [
                "音频",
                "采样率 × 秒数 × 声道数 × 每采样字节数",
                "10 分钟、48 kHz、双声道 Float32 约 219.7 MiB"
              ],
              [
                "ZIP",
                "实际解压字节数、条目数和并发",
                "压缩包大小不能给出可靠的展开上限"
              ],
              [
                "JSON",
                "文本、对象树、格式化输出和渲染节点",
                "对象数量与嵌套结构都会影响开销"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "把图片宽和高都缩为一半，目标像素数变为四分之一；但如果库必须先完整解码原图，再缩小输出，输入端峰值仍然存在。限制源图尺寸与减少输出尺寸是两个不同的控制点。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "崩溃、卡死和泄漏是三种不同问题"
          },
          {
            "type": "table",
            "headers": [
              "现象",
              "可能原因",
              "先验证什么"
            ],
            "rows": [
              [
                "某个文件第一次就让标签页退出",
                "瞬时工作集过大、编解码器故障、系统终止",
                "尺寸、阶段、相同文件是否可重复"
              ],
              [
                "点击后界面无响应但最终完成",
                "主线程长任务",
                "Performance 中的调用栈和任务时长"
              ],
              [
                "连续处理多次才失败",
                "结果积累或资源泄漏",
                "清空后基线是否逐轮增长"
              ],
              [
                "JS 堆不高但进程内存很高",
                "像素、原生缓冲、GPU 或 WASM 资源",
                "进程指标与各资源生命周期"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "没有一个适用于所有浏览器的“超过 500 MB 必崩溃”阈值。操作系统、手机后台策略、其他标签页、引擎版本、连续大块内存分配和 Canvas 尺寸限制都可能改变结果。try/catch 能处理部分分配或解码错误，但不能保证捕获系统直接终止渲染进程的情况。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "按阶段定位，而不是只看最终报错"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "建立最小复现：固定一个文件，记录字节数、像素尺寸或时长、浏览器和设备，先只运行一个任务。",
              "给读取、解码、变换、编码、预览标记开始与结束时间，找出最后成功的阶段。",
              "用浏览器任务管理器观察进程内存，用 DevTools Performance 查看长任务；需要查 JS 引用时再比较堆快照。",
              "重复“处理—清空”十轮，比较清理后的基线；再分别把分辨率、时长和并发减半，观察哪项改变失败点。",
              "在低内存目标设备上复测，并测试取消、坏文件和多次重试，避免只验证开发电脑上的单次成功。"
            ]
          },
          {
            "type": "paragraph",
            "text": "堆快照中的保留路径能解释为什么对象仍被 state、闭包或监听器持有，但快照本身也有成本。不要在已经接近内存极限的任务上频繁抓快照。开发工具还可能保留你在控制台查看过的大对象，最好再在关闭开发工具的条件下复测真实用户流程。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "让限制与实际工作量相关"
          },
          {
            "type": "paragraph",
            "text": "图片应限制像素数，音频应限制时长和声道，压缩包应同时限制条目数、单项和总展开字节数。对解压任务要在实际输出过程中计数并中止，不能只相信文件头声明的大小。恶意压缩包可能很小，却不断产生输出。"
          },
          {
            "type": "paragraph",
            "text": "建立产品预算时，可以用“基础占用 + 并发任务数 × 单任务工作集 + 保留结果 + 余量”估算。假设实测单任务峰值增量是 250 MiB，并发四个可能接近额外 1 GiB；真实重叠程度需测量。先降低并发、清理结果，再调整功能上限，通常比仅换一个 Worker 更直接。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "普通用户如何完成这次任务？"
          },
          {
            "type": "paragraph",
            "text": "关闭不需要的标签页能腾出空间，但无法改变任务本身的最低工作集。优先拆分批次、提前缩小源图或裁短音频、关闭不必要的实时预览；如果单文件仍超出能力，就转到支持该规模的桌面工具或合适的服务端流程。重试前先保留原文件，不要不断在已经积累输出的页面里重新运行。"
          },
          {
            "type": "callout",
            "title": "减少副本与峰值",
            "text": "用背压、所有权转移和有限并发改造处理流程。",
            "href": "/blog/avoid-browser-large-file-memory-copies",
            "linkLabel": "阅读内存优化方法"
          },
          {
            "type": "callout",
            "title": "参考：Chrome 内存诊断",
            "text": "任务管理器、堆快照和内存问题的诊断入口。",
            "href": "https://developer.chrome.com/docs/devtools/memory-problems",
            "linkLabel": "阅读官方文档"
          }
        ],
        "faq": [
          {
            "question": "电脑有很多内存，标签页为什么仍会失败？",
            "answer": "标签页不是无限使用整机内存的进程，还可能碰到分配、Canvas、编解码器或系统策略限制。应定位具体失败阶段。"
          },
          {
            "question": "Worker 能解决崩溃吗？",
            "answer": "它能减少主线程计算阻塞，但仍占用系统内存。只有同时改变副本、工作集和并发，才可能降低内存失败风险。"
          }
        ]
      },
      "en": {
        "title": "Why Do Browsers Crash When Processing Large Files?",
        "excerpt": "Estimate decoded working sets for images, audio and archives, distinguish peaks from leaks and stalls, and diagnose failures step by step.",
        "metaTitle": "Why Do Browsers Crash When Processing Large Files?",
        "metaDescription": "Estimate decoded working sets for images, audio and archives, distinguish peaks from leaks and stalls, and diagnose failures step by step.",
        "readingTime": "8 min read",
        "tags": [
          "browser",
          "memory",
          "file processing"
        ],
        "relatedTools": [
          {
            "label": "Image Compressor",
            "href": "/image/compress",
            "description": "Compare dimensions, output size and processing cost."
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "The size of a file on disk describes its encoded input, not the memory required to process it. Decoded content, algorithm workspace, output and preview resources can overlap. Device pressure and browser implementation limits also matter. Locate the failing stage before deciding whether to reduce dimensions, limit concurrency or move the workload."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "A small JPEG can require hundreds of megabytes"
          },
          {
            "type": "paragraph",
            "text": "A 6000 × 4000 image represented as ordinary 8-bit RGBA needs 96,000,000 bytes, about 91.6 MiB, for one pixel surface. If a decoded image, Canvas and getImageData result each retain a surface, that is about 274.7 MiB before input, encoder workspace, output and browser overhead. This is a capacity estimate: implementations may share storage or allocate additional surfaces."
          },
          {
            "type": "table",
            "headers": [
              "Input",
              "Estimate",
              "Important boundary"
            ],
            "rows": [
              [
                "Image",
                "Width × height × bytes per pixel × live surfaces",
                "Lower JPEG quality does not reduce source pixel count"
              ],
              [
                "Audio",
                "Sample rate × seconds × channels × bytes per sample",
                "10 min, 48 kHz stereo Float32 is about 219.7 MiB"
              ],
              [
                "ZIP",
                "Actual expanded bytes, entries and concurrency",
                "Compressed size is not an expansion bound"
              ],
              [
                "JSON",
                "Text, object graph, output and rendered nodes",
                "Structure affects memory as well as text size"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "Halving both dimensions quarters the destination pixel count. But a codec that first decodes the complete source can still hit the original peak before resizing. Source-dimension limits and output-dimension controls solve different parts of the problem."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Distinguish crashes, stalls and leaks"
          },
          {
            "type": "table",
            "headers": [
              "Symptom",
              "Possible cause",
              "First check"
            ],
            "rows": [
              [
                "First run exits the tab",
                "Excessive peak, codec failure or system termination",
                "Input dimensions and failing stage"
              ],
              [
                "UI freezes then recovers",
                "Main-thread long task",
                "Performance trace and call stack"
              ],
              [
                "Failure after repeated runs",
                "Retained results or leaked resources",
                "Post-cleanup baseline over multiple cycles"
              ],
              [
                "Low JS heap, high process memory",
                "Native, pixel, GPU or WASM allocations",
                "Resource lifetimes and process metrics"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "There is no universal file-size threshold that applies to every browser. Available system memory, background policies, other tabs, allocation constraints and Canvas limits can change the outcome. JavaScript error handling catches some failures, but cannot reliably catch the operating system terminating a renderer."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Reproduce the failure by stage"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "Fix one input and record its bytes, dimensions or duration, browser and device. Run one task first.",
              "Mark reading, decoding, transforming, encoding and preview creation so the last completed stage is visible.",
              "Observe process memory and use Performance traces for stalls; compare heap snapshots when investigating retained JavaScript objects.",
              "Repeat processing and clearing ten times, then independently reduce dimensions, duration or concurrency.",
              "Retest cancellation, corrupt inputs and retries on a lower-memory target device."
            ]
          },
          {
            "type": "paragraph",
            "text": "Retaining paths can identify state, closures or listeners that keep an object alive. Taking snapshots also costs memory, so avoid repeatedly profiling a workload already at its limit. Objects inspected in a console can remain reachable through developer tools; repeat the user flow with tools closed as a cross-check."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Budget for workload rather than encoded bytes"
          },
          {
            "type": "paragraph",
            "text": "Use pixel limits for images, duration and channel limits for audio, and entry-count plus per-entry and total expanded-byte limits for archives. Enforce decompression limits while bytes are produced rather than trusting declared sizes. A tiny hostile archive can generate far more output than its input suggests."
          },
          {
            "type": "paragraph",
            "text": "A planning model is baseline plus active tasks times their working set, plus retained results and a margin. If a measured task adds 250 MiB, four overlapping tasks may approach an extra GiB. Measure actual overlap rather than treating this as a fixed law. Reduce concurrency and retained outputs before simply moving the same allocations to a Worker."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Help users finish the job"
          },
          {
            "type": "paragraph",
            "text": "Closing unused tabs may free resources but does not change the minimum working set of this task. Split batches, resize source images, trim audio and disable unnecessary previews. If one input remains too large, use software designed for that workload. Keep the original and avoid repeated retries in a page already retaining previous results."
          },
          {
            "type": "callout",
            "title": "Reduce copies and peaks",
            "text": "Apply backpressure, transfer ownership and bound concurrency.",
            "href": "/blog/avoid-browser-large-file-memory-copies",
            "linkLabel": "Read the optimization guide"
          },
          {
            "type": "callout",
            "title": "Reference: Chrome memory diagnostics",
            "text": "Process memory, heap snapshots and diagnostic tools.",
            "href": "https://developer.chrome.com/docs/devtools/memory-problems",
            "linkLabel": "Read the documentation"
          }
        ],
        "faq": [
          {
            "question": "Why can a tab fail on a computer with plenty of RAM?",
            "answer": "Allocation, Canvas, codec and operating-system constraints can still apply. Identify the stage instead of assuming physical RAM is the only limit."
          },
          {
            "question": "Will moving work to a Worker fix crashes?",
            "answer": "It can improve responsiveness but still uses memory. Reducing copies, working sets and concurrency is a separate requirement."
          }
        ]
      }
    }
  },
  {
    "slug": "why-revoke-object-url",
    "publishedAt": "2026-10-10",
    "updatedAt": "2026-10-10",
    "translations": {
      "zh": {
        "title": "为什么 URL.createObjectURL() 用完需要 revoke？",
        "excerpt": "理解 Blob URL 的资源引用、垃圾回收边界与下载竞态，用明确的创建者和清理函数管理预览生命周期。",
        "metaTitle": "为什么 URL.createObjectURL() 用完需要 revoke？",
        "metaDescription": "理解 Blob URL 的资源引用、垃圾回收边界与下载竞态，用明确的创建者和清理函数管理预览生命周期。",
        "readingTime": "约 8 分钟阅读",
        "tags": [
          "浏览器",
          "内存",
          "Blob URL"
        ],
        "relatedTools": [
          {
            "label": "图片压缩",
            "href": "/image/compress",
            "description": "理解生成结果、预览和下载的资源生命周期。"
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "URL.createObjectURL(blob) 返回的短字符串不是文件内容，而是浏览器管理的一条资源映射。字符串离开作用域，不等于这条映射立即失效。长期运行的图片、音频或压缩工具如果不断生成新 URL，就需要在旧结果不再使用时撤销它们。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "短 URL 为什么能留住大资源？"
          },
          {
            "type": "paragraph",
            "text": "可以把关系理解为：界面持有 URL 字符串，浏览器的 URL 注册记录关联 Blob，Blob 关联底层数据。底层数据可能在内存或其他浏览器管理的存储里，不能根据 URL 字符串只有几十个字符就推断成本很小。"
          },
          {
            "type": "paragraph",
            "text": "对同一个 Blob 调用两次 createObjectURL，会得到两个独立的 URL；撤销其中一个不会撤销另一个。它们不一定各复制一份 Blob 字节，但每条未释放的映射都能延长资源可用时间。业务上应为每个结果保存一个明确的 URL，而不是每次渲染都创建新的。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "revoke 做了什么，又没有做什么？"
          },
          {
            "type": "table",
            "headers": [
              "操作",
              "含义",
              "不代表什么"
            ],
            "rows": [
              [
                "URL.revokeObjectURL(url)",
                "撤销这一条 URL 映射",
                "不删除用户已经下载的文件"
              ],
              [
                "释放 Blob 的 JS 引用",
                "让一条 JS 可达路径消失",
                "不自动撤销另一个 Object URL"
              ],
              [
                "移除 img / video",
                "结束当前界面的消费",
                "不保证所有原生缓存立即回收"
              ],
              [
                "关闭文档",
                "浏览器通常清理所属 Object URL",
                "不能替代长会话里的主动清理"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "revoke 后不要再用这个地址开始新读取。它不是强制垃圾回收指令，也不是“立即降低任务管理器数字”的承诺：其他 Blob 引用、已解码像素、仍在消费的资源或浏览器缓存都可能继续存在。排查时要看多轮操作后的趋势，而不是只看 revoke 下一行的数值。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "给预览一个明确的所有者"
          },
          {
            "type": "paragraph",
            "text": "下面示例让同一结果拥有图片和下载链接，返回一个幂等清理函数。示例输入是 PNG Blob；集成时在结果替换、清空或视图卸载时调用它，并在替换前处理旧结果。不要把最后的清理调用紧跟在创建后面，否则图片还没读到数据，URL 就已经无效。"
          },
          {
            "type": "code",
            "language": "typescript",
            "code": "function mountBlobPreview(blob: Blob, host: HTMLElement): () => void {\n  const url = URL.createObjectURL(blob);\n  const image = document.createElement('img');\n  const download = document.createElement('a');\n  image.alt = 'Generated image preview';\n  image.src = url;\n  download.href = url;\n  download.download = 'result.png'; // This example expects a PNG Blob.\n  download.textContent = 'Download PNG';\n  host.append(image, download);\n\n  let disposed = false;\n  return () => {\n    if (disposed) return;\n    disposed = true;\n    image.removeAttribute('src');\n    download.removeAttribute('href');\n    image.remove();\n    download.remove();\n    URL.revokeObjectURL(url);\n  };\n}\n\n// Keep this disposer with the current result.\nconst disposePreview = mountBlobPreview(pngBlob, resultContainer);\n// Call disposePreview() when this result is retired or the view unmounts,\n// not immediately after mounting or starting a download."
          },
          {
            "type": "paragraph",
            "text": "React 中同样应在 effect 内创建 URL，并让该次 effect 的 cleanup 只撤销自己创建的 URL。不要在 render 或 useMemo 中调用 createObjectURL 作为无清理的副作用；开发模式下重复挂载也能暴露生命周期错误。异步生成结果时要检查任务 ID：被替换的旧任务即使晚到，也不能把过期 URL 写回界面。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "为什么不能在 img.onload 里总是立即释放？"
          },
          {
            "type": "paragraph",
            "text": "加载完成表示图片已被读取，不表示用户不再需要原始地址。如果用户还要右键保存、在新标签打开，或多个元素共享这个 URL，提前撤销会让后续操作失败。用于一次性解码、确定没有后续消费者时可以结束生命周期；持续展示的预览则通常保留到移除。视频还可能继续读取或跳转，不能照搬单张图片的时机。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "下载之后等几秒再释放就可靠吗？"
          },
          {
            "type": "paragraph",
            "text": "a.click() 不是下载完成事件，浏览器也没有通用的 anchor 下载完成回调。紧跟 click 撤销可能和资源消费产生竞态；setTimeout 延迟一秒或一分钟都只是经验策略，不是完成证明。对于结果页，保留 URL 让用户重试下载，在结果退役时再清理，并在目标浏览器测试开始下载后切换结果的行为。"
          },
          {
            "type": "paragraph",
            "text": "若业务需要精确知道写入是否结束，可在支持环境中使用用户授权的文件写入流并等待关闭成功；这与普通下载链接是不同的交互和兼容性条件。不要为了省一个资源引用，把用户仍可能使用的下载入口变成失效链接。"
          },
          {
            "type": "heading",
            "level": 2,
            "text": "如何检查清理有没有漏？"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "在开发环境记录每个结果的创建和撤销次数，不记录 Blob 的敏感内容。",
              "连续生成、替换、清空十轮，确认已退役结果的 URL 都有撤销记录，活动结果数量有上限。",
              "检查预览、下载、右键保存、取消和离开页面后的行为，确认没有过早撤销。",
              "观察进程内存是否趋于稳定；若仍增长，继续检查 state 中的 Blob、ImageBitmap、Canvas 与 Worker，而不是反复调用 revoke。"
            ]
          },
          {
            "type": "callout",
            "title": "了解 Blob URL 基础",
            "text": "对比 Blob URL 和 Data URL 的数据表示与用途。",
            "href": "/blog/blob-url-createobjecturl-explained",
            "linkLabel": "阅读基础文章"
          },
          {
            "type": "callout",
            "title": "参考：Blob URL 生命周期",
            "text": "资源映射、释放和过早撤销的影响。",
            "href": "https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob",
            "linkLabel": "阅读 MDN"
          }
        ],
        "faq": [
          {
            "question": "把 url 变量设成 null 就够了吗？",
            "answer": "不够。丢掉字符串引用不会撤销浏览器注册的 URL，需要在所有者清理阶段显式 revoke。"
          },
          {
            "question": "revoke 后下载好的文件会消失吗？",
            "answer": "不会。它撤销浏览器中的临时 URL，不会删除已保存到磁盘的文件；但尚未消费该 URL 的操作可能失败。"
          }
        ]
      },
      "en": {
        "title": "Why Must You Revoke URL.createObjectURL() URLs After Use?",
        "excerpt": "Understand Blob URL ownership, garbage-collection boundaries and download races, and manage previews with an explicit cleanup function.",
        "metaTitle": "Why Must You Revoke URL.createObjectURL() URLs After Use?",
        "metaDescription": "Understand Blob URL ownership, garbage-collection boundaries and download races, and manage previews with an explicit cleanup function.",
        "readingTime": "8 min read",
        "tags": [
          "browser",
          "memory",
          "Blob URL"
        ],
        "relatedTools": [
          {
            "label": "Image Compressor",
            "href": "/image/compress",
            "description": "Explore generated output, preview and download lifetimes."
          }
        ],
        "blocks": [
          {
            "type": "paragraph",
            "text": "URL.createObjectURL(blob) returns a browser-managed resource address rather than encoded file contents. Losing the local string variable does not revoke that address. A long-running tool that generates previews needs a policy for retiring obsolete results and releasing their URLs."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "A short address can retain a large resource"
          },
          {
            "type": "paragraph",
            "text": "Think of three layers: the application string, the browser URL registration and the backing Blob data. Storage may be memory-backed or otherwise managed by the browser. String length therefore says little about the retained resource cost."
          },
          {
            "type": "paragraph",
            "text": "Two createObjectURL calls on the same Blob produce independent addresses. They need not duplicate all underlying bytes, but revoking one does not retire the other. Keep a tracked URL per result instead of generating fresh addresses during every render."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "What revocation does"
          },
          {
            "type": "table",
            "headers": [
              "Action",
              "Effect",
              "Does not guarantee"
            ],
            "rows": [
              [
                "revokeObjectURL(url)",
                "Removes this address mapping",
                "Deletion of downloaded files"
              ],
              [
                "Drop a Blob reference",
                "Removes one JS retaining path",
                "Revocation of other URLs"
              ],
              [
                "Remove a media element",
                "Ends that UI consumer",
                "Immediate native-cache release"
              ],
              [
                "Close the document",
                "Usually releases its URL registrations",
                "Cleanup during a long session"
              ]
            ]
          },
          {
            "type": "paragraph",
            "text": "Do not start a new read from a revoked address. Revocation is not a forced garbage collection call: other Blob references, decoded surfaces or active consumers may retain resources. A process-memory number need not fall immediately. Evaluate repeated-use behavior rather than expecting an instant drop after one function call."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Make the result own its preview"
          },
          {
            "type": "paragraph",
            "text": "The following example owns one image and one download link and returns an idempotent disposer. It expects a PNG Blob. Keep the disposer with that result and call it when replacing, clearing or unmounting the view. Calling it immediately after mounting would invalidate the URL before asynchronous consumers are ready."
          },
          {
            "type": "code",
            "language": "typescript",
            "code": "function mountBlobPreview(blob: Blob, host: HTMLElement): () => void {\n  const url = URL.createObjectURL(blob);\n  const image = document.createElement('img');\n  const download = document.createElement('a');\n  image.alt = 'Generated image preview';\n  image.src = url;\n  download.href = url;\n  download.download = 'result.png'; // This example expects a PNG Blob.\n  download.textContent = 'Download PNG';\n  host.append(image, download);\n\n  let disposed = false;\n  return () => {\n    if (disposed) return;\n    disposed = true;\n    image.removeAttribute('src');\n    download.removeAttribute('href');\n    image.remove();\n    download.remove();\n    URL.revokeObjectURL(url);\n  };\n}\n\n// Keep this disposer with the current result.\nconst disposePreview = mountBlobPreview(pngBlob, resultContainer);\n// Call disposePreview() when this result is retired or the view unmounts,\n// not immediately after mounting or starting a download."
          },
          {
            "type": "paragraph",
            "text": "In React, create the address inside an effect and let that effect cleanup revoke exactly the address it created. Creating URLs as untracked render-time side effects makes abandoned renders difficult to clean up. Async output also needs task identity checks so a late result cannot reinstall an obsolete preview after cancellation."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Loaded does not always mean unused"
          },
          {
            "type": "paragraph",
            "text": "An image load event is not necessarily the end of the address lifetime. A visible preview may still need right-click saving or opening in another tab, and other elements may share its address. One-shot decoding with no remaining consumers has a different retirement point from an interactive result. Video can also continue reading or seeking."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Downloads do not provide a universal completion callback"
          },
          {
            "type": "paragraph",
            "text": "An anchor click starts an action; it is not a promise that the download has consumed the URL. Immediate revocation can race that consumption. A timeout is a heuristic rather than proof of completion. For a result page, retaining a usable download link until the result is retired also lets users retry. Test starting a download and switching results in the target browsers."
          },
          {
            "type": "paragraph",
            "text": "When a product needs explicit write completion, a supported, user-authorized file writing API can provide a close operation to await. That is a different compatibility and interaction choice from an ordinary download anchor. Do not silently turn an active download affordance into a broken address just to minimize a reference count."
          },
          {
            "type": "heading",
            "level": 2,
            "text": "Audit repeated use"
          },
          {
            "type": "list",
            "ordered": true,
            "items": [
              "Track URL creation and revocation by result ID without logging sensitive Blob contents.",
              "Generate, replace and clear ten times; verify every retired result is revoked and active results are bounded.",
              "Exercise preview, download, context-menu save, cancellation and navigation to detect premature cleanup.",
              "Observe process-memory trends; investigate retained Blobs, bitmaps, canvases and Workers if usage still grows."
            ]
          },
          {
            "type": "callout",
            "title": "Blob URL fundamentals",
            "text": "Compare Blob URL and Data URL representations.",
            "href": "/blog/blob-url-createobjecturl-explained",
            "linkLabel": "Read the introduction"
          },
          {
            "type": "callout",
            "title": "Reference: Blob URL lifecycle",
            "text": "Resource mappings and early-revocation pitfalls.",
            "href": "https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob",
            "linkLabel": "Read MDN"
          }
        ],
        "faq": [
          {
            "question": "Is assigning null to the URL variable enough?",
            "answer": "No. Dropping a string reference does not revoke the browser registration. The resource owner needs explicit cleanup."
          },
          {
            "question": "Does revoking delete a downloaded file?",
            "answer": "No. It removes the temporary browser address. An operation that has not consumed that address may fail, but a saved file is unaffected."
          }
        ]
      }
    }
  }
] satisfies BlogArticle[];
