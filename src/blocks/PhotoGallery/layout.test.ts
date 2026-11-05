import { describe, expect, it } from 'vitest';
import {
  computeLayout,
  HEADING_HEIGHT,
  ROW_GAP,
  sectionAt,
  targetRowHeight,
  visibleBlocks,
} from './layout';
import type { GallerySection } from './sections';

function section(name: string | null, sizes: [number, number][]) {
  return {
    slug: name ?? 'photos',
    name,
    alt: 'alt',
    photos: sizes.map(([width, height], i) => ({
      id: i,
      filename: `${i}.jpg`,
      width,
      height,
    })),
  } satisfies GallerySection;
}

const landscape: [number, number] = [3, 2];
const portrait: [number, number] = [2, 3];
const many = (count: number, size = landscape) =>
  Array.from({ length: count }, () => size);

const rows = (layout: ReturnType<typeof computeLayout>) =>
  layout.blocks.filter((b) => b.kind === 'row');

describe('computeLayout', () => {
  it('fills every row but the last to the exact width', () => {
    const photos = [...many(9), portrait, ...many(9), portrait, ...many(7)];
    const layout = computeLayout([section(null, photos)], 1000);

    for (const row of rows(layout).slice(0, -1)) {
      const last = row.cells.at(-1)!;
      expect(last.left + last.width).toBeCloseTo(1000);
    }
  });

  it('keeps each photo at its own aspect ratio', () => {
    const layout = computeLayout([section(null, [...many(5), portrait])], 800);

    for (const row of rows(layout)) {
      for (const cell of row.cells) {
        const photo = layout.photoBlocks[cell.photoIndex];
        expect(layout.blocks[photo]).toBe(row);
      }
    }
    const [first] = rows(layout);
    expect(first.cells[0].width / first.height).toBeCloseTo(1.5);
  });

  it('breaks rows where flex-wrap would, so the preview lines up', () => {
    // At a target of 200, each landscape photo has a basis of 300: two fit in
    // 604 with the gap, and a third needs 908.
    const layout = computeLayout([section(null, many(4))], 700);
    expect(targetRowHeight(700)).toBe(200);
    expect(rows(layout).map((r) => r.cells.length)).toEqual([2, 2]);
  });

  it('does not stretch the last row of a section', () => {
    const layout = computeLayout([section(null, many(1))], 1200);
    const [row] = rows(layout);
    expect(row.height).toBe(targetRowHeight(1200));
    expect(row.cells[0].width).toBe(row.height * 1.5);
  });

  it('shrinks a photo wider than the row to fit', () => {
    const layout = computeLayout([section(null, [[6000, 1000]])], 300);
    const [row] = rows(layout);
    expect(row.cells[0].width).toBeCloseTo(300);
    expect(row.height).toBeCloseTo(50);
  });

  it('adds a heading only for named sections and records section tops', () => {
    const layout = computeLayout(
      [section(null, many(1)), section('Dancing', many(1))],
      1200,
    );
    const rowHeight = targetRowHeight(1200) + ROW_GAP;

    expect(layout.blocks.map((b) => b.kind)).toEqual(['row', 'heading', 'row']);
    expect(layout.sectionTops).toEqual([0, rowHeight]);
    expect(layout.height).toBe(rowHeight * 2 + HEADING_HEIGHT);
  });

  it('numbers photos in order across sections', () => {
    const layout = computeLayout(
      [section('A', many(3)), section('B', many(3))],
      700,
    );
    const indexes = rows(layout).flatMap((r) =>
      r.cells.map((c) => c.photoIndex),
    );
    expect(indexes).toEqual([0, 1, 2, 3, 4, 5]);
    expect(layout.photoBlocks).toHaveLength(6);
  });

  it('handles thousands of photos quickly', () => {
    const sections = Array.from({ length: 36 }, (_, i) =>
      section(`Section ${i}`, many(133)),
    );
    const start = performance.now();
    const layout = computeLayout(sections, 1280);
    expect(performance.now() - start).toBeLessThan(50);
    expect(layout.photoBlocks).toHaveLength(36 * 133);
  });
});

describe('visibleBlocks', () => {
  const layout = computeLayout([section(null, many(200))], 620);

  it('returns only the blocks overlapping the range', () => {
    const [first, last] = visibleBlocks(layout, 500, 1000);
    const { blocks } = layout;

    expect(blocks[first].top + blocks[first].height).toBeGreaterThan(500);
    expect(
      blocks[first - 1].top + blocks[first - 1].height,
    ).toBeLessThanOrEqual(500);
    expect(blocks[last].top).toBeLessThan(1000);
    expect(blocks[last + 1].top).toBeGreaterThanOrEqual(1000);
  });

  it('clamps ranges outside the gallery', () => {
    expect(visibleBlocks(layout, -2000, -1000)).toEqual([0, -1]);
    const [first, last] = visibleBlocks(layout, 1e7, 2e7);
    expect(first).toBe(layout.blocks.length);
    expect(last).toBe(layout.blocks.length - 1);
  });
});

describe('sectionAt', () => {
  const layout = computeLayout(
    [section('A', many(4)), section('B', many(4)), section('C', many(4))],
    700,
  );

  it('finds the section containing a position', () => {
    const [, b, c] = layout.sectionTops;
    expect(sectionAt(layout, -50)).toBe(0);
    expect(sectionAt(layout, b - 1)).toBe(0);
    expect(sectionAt(layout, b)).toBe(1);
    expect(sectionAt(layout, c + 1)).toBe(2);
    expect(sectionAt(layout, 1e7)).toBe(2);
  });
});
