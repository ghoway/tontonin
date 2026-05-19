import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { optimizeCover } from "@/lib/image-utils";
import { NextRequest } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/shortmax";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return encryptedResponse({ success: true, data: [] });
    }

    const response = await fetch(
      `${UPSTREAM_API}/search?query=${encodeURIComponent(query)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      return encryptedResponse({ success: true, data: [] });
    }

    const data = await safeJson<any>(response);

    const results = (data.results || []).map((item: any) => ({
      shortPlayId: item.shortPlayId,
      shortPlayCode: item.shortPlayCode,
      title: (item.name || "").replace(/<\/?em>/g, ""),
      cover: optimizeCover(item.cover),
      genre: (item.genre || []).map((g: string) => g.replace(/<\/?em>/g, "")),
    }));

    return encryptedResponse({
      success: true,
      data: results,
      total: data.total || results.length,
    });
  } catch (error) {
    console.error("ShortMax Search Error:", error);
    return encryptedResponse({ success: true, data: [] });
  }
}
