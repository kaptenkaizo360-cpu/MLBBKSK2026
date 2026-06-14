"use client";
import Link from "next/link";
import { Trophy, Swords, Shield, Users, Gamepad2, Building2, GraduationCap, GitBranch } from "lucide-react";
import { useStore } from "@/components/useStore";
import { StatsCard, StandingTable } from "@/components/Tables";
import { computeStandings, semifinalPairs, finalStandings } from "@/lib/store";
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
      <section className="text-center py-16 sm:py-24">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 text-gold text-sm">
          <Gamepad2 size={16} /> E-Sport Pendidikan Khas
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl leading-tight">
          PERTANDINGAN <span className="gold-text">MOBILE LEGEND</span><br />
          PENDIDIKAN KHAS NEGERI JOHOR
        </h1>
        <p className="text-white/70 mt-5 max-w-2xl mx-auto">
          Sempena Karnival Kokurikulum, Sukan dan Permainan Pendidikan Khas
        </p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
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

      {/* STANDINGS */}
      {store && CATEGORIES.map((cat) => (
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
        </section>
      ))}

      {/* SEMIFINAL */}
      {store && (
        <section className="mb-12">
          <h3 className="font-display text-xl mb-4 flex items-center gap-2">
            <GitBranch size={18} className="text-gold" /> Separuh Akhir
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {CATEGORIES.map((cat) => {
              const { sf1, sf2 } = semifinalPairs(store, cat);
              return (
                <div key={cat} className="glass p-5">
                  <div className="text-gold/80 text-sm mb-3">{cat}</div>
                  <SF title="SA 1" home={sf1.home} away={sf1.away} />
                  <SF title="SA 2" home={sf2.home} away={sf2.away} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* FINAL & KEDUDUKAN AKHIR */}
      {store && (
        <section className="mb-16">
          <h3 className="font-display text-xl mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-gold" /> Kedudukan Akhir
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {CATEGORIES.map((cat) => {
              const fs = finalStandings(store, cat);
              const rows = [
                { lab: "Johan", t: fs.champion },
                { lab: "Naib Johan", t: fs.runnerUp },
                { lab: "Ketiga", t: fs.third },
                { lab: "Keempat", t: fs.fourth },
                { lab: "Kelima", t: fs.fifth },
              ];
              return (
                <div key={cat} className="glass p-5">
                  <div className="text-gold/80 text-sm mb-3">{cat}</div>
                  {rows.map((r) => (
                    <div key={r.lab} className="flex items-center justify-between text-sm border-b border-white/5 py-1.5">
                      <span className="gold-text font-semibold">{r.lab}</span>
                      <span>{r.t?.teamName || "-"}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="text-center mt-6">
            <Link href="/final" className="btn btn-gold">Lihat Final Penuh</Link>
          </div>
        </section>
      )}
    </div>
  );
}

function SF({ title, home, away }) {
  return (
    <div className="mb-3">
      <div className="text-white/40 text-xs mb-1">{title}</div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{home?.teamName || "TBD"}</span>
        <span className="text-gold text-xs">vs</span>
        <span className="font-semibold">{away?.teamName || "TBD"}</span>
      </div>
    </div>
  );
}
