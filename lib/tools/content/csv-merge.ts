import { defineToolContent } from './define';

export const csvMergeContent = defineToolContent({
  zh: {
    overview: ['CSV 合并把多个表格文本按行组合成一个文件，适合字段结构相同的分批导出。可靠合并不仅是连接文本，还要处理重复表头、列顺序、分隔符、引号、换行和字符编码。', '来源文件的列名或顺序不一致时，简单纵向追加会把值放到错误字段。合并前应选定一个规范表头，确认所有文件使用相同分隔符和编码，并在输出中抽查每个来源的首尾记录。'],
    steps: [['比较表头与分隔符', '确认列名、顺序、逗号或其它分隔符和编码一致。'], ['按数据顺序排列', '确定只保留一个表头，并把文件按日期或批次放置。'], ['验证合并结果', '统计行数，检查引号字段、中文和每个文件交界处。']],
    scenarios: [['汇总月度导出', '将结构一致的日报或月度记录合并供分析。'], ['组合分批采集数据', '把同一表单不同批次的 CSV 追加为完整数据集。'], ["汇总多个来源的导出数据", "把各系统或各时间段导出的 CSV 合成一份，再导入表格软件或数据库。"]],
    notes: ['列名相同但数据类型不同也可能导致后续分析错误。', '字段内部的逗号和换行必须由正确引号规则保护。', '合并不会自动去重、排序或清洗记录。'],
    specs: [["输入 / 输出", "多个 CSV，输出单个 CSV"], ["表头处理", "以第一个文件的表头为准，后续文件的表头行会被识别为表头而不当作数据行"], ["最大风险", "列顺序不一致会导致数据错位，而且不会报错：合并后必须自己抽查几行"], ["列数不同", "某个文件多列或少列时，对应行会出现错位或空列"], ["分隔符与引号", "按标准 CSV 规则解析，字段内的逗号和换行需要被引号包裹才能正确处理"], ["编码", "按 UTF-8 处理。Excel 导出的 GBK 编码 CSV 可能出现中文乱码"]],
    faq: [{ question: "怎么确认合并结果没有错位？", answer: "抽查每个源文件的第一行在合并结果中的位置，确认各列的值确实落在正确的列名下。列顺序不一致导致的错位不会报错，只能靠人工核对。" }, { question: "各文件的列不完全一样怎么办？", answer: "先在表格软件里把所有源文件的列名和顺序统一，再来合并。这比事后修复错位的数据可靠得多，也更快。" }],
    reference: [['header row', '描述各列字段名称的首行。'], ['delimiter', '分隔字段的字符，常见是逗号、分号或制表符。']],
  },
  en: {
    overview: ['CSV merge combines rows from multiple tabular text files for batch exports sharing one schema. Reliable merging involves duplicate headers, column order, delimiters, quoting, embedded newlines, and character encoding rather than raw text concatenation alone.', 'If column names or order differ, vertical append can place values under the wrong fields. Choose a canonical header, verify common delimiter and encoding, and sample the beginning and end of every source in output.'],
    steps: [['Compare headers and delimiters', 'Confirm names, order, comma or other delimiter, and encoding match.'], ['Arrange data order', 'Keep one header and place files by date or batch.'], ['Validate output', 'Count rows and inspect quoted fields, non-ASCII text, and every file boundary.']],
    scenarios: [['Compiling periodic exports', 'Combine structurally identical daily or monthly records for analysis.'], ['Joining collection batches', 'Append CSV exports from separate runs of the same form into one dataset.'], ["Consolidating exports from several sources", "Combine CSVs from different systems or periods into one file before importing it into a spreadsheet or database."]],
    notes: ['Identical column names with different data types can still break downstream analysis.', 'Commas and line breaks inside a field require correct quoting.', 'Merging does not deduplicate, sort, or clean records automatically.'],
    specs: [["Input / output", "Several CSV files in, one CSV out"], ["Header handling", "The first file's header wins; header rows in later files are recognised as headers rather than treated as data"], ["Biggest risk", "A different column order silently misaligns the data with no error; always spot-check a few rows afterwards"], ["Differing column counts", "A file with an extra or missing column produces shifted rows or empty cells"], ["Delimiters and quoting", "Parsed by standard CSV rules; commas and newlines inside a field must be quoted to survive"], ["Encoding", "Handled as UTF-8. GBK-encoded CSV exported from Excel can come out garbled"]],
    faq: [{ question: "How do I check the merge did not misalign?", answer: "Find the first row of each source file in the merged output and confirm its values sit under the right column names. Misalignment from a differing column order raises no error, so this check has to be manual." }, { question: "What if the files do not share the same columns?", answer: "Normalise column names and order across every source in a spreadsheet first, then merge. That is far more reliable; and faster; than repairing misaligned data afterwards." }],
    reference: [['header row', 'The first row naming the fields represented by columns.'], ['delimiter', 'A character separating fields, commonly comma, semicolon, or tab.']],
  },
});
