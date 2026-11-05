import sharp from 'sharp';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// A stand-in bucket. Everything else, including sharp, is real.
const bucket = vi.hoisted(() => ({
  objects: new Map<string, Uint8Array>(),
  reads: [] as string[],
  failWrites: false,
}));

vi.mock('@vercel/oidc-aws-credentials-provider', () => ({
  awsCredentialsProvider: () => ({}),
}));
vi.mock('@vercel/functions', () => ({
  waitUntil: (promise: Promise<unknown>) => promise,
}));
vi.mock('@aws-sdk/client-s3', () => {
  class GetObjectCommand {
    constructor(public input: { Key: string }) {}
  }
  class PutObjectCommand {
    constructor(public input: { Key: string; Body: Uint8Array }) {}
  }
  class S3Client {
    async send(command: GetObjectCommand | PutObjectCommand) {
      if (command instanceof PutObjectCommand) {
        if (bucket.failWrites) throw new Error('AccessDenied');
        bucket.objects.set(command.input.Key, command.input.Body);
        return {};
      }
      bucket.reads.push(command.input.Key);
      const object = bucket.objects.get(command.input.Key);
      if (!object) {
        throw Object.assign(new Error('missing'), { name: 'NoSuchKey' });
      }
      return { Body: { transformToByteArray: async () => object } };
    }
  }
  return { GetObjectCommand, PutObjectCommand, S3Client };
});

import { app } from './image-server';

const CHROME = 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8';
const SAFARI = 'image/webp,image/avif,image/jxl,image/*;q=0.8,*/*;q=0.5';

const get = (
  key: string,
  { width = 1600, quality = 80, accept = CHROME } = {},
) =>
  app.request(
    `/api/image?${new URLSearchParams({
      src: `s3://our-bucket/${key}`,
      width: String(width),
      quality: String(quality),
    })}`,
    { headers: { Accept: accept } },
  );

const derivatives = () =>
  [...bucket.objects.keys()].filter((key) => key.startsWith('derivatives/'));

describe('GET /api/image, stored copies', () => {
  let photo: Uint8Array;

  beforeAll(async () => {
    photo = await sharp({
      create: {
        width: 3000,
        height: 2000,
        channels: 3,
        background: { r: 90, g: 120, b: 150 },
      },
    })
      .jpeg()
      .toBuffer();
  });

  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_S3_BUCKET', 'our-bucket');
    vi.stubEnv('AWS_REGION', 'us-east-1');
    bucket.objects.clear();
    bucket.reads.length = 0;
    bucket.failWrites = false;
    bucket.objects.set('a.jpg', photo);
  });

  it('transforms once, then serves the copy without reading the original', async () => {
    const first = await get('a.jpg');
    const firstBytes = await first.arrayBuffer();
    await vi.waitFor(() => expect(derivatives()).toHaveLength(1));

    bucket.reads.length = 0;
    const second = await get('a.jpg');

    expect(first.status).toBe(200);
    expect(first.headers.get('Server-Timing')).toMatch(/^transform/);
    expect(second.headers.get('Server-Timing')).toMatch(/^store/);
    expect(second.headers.get('Content-Type')).toBe('image/webp');
    expect(await second.arrayBuffer()).toEqual(firstBytes);
    expect(bucket.reads).not.toContain('a.jpg');
  });

  it('shares a copy between browsers that get the same format', async () => {
    await get('a.jpg', { accept: CHROME });
    await vi.waitFor(() => expect(derivatives()).toHaveLength(1));

    const safari = await get('a.jpg', { accept: SAFARI });

    expect(safari.headers.get('Server-Timing')).toMatch(/^store/);
    expect(derivatives()).toHaveLength(1);
  });

  it('keeps one copy for any requested width and quality that snap together', async () => {
    await Promise.all([
      get('a.jpg', { width: 1590, quality: 79 }),
      get('a.jpg', { width: 1610, quality: 83 }),
    ]);

    await vi.waitFor(() => expect(derivatives()).toHaveLength(1));
  });

  it('still serves the photo when the copy cannot be written', async () => {
    bucket.failWrites = true;
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await get('a.jpg');

    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
    await vi.waitFor(() => expect(errors).toHaveBeenCalled());
    errors.mockRestore();
  });

  it('does not cache a file that cannot be decoded', async () => {
    bucket.objects.set('broken.jpg', new TextEncoder().encode('not a photo'));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await get('broken.jpg');

    expect(response.status).toBe(500);
    expect(response.headers.get('Cache-Control')).toBeNull();
    expect(derivatives()).toHaveLength(0);
    errors.mockRestore();
  });

  it('returns 404 without storing anything for a missing file', async () => {
    const response = await get('missing.jpg');

    expect(response.status).toBe(404);
    expect(derivatives()).toHaveLength(0);
  });

  it.each(['', 'derivatives/v1/1600/80/a.jpg.webp'])(
    'refuses "%s" as a source',
    async (key) => {
      const response = await get(key);

      expect(response.status).toBe(403);
    },
  );
});
