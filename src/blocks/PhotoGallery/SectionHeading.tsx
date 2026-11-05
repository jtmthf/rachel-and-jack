import { Baskervville_SC } from 'next/font/google';
import { HEADING_HEIGHT } from './layout';

const baskerville = Baskervville_SC({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export function SectionHeading({
  name,
  count,
}: {
  name: string;
  count: number;
}) {
  return (
    <div
      className="flex flex-col items-center justify-end pb-4 text-center"
      style={{ height: HEADING_HEIGHT }}
    >
      <h3 className={`text-2xl sm:text-3xl ${baskerville.className}`}>
        {name}
      </h3>
      <p className="text-foreground/70 text-sm">
        {count.toLocaleString('en-US')} {count === 1 ? 'photo' : 'photos'}
      </p>
    </div>
  );
}
