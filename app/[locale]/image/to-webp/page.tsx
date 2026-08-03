import { ImageTargetConverter } from '@/components/ImageTargetConverter';
import { imageToWebpContent } from '@/lib/tools/content/image-to-webp';

export default function ImageToWebpPage() {
  return <ImageTargetConverter toolId="image-to-webp" targetFormat="webp" content={imageToWebpContent} />;
}
