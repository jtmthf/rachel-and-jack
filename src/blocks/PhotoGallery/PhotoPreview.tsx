import { photoLabel } from './photo-label';
import { PhotoThumbnail } from './PhotoThumbnail';
import { SectionHeading } from './SectionHeading';
import type { GallerySection } from './sections';

export const PREVIEW_PHOTOS = 30;
const EAGER_PHOTOS = 6;

/**
 * What the server sends: the top of the first section, in rows that need no
 * JavaScript. The browser wraps them with the same rule as `computeLayout`, so
 * the virtualized grid takes over without the photos moving.
 */
export function PhotoPreview({ section }: { section: GallerySection }) {
  return (
    <div className="h-[150vh] overflow-hidden">
      {section.name && (
        <SectionHeading name={section.name} count={section.photos.length} />
      )}
      <div className="flex flex-wrap gap-1 [--row:100px] @min-[640px]:[--row:200px] @min-[1100px]:[--row:260px]">
        {section.photos.slice(0, PREVIEW_PHOTOS).map((photo, index) => {
          const aspect = photo.width / photo.height;
          return (
            <PhotoThumbnail
              key={photo.id}
              photo={photo}
              photoIndex={index}
              label={photoLabel(section, photo, index)}
              eager={index < EAGER_PHOTOS}
              className="min-w-0"
              style={{
                aspectRatio: aspect,
                flexGrow: aspect,
                flexShrink: 1,
                flexBasis: `calc(${aspect} * var(--row))`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
