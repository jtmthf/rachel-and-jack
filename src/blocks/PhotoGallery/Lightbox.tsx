'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Share,
  X,
  type LucideProps,
} from 'lucide-react';
import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import {
  fullPhotoImage,
  imageLoader,
  photoSrc,
  placeholderImage,
  thumbnailSizes,
} from './photo-image';
import type { GalleryPhoto, GallerySection } from './sections';

const SWIPE_DISTANCE = 50;
// Thin lines suit icons sitting over photographs.
const iconProps: LucideProps = { strokeWidth: 1.5, 'aria-hidden': true };

const controlClass =
  'flex size-11 items-center justify-center rounded-full text-white/85 hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white';

export type LightboxPhoto = {
  photo: GalleryPhoto;
  section: GallerySection;
  indexInSection: number;
};

type Props = {
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onCloseAutoFocus: (event: Event) => void;
};

export function Lightbox({
  photos,
  index,
  onIndexChange,
  onClose,
  onCloseAutoFocus,
}: Props) {
  const { photo, section, indexInSection } = photos[index];
  const hasPrevious = index > 0;
  const hasNext = index < photos.length - 1;
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const [settled, setSettled] = useState<ReadonlySet<number>>(new Set());
  const markSettled = useCallback((id: number) => {
    setSettled((previous) => new Set(previous).add(id));
  }, []);

  const previous = () => hasPrevious && onIndexChange(index - 1);
  const next = () => hasNext && onIndexChange(index + 1);

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) previous();
    else next();
  };

  const position = `${(indexInSection + 1).toLocaleString('en-US')} of ${section.photos.length.toLocaleString('en-US')}`;
  // The neighbours stay mounted but hidden, so stepping to them is instant. They
  // wait for the current photo, because resizing them at the same time slows it.
  const mounted = (
    settled.has(photo.id) ? [index - 1, index, index + 1] : [index]
  ).filter((i) => i >= 0 && i < photos.length);

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onCloseAutoFocus={onCloseAutoFocus}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') previous();
            if (event.key === 'ArrowRight') next();
          }}
          className="data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 flex flex-col bg-black text-white duration-150 focus:outline-none"
        >
          <header className="flex shrink-0 items-center gap-1 p-2">
            <div className="min-w-0 flex-1 px-2">
              <DialogPrimitive.Title className="truncate text-base font-normal">
                {section.name ?? photo.alt ?? section.alt}
              </DialogPrimitive.Title>
              <p
                className="text-sm text-white/70 tabular-nums"
                aria-live="polite"
              >
                {position}
              </p>
            </div>
            <ShareButton />
            <a
              href={`/api/photo/file/${encodeURIComponent(photo.filename)}`}
              target="_blank"
              rel="noreferrer"
              className={controlClass}
              aria-label="Open full-size original in a new tab"
              title="Open full-size original"
            >
              <ArrowUpRight className="size-6" {...iconProps} />
            </a>
            <DialogPrimitive.Close
              className={controlClass}
              aria-label="Close"
              title="Close"
            >
              <X className="size-6" {...iconProps} />
            </DialogPrimitive.Close>
          </header>

          <div
            className="[container-type:size] relative min-h-0 flex-1 [touch-action:pan-y_pinch-zoom]"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeStart.current = null)}
          >
            {mounted.map((i) => (
              <FullPhoto
                key={photos[i].photo.id}
                photo={photos[i].photo}
                alt={photos[i].photo.alt ?? photos[i].section.alt}
                current={i === index}
                settled={settled.has(photos[i].photo.id)}
                onSettled={markSettled}
              />
            ))}
            <button
              type="button"
              onClick={previous}
              disabled={!hasPrevious}
              aria-label="Previous photo"
              className={`${controlClass} absolute top-1/2 left-2 hidden -translate-y-1/2 bg-black/40 disabled:invisible sm:flex`}
            >
              <ChevronLeft className="size-7" {...iconProps} />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!hasNext}
              aria-label="Next photo"
              className={`${controlClass} absolute top-1/2 right-2 hidden -translate-y-1/2 bg-black/40 disabled:invisible sm:flex`}
            >
              <ChevronRight className="size-7" {...iconProps} />
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function FullPhoto({
  photo,
  alt,
  current,
  settled,
  onSettled,
}: {
  photo: GalleryPhoto;
  alt: string;
  current: boolean;
  settled: boolean;
  onSettled: (id: number) => void;
}) {
  const aspect = photo.width / photo.height;
  const background = useMemo(
    () => placeholderImage(photo.placeholder),
    [photo.placeholder],
  );

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${current ? '' : 'invisible'}`}
      aria-hidden={!current}
    >
      <div
        className="relative max-h-full bg-cover bg-center"
        style={{
          aspectRatio: aspect,
          width: `min(100cqw, ${aspect} * 100cqh)`,
          backgroundImage: background,
        }}
      >
        {/* The grid's file, so a photo opened from the grid shows at once. */}
        {current && !settled && (
          <Image
            loader={imageLoader}
            src={photoSrc(photo)}
            alt=""
            fill
            sizes={thumbnailSizes(photo)}
            loading="eager"
            draggable={false}
            className="object-contain"
          />
        )}
        <Image
          {...fullPhotoImage(photo)}
          alt={alt}
          loading="eager"
          fetchPriority={current ? 'high' : 'low'}
          draggable={false}
          onLoad={() => onSettled(photo.id)}
          onError={() => onSettled(photo.id)}
          className="object-contain"
        />
      </div>
    </div>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        // Closing the share sheet rejects. There's nothing to report.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  return (
    <>
      <span role="status" className="text-sm whitespace-nowrap text-white/85">
        {copied && 'Link copied'}
      </span>
      <button
        type="button"
        onClick={share}
        className={controlClass}
        aria-label="Share this photo"
        title="Share this photo"
      >
        <Share className="size-5" {...iconProps} />
      </button>
    </>
  );
}
