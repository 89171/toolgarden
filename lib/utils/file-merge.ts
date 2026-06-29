import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { getImageAcceptValue, inferImageMimeType, supportedImageInputs } from './image';

export type FileMergeMode =
  | 'word'
  | 'ppt'
  | 'text'
  | 'markdown'
  | 'csv'
  | 'rtf'
  | 'excel'
  | 'images';
export type ExcelMergeStrategy = 'single-sheet' | 'multi-sheet';
export type ImageMergeOutput = 'pdf' | 'long-image';

export type FileMergeErrorCode =
  | 'empty_selection'
  | 'unsupported_input'
  | 'legacy_office'
  | 'file_too_large'
  | 'load_failed'
  | 'empty_document'
  | 'render_failed'
  | 'mobi_unsupported'
  | 'empty_excel'
  | 'invalid_excel'
  | 'invalid_word'
  | 'invalid_ppt'
  | 'canvas_context'
  | 'image_load_failed'
  | 'general';

export interface FileMergeError {
  ok: false;
  code: FileMergeErrorCode;
  detail?: string;
  maxSize?: string;
}

export interface FileTypeMergeSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  format: 'docx' | 'pptx' | 'txt' | 'md' | 'csv' | 'rtf';
  outputSize: number;
  durationMs: number;
  sourceCount: number;
  itemCount?: number;
  previewText?: string;
}

export type FileTypeMergeOutcome = FileTypeMergeSuccess | FileMergeError;

export interface ExcelPreviewSheet {
  name: string;
  columns: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
  truncatedRows: boolean;
  truncatedColumns: boolean;
}

export interface ExcelMergeSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  sheetCount: number;
  rowCount: number;
  outputSize: number;
  durationMs: number;
  sourceCount: number;
  strategy: ExcelMergeStrategy;
  previewSheets: ExcelPreviewSheet[];
}

export type ExcelMergeOutcome = ExcelMergeSuccess | FileMergeError;

export interface ImageMergePdfSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  imageCount: number;
  outputSize: number;
  durationMs: number;
  format: 'pdf';
}

export interface ImageMergeLongSuccess {
  ok: true;
  blob: Blob;
  filename: string;
  imageCount: number;
  outputSize: number;
  durationMs: number;
  format: 'png';
  width: number;
  height: number;
}

export type ImageMergeOutcome = ImageMergePdfSuccess | ImageMergeLongSuccess | FileMergeError;

export interface FileMergeItem {
  file: File;
  id: string;
}

type ZipMap = Record<string, Uint8Array>;

interface Relationship {
  id: string;
  type: string;
  target: string;
  targetMode?: string;
}

interface ContentTypes {
  defaults: Map<string, string>;
  overrides: Map<string, string>;
}

const WORD_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PPT_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const CSV_MIME_TYPE = 'text/csv;charset=utf-8';
const RTF_MIME_TYPE = 'application/rtf;charset=utf-8';
const TEXT_MIME_TYPE = 'text/plain;charset=utf-8';
const MARKDOWN_MIME_TYPE = 'text/markdown;charset=utf-8';
const RELS_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const PPT_SLIDE_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide';
const EXCEL_PREVIEW_MAX_ROWS = 100;
const EXCEL_PREVIEW_MAX_COLUMNS = 30;

const fileModeConfig: Record<FileMergeMode, {
  accept: string;
  extensions: string[];
  icon: string;
  outputLabel: string;
}> = {
  word: {
    accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx',
    extensions: ['docx'],
    icon: 'DOC',
    outputLabel: 'DOCX',
  },
  ppt: {
    accept: 'application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx',
    extensions: ['pptx'],
    icon: 'PPT',
    outputLabel: 'PPTX',
  },
  text: {
    accept: 'text/plain,.txt',
    extensions: ['txt'],
    icon: 'TXT',
    outputLabel: 'TXT',
  },
  markdown: {
    accept: 'text/markdown,text/x-markdown,.md,.markdown',
    extensions: ['md', 'markdown'],
    icon: 'MD',
    outputLabel: 'Markdown',
  },
  csv: {
    accept: 'text/csv,application/csv,.csv',
    extensions: ['csv'],
    icon: 'CSV',
    outputLabel: 'CSV',
  },
  rtf: {
    accept: 'application/rtf,text/rtf,.rtf',
    extensions: ['rtf'],
    icon: 'RTF',
    outputLabel: 'RTF',
  },
  excel: {
    accept: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
      '.xlsx',
      '.xls',
      '.csv',
    ].join(','),
    extensions: ['xlsx', 'xls', 'csv'],
    icon: 'XLS',
    outputLabel: 'Excel',
  },
  images: {
    accept: getImageAcceptValue(),
    extensions: [],
    icon: 'IMG',
    outputLabel: 'Image',
  },
};

function createError(code: FileMergeErrorCode, detail?: string, maxSize?: string): FileMergeError {
  return { ok: false, code, detail, maxSize };
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, '') || 'merged';
}

function getExtension(filename: string): string {
  return filename.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '';
}

function hasAllowedExtension(file: File, extensions: string[]): boolean {
  return extensions.includes(getExtension(file.name));
}

function now(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function createTextBlob(content: string, mimeType: string): Blob {
  return new Blob([content], { type: mimeType });
}

function joinPath(...parts: string[]): string {
  const stack: string[] = [];
  parts.join('/').split('/').forEach((part) => {
    if (!part || part === '.') return;
    if (part === '..') {
      stack.pop();
      return;
    }
    stack.push(part);
  });
  return stack.join('/');
}

function dirname(partPath: string): string {
  return partPath.split('/').slice(0, -1).join('/');
}

function resolveRelationshipTarget(partPath: string, target: string): string {
  return target.startsWith('/')
    ? joinPath(target.slice(1))
    : joinPath(dirname(partPath), target);
}

function relativePath(fromPartPath: string, toPartPath: string): string {
  const fromParts = dirname(fromPartPath).split('/').filter(Boolean);
  const toParts = toPartPath.split('/').filter(Boolean);
  let shared = 0;

  while (shared < fromParts.length && shared < toParts.length && fromParts[shared] === toParts[shared]) {
    shared += 1;
  }

  return [
    ...fromParts.slice(shared).map(() => '..'),
    ...toParts.slice(shared),
  ].join('/') || toPartPath;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readZipText(zip: ZipMap, partPath: string): string {
  const entry = zip[partPath];
  return entry ? strFromU8(entry) : '';
}

function writeZipText(zip: ZipMap, partPath: string, value: string) {
  zip[partPath] = strToU8(value);
}

async function readZip(file: File): Promise<ZipMap | null> {
  try {
    return unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    return null;
  }
}

function createZipBlob(zip: ZipMap, mimeType: string): Blob {
  const bytes = zipSync(zip, { level: 6 });
  return new Blob([bytes], { type: mimeType });
}

function parseAttributes(value: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  value.replace(/([\w:.-]+)="([^"]*)"/g, (_, key: string, attrValue: string) => {
    attributes[key] = attrValue;
    return '';
  });
  return attributes;
}

function parseRelationships(xml: string): Relationship[] {
  return [...xml.matchAll(/<Relationship\s+([^>]*?)\/>/g)]
    .map((match) => parseAttributes(match[1]))
    .filter((attributes) => attributes.Id && attributes.Type && attributes.Target)
    .map((attributes) => ({
      id: attributes.Id,
      type: attributes.Type,
      target: attributes.Target,
      targetMode: attributes.TargetMode,
    }));
}

function serializeRelationships(relationships: Relationship[]): string {
  const body = relationships.map((relationship) => {
    const targetMode = relationship.targetMode ? ` TargetMode="${escapeXml(relationship.targetMode)}"` : '';
    return `  <Relationship Id="${escapeXml(relationship.id)}" Type="${escapeXml(relationship.type)}" Target="${escapeXml(relationship.target)}"${targetMode}/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${RELS_NS}">\n${body}\n</Relationships>`;
}

function relsPathForPart(partPath: string): string {
  const directory = dirname(partPath);
  const filename = partPath.split('/').pop() ?? '';
  return directory ? `${directory}/_rels/${filename}.rels` : `_rels/${filename}.rels`;
}

function parseContentTypes(xml: string): ContentTypes {
  const defaults = new Map<string, string>();
  const overrides = new Map<string, string>();

  xml.replace(/<Default\s+([^>]*?)\/>/g, (_, rawAttributes: string) => {
    const attributes = parseAttributes(rawAttributes);
    if (attributes.Extension && attributes.ContentType) {
      defaults.set(attributes.Extension.toLowerCase(), attributes.ContentType);
    }
    return '';
  });

  xml.replace(/<Override\s+([^>]*?)\/>/g, (_, rawAttributes: string) => {
    const attributes = parseAttributes(rawAttributes);
    if (attributes.PartName && attributes.ContentType) {
      overrides.set(attributes.PartName.replace(/^\//, ''), attributes.ContentType);
    }
    return '';
  });

  return { defaults, overrides };
}

function serializeContentTypes(contentTypes: ContentTypes): string {
  const defaults = [...contentTypes.defaults.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([extension, contentType]) => `  <Default Extension="${escapeXml(extension)}" ContentType="${escapeXml(contentType)}"/>`)
    .join('\n');
  const overrides = [...contentTypes.overrides.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([partName, contentType]) => `  <Override PartName="/${escapeXml(partName)}" ContentType="${escapeXml(contentType)}"/>`)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    defaults,
    overrides,
    '</Types>',
  ].filter(Boolean).join('\n');
}

function copyContentType(source: ContentTypes, destination: ContentTypes, sourcePartPath: string, destinationPartPath: string) {
  const override = source.overrides.get(sourcePartPath);
  if (override) {
    destination.overrides.set(destinationPartPath, override);
    return;
  }

  const extension = getExtension(sourcePartPath);
  const defaultType = source.defaults.get(extension);
  if (extension && defaultType && !destination.defaults.has(extension)) {
    destination.defaults.set(extension, defaultType);
  }
}

function uniquePartPath(zip: ZipMap, desiredPath: string, usedPaths: Set<string>): string {
  if (!zip[desiredPath] && !usedPaths.has(desiredPath)) {
    usedPaths.add(desiredPath);
    return desiredPath;
  }

  const extension = desiredPath.match(/(\.[^./]+)$/)?.[1] ?? '';
  const base = extension ? desiredPath.slice(0, -extension.length) : desiredPath;
  let counter = 2;

  while (zip[`${base}-merged-${counter}${extension}`] || usedPaths.has(`${base}-merged-${counter}${extension}`)) {
    counter += 1;
  }

  const candidate = `${base}-merged-${counter}${extension}`;
  usedPaths.add(candidate);
  return candidate;
}

function copyOpenXmlPart(
  sourceZip: ZipMap,
  destinationZip: ZipMap,
  sourcePartPath: string,
  destinationPartPath: string,
  sourceContentTypes: ContentTypes,
  destinationContentTypes: ContentTypes,
  usedPaths: Set<string>,
  copiedParts: Map<string, string>
): string {
  const copied = copiedParts.get(sourcePartPath);
  if (copied) return copied;

  const sourceEntry = sourceZip[sourcePartPath];
  if (!sourceEntry) return destinationPartPath;

  destinationZip[destinationPartPath] = sourceEntry;
  copiedParts.set(sourcePartPath, destinationPartPath);
  usedPaths.add(destinationPartPath);
  copyContentType(sourceContentTypes, destinationContentTypes, sourcePartPath, destinationPartPath);

  const sourceRelsPath = relsPathForPart(sourcePartPath);
  const sourceRels = sourceZip[sourceRelsPath];
  if (!sourceRels) return destinationPartPath;

  const copiedRelationships = parseRelationships(strFromU8(sourceRels)).map((relationship) => {
    if (relationship.targetMode === 'External') return relationship;

    const sourceTargetPartPath = resolveRelationshipTarget(sourcePartPath, relationship.target);
    if (!sourceZip[sourceTargetPartPath]) return relationship;

    const desiredTargetPath = uniquePartPath(destinationZip, sourceTargetPartPath, usedPaths);
    const copiedTargetPath = copyOpenXmlPart(
      sourceZip,
      destinationZip,
      sourceTargetPartPath,
      desiredTargetPath,
      sourceContentTypes,
      destinationContentTypes,
      usedPaths,
      copiedParts
    );

    return {
      ...relationship,
      target: relativePath(destinationPartPath, copiedTargetPath),
    };
  });

  writeZipText(destinationZip, relsPathForPart(destinationPartPath), serializeRelationships(copiedRelationships));
  return destinationPartPath;
}

function getNextRelationshipId(relationships: Relationship[]): string {
  const maxId = relationships.reduce((max, relationship) => {
    const numeric = Number(relationship.id.match(/^rId(\d+)$/)?.[1] ?? 0);
    return Math.max(max, numeric);
  }, 0);

  return `rId${maxId + 1}`;
}

function addRelationship(relationships: Relationship[], relationship: Omit<Relationship, 'id'>): string {
  const nextId = getNextRelationshipId(relationships);
  relationships.push({ ...relationship, id: nextId });
  return nextId;
}

function createUniqueSheetName(baseName: string, usedNames: Set<string>): string {
  const truncated = baseName.slice(0, 31);
  let candidate = truncated || 'Sheet1';
  let counter = 2;

  while (usedNames.has(candidate)) {
    const suffix = `_${counter}`;
    candidate = `${truncated.slice(0, Math.max(0, 31 - suffix.length))}${suffix}`;
    counter += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[:\\/?*\[\]]/g, '_').replace(/\s+/g, ' ').trim() || 'Sheet1';
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image_load_failed'));
    };
    image.decoding = 'async';
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('canvas_context'));
        return;
      }
      resolve(blob);
    }, mimeType, quality);
  });
}

async function readWorkbook(file: File) {
  const XLSX = await import('xlsx');
  const extension = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] ?? '';
  const isCsv = extension === 'csv' || /text\/csv|application\/csv/i.test(file.type);

  return isCsv
    ? XLSX.read(await file.text(), { type: 'string' })
    : XLSX.read(await file.arrayBuffer(), { type: 'array' });
}

async function readSheetRows(file: File) {
  const XLSX = await import('xlsx');
  const workbook = await readWorkbook(file);
  const rows: Array<{ sheetName: string; data: Record<string, unknown>[] }> = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      blankrows: false,
      raw: false,
    });
    rows.push({
      sheetName,
      data,
    });
  }

  return rows;
}

function formatExcelPreviewCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function createExcelPreviewColumns(
  rows: Record<string, unknown>[],
  preferredColumns: string[] = []
): string[] {
  const columns: string[] = [];
  const seen = new Set<string>();

  const addColumn = (column: string) => {
    if (seen.has(column)) return;
    seen.add(column);
    columns.push(column);
  };

  preferredColumns.forEach(addColumn);
  rows.forEach((row) => {
    Object.keys(row).forEach(addColumn);
  });

  return columns;
}

function createExcelPreviewSheet(
  name: string,
  rows: Record<string, unknown>[],
  preferredColumns?: string[]
): ExcelPreviewSheet {
  const columns = createExcelPreviewColumns(rows, preferredColumns);
  const previewColumns = columns.slice(0, EXCEL_PREVIEW_MAX_COLUMNS);
  const previewRows = rows.slice(0, EXCEL_PREVIEW_MAX_ROWS).map((row) => (
    previewColumns.map((column) => formatExcelPreviewCell(row[column]))
  ));

  return {
    name,
    columns: previewColumns,
    rows: previewRows,
    rowCount: rows.length,
    columnCount: columns.length,
    truncatedRows: rows.length > previewRows.length,
    truncatedColumns: columns.length > previewColumns.length,
  };
}

async function mergeExcelToSingleSheet(files: File[]): Promise<ExcelMergeOutcome> {
  const XLSX = await import('xlsx');
  const mergedRows: Record<string, unknown>[] = [];
  const columnOrder = new Set<string>(['source_file', 'source_sheet']);
  let sourceCount = 0;

  for (const file of files) {
    const workbookSheets = await readSheetRows(file);
    workbookSheets.forEach((sheet) => {
      sourceCount += 1;
      sheet.data.forEach((row) => {
        const mergedRow: Record<string, unknown> = {
          source_file: file.name,
          source_sheet: sheet.sheetName,
        };

        Object.entries(row).forEach(([key, value]) => {
          columnOrder.add(key);
          mergedRow[key] = value;
        });

        mergedRows.push(mergedRow);
      });
    });
  }

  if (mergedRows.length === 0) return createError('empty_excel');

  const header = Array.from(columnOrder);
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(mergedRows, { header });
  XLSX.utils.book_append_sheet(workbook, sheet, 'Merged');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return {
    ok: true,
    blob,
    filename: 'merged-workbook.xlsx',
    sheetCount: 1,
    rowCount: mergedRows.length,
    outputSize: blob.size,
    durationMs: 0,
    sourceCount,
    strategy: 'single-sheet',
    previewSheets: [
      createExcelPreviewSheet('Merged', mergedRows, header),
    ],
  };
}

async function mergeExcelToMultiSheet(files: File[]): Promise<ExcelMergeOutcome> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();
  const previewSheets: ExcelPreviewSheet[] = [];
  let outputSheets = 0;
  let rowCount = 0;
  let sourceCount = 0;

  for (const file of files) {
    const workbookSheets = await readSheetRows(file);

    for (const sheet of workbookSheets) {
      sourceCount += 1;
      rowCount += sheet.data.length;
      const baseName = sanitizeSheetName(`${stripExtension(file.name)}-${sheet.sheetName}`);
      const sheetName = createUniqueSheetName(baseName, usedNames);
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, ws, sheetName);
      previewSheets.push(createExcelPreviewSheet(sheetName, sheet.data));
      outputSheets += 1;
    }
  }

  if (outputSheets === 0) return createError('empty_excel');

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return {
    ok: true,
    blob,
    filename: 'merged-sheets.xlsx',
    sheetCount: outputSheets,
    rowCount,
    outputSize: blob.size,
    durationMs: 0,
    sourceCount,
    strategy: 'multi-sheet',
    previewSheets,
  };
}

export function getFileMergeAcceptValue(mode: FileMergeMode): string {
  return fileModeConfig[mode].accept;
}

export function getFileMergeModeIcon(mode: FileMergeMode): string {
  return fileModeConfig[mode].icon;
}

function validateFilesForMode(files: File[], mode: FileMergeMode): FileMergeError | null {
  const config = fileModeConfig[mode];
  if (files.length === 0) return createError('empty_selection');
  if (mode === 'images') return null;

  for (const file of files) {
    const extension = getExtension(file.name);

    if ((mode === 'word' && extension === 'doc') || (mode === 'ppt' && extension === 'ppt')) {
      return createError('legacy_office');
    }

    if (!hasAllowedExtension(file, config.extensions)) {
      return createError('unsupported_input', file.name);
    }
  }

  return null;
}

function createNativeResult(
  blob: Blob,
  filename: string,
  format: FileTypeMergeSuccess['format'],
  sourceCount: number,
  startedAt: number,
  extra?: Partial<Pick<FileTypeMergeSuccess, 'itemCount' | 'previewText'>>
): FileTypeMergeSuccess {
  return {
    ok: true,
    blob,
    filename,
    format,
    sourceCount,
    outputSize: blob.size,
    durationMs: Math.round(now() - startedAt),
    ...extra,
  };
}

function splitWordBody(documentXml: string): { prefix: string; body: string; suffix: string } | null {
  const openBody = documentXml.match(/<w:body[^>]*>/);
  const closeBodyIndex = documentXml.lastIndexOf('</w:body>');

  if (!openBody || openBody.index === undefined || closeBodyIndex < 0) return null;

  const bodyStart = openBody.index + openBody[0].length;
  return {
    prefix: documentXml.slice(0, bodyStart),
    body: documentXml.slice(bodyStart, closeBodyIndex),
    suffix: documentXml.slice(closeBodyIndex),
  };
}

function withoutWordSectionProperties(bodyXml: string): string {
  return bodyXml.replace(/<w:sectPr[\s\S]*?<\/w:sectPr>/g, '').trim();
}

function replaceRelationshipReferences(xml: string, sourceId: string, destinationId: string): string {
  const idPattern = escapeRegExp(sourceId);
  return xml
    .replace(new RegExp(`(r:id|r:embed|r:link|o:relid)="${idPattern}"`, 'g'), `$1="${destinationId}"`)
    .replace(new RegExp(`(r:id|r:embed|r:link|o:relid)='${idPattern}'`, 'g'), `$1='${destinationId}'`);
}

function wordPageBreak(): string {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

async function mergeWordFiles(files: File[]): Promise<FileTypeMergeOutcome> {
  const validationError = validateFilesForMode(files, 'word');
  if (validationError) return validationError;

  const startedAt = now();
  const baseZip = await readZip(files[0]);
  if (!baseZip?.['word/document.xml']) return createError('invalid_word');

  const baseContentTypes = parseContentTypes(readZipText(baseZip, '[Content_Types].xml'));
  const usedPaths = new Set(Object.keys(baseZip));
  const baseRelsPath = 'word/_rels/document.xml.rels';
  const relationships = parseRelationships(readZipText(baseZip, baseRelsPath));
  const baseDocument = splitWordBody(readZipText(baseZip, 'word/document.xml'));
  if (!baseDocument) return createError('invalid_word');

  const bodyParts = [withoutWordSectionProperties(baseDocument.body)];

  for (const file of files.slice(1)) {
    const sourceZip = await readZip(file);
    if (!sourceZip?.['word/document.xml']) return createError('invalid_word');

    const sourceContentTypes = parseContentTypes(readZipText(sourceZip, '[Content_Types].xml'));
    const sourceDocument = splitWordBody(readZipText(sourceZip, 'word/document.xml'));
    if (!sourceDocument) return createError('invalid_word');

    let sourceBody = withoutWordSectionProperties(sourceDocument.body);
    const sourceRelationships = parseRelationships(readZipText(sourceZip, 'word/_rels/document.xml.rels'));
    const copiedParts = new Map<string, string>();

    for (const relationship of sourceRelationships) {
      const nextId = getNextRelationshipId(relationships);
      let target = relationship.target;

      if (relationship.targetMode !== 'External') {
        const sourceTargetPath = resolveRelationshipTarget('word/document.xml', relationship.target);
        if (sourceZip[sourceTargetPath]) {
          const destinationPath = uniquePartPath(baseZip, sourceTargetPath, usedPaths);
          const copiedPath = copyOpenXmlPart(
            sourceZip,
            baseZip,
            sourceTargetPath,
            destinationPath,
            sourceContentTypes,
            baseContentTypes,
            usedPaths,
            copiedParts
          );
          target = relativePath('word/document.xml', copiedPath);
        }
      }

      relationships.push({
        ...relationship,
        id: nextId,
        target,
      });
      sourceBody = replaceRelationshipReferences(sourceBody, relationship.id, nextId);
    }

    bodyParts.push(wordPageBreak(), sourceBody);
  }

  writeZipText(baseZip, 'word/document.xml', `${baseDocument.prefix}${bodyParts.join('')}${baseDocument.suffix}`);
  writeZipText(baseZip, baseRelsPath, serializeRelationships(relationships));
  writeZipText(baseZip, '[Content_Types].xml', serializeContentTypes(baseContentTypes));

  const blob = createZipBlob(baseZip, WORD_MIME_TYPE);
  return createNativeResult(blob, 'merged-word.docx', 'docx', files.length, startedAt, {
    itemCount: files.length,
  });
}

function getPptSlideParts(zip: ZipMap): string[] {
  const presentationXml = readZipText(zip, 'ppt/presentation.xml');
  const relationships = parseRelationships(readZipText(zip, 'ppt/_rels/presentation.xml.rels'));
  const relationshipById = new Map(relationships.map((relationship) => [relationship.id, relationship]));
  const orderedIds = [...presentationXml.matchAll(/<p:sldId\b[^>]*\br:id="([^"]+)"/g)].map((match) => match[1]);
  const orderedSlides = orderedIds
    .map((id) => relationshipById.get(id))
    .filter((relationship): relationship is Relationship => Boolean(relationship && relationship.type === PPT_SLIDE_REL_TYPE))
    .map((relationship) => resolveRelationshipTarget('ppt/presentation.xml', relationship.target))
    .filter((partPath) => Boolean(zip[partPath]));

  if (orderedSlides.length > 0) return orderedSlides;

  return Object.keys(zip)
    .filter((partPath) => /^ppt\/slides\/slide\d+\.xml$/.test(partPath))
    .sort((left, right) => Number(left.match(/slide(\d+)/)?.[1] ?? 0) - Number(right.match(/slide(\d+)/)?.[1] ?? 0));
}

function getMaxSlidePartIndex(zip: ZipMap): number {
  return Object.keys(zip).reduce((max, partPath) => {
    const index = Number(partPath.match(/^ppt\/slides\/slide(\d+)\.xml$/)?.[1] ?? 0);
    return Math.max(max, index);
  }, 0);
}

function getMaxSlideListId(presentationXml: string): number {
  return [...presentationXml.matchAll(/<p:sldId\b[^>]*\bid="(\d+)"/g)].reduce((max, match) => (
    Math.max(max, Number(match[1]))
  ), 255);
}

async function mergePptFiles(files: File[]): Promise<FileTypeMergeOutcome> {
  const validationError = validateFilesForMode(files, 'ppt');
  if (validationError) return validationError;

  const startedAt = now();
  const baseZip = await readZip(files[0]);
  if (!baseZip?.['ppt/presentation.xml']) return createError('invalid_ppt');

  const baseContentTypes = parseContentTypes(readZipText(baseZip, '[Content_Types].xml'));
  const usedPaths = new Set(Object.keys(baseZip));
  const presentationRelsPath = 'ppt/_rels/presentation.xml.rels';
  const presentationRelationships = parseRelationships(readZipText(baseZip, presentationRelsPath));
  let presentationXml = readZipText(baseZip, 'ppt/presentation.xml');
  let nextSlideIndex = getMaxSlidePartIndex(baseZip) + 1;
  let nextSlideListId = getMaxSlideListId(presentationXml) + 1;
  let addedSlides = 0;

  for (const file of files.slice(1)) {
    const sourceZip = await readZip(file);
    if (!sourceZip?.['ppt/presentation.xml']) return createError('invalid_ppt');

    const sourceContentTypes = parseContentTypes(readZipText(sourceZip, '[Content_Types].xml'));
    const copiedParts = new Map<string, string>();

    for (const sourceSlidePart of getPptSlideParts(sourceZip)) {
      const destinationSlidePart = `ppt/slides/slide${nextSlideIndex}.xml`;
      copyOpenXmlPart(
        sourceZip,
        baseZip,
        sourceSlidePart,
        destinationSlidePart,
        sourceContentTypes,
        baseContentTypes,
        usedPaths,
        copiedParts
      );

      const relationshipId = addRelationship(presentationRelationships, {
        type: PPT_SLIDE_REL_TYPE,
        target: relativePath('ppt/presentation.xml', destinationSlidePart),
      });
      const slideEntry = `<p:sldId id="${nextSlideListId}" r:id="${relationshipId}"/>`;
      presentationXml = presentationXml.replace('</p:sldIdLst>', `${slideEntry}</p:sldIdLst>`);
      nextSlideIndex += 1;
      nextSlideListId += 1;
      addedSlides += 1;
    }
  }

  if (files.length > 1 && addedSlides === 0) return createError('empty_document');

  writeZipText(baseZip, 'ppt/presentation.xml', presentationXml);
  writeZipText(baseZip, presentationRelsPath, serializeRelationships(presentationRelationships));
  writeZipText(baseZip, '[Content_Types].xml', serializeContentTypes(baseContentTypes));

  const blob = createZipBlob(baseZip, PPT_MIME_TYPE);
  return createNativeResult(blob, 'merged-presentation.pptx', 'pptx', files.length, startedAt, {
    itemCount: getPptSlideParts(baseZip).length,
  });
}

async function mergePlainTextFiles(
  files: File[],
  mode: 'text' | 'markdown'
): Promise<FileTypeMergeOutcome> {
  const validationError = validateFilesForMode(files, mode);
  if (validationError) return validationError;

  const startedAt = now();
  const sections = await Promise.all(files.map(async (file) => {
    const text = await file.text();
    return mode === 'markdown'
      ? `## ${file.name}\n\n${text.trimEnd()}`
      : `===== ${file.name} =====\n${text.trimEnd()}`;
  }));
  const content = `${sections.join('\n\n')}\n`;
  const format = mode === 'markdown' ? 'md' : 'txt';
  const mimeType = mode === 'markdown' ? MARKDOWN_MIME_TYPE : TEXT_MIME_TYPE;
  const filename = mode === 'markdown' ? 'merged-markdown.md' : 'merged-text.txt';
  const blob = createTextBlob(content, mimeType);

  return createNativeResult(blob, filename, format, files.length, startedAt, {
    itemCount: files.length,
    previewText: mode === 'markdown' ? content : content.slice(0, 4000),
  });
}

async function mergeCsvFiles(files: File[]): Promise<FileTypeMergeOutcome> {
  const validationError = validateFilesForMode(files, 'csv');
  if (validationError) return validationError;

  const startedAt = now();
  const XLSX = await import('xlsx');
  const rows: Record<string, unknown>[] = [];
  const columnOrder = new Set<string>(['source_file']);

  for (const file of files) {
    const workbook = await readWorkbook(file);
    for (const sheetName of workbook.SheetNames) {
      const sheetRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
        defval: '',
        blankrows: false,
        raw: false,
      });

      sheetRows.forEach((row) => {
        const mergedRow: Record<string, unknown> = { source_file: file.name };
        Object.entries(row).forEach(([key, value]) => {
          columnOrder.add(key);
          mergedRow[key] = value;
        });
        rows.push(mergedRow);
      });
    }
  }

  if (rows.length === 0) return createError('empty_excel');

  const sheet = XLSX.utils.json_to_sheet(rows, { header: Array.from(columnOrder) });
  const csv = XLSX.utils.sheet_to_csv(sheet);
  const content = `\uFEFF${csv}`;
  const blob = createTextBlob(content, CSV_MIME_TYPE);

  return createNativeResult(blob, 'merged-csv.csv', 'csv', files.length, startedAt, {
    itemCount: rows.length,
    previewText: content.slice(0, 4000),
  });
}

function decodeRtfHexEscapes(value: string): string {
  return value.replace(/\\'([0-9a-f]{2})/gi, (_, hex: string) => (
    String.fromCharCode(Number.parseInt(hex, 16))
  ));
}

function rtfToPlainText(value: string): string {
  return decodeRtfHexEscapes(value)
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\\[a-z]+-?\d* ?/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeRtfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/\r?\n/g, '\\par\n');
}

async function mergeRtfFiles(files: File[]): Promise<FileTypeMergeOutcome> {
  const validationError = validateFilesForMode(files, 'rtf');
  if (validationError) return validationError;

  const startedAt = now();
  const sections = await Promise.all(files.map(async (file) => {
    const plainText = rtfToPlainText(await file.text());
    return `\\b ${escapeRtfText(file.name)}\\b0\\par\n${escapeRtfText(plainText)}\\par`;
  }));
  const content = `{\\rtf1\\ansi\\deff0\n${sections.join('\\par\n')}\\par\n}`;
  const blob = createTextBlob(content, RTF_MIME_TYPE);

  return createNativeResult(blob, 'merged-rtf.rtf', 'rtf', files.length, startedAt, {
    itemCount: files.length,
    previewText: sections.map((section) => section.replace(/\\[a-z0-9]+ ?/gi, '').replace(/[{}]/g, '')).join('\n\n').slice(0, 4000),
  });
}

export async function mergeFilesByType(
  files: File[],
  mode: Exclude<FileMergeMode, 'excel' | 'images'>
): Promise<FileTypeMergeOutcome> {
  switch (mode) {
    case 'word':
      return mergeWordFiles(files);
    case 'ppt':
      return mergePptFiles(files);
    case 'text':
      return mergePlainTextFiles(files, 'text');
    case 'markdown':
      return mergePlainTextFiles(files, 'markdown');
    case 'csv':
      return mergeCsvFiles(files);
    case 'rtf':
      return mergeRtfFiles(files);
    default:
      return createError('unsupported_input');
  }
}

export async function mergeExcelFiles(
  files: File[],
  strategy: ExcelMergeStrategy
): Promise<ExcelMergeOutcome> {
  if (files.length === 0) return createError('empty_selection');

  const startedAt = typeof performance === 'undefined' ? Date.now() : performance.now();
  const outcome = strategy === 'single-sheet'
    ? await mergeExcelToSingleSheet(files)
    : await mergeExcelToMultiSheet(files);

  if (!outcome.ok) return outcome;

  return {
    ...outcome,
    durationMs: Math.round((typeof performance === 'undefined' ? Date.now() : performance.now()) - startedAt),
  };
}

export async function mergeImageFiles(
  files: File[],
  output: ImageMergeOutput
): Promise<ImageMergeOutcome> {
  if (files.length === 0) return createError('empty_selection');

  const startedAt = typeof performance === 'undefined' ? Date.now() : performance.now();

  if (output === 'pdf') {
    const { convertFileToPdf, mergePdfBlobs } = await import('./pdf-browser');
    const blobs: Blob[] = [];
    for (const file of files) {
      const mimeType = inferImageMimeType(file);
      if (!supportedImageInputs.some((format) => format.mimeType === mimeType)) {
        return createError('unsupported_input', file.type || file.name);
      }

      const converted = await convertFileToPdf(file);
      if (!converted.ok) return createError(converted.code as FileMergeErrorCode, converted.detail, converted.maxSize);
      blobs.push(converted.blob);
    }

    const merged = await mergePdfBlobs(blobs, 'merged-images.pdf', startedAt);
    if (!merged.ok) return createError(merged.code as FileMergeErrorCode, merged.detail, merged.maxSize);

    return {
      ok: true,
      blob: merged.blob,
      filename: 'merged-images.pdf',
      imageCount: files.length,
      outputSize: merged.outputSize,
      durationMs: merged.durationMs,
      format: 'pdf',
    };
  }

  let loaded: Array<{ file: File; image: HTMLImageElement }>;
  try {
    loaded = await Promise.all(files.map(async (file) => ({
      file,
      image: await loadImage(file),
    })));
  } catch (error) {
    return createError(
      error instanceof Error && error.message === 'image_load_failed' ? 'image_load_failed' : 'load_failed'
    );
  }

  const targetWidth = Math.max(
    1,
    Math.min(2400, Math.max(...loaded.map((entry) => entry.image.naturalWidth || 1)))
  );
  const gap = 24;
  const scaled = loaded.map((entry) => {
    const naturalWidth = Math.max(1, entry.image.naturalWidth);
    const scale = targetWidth / naturalWidth;
    return {
      ...entry,
      width: targetWidth,
      height: Math.max(1, Math.round(entry.image.naturalHeight * scale)),
    };
  });

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = scaled.reduce((total, entry, index) => total + entry.height + (index > 0 ? gap : 0), 0);
  const context = canvas.getContext('2d');
  if (!context) return createError('canvas_context');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  let cursorY = 0;
  for (const entry of scaled) {
    context.drawImage(entry.image, 0, cursorY, entry.width, entry.height);
    cursorY += entry.height + gap;
  }

  const blob = await canvasToBlob(canvas, 'image/png');
  return {
    ok: true,
    blob,
    filename: 'merged-long-image.png',
    imageCount: files.length,
    outputSize: blob.size,
    durationMs: Math.round((typeof performance === 'undefined' ? Date.now() : performance.now()) - startedAt),
    format: 'png',
    width: canvas.width,
    height: canvas.height,
  };
}
