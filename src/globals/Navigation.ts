import type { GlobalConfig } from 'payload';

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          admin: {
            description: 'Leave blank if this item opens a dropdown',
          },
        },
        {
          name: 'children',
          type: 'array',
          admin: {
            description:
              'Sub-links shown in a dropdown (desktop) or nested list (mobile)',
          },
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
};
