import { Content } from '@/blocks/Content/config';
import { Place } from '@/blocks/Place/config';
import { Stack } from '@/blocks/Stack/config';
import { ThingsToDo } from '@/blocks/ThingsToDo/config';
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
      blocks: [CardBlock, Content, Place, Stack, ThingsToDo],
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
