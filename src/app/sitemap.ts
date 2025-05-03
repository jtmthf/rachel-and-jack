import { SITE_ORIGIN } from '@/lib/contants';
import configPromise from '@payload-config';
import { MetadataRoute } from 'next';
import { getPayload } from 'payload';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise });
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  return [
    {
      url: SITE_ORIGIN,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_ORIGIN}/our-story`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...pages.docs.map(
      (page) =>
        ({
          url: `${SITE_ORIGIN}/${page.slug}`,
          lastModified: new Date(page.updatedAt),
          changeFrequency: 'daily',
          priority: 0.8,
        }) satisfies MetadataRoute.Sitemap[number],
    ),
  ];
}
