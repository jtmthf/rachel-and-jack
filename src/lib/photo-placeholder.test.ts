import sharp from 'sharp';
import { thumbHashToAverageRGBA } from 'thumbhash';
import { describe, expect, it } from 'vitest';
import { createPlaceholder } from './photo-placeholder';

describe('createPlaceholder', () => {
  it('encodes an image as short base64 that holds its colour', async () => {
    const red = await sharp({
      create: {
        width: 3000,
        height: 2000,
        channels: 3,
        background: { r: 200, g: 20, b: 20 },
      },
    })
      .jpeg()
      .toBuffer();

    const hash = await createPlaceholder(red);

    expect(hash).toMatch(/^[A-Za-z0-9+/]{10,40}$/);
    const bytes = Uint8Array.from(atob(hash), (c) => c.charCodeAt(0));
    const { r, g } = thumbHashToAverageRGBA(bytes);
    expect(r).toBeGreaterThan(0.6);
    expect(g).toBeLessThan(0.25);
  });
});
