import { defineToolContent } from './define';

export const needle2Content = defineToolContent({
  zh: {
    overview: [
      'Needle 2 把结构化提取建模为一次工具调用：页面将记录 Schema 包装成唯一工具，把原文作为 query 发送给兼容 endpoint，再从 function_calls[].arguments 读取结果。这样输出结构由 Schema 约束，而不是先生成自由文本再尝试修复 JSON。',
      '本页连接的是外部 Needle 2 服务，默认地址是本机 Needle playground。文本不会经过 ToolGarden 自己的服务器，但会发送到你填写的 endpoint；正式使用前请确认服务部署、CORS、访问控制和敏感数据策略。',
    ],
    steps: [
      ['定义记录形状', '在 Schema 面板声明根 type 为 object，并为要提取的字段填写 properties、类型、枚举和描述。'],
      ['提供原始文本', '把订单、邮件、表单或日志粘贴到输入区；只写原文中确实出现的信息，避免让模型猜测。'],
      ['生成并复核结果', '确认 endpoint 可访问后点击生成，查看 arguments、置信度和推理说明；低置信度或缺失字段应回到原文人工复核。'],
    ],
    example: {
      caption: 'Schema 只声明需要的字段；Needle 2 会把输入文本映射到这个记录，而不是返回聊天答案。',
      inputLabel: '输入文本',
      input: '订单 A-1042 属于李明，总额 328 元，已支付。',
      outputLabel: '结构化结果',
      output: '{\n  "order_id": "A-1042",\n  "customer": "李明",\n  "total": 328,\n  "status": "paid"\n}',
      language: 'json',
    },
    scenarios: [
      ['订单与收据抽取', '从客服邮件、收据或订单描述中抽取编号、金额、币种、客户和明细，交给后续业务流程。'],
      ['表单与邮件归档', '把半结构化的报名、预约或通知文本统一成固定记录，减少手工录入。'],
      ['设备指令与工具路由', '将自然语言设备请求映射为受约束的函数参数；真正执行动作前仍应加入权限检查和人工确认。'],
    ],
    notes: [
      'Needle 2 的提取契约是单工具调用，不是通用聊天模型；没有匹配工具时可能返回空的 function_calls。',
      'Schema 越明确越容易得到稳定结果，建议补充字段 description、enum、required、范围和数组 items。',
      '置信度是辅助信号，不等于业务正确性；金额、身份、权限和其他高风险字段仍要保留原文并人工复核。',
      '本地 playground 默认监听 127.0.0.1:7860；浏览器跨端口请求还需要 endpoint 服务返回允许当前来源的 CORS 响应头。',
    ],
    specs: [
      ['请求契约', 'POST 到兼容的 /complete endpoint，发送 query 和 tools。'],
      ['工具形状', '页面把记录 Schema 包装为名为 structured_data 的唯一工具。'],
      ['结果字段', '结构化数据来自 function_calls[0].arguments。'],
      ['约束方式', 'Needle 2 使用 schema 编译的字节级 grammar 约束工具调用。'],
      ['离线能力', '模型本身可在端侧运行，但本页面的默认连接依赖你启动的 playground 服务。'],
      ['安全边界', 'endpoint、CORS、认证和数据留存由所连接的服务负责，页面不代替服务端鉴权。'],
    ],
    faq: [
      { question: '为什么这里需要 JSON Schema？', answer: 'Needle 2 将结构化提取实现为唯一工具调用，Schema 同时定义字段、类型和可选约束，模型只能在这个结构里填充 arguments。' },
      { question: '生成结果会上传到 ToolGarden 吗？', answer: '不会经过 ToolGarden 自己的服务器；浏览器会直接请求页面中填写的 endpoint。默认 endpoint 是本机服务，但远程地址会收到文本，请先确认对方的隐私策略。' },
    ],
    reference: [
      ['function call', '模型选中的工具及其参数对象；本工具从第一个调用的 arguments 读取结构化结果。'],
      ['confidence', 'Needle 2 返回的置信度辅助指标，用于决定是否接受结果或升级到更强的处理流程。'],
    ],
  },
  en: {
    overview: [
      'Needle 2 models structured extraction as a tool call: this page wraps the record schema as one tool, sends the source text as the query to a compatible endpoint, and reads the result from function_calls[].arguments. The shape is constrained by the schema instead of being generated as free text and repaired afterward.',
      'This page connects to an external Needle 2 service, defaulting to the local Needle playground. Text does not pass through a ToolGarden server, but it is sent to the endpoint you enter; review its deployment, CORS, access control, and sensitive-data policy before production use.',
    ],
    steps: [
      ['Define the record shape', 'Set the root type to object and describe the fields with properties, types, enums, and field descriptions.'],
      ['Provide source text', 'Paste an order, email, form, or log into the input; describe only information that is evidenced by the source.'],
      ['Generate and review', 'Confirm the endpoint is reachable, run the extraction, then review arguments, confidence, and reasoning. Manually verify low-confidence or missing fields.'],
    ],
    example: {
      caption: 'The schema declares the fields to keep; Needle 2 maps the source text into that record instead of returning a chat answer.',
      inputLabel: 'Input text',
      input: 'Order A-1042 belongs to Li Ming, totals CNY 328, and is paid.',
      outputLabel: 'Structured result',
      output: '{\n  "order_id": "A-1042",\n  "customer": "Li Ming",\n  "total": 328,\n  "status": "paid"\n}',
      language: 'json',
    },
    scenarios: [
      ['Orders and receipts', 'Extract IDs, totals, currencies, customers, and line items from support emails, receipts, or order descriptions for downstream workflows.'],
      ['Forms and email archives', 'Turn semi-structured registration, booking, or notification text into consistent records with less manual entry.'],
      ['Device commands and routing', 'Map natural-language device requests to constrained function arguments; add authorization and confirmation before executing actions.'],
    ],
    notes: [
      'Needle 2 uses a single tool-call contract for extraction, not general chat; unmatched input may return an empty function_calls array.',
      'Explicit schemas produce steadier results. Add field descriptions, enums, required fields, ranges, and array items where appropriate.',
      'Confidence is a supporting signal, not proof of business correctness; retain the source and manually review money, identity, permission, and other high-risk fields.',
      'The local playground defaults to 127.0.0.1:7860; browser requests across ports also need CORS response headers allowing the current origin.',
    ],
    specs: [
      ['Request contract', 'POST to a compatible /complete endpoint with query and tools.'],
      ['Tool shape', 'The page wraps the record schema as one tool named structured_data.'],
      ['Result field', 'The structured data comes from function_calls[0].arguments.'],
      ['Constraint method', 'Needle 2 uses a schema-compiled byte-level grammar to constrain tool calls.'],
      ['Offline capability', 'The model can run on-device, but this page relies on the playground service you start for its default connection.'],
      ['Security boundary', 'The connected service owns endpoint, CORS, authentication, and retention; this page does not replace server-side authorization.'],
    ],
    faq: [
      { question: 'Why does this page need JSON Schema?', answer: 'Needle 2 implements structured extraction as a single tool call. The schema defines the fields, types, and constraints, so the model fills arguments inside that shape.' },
      { question: 'Does the result upload data to ToolGarden?', answer: 'It does not pass through a ToolGarden server; the browser requests the endpoint you provide directly. The default is local, but a remote endpoint receives the text, so check its privacy policy first.' },
    ],
    reference: [
      ['function call', 'The selected tool and its parameter object; this page reads the structured result from the first call’s arguments.'],
      ['confidence', 'A Needle 2 confidence signal that can help decide whether to accept the result or escalate to a stronger workflow.'],
    ],
  },
});
