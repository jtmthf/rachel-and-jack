import { Block } from 'payload';
import { Content } from '../Content/config';
import { Place } from '../Place/config';

export const Stack: Block = {
  slug: 'stack',
  interfaceName: 'StackBlock',
  fields: [
    {
      name: 'direction',
      type: 'select',
      defaultValue: 'vertical',
      options: [
        {
          label: 'Vertical',
          value: 'vertical',
        },
        {
          label: 'Horizontal',
          value: 'horizontal',
        },
      ],
    },
    {
      name: 'wrap',
      type: 'checkbox',
      defaultValue: false,
      label: 'Wrap Items',
    },
    {
      name: 'items',
      type: 'blocks',
      blocks: [Content, Place],
    },
  ],
};
