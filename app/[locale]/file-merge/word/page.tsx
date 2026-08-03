import { FileMergeTool } from '@/components/FileMergeTool';
import { wordMergeContent } from '@/lib/tools/content/word-merge';

export default function WordMergePage() {
  return <FileMergeTool mode="word" content={wordMergeContent} />;
}
