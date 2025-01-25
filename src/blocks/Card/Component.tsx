import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CardBlock as CardBlockProps } from '@/payload-types';
import RenderBlock from '../RenderBlocks';

export default function CardBlock({ title, content }: CardBlockProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <RenderBlock blocks={content} />
      </CardContent>
    </Card>
  );
}
