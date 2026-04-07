import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';
import { LoadMoreDramaSection } from '@/components/LoadMoreDramaSection';
import { getNetShortForYou, getNetShortTheaters } from '@/lib/api';

export const revalidate = 300;

async function ForYouSection() {
  const data = await getNetShortForYou(1);
  const dramas = Array.isArray(data) ? data : [];

  return (
    <Section title="Untuk Kamu">
      {dramas.slice(0, 18).map((drama: any, idx: number) => (
        <DramaCard
          key={`${drama.shortPlayId || drama.bookId || idx}`}
          id={drama.shortPlayId || drama.bookId || ''}
          title={drama.shortPlayName || drama.bookName || 'Unknown'}
          image={drama.shortPlayCover || drama.coverWap || '/placeholder.svg'}
          views={drama.heatScoreShow || drama.playCount}
          type="netshort"
        />
      ))}
    </Section>
  );
}

async function LainnyaSection() {
  const data = await getNetShortTheaters();
  const dramas = Array.isArray(data) ? data : [];

  return <LoadMoreDramaSection title="Lainnya" dramas={dramas} type="netshort" initialVisible={12} loadStep={6} />;
}

function LoadingSkeleton() {
  return (
    <>
      {['Untuk Kamu', 'Lainnya'].map((title) => (
        <Section key={title} title={title}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="h-60 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </Section>
      ))}
    </>
  );
}

export default function NetShortPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        
        <div className="mt-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <ForYouSection />
          </Suspense>

          <Suspense fallback={<LoadingSkeleton />}>
            <LainnyaSection />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
