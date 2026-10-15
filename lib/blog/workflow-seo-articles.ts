import type { BlogArticle } from './articles';

const base64Example = `Hello -> SGVsbG8=`;

const excelJsonExample = `[
  {
    "name": "Alice",
    "email": "alice@example.com",
    "active": true
  }
]`;

const excelNestedJsonExample = `[
  {
    "user": {
      "name": "Alice",
      "email": "alice@example.com"
    },
    "order": {
      "id": "A-1001",
      "total": 59.9
    }
  }
]`;

const wordCountMixedExample = `中文 ABC 😊
ToolGarden JSON 工具`;

const removeBgImplementationSnippet = `const modelMap = {
  medium: 'isnet_fp16',
  small: 'isnet_quint8',
} as const;

const modelInput = await normalizeLoadedImageToPng(image);
const blob = await removeBackground(modelInput, {
  publicPath: BACKGROUND_REMOVAL_PUBLIC_PATH,
  model: modelMap[options.model ?? 'medium'],
  output: { format: 'image/png', quality: 1 },
  progress: (label, current, total) => {
    options.onProgress?.(createBackgroundRemovalProgress(label, current, total));
  },
});`;

export const workflowSeoBlogArticles = [
  {
    slug: 'make-id-photo-online-size-background-guide',
    publishedAt: '2026-07-06',
    updatedAt: '2026-07-06',
    translations: {
      zh: {
        title: '证件照尺寸和底色怎么选？一寸、二寸、中国护照、美国护照在线制作指南',
        excerpt: '制作电子版证件照前，先确认用途、尺寸、底色、头部比例和是否允许数字处理。不同证件的要求并不完全相同。',
        metaTitle: '证件照尺寸和底色怎么选？一寸二寸中国护照美国护照指南',
        metaDescription: '整理一寸、二寸、中国护照/旅行证、美国护照 2x2 inch 等证件照尺寸和底色要求，说明如何在线制作电子版证件照、换底色、裁剪构图和避免审核风险。',
        readingTime: '约 8 分钟阅读',
        tags: ['证件照制作', '一寸照', '二寸照', '护照照片', '换底色'],
        relatedTools: [
          {
            label: '证件照制作',
            href: '/image/id-photo',
            description: '上传生活照或证件照，自动去背景、按尺寸构图、切换底色并下载 JPG/PNG。',
          },
          {
            label: '图片去背景',
            href: '/image/remove-bg',
            description: '需要单独得到透明背景人像时，可以先用本地模型去除背景。',
          },
          {
            label: '图片压缩',
            href: '/image/compress',
            description: '报名系统限制文件大小时，可在下载后压缩到目标体积。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '证件照看起来只是“正脸照片加纯色背景”，但真正容易出错的地方通常是尺寸、底色、头部比例、是否拉伸变形，以及办理机构是否允许数字处理。',
          },
          {
            type: 'paragraph',
            text: '如果只是简历、工牌、考试报名、社保卡上传或内部系统头像，在线制作电子版证件照通常很方便：上传一张清晰正脸照，去掉背景，选择一寸、二寸或自定义尺寸，再换成白底、蓝底或红底即可。但如果是护照、签证等正式证件，一定要先看办理机构的最新要求。',
          },
          {
            type: 'quote',
            text: '结论先说：先按用途选尺寸，再按办理机构选底色；不要拉伸照片，不要过度美化，也不要把不允许数字处理的官方照片做成合成图。',
          },
          { type: 'heading', level: 2, text: '常见证件照尺寸怎么选？' },
          {
            type: 'paragraph',
            text: '下面是日常最常见的几类尺寸。不同国家、地区、考试或平台可能有自己的像素、文件大小和背景要求，表格适合做初步选择，不应替代官方说明。',
          },
          {
            type: 'table',
            headers: ['用途', '常见尺寸', '常见底色', '使用建议'],
            rows: [
              ['中国一寸照', '25 x 35 mm', '白底、蓝底、红底都常见', '适合简历、报名、证书、内部系统等非统一官方场景，提交前看平台说明。'],
              ['中国二寸照', '35 x 49 mm', '白底、蓝底、红底都常见', '适合部分证书、档案、报名材料。和中国护照 33 x 48 mm 不是同一尺寸。'],
              ['中国护照/旅行证', '33 x 48 mm', '白色背景', '中国驻美使馆页面列出白底、头部宽高和边距要求，正式办理应以最新官方说明为准。'],
              ['美国护照', '2 x 2 inch / 51 x 51 mm', '白色或近白色背景', '美国国务院要求头肩居中、头部约 25-35 mm，并提交未经过滤镜或数字改动的原始照片。'],
              ['自定义尺寸', '按平台填写 mm', '按平台要求', '适合考试报名、企业系统、学校系统等只给出宽高和文件大小的场景。'],
            ],
          },
          { type: 'heading', level: 2, text: '本文使用的官方标准来源' },
          {
            type: 'paragraph',
            text: '正式证件照要求会随机构和办理类型变化。本文只摘取两个公开官方页面中的核心尺寸和质量要求，作为制作时的检查参考。',
          },
          {
            type: 'table',
            headers: ['来源', '本文引用的重点', '网址'],
            rows: [
              ['美国国务院护照照片要求', '2 x 2 inch / 51 x 51 mm；头部从下巴到头顶约 25-35 mm；白色或近白背景；提交原始未编辑照片。', 'https://travel.state.gov/en/passports/apply/help/photos.html'],
              ['中国驻美使馆护照人像照片规格', '宽 33mm、高 48mm；白色背景；头部宽 15-22mm、高 28-33mm；头顶距上边 3-5mm。', 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm'],
            ],
          },
          {
            type: 'callout',
            title: '美国国务院护照照片要求',
            text: '美国国务院 Passport Photos 页面说明了美国护照照片的尺寸、背景、头部位置、清晰度、表情和数字处理限制。准备美国护照照片时，请以该页面最新内容为准。',
            href: 'https://travel.state.gov/en/passports/apply/help/photos.html',
            linkLabel: '查看 travel.state.gov 原文',
          },
          {
            type: 'callout',
            title: '中国驻美使馆护照人像照片规格',
            text: '中国驻美使馆页面列出护照/旅行证照片的总体要求、面部要求、背景要求、尺寸和头部位置范围。准备中国护照或旅行证照片时，请以所属使领馆和当前业务要求为准。',
            href: 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm',
            linkLabel: '查看中国驻美使馆原文',
          },
          { type: 'heading', level: 2, text: '底色怎么选：白底、蓝底、红底有什么区别？' },
          {
            type: 'paragraph',
            text: '底色没有一个全球通用规则。白底最常见于护照、签证和国际证件；蓝底和红底在中国的简历、考试、证书、单位系统里也很常见。真正决定底色的不是照片工具，而是接收照片的机构。',
          },
          {
            type: 'list',
            items: [
              '白底：护照、签证、国际证件和很多线上审核系统更常见，背景应干净、无阴影、无图案。',
              '蓝底：常见于国内部分证件、考试报名、企业资料和简历场景，但不是所有平台都接受。',
              '红底：常见于一些证书、档案或单位材料，正式提交前仍要确认要求。',
              '自定义底色：适合企业内部系统、学校系统或平台明确给出颜色值的场景。',
            ],
          },
          { type: 'heading', level: 2, text: '生活照能不能做成证件照？' },
          {
            type: 'paragraph',
            text: '技术上可以，但不是每张生活照都适合。合格的源照片最好是正面、清晰、无夸张表情、无遮挡、光线均匀，并且脸和头发边缘足够清楚。照片如果本身模糊、低光、强滤镜、侧脸、头发遮眼，后期工具很难把它变成可靠的证件照。',
          },
          {
            type: 'table',
            headers: ['源照片情况', '适合程度', '建议'],
            rows: [
              ['正脸、清晰、自然表情、浅色墙面背景', '适合', '可以上传后自动去背景和构图，再按用途调整底色。'],
              ['背景复杂但人物边缘清楚', '中等', 'AI 去背景通常可用，下载前重点检查头发、肩膀和耳朵边缘。'],
              ['自拍大头、广角畸变明显', '不建议', '脸部比例容易变形，最好让他人用后置摄像头重新拍。'],
              ['滤镜、美颜、修脸、夸张表情', '不适合正式证件', '很多官方场景要求原始自然照片，不要改变自然面貌。'],
              ['模糊、强阴影、低分辨率', '不适合', '重新拍比后期修补更可靠。'],
            ],
          },
          { type: 'heading', level: 2, text: '如何用在线工具制作电子版证件照？' },
          {
            type: 'list',
            ordered: true,
            items: [
              '打开证件照制作工具，上传一张清晰正脸照片。',
              '等待浏览器本地 AI 去背景，并自动识别人脸区域进行初步构图。',
              '选择尺寸：一寸、二寸、中国护照/签证、美国 2 x 2 inch，或输入自定义 mm 宽高。',
              '选择底色：白色、蓝色、红色、灰色或自定义颜色。',
              '用画布拖动人物位置，用缩放控制或双指缩放微调大小，保持人物等比缩放，不要拉伸。',
              '检查头顶、下巴、肩膀、耳朵、背景边缘和整体清晰度。',
              '按平台要求下载 JPG 或 PNG；如果报名系统限制体积，再用图片压缩工具压到目标大小。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 证件照制作',
            text: '工具内置中国一寸、二寸、中国签证、美国 2 x 2 inch 等尺寸，支持自定义毫米画布、自动去背景、人脸构图、拖动缩放、底色切换和 JPG/PNG 下载。图片在浏览器本地处理。',
            href: '/image/id-photo',
            linkLabel: '打开证件照制作',
          },
          { type: 'heading', level: 2, text: '哪些情况不要依赖在线换底色？' },
          {
            type: 'paragraph',
            text: '美国国务院页面明确提醒提交原始未编辑照片，不要使用滤镜或数字改动；中国驻美使馆页面也写明不得修改照片、不得使用合成照片。因此，如果办理机构明确不接受数字处理，正确做法是重新拍一张符合背景和光线要求的照片，而不是用 AI 换底色硬改。',
          },
          {
            type: 'list',
            items: [
              '正式护照、旅行证、签证申请：优先重新拍摄符合要求的原始照片。',
              '考试报名、企业系统、简历头像：通常更适合用在线工具制作电子版。',
              '平台明确要求不得修图或不得合成：不要用 AI 换背景替代重新拍摄。',
              '平台只要求尺寸、底色和文件大小：可以用工具生成后再人工检查。',
            ],
          },
          { type: 'heading', level: 2, text: '最常见的证件照错误' },
          {
            type: 'list',
            items: [
              '把照片横向或纵向拉伸，导致脸变窄或变宽。',
              '头部太大，头发或下巴被裁掉；或者头部太小，人物离镜头太远。',
              '背景不是纯色，有墙角、阴影、纹理或其他物体。',
              '人脸有强阴影、反光、红眼、过度曝光或明显偏色。',
              '用美颜、滤镜、修脸、换装改变自然面貌。',
              '尺寸选成二寸，但平台实际要求 33 x 48 mm 或 2 x 2 inch。',
            ],
          },
          { type: 'heading', level: 2, text: '总结' },
          {
            type: 'paragraph',
            text: '证件照制作的关键不是把照片“修得好看”，而是让尺寸、底色、头部位置、清晰度和用途匹配。对简历、报名和企业系统，在线工具可以大幅节省时间；对护照、签证等正式证件，请先看官方要求，必要时重新拍摄，不要用不被接受的数字处理冒险。',
          },
        ],
        faq: [
          {
            question: '一寸照和二寸照可以直接互相裁剪吗？',
            answer: '不建议简单互裁。一寸照常见尺寸是 25 x 35 mm，二寸照常见尺寸是 35 x 49 mm，比例接近但并不意味着同一张图随便裁一下就合格。不同用途还会限制头部大小、背景色、文件体积和像素尺寸。更稳的做法是回到原始照片，选择目标尺寸重新构图导出，避免二次裁剪导致头顶、下巴或肩膀位置不合适。',
          },
          {
            question: '证件照一定要白底吗？',
            answer: '不一定。护照、签证和很多国际证件常见白底或近白底，但国内一些考试、证书、简历或单位材料可能要求蓝底或红底。不要按习惯猜，应该看报名系统或办理机构的说明。如果页面只写“证件照”但没有写底色，优先查看示例图或咨询客服，避免提交后因为背景色被退回。',
          },
          {
            question: '用 AI 去背景做证件照会不会影响正式审核？',
            answer: '要看用途。简历、企业系统、考试报名等电子版场景通常只关心尺寸、底色和清晰度，AI 去背景很实用。但美国国务院护照照片要求强调提交原始未编辑照片，中国驻美使馆也要求不得修改或使用合成照片。遇到这类正式证件，最好重新拍摄符合背景要求的原始照片，而不是依赖 AI 换底色。',
          },
          {
            question: '为什么不能拉伸照片来适配尺寸？',
            answer: '拉伸会改变脸部和头部比例，是证件照里非常明显的错误。美国国务院照片说明也提醒不要拉伸或压缩图像来改变大小。正确方式是等比缩放人物，再移动位置，让头部和肩膀落在合适区域；画布尺寸不够时应该裁剪边缘，而不是把人物宽高分别拉大或压小。',
          },
          {
            question: '电子版证件照应该下载 JPG 还是 PNG？',
            answer: '大多数报名系统接受 JPG，因为体积小、兼容性好。PNG 更适合需要保留锐利边缘或透明背景的中间文件，但正式证件照通常最终是纯色背景，不一定需要 PNG。如果系统限制文件大小，例如 200KB、500KB 或 1MB，可以先导出 JPG，再用图片压缩工具控制体积，同时确认照片仍然清晰。',
          },
        ],
      },
      en: {
        title: 'How to Choose ID Photo Size and Background: 1-Inch, 2-Inch, China Passport, and U.S. Passport Guide',
        excerpt: 'Before making a digital ID photo, confirm the use case, size, background color, head position, and whether digital edits are allowed.',
        metaTitle: 'ID Photo Size and Background Guide: China and U.S. Passport Photos',
        metaDescription: 'Learn common ID photo sizes, background colors, China passport photo dimensions, U.S. passport 2x2 inch requirements, and how to make a digital ID photo online without stretching the image.',
        readingTime: '8 min read',
        tags: ['ID photo', 'passport photo', 'background color', 'photo size', 'online photo maker'],
        relatedTools: [
          {
            label: 'ID Photo Maker',
            href: '/image/id-photo',
            description: 'Upload a portrait, remove the background, choose an ID photo size, adjust framing, and download JPG or PNG.',
          },
          {
            label: 'Remove Image Background',
            href: '/image/remove-bg',
            description: 'Remove a portrait background locally when you need a transparent cutout first.',
          },
          {
            label: 'Image Compressor',
            href: '/image/compress',
            description: 'Compress the exported photo when an upload form has a strict file-size limit.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'An ID photo is not just a face on a solid background. The details that cause rejection are usually size, background color, head position, stretching, image quality, and whether the target authority allows digital edits.',
          },
          {
            type: 'paragraph',
            text: 'For resumes, badges, exam registration, internal systems, or profile uploads, an online ID photo maker can save a lot of time. For passports, visas, and other official documents, always check the current requirements from the accepting authority before editing or submitting a photo.',
          },
          {
            type: 'quote',
            text: 'Choose the size by use case, choose the background by the receiving authority, keep the person proportional, and avoid edits that change natural appearance.',
          },
          { type: 'heading', level: 2, text: 'Common ID Photo Sizes' },
          {
            type: 'paragraph',
            text: 'The table below is a practical starting point. Exact requirements may vary by country, agency, exam board, or upload form, so use it as a guide rather than a substitute for official instructions.',
          },
          {
            type: 'table',
            headers: ['Use case', 'Common size', 'Common background', 'Notes'],
            rows: [
              ['China 1-inch photo', '25 x 35 mm', 'White, blue, or red are common', 'Often used for resumes, registrations, certificates, and internal systems. Check the receiving platform.'],
              ['China 2-inch photo', '35 x 49 mm', 'White, blue, or red are common', 'Used by some certificates and records. It is not the same as the 33 x 48 mm China passport photo size.'],
              ['China passport / travel document', '33 x 48 mm', 'White background', 'The Chinese Embassy page lists white background, head size, and margin requirements. Use the latest official instructions.'],
              ['U.S. passport', '2 x 2 inch / 51 x 51 mm', 'White or off-white background', 'The U.S. Department of State requires centered head and shoulders, about 25-35 mm head size, and an original unedited photo.'],
              ['Custom upload forms', 'Enter the required mm size', 'Follow the form requirement', 'Useful for exam, school, company, or local platform uploads with custom dimensions.'],
            ],
          },
          { type: 'heading', level: 2, text: 'Official Sources Used in This Guide' },
          {
            type: 'paragraph',
            text: 'Official photo requirements can change and can differ by application type. This article summarizes the practical points from two public official pages and links to the originals.',
          },
          {
            type: 'table',
            headers: ['Source', 'Key points used here', 'URL'],
            rows: [
              ['U.S. Department of State passport photo requirements', '2 x 2 inch / 51 x 51 mm; head about 25-35 mm from chin to top; white or off-white background; original unedited photo.', 'https://travel.state.gov/en/passports/apply/help/photos.html'],
              ['Chinese Embassy in the United States passport photo specifications', '33 x 48 mm; white background; head width 15-22 mm; head height 28-33 mm; top margin 3-5 mm.', 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm'],
            ],
          },
          {
            type: 'callout',
            title: 'U.S. Department of State Passport Photos',
            text: 'The official Passport Photos page explains U.S. passport photo size, background, head position, image quality, expression, and restrictions on digital changes.',
            href: 'https://travel.state.gov/en/passports/apply/help/photos.html',
            linkLabel: 'Open travel.state.gov',
          },
          {
            type: 'callout',
            title: 'Chinese Embassy Passport Photo Specifications',
            text: 'The Chinese Embassy page lists passport and travel document photo requirements, including white background, face visibility, 33 x 48 mm size, head size, and margins.',
            href: 'https://us.china-embassy.gov.cn/lsfw/zj/hzlxz/201903/t20190309_5098803.htm',
            linkLabel: 'Open china-embassy.gov.cn',
          },
          { type: 'heading', level: 2, text: 'How to Choose Background Color' },
          {
            type: 'paragraph',
            text: 'There is no universal background color for every ID photo. White is common for passports, visas, and international documents. Blue and red backgrounds are common in some Chinese resumes, certificates, exam registrations, and organization systems. The receiving authority decides the correct color.',
          },
          {
            type: 'list',
            items: [
              'White or off-white: common for passports, visas, and official international documents. Keep it plain, shadow-free, and texture-free.',
              'Blue: common for some domestic Chinese registration, resume, and company scenarios, but not always accepted.',
              'Red: used by some certificates or organizational records. Confirm the requirement before submitting.',
              'Custom color: useful when a company, school, or platform provides a specific color value.',
            ],
          },
          { type: 'heading', level: 2, text: 'Can You Turn a Casual Portrait into an ID Photo?' },
          {
            type: 'paragraph',
            text: 'Technically yes, but not every casual photo is suitable. The best source photo is front-facing, sharp, evenly lit, natural in expression, unobstructed, and detailed around hair and shoulders. If the source is blurry, filtered, side-facing, low-light, or heavily distorted, the result will not be reliable.',
          },
          {
            type: 'table',
            headers: ['Source photo', 'Fit', 'Suggestion'],
            rows: [
              ['Front-facing, sharp, natural expression, simple background', 'Good', 'Use automatic background removal and framing, then adjust the background color.'],
              ['Complex background but clear subject edges', 'Medium', 'Check hair, shoulders, and ears carefully after background removal.'],
              ['Close selfie with wide-angle distortion', 'Poor', 'Retake with the rear camera and another person holding the phone.'],
              ['Filters, beauty edits, face reshaping, exaggerated expression', 'Poor for official documents', 'Official uses often require natural, unedited appearance.'],
              ['Blurry, shadowed, low-resolution photo', 'Poor', 'Retaking is more reliable than trying to repair it later.'],
            ],
          },
          { type: 'heading', level: 2, text: 'How to Make a Digital ID Photo Online' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open the ID Photo Maker and upload a clear front-facing portrait.',
              'Let the browser remove the background locally and frame the face automatically.',
              'Choose a size such as 1-inch, 2-inch, China passport/visa, U.S. 2 x 2 inch, or a custom mm size.',
              'Choose the required background color: white, blue, red, gray, or custom.',
              'Drag the subject and zoom proportionally. Do not stretch the person horizontally or vertically.',
              'Check top margin, chin, shoulders, ears, background edges, and overall sharpness.',
              'Download JPG or PNG. If the upload form limits file size, compress the exported image afterward.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden ID Photo Maker',
            text: 'The tool includes China 1-inch, China 2-inch, China visa, U.S. 2 x 2 inch, custom mm sizes, background removal, face-based framing, background color switching, proportional zoom, and JPG/PNG export. Processing runs locally in the browser.',
            href: '/image/id-photo',
            linkLabel: 'Open ID Photo Maker',
          },
          { type: 'heading', level: 2, text: 'When Not to Rely on Online Background Editing' },
          {
            type: 'paragraph',
            text: 'The U.S. Department of State asks for an original, unedited photo without filters or digital changes. The Chinese Embassy page also says the photo should not be modified or synthetic. If an authority explicitly forbids digital edits, retake the photo against the correct background instead of using AI background replacement.',
          },
          {
            type: 'list',
            items: [
              'Passports, travel documents, and visa applications: retake a compliant original photo whenever the authority requires it.',
              'Resumes, badges, exam forms, and internal systems: online ID photo tools are usually a good fit.',
              'Forms that forbid edits or synthetic photos: do not use AI background replacement as a shortcut.',
              'Forms that only specify size, background, and file size: generate the photo, then inspect it manually before upload.',
            ],
          },
          { type: 'heading', level: 2, text: 'Common ID Photo Mistakes' },
          {
            type: 'list',
            items: [
              'Stretching the person to fit the canvas, making the face too narrow or too wide.',
              'Head too large or too small, with hair, chin, or shoulders incorrectly cropped.',
              'Background has shadows, wall texture, corners, or other objects.',
              'Strong face shadows, glare, red eye, overexposure, or color cast.',
              'Filters, beauty edits, face reshaping, or clothing changes that alter natural appearance.',
              'Using a 2-inch preset when the form actually requires 33 x 48 mm or 2 x 2 inch.',
            ],
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'A good ID photo is not about making the portrait prettier. It is about matching the required size, background, head position, clarity, and submission rules. Online tools are helpful for resumes, registration forms, and internal systems. For passports and visas, always check official requirements first and retake the photo if digital edits are not allowed.',
          },
        ],
        faq: [
          {
            question: 'Can I crop a 1-inch photo into a 2-inch photo?',
            answer: 'It is better to go back to the original portrait and frame it again. A common China 1-inch photo is 25 x 35 mm, while a common 2-inch photo is 35 x 49 mm. Even when the aspect ratio looks close, the target form may also care about head size, background color, pixel dimensions, and file size. Re-exporting from the original avoids cutting off hair, chin, or shoulders.',
          },
          {
            question: 'Does every ID photo need a white background?',
            answer: 'No. Passports, visas, and many international documents commonly require white or off-white backgrounds, but some domestic Chinese forms, resumes, certificates, and company systems may ask for blue or red. Always follow the receiving authority or upload form. If the form does not specify a color, check its example image or support instructions before submitting.',
          },
          {
            question: 'Will AI background removal affect official review?',
            answer: 'It depends on the use case. For resumes, company systems, badges, or some exam uploads, background removal can be practical. For official passports and travel documents, be careful: the U.S. Department of State asks for an original unedited photo, and the Chinese Embassy page says not to use modified or synthetic photos. If the authority forbids digital edits, retake the photo instead.',
          },
          {
            question: 'Why should I never stretch an ID photo?',
            answer: 'Stretching changes the natural proportions of the face and head, which is easy to notice. The U.S. passport photo guidance also warns against stretching or compressing the image to resize it. The correct workflow is proportional zoom plus repositioning, then cropping the canvas if needed. Do not scale width and height separately.',
          },
          {
            question: 'Should I download JPG or PNG for a digital ID photo?',
            answer: 'Most upload forms accept JPG because it is small and compatible. PNG can be useful as an intermediate format or when you need sharper edges, but official ID photos usually end with a solid background, so PNG is not always necessary. If the form has a file-size limit such as 200KB, 500KB, or 1MB, export JPG first and then compress it while checking that the photo remains sharp.',
          },
        ],
      },
    },
  },
  {
    slug: 'remove-image-background-browser-local-model',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-07',
    translations: {
      zh: {
        title: '如何一键去除图片背景？在浏览器本地跑模型的原理',
        excerpt: '图片去背景通常会先识别前景主体，再生成透明 alpha mask。浏览器本地模型可以在不上传图片的情况下导出透明 PNG。',
        metaTitle: '如何一键去除图片背景？浏览器本地模型原理',
        metaDescription: '解释图片去背景的基本原理和 ToolGarden 当前实现，包括 @imgly/background-removal、ISNet 模型、输入校验、PNG 规范化、透明 PNG 导出和常见边缘问题。',
        readingTime: '约 9 分钟阅读',
        tags: ['图片去背景', '透明 PNG', '本地 AI', '前景分割'],
        relatedTools: [
          {
            label: '图片去背景',
            href: '/image/remove-bg',
            description: '在浏览器本地使用开源模型移除图片背景，导出透明 PNG。',
          },
          {
            label: '图片转 PNG',
            href: '/image/to-png',
            description: '需要透明背景时，PNG 通常是更稳的输出格式。',
          },
          {
            label: "图片取色器",
            href: "/image/color-picker",
            description: "在合成新背景前，先从素材里吸取一个协调的主色。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '一键去背景的核心是把图片分成前景和背景，然后把背景像素变成透明。',
          },
          {
            type: 'paragraph',
            text: '现代去背景工具通常使用图像分割模型。模型会预测每个像素属于前景的概率，再生成一张 alpha mask，用它决定哪些区域保留、哪些区域透明。',
          },
          { type: 'heading', level: 2, text: '本地模型处理流程' },
          {
            type: 'list',
            ordered: true,
            items: [
              '浏览器读取图片并解码成像素。',
              '模型在本地推断前景区域。',
              '生成透明度遮罩，也就是 alpha mask。',
              '把背景像素设为透明，保留主体。',
              '导出透明 PNG，方便继续设计或排版。',
            ],
          },
          { type: 'heading', level: 2, text: '当前 /image/remove-bg 的实现细节' },
          {
            type: 'paragraph',
            text: 'ToolGarden 目前的图片去背景页面是一个浏览器端单图工具：页面组件负责文件选择、模型档位、进度条、预览和下载；真正的去背景逻辑集中在 lib/utils/image-browser.ts 的 removeImageBackground()，页面不会把图片文件传到业务服务器处理。',
          },
          {
            type: 'table',
            headers: ['环节', '当前实现', '为什么这样做'],
            rows: [
              ['页面入口', 'components/ImageBackgroundRemover.tsx 只取上传列表中的第一张图片，先 inspectImageFile() 读取尺寸和类型，再允许用户点击移除背景。', '避免一次性把大量图片送入浏览器模型，降低内存压力，也让结果预览和下载更明确。'],
              ['输入保护', '支持 JPG、PNG、WebP、GIF、BMP、SVG、AVIF；文件最大 50MB，解码后的像素数最大 40MP。空文件、不支持格式、解码失败和超大图片都会返回结构化错误。', '模型推理前先挡住浏览器难以稳定处理的输入，避免标签页卡死或 Canvas 失败。'],
              ['预处理', 'removeImageBackground() 用 object URL 加载图片，读取 naturalWidth / naturalHeight，再绘制到 Canvas，并通过 normalizeLoadedImageToPng() 转成 PNG Blob 作为模型输入。', '统一输入格式，避免不同图片编码、透明通道或浏览器解码差异直接影响模型调用。'],
              ['模型选择', '运行时动态 import @imgly/background-removal。默认 high quality 对应 isnet_fp16，快速档对应 isnet_quint8。页面文案标注为 medium 约 80MB、small 约 40MB。', '高质量模型边缘更稳，快速模型下载和推理更轻；用户可以按网络和设备性能选择。'],
              ['模型资源', 'publicPath 指向 staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/。首次运行会下载模型资源，之后通常由浏览器缓存。', '把图片处理留在本机，只把模型资产作为静态文件下载；首次慢、二次快是正常现象。'],
              ['进度与导出', '库回调的 label/current/total 会被转换成 model 或 compute 阶段进度；输出固定为 image/png、quality 1，返回 Blob、原尺寸、原始大小、输出大小和耗时。前端再创建 object URL 用于预览和下载。', '透明背景需要 alpha 通道，PNG 是最稳定的默认输出；统计信息可直接展示给用户。'],
            ],
          },
          {
            type: 'code',
            language: 'ts',
            code: removeBgImplementationSnippet,
          },
          {
            type: 'paragraph',
            text: '因此，这个工具的“本地”含义是：用户图片在浏览器内解码、Canvas 规范化、模型推理和 PNG 导出，图片 Blob 不上传到服务器；但首次使用时浏览器仍需要从模型 CDN 请求开源模型资源。如果断网且模型没有缓存，去背景无法启动。',
          },
          { type: 'heading', level: 2, text: '哪些图片效果更好？' },
          {
            type: 'table',
            headers: ['图片类型', '效果预期', '建议'],
            rows: [
              ['人像、商品、宠物、单一主体', '较好', '主体边界清晰更稳定'],
              ['纯色或简单背景', '较好', '模型更容易分辨前景'],
              ['发丝、透明物、复杂阴影', '中等', '边缘可能需要后期微调'],
              ['主体和背景颜色接近', '较难', '尝试更高清原图'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 图片去背景',
            text: '上传图片后，工具会在浏览器本地加载模型并导出透明 PNG。图片不需要上传到服务器。',
            href: '/image/remove-bg',
            linkLabel: '打开图片去背景',
          },
        ],
        faq: [
          {
            question: "去背景后为什么头发边缘还有一圈灰色或彩色？",
            answer: "这层残留是原背景颜色渗到了发丝里。分割模型通常按像素级别判断前景，但头发是细小、半透明、密度不均的结构，边缘像素往往同时包含头发颜色和背景颜色。当模型只能给一个 0 到 1 的透明度值，那些混合像素就会保留一部分背景色。改善办法：一是用更高分辨率的原图，二是选拍摄背景与主体颜色差异更大的照片，三是导出后用图片编辑工具的细化边缘或替换背景色再处理一次。",
          },
          {
            question: "本地去背景模型和在线专业服务（如 remove.bg）比效果差距多大？",
            answer: "在标准场景（人像、商品、宠物、清晰背景），两者视觉差距通常不大，本地开源模型足以满足社交发图、电商预处理、PPT 素材等需求。差距主要在两个地方：一是发丝和透明物的边缘精修，商用服务经过更多训练和后处理；二是极端场景，比如背景颜色和主体接近、场景光线复杂、主体面积很小时，商用服务的鲁棒性更好。如果对最终质量要求高，可以本地先做一版，人工微调，或者只把关键几张交给付费服务。",
          },
          {
            question: "为什么导出的透明 PNG 在有些软件里背景变成白色？",
            answer: "PNG 支持透明通道（alpha channel），但显示端不一定支持。老版本的图片查看器、部分手机默认相册、微信朋友圈的部分入口、Instagram 发图都可能把透明区域填成白色或黑色。JPG 格式本身不支持透明，任何工具把 PNG 转成 JPG，都会用背景色（默认白色）填充透明像素。如果目标平台不保留透明，最好在设计时就选好背景色（如白色、灰色或品牌色）合成后再导出。",
          },
          {
            question: "去背景可以处理批量图片吗？",
            answer: "浏览器本地模型能处理批量，但要注意两件事：一是模型只加载一次，之后每张图片都要重新推理，第一次可能几秒，后续大概每张几百毫秒到几秒，取决于图片大小和设备性能；二是浏览器内存会随着处理的图片累积，一次上传上百张可能变卡或崩溃。实践建议是分批 20 到 50 张处理，或用文件夹拖入的方式；对电商这种上千张的场景，本地方案不如批处理服务器或桌面软件（如 rembg CLI）稳定。",
          },
          {
            question: "去背景后主体为什么会缺失或断开？",
            answer: "分割模型判断每个像素“属于前景”的概率，遇到低对比度、透明或色相接近背景的区域，概率会低于阈值，那部分主体就被误判为背景删除掉了。常见表现是白衣服和白背景相接的边缘缺失、玻璃杯身消失、宠物白毛部分变透明。解决方法：一是拍摄时提高主体与背景的颜色反差；二是用亮度、对比度调整原图再去背景；三是导出后用抠图编辑工具手动补上缺失区域。",
          },
        ],
      },
      en: {
        title: 'How One-Click Background Removal Works with a Browser-Local Model',
        excerpt: 'Background removal detects the foreground subject and creates an alpha mask. A browser-local model can export transparent PNGs without uploading images.',
        metaTitle: 'How One-Click Image Background Removal Works Locally',
        metaDescription: 'Learn foreground segmentation and ToolGarden implementation details: @imgly/background-removal, ISNet models, input guards, PNG normalization, transparent export, and edge limits.',
        readingTime: '9 min read',
        tags: ['background removal', 'transparent PNG', 'local AI', 'segmentation'],
        relatedTools: [
          {
            label: 'Remove Image Background',
            href: '/image/remove-bg',
            description: 'Remove image backgrounds locally in the browser and export transparent PNG.',
          },
          {
            label: 'Image to PNG',
            href: '/image/to-png',
            description: 'PNG is usually the safest output format for transparent images.',
          },
          {
            label: "Image Color Picker",
            href: "/image/color-picker",
            description: "Sample a matching accent color from your assets before compositing a new background.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'One-click background removal separates foreground from background and turns background pixels transparent.',
          },
          {
            type: 'paragraph',
            text: 'Modern background removal tools use segmentation models. The model predicts how likely each pixel is to belong to the foreground, then creates an alpha mask for transparency.',
          },
          { type: 'heading', level: 2, text: 'Local Model Workflow' },
          {
            type: 'list',
            ordered: true,
            items: [
              'The browser reads and decodes the image.',
              'The model predicts the foreground area locally.',
              'An alpha mask is generated.',
              'Background pixels are made transparent.',
              'The result is exported as a transparent PNG.',
            ],
          },
          { type: 'heading', level: 2, text: 'How /image/remove-bg Is Implemented Today' },
          {
            type: 'paragraph',
            text: 'ToolGarden currently implements background removal as a browser-side single-image workflow: the React component handles file selection, model choice, progress, preview, and download, while the actual removal logic lives in removeImageBackground() inside lib/utils/image-browser.ts. The image file is not sent to an application server for processing.',
          },
          {
            type: 'table',
            headers: ['Step', 'Current implementation', 'Reason'],
            rows: [
              ['Page entry', 'components/ImageBackgroundRemover.tsx uses the first file from the upload list, calls inspectImageFile() for dimensions and type, then enables the remove action.', 'This avoids pushing large batches through a browser model at once and keeps preview and download state clear.'],
              ['Input guards', 'Supported inputs are JPG, PNG, WebP, GIF, BMP, SVG, and AVIF. Files are capped at 50MB, and decoded images are capped at 40MP. Empty files, unsupported formats, decode failures, and oversized images return structured errors.', 'The tool rejects inputs that are likely to freeze the tab or fail Canvas/model processing.'],
              ['Pre-processing', 'removeImageBackground() loads the image through an object URL, reads naturalWidth / naturalHeight, draws it to Canvas, and uses normalizeLoadedImageToPng() to create a PNG Blob for the model.', 'A normalized PNG input reduces browser and codec differences before the model runs.'],
              ['Model choice', 'The code dynamically imports @imgly/background-removal. The high-quality option maps to isnet_fp16, and the fast option maps to isnet_quint8. The UI describes them as medium about 80MB and small about 40MB.', 'The high-quality model gives steadier edges, while the fast model downloads and runs lighter on weaker devices.'],
              ['Model assets', 'publicPath points to staticimgly.com/@imgly/background-removal-data/${PACKAGE_VERSION}/dist/. The first run downloads model assets, and later runs are usually served from the browser cache.', 'The image stays local, while the model is fetched as static assets. A slow first run and faster later runs are expected.'],
              ['Progress and export', 'The library progress callback is mapped into model or compute stages. Output is fixed to image/png with quality 1, and the result returns the Blob, dimensions, source size, output size, and duration. The UI creates an object URL for preview and download.', 'PNG preserves the alpha channel needed for transparency, and the returned stats can be shown directly in the result panel.'],
            ],
          },
          {
            type: 'code',
            language: 'ts',
            code: removeBgImplementationSnippet,
          },
          {
            type: 'paragraph',
            text: 'So “local” means the user image is decoded, normalized, segmented, and exported inside the browser. The image Blob is not uploaded to a server, but the browser may still download open-source model assets from the model CDN on first use. If the device is offline and the model is not cached, background removal cannot start.',
          },
          { type: 'heading', level: 2, text: 'Which Images Work Best?' },
          {
            type: 'table',
            headers: ['Image type', 'Expected result', 'Tip'],
            rows: [
              ['Portraits, products, pets, single subjects', 'Good', 'Clear subject edges help'],
              ['Plain or simple background', 'Good', 'Foreground is easier to separate'],
              ['Hair, transparent objects, complex shadows', 'Medium', 'Edges may need cleanup'],
              ['Subject and background have similar colors', 'Harder', 'Use a higher-resolution source'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Remove Image Background',
            text: 'Upload an image, run the browser-local model, and export a transparent PNG without sending the image to a server.',
            href: '/image/remove-bg',
            linkLabel: 'Open Remove Background',
          },
        ],
        faq: [
          {
            question: "Why is there a gray or colored halo around hair after background removal?",
            answer: "The halo comes from original background color that bled into strands of hair. Segmentation models decide foreground per pixel, but hair is thin, semi-transparent, and irregular, so edge pixels contain both hair color and background color. When the model assigns a single alpha value, those mixed pixels keep part of the background tint. To improve results, use a higher-resolution source image, shoot against a background color that contrasts with the subject, or refine edges in a photo editor after export.",
          },
          {
            question: "How does a local model compare to paid services like remove.bg?",
            answer: "For standard cases; portraits, products, pets, clean backgrounds; visual quality is close and local open-source models cover social posting, e-commerce prep, and slide assets well. The gap shows up in two places. First, edge refinement on hair and transparent objects is stronger in commercial services thanks to more training and post-processing. Second, robustness on hard cases (similar colors, tricky lighting, tiny subjects) is better. If quality matters a lot, run local first, then hand off only the important shots to a paid service.",
          },
          {
            question: "Why does my transparent PNG show a white background in some apps?",
            answer: "PNG supports an alpha channel, but not every viewer honors it. Older image viewers, some default mobile galleries, certain WeChat entry points, and Instagram uploads fill the transparent area with white or black. JPG itself does not support transparency, so any conversion from PNG to JPG replaces transparent pixels with a background color (usually white). If the destination platform strips transparency, choose a background color (white, gray, or your brand color) at design time and composite before exporting.",
          },
          {
            question: "Can it handle batch background removal?",
            answer: "A browser-local model can do batches, but two things matter. First, the model loads once, then each image is inferred separately; the first takes a few seconds, later ones typically a few hundred milliseconds to a couple of seconds depending on image size and device. Second, browser memory accumulates as you process more images, so uploading hundreds at once can slow down or crash the tab. Do 20 to 50 at a time. For e-commerce workflows with thousands of images, a batch server or desktop tool like rembg CLI is more stable.",
          },
          {
            question: "Why do parts of my subject go missing or break apart?",
            answer: "The model outputs a foreground probability per pixel. Low-contrast, transparent, or similar-hue areas fall below the threshold and get treated as background. Typical symptoms are white clothing merging into a white wall, transparent glassware disappearing, or white pet fur becoming see-through. Fixes: shoot with more contrast between subject and background, adjust brightness and contrast on the source before removal, or manually paint the missing area back in with a photo editor after export.",
          },
        ],
      },
    },
  },
  {
    slug: 'base64-encoding-explained-common-pitfalls',
    publishedAt: '2026-07-02',
    updatedAt: '2026-10-10',
    translations: {
      zh: {
        title: 'Base64 编码原理和常见坑',
        excerpt: 'Base64 是把二进制数据转成文本的一种编码方式，常用于图片 Data URL、接口传输和配置嵌入，但它不是加密。',
        metaTitle: 'Base64 编码原理和常见坑：图片、Data URL、接口传输',
        metaDescription: '解释 Base64 编码原理、为什么体积会变大、Data URL 和纯 Base64 的区别、常见复制错误以及为什么 Base64 不是加密。',
        readingTime: '约 7 分钟阅读',
        tags: ['Base64', '编码', 'Data URL', '图片转 Base64'],
        relatedTools: [
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '处理 Base64、URL、Unicode、哈希、Cookie、Gzip 等编码解码。',
          },
          {
            label: '图片转 Base64',
            href: '/image/to-base64',
            description: '把图片转换为 Data URL 或纯 Base64 字符串。',
          },
          {
            label: 'Base64 转图片',
            href: '/image/base64-to-image',
            description: '把图片 Base64 或 Data URL 还原成可预览和下载的图片。',
          },
          {
            label: "URL / Query String 构造器",
            href: "/url-builder",
            description: "把 Base64 字符串作为参数拼进 URL 时，实时预览编码结果，避免二次编码。",
          },
          {
            label: "UUID 生成",
            href: "/uuid",
            description: "需要短随机 ID 时，NanoID 通常比 Base64 编码的随机字节更好用。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Base64 是编码，不是加密。任何人拿到 Base64 字符串，都可以把它解码回原始内容。',
          },
          { type: 'code', language: 'text', code: base64Example },
          {
            type: 'paragraph',
            text: '它的作用是把二进制数据转换成只包含常见 ASCII 字符的文本，方便放进 JSON、HTML、CSS、配置文件或接口字段里。',
          },
          { type: 'heading', level: 2, text: '编码原理：3 个字节如何变成 4 个字符？' },
          {
            type: 'paragraph',
            text: '一个字节有 8 个二进制位（bit）。Base64 每次取 3 个字节，共 24 位，再按从左到右的顺序重新分成 4 组，每组 6 位。6 位能表示 0～63 共 64 个数值，每个数值都对应字母表中的一个字符，这就是 Base64 名称中 64 的由来。',
          },
          {
            type: 'table',
            headers: ['索引（从 0 开始）', '标准 Base64 字符'],
            rows: [['0～25', 'A～Z'], ['26～51', 'a～z'], ['52～61', '0～9'], ['62', '+'], ['63', '/']],
          },
          {
            type: 'paragraph',
            text: '以 Man 为例，这三个字符在 ASCII 和 UTF-8 中都各占一个字节。先写出字节的二进制形式，再按 6 位重新分组，最后查表即可得到 TWFu。整个过程只改变数据的表示方式，没有使用密钥，也没有压缩数据。',
          },
          {
            type: 'code', language: 'text',
            code: 'Man → TWFu\n\n字符：       M        a        n\n十进制字节： 77       97       110\n8 位分组：   01001101 01100001 01101110\n6 位分组：   010011 010110 000101 101110\n索引：       19     22     5      46\n查表：       T      W      F      u',
          },
          { type: 'heading', level: 2, text: '不足 3 个字节时，为什么要补 =？' },
          {
            type: 'paragraph',
            text: '最后一组若不足 3 个字节，就在剩余位的右侧补 0，使其凑够 6 位后查表，再用 = 把输出补到 4 个字符。= 是填充标记，不属于上述 64 个字符，也不代表原始数据中有一个等号或零字节。',
          },
          {
            type: 'table',
            headers: ['输入', '按 6 位分组（末组右侧补 0）', '有效索引', '带填充的输出'],
            rows: [['M（1 字节）', '010011 010000', '19、16', 'TQ=='], ['Ma（2 字节）', '010011 010110 000100', '19、22、4', 'TWE='], ['Man（3 字节）', '010011 010110 000101 101110', '19、22、5、46', 'TWFu']],
          },
          {
            type: 'paragraph',
            text: '解码时反过来操作：把字符映射回 6 位数值，拼接后按 8 位还原字节，并依据填充去掉编码时补入的尾部位。例如 TQ== 还原为 01001101，也就是 M。部分协议允许省略 =，但必须由收发双方约定，不能随意删除。',
          },
          { type: 'heading', level: 2, text: '为什么 Base64 会变大？' },
          {
            type: 'paragraph',
            text: '对于 n 个输入字节，带填充的 Base64 长度为 4 × ceil(n / 3) 个 ASCII 字符，其中 ceil 表示向上取整；这里不计换行和 Data URL 前缀。输入较大时，体积增加接近三分之一；短输入的比例可能更高，例如 1 个字节编码后是 4 个字符。如果把大图片直接塞进 JSON，请求体可能会明显膨胀。',
          },
          { type: 'heading', level: 2, text: 'Data URL 和纯 Base64 有什么区别？' },
          {
            type: 'table',
            headers: ['形式', '例子', '用途'],
            rows: [
              ['纯 Base64', 'iVBORw0KGgo...', '只包含编码内容'],
              ['Data URL', 'data:image/png;base64,iVBOR...', '包含 MIME 类型，可直接用于 img src'],
              ['URL Safe Base64', '使用 - 和 _', '常见于 JWT 和 URL 场景'],
            ],
          },
          { type: 'heading', level: 2, text: '常见坑' },
          {
            type: 'list',
            items: [
              '把 Base64 当作加密，导致敏感信息直接暴露。',
              '复制时漏掉末尾 = 填充字符，导致解码失败。',
              '把 Data URL 当成纯 Base64 传给后端，后端解析失败。',
              '图片太大仍然转 Base64，导致页面和接口变慢。',
              '混用标准 Base64 和 URL Safe Base64。',
            ],
          },
          { type: 'heading', level: 2, text: '文本为什么还涉及字符编码？' },
          {
            type: 'paragraph',
            text: 'Base64 编码的是字节，不是抽象字符。英文 Hello 在 UTF-8 中是 5 个字节，而中文、Emoji 和其它字符会先按 UTF-8 转成不同的字节序列，再进行 Base64。编码方和解码方如果使用不同字符集，Base64 本身即使完全正确，恢复出的文字仍可能乱码。',
          },
          {
            type: 'code',
            language: 'text',
            code: '文本 → UTF-8 字节 → Base64\nBase64 → 字节 → 使用同一字符集还原文本',
          },
          { type: 'heading', level: 2, text: '什么时候应该用，什么时候不该用？' },
          {
            type: 'table',
            headers: ['场景', '建议', '原因'],
            rows: [
              ['很小的图标内联到 CSS', '可以考虑', '减少一次请求，但会增加文本体积'],
              ['JSON 中传递少量二进制', '先确认接口约定', '需要明确 MIME 类型、长度和大小限制'],
              ['大图片或视频', '不要内联', '体积膨胀、内存占用和解析成本都很高'],
              ['密码、token、个人信息', '不能当作保护措施', '解码无需密钥，拿到字符串就能还原'],
            ],
          },
          {
            type: 'paragraph',
            text: '解码失败时先确认是否混入 Data URL 前缀、空格或换行，再检查使用的是标准还是 URL Safe 字母表。末尾填充可以按协议省略，但接收方必须明确支持；不要仅靠手工补等号猜测损坏内容。',
          },
          {
            type: 'callout',
            title: 'ToolGarden Base64 工具',
            text: '可以用信息编码转换处理文本 Base64，也可以用图片 Base64 工具在本地完成图片和 Base64 的互转。',
            href: '/info-codec',
            linkLabel: '打开信息编码转换',
          },
        ],
        faq: [
          {
            question: "Base64 会不会保护我的密码或 Token？",
            answer: "不会。Base64 是一种可逆的编码方式，没有密钥，任何拿到 Base64 字符串的人都可以用一行代码或在线工具解回原文。它和加密（AES、RSA）完全不同：加密需要密钥且没有密钥无法还原。看到密码、Token、API Key 被 Base64 存储，请立刻当作明文对待。如果需要真正的保护，应该用哈希（登录密码）、对称加密（数据传输）、非对称加密（密钥交换）或专门的密钥管理服务（如 AWS KMS、HashiCorp Vault）。",
          },
          {
            question: "为什么 Base64 字符串末尾会有一个或两个等号？",
            answer: "等号是填充字符。Base64 每 3 个字节编码成 4 个字符，如果原始数据长度不是 3 的倍数，末尾就会缺 1 或 2 个字节，编码器用 = 补齐到 4 的倍数。1 个 = 表示原始少 1 字节，2 个 = 表示少 2 字节，没有 = 表示原始长度正好是 3 的倍数。复制字符串时，如果漏掉末尾的 =，很多严格解码器会报错。有些实现会自动补全，但发送到后端前手动检查一下更稳妥。",
          },
          {
            question: "为什么把大图片转 Base64 之后页面变得很慢？",
            answer: "Base64 编码会让数据体积膨胀约 33%，一张 500KB 的图片编码后大约 667KB 文本。这段文本会作为字符串塞进 HTML 或 JSON，浏览器解析、内存占用、传输时间都比链接一张外部图片更重。此外，HTML/JS 中的长字符串不能被浏览器缓存复用：每次页面加载都要重新下载和解码。适用 Base64 的场景是极小的图标（十几 KB 以内）或必须内嵌的邮件、报告、离线应用；大图片建议用 CDN 链接。",
          },
          {
            question: "URL Safe Base64 是什么，什么时候要用？",
            answer: "标准 Base64 用 +、/、= 三个字符，其中 + 和 / 在 URL 里有特殊含义（+ 会被解码成空格，/ 是路径分隔符），= 也可能被浏览器或代理修改。URL Safe Base64 把 + 换成 -，把 / 换成 _，并允许省略末尾 =。它常见于三个场景：JWT（Header 和 Payload 都是 URL Safe Base64 编码）、URL 参数里传递二进制数据、Web Push 的密钥交换。使用时要确认收发双方约定一致，混用会导致解码失败。",
          },
          {
            question: "Data URL 和纯 Base64 到底该给后端哪一种？",
            answer: "看后端接口约定，两者不能混用。纯 Base64 只包含编码字符本身，例如 iVBORw0KGgo... 后端拿到直接解码就是二进制。Data URL 是完整的 data:image/png;base64,iVBOR... 前面带 MIME 类型声明，用于浏览器直接渲染（<img src=\"data:...\"）。如果后端约定收纯 Base64，你传 Data URL，它会把 data:image/png;base64, 当作前缀数据一起解码，得到损坏的二进制。反过来也一样，前端预览却传纯 Base64 会显示破图。传输前一定要看清接口示例。",
          },
        ],
      },
      en: {
        title: 'Base64 Encoding Explained and Common Pitfalls',
        excerpt: 'Base64 turns binary data into text for Data URLs, APIs, and embedded configuration. It is encoding, not encryption.',
        metaTitle: 'Base64 Encoding Explained: Data URLs, APIs, and Pitfalls',
        metaDescription: 'Understand how Base64 works, why it increases size, the difference between Data URLs and raw Base64, copy errors, and why Base64 is not encryption.',
        readingTime: '7 min read',
        tags: ['Base64', 'encoding', 'Data URL', 'image to Base64'],
        relatedTools: [
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Encode and decode Base64, URL, Unicode, hashes, Cookie, Gzip, and more.',
          },
          {
            label: 'Image to Base64',
            href: '/image/to-base64',
            description: 'Convert images to Data URLs or raw Base64 strings.',
          },
          {
            label: 'Base64 to Image',
            href: '/image/base64-to-image',
            description: 'Restore image Base64 or Data URLs into previewable downloadable image files.',
          },
          {
            label: "URL / Query String Builder",
            href: "/url-builder",
            description: "Preview how Base64 strings behave when embedded as URL parameters, avoiding double-encoding.",
          },
          {
            label: "UUID Generator",
            href: "/uuid",
            description: "When you need short random IDs, NanoID often works better than Base64-encoded random bytes.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Base64 is encoding, not encryption. Anyone with the string can decode it back to the original content.',
          },
          { type: 'code', language: 'text', code: base64Example },
          {
            type: 'paragraph',
            text: 'Base64 converts binary bytes into text made from common ASCII characters, which makes it convenient for JSON, HTML, CSS, configs, and API fields.',
          },
          { type: 'heading', level: 2, text: 'How Encoding Works: 3 Bytes Become 4 Characters' },
          {
            type: 'paragraph',
            text: 'Each byte contains 8 bits. Base64 takes 3 bytes, or 24 bits, and splits them from left to right into four 6-bit groups. Each group represents a number from 0 to 63, which selects one character from a 64-character alphabet. That alphabet gives Base64 its name.',
          },
          {
            type: 'table',
            headers: ['Index (starting at 0)', 'Standard Base64 character'],
            rows: [['0–25', 'A–Z'], ['26–51', 'a–z'], ['52–61', '0–9'], ['62', '+'], ['63', '/']],
          },
          {
            type: 'paragraph',
            text: 'For example, each character in Man occupies one byte in both ASCII and UTF-8. Write those bytes in binary, regroup them into 6-bit values, and look up each value to get TWFu. This changes the representation of the data without using a key or compressing it.',
          },
          {
            type: 'code', language: 'text',
            code: 'Man → TWFu\n\nCharacters:    M        a        n\nDecimal bytes: 77       97       110\n8-bit groups:  01001101 01100001 01101110\n6-bit groups:  010011 010110 000101 101110\nIndexes:       19     22     5      46\nAlphabet:      T      W      F      u',
          },
          { type: 'heading', level: 2, text: 'Why Pad with = When Fewer Than 3 Bytes Remain?' },
          {
            type: 'paragraph',
            text: 'If the final group contains fewer than 3 bytes, append zero bits on the right to complete the last 6-bit value, then add = characters to make four output characters. The = sign is a padding marker outside the 64-character alphabet; it does not represent an equals sign or a zero byte in the original data.',
          },
          {
            type: 'table',
            headers: ['Input', '6-bit groups (last group zero-padded)', 'Data indexes', 'Padded output'],
            rows: [['M (1 byte)', '010011 010000', '19, 16', 'TQ=='], ['Ma (2 bytes)', '010011 010110 000100', '19, 22, 4', 'TWE='], ['Man (3 bytes)', '010011 010110 000101 101110', '19, 22, 5, 46', 'TWFu']],
          },
          {
            type: 'paragraph',
            text: 'Decoding reverses the process: map characters back to 6-bit values, join the bits, and recover 8-bit bytes, discarding the trailing bits added during encoding as indicated by the padding. TQ== therefore restores 01001101, or M. Some protocols allow omitted padding, but both sides must agree on that convention.',
          },
          { type: 'heading', level: 2, text: 'Why Does Base64 Get Larger?' },
          {
            type: 'paragraph',
            text: 'For n input bytes, padded Base64 contains 4 × ceil(n / 3) ASCII characters, where ceil rounds up, excluding line breaks and any Data URL prefix. For large inputs the overhead approaches one third; short inputs can have a higher ratio, such as 1 byte becoming 4 characters.',
          },
          { type: 'heading', level: 2, text: 'Data URL vs Raw Base64' },
          {
            type: 'table',
            headers: ['Form', 'Example', 'Use case'],
            rows: [
              ['Raw Base64', 'iVBORw0KGgo...', 'Only the encoded content'],
              ['Data URL', 'data:image/png;base64,iVBOR...', 'Includes MIME type and can be used as img src'],
              ['URL Safe Base64', 'Uses - and _', 'Common in JWT and URL contexts'],
            ],
          },
          { type: 'heading', level: 2, text: 'Common Pitfalls' },
          {
            type: 'list',
            items: [
              'Treating Base64 as encryption and exposing sensitive data.',
              'Missing trailing padding characters when copying.',
              'Sending a Data URL when the backend expects raw Base64.',
              'Embedding very large images as Base64 and slowing down pages or APIs.',
              'Mixing standard Base64 and URL Safe Base64.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why text still needs a character encoding' },
          {
            type: 'paragraph',
            text: 'Base64 encodes bytes, not abstract characters. English Hello is five bytes in UTF-8, while Chinese text, emoji, and other characters first become different UTF-8 byte sequences and are then encoded. If the producer and consumer use different character sets, the Base64 can be perfectly valid while the restored text is still corrupted.',
          },
          {
            type: 'code',
            language: 'text',
            code: 'text -> UTF-8 bytes -> Base64\nBase64 -> bytes -> decode with the same character set',
          },
          { type: 'heading', level: 2, text: 'When it fits and when it does not' },
          {
            type: 'table',
            headers: ['Situation', 'Recommendation', 'Reason'],
            rows: [
              ['A very small icon in CSS', 'Consider it', 'It removes one request but enlarges the text asset'],
              ['A small binary field in JSON', 'Confirm the API contract', 'MIME type, length, and size limits need an explicit convention'],
              ['A large image or video', 'Do not inline it', 'Expansion, memory use, and parsing cost all become significant'],
              ['Passwords, tokens, or personal data', 'Never treat it as protection', 'No key is needed; anyone with the string can restore it'],
            ],
          },
          {
            type: 'paragraph',
            text: 'When decoding fails, first check for an included Data URL prefix, spaces, or line breaks, then confirm whether the alphabet is standard or URL-safe. Some protocols omit trailing padding deliberately, but the receiver must support that convention. Do not guess at damaged content by adding equals signs blindly.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Base64 Tools',
            text: 'Use Info Encoder / Decoder for text Base64, or image Base64 tools to convert images and Data URLs locally in the browser.',
            href: '/info-codec',
            linkLabel: 'Open Info Encoder / Decoder',
          },
        ],
        faq: [
          {
            question: "Does Base64 protect passwords or tokens?",
            answer: "No. Base64 is a reversible encoding with no key. Anyone with the string can decode it back to plaintext in one line of code or with any online tool. It has nothing in common with encryption like AES or RSA, which require a key and cannot be reversed without it. If you see a password, token, or API key stored as Base64, treat it as plaintext. Real protection requires hashing (login passwords), symmetric encryption (data at rest and in transit), asymmetric encryption (key exchange), or a dedicated secret manager such as AWS KMS or HashiCorp Vault.",
          },
          {
            question: "Why do Base64 strings sometimes end with one or two equal signs?",
            answer: "The equal sign is padding. Base64 encodes every 3 bytes into 4 characters, so when the original length is not a multiple of 3, the encoder pads with = to reach a multiple of 4. One = means one byte was missing, two = means two bytes were missing, and no = means the original length was already a multiple of 3. When you copy a Base64 string, missing trailing = often causes strict decoders to reject the input. Some implementations auto-pad, but manually verifying padding before sending to the backend is safer.",
          },
          {
            question: "Why does my page become slow after embedding large images as Base64?",
            answer: "Base64 inflates data size by about 33 percent, so a 500KB image becomes about 667KB of text. That text is embedded in HTML or JSON, and the browser must parse it, hold it in memory, and transfer it every time; much heavier than fetching an external image. HTML and JS strings also cannot be cached separately, so every page load re-downloads and re-decodes them. Base64 embedding fits tiny icons (under about 15KB) or offline/email/report contexts. For big images, use a CDN URL.",
          },
          {
            question: "What is URL Safe Base64 and when should I use it?",
            answer: "Standard Base64 uses +, /, and =. The + and / have special meaning in URLs (+ decodes to space, / is a path separator), and = can be rewritten by browsers or proxies. URL Safe Base64 replaces + with - and / with _, and often drops the trailing =. It appears in three common cases: JWT (headers and payloads use URL Safe Base64), passing binary data in URL parameters, and Web Push key exchange. Both sender and receiver must agree on which variant is used, or decoding fails.",
          },
          {
            question: "Should I send a Data URL or raw Base64 to the backend?",
            answer: "It depends on the API contract, and the two are not interchangeable. Raw Base64 is just the encoded content like iVBORw0KGgo..., which the backend can decode directly into binary. A Data URL is the full data:image/png;base64,iVBOR... form, with a MIME prefix used for direct rendering by <img src=\"data:...\">. If the backend expects raw Base64 but you send a Data URL, it will treat the data:image/png;base64, prefix as data and produce corrupted binary. Check the API example before sending.",
          },
        ],
      },
    },
  },
  {
    slug: 'convert-excel-data-to-json-online',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: 'Excel 数据如何一键转成 JSON',
        excerpt: 'Excel 转 JSON 通常会读取第一行作为字段名，再把后续每一行转换成对象，适合接口 mock、数据导入和配置迁移。',
        metaTitle: 'Excel 数据如何一键转成 JSON？在线转换教程',
        metaDescription: '介绍 Excel 转 JSON 的常见规则，包括表头字段、空单元格、数字和日期、第一张 Sheet、数据清洗以及在线本地转换流程。',
        readingTime: '约 8 分钟阅读',
        tags: ['Excel 转 JSON', 'XLSX', '数据转换', 'JSON'],
        relatedTools: [
          {
            label: 'Excel → JSON',
            href: '/excel-to-json',
            description: '读取 Excel (.xlsx/.xls) 文件并转换为 JSON 数组。',
          },
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '转换后可以继续格式化、压缩和校验 JSON。',
          },
          {
            label: "时间戳转换",
            href: "/timestamp",
            description: "Excel 里的日期数值转 JSON 后经常变成序列号，用时间戳工具还原成人类可读日期。",
          },
          {
            label: "UUID 生成",
            href: "/uuid",
            description: "导出 JSON 时批量生成主键或 request id，替换掉 Excel 里的自增序号。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Excel 转 JSON 的核心规则是：表头变成字段名，每一行变成一个 JSON 对象。',
          },
          { type: 'code', language: 'json', code: excelJsonExample },
          { type: 'heading', level: 2, text: '转换前最好整理表格' },
          {
            type: 'list',
            items: [
              '第一行作为字段名，避免空表头和重复表头。',
              '每一列只放一种类型的数据，例如不要混用数字和说明文字。',
              '日期列要确认是否需要保留为文本，还是转成日期字符串。',
              '删除合并单元格、注释行和统计行，避免混入 JSON。',
              '如果有多个 Sheet，先确认工具读取哪一张表。',
            ],
          },
          { type: 'heading', level: 2, text: '如何表达嵌套字段？' },
          {
            type: 'paragraph',
            text: '很多接口需要嵌套对象，而 Excel 天然是二维表。比较常见的做法是在表头中使用路径式字段名，例如 user.name、user.email、order.id。转换时再把这些路径还原成嵌套 JSON。',
          },
          { type: 'code', language: 'json', code: excelNestedJsonExample },
          {
            type: 'table',
            headers: ['Excel 表头', 'JSON 结果', '适合场景'],
            rows: [
              ['user.name', 'user: { name: ... }', '用户资料、联系人信息'],
              ['order.total', 'order: { total: ... }', '订单、报价、结算数据'],
              ['tags', 'tags: ...', '简单标签列，可后续拆成数组'],
              ['address.city', 'address: { city: ... }', '地址、地区、配送信息'],
            ],
          },
          { type: 'heading', level: 2, text: '空值、日期和数字要特别小心' },
          {
            type: 'paragraph',
            text: 'Excel 看起来像文本的内容，底层可能是数字、日期序列值或带格式的单元格。比如身份证号、手机号、邮编这类字段不应该当数字处理，否则前导零可能丢失；金额字段则要确认小数精度是否满足业务要求。',
          },
          {
            type: 'list',
            items: [
              'ID、手机号、邮编建议在 Excel 中按文本保存。',
              '金额、数量、比例字段转换后要抽查小数位。',
              '日期最好统一成 yyyy-mm-dd 或 ISO 字符串，再交给接口处理。',
              '空单元格要确认是保留 null、空字符串，还是直接省略字段。',
            ],
          },
          { type: 'heading', level: 2, text: '常见问题' },
          {
            type: 'table',
            headers: ['问题', '原因', '建议'],
            rows: [
              ['字段名很奇怪', '表头含空格、换行或重复名称', '先规范表头'],
              ['数字变成文本', 'Excel 单元格格式不统一', '转换后抽查关键字段'],
              ['空值丢失或变空字符串', '空单元格处理规则不同', '根据接口要求统一处理'],
              ['日期不符合预期', 'Excel 日期本质上可能是序列值', '提前转为文本日期'],
            ],
          },
          { type: 'heading', level: 2, text: '导入接口前的检查清单' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先转换少量样本，确认字段名和嵌套结构正确。',
              '用 JSON 格式化工具检查输出是否为合法 JSON。',
              '随机抽查首行、中间行和最后一行，避免空行或统计行混入。',
              '对照接口文档确认必填字段、字段类型和日期格式。',
              '正式导入前保留原始 Excel 文件，方便回溯。',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Excel → JSON',
            text: '上传 Excel 文件后，工具会在浏览器本地读取表格并输出 JSON 数组，适合快速生成接口样本和导入数据。',
            href: '/excel-to-json',
            linkLabel: '打开 Excel → JSON',
          },
        ],
        faq: [
          {
            question: "Excel 里的日期转成 JSON 后变成一串数字怎么办？",
            answer: "这是 Excel 底层用序列值（比如 45678）表示日期的结果：1900-01-01 是 1，之后每天加 1。转换器如果直接把单元格值读成数字，就会把日期变成 45000 这种没意义的整数。解决办法有两种：一是转换前在 Excel 里选中日期列，设置单元格格式为“文本”，或者用公式 =TEXT(A2,\"yyyy-mm-dd\") 生成一个新列再转换；二是使用支持自动识别日期的转换工具，它会读取 Excel 的日期格式并输出 ISO 字符串（2024-11-15）。正式导入接口前，检查几行日期字段的实际值。",
          },
          {
            question: "身份证号、手机号在 Excel 里显示正常，转 JSON 后为什么变成科学计数法？",
            answer: "Excel 对超过 15 位的纯数字会用科学计数法显示（比如 3.10105E+17），并且只保留 15 位精度，后面的位数会被抹成 0。18 位身份证号最后 3 位归零、19 位银行卡号变形都是这样发生的。根本原因是这些字段被当成 number 处理。解决方式：转换前在 Excel 里给这些列设置“文本”格式，或者在数据前面加一个英文单引号（'110101199001011234），Excel 会当作文本存储。转 JSON 时也要确认工具按字符串处理这些列，不要走数字类型。",
          },
          {
            question: "多个 Sheet 的 Excel 转 JSON 时会读取哪一张？",
            answer: "绝大多数在线转换工具默认只读取第一张 Sheet（也就是打开 Excel 时最左边显示的那一张）。如果你的数据在其他 Sheet 上，转换结果会是空的或者错的。解决办法：转换前把目标 Sheet 拖到最前面，或者复制其内容到一个新 Excel 文件里再转换；如果工具支持选择 Sheet，就在设置中指定名称。多 Sheet 想全部转换的话，需要循环处理：ToolGarden 的 Excel → JSON 目前默认第一张，导入多表数据前先合并或分批处理。",
          },
          {
            question: "Excel 转出来的 JSON 字段名带空格或换行，接口报错怎么办？",
            answer: "问题在表头。Excel 允许表头写“用户 姓名”“订单\\n编号”这种带空格或换行的内容，转换后会变成 JSON 里的 key：{ \"用户 姓名\": \"张三\", \"订单\\n编号\": \"A001\" }。大多数接口不接受带空格或特殊字符的字段名。修复方式：转换前统一在 Excel 里改表头，比如把空格改成下划线（user_name），把中文改成英文（orderId），删掉换行。也可以用 JSON 修复清洗工具批量替换 key 名。规范表头一次，之后每次转换都干净。",
          },
          {
            question: "空单元格在 JSON 里应该是 null、空字符串还是省略字段？",
            answer: "看接口约定，三种都合法但含义不同。null 明确表示“这个字段存在但没值”，适合数据库允许 NULL 的字段；空字符串（\"\"）表示“字段有值，值是空”，适合前端表单默认值场景；省略字段（key 都不出现）表示“这个属性根本不存在”，适合可选字段和稀疏数据。选错了后端可能出问题：比如后端用 if field is None 判断空但你传 \"\"，条件不成立。转换前问清接口对空值的处理规则，或者转换后统一用工具批量把 null 改成对应形式。",
          },
        ],
      },
      en: {
        title: 'How to Convert Excel Data to JSON Online',
        excerpt: 'Excel to JSON usually turns the first row into field names and each following row into a JSON object for mock APIs, imports, and config migration.',
        metaTitle: 'How to Convert Excel Data to JSON Online',
        metaDescription: 'Learn Excel to JSON conversion rules, headers, empty cells, numbers, dates, first-sheet behavior, data cleanup, and browser-local conversion.',
        readingTime: '8 min read',
        tags: ['Excel to JSON', 'XLSX', 'data conversion', 'JSON'],
        relatedTools: [
          {
            label: 'Excel to JSON',
            href: '/excel-to-json',
            description: 'Read Excel files and convert sheet rows into JSON arrays.',
          },
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and validate the converted JSON.',
          },
          {
            label: "Timestamp Converter",
            href: "/timestamp",
            description: "Excel date serials often survive as raw numbers; convert them back to readable dates here.",
          },
          {
            label: "UUID Generator",
            href: "/uuid",
            description: "Generate primary keys or request IDs in bulk to replace auto-increment columns from Excel.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The basic rule for Excel to JSON is simple: headers become field names, and each row becomes a JSON object.',
          },
          { type: 'code', language: 'json', code: excelJsonExample },
          { type: 'heading', level: 2, text: 'Clean the Sheet Before Conversion' },
          {
            type: 'list',
            items: [
              'Use the first row as field names and avoid empty or duplicate headers.',
              'Keep each column to one kind of data.',
              'Decide whether date columns should remain text or become date strings.',
              'Remove merged cells, notes, and summary rows before conversion.',
              'If the file has multiple sheets, confirm which sheet the tool reads.',
            ],
          },
          { type: 'heading', level: 2, text: 'How to Represent Nested Fields' },
          {
            type: 'paragraph',
            text: 'Many APIs expect nested objects, while Excel is a flat table. A common approach is to use path-like headers such as user.name, user.email, and order.id, then rebuild those paths into nested JSON.',
          },
          { type: 'code', language: 'json', code: excelNestedJsonExample },
          {
            type: 'table',
            headers: ['Excel header', 'JSON result', 'Best for'],
            rows: [
              ['user.name', 'user: { name: ... }', 'Profiles and contacts'],
              ['order.total', 'order: { total: ... }', 'Orders, quotes, and billing data'],
              ['tags', 'tags: ...', 'Simple tag columns that can later become arrays'],
              ['address.city', 'address: { city: ... }', 'Addresses, regions, and shipping data'],
            ],
          },
          { type: 'heading', level: 2, text: 'Handle Empty Values, Dates, and Numbers Carefully' },
          {
            type: 'paragraph',
            text: 'A cell that looks like text in Excel may actually be a number, a date serial value, or a formatted cell. IDs, phone numbers, and postal codes should usually stay as text so leading zeros are not lost. Amount fields need decimal checks.',
          },
          {
            type: 'list',
            items: [
              'Save IDs, phone numbers, and postal codes as text when needed.',
              'Check decimal places for amounts, quantities, and ratios.',
              'Normalize dates to yyyy-mm-dd or ISO strings before sending them to an API.',
              'Decide whether blank cells should become null, empty strings, or omitted fields.',
            ],
          },
          { type: 'heading', level: 2, text: 'Common Issues' },
          {
            type: 'table',
            headers: ['Issue', 'Cause', 'Suggestion'],
            rows: [
              ['Strange field names', 'Headers contain spaces, line breaks, or duplicates', 'Normalize headers first'],
              ['Numbers become text', 'Cell formats are inconsistent', 'Check key fields after conversion'],
              ['Empty values change', 'Different blank-cell rules', 'Normalize according to API needs'],
              ['Dates look wrong', 'Excel dates may be serial values', 'Convert dates to text first'],
            ],
          },
          { type: 'heading', level: 2, text: 'Checklist Before Importing to an API' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Convert a small sample first and confirm field names and nested structure.',
              'Use a JSON formatter to verify that the output is valid JSON.',
              'Spot-check the first row, a middle row, and the last row to catch empty or summary rows.',
              'Compare required fields, field types, and date formats with the API documentation.',
              'Keep the original Excel file before a production import.',
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Excel to JSON',
            text: 'Upload an Excel file and convert rows into a JSON array locally in the browser.',
            href: '/excel-to-json',
            linkLabel: 'Open Excel to JSON',
          },
        ],
        faq: [
          {
            question: "Why do Excel dates turn into a random number in JSON?",
            answer: "Excel stores dates as serial numbers underneath (1900-01-01 is 1, each day adds 1), so 45678 is really a date. If the converter reads the raw cell value, you get a meaningless integer like 45000 instead of a date. Two fixes: before conversion, format the date column as Text in Excel or add a helper column with =TEXT(A2,\"yyyy-mm-dd\") and convert that one; or use a converter that detects Excel date formats and outputs ISO strings like 2024-11-15. Always spot-check a few date fields before pushing the JSON to production.",
          },
          {
            question: "Why do phone numbers and long IDs turn into scientific notation in JSON?",
            answer: "Excel displays numbers longer than 15 digits in scientific notation (3.10105E+17) and only keeps 15 digits of precision. Everything past digit 15 becomes zero. That is why 18-digit Chinese ID numbers lose the last three digits and 19-digit bank card numbers get mangled. The root cause is that these fields are treated as numbers. Fix: set those columns to Text format in Excel before conversion, or prefix values with an apostrophe ('110101199001011234) so Excel stores them as text. Also confirm the converter reads them as strings, not numbers.",
          },
          {
            question: "Which sheet does the tool read when my Excel has multiple sheets?",
            answer: "Most online converters default to the first sheet (the leftmost tab). If your data is on another sheet, the output will be empty or wrong. Fix: drag the target sheet to the first position before uploading, or copy its content into a new Excel file. If the tool supports sheet selection, name the sheet explicitly. To convert all sheets, you often need to loop. ToolGarden Excel to JSON currently reads the first sheet by default, so merge or split before importing multi-sheet data.",
          },
          {
            question: "The JSON output has spaces or line breaks in field names and my API rejects it; how do I fix that?",
            answer: "The header is the problem. Excel allows headers like \"user name\" or \"order\\nid\" with spaces or line breaks, and those become JSON keys directly: { \"user name\": \"Alice\", \"order\\nid\": \"A001\" }. Most APIs reject keys with spaces or special characters. Fix: normalize headers in Excel first; replace spaces with underscores (user_name), rename to lowerCamelCase (orderId), and remove line breaks. You can also run the output through a JSON cleanup tool to rename keys in bulk. Doing it once per template keeps every future conversion clean.",
          },
          {
            question: "Should empty cells become null, empty string, or omitted in JSON?",
            answer: "It depends on the API contract, and all three are valid but mean different things. null explicitly says the field exists but has no value, matching database NULL. An empty string means the field has a value that happens to be empty, common for form defaults. Omitting the key means the property does not exist, useful for optional or sparse data. Picking the wrong one can break the backend; for example, if the server checks `if field is None` but you send \"\", the condition fails. Confirm the contract, or post-process with a JSON tool to standardize.",
          },
        ],
      },
    },
  },
  {
    slug: 'text-diff-algorithm-add-delete-change',
    publishedAt: '2026-07-02',
    updatedAt: '2026-08-03',
    translations: {
      zh: {
        title: '文本对比工具原理：diff 算法怎么找出增删改',
        excerpt: 'diff 算法会寻找两段文本之间尽量长的共同部分，再把剩余内容标记为新增、删除或修改，用于代码、日志、文案和配置对比。',
        metaTitle: '文本对比工具原理：diff 算法怎么找出增删改',
        metaDescription: '解释文本 diff 算法的基本思路，包括按行对比、按词对比、最长公共子序列、增删改标记和 JSON 结构化对比的区别。',
        readingTime: '约 7 分钟阅读',
        tags: ['diff 算法', '文本对比', '增删改', '开发工具'],
        relatedTools: [
          {
            label: '文本对比',
            href: '/text/diff',
            description: '使用 diff 算法对比两段文本，按行和词高亮差异。',
          },
          {
            label: 'JSON 对比',
            href: '/json-diff',
            description: '结构化 JSON 更适合按字段路径进行对比。',
          },
          {
            label: "正则表达式测试",
            href: "/regex",
            description: "对比前先用正则批量清理空白、时间戳等噪声，让 diff 只显示真实差异。",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'diff 算法的目标不是理解文本含义，而是找出两个序列里哪些部分相同，哪些部分发生了变化。',
          },
          {
            type: 'paragraph',
            text: '实际使用时，先把旧版本放在左侧、新版本放在右侧，再选择适合内容的比较粒度。行级结果适合快速定位段落，词级高亮则负责指出同一行内部究竟改了哪个词。两级结合，既能看到整体结构，也不会漏掉数字、状态或措辞变化。',
          },
          { type: 'heading', level: 2, text: '先看一个可复现的例子' },
          {
            type: 'code',
            language: 'text',
            code: '旧版本\nCheckout success\nPayment pending\nSend email receipt\n\n新版本\nCheckout success\nPayment completed\nSend email receipt',
          },
          {
            type: 'paragraph',
            text: '行级比较会把第二行标记为一处删除和一处新增；词级比较继续在这一行里对齐共同的 Payment，只高亮 pending 与 completed。人工扫长日志时最容易漏掉的，正是这种行结构不变但关键状态已经变化的情况。',
          },
          { type: 'heading', level: 2, text: '基本思路' },
          {
            type: 'list',
            ordered: true,
            items: [
              '先把文本拆成行、词或字符。',
              '寻找两份内容中可以对齐的共同部分。',
              '共同部分之间的缺口标记为新增或删除。',
              '相邻的删除和新增通常可以被展示为修改。',
              '最后把结果渲染成高亮视图。',
            ],
          },
          { type: 'heading', level: 2, text: '行级、词级、字符级有什么区别？' },
          {
            type: 'table',
            headers: ['粒度', '适合内容', '特点'],
            rows: [
              ['行级', '日志、配置、列表', '速度快，结构清楚'],
              ['词级', '文案、说明、句子', '能看出一句话里改了哪个词'],
              ['字符级', '短字符串、标识符', '很细，但长文本会显得碎'],
              ['结构化', 'JSON、对象数据', '按字段路径比纯文本更准确'],
            ],
          },
          {
            type: 'paragraph',
            text: '很多 diff 实现会使用最长公共子序列或类似策略。它们尽量保留共同内容，再用最少的插入和删除说明变化。',
          },
          { type: 'heading', level: 2, text: '如何减少无意义的差异' },
          {
            type: 'list',
            items: [
              '先统一换行符与文件编码，避免 Windows CRLF 和 Unix LF 造成整段变化。',
              '对日志先去掉每行都会变化的时间戳、请求 ID 或随机值，再比较真正有用的内容。',
              '两份 JSON 应改用结构化 JSON 对比，缩进和字段顺序不应该成为差异。',
              '整段移动通常会显示为原位置删除、新位置新增，结果并不表示内容被改写。',
              '超长文件先按章节或时间范围切小，浏览器更容易计算，人工复核也更聚焦。',
            ],
          },
          { type: 'heading', level: 2, text: '把 diff 当作审查线索，而不是结论' },
          {
            type: 'paragraph',
            text: '算法只能证明文本序列不同，不能判断改动是否正确。审查配置时要确认单位与环境，审查文案时要检查上下文，审查代码生成结果时还要运行对应验证。对于看似只有一个字符的变化，尤其要留意版本号、小数点、负号和权限值。',
          },
          {
            type: 'callout',
            title: 'ToolGarden 文本对比',
            text: '粘贴旧文本和新文本后，可以查看行级和词级差异。JSON 数据建议使用 JSON 对比来减少格式噪声。',
            href: '/text/diff',
            linkLabel: '打开文本对比',
          },
        ],
        faq: [
          {
            question: "为什么两段文本明明只改了一个字，diff 工具却显示整行都变了？",
            answer: "这是行级 diff 的正常行为。行级 diff 把文本按换行符切成块，然后逐行比较：只要一行里任何一个字符不同，整行就被标记为删除加新增。要看清具体改了哪个字，需要切换到词级 diff 或字符级 diff。词级 diff 会把行内容再切成单词，只高亮改动的词；字符级 diff 更细，能显示单个字母或汉字变化。ToolGarden 文本对比支持切换粒度。对代码或配置文件用行级，对文案或句子用词级更合适。",
          },
          {
            question: "diff 结果里出现大量“删除+新增”而不是“修改”，正常吗？",
            answer: "正常。经典 diff 算法（Myers 算法、LCS 变种）只输出插入和删除两种操作，“修改”是渲染层把相邻的删除和新增合并显示出来的。如果你的两段文本中，相同内容之间穿插着大量不同内容，算法找不到足够长的公共子序列，就会把大块内容标记为整块删除加整块新增，看起来像“全部改了”。这时可以试试：调整 diff 粒度（词级、字符级）、或者对齐两段文本的段落顺序再对比，能减少虚假差异。",
          },
          {
            question: "对比 JSON 数据时，为什么应该用 JSON diff 而不是文本 diff？",
            answer: "JSON 是结构化数据，字段顺序、缩进、空格都可以变化而不影响语义。文本 diff 会把这些格式差异当成真差异：同一份 JSON 只是重新格式化了一次，文本 diff 就报出满屏改动。JSON diff 先把两份 JSON 解析成对象树，再按字段路径（比如 user.address.city）比较值，忽略格式和字段顺序。这样你看到的差异才是真正的数据变化：某个字段从 A 变成 B、某个字段新增、某个数组多了一项。做接口回归、数据校对时，JSON diff 效率高得多。",
          },
          {
            question: "diff 工具能理解代码语义（比如变量重命名）吗？",
            answer: "标准 diff 不能。经典算法只看字符或行是否相同，不理解语言语法。把变量 userName 改成 user_name，diff 只会告诉你“这行删了 userName，加了 user_name”，不知道是同一个变量的重命名。要做语义级对比，需要专门的工具：GitHub 的 semantic diff、JetBrains IDE 的结构化 diff、AST diff 工具（如 gumtree、difftastic）会把代码解析成语法树后再比较。日常开发中 diff 已经够用，涉及大规模重命名或重构时才需要更高级的工具。",
          },
          {
            question: "两个很长的文件 diff 时，工具很慢或卡住，能优化吗？",
            answer: "diff 算法的最坏时间复杂度是 O(N×M)，两个文件都有几万行时计算量就会爆炸。优化思路有几个：一是先按段落或章节手动切分，只对比变化的部分；二是关闭词级或字符级 diff，只做行级；三是用命令行工具 diff 或 git diff，它们对大文件优化更好；四是如果两文件差异集中在少数几处，用搜索定位后局部对比比整体对比快得多。浏览器端 diff 通常适合几千行以内的文本，超出时改用桌面工具。",
          },
        ],
      },
      en: {
        title: 'How Text Diff Algorithms Find Additions, Deletions, and Changes',
        excerpt: 'Diff algorithms look for shared subsequences between two texts, then mark the remaining parts as additions, deletions, or changes.',
        metaTitle: 'How Text Diff Algorithms Find Additions and Deletions',
        metaDescription: 'Understand line diff, word diff, longest common subsequence ideas, addition/deletion/change rendering, and when JSON diff is better.',
        readingTime: '7 min read',
        tags: ['diff algorithm', 'text comparison', 'additions', 'developer tools'],
        relatedTools: [
          {
            label: 'Text Diff',
            href: '/text/diff',
            description: 'Compare two text blocks and highlight line and word changes.',
          },
          {
            label: 'JSON Diff',
            href: '/json-diff',
            description: 'Compare structured JSON by field path.',
          },
          {
            label: "Regex Tester",
            href: "/regex",
            description: "Strip whitespace or timestamps with a regex before diffing so only real changes remain.",
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'A diff algorithm does not understand meaning. It finds which parts of two sequences are shared and which parts changed.',
          },
          {
            type: 'paragraph',
            text: 'In practice, put the older version on the left, the newer version on the right, and choose a granularity that fits the material. Line-level output locates changed passages quickly, while word-level highlighting shows exactly what changed inside a line. Used together, they preserve the overall structure without hiding a changed number, status, or phrase.',
          },
          { type: 'heading', level: 2, text: 'A reproducible example' },
          {
            type: 'code',
            language: 'text',
            code: 'Old version\nCheckout success\nPayment pending\nSend email receipt\n\nNew version\nCheckout success\nPayment completed\nSend email receipt',
          },
          {
            type: 'paragraph',
            text: 'A line diff reports the second line as one deletion and one addition. Word comparison then aligns the shared word Payment and highlights only pending versus completed. This is exactly the kind of unchanged line shape with a changed state that people miss while scanning a long log.',
          },
          { type: 'heading', level: 2, text: 'The Basic Idea' },
          {
            type: 'list',
            ordered: true,
            items: [
              'Split text into lines, words, or characters.',
              'Find common parts that can be aligned.',
              'Mark gaps between common parts as additions or deletions.',
              'Adjacent deletions and additions can be displayed as modifications.',
              'Render the result as a highlighted view.',
            ],
          },
          { type: 'heading', level: 2, text: 'Line, Word, and Character Diff' },
          {
            type: 'table',
            headers: ['Granularity', 'Best for', 'Trait'],
            rows: [
              ['Line-level', 'Logs, configs, lists', 'Fast and easy to scan'],
              ['Word-level', 'Copy, prose, sentences', 'Shows changed words inside a line'],
              ['Character-level', 'Short strings and identifiers', 'Precise but noisy for long text'],
              ['Structured', 'JSON and object data', 'More accurate by field path'],
            ],
          },
          {
            type: 'paragraph',
            text: 'Many diff implementations use longest common subsequence ideas or similar strategies: preserve shared content and explain changes with insertions and deletions.',
          },
          { type: 'heading', level: 2, text: 'Reducing differences that do not matter' },
          {
            type: 'list',
            items: [
              'Normalize line endings and encodings first, so Windows CRLF and Unix LF do not make a whole passage look different.',
              'For logs, remove timestamps, request IDs, or random values that change on every line before comparing the useful payload.',
              'Use a structured JSON diff for JSON documents, where indentation and key order are not data changes.',
              'A moved block normally appears as a deletion at the old location and an insertion at the new one; that does not mean its content was rewritten.',
              'Split very large files by section or time range so browser calculation and human review both stay focused.',
            ],
          },
          { type: 'heading', level: 2, text: 'Treat the diff as review evidence, not a verdict' },
          {
            type: 'paragraph',
            text: 'The algorithm proves that two text sequences differ, but not whether the change is correct. Configuration review still needs units and environment context, copy review needs the surrounding paragraph, and generated code still needs its normal checks. Pay particular attention to apparently tiny changes in version numbers, decimal points, minus signs, and permission values.',
          },
          {
            type: 'callout',
            title: 'ToolGarden Text Diff',
            text: 'Paste old text and new text to inspect line and word differences. Use JSON Diff for structured JSON to avoid formatting noise.',
            href: '/text/diff',
            linkLabel: 'Open Text Diff',
          },
        ],
        faq: [
          {
            question: "I changed only one character, but the diff shows the whole line as different; why?",
            answer: "This is normal for line-level diff. Line diff splits text at line breaks and compares whole lines, so any single-character change marks the entire line as deleted-plus-added. To see the exact character change, switch to word-level or character-level diff. Word diff splits the line into tokens and only highlights changed words. Character diff is even finer and shows individual letter changes. ToolGarden Text Diff supports switching granularity. Use line diff for code and configs, word diff for prose and copy.",
          },
          {
            question: "Why does diff show many delete+add pairs instead of a modification?",
            answer: "That is how classic diff algorithms (Myers, LCS variants) work; they only emit insertions and deletions, and the modification view is a rendering hint that merges adjacent delete+add pairs. If the two texts share very little in common between differing chunks, the algorithm cannot find long enough common subsequences and marks big blocks as pure delete-and-add. Try adjusting granularity (word or character), or align the paragraph order between the two versions before diffing, which reduces false-positive differences.",
          },
          {
            question: "Why should I use a JSON diff instead of a text diff for JSON data?",
            answer: "JSON is structured data, so formatting, indentation, and key order can change without altering meaning. A text diff reports all those cosmetic differences as real changes; a reformatted JSON file lights up entirely under text diff. A JSON diff parses both sides into object trees and compares by field path like user.address.city, ignoring format and key order. What you see then is a true data change: a field went from A to B, a new field appeared, an array grew. For API regression or data reconciliation, JSON diff is far more efficient.",
          },
          {
            question: "Can diff tools understand semantic changes like variable renaming?",
            answer: "Standard diff cannot. Classic algorithms only compare characters or lines and do not understand syntax. Renaming userName to user_name shows up as a delete of userName plus an insert of user_name, with no signal that it is the same variable. For semantic comparison, use specialized tools: GitHub semantic diff, JetBrains structural diff, or AST diff tools like gumtree and difftastic parse code into syntax trees before comparing. Standard diff is enough for daily coding; large-scale renames and refactors benefit from the smarter tools.",
          },
          {
            question: "Diffing two large files is slow or hangs; can it be optimized?",
            answer: "Diff has worst-case O(N×M) complexity, so two files with tens of thousands of lines can explode. Options: manually split by section and diff only changed parts; drop word or character granularity and use line diff; use command-line diff or git diff, which are heavily optimized for large files; or search for the specific area of interest and diff only that region. Browser-based diff typically handles files up to a few thousand lines well, and larger files are better served by desktop tools.",
          },
        ],
      },
    },
  },
  {
    slug: 'chinese-english-word-count-character-byte',
    publishedAt: '2026-07-02',
    updatedAt: '2026-07-03',
    translations: {
      zh: {
        title: '中英文字数统计的差异：字符、词、字节各是什么',
        excerpt: '中文常看字数和字符数，英文常看词数。技术系统还会看 UTF-8 字节数，尤其是接口、数据库和短信限制。',
        metaTitle: '中英文字数统计差异：字符、词、字节各是什么',
        metaDescription: '解释中文和英文字数统计差异，包括字符数、词数、字节数、Emoji、空格、标点和 UTF-8 编码在不同场景下的影响。',
        readingTime: '约 8 分钟阅读',
        tags: ['字数统计', '中英文统计', '字符数', '字节数'],
        relatedTools: [
          {
            label: '字数统计',
            href: '/text/word-count',
            description: '统计字数、词数、字符数、行数、段落、句子和字节大小。',
          },
          {
            label: '信息编码转换',
            href: '/info-codec',
            description: '查看文本编码、Unicode、Base64 和字节相关转换。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '中文和英文的“字数”不是同一套统计逻辑。写作平台、SEO 工具、数据库和接口限制也可能看不同指标。',
          },
          { type: 'heading', level: 2, text: '先看一个混合文本例子' },
          { type: 'code', language: 'text', code: wordCountMixedExample },
          {
            type: 'paragraph',
            text: '这段文本同时包含中文、英文、空格、换行和 Emoji。不同工具可能分别统计“字符数”“词数”“字数”“不含空格字符数”“UTF-8 字节数”，结果自然不会完全一样。',
          },
          { type: 'heading', level: 2, text: '三个指标先分清' },
          {
            type: 'table',
            headers: ['指标', '中文场景', '英文场景'],
            rows: [
              ['字符数', '每个汉字、标点、空格都可能算字符', '字母、空格、标点都算字符'],
              ['词数', '中文不一定按空格分词，统计口径差异大', '通常按空格和标点拆分单词'],
              ['字节数', 'UTF-8 下常见汉字通常 3 字节', '英文字母通常 1 字节'],
            ],
          },
          { type: 'heading', level: 2, text: '字符数、字数、词数不是一回事' },
          {
            type: 'paragraph',
            text: '中文内容里，一个汉字常被用户理解为一个“字”，但字符数还会把标点、数字、英文字母、空格和换行都算进去。英文内容里，写作平台更常看 word count，也就是按空格、标点和分隔符拆出来的词。',
          },
          {
            type: 'table',
            headers: ['文本', '常见字符理解', '常见词数理解'],
            rows: [
              ['你好世界', '4 个汉字字符', '可能被当作 1 个中文片段，也可能分词为多个词'],
              ['Hello world', '包含 10 个字母和 1 个空格', '2 个英文单词'],
              ['JSON 工具', '中文、英文和空格混合', '取决于中文分词和英文拆词规则'],
              ['😊', '看起来 1 个图标', '底层可能包含多个 Unicode 码点'],
            ],
          },
          { type: 'heading', level: 2, text: '为什么字节数对接口和数据库很重要？' },
          {
            type: 'paragraph',
            text: '很多系统限制的不是“看起来多少字”，而是存储或传输需要多少字节。UTF-8 下英文字母通常 1 字节，常见中文汉字通常 3 字节，Emoji 可能 4 字节或更多。一个 100 字的中文字段，字节数可能远高于 100。',
          },
          {
            type: 'list',
            items: [
              '数据库字段限制可能写的是 varchar(255)，但不同数据库对字符和字节的理解不同。',
              '短信、推送、URL 参数和接口 payload 经常会受到字节大小限制。',
              'Emoji、组合字符和特殊符号可能让“肉眼字符数”和技术字符数不一致。',
              '做国际化产品时，最好同时检查字符数和字节数。',
            ],
          },
          { type: 'heading', level: 2, text: '为什么同一段文字数字不同？' },
          {
            type: 'list',
            items: [
              '空格和换行是否计入字符数，会影响表单限制。',
              'Emoji 可能由多个 Unicode 码点组成，不能只按肉眼看到的图标数。',
              '中文没有天然空格，词数统计依赖分词规则。',
              '接口和数据库经常限制字节数，而不是字数。',
            ],
          },
          { type: 'heading', level: 2, text: '不同场景应该看哪个指标？' },
          {
            type: 'table',
            headers: ['场景', '优先指标', '原因'],
            rows: [
              ['中文 SEO 标题', '字符数和可读长度', '搜索结果展示空间有限'],
              ['英文文章', '词数', '阅读时间和内容长度更常按词估算'],
              ['表单输入限制', '字符数或字节数', '取决于前后端限制方式'],
              ['数据库字段', '字节数和字符数都要看', '避免多语言内容超出存储限制'],
              ['接口传输', '字节数', 'payload 大小影响请求和响应'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden 字数统计',
            text: '粘贴文本即可同时查看字数、词数、字符数、行数、段落、句子和字节大小，适合中英文内容检查。',
            href: '/text/word-count',
            linkLabel: '打开字数统计',
          },
        ],
        faq: [
          {
            question: "为什么同一段文本，Word 显示的字数和在线工具不一样？",
            answer: "因为「字数」在不同工具里的定义不一样。Microsoft Word 把中文按「字符」计数（一个汉字算一个），把英文按「空白分词」计数（连续非空白算一个词）。有些在线工具则用简单的「空白 + 标点分词」，混排文本会把「你好world」算成一个词而不是两个。字节数、去空白字符、CJK 字符数在不同实现里的算法也各不相同。要跨工具对齐，最好统一使用「字符数」这一项，它的定义歧义最小。",
          },
          {
            question: "Emoji、颜文字和特殊符号是按几个字符计算的？",
            answer: "JavaScript 里的 `string.length` 按 UTF-16 code unit 计数，一个 emoji（如 「😀」）会算 2 个 code unit；带肤色修饰或性别的复合 emoji（如 「👨‍👩‍👧」）会算 5-8 个。人眼看到的是一个「字符」，但底层字符是好几个。ToolGarden 的字数统计用 `Array.from(str)` 或 grapheme 分段来算「视觉字符」，所以 emoji 通常按 1 个计。如果你在填表单有字符上限，建议以后端实际存储的编码单位为准。",
          },
          {
            question: "字节数怎么算，为什么中文比英文占更多字节？",
            answer: "字节数取决于文本编码。UTF-8 下，英文字母占 1 字节，中文汉字占 3 字节，emoji 通常占 4 字节。所以「你好」占 6 字节，「hi」占 2 字节。UTF-16 则相反，中文汉字占 2 字节，某些英文特殊符号也占 2 字节。数据库字段（如 MySQL 的 `VARCHAR(255)`）按字符还是字节限制，取决于列的字符集设置：`utf8mb4` 按字符，`latin1` 按字节。做长度校验时一定要问清楚到底是哪种。",
          },
          {
            question: "中英文混排时词数应该怎么算？",
            answer: "没有统一标准。学术论文和公文按「中文字符 + 英文单词」分别列出；社交平台通常按字符总数（微博 140 字，X/Twitter 280 字符，其中一个汉字算 2 个「权重字符」）；招标文书和印刷估价按字符数（含或不含空格另计）。混排文本先决定要给谁看：给字数上限，用字符；给排版工，用页数或行数；给翻译公司，用「单词数（英文按空白，中文按字符）」，因为翻译单价按此计。",
          },
          {
            question: "行数、段落数、句子数有什么用？",
            answer: "对写作者：段落数看结构、行数看视觉密度、句子数看节奏（每段一句读起来短促，每段五六句读起来累）。对开发者：行数常用来估阅读时间、判断文件是否太长；句子数在做 NLP 分句、做机器翻译计价时最关键。对 SEO：段落数太少（一整篇一段）会被判定为可读性差，太多（每段一句）又会被判定为凑数。理想比例是每段 2-4 句、每 3-5 段一个二级标题。",
          },
        ],
      },
      en: {
        title: 'Chinese vs English Text Counting: Characters, Words, and Bytes',
        excerpt: 'Chinese text often focuses on characters, English text often focuses on words, and technical systems often care about UTF-8 bytes.',
        metaTitle: 'Chinese vs English Text Counting: Characters, Words, Bytes',
        metaDescription: 'Understand character count, word count, byte count, emoji, spaces, punctuation, and UTF-8 differences across Chinese and English text.',
        readingTime: '8 min read',
        tags: ['word count', 'Chinese text', 'character count', 'byte count'],
        relatedTools: [
          {
            label: 'Word Count',
            href: '/text/word-count',
            description: 'Count words, characters, lines, paragraphs, sentences, and byte size.',
          },
          {
            label: 'Info Encoder / Decoder',
            href: '/info-codec',
            description: 'Inspect text encoding, Unicode, Base64, and byte-related conversions.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Chinese and English text length are not counted the same way. Writing tools, SEO tools, databases, and APIs may all care about different metrics.',
          },
          { type: 'heading', level: 2, text: 'Start with a Mixed Text Example' },
          { type: 'code', language: 'text', code: wordCountMixedExample },
          {
            type: 'paragraph',
            text: 'This sample contains Chinese, English, spaces, a line break, and an emoji. A tool may report characters, words, characters without spaces, lines, and UTF-8 bytes, so the numbers will not be identical.',
          },
          { type: 'heading', level: 2, text: 'Three Metrics to Separate' },
          {
            type: 'table',
            headers: ['Metric', 'Chinese context', 'English context'],
            rows: [
              ['Characters', 'Each Han character, punctuation mark, or space may count', 'Letters, spaces, and punctuation count'],
              ['Words', 'No universal space-based word boundary', 'Usually split by spaces and punctuation'],
              ['Bytes', 'Many common Han characters use 3 UTF-8 bytes', 'English letters usually use 1 byte'],
            ],
          },
          { type: 'heading', level: 2, text: 'Characters, Chinese Characters, and Words Are Different' },
          {
            type: 'paragraph',
            text: 'In Chinese, users often think of each Han character as one unit, but a character counter may also include punctuation, digits, Latin letters, spaces, and line breaks. In English, writing tools usually focus on word count split by spaces and punctuation.',
          },
          {
            type: 'table',
            headers: ['Text', 'Common character view', 'Common word-count view'],
            rows: [
              ['你好世界', '4 Han characters', 'May be treated as one Chinese segment or segmented into multiple words'],
              ['Hello world', '10 letters plus 1 space', '2 English words'],
              ['JSON 工具', 'Mixed Chinese, English, and a space', 'Depends on Chinese segmentation and English tokenization'],
              ['😊', 'Looks like one symbol', 'May contain multiple Unicode code points internally'],
            ],
          },
          { type: 'heading', level: 2, text: 'Why Byte Count Matters for APIs and Databases' },
          {
            type: 'paragraph',
            text: 'Many systems limit storage or transfer size, not visual length. In UTF-8, English letters are usually 1 byte, common Chinese characters are often 3 bytes, and emoji can be 4 bytes or more. A 100-character Chinese field can be much larger than 100 bytes.',
          },
          {
            type: 'list',
            items: [
              'A database field such as varchar(255) may behave differently depending on database and encoding settings.',
              'SMS, push messages, URL parameters, and API payloads often have byte-size limits.',
              'Emoji, combining characters, and special symbols can make visual length differ from technical length.',
              'For international products, check both character count and byte count.',
            ],
          },
          { type: 'heading', level: 2, text: 'Why Results Differ' },
          {
            type: 'list',
            items: [
              'Whether spaces and line breaks count affects form limits.',
              'Emoji may contain multiple Unicode code points.',
              'Chinese word count depends on segmentation rules.',
              'APIs and databases often limit bytes, not visible characters.',
            ],
          },
          { type: 'heading', level: 2, text: 'Which Metric Should You Use?' },
          {
            type: 'table',
            headers: ['Use case', 'Primary metric', 'Why'],
            rows: [
              ['Chinese SEO title', 'Characters and readable length', 'Search result display space is limited'],
              ['English article', 'Words', 'Reading time and content length are usually estimated by words'],
              ['Form input limit', 'Characters or bytes', 'Depends on frontend and backend validation'],
              ['Database field', 'Both bytes and characters', 'Multilingual content may exceed storage limits'],
              ['API transfer', 'Bytes', 'Payload size affects requests and responses'],
            ],
          },
          {
            type: 'callout',
            title: 'ToolGarden Word Count',
            text: 'Paste text to see words, characters, lines, paragraphs, sentences, and byte size for Chinese and English content checks.',
            href: '/text/word-count',
            linkLabel: 'Open Word Count',
          },
        ],
        faq: [
          {
            question: "Why does Word's word count differ from online counters for the same text?",
            answer: "Because \"word\" doesn't mean the same thing everywhere. Microsoft Word counts each CJK character as one word for East Asian languages, but uses whitespace tokenization for English. Simpler online counters just split on whitespace, which merges CJK+Latin runs like `你好world` into a single token. Character counts, non-space character counts, and CJK-only counts also vary by implementation. To compare consistently across tools, standardize on character count; it has the fewest edge cases and is what most character-limit UIs actually check.",
          },
          {
            question: "How are emoji and complex graphemes counted?",
            answer: "JavaScript's `string.length` counts UTF-16 code units, so a basic emoji like 😀 is 2, and compound emoji with skin tone or ZWJ sequences (👨‍👩‍👧) can be 5-8 code units. Users see one glyph but the string is longer. ToolGarden's counter uses `Array.from()` or `Intl.Segmenter` to count perceived graphemes, so most emoji count as one visual character. However, form-field validators and database columns often disagree; for hard limits, always test what your backend actually stores.",
          },
          {
            question: "How do bytes work, and why does Chinese take more bytes than English?",
            answer: "Bytes depend on encoding. In UTF-8, ASCII letters are 1 byte, Chinese characters are 3 bytes, and most emoji are 4 bytes; so `hello` is 5 bytes but `你好` is 6. In UTF-16, most Chinese characters are 2 bytes but so are some accented Latin characters. Database column limits also vary: MySQL `VARCHAR(255)` on `utf8mb4` limits to 255 characters, but on `latin1` limits to 255 bytes. Before trusting a byte count, know the target encoding and whether your storage counts characters or bytes.",
          },
          {
            question: "How should mixed Chinese-English text be counted for word count?",
            answer: "There's no universal rule. Academic and government documents typically report Chinese characters and English words separately. Social platforms count characters (Weibo caps at 140, X caps at 280 with CJK counted double). Translation vendors charge by \"source words\": English by whitespace, Chinese by character (usually at 1 character ≈ 1.5 English words). Publishing tools count pages or lines. Decide the audience first: character count for UI limits, word count for translators, page/line count for typesetters. Report both when in doubt.",
          },
          {
            question: "What do line, paragraph, and sentence counts actually tell me?",
            answer: "For writers: paragraphs show structure, lines show visual density, sentences show pacing. For developers: lines gauge reading time or file length; sentence counts drive NLP splitting and translation pricing. For SEO: too few paragraphs (one giant blob) hurts readability scoring; too many (one sentence each) reads as padding. A common sweet spot is 2-4 sentences per paragraph and a subheading every 3-5 paragraphs. If a tool reports zero sentences, it usually means your punctuation is non-ASCII or missing entirely.",
          },
        ],
      },
    },
  },
  {
    slug: 'how-to-build-online-file-compress-and-extract',
    publishedAt: '2026-09-08',
    updatedAt: '2026-09-08',
    translations: {
      zh: {
        title: '怎么实现文件在线压缩和解压：基于浏览器本地 ZIP 的完整思路',
        excerpt: '在线压缩和解压不一定要上传服务器。用 File API、fflate、Blob URL 和目录树建模，就可以在浏览器里完成 ZIP 打包、解包、预览目录和单文件下载。',
        metaTitle: '怎么实现文件在线压缩和解压：浏览器本地 ZIP 实现方案',
        metaDescription: '讲解如何实现文件在线压缩和解压：File API 读取本地文件、fflate 生成和解压 ZIP、Blob URL 下载、目录树展示、中文文件名编码、Zip Slip 和大文件风险处理。',
        readingTime: '约 9 分钟阅读',
        tags: ['ZIP', '文件压缩', '文件解压', '浏览器本地处理', '前端工程'],
        relatedTools: [
          {
            label: 'ZIP 压缩',
            href: '/zip-compress',
            description: '选择多个文件，在浏览器本地压缩为 ZIP 包，文件不会上传服务器。',
          },
          {
            label: 'ZIP 解压',
            href: '/zip-extract',
            description: '上传 ZIP 后在浏览器本地解压，查看目录结构并下载单个文件。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '在线压缩和在线解压听起来像服务端任务：上传文件、服务器打包、再下载结果。但如果目标格式是 ZIP，现代浏览器已经足够完成大部分日常场景。文件可以留在用户设备上，页面只负责读取本地文件、运行压缩算法、生成下载链接。',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden 的 ZIP 压缩和 ZIP 解压工具就是这个思路：压缩页把多个 File 对象转成 ZIP Blob；解压页读取 ZIP 字节，解析出条目，按路径还原目录树，并给每个文件生成单独下载。整个过程没有 API route 接收文件内容。',
          },
          { type: 'heading', level: 2, text: '整体数据流' },
          {
            type: 'code',
            language: 'text',
            code: `压缩：
File input / drag drop
  -> File API 读取 Blob
  -> 规范化 ZIP 内路径
  -> fflate zipSync
  -> Blob(application/zip)
  -> URL.createObjectURL 下载

解压：
ZIP File
  -> arrayBuffer
  -> 读取中央目录修正文件名编码
  -> fflate unzipSync
  -> 过滤不安全路径
  -> 构建目录树
  -> 每个文件生成 Blob 下载`,
          },
          {
            type: 'paragraph',
            text: '这个数据流里最关键的边界是：页面可以读取用户通过文件选择器授权的本地文件，但不会把这些字节发送给服务器。服务端只提供 JavaScript、CSS 和静态资源，真正的处理发生在浏览器进程中。',
          },
          { type: 'heading', level: 2, text: '为什么选择 ZIP，而不是 RAR 或 7z？' },
          {
            type: 'paragraph',
            text: 'ZIP 的创建和解压都有成熟的 JavaScript 实现，系统兼容性也最好。用户下载后的 .zip 可以被 Windows、macOS、Linux 和常见手机系统直接打开。对在线工具来说，这是最稳的默认格式。',
          },
          {
            type: 'paragraph',
            text: 'RAR 和 7z 的情况不同。它们的解压生态可以评估，但创建端并不像 ZIP 那样开放、轻量、浏览器友好。为了避免功能看似支持、实际兼容性脆弱，压缩工具只生成 ZIP，解压工具也先聚焦 ZIP。',
          },
          { type: 'heading', level: 2, text: '用了哪些第三方包？' },
          {
            type: 'paragraph',
            text: '这个 ZIP 功能真正依赖的第三方包很少。压缩和解压的核心由 fflate 完成；React、Next.js 和 next-intl 负责页面、路由和多语言文案；Vitest 用来覆盖 ZIP 工具函数。没有引入服务端上传、云存储、RAR 创建器或 7z WASM 运行时。',
          },
          {
            type: 'table',
            headers: ['包', '在这里实现什么', '怎么使用'],
            rows: [
              ['fflate', '生成 ZIP、解压 ZIP、处理 Deflate / Store 等 ZIP 条目数据。', '在 lib/utils/zip.ts 中导入 zipSync 和 unzipSync：压缩时把路径到 Uint8Array 的映射交给 zipSync；解压时把 ZIP Uint8Array 交给 unzipSync。'],
              ['React', '管理文件选择、压缩/解压状态、目录展开状态、错误提示和下载按钮。', '在 ZipCompressTool 与 ZipExtractTool 中使用 useState、useMemo、useEffect 和 useRef。React 不直接做 ZIP 算法，只编排 UI。'],
              ['Next.js App Router', '提供本地化页面路由、静态导出和 metadata 生成。', '分别创建 app/[locale]/zip-compress 与 app/[locale]/zip-extract 页面和 layout，并通过 createToolMetadata 派生 SEO 信息。'],
              ['next-intl', '提供中文、英文界面文案和按钮文本。', '页面用 useTranslations 读取 messages/zh.json 与 messages/en.json 中的 tools.zip-compress / tools.zip-extract 文案。'],
              ['Vitest', '验证 ZIP 工具函数行为，避免后续改动破坏目录路径或中文文件名。', 'tests/zip.test.ts 里覆盖嵌套路径 round-trip，并手工构造 GBK 文件名 ZIP 检查 GB18030 fallback。'],
            ],
          },
          {
            type: 'code',
            language: 'typescript',
            code: `import { unzipSync, zipSync } from 'fflate';

const zipped = zipSync({
  'docs/readme.txt': new TextEncoder().encode('hello'),
});

const files = unzipSync(zipped);
const readme = files['docs/readme.txt'];`,
          },
          {
            type: 'paragraph',
            text: '注意这里没有使用 file-saver。下载只需要浏览器原生能力：URL.createObjectURL 生成临时地址，a 标签设置 download 文件名后触发点击即可。少一个下载库，打包体积和运行路径都更简单。',
          },
          { type: 'heading', level: 2, text: '压缩：从多个 File 生成 ZIP Blob' },
          {
            type: 'paragraph',
            text: '压缩端页面只做 UI 状态：用户选择文件、设置输出文件名、选择压缩等级、点击按钮。真正的处理放在 lib/utils/zip.ts 中，函数接收一组 filename + blob，返回判别联合类型，而不是直接操作 React state。',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `type ZipCompressionOutcome =
  | {
      ok: true;
      blob: Blob;
      filename: string;
      fileCount: number;
      originalSize: number;
      outputSize: number;
      durationMs: number;
    }
  | { ok: false; code: 'empty_selection' | 'empty_file' | 'zip_failed' };`,
          },
          {
            type: 'paragraph',
            text: '压缩前需要处理 ZIP 内路径。拖入文件夹时，浏览器可能提供 webkitRelativePath；普通多文件选择只有 file.name。路径要统一替换反斜杠、过滤空片段、过滤 . 和 ..，重复文件名要加后缀，避免后一个文件覆盖前一个文件。',
          },
          {
            type: 'paragraph',
            text: '压缩算法使用 fflate 的 zipSync。压缩等级 0 到 9，0 更像“只打包不压缩”，9 通常体积更小但耗时更长。默认 6 是比较合理的速度和体积平衡。',
          },
          { type: 'heading', level: 2, text: '解压：先得到文件条目，再构建目录树' },
          {
            type: 'paragraph',
            text: '解压端不是把所有文件平铺成列表，而是把 ZIP 内部路径拆成目录树。例如 docs/readme.txt 和 docs/assets/logo.png 会共享 docs 目录，assets 是 docs 的子目录。UI 里目录行可以展开折叠，文件行显示大小和下载按钮。',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `interface ZipExtractedEntry {
  path: string;
  name: string;
  size: number;
  blob: Blob;
}

interface TreeNode {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  entry?: ZipExtractedEntry;
}`,
          },
          {
            type: 'paragraph',
            text: '目录树最好在页面层用纯数据结构生成，避免把展示状态和解压逻辑搅在一起。解压函数只返回 entries；React 组件再根据 entries 构建 TreeNode，并维护 expanded 这类交互状态。',
          },
          { type: 'heading', level: 2, text: '中文文件名为什么会乱码？' },
          {
            type: 'paragraph',
            text: '很多 ZIP 文件名是 UTF-8，但并不是所有 ZIP 都会设置 UTF-8 标志。国内常见压缩软件生成的旧 ZIP，文件名可能实际是 GBK 或 GB18030 字节。如果解压库按 Latin-1 或错误编码解释这些字节，中文名就会变成乱码。',
          },
          {
            type: 'paragraph',
            text: '解决办法是读取 ZIP 中央目录里的原始文件名字节：如果条目没有 UTF-8 filename flag，就把这些字节用 GB18030 解码，再映射回解压库返回的 Latin-1 名称。这样既不破坏标准 UTF-8 ZIP，也能兼容中文 Windows 环境里常见的旧压缩包。',
          },
          { type: 'heading', level: 2, text: '下载：用 Blob URL，而不是服务器文件' },
          {
            type: 'paragraph',
            text: '无论压缩还是解压，下载都可以用 Blob URL。压缩结果是 application/zip Blob；解压后的每个文件是 application/octet-stream Blob。页面调用 URL.createObjectURL，放到 a 标签的 href 上，再设置 download 文件名即可。',
          },
          {
            type: 'paragraph',
            text: 'Blob URL 是临时资源，页面关闭后会消失。长期运行的工具页还要在清空结果或组件卸载时调用 URL.revokeObjectURL，避免用户连续处理多个大文件时堆积内存。',
          },
          { type: 'heading', level: 2, text: '必须处理的安全和稳定性边界' },
          {
            type: 'list',
            items: [
              'Zip Slip：ZIP 条目路径里可能包含 ../，展示和下载前必须过滤上级目录片段。',
              'zip bomb：压缩包体积很小但解压后极大，浏览器端应提示大文件风险，并在后续版本加入数量和总大小上限。',
              '加密 ZIP：密码交互和兼容性复杂，当前工具应明确提示不支持，而不是吞掉错误。',
              '内存压力：几百 MB 的 ZIP 或大量文件会占用浏览器内存，应优先保持 UI 可恢复、错误可理解。',
              '文件名冲突：压缩时同名文件必须自动重命名，解压下载时至少要保留基础文件名。',
            ],
          },
          { type: 'heading', level: 2, text: '工程分层怎么放？' },
          {
            type: 'paragraph',
            text: '在 ToolGarden 里，ZIP 能力遵循 Harness Engineering：工具元数据进 registry，文案进 messages，ZIP 算法进 lib/utils/zip.ts，页面组件只处理 useState、文件选择、目录展开和下载点击。这样首页、Other tools 菜单、面包屑、SEO、sitemap 和 llms 文件都能从同一套元数据自动派生。',
          },
          {
            type: 'callout',
            title: '试试浏览器本地 ZIP 工具',
            text: '你可以直接选择文件压缩成 ZIP，也可以上传 ZIP 查看目录结构并下载其中的单个文件。文件内容不会上传到服务器。',
            href: '/zip-compress',
            linkLabel: '打开 ZIP 压缩',
          },
        ],
        faq: [
          {
            question: '在线压缩和解压一定需要服务器吗？',
            answer: '不一定。ZIP 这类格式可以在浏览器里用 File API 读取、用 JavaScript 库压缩或解压，再用 Blob URL 下载。服务器只负责提供页面资源，不必接收用户文件。',
          },
          {
            question: '为什么 ZIP 解压后的中文文件名会乱码？',
            answer: '因为一些 ZIP 没有设置 UTF-8 文件名标志，但文件名字节实际是 GBK 或 GB18030。需要读取中央目录里的原始文件名字节，并在没有 UTF-8 标志时使用 GB18030 fallback 解码。',
          },
          {
            question: '浏览器本地 ZIP 工具适合处理多大的文件？',
            answer: '取决于设备内存和浏览器。普通附件和资料包通常没问题；几百 MB 以上、大量文件或可疑压缩包可能变慢或失败，应提示用户风险并考虑分批处理。',
          },
        ],
      },
      en: {
        title: 'How to Build Online File Compression and Extraction with Browser-Local ZIP',
        excerpt: 'Online compression and extraction do not always need a server upload. File API, fflate, Blob URLs, and a folder-tree model are enough to create ZIP files, extract archives, browse directories, and download individual files in the browser.',
        metaTitle: 'How to Build Online File Compression and Extraction in the Browser',
        metaDescription: 'Learn how browser-local ZIP compression and extraction work with File API, fflate, Blob URLs, folder trees, filename encoding fallback, Zip Slip protection, and large-file limits.',
        readingTime: '9 min read',
        tags: ['ZIP', 'file compression', 'file extraction', 'browser local', 'frontend engineering'],
        relatedTools: [
          {
            label: 'ZIP Compressor',
            href: '/zip-compress',
            description: 'Select multiple files and compress them into a ZIP archive locally in your browser.',
          },
          {
            label: 'ZIP Extractor',
            href: '/zip-extract',
            description: 'Extract a ZIP locally, browse folders, and download individual files.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Online file compression and extraction sound like server-side work: upload files, process them remotely, then download the result. But for ZIP archives, modern browsers can handle most everyday workflows directly. Files can stay on the user device while the page reads local data, runs the archive algorithm, and creates download links.',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden ZIP Compressor and ZIP Extractor follow that model. The compressor turns multiple File objects into one ZIP Blob. The extractor reads ZIP bytes, parses entries, rebuilds a folder tree from paths, and lets users download individual files. No API route receives the file contents.',
          },
          { type: 'heading', level: 2, text: 'The Data Flow' },
          {
            type: 'code',
            language: 'text',
            code: `Compression:
File input / drag drop
  -> File API reads Blob data
  -> normalize archive paths
  -> fflate zipSync
  -> Blob(application/zip)
  -> URL.createObjectURL download

Extraction:
ZIP File
  -> arrayBuffer
  -> inspect central directory for filename encoding
  -> fflate unzipSync
  -> filter unsafe paths
  -> build folder tree
  -> create Blob download for each file`,
          },
          {
            type: 'paragraph',
            text: 'The important boundary is that the page can read files the user explicitly chooses, but it does not need to send those bytes to a server. The server delivers JavaScript, CSS, and static assets; the actual work happens inside the browser process.',
          },
          { type: 'heading', level: 2, text: 'Why ZIP, Not RAR or 7z?' },
          {
            type: 'paragraph',
            text: 'ZIP has mature JavaScript implementations for both creation and extraction, and the output works almost everywhere. Windows, macOS, Linux, and mobile operating systems can usually open a .zip without extra software. For a web utility, that makes ZIP the reliable default.',
          },
          {
            type: 'paragraph',
            text: 'RAR and 7z are different. Extraction can be evaluated separately, but archive creation is not as open, lightweight, or browser-friendly as ZIP creation. Rather than shipping fragile format support, the compressor exports ZIP only and the extractor focuses on ZIP first.',
          },
          { type: 'heading', level: 2, text: 'Which Third-Party Packages Are Used?' },
          {
            type: 'paragraph',
            text: 'The ZIP feature has a deliberately small dependency surface. fflate does the archive work; React, Next.js, and next-intl handle UI, routing, and localized copy; Vitest protects the utility behavior. There is no server upload pipeline, cloud storage SDK, RAR writer, or 7z WASM runtime in this implementation.',
          },
          {
            type: 'table',
            headers: ['Package', 'What it does here', 'How it is used'],
            rows: [
              ['fflate', 'Creates ZIP archives, extracts ZIP archives, and handles Deflate / Store ZIP entry data.', 'lib/utils/zip.ts imports zipSync and unzipSync. Compression passes a path-to-Uint8Array map into zipSync; extraction passes the ZIP Uint8Array into unzipSync.'],
              ['React', 'Tracks selected files, processing state, expanded folders, error messages, and download actions.', 'ZipCompressTool and ZipExtractTool use useState, useMemo, useEffect, and useRef. React orchestrates UI but does not implement the ZIP algorithm.'],
              ['Next.js App Router', 'Provides localized routes, static export, and metadata generation.', 'app/[locale]/zip-compress and app/[locale]/zip-extract define pages and layouts, while createToolMetadata derives SEO metadata.'],
              ['next-intl', 'Provides Chinese and English UI copy.', 'Pages call useTranslations to read tools.zip-compress and tools.zip-extract from messages/zh.json and messages/en.json.'],
              ['Vitest', 'Tests ZIP utility behavior so future edits do not break paths or Chinese filenames.', 'tests/zip.test.ts covers nested-path round trips and a hand-built GBK filename ZIP for the GB18030 fallback.'],
            ],
          },
          {
            type: 'code',
            language: 'typescript',
            code: `import { unzipSync, zipSync } from 'fflate';

const zipped = zipSync({
  'docs/readme.txt': new TextEncoder().encode('hello'),
});

const files = unzipSync(zipped);
const readme = files['docs/readme.txt'];`,
          },
          {
            type: 'paragraph',
            text: 'This implementation does not need file-saver. Browser-native download behavior is enough: create a temporary URL with URL.createObjectURL, assign it to an anchor, set the download filename, and click it. Avoiding another download dependency keeps the bundle and runtime path simpler.',
          },
          { type: 'heading', level: 2, text: 'Compression: Multiple Files to One ZIP Blob' },
          {
            type: 'paragraph',
            text: 'The compression page should stay thin: selected files, output filename, compression level, and button state. The real implementation belongs in a utility module such as lib/utils/zip.ts, where a function receives filename + blob entries and returns a discriminated result instead of touching React state.',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `type ZipCompressionOutcome =
  | {
      ok: true;
      blob: Blob;
      filename: string;
      fileCount: number;
      originalSize: number;
      outputSize: number;
      durationMs: number;
    }
  | { ok: false; code: 'empty_selection' | 'empty_file' | 'zip_failed' };`,
          },
          {
            type: 'paragraph',
            text: 'Before compression, normalize archive paths. Folder uploads may expose webkitRelativePath, while normal file selection only has file.name. Replace backslashes, drop empty segments, remove . and .., and rename duplicate paths so later files do not silently overwrite earlier ones.',
          },
          {
            type: 'paragraph',
            text: 'fflate zipSync handles the archive generation. Compression levels range from 0 to 9: 0 is closer to packaging without compression, while 9 may save more space at the cost of time. A default of 6 is a practical speed-to-size balance.',
          },
          { type: 'heading', level: 2, text: 'Extraction: Entries First, Folder Tree Second' },
          {
            type: 'paragraph',
            text: 'The extractor should not flatten every file into one long list. ZIP entries contain paths such as docs/readme.txt and docs/assets/logo.png; splitting those paths gives a natural folder tree. Folder rows can expand and collapse, while file rows show size and a download button.',
          },
          {
            type: 'code',
            language: 'typescript',
            code: `interface ZipExtractedEntry {
  path: string;
  name: string;
  size: number;
  blob: Blob;
}

interface TreeNode {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  entry?: ZipExtractedEntry;
}`,
          },
          {
            type: 'paragraph',
            text: 'Keep extraction and display concerns separate. The utility function returns entries; the React component builds TreeNode data and owns interaction state such as expanded folders. That keeps the archive parser testable and the UI easier to change.',
          },
          { type: 'heading', level: 2, text: 'Why Chinese Filenames Become Garbled' },
          {
            type: 'paragraph',
            text: 'Many ZIP filenames are UTF-8, but not every archive sets the UTF-8 flag. Older archives from Chinese Windows environments often store filename bytes as GBK or GB18030. If the unzip library interprets those bytes as Latin-1 or another fallback, Chinese names become unreadable.',
          },
          {
            type: 'paragraph',
            text: 'A practical fix is to inspect raw filename bytes in the ZIP central directory. When an entry does not have the UTF-8 filename flag, decode those bytes with GB18030 and map that name back to the Latin-1 name returned by the unzip library. Standard UTF-8 ZIP files remain untouched, while legacy Chinese filenames display correctly.',
          },
          { type: 'heading', level: 2, text: 'Downloads Use Blob URLs' },
          {
            type: 'paragraph',
            text: 'Both compression and extraction can download from Blob URLs. The compressed result is an application/zip Blob. Each extracted file is an application/octet-stream Blob. The page calls URL.createObjectURL, assigns it to an anchor href, and sets the download filename.',
          },
          {
            type: 'paragraph',
            text: 'Blob URLs are temporary browser resources. A long-running tool should revoke them when clearing results or unmounting the component, especially when users process multiple large archives in one session.',
          },
          { type: 'heading', level: 2, text: 'Security and Reliability Boundaries' },
          {
            type: 'list',
            items: [
              'Zip Slip: archive paths may contain ../ segments, so clean paths before showing or downloading them.',
              'Zip bombs: a tiny archive may expand into huge output, so warn about large files and add entry-count or total-size limits in stricter deployments.',
              'Encrypted ZIP: password flows and compatibility are complex; unsupported encrypted archives should fail clearly.',
              'Memory pressure: hundreds of MB or thousands of files can slow down or crash a browser tab.',
              'Filename collisions: compression should rename duplicate archive paths instead of overwriting silently.',
            ],
          },
          { type: 'heading', level: 2, text: 'Where the Code Belongs' },
          {
            type: 'paragraph',
            text: 'In ToolGarden, ZIP tools follow the Harness Engineering pattern: metadata in the registry, copy in messages, archive logic in lib/utils/zip.ts, and page components limited to state, file selection, folder expansion, and download clicks. Home cards, the Other tools menu, breadcrumbs, SEO metadata, sitemap, and llms files all derive from the same metadata.',
          },
          {
            type: 'callout',
            title: 'Try the browser-local ZIP tools',
            text: 'Compress selected files into a ZIP, or upload a ZIP to browse its folder structure and download individual files. File contents are not uploaded to the server.',
            href: '/zip-compress',
            linkLabel: 'Open ZIP Compressor',
          },
        ],
        faq: [
          {
            question: 'Does online ZIP compression need a server?',
            answer: 'No. A browser can read user-selected files with File API, compress or extract ZIP archives with JavaScript, and download results through Blob URLs. The server only needs to serve the web app.',
          },
          {
            question: 'Why do Chinese filenames look garbled after ZIP extraction?',
            answer: 'Some ZIP archives omit the UTF-8 filename flag while storing names as GBK or GB18030 bytes. Inspecting the central directory and applying a GB18030 fallback fixes many legacy Chinese ZIP filenames.',
          },
          {
            question: 'How large can browser-local ZIP processing go?',
            answer: 'It depends on browser and device memory. Normal attachment-sized archives work well, but hundreds of MB, thousands of files, or suspicious archives can be slow or fail. Production tools should communicate those limits clearly.',
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
