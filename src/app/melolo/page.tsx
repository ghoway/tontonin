import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';
import { getMeloloForYou, getMeloloLatest, getMeloloTrending } from '@/lib/api';

export const revalidate = 300;

async function ForYouSection() {
  const data = await getMeloloForYou();
  const dramas = Array.isArray(data) ? data : [];

  return (
    <Section title="Untuk Kamu">
      {dramas.slice(0, 12).map((drama: any, idx: number) => (
        <DramaCard
          key={`${drama.bookId || idx}`}
          id={drama.bookId || ''}
          title={drama.bookName || 'Unknown'}
          image={drama.coverWap || '/placeholder.png'}
          episodes={drama.chapterCount}
          views={drama.playCount}
          type="melolo"
        />
      ))}
    </Section>
  );
}

async function LatestSection() {
  const data = await getMeloloLatest();
  const dramas = Array.isArray(data) ? data : [];

  return (
    <Section title="Terbaru">
      {dramas.slice(0, 12).map((drama: any, idx: number) => (
        <DramaCard
          key={`${drama.bookId || idx}`}
          id={drama.bookId || ''}
          title={drama.bookName || 'Unknown'}
          image={drama.coverWap || '/placeholder.png'}
          episodes={drama.chapterCount}
          views={drama.playCount}
          type="melolo"
        />
      ))}
    </Section>
  );
}

async function TrendingSection() {
  const data = await getMeloloTrending();
  const dramas = Array.isArray(data) ? data : [];

  return (
    <Section title="Trending">
      {dramas.slice(0, 12).map((drama: any, idx: number) => (
        <DramaCard
          key={`${drama.bookId || idx}`}
          id={drama.bookId || ''}
          title={drama.bookName || 'Unknown'}
          image={drama.coverWap || '/placeholder.png'}
          episodes={drama.chapterCount}
          views={drama.playCount}
          type="melolo"
        />
      ))}
    </Section>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-8">
          <div className="h-8 bg-zinc-800 rounded w-32 mb-4 animate-pulse ml-2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-60 bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function MeloloPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        
        <div className="mt-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <ForYouSection />
          </Suspense>
          
          <Suspense fallback={<LoadingSkeleton />}>
            <LatestSection />
          </Suspense>
          
          <Suspense fallback={<LoadingSkeleton />}>
            <TrendingSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
