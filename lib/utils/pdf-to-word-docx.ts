import { strToU8, zipSync } from 'fflate';

const DOCX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const EMUS_PER_POINT = 12700;
const TWIPS_PER_POINT = 20;
const DEFAULT_PAGE_MARGIN_POINTS = 36;

export interface PdfWordTextRun {
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
}

export interface PdfWordTextLine {
  kind: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  runs: PdfWordTextRun[];
}

export interface PdfWordImage {
  kind: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  description: string;
}

export interface PdfWordPage {
  width: number;
  height: number;
  lines: PdfWordTextLine[];
  images: PdfWordImage[];
}

interface ImagePart {
  relationshipId: string;
  mediaPath: string;
  image: PdfWordImage;
  drawingId: number;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function toInteger(value: number): number {
  return Math.round(Number.isFinite(value) ? value : 0);
}

function pointsToTwips(value: number): number {
  return Math.max(0, toInteger(value * TWIPS_PER_POINT));
}

function pointsToEmus(value: number): number {
  return Math.max(1, toInteger(value * EMUS_PER_POINT));
}

function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeFontFamily(value: string): string {
  const firstFamily = value.split(',')[0]?.replace(/^['"]|['"]$/g, '').trim();
  return firstFamily || 'Arial';
}

function createTextRun(run: PdfWordTextRun): string {
  const fontFamily = xmlEscape(normalizeFontFamily(run.fontFamily));
  const halfPoints = clamp(toInteger(run.fontSize * 2), 8, 400);
  const runProperties = [
    `<w:rFonts w:ascii="${fontFamily}" w:hAnsi="${fontFamily}" w:eastAsia="${fontFamily}"/>`,
    `<w:sz w:val="${halfPoints}"/>`,
    `<w:szCs w:val="${halfPoints}"/>`,
    run.bold ? '<w:b/><w:bCs/>' : '',
    run.italic ? '<w:i/><w:iCs/>' : '',
  ].join('');

  return `<w:r><w:rPr>${runProperties}</w:rPr><w:t xml:space="preserve">${xmlEscape(run.text)}</w:t></w:r>`;
}

function createTextParagraph(
  line: PdfWordTextLine,
  marginPoints: number,
  spacingBeforePoints: number
): string {
  const indent = pointsToTwips(Math.max(0, line.x - marginPoints));
  const spacingBefore = pointsToTwips(spacingBeforePoints);
  const lineHeight = pointsToTwips(Math.max(line.height * 1.15, 5));

  return `<w:p>
    <w:pPr>
      <w:spacing w:before="${spacingBefore}" w:after="0" w:line="${lineHeight}" w:lineRule="atLeast"/>
      <w:ind w:left="${indent}" w:right="0"/>
      <w:keepLines/>
    </w:pPr>
    ${line.runs.map(createTextRun).join('')}
  </w:p>`;
}

function createImageParagraph(
  part: ImagePart,
  marginPoints: number,
  spacingBeforePoints: number
): string {
  const { image, relationshipId, drawingId } = part;
  const indent = pointsToTwips(Math.max(0, image.x - marginPoints));
  const spacingBefore = pointsToTwips(spacingBeforePoints);
  const width = pointsToEmus(image.width);
  const height = pointsToEmus(image.height);
  const name = `PDF image ${drawingId}`;
  const description = xmlEscape(image.description || name);

  return `<w:p>
    <w:pPr>
      <w:spacing w:before="${spacingBefore}" w:after="0"/>
      <w:ind w:left="${indent}" w:right="0"/>
      <w:keepLines/>
    </w:pPr>
    <w:r>
      <w:drawing>
        <wp:inline distT="0" distB="0" distL="0" distR="0">
          <wp:extent cx="${width}" cy="${height}"/>
          <wp:effectExtent l="0" t="0" r="0" b="0"/>
          <wp:docPr id="${drawingId}" name="${name}" descr="${description}"/>
          <wp:cNvGraphicFramePr>
            <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
          </wp:cNvGraphicFramePr>
          <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:nvPicPr>
                  <pic:cNvPr id="${drawingId}" name="${name}" descr="${description}"/>
                  <pic:cNvPicPr/>
                </pic:nvPicPr>
                <pic:blipFill>
                  <a:blip r:embed="${relationshipId}"/>
                  <a:stretch><a:fillRect/></a:stretch>
                </pic:blipFill>
                <pic:spPr>
                  <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="${width}" cy="${height}"/>
                  </a:xfrm>
                  <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                </pic:spPr>
              </pic:pic>
            </a:graphicData>
          </a:graphic>
        </wp:inline>
      </w:drawing>
    </w:r>
  </w:p>`;
}

function getPageMarginPoints(page: PdfWordPage): number {
  const blocks = [...page.lines, ...page.images];
  if (blocks.length === 0) return DEFAULT_PAGE_MARGIN_POINTS;

  const nearestEdge = Math.min(
    ...blocks.flatMap((block) => [
      block.x,
      block.y,
      page.width - (block.x + block.width),
      page.height - (block.y + block.height),
    ])
  );

  return clamp(nearestEdge, 0, DEFAULT_PAGE_MARGIN_POINTS);
}

function createSectionProperties(page: PdfWordPage, nextPage: boolean): string {
  const pageWidth = pointsToTwips(page.width);
  const pageHeight = pointsToTwips(page.height);
  const orientation = page.width > page.height ? ' w:orient="landscape"' : '';
  const sectionType = nextPage ? '<w:type w:val="nextPage"/>' : '';
  const margin = pointsToTwips(getPageMarginPoints(page));

  return `<w:sectPr>
    ${sectionType}
    <w:pgSz w:w="${pageWidth}" w:h="${pageHeight}"${orientation}/>
    <w:pgMar w:top="${margin}" w:right="${margin}" w:bottom="${margin}" w:left="${margin}" w:header="0" w:footer="0" w:gutter="0"/>
  </w:sectPr>`;
}

function createSectionBreak(page: PdfWordPage): string {
  return `<w:p><w:pPr>${createSectionProperties(page, true)}</w:pPr></w:p>`;
}

function createPageXml(page: PdfWordPage, imageParts: ImagePart[]): string {
  const marginPoints = getPageMarginPoints(page);
  const imagePartByImage = new Map(imageParts.map((part) => [part.image, part]));
  const blocks = [...page.lines, ...page.images].sort((a, b) => {
    const yDifference = a.y - b.y;
    if (Math.abs(yDifference) > 1) return yDifference;
    return a.x - b.x;
  });

  let previousBottom = marginPoints;

  return blocks
    .map((block) => {
      const spacingBefore = clamp(block.y - previousBottom, 0, page.height);
      previousBottom = Math.max(previousBottom, block.y + block.height);

      if (block.kind === 'text') {
        return createTextParagraph(block, marginPoints, spacingBefore);
      }

      const part = imagePartByImage.get(block);
      return part ? createImageParagraph(part, marginPoints, spacingBefore) : '';
    })
    .join('');
}

function buildDocumentXml(pages: PdfWordPage[], imageParts: ImagePart[]): string {
  const body = pages
    .map((page, pageIndex) => {
      const pageImageParts = imageParts.filter((part) => page.images.includes(part.image));
      const sectionBreak = pageIndex < pages.length - 1 ? createSectionBreak(page) : '';
      return `${createPageXml(page, pageImageParts)}${sectionBreak}`;
    })
    .join('');
  const lastPage = pages[pages.length - 1];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${body}
    ${createSectionProperties(lastPage, false)}
  </w:body>
</w:document>`;
}

function buildDocumentRelationships(imageParts: ImagePart[]): string {
  const imageRelationships = imageParts
    .map(
      (part) =>
        `<Relationship Id="${part.relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${part.mediaPath.replace(/^word\//, '')}"/>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  ${imageRelationships}
</Relationships>`;
}

function createImageParts(pages: PdfWordPage[]): ImagePart[] {
  let imageIndex = 0;

  return pages.flatMap((page) =>
    page.images.map((image) => {
      imageIndex += 1;
      return {
        relationshipId: `rIdImage${imageIndex}`,
        mediaPath: `word/media/image${imageIndex}.png`,
        image,
        drawingId: imageIndex,
      };
    })
  );
}

export function createPdfToWordDocxBlob(pages: PdfWordPage[]): Blob {
  if (pages.length === 0) {
    throw new Error('At least one page is required to create a DOCX file.');
  }

  const imageParts = createImageParts(pages);
  const timestamp = new Date().toISOString();
  const entries: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`),
    'docProps/core.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>PDF to Word conversion</dc:title>
  <dc:creator>Toolgarden</dc:creator>
  <cp:lastModifiedBy>Toolgarden</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:modified>
</cp:coreProperties>`),
    'docProps/app.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Toolgarden</Application>
</Properties>`),
    'word/styles.xml': strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>
    <w:pPrDefault><w:pPr><w:spacing w:after="0"/></w:pPr></w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
</w:styles>`),
    'word/document.xml': strToU8(buildDocumentXml(pages, imageParts)),
    'word/_rels/document.xml.rels': strToU8(buildDocumentRelationships(imageParts)),
  };

  for (const part of imageParts) {
    entries[part.mediaPath] = part.image.data;
  }

  const zipped = zipSync(entries, { level: 6 });
  const data = zipped.buffer.slice(
    zipped.byteOffset,
    zipped.byteOffset + zipped.byteLength
  ) as ArrayBuffer;
  return new Blob([data], { type: DOCX_MIME_TYPE });
}
