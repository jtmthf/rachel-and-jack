import { CollectionConfig } from 'payload';
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage';

export const RegistryPurchase: CollectionConfig = {
  slug: 'registry-purchase',
  access: {
    read: () => true,
    create: () => true,
  },
  admin: {
    defaultColumns: ['quantity', 'purchaserFirstName', 'purchaserLastName'],
  },
  fields: [
    {
      name: 'registryItem',
      type: 'relationship',
      relationTo: 'registry-item',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'purchasedAt',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Online',
          value: 'online',
        },
        {
          label: 'In Store',
          value: 'in-store',
        },
      ],
    },
    {
      name: 'orderNumber',
      type: 'text',
    },
    {
      type: 'text',
      name: 'purchaserName',
      required: true,
    },
    {
      name: 'purchaserEmail',
      type: 'email',
      required: true,
    },
  ],
  timestamps: true,
  hooks: {
    afterChange: [revalidatePage],
    afterDelete: [revalidateDelete],
  },
};
