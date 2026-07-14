import type { MindElixirData, NodeObj } from 'mind-elixir';

export type MindMapConversionOutcome =
  | { ok: true; data: MindElixirData }
  | { ok: false; message: string };

export type MindMapTextOutcome =
  | { ok: true; output: string }
  | { ok: false; message: string };

function createNodeId(): string {
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`.slice(0, 16);
}

function createNode(topic: string): NodeObj {
  return {
    id: createNodeId(),
    topic: topic.trim() || 'Untitled',
  };
}

export function createMindMapNode(topic: string): NodeObj {
  return createNode(topic);
}

export function createMindMapData(rootTopic: string, childTopics: string[] = []): MindElixirData {
  return {
    nodeData: {
      ...createNode(rootTopic),
      children: childTopics.map((topic) => createNode(topic)),
    },
    direction: 2,
  };
}

function cleanTopic(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^\s*[-*+]\s+/u, '')
    .trim();
}

function normalizeTopicForMarkdown(value: string): string {
  return cleanTopic(value).replace(/\r?\n/g, ' ');
}

function parseMarkdownLine(
  line: string,
  currentHeadingLevel: number,
): { level: number; topic: string; headingLevel?: number } | null {
  const heading = line.match(/^\s*(#{1,6})\s+(.+)$/u);
  if (heading) {
    return {
      level: heading[1].length,
      topic: cleanTopic(heading[2]),
      headingLevel: heading[1].length,
    };
  }

  const bullet = line.match(/^(\s*)[-*+]\s+(.+)$/u);
  if (bullet) {
    const indent = bullet[1].replace(/\t/g, '  ').length;
    const bulletLevel = Math.floor(indent / 2);
    return {
      level: (currentHeadingLevel > 0 ? currentHeadingLevel + 1 : 1) + bulletLevel,
      topic: cleanTopic(bullet[2]),
    };
  }

  const topic = cleanTopic(line);
  return topic ? { level: 1, topic, headingLevel: 1 } : null;
}

export function markdownToMindElixirData(
  markdown: string,
  fallbackRoot = 'Mind Map',
): MindMapConversionOutcome {
  const lines = markdown.split(/\r?\n/u).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { ok: true, data: { nodeData: createNode(fallbackRoot), direction: 2 } };
  }

  const roots: NodeObj[] = [];
  const stack: Array<{ level: number; node: NodeObj }> = [];
  let currentHeadingLevel = 0;

  for (const line of lines) {
    const parsed = parseMarkdownLine(line, currentHeadingLevel);
    if (!parsed) continue;
    if (parsed.headingLevel) currentHeadingLevel = parsed.headingLevel;

    const node = createNode(parsed.topic);
    while (stack.length > 0 && stack[stack.length - 1].level >= parsed.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1]?.node;
    if (parent) {
      parent.children = [...(parent.children ?? []), node];
    } else {
      roots.push(node);
    }
    stack.push({ level: parsed.level, node });
  }

  if (roots.length === 0) {
    return { ok: false, message: 'No mind map nodes found.' };
  }

  return {
    ok: true,
    data: {
      nodeData: roots.length === 1
        ? roots[0]
        : {
            id: createNodeId(),
            topic: fallbackRoot,
            children: roots,
          },
      direction: 2,
    },
  };
}

export function mindElixirDataToMarkdown(data: MindElixirData): string {
  const lines: string[] = [];

  function visit(node: NodeObj, depth: number) {
    const topic = normalizeTopicForMarkdown(node.topic);
    if (depth === 0) {
      lines.push(`# ${topic}`);
    } else {
      lines.push(`${'  '.repeat(depth - 1)}- ${topic}`);
    }

    for (const child of node.children ?? []) {
      visit(child, depth + 1);
    }
  }

  visit(data.nodeData, 0);
  return `${lines.join('\n')}\n`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isMindMapNode(value: unknown): value is NodeObj {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'string' || typeof value.topic !== 'string') return false;

  const children = value.children;
  return children === undefined || (Array.isArray(children) && children.every(isMindMapNode));
}

export function mindElixirDataToJson(data: MindElixirData): MindMapTextOutcome {
  try {
    return { ok: true, output: `${JSON.stringify(data, null, 2)}\n` };
  } catch {
    return { ok: false, message: 'Mind map data could not be serialized.' };
  }
}

export function jsonToMindElixirData(json: string): MindMapConversionOutcome {
  try {
    const data = JSON.parse(json) as unknown;
    if (!isRecord(data) || !isMindMapNode(data.nodeData)) {
      return { ok: false, message: 'Invalid mind map JSON file.' };
    }

    const direction = data.direction;
    return {
      ok: true,
      data: {
        ...data,
        direction: direction === 0 || direction === 1 || direction === 2 ? direction : 2,
      } as MindElixirData,
    };
  } catch {
    return { ok: false, message: 'Invalid mind map JSON file.' };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function createMindMapHtmlSnapshot(title: string, svgMarkup: string, outline: string): string {
  const safeTitle = escapeHtml(title);
  const safeOutline = escapeHtml(outline.trimEnd());

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; color: #111827; }
    main { min-height: 100vh; padding: 24px; box-sizing: border-box; }
    .map { overflow: auto; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff; padding: 16px; }
    .map svg { display: block; max-width: 100%; height: auto; margin: 0 auto; }
    details { margin-top: 16px; }
    summary { cursor: pointer; font-weight: 600; }
    pre { white-space: pre-wrap; word-break: break-word; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff; padding: 16px; }
  </style>
</head>
<body>
  <main>
    <section class="map" aria-label="${safeTitle}">
${svgMarkup}
    </section>
    <details>
      <summary>Markdown outline</summary>
      <pre>${safeOutline}</pre>
    </details>
  </main>
</body>
</html>
`;
}
