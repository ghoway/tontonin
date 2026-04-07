import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { getMeloloDetail } from '@/lib/api';

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

function normalizeImageUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return '';
  const normalized = value.startsWith('//') ? `https:${value}` : value;
  if (normalized.includes('x-signature=')) return normalized;
  return normalized.replace(/\.heic(\?.*)?$/i, '.jpg$1');
}

export default async function DetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const detailData = await getMeloloDetail(bookId);

  if (!detailData) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/melolo" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const drama = pickMeloloDetailObject(detailData);

  if (!drama) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/melolo" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title =
    drama.series_title ||
    drama.bookName ||
    drama.book_name ||
    drama.book_title ||
    drama.title ||
    drama.name ||
    'Unknown';
  const poster = normalizeImageUrl(
    drama.series_cover ||
      drama.thumb_url ||
      drama.coverWap ||
      drama.cover ||
      drama.book_pic ||
      drama.first_chapter_cover ||
      drama.poster ||
      drama.image ||
      drama.book_cover ||
      drama.cover_url
  );
  const synopsis =
    drama.series_intro ||
    drama.introduction ||
    drama.description ||
    drama.abstract ||
    drama.summary ||
    drama.synopsis ||
    'No synopsis available';
  const genres = drama.tags || drama.genres || drama.tag_list || drama.abstract_tags || [];
  const episodeCount =
    drama.episode_cnt ||
    drama.chapterCount ||
    drama.episodeCount ||
    drama.chapter_count ||
    drama.episode_count ||
    0;

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-6">
          <Link
            href="/melolo"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
          >
            ← Kembali
          </Link>
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="group relative rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-800 sticky top-20 shadow-lg">
              <img
                src={poster || '/placeholder.svg'}
                alt={title}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <Link
                href={`/melolo/${bookId}/watch`}
                prefetch={false}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-5 py-2 bg-linear-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-lg shadow-violet-700/30"
              >
                ▶ Mulai Tonton
              </Link>
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

            <Link
              href={`/melolo/${bookId}/watch`}
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
