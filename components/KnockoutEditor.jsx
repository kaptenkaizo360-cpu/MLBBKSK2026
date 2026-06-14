"use client";
import { CATEGORIES } from "@/data/districts";
import { semifinalPairs, leagueComplete, setKnockout } from "@/lib/store";

function KOSelect({ label, value, options, onChange }) {
  return (
    <div className="mb-3">
      <label className="text-xs text-white/60">{label}</label>
      <select className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-ink">— Pilih —</option>
        {options.filter(Boolean).map((t) => (
          <option key={t.teamId} value={t.teamName} className="bg-ink">{t.teamName}</option>
        ))}
      </select>
    </div>
  );
}
function KOSelectNames({ label, value, names, onChange }) {
  return (
    <div className="mb-3">
      <label className="text-xs text-white/60">{label}</label>
      <select className="field mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="" className="bg-ink">— Pilih —</option>
        {names.map((n) => <option key={n} value={n} className="bg-ink">{n}</option>)}
      </select>
    </div>
  );
}

export default function KnockoutEditor({ store, commit, allowFifthOverride = true }) {
  function setKO(cat, patch) {
    commit(setKnockout(store, cat, patch));
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {CATEGORIES.map((cat) => {
        const done = leagueComplete(store, cat);
        if (!done) {
          return (
            <div key={cat} className="glass p-5">
              <h3 className="font-display gold-text mb-2">{cat}</h3>
              <p className="text-white/55 text-sm">
                Keputusan kalah mati boleh diisi setelah semua perlawanan liga {cat} selesai.
              </p>
            </div>
          );
        }
        const { sf1, sf2 } = semifinalPairs(store, cat);
        const ko = (store.knockout && store.knockout[cat]) || {};
        const finalists = [ko.sf1Winner, ko.sf2Winner].filter(Boolean);
        const sfLosers = [];
        if (ko.sf1Winner) sfLosers.push([sf1.home, sf1.away].find((t) => t && t.teamName !== ko.sf1Winner)?.teamName);
        if (ko.sf2Winner) sfLosers.push([sf2.home, sf2.away].find((t) => t && t.teamName !== ko.sf2Winner)?.teamName);

        return (
          <div key={cat} className="glass p-5">
            <h3 className="font-display gold-text mb-1">{cat}</h3>
            <div className="text-white/40 text-xs mb-4">
              SA1: {sf1.home?.teamName || "TBD"} vs {sf1.away?.teamName || "TBD"} · SA2: {sf2.home?.teamName || "TBD"} vs {sf2.away?.teamName || "TBD"}
            </div>

            <KOSelect label="Pemenang Separuh Akhir 1" value={ko.sf1Winner || ""}
              options={[sf1.home, sf1.away]} onChange={(v) => setKO(cat, { sf1Winner: v })} />
            <KOSelect label="Pemenang Separuh Akhir 2" value={ko.sf2Winner || ""}
              options={[sf2.home, sf2.away]} onChange={(v) => setKO(cat, { sf2Winner: v })} />

            <KOSelectNames label="Johan (Pemenang Final)" value={ko.finalWinner || ""}
              names={finalists} onChange={(v) => setKO(cat, { finalWinner: v })} />

            <KOSelectNames label="Pemenang Tempat ke-3" value={ko.thirdWinner || ""}
              names={sfLosers.filter(Boolean)} onChange={(v) => setKO(cat, { thirdWinner: v })} />

            {allowFifthOverride && (
              <>
                <p className="text-white/40 text-xs mt-2">
                  Kedudukan ke-5 dikira automatik (mata tertinggi pasukan tidak layak). Boleh override di bawah.
                </p>
                <div>
                  <label className="text-xs text-white/60">Override Kedudukan ke-5 (pilihan)</label>
                  <select className="field mt-1" value={ko.fifth || ""} onChange={(e) => setKO(cat, { fifth: e.target.value })}>
                    <option value="" className="bg-ink">— Auto —</option>
                    {store.teams.filter((t) => t.category === cat).map((t) => (
                      <option key={t.teamId} value={t.teamName} className="bg-ink">{t.teamName}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
