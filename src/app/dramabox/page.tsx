import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { ExpandableDramaSection } from '@/components/ExpandableDramaSection';
import { getDramaBoxForYou, getDramaBoxLatest, getDramaBoxSearch, getDramaBoxTrending } from '@/lib/api';

export const revalidate = 300;

async function ForYouSection() {
  const data = await getDramaBoxForYou(1);
  const dramas = Array.isArray(data) ? data : [];

  return <ExpandableDramaSection title="Untuk Kamu" dramas={dramas} type="dramabox" />;
}

async function LatestSection() {
  const data = await getDramaBoxLatest();
  const dramas = Array.isArray(data) ? data : [];

  return <ExpandableDramaSection title="Terbaru" dramas={dramas} type="dramabox" />;
}

async function TrendingSection() {
  const data = await getDramaBoxTrending();
  const dramas = Array.isArray(data) ? data : [];

  return <ExpandableDramaSection title="Trending" dramas={dramas} type="dramabox" />;
}

async function SearchSection({ query }: { query: string }) {
  const data = await getDramaBoxSearch(query);
  const dramas = Array.isArray(data) ? data : [];

  return (
    <>
      <div className="text-zinc-400 mb-4 ml-2">Hasil pencarian: "{query}"</div>
      <ExpandableDramaSection title="Hasil Pencarian" dramas={dramas} type="dramabox" initialVisible={18} loadStep={9} />
    </>
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

export default async function DramaBoxPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || '';

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        
        <div className="mt-8">
          {query ? (
            <Suspense fallback={<LoadingSkeleton />}>
              <SearchSection query={query} />
            </Suspense>
          ) : (
            <>
              <Suspense fallback={<LoadingSkeleton />}>
                <ForYouSection />
              </Suspense>
              
              <Suspense fallback={<LoadingSkeleton />}>
                <LatestSection />
              </Suspense>
              
              <Suspense fallback={<LoadingSkeleton />}>
                <TrendingSection />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
