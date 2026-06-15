"use client";
import { useState, useEffect } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { StatusBadge } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { Swords, RefreshCcw, Users, Trophy, Pencil, Save } from "lucide-react";
import KnockoutEditor from "@/components/KnockoutEditor";

export default function HostDashboard() {
  const { session, ready } = useGuard(["host"]);
  const { store, commit } = useStore();
  const [tab, setTab] = useState("results");
  const [cat, setCat] = useState("Sekolah Rendah");
  const [grp, setGrp] = useState("A");
  const [editingMatch, setEditingMatch] = useState(null); // matchId yang sedang diedit
  const [draftWinner, setDraftWinner] = useState(null);    // "A" | "B" | null

  if (!ready || !store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  const matches = store.matches.filter((m) => m.category === cat && m.group === grp);

  const allPlayers = store.teams.flatMap((t) =>
    (t.players || []).map((p) => ({ ...p, team: t.teamName, district: t.district, category: t.category }))
  );

  function setMatch(matchId, patch) {
    commit({ ...store, matches: store.matches.map((m) => m.matchId === matchId ? { ...m, ...patch } : m) });
  }
  function startEditMatch(m) {
    setEditingMatch(m.matchId);
    setDraftWinner(m.winner === m.teamA ? "A" : m.winner === m.teamB ? "B" : null);
  }
  function cancelEditMatch() {
    setEditingMatch(null);
    setDraftWinner(null);
  }
  function saveMatch(m) {
    if (!draftWinner) { window.alert("Sila pilih pasukan yang menang dahulu."); return; }
    if (!window.confirm("Simpan keputusan perlawanan ini?")) return;
    const winner = draftWinner === "A" ? m.teamA : m.teamB;
    const loser = draftWinner === "A" ? m.teamB : m.teamA;
    setMatch(m.matchId, { winner, loser, status: "completed", updatedBy: session.userId });
    setEditingMatch(null);
    setDraftWinner(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2">
        <Swords /> Dashboard Host
      </h1>
      <p className="text-white/60 mb-6">Pilih pemenang — standing auto-update (Menang = 3 mata).</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setTab("results")} className={`btn text-sm ${tab === "results" ? "btn-gold" : "btn-ghost"}`}>
          <Swords size={16} /> Keputusan
        </button>
        <button onClick={() => setTab("knockout")} className={`btn text-sm ${tab === "knockout" ? "btn-gold" : "btn-ghost"}`}>
          <Trophy size={16} /> Separuh Akhir & Final
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
              {["A", "B", "C"].map((g) => <option key={g} className="bg-ink" value={g}>Kumpulan {g}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {matches.map((m) => {
              const isEditing = editingMatch === m.matchId;
              const isDone = m.status === "completed";
              const selA = isEditing ? draftWinner === "A" : m.winner === m.teamA;
              const selB = isEditing ? draftWinner === "B" : m.winner === m.teamB;
              return (
                <div key={m.matchId} className="glass p-4">
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <span className="text-white/60 text-sm">{m.matchId} · {m.teamA} vs {m.teamB}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={m.status} />
                      {!isEditing && (
                        <button onClick={() => startEditMatch(m)} className="btn btn-gold !py-1 !px-3 text-xs">
                          <Pencil size={13} /> {isDone ? "Edit" : "Isi"}
                        </button>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => setDraftWinner("A")} className={`btn text-sm ${selA ? "btn-gold" : "btn-emerald"}`}>
                          Menang: {m.teamA}
                        </button>
                        <button onClick={() => setDraftWinner("B")} className={`btn text-sm ${selB ? "btn-gold" : "btn-emerald"}`}>
                          Menang: {m.teamB}
                        </button>
                        <button onClick={() => setMatch(m.matchId, { status: "live" })} className="btn btn-ghost text-sm">Tanda Live</button>
                      </div>
                      <NoteField value={m.note} onSave={(v) => setMatch(m.matchId, { note: v })} />
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={() => saveMatch(m)} className="btn btn-gold text-sm">
                          <Save size={15} /> Simpan Keputusan
                        </button>
                        <button onClick={cancelEditMatch} className="btn btn-ghost text-sm">Batal</button>
                        <button onClick={() => { setMatch(m.matchId, { winner: "", loser: "", status: "pending", updatedBy: "" }); cancelEditMatch(); }} className="btn btn-danger text-sm">
                          <RefreshCcw size={14} /> Reset
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-white/70">
                      {isDone ? (
                        <span>Pemenang: <span className="gold-text font-semibold">{m.winner}</span>{m.note ? ` · ${m.note}` : ""}</span>
                      ) : m.status === "live" ? (
                        <span className="text-red-300">Sedang berlangsung…</span>
                      ) : (
                        <span className="text-white/40">Belum diisi. Tekan "Isi" untuk masukkan keputusan.</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "knockout" && (
        <>
          <p className="text-white/55 text-sm mb-4">
            Isi keputusan separuh akhir, final, dan tempat ke-3/ke-4. Kedudukan akhir dikemaskini automatik.
          </p>
          <KnockoutEditor store={store} commit={commit} allowFifthOverride={false} />
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

// Medan catatan dengan state tempatan — taip lancar, simpan bila hilang fokus
function NoteField({ value, onSave }) {
  const [local, setLocal] = useState(value || "");
  const [focused, setFocused] = useState(false);

  // Selaras dengan data luar HANYA bila tidak sedang menaip
  useEffect(() => {
    if (!focused) setLocal(value || "");
  }, [value, focused]);

  return (
    <input
      className="field mt-3"
      placeholder="Catatan ringkas (pilihan)"
      value={local}
      onFocus={() => setFocused(true)}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { setFocused(false); if (local !== (value || "")) onSave(local); }}
    />
  );
}
