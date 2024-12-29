import { SITE_ORIGIN } from '@/lib/contants';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/messages/',
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
