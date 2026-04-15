import { createClient } from "@supabase/supabase-js";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);
const NOTIFY_SECRET = process.env.NOTIFY_SECRET!;

export async function POST(req: Request) {
  const { secret, moduleTitle, moduleId } = await req.json();

  if (secret !== NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!moduleTitle || !moduleId) {
    return NextResponse.json({ error: "Missing moduleTitle or moduleId" }, { status: 400 });
  }

  // Get all active member user_ids from Supabase
  const { data: members, error } = await supabase
    .from("members")
    .select("user_id")
    .eq("status", "active");

  if (error || !members?.length) {
    return NextResponse.json({ error: "No active members", details: error }, { status: 500 });
  }

  // Fetch emails from Clerk in batches of 100
  const client = await clerkClient();
  const emails: string[] = [];

  for (let i = 0; i < members.length; i += 100) {
    const batch = members.slice(i, i + 100);
    const users = await Promise.all(
      batch.map((m) => client.users.getUser(m.user_id).catch(() => null))
    );
    for (const user of users) {
      const email = user?.emailAddresses[0]?.emailAddress;
      if (email) emails.push(email);
    }
  }

  if (!emails.length) {
    return NextResponse.json({ sent: 0, message: "No emails found" });
  }

  // Send in batches of 50
  let sent = 0;
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50);
    await resend.emails.send({
      from: "Vekto Academy <no-reply@vektoacademy.com>",
      to: batch,
      subject: `Нов модул: ${moduleTitle}`,
      html: buildEmail(moduleTitle, moduleId),
    });
    sent += batch.length;
  }

  return NextResponse.json({ sent, message: `Emails sent to ${sent} members` });
}

function buildEmail(moduleTitle: string, moduleId: number) {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#080808;color:#fff;padding:40px 32px;border-radius:16px;">
      <div style="margin-bottom:32px;">
        <span style="background:#c8ff00;color:#000;font-weight:900;font-size:13px;padding:4px 10px;border-radius:100px;letter-spacing:0.5px;">VEKTO ACADEMY</span>
      </div>
      <h1 style="font-size:24px;font-weight:900;margin:0 0 12px;">Нов модул е наличен 🎬</h1>
      <p style="color:rgba(255,255,255,0.5);font-size:15px;line-height:1.6;margin:0 0 32px;">
        Качихме нов урок в курса. Влез в платформата и продължи напред.
      </p>
      <div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;margin-bottom:32px;">
        <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Нов модул</p>
        <p style="font-size:18px;font-weight:700;margin:0;color:#fff;">${moduleTitle}</p>
      </div>
      <a href="https://vektoacademy.com/dashboard/course/${moduleId}"
         style="display:inline-block;background:#c8ff00;color:#000;font-weight:900;font-size:14px;padding:14px 28px;border-radius:100px;text-decoration:none;">
        Гледай сега →
      </a>
      <p style="color:rgba(255,255,255,0.2);font-size:12px;margin-top:40px;">
        Получаваш този имейл защото си член на Vekto Academy.<br/>
        <a href="https://vektoacademy.com/dashboard" style="color:rgba(255,255,255,0.3);">Управление на абонамента</a>
      </p>
    </div>
  `;
}
