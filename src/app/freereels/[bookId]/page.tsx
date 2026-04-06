import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { getFreeReelsDetailAndAllEpisode } from '@/lib/api';

export const revalidate = 300;

function pickFreeReelsDetailObject(input: any, key: string): any | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    return input.find((item) => item?.key === key) || input[0] || null;
  }
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.info,
    input.data?.detail,
    input.data?.item,
    input.data?.info,
    input.data,
    input.result,
    input.detail,
    input,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const matched = candidate.find((item) => item?.key === key);
      if (matched) return matched;
      if (candidate[0] && typeof candidate[0] === 'object') return candidate[0];
    }
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) return candidate;
  }

  return null;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}

export default async function DetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const detailData = await getFreeReelsDetailAndAllEpisode(bookId);
  const drama = pickFreeReelsDetailObject(detailData, bookId);

  if (!drama) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/freereels" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = drama.name || drama.title || drama.bookName || 'Unknown';
  const poster = drama.cover || drama.coverWap || drama.poster || drama.image || '';
  const hasPoster = typeof poster === 'string' && poster.trim().length > 0;
  const synopsis = drama.desc || drama.introduction || drama.description || drama.synopsis || 'No synopsis available';
  const genres = toStringArray(
    drama.content_tags ||
      drama.content_detail_tags ||
      drama.tag ||
      drama.tags ||
      drama.genres ||
      drama.series_tag
  );
  const episodeCount = Number(
    drama.episode_count || drama.chapterCount || drama.episodeCount || drama.episode || drama.pay_index || 0
  );

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className={`mt-8 grid ${hasPoster ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-8`}>
          {hasPoster && (
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden bg-zinc-800 sticky top-20">
                <img src={poster} alt={title} className="w-full h-auto object-cover" />
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
              href={`/freereels/${bookId}/watch`}
              prefetch={false}
              className="w-full block bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              ▶ Mulai Tonton
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
