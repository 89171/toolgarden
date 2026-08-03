import { ImageTargetConverter } from '@/components/ImageTargetConverter';
import { imageToJpgContent } from '@/lib/tools/content/image-to-jpg';

export default function ImageToJpgPage() {
  return <ImageTargetConverter toolId="image-to-jpg" targetFormat="jpg" content={imageToJpgContent} />;
}
