import { defineToolContent } from './define';

export const whiteboardContent = defineToolContent({
  zh: {
    overview: ['在线白板提供自由书写、绘图和空间整理的画布，适合快速解释想法、标记流程和开展个人草图。空间位置本身可以表达分组和关系，但没有明确标题与阅读顺序的画布也容易让接收者迷失。', '浏览器白板更适合作为即时工作区而不是唯一存档。开始前应了解保存、导出和本地缓存行为，重要内容定期导出，并避免在共享设备上遗留机密信息。'],
    steps: [['先写清目标', '在画布顶部说明问题、日期和期望产出。'], ['按区域组织内容', '使用稳定的颜色和简单图形表达分组、顺序与负责人。'], ['整理并导出', '删除重复草图，补充图例和结论，保存可继续使用的副本。']],
    scenarios: [['远程解释方案', '用简单框线和箭头辅助讲解页面布局或业务流程。'], ['个人快速构思', '在正式文档前捕捉草图、问题和可选方向。'], ["把讨论过程留成可回看的记录", "会议中边说边画，结束后导出图片附在会议纪要里，比纯文字纪要更能还原当时的思路。"]],
    notes: ['刷新或清理浏览器数据可能影响未导出的本地内容。', '白板图片缺少结构化文本，重要结论还应写入可搜索文档。', '共享截图前检查画布边缘是否包含姓名、密钥或其它敏感便签。'],
    specs: [["底层引擎", "开源 tldraw，在浏览器本地运行"], ["可用元素", "图形、画笔、便签、文字、箭头、图片，支持多页面"], ["内容保存位置", "浏览器本地存储。清理浏览数据、换浏览器或换设备后内容不可见"], ["协作", "不提供多人实时协作，内容只存在于你这一台设备上"], ["导出", "可导出为图片或文件，重要内容请及时导出保存"], ["与 Excalidraw 画板的区别", "这里是规整的矢量风格，Excalidraw 是手绘风格，适合不同的表达场景"]],
    faq: [{ question: "换台电脑打开为什么内容不在了？", answer: "内容存在浏览器的本地存储里，不同设备、不同浏览器之间不同步，也没有账号体系。重要内容请导出成文件保存，这是唯一可靠的保留方式。" }, { question: "和 Excalidraw 画板该用哪个？", answer: "这里是规整的矢量风格，适合需要看起来正式的图；Excalidraw 是手绘风格，刻意的粗糙感适合表达「这还是草案」。功能上都覆盖图形、文字和图片，主要按表达意图选。" }],
    reference: [['canvas', '允许对象按二维坐标自由放置的工作区域。'], ['spatial grouping', '利用距离、边界和对齐表达内容之间关系的方法。']],
  },
  en: {
    overview: ['An online whiteboard provides a freeform canvas for writing, drawing, and spatial organization, useful for explaining an idea, marking a process, or sketching independently. Position can express groups and relationships, but a canvas without a title or reading path can confuse its recipient.', 'A browser whiteboard is better as an immediate workspace than the only archive. Understand save, export, and local-cache behavior, export important work regularly, and avoid leaving confidential information on a shared device.'],
    steps: [['State the objective', 'Write the question, date, and expected outcome at the top of the canvas.'], ['Organize into regions', 'Use consistent colors and simple shapes for groups, sequence, and ownership.'], ['Clean and export', 'Remove duplicate sketches and add a legend and conclusions before saving a reusable copy.']],
    scenarios: [['Explaining a solution remotely', 'Use simple boxes and arrows to support a page-layout or business-process discussion.'], ['Capturing an individual idea', 'Sketch questions and possible directions before creating a formal document.'], ["Keeping a discussion as a reviewable record", "Draw while you talk, then export an image to attach to the minutes; it recovers the reasoning far better than prose alone."]],
    notes: ['Refreshing or clearing browser data can affect local work that was not exported.', 'A whiteboard image lacks structured searchable text, so record important decisions in a document too.', 'Before sharing a screenshot, inspect canvas edges for names, secrets, or sensitive notes.'],
    specs: [["Underlying engine", "The open-source tldraw, running locally in the browser"], ["Available elements", "Shapes, freehand drawing, sticky notes, text, arrows and images, across multiple pages"], ["Where content is stored", "Browser local storage. Clearing browsing data, switching browsers or changing device makes it disappear"], ["Collaboration", "No real-time multi-user editing; the content exists only on this device"], ["Export", "To image or file; export anything you care about promptly"], ["vs Excalidraw Board", "This is a clean vector style; Excalidraw is hand-drawn, which suits a different kind of communication"]],
    faq: [{ question: "Why is my board empty on another computer?", answer: "Content lives in browser local storage, which does not sync across devices or browsers, and there are no accounts. Export anything important to a file; that is the only reliable way to keep it." }, { question: "This or Excalidraw Board?", answer: "This is a clean vector style, right when the diagram should look finished. Excalidraw is hand-drawn, and its deliberate roughness communicates \"still a draft\". Both cover shapes, text and images, so choose by intent." }],
    reference: [['canvas', 'A workspace allowing objects to be placed freely at two-dimensional coordinates.'], ['spatial grouping', 'Using distance, boundaries, and alignment to communicate relationships.']],
  },
});
