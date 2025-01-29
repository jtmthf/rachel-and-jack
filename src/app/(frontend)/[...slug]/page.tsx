import RenderBlock from '@/blocks/RenderBlocks';
import { staticParams } from '@/blocks/ThingsToDo/staticParams';
import configPromise from '@payload-config';
import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { cache } from 'react';

const blockParams = {
  ['card']: () => [],
  ['content']: () => [],
  ['things-to-do']: staticParams,
};

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
      content: true,
    },
  });

  const params = pages.docs
    ?.filter(({ slug }) => slug != null)
    .flatMap(({ slug, content }) => {
      return [
        { slug: [slug!] },
        ...(content?.flatMap(
          // @ts-expect-error - We know this is a valid block
          (block) => blockParams[block.blockType]?.(slug, block) ?? [],
        ) ?? []),
      ];
    });

  return params;
}

type Args = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function Page({ params: paramsPromise }: Args) {
  const { slug } = await paramsPromise;
  const page = await queryPageBySlug({ slug: slug[0] });

  if (!page) {
    notFound();
  }

  return (
    <article className="mx-auto w-full max-w-3xl space-y-6 p-4">
      <h2 className="mb-6 text-center text-3xl font-bold">{page.title}</h2>
      <RenderBlock blocks={page.content} slug={slug} />
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
