import { defineToolContent } from './define';

export const imageIdPhotoContent = defineToolContent({
  zh: {
    overview: [
      '证件照制作会先分离人物，再按预设或自定义毫米尺寸、300 DPI 与背景色排版。自动人脸检测用于提供初始位置，用户仍可拖动和缩放主体，使头顶、下巴与肩部在画面中保持合适比例。',
      '不同国家、机构和申请类型对照片尺寸、头部占比、眼睛位置、服装、背景和拍摄时间有各自要求。本工具帮助完成技术裁切与导出，不代表生成结果已经通过护照、签证或考试报名的官方审核。',
    ],
    steps: [
      ['上传正面人像', '选择光线均匀、五官清晰、头部无遮挡且分辨率充足的照片。'],
      ['选择规格并构图', '按用途选择尺寸和背景色，拖动或缩放人物，对照官方头部比例要求调整。'],
      ['导出前复核', '检查像素尺寸、背景边缘、面部细节和文件格式，再到申请系统验证文件限制。'],
    ],
    scenarios: [
      ['制作报名照片', '按报名系统规定的毫米或像素尺寸生成 JPG，并控制文件体积。'],
      ['准备简历证件照', '统一背景与构图，输出适合在线资料或企业名册的头像。'],
      ["临时补一张证件照", "手边只有一张普通照片时，去背景加换底加构图一次完成，省去跑一趟照相馆。"],
    ],
    notes: [
      '护照和签证规则会随国家和申请类型变化，应以受理机构当前公布的规格为准。',
      '自动去背景和人脸定位可能误判头发、眼镜或肩部，导出前必须放大检查。',
      '修改背景不能修复模糊、闭眼、强阴影或过度美化等不合规的原始拍摄问题。',
    ],
    specs: [["内置尺寸", "中国 1 寸、2 寸、小 2 寸、签证照、2 x 2 inch 等常见规格，也可自定义"], ["处理流程", "先去背景，再按所选规格自动构图，然后换底色"], ["可调整", "底色、人像在画面中的位置与缩放，可手动微调构图"], ["常见底色", "白、蓝、红：具体要求以受理机构的规定为准，本工具不代表任何机构标准"], ["不做什么", "不做美颜、不修改五官、不调整表情，输出的是原始人像"], ["能否直接用于办证", "取决于受理方对尺寸、底色、人脸占比和着装的具体要求，请先核对官方说明"]],
    faq: [{ question: "生成的照片一定能通过审核吗？", answer: "不一定。不同机构对尺寸、底色、人脸占画面比例、是否露耳、着装和表情的要求各不相同，本工具不代表任何机构的标准。请先查阅受理方的官方说明，再对照调整。" }, { question: "为什么边缘看起来有点生硬？", answer: "换底色依赖去背景的分割结果。原照片背景与人物、衣服颜色接近时，边缘判断会不准。用背景干净、光线均匀、与衣服有明显色差的原照片，效果会好很多。" }],
    reference: [
      ['DPI', '每英寸点数，用于把毫米尺寸换算为目标像素尺寸；本工具按 300 DPI 生成。'],
      ['head ratio', '头部高度相对于成片高度的比例，常被证件照规范用于约束构图。'],
    ],
  },
  en: {
    overview: [
      'The ID photo maker separates the subject and lays it out at a preset or custom millimeter size, 300 DPI, and selected background color. Automatic face detection provides an initial position, while drag and zoom controls let you place the crown, chin, and shoulders at the required proportions.',
      'Countries, agencies, and application types have different rules for dimensions, head size, eye position, clothing, background, and photo age. This tool assists with technical cropping and export; it does not certify acceptance by a passport, visa, exam, or identity authority.',
    ],
    steps: [
      ['Upload a front-facing portrait', 'Use an evenly lit, sharp photo with unobstructed facial features and adequate resolution.'],
      ['Choose a specification and compose', 'Select size and background, then move or scale the subject according to the official head-position rules.'],
      ['Review before export', 'Check pixel dimensions, background edges, facial detail, and format, then validate the file limits in the application system.'],
    ],
    scenarios: [
      ['Creating an application photo', 'Generate a JPG at the required physical or pixel dimensions while keeping within the upload size limit.'],
      ['Preparing a résumé portrait', 'Standardize background and composition for an online profile or company directory.'],
      ["Producing an ID photo at short notice", "With only an ordinary photo to hand, background removal, backdrop colour and framing happen in one pass instead of a trip to a studio."],
    ],
    notes: [
      'Passport and visa rules vary by country and application type. Follow the current specification published by the receiving authority.',
      'Automatic background and face detection can misread hair, glasses, or shoulders, so inspect the result at high zoom.',
      'A changed background cannot correct blur, closed eyes, heavy shadows, or prohibited retouching in the source photo.',
    ],
    specs: [["Built-in sizes", "Common formats including Chinese 1-inch and 2-inch, visa photo and 2 x 2 inch, plus a custom option"], ["Pipeline", "Remove the background, auto-compose to the chosen format, then apply a backdrop colour"], ["Adjustable", "Backdrop colour, and the subject's position and scale within the frame for manual fine-tuning"], ["Typical backdrops", "White, blue and red; the requirement comes from the receiving authority, and this tool represents no official standard"], ["What it does not do", "No retouching, no facial modification, no expression changes; the portrait is unaltered"], ["Will it be accepted", "That depends on the authority's rules for size, backdrop, face proportion and clothing; check their published guidance first"]],
    faq: [{ question: "Will the result definitely be accepted?", answer: "Not necessarily. Requirements for size, backdrop, how much of the frame the face fills, whether ears must show, clothing and expression differ by authority, and this tool represents none of them. Read the official guidance first and adjust against it." }, { question: "Why do the edges look harsh?", answer: "The backdrop swap depends on the segmentation result. When the original background is close in colour to the subject or their clothing, edge detection suffers. A clean, evenly lit background that contrasts with the clothing gives a much better result." }],
    reference: [
      ['DPI', 'Dots per inch, used to convert a physical millimeter size to pixels; this tool renders at 300 DPI.'],
      ['head ratio', 'Head height relative to the complete photo height, commonly constrained by identity-photo specifications.'],
    ],
  },
});
