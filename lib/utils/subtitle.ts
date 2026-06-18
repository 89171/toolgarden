export type SubtitleFormat = 'lrc' | 'srt';

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export type SubtitleParseOutcome =
  | { ok: true; format: SubtitleFormat; cues: SubtitleCue[] }
  | { ok: false; message: string };

export type SubtitleExportOutcome =
  | { ok: true; output: string }
  | { ok: false; message: string };

function isFiniteTime(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function detectSubtitleFormat(input: string, filename = ''): SubtitleFormat {
  const normalizedName = filename.toLowerCase();
  if (normalizedName.endsWith('.srt')) return 'srt';
  if (normalizedName.endsWith('.lrc')) return 'lrc';
  return input.includes('-->') ? 'srt' : 'lrc';
}

export function parseSubtitleTime(value: string, format: SubtitleFormat): number | null {
  const raw = value.trim();

  if (format === 'srt') {
    const match = raw.match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
    if (!match) return null;
    const [, hours, minutes, seconds, millis] = match;
    return (
      Number(hours) * 3600 +
      Number(minutes) * 60 +
      Number(seconds) +
      Number(millis.padEnd(3, '0')) / 1000
    );
  }

  const match = raw.match(/^(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?$/);
  if (!match) return null;
  const [, minutes, seconds, fraction = '0'] = match;
  return Number(minutes) * 60 + Number(seconds) + Number(fraction.padEnd(3, '0')) / 1000;
}

export function formatSrtTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const wholeSeconds = Math.floor(safe % 60);
  const millis = Math.round((safe - Math.floor(safe)) * 1000);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    wholeSeconds.toString().padStart(2, '0'),
  ].join(':') + `,${millis.toString().padStart(3, '0')}`;
}

export function formatLrcTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const wholeSeconds = Math.floor(safe % 60);
  const centiseconds = Math.round((safe - Math.floor(safe)) * 100);

  return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

export function formatSubtitleTime(seconds: number, format: SubtitleFormat): string {
  return format === 'srt' ? formatSrtTime(seconds) : formatLrcTime(seconds);
}

function normalizeCues(cues: SubtitleCue[]): SubtitleCue[] {
  return cues
    .filter((cue) => isFiniteTime(cue.start) && isFiniteTime(cue.end) && cue.text.trim())
    .map((cue) => ({
      start: Math.max(0, cue.start),
      end: Math.max(cue.start + 0.01, cue.end),
      text: cue.text.trim(),
    }))
    .sort((a, b) => a.start - b.start);
}

function parseSrt(input: string): SubtitleCue[] {
  const blocks = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n{2,}/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((line) => line.trimEnd()).filter(Boolean);
    if (lines.length < 2) continue;

    const timingIndex = lines.findIndex((line) => line.includes('-->'));
    if (timingIndex === -1) continue;

    const [rawStart, rawEnd] = lines[timingIndex].split('-->').map((part) => part.trim());
    const start = parseSubtitleTime(rawStart, 'srt');
    const end = parseSubtitleTime(rawEnd?.split(/\s+/)[0] ?? '', 'srt');
    const text = lines.slice(timingIndex + 1).join('\n').trim();

    if (start !== null && end !== null && text) {
      cues.push({ start, end, text });
    }
  }

  return normalizeCues(cues);
}

function parseLrc(input: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const tagPattern = /\[(\d{1,3}:\d{2}(?:[.:]\d{1,3})?)\](?:<(\d{1,3}:\d{2}(?:[.:]\d{1,3})?)>)?/g;

  for (const rawLine of input.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')) {
    const line = rawLine.trim();
    if (!line || /^\[(ti|ar|al|by|offset):/i.test(line)) continue;

    const matches = [...line.matchAll(tagPattern)];
    if (!matches.length) continue;

    const text = line.replace(tagPattern, '').trim();
    if (!text) continue;

    for (const match of matches) {
      const start = parseSubtitleTime(match[1], 'lrc');
      const explicitEnd = match[2] ? parseSubtitleTime(match[2], 'lrc') : null;
      if (start === null) continue;
      cues.push({ start, end: explicitEnd ?? start + 3, text });
    }
  }

  const normalized = normalizeCues(cues);
  return normalized.map((cue, index) => {
    const next = normalized[index + 1];
    if (next && cue.end <= cue.start + 0.01) {
      return { ...cue, end: Math.max(cue.start + 0.01, next.start) };
    }
    if (next && cue.end > next.start) {
      return { ...cue, end: Math.max(cue.start + 0.01, next.start) };
    }
    return cue;
  });
}

export function parseSubtitle(input: string, filename = ''): SubtitleParseOutcome {
  const raw = input.trim();
  if (!raw) return { ok: false, message: 'Subtitle input is empty.' };

  const format = detectSubtitleFormat(raw, filename);
  const cues = format === 'srt' ? parseSrt(raw) : parseLrc(raw);

  if (!cues.length) {
    return { ok: false, message: 'No valid subtitle lines were found.' };
  }

  return { ok: true, format, cues };
}

export function exportSubtitle(cues: SubtitleCue[], format: SubtitleFormat): SubtitleExportOutcome {
  const normalized = normalizeCues(cues);
  if (!normalized.length) return { ok: false, message: 'No subtitle lines to export.' };

  if (format === 'srt') {
    return {
      ok: true,
      output: normalized
        .map((cue, index) => [
          String(index + 1),
          `${formatSrtTime(cue.start)} --> ${formatSrtTime(cue.end)}`,
          cue.text,
        ].join('\n'))
        .join('\n\n'),
    };
  }

  return {
    ok: true,
    output: normalized
      .map((cue) => `[${formatLrcTime(cue.start)}]<${formatLrcTime(cue.end)}>${cue.text.replace(/\n+/g, ' ')}`)
      .join('\n'),
  };
}
