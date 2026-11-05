'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Baskervville_SC, Imperial_Script } from 'next/font/google';
import { useState } from 'react';
import type { GallerySection } from './sections';

const baskerville = Baskervville_SC({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const imperialScript = Imperial_Script({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

/** Height of the bar plus the space around it, for positioning below it. */
export const CHAPTER_BAR_SPACE = 60;

const stepClass =
  'hover:bg-foreground/10 focus-visible:outline-foreground flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 disabled:opacity-30 disabled:hover:bg-transparent';

type Props = {
  sections: GallerySection[];
  current: number;
  onSelect: (sectionIndex: number) => void;
};

export function ChapterBar({ sections, current, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-card sticky top-[72px] z-[1] mx-auto flex h-11 w-fit max-w-full items-center rounded-full shadow-md">
      <button
        type="button"
        className={stepClass}
        disabled={current === 0}
        onClick={() => onSelect(current - 1)}
        aria-label="Previous chapter"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`focus-visible:outline-foreground flex h-11 min-w-0 items-center gap-1.5 rounded-full px-2 text-lg focus-visible:outline-2 ${baskerville.className}`}
      >
        <span className="sr-only">Browse chapters. Current chapter: </span>
        <span className="truncate">{sections[current]?.name}</span>
        <ChevronDown className="size-4 shrink-0" />
      </button>
      <button
        type="button"
        className={stepClass}
        disabled={current === sections.length - 1}
        onClick={() => onSelect(current + 1)}
        aria-label="Next chapter"
      >
        <ChevronRight className="size-5" />
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="flex w-full max-w-md flex-col gap-4 overflow-hidden pr-0 sm:max-w-md"
        >
          <SheetTitle
            className={`text-5xl font-normal ${imperialScript.className}`}
          >
            Chapters
          </SheetTitle>
          <SheetDescription className="sr-only">
            Jump to a chapter of the gallery
          </SheetDescription>
          <ol className="min-h-0 flex-1 overflow-y-auto pr-6 pb-6">
            {sections.map((section, index) => (
              <li key={section.slug}>
                <button
                  type="button"
                  aria-current={index === current ? 'true' : undefined}
                  onClick={() => {
                    setIsOpen(false);
                    onSelect(index);
                  }}
                  className="hover:bg-foreground/5 focus-visible:outline-foreground aria-[current=true]:bg-foreground/10 flex w-full items-baseline gap-2 rounded px-2 py-1.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2"
                >
                  <span className={`text-lg ${baskerville.className}`}>
                    {section.name}
                  </span>
                  <span
                    aria-hidden
                    className="border-foreground/40 min-w-4 flex-1 translate-y-[-0.2em] border-b border-dotted"
                  />
                  <span className="text-foreground/70 text-sm tabular-nums">
                    {section.photos.length.toLocaleString('en-US')}
                    <span className="sr-only"> photos</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>
    </div>
  );
}
