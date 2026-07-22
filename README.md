# Mesa — Trilha do time

Site interno do time: começa com a **trilha de estudos iOS/macOS**, com progresso de
cada pessoa sincronizado no servidor e visível para todos. Base pronta para crescer
(gerar documentos e outras ações depois).

**Stack:** Next.js (App Router) · Supabase (Postgres) · deploy na Vercel · acesso por senha única do time.

---

## Como funciona

- **Entrar:** todos usam uma senha única do time (`TEAM_PASSWORD`). Ao acertar, o servidor
  seta um cookie assinado; um middleware protege todo o resto.
- **Quem sou eu:** depois de entrar, cada pessoa escolhe o próprio nome no topo (fica salvo
  no navegador). Marca o próprio progresso; todos veem o avanço de todos, sincronizado a cada ~5s.
- **Dados:** ficam no Supabase. A chave secreta do Supabase vive **só no servidor** —
  o navegador nunca a vê e fala apenas com nossas rotas `/api/*`.

## Estrutura

```
app/
  page.tsx            # a trilha (client component)
  login/page.tsx      # porta de entrada (senha do time)
  api/
    login, logout     # sessão do time
    board             # GET: roster + progresso de todos
    toggle            # POST: marca/desmarca um item
    reset             # POST: zera o progresso de uma pessoa
    roster            # POST: renomeia integrantes
lib/
  phases.ts           # os dados das 9 fases
  supabase.ts         # cliente Supabase (server-only, service_role)
  auth.ts             # cookie de sessão assinado + comparação de senha
middleware.ts         # exige sessão em tudo, menos /login e /api/login
supabase/schema.sql   # tabelas: members, progress
reference/            # o HTML original, só para consulta
```

---

## Rodar localmente

1. **Banco (Supabase):** no projeto do time, abra **SQL Editor → New query**, cole o conteúdo
   de [`supabase/schema.sql`](supabase/schema.sql) e rode. Isso cria as tabelas e o roster inicial (Dev 1–4).

2. **Variáveis de ambiente:** copie o exemplo e preencha:
   ```bash
   cp .env.local.example .env.local
   ```
   - `TEAM_PASSWORD` — a senha que o time vai digitar.
   - `SESSION_SECRET` — gere um valor aleatório:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` — em **Supabase → Project Settings → API**
     (use a **service_role** key, não a anon).

3. **Rodar:**
   ```bash
   npm install
   npm run dev
   ```
   Abra http://localhost:3000 — vai cair na tela de senha.

---

## Publicar na Vercel (grátis)

1. Suba o código pro GitHub (veja abaixo).
2. Em [vercel.com](https://vercel.com), faça login com o GitHub e **Add New → Project**,
   selecione o repositório. A Vercel detecta Next.js sozinha.
3. Em **Environment Variables**, adicione as mesmas quatro do `.env.local`
   (`TEAM_PASSWORD`, `SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
4. **Deploy.** Pronto — compartilhe a URL e a senha com o time.

Cada `git push` na branch principal republica automaticamente.

### Subir pro GitHub

```bash
git init
git add .
git commit -m "Trilha do time: Next.js + Supabase"
git branch -M main
git remote add origin git@github.com:SUA_ORG/mesa.git   # crie o repo antes
git push -u origin main
```

> `.env.local` está no `.gitignore` — os segredos não vão pro GitHub. Confira sempre.

---

## Próximos passos (ideias)

- Login individual (Supabase Auth) quando quiser saber quem é quem de verdade.
- Geração de documentos (a estrutura de API já está pronta para isso).
- Realtime do Supabase no lugar do polling, se quiser sincronização instantânea.
