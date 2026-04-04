'use client';

import { useMemo, useState } from 'react';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';

interface Drama {
  bookId: string;
  bookName: string;
  coverWap: string;
  chapterCount: number;
  playCount: string;
}

interface LainnyaSectionProps {
  dramas: Drama[];
}

const INITIAL_VISIBLE = 10;
const LOAD_MORE_STEP = 5;

export function LainnyaSection({ dramas }: LainnyaSectionProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const visibleDramas = useMemo(() => dramas.slice(0, visibleCount), [dramas, visibleCount]);
  const hasMore = visibleCount < dramas.length;

  const showMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, dramas.length));
  };

  return (
    <>
      <Section title="Lainnya">
        {visibleDramas.length > 0 ? (
          visibleDramas.map((drama: Drama, idx: number) => (
            <DramaCard
              key={`lainnya-${drama.bookId || idx}`}
              id={drama.bookId || ''}
              title={drama.bookName || 'Unknown'}
              image={drama.coverWap || '/placeholder.svg'}
              episodes={drama.chapterCount}
              views={drama.playCount}
              type="dramabox"
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-zinc-400">
            Loading dramas...
          </div>
        )}
      </Section>

      {/* Load More Button */}
      {hasMore && visibleDramas.length > 0 && (
        <div className="flex justify-center py-8">
          <button
            onClick={showMore}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Show More
          </button>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && visibleDramas.length > 0 && (
        <div className="text-center py-8 text-zinc-400">
          Tidak ada drama lagi
        </div>
      )}
    </>
  );
}

