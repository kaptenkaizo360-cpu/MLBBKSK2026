"use client";
import { useStore } from "@/components/useStore";
import BackToDashboard from "@/components/BackToDashboard";
import { StatusBadge } from "@/components/Tables";
import { activeGroups, isPublished } from "@/lib/store";
import { CATEGORIES } from "@/data/districts";
import { CalendarCheck, Lock } from "lucide-react";

export default function JadualPerlawanan() {
  const { store } = useStore();
  if (!store) return <div className="text-center py-20 text-white/60">Memuatkan…</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display gold-text text-2xl font-bold flex items-center gap-2 mb-8">
        <CalendarCheck /> Jadual Perlawanan
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
                  <div className="font-semibold">Jadual belum diterbitkan.</div>
                  <div className="text-white/50 text-sm">
                    Akan dipaparkan setelah admin mengesahkan dan menerbitkan jadual perlawanan.
                    ({reg}/{total} pasukan disahkan)
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {activeGroups(store, cat).map((g) => {
                  const gMatches = store.matches
                    .filter((m) => m.category === cat && m.group === g)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                  return (
                    <div key={g} className="schedule-pro-group !p-0">
                      <div className="schedule-pro-group-label px-3 pt-3">
                        <span className="schedule-pro-badge">{g}</span> Kumpulan {g}
                      </div>
                      <div className="overflow-x-auto p-3 pt-2">
                        <table className="w-full text-sm tournament-table-pro">
                          <thead>
                            <tr>
                              <th className="w-10">Bil</th>
                              <th>Perlawanan</th>
                              <th className="w-24">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gMatches.map((m, i) => (
                              <tr key={m.matchId}>
                                <td className="text-white/50">{i + 1}</td>
                                <td>
                                  <span className="font-medium">{m.teamA}</span>
                                  <span className="text-gold/60 mx-1.5">vs</span>
                                  <span className="font-medium">{m.teamB}</span>
                                </td>
                                <td><StatusBadge status={m.status} /></td>
                              </tr>
                            ))}
                            {gMatches.length === 0 && (
                              <tr><td colSpan={3} className="text-center text-white/40 py-4">Tiada perlawanan.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-white/50 text-xs">
        Susunan perlawanan ditetapkan oleh admin. Status: pending (belum mula) · live (sedang berlangsung) · completed (selesai).
      </p>
    </div>
  );
}
