import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Retorna o board completo: roster + progresso de cada pessoa.
// Formato compatível com o painel: { roster: [{id,name}], progress: { memberId: [itemId] } }
export async function GET() {
  const sb = supabaseAdmin();

  const [membersRes, progressRes] = await Promise.all([
    sb.from("members").select("id, name, sort").order("sort", { ascending: true }),
    sb.from("progress").select("member_id, item_id"),
  ]);

  if (membersRes.error) {
    return NextResponse.json({ error: membersRes.error.message }, { status: 500 });
  }
  if (progressRes.error) {
    return NextResponse.json({ error: progressRes.error.message }, { status: 500 });
  }

  const roster = (membersRes.data ?? []).map((m) => ({ id: m.id, name: m.name }));
  const progress: Record<string, string[]> = {};
  for (const row of progressRes.data ?? []) {
    (progress[row.member_id] ??= []).push(row.item_id);
  }

  return NextResponse.json({ roster, progress });
}
