import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CardBlock as CardBlockProps } from '@/payload-types';
import RenderBlock, { BaseBlockProps } from '../RenderBlocks';

type Props = BaseBlockProps & CardBlockProps;

export default function CardBlock({ slug, title, content }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <RenderBlock slug={slug} blocks={content} />
      </CardContent>
    </Card>
  );
}
