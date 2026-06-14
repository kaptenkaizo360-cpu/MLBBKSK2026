"use client";
import { useState } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { StatusBadge } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { Swords, RefreshCcw, Users } from "lucide-react";

export default function HostDashboard() {
  const { session, ready } = useGuard(["host"]);
  const { store, commit } = useStore();
  const [tab, setTab] = useState("results");
  const [cat, setCat] = useState("Sekolah Rendah");
  const [grp, setGrp] = useState("A");

  if (!ready || !store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  const matches = store.matches.filter((m) => m.category === cat && m.group === grp);

  // Semua peserta dari semua daerah (host nampak, TANPA IGN & Username Profile)
  const allPlayers = store.teams.flatMap((t) =>
    (t.players || []).map((p) => ({ ...p, team: t.teamName, district: t.district, category: t.category }))
  );

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
      <p className="text-white/60 mb-6">Pilih pemenang — standing auto-update (Menang = 3 mata).</p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("results")} className={`btn text-sm ${tab === "results" ? "btn-gold" : "btn-ghost"}`}>
          <Swords size={16} /> Keputusan
        </button>
        <button onClick={() => setTab("players")} className={`btn text-sm ${tab === "players" ? "btn-gold" : "btn-ghost"}`}>
          <Users size={16} /> Senarai Peserta
        </button>
      </div>

      {tab === "results" && (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            <select className="field max-w-xs" value={cat} onChange={(e) => setCat(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} className="bg-ink">{c}</option>)}
            </select>
            <select className="field max-w-[140px]" value={grp} onChange={(e) => setGrp(e.target.value)}>
              <option className="bg-ink" value="A">Kumpulan A</option>
              <option className="bg-ink" value="B">Kumpulan B</option>
            </select>
          </div>

          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.matchId} className="glass p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60 text-sm">{m.matchId} · {m.teamA} vs {m.teamB}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="flex flex-wrap gap-2">
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
                <input className="field mt-3" placeholder="Catatan ringkas (pilihan)"
                  value={m.note} onChange={(e) => setMatch(m.matchId, { note: e.target.value })} />
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "players" && (
        <>
          <p className="text-white/50 text-sm mb-3">
            Senarai peserta semua daerah. IGN dan ID disembunyikan untuk host.
          </p>
          <div className="overflow-x-auto glass p-1">
            <table className="w-full text-sm">
              <thead><tr className="text-gold/80 text-left">
                {["Daerah", "Kategori", "Nama Penuh"].map((h) =>
                  <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>
                {allPlayers.map((p) => (
                  <tr key={p.playerId} className="row-hover border-t border-white/5">
                    <td className="px-3 py-2">{p.district}</td>
                    <td className="px-3 py-2">{p.category}</td>
                    <td className="px-3 py-2">{p.fullName}</td>
                  </tr>
                ))}
                {allPlayers.length === 0 && <tr><td colSpan={3} className="px-3 py-6 text-center text-white/50">Tiada peserta berdaftar lagi.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
