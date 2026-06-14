"use client";
import Link from "next/link";
import { Trophy, Swords, Shield, Users, Gamepad2, Building2, GraduationCap, GitBranch, Crown } from "lucide-react";
import { useStore } from "@/components/useStore";
import { StatsCard, StandingTable } from "@/components/Tables";
import { computeStandings, semifinalPairs, finalStandings, leagueComplete } from "@/lib/store";
import { CATEGORIES } from "@/data/districts";

export default function Home() {
  const { store } = useStore();

  const teams = store?.teams || [];
  const matches = store?.matches || [];
  const registered = teams.filter((t) => t.registered);
  const players = registered.reduce((a, t) => a + (t.players?.length || 0), 0);

  const recent = matches.filter((m) => m.status === "completed").slice(-5).reverse();

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* HERO */}
      <section className="text-left py-16 sm:py-24">
        {/* Logo Johor Leads & E-Sports bersebelahan */}
        <div className="flex items-center justify-start gap-5 sm:gap-8 mb-8 flex-wrap">
          <img src="/logo.png" alt="Johor Leads"
            className="h-16 sm:h-24 w-auto object-contain drop-shadow-[0_0_18px_rgba(212,175,55,0.45)]"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <img src="/logo-esports.jpeg" alt="E-Sports MLBB Pendidikan Khas Negeri Johor 2026"
            className="h-16 sm:h-24 w-auto object-contain rounded-xl drop-shadow-[0_0_18px_rgba(212,175,55,0.45)]"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>

        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 text-gold text-sm">
          <Gamepad2 size={16} /> E-Sport Pendidikan Khas
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl leading-tight">
          PERTANDINGAN <span className="title-rgb">MOBILE LEGEND</span><br />
          PENDIDIKAN KHAS NEGERI JOHOR
        </h1>
        <p className="text-white/70 mt-5 max-w-2xl">
          Sempena Karnival Kokurikulum, Sukan dan Permainan Pendidikan Khas
        </p>

        <div className="flex flex-wrap justify-start gap-3 mt-8">
          <Link href="/login" className="btn btn-gold"><Shield size={18} /> Login Daerah</Link>
          <Link href="/login" className="btn btn-emerald"><Gamepad2 size={18} /> Login Host</Link>
          <Link href="/login" className="btn btn-emerald"><Trophy size={18} /> Login Admin</Link>
          <Link href="/standings" className="btn btn-ghost">Lihat Kedudukan</Link>
          <Link href="/results" className="btn btn-ghost">Lihat Keputusan</Link>
        </div>
      </section>

      {/* LIVE STATS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <StatsCard icon={Building2} label="Daerah" value={11} />
        <StatsCard icon={GraduationCap} label="Pasukan Berdaftar" value={registered.length} />
        <StatsCard icon={Users} label="Jumlah Peserta" value={players} />
        <StatsCard icon={Swords} label="Perlawanan Selesai" value={matches.filter((m) => m.status === "completed").length} />
      </section>

      {/* RECENT RESULTS */}
      <section className="mb-12">
        <h3 className="font-display gold-text text-lg mb-4 flex items-center gap-2">
          <Swords size={18} /> Keputusan Terkini
        </h3>
        <div className="glass p-5">
          {recent.length === 0 ? (
            <p className="text-white/50 text-sm">Tiada keputusan lagi. Perlawanan akan dipaparkan di sini.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((m) => (
                <li key={m.matchId} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <span className={m.winner === m.teamA ? "gold-text font-semibold" : ""}>{m.teamA}</span>
                  <span className="text-white/40 text-xs">{m.category} · Kump. {m.group}</span>
                  <span className={m.winner === m.teamB ? "gold-text font-semibold" : ""}>{m.teamB}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* STANDINGS — sentiasa dipaparkan */}
      {store && CATEGORIES.map((cat) => {
        const done = leagueComplete(store, cat);
        return (
          <section key={cat} className="mb-12">
            <h3 className="font-display text-xl mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-gold" /> Kedudukan Liga {cat}
            </h3>
            <div className="grid lg:grid-cols-2 gap-6">
              {["A", "B"].map((g) => (
                <div key={g}>
                  <div className="text-gold/80 mb-2 text-sm">Kumpulan {g}</div>
                  <StandingTable rows={computeStandings(store, cat, g)} />
                </div>
              ))}
            </div>

            {/* Fasa kalah mati keluar HANYA selepas liga kategori ini tamat */}
            {done ? (
              <KnockoutBlock store={store} cat={cat} />
            ) : (
              <p className="text-white/40 text-sm mt-4 flex items-center gap-2">
                <GitBranch size={15} /> Carta separuh akhir & kedudukan akhir akan dipaparkan setelah semua perlawanan liga {cat} selesai.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function KnockoutBlock({ store, cat }) {
  const { sf1, sf2 } = semifinalPairs(store, cat);
  const fs = finalStandings(store, cat);
  const rows = [
    { lab: "Johan", t: fs.champion },
    { lab: "Naib Johan", t: fs.runnerUp },
    { lab: "Ketiga", t: fs.third },
    { lab: "Keempat", t: fs.fourth },
    { lab: "Kelima", t: fs.fifth },
  ];

  return (
    <div className="mt-8 grid lg:grid-cols-2 gap-6">
      {/* Separuh akhir + final */}
      <div className="glass p-5">
        <div className="text-gold/80 text-sm mb-3 flex items-center gap-2"><GitBranch size={15} /> Separuh Akhir & Final</div>
        <SF title="Separuh Akhir 1" home={sf1.home} away={sf1.away} />
        <SF title="Separuh Akhir 2" home={sf2.home} away={sf2.away} />
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Crown size={13} className="text-gold" /> Final</div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">{fs.finalists.finalist1?.teamName || "TBD"}</span>
            <span className="text-gold text-xs">vs</span>
            <span className="font-semibold">{fs.finalists.finalist2?.teamName || "TBD"}</span>
          </div>
        </div>
      </div>

      {/* Kedudukan akhir 1-5 */}
      <div className="glass p-5">
        <div className="text-gold/80 text-sm mb-3 flex items-center gap-2"><Trophy size={15} /> Kedudukan Akhir</div>
        {rows.map((r) => (
          <div key={r.lab} className="flex items-center justify-between text-sm border-b border-white/5 py-1.5">
            <span className="gold-text font-semibold">{r.lab}</span>
            <span>{r.t?.teamName || "-"}</span>
          </div>
        ))}
        <Link href="/final" className="btn btn-gold text-sm mt-4">Lihat Final Penuh</Link>
      </div>
    </div>
  );
}

function SF({ title, home, away }) {
  return (
    <div className="mb-2">
      <div className="text-white/40 text-xs mb-1">{title}</div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{home?.teamName || "TBD"}</span>
        <span className="text-gold text-xs">vs</span>
        <span className="font-semibold">{away?.teamName || "TBD"}</span>
      </div>
    </div>
  );
}
