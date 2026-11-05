import { describe, expect, it } from 'vitest';
import { buildSections } from './sections';

const photo = (id: number, folder: number, alt = 'Wedding') => ({
  id,
  alt,
  filename: `${id}.jpg`,
  width: 300,
  height: 200,
  folder,
});

describe('buildSections', () => {
  it('groups photos under folders and keeps both orders', () => {
    const sections = buildSections(
      [
        { id: 2, name: 'Ceremony' },
        { id: 1, name: 'Dancing' },
      ],
      [photo(10, 1), photo(11, 2), photo(12, 1)],
    );

    expect(sections.map((s) => s.name)).toEqual(['Ceremony', 'Dancing']);
    expect(sections[1].photos.map((p) => p.id)).toEqual([10, 12]);
  });

  it('passes on placeholders and leaves out empty ones', () => {
    const [section] = buildSections(
      [{ id: 1, name: 'Dancing' }],
      [
        { ...photo(10, 1), placeholder: 'abc' },
        { ...photo(11, 1), placeholder: null },
      ],
    );

    expect(section.photos[0].placeholder).toBe('abc');
    expect(section.photos[1]).not.toHaveProperty('placeholder');
  });

  it('leaves out folders without photos and photos without files', () => {
    const sections = buildSections(
      [
        { id: 1, name: 'Empty' },
        { id: 2, name: 'Full' },
      ],
      [{ ...photo(10, 2), filename: null }, photo(11, 2)],
    );

    expect(sections.map((s) => s.name)).toEqual(['Full']);
    expect(sections[0].photos.map((p) => p.id)).toEqual([11]);
  });

  it('creates unique, readable slugs', () => {
    const sections = buildSections(
      [
        { id: 1, name: 'Bride & Groom' },
        { id: 2, name: 'Bride, Groom' },
        { id: 3, name: null },
      ],
      [photo(10, 1), photo(11, 2), photo(12, 3)],
    );

    expect(sections.map((s) => s.slug)).toEqual([
      'bride-groom',
      'bride-groom-2',
      'photos',
    ]);
  });

  it('only stores alt text on a photo when it differs from the section', () => {
    const [section] = buildSections(
      [{ id: 1, name: 'Toasts' }],
      [photo(10, 1, 'Toasts'), photo(11, 1, 'Maid of honor speaking')],
    );

    expect(section.alt).toBe('Toasts');
    expect(section.photos[0]).not.toHaveProperty('alt');
    expect(section.photos[1].alt).toBe('Maid of honor speaking');
  });

  it('assumes a 3:2 photo when dimensions are missing', () => {
    const [section] = buildSections(
      [{ id: 1, name: 'A' }],
      [{ ...photo(10, 1), width: null, height: null }],
    );

    expect(section.photos[0]).toMatchObject({ width: 3, height: 2 });
  });
});
