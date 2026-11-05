import { createPlaceholder } from '@/lib/photo-placeholder';
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
    {
      // A ThumbHash, shown as a blur until the photo loads.
      name: 'placeholder',
      type: 'text',
      admin: { hidden: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!req.file?.data) return data;
        try {
          return {
            ...data,
            placeholder: await createPlaceholder(req.file.data),
          };
        } catch (error) {
          // The photo still works without one. The backfill script can add it.
          req.payload.logger.error({ err: error }, 'No photo placeholder');
          return data;
        }
      },
    ],
  },
  upload: true,
};
