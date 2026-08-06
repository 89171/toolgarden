import { defineToolContent } from './define';

export const pdfWatermarkContent = defineToolContent({
  zh: {
    overview: ['PDF 水印会在页面上叠加文字或标识，用于注明来源、状态、接收人或保密级别。位置、旋转、透明度和应用页范围决定水印的可读性与干扰程度，正式文件应避免遮挡正文、签字、条码和无障碍阅读所需内容。', '水印表达使用规则，却不能从技术上阻止截屏、裁切或重新制作页面。个性化接收人信息可提高可追溯性，但也会在文件中写入个人信息，因此需要合适的保存期限和分发控制。'],
    steps: [['准备简短水印文字', '明确状态、组织或接收人，避免加入不必要的敏感数据。'], ['设置样式和页范围', '在代表性页面预览位置、角度、颜色和透明度。'], ['生成并逐页检查', '确认所有目标页已应用且关键内容没有被遮挡。']],
    scenarios: [['标记审阅版本', '在草稿页加入 DRAFT、日期或版本信息，减少误当终稿。'], ['限制性分发', '为授权接收人生成带姓名或项目编号的可追踪副本。'], ["给外发的草稿打上状态标记", "在评审稿或样本上叠加「草稿」「仅供内部参考」，避免被误当作最终版本使用。"]],
    notes: ['添加水印会修改文件并使已有数字签名失效。', '水印不是永久脱敏或数字版权管理，不能替代访问控制。', '包含姓名、邮箱或编号的个性化水印也属于需要保护的数据。'],
    specs: [["水印类型", "文字水印，默认平铺，也可设置居中、对角线排布和透明度"], ["预览方式", "上传或修改水印设置后自动在右侧更新结果"], ["叠加方式", "在原页面之上新增一层内容，原页面对象不被改写"], ["能防篡改吗", "不能。水印是可被其它 PDF 工具再次编辑或移除的图层，它是标识而不是保护"], ["对文字层的影响", "不影响原文档的文字层，加水印后仍可选中和复制正文"], ["适用范围", "作用于全部页面，页面尺寸不一致时水印位置按各页自身尺寸计算"], ["需要真正保护时", "请改用 PDF 加密设置打开密码"]],
    faq: [{ question: "水印能防止别人盗用吗？", answer: "只能起到标识和威慑作用。水印是叠加的图层，其它 PDF 工具可以编辑或移除。它的价值在于让文档的用途和状态一目了然，而不是技术上的防护。" }, { question: "怎样的水印更难去掉？", answer: "覆盖面积大、跨越正文主体、半透明的对角线平铺，比角落里的小水印难处理得多。代价是影响阅读，需要在可读性和防护之间取舍。" }],
    reference: [['overlay', '绘制在现有页面内容之上的新图形或文字层。'], ['opacity', '叠加内容的不透明程度，影响水印与正文的视觉竞争。']],
  },
  en: {
    overview: ['PDF watermarking overlays text or a mark to communicate source, status, recipient, or confidentiality. Position, rotation, opacity, and page range determine readability and interference. Avoid covering body text, signatures, barcodes, and information needed for accessible reading.', 'A watermark communicates rules but cannot technically prevent screenshots, cropping, or page reconstruction. Personalized recipient data can improve traceability but also writes personal information into the file and needs an appropriate retention and distribution policy.'],
    steps: [['Prepare concise text', 'State status, organization, or recipient without adding unnecessary sensitive data.'], ['Set style and page range', 'Preview position, angle, color, and opacity on representative pages.'], ['Generate and inspect every page', 'Confirm coverage of intended pages without obscuring critical content.']],
    scenarios: [['Marking a review version', 'Add DRAFT, date, or version information to reduce confusion with a final document.'], ['Restricted distribution', 'Generate a traceable copy labeled with an authorized recipient or project number.'], ["Marking the status of a document you are circulating", "Overlay Draft or Internal Use Only on a review copy so nobody mistakes it for the final version."]],
    notes: ['Watermarking modifies the file and invalidates an existing digital signature.', 'A watermark is neither permanent redaction nor digital rights management and does not replace access control.', 'A personalized mark containing names, emails, or identifiers is itself protected data.'],
    specs: [["Watermark type", "Text, tiled by default, with center, diagonal, and adjustable opacity options"], ["Preview behavior", "The result on the right updates automatically after upload or any watermark setting change"], ["How it is applied", "A new layer is drawn over the page; the original page objects are not rewritten"], ["Is it tamper-proof", "No. The watermark is a layer another PDF tool can edit or remove; it marks a document, it does not protect one"], ["Effect on the text layer", "None. Body text remains selectable and copyable after watermarking"], ["Coverage", "Applied to every page, with position computed per page when sizes differ"], ["When you need real protection", "Set an open password with PDF Encrypt instead"]],
    faq: [{ question: "Does a watermark stop someone reusing the file?", answer: "It marks and deters, no more. The watermark is an overlay layer that other PDF tools can edit or remove. Its value is making the document's purpose and status unmistakable, not technical protection." }, { question: "What kind of watermark is hardest to remove?", answer: "Large, semi-transparent diagonal tiling that crosses the body text is far more resistant than a small mark in a corner. The cost is readability, so it is a trade-off." }],
    reference: [['overlay', 'New graphic or text content drawn above the existing page.'], ['opacity', 'How opaque the overlay is, controlling visual competition with the document.']],
  },
});
