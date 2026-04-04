import { Section } from '@/components/Section';

export default function Loading() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-11 bg-zinc-800 rounded-full w-full max-w-3xl animate-pulse mb-8" />

        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, sectionIdx) => (
            <Section key={sectionIdx} title="Loading...">
              {Array.from({ length: 10 }).map((__, i) => (
                <div key={i} className="h-60 bg-zinc-800 rounded-lg animate-pulse" />
              ))}
            </Section>
          ))}
        </div>
      </div>
    </div>
  );
}
