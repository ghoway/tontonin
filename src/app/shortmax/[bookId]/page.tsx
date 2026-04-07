import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { getShortMaxDetail } from '@/lib/api';

export const revalidate = 300;

function pickShortMaxDetailObject(input: any): any | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.detail,
    input.data?.result,
    input.data,
    input.result,
    input.detail,
    input,
  ];

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) return candidate;
  }

  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string') as string[];
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

export default async function DetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const detailData = await getShortMaxDetail(bookId);
  const drama = pickShortMaxDetailObject(detailData);

  if (!drama) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/shortmax" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = drama.shortPlayName || drama.name || drama.bookName || drama.title || 'Unknown';
  const poster = drama.picUrl || drama.cover || drama.coverWap || drama.poster || drama.image || '';
  const hasPoster = typeof poster === 'string' && poster.trim().length > 0;
  const synopsis = drama.summary || drama.introduction || drama.description || drama.synopsis || 'No synopsis available';
  const genres = toStringArray(drama.tags || drama.genres || drama.labels || drama.categoryNames);
  const episodeCount = Number(drama.totalEpisodes || drama.chapterCount || drama.episodeCount || 0);

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-6">
          <Link
            href="/shortmax"
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
                <Link
                  href={`/shortmax/${bookId}/watch`}
                  prefetch={false}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-5 py-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg shadow-violet-700/30"
                >
                  ▶ Mulai Tonton
                </Link>
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
                {genres.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm mb-2 font-semibold bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Genre</p>
                    <div className="flex flex-wrap gap-2">
                      {genres.slice(0, 6).map((genre, idx) => (
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

            <Link
              href={`/shortmax/${bookId}/watch`}
              prefetch={false}
              className="w-full block bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-700/30 active:translate-y-0 transition-all duration-200 text-center"
            >
              ▶ Mulai Tonton
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
