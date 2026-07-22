import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PHASES } from "@/lib/phases";

export const runtime = "nodejs";

// Marca/desmarca um item para uma pessoa.
// Body: { memberId: string, itemId: string, on: boolean }
export async function POST(req: Request) {
  let memberId = "";
  let itemId = "";
  let on = false;
  try {
    const body = await req.json();
    memberId = String(body?.memberId ?? "");
    itemId = String(body?.itemId ?? "");
    on = Boolean(body?.on);
  } catch {
    return NextResponse.json({ error: "requisição inválida" }, { status: 400 });
  }

  if (!memberId || !isValidItemId(itemId)) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  if (on) {
    const { error } = await sb
      .from("progress")
      .upsert({ member_id: memberId, item_id: itemId }, { onConflict: "member_id,item_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await sb
      .from("progress")
      .delete()
      .eq("member_id", memberId)
      .eq("item_id", itemId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function isValidItemId(id: string): boolean {
  const m = /^p(\d+)-(\d+)$/.exec(id);
  if (!m) return false;
  const pi = Number(m[1]);
  const ii = Number(m[2]);
  return pi >= 0 && pi < PHASES.length && ii >= 0 && ii < PHASES[pi].items.length;
}
