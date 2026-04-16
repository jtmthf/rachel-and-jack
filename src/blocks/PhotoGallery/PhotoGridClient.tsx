'use client';

import type { Photo } from '@/payload-types';
import dynamic from 'next/dynamic';

const PhotoGrid = dynamic(
  () => import('./PhotoGrid').then((m) => m.PhotoGrid),
  {
    ssr: false,
  },
);

export function PhotoGridClient({ photos }: { photos: Photo[] }) {
  return <PhotoGrid photos={photos} />;
}
