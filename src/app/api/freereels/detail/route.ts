import { NextRequest, NextResponse } from "next/server";
import { safeJson, encryptedResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api"}/freereels/detailAndAllEpisode?key=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 } // Cache detail for 5 minutes
    });

    if (!res.ok) {
      throw new Error(`Upstream API failed with status ${res.status}`);
    }

    const data = await safeJson(res);
    return await encryptedResponse(data);
  } catch (error) {
    console.error("Error fetching FreeReels detail:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
