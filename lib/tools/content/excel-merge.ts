import { defineToolContent } from './define';

export const excelMergeContent = defineToolContent({
  zh: {
    overview: ['Excel 合并支持把多个工作簿的数据汇总到单表，或按来源保留为多个工作表。单表策略适合列结构一致的记录，分表策略更能保留来源边界；公式、图表、宏、数据验证和复杂样式不一定按原工作簿完整复制。', '合并数据前应比较表头、数据类型、日期与小数格式，并确认第一行是否真的是字段名。工作表名称有长度和字符限制，来源重名时也需要生成唯一名称。'],
    steps: [['检查每个工作簿', '确认有效工作表、表头、日期和关键列没有隐藏差异。'], ['选择合并策略', '结构一致的数据使用单表追加，需要隔离时选择多工作表。'], ['预览并验证输出', '统计行数和工作表数，抽查公式值、中文与日期后下载。']],
    scenarios: [['汇总分公司数据', '把使用同一模板的月度表追加到统一分析表。'], ['打包相关工作簿', '将多个来源保留在独立工作表中，便于一次分发。'], ["把各分公司的月度表汇总", "多个结构相同的报表合并到一个 Sheet 做汇总，或各占一个 Sheet 便于分别核对。"]],
    notes: ['单表合并要求列语义一致，仅名称相似不足以证明可直接追加。', '宏和外部连接等高级工作簿功能通常不能由浏览器合并完整保留。', 'Excel 日期可能以序列值存储，应在输出中检查显示和时区解释。'],
    specs: [["输入 / 输出", "多个 XLSX / XLS / CSV，输出单个 XLSX"], ["两种模式", "汇总到同一个 Sheet，或让每个源文件各占一个 Sheet"], ["汇总模式的前提", "所有源文件的列结构必须一致，否则会错位，而且不会报错"], ["会保留", "单元格的值和基础数字格式"], ["可能丢失", "公式（通常转为计算结果值）、图表、条件格式、数据透视表、单元格样式"], ["旧格式", ".xls 可读取，但输出统一为 .xlsx"]],
    faq: [{ question: "两种模式该怎么选？", answer: "需要对全部数据做透视、筛选或求和时用「汇总到同一个 Sheet」，前提是列结构完全一致。需要保留各文件边界、便于追溯来源时用「每个文件一个 Sheet」。" }, { question: "公式为什么变成了数字？", answer: "合并读取的是单元格的计算结果值，不重建公式依赖关系：跨文件的引用在合并后本来也无法成立。需要保留公式请在合并后重新编写。" }],
    reference: [['workbook', '包含一个或多个工作表及相关样式、公式和资源的 Excel 文件。'], ['append', '把具有相同列结构的数据行添加到现有表格末尾。']],
  },
  en: {
    overview: ['Excel merge can append workbook data into one sheet or retain sources as multiple sheets. Single-sheet mode suits records with the same columns, while multi-sheet mode preserves boundaries. Formulas, charts, macros, validation, and complex styling may not copy fully from the originals.', 'Compare headers, data types, dates, and decimal formats and confirm that the first row is truly a header. Sheet names have length and character limits, and duplicate source names require unique output names.'],
    steps: [['Inspect every workbook', 'Confirm valid sheets, headers, dates, and critical columns have no hidden differences.'], ['Choose a strategy', 'Append consistent schemas into one sheet or keep sources separated across sheets.'], ['Preview and validate', 'Count rows and sheets and sample formula values, non-ASCII text, and dates before download.']],
    scenarios: [['Compiling branch data', 'Append monthly sheets based on one template into a unified analysis table.'], ['Packaging related workbooks', 'Retain multiple sources in separate sheets for distribution as one file.'], ["Consolidating monthly reports from several offices", "Pool identically structured reports into one sheet for analysis, or give each its own sheet for separate review."]],
    notes: ['Single-sheet mode requires matching column meaning, not merely similar names.', 'Macros, external connections, and advanced workbook features are generally not fully preserved by browser merging.', 'Excel dates can be stored as serial values, so inspect display and time-zone interpretation.'],
    specs: [["Input / output", "Several XLSX / XLS / CSV files in, one XLSX out"], ["Two modes", "Pool everything into one sheet, or give each source file its own sheet"], ["Precondition for pooling", "Every source must share the same column structure, or the data misaligns; silently"], ["Preserved", "Cell values and basic number formats"], ["May be lost", "Formulas (usually reduced to their computed values), charts, conditional formatting, pivot tables and cell styles"], ["Legacy format", ".xls can be read, but output is always .xlsx"]],
    faq: [{ question: "Which mode should I choose?", answer: "Pool into one sheet when you need to pivot, filter or sum across everything; provided the column structure matches exactly. Use one sheet per file when you want to preserve boundaries and trace values back to their source." }, { question: "Why did my formulas become plain numbers?", answer: "Merging reads computed cell values rather than rebuilding formula dependencies; cross-file references could not survive a merge anyway. Rewrite any formulas you need on the merged workbook." }],
    reference: [['workbook', 'An Excel file containing sheets and related styles, formulas, and resources.'], ['append', 'Adding rows with the same column structure to the end of an existing table.']],
  },
});
