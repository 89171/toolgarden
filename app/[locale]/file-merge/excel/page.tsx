import { FileMergeTool } from '@/components/FileMergeTool';
import { excelMergeContent } from '@/lib/tools/content/excel-merge';

export default function ExcelMergePage() {
  return <FileMergeTool mode="excel" content={excelMergeContent} />;
}
