"use client";
import { useState } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { StatusBadge } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { Swords, RefreshCcw } from "lucide-react";

export default function HostDashboard() {
  const { session, ready } = useGuard(["host"]);
  const { store, commit } = useStore();
  const [cat, setCat] = useState("Sekolah Rendah");
  const [grp, setGrp] = useState("A");

  if (!ready || !store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  const matches = store.matches.filter((m) => m.category === cat && m.group === grp);

  function setMatch(matchId, patch) {
    commit({ ...store, matches: store.matches.map((m) => m.matchId === matchId ? { ...m, ...patch } : m) });
  }
  function updateResult(m, winnerSide) {
    const winner = winnerSide === "A" ? m.teamA : m.teamB;
    const loser = winnerSide === "A" ? m.teamB : m.teamA;
    setMatch(m.matchId, { winner, loser, status: "completed", updatedBy: session.userId });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2">
        <Swords /> Dashboard Host
      </h1>
      <p className="text-white/60 mb-6">Isi keputusan perlawanan — standing akan auto-update.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select className="field max-w-xs" value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} className="bg-ink">{c}</option>)}
        </select>
        <select className="field max-w-[120px]" value={grp} onChange={(e) => setGrp(e.target.value)}>
          <option className="bg-ink" value="A">Kumpulan A</option>
          <option className="bg-ink" value="B">Kumpulan B</option>
        </select>
      </div>

      <div className="space-y-3">
        {matches.map((m) => (
          <div key={m.matchId} className="glass p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm">{m.matchId}</span>
              <StatusBadge status={m.status} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="flex-1">{m.teamA}</span>
                <input type="number" min="0" className="field max-w-[80px]" value={m.teamAKill}
                  onChange={(e) => setMatch(m.matchId, { teamAKill: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-1">{m.teamB}</span>
                <input type="number" min="0" className="field max-w-[80px]" value={m.teamBKill}
                  onChange={(e) => setMatch(m.matchId, { teamBKill: Number(e.target.value) })} />
              </div>
            </div>
            <input className="field mt-3" placeholder="Catatan perlawanan (pilihan)"
              value={m.note} onChange={(e) => setMatch(m.matchId, { note: e.target.value })} />
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => updateResult(m, "A")} className={`btn text-sm ${m.winner === m.teamA ? "btn-gold" : "btn-emerald"}`}>
                Menang: {m.teamA}
              </button>
              <button onClick={() => updateResult(m, "B")} className={`btn text-sm ${m.winner === m.teamB ? "btn-gold" : "btn-emerald"}`}>
                Menang: {m.teamB}
              </button>
              <button onClick={() => setMatch(m.matchId, { status: "live" })} className="btn btn-ghost text-sm">Tanda Live</button>
              <button onClick={() => setMatch(m.matchId, { winner: "", loser: "", status: "pending", updatedBy: "" })} className="btn btn-ghost text-sm">
                <RefreshCcw size={14} /> Reset
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
