import type { Locale } from '@/lib/tools/jsonld';

/**
 * 工具页正文内容契约。
 *
 * 为什么不放在 messages/*.json：`getClientMessages` 会把 messages 整体序列化进
 * NextIntlClientProvider，也就是内联到每个页面的 HTML。87 个工具的正文放进 messages
 * 会让每个页面都带上全站正文。这里按工具拆成独立模块，由对应的 page.tsx 显式引入，
 * 靠 Next.js 的按路由分包保证「只有本工具的正文进本路由的 chunk」。
 *
 * 内容层的目标是让每个工具页拥有足够的独有正文（约 800-1500 字），
 * 而不是靠同一套骨架换名词：`overview` / `scenarios` / `notes` / `reference`
 * 必须写该工具特有的信息，否则等同于批量生成的低价值内容。
 */
export interface ToolContentBody {
  /** 概述段落：这个工具解决什么问题、格式背景、常见误解。2-3 段。 */
  overview: string[];
  /** 操作步骤，同时驱动 HowTo 结构化数据。 */
  steps: ToolContentStep[];
  /** 典型使用场景。 */
  scenarios: ToolContentScenario[];
  /** 一组真实的输入 / 输出示例。 */
  example?: ToolContentExample;
  /** 能力与限制对照表。 */
  specs?: ToolContentSpec[];
  /** 注意事项、边界情况、已知限制。 */
  notes: string[];
  /** 术语与背景知识，用于承载该工具特有的深度内容。 */
  reference?: ToolContentReference[];
  /** 追加的 FAQ，与 messages.tool_faq 中的条目合并展示。 */
  faq?: ToolContentFaqItem[];
}

export interface ToolContentStep {
  title: string;
  detail: string;
}

export interface ToolContentScenario {
  title: string;
  detail: string;
}

export interface ToolContentExample {
  caption: string;
  inputLabel: string;
  input: string;
  outputLabel: string;
  output: string;
  /** 代码块语言，用于 <code> 的 data-language 标注。 */
  language?: string;
}

export interface ToolContentSpec {
  label: string;
  value: string;
}

export interface ToolContentReference {
  term: string;
  definition: string;
}

export interface ToolContentFaqItem {
  question: string;
  answer: string;
}

/** 一个工具的全语言正文。 */
export type ToolContent = Record<Locale, ToolContentBody>;
