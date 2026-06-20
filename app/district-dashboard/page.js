"use client";
import { useState, useMemo, useEffect } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import { Trash2, Save, UserPlus, CheckCircle2, RotateCcw, Lock, Pencil } from "lucide-react";
import { useUnsavedWarning } from "@/components/useUnsavedWarning";

const MAX_PLAYERS = 6;

export default function DistrictDashboard() {
  const { session, ready } = useGuard(["district"]);
  const { store, commit, saveToSheet, dirty } = useStore();
  useUnsavedWarning(dirty || false);
  const [activeId, setActiveId] = useState(null);
  const [editing, setEditing] = useState(false); // sedang isi/edit borang
  const [draft, setDraft] = useState(null);       // salinan tempatan (apa yang ditaip)

  const myTeams = useMemo(
    () => (store && session ? store.teams.filter((t) => t.district === session.district) : []),
    [store, session]
  );

  // Pasukan asal dari store (untuk paparan bila tidak edit)
  const activeOriginal = myTeams.find((t) => t.teamId === activeId);

  // Bila pilih pasukan baru, tutup mod edit
  useEffect(() => { setEditing(false); setDraft(null); }, [activeId]);

  if (!ready || !store) return <Loading />;

  // Data yang dipaparkan: draf bila edit, asal bila tidak
  const active = editing && draft ? draft : activeOriginal;
  const locked = activeOriginal?.registered && !editing;

  function openTeam(teamId) {
    setActiveId(teamId);
  }
  function startEdit() {
    // Salin data store ke draf tempatan — taip pada draf, tak sentuh store/Sheet
    setDraft(JSON.parse(JSON.stringify(activeOriginal)));
    setEditing(true);
  }
  // Kemaskini DRAF sahaja (tiada sync, tiada lag, tiada timpa)
  function setField(patch) {
    setDraft((d) => ({ ...d, ...patch }));
  }
  function setPlayer(pid, patch) {
    setDraft((d) => ({ ...d, players: (d.players || []).map((p) => p.playerId === pid ? { ...p, ...patch } : p) }));
  }
  function addPlayer() {
    setDraft((d) => {
      if ((d.players || []).length >= MAX_PLAYERS) {
        window.alert(`Maksimum ${MAX_PLAYERS} peserta sahaja dibenarkan bagi setiap pasukan.`);
        return d;
      }
      return { ...d, players: [...(d.players || []), { playerId: `P${Date.now()}`, fullName: "", ign: "", mlId: "" }] };
    });
  }
  function removePlayer(pid) {
    setDraft((d) => ({ ...d, players: (d.players || []).filter((p) => p.playerId !== pid) }));
  }

  // SIMPAN — barulah tulis draf ke store + Sheet
  async function saveTeam() {
    const ok = window.confirm("Adakah anda pasti untuk menyimpan data ini?");
    if (!ok) return;
    const saved = { ...draft, registered: true };
    commit({ ...store, teams: store.teams.map((t) => t.teamId === saved.teamId ? saved : t) });
    setEditing(false);
    setDraft(null);
    const okSheet = await saveToSheet();
    window.alert(okSheet
      ? "Data telah disimpan dan dihantar ke pangkalan data."
      : "Data disimpan dalam pelayar. (Sambungan Sheet tiada — perubahan belum dihantar ke pangkalan data.)");
  }
  function resetTeam() {
    const ok = window.confirm("PERINGATAN: Ini akan PADAM semua maklumat pasukan & peserta ini.\n\nTeruskan reset?");
    if (!ok) return;
    const cleared = { ...activeOriginal, school: "", managerName: "", phone: "", email: "", registered: false, players: [] };
    commit({ ...store, teams: store.teams.map((t) => t.teamId === cleared.teamId ? cleared : t) });
    setEditing(false);
    setDraft(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold">Dashboard Daerah {session.district}</h1>
      <p className="text-white/60 mb-2">Pendaftaran pasukan sekolah rendah & menengah</p>
      <div className="inline-flex items-center gap-2 text-xs glass px-3 py-1.5 text-gold mb-8">
        <Lock size={13} /> Pendaftaran telah ditutup. Sebarang pembetulan perlu dibuat oleh admin.
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {myTeams.map((t) => (
          <button key={t.teamId} onClick={() => openTeam(t.teamId)}
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
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-display gold-text text-xl">Borang Pendaftaran — {active.category}</h2>
            {locked && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs glass px-3 py-1.5 text-gold">
                  <Lock size={14} /> Disimpan
                </span>
                <button disabled title="Pendaftaran telah ditutup. Hubungi admin untuk sebarang pembetulan."
                  className="btn text-sm bg-white/10 text-white/40 cursor-not-allowed border border-white/10">
                  <Pencil size={14} /> Edit Maklumat (Ditutup)
                </button>
              </div>
            )}
            {!locked && !editing && !activeOriginal?.registered && (
              <button onClick={startEdit} className="btn btn-gold text-sm">
                <Pencil size={14} /> Mula Isi
              </button>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nama Pasukan" value={active.teamName} disabled={!editing} onChange={(v) => setField({ teamName: v })} />
            <Field label="Nama Pengurus" value={active.managerName} disabled={!editing} onChange={(v) => setField({ managerName: v })} />
            <Field label="No. Telefon Pengurus" value={active.phone} disabled={!editing} onChange={(v) => setField({ phone: v })} />
          </div>

          <div className="flex items-center justify-between mt-8 mb-3">
            <h3 className="font-display gold-text">
              Senarai Peserta <span className="text-white/50 text-sm font-normal">({(active.players || []).length}/{MAX_PLAYERS})</span>
            </h3>
            {editing && (active.players || []).length < MAX_PLAYERS && (
              <button onClick={addPlayer} className="btn btn-emerald text-sm">
                <UserPlus size={16} /> Tambah Peserta
              </button>
            )}
          </div>
          {editing && (active.players || []).length >= MAX_PLAYERS && (
            <p className="text-gold/80 text-xs mb-3">Maksimum {MAX_PLAYERS} peserta telah dicapai.</p>
          )}

          <div className="space-y-3">
            {(active.players || []).map((p) => (
              <div key={p.playerId} className="glass p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Field label="Nama Penuh" value={p.fullName} disabled={!editing} onChange={(v) => setPlayer(p.playerId, { fullName: v })} />
                <Field label="IGN" value={p.ign} disabled={!editing} onChange={(v) => setPlayer(p.playerId, { ign: v })} />
                <Field label="ID" value={p.mlId} disabled={!editing} onChange={(v) => setPlayer(p.playerId, { mlId: v })} />
                {editing && (
                  <div className="flex items-end">
                    <button onClick={() => removePlayer(p.playerId)} className="btn btn-ghost text-sm">
                      <Trash2 size={16} /> Buang
                    </button>
                  </div>
                )}
              </div>
            ))}
            {(active.players || []).length === 0 && (
              <p className="text-white/50 text-sm">Belum ada peserta. {editing ? 'Tekan "Tambah Peserta".' : ""}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {editing && (
              <button onClick={saveTeam} className="btn btn-gold">
                <Save size={18} /> {activeOriginal?.registered ? "Simpan Perubahan" : "Simpan Data"}
              </button>
            )}
            {editing && (
              <button onClick={() => { setEditing(false); setDraft(null); }} className="btn btn-ghost">
                Batal
              </button>
            )}
            <button onClick={resetTeam} className="btn btn-danger">
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
