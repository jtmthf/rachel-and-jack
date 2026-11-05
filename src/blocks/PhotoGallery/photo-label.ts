import type { GalleryPhoto, GallerySection } from './sections';

export function photoLabel(
  section: GallerySection,
  photo: GalleryPhoto,
  indexInSection: number,
) {
  const alt = photo.alt ?? section.alt;
  return `${alt}, photo ${indexInSection + 1} of ${section.photos.length}`;
}
