import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { WatchClient } from '@/components/WatchClient';
import { getDramaBoxDetail } from '@/lib/api';

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

async function WatchContent({ bookId, episode }: { bookId: string; episode?: string }) {
  const data = await getDramaBoxDetail(bookId);

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  const drama = Array.isArray(data) ? data[0] : data;

  if (!drama) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Drama tidak ditemukan</p>
      </div>
    );
  }

  return <WatchClient drama={drama} initialEpisode={episode || '1'} />;
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
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />

        <div className="mt-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <WatchContent bookId={bookId} episode={ep} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
