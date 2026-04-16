'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { Photo } from '@/payload-types';
import { Masonry, RenderComponentProps } from 'masonic';
import Image, { ImageLoaderProps } from 'next/image';
import { useState } from 'react';

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <>
      <Masonry
        items={photos}
        columnGutter={8}
        columnWidth={172}
        overscanBy={5}
        render={(props) => <PhotoItem {...props} onSelect={setSelected} />}
      />
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-5xl overflow-hidden border-none bg-black p-0 shadow-2xl">
          <DialogTitle className="sr-only">{selected?.alt}</DialogTitle>
          {selected && (
            <div
              className="bg-black/60"
              style={{
                aspectRatio: `${selected.width ?? 3} / ${selected.height ?? 2}`,
              }}
            >
              <Image
                loader={imageLoader}
                src={`s3://${process.env.NEXT_PUBLIC_S3_BUCKET}/${selected.filename}`}
                alt={selected.alt}
                width={selected.width ?? 1200}
                height={selected.height ?? 800}
                sizes="(max-width: 768px) 100vw, 80vw"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type PhotoItemProps = RenderComponentProps<Photo> & {
  onSelect: (photo: Photo) => void;
};

function PhotoItem({ data: photo, onSelect }: PhotoItemProps) {
  return (
    <button
      onClick={() => onSelect(photo)}
      className="focus-visible:ring-ring block w-full cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
      aria-label={`View photo: ${photo.alt}`}
    >
      <Image
        loader={imageLoader}
        src={`s3://${process.env.NEXT_PUBLIC_S3_BUCKET}/${photo.filename}`}
        alt={photo.alt}
        width={photo.width ?? 172}
        height={photo.height ?? 172}
        sizes="172px"
        style={{ width: '100%', height: 'auto' }}
      />
    </button>
  );
}

const imageLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const params = new URLSearchParams({
    src,
    width: String(width),
    quality: String(quality || 75),
  });
  return `/api/image?${params.toString()}`;
};
