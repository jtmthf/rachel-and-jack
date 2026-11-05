'use client';

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import { flushSync } from 'react-dom';
import { CHAPTER_BAR_SPACE, ChapterBar } from './ChapterBar';
import { Lightbox, type LightboxPhoto } from './Lightbox';
import { PhotoPreview, PREVIEW_PHOTOS } from './PhotoPreview';
import { PhotoThumbnail } from './PhotoThumbnail';
import { SectionHeading } from './SectionHeading';
import {
  computeLayout,
  sectionAt,
  visibleBlocks,
  type GalleryLayout,
  type LayoutBlock,
} from './layout';
import { preloadFullPhoto } from './photo-image';
import { photoLabel } from './photo-label';
import type { GallerySection } from './sections';

const NAVBAR_HEIGHT = 64;
// Screens of photos to keep rendered above and below the viewport.
const OVERSCAN_SCREENS = 1;
// Rows must stay on screen this long before their photos load, so that dragging
// the scrollbar across the gallery doesn't request every photo it passes.
const IMAGE_LOAD_DELAY_MS = 200;
// How long the mouse must rest on a photo before its full size starts loading,
// so that moving across the grid doesn't request every photo it passes.
const HOVER_PRELOAD_DELAY_MS = 120;

function photoIdFromUrl() {
  const id = new URLSearchParams(window.location.search).get('photo');
  return id ? Number(id) : null;
}

function urlWithPhoto(id: number | null) {
  const url = new URL(window.location.href);
  if (id === null) url.searchParams.delete('photo');
  else url.searchParams.set('photo', String(id));
  return url;
}

export function Gallery({ sections }: { sections: GallerySection[] }) {
  const photos = useMemo(
    () =>
      sections.flatMap((section) =>
        section.photos.map(
          (photo, indexInSection): LightboxPhoto => ({
            photo,
            section,
            indexInSection,
          }),
        ),
      ),
    [sections],
  );
  const hasChapters = sections.length > 1;
  const stickyOffset = NAVBAR_HEIGHT + (hasChapters ? CHAPTER_BAR_SPACE : 0);

  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  const layout = useMemo(
    () => (width === null ? null : computeLayout(sections, width)),
    [sections, width],
  );
  const [view, setView] = useState({ first: 0, last: -1, section: 0 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const pushedHistoryEntry = useRef(false);

  const stageTop = useCallback(() => {
    const rect = stageRef.current!.getBoundingClientRect();
    return rect.top + window.scrollY;
  }, []);

  const syncView = useCallback(
    (current: GalleryLayout) => {
      const y = window.scrollY - stageTop();
      const overscan = window.innerHeight * OVERSCAN_SCREENS;
      const [first, last] = visibleBlocks(
        current,
        y - overscan,
        y + window.innerHeight + overscan,
      );
      const section = sectionAt(current, y + stickyOffset + 1);
      setView((previous) =>
        previous.first === first &&
        previous.last === last &&
        previous.section === section
          ? previous
          : { first, last, section },
      );
    },
    [stageTop, stickyOffset],
  );

  const scrollToY = useCallback(
    (y: number, offset = stickyOffset) => {
      window.scrollTo({
        top: stageTop() + y - offset,
        behavior: 'instant',
      });
    },
    [stageTop, stickyOffset],
  );

  // Measure before paint, so the server's preview swaps straight to the grid.
  useLayoutEffect(() => {
    const stage = stageRef.current!;
    setWidth(Math.round(stage.clientWidth));
    const observer = new ResizeObserver(() => {
      setWidth(Math.round(stage.clientWidth));
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // When the width changes, keep the same photo at the top of the screen.
  const topPhotoIndex = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (!layout) return;
    if (topPhotoIndex.current !== null) {
      const block = layout.blocks[layout.photoBlocks[topPhotoIndex.current]];
      if (block) scrollToY(block.top);
    }
    syncView(layout);
  }, [layout, scrollToY, syncView]);

  useEffect(() => {
    if (!layout) return;
    let frame = 0;
    const onChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        syncView(layout);
        const y = window.scrollY - stageTop() + stickyOffset;
        const [first] = visibleBlocks(layout, y, y + 1);
        const block = layout.blocks.slice(first).find((b) => b.kind === 'row');
        // Above the gallery there's no photo to hold on to.
        topPhotoIndex.current =
          y > stickyOffset && block?.kind === 'row'
            ? block.cells[0].photoIndex
            : null;
      });
    };
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [layout, stageTop, stickyOffset, syncView]);

  // Links can name a section in the hash and a photo in the query string.
  const hasLaidOut = layout !== null;
  useEffect(() => {
    if (!hasLaidOut) return;
    const syncPhotoFromUrl = () => {
      const id = photoIdFromUrl();
      const index = photos.findIndex(({ photo }) => photo.id === id);
      setOpenIndex(index === -1 ? null : index);
    };
    syncPhotoFromUrl();
    window.addEventListener('popstate', syncPhotoFromUrl);
    return () => window.removeEventListener('popstate', syncPhotoFromUrl);
  }, [hasLaidOut, photos]);

  // Follow the hash on arrival and when it changes on this page. Reads the
  // layout through a ref so that a resize doesn't jump back to the section.
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  useEffect(() => {
    if (!hasLaidOut) return;
    const followHash = () => {
      const slug = window.location.hash.slice(1);
      const sectionIndex = sections.findIndex((s) => s.slug === slug);
      if (slug && sectionIndex !== -1) {
        scrollToY(layoutRef.current!.sectionTops[sectionIndex], NAVBAR_HEIGHT);
      }
    };
    followHash();
    window.addEventListener('hashchange', followHash);
    return () => window.removeEventListener('hashchange', followHash);
  }, [hasLaidOut, scrollToY, sections]);

  const goToSection = useCallback(
    (sectionIndex: number) => {
      if (!layout) return;
      scrollToY(layout.sectionTops[sectionIndex], NAVBAR_HEIGHT);
      const url = new URL(window.location.href);
      url.hash = sections[sectionIndex].slug;
      window.history.replaceState(window.history.state, '', url);
    },
    [layout, scrollToY, sections],
  );

  const openPhoto = useCallback(
    (index: number) => {
      window.history.pushState(null, '', urlWithPhoto(photos[index].photo.id));
      pushedHistoryEntry.current = true;
      setOpenIndex(index);
    },
    [photos],
  );

  const changePhoto = (index: number) => {
    window.history.replaceState(
      window.history.state,
      '',
      urlWithPhoto(photos[index].photo.id),
    );
    setOpenIndex(index);
  };

  const closePhoto = () => {
    if (pushedHistoryEntry.current) {
      pushedHistoryEntry.current = false;
      window.history.back();
    } else {
      window.history.replaceState(window.history.state, '', urlWithPhoto(null));
    }
    setOpenIndex(null);
  };

  // Stepping through photos can move far from where the lightbox was opened, so
  // bring the last photo viewed into view and put focus back on it.
  const lastOpenIndex = useRef<number | null>(null);
  if (openIndex !== null) lastOpenIndex.current = openIndex;

  const onLightboxCloseAutoFocus = (event: Event) => {
    event.preventDefault();
    const index = lastOpenIndex.current;
    if (index === null || !layout) return;

    const selector = `[data-photo-index="${index}"]`;
    const block = layout.blocks[layout.photoBlocks[index]];
    const stage = stageRef.current!;
    const viewTop = window.scrollY - stageTop() + stickyOffset;
    const viewBottom = window.scrollY - stageTop() + window.innerHeight;
    if (block.top < viewTop || block.top + block.height > viewBottom) {
      flushSync(() => {
        scrollToY(block.top);
        syncView(layout);
      });
    }
    stage.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true });
  };

  const hoverPreload = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(hoverPreload.current), []);

  const onStagePointerOver = (event: PointerEvent) => {
    clearTimeout(hoverPreload.current);
    if (event.pointerType !== 'mouse') return;
    const thumbnail = (event.target as Element).closest<HTMLElement>(
      '[data-photo-index]',
    );
    if (!thumbnail) return;
    const { photo } = photos[Number(thumbnail.dataset.photoIndex)];
    hoverPreload.current = setTimeout(
      () => preloadFullPhoto(photo),
      HOVER_PRELOAD_DELAY_MS,
    );
  };

  return (
    <div className="@container">
      {hasChapters && (
        <ChapterBar
          sections={sections}
          current={view.section}
          onSelect={goToSection}
        />
      )}
      <div
        ref={stageRef}
        className="relative -mt-10"
        onPointerOver={onStagePointerOver}
        style={layout ? { height: layout.height } : undefined}
      >
        {layout ? (
          layout.blocks
            .slice(view.first, view.last + 1)
            .map((block) => (
              <Block
                key={block.top}
                block={block}
                sections={sections}
                photos={photos}
                onOpen={openPhoto}
              />
            ))
        ) : (
          <PhotoPreview section={sections[0]} />
        )}
      </div>
      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onIndexChange={changePhoto}
          onClose={closePhoto}
          onCloseAutoFocus={onLightboxCloseAutoFocus}
        />
      )}
    </div>
  );
}

type BlockProps = {
  block: LayoutBlock;
  sections: GallerySection[];
  photos: LightboxPhoto[];
  onOpen: (photoIndex: number) => void;
};

const Block = memo(function Block({
  block,
  sections,
  photos,
  onOpen,
}: BlockProps) {
  // The rows the server already showed have nothing to wait for.
  const inPreview =
    block.kind === 'row' && block.cells[0].photoIndex < PREVIEW_PHOTOS;
  const [loadImages, setLoadImages] = useState(inPreview);
  useEffect(() => {
    if (loadImages) return;
    const timer = setTimeout(() => setLoadImages(true), IMAGE_LOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [loadImages]);

  const position = {
    position: 'absolute',
    top: block.top,
    height: block.height,
  } as const;

  if (block.kind === 'heading') {
    const section = sections[block.sectionIndex];
    return (
      <div className="inset-x-0" style={position}>
        <SectionHeading name={section.name!} count={section.photos.length} />
      </div>
    );
  }

  return (
    <>
      {block.cells.map(({ photoIndex, left, width }) => {
        const { photo, section, indexInSection } = photos[photoIndex];
        return (
          <PhotoThumbnail
            key={photo.id}
            photo={photo}
            photoIndex={photoIndex}
            label={photoLabel(section, photo, indexInSection)}
            eager={photoIndex < 6}
            deferred={!loadImages}
            onOpen={onOpen}
            style={{ ...position, left, width }}
          />
        );
      })}
    </>
  );
});
