import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
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

  const drama = Array.isArray(detailData) ? detailData[0] : detailData;

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

  const title = drama.title || drama.bookName || 'Unknown';
  const poster = drama.cover || drama.coverWap || drama.poster || '';
  const synopsis = drama.description || drama.introduction || drama.synopsis || 'No synopsis available';
  const genres = drama.genres || drama.tags || [];
  const episodeCount = drama.subtitle ? (Array.isArray(drama.subtitle) ? drama.subtitle.length : 0) : 0;

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <Link href="/dramanova" prefetch={false} className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          ← Kembali
        </Link>

        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="rounded-lg overflow-hidden bg-zinc-800 sticky top-20">
              <img
                src={poster || '/placeholder.svg'}
                alt={title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>

            <div className="space-y-4 mb-6">
              {synopsis && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sinopsis</h3>
                  <p className="text-zinc-300 leading-relaxed">{synopsis}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {episodeCount && (
                  <div>
                    <p className="text-zinc-400 text-sm">Total Episode</p>
                    <p className="text-white text-xl font-semibold">{episodeCount}</p>
                  </div>
                )}
                {genres && genres.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-zinc-400 text-sm mb-2">Genre</p>
                    <div className="flex flex-wrap gap-2">
                      {genres.slice(0, 4).map((genre: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link
              href={`/dramanova/${id}/watch`}
              prefetch={false}
              className="w-full block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center"
            >
              ▶ Mulai Tonton
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
