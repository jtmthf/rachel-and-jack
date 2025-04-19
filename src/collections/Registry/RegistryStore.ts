import { CollectionConfig } from 'payload';

export const RegistryStore: CollectionConfig = {
  slug: 'registry-store',
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
