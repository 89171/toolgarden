import { createSocialImage } from './opengraph-image';

export { alt, contentType, size } from './opengraph-image';
export const dynamic = 'force-static';

export default function TwitterImage() {
  return createSocialImage();
}
