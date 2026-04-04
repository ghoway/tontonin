import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';
import { LainnyaSection } from '@/components/LainnyaSection';
import { getDramaBoxForYou, getDramaBoxLatest, getDramaBoxTrending } from '@/lib/api';

export const revalidate = 300;

function DubIndoSection({ dramas }: { dramas: any[] }) {
  if (dramas.length === 0) return null;

  return (
    <Section title="Dub Indo">
      {dramas.slice(0, 18).map((drama: any, idx: number) => (
        <DramaCard
          key={`dub-${drama.bookId || idx}`}
          id={drama.bookId || ''}
          title={drama.bookName || 'Unknown'}
          image={drama.coverWap || '/placeholder.svg'}
          episodes={drama.chapterCount}
          views={drama.playCount}
          type="dramabox"
        />
      ))}
    </Section>
  );
}

function TrendingSection({ dramas }: { dramas: any[] }) {
  if (dramas.length === 0) return null;

  return (
    <Section title="Trending">
      {dramas.slice(0, 18).map((drama: any, idx: number) => (
        <DramaCard
          key={`trending-${drama.bookId || idx}`}
          id={drama.bookId || ''}
          title={drama.bookName || 'Unknown'}
          image={drama.coverWap || '/placeholder.svg'}
          episodes={drama.chapterCount}
          views={drama.playCount}
          type="dramabox"
        />
      ))}
    </Section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, sectionIdx) => (
        <Section key={sectionIdx} title="Loading...">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="h-60 bg-zinc-800 rounded-lg animate-pulse"
            />
          ))}
        </Section>
      ))}
    </div>
  );
}

async function HomeContent() {
  const [latestData, trendingData, lainnyaData] = await Promise.all([
    getDramaBoxLatest(),
    getDramaBoxTrending(),
    getDramaBoxForYou(1),
  ]);

  const latestDramas = Array.isArray(latestData) ? latestData : [];
  const trendingDramas = Array.isArray(trendingData) ? trendingData : [];
  const lainnyaDramas = Array.isArray(lainnyaData) ? lainnyaData : [];

  return (
    <>
      <DubIndoSection dramas={latestDramas} />
      <TrendingSection dramas={trendingDramas} />
      <LainnyaSection dramas={lainnyaDramas} />
    </>
  );
}

export default function Home() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <Navigation />

        {/* Main Content */}
        <div className="mt-8 space-y-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <HomeContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
