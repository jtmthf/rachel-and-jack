import { AdminBar } from '@/components/admin-bar';
import { Navbar } from '@/components/navbar';
import PageViewed from '@/lib/analytics/page-viewed';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import './globals.css';

export const metadata: Metadata = {
  title: "Rachel & Jack's Wedding",
  description:
    "Rachel and Jack's wedding | September 6th, 2025 at Nashville's Schermerhorn Symphony Center",
};

const items = [
  { title: 'Our Story', href: '/our-story' },
  { title: 'Details', href: '/details' },
  { title: 'Things To Do', href: '/things-to-do' },
  { title: 'Dining', href: '/dining' },
  { title: 'Q&A', href: '/faq' },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();

  return (
    <html lang="en">
      <body>
        <PageViewed />
        <AdminBar
          adminBarProps={{
            preview: isEnabled,
          }}
        />
        <Navbar items={items} />
        {children}
      </body>
    </html>
  );
}
