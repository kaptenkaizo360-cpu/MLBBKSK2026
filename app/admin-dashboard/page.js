"use client";
import { useState } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { resetStore } from "@/lib/store";
import { DISTRICTS } from "@/data/districts";
import { Download, Trash2, RotateCcw, Users, Database, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const { ready } = useGuard(["admin"]);
  const { store, commit, refresh } = useStore();
  const [tab, setTab] = useState("teams");

  if (!ready || !store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  const allPlayers = store.teams.flatMap((t) =>
    (t.players || []).map((p) => ({ ...p, team: t.teamName, district: t.district, category: t.category }))
  );

  function exportCSV() {
    const rows = [["Daerah", "Kategori", "Pasukan", "Nama", "No KP", "Username MLBB", "IGN", "Role", "Status"]];
    allPlayers.forEach((p) => rows.push([p.district, p.category, p.team, p.fullName, p.icNumber, p.usernameMLBB, p.ign, p.role, p.status]));
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

  const tabs = [
    { id: "teams", label: "Pasukan", icon: ShieldCheck },
    { id: "players", label: "Peserta & IGN", icon: Users },
    { id: "data", label: "Data & Tetapan", icon: Database },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display gold-text text-2xl font-bold">Dashboard Admin Negeri</h1>
        <button onClick={exportCSV} className="btn btn-gold text-sm"><Download size={16} /> Export CSV</button>
      </div>

      <div className="flex gap-2 my-6">
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
              {["Daerah", "Pasukan", "Nama", "No KP", "Username MLBB", "IGN", "Role", "Status"].map((h) =>
                <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>)}
            </tr></thead>
            <tbody>
              {allPlayers.map((p) => (
                <tr key={p.playerId} className="row-hover border-t border-white/5">
                  <td className="px-3 py-2">{p.district}</td>
                  <td className="px-3 py-2">{p.team}</td>
                  <td className="px-3 py-2">{p.fullName}</td>
                  <td className="px-3 py-2">{p.icNumber}</td>
                  <td className="px-3 py-2">{p.usernameMLBB}</td>
                  <td className="px-3 py-2 gold-text">{p.ign}</td>
                  <td className="px-3 py-2">{p.role}</td>
                  <td className="px-3 py-2">{p.status}</td>
                </tr>
              ))}
              {allPlayers.length === 0 && <tr><td colSpan={8} className="px-3 py-6 text-center text-white/50">Tiada peserta berdaftar.</td></tr>}
            </tbody>
          </table>
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
            <p className="text-white/40 text-xs mt-2">Reset password sebenar memerlukan sambungan database (Firebase).</p>
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
