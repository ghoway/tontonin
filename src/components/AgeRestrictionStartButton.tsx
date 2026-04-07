'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AgeRestrictionStartButtonProps {
  href: string;
  className?: string;
}

export function AgeRestrictionStartButton({ href, className }: AgeRestrictionStartButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    if (!open) return;

    setSecondsLeft(5);
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full block bg-linear-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-700/30 active:translate-y-0 transition-all duration-200 text-center ${className ?? ''}`}
      >
        ▶ Mulai Tonton
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-400"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M12 3L1 21h22L12 3zm1 14h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </span>
              <h3 className="text-xl font-bold text-white">Peringatan Batas Usia 18+</h3>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed mb-5">
              Konten ini ditujukan untuk penonton dewasa. Dengan melanjutkan, Anda menyatakan telah berusia
              minimal 18 tahun dan memahami isi konten yang ditampilkan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => router.push(href)}
                disabled={secondsLeft > 0}
                className="flex-1 py-2 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600 text-white font-semibold hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {secondsLeft > 0 ? `Saya Mengerti (${secondsLeft}s)` : 'Saya Mengerti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
