import { cn } from '@/lib/utils';
import type { ContentBlock as ContentBlockProps } from '@/payload-types';
import { RichText } from '@payloadcms/richtext-lexical/react';

export default function ContentBlock({ columns }: ContentBlockProps) {
  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12">
        {columns &&
          columns.length > 0 &&
          columns.map((col) => {
            const { richText, size } = col;

            return (
              <div
                className={cn('col-span-4', {
                  'md:col-span-2': size !== 'full',
                  'lg:col-span-4': size === 'oneThird',
                  'lg:col-span-6': size === 'half',
                  'lg:col-span-8': size === 'twoThirds',
                  'lg:col-span-12': size === 'full',
                })}
                key={col.id}
              >
                {richText && <RichText data={richText} />}
              </div>
            );
          })}
      </div>
    </div>
  );
}
