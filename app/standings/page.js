"use client";
import { useStore } from "@/components/useStore";
import BackToDashboard from "@/components/BackToDashboard";
import { StandingTable } from "@/components/Tables";
import { computeStandings, activeGroups, isPublished } from "@/lib/store";
import { CATEGORIES } from "@/data/districts";
import { Trophy, Lock } from "lucide-react";

export default function Standings() {
  const { store } = useStore();
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-8">
        <Trophy /> Kedudukan Liga
      </h1>
      <BackToDashboard />
      {CATEGORIES.map((cat) => {
        const published = isPublished(store, cat);
        const total = store.teams.filter((t) => t.category === cat && !t.excluded).length;
        const reg = store.teams.filter((t) => t.category === cat && !t.excluded && t.registered).length;
        return (
          <div key={cat} className="mb-10">
            <h2 className="font-display text-xl mb-4">{cat}</h2>
            {!published ? (
              <div className="glass p-6 flex items-center gap-3 text-white/70">
                <Lock size={18} className="text-gold" />
                <div>
                  <div className="font-semibold">Kedudukan belum diterbitkan.</div>
                  <div className="text-white/50 text-sm">
                    Akan dipaparkan setelah admin mengesahkan dan menerbitkan jadual perlawanan.
                    ({reg}/{total} pasukan disahkan)
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                {activeGroups(store, cat).map((g) => (
                  <div key={g}>
                    <div className="text-gold/80 mb-2 text-sm">Kumpulan {g}</div>
                    <StandingTable rows={computeStandings(store, cat, g)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <p className="text-white/50 text-xs">
        Susunan: Mata → Menang. Jika seri, admin tentukan secara manual. Dua teratas setiap kumpulan layak separuh akhir.
      </p>
    </div>
  );
}
