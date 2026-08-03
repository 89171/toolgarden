import { defineToolContent } from './define';

export const excalidrawBoardContent = defineToolContent({
  zh: {
    overview: ['Excalidraw 风格画板用于创建带手绘质感的框图、注释和低保真草图。矩形、箭头、文本和分组比像素级精细设计更适合表达结构与关系，尤其便于在需求尚未稳定时快速迭代。', '画板文件应被视为设计源数据，导出图片则适合分享但不便继续编辑。协作交付时应同时保存可编辑文件和预览图，并用文字补充关键约束、状态和未决问题。'],
    steps: [['定义图的范围', '写出标题、读者和需要回答的问题。'], ['使用有限图形语言', '为相同类型节点保持一致形状、颜色和箭头方向。'], ['整理并双格式导出', '对齐结构，添加图例，同时保存可编辑源和便于查看的图片。']],
    scenarios: [['绘制低保真界面', '快速表达页面区域和交互方向，不陷入视觉细节。'], ['说明系统关系', '用节点和箭头讨论组件、数据或角色之间的连接。'], ["画方案讨论用的架构草图", "手绘风格降低了「这是定稿」的暗示，评审时人们更愿意直接提改动意见。"]],
    notes: ['复杂图应拆分为多个层次，否则缩小后文字和箭头难以阅读。', '图片导出不保留对象可编辑性，后续修改需要源文件。', '图形只表达当前假设，重要接口和约束仍应记录在规范中。'],
    specs: [["底层引擎", "开源 Excalidraw，在浏览器本地运行"], ["风格特征", "手绘风线条。刻意的粗糙感能传达「这是草案，还会改」，适合架构草图和示意图"], ["可用元素", "图形、箭头、自由绘制、文字、图片，支持分组与图层顺序"], ["内容保存位置", "浏览器本地存储，换设备或清理数据后不可见"], ["导出", "可导出为 PNG、SVG 或 .excalidraw 文件，后者可在官方客户端继续编辑"], ["协作", "不提供多人实时协作"]],
    faq: [{ question: "导出成什么格式好？", answer: "贴进文档用 PNG，需要缩放不失真用 SVG。如果之后还要继续修改，导出 .excalidraw 文件：它保留可编辑的图形数据，可以在官方客户端或这里重新打开。" }, { question: "内容会自动保存吗？", answer: "会保存在浏览器本地存储中，刷新页面不会丢。但清理浏览数据、换浏览器或换设备后内容不可见，且没有云端备份。重要的图请及时导出成文件。" }],
    reference: [['low-fidelity sketch', '强调结构和流程而非最终视觉细节的快速设计表达。'], ['editable source', '保留独立对象和属性、可继续修改的画板数据。']],
  },
  en: {
    overview: ['An Excalidraw-style board creates hand-drawn diagrams, annotations, and low-fidelity sketches. Rectangles, arrows, text, and groups communicate structure and relationships better than pixel-perfect detail while requirements are still changing.', 'Treat the board file as design source data and an exported image as a shareable but less editable preview. For handoff, save both editable source and preview and supplement important constraints, states, and open questions in text.'],
    steps: [['Define scope', 'State the title, reader, and question the drawing should answer.'], ['Use a limited visual language', 'Keep shape, color, and arrow direction consistent for the same node types.'], ['Clean and export both formats', 'Align the structure, add a legend, and save editable source plus an easy-to-view image.']],
    scenarios: [['Sketching a low-fidelity interface', 'Communicate page regions and interaction direction without premature visual detail.'], ['Explaining system relationships', 'Discuss connections among components, data, or roles with nodes and arrows.'], ["Sketching architecture for a design discussion", "The hand-drawn style removes the implication that this is settled, and reviewers volunteer changes more readily as a result."]],
    notes: ['Split complex drawings into levels or text and arrows become unreadable when zoomed out.', 'An image export loses object editability, so later changes need the source file.', 'A diagram expresses current assumptions; record important interfaces and constraints in a specification.'],
    specs: [["Underlying engine", "The open-source Excalidraw, running locally in the browser"], ["Visual character", "Hand-drawn strokes. The deliberate roughness signals \"this is a draft and will change\", which suits architecture sketches and explanatory diagrams"], ["Available elements", "Shapes, arrows, freehand drawing, text and images, with grouping and layer order"], ["Where content is stored", "Browser local storage; it disappears when you change device or clear data"], ["Export", "PNG, SVG or an .excalidraw file, the last of which reopens in the official client"], ["Collaboration", "No real-time multi-user editing"]],
    faq: [{ question: "Which export format should I use?", answer: "PNG to drop into a document, SVG when it must scale without degrading. If you will keep editing, export the .excalidraw file; it retains the editable shape data and reopens in the official client or here." }, { question: "Is my work saved automatically?", answer: "It is kept in browser local storage, so a page refresh does not lose it. But it disappears when you clear browsing data, switch browsers or change device, and there is no cloud backup. Export anything you care about." }],
    reference: [['low-fidelity sketch', 'A rapid design representation emphasizing structure and flow over final appearance.'], ['editable source', 'Board data retaining independent objects and properties for continued editing.']],
  },
});
