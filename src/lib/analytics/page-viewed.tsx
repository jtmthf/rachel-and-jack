'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { track } from './track';

export default function PageViewed() {
  const pathname = usePathname();

  useEffect(() => {
    track({
      name: 'page_viewed',
      properties: {
        pathname,
      },
    });
  }, [pathname]);

  return null;
}
