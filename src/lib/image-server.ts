import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { waitUntil } from '@vercel/functions';
import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';
import { Hono } from 'hono';
import sharp from 'sharp';
import { resolveImageSource, type RemotePattern } from './image-source';

export const app = new Hono().basePath('/api/image');

// Built on first use, because the constructor throws when AWS_REGION is empty
// and the route must still load on a site that doesn't use S3.
let s3Client: S3Client | undefined;
function getS3Client() {
  s3Client ??= new S3Client({
    region: process.env.AWS_REGION!,
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN!,
    }),
  });
  return s3Client;
}

// Configuration
// Hosts this route may fetch images from, besides our S3 bucket. For example:
// { protocol: 'https', hostname: '**.example.com' }
const REMOTE_PATTERNS: RemotePattern[] = [];

const MAX_WIDTH = 2048;
const MIN_WIDTH = 16;
const ALLOWED_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 828, 1080, 1280, 1600, 2048,
];
// Each allowed combination is stored, so these lists also bound how much a
// visitor can make the route write. Keep in step with `qualities` in
// next.config.mjs.
const ALLOWED_QUALITIES = [75, 80];
const DEFAULT_QUALITY = 75;
// On Vercel, a first request at 1280px took 1.5s as AVIF and 0.9s as WebP, and
// AVIF saves only about 20%. Above this width, where a viewer is waiting on one
// large photo, WebP is the better trade.
const AVIF_MAX_WIDTH = 1000;
// AVIF's quality scale runs higher than WebP's: at the same number it is about
// 50% larger with little to show for it. This offset lands them at similar SSIM.
const AVIF_QUALITY_OFFSET = 20;

// Transformed copies live beside the originals. A miss costs over a second, and
// the CDN can't prevent that on a quiet site: it is regional, it keys on the
// browser's whole Accept header, and it evicts files nobody asks for.
const DERIVATIVE_PREFIX = 'derivatives/';
// Bump when the encoder settings change, so old copies stop being served.
const DERIVATIVE_VERSION = 'v1';

type Format = 'avif' | 'webp' | 'jpeg';
type ImageVariant = { width: number; quality: number; format: Format };

const CONTENT_TYPES: Record<Format, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpeg: 'image/jpeg',
};

function getOptimalFormat(
  acceptHeader: string | undefined,
  width: number,
): Format {
  if (!acceptHeader) return 'webp';

  const accept = acceptHeader.toLowerCase();

  if (width <= AVIF_MAX_WIDTH && accept.includes('image/avif')) return 'avif';
  if (accept.includes('image/webp')) return 'webp';

  return 'jpeg';
}

function nearest(allowed: number[], value: number) {
  return allowed.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
  );
}

class ImageNotFoundError extends Error {}

function derivativeKey(key: string, variant: ImageVariant) {
  const { width, quality, format } = variant;
  return `${DERIVATIVE_PREFIX}${DERIVATIVE_VERSION}/${width}/${quality}/${key}.${format}`;
}

async function readS3Object(bucket: string, key: string) {
  const { Body } = await getS3Client().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (!Body) throw new Error('Empty S3 response');
  return Body.transformToByteArray();
}

// Any failure here only means doing the transform again.
async function readDerivative(bucket: string, key: string) {
  try {
    return await readS3Object(bucket, key);
  } catch (error) {
    if ((error as Error).name !== 'NoSuchKey') {
      console.error('Could not read stored image:', error);
    }
    return null;
  }
}

function saveDerivative(
  bucket: string,
  key: string,
  body: Uint8Array,
  format: Format,
) {
  const saved = getS3Client()
    .send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: CONTENT_TYPES[format],
      }),
    )
    .catch((error) => console.error('Could not store image:', error));
  waitUntil(saved);
}

async function readOriginal(
  source: NonNullable<ReturnType<typeof resolveImageSource>>,
) {
  if (source.kind === 's3') {
    try {
      return await readS3Object(source.bucket, source.key);
    } catch (error) {
      if ((error as Error).name === 'NoSuchKey') {
        throw new ImageNotFoundError();
      }
      throw error;
    }
  }

  // A redirect could leave the allowlist, so refuse it.
  const response = await fetch(source.url, { redirect: 'error' });
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

function transform(input: Uint8Array, variant: ImageVariant) {
  const { width, quality, format } = variant;
  const image = sharp(input, {
    failOn: 'none',
    sequentialRead: true,
  }).resize(width, null, {
    withoutEnlargement: true,
    fit: 'inside',
  });

  switch (format) {
    case 'avif':
      return image
        .avif({ quality: quality - AVIF_QUALITY_OFFSET, effort: 2 })
        .toBuffer();
    case 'webp':
      return image.webp({ quality, effort: 2 }).toBuffer();
    default:
      return image.jpeg({ quality, mozjpeg: true }).toBuffer();
  }
}

app.get('/', async (c) => {
  try {
    const src = c.req.query('src');
    const widthParam = c.req.query('width');
    const qualityParam = c.req.query('quality');

    if (!src) {
      return c.json({ error: 'Missing or invalid src parameter' }, 400);
    }

    const requestedWidth = parseInt(widthParam || '', 10);
    if (
      isNaN(requestedWidth) ||
      requestedWidth < MIN_WIDTH ||
      requestedWidth > MAX_WIDTH
    ) {
      return c.json(
        { error: `Width must be between ${MIN_WIDTH} and ${MAX_WIDTH}` },
        400,
      );
    }

    const width = nearest(ALLOWED_WIDTHS, requestedWidth);
    const quality = nearest(
      ALLOWED_QUALITIES,
      parseInt(qualityParam || '', 10) || DEFAULT_QUALITY,
    );
    const format = getOptimalFormat(c.req.header('Accept'), width);
    const variant = { width, quality, format };

    const source = resolveImageSource(src, {
      // The client builds image URLs from this same variable.
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
      remotePatterns: REMOTE_PATTERNS,
    });
    // Stored copies aren't sources, or a request could stack copies of copies.
    if (
      !source ||
      (source.kind === 's3' &&
        (!source.key || source.key.startsWith(DERIVATIVE_PREFIX)))
    ) {
      return c.json({ error: 'URL not allowed' }, 403);
    }

    const started = performance.now();
    const store =
      source.kind === 's3'
        ? { bucket: source.bucket, key: derivativeKey(source.key, variant) }
        : null;
    let body = store && (await readDerivative(store.bucket, store.key));
    const origin = body ? 'store' : 'transform';

    if (!body) {
      body = await transform(await readOriginal(source), variant);
      if (store) saveDerivative(store.bucket, store.key, body, format);
    }

    // Built only once the image is complete, so a failure can't be cached as a
    // successful response.
    return c.body(body as Uint8Array<ArrayBuffer>, 200, {
      'Content-Type': CONTENT_TYPES[format],
      'Cache-Control': 'public, max-age=31536000, immutable',
      Vary: 'Accept',
      'Server-Timing': `${origin};dur=${Math.round(performance.now() - started)}`,
    });
  } catch (error) {
    if (error instanceof ImageNotFoundError) {
      return c.json({ error: 'Image not found' }, 404);
    }

    console.error('Image processing error:', error);

    if (error instanceof Error && error.message.includes('fetch')) {
      return c.json({ error: 'Failed to fetch image' }, 502);
    }

    return c.json({ error: 'Image processing failed' }, 500);
  }
});
