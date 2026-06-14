"use client";
import { useStore } from "@/components/useStore";
import { finalStandings } from "@/lib/store";
import { WinnerCard, FinalStandingTable } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { Trophy } from "lucide-react";

export default function Final() {
  const { store } = useStore();
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-8 justify-center">
        <Trophy /> Final & Kedudukan Akhir
      </h1>
      {CATEGORIES.map((cat) => {
        const fs = finalStandings(store, cat);
        const { finalist1, finalist2 } = fs.finalists;
        const rows = [fs.champion, fs.runnerUp, fs.third, fs.fourth, fs.fifth];
        return (
          <div key={cat} className="mb-14">
            <h2 className="font-display text-xl mb-4 text-center">{cat}</h2>

            <div className="glass p-6 mb-6 text-center">
              <div className="text-gold/80 text-sm mb-3">Perlawanan Akhir</div>
              <div className="flex items-center justify-center gap-6 text-lg font-semibold">
                <span>{finalist1?.teamName || "TBD"}</span>
                <span className="text-gold">VS</span>
                <span>{finalist2?.teamName || "TBD"}</span>
              </div>
            </div>

            <WinnerCard team={fs.champion?.teamName || null} />

            <div className="mt-6">
              <div className="text-gold/80 text-sm mb-2">Kedudukan Akhir</div>
              <FinalStandingTable rows={rows.map((r) => r ? { ...r, category: cat } : null)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
