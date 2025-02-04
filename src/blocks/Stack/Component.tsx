import { cn } from '@/lib/utils';
import type { StackBlock as StackBlockProps } from '@/payload-types';
import RenderBlock, { BaseBlockProps } from '../RenderBlocks';

type Props = BaseBlockProps & StackBlockProps;

export default function StackBlock({ slug, direction, wrap, items }: Props) {
  return (
    <div
      className={cn('flex gap-6', {
        'flex-col': direction === 'vertical',
        'flex-row': direction === 'horizontal',
        'flex-wrap': wrap,
      })}
    >
      <RenderBlock slug={slug} blocks={items} />
    </div>
  );
}
