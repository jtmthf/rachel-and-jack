/**
 * Requests each photo's full-size files, so the image route stores them before
 * anyone opens the lightbox. Re-running is cheap: stored files are only read.
 * Each new file uses a second or so of function CPU.
 *
 *   node scripts/warm-images.mjs https://example.com <bucket> [widths] [concurrency]
 *
 * The default widths are what a Retina laptop and a recent iPhone ask for.
 */
const [site, bucket, widths = '2048,1280', concurrency = '8'] =
  process.argv.slice(2);
if (!site || !bucket) {
  console.error(
    'Usage: warm-images.mjs <site> <bucket> [widths] [concurrency]',
  );
  process.exit(2);
}

// A browser that takes both formats: the route picks one by width.
const ACCEPT = 'image/avif,image/webp,*/*';
const QUALITY = '80'; // FULL_PHOTO_QUALITY in photo-image.ts

const response = await fetch(
  `${site}/api/photo?limit=0&pagination=false&depth=0&select[filename]=true`,
);
if (!response.ok) throw new Error(`Listing photos: HTTP ${response.status}`);
const { docs } = await response.json();

const jobs = docs.flatMap(({ filename }) =>
  widths.split(',').map((width) => ({ filename, width })),
);
console.log(`${docs.length} photos, ${jobs.length} files`);

const count = { store: 0, transform: 0, cdn: 0, failed: 0 };
const total = jobs.length;

async function warm({ filename, width }) {
  const params = new URLSearchParams({
    src: `s3://${bucket}/${filename}`,
    width,
    quality: QUALITY,
  });
  try {
    const image = await fetch(`${site}/api/image?${params}`, {
      headers: { Accept: ACCEPT },
    });
    if (!image.ok) throw new Error(`HTTP ${image.status}`);
    await image.arrayBuffer();
    const timing = image.headers.get('server-timing') ?? '';
    if (image.headers.get('x-vercel-cache') === 'HIT') count.cdn++;
    else if (timing.startsWith('store')) count.store++;
    else count.transform++;
  } catch (error) {
    count.failed++;
    console.error(`${filename} at ${width}: ${error.message}`);
  }
}

let finished = 0;
await Promise.all(
  Array.from({ length: Number(concurrency) }, async () => {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      await warm(job);
      if (++finished % 250 === 0) console.log(`${finished}/${total}`, count);
    }
  }),
);

console.log('Done', count);
process.exit(count.failed ? 1 : 0);
