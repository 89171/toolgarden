import { marked, Renderer, type Tokens } from 'marked';

export type MarkdownHtmlOutcome =
  | {
      ok: true;
      fragment: string;
      document: string;
      title: string;
      filenameStem: string;
    }
  | { ok: false; message: string };

interface MarkdownHtmlOptions {
  fallbackTitle: string;
  lang: 'en' | 'zh-CN';
}

export const MARKDOWN_FILE_ACCEPT = 'text/markdown,text/x-markdown,.md,.markdown';

const UNSAFE_PROTOCOL = /^(?:javascript|vbscript|file):/iu;
const SAFE_DATA_IMAGE = /^data:image\/(?:gif|jpe?g|png|webp);base64,/iu;

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}

function sanitizeUrl(value: string): string | null {
  const normalized = value.trim().replace(/[\u0000-\u001f\u007f\s]+/gu, '');
  if (!normalized) return null;
  if (SAFE_DATA_IMAGE.test(normalized)) return normalized;
  if (UNSAFE_PROTOCOL.test(normalized)) return null;
  if (/^data:/iu.test(normalized)) return null;
  return value;
}

class SafeMarkdownRenderer extends Renderer {
  html({ text }: Tokens.HTML | Tokens.Tag): string {
    return escapeHtml(text);
  }

  link({ href, title, tokens }: Tokens.Link): string {
    const safeHref = sanitizeUrl(href);
    const content = this.parser.parseInline(tokens);
    if (!safeHref) return content;

    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
    return `<a href="${escapeHtml(safeHref)}"${titleAttribute} rel="noopener noreferrer">${content}</a>`;
  }

  image({ href, title, text }: Tokens.Image): string {
    const safeHref = sanitizeUrl(href);
    if (!safeHref) return escapeHtml(text);

    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
    return `<img src="${escapeHtml(safeHref)}" alt="${escapeHtml(text)}"${titleAttribute}>`;
  }
}

function plainHeadingText(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
    .replace(/[*_~`]/gu, '')
    .replace(/<[^>]+>/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function extractMarkdownTitle(markdown: string, fallbackTitle: string): string {
  const heading = markdown.match(/^\s{0,3}#\s+(.+?)\s*#*\s*$/mu);
  const title = heading ? plainHeadingText(heading[1]) : '';
  return title || fallbackTitle;
}

export function createSafeFilenameStem(value: string, fallback = 'document'): string {
  const normalized = value
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .replace(/[. ]+$/gu, '')
    .trim()
    .slice(0, 80);

  return normalized || fallback;
}

export function isMarkdownFile(file: Pick<File, 'name' | 'type'>): boolean {
  const mimeType = file.type.toLowerCase().split(';', 1)[0].trim();
  return /\.(?:md|markdown)$/iu.test(file.name)
    || mimeType === 'text/markdown'
    || mimeType === 'text/x-markdown';
}

function createHtmlDocument(fragment: string, title: string, lang: MarkdownHtmlOptions['lang']): string {
  const safeTitle = escapeHtml(title);

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; font-src data:; base-uri 'none'; form-action 'none'">
  <title>${safeTitle}</title>
  <style>
    :root {
      color-scheme: light;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #1f2937;
      background: #ffffff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0 auto;
      max-width: 820px;
      padding: 56px 48px 80px;
      font-size: 16px;
      line-height: 1.75;
      overflow-wrap: anywhere;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #111827;
      line-height: 1.25;
      margin: 1.8em 0 0.65em;
    }
    h1 { margin-top: 0; font-size: 2.25rem; letter-spacing: -0.03em; }
    h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 0.35em; font-size: 1.55rem; }
    h3 { font-size: 1.25rem; }
    p, ul, ol, blockquote, pre, table { margin: 0 0 1.2em; }
    ul, ol { padding-left: 1.6em; }
    li + li { margin-top: 0.25em; }
    a { color: #1d4ed8; text-underline-offset: 0.18em; }
    blockquote {
      margin-left: 0;
      border-left: 3px solid #9ca3af;
      padding: 0.25em 0 0.25em 1em;
      color: #4b5563;
    }
    code, pre {
      font-family: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;
    }
    code {
      border-radius: 4px;
      background: #f3f4f6;
      padding: 0.12em 0.35em;
      font-size: 0.9em;
    }
    pre {
      overflow-x: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
      padding: 1em;
      line-height: 1.55;
    }
    pre code { background: transparent; padding: 0; }
    img { display: block; max-width: 100%; height: auto; margin: 1.5em auto; }
    hr { margin: 2em 0; border: 0; border-top: 1px solid #d1d5db; }
    table { width: 100%; border-collapse: collapse; font-size: 0.95em; }
    th, td { border: 1px solid #d1d5db; padding: 0.55em 0.7em; text-align: left; }
    th { background: #f3f4f6; color: #111827; }
    input[type="checkbox"] { margin-right: 0.45em; }
    @page { size: A4; margin: 16mm; }
    @media print {
      body { max-width: none; padding: 0; }
      a { color: inherit; text-decoration: none; }
      pre, blockquote, table, img { break-inside: avoid; }
      h1, h2, h3 { break-after: avoid; }
    }
    @media (max-width: 640px) {
      body { padding: 32px 22px 56px; }
      h1 { font-size: 1.9rem; }
    }
  </style>
</head>
<body>
${fragment}
</body>
</html>
`;
}

export function markdownToHtml(
  markdown: string,
  options: MarkdownHtmlOptions
): MarkdownHtmlOutcome {
  if (!markdown.trim()) return { ok: false, message: 'empty_markdown' };

  try {
    const title = extractMarkdownTitle(markdown, options.fallbackTitle);
    const renderer = new SafeMarkdownRenderer();
    const fragment = marked.parse(markdown, {
      async: false,
      breaks: false,
      gfm: true,
      renderer,
    }) as string;

    return {
      ok: true,
      fragment,
      document: createHtmlDocument(fragment, title, options.lang),
      title,
      filenameStem: createSafeFilenameStem(title),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'markdown_conversion_failed',
    };
  }
}
