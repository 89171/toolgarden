import { normalizeLocale } from '@/lib/tools/jsonld';
import type { ToolContent, ToolContentBody } from './types';

export type {
  ToolContent,
  ToolContentBody,
  ToolContentExample,
  ToolContentFaqItem,
  ToolContentReference,
  ToolContentScenario,
  ToolContentSpec,
  ToolContentStep,
} from './types';

/**
 * 按 locale 取出正文。
 *
 * 故意不做「按 id 查全站内容」的注册表：那会把所有工具的正文拉进同一个 chunk，
 * 抵消按路由分包的收益。调用方（工具页）直接 import 自己的内容模块并传给 ToolLayout。
 */
export function resolveToolContent(
  content: ToolContent | undefined,
  locale: string
): ToolContentBody | null {
  if (!content) return null;
  return content[normalizeLocale(locale)] ?? null;
}
