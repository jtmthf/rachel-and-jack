import { CollectionConfig } from 'payload';

export const ThingsToDoCategory: CollectionConfig = {
  slug: 'things-to-do-category',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'label',
    hidden: true,
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
    },
  ],
};
