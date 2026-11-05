import type { PhotoGalleryBlock as PhotoGalleryBlockProps } from '@/payload-types';
import configPromise from '@payload-config';
import { getPayload } from 'payload';
import type { BaseBlockProps } from '../RenderBlocks';
import { Gallery } from './Gallery';
import { buildSections } from './sections';

type Props = BaseBlockProps & PhotoGalleryBlockProps;

export default async function PhotoGalleryBlock({ folder }: Props) {
  const sections = await getSections(folder);

  if (sections.length === 0) {
    return <p className="text-center">No photos have been added here yet.</p>;
  }

  const photoCount = sections.reduce((n, s) => n + s.photos.length, 0);

  return (
    <>
      <p className="text-foreground/80 text-center">
        {photoCount.toLocaleString('en-US')}{' '}
        {photoCount === 1 ? 'photograph' : 'photographs'}
        {sections.length > 1 && ` in ${sections.length} chapters`}
      </p>
      <Gallery sections={sections} />
    </>
  );
}

// Sections and photos are shown newest record first. To reorder them, change
// their createdAt timestamps.
const NEWEST_FIRST = '-createdAt';

async function getSections(folderName: string) {
  const payload = await getPayload({ config: configPromise });

  const {
    docs: [topFolder],
  } = await payload.find({
    collection: 'payload-folders',
    where: { name: { equals: folderName.toLowerCase() } },
    limit: 1,
    pagination: false,
    depth: 0,
    joins: false,
    select: { name: true },
    overrideAccess: true,
  });

  if (!topFolder) return [];

  const { docs: subFolders } = await payload.find({
    collection: 'payload-folders',
    where: { folder: { equals: topFolder.id } },
    sort: NEWEST_FIRST,
    pagination: false,
    depth: 0,
    joins: false,
    select: { name: true },
    overrideAccess: true,
  });

  // A folder with no subfolders is one untitled section.
  const folders =
    subFolders.length > 0 ? subFolders : [{ id: topFolder.id, name: null }];

  const { docs: photos } = await payload.find({
    collection: 'photo',
    where: { folder: { in: folders.map(({ id }) => id) } },
    sort: NEWEST_FIRST,
    pagination: false,
    depth: 0,
    select: {
      alt: true,
      filename: true,
      width: true,
      height: true,
      folder: true,
    },
    overrideAccess: true,
  });

  return buildSections(folders, photos);
}
