import type { ZipEntryInput } from './zip';

/**
 * 批量处理中单个产物的统一描述。
 * url 用于逐个下载与预览，blob 用于打包 ZIP，两者指向同一份数据。
 */
export interface BatchOutput {
  id: string;
  filename: string;
  url: string;
  blob: Blob;
  size: number;
}

/** 从源文件名生成带后缀的输出名，避免批量产物互相覆盖。 */
export function createBatchFilename(sourceName: string, suffix: string, extension: string): string {
  const base = sourceName.replace(/\.[^./\\]+$/, '') || 'file';
  const safeSuffix = suffix ? `-${suffix}` : '';
  const ext = extension.replace(/^\./, '') || 'bin';
  return `${base}${safeSuffix}.${ext}`;
}

/** 把批量产物转成 ZIP 条目，重名时自动追加序号。 */
export function toZipEntries(outputs: BatchOutput[]): ZipEntryInput[] {
  const used = new Set<string>();

  return outputs.map((output) => {
    let filename = output.filename;
    if (used.has(filename)) {
      const dot = filename.lastIndexOf('.');
      const base = dot > 0 ? filename.slice(0, dot) : filename;
      const ext = dot > 0 ? filename.slice(dot) : '';
      let index = 2;
      while (used.has(`${base}-${index}${ext}`)) index += 1;
      filename = `${base}-${index}${ext}`;
    }
    used.add(filename);
    return { filename, blob: output.blob };
  });
}

/** 生成稳定的批量条目 id，纯函数、无随机源。 */
export function createBatchId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}
