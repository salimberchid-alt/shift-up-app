import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Meta Conversions API: the server-side half of the pixel.
 *
 * Why both. The browser pixel is blocked by iOS tracking prevention, most
 * ad blockers, and every privacy-focused browser, so on a Canadian audience
 * a meaningful share of real conversions never reach Meta at all. Whatever
 * fraction is lost, the campaign is optimised toward the people who happen
 * not to block scripts, which is not the same population as the people who
 * convert. Sending the same event from the server closes that gap.
 *
 * The pair is deduplicated by `event_id`: the browser sends it as `eventID`
 * on fbq, this sends it as `event_id`, and Meta collapses them. Without it
 * every conversion is counted twice and the reported cost per lead is half
 * the true figure, which is a worse input to a spending decision than no
 * figure at all.
 *
 * Dormant until configured, like the pixel itself: with no access token this
 * returns 204 and does nothing.
 */

export const runtime = "nodejs";

const GRAPH_VERSION = process.env.META_GRAPH_API_VERSION ?? "v25.0";
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN ?? "";
/** The dataset id is the pixel id unless Events Manager says otherwise. */
const DATASET_ID = process.env.META_DATASET_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
/** Set while verifying in Events Manager > Test events, then remove. */
const TEST_EVENT_CODE = process.env.META_CAPI_TEST_EVENT_CODE ?? "";

/** Our event names -> Meta standard events. Must match EVENT_MAP in lib/tracking.ts. */
const EVENT_MAP: Record<string, string> = {
  waitlist_lead: "Lead",
};

/**
 * Meta requires personal identifiers normalized then SHA-256 hashed, and
 * rejects the event outright if a raw value arrives. Lowercase and trim is
 * the documented normalization for email.
 */
function hashEmail(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

/**
 * First address in X-Forwarded-For is the client; the rest are proxies.
 * Meta uses it for match quality and geo, and a proxy IP would attribute
 * every Canadian visitor to a Vercel edge region.
 */
function clientIp(req: NextRequest): string | undefined {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || undefined;
}

export async function POST(req: NextRequest) {
  if (!ACCESS_TOKEN || !DATASET_ID) {
    // Not an error: the site is meant to run with tracking unconfigured.
    return new NextResponse(null, { status: 204 });
  }

  let body: { event?: unknown; eventId?: unknown; eventSourceUrl?: unknown; email?: unknown; params?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventName = typeof body.event === "string" ? EVENT_MAP[body.event] : undefined;
  if (!eventName) {
    // Only events this app actually declares are forwarded, so a stray or
    // crafted POST cannot inject arbitrary conversions into the ad account.
    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId.slice(0, 100) : undefined;
  if (!eventId) {
    // Without it the browser pixel's copy of this event cannot be
    // deduplicated, so double counting is guaranteed. Refuse rather than
    // quietly corrupt the numbers.
    return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
  }

  const email = typeof body.email === "string" && body.email.includes("@") ? body.email : undefined;
  const params = body.params && typeof body.params === "object" ? (body.params as Record<string, unknown>) : {};

  // _fbp and _fbc are set by the pixel in the browser and are the single
  // biggest lever on match quality, so they are forwarded when present. They
  // are read from the request rather than trusted from the JSON body.
  const fbp = req.cookies.get("_fbp")?.value;
  const fbc = req.cookies.get("_fbc")?.value;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: typeof body.eventSourceUrl === "string" ? body.eventSourceUrl : undefined,
        action_source: "website",
        user_data: {
          ...(email ? { em: [hashEmail(email)] } : {}),
          ...(fbp ? { fbp } : {}),
          ...(fbc ? { fbc } : {}),
          client_ip_address: clientIp(req),
          client_user_agent: req.headers.get("user-agent") ?? undefined,
        },
        custom_data: params,
      },
    ],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${DATASET_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      // Logged rather than returned: the caller is a fire-and-forget beacon
      // that cannot act on this, and the failure is ours to fix, not the
      // visitor's. The response body carries Meta's reason (bad token,
      // deprecated API version, malformed user_data), so keep it.
      console.error("Meta CAPI rejected event:", res.status, await res.text());
      return NextResponse.json({ ok: false }, { status: 502 });
    }
  } catch (err) {
    console.error("Meta CAPI request failed:", err);
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
