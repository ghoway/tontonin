"use client";

import { DramaNovaSection } from "./DramaNovaSection";
import { InfiniteDramaNovaSection } from "./InfiniteDramaNovaSection";
import { useDramaNovaDrama18, useDramaNovaKomik } from "@/hooks/useDramaNova";

export function DramaNovaHome() {
  const { 
    data: drama18Data, 
    isLoading: loadingDrama18, 
    error: errorDrama18, 
    refetch: refetchDrama18 
  } = useDramaNovaDrama18();

  const { 
    data: komikData, 
    isLoading: loadingKomik, 
    error: errorKomik, 
    refetch: refetchKomik 
  } = useDramaNovaKomik();

  return (
    <div className="space-y-8 animate-fade-up">
      <DramaNovaSection
        title="Drama 18+"
        dramas={drama18Data}
        isLoading={loadingDrama18}
        error={!!errorDrama18}
        onRetry={() => refetchDrama18()}
      />
      <DramaNovaSection
        title="Komik"
        dramas={komikData}
        isLoading={loadingKomik}
        error={!!errorKomik}
        onRetry={() => refetchKomik()}
      />
      <InfiniteDramaNovaSection title="Lainnya" />
    </div>
  );
}
