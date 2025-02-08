import { cn } from '@/lib/utils';
import { Imperial_Script as Inter } from 'next/font/google';
import Image from 'next/image';
import engagement from './engagement.png';

const inter = Inter({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function Home() {
  return (
    <main className="min-h-screen bg-orange-50 px-4 py-16 sm:px-8 lg:px-16">
      <div className="mb-16 text-center">
        <h1 className={cn('text-6xl sm:text-8xl', inter.className)}>
          Rachel & Jack
          <br />
          are getting married!
        </h1>
      </div>
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <div className="flex basis-1/2 flex-col">
          <h2 className="text-2xl font-light uppercase">September 6, 2025</h2>
          <h3 className="text-lg font-light uppercase">
            Schermerhorn Symphony Center &bull; Nashville, Tennessee
          </h3>
        </div>
        <div className="basis-1/2">
          <Image
            alt="Engagement"
            src={engagement}
            placeholder="blur"
            priority
          />
        </div>
      </div>
    </main>
  );
}
