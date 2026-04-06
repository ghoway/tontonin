import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { getNetShortAllEpisode } from '@/lib/api';

export const revalidate = 300;

function flattenObjects(input: unknown): any[] {
  if (Array.isArray(input)) return input.flatMap(flattenObjects);
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>;
    return [obj, ...Object.values(obj).flatMap(flattenObjects)];
  }
  return [];
}

function pickFirstString(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
}

function pickFirstNumber(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function toTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === 'string' ? v : null))
      .filter((v): v is string => Boolean(v && v.trim()));
  }
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}

function estimateEpisodeCount(raw: unknown): number {
  const objects = flattenObjects(raw);
  const episodes = new Set<number>();

  for (const obj of objects) {
    const episode = pickFirstNumber(obj, ['episode', 'episodeNo', 'episodeNumber', 'chapter', 'chapterNo', 'index', 'seq', 'no', 'num']);
    if (episode && episode > 0) episodes.add(episode);
  }

  return episodes.size;
}

export default async function DetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const payload = await getNetShortAllEpisode(bookId);

  if (!payload) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/netshort" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const root = typeof payload === 'object' && payload !== null ? (payload as Record<string, any>) : {};
  const title = root.shortPlayName || root.contentName || root.title || 'Unknown';
  const poster = root.shortPlayCover || root.cover || root.poster || '';
  const hasPoster = typeof poster === 'string' && poster.trim().length > 0;
  const synopsis = root.script || root.description || root.summary || root.synopsis || 'No synopsis available';
  const genres = toTags(root.shortPlayLabels || root.labelArray || root.labels);
  const episodeCount = Number(root.totalEpisode || root.totalEpisodes || estimateEpisodeCount(payload));

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
              href={`/netshort/${bookId}/watch`}
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
