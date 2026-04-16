import { cn } from '@/lib/utils';
import type { PhotoGalleryBlock as PhotoGalleryBlockProps } from '@/payload-types';
import configPromise from '@payload-config';
import { Baskervville_SC } from 'next/font/google';
import { getPayload } from 'payload';
import { cache } from 'react';
import type { BaseBlockProps } from '../RenderBlocks';
import { PhotoGrid } from './PhotoGrid';

const baskerville = Baskervville_SC({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

type Props = BaseBlockProps & PhotoGalleryBlockProps;

export default async function PhotoGalleryBlock({ folder }: Props) {
  const sections = await getFolderSections(folder);

  return (
    <div className="space-y-12">
      {sections.map(({ name, photos }) => (
        <section key={name ?? 'root'}>
          {name && (
            <h3
              className={cn('mb-4 text-center text-4xl', baskerville.className)}
            >
              {name}
            </h3>
          )}
          <PhotoGrid photos={photos} />
        </section>
      ))}
    </div>
  );
}

const getFolderSections = cache(async (folderName: string) => {
  const payload = await getPayload({ config: configPromise });

  const {
    docs: [topFolder],
  } = await payload.find({
    collection: 'payload-folders',
    where: { name: { equals: folderName.toLowerCase() } },
    limit: 1,
    pagination: false,
    overrideAccess: true,
  });

  if (!topFolder) return [];

  const { docs: subFolders } = await payload.find({
    collection: 'payload-folders',
    where: { folder: { equals: topFolder.id } },
    pagination: false,
    overrideAccess: true,
  });

  if (subFolders.length === 0) {
    const photos = await getPhotosForFolder(topFolder.id);
    return [{ name: null, photos }];
  }

  return Promise.all(
    subFolders.map(async ({ id, name }) => ({
      name,
      photos: await getPhotosForFolder(id),
    })),
  );
});

const getPhotosForFolder = cache(async (folderId: number) => {
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'photo',
    where: { folder: { equals: folderId } },
    pagination: false,
    overrideAccess: true,
  });
  return docs;
});
