'use client';

import { Suspense, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import Link from 'next/link';

function DetailContent({ bookId, data }: { bookId: string; data: any }) {

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
        <Link href="/dramabox" className="text-blue-500 hover:underline">
          Kembali ke DramaBox
        </Link>
      </div>
    );
  }

  const drama = Array.isArray(data) ? data[0] : data;

  if (!drama) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
        <Link href="/dramabox" className="text-blue-500 hover:underline">
          Kembali ke DramaBox
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Poster */}
      <div className="md:col-span-1">
        <div className="rounded-lg overflow-hidden bg-zinc-800 sticky top-20">
          <img
            src={drama.coverWap || '/placeholder.png'}
            alt={drama.bookName}
            className="w-full h-auto object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'https://via.placeholder.com/300x400?text=No+Image';
            }}
          />
        </div>
      </div>

      {/* Info */}
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

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
          <Link href={`/dramabox/${bookId}/watch`} className="w-full block">
            ▶ Mulai Tonton
          </Link>
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 bg-zinc-800 rounded-lg h-96 animate-pulse" />
      <div className="md:col-span-2 space-y-4">
        <div className="h-12 bg-zinc-800 rounded animate-pulse w-3/4" />
        <div className="h-32 bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

async function ServerDetailPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const { getDramaBoxDetail } = await import('@/lib/api');
  const data = await getDramaBoxDetail(bookId);

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-8">
          {data ? (
            <DetailContent bookId={bookId} data={data} />
          ) : (
            <LoadingSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}

export default ServerDetailPage;
