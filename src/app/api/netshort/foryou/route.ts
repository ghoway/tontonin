import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/netshort";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || "1";

    const response = await fetch(`${UPSTREAM_API}/foryou?page=${page}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return encryptedResponse({ success: false, data: [] });
    }

    const data = await safeJson<any>(response);
    
    // Normalize the response
    const dramas = (data.contentInfos || []).map((item: any) => ({
      shortPlayId: item.shortPlayId,
      shortPlayLibraryId: item.shortPlayLibraryId,
      title: item.shortPlayName,
      cover: item.shortPlayCover,
      labels: item.labelArray || [],
      heatScore: item.heatScoreShow || "",
      scriptName: item.scriptName,
    }));

    return encryptedResponse({
      success: true,
      data: dramas,
      maxOffset: data.maxOffset,
      completed: data.completed,
    });
  } catch (error) {
    console.error("NetShort ForYou Error:", error);
    return encryptedResponse({ success: false, data: [] });
  }
}

