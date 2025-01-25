import RenderBlock from '@/blocks/RenderBlocks';
import configPromise from '@payload-config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { cache } from 'react';

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  });

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home';
    })
    .map(({ slug }) => {
      return { slug };
    });

  return params;
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = 'home' } = await paramsPromise;
  const page = await queryPageBySlug({ slug });

  if (!page) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <h2 className="mb-6 text-center text-3xl font-bold">{page.title}</h2>
      <RenderBlock blocks={page.content} />
    </article>
  );
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  });

  return result.docs?.[0] || null;
});
