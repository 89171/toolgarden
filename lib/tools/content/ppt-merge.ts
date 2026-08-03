import { defineToolContent } from './define';

export const pptMergeContent = defineToolContent({
  zh: {
    overview: ['PPT 合并按文件和幻灯片顺序生成一个新的 PPTX，用于把分章节演示、团队页面和会议材料集中到一份幻灯片中。不同源文件可能使用不同母版、版式、主题字体和页面比例，合并后视觉风格不会自动统一。', '动画、切换、演讲者备注、媒体、图表链接和嵌入对象的保留能力取决于文档结构。完成后应在 PowerPoint 中检查每一页、重新应用目标主题，并验证放映模式，而不只看缩略图。'],
    steps: [['统一页面比例', '确认所有来源使用相同的 16:9 或 4:3 画布和可用字体。'], ['按演示顺序排列', '清理重复封面和结束页，再调整文件列表。'], ['生成并放映检查', '核对母版、动画、媒体、备注和页码，必要时统一主题。']],
    scenarios: [['汇总团队演示', '把不同成员负责的章节组合为一份评审稿。'], ['整理会议议程', '按发言顺序合并多个议题文件，形成连续放映。'], ["把分头制作的幻灯片合成一场演讲", "各部分单独制作后合并成一个文件，避免现场切换多个文档。"]],
    notes: ['旧版 PPT 和受密码保护文件可能无法处理。', '合并不会自动修复缺失字体或跨文件主题冲突。', '外部链接的视频、字体和数据源在另一台设备上仍可能不可用。'],
    specs: [["输入 / 输出", "多个 PPTX，输出单个 PPTX"], ["幻灯片顺序", "按文件列表顺序依次追加，各文件内部的幻灯片顺序保持不变"], ["母版与主题", "各文件的母版会一并带入，因此合并结果可能同时存在多套配色和版式"], ["会保留", "文字、图片、形状、表格和幻灯片备注"], ["可能丢失", "切换与动画时序、跨文件的超链接目标、嵌入的音视频"], ["合并后建议", "统一走查一遍母版和字体，视觉不一致通常出在这里而不是内容丢失"]],
    faq: [{ question: "为什么合并后配色不统一？", answer: "每个源文件都带着自己的母版和主题。合并后这些母版会同时存在，各部分幻灯片仍然引用原来的那一套，所以看起来像拼起来的。需要统一的话，在 PowerPoint 里把所有幻灯片重新应用同一个母版。" }, { question: "动画和切换效果会保留吗？", answer: "不保证。幻灯片内的对象动画时序和页面切换效果依赖播放引擎的额外数据，合并过程可能丢失。重要演示请在合并后完整放映一遍确认。" }],
    reference: [['slide master', '定义幻灯片占位符、主题和通用版式的模板层。'], ['aspect ratio', '幻灯片画布宽高比例，混用会导致缩放或留边。']],
  },
  en: {
    overview: ['PPT merge creates a new PPTX in file and slide order for chapter decks, team slides, and meeting material. Sources can use different masters, layouts, theme fonts, and aspect ratios, and their visual styles are not automatically unified.', 'Retention of animations, transitions, speaker notes, media, linked charts, and embedded objects depends on document structure. Inspect every slide in PowerPoint, reapply the intended theme, and test slideshow mode rather than relying on thumbnails alone.'],
    steps: [['Standardize slide ratio', 'Confirm all sources use the same 16:9 or 4:3 canvas and available fonts.'], ['Arrange presentation order', 'Remove duplicate opening and closing slides, then order the files.'], ['Generate and present-test', 'Check masters, animation, media, notes, and page numbers and unify the theme when needed.']],
    scenarios: [['Compiling a team presentation', 'Combine chapters owned by different contributors into one review deck.'], ['Organizing a meeting agenda', 'Join topic files in speaker order for uninterrupted presentation.'], ["Combining separately built decks into one talk", "Each section is authored on its own and merged into a single file, so nobody juggles documents on stage."]],
    notes: ['Legacy PPT and password-protected files may not be processable.', 'Merging does not repair missing fonts or theme conflicts automatically.', 'Externally linked video, fonts, and data may remain unavailable on another device.'],
    specs: [["Input / output", "Several PPTX files in, one PPTX out"], ["Slide order", "Appended in list order, with each file's internal slide order preserved"], ["Masters and themes", "Each file brings its own master, so the merged deck can carry several colour schemes and layouts at once"], ["Preserved", "Text, images, shapes, tables and speaker notes"], ["May be lost", "Transition and animation timings, hyperlinks pointing across files, embedded audio and video"], ["After merging", "Walk the masters and fonts once; visual inconsistency almost always comes from there, not from missing content"]],
    faq: [{ question: "Why is the styling inconsistent after merging?", answer: "Every source file brings its own master and theme. After merging all of them coexist, and each set of slides still references its original one, so the deck looks assembled. Reapply one master across all slides in PowerPoint to unify it." }, { question: "Do animations and transitions survive?", answer: "Not reliably. Object animation timing and slide transitions depend on additional playback data that can be lost in merging. Run a full rehearsal on the merged deck before it matters." }],
    reference: [['slide master', 'A template layer defining placeholders, theme, and shared slide layouts.'], ['aspect ratio', 'The width-to-height relationship of the slide canvas; mixed ratios cause scaling or margins.']],
  },
});
