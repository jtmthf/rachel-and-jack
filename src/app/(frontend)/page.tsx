import { cn } from '@/lib/utils';
import { siteConfig } from '@/site.config';
import { Imperial_Script } from 'next/font/google';
import Image from 'next/image';
import engagement from './engagement.png';

const imperialScript = Imperial_Script({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-16 sm:px-8 lg:px-16">
      <div className="mb-16 text-center">
        <h1 className={cn('text-6xl sm:text-8xl', imperialScript.className)}>
          {siteConfig.names}
          <br />
          are getting married!
        </h1>
      </div>
      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <div className="flex basis-1/2 flex-col">
          <h2 className="text-2xl font-light uppercase">{siteConfig.date}</h2>
          <h3 className="text-lg font-light uppercase">
            {siteConfig.venue} &bull; {siteConfig.location}
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
