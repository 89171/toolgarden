import { FileMergeTool } from '@/components/FileMergeTool';
import { pptMergeContent } from '@/lib/tools/content/ppt-merge';

export default function PptMergePage() {
  return <FileMergeTool mode="ppt" content={pptMergeContent} />;
}
