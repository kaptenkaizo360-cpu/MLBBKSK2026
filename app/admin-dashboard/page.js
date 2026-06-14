"use client";
import { useState } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { resetStore, semifinalPairs, setKnockout, leagueComplete } from "@/lib/store";
import { DISTRICTS, CATEGORIES } from "@/data/districts";
import { Download, Trash2, RotateCcw, Users, Database, ShieldCheck, Trophy } from "lucide-react";

export default function AdminDashboard() {
  const { ready } = useGuard(["admin"]);
  const { store, commit, refresh } = useStore();
  const [tab, setTab] = useState("teams");

  if (!ready || !store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  const allPlayers = store.teams.flatMap((t) =>
    (t.players || []).map((p) => ({ ...p, team: t.teamName, district: t.district, category: t.category }))
  );

  function exportCSV() {
    const rows = [["Daerah", "Kategori", "Nama Sekolah", "Nama Penuh", "No Kad OKU", "Username Profile", "IGN"]];
    allPlayers.forEach((p) => rows.push([p.district, p.category, p.school, p.fullName, p.okuCard, p.usernameMLBB, p.ign]));
    const csv = rows.map((r) => r.map((c) => `"${c || ""}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "mlbb_peserta.csv"; a.click();
  }
  function verify(teamId, val) {
    commit({ ...store, teams: store.teams.map((t) => t.teamId === teamId ? { ...t, registered: val } : t) });
  }
  function deleteTeamData(teamId) {
    commit({ ...store, teams: store.teams.map((t) => t.teamId === teamId
      ? { ...t, registered: false, school: "", managerName: "", phone: "", email: "", players: [] } : t) });
  }
  function setKO(cat, patch) {
    commit(setKnockout(store, cat, patch));
  }

  const tabs = [
    { id: "teams", label: "Pasukan", icon: ShieldCheck },
    { id: "players", label: "Peserta & IGN", icon: Users },
    { id: "knockout", label: "Kalah Mati", icon: Trophy },
    { id: "data", label: "Data & Tetapan", icon: Database },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display gold-text text-2xl font-bold">Dashboard Admin Negeri</h1>
        <button onClick={exportCSV} className="btn btn-gold text-sm"><Download size={16} /> Export CSV</button>
      </div>

      <div className="flex flex-wrap gap-2 my-6">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`btn text-sm ${tab === t.id ? "btn-gold" : "btn-ghost"}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "teams" && (
        <div className="overflow-x-auto glass p-1">
          <table className="w-full text-sm">
            <thead><tr className="text-gold/80 text-left">
              {["Daerah", "Kategori", "Kump.", "Pasukan", "Sekolah", "Pengurus", "Telefon", "Peserta", "Status", "Tindakan"].map((h) =>
                <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>
              {store.teams.map((t) => (
                <tr key={t.teamId} className="row-hover border-t border-white/5">
                  <td className="px-3 py-2">{t.district}</td>
                  <td className="px-3 py-2">{t.category}</td>
                  <td className="px-3 py-2">{t.group}</td>
                  <td className="px-3 py-2">{t.teamName}</td>
                  <td className="px-3 py-2">{t.school || "-"}</td>
                  <td className="px-3 py-2">{t.managerName || "-"}</td>
                  <td className="px-3 py-2">{t.phone || "-"}</td>
                  <td className="px-3 py-2">{t.players?.length || 0}</td>
                  <td className="px-3 py-2">{t.registered ? <span className="text-gold">Disahkan</span> : <span className="text-white/40">Belum</span>}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button onClick={() => verify(t.teamId, !t.registered)} className="text-gold text-xs underline">
                      {t.registered ? "Batal" : "Sahkan"}
                    </button>
                    <button onClick={() => deleteTeamData(t.teamId)} className="text-red-300"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "players" && (
        <div className="overflow-x-auto glass p-1">
          <table className="w-full text-sm">
            <thead><tr className="text-gold/80 text-left">
              {["Daerah", "Kategori", "Nama Sekolah", "Nama Penuh", "No Kad OKU", "Username Profile", "IGN"].map((h) =>
                <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>
              {allPlayers.map((p) => (
                <tr key={p.playerId} className="row-hover border-t border-white/5">
                  <td className="px-3 py-2">{p.district}</td>
                  <td className="px-3 py-2">{p.category}</td>
                  <td className="px-3 py-2">{p.school}</td>
                  <td className="px-3 py-2">{p.fullName}</td>
                  <td className="px-3 py-2">{p.okuCard}</td>
                  <td className="px-3 py-2">{p.usernameMLBB}</td>
                  <td className="px-3 py-2 gold-text">{p.ign}</td>
                </tr>
              ))}
              {allPlayers.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-white/50">Tiada peserta berdaftar.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "knockout" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
            const done = leagueComplete(store, cat);
            if (!done) {
              return (
                <div key={cat} className="glass p-5">
                  <h3 className="font-display gold-text mb-2">{cat}</h3>
                  <p className="text-white/55 text-sm">
                    Keputusan kalah mati boleh diisi setelah semua perlawanan liga {cat} selesai.
                  </p>
                </div>
              );
            }
            const { sf1, sf2 } = semifinalPairs(store, cat);
            const ko = (store.knockout && store.knockout[cat]) || {};
            const finalists = [ko.sf1Winner, ko.sf2Winner].filter(Boolean);
            const sfLosers = [];
            if (ko.sf1Winner) sfLosers.push([sf1.home, sf1.away].find((t) => t && t.teamName !== ko.sf1Winner)?.teamName);
            if (ko.sf2Winner) sfLosers.push([sf2.home, sf2.away].find((t) => t && t.teamName !== ko.sf2Winner)?.teamName);
            return (
              <div key={cat} className="glass p-5">
                <h3 className="font-display gold-text mb-4">{cat}</h3>

                <KOSelect label="Pemenang Separuh Akhir 1" value={ko.sf1Winner || ""}
                  options={[sf1.home, sf1.away]} onChange={(v) => setKO(cat, { sf1Winner: v })} />
                <KOSelect label="Pemenang Separuh Akhir 2" value={ko.sf2Winner || ""}
                  options={[sf2.home, sf2.away]} onChange={(v) => setKO(cat, { sf2Winner: v })} />

                <KOSelectNames label="Johan (Pemenang Final)" value={ko.finalWinner || ""}
                  names={finalists} onChange={(v) => setKO(cat, { finalWinner: v })} />

                <KOSelectNames label="Pemenang Tempat ke-3" value={ko.thirdWinner || ""}
                  names={sfLosers.filter(Boolean)} onChange={(v) => setKO(cat, { thirdWinner: v })} />

                <p className="text-white/40 text-xs mt-2">
                  Kedudukan ke-5 dikira automatik (mata tertinggi pasukan tidak layak). Boleh override di bawah.
                </p>
                <KOSelectTeams cat={cat} store={store} value={ko.fifth || ""}
                  onChange={(v) => setKO(cat, { fifth: v })} />
              </div>
            );
          })}
        </div>
      )}

      {tab === "data" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass p-6">
            <h3 className="font-display gold-text mb-3">Kredensial Login Daerah</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-gold/80 text-left"><th className="px-2 py-1">Daerah</th><th className="px-2 py-1">User ID</th><th className="px-2 py-1">Password</th></tr></thead>
                <tbody>
                  {DISTRICTS.map((d) => (
                    <tr key={d.userId} className="border-t border-white/5">
                      <td className="px-2 py-1">{d.name}</td>
                      <td className="px-2 py-1 font-mono text-xs">{d.userId}</td>
                      <td className="px-2 py-1 font-mono text-xs text-white/60">{d.password}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass p-6">
            <h3 className="font-display gold-text mb-3">Tetapan Sistem</h3>
            <p className="text-white/60 text-sm mb-4">Reset semula keseluruhan data demo (pasukan, peserta, keputusan).</p>
            <button onClick={() => { resetStore(); refresh(); }} className="btn btn-ghost text-sm">
              <RotateCcw size={16} /> Reset Data Pertandingan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function KOSelect({ label, value, options, onChange }) {
  return (
    <div className="mb-3">
      <label className="text-xs text-white/60">{label}</label>
      <select className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-ink">— Pilih —</option>
        {options.filter(Boolean).map((t) => <option key={t.teamId} value={t.teamName} className="bg-ink">{t.teamName}</option>)}
      </select>
    </div>
  );
}
function KOSelectNames({ label, value, names, onChange }) {
  return (
    <div className="mb-3">
      <label className="text-xs text-white/60">{label}</label>
      <select className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-ink">— Pilih —</option>
        {names.map((n) => <option key={n} value={n} className="bg-ink">{n}</option>)}
      </select>
    </div>
  );
}
function KOSelectTeams({ cat, store, value, onChange }) {
  const teams = store.teams.filter((t) => t.category === cat);
  return (
    <div className="mt-1">
      <label className="text-xs text-white/60">Override Kedudukan ke-5 (pilihan)</label>
      <select className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-ink">— Auto —</option>
        {teams.map((t) => <option key={t.teamId} value={t.teamName} className="bg-ink">{t.teamName}</option>)}
      </select>
    </div>
  );
}
