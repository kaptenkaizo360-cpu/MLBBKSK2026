"use client";
import { useStore } from "@/components/useStore";
import { StandingTable } from "@/components/Tables";
import { computeStandings } from "@/lib/store";
import { CATEGORIES } from "@/data/districts";
import { Trophy } from "lucide-react";

export default function Standings() {
  const { store } = useStore();
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-8">
        <Trophy /> Kedudukan Liga
      </h1>
      {CATEGORIES.map((cat) => (
        <div key={cat} className="mb-10">
          <h2 className="font-display text-xl mb-4">{cat}</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {["A", "B"].map((g) => (
              <div key={g}>
                <div className="text-gold/80 mb-2 text-sm">Kumpulan {g}</div>
                <StandingTable rows={computeStandings(store, cat, g)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-white/50 text-xs">
        Susunan: Mata → Menang → Head-to-head → Jumlah Kill. Dua teratas setiap kumpulan layak separuh akhir.
      </p>
    </div>
  );
}
