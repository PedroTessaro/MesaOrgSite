// Sessão do time via cookie assinado (HMAC-SHA256 com Web Crypto).
// Funciona tanto no middleware (Edge) quanto nos route handlers (Node).

export const SESSION_COOKIE = "team_session";
const PAYLOAD = "team";
const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(str: string): Uint8Array<ArrayBuffer> {
  const pad = str.length % 4 ? 4 - (str.length % 4) : 0;
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET || "dev-secret-change-me";
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function makeSessionToken(): Promise<string> {
  const key = await hmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(PAYLOAD));
  return `${PAYLOAD}.${b64url(sig)}`;
}

export async function verifySessionToken(
  token?: string | null
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (payload !== PAYLOAD || !sig) return false;
  try {
    const key = await hmacKey();
    return await crypto.subtle.verify(
      "HMAC",
      key,
      fromB64url(sig),
      enc.encode(PAYLOAD)
    );
  } catch {
    return false;
  }
}

// Comparação de senha em tempo ~constante para não vazar por timing.
export function safeEqual(a: string, b: string): boolean {
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}
