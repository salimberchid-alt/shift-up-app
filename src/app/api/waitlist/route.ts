import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, role } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const { error } = await resend.emails.send({
    from: "ShiftUp <noreply@slim-ia.com>",
    to: "info@slim-ia.ca",
    subject: `Nouvelle inscription waitlist ShiftUp — ${role === "employer" ? "Employeur" : "Travailleur"}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#06060F;color:#EEEEFF;border-radius:16px;">
        <div style="font-size:24px;font-weight:800;margin-bottom:4px;">ShiftUp ⚡</div>
        <div style="font-size:12px;color:#52527A;margin-bottom:24px;">Nouvelle inscription sur la liste d'attente</div>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #1C1C2E;color:#52527A;font-size:13px;">Courriel</td>
            <td style="padding:12px 0;border-bottom:1px solid #1C1C2E;font-weight:700;font-size:13px;">${email}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#52527A;font-size:13px;">Rôle</td>
            <td style="padding:12px 0;font-weight:700;font-size:13px;">${role === "employer" ? "🏢 Employeur" : "👤 Travailleur"}</td>
          </tr>
        </table>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
