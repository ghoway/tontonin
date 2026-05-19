import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { optimizeCover } from "@/lib/image-utils";
import { NextRequest } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/shortmax";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";

    const response = await fetch(`${UPSTREAM_API}/foryou?page=${page}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return encryptedResponse({ success: false, data: [], isEnd: true });
    }

    const data = await safeJson<any>(response);

    const dramas = (data.results || []).map((item: any) => ({
      shortPlayId: item.shortPlayId,
      title: item.name,
      cover: optimizeCover(item.cover),
      totalEpisodes: item.totalEpisodes || 0,
      playNum: item.playNum || 0,
      summary: item.summary || "",
    }));

    return encryptedResponse({
      success: true,
      data: dramas,
      page: Number(page),
      isEnd: data.isEnd || false,
      total: data.total || dramas.length,
    });
  } catch (error) {
    console.error("ShortMax ForYou Error:", error);
    return encryptedResponse({ success: false, data: [], isEnd: true });
  }
}
