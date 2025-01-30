import type { Block } from 'payload';

export const ThingsToDo: Block = {
  slug: 'things-to-do',
  interfaceName: 'ThingsToDoBlock',
  fields: [
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'things-to-do-category',
      hasMany: true,
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'things-to-do',
      hasMany: true,
    },
  ],
};
