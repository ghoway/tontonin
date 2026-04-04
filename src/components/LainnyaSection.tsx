'use client';

import { useState, useEffect } from 'react';
import { Section } from '@/components/Section';
import { DramaCard } from '@/components/DramaCard';
import { useError } from '@/components/ErrorModal';

interface Drama {
  bookId: string;
  bookName: string;
  coverWap: string;
  chapterCount: number;
  playCount: string;
}

export function LainnyaSection() {
  const { showError } = useError();
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.sansekai.my.id/api/dramabox/foryou?page=${page}`
      );

      if (response.status === 429 || response.status === 403) {
        showError('Silahkan coba beberapa saat lagi');
        setIsLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch');

      const data: Drama[] = await response.json();
      if (data && data.length > 0) {
        setDramas((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more dramas:', error);
      showError('Gagal memuat drama. Silahkan coba lagi.');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (initialized) return;

    const fetchInitial = async () => {
      try {
        const response = await fetch(
          'https://api.sansekai.my.id/api/dramabox/foryou?page=1'
        );

        if (response.status === 429 || response.status === 403) {
          showError('Silahkan coba beberapa saat lagi');
          setInitialized(true);
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch');

        const data: Drama[] = await response.json();
        if (data && data.length > 0) {
          setDramas(data);
          setPage(2);
          setInitialized(true);
        }
      } catch (error) {
        console.error('Error loading initial dramas:', error);
        showError('Gagal memuat drama. Silahkan coba lagi.');
        setInitialized(true);
      }
    };

    fetchInitial();
  }, [initialized, showError]);

  return (
    <>
      <Section title="Lainnya">
        {dramas.length > 0 ? (
          dramas.map((drama: any, idx: number) => (
            <DramaCard
              key={`lainnya-${drama.bookId || idx}`}
              id={drama.bookId || ''}
              title={drama.bookName || 'Unknown'}
              image={drama.coverWap || '/placeholder.png'}
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
      {hasMore && dramas.length > 0 && (
        <div className="flex justify-center py-8">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* End of list message */}
      {!hasMore && dramas.length > 0 && (
        <div className="text-center py-8 text-zinc-400">
          Tidak ada drama lagi
        </div>
      )}
    </>
  );
}

