import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { ExpandableDramaSection } from '@/components/ExpandableDramaSection';
import { getReelShortForYou, getReelShortSearch } from '@/lib/api';

export const revalidate = 300;

async function ForYouSection() {
  const data = await getReelShortForYou(1);
  const dramas = Array.isArray(data) ? data : [];

  return <ExpandableDramaSection title="Untuk Kamu" dramas={dramas} type="reelshort" initialVisible={18} loadStep={9} />;
}

async function SearchSection({ query }: { query: string }) {
  const data = await getReelShortSearch(query);
  const dramas = Array.isArray(data) ? data : [];

  return (
    <>
      <div className="text-zinc-400 mb-4 ml-2">Hasil pencarian: "{query}"</div>
      <ExpandableDramaSection title="Hasil Pencarian" dramas={dramas} type="reelshort" initialVisible={18} loadStep={9} />
    </>
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

export default async function ReelShortPage({
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
            <Suspense fallback={<LoadingSkeleton />}>
              <ForYouSection />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
