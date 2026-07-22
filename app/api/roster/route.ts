import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

// Renomeia integrantes do roster.
// Body: { members: [{ id: string, name: string }] }
export async function POST(req: Request) {
  let members: { id: string; name: string }[] = [];
  try {
    const body = await req.json();
    members = Array.isArray(body?.members) ? body.members : [];
  } catch {
    return NextResponse.json({ error: "requisição inválida" }, { status: 400 });
  }

  const clean = members
    .map((m) => ({ id: String(m?.id ?? "").trim(), name: String(m?.name ?? "").trim() }))
    .filter((m) => m.id && m.name)
    .map((m) => ({ ...m, name: m.name.slice(0, 40) }));

  if (!clean.length) {
    return NextResponse.json({ error: "nada para atualizar" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  for (const m of clean) {
    const { error } = await sb.from("members").update({ name: m.name }).eq("id", m.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
