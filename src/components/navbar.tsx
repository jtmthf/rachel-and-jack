'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Menu } from 'lucide-react';
import { Baskervville_SC, Imperial_Script } from 'next/font/google';
import Link from 'next/link';
import { useState } from 'react';
import styles from './navbar.module.css';
import { Button } from './ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

const imperialScript = Imperial_Script({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const baskerville = Baskervville_SC({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

type NavChild = {
  title: string;
  href: string;
  id?: string | null;
};

type NavItem = {
  title: string;
  href?: string | null;
  children?: NavChild[] | null;
  id?: string | null;
};

type Props = {
  items: NavItem[];
};

const linkClassName = cn(
  'hover:text-primary text-2xl font-light tracking-wider transition-colors',
  baskerville.className,
);

export function Navbar({ items }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.backdrop} />
      <div className={styles['backdrop-edge']} />
      <nav className="relative">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          <div className="flex flex-1 items-baseline justify-between space-x-4">
            <Link
              href="/"
              className={cn(
                'flex items-center space-x-2',
                imperialScript.className,
              )}
            >
              <span className="mr-8 text-4xl">R&J</span>
            </Link>

            {/* Desktop nav */}
            <NavigationMenu
              className="ml-auto hidden md:flex"
              delayDuration={0}
            >
              <NavigationMenuList className="gap-8 space-x-0">
                {items.map((item) =>
                  item.children && item.children.length > 0 ? (
                    <NavigationMenuItem
                      key={item.id ?? item.title}
                      className="relative"
                    >
                      <NavigationMenuTrigger
                        className={cn(
                          linkClassName,
                          'data-[state=open]:text-foreground h-auto bg-transparent p-0 hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent',
                        )}
                      >
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="flex w-36 flex-col gap-2 p-3">
                          {item.children.map((child) => (
                            <li key={child.id ?? child.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className={cn(linkClassName, 'text-xl')}
                                >
                                  {child.title}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.id ?? item.title}>
                      <NavigationMenuLink asChild>
                        <Link href={item.href ?? '#'} className={linkClassName}>
                          {item.title}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Mobile nav trigger */}
          <div className="ml-auto flex md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="size-5" />
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
                <nav className="mt-4 flex flex-col space-y-6">
                  {items.map((item) =>
                    item.children && item.children.length > 0 ? (
                      <div
                        key={item.id ?? item.title}
                        className="flex flex-col gap-3"
                      >
                        <span
                          className={cn(
                            'text-xl tracking-wider',
                            baskerville.className,
                          )}
                        >
                          {item.title}
                        </span>
                        <div className="ml-4 flex flex-col gap-3">
                          {item.children.map((child) => (
                            <Link
                              key={child.id ?? child.href}
                              href={child.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'hover:text-primary text-lg tracking-wider transition-colors',
                                baskerville.className,
                              )}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        key={item.id ?? item.title}
                        href={item.href ?? '#'}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'hover:text-primary text-xl tracking-wider transition-colors',
                          baskerville.className,
                        )}
                      >
                        {item.title}
                      </Link>
                    ),
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
