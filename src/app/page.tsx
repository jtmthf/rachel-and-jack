import Image from 'next/image';
import engagement from './engagement.png';

export default function Home() {
  return (
    <main>
      <Image
        alt="Engagement"
        src={engagement}
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: 'cover',
        }}
      />
    </main>
  );
}
