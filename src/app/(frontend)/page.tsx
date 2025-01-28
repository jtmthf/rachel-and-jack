import Image from 'next/image';
import engagement from './engagement.png';

export default function Home() {
  return (
    <main className="flex items-center justify-center">
      <div className="relative min-h-screen w-full">
        <Image
          alt="Engagement"
          src={engagement}
          placeholder="blur"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>
    </main>
  );
}
