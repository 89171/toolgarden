import { FileMergeTool } from '@/components/FileMergeTool';
import { imageMergeContent } from '@/lib/tools/content/image-merge';

export default function ImageMergePage() {
  return <FileMergeTool mode="images" content={imageMergeContent} />;
}
