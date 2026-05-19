import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { optimizeCover } from "@/lib/image-utils";
import { NextRequest } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/shortmax";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shortPlayId = searchParams.get("shortPlayId");

    if (!shortPlayId) {
      return encryptedResponse(
        { success: false, error: "shortPlayId is required" },
        400
      );
    }

    const response = await fetch(`${UPSTREAM_API}/detail?shortPlayId=${shortPlayId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return encryptedResponse(
        { success: false, error: "Failed to fetch detail" }
      );
    }

    const raw = await safeJson<any>(response);
    const data = raw.data || raw;

    const labels = (data.labelResponseList || []).map((l: any) => l.labelName);

    return encryptedResponse({
      success: true,
      shortPlayId: data.id,
      shortPlayCode: data.shortPlayCode,
      title: data.shortPlayName,
      cover: optimizeCover(data.picUrl),
      description: data.summary || data.recommendContent || "",
      labels,
      totalEpisodes: data.totalEpisodes || 0,
      updateEpisode: data.updateEpisode || 0,
      lockBegin: data.lockBegin || 0,
      collectNum: data.collectNum || 0,
    });
  } catch (error) {
    console.error("ShortMax Detail Error:", error);
    return encryptedResponse(
      { success: false, error: "Internal server error" }
    );
  }
}
