import type { GallerySection } from './sections';

/**
 * Justified rows, worked out from each photo's stored dimensions so nothing has
 * to be measured in the browser. The page height and the position of every
 * photo are known up front, which is what lets the gallery render only the rows
 * near the viewport and jump straight to any section.
 *
 * PhotoPreview draws the same rows in CSS for the server-rendered page. Keep
 * the row-breaking rule here in step with flex-wrap, so the two line up.
 */

export const ROW_GAP = 4;
// Tall enough that a section's name clears the chapter bar after a jump.
export const HEADING_HEIGHT = 140;

// Keep in step with the container query classes in PhotoPreview.
export function targetRowHeight(width: number) {
  // Low enough for two landscape photos side by side on a phone.
  if (width < 640) return 100;
  if (width < 1100) return 200;
  return 260;
}

export type PhotoCell = { photoIndex: number; left: number; width: number };

export type LayoutBlock =
  | { kind: 'heading'; sectionIndex: number; top: number; height: number }
  | { kind: 'row'; top: number; height: number; cells: PhotoCell[] };

export type GalleryLayout = {
  blocks: LayoutBlock[];
  height: number;
  /** Top of each section, indexed like the sections passed in. */
  sectionTops: number[];
  /** Index into `blocks` of the row holding each photo. */
  photoBlocks: number[];
};

export function computeLayout(
  sections: GallerySection[],
  width: number,
): GalleryLayout {
  const target = targetRowHeight(width);
  const blocks: LayoutBlock[] = [];
  const sectionTops: number[] = [];
  const photoBlocks: number[] = [];
  let top = 0;
  let photoIndex = 0;

  const addRow = (aspects: number[], isLast: boolean) => {
    const gaps = ROW_GAP * (aspects.length - 1);
    const sum = aspects.reduce((total, aspect) => total + aspect, 0);
    const fill = (width - gaps) / sum;
    // Only the last row of a section may leave space, rather than stretch.
    const height = isLast ? Math.min(target, fill) : fill;

    let left = 0;
    const firstIndex = photoIndex;
    const cells = aspects.map((aspect, i) => {
      const cell = {
        photoIndex: firstIndex + i,
        left,
        width: aspect * height,
      };
      left += cell.width + ROW_GAP;
      photoBlocks.push(blocks.length);
      return cell;
    });
    photoIndex += aspects.length;

    blocks.push({ kind: 'row', top, height, cells });
    top += height + ROW_GAP;
  };

  sections.forEach((section, sectionIndex) => {
    sectionTops.push(top);
    if (section.name) {
      blocks.push({
        kind: 'heading',
        sectionIndex,
        top,
        height: HEADING_HEIGHT,
      });
      top += HEADING_HEIGHT;
    }

    let aspects: number[] = [];
    let used = 0;
    for (const photo of section.photos) {
      const aspect = photo.width / photo.height;
      const basis = aspect * target;
      if (aspects.length > 0 && used + ROW_GAP + basis > width) {
        addRow(aspects, false);
        aspects = [];
        used = 0;
      }
      used += (aspects.length > 0 ? ROW_GAP : 0) + basis;
      aspects.push(aspect);
    }
    if (aspects.length > 0) addRow(aspects, true);
  });

  return { blocks, height: top, sectionTops, photoBlocks };
}

/** The blocks overlapping `start` to `end`, as an inclusive index range. */
export function visibleBlocks(
  { blocks }: GalleryLayout,
  start: number,
  end: number,
): [first: number, last: number] {
  let low = 0;
  let high = blocks.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (blocks[mid].top + blocks[mid].height <= start) low = mid + 1;
    else high = mid;
  }
  const first = low;

  high = blocks.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (blocks[mid].top < end) low = mid + 1;
    else high = mid;
  }
  return [first, low - 1];
}

/** The last section starting at or above `y`. */
export function sectionAt({ sectionTops }: GalleryLayout, y: number) {
  let low = 0;
  let high = sectionTops.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (sectionTops[mid] <= y) low = mid;
    else high = mid - 1;
  }
  return low;
}
