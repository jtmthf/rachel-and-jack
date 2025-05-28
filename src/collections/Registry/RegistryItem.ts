import { CollectionConfig } from 'payload';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';

export const RegistryItem: CollectionConfig = {
  slug: 'registry-item',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['image', 'title', 'category'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'registry-category',
      hasMany: true,
    },
    {
      name: 'store',
      type: 'relationship',
      relationTo: 'registry-store',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      validate: (value: any) => Boolean(URL.parse(value)) || 'Invalid URL',
      required: true,
    },
    {
      name: 'quantityRequested',
      type: 'number',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'registryPurchases',
      type: 'join',
      collection: 'registry-purchase',
      on: 'registryItem',
    },
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
};
