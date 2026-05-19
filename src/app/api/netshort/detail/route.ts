import { safeJson, encryptedResponse } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

const UPSTREAM_API = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api") + "/netshort";

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

    const response = await fetch(`${UPSTREAM_API}/allepisode?shortPlayId=${shortPlayId}`, {
      cache: 'no-store',});

    if (!response.ok) {
      return encryptedResponse(
        { success: false, error: "Failed to fetch detail" }
      );
    }

    const data = await safeJson<any>(response);

    // Normalize episode data
    const episodes = (data.shortPlayEpisodeInfos || []).map((ep: any) => ({
      episodeId: ep.episodeId,
      episodeNo: ep.episodeNo,
      cover: ep.episodeCover,
      videoUrl: ep.playVoucher,
      quality: ep.playClarity || "720p",
      isLock: ep.isLock,
      likeNums: ep.likeNums,
      subtitleUrl: ep.subtitleList?.[0]?.url || "",
    }));

    return encryptedResponse({
      success: true,
      shortPlayId: data.shortPlayId,
      shortPlayLibraryId: data.shortPlayLibraryId,
      title: data.shortPlayName,
      cover: data.shortPlayCover,
      description: data.shotIntroduce,
      labels: data.shortPlayLabels || [],
      totalEpisodes: data.totalEpisode,
      isFinish: data.isFinish === 1,
      payPoint: data.payPoint,
      episodes,
    });
  } catch (error) {
    console.error("NetShort Detail Error:", error);
    return encryptedResponse(
      { success: false, error: "Internal server error" }
    );
  }
}


