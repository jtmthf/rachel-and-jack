import RichText from '@/components/rich-text';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ContentBlock as ContentBlockProps } from '@/payload-types';
import { Fragment } from 'react';

export default function ContentBlock({
  columns,
  separator,
}: ContentBlockProps) {
  return (
    <div className="container my-16">
      <div className="flex flex-wrap gap-x-16 gap-y-8 md:flex-nowrap">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { richText, size } = col;

            return (
              <Fragment key={col.id}>
                <div
                  className={cn('flex-auto', {
                    'md:basis-1/2': size !== 'full',
                    'lg:basis-1/3': size === 'oneThird',
                    'lg:basis-1/2': size === 'half',
                    'lg:basis-2/3': size === 'twoThirds',
                    'lg:basis-full': size === 'full',
                  })}
                >
                  {richText && <RichText enableGutter={true} data={richText} />}
                </div>
                {separator && index < columns.length - 1 && (
                  <Separator
                    className="hidden h-auto md:block"
                    orientation="vertical"
                  />
                )}
              </Fragment>
            );
          })}
      </div>
    </div>
  );
}
