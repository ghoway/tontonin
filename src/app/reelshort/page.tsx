import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';
import { getReelShortForYou } from '@/lib/api';

export const revalidate = 300;

async function ForYouSection() {
  const data = await getReelShortForYou(1);
  const dramas = Array.isArray(data) ? data : [];

  return (
    <Section title="Untuk Kamu">
      {dramas.slice(0, 18).map((drama: any, idx: number) => (
        <DramaCard
          key={`${drama.bookId || idx}`}
          id={drama.bookId || ''}
          title={drama.bookName || 'Unknown'}
          image={drama.coverWap || '/placeholder.png'}
          episodes={drama.chapterCount}
          views={drama.playCount}
          type="reelshort"
        />
      ))}
    </Section>
  );
}

function LoadingSkeleton() {
  return (
    <Section title="Untuk Kamu">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="h-60 bg-zinc-800 rounded-lg animate-pulse" />
      ))}
    </Section>
  );
}

export default function ReelShortPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        
        <div className="mt-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <ForYouSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
