import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { AgeRestrictionStartButton } from '@/components/AgeRestrictionStartButton';
import { getDramaNovaDetail } from '@/lib/api';

export const revalidate = 300;

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detailData = await getDramaNovaDetail(id);

  if (!detailData) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/dramanova" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const detailRoot = (detailData && typeof detailData === 'object') ? (detailData as Record<string, any>) : {};
  const drama =
    (detailRoot.data && typeof detailRoot.data === 'object' ? detailRoot.data : null) ||
    (Array.isArray(detailData) ? detailData[0] : detailData);

  if (!drama) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/dramanova" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = drama.title || drama.name || drama.bookName || 'Unknown';
  const poster = drama.posterImg || drama.posterImgUrl || drama.cover || drama.coverWap || drama.poster || '';
  const hasPoster = typeof poster === 'string' && poster.trim().length > 0;
  const synopsis = drama.synopsis || drama.description || drama.introduction || 'No synopsis available';
  const genres = drama.categoryNames || drama.genres || drama.tags || [];
  const episodeCount = Number(
    drama.totalEpisodes ||
      (Array.isArray(drama.episodes) ? drama.episodes.length : 0) ||
      (Array.isArray(drama.subtitle) ? drama.subtitle.length : 0) ||
      0
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-6">
          <Link
            href="/dramanova"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            ← Kembali
          </Link>
        </div>

        <div className={`mt-4 grid ${hasPoster ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-8`}>
          {hasPoster && (
            <div className="md:col-span-1">
              <div className="group relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-800 sticky top-20 shadow-lg">
                <img
                  src={poster}
                  alt={title}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[70%] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <AgeRestrictionStartButton href={`/dramanova/${id}/watch`} className="py-2 text-sm" />
                </div>
              </div>
            </div>
          )}

          <div className={hasPoster ? 'md:col-span-2' : 'md:col-span-1'}>
            <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>

            <div className="space-y-4 mb-6">
              {synopsis && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sinopsis</h3>
                  <p className="text-zinc-300 leading-relaxed">{synopsis}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {episodeCount > 0 && (
                  <div>
                    <p className="text-zinc-400 text-sm">Total Episode</p>
                    <p className="text-white text-xl font-semibold">{episodeCount}</p>
                  </div>
                )}
                {Array.isArray(genres) && genres.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm mb-2 font-semibold bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Genre</p>
                    <div className="flex flex-wrap gap-2">
                      {genres.slice(0, 4).map((genre: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-linear-to-r from-violet-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <AgeRestrictionStartButton href={`/dramanova/${id}/watch`} />
          </div>
        </div>
      </div>
    </div>
  );
}
