import { encryptedResponse } from "@/lib/api-utils";

const UPSTREAM_API = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.sansekai.my.id/api";

export async function GET() {
  try {
    const res = await fetch(`${UPSTREAM_API}/dramanova/komik`, {
      headers: {
        "User-Agent": "okhttp/4.12.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch komik: ${res.status}`);
    }

    const data = await res.json();
    return encryptedResponse(data);
  } catch (error) {
    console.error("DramaNova komik fetch error:", error);
    return encryptedResponse(
      { code: 500, msg: "Failed to fetch from DramaNova", total: 0, rows: [] },
      500
    );
  }
}
