import { CollectionConfig } from 'payload';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';

export const RegistryItem: CollectionConfig = {
  slug: 'registry-item',
  access: {
    read: ({ req }) => {
      // If there is a user logged in,
      // let them retrieve all documents
      if (req.user) return true;

      // If there is no user,
      // restrict the documents that are returned
      // to only those where `_status` is equal to `published`
      // or where `_status` does not exist
      return {
        or: [
          {
            _status: {
              equals: 'published',
            },
          },
          {
            _status: {
              exists: false,
            },
          },
        ],
      };
    },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category'],
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
  versions: {
    drafts: {
      autosave: true,
    },
  },
};
