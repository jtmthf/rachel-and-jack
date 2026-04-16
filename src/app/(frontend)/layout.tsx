import { AdminBar } from '@/components/admin-bar';
import { Navbar } from '@/components/navbar';
import PageViewed from '@/lib/analytics/page-viewed';
import configPromise from '@payload-config';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { getPayload } from 'payload';
import './globals.css';

export const metadata: Metadata = {
  title: "Rachel & Jack's Wedding",
  description:
    "Rachel and Jack's wedding | September 6th, 2025 at Nashville's Schermerhorn Symphony Center",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();

  const payload = await getPayload({ config: configPromise });
  const nav = await payload.findGlobal({ slug: 'navigation' });

  return (
    <html lang="en">
      <body>
        <PageViewed />
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />
        <Navbar items={nav.items ?? []} />
        {children}
      </body>
    </html>
  );
}
