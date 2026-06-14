"use client";
import Link from "next/link";
import { useStore } from "@/components/useStore";
import BackToDashboard from "@/components/BackToDashboard";
import { semifinalPairs, leagueComplete } from "@/lib/store";
import { CATEGORIES } from "@/data/districts";
import { GitBranch, Lock } from "lucide-react";

function Match({ title, home, away }) {
  return (
    <div className="glass p-5">
      <div className="text-gold/80 text-sm mb-3">{title}</div>
      <div className="flex items-center justify-between py-2 border-b border-white/5">
        <span className="font-semibold">{home?.teamName || "TBD"}</span>
        <span className="text-white/50 text-xs">{home?.district}</span>
      </div>
      <div className="text-center text-gold text-xs py-1">VS</div>
      <div className="flex items-center justify-between py-2">
        <span className="font-semibold">{away?.teamName || "TBD"}</span>
        <span className="text-white/50 text-xs">{away?.district}</span>
      </div>
    </div>
  );
}

export default function Semifinal() {
  const { store } = useStore();
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-8">
        <GitBranch /> Separuh Akhir
      </h1>
      <BackToDashboard />
      {CATEGORIES.map((cat) => {
        const done = leagueComplete(store, cat);
        return (
          <div key={cat} className="mb-10">
            <h2 className="font-display text-xl mb-4">{cat}</h2>
            {done ? (
              <>
                {(() => {
                  const { sf1, sf2 } = semifinalPairs(store, cat);
                  return (
                    <div className="grid md:grid-cols-2 gap-6">
                      <Match title="Separuh Akhir 1 — Johan Terbaik vs Naib Johan Terbaik" home={sf1.home} away={sf1.away} />
                      <Match title="Separuh Akhir 2 — Johan vs Johan" home={sf2.home} away={sf2.away} />
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="glass p-6 flex items-center gap-3 text-white/60">
                <Lock size={18} className="text-gold" />
                <span>Carta separuh akhir dipaparkan setelah semua perlawanan liga {cat} selesai.</span>
                <Link href="/standings" className="btn btn-ghost text-sm ml-auto">Lihat Kedudukan</Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
