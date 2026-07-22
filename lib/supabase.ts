import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase para uso EXCLUSIVO no servidor (route handlers).
// Usa a service_role key, que ignora RLS. Nunca importe isto em código
// que roda no navegador.
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  // trim tira espaços/quebras de linha coladas ao colar na Vercel;
  // replace tira barras finais que gerariam "//rest/v1" (Invalid path).
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Faltam SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente."
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
