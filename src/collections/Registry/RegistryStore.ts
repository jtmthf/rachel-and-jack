import { CollectionConfig } from 'payload';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';

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
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
};
