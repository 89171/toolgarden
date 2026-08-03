import { ImageTargetConverter } from '@/components/ImageTargetConverter';
import { imageToAvifContent } from '@/lib/tools/content/image-to-avif';

export default function ImageToAvifPage() {
  return <ImageTargetConverter toolId="image-to-avif" targetFormat="avif" content={imageToAvifContent} />;
}
