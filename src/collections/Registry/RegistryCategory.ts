import { CollectionConfig } from 'payload';

export const RegistryCategory: CollectionConfig = {
  slug: 'registry-category',
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
