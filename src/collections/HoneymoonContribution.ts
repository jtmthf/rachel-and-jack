import { CollectionConfig } from 'payload';

export const HoneymoonContribution: CollectionConfig = {
  slug: 'honeymoon-contributions',
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'amount', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
    },
    {
      name: 'stripePaymentIntentId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
  ],
  timestamps: true,
};
