import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Zera todo o progresso de uma pessoa.
// Body: { memberId: string }
export async function POST(req: Request) {
  let memberId = "";
  try {
    const body = await req.json();
    memberId = String(body?.memberId ?? "");
  } catch {
    return NextResponse.json({ error: "requisição inválida" }, { status: 400 });
  }
  if (!memberId) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { error } = await sb.from("progress").delete().eq("member_id", memberId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
