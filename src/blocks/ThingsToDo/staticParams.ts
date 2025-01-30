import { ThingsToDoBlock as ThingsToDoBlockProps } from '@/payload-types';

export function staticParams(
  slug: string,
  { categories: rawCategories }: ThingsToDoBlockProps,
) {
  const categories =
    rawCategories?.filter((category) => typeof category === 'object') ?? [];

  return categories.map((category) => ({
    slug: [slug, category.slug],
  }));
}
