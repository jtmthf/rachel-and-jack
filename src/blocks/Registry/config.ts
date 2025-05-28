import type { Block } from 'payload';

export const Registry: Block = {
  slug: 'registry',
  interfaceName: 'RegistryBlock',
  fields: [
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'registry-item',
      hasMany: true,
      admin: {
        appearance: 'drawer',
      },
    },
  ],
};
