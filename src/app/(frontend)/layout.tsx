import { Navbar } from '@/components/navbar';
import PageViewed from '@/lib/analytics/page-viewed';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Rachel & Jack's Wedding",
  description:
    "Rachel and Jack's wedding | September 6th, 2025 at Nashville's Schermerhorn Symphony Center",
};

const items = [
  { title: 'Our Story', href: '/our-story' },
  { title: 'Things to Do', href: '/things-to-do' },
  { title: 'Dining', href: '/dining' },
  { title: 'FAQ', href: '/faq' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PageViewed />
        <Navbar items={items} />
        {children}
      </body>
    </html>
  );
}
