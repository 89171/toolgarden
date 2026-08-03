import { defineToolContent } from './define';

export const qrCodeDecoderContent = defineToolContent({
  zh: {
    overview: ['二维码解码器从上传图片中定位方形码并还原其文本内容，适合读取截图、照片和无法直接使用相机扫描的文件。清晰度、透视角度、反光、遮挡、静区和像素尺寸都会影响识别。', '解码出的 URL 只是文本，不代表目标网站可信。打开之前应完整查看域名、协议和参数，警惕相似拼写、短链、登录诱导和自动下载；未知内容可以先复制到安全检查流程。'],
    steps: [['上传清晰图片', '尽量裁到二维码附近，纠正角度并保留四周空白。'], ['执行解码', '查看完整文本，失败时尝试更清晰、正面的来源。'], ['安全核对内容', '在点击链接前检查域名和协议，敏感操作应通过已知入口访问。']],
    scenarios: [['读取截图中的二维码', '从聊天、网页或文档截图恢复链接和文本。'], ['核对印刷码内容', '在发布前确认海报或包装上的二维码没有指向错误地址。'], ["确认收款码指向的收款方", "扫之前先解码看清实际内容，避免被替换过的收款码引导到陌生账户。"]],
    notes: ['不要直接访问来历不明二维码中的登录、付款或软件下载链接。', '过度裁剪静区、低对比和严重透视会降低识别率。', '解码器通常读取一个主要二维码，多码图片应分别裁剪处理。'],
    specs: [["两种输入", "上传二维码图片，或开启摄像头实时识别"], ["摄像头权限", "需要浏览器授权。拒绝后只能使用图片上传方式"], ["识别成功率", "取决于清晰度、对比度和拍摄角度。反光、模糊、严重倾斜或部分遮挡会失败"], ["能识别的码", "标准 QR 码。条形码、DataMatrix 等其它码制不在支持范围"], ["输出", "解码后的文本，可直接复制"], ["安全提醒", "解码只是读出内容，不代表其中的链接安全。陌生二维码里的网址请先确认再打开"]],
    faq: [{ question: "为什么有些二维码识别不出来？", answer: "常见原因是清晰度不足、反光、倾斜过大或部分被遮挡。此外这里只支持标准 QR 码：条形码、DataMatrix、PDF417 等其它码制不在范围内。" }, { question: "解码成功说明这个二维码安全吗？", answer: "不说明。解码只是把编码内容读出来，不做任何安全判断。陌生二维码里的网址可能指向钓鱼站点，付款码可能被替换过。读出内容之后仍需要你自己核对目标是否可信。" }],
    reference: [['payload', '二维码内部编码并在扫描后得到的文本数据。'], ['perspective distortion', '斜拍导致正方形变成梯形的几何变形。']],
  },
  en: {
    overview: ['The QR decoder locates a square code in an uploaded image and restores its text, useful for screenshots, photographs, and files that cannot be scanned directly with a camera. Sharpness, perspective, glare, obstruction, quiet zone, and pixel dimensions affect recognition.', 'A decoded URL is only text and does not make the destination trustworthy. Inspect the complete domain, scheme, and parameters before opening and watch for lookalike names, short links, login prompts, and automatic downloads.'],
    steps: [['Upload a clear image', 'Crop near the code while retaining its margin and correct severe rotation or perspective.'], ['Decode the code', 'Read the complete text and try a sharper, more frontal source if recognition fails.'], ['Review safely', 'Check domain and scheme before clicking and use a known entry point for sensitive actions.']],
    scenarios: [['Reading a QR screenshot', 'Recover a link or text from chat, web, or document imagery.'], ['Verifying printed code content', 'Confirm that artwork on a poster or package points to the intended address before release.'], ["Verifying who a payment code actually pays", "Decoding before you scan shows the real content, so a substituted payment code cannot quietly route money to an unfamiliar account."]],
    notes: ['Do not directly visit unknown QR destinations asking for login, payment, or software download.', 'Overcropped margins, low contrast, and strong perspective reduce recognition.', 'A decoder commonly reads one primary code; crop multi-code images separately.'],
    specs: [["Two inputs", "Upload an image of the code, or scan live with the camera"], ["Camera permission", "Requires browser consent; if you decline, only image upload is available"], ["Success rate", "Depends on sharpness, contrast and angle. Glare, blur, heavy skew or partial occlusion will fail"], ["Codes supported", "Standard QR codes. Barcodes, DataMatrix and other symbologies are out of scope"], ["Output", "The decoded text, ready to copy"], ["Safety note", "Decoding only reveals the content; it does not vouch for it. Verify a URL from an unknown code before opening it"]],
    faq: [{ question: "Why can some codes not be read?", answer: "Usually insufficient sharpness, glare, heavy skew or partial occlusion. Beyond that, only standard QR codes are supported; barcodes, DataMatrix, PDF417 and other symbologies are out of scope." }, { question: "Does a successful decode mean the code is safe?", answer: "No. Decoding reads the encoded content and makes no security judgement. A URL from an unknown code may point to a phishing site and a payment code may have been substituted. You still have to verify the destination yourself." }],
    reference: [['payload', 'The text data encoded inside a QR code and returned after scanning.'], ['perspective distortion', 'Geometric skew that turns a photographed square into a trapezoid.']],
  },
});
