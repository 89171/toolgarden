import { diffLines, diffWordsWithSpace } from 'diff';

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  cjkCharacters: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  bytes: number;
  readingMinutes: number;
}

export type TextDiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface InlineTextDiffPart {
  type: Exclude<TextDiffType, 'changed'>;
  value: string;
}

export interface TextDiffRow {
  type: TextDiffType;
  leftLineNumber?: number;
  rightLineNumber?: number;
  leftText: string;
  rightText: string;
  leftParts: InlineTextDiffPart[];
  rightParts: InlineTextDiffPart[];
}

export interface TextDiffSummary {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  rows: TextDiffRow[];
}

export type TextDiffOutcome =
  | { ok: true; summary: TextDiffSummary }
  | { ok: false; message: string };

function splitDiffLines(value: string): string[] {
  const normalizedValue = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (normalizedValue.length === 0) return [];

  const lines = normalizedValue.split('\n');
  if (lines.at(-1) === '') lines.pop();
  return lines;
}

function countWords(value: string): number {
  const cjkMatches = value.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu);
  const nonCjkValue = value.replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, ' ');
  const latinMatches = nonCjkValue.match(/[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu);

  return (cjkMatches?.length ?? 0) + (latinMatches?.length ?? 0);
}

export function countTextStats(value: string): TextStats {
  const normalizedValue = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const trimmedValue = normalizedValue.trim();
  const characters = Array.from(value).length;
  const charactersNoSpaces = Array.from(value.replace(/\s/gu, '')).length;
  const words = countWords(value);
  const cjkCharacters = value.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)?.length ?? 0;
  const lines = value.length === 0 ? 0 : normalizedValue.split('\n').length;
  const paragraphs = trimmedValue.length === 0
    ? 0
    : trimmedValue.split(/\n\s*\n/u).filter((paragraph) => paragraph.trim().length > 0).length;
  const sentences = trimmedValue.length === 0
    ? 0
    : (trimmedValue.match(/[^.!?。！？]+[.!?。！？]?/gu)?.filter((sentence) => sentence.trim().length > 0).length ?? 0);
  const bytes = new TextEncoder().encode(value).length;
  const readingUnits = words > 0 ? words : charactersNoSpaces;
  const readingMinutes = readingUnits === 0 ? 0 : Math.max(1, Math.ceil(readingUnits / 500));

  return {
    characters,
    charactersNoSpaces,
    words,
    cjkCharacters,
    lines,
    paragraphs,
    sentences,
    bytes,
    readingMinutes,
  };
}

function createPlainParts(value: string, type: Exclude<TextDiffType, 'changed'>): InlineTextDiffPart[] {
  return value.length > 0 ? [{ type, value }] : [];
}

function createInlineParts(leftText: string, rightText: string) {
  const leftParts: InlineTextDiffPart[] = [];
  const rightParts: InlineTextDiffPart[] = [];

  for (const part of diffWordsWithSpace(leftText, rightText)) {
    if (part.added) {
      rightParts.push({ type: 'added', value: part.value });
    } else if (part.removed) {
      leftParts.push({ type: 'removed', value: part.value });
    } else {
      leftParts.push({ type: 'unchanged', value: part.value });
      rightParts.push({ type: 'unchanged', value: part.value });
    }
  }

  return { leftParts, rightParts };
}

function createUnchangedRow(text: string, leftLineNumber: number, rightLineNumber: number): TextDiffRow {
  return {
    type: 'unchanged',
    leftLineNumber,
    rightLineNumber,
    leftText: text,
    rightText: text,
    leftParts: createPlainParts(text, 'unchanged'),
    rightParts: createPlainParts(text, 'unchanged'),
  };
}

function createRemovedRow(text: string, leftLineNumber: number): TextDiffRow {
  return {
    type: 'removed',
    leftLineNumber,
    leftText: text,
    rightText: '',
    leftParts: createPlainParts(text, 'removed'),
    rightParts: [],
  };
}

function createAddedRow(text: string, rightLineNumber: number): TextDiffRow {
  return {
    type: 'added',
    rightLineNumber,
    leftText: '',
    rightText: text,
    leftParts: [],
    rightParts: createPlainParts(text, 'added'),
  };
}

function createChangedRow(
  leftText: string,
  rightText: string,
  leftLineNumber: number,
  rightLineNumber: number
): TextDiffRow {
  const { leftParts, rightParts } = createInlineParts(leftText, rightText);

  return {
    type: 'changed',
    leftLineNumber,
    rightLineNumber,
    leftText,
    rightText,
    leftParts,
    rightParts,
  };
}

export function compareText(leftText: string, rightText: string): TextDiffOutcome {
  try {
    const rows: TextDiffRow[] = [];
    const changes = diffLines(leftText, rightText);
    let leftLineNumber = 1;
    let rightLineNumber = 1;

    for (let index = 0; index < changes.length; index += 1) {
      const change = changes[index];
      const nextChange = changes[index + 1];

      if (!change.added && !change.removed) {
        for (const line of splitDiffLines(change.value)) {
          rows.push(createUnchangedRow(line, leftLineNumber, rightLineNumber));
          leftLineNumber += 1;
          rightLineNumber += 1;
        }
        continue;
      }

      if (change.removed && nextChange?.added) {
        const removedLines = splitDiffLines(change.value);
        const addedLines = splitDiffLines(nextChange.value);
        const pairedLength = Math.max(removedLines.length, addedLines.length);

        for (let rowIndex = 0; rowIndex < pairedLength; rowIndex += 1) {
          const removedLine = removedLines[rowIndex];
          const addedLine = addedLines[rowIndex];

          if (removedLine !== undefined && addedLine !== undefined) {
            rows.push(createChangedRow(removedLine, addedLine, leftLineNumber, rightLineNumber));
            leftLineNumber += 1;
            rightLineNumber += 1;
          } else if (removedLine !== undefined) {
            rows.push(createRemovedRow(removedLine, leftLineNumber));
            leftLineNumber += 1;
          } else if (addedLine !== undefined) {
            rows.push(createAddedRow(addedLine, rightLineNumber));
            rightLineNumber += 1;
          }
        }

        index += 1;
        continue;
      }

      if (change.removed) {
        for (const line of splitDiffLines(change.value)) {
          rows.push(createRemovedRow(line, leftLineNumber));
          leftLineNumber += 1;
        }
        continue;
      }

      if (change.added) {
        for (const line of splitDiffLines(change.value)) {
          rows.push(createAddedRow(line, rightLineNumber));
          rightLineNumber += 1;
        }
      }
    }

    return {
      ok: true,
      summary: {
        added: rows.filter((row) => row.type === 'added').length,
        removed: rows.filter((row) => row.type === 'removed').length,
        changed: rows.filter((row) => row.type === 'changed').length,
        unchanged: rows.filter((row) => row.type === 'unchanged').length,
        rows,
      },
    };
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }
}
