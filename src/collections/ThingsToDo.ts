import type { ThingsToDo as ThingsToDoProps } from '@/payload-types';
import { revalidatePath } from 'next/cache';
import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionConfig,
} from 'payload';

const revalidateChange: CollectionAfterChangeHook<ThingsToDoProps> = ({
  doc,
}) => {
  revalidatePath('/things-to-do');

  doc.category?.forEach((category) => {
    if (typeof category === 'object') {
      revalidatePath(`/things-to-do/${category.slug}`);
    }
  });

  return doc;
};

const revalidateDelete: CollectionAfterDeleteHook<ThingsToDoProps> = ({
  doc,
}) => {
  revalidatePath('/things-to-do');

  doc.category?.forEach((category) => {
    if (typeof category === 'object') {
      revalidatePath(`/things-to-do/${category.slug}`);
    }
  });

  return doc;
};

export const ThingsToDo: CollectionConfig = {
  slug: 'things-to-do',
  access: {
    read: () => true,
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
      name: 'category',
      type: 'relationship',
      relationTo: 'things-to-do-category',
      hasMany: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
  hooks: {
    afterChange: [revalidateChange],
    afterDelete: [revalidateDelete],
  },
};
