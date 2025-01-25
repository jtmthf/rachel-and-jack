import { Block, CollectionConfig } from 'payload';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';

const AccordionBlock: Block = {
  slug: 'accordion',
  interfaceName: 'AccordionBlock',
  fields: [
    {
      type: 'array',
      name: 'items',
      fields: [
        {
          type: 'text',
          name: 'title',
        },
        {
          type: 'richText',
          name: 'content',
        },
      ],
    },
  ],
};

const CardBlock: Block = {
  slug: 'card',
  interfaceName: 'CardBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Title',
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [AccordionBlock],
    },
  ],
};

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      index: true,
      label: 'Slug',
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [CardBlock],
    },
  ],
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
};
