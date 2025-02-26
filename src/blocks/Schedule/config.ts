import { Block } from 'payload';

export const Schedule: Block = {
  slug: 'schedule',
  interfaceName: 'ScheduleBlock',
  fields: [
    {
      name: 'events',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'date',
          type: 'date',
          required: true,
          defaultValue: new Date(2025, 8, 6),
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
          },
        },
        {
          name: 'time',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          required: true,
        },
        {
          name: 'location',
          type: 'text',
          required: true,
        },
        {
          name: 'attire',
          type: 'text',
          required: true,
        },
        {
          name: 'draft',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
};
