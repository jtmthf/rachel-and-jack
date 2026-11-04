import { beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from './image-server';

const request = (src: string) =>
  app.request(`/api/image?${new URLSearchParams({ src, width: '64' })}`);

describe('GET /api/image', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_S3_BUCKET', 'our-bucket');
  });

  it.each([
    's3://other-bucket/photo.jpg',
    'https://other-bucket.s3.us-east-1.amazonaws.com/photo.jpg',
    'https://evilexample.com/photo.jpg',
    'https://images.example.com/photo.jpg',
  ])('returns 403 for %s', async (src) => {
    const response = await request(src);

    expect(response.status).toBe(403);
  });
});
