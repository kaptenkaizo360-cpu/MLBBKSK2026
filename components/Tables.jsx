"use client";
import { Crown } from "lucide-react";

export function StatsCard({ icon: Icon, label, value }) {
  return (
    <div className="glass p-5 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-emerald-brand/30 border border-gold/30">
        <Icon className="text-gold" />
      </div>
      <div>
        <div className="font-display text-3xl font-bold gold-text">{value}</div>
        <div className="text-white/60 text-sm">{label}</div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: "bg-white/10 text-white/60",
    live: "bg-red-500/20 text-red-300 border border-red-400/40",
    completed: "bg-emerald-brand/30 text-emerald-200 border border-gold/30",
  };
  const label = { pending: "Pending", live: "Live", completed: "Selesai" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  );
}

export function StandingTable({ rows }) {
  return (
    <div className="overflow-x-auto glass p-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gold/80 text-left">
            {["#", "Pasukan", "Daerah", "M", "Menang", "Kalah", "Kill", "Mata"].map((h) => (
              <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const qualify = r.ranking <= 2;
            return (
              <tr key={r.teamId} className="row-hover border-t border-white/5">
                <td className="px-3 py-2">
                  {r.ranking <= 2 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gold text-ink font-bold">
                      {r.ranking}
                    </span>
                  ) : r.ranking}
                </td>
                <td className="px-3 py-2 font-semibold flex items-center gap-2">
                  {r.teamName}
                  {qualify && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-brand/40 text-gold border border-gold/40">
                      LAYAK
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-white/70">{r.district}</td>
                <td className="px-3 py-2">{r.played}</td>
                <td className="px-3 py-2">{r.win}</td>
                <td className="px-3 py-2">{r.lose}</td>
                <td className="px-3 py-2">{r.kill}</td>
                <td className="px-3 py-2 font-bold gold-text">{r.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ResultTable({ matches }) {
  return (
    <div className="overflow-x-auto glass p-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gold/80 text-left">
            {["Match", "Pasukan A", "Skor", "Pasukan B", "Pemenang", "Status"].map((h) => (
              <th key={h} className="px-3 py-2 font-semibold whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.matchId} className="row-hover border-t border-white/5">
              <td className="px-3 py-2 text-white/60">{m.matchId}</td>
              <td className={`px-3 py-2 ${m.winner === m.teamA ? "gold-text font-bold" : ""}`}>{m.teamA}</td>
              <td className="px-3 py-2 whitespace-nowrap">{m.teamAKill} - {m.teamBKill}</td>
              <td className={`px-3 py-2 ${m.winner === m.teamB ? "gold-text font-bold" : ""}`}>{m.teamB}</td>
              <td className="px-3 py-2">{m.winner || "-"}</td>
              <td className="px-3 py-2"><StatusBadge status={m.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WinnerCard({ team }) {
  return (
    <div className="glass p-8 text-center max-w-md mx-auto shadow-goldglow">
      <Crown className="text-gold mx-auto animate-pulseGlow" size={48} />
      <div className="text-white/60 mt-3">Juara</div>
      <div className="font-display text-2xl font-bold gold-text mt-1">
        {team || "Belum Ditentukan"}
      </div>
    </div>
  );
}
