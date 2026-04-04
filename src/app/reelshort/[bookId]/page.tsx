import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { getReelShortDetail } from '@/lib/api';

export const revalidate = 300;

export default async function DetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const detailData = await getReelShortDetail(bookId);

  if (!detailData) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/reelshort" prefetch={false} className="text-blue-400 hover:text-blue-300">
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
            <Link href="/reelshort" prefetch={false} className="text-blue-400 hover:text-blue-300">
              ← Kembali ke daftar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = drama.bookName || drama.title || 'Unknown';
  const poster = drama.coverWap || drama.poster || drama.cover || '';
  const synopsis = drama.introduction || drama.description || drama.synopsis || 'No synopsis available';
  const genres = drama.tags || drama.genres || [];
  const episodeCount = drama.chapterCount || drama.episodeCount || 0;

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <Link href="/reelshort" prefetch={false} className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8">
          ← Kembali
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Poster */}
          <div className="md:col-span-1">
            <div className="aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-3xl">📺</span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-4xl font-bold">{title}</h1>

            <div className="space-y-2 text-zinc-300">
              <p>
                <span className="text-zinc-400">Episodes: </span>
                {episodeCount}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {genres.map((genre: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>

            <p className="text-zinc-300 leading-relaxed">{synopsis}</p>

            <Link
              href={`/reelshort/${bookId}/watch`}
              prefetch={false}
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Mulai Tonton
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
