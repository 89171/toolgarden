import type {
  BlogArticle,
  BlogArticleTranslation,
  BlogBlock,
  BlogFaqItem,
} from './articles';

interface ArticleSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
  table?: Extract<BlogBlock, { type: 'table' }>;
  code?: Extract<BlogBlock, { type: 'code' }>;
}

interface ArticleCopy {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  tags: string[];
  relatedTools: BlogArticleTranslation['relatedTools'];
  lead: string;
  intro: string;
  sections: ArticleSection[];
  conclusion: string;
  callout?: Extract<BlogBlock, { type: 'callout' }>;
  faq: BlogFaqItem[];
}

function buildTranslation(copy: ArticleCopy): BlogArticleTranslation {
  const blocks: BlogBlock[] = [
    { type: 'lead', text: copy.lead },
    { type: 'paragraph', text: copy.intro },
  ];

  for (const section of copy.sections) {
    blocks.push({ type: 'heading', level: 2, text: section.heading });
    blocks.push(...section.paragraphs.map((text): BlogBlock => ({ type: 'paragraph', text })));
    if (section.table) blocks.push(section.table);
    if (section.code) blocks.push(section.code);
    if (section.items?.length) blocks.push({ type: 'list', items: section.items });
  }

  if (copy.callout) blocks.push(copy.callout);
  blocks.push(
    { type: 'heading', level: 2, text: /[一-鿿]/u.test(copy.title) ? '总结' : 'Key takeaways' },
    { type: 'paragraph', text: copy.conclusion }
  );

  return {
    title: copy.title,
    excerpt: copy.excerpt,
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    readingTime: copy.readingTime,
    tags: copy.tags,
    relatedTools: copy.relatedTools,
    blocks,
    faq: copy.faq,
  };
}

function article(slug: string, en: ArticleCopy, zh: ArticleCopy): BlogArticle {
  return {
    slug,
    publishedAt: '2026-07-20',
    updatedAt: '2026-07-20',
    translations: {
      en: buildTranslation(en),
      zh: buildTranslation(zh),
    },
  };
}

const qrGeneratorEn = {
  label: 'WiFi QR Code Generator',
  href: '/qr-code/generate',
  description: 'Generate a WiFi QR code locally from a network name, security type, and password.',
};

const qrGeneratorZh = {
  label: 'WiFi 二维码生成器',
  href: '/qr-code/generate',
  description: '根据网络名称、加密类型和密码在浏览器本地生成 WiFi 二维码。',
};

export const growthSeoBlogArticles: BlogArticle[] = [
  article(
    'wifi-qr-code-generator-guide',
    {
      title: 'Building QR Codes for WiFi: A Step-by-Step Guide',
      excerpt: 'Create reliable WiFi QR codes for WPA, open, and hidden networks, including correct payload syntax, escaping rules, security checks, and scan testing.',
      metaTitle: 'WiFi QR Code Generator Guide: Syntax, Escaping, and Testing',
      metaDescription: 'Build a WiFi QR code step by step. Learn WIFI payload syntax, WPA and open networks, hidden SSIDs, special-character escaping, security, and scan testing.',
      readingTime: '9 min read',
      tags: ['WiFi QR code generator', 'WiFi QR syntax', 'QR Code', 'WPA', 'local QR generator'],
      relatedTools: [
        qrGeneratorEn,
        { label: 'QR Code Decoder', href: '/qr-code/decode', description: 'Decode the exported QR image locally and verify the exact WiFi payload.' },
      ],
      lead: 'A WiFi QR code is a QR image containing a structured text payload. When a compatible phone scans that payload, it can recognize the network name, security type, password, and hidden-network flag, then ask the user whether to join.',
      intro: 'The image is usually easy to generate; most failures come from malformed payload text, missing escaping, low contrast, or insufficient testing. The following workflow uses the de facto WIFI format implemented by widely used QR readers and mobile cameras.',
      sections: [
        {
          heading: 'Understand the WIFI payload',
          paragraphs: ['A common password-protected network uses this structure. T is the authentication type, S is the SSID, P is the password, and the final double semicolon closes the payload.'],
          code: { type: 'code', language: 'text', code: 'WIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;' },
          table: {
            type: 'table',
            headers: ['Field', 'Meaning', 'Example'],
            rows: [
              ['T', 'Authentication type', 'WPA, WEP, WPA2-EAP, or nopass'],
              ['S', 'Network SSID; required', 'Studio Network'],
              ['P', 'Password; omit for nopass', 'correct-horse-battery-staple'],
              ['H', 'Hidden SSID flag; optional', 'true'],
            ],
          },
        },
        {
          heading: 'Step 1: collect and classify the network details',
          paragraphs: ['Copy the SSID exactly, including capitalization and spaces. Confirm whether the network uses WPA-family security, WEP, enterprise authentication, or no password. If it is hidden, record that explicitly. Do not guess the security type from the password format.'],
          items: [
            'Prefer a guest network instead of exposing a primary household or office credential.',
            'Check whether captive-portal terms still appear after joining.',
            'Decide where the printed or displayed code will be visible.',
            'Plan a credential rotation date before distributing permanent signage.',
          ],
        },
        {
          heading: 'Step 2: escape special characters',
          paragraphs: ['Backslash, semicolon, comma, double quote, and colon have structural meaning and should be escaped with a backslash when they occur inside values. Escaping is the most common reason a visually correct code produces a truncated password or wrong SSID.'],
          code: { type: 'code', language: 'text', code: 'SSID: Cafe;Guest\\5G\nPayload value: Cafe\\;Guest\\\\5G\n\nPassword: tea:milk,2026\nPayload value: tea\\:milk\\,2026' },
        },
        {
          heading: 'Step 3: build the payload for your network type',
          paragraphs: ['Use one of these patterns, substituting escaped values. Field order is flexible, but consistent order makes manual review easier.'],
          code: { type: 'code', language: 'text', code: 'WPA network\nWIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;\n\nOpen network\nWIFI:T:nopass;S:Guest Lounge;;\n\nHidden WPA network\nWIFI:T:WPA;S:Hidden Lab;P:sample-password;H:true;;' },
        },
        {
          heading: 'Step 4: generate locally and choose robust visual settings',
          paragraphs: ['Paste the payload into a QR generator or use a structured WiFi form. Use a dark foreground on a light background, preserve a quiet zone around all four sides, and avoid decorative patterns that change the finder squares. More characters create a denser symbol and may require a larger image.'],
          items: [
            'Start with black on white for the most predictable result.',
            'Keep logos small and raise error correction only when decoration requires it.',
            'Export at a resolution appropriate to the final physical size.',
            'Do not screenshot a tiny preview and scale it up for print.',
          ],
        },
        {
          heading: 'Step 5: verify the payload and real-world scan',
          paragraphs: ['Decode the exported QR file to confirm the exact text, then scan it from the expected distance on at least one iOS and one Android device when possible. Verify that the phone shows the intended SSID before accepting the connection prompt. Test the printed material, not just the source PNG on a bright monitor.'],
        },
        {
          heading: 'Troubleshooting WiFi QR codes',
          paragraphs: ['If scanning fails, separate image-recognition problems from payload problems. First decode the image as plain text. If decoding fails, increase size, contrast, and quiet zone. If the payload decodes but the phone does not offer to connect, compare every field and escape character.'],
          table: {
            type: 'table',
            headers: ['Symptom', 'Likely cause', 'Fix'],
            rows: [
              ['No scanner recognizes the image', 'Low contrast, blur, crop, or dense output', 'Regenerate larger with a clear quiet zone'],
              ['Text decodes but no join prompt appears', 'Invalid WIFI syntax or unsupported authentication', 'Check T, S, P, H, escapes, and terminator'],
              ['SSID is truncated', 'Unescaped semicolon or backslash', 'Escape every structural character in the value'],
              ['Correct payload joins the wrong network', 'Duplicate SSID nearby', 'Rename the guest SSID or verify before joining'],
              ['Old device fails', 'Reader or authentication support differs', 'Provide the SSID and password as a text fallback'],
            ],
          },
        },
        {
          heading: 'Treat the QR code as a visible password',
          paragraphs: ['A WiFi QR code does not encrypt the password. Anyone who can photograph or decode the image can recover the payload. Use a guest network, isolate untrusted clients, restrict where the code is displayed, and replace both the sign and credential when access should end.'],
        },
      ],
      callout: { type: 'callout', title: 'Generate and verify locally', text: 'Create the WiFi QR code in your browser, download it, then decode the image to verify the exact payload before printing.', href: '/qr-code/generate', linkLabel: 'Open WiFi QR Code Generator' },
      conclusion: 'A reliable WiFi QR code needs correct field syntax, complete escaping, clear artwork, and real-device testing. Build it from an isolated guest credential, verify both the decoded text and the join prompt, and remember that convenience does not make the embedded password confidential.',
      faq: [
        { question: 'What is the correct WiFi QR code format?', answer: 'A typical WPA payload is WIFI:T:WPA;S:Network Name;P:password;;. Use nopass for an open network and add H:true for a hidden SSID. Escape backslash, semicolon, comma, double quote, and colon inside values.' },
        { question: 'Does a WiFi QR code hide or encrypt the password?', answer: 'No. The QR symbol encodes readable text. A scanner can recover the password, so use a guest network and control where the code is displayed.' },
        { question: 'Why does the QR code scan but not connect?', answer: 'The image layer is working, but the WIFI payload may have the wrong security type, an unescaped character, a misspelled SSID, an unsupported enterprise configuration, or a missing terminator. Decode it as text and compare every field.' },
        { question: 'Can I make a QR code for a hidden WiFi network?', answer: 'Yes. Add H:true to the payload and still include the exact SSID. Hidden networks are not a substitute for strong authentication, and device behavior can vary, so test the final code on target phones.' },
        { question: 'Should I put my main WiFi password in a QR code?', answer: 'A separate guest network is safer because the QR can be copied. Use client isolation where appropriate and rotate the guest credential when the intended audience changes.' },
      ],
    },
    {
      title: 'WiFi 二维码生成：从格式到扫码测试的完整步骤',
      excerpt: '正确生成 WPA、开放和隐藏网络的 WiFi 二维码，掌握载荷格式、特殊字符转义、安全检查与扫码测试。',
      metaTitle: 'WiFi 二维码生成教程：格式、转义与扫码测试',
      metaDescription: '分步骤生成 WiFi 二维码，了解 WIFI 载荷格式、WPA 与开放网络、隐藏 SSID、特殊字符转义、安全建议和扫码测试。',
      readingTime: '约 9 分钟阅读',
      tags: ['WiFi 二维码生成器', 'WiFi 二维码格式', '二维码', 'WPA', '本地二维码'],
      relatedTools: [
        qrGeneratorZh,
        { label: '二维码解码', href: '/qr-code/decode', description: '在本地解码导出的二维码图片，核对完整 WiFi 载荷。' },
      ],
      lead: 'WiFi 二维码本质上是一张包含结构化文本载荷的二维码。兼容手机扫码后，可以识别网络名称、加密类型、密码和隐藏网络标记，再询问用户是否连接。',
      intro: '生成图片通常不难，失败更多来自格式错误、字符未转义、对比度不足或没有充分测试。下面的流程采用常见 QR 阅读器和手机相机实现的事实标准 WIFI 格式。',
      sections: [
        {
          heading: '先理解 WIFI 载荷',
          paragraphs: ['常见密码网络使用下面的结构。T 表示认证类型，S 是 SSID，P 是密码，末尾两个分号用于结束载荷。'],
          code: { type: 'code', language: 'text', code: 'WIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;' },
          table: {
            type: 'table',
            headers: ['字段', '含义', '示例'],
            rows: [
              ['T', '认证类型', 'WPA、WEP、WPA2-EAP 或 nopass'],
              ['S', '网络 SSID，必填', 'Studio Network'],
              ['P', '密码；nopass 时省略', 'correct-horse-battery-staple'],
              ['H', '隐藏 SSID 标志，可选', 'true'],
            ],
          },
        },
        {
          heading: '第 1 步：收集并判断网络信息',
          paragraphs: ['准确复制 SSID，包括大小写和空格；确认网络使用 WPA 系列、WEP、企业认证还是无密码；如果网络隐藏，也要明确记录。不要根据密码形式猜测安全类型。'],
          items: [
            '优先使用访客网络，不暴露家庭或办公室主网络凭据。',
            '确认连接后是否还需要通过 Portal 接受条款。',
            '提前考虑打印或展示位置能被哪些人看到。',
            '制作长期标牌前先规划凭据轮换时间。',
          ],
        },
        {
          heading: '第 2 步：转义特殊字符',
          paragraphs: ['反斜杠、分号、逗号、双引号和冒号具有结构含义，出现在字段值中时应在前面加反斜杠。未转义是二维码看似正常、实际密码或 SSID 被截断的最常见原因。'],
          code: { type: 'code', language: 'text', code: 'SSID：Cafe;Guest\\5G\n载荷字段：Cafe\\;Guest\\\\5G\n\n密码：tea:milk,2026\n载荷字段：tea\\:milk\\,2026' },
        },
        {
          heading: '第 3 步：按网络类型构造载荷',
          paragraphs: ['使用下面对应模板，并把字段替换为已转义的值。字段顺序可以调整，但保持固定顺序更方便人工检查。'],
          code: { type: 'code', language: 'text', code: 'WPA 网络\nWIFI:T:WPA;S:Studio Network;P:correct-horse-battery-staple;;\n\n开放网络\nWIFI:T:nopass;S:Guest Lounge;;\n\n隐藏 WPA 网络\nWIFI:T:WPA;S:Hidden Lab;P:sample-password;H:true;;' },
        },
        {
          heading: '第 4 步：在本地生成并选择可靠样式',
          paragraphs: ['把载荷粘贴到二维码生成器，或使用结构化 WiFi 表单。深色前景搭配浅色背景，四周保留静默区，不要修改三个定位方块。内容越长，二维码越密，需要更大的输出尺寸。'],
          items: [
            '优先使用黑底模块和白色背景。',
            'Logo 保持较小，只有装饰确有需要时才提高纠错级别。',
            '根据最终物理尺寸导出足够分辨率。',
            '不要截取很小的预览图再放大打印。',
          ],
        },
        {
          heading: '第 5 步：验证载荷和真实扫码',
          paragraphs: ['先解码导出的二维码文件，确认文本完全正确；再尽量用至少一台 iOS 和一台 Android 设备，从实际使用距离扫码。接受连接前核对手机显示的 SSID。必须测试最终印刷品，而不只是明亮显示器上的源 PNG。'],
        },
        {
          heading: 'WiFi 二维码故障排查',
          paragraphs: ['失败时应区分图片识别问题和载荷问题。先尝试把图片解码为普通文本：解码失败就提高尺寸、对比度和静默区；文本能解码但手机不提示连接，则逐项检查字段与转义。'],
          table: {
            type: 'table',
            headers: ['现象', '可能原因', '处理方式'],
            rows: [
              ['任何扫码器都无法识别', '对比低、模糊、裁切或内容太密', '增大尺寸并保留完整静默区'],
              ['能解码文本但不提示连接', 'WIFI 格式错误或认证不兼容', '检查 T、S、P、H、转义和结束符'],
              ['SSID 被截断', '分号或反斜杠未转义', '转义字段值中的全部结构字符'],
              ['载荷正确但连接到错误网络', '附近存在同名 SSID', '重命名访客网络或连接前确认'],
              ['旧设备无法连接', '扫码器或认证支持不同', '同时提供 SSID 和密码文字备用'],
            ],
          },
        },
        {
          heading: '把二维码当作可见密码',
          paragraphs: ['WiFi 二维码不会加密密码。任何能拍摄或解码图片的人都能恢复载荷。应使用访客网络、隔离不受信任客户端、限制展示位置，并在访问应结束时同时更换标牌和凭据。'],
        },
      ],
      callout: { type: 'callout', title: '在本地生成并验证', text: '在浏览器里生成 WiFi 二维码，下载后再解码图片，确认载荷无误再打印。', href: '/qr-code/generate', linkLabel: '打开 WiFi 二维码生成器' },
      conclusion: '可靠的 WiFi 二维码需要正确字段、完整转义、清晰图形和真机测试。优先使用隔离的访客凭据，同时验证解码文本与连接提示，并记住便利性不会让二维码中的密码自动保密。',
      faq: [
        { question: '正确的 WiFi 二维码格式是什么？', answer: '典型 WPA 载荷是 WIFI:T:WPA;S:Network Name;P:password;;。开放网络使用 nopass，隐藏 SSID 增加 H:true。字段值中的反斜杠、分号、逗号、双引号和冒号需要转义。' },
        { question: 'WiFi 二维码会隐藏或加密密码吗？', answer: '不会。二维码编码的是可读文本，扫码器可以恢复密码，因此应使用访客网络并控制二维码展示范围。' },
        { question: '为什么二维码能识别却不能连接？', answer: '图片层已经正常，但 WIFI 载荷可能使用错误加密类型、字符未转义、SSID 拼写错误、企业认证不兼容或缺少结束符。先解码为文本再逐项对比。' },
        { question: '隐藏 WiFi 可以生成二维码吗？', answer: '可以。在载荷中加入 H:true，同时仍需包含准确 SSID。隐藏网络不能替代强认证，不同设备行为也可能不同，因此必须在目标手机上测试。' },
        { question: '应该把主 WiFi 密码放进二维码吗？', answer: '更安全的做法是建立独立访客网络，因为二维码很容易被复制。适当开启客户端隔离，并在受众变化时轮换访客密码。' },
      ],
    }
  ),
];
