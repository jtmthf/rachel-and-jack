import type { CollectionConfig } from 'payload';

export const Photo: CollectionConfig = {
  slug: 'photo',
  folders: true,
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
};
