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
] satisfies BlogArticle[];
