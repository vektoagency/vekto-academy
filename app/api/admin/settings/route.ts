import { NextResponse } from "next/server";
import { requireAdmin, supabase, logAdminAction } from "../helpers";

export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data, error } = await supabase.from("app_settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map: Record<string, unknown> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return NextResponse.json({ data: map });
}

export async function POST(req: Request) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  const { error } = await supabase
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logAdminAction(adminCheck.userId!, adminCheck.email!, `settings.${key}`, null, value);
  return NextResponse.json({ ok: true });
}
