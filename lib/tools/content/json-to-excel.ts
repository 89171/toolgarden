import { defineToolContent } from './define';

export const jsonToExcelContent = defineToolContent({
  zh: {
    overview: [
      'JSON 转 Excel 把对象数组写进真正的 XLSX 工作簿，而不是只改文件扩展名。每个数组元素成为一行，工具先用 `>` 连接对象路径和数组索引，把嵌套字段展开成稳定列名，再生成名为 Sheet1 的工作表。',
      '预览最多展示前 20 行，但导出会处理全部数据。列集合取自所有行，某一行缺少的字段会保持空白；空对象和空数组会以 JSON 文本保存，避免完全丢掉它们的存在。',
    ],
    steps: [
      ['准备非空数组', '根值应是 JSON 对象数组；单个对象先包进数组，JSONC 与 JSON5 写法也可以解析。'],
      ['检查扁平化预览', '确认 `customer>address>city` 这类路径列是否符合用途，并检查不同记录是否产生意外的新列。'],
      ['生成并下载 XLSX', '导出完整数据到 Sheet1，随后在目标表格软件里核对日期、长整数和换行。'],
    ],
    scenarios: [
      ['交付业务数据', '把接口返回的订单或用户列表转成可筛选、可排序的工作簿交给运营同事。'],
      ['保留嵌套路径', '与直接 CSV 相比，路径列能保留对象与数组所在位置，之后还可用 Excel 转 JSON 还原。'],
      ["生成可直接分发的报表附件", "XLSX 保留单元格类型且不存在编码问题，比 CSV 更适合作为邮件附件发给业务方。"],
    ],
    notes: [
      'Excel 会自动识别日期和科学计数法，订单号、手机号和超长整数可能需要在打开后设置为文本列。',
      '嵌套数组按索引展开，数组长度差异很大时会产生大量稀疏列，不适合代替关系型数据表。',
      '工作簿只创建一个 Sheet1，不会根据对象字段自动拆成多张表。',
    ],
    specs: [["输出", "XLSX 工作簿，一个 Sheet"], ["输入要求", "顶层为对象数组，每个元素对应一行"], ["与 CSV 的区别", "XLSX 保留单元格类型，中文不会因编码问题乱码，也没有分隔符转义的坑"], ["嵌套字段", "会被平铺为列名，深层嵌套建议先用 JSON Flatten 处理再转"], ["数字精度", "超长整数在 Excel 中可能被显示成科学计数法或丢失末位，订单号建议以文本形式导出"], ["公式", "不生成公式，所有单元格都是静态值"]],
    faq: [{ question: "订单号为什么显示成科学计数法？", answer: "Excel 会把很长的数字按数值处理，超过 15 位精度就显示成科学计数法并丢失末位。订单号、身份证号这类标识应当以字符串形式存在于源 JSON 里，导出后才会保持原样。" }, { question: "和导出 CSV 相比有什么优势？", answer: "XLSX 保留单元格类型、不需要处理分隔符转义、中文不会因编码问题乱码，双击即可用 Excel 打开。CSV 的优势是纯文本、体积小、任何工具都能读。" }],
    reference: [
      ['XLSX', 'Office Open XML 工作簿格式，可以保存单元格类型、多个工作表和样式等结构。'],
      ['path column', '用分隔符把嵌套路径编码成列名，例如 profile>skills>0。'],
    ],
  },
  en: {
    overview: [
      'JSON to Excel writes an object array into a real XLSX workbook rather than merely changing an extension. Each array item becomes a row. Nested object paths and array indexes are flattened into column names joined with `>`, then written to a worksheet named Sheet1.',
      'The preview shows at most 20 rows while export processes the complete array. Columns are collected across all records and missing fields remain blank. Empty objects and arrays are kept as JSON text so their presence is not silently lost.',
    ],
    steps: [
      ['Prepare a non-empty array', 'The root should be an array of objects. Wrap a single object in an array; JSONC and JSON5 syntax are also accepted.'],
      ['Review the flattened preview', 'Check path columns such as customer>address>city and look for unexpected columns introduced by inconsistent records.'],
      ['Generate and download XLSX', 'Export all records to Sheet1, then verify dates, long integers, and line breaks in the destination spreadsheet.'],
    ],
    scenarios: [
      ['Delivering operational data', 'Turn an API list of orders or users into a sortable workbook for people who work in spreadsheets.'],
      ['Retaining nested paths', 'Unlike a simple CSV export, path columns retain where nested values came from and can be reconstructed by Excel to JSON.'],
      ["Producing a report attachment you can send as-is", "XLSX keeps cell types and has no encoding pitfalls, which makes it a better email attachment for business users than CSV."],
    ],
    notes: [
      'Excel may infer dates and scientific notation. Order IDs, phone numbers, and long integers often need text column formatting.',
      'Arrays are expanded by index. Widely varying lengths create many sparse columns and are not a substitute for relational tables.',
      'Export creates one worksheet named Sheet1 and does not split object fields into separate sheets.',
    ],
    specs: [["Output", "An XLSX workbook with a single sheet"], ["Input requirement", "An array of objects at the top level, one element per row"], ["vs CSV", "XLSX keeps cell types, avoids encoding problems with non-Latin text, and has no delimiter-escaping pitfalls"], ["Nested fields", "Flattened into column names; for deep nesting, run JSON Flatten first"], ["Number precision", "Very long integers can display in scientific notation or lose trailing digits in Excel; export order numbers as text"], ["Formulas", "None are generated; every cell is a static value"]],
    faq: [{ question: "Why is my order number shown in scientific notation?", answer: "Excel treats long digit strings as numbers, and past 15 significant digits it switches to scientific notation and drops the tail. Identifiers such as order or ID numbers should already be strings in the source JSON so they survive the export." }, { question: "What does this give me over CSV?", answer: "XLSX keeps cell types, needs no delimiter escaping, avoids encoding problems with non-Latin text, and opens on a double-click. CSV's advantages are that it is plain text, small, and readable by anything." }],
    reference: [
      ['XLSX', 'The Office Open XML workbook format, capable of storing cell types, multiple sheets, and styles.'],
      ['path column', 'A flattened column name that encodes nesting with a delimiter, such as profile>skills>0.'],
    ],
  },
});
