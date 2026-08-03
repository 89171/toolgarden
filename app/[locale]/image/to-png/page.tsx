import { ImageTargetConverter } from '@/components/ImageTargetConverter';
import { imageToPngContent } from '@/lib/tools/content/image-to-png';

export default function ImageToPngPage() {
  return <ImageTargetConverter toolId="image-to-png" targetFormat="png" content={imageToPngContent} />;
}
