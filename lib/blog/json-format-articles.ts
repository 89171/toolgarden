import type { BlogArticle } from './articles';

const jsonlExample = `{"timestamp":"2026-09-21T10:00:00Z","level":"info","message":"job started","jobId":"import-42"}
{"timestamp":"2026-09-21T10:00:02Z","level":"warn","message":"retrying row","row":128}
{"timestamp":"2026-09-21T10:00:05Z","level":"info","message":"job finished","records":1000000}`;

const normalJsonArrayExample = `[
  {
    "timestamp": "2026-09-21T10:00:00Z",
    "level": "info",
    "message": "job started",
    "jobId": "import-42"
  },
  {
    "timestamp": "2026-09-21T10:00:02Z",
    "level": "warn",
    "message": "retrying row",
    "row": 128
  }
]`;

const aiTrainingExample = `{"messages":[{"role":"user","content":"Summarize this log entry"},{"role":"assistant","content":"The import job started successfully."}],"source":"logs"}
{"messages":[{"role":"user","content":"Classify the ticket urgency"},{"role":"assistant","content":"high"}],"source":"support"}`;

export const jsonFormatBlogArticles = [
  {
    slug: 'what-is-jsonl-format',
    publishedAt: '2026-09-21',
    updatedAt: '2026-09-21',
    translations: {
      zh: {
        title: 'JSONL 是什么格式？示例、对比和适用场景',
        excerpt: 'JSONL 把每一行都作为一个独立 JSON 值，特别适合日志、AI 训练数据、大规模导入导出和流式处理。',
        metaTitle: 'JSONL 是什么格式？JSON Lines 示例、对比和使用场景',
        metaDescription: '介绍 JSONL / JSON Lines 的规则、示例、与普通 JSON 的区别，以及为何更适合日志、AI 训练数据和流式处理。',
        readingTime: '约 7 分钟阅读',
        tags: ['JSONL', 'JSON Lines', 'NDJSON', '日志', 'AI 训练数据'],
        relatedTools: [
          {
            label: 'JSON 格式化',
            href: '/json-format',
            description: '格式化、压缩和校验普通 JSON，适合检查单个 JSON 对象或数组。',
          },
          {
            label: 'JSON 转 CSV',
            href: '/json-to-csv',
            description: '把结构化 JSON 数组转换为 CSV，适合数据清洗和表格导出。',
          },
          {
            label: 'JSON 修复',
            href: '/json-repair',
            description: '修复常见 JSON 语法问题，再进入后续转换或导入流程。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSONL，也常叫 JSON Lines 或 NDJSON，是一种“每行一个 JSON”的文本格式。对于日志、AI 训练数据、大规模数据导入导出、流式处理，JSONL 往往比普通 JSON 更合适。',
          },
          {
            type: 'paragraph',
            text: '普通 JSON 很适合表达一个完整对象、配置文件或 API 响应；JSONL 更像一条一条追加的记录流。它仍然使用 JSON 语法，但文件整体不是一个大数组，而是由多行独立 JSON 值组成。',
          },
          { type: 'heading', level: 2, text: 'JSONL 的基本规则' },
          {
            type: 'list',
            items: [
              '一行就是一条完整 JSON 记录，最常见的是一个对象。',
              '每一行必须能被单独 JSON.parse；行与行之间不需要逗号。',
              '文件末尾可以有换行，处理时通常按行读取。',
              '不要把多行格式化后的对象直接放进 JSONL，因为那会破坏“一行一条记录”的约定。',
            ],
          },
          { type: 'heading', level: 2, text: '一个 JSONL 示例' },
          {
            type: 'code',
            language: 'jsonl',
            code: jsonlExample,
          },
          {
            type: 'paragraph',
            text: '上面三行分别是三条记录。你可以只读取第一行、追加第四行，或者从中间某一行继续处理，而不需要把整个文件一次性解析成内存里的数组。',
          },
          { type: 'heading', level: 2, text: '和普通 JSON 数组有什么区别？' },
          {
            type: 'code',
            language: 'json',
            code: normalJsonArrayExample,
          },
          {
            type: 'table',
            headers: ['对比项', '普通 JSON', 'JSONL'],
            rows: [
              ['文件结构', '通常是一个对象或数组', '多行独立 JSON 记录'],
              ['追加数据', '需要维护数组逗号和结尾括号', '直接追加新的一行'],
              ['读取方式', '常常一次性解析完整文件', '可以逐行读取、逐条处理'],
              ['错误影响', '一个语法错误可能让整个文件解析失败', '通常只影响出错的那一行'],
              ['适合规模', '小到中等配置、接口响应、文档数据', '日志、事件、训练样本、批量导入导出'],
            ],
          },
          { type: 'heading', level: 2, text: '为什么日志更适合 JSONL？' },
          {
            type: 'paragraph',
            text: '日志天然是一条一条产生的。服务运行时不断写入新事件，如果使用普通 JSON 数组，就要反复处理逗号、数组结尾和文件完整性；使用 JSONL，只要把每条日志序列化成一行并追加即可。',
          },
          {
            type: 'paragraph',
            text: '这也让后续处理更简单：命令行工具、日志采集器、消息队列消费者和数据仓库导入任务都可以按行消费，不必等待整个文件完成。',
          },
          { type: 'heading', level: 2, text: '为什么 AI 训练数据常用 JSONL？' },
          {
            type: 'paragraph',
            text: 'AI 训练或微调数据通常由大量样本组成，每个样本可以独立验证、过滤、打乱、切分。JSONL 正好符合这种“样本级”处理方式。',
          },
          {
            type: 'code',
            language: 'jsonl',
            code: aiTrainingExample,
          },
          {
            type: 'paragraph',
            text: '在这种结构里，一行就是一个训练样本。数据团队可以对单行做 schema 检查、去重、抽样和质量标注，也可以把多个 JSONL 文件合并成更大的数据集。',
          },
          { type: 'heading', level: 2, text: '适用场景' },
          {
            type: 'list',
            items: [
              '日志：应用日志、审计日志、埋点事件、系统指标快照。',
              'AI 训练数据：对话样本、分类样本、指令微调数据、标注记录。',
              '大规模导入导出：数据库导出、搜索索引重建、数据仓库批量加载。',
              '流式处理：消息队列消费、实时 ETL、长连接返回、分块下载。',
              '数据清洗流水线：逐行过滤、映射、聚合、抽样，而不是一次性加载全量文件。',
            ],
          },
          { type: 'heading', level: 2, text: '什么时候仍然应该用普通 JSON？' },
          {
            type: 'paragraph',
            text: '如果数据本身就是一个有层级关系的文档，例如配置文件、页面状态、单个 API 响应或需要整体事务语义的数据，普通 JSON 更直观。JSONL 的优势在于“很多条彼此独立的记录”，不是替代所有 JSON。',
          },
          {
            type: 'callout',
            title: '先检查普通 JSON',
            text: '如果你拿到的是单个 JSON 对象或数组，可以先用 JSON 格式化工具校验结构，再决定是否需要转换成逐行记录。',
            href: '/json-format',
            linkLabel: '打开 JSON 格式化',
          },
          { type: 'heading', level: 2, text: '小结' },
          {
            type: 'paragraph',
            text: 'JSONL 的核心价值是把大文件拆成可独立处理的记录。它牺牲了普通 JSON 数组的整体结构感，换来更好的追加写入、逐行读取、错误隔离和流式处理能力。',
          },
        ],
        faq: [
          {
            question: 'JSONL 和 NDJSON 是一回事吗？',
            answer: '实际使用中二者几乎指同一种格式：每行一个 JSON 值。JSONL 更常作为文件格式名称出现，NDJSON 强调 newline-delimited JSON，也就是用换行分隔的 JSON。',
          },
          {
            question: 'JSONL 文件可以格式化成多行吗？',
            answer: '不建议。JSONL 的关键约定是一行一条记录。如果把单条对象格式化成多行，按行读取的程序会把半个对象当成一条记录，导致解析失败。',
          },
          {
            question: 'JSONL 的文件扩展名是什么？',
            answer: '常见扩展名包括 .jsonl 和 .ndjson。团队内部最好统一一种，并在导入导出文档中写清楚编码、换行和 schema 约定。',
          },
        ],
      },
      en: {
        title: 'What Is JSONL? Examples, Comparisons, and When to Use It',
        excerpt: 'JSONL stores one valid JSON value per line, making it a better fit than normal JSON for logs, AI training data, large imports and exports, and streaming pipelines.',
        metaTitle: 'What Is JSONL? JSON Lines Examples, Comparison, and Use Cases',
        metaDescription: 'Learn what JSONL / JSON Lines is, see examples, compare it with normal JSON arrays, and understand why logs, AI training data, large imports and exports, and streaming pipelines often use JSONL.',
        readingTime: '7 min read',
        tags: ['JSONL', 'JSON Lines', 'NDJSON', 'Logs', 'AI training data'],
        relatedTools: [
          {
            label: 'JSON Formatter',
            href: '/json-format',
            description: 'Format, minify, and validate normal JSON when you need to inspect one object or array.',
          },
          {
            label: 'JSON to CSV',
            href: '/json-to-csv',
            description: 'Convert structured JSON arrays to CSV for cleanup, review, and spreadsheet workflows.',
          },
          {
            label: 'JSON Repair',
            href: '/json-repair',
            description: 'Fix common JSON syntax issues before converting or importing data.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'JSONL, also called JSON Lines or NDJSON, is a text format where each line is its own JSON value. For logs, AI training data, large-scale imports and exports, and streaming, JSONL is often a better fit than normal JSON.',
          },
          {
            type: 'paragraph',
            text: 'Normal JSON is excellent for a complete object, config file, or API response. JSONL is closer to an appendable stream of records. It still uses JSON syntax, but the file is not one large array; it is a sequence of independent JSON lines.',
          },
          { type: 'heading', level: 2, text: 'Basic JSONL rules' },
          {
            type: 'list',
            items: [
              'Each line is one complete JSON record, usually an object.',
              'Every line should be parseable on its own; there are no commas between lines.',
              'A trailing newline at the end of the file is fine, and readers usually process the file line by line.',
              'Do not pretty-print one object across multiple lines inside a JSONL file, because that breaks the one-record-per-line contract.',
            ],
          },
          { type: 'heading', level: 2, text: 'A JSONL example' },
          {
            type: 'code',
            language: 'jsonl',
            code: jsonlExample,
          },
          {
            type: 'paragraph',
            text: 'The three lines above are three separate records. A program can read the first line, append a fourth line, or resume from the middle without parsing the entire file into memory.',
          },
          { type: 'heading', level: 2, text: 'How is JSONL different from a JSON array?' },
          {
            type: 'code',
            language: 'json',
            code: normalJsonArrayExample,
          },
          {
            type: 'table',
            headers: ['Aspect', 'Normal JSON', 'JSONL'],
            rows: [
              ['File structure', 'Usually one object or array', 'Many independent JSON records'],
              ['Appending data', 'You must preserve commas and the closing bracket', 'Append one new line'],
              ['Reading model', 'Often parsed as a whole file', 'Can be read and processed line by line'],
              ['Error impact', 'One syntax error can break the whole file', 'Usually only the bad line fails'],
              ['Best scale', 'Small to medium configs, API responses, document data', 'Logs, events, training samples, batch imports and exports'],
            ],
          },
          { type: 'heading', level: 2, text: 'Why logs are a natural fit for JSONL' },
          {
            type: 'paragraph',
            text: 'Logs are produced one event at a time. If you store them as a normal JSON array, the writer has to keep managing commas, the closing bracket, and file completeness. With JSONL, each log event is serialized as one line and appended.',
          },
          {
            type: 'paragraph',
            text: 'That also makes downstream processing easier: command-line tools, log collectors, queue consumers, and warehouse loaders can consume records line by line without waiting for the file to finish.',
          },
          { type: 'heading', level: 2, text: 'Why AI training data often uses JSONL' },
          {
            type: 'paragraph',
            text: 'AI training and fine-tuning datasets often contain many independent examples. Each example can be validated, filtered, shuffled, split, or labeled on its own. JSONL matches that sample-level workflow.',
          },
          {
            type: 'code',
            language: 'jsonl',
            code: aiTrainingExample,
          },
          {
            type: 'paragraph',
            text: 'In this structure, one line is one training example. Data teams can run schema checks, deduplicate, sample, and quality-review individual lines, then merge many JSONL files into a larger dataset.',
          },
          { type: 'heading', level: 2, text: 'Common use cases' },
          {
            type: 'list',
            items: [
              'Logs: application logs, audit logs, analytics events, and system metric snapshots.',
              'AI training data: conversation examples, classification samples, instruction-tuning data, and labeling records.',
              'Large imports and exports: database dumps, search index rebuilds, and data warehouse batch loads.',
              'Streaming: queue consumers, real-time ETL, long-running responses, and chunked downloads.',
              'Data cleanup pipelines: filtering, mapping, aggregation, and sampling without loading the entire file at once.',
            ],
          },
          { type: 'heading', level: 2, text: 'When should you still use normal JSON?' },
          {
            type: 'paragraph',
            text: 'If your data is one hierarchical document, such as a config file, UI state snapshot, single API response, or payload that must be handled as one transaction, normal JSON is clearer. JSONL is strongest when you have many independent records.',
          },
          {
            type: 'callout',
            title: 'Check normal JSON first',
            text: 'If you receive a single JSON object or array, validate and inspect it with the JSON formatter before deciding whether it should become line-oriented records.',
            href: '/json-format',
            linkLabel: 'Open JSON Formatter',
          },
          { type: 'heading', level: 2, text: 'Summary' },
          {
            type: 'paragraph',
            text: 'JSONL turns a large dataset into independently processable records. It gives up the single-document feel of a JSON array, but gains easier appends, line-by-line reading, better error isolation, and streaming-friendly processing.',
          },
        ],
        faq: [
          {
            question: 'Are JSONL and NDJSON the same thing?',
            answer: 'In practice, they usually describe the same pattern: one JSON value per line. JSONL is common as a file-format name, while NDJSON emphasizes newline-delimited JSON.',
          },
          {
            question: 'Can a JSONL file be pretty-printed across multiple lines?',
            answer: 'It should not be. The central JSONL convention is one record per line. If one object spans multiple lines, line-based readers will treat partial objects as records and fail to parse them.',
          },
          {
            question: 'What file extension should JSONL use?',
            answer: 'Common extensions are .jsonl and .ndjson. Pick one for your team and document the encoding, newline style, and schema conventions for imports and exports.',
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
