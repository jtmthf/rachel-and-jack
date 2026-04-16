import type { Block } from 'payload';

export const PhotoGallery: Block = {
  slug: 'photo-gallery',
  interfaceName: 'PhotoGalleryBlock',
  fields: [
    {
      name: 'folder',
      type: 'text',
      required: true,
      admin: {
        description: 'Top-level folder name (e.g. "Engagement", "Wedding")',
      },
    },
  ],
};
