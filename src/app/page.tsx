import Image from 'next/image';
import engagement from './engagement.png';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Image
        alt="Engagement"
        src={engagement}
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        className="-z-10 object-cover"
      />
    </main>
  );
}
