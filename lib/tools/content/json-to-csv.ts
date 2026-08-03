import { defineToolContent } from './define';

export const jsonToCsvContent = defineToolContent({
  zh: {
    overview: [
      'CSV 是二维表格，JSON 可以任意嵌套，因此只有“对象数组”能直接转换成有意义的行和列。工具会收集所有对象中出现过的第一层 key 作为表头，每个数组元素写成一行，缺失字段留空。',
      '逗号、双引号和换行会按 CSV 规则自动加引号并把内部双引号写成两个。嵌套对象和数组不会展开成多张表，而会变成字符串表示；需要独立列时应先使用 JSON Flatten。',
    ],
    steps: [
      ['准备对象数组', '根值必须是非空数组，并且数组元素应为对象；单个对象先放进数组。'],
      ['预览列与内容', '检查各行字段是否一致，尤其注意嵌套对象、数组和缺失值的展示方式。'],
      ['复制或下载 CSV', '确认表头顺序后导出，再用目标表格软件检查编码和分隔效果。'],
    ],
    example: {
      caption: "对象数组映射为表格行。嵌套的 addr.city 被平铺成列名，缺失的字段留空。",
      inputLabel: "JSON 数组",
      input: "[\n  { \"id\": 1, \"name\": \"A\", \"addr\": { \"city\": \"北京\" } },\n  { \"id\": 2, \"name\": \"B\" }\n]",
      outputLabel: "CSV",
      output: "id,name,addr.city\n1,A,北京\n2,B,",
      language: "csv",
    },
    scenarios: [
      ['导出接口列表', '把用户、订单或日志对象数组转成 CSV，交给表格软件筛选和汇总。'],
      ['给非开发同事交付数据', '把结构简单的 JSON 转成普遍可打开的表格文本，不要求接收方安装开发工具。'],
      ["把接口数据交给数据分析", "分析同事习惯用表格软件做透视和筛选，CSV 是最通用的交接格式。"],
    ],
    notes: [
      '工具只提取对象第一层 key；嵌套结构会被字符串化，不会自动设计关系表。',
      'CSV 不保存数字、日期或布尔类型，表格软件打开时可能自行推断并改变显示格式。',
      '不同地区的表格软件可能默认使用分号而非逗号，导入时应明确选择 UTF-8 与逗号分隔。',
    ],
    specs: [["输入要求", "顶层应当是对象数组。单个对象或标量无法映射成表格行"], ["表头来源", "从数组元素的键推断，不同元素键不一致时取并集，缺失的位置留空"], ["嵌套字段", "嵌套对象会被平铺为 a.b.c 形式的列名，或按约定序列化为文本"], ["数组字段", "元素内部的数组无法用一列表示，通常序列化成字符串"], ["转义规则", "含逗号、换行或双引号的字段会被引号包裹，双引号内部再翻倍"], ["类型丢失", "CSV 全是文本。数字、布尔和 null 打开后可能被表格软件重新推断成别的类型"]],
    faq: [{ question: "嵌套字段导出后为什么变成了一长串文本？", answer: "表格只有行和列两个维度，装不下嵌套结构。深层对象会被平铺成 a.b.c 形式的列名，数组则通常序列化成字符串。嵌套很深时建议先用 JSON Flatten 处理，再决定保留哪些列。" }, { question: "打开 CSV 后中文乱码怎么办？", answer: "导出是 UTF-8，而部分版本的 Excel 默认按本地编码打开。可以改用 JSON → Excel 直接导出 XLSX 避开这个问题，或者在 Excel 里用「数据 → 从文本」并手动指定 UTF-8。" }],
    reference: [
      ['header row', 'CSV 第一行的列名，由对象数组中出现过的第一层 key 合并得到。'],
      ['CSV quoting', '包含逗号、引号或换行的单元格必须放进双引号，内部双引号重复一次。'],
    ],
  },
  en: {
    overview: [
      'CSV is a two-dimensional table while JSON can be nested arbitrarily, so an array of objects is the only shape that maps directly to useful rows and columns. The converter gathers every first-level key as a header and writes each array item as one row, leaving missing fields blank.',
      'Commas, quotes, and line breaks are quoted according to CSV rules, with inner quotes doubled. Nested objects and arrays are not expanded into related tables; they become string values unless the JSON is flattened first.',
    ],
    steps: [
      ['Prepare an object array', 'The root value must be a non-empty array whose items are objects. Wrap a single object in an array first.'],
      ['Review columns and values', 'Check whether rows share the same fields and how nested objects, arrays, and missing values will appear.'],
      ['Copy or download CSV', 'Confirm the header order, export the file, then verify encoding and delimiters in the destination spreadsheet.'],
    ],
    example: {
      caption: "An array of objects becomes rows. The nested addr.city flattens into a column name and the missing field is left blank.",
      inputLabel: "JSON array",
      input: "[\n  { \"id\": 1, \"name\": \"A\", \"addr\": { \"city\": \"Berlin\" } },\n  { \"id\": 2, \"name\": \"B\" }\n]",
      outputLabel: "CSV",
      output: "id,name,addr.city\n1,A,Berlin\n2,B,",
      language: "csv",
    },
    scenarios: [
      ['Exporting an API list', 'Turn users, orders, or log records into CSV for filtering and aggregation in a spreadsheet.'],
      ['Delivering data to non-developers', 'Provide simple JSON as a widely readable table without asking the recipient to use developer tooling.'],
      ["Handing API data to analysts", "Analysts work in spreadsheets for pivoting and filtering, and CSV is the most universally accepted handover format."],
    ],
    notes: [
      'Only first-level keys become columns. Nested structures are stringified rather than converted into a relational design.',
      'CSV stores no number, date, or boolean types. Spreadsheet software may infer a type and alter the display.',
      'Some regional spreadsheet settings expect semicolons. Choose UTF-8 and comma delimiter explicitly when importing.',
    ],
    specs: [["Input requirement", "The top level should be an array of objects; a single object or a scalar has no rows to map"], ["Header source", "Inferred from element keys; when elements differ the union is used and missing cells are left blank"], ["Nested fields", "Nested objects are flattened into a.b.c column names, or serialised as text"], ["Array fields", "An array inside an element cannot occupy one column and is generally serialised to a string"], ["Escaping", "Fields containing commas, newlines or double quotes are quoted, with inner quotes doubled"], ["Type loss", "CSV is all text. Numbers, booleans and null may be re-inferred as something else by spreadsheet software"]],
    faq: [{ question: "Why did my nested field become one long string?", answer: "A spreadsheet has only rows and columns and cannot hold nesting. Deep objects flatten into a.b.c column names and arrays are generally serialised to strings. For deep nesting, run JSON Flatten first and then decide which columns to keep." }, { question: "The CSV opens garbled; what now?", answer: "The export is UTF-8, while some Excel versions open text files in the local encoding. Use JSON to Excel to emit XLSX directly and sidestep it, or import via Data → From Text and specify UTF-8." }],
    reference: [
      ['header row', 'The first CSV row containing column names collected from first-level keys across the object array.'],
      ['CSV quoting', 'A cell containing a comma, quote, or line break is wrapped in quotes and each inner quote is doubled.'],
    ],
  },
});
