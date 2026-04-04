import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { WatchClient } from '@/components/WatchClient';
import { getReelShortDetail } from '@/lib/api';

export const revalidate = 300;

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-96 bg-zinc-800 rounded-lg animate-pulse" />
      <div className="h-12 bg-zinc-800 rounded animate-pulse w-1/3" />
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function pickReelShortDetailObject(input: any): any | null {
  if (!input) return null;
  if (Array.isArray(input)) return input[0] || null;
  if (typeof input !== 'object') return null;

  const candidates = [
    input.data?.detail,
    input.data?.book,
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
  if (value.startsWith('//')) return `https:${value}`;
  return value;
}

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  const detailData = await getReelShortDetail(bookId);

  if (!detailData) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const detail = pickReelShortDetailObject(detailData);
  const drama = detail
    ? {
        bookId: detail.bookId || detail.book_id || detail.id || bookId,
        bookName: detail.bookName || detail.book_title || detail.title || detail.name || 'Unknown',
        coverWap: normalizeImageUrl(detail.coverWap || detail.book_pic || detail.cover || detail.poster || detail.image || ''),
        chapterCount:
          detail.chapterCount ||
          detail.chapter_count ||
          detail.episodeCount ||
          detail.episode_count ||
          detail.chapterNum ||
          1,
        introduction:
          detail.introduction || detail.description || detail.abstract || detail.summary || detail.synopsis || 'No synopsis available',
        tags: detail.tags || detail.genres || detail.tag_list || [],
        playCount: detail.playCount || detail.play_count || detail.views || '',
      }
    : null;

  if (!drama) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  // Per API docs, ReelShort episode stream is fetched by `bookId + episodeNumber`.
  // We provide episode placeholders and resolve the actual stream lazily in WatchClient.
  const streamPlaceholders = Array.from({ length: Math.max(1, drama.chapterCount) }, (_, i) => ({
    episode: i + 1,
  }));

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        <div className="mt-8">
          <WatchClient
            drama={drama}
            streams={streamPlaceholders}
            initialEpisode={episode || '1'}
            backHref={`/reelshort/${bookId}`}
            provider="reelshort"
            providerBookId={bookId}
          />
        </div>
      </div>
    </div>
  );
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookId: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { bookId } = await params;
  const { ep } = await searchParams;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <WatchContent bookId={bookId} episode={ep} />
    </Suspense>
  );
}
