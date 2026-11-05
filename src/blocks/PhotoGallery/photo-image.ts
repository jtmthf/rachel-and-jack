import { getImageProps, type ImageLoaderProps } from 'next/image';
import { thumbHashToAverageRGBA, thumbHashToDataURL } from 'thumbhash';
import type { GalleryPhoto } from './sections';

export const FULL_PHOTO_QUALITY = 80;

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

/** Props for the lightbox's photo. Preloads must use them too, to match its URL. */
export function fullPhotoImage(photo: GalleryPhoto) {
  const aspect = photo.width / photo.height;
  return {
    loader: imageLoader,
    src: photoSrc(photo),
    fill: true,
    quality: FULL_PHOTO_QUALITY,
    sizes: `min(100vw, ${aspect.toFixed(3)} * 100vh)`,
  };
}

const preloads = new Map<number, HTMLImageElement>();

/** Starts fetching the lightbox's file for a photo someone is about to open. */
export function preloadFullPhoto(photo: GalleryPhoto) {
  if (preloads.has(photo.id)) return;
  const { props } = getImageProps({ ...fullPhotoImage(photo), alt: '' });
  const image = new Image();
  // Sizes first: a browser may pick a file as soon as srcset is set.
  image.sizes = props.sizes ?? '';
  image.srcset = props.srcSet ?? '';
  image.src = props.src;
  // Held so the request isn't dropped along with the element.
  preloads.set(photo.id, image);
}

function hashBytes(hash: string) {
  return Uint8Array.from(atob(hash), (char) => char.charCodeAt(0));
}

/** A blurred version of the photo, as a CSS background. */
export function placeholderImage(hash: string | undefined) {
  return hash ? `url("${thumbHashToDataURL(hashBytes(hash))}")` : undefined;
}

/**
 * The photo's average colour. For the server's HTML, where the blur would add
 * about 2KB per photo ahead of the photos themselves.
 */
export function placeholderColor(hash: string | undefined) {
  if (!hash) return undefined;
  const { r, g, b } = thumbHashToAverageRGBA(hashBytes(hash));
  const channel = (value: number) => Math.round(value * 255);
  return `rgb(${channel(r)} ${channel(g)} ${channel(b)})`;
}
