export interface RegexMatch {
  index: number;
  match: string;
  groups: string[];
  namedGroups: Record<string, string>;
}

export type RegexOutcome =
  | { ok: true; matches: RegexMatch[]; segments: Array<{ text: string; matched: boolean }> }
  | { ok: false; message: string };

export function runRegex(pattern: string, flags: string, text: string): RegexOutcome {
  if (!pattern) return { ok: false, message: 'empty' };
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags);
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  const matches: RegexMatch[] = [];
  const segments: Array<{ text: string; matched: boolean }> = [];
  let cursor = 0;
  const global = flags.includes('g');

  if (!global) {
    const m = re.exec(text);
    if (m) {
      matches.push({
        index: m.index,
        match: m[0],
        groups: m.slice(1),
        namedGroups: { ...(m.groups ?? {}) },
      });
      if (m.index > cursor) segments.push({ text: text.slice(cursor, m.index), matched: false });
      segments.push({ text: m[0], matched: true });
      cursor = m.index + m[0].length;
    }
  } else {
    let m: RegExpExecArray | null;
    let iter = 0;
    while ((m = re.exec(text)) !== null && iter < 5000) {
      matches.push({
        index: m.index,
        match: m[0],
        groups: m.slice(1),
        namedGroups: { ...(m.groups ?? {}) },
      });
      if (m.index > cursor) segments.push({ text: text.slice(cursor, m.index), matched: false });
      segments.push({ text: m[0], matched: true });
      cursor = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex += 1;
      iter += 1;
    }
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), matched: false });
  return { ok: true, matches, segments };
}

export const REGEX_TEMPLATES = [
  { label: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+', flags: 'g' },
  { label: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'g' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { label: 'Phone (CN)', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { label: 'Hex color', pattern: '#[0-9a-fA-F]{3,8}\\b', flags: 'g' },
];
