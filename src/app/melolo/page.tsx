import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { Section } from '@/components/Section';
import { ExpandableDramaSection } from '@/components/ExpandableDramaSection';
import { PaginatedDramaSection } from '@/components/PaginatedDramaSection';
import { getMeloloDetail, getMeloloForYou, getMeloloLatest, getMeloloSearch, getMeloloTrending } from '@/lib/api';

export const revalidate = 300;

function pickMeloloDetailObject(input: any): any | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.video_data,
    input.data?.book,
    input.data?.detail,
    input.data,
    input.result,
    input.book,
    input.detail,
    input,
  ];

  for (const c of candidates) {
    if (c && typeof c === 'object' && !Array.isArray(c)) return c;
  }

  return null;
}

async function enrichMeloloCovers(dramas: any[]): Promise<any[]> {
  if (!Array.isArray(dramas) || dramas.length === 0) return [];

  return Promise.all(
    dramas.map(async (drama) => {
      const hasRenderableCover = Boolean(
        drama?.series_cover || drama?.book_pic || drama?.first_chapter_cover || drama?.cover || drama?.coverWap
      );

      if (hasRenderableCover) return drama;

      const id = drama?.bookId || drama?.book_id || drama?.series_id_str;
      if (!id || typeof id !== 'string') return drama;

      try {
        const detail = await getMeloloDetail(id);
        const obj = pickMeloloDetailObject(detail);
        if (!obj) return drama;

        return {
          ...drama,
          series_cover: obj.series_cover || drama.series_cover,
          book_pic: obj.book_pic || drama.book_pic,
          first_chapter_cover: obj.first_chapter_cover || drama.first_chapter_cover,
        };
      } catch {
        return drama;
      }
    })
  );
}

async function ForYouSection() {
  const data = await getMeloloForYou();
  const dramas = Array.isArray(data) ? data : [];
  const withCover = await enrichMeloloCovers(dramas);

  return <ExpandableDramaSection title="Untuk Kamu" dramas={withCover} type="melolo" />;
}

async function LatestSection() {
  const data = await getMeloloLatest();
  const dramas = Array.isArray(data) ? data : [];
  const withCover = await enrichMeloloCovers(dramas);

  return <ExpandableDramaSection title="Terbaru" dramas={withCover} type="melolo" />;
}

async function TrendingSection() {
  const data = await getMeloloTrending();
  const dramas = Array.isArray(data) ? data : [];
  const withCover = await enrichMeloloCovers(dramas);

  return <ExpandableDramaSection title="Trending" dramas={withCover} type="melolo" />;
}

async function LainnyaSection() {
  const latest = await getMeloloLatest();
  const dramas = Array.isArray(latest) ? latest : [];
  const withCover = await enrichMeloloCovers(dramas);

  return (
    <PaginatedDramaSection
      title="Lainnya"
      initialDramas={withCover}
      type="melolo"
      fetchEndpoint="/api/melolo/foryou"
    />
  );
}

async function SearchSection({ query }: { query: string }) {
  const data = await getMeloloSearch(query);
  const dramas = Array.isArray(data) ? data : [];

  return (
    <>
      <div className="text-zinc-400 mb-4 ml-2">Hasil pencarian: "{query}"</div>
      <ExpandableDramaSection title="Hasil Pencarian" dramas={dramas} type="melolo" initialVisible={18} />
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

export default async function MeloloPage({
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

              <Suspense fallback={<LoadingSkeleton />}>
                <LainnyaSection />
              </Suspense>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
