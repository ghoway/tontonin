'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type SuggestItem = {
  id: string;
  title: string;
  image: string;
  provider: string;
};

export function Header() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Nontonin';
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const searchBasePath = useMemo(() => {
    const providers = ['/dramabox', '/reelshort', '/melolo', '/shortmax', '/netshort', '/freereels', '/dramanova'];
    return providers.find((p) => pathname.startsWith(p)) || '/dramabox';
  }, [pathname]);

  const providerName = useMemo(() => searchBasePath.replace('/', ''), [searchBasePath]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/search?provider=${encodeURIComponent(providerName)}&q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal, cache: 'no-store' }
        );
        if (!res.ok) {
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const payload = await res.json();
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setSuggestions(items);
        setShowSuggestions(true);
      } catch {
        if (!ctrl.signal.aborted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, providerName]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setShowSuggestions(false);
    router.push(`${searchBasePath}?q=${encodeURIComponent(q)}`);
  };

  const handlePick = (id: string) => {
    setShowSuggestions(false);
    setQuery('');
    router.push(`${searchBasePath}/${id}`);
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">▶</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">{appName}</span>
          </Link>

          {/* App Name for Mobile Center */}
          <div className="absolute left-1/2 transform -translate-x-1/2 sm:hidden">
            <span className="text-white font-bold text-sm">{appName}</span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden sm:block relative">
            <form onSubmit={submitSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Cari drama, film, anime..."
                className="w-full px-4 py-2 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </form>

            {showSuggestions && (
              <div className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 max-h-[60vh] overflow-y-auto">
                {loading ? (
                  <div className="p-3 text-zinc-400 text-sm">Mencari...</div>
                ) : suggestions.length === 0 ? (
                  <div className="p-3 text-zinc-400 text-sm">Tidak ada hasil</div>
                ) : (
                  suggestions.map((item) => (
                    <button
                      key={`${item.provider}-${item.id}`}
                      onClick={() => handlePick(item.id)}
                      className="w-full text-left p-3 hover:bg-zinc-800 border-b border-zinc-800 last:border-b-0 flex gap-3 items-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.title}
                        className="w-10 h-14 rounded object-cover bg-zinc-800"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/placeholder.svg';
                        }}
                      />
                      <span className="text-zinc-100 text-sm line-clamp-2">{item.title}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-colors sm:hidden"
            >
              🔍
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="pb-4 block sm:hidden">
            <form onSubmit={submitSearch}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari drama, film, anime..."
                className="w-full px-4 py-2 bg-zinc-800 text-white placeholder-zinc-500 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
