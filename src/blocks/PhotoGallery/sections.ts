export type GalleryPhoto = {
  id: number;
  filename: string;
  width: number;
  height: number;
  /** Left out when it matches the section's alt, to keep the page small. */
  alt?: string;
};

export type GallerySection = {
  /** Unique within the gallery. Used as the URL hash for this section. */
  slug: string;
  name: string | null;
  alt: string;
  photos: GalleryPhoto[];
};

type FolderRecord = { id: number; name: string | null };

type PhotoRecord = {
  id: number;
  alt: string;
  filename?: string | null;
  width?: number | null;
  height?: number | null;
  folder?: number | { id: number } | null;
};

// The usual shape of a camera photo, for records missing their dimensions.
const FALLBACK_WIDTH = 3;
const FALLBACK_HEIGHT = 2;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Groups photos under their folders, keeping the order of both lists. Folders
 * without photos are left out, as are photos with no file to show.
 */
export function buildSections(
  folders: FolderRecord[],
  photos: PhotoRecord[],
): GallerySection[] {
  const byFolder = new Map<number, PhotoRecord[]>();
  for (const photo of photos) {
    const folderId =
      typeof photo.folder === 'object' ? photo.folder?.id : photo.folder;
    if (folderId == null || !photo.filename) continue;
    const group = byFolder.get(folderId);
    if (group) group.push(photo);
    else byFolder.set(folderId, [photo]);
  }

  const usedSlugs = new Set<string>();
  const sections: GallerySection[] = [];

  for (const folder of folders) {
    const group = byFolder.get(folder.id);
    if (!group) continue;

    const base = slugify(folder.name ?? '') || 'photos';
    let slug = base;
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${base}-${n}`;
    usedSlugs.add(slug);

    const alt = group[0].alt;
    sections.push({
      slug,
      name: folder.name,
      alt,
      photos: group.map((photo) => ({
        id: photo.id,
        filename: photo.filename!,
        width: photo.width || FALLBACK_WIDTH,
        height: photo.height || FALLBACK_HEIGHT,
        ...(photo.alt === alt ? {} : { alt: photo.alt }),
      })),
    });
  }

  return sections;
}
