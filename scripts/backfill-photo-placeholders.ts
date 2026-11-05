/**
 * Adds a blur placeholder to every photo that doesn't have one. Reads each photo
 * through the site's image route, so it needs no AWS access, and it can be
 * re-run safely. Pages are prerendered: redeploy afterwards to see the result.
 *
 *   NODE_ENV=production SITE_URL=https://example.com \
 *     pnpm payload run scripts/backfill-photo-placeholders.ts
 */
import { createPlaceholder } from '@/lib/photo-placeholder';
import configPromise from '@payload-config';
import { sql } from '@payloadcms/db-vercel-postgres';
import { getPayload } from 'payload';

const CONCURRENCY = 8;

// Outside production mode, starting Payload pushes the schema to the database,
// which could change the tables of whichever database this is pointed at.
if (process.env.NODE_ENV !== 'production') {
  throw new Error('Set NODE_ENV=production');
}

const site = process.env.SITE_URL;
const imageBucket = process.env.NEXT_PUBLIC_S3_BUCKET;
if (!site || !imageBucket) {
  throw new Error('Set SITE_URL and NEXT_PUBLIC_S3_BUCKET');
}

const payload = await getPayload({ config: configPromise });

const { docs } = await payload.find({
  collection: 'photo',
  where: { placeholder: { exists: false } },
  pagination: false,
  depth: 0,
  select: { filename: true },
  overrideAccess: true,
});
console.log(`${docs.length} photos need a placeholder`);

let done = 0;
let failed = 0;

async function backfill({ id, filename }: (typeof docs)[number]) {
  const params = new URLSearchParams({
    src: `s3://${imageBucket}/${filename}`,
    width: '128',
    quality: '75',
  });
  try {
    const response = await fetch(`${site}/api/image?${params}`, {
      headers: { Accept: 'image/webp' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const placeholder = await createPlaceholder(
      new Uint8Array(await response.arrayBuffer()),
    );
    // Straight to the table, to leave updated_at and the upload hooks alone.
    await payload.db.drizzle.execute(
      sql`UPDATE photo SET placeholder = ${placeholder} WHERE id = ${id}`,
    );
    done++;
  } catch (error) {
    failed++;
    console.error(`Photo ${id}: ${(error as Error).message}`);
  }
  if ((done + failed) % 250 === 0)
    console.log(`${done + failed}/${docs.length}`);
}

const queue = [...docs];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    for (let doc = queue.shift(); doc; doc = queue.shift()) await backfill(doc);
  }),
);

console.log(`${done} added, ${failed} failed`);
process.exit(failed ? 1 : 0);
