import { FileMergeTool } from '@/components/FileMergeTool';
import { txtMergeContent } from '@/lib/tools/content/txt-merge';

export default function TxtMergePage() {
  return <FileMergeTool mode="text" content={txtMergeContent} />;
}
