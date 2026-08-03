import { ImageIdPhotoTool } from '@/components/ImageIdPhotoTool';
import { imageIdPhotoContent } from '@/lib/tools/content/image-id-photo';

export default function ImageIdPhotoPage() {
  return <ImageIdPhotoTool content={imageIdPhotoContent} />;
}
