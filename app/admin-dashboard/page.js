"use client";
import { useState, useEffect } from "react";
import { useGuard } from "@/components/useGuard";
import { useStore } from "@/components/useStore";
import SectionActions from "@/components/SectionActions";
import { useUnsavedWarning } from "@/components/useUnsavedWarning";
import { resetStore, semifinalPairs, setKnockout, leagueComplete, setTeamGroup, removeTeamFromLeague, restoreTeam, activeGroups, isPublished, setPublished, registrationComplete } from "@/lib/store";
import { syncNow, getSyncStatus, syncEnabled } from "@/lib/sync";
import { DISTRICTS, CATEGORIES } from "@/data/districts";
import { Download, Trash2, RotateCcw, Users, Database, ShieldCheck, Trophy, Cloud, CloudOff, RefreshCw, ArrowLeftRight, Printer, Save, CalendarCheck } from "lucide-react";

export default function AdminDashboard() {
  const { ready } = useGuard(["admin"]);
  const { store, commit, refresh, saveToSheet, dirty } = useStore();
  const [tab, setTab] = useState("teams");
  useUnsavedWarning(dirty);
  const [printDistrict, setPrintDistrict] = useState("ALL"); // ALL = semua daerah
  const [syncState, setSyncState] = useState("idle");

  useEffect(() => {
    setSyncState(getSyncStatus());
    const onSync = (e) => setSyncState(e.detail);
    window.addEventListener("mlbb-sync", onSync);
    return () => window.removeEventListener("mlbb-sync", onSync);
  }, []);

  if (!ready || !store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  const allPlayers = store.teams.flatMap((t) =>
    (t.players || []).map((p) => ({ ...p, teamId: t.teamId, team: t.teamName, district: t.district, category: t.category }))
  );

  function editPlayer(teamId, playerId, patch) {
    commit({
      ...store,
      teams: store.teams.map((t) =>
        t.teamId === teamId
          ? { ...t, players: (t.players || []).map((p) => p.playerId === playerId ? { ...p, ...patch } : p) }
          : t
      ),
    });
  }

  function exportCSV() {
    const rows = [["Daerah", "Kategori", "Nama Penuh", "IGN", "ID"]];
    allPlayers.forEach((p) => rows.push([p.district, p.category, p.fullName, p.ign, p.mlId]));
    const csv = rows.map((r) => r.map((c) => `"${c || ""}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "mlbb_peserta.csv"; a.click();
  }
  function verify(teamId, val) {
    commit({ ...store, teams: store.teams.map((t) => t.teamId === teamId ? { ...t, registered: val } : t) });
  }
  // Padam semua data daerah (kedua-dua kategori) — untuk daerah tiada pendaftaran
  function deleteDistrict(districtName) {
    const ok = window.confirm(
      `Padam semua data pendaftaran untuk daerah ${districtName}?\n\nTindakan ini akan mengosongkan pasukan & peserta daerah ini.`
    );
    if (!ok) return;
    commit({
      ...store,
      teams: store.teams.map((t) => t.district === districtName
        ? { ...t, registered: false, school: "", managerName: "", phone: "", email: "", players: [] } : t),
    });
  }
  async function saveNow() {
    if (syncEnabled()) {
      const ok = await saveToSheet();
      window.alert(ok ? "Data telah disimpan ke Google Sheet." : "Gagal menyimpan ke Sheet. Cuba lagi.");
    } else {
      window.alert("Data disimpan dalam pelayar ini. (Aktifkan Google Sheet untuk simpanan berkongsi.)");
    }
  }
  function printPlayers() {
    window.print();
  }
  function setKO(cat, patch) {
    commit(setKnockout(store, cat, patch));
  }

  const tabs = [
    { id: "teams", label: "Pasukan", icon: ShieldCheck },
    { id: "players", label: "Peserta & IGN", icon: Users },
    { id: "groups", label: "Kumpulan Liga", icon: ArrowLeftRight },
    { id: "schedule", label: "Jadual Perlawanan", icon: CalendarCheck },
    { id: "knockout", label: "Kalah Mati", icon: Trophy },
    { id: "data", label: "Data & Tetapan", icon: Database },
  ];

  function togglePublish(cat, value) {
    if (value && !registrationComplete(store, cat)) {
      window.alert("Tidak boleh terbitkan — masih ada pasukan yang belum disahkan dalam kategori ini.");
      return;
    }
    const ok = window.confirm(
      value
        ? `Sahkan & terbitkan Jadual Perlawanan + Kedudukan untuk ${cat}? Ia akan dipaparkan di paparan utama.`
        : `Sorok semula Jadual Perlawanan + Kedudukan untuk ${cat} dari paparan utama?`
    );
    if (!ok) return;
    commit(setPublished(store, cat, value));
  }

  function moveTeam(teamId, newGroup) {
    commit(setTeamGroup(store, teamId, newGroup));
  }
  function removeTeam(teamId, teamName) {
    if (!window.confirm(`Buang ${teamName} terus dari liga?\n\nPasukan ini akan HILANG dari semua paparan (Pasukan, Kumpulan, Peserta, Jadual). Boleh dipulihkan semula di tab "Data & Tetapan" jika perlu.`)) return;
    commit(removeTeamFromLeague(store, teamId));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display gold-text text-2xl font-bold">Dashboard Admin Negeri</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <SyncBadge state={syncState} />
          <button onClick={saveNow} className={`btn text-sm ${dirty ? "btn-gold animate-pulse" : "btn-emerald"}`}><Save size={16} /> {dirty ? "Simpan*" : "Simpan"}</button>
          <button onClick={exportCSV} className="btn btn-gold text-sm"><Download size={16} /> Export CSV</button>
          <button onClick={() => { if (window.confirm("Reset SEMUA data pertandingan? Tindakan ini tidak boleh dibatalkan.")) { const s = resetStore(); refresh(); syncNow(s); } }} className="btn btn-danger text-sm">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
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
        <>
          {(() => {
            const noReg = DISTRICTS.filter((d) =>
              !store.teams.some((t) => t.district === d.name && t.registered)
            );
            if (noReg.length === 0) return null;
            return (
              <div className="glass p-4 mb-4">
                <h3 className="font-display gold-text text-sm mb-3">Daerah Tiada Pendaftaran</h3>
                <div className="flex flex-wrap gap-2">
                  {noReg.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1.5">
                      <span className="text-sm text-white/70">{d.name}</span>
                      <button onClick={() => deleteDistrict(d.name)} className="text-red-300 hover:text-red-200">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          {CATEGORIES.map((cat) => {
            const catTeams = store.teams
              .filter((t) => t.category === cat && !t.excluded)
              .sort((a, b) => a.group.localeCompare(b.group) || a.district.localeCompare(b.district));
            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <h3 className="font-display gold-text text-lg flex items-center gap-2">
                    {cat}
                    <span className="text-white/40 text-xs font-normal">
                      {catTeams.filter((t) => t.registered).length}/{catTeams.length} disahkan
                    </span>
                  </h3>
                  <SectionActions dirty={dirty} onSave={saveNow} />
                </div>
                <div className="overflow-x-auto glass p-1">
                  <table className="w-full text-sm">
                    <thead><tr className="text-gold/80 text-left">
                      {["Kump.", "Daerah", "Pasukan", "Pengurus", "Telefon", "Peserta", "Status", "Tindakan"].map((h) =>
                        <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {catTeams.map((t) => (
                        <tr key={t.teamId} className="row-hover border-t border-white/5">
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold/20 text-gold font-semibold border border-gold/40">{t.group}</span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{t.district}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{t.teamName}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{t.managerName || "-"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{t.phone || "-"}</td>
                          <td className="px-3 py-2 text-center">{t.players?.length || 0}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {t.registered
                              ? <span className="text-gold">● Disahkan</span>
                              : <span className="text-white/40">○ Belum</span>}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-3 items-center">
                              <button onClick={() => verify(t.teamId, !t.registered)} className="text-gold text-xs underline whitespace-nowrap">
                                {t.registered ? "Batal" : "Sahkan"}
                              </button>
                              <button onClick={() => removeTeam(t.teamId, t.teamName)} className="text-red-300" title="Buang pasukan terus dari liga"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {catTeams.length === 0 && (
                        <tr><td colSpan={8} className="px-3 py-5 text-center text-white/40">Tiada pasukan.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}

      {tab === "players" && (
        <div id="print-area">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 no-print">
            <p className="text-white/55 text-sm">
              Peserta disusun ikut daerah & kategori. Admin boleh edit terus.
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <select className="field max-w-[200px] text-sm" value={printDistrict}
                onChange={(e) => setPrintDistrict(e.target.value)}>
                <option className="bg-ink" value="ALL">Semua Daerah</option>
                {DISTRICTS.map((d) => (
                  <option key={d.name} className="bg-ink" value={d.name}>{d.name}</option>
                ))}
              </select>
              <button onClick={saveNow} className="btn btn-emerald text-sm"><Save size={16} /> Simpan</button>
              <button onClick={printPlayers} className="btn btn-gold text-sm">
                <Printer size={16} /> Print {printDistrict === "ALL" ? "Semua" : printDistrict}
              </button>
            </div>
          </div>

          <div className="print-title">
            Senarai Peserta — Pertandingan MLBB Pendidikan Khas Negeri Johor 2026
            {printDistrict !== "ALL" && <div style={{ fontSize: "13px", fontWeight: "normal" }}>Daerah {printDistrict}</div>}
          </div>

          {DISTRICTS.filter((d) => printDistrict === "ALL" || d.name === printDistrict).map((d) => {
            const dTeams = store.teams.filter((t) => t.district === d.name);
            return (
              <div key={d.name} className="glass p-4 mb-5 print-block">
                <h3 className="font-display gold-text text-lg mb-3">{d.name}</h3>
                {CATEGORIES.map((cat) => {
                  const teamsInCat = dTeams.filter((t) => t.category === cat);
                  const players = teamsInCat.flatMap((t) => (t.players || []).map((p) => ({ ...p, teamId: t.teamId })));
                  return (
                    <div key={cat} className="mb-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="text-gold/80 text-sm">{cat}</div>
                        <SectionActions dirty={dirty} onSave={saveNow} />
                      </div>
                      {players.length === 0 ? (
                        <p className="text-white/40 text-sm pl-1">Belum ada peserta.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead><tr className="text-gold/70 text-left">
                              {["Bil", "Nama Penuh", "IGN", "ID"].map((h) =>
                                <th key={h} className="px-3 py-2 whitespace-nowrap">{h}</th>)}
                            </tr></thead>
                            <tbody>
                              {players.map((p, i) => (
                                <tr key={p.playerId} className="border-t border-white/5">
                                  <td className="px-3 py-2 text-white/60">{i + 1}</td>
                                  <td className="px-2 py-1"><EditCell value={p.fullName} onSave={(v) => editPlayer(p.teamId, p.playerId, { fullName: v })} /></td>
                                  <td className="px-2 py-1"><EditCell value={p.ign} onSave={(v) => editPlayer(p.teamId, p.playerId, { ign: v })} /></td>
                                  <td className="px-2 py-1"><EditCell value={p.mlId} onSave={(v) => editPlayer(p.teamId, p.playerId, { mlId: v })} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {allPlayers.length === 0 && (
            <p className="text-white/50 text-sm text-center py-6">Tiada peserta berdaftar lagi.</p>
          )}
        </div>
      )}

      {tab === "groups" && (
        <div className="space-y-8">
          <p className="text-white/55 text-sm">
            Susun pasukan ke Kumpulan A atau B (kategori sama sahaja). Buang pasukan yang tidak mendaftar.
            Jadual dijana semula automatik selepas perubahan.
          </p>
          {CATEGORIES.map((cat) => {
            const legacyTeams = store.teams.filter(
              (t) => t.category === cat && !t.excluded && t.group !== "A" && t.group !== "B"
            );
            return (
              <div key={cat}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <h3 className="font-display gold-text text-lg">{cat}</h3>
                  <SectionActions dirty={dirty} onSave={saveNow} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {["A", "B"].map((grp) => {
                    const grpTeams = store.teams.filter((t) => t.category === cat && t.group === grp && !t.excluded);
                    return (
                      <div key={grp} className="glass p-4">
                        <div className="text-gold/80 text-sm mb-3 flex items-center justify-between">
                          <span>Kumpulan {grp}</span>
                          <span className="text-white/40 text-xs">{grpTeams.length} pasukan</span>
                        </div>
                        <div className="space-y-2">
                          {grpTeams.map((t) => (
                            <div key={t.teamId} className="flex items-center justify-between gap-2 bg-black/20 rounded-lg px-3 py-2">
                              <span className="text-sm">{t.teamName} <span className="text-white/40">· {t.district}</span></span>
                              <div className="flex items-center gap-1">
                                <select
                                  value={grp}
                                  onChange={(e) => moveTeam(t.teamId, e.target.value)}
                                  className="field !py-1 !px-2 text-xs max-w-[60px]">
                                  <option value="A" className="bg-ink">A</option>
                                  <option value="B" className="bg-ink">B</option>
                                </select>
                                <button onClick={() => removeTeam(t.teamId, t.teamName)} className="text-red-300 hover:text-red-200" title="Buang pasukan dari liga">
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {grpTeams.length === 0 && <p className="text-white/40 text-sm">Tiada pasukan.</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {legacyTeams.length > 0 && (
                  <div className="glass p-4 mt-4 border border-amber-400/40">
                    <div className="text-amber-300 text-sm mb-2 font-semibold">
                      ⚠ Pasukan kumpulan lama (perlu disusun ke A/B)
                    </div>
                    <div className="space-y-2">
                      {legacyTeams.map((t) => (
                        <div key={t.teamId} className="flex items-center justify-between gap-2 bg-black/20 rounded-lg px-3 py-2">
                          <span className="text-sm">{t.teamName} <span className="text-white/40">· {t.district} · Kumpulan {t.group}</span></span>
                          <div className="flex items-center gap-1">
                            <select
                              defaultValue=""
                              onChange={(e) => e.target.value && moveTeam(t.teamId, e.target.value)}
                              className="field !py-1 !px-2 text-xs max-w-[110px]">
                              <option value="" className="bg-ink">Pindah ke…</option>
                              <option value="A" className="bg-ink">Kumpulan A</option>
                              <option value="B" className="bg-ink">Kumpulan B</option>
                            </select>
                            <button onClick={() => removeTeam(t.teamId, t.teamName)} className="text-red-300 hover:text-red-200" title="Buang pasukan dari liga">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "schedule" && (
        <div className="space-y-8">
          <p className="text-white/55 text-sm">
            Jadual perlawanan dijana automatik dari susunan kumpulan. Sahkan & terbitkan untuk papar
            di paparan utama bersama kedudukan liga. Hanya boleh diterbitkan selepas semua pasukan kategori itu disahkan.
          </p>
          {CATEGORIES.map((cat) => {
            const groups = activeGroups(store, cat);
            const published = isPublished(store, cat);
            const regDone = registrationComplete(store, cat);
            const total = store.teams.filter((t) => t.category === cat && !t.excluded).length;
            const reg = store.teams.filter((t) => t.category === cat && !t.excluded && t.registered).length;
            return (
              <div key={cat} className="glass p-5">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <h3 className="font-display gold-text text-lg">{cat}</h3>
                    <p className="text-white/40 text-xs mt-0.5">
                      {reg}/{total} pasukan disahkan
                      {published && <span className="text-gold ml-2">● Tersiar di paparan utama</span>}
                    </p>
                  </div>
                  {published ? (
                    <button onClick={() => togglePublish(cat, false)} className="btn btn-danger text-sm">
                      <CalendarCheck size={15} /> Sorok Semula
                    </button>
                  ) : (
                    <button onClick={() => togglePublish(cat, true)}
                      disabled={!regDone}
                      className={`btn text-sm ${regDone ? "btn-gold" : "btn-ghost opacity-50 cursor-not-allowed"}`}>
                      <CalendarCheck size={15} /> Sahkan & Terbitkan
                    </button>
                  )}
                </div>

                {groups.map((g) => {
                  const gMatches = store.matches.filter((m) => m.category === cat && m.group === g);
                  return (
                    <div key={g} className="mb-4">
                      <div className="text-gold/70 text-xs mb-2">Kumpulan {g}</div>
                      <div className="space-y-1.5">
                        {gMatches.map((m) => (
                          <div key={m.matchId} className="flex items-center justify-between bg-black/20 rounded-lg px-3 py-2 text-sm">
                            <span className="text-white/40 text-xs">{m.matchId}</span>
                            <span>{m.teamA} <span className="text-gold/60 mx-2">vs</span> {m.teamB}</span>
                          </div>
                        ))}
                        {gMatches.length === 0 && <p className="text-white/40 text-sm">Tiada perlawanan.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
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
            <h3 className="font-display gold-text mb-3 flex items-center gap-2">
              {syncEnabled() ? <Cloud size={18} /> : <CloudOff size={18} />} Pangkalan Data Google Sheet
            </h3>
            {syncEnabled() ? (
              <>
                <p className="text-white/60 text-sm mb-4">
                  Semua user kongsi data dari Sheet ini. Setiap perubahan disimpan terus,
                  dan paparan disegerak setiap beberapa saat. Status: <SyncWord state={syncState} />
                </p>
                <button onClick={() => syncNow(store)} className="btn btn-gold text-sm">
                  <RefreshCw size={16} /> Simpan ke Sheet Sekarang
                </button>
              </>
            ) : (
              <p className="text-white/60 text-sm">
                Sheet belum diaktifkan — data sekarang dalam pelayar ini sahaja. Pasang Apps Script
                (lihat folder <span className="font-mono text-gold">apps-script</span>) dan set{" "}
                <span className="font-mono text-gold">NEXT_PUBLIC_SHEET_SYNC_URL</span> dalam{" "}
                <span className="font-mono">.env.local</span> atau Vercel.
              </p>
            )}
          </div>
          <div className="glass p-6">
            <h3 className="font-display gold-text mb-3">Pasukan Dikecualikan</h3>
            <p className="text-white/60 text-sm mb-4">
              Pasukan yang telah dibuang dari liga. Tekan "Pulihkan" jika tersalah padam.
            </p>
            {store.teams.filter((t) => t.excluded).length === 0 ? (
              <p className="text-white/40 text-sm">Tiada pasukan dikecualikan.</p>
            ) : (
              <div className="space-y-2">
                {store.teams.filter((t) => t.excluded).map((t) => (
                  <div key={t.teamId} className="flex items-center justify-between gap-2 bg-black/20 rounded-lg px-3 py-2">
                    <span className="text-sm">{t.teamName} <span className="text-white/40">· {t.district} · {t.category}</span></span>
                    <button onClick={() => commit(restoreTeam(store, t.teamId))} className="btn btn-emerald text-xs !py-1 !px-3">
                      Pulihkan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass p-6">
            <h3 className="font-display gold-text mb-3">Tetapan Sistem</h3>
            <p className="text-white/60 text-sm mb-4">Reset semula keseluruhan data demo (pasukan, peserta, keputusan).</p>
            <button onClick={() => { const s = resetStore(); refresh(); syncNow(s); }} className="btn btn-ghost text-sm">
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

function SyncBadge({ state }) {
  const map = {
    disabled: { t: "Sheet tak aktif", c: "text-white/50", I: CloudOff },
    idle: { t: "Sheet sedia", c: "text-white/70", I: Cloud },
    loading: { t: "Memuat dari Sheet…", c: "text-mustard", I: RefreshCw },
    syncing: { t: "Menyimpan ke Sheet…", c: "text-mustard", I: RefreshCw },
    ok: { t: "Segerak dengan Sheet", c: "text-emerald-200", I: Cloud },
    error: { t: "Sheet tak dapat dihubungi", c: "text-red-300", I: CloudOff },
  };
  const s = map[state] || map.idle;
  const I = s.I;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs glass px-3 py-1.5 ${s.c}`}>
      <I size={14} className={(state === "syncing" || state === "loading") ? "animate-spin" : ""} /> {s.t}
    </span>
  );
}

function SyncWord({ state }) {
  const label = { disabled: "tidak aktif", idle: "sedia", loading: "memuat…", syncing: "menyimpan…", ok: "segerak", error: "gagal" };
  return <span className="gold-text font-semibold">{label[state] || "sedia"}</span>;
}

// Sel boleh edit — state tempatan, simpan bila hilang fokus (taip lancar)
function EditCell({ value, onSave }) {
  const [local, setLocal] = useState(value || "");
  const [focused, setFocused] = useState(false);
  useEffect(() => { if (!focused) setLocal(value || ""); }, [value, focused]);
  return (
    <input
      className="field !py-1 text-sm print-plain"
      value={local}
      onFocus={() => setFocused(true)}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => { setFocused(false); if (local !== (value || "")) onSave(local); }}
    />
  );
}
