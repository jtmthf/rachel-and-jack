import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  ThingsToDo,
  ThingsToDoBlock as ThingsToDoBlockProps,
} from '@/payload-types';
import Image from 'next/image';
import Link from 'next/link';
import { BaseBlockProps } from '../RenderBlocks';

type Props = BaseBlockProps & ThingsToDoBlockProps;

export default function ThingsToDoBlock({
  slug,
  categories: rawCategories,
  items: rawItems,
}: Props) {
  const [page, selectedCategory] = slug;
  const categories =
    rawCategories?.filter((category) => typeof category === 'object') ?? [];
  const items =
    (rawItems?.filter(
      (item) =>
        typeof item === 'object' &&
        (selectedCategory === undefined ||
          item.category?.some(
            (category) =>
              typeof category === 'object' &&
              category.slug === selectedCategory,
          )),
    ) as ThingsToDo[]) ?? [];

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <Button variant={selectedCategory ? 'outline' : 'default'} asChild>
          <Link href={`/${page}`}>All</Link>
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={category.slug === selectedCategory ? 'default' : 'outline'}
            asChild
          >
            <Link
              href={
                selectedCategory === category.slug
                  ? `/${page}`
                  : `/${page}/${category.slug}`
              }
            >
              {category.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((activity) => (
          <Card key={activity.id} className="flex flex-col">
            <CardHeader>
              {typeof activity.image === 'object' && (
                <Image
                  src={activity.image.url!}
                  alt={activity.title}
                  width={300}
                  height={200}
                  className="h-48 w-full object-cover"
                />
              )}
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle className="mb-2">{activity.title}</CardTitle>
              <CardDescription>{activity.description}</CardDescription>
            </CardContent>
            <CardFooter>
              {activity.category?.map(
                (category) =>
                  typeof category === 'object' && (
                    <Button
                      key={category.id}
                      variant="secondary"
                      className="mr-2"
                      asChild
                    >
                      <Link href={`/${page}/${category.slug}`}>
                        {category.label}
                      </Link>
                    </Button>
                  ),
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
