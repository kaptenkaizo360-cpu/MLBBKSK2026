"use client";
import { useState, useMemo } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { Trash2, Save, UserPlus, CheckCircle2, RotateCcw, Lock, Pencil } from "lucide-react";

export default function DistrictDashboard() {
  const { session, ready } = useGuard(["district"]);
  const { store, commit } = useStore();
  const [activeId, setActiveId] = useState(null);
  const [editingId, setEditingId] = useState(null); // pasukan yang sedang dibuka untuk edit

  const myTeams = useMemo(
    () => (store && session ? store.teams.filter((t) => t.district === session.district) : []),
    [store, session]
  );

  if (!ready || !store) return <Loading />;

  const active = myTeams.find((t) => t.teamId === activeId);
  // Dikunci jika sudah berdaftar DAN tidak dalam mod edit
  const locked = active?.registered && editingId !== active?.teamId;

  function updateTeam(teamId, patch) {
    const next = { ...store, teams: store.teams.map((t) => t.teamId === teamId ? { ...t, ...patch } : t) };
    commit(next);
  }
  function addPlayer(teamId) {
    const t = store.teams.find((x) => x.teamId === teamId);
    const players = [...(t.players || []), {
      playerId: `P${Date.now()}`,
      fullName: "", ign: "", mlId: "",
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
  function saveTeam(teamId) {
    const ok = window.confirm("Adakah anda pasti untuk menyimpan data ini?");
    if (!ok) return;
    updateTeam(teamId, { registered: true });
    setEditingId(null);
    window.alert(
      "Data telah disimpan.\n\nUntuk membetulkan maklumat selepas ini, tekan butang 'Edit Maklumat'."
    );
  }
  function startEdit(teamId) {
    setEditingId(teamId);
  }
  function resetTeam(teamId) {
    const ok = window.confirm(
      "PERINGATAN: Ini akan PADAM semua maklumat pasukan & peserta ini supaya anda boleh isi semula.\n\nTeruskan reset?"
    );
    if (!ok) return;
    updateTeam(teamId, {
      school: "", managerName: "", phone: "", email: "",
      registered: false, players: [],
    });
    setEditingId(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold">Dashboard Daerah {session.district}</h1>
      <p className="text-white/60 mb-8">Daftar pasukan sekolah rendah & menengah</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {myTeams.map((t) => (
          <button key={t.teamId} onClick={() => setActiveId(t.teamId)}
            className={`glass p-5 text-left transition ${activeId === t.teamId ? "shadow-goldglow" : ""}`}>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg">{t.category}</span>
              {t.registered && <CheckCircle2 className="text-gold" size={18} />}
            </div>
            <div className="text-white/60 text-sm mt-1">
              Kumpulan {t.group} · {t.registered ? `${t.teamName} · ${t.players?.length || 0} peserta` : "Belum berdaftar"}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-display gold-text text-xl">Borang Pendaftaran — {active.category}</h2>
            {locked && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs glass px-3 py-1.5 text-gold">
                  <Lock size={14} /> Disimpan
                </span>
                <button onClick={() => startEdit(active.teamId)} className="btn btn-gold text-sm">
                  <Pencil size={14} /> Edit Maklumat
                </button>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Sekolah" value={active.school} disabled={locked} onChange={(v) => updateTeam(active.teamId, { school: v })} />
            <Field label="Nama Pasukan" value={active.teamName} disabled={locked} onChange={(v) => updateTeam(active.teamId, { teamName: v })} />
            <Field label="Nama Pengurus" value={active.managerName} disabled={locked} onChange={(v) => updateTeam(active.teamId, { managerName: v })} />
            <Field label="No. Telefon Pengurus" value={active.phone} disabled={locked} onChange={(v) => updateTeam(active.teamId, { phone: v })} />
            <Field label="Kumpulan" value={active.group} disabled />
          </div>

          <div className="flex items-center justify-between mt-8 mb-3">
            <h3 className="font-display gold-text">Senarai Peserta</h3>
            {!locked && (
              <button onClick={() => addPlayer(active.teamId)} className="btn btn-emerald text-sm">
                <UserPlus size={16} /> Tambah Peserta
              </button>
            )}
          </div>

          <div className="space-y-3">
            {(active.players || []).map((p) => (
              <div key={p.playerId} className="glass p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Nama Penuh" value={p.fullName} disabled={locked} onChange={(v) => updatePlayer(active.teamId, p.playerId, { fullName: v })} />
                <Field label="IGN" value={p.ign} disabled={locked} onChange={(v) => updatePlayer(active.teamId, p.playerId, { ign: v })} />
                <Field label="ID" value={p.mlId} disabled={locked} onChange={(v) => updatePlayer(active.teamId, p.playerId, { mlId: v })} />
                {!locked && (
                  <div className="flex items-end">
                    <button onClick={() => removePlayer(active.teamId, p.playerId)} className="btn btn-ghost text-sm">
                      <Trash2 size={16} /> Buang
                    </button>
                  </div>
                )}
              </div>
            ))}
            {(active.players || []).length === 0 && (
              <p className="text-white/50 text-sm">Belum ada peserta. {locked ? "" : 'Tekan "Tambah Peserta".'}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {!locked && (
              <button onClick={() => saveTeam(active.teamId)} className="btn btn-gold">
                <Save size={18} /> {active.registered ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            )}
            {locked && (
              <button onClick={() => startEdit(active.teamId)} className="btn btn-emerald">
                <Pencil size={18} /> Edit Maklumat
              </button>
            )}
            <button onClick={() => resetTeam(active.teamId)} className="btn btn-danger">
              <RotateCcw size={18} /> Reset Pasukan Ini
            </button>
          </div>
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
