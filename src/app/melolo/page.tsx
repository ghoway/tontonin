import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';
import { getMeloloForYou, getMeloloLatest, getMeloloTrending } from '@/lib/api';

export const revalidate = 300;

async function ForYouSection() {
  const data = await getMeloloForYou();
  const dramas = Array.isArray(data) ? data : [];

  // Debug: Check first item structure
  if (dramas.length > 0) {
    console.log('[MeloloForYou] First item:', JSON.stringify(dramas[0], null, 2));
  }

  return (
    <Section title="Untuk Kamu">
      {dramas.length === 0 ? (
        <p className="text-zinc-400">Belum ada data</p>
      ) : (
        dramas.slice(0, 12).map((drama: any, idx: number) => (
          <DramaCard
            key={`${drama.bookId || drama.id || idx}`}
            id={drama.bookId || drama.id || ''}
            title={drama.bookName || drama.title || drama.name || 'Unknown'}
            image={drama.coverWap || drama.poster || drama.cover || drama.image || '/placeholder.png'}
            episodes={drama.chapterCount || drama.episodeCount || drama.episodes}
            views={drama.playCount || drama.views}
            type="melolo"
          />
        ))
      )}
    </Section>
  );
}

async function LatestSection() {
  const data = await getMeloloLatest();
  const dramas = Array.isArray(data) ? data : [];

  return (
    <Section title="Terbaru">
      {dramas.length === 0 ? (
        <p className="text-zinc-400">Belum ada data</p>
      ) : (
        dramas.slice(0, 12).map((drama: any, idx: number) => (
          <DramaCard
            key={`${drama.bookId || drama.id || idx}`}
            id={drama.bookId || drama.id || ''}
            title={drama.bookName || drama.title || drama.name || 'Unknown'}
            image={drama.coverWap || drama.poster || drama.cover || drama.image || '/placeholder.png'}
            episodes={drama.chapterCount || drama.episodeCount || drama.episodes}
            views={drama.playCount || drama.views}
            type="melolo"
          />
        ))
      )}
    </Section>
  );
}

async function TrendingSection() {
  const data = await getMeloloTrending();
  const dramas = Array.isArray(data) ? data : [];

  return (
    <Section title="Trending">
      {dramas.length === 0 ? (
        <p className="text-zinc-400">Belum ada data</p>
      ) : (
        dramas.slice(0, 12).map((drama: any, idx: number) => (
          <DramaCard
            key={`${drama.bookId || drama.id || idx}`}
            id={drama.bookId || drama.id || ''}
            title={drama.bookName || drama.title || drama.name || 'Unknown'}
            image={drama.coverWap || drama.poster || drama.cover || drama.image || '/placeholder.png'}
            episodes={drama.chapterCount || drama.episodeCount || drama.episodes}
            views={drama.playCount || drama.views}
            type="melolo"
          />
        ))
      )}
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
