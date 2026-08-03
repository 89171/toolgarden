import { defineToolContent } from './define';

export const excelToJsonContent = defineToolContent({
  zh: {
    overview: [
      'Excel 转 JSON 读取 XLSX 或 XLS 工作簿的第一张工作表，把第一行当作字段名，其余行转换成对象数组。空白单元格通常不会生成字段，因此同一列在不同记录里可能存在或缺失。',
      '如果表头包含 `>` 分隔的路径，例如 `profile>name` 或 `items>0>sku`，工具会尝试还原嵌套对象和数组。这与本站 JSON 转 Excel 的展开规则配套；普通表头则保持为第一层字段。',
    ],
    steps: [
      ['选择工作簿', '上传 XLSX 或 XLS 文件；工具在浏览器中读取，不会把表格发送给转换服务器。'],
      ['检查第一张表', '确认第一行确实是唯一表头，并预览生成的行数与 JSON 字段。'],
      ['复制或下载 JSON', '核对数字、日期、空值和嵌套路径后，复制格式化结果或保存文件。'],
    ],
    scenarios: [
      ['把维护表转成种子数据', '将产品、地区或权限配置表转换成前端和脚本可直接读取的 JSON 数组。'],
      ['导出人工整理结果', '业务同事先在 Excel 清洗数据，开发者再转换成结构化 JSON 接入应用。'],
      ["把运营维护的表格接入程序", "文案、价格、开关这类由非技术同事在 Excel 里维护的配置，转成 JSON 后可以直接被代码读取。"],
    ],
    notes: [
      '当前只读取工作簿第一张工作表，隐藏表或后续工作表不会自动合并。',
      '公式通常读取已缓存的结果而不是公式文本；未计算或外部引用的单元格可能为空。',
      'Excel 日期是序列值并受单元格格式影响，转换后应抽查时区和日期边界。',
    ],
    specs: [["输入格式", "XLSX 与 XLS"], ["表头处理", "首行作为键名。表头有合并单元格或多行表头时需要先在 Excel 里整理"], ["多个 Sheet", "按所选工作表转换，不会自动合并全部 Sheet"], ["类型推断", "数字、日期和布尔按单元格类型推断，文本格式的数字会保持字符串"], ["日期", "Excel 内部以序列号存储日期，转换结果的表示形式可能与你在单元格里看到的不同"], ["公式", "取计算结果值，不保留公式本身"]],
    faq: [{ question: "日期为什么变成了一串数字？", answer: "Excel 内部把日期存成从 1900 年起算的序列号，单元格里看到的日期只是显示格式。转换会按单元格类型推断，但如果原单元格被设成了文本或通用格式，就可能得到原始序列号。转换前把日期列明确设为日期格式可以避免。" }, { question: "合并单元格的表头能处理吗？", answer: "不能。首行被直接当作键名，合并单元格和多行表头会产生空键或错位。请先在 Excel 里把表头整理成单行、每列一个唯一名称，再来转换。" }],
    reference: [
      ['header row', '用于生成 JSON key 的第一行。重复或空白表头会造成字段覆盖或难以理解的键名。'],
      ['worksheet', '工作簿中的单张表。一个 XLSX 文件可以包含多张 worksheet。'],
    ],
  },
  en: {
    overview: [
      'Excel to JSON reads the first worksheet in an XLSX or XLS workbook, treats its first row as field names, and converts later rows into an object array. Blank cells usually omit a property, so the same key can be present in one record and absent in another.',
      'Headers containing `>` paths, such as profile>name or items>0>sku, are reconstructed as nested objects and arrays. This matches the flattening convention used by JSON to Excel; ordinary headers remain first-level properties.',
    ],
    steps: [
      ['Choose a workbook', 'Upload an XLSX or XLS file. It is parsed in the browser and not sent to a conversion server.'],
      ['Inspect the first sheet', 'Confirm row one contains unique headers and review the detected record count and generated JSON fields.'],
      ['Copy or download JSON', 'Check numbers, dates, blanks, and reconstructed paths before copying or saving the formatted result.'],
    ],
    scenarios: [
      ['Creating application seed data', 'Convert a maintained product, region, or permission table into a JSON array for scripts and frontend code.'],
      ['Receiving manually cleaned data', 'Let a business user clean rows in Excel, then turn the result into structured JSON for an application.'],
      ["Wiring an operations spreadsheet into code", "Copy, prices and feature switches maintained in Excel by non-technical colleagues become JSON your code can read directly."],
    ],
    notes: [
      'Only the first worksheet is read. Hidden sheets and later sheets are not merged automatically.',
      'Formula cells generally expose their cached result rather than the formula text; uncalculated or external references may be blank.',
      'Excel dates are serial values interpreted through cell formatting. Sample dates and time zones after conversion.',
    ],
    specs: [["Input formats", "XLSX and XLS"], ["Header handling", "The first row becomes the keys. Merged cells or multi-row headers need tidying in Excel first"], ["Multiple sheets", "Converts the selected worksheet; sheets are not merged automatically"], ["Type inference", "Numbers, dates and booleans follow the cell type, while text-formatted numbers stay strings"], ["Dates", "Excel stores dates as serial numbers, so the converted representation can differ from what the cell displayed"], ["Formulas", "Reduced to their computed values; the formula itself is not kept"]],
    faq: [{ question: "Why did my dates turn into numbers?", answer: "Excel stores dates as serial numbers counted from 1900, and what the cell shows is just a display format. Conversion follows the cell type, so a column formatted as Text or General can yield the raw serial. Set date columns explicitly to a date format before converting." }, { question: "Can it handle merged header cells?", answer: "No. The first row becomes the keys, and merged cells or multi-row headers produce empty keys or shifted columns. Flatten the header to a single row with one unique name per column in Excel first." }],
    reference: [
      ['header row', 'The first row used to create JSON keys. Blank or duplicate headers can produce unclear or overwritten fields.'],
      ['worksheet', 'One tab inside a workbook. A single XLSX file can contain several worksheets.'],
    ],
  },
});
