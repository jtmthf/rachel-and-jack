import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { PlaceBlock as PlaceBlockProps } from '@/payload-types';
import { RichText } from '@payloadcms/richtext-lexical/react';
import Image from 'next/image';
import Link from 'next/link';
import { BaseBlockProps } from '../RenderBlocks';

type Props = BaseBlockProps & PlaceBlockProps;

export default function PlaceBlock({
  slug,
  title,
  image,
  description,
  tags: rawTags,
  url,
  location,
}: Props) {
  const [page] = slug;
  const tags = rawTags?.filter((tag) => typeof tag === 'object') ?? [];

  return (
    <Card className="flex max-w-[400px] flex-col gap-6">
      <CardHeader>
        {typeof image === 'object' && image !== null && (
          <Image
            src={image.url!}
            alt={image.alt}
            width={300}
            height={200}
            className="h-48 w-full rounded-t-lg object-cover"
          />
        )}
        <CardTitle className="mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {location && <p>{location}</p>}
        {description && <RichText data={description} />}
        {url && (
          <p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              website
            </a>
          </p>
        )}
      </CardContent>
      <CardFooter>
        {tags.map(
          (tag) =>
            typeof tag === 'object' && (
              <Button key={tag.id} variant="secondary" className="mr-2" asChild>
                <Link href={`/${page}/${tag.slug}`}>{tag.label}</Link>
              </Button>
            ),
        )}
      </CardFooter>
    </Card>
  );
}
