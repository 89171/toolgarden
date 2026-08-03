import { defineToolContent } from './define';

export const urlBuilderContent = defineToolContent({
  zh: {
    overview: [
      'URL 由协议、主机、端口、路径、查询参数和片段等部分组成。手工拼接时，斜杠、问号、等号与百分号编码很容易出错，尤其是参数值本身包含空格、中文、`&` 或另一个 URL 的情况。',
      'URL 构建器把各组成部分分开编辑，再生成结构明确的地址。它适合准备接口请求、营销链接和回调地址，也能帮助区分查询参数与页面片段，减少重复编码或遗漏编码。',
    ],
    steps: [
      ['填写基础地址', '输入协议与主机，并按需要补充端口和路径。'],
      ['添加查询参数', '逐项填写参数名和值，让工具处理分隔符和必要的 URL 编码。'],
      ['检查并复制', '核对最终路径、参数顺序和片段，复制后在目标环境发起一次真实请求。'],
    ],
    example: {
      caption: "注意值里的空格和中文被 percent-encode，而分隔符 & = 保持原样。",
      inputLabel: "参数",
      input: "q      = 张三 test\npage   = 2\ntags   = a\ntags   = b",
      outputLabel: "构造出的 URL",
      output: "?q=%E5%BC%A0%E4%B8%89%20test&page=2&tags=a&tags=b",
      language: "text",
    },
    scenarios: [
      ['构造 API 请求', '组合分页、筛选和排序参数，避免在代码之外手工处理多个 `&`。'],
      ['生成可追踪链接', '为活动页面加入来源参数，同时保留已有查询项和页面锚点。'],
      ["拆解出问题的回调地址", "第三方回调或重定向地址报错时，拆开逐个参数检查编码是否正确、必填参数是否齐全。"],
    ],
    notes: [
      '参数名和值应分别编码，不要先把整条 URL 编码后再作为地址使用。',
      '片段位于 `#` 后，通常不会随 HTTP 请求发送到服务器。',
      '不要把口令、令牌或敏感个人数据放入查询字符串，它们可能出现在历史记录和服务器日志中。',
    ],
    specs: [["两个方向", "拆解现有 URL 的 query string，或逐个添加参数构造新 URL"], ["自动编码", "参数值中的空格、中文、&、= 等字符会按 percent-encoding 转义"], ["重复参数", "同名参数可以出现多次（如 tag=a&tag=b），拆解时会按出现顺序全部列出"], ["空值处理", "区分「参数存在但值为空」（key=）和「参数不存在」两种情况"], ["fragment", "# 之后的片段标识不属于 query string，不会被发送到服务器"], ["隐私提醒", "URL 会出现在日志、Referer 头和浏览器历史里，不要把敏感信息放进 query 参数"]],
    faq: [{ question: "参数值里的 & 为什么必须编码？", answer: "因为 & 是参数之间的分隔符。值里出现未编码的 & 会被解析成新参数的开始，把一个值切成两半。所有保留字符（& = ? # +）出现在值里时都必须 percent-encode。" }, { question: "同名参数出现多次合法吗？", answer: "URL 规范允许，但服务端的处理方式不统一：有的取第一个，有的取最后一个，有的收成数组。依赖这种写法之前请确认接收方的实际行为。" }],
    reference: [
      ['query string', '位于 `?` 之后的一组键值参数，多项通常用 `&` 分隔。'],
      ['percent-encoding', '用百分号和十六进制字节安全表示 URL 中的保留字符或非 ASCII 文本。'],
    ],
  },
  en: {
    overview: [
      'A URL is composed of a scheme, host, optional port, path, query, and fragment. Manual concatenation easily introduces mistakes with slashes, question marks, equals signs, and percent encoding, especially when a value contains spaces, non-ASCII text, `&`, or another URL.',
      'The URL builder edits these parts separately and assembles a structurally valid address. It is useful for API requests, campaign links, and callback URLs, and helps distinguish query parameters from a page fragment while avoiding missing or double encoding.',
    ],
    steps: [
      ['Enter the base address', 'Provide the scheme and host, then add a port and path when needed.'],
      ['Add query parameters', 'Enter each key and value separately so delimiters and required URL encoding are handled consistently.'],
      ['Verify and copy', 'Check the final path, parameters, and fragment, then make one real request in the destination environment.'],
    ],
    example: {
      caption: "Note that spaces and non-Latin characters in values are percent-encoded, while the & and = delimiters stay literal.",
      inputLabel: "Parameters",
      input: "q      = jane doe\npage   = 2\ntags   = a\ntags   = b",
      outputLabel: "Constructed URL",
      output: "?q=jane%20doe&page=2&tags=a&tags=b",
      language: "text",
    },
    scenarios: [
      ['Constructing an API request', 'Combine pagination, filtering, and sorting options without manually juggling multiple `&` characters.'],
      ['Generating a tracked link', 'Add campaign attribution while retaining existing query values and a page anchor.'],
      ["Taking apart a callback URL that fails", "When a third-party callback or redirect errors, break it down parameter by parameter to check the encoding and whether anything required is missing."],
    ],
    notes: [
      'Encode parameter names and values individually. Encoding the complete URL produces a value rather than a directly navigable address.',
      'The fragment after `#` is normally handled by the client and is not sent in the HTTP request.',
      'Do not place passwords, tokens, or sensitive personal data in a query string because it can appear in history and server logs.',
    ],
    specs: [["Two directions", "Break down an existing URL's query string, or build a new one parameter by parameter"], ["Automatic encoding", "Spaces, non-Latin characters, & and = in values are percent-encoded"], ["Repeated parameters", "The same key can appear several times (tag=a&tag=b) and all occurrences are listed in order"], ["Empty values", "Distinguishes \"present but empty\" (key=) from \"not present at all\""], ["Fragments", "Anything after # is not part of the query string and is never sent to the server"], ["Privacy note", "URLs end up in logs, Referer headers and browser history; keep sensitive values out of query parameters"]],
    faq: [{ question: "Why must & inside a value be encoded?", answer: "Because & separates parameters. An unencoded & in a value is read as the start of a new parameter, cutting the value in half. Every reserved character; & = ? # +; must be percent-encoded when it appears in a value." }, { question: "Is repeating the same parameter name legal?", answer: "The URL spec allows it, but servers disagree on the handling: some take the first, some the last, some collect an array. Confirm the recipient's actual behaviour before relying on it." }],
    reference: [
      ['query string', 'The key-value section after `?`, with multiple parameters commonly separated by `&`.'],
      ['percent-encoding', 'A percent sign plus hexadecimal bytes used to represent reserved characters and non-ASCII text safely in a URL.'],
    ],
  },
});
