import { NextResponse } from "next/server";
import { requireAdmin, supabase } from "../helpers";

// GET — admin audit logs
export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck && adminCheck.error) return adminCheck.error;

  const { data, error } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data ?? [] });
}
