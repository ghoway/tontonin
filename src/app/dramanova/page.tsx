import { Suspense } from 'react';
import { Navigation } from '@/components/Navigation';
import { PaginatedDramaSection } from '@/components/PaginatedDramaSection';
import { getDramaNovaDrama18, getDramaNovaHome, getDramaNovaKomik } from '@/lib/api';

export const revalidate = 300;

async function HomeSection() {
  const data = await getDramaNovaHome(1);
  const dramas = Array.isArray(data) ? data : [];

  return <PaginatedDramaSection title="Home" initialDramas={dramas} type="dramanova" initialVisible={12} loadStep={6} fetchEndpoint="/api/dramanova/home" initialPage={1} />;
}

async function KomikSection() {
  const data = await getDramaNovaKomik(1);
  const dramas = Array.isArray(data) ? data : [];

  return <PaginatedDramaSection title="Komik" initialDramas={dramas} type="dramanova" initialVisible={12} loadStep={6} fetchEndpoint="/api/dramanova/komik" initialPage={1} />;
}

async function Drama18Section() {
  const data = await getDramaNovaDrama18(1);
  const dramas = Array.isArray(data) ? data : [];

  return <PaginatedDramaSection title="Drama 18" initialDramas={dramas} type="dramanova" initialVisible={12} loadStep={6} fetchEndpoint="/api/dramanova/drama18" initialPage={1} />;
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((section) => (
        <div key={section} className="mb-8">
          <div className="h-8 bg-zinc-800 rounded w-32 mb-4 animate-pulse ml-2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="h-60 bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default function DramaNovaPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Navigation />
        
        <div className="mt-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <HomeSection />
          </Suspense>

          <Suspense fallback={<LoadingSkeleton />}>
            <KomikSection />
          </Suspense>

          <Suspense fallback={<LoadingSkeleton />}>
            <Drama18Section />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
