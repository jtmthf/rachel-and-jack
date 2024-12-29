import { Navbar } from '@/components/navbar';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Rachel & Jack's Wedding",
  description:
    "Rachel and Jack's wedding | September 6th, 2025 at Nashville's Schermerhorn Symphony Center",
};

const items = [
  { title: 'Our Story', href: '/our-story' },
  // { title: 'Photos', href: '/photos' },
  // { title: 'Q & A', href: '/q-and-a' },
  // { title: 'Travel', href: '/travel' },
  // { title: 'Registry', href: '/registry' },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="z-10">
          <Navbar items={items} />
        </header>
        {children}
      </body>
    </html>
  );
}
