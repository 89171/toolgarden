import { defineToolContent } from './define';
import zh from '@/messages/zh.json';
import en from '@/messages/en.json';

function pairs(rows: string[][]): [string, string][] {
  return rows.map(([title, detail]) => [title, detail]);
}

function draft(body: typeof zh.font_preview_content) {
  return {
    ...body,
    steps: pairs(body.steps),
    scenarios: pairs(body.scenarios),
    specs: pairs(body.specs),
    reference: pairs(body.reference),
  };
}

export const fontPreviewContent = defineToolContent({
  zh: draft(zh.font_preview_content),
  en: draft(en.font_preview_content),
});
