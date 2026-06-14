"use client";
import Link from "next/link";
import { useStore } from "@/components/useStore";
import BackToDashboard from "@/components/BackToDashboard";
import { finalStandings, semifinalPairs, leagueComplete } from "@/lib/store";
import { FinalStandingTable } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { Trophy, Crown, Lock } from "lucide-react";

// Satu "slot" dalam bracket
function Slot({ team, win }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm
      ${win ? "border-gold bg-emerald-brand/25 shadow-goldglow" : "border-white/10 bg-black/20"}`}>
      <span className={`font-semibold ${win ? "gold-text" : "text-white/85"}`}>{team?.teamName || "TBD"}</span>
      {win && <Crown size={14} className="text-gold" />}
    </div>
  );
}

// Bracket: 2 separuh akhir di kiri, final di tengah, juara di kanan
function Bracket({ sf1, sf2, fs }) {
  const champ = fs.champion?.teamName;
  return (
    <div className="glass p-5 overflow-x-auto">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4 min-w-[640px]">
        {/* Lajur 1: Separuh akhir */}
        <div className="space-y-6">
          <div>
            <div className="text-white/40 text-xs mb-1">Separuh Akhir 1</div>
            <div className="space-y-2">
              <Slot team={sf1.home} win={fs.finalists.finalist1 && sf1.home && fs.finalists.finalist1.teamName === sf1.home.teamName} />
              <Slot team={sf1.away} win={fs.finalists.finalist1 && sf1.away && fs.finalists.finalist1.teamName === sf1.away.teamName} />
            </div>
          </div>
          <div>
            <div className="text-white/40 text-xs mb-1">Separuh Akhir 2</div>
            <div className="space-y-2">
              <Slot team={sf2.home} win={fs.finalists.finalist2 && sf2.home && fs.finalists.finalist2.teamName === sf2.home.teamName} />
              <Slot team={sf2.away} win={fs.finalists.finalist2 && sf2.away && fs.finalists.finalist2.teamName === sf2.away.teamName} />
            </div>
          </div>
        </div>

        {/* Penyambung */}
        <div className="h-full flex flex-col items-center justify-center text-gold/40">
          <div className="w-8 border-t border-gold/30" />
        </div>

        {/* Lajur 2: Final */}
        <div>
          <div className="text-white/40 text-xs mb-1 flex items-center gap-1"><Crown size={12} className="text-gold" /> Final</div>
          <div className="space-y-2">
            <Slot team={fs.finalists.finalist1} win={champ && fs.finalists.finalist1 && champ === fs.finalists.finalist1.teamName} />
            <Slot team={fs.finalists.finalist2} win={champ && fs.finalists.finalist2 && champ === fs.finalists.finalist2.teamName} />
          </div>
        </div>

        {/* Penyambung */}
        <div className="h-full flex flex-col items-center justify-center text-gold/40">
          <div className="w-8 border-t border-gold/30" />
        </div>

        {/* Lajur 3: Juara */}
        <div className="text-center">
          <Trophy className="text-gold mx-auto animate-pulseGlow" size={36} />
          <div className="text-white/50 text-xs mt-1">Juara</div>
          <div className="font-display font-bold gold-text mt-1">{champ || "TBD"}</div>
        </div>
      </div>
    </div>
  );
}

export default function Final() {
  const { store } = useStore();
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-8 justify-center">
        <Trophy /> Final & Kedudukan Akhir
      </h1>
      <BackToDashboard />

      {CATEGORIES.map((cat) => {
        const done = leagueComplete(store, cat);
        return (
          <div key={cat} className="mb-14">
            <h2 className="font-display text-xl mb-4 text-center">{cat}</h2>

            {!done ? (
              <div className="glass p-6 flex items-center gap-3 text-white/60">
                <Lock size={18} className="text-gold" />
                <span>Carta final dipaparkan setelah semua perlawanan liga {cat} selesai.</span>
                <Link href="/standings" className="btn btn-ghost text-sm ml-auto">Lihat Kedudukan</Link>
              </div>
            ) : (
              (() => {
                const { sf1, sf2 } = semifinalPairs(store, cat);
                const fs = finalStandings(store, cat);
                const rows = [fs.champion, fs.runnerUp, fs.third, fs.fourth, fs.fifth]
                  .map((r) => (r ? { ...r, category: cat } : null));
                return (
                  <>
                    <Bracket sf1={sf1} sf2={sf2} fs={fs} />
                    <div className="mt-6">
                      <div className="text-gold/80 text-sm mb-2">Kedudukan Akhir</div>
                      <FinalStandingTable rows={rows} />
                    </div>
                  </>
                );
              })()
            )}
          </div>
        );
      })}
    </div>
  );
}
