import { FileMergeTool } from '@/components/FileMergeTool';
import { markdownMergeContent } from '@/lib/tools/content/markdown-merge';

export default function MarkdownMergePage() {
  return <FileMergeTool mode="markdown" content={markdownMergeContent} />;
}
