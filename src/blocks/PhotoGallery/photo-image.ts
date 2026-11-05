import type { ImageLoaderProps } from 'next/image';
import type { GalleryPhoto } from './sections';

export const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const params = new URLSearchParams({
    src,
    width: String(width),
    quality: String(quality || 75),
  });
  return `/api/image?${params.toString()}`;
};

export function photoSrc(photo: GalleryPhoto) {
  return `s3://${process.env.NEXT_PUBLIC_S3_BUCKET}/${photo.filename}`;
}

/**
 * A `sizes` value based only on the photo's shape, so the server-rendered
 * preview and the virtualized grid choose the same file and the browser doesn't
 * fetch a visible photo twice. Allows for rows stretching past their target.
 */
export function thumbnailSizes(photo: GalleryPhoto) {
  const aspect = photo.width / photo.height;
  const at = (rowHeight: number) => Math.ceil(aspect * rowHeight * 1.25);
  return `(min-width: 1100px) ${at(260)}px, (min-width: 640px) ${at(200)}px, ${at(100)}px`;
}
