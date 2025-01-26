import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import configPromise from '@payload-config';
import { draftMode } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { getPayload } from 'payload';
import { cache } from 'react';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });

  const categories = await payload.find({
    collection: 'things-to-do-category',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  });

  const params = categories.docs.map((category) => {
    return { category: category.slug };
  });

  return params;
}

type Args = {
  params: Promise<{
    category?: string;
  }>;
};

export default async function ThingsToDo({ params: paramsPromise }: Args) {
  const { category: selectedCategory } = await paramsPromise;
  const [thingsToDo, categories] = await Promise.all([
    getThingsToDo(selectedCategory),
    getCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-4 text-center text-4xl font-bold">
        Things to Do in Nashville
      </h2>
      <p className="mb-8 text-center text-muted-foreground">
        Explore the best of Music City during your wedding visit!
      </p>

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <Button variant={selectedCategory ? 'outline' : 'default'} asChild>
          <Link href="/things-to-do">All</Link>
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
                  ? '/things-to-do'
                  : `/things-to-do/${category.slug}`
              }
            >
              {category.label}
            </Link>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {thingsToDo.map((activity) => (
          <Card key={activity.id} className="flex flex-col">
            <CardHeader>
              {typeof activity.image === 'object' && (
                <Image
                  src={activity.image.url!}
                  alt={activity.title}
                  width={300}
                  height={200}
                  className="h-48 w-full rounded-t-lg object-cover"
                />
              )}
            </CardHeader>
            <CardContent className="flex-1">
              <CardTitle>{activity.title}</CardTitle>
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
                      <Link href={`/things-to-do/${category.slug}`}>
                        {category.label}
                      </Link>
                    </Button>
                  ),
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

const getThingsToDo = cache(async (category?: string) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'things-to-do',
    draft,
    limit: 1000,
    overrideAccess: draft,
    pagination: false,
    where: category ? { 'category.slug': { equals: category } } : {},
  });

  return result.docs;
});

const getCategories = cache(async () => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'things-to-do-category',
    draft,
    limit: 1000,
    overrideAccess: draft,
    pagination: false,
  });

  return result.docs;
});
