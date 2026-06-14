"use client";
import { useStore } from "@/components/useStore";
import { semifinalPairs } from "@/lib/store";
import { WinnerCard } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { Trophy } from "lucide-react";

export default function Final() {
  const { store } = useStore();
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-8 justify-center">
        <Trophy /> Final & Juara
      </h1>
      {CATEGORIES.map((cat) => {
        const { sf1, sf2 } = semifinalPairs(store, cat);
        const finalist1 = sf1.home?.teamName;
        const finalist2 = sf2.home?.teamName;
        return (
          <div key={cat} className="mb-12 text-center">
            <h2 className="font-display text-xl mb-4">{cat}</h2>
            <div className="glass p-6 mb-6">
              <div className="text-gold/80 text-sm mb-3">Perlawanan Akhir</div>
              <div className="flex items-center justify-center gap-6 text-lg font-semibold">
                <span>{finalist1 || "TBD"}</span>
                <span className="text-gold">VS</span>
                <span>{finalist2 || "TBD"}</span>
              </div>
              <p className="text-white/40 text-xs mt-3">Pemenang separuh akhir akan ke final.</p>
            </div>
            <WinnerCard team={null} />
          </div>
        );
      })}
    </div>
  );
}
