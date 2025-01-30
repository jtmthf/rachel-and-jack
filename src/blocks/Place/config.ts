import { Block } from 'payload';

export const Place: Block = {
  slug: 'place',
  interfaceName: 'PlaceBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'place-tag',
      hasMany: true,
    },
    {
      name: 'url',
      type: 'text',
    },
    {
      name: 'location',
      type: 'text',
    },
  ],
};
