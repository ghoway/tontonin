import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type AffiliateLinkRow = {
  url: string | null;
  is_active: boolean;
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { success: false, message: "Supabase environment variables are not configured." },
      { status: 500 },
    );
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/affiliate_links?select=url,is_active&is_active=eq.true`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { success: false, message: "Failed to load affiliate links.", details: errorText },
      { status: response.status },
    );
  }

  const rows = (await response.json()) as AffiliateLinkRow[];
  const activeLinks = rows.filter((row) => typeof row.url === "string" && row.url.trim().length > 0);

  if (activeLinks.length === 0) {
    return NextResponse.json(
      { success: false, message: "No active affiliate links found." },
      { status: 404 },
    );
  }

  const selectedLink = activeLinks[Math.floor(Math.random() * activeLinks.length)];

  return NextResponse.json({
    success: true,
    url: selectedLink.url,
  });
}