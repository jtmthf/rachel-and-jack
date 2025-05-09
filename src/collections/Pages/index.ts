import { Content } from '@/blocks/Content/config';
import { Place } from '@/blocks/Place/config';
import { Registry } from '@/blocks/Registry/config';
import { Schedule } from '@/blocks/Schedule/config';
import { Stack } from '@/blocks/Stack/config';
import { ThingsToDo } from '@/blocks/ThingsToDo/config';
import { generatePreviewPath } from '@/lib/generate-preview-path';
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical';
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
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ];
            },
          }),
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
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === 'string' ? data.slug : '',
          collection: 'pages',
          req,
        });

        return path;
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === 'string' ? data.slug : '',
        collection: 'pages',
        req,
      }),
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
      blocks: [
        CardBlock,
        Content,
        Place,
        Registry,
        Schedule,
        Stack,
        ThingsToDo,
      ],
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
