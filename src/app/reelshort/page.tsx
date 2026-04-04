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
      {dramas.length === 0 ? (
        <p className="text-zinc-400">Belum ada data</p>
      ) : (
        dramas.slice(0, 18).map((drama: any, idx: number) => (
          <DramaCard
            key={`${drama.bookId || drama.id || idx}`}
            id={drama.bookId || drama.id || ''}
            title={drama.bookName || drama.title || drama.name || 'Unknown'}
            image={drama.coverWap || drama.poster || drama.cover || drama.image || '/placeholder.png'}
            episodes={drama.chapterCount || drama.episodeCount || drama.episodes}
            views={drama.playCount || drama.views}
            type="reelshort"
          />
        ))
      )}
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
