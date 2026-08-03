import { FileMergeTool } from '@/components/FileMergeTool';
import { rtfMergeContent } from '@/lib/tools/content/rtf-merge';

export default function RtfMergePage() {
  return <FileMergeTool mode="rtf" content={rtfMergeContent} />;
}
