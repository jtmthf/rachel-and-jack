import { describe, expect, it } from 'vitest';
import { isAllowedRemoteUrl, resolveImageSource } from './image-source';

const policy = { bucket: 'our-bucket', remotePatterns: [] };

describe('resolveImageSource', () => {
  describe('S3', () => {
    it('allows s3:// URLs in our bucket', () => {
      expect(resolveImageSource('s3://our-bucket/photo.jpg', policy)).toEqual({
        kind: 's3',
        bucket: 'our-bucket',
        key: 'photo.jpg',
      });
    });

    it('allows virtual-hosted URLs in our bucket', () => {
      expect(
        resolveImageSource(
          'https://our-bucket.s3.us-east-1.amazonaws.com/photo.jpg',
          policy,
        ),
      ).toEqual({ kind: 's3', bucket: 'our-bucket', key: 'photo.jpg' });
    });

    it('rejects s3:// URLs in another bucket', () => {
      expect(
        resolveImageSource('s3://other-bucket/photo.jpg', policy),
      ).toBeNull();
    });

    it('rejects virtual-hosted URLs in another bucket', () => {
      expect(
        resolveImageSource(
          'https://other-bucket.s3.us-east-1.amazonaws.com/photo.jpg',
          policy,
        ),
      ).toBeNull();
    });

    it('cannot leave our bucket with dot segments in the host or key', () => {
      expect(
        resolveImageSource('s3://our-bucket/../../photo.jpg', policy),
      ).toEqual({ kind: 's3', bucket: 'our-bucket', key: 'photo.jpg' });
      expect(
        resolveImageSource(
          'https://our-bucket.s3.us-east-1.amazonaws.com.attacker.test/photo.jpg',
          policy,
        ),
      ).toBeNull();
    });

    it.each([undefined, ''])(
      'rejects every bucket when ours is %j',
      (bucket) => {
        expect(
          resolveImageSource('s3://undefined/photo.jpg', { ...policy, bucket }),
        ).toBeNull();
        expect(
          resolveImageSource('s3:///photo.jpg', { ...policy, bucket }),
        ).toBeNull();
      },
    );
  });

  describe('remote', () => {
    it('rejects every remote URL when the allowlist is empty', () => {
      expect(
        resolveImageSource('https://example.com/a.jpg', policy),
      ).toBeNull();
    });

    it('allows a remote URL on the allowlist', () => {
      expect(
        resolveImageSource('https://images.example.com/a.jpg', {
          ...policy,
          remotePatterns: [
            { protocol: 'https', hostname: 'images.example.com' },
          ],
        }),
      ).toEqual({ kind: 'remote', url: 'https://images.example.com/a.jpg' });
    });

    it('rejects a string that is not a URL', () => {
      expect(resolveImageSource('not a url', policy)).toBeNull();
    });
  });
});

describe('isAllowedRemoteUrl', () => {
  const wildcard = [{ protocol: 'https', hostname: '**.example.com' }];

  it.each(['https://a.example.com/x.jpg', 'https://a.b.example.com/x.jpg'])(
    'matches the subdomain in %s',
    (url) => {
      expect(isAllowedRemoteUrl(url, wildcard)).toBe(true);
    },
  );

  it.each([
    'https://evilexample.com/x.jpg',
    'https://example.com/x.jpg',
    'https://a.example.com.attacker.test/x.jpg',
    'http://a.example.com/x.jpg',
  ])('rejects %s', (url) => {
    expect(isAllowedRemoteUrl(url, wildcard)).toBe(false);
  });

  it('requires an exact hostname for a pattern without a wildcard', () => {
    const exact = [{ protocol: 'https', hostname: 'example.com' }];
    expect(isAllowedRemoteUrl('https://example.com/x.jpg', exact)).toBe(true);
    expect(isAllowedRemoteUrl('https://a.example.com/x.jpg', exact)).toBe(
      false,
    );
  });
});
