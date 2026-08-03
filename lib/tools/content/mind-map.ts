import { defineToolContent } from './define';

export const mindMapContent = defineToolContent({
  zh: {
    overview: ['思维导图从中心主题向外建立层级分支，适合拆解概念、课程、计划和问题空间。它擅长表达父子关系和分类，但不适合精确表示时间顺序、多对多依赖或循环流程。', '清晰导图的节点应短而具体，同一层级使用一致的分类标准。分支过深或每层节点过多时，应拆成子图，并把决定、日期和负责人同步到可执行的任务或文档中。'],
    steps: [['写出单一中心主题', '用一句短语限定导图要回答的问题。'], ['逐层添加分支', '先列互斥或一致维度的一级分类，再补充具体事实和行动。'], ['收敛并导出', '合并重复节点，标出优先级，把行动项转移到任务系统。']],
    scenarios: [['规划内容结构', '从主题拆出受众问题、章节和素材需求。'], ['梳理学习知识', '按概念层级整理术语、例子和待复习问题。'], ["把发散的想法收敛成文章大纲", "先自由添加节点不管顺序，再拖动重组层级，最后导出 Markdown 大纲直接开始写。"]],
    notes: ['思维导图的空间位置不等于优先级，除非图例明确说明。', '跨分支依赖难以只用树形结构表达，必要时补充流程图或依赖表。', '导图是思考工具，不应代替带负责人和截止日期的执行计划。'],
    specs: [["底层引擎", "开源 Mind Elixir，在浏览器本地运行"], ["编辑方式", "直接编辑节点树，支持增删节点、拖动重组层级、折叠展开分支"], ["导出", "可导出为 Markdown 大纲，方便接着在文档里继续写"], ["内容保存位置", "浏览器本地存储，清理数据或换设备后不可见"], ["适合的场景", "梳理层级关系、拆解任务、整理文章结构：这些用线性文档表达不够直观"], ["不适合的场景", "网状关联、有循环依赖的关系图，那需要白板或专门的图工具"]],
    faq: [{ question: "导出的 Markdown 是什么结构？", answer: "节点树按层级映射为多级标题或嵌套列表，父节点在上、子节点缩进。这样导出后可以直接作为文档骨架，在每个节点下面填正文。" }, { question: "适合画有循环依赖的关系图吗？", answer: "不适合。思维导图的数据结构是树，每个节点只有一个父节点。需要表达网状关联或循环依赖时，请用白板或 Excalidraw 画板自由连线。" }],
    reference: [['root topic', '导图中心的主问题或主题，所有分支从此展开。'], ['hierarchy', '按父节点与子节点组织概念的层级结构。']],
  },
  en: {
    overview: ['A mind map grows hierarchical branches from one central topic for concepts, lessons, plans, and problem spaces. It expresses parent-child relationships and categories well but is weak for exact time sequence, many-to-many dependencies, and cycles.', 'Clear nodes are short and specific, with one classification principle used at each level. Split overly deep or broad branches into submaps and transfer decisions, dates, and owners into executable tasks or documents.'],
    steps: [['Write one central topic', 'Use a short phrase to constrain the question the map should answer.'], ['Add branches by level', 'Begin with consistent top-level categories, then add concrete facts and actions.'], ['Converge and export', 'Merge duplicates, mark priorities, and move action items into a task system.']],
    scenarios: [['Planning content structure', 'Break a theme into audience questions, chapters, and required material.'], ['Organizing study knowledge', 'Arrange terms, examples, and review questions by concept hierarchy.'], ["Converging scattered ideas into an article outline", "Add nodes freely without worrying about order, drag to restructure the levels, then export a Markdown outline and start writing."]],
    notes: ['Spatial position does not imply priority unless a legend says so.', 'Cross-branch dependencies are difficult in a tree and may need a flow diagram or dependency table.', 'A mind map is a thinking aid, not a delivery plan with owners and due dates.'],
    specs: [["Underlying engine", "The open-source Mind Elixir, running locally in the browser"], ["How you edit", "Directly on the node tree; add and remove nodes, drag to restructure levels, collapse and expand branches"], ["Export", "To a Markdown outline, so you can carry on writing in a document"], ["Where content is stored", "Browser local storage; it disappears when you clear data or change device"], ["Good for", "Hierarchies, task breakdowns and article structure; things a linear document expresses poorly"], ["Not for", "Networked relationships and cyclic dependency graphs; use the whiteboard or a dedicated graph tool"]],
    faq: [{ question: "What structure does the exported Markdown have?", answer: "The node tree maps to nested headings or indented lists, parents above and children indented. That gives you a document skeleton to fill in under each node." }, { question: "Can it draw graphs with cyclic dependencies?", answer: "No. A mind map is a tree: every node has exactly one parent. For networked relationships or cycles, use the whiteboard or Excalidraw Board and draw the connections freely." }],
    reference: [['root topic', 'The central question or theme from which every branch grows.'], ['hierarchy', 'A parent-child structure organizing concepts into levels.']],
  },
});
