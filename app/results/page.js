"use client";
import { useState } from "react";
import { useStore } from "@/components/useStore";
import BackToDashboard from "@/components/BackToDashboard";
import { ResultTable } from "@/components/Tables";
import { CATEGORIES } from "@/data/districts";
import { activeGroups } from "@/lib/store";
import { Swords } from "lucide-react";

export default function Results() {
  const { store } = useStore();
  const [cat, setCat] = useState("Sekolah Rendah");
  const [grp, setGrp] = useState("A");
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  // Hanya tunjuk perlawanan yang host SUDAH isi (selesai atau sedang live)
  const matches = store.matches.filter(
    (m) => m.category === cat && m.group === grp && (m.status === "completed" || m.status === "live")
  );

  const groups = activeGroups(store, cat);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-6">
        <Swords /> Keputusan Perlawanan
      </h1>
      <BackToDashboard />
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="field max-w-xs" value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} className="bg-ink">{c}</option>)}
        </select>
        <select className="field max-w-[140px]" value={grp} onChange={(e) => setGrp(e.target.value)}>
          {groups.map((g) => <option key={g} className="bg-ink" value={g}>Kumpulan {g}</option>)}
        </select>
      </div>

      {matches.length === 0 ? (
        <div className="glass p-6 text-white/60 text-sm">
          Belum ada keputusan untuk {cat} Kumpulan {grp}. Keputusan akan dipaparkan setelah host mengisi perlawanan.
        </div>
      ) : (
        <ResultTable matches={matches} />
      )}
    </div>
  );
}
