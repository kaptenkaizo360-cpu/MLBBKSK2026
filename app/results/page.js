"use client";
import { useState } from "react";
import { useStore } from "@/components/useStore";
import { ResultTable } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { Swords } from "lucide-react";

export default function Results() {
  const { store } = useStore();
  const [cat, setCat] = useState("Sekolah Rendah");
  const [grp, setGrp] = useState("A");
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  const matches = store.matches.filter((m) => m.category === cat && m.group === grp);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-6">
        <Swords /> Keputusan Perlawanan
      </h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="field max-w-xs" value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} className="bg-ink">{c}</option>)}
        </select>
        <select className="field max-w-[120px]" value={grp} onChange={(e) => setGrp(e.target.value)}>
          <option className="bg-ink" value="A">Kumpulan A</option>
          <option className="bg-ink" value="B">Kumpulan B</option>
        </select>
      </div>
      <ResultTable matches={matches} />
    </div>
  );
}
