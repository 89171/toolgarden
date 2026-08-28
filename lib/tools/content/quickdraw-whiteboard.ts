import { defineToolContent } from './define';

export const quickdrawWhiteboardContent = defineToolContent({
  zh: {
    overview: ['Quickdraw 白板提供 MIT 许可的无限画布，适合快速绘制草图、流程、批注和会议讨论图。它在浏览器中本地运行，支持画笔、荧光笔、图形、箭头、文字、便签、图片和导出。', '这个页面更适合作为轻量、即开即用的个人白板。内容会保存到当前浏览器的本地存储中，重要内容仍建议及时导出，避免清理浏览器数据后丢失。'],
    steps: [['打开画布', '直接在浏览器中进入白板，不需要登录或安装客户端。'], ['绘制与整理', '使用画笔、图形、箭头、文字和便签组织信息，按空间位置表达关系。'], ['全屏或导出', '演示时进入全屏，结束后用内置导出保存图片副本。']],
    scenarios: [['会议讲解', '边讨论边画流程、关系和待办，让口头解释更容易跟上。'], ['产品和技术草图', '快速画页面布局、接口流程或架构轮廓，再迁移到正式文档。'], ['课堂和演示批注', '全屏打开画布，用画笔和高亮标记重点。']],
    notes: ['内容保存在当前浏览器本地存储，不会跨设备自动同步。', '清理浏览器数据可能删除未导出的白板内容。', '分享截图或导出图片前，检查画布边缘是否包含敏感信息。'],
    specs: [['底层引擎', '开源 Quickdraw / @quickdrawjs/react，本地浏览器运行'], ['可用元素', '画笔、荧光笔、图形、箭头、直线、文字、便签和图片'], ['画布模式', '无限画布，支持缩放、平移、网格背景和全屏使用'], ['保存位置', '浏览器 localStorage，仅当前设备和当前浏览器可见'], ['导出', '支持使用 Quickdraw 内置导出保存 PNG'], ['许可与标识', 'Quickdraw 使用 MIT 许可，本页面关闭默认角标水印']],
    faq: [{ question: 'Quickdraw 白板内容会上传吗？', answer: '不会。画布在浏览器本地运行，当前页面只把快照保存到本机 localStorage。' }, { question: '和 tldraw 白板有什么区别？', answer: 'Quickdraw 是 MIT 许可、无需 license key 的白板 SDK，体验更轻量；现有 tldraw 白板保留多页面等 tldraw 生态能力。' }],
    reference: [['infinite canvas', '可以持续缩放和平移、没有固定页面边界的二维画布。'], ['local snapshot', '把白板当前对象数据序列化后保存在浏览器本地，用于刷新后恢复。']],
  },
  en: {
    overview: ['Quickdraw Whiteboard provides an MIT-licensed infinite canvas for sketches, flows, annotations, and meeting diagrams. It runs locally in the browser and supports pen, highlighter, shapes, arrows, text, sticky notes, images, and export.', 'Use this page as a lightweight personal board that opens instantly. Content is saved in this browser local storage, but important work should still be exported so it survives browser data cleanup.'],
    steps: [['Open the board', 'Start drawing in the browser without an account or desktop app.'], ['Draw and organize', 'Use pen, shapes, arrows, text, and notes to arrange ideas spatially.'], ['Fullscreen or export', 'Enter fullscreen for presenting, then use the built-in export to keep a PNG copy.']],
    scenarios: [['Meeting explanation', 'Sketch flows, relationships, and action items while the discussion is happening.'], ['Product and technical drafts', 'Rough out layouts, API flows, or architecture outlines before moving to formal docs.'], ['Teaching and presentation markup', 'Open the board fullscreen and use pen or highlighter marks to focus attention.']],
    notes: ['Content is stored in this browser local storage and does not sync across devices.', 'Clearing browser data can remove work that has not been exported.', 'Before sharing screenshots or exports, inspect the canvas edges for sensitive information.'],
    specs: [['Underlying engine', 'Open-source Quickdraw / @quickdrawjs/react, running locally in the browser'], ['Available elements', 'Pen, highlighter, shapes, arrows, lines, text, sticky notes, and images'], ['Canvas mode', 'Infinite canvas with zoom, pan, grid background, and fullscreen use'], ['Storage', 'Browser localStorage, visible only on this device and browser'], ['Export', 'PNG export through the built-in Quickdraw toolbar'], ['License and mark', 'Quickdraw uses the MIT license, and this page disables the default corner watermark']],
    faq: [{ question: 'Is my Quickdraw board uploaded?', answer: 'No. The board runs locally in the browser, and this page only stores a snapshot in localStorage on your device.' }, { question: 'How is this different from the tldraw whiteboard?', answer: 'Quickdraw is an MIT-licensed SDK with no license key and a lighter feel; the existing tldraw board keeps tldraw ecosystem features such as multiple pages.' }],
    reference: [['infinite canvas', 'A two-dimensional canvas that can keep zooming and panning without a fixed page boundary.'], ['local snapshot', 'A serialized copy of the current board records stored in the browser so refreshes can restore the board.']],
  },
});
