"use client";

type AffiliateResponse = {
  success?: boolean;
  url?: string;
  message?: string;
};

export async function openAffiliateBeforeWatch(onContinue: () => void) {
  const affiliateWindow = window.open("about:blank", "_blank");

  try {
    const response = await fetch("/api/affiliate", {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json()) as AffiliateResponse;
    const affiliateUrl = typeof payload.url === "string" ? payload.url.trim() : "";

    if (affiliateUrl) {
      if (affiliateWindow) {
        affiliateWindow.location.href = affiliateUrl;
      } else {
        window.open(affiliateUrl, "_blank", "noopener,noreferrer");
      }
    } else if (affiliateWindow) {
      affiliateWindow.close();
    }
  } catch {
    if (affiliateWindow) {
      affiliateWindow.close();
    }
  } finally {
    onContinue();
  }
}