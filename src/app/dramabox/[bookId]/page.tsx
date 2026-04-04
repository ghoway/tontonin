import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { getDramaBoxDetail } from '@/lib/api';

export default async function DramaBoxDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const data = await getDramaBoxDetail(bookId);
  const drama = Array.isArray(data) ? data[0] : data;

  if (!drama) {
    return (
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Navigation />
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
            <Link href="/dramabox" className="text-blue-500 hover:underline">
              Kembali ke DramaBox
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="rounded-lg overflow-hidden bg-zinc-800 sticky top-20">
              <img
                src={drama.coverWap || '/placeholder.png'}
                alt={drama.bookName || 'Drama poster'}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-white mb-4">{drama.bookName || 'Unknown'}</h1>

            <div className="space-y-4 mb-6">
              {drama.introduction && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sinopsis</h3>
                  <p className="text-zinc-300 leading-relaxed">{drama.introduction}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {drama.chapterCount && (
                  <div>
                    <p className="text-zinc-400 text-sm">Total Episode</p>
                    <p className="text-white text-xl font-semibold">{drama.chapterCount}</p>
                  </div>
                )}
                {drama.playCount && (
                  <div>
                    <p className="text-zinc-400 text-sm">Views</p>
                    <p className="text-white text-xl font-semibold">{drama.playCount}</p>
                  </div>
                )}
                {drama.tags && drama.tags.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-zinc-400 text-sm mb-2">Genre</p>
                    <div className="flex flex-wrap gap-2">
                      {drama.tags.slice(0, 4).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Link
              href={`/dramabox/${bookId}/watch`}
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
