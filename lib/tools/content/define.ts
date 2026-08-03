import type {
  ToolContent,
  ToolContentBody,
  ToolContentExample,
  ToolContentFaqItem,
} from './types';

type Pair = readonly [title: string, detail: string];
type SpecPair = readonly [label: string, value: string];

interface ToolContentDraft {
  overview: string[];
  steps: Pair[];
  scenarios: Pair[];
  notes: string[];
  example?: ToolContentExample;
  specs?: SpecPair[];
  reference?: Pair[];
  faq?: ToolContentFaqItem[];
}

/**
 * 把紧凑的内容 tuple 转成 ToolArticle 使用的具名对象。
 *
 * 这里只消除重复的 TypeScript 结构，不生成文案。每个工具的说明、步骤、场景、
 * 限制和术语仍在自己的路由模块里完整定义，避免用注册表字段拼出模板化正文。
 */
export function defineToolContent(draft: Record<'zh' | 'en', ToolContentDraft>): ToolContent {
  const resolve = (body: ToolContentDraft): ToolContentBody => ({
    overview: body.overview,
    steps: body.steps.map(([title, detail]) => ({ title, detail })),
    scenarios: body.scenarios.map(([title, detail]) => ({ title, detail })),
    notes: body.notes,
    ...(body.example ? { example: body.example } : {}),
    ...(body.specs
      ? { specs: body.specs.map(([label, value]) => ({ label, value })) }
      : {}),
    ...(body.reference
      ? { reference: body.reference.map(([term, definition]) => ({ term, definition })) }
      : {}),
    ...(body.faq ? { faq: body.faq } : {}),
  });

  return { zh: resolve(draft.zh), en: resolve(draft.en) };
}
