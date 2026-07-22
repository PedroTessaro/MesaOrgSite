import { NextResponse } from "next/server";
import { SESSION_COOKIE, makeSessionToken, safeEqual } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let password = "";
  try {
    const body = await req.json();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "requisição inválida" }, { status: 400 });
  }

  const expected = process.env.TEAM_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { error: "TEAM_PASSWORD não configurada no servidor" },
      { status: 500 }
    );
  }

  if (!safeEqual(password, expected)) {
    return NextResponse.json({ error: "senha incorreta" }, { status: 401 });
  }

  const token = await makeSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 dias
  });
  return res;
}
