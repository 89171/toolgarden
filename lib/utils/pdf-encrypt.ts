import { PDFDocument as CantooPDF } from '@cantoo/pdf-lib';

export interface EncryptOptions {
  userPassword: string;
  ownerPassword?: string;
  permissions: {
    printing: boolean;
    copying: boolean;
    modifying: boolean;
    annotating: boolean;
  };
}

export async function encryptPdf(file: File, options: EncryptOptions): Promise<Blob | null> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await CantooPDF.load(bytes);
  pdfDoc.encrypt({
    userPassword: options.userPassword,
    ownerPassword: options.ownerPassword || options.userPassword,
    permissions: {
      printing: options.permissions.printing ? 'highResolution' : false,
      copying: options.permissions.copying,
      modifying: options.permissions.modifying,
      annotating: options.permissions.annotating,
    },
  });
  const output = await pdfDoc.save();
  return new Blob([output as BlobPart], { type: 'application/pdf' });
}

export type DecryptOutcome =
  | { ok: true; blob: Blob }
  | { ok: false; message: 'wrong_password' | 'failed' };

export async function decryptPdf(file: File, password: string): Promise<DecryptOutcome> {
  const bytes = await file.arrayBuffer();
  try {
    const pdfDoc = await CantooPDF.load(bytes, { password, ignoreEncryption: false });
    const output = await pdfDoc.save();
    return { ok: true, blob: new Blob([output as BlobPart], { type: 'application/pdf' }) };
  } catch {
    try {
      const pdfDoc = await CantooPDF.load(bytes, { ignoreEncryption: true });
      const output = await pdfDoc.save();
      return { ok: true, blob: new Blob([output as BlobPart], { type: 'application/pdf' }) };
    } catch {
      return { ok: false, message: 'wrong_password' };
    }
  }
}
