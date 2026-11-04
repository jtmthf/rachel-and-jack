export type RemotePattern = { protocol: string; hostname: string };

export type ImageSource =
  | { kind: 's3'; bucket: string; key: string }
  | { kind: 'remote'; url: string };

type ImageSourcePolicy = {
  bucket: string | undefined;
  remotePatterns: readonly RemotePattern[];
};

// A hostname starting with `**.` matches any subdomain, but not the domain itself.
export function isAllowedRemoteUrl(
  url: string,
  patterns: readonly RemotePattern[],
): boolean {
  try {
    const parsed = new URL(url);

    return patterns.some((pattern) => {
      const protocolMatch =
        pattern.protocol === parsed.protocol.replace(':', '');

      if (pattern.hostname.startsWith('**.')) {
        // Keep the leading dot so evilexample.com can't match **.example.com.
        const suffix = pattern.hostname.slice(2);
        return protocolMatch && parsed.hostname.endsWith(suffix);
      }

      return protocolMatch && pattern.hostname === parsed.hostname;
    });
  } catch {
    return false;
  }
}

export function parseS3Url(
  url: string,
): { bucket: string; key: string } | null {
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

// Returns where to read an image from, or null if the policy doesn't allow it.
export function resolveImageSource(
  src: string,
  { bucket, remotePatterns }: ImageSourcePolicy,
): ImageSource | null {
  const s3 = parseS3Url(src);
  if (s3) {
    return bucket && s3.bucket === bucket ? { kind: 's3', ...s3 } : null;
  }

  return isAllowedRemoteUrl(src, remotePatterns)
    ? { kind: 'remote', url: src }
    : null;
}
