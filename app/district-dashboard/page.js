"use client";
import { useState, useMemo } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { PLAYER_ROLES } from "@/data/districts";
import { Plus, Trash2, Save, UserPlus, CheckCircle2 } from "lucide-react";

export default function DistrictDashboard() {
  const { session, ready } = useGuard(["district"]);
  const { store, commit } = useStore();
  const [activeId, setActiveId] = useState(null);

  const myTeams = useMemo(
    () => (store && session ? store.teams.filter((t) => t.district === session.district) : []),
    [store, session]
  );

  if (!ready || !store) return <Loading />;

  const active = myTeams.find((t) => t.teamId === activeId);

  function updateTeam(teamId, patch) {
    const next = { ...store, teams: store.teams.map((t) => t.teamId === teamId ? { ...t, ...patch } : t) };
    commit(next);
  }
  function addPlayer(teamId) {
    const t = store.teams.find((x) => x.teamId === teamId);
    const players = [...(t.players || []), {
      playerId: `P${Date.now()}`, fullName: "", icNumber: "", school: "",
      usernameMLBB: "", ign: "", role: "Mage", status: "Utama",
    }];
    updateTeam(teamId, { players });
  }
  function updatePlayer(teamId, pid, patch) {
    const t = store.teams.find((x) => x.teamId === teamId);
    updateTeam(teamId, { players: t.players.map((p) => p.playerId === pid ? { ...p, ...patch } : p) });
  }
  function removePlayer(teamId, pid) {
    const t = store.teams.find((x) => x.teamId === teamId);
    updateTeam(teamId, { players: t.players.filter((p) => p.playerId !== pid) });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold">Dashboard Daerah {session.district}</h1>
      <p className="text-white/60 mb-8">Kumpulan {session.group} · Daftar pasukan sekolah rendah & menengah</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {myTeams.map((t) => (
          <button key={t.teamId} onClick={() => setActiveId(t.teamId)}
            className={`glass p-5 text-left transition ${activeId === t.teamId ? "shadow-goldglow" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg">{t.category}</span>
              {t.registered && <CheckCircle2 className="text-gold" size={18} />}
            </div>
            <div className="text-white/60 text-sm mt-1">
              {t.registered ? `${t.teamName} · ${t.players?.length || 0} peserta` : "Belum berdaftar"}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="glass p-6">
          <h2 className="font-display gold-text text-xl mb-4">Borang Pendaftaran — {active.category}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Sekolah" value={active.school} onChange={(v) => updateTeam(active.teamId, { school: v })} />
            <Field label="Nama Pasukan" value={active.teamName} onChange={(v) => updateTeam(active.teamId, { teamName: v })} />
            <Field label="Nama Pengurus" value={active.managerName} onChange={(v) => updateTeam(active.teamId, { managerName: v })} />
            <Field label="No. Telefon Pengurus" value={active.phone} onChange={(v) => updateTeam(active.teamId, { phone: v })} />
            <Field label="Email Pengurus" value={active.email} onChange={(v) => updateTeam(active.teamId, { email: v })} />
            <Field label="Kumpulan" value={active.group} disabled />
          </div>

          <div className="flex items-center justify-between mt-8 mb-3">
            <h3 className="font-display gold-text">Senarai Peserta</h3>
            <button onClick={() => addPlayer(active.teamId)} className="btn btn-emerald text-sm">
              <UserPlus size={16} /> Tambah Peserta
            </button>
          </div>

          <div className="space-y-3">
            {(active.players || []).map((p) => (
              <div key={p.playerId} className="glass p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Nama Penuh" value={p.fullName} onChange={(v) => updatePlayer(active.teamId, p.playerId, { fullName: v })} />
                <Field label="No. KP / MyKid" value={p.icNumber} onChange={(v) => updatePlayer(active.teamId, p.playerId, { icNumber: v })} />
                <Field label="Username MLBB" value={p.usernameMLBB} onChange={(v) => updatePlayer(active.teamId, p.playerId, { usernameMLBB: v })} />
                <Field label="IGN" value={p.ign} onChange={(v) => updatePlayer(active.teamId, p.playerId, { ign: v })} />
                <div>
                  <label className="text-xs text-white/60">Role</label>
                  <select className="field mt-1" value={p.role} onChange={(e) => updatePlayer(active.teamId, p.playerId, { role: e.target.value })}>
                    {PLAYER_ROLES.map((r) => <option key={r} className="bg-ink">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/60">Status</label>
                  <select className="field mt-1" value={p.status} onChange={(e) => updatePlayer(active.teamId, p.playerId, { status: e.target.value })}>
                    <option className="bg-ink">Utama</option>
                    <option className="bg-ink">Simpanan</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => removePlayer(active.teamId, p.playerId)} className="btn btn-ghost text-sm">
                    <Trash2 size={16} /> Buang
                  </button>
                </div>
              </div>
            ))}
            {(active.players || []).length === 0 && (
              <p className="text-white/50 text-sm">Belum ada peserta. Tekan "Tambah Peserta".</p>
            )}
          </div>

          <button onClick={() => updateTeam(active.teamId, { registered: true })}
            className="btn btn-gold mt-6">
            <Save size={18} /> {active.registered ? "Kemaskini Pendaftaran" : "Hantar Pendaftaran"}
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="text-xs text-white/60">{label}</label>
      <input className="field mt-1" value={value || ""} disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)} />
    </div>
  );
}
function Loading() {
  return <div className="text-center py-20 text-white/60">Memuatkan…</div>;
}
