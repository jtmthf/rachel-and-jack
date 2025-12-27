import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import sharp from 'sharp';
import { Readable } from 'stream';

export const app = new Hono().basePath('/api/image');
const s3Client = new S3Client({});

// Configuration
const REMOTE_PATTERNS = [
  { protocol: 'https', hostname: 'images.example.com' },
  { protocol: 'https', hostname: '**.example.com' },
  // Add your allowed remote patterns here
];

const MAX_WIDTH = 3840;
const MIN_WIDTH = 16;
const DEFAULT_QUALITY = 75;
const ALLOWED_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048,
  3840,
];

// Security: Validate URL against remote patterns
function isAllowedRemoteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    return REMOTE_PATTERNS.some((pattern) => {
      const protocolMatch =
        pattern.protocol === parsed.protocol.replace(':', '');

      if (pattern.hostname.startsWith('**')) {
        const domain = pattern.hostname.replace('**.', '');
        return protocolMatch && parsed.hostname.endsWith(domain);
      }

      return protocolMatch && pattern.hostname === parsed.hostname;
    });
  } catch {
    return false;
  }
}

// Check if URL is an S3 URL
function parseS3Url(url: string): { bucket: string; key: string } | null {
  try {
    const parsed = new URL(url);

    // s3://bucket/key format
    if (parsed.protocol === 's3:') {
      return {
        bucket: parsed.hostname,
        key: parsed.pathname.slice(1),
      };
    }

    // https://bucket.s3.region.amazonaws.com/key format
    const s3Match = parsed.hostname.match(
      /^(.+)\.s3\.([^.]+)\.amazonaws\.com$/,
    );
    if (s3Match) {
      return {
        bucket: s3Match[1],
        key: parsed.pathname.slice(1),
      };
    }

    return null;
  } catch {
    return null;
  }
}

// Get optimal image format based on Accept header
function getOptimalFormat(acceptHeader: string | undefined): string {
  if (!acceptHeader) return 'webp';

  const accept = acceptHeader.toLowerCase();

  // AVIF has best compression but less browser support
  if (accept.includes('image/avif')) return 'avif';

  // WebP has good compression and wide support
  if (accept.includes('image/webp')) return 'webp';

  // Fallback to JPEG
  return 'jpeg';
}

// Fetch image stream from URL or S3
async function fetchImageStream(src: string): Promise<Readable> {
  const s3Params = parseS3Url(src);

  if (s3Params) {
    // Fetch from S3
    const command = new GetObjectCommand({
      Bucket: s3Params.bucket,
      Key: s3Params.key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('Empty S3 response');
    }

    return response.Body as Readable;
  } else {
    // Fetch from remote URL
    if (!isAllowedRemoteUrl(src)) {
      throw new Error('Remote URL not allowed');
    }

    const response = await fetch(src);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Empty response body');
    }

    return Readable.fromWeb(response.body as any);
  }
}

// Convert Node.js Readable stream to async iterator
async function* streamToAsyncIterator(
  stream: Readable,
): AsyncGenerator<Uint8Array> {
  for await (const chunk of stream) {
    yield chunk;
  }
}

// Main image handler with streaming
app.get('/', async (c) => {
  try {
    const src = c.req.query('src');
    const widthParam = c.req.query('width');
    const qualityParam = c.req.query('quality');

    // Validate parameters
    if (!src) {
      return c.json({ error: 'Missing or invalid src parameter' }, 400);
    }

    // Parse and validate width
    let width = parseInt(widthParam || '', 10);
    if (isNaN(width) || width < MIN_WIDTH || width > MAX_WIDTH) {
      return c.json(
        { error: `Width must be between ${MIN_WIDTH} and ${MAX_WIDTH}` },
        400,
      );
    }

    // Snap to nearest allowed width for better caching
    width = ALLOWED_WIDTHS.reduce((prev, curr) =>
      Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev,
    );

    // Parse and validate quality
    let quality = parseInt(qualityParam || '', 10) || DEFAULT_QUALITY;
    quality = Math.max(1, Math.min(100, quality));

    // Determine optimal format
    const acceptHeader = c.req.header('Accept');
    const format = getOptimalFormat(acceptHeader);

    // Fetch image stream
    const imageStream = await fetchImageStream(src);

    // Process image with Sharp
    let transformer = sharp({
      failOnError: false,
      unlimited: false,
      sequentialRead: true,
    }).resize(width, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });

    // Apply format-specific settings
    let contentType: string;
    switch (format) {
      case 'avif':
        transformer = transformer.avif({ quality });
        contentType = 'image/avif';
        break;
      case 'webp':
        transformer = transformer.webp({ quality });
        contentType = 'image/webp';
        break;
      default:
        transformer = transformer.jpeg({ quality, mozjpeg: true });
        contentType = 'image/jpeg';
    }

    // Pipe input stream through Sharp
    const processedStream = imageStream.pipe(transformer);

    // Stream the processed image using Hono's streaming
    return stream(c, async (stream) => {
      // Set headers
      c.header('Content-Type', contentType);
      c.header('Cache-Control', 'public, max-age=31536000, immutable');
      c.header('Vary', 'Accept');

      // Stream the processed image data
      for await (const chunk of streamToAsyncIterator(processedStream)) {
        await stream.write(chunk);
      }
    });
  } catch (error) {
    console.error('Image processing error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('not allowed')) {
      return c.json({ error: 'URL not allowed' }, 403);
    }

    if (errorMessage.includes('fetch')) {
      return c.json({ error: 'Failed to fetch image' }, 502);
    }

    return c.json({ error: 'Image processing failed' }, 500);
  }
});
