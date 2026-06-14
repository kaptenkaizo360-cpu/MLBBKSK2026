"use client";
import Link from "next/link";
import { Trophy, Swords, Shield, Users, Gamepad2, Building2, GraduationCap } from "lucide-react";
import { useStore } from "@/components/useStore";
import { StatsCard } from "@/components/Tables";
import { computeStandings } from "@/lib/store";
import { CATEGORIES } from "@/data/districts";

export default function Home() {
  const { store } = useStore();

  const teams = store?.teams || [];
  const matches = store?.matches || [];
  const registered = teams.filter((t) => t.registered);
  const srTeams = registered.filter((t) => t.category === "Sekolah Rendah");
  const smTeams = registered.filter((t) => t.category === "Sekolah Menengah");
  const players = registered.reduce((a, t) => a + (t.players?.length || 0), 0);
  const districts = new Set(registered.map((t) => t.district)).size;

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
        <StatsCard icon={Building2} label="Daerah Berdaftar" value={districts} />
        <StatsCard icon={GraduationCap} label="Pasukan Sek. Rendah" value={srTeams.length} />
        <StatsCard icon={GraduationCap} label="Pasukan Sek. Menengah" value={smTeams.length} />
        <StatsCard icon={Users} label="Jumlah Peserta" value={players} />
      </section>

      {/* RECENT RESULTS + STANDINGS PREVIEW */}
      <section className="grid lg:grid-cols-2 gap-6 mb-16">
        <div className="glass p-5">
          <h3 className="font-display gold-text text-lg mb-4 flex items-center gap-2">
            <Swords size={18} /> Keputusan Terkini
          </h3>
          {recent.length === 0 ? (
            <p className="text-white/50 text-sm">Tiada keputusan lagi. Perlawanan akan dipaparkan di sini.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((m) => (
                <li key={m.matchId} className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                  <span className={m.winner === m.teamA ? "gold-text font-semibold" : ""}>{m.teamA}</span>
                  <span className="text-white/60">{m.teamAKill} - {m.teamBKill}</span>
                  <span className={m.winner === m.teamB ? "gold-text font-semibold" : ""}>{m.teamB}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass p-5">
          <h3 className="font-display gold-text text-lg mb-4 flex items-center gap-2">
            <Trophy size={18} /> Peneraju Liga
          </h3>
          {CATEGORIES.map((cat) => {
            const top = store ? computeStandings(store, cat, "A")[0] : null;
            return (
              <div key={cat} className="flex items-center justify-between text-sm border-b border-white/5 py-2">
                <span className="text-white/70">{cat} (Kump. A)</span>
                <span className="gold-text font-semibold">{top?.teamName || "-"} · {top?.points ?? 0} mata</span>
              </div>
            );
          })}
          <Link href="/standings" className="btn btn-ghost text-sm mt-4">Lihat Penuh</Link>
        </div>
      </section>
    </div>
  );
}
