"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PHASES, TOTAL, itemId } from "@/lib/phases";

type Member = { id: string; name: string };
type Board = { roster: Member[]; progress: Record<string, string[]> };

const Check = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6.2 5 8.7 9.7 3.5" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Caret = () => (
  <svg className="caret" viewBox="0 0 8 12" fill="none">
    <path d="M1.5 1.5 6 6l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function phaseDone(pi: number, set: Set<string>) {
  let c = 0;
  PHASES[pi].items.forEach((_, ii) => {
    if (set.has(itemId(pi, ii))) c++;
  });
  return c;
}
function currentPhase(set: Set<string>) {
  for (let i = 0; i < PHASES.length; i++) {
    if (phaseDone(i, set) < PHASES[i].items.length) return i;
  }
  return PHASES.length - 1;
}

export default function TrilhaPage() {
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [meId, setMeId] = useState<string>("");
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [warn, setWarn] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const lastWrite = useRef(0);
  const editingRef = useRef(editing);
  editingRef.current = editing;

  const applyBoard = useCallback((b: Board) => {
    setBoard(b);
    setMeId((prev) => {
      if (prev && b.roster.some((m) => m.id === prev)) return prev;
      const stored = typeof window !== "undefined" ? localStorage.getItem("trilha-me") : null;
      if (stored && b.roster.some((m) => m.id === stored)) return stored;
      return b.roster[0]?.id ?? "";
    });
  }, []);

  const fetchBoard = useCallback(
    async (initial = false) => {
      try {
        const res = await fetch("/api/board", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          let msg = `Erro ${res.status} ao carregar o board.`;
          try {
            const d = await res.json();
            if (d?.error) msg = d.error;
          } catch {}
          if (initial) setLoadError(msg);
          setWarn(true);
          return;
        }
        const b: Board = await res.json();
        setWarn(false);
        setLoadError(null);
        // Não sobrescreve enquanto edita nomes nem logo após uma marcação local.
        if (editingRef.current || (!initial && Date.now() - lastWrite.current < 2000)) return;
        applyBoard(b);
      } catch {
        setWarn(true);
      }
    },
    [applyBoard, router]
  );

  // Carga inicial + abre a fase atual.
  useEffect(() => {
    (async () => {
      await fetchBoard(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abre a fase atual assim que soubermos quem sou e o progresso.
  const openedRef = useRef(false);
  useEffect(() => {
    if (!board || !meId || openedRef.current) return;
    openedRef.current = true;
    setOpen(new Set([currentPhase(new Set(board.progress[meId] ?? []))]));
  }, [board, meId]);

  // Polling ao vivo.
  useEffect(() => {
    const t = setInterval(() => fetchBoard(false), 5000);
    return () => clearInterval(t);
  }, [fetchBoard]);

  if (!board || !meId) {
    return (
      <div className="wrap">
        {loadError ? (
          <>
            <h1>Não deu para carregar</h1>
            <p className="synced warn" style={{ fontSize: 13 }}>{loadError}</p>
            <p className="lead" style={{ marginTop: 12 }}>
              Verifique na Vercel se as variáveis <code>SUPABASE_URL</code> e{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code> estão configuradas, e se o schema SQL
              (<code>supabase/schema.sql</code>) foi rodado no Supabase. Depois, faça um redeploy.
            </p>
            <p className="lead" style={{ marginTop: 10 }}>
              <button className="txtbtn" onClick={() => fetchBoard(true)}>
                Tentar de novo
              </button>
            </p>
          </>
        ) : (
          <p className="lead">Carregando…</p>
        )}
      </div>
    );
  }

  const set = new Set(board.progress[meId] ?? []);
  const cur = currentPhase(set);
  const doneCount = PHASES.reduce((s, _, pi) => s + phaseDone(pi, set), 0);
  const pct = TOTAL ? Math.round((doneCount / TOTAL) * 100) : 0;

  function selectMe(id: string) {
    setMeId(id);
    openedRef.current = false; // reabre a fase atual da nova pessoa
    localStorage.setItem("trilha-me", id);
  }

  async function toggleItem(id: string) {
    const on = !set.has(id);
    const nextSet = new Set(set);
    if (on) nextSet.add(id);
    else nextSet.delete(id);
    const prev = board!;
    setBoard({ ...prev, progress: { ...prev.progress, [meId]: [...nextSet] } });
    lastWrite.current = Date.now();
    try {
      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: meId, itemId: id, on }),
      });
      if (!res.ok) throw new Error();
      setWarn(false);
    } catch {
      setBoard(prev); // reverte
      setWarn(true);
    }
  }

  function toggleOpen(pi: number) {
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(pi)) n.delete(pi);
      else n.add(pi);
      return n;
    });
  }

  function startEdit() {
    const d: Record<string, string> = {};
    board!.roster.forEach((m) => (d[m.id] = m.name));
    setDrafts(d);
    setEditing(true);
  }

  async function finishEdit() {
    const members = board!.roster.map((m) => ({ id: m.id, name: (drafts[m.id] || m.name).trim() || m.name }));
    setBoard({ ...board!, roster: members });
    setEditing(false);
    try {
      const res = await fetch("/api/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      });
      if (!res.ok) throw new Error();
      setWarn(false);
    } catch {
      setWarn(true);
    }
  }

  async function resetMe() {
    const nm = board!.roster.find((m) => m.id === meId)?.name || "você";
    if (!confirm(`Zerar todo o progresso de ${nm}?`)) return;
    const prev = board!;
    setBoard({ ...prev, progress: { ...prev.progress, [meId]: [] } });
    lastWrite.current = Date.now();
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: meId }),
      });
      if (!res.ok) throw new Error();
      setWarn(false);
    } catch {
      setBoard(prev);
      setWarn(true);
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="wrap">
      <div className="topbar">
        <button onClick={logout}>Sair</button>
      </div>
      <header>
        <h1>Trilha iOS / macOS</h1>
        <p className="lead">
          Nove fases encadeadas, de fundamentos a Metal e interpretadores. Cerca de quatro a cinco meses no ritmo do time.
        </p>
        <div className="hprog">
          <div className="controls">
            {editing ? (
              <>
                <div className="editinputs">
                  {board.roster.map((p) => (
                    <input
                      key={p.id}
                      value={drafts[p.id] ?? p.name}
                      maxLength={16}
                      onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                    />
                  ))}
                </div>
                <button className="txtbtn" onClick={finishEdit}>
                  Concluir
                </button>
              </>
            ) : (
              <>
                <div className="seg">
                  {board.roster.map((p) => (
                    <button
                      key={p.id}
                      className={p.id === meId ? "active" : undefined}
                      onClick={() => selectMe(p.id)}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <button className="txtbtn" onClick={startEdit}>
                  Editar nomes
                </button>
              </>
            )}
          </div>
          <div className="count">
            <b>{doneCount}</b>/{TOTAL} · {pct}%
          </div>
        </div>
        <div className="hbar">
          <div className="fill" style={{ width: `${TOTAL ? (doneCount / TOTAL) * 100 : 0}%` }} />
        </div>
        <p className={warn ? "synced warn" : "synced"}>
          {warn ? "Sem conexão com o servidor — tentando sincronizar de novo…" : ""}
        </p>
      </header>

      <div className="track">
        {PHASES.map((ph, pi) => {
          const done = phaseDone(pi, set);
          const total = ph.items.length;
          const complete = done === total;
          const isCur = pi === cur && !complete;
          const isOpen = open.has(pi);
          return (
            <div className="row" key={ph.n}>
              <div className="rail" style={complete ? { ["--seg-color" as string]: "var(--accent)" } : undefined}>
                {complete ? (
                  <span className="node done">
                    <Check />
                  </span>
                ) : isCur ? (
                  <span className="node current">
                    <i />
                  </span>
                ) : (
                  <span className="node pending" />
                )}
              </div>
              <div className={isOpen ? "col open" : "col"}>
                <div className="head" onClick={() => toggleOpen(pi)}>
                  <span className="num">{ph.n}</span>
                  <span className="name">{ph.name}</span>
                  <span className="dur">{ph.dur}</span>
                  {complete ? (
                    <span className="cnt ok">concluída</span>
                  ) : (
                    <span className="cnt">
                      {done}/{total}
                    </span>
                  )}
                  <Caret />
                </div>
                <div className="body">
                  <div className="inner">
                    <div className="pad">
                      {ph.items.map((it, ii) => {
                        const id = itemId(pi, ii);
                        const on = set.has(id);
                        return (
                          <div
                            className={on ? "item on" : "item"}
                            key={id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItem(id);
                            }}
                          >
                            <span className="cbox">
                              <Check />
                            </span>
                            <span className="lab">{it}</span>
                          </div>
                        );
                      })}
                      <div className="block">
                        <div className="bl">Recursos</div>
                        <div className="bt">{ph.res}</div>
                      </div>
                      <div className="block">
                        <div className="bl">Prática</div>
                        <div className="bt p">{ph.prac}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="foot">
        <p>O progresso de todos fica salvo no servidor e sincroniza sozinho a cada poucos segundos.</p>
        <button onClick={resetMe}>Zerar meu progresso</button>
      </div>
    </div>
  );
}
