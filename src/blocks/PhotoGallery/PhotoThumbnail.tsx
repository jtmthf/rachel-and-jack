import Image from 'next/image';
import type { CSSProperties } from 'react';
import { imageLoader, photoSrc, thumbnailSizes } from './photo-image';
import type { GalleryPhoto } from './sections';

type Props = {
  photo: GalleryPhoto;
  photoIndex: number;
  label: string;
  /** Load straight away, for photos that are likely above the fold. */
  eager?: boolean;
  /** Show only the placeholder for now. */
  deferred?: boolean;
  className?: string;
  style?: CSSProperties;
  onOpen?: (photoIndex: number) => void;
};

export function PhotoThumbnail({
  photo,
  photoIndex,
  label,
  eager,
  deferred,
  className = '',
  style,
  onOpen,
}: Props) {
  return (
    <button
      type="button"
      data-photo-index={photoIndex}
      aria-label={label}
      onClick={() => onOpen?.(photoIndex)}
      className={`bg-foreground/10 block cursor-zoom-in overflow-hidden transition-[filter] hover:brightness-110 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${className}`}
      style={style}
    >
      {!deferred && (
        <Image
          loader={imageLoader}
          src={photoSrc(photo)}
          alt=""
          width={photo.width}
          height={photo.height}
          sizes={thumbnailSizes(photo)}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          draggable={false}
          className="size-full object-cover"
        />
      )}
    </button>
  );
}
