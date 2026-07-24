import { NextResponse } from "next/server";
import { Resend } from "resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = new Set(["worker", "employer"]);

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  let body: { email?: unknown; role?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
  const role = typeof body.role === "string" && ROLES.has(body.role) ? body.role : "worker";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Waitlist signup lost — RESEND_API_KEY is not configured:", { email, role });
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const roleLabel = role === "employer" ? "🏢 Employeur" : "👤 Travailleur";

  try {
    const { error } = await resend.emails.send({
      from: "ShiftUp <noreply@slim-ia.com>",
      to: "info@slim-ia.ca",
      replyTo: email,
      subject: `Nouvelle inscription waitlist ShiftUp — ${role === "employer" ? "Employeur" : "Travailleur"}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#07070F;color:#F2F2FF;border-radius:16px;">
          <div style="font-size:24px;font-weight:800;margin-bottom:4px;">ShiftUp ⚡</div>
          <div style="font-size:12px;color:#9C9CC4;margin-bottom:24px;">Nouvelle inscription sur la liste d'attente</div>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #232340;color:#9C9CC4;font-size:13px;">Courriel</td>
              <td style="padding:12px 0;border-bottom:1px solid #232340;font-weight:700;font-size:13px;">${escapeHtml(email)}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#9C9CC4;font-size:13px;">Rôle</td>
              <td style="padding:12px 0;font-weight:700;font-size:13px;">${roleLabel}</td>
            </tr>
          </table>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send" }, { status: 502 });
    }
  } catch (err) {
    console.error("Resend threw:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
