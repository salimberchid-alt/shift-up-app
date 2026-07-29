import { NextResponse, type NextRequest } from "next/server";

const SUPABASE_URL = "https://doeyyowptbnrqfcherdk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_p8ik-qVHxBX-HTjFsVA4Tg_jf_Gn8Fa";

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function proxy(req: NextRequest) {
  const ip = clientIp(req);
  if (!ip) return NextResponse.next();

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_ip_blocked`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_ip: ip }),
    });
    if (res.ok && (await res.json()) === true) {
      return new NextResponse("Access denied.", { status: 403 });
    }
  } catch {
    // Fail open: if the block-check itself is unreachable, don't take the
    // whole site down over it.
  }
  return NextResponse.next();
}

// Only the dashboard/admin surfaces enforce IP blocks — the public
// marketing site and waitlist stay reachable to everyone.
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
