'use client';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

type Props = {
  items: Array<{
    title: string;
    href: string;
  }>;
};

export function Navbar({ items }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="z-10 border-b bg-background/50">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
        <div className="flex items-baseline space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">R&J</span>
          </Link>
          <div className="hidden space-x-4 md:flex">
            {items.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="ml-auto hidden md:flex">
          <Link
            href="/rsvp"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            RSVP
          </Link>
        </div>
        <div className="ml-auto flex md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <VisuallyHidden asChild>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigation</SheetDescription>
                </SheetHeader>
              </VisuallyHidden>
              <nav className="mt-4 flex flex-col space-y-4">
                {items.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}
                <Separator />
                <Link
                  href="/rsvp"
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  RSVP
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
