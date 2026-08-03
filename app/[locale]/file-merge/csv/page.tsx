import { FileMergeTool } from '@/components/FileMergeTool';
import { csvMergeContent } from '@/lib/tools/content/csv-merge';

export default function CsvMergePage() {
  return <FileMergeTool mode="csv" content={csvMergeContent} />;
}
