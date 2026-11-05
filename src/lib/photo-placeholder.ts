import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';

// ThumbHash accepts images up to this size on either side.
const MAX_SIZE = 100;

/** Encodes an image as a ThumbHash in unpadded base64, around 28 characters. */
export async function createPlaceholder(image: Uint8Array) {
  const { data, info } = await sharp(image, { failOn: 'none' })
    .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const hash = rgbaToThumbHash(info.width, info.height, data);
  return Buffer.from(hash).toString('base64').replace(/=+$/, '');
}
