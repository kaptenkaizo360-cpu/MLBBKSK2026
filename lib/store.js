import { DISTRICTS, CATEGORIES, groupOf } from "@/data/districts";

// Jana pasukan demo untuk setiap daerah & kategori
function seedTeams() {
  const teams = [];
  for (const cat of CATEGORIES) {
    for (const d of DISTRICTS) {
      const tag = cat === "Sekolah Rendah" ? "SR" : "SM";
      teams.push({
        teamId: `TEAM-${d.name.replace(/\s/g, "").toUpperCase()}-${tag}`,
        district: d.name,
        category: cat,
        group: d.group,
        school: "",
        teamName: `${d.name} ${tag}`,
        managerName: "",
        phone: "",
        email: "",
        registered: false,
        players: [],
      });
    }
  }
  return teams;
}

// Round-robin satu kumpulan
function roundRobin(teams) {
  const list = [...teams];
  if (list.length % 2 !== 0) list.push(null); // bye
  const n = list.length;
  const rounds = [];
  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const a = list[i];
      const b = list[n - 1 - i];
      if (a && b) rounds.push([a, b]);
    }
    list.splice(1, 0, list.pop());
  }
  return rounds;
}

function seedMatches(teams) {
  const matches = [];
  let idx = 1;
  for (const cat of CATEGORIES) {
    for (const grp of ["A", "B"]) {
      const grpTeams = teams.filter((t) => t.category === cat && t.group === grp);
      for (const [a, b] of roundRobin(grpTeams)) {
        matches.push({
          matchId: `M${String(idx++).padStart(3, "0")}`,
          category: cat,
          group: grp,
          teamA: a.teamName,
          teamB: b.teamName,
          teamAId: a.teamId,
          teamBId: b.teamId,
          winner: "",
          loser: "",
          teamAKill: 0,
          teamBKill: 0,
          note: "",
          status: "pending", // pending | live | completed
          updatedBy: "",
        });
      }
    }
  }
  return matches;
}

const KEY = "mlbb_store_v1";

export function defaultStore() {
  const teams = seedTeams();
  return { teams, matches: seedMatches(teams) };
}

export function loadStore() {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = defaultStore();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return defaultStore();
  }
}

export function saveStore(store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("mlbb-update"));
}

export function resetStore() {
  const s = defaultStore();
  saveStore(s);
  return s;
}

// Kira standing automatik
export function computeStandings(store, category, group) {
  const teams = store.teams.filter(
    (t) => t.category === category && t.group === group
  );
  const rows = teams.map((t) => ({
    teamId: t.teamId,
    teamName: t.teamName,
    district: t.district,
    played: 0, win: 0, lose: 0, kill: 0, points: 0,
  }));
  const byId = Object.fromEntries(rows.map((r) => [r.teamId, r]));

  const h2h = {}; // `${a}|${b}` -> winnerId

  for (const m of store.matches) {
    if (m.status !== "completed") continue;
    if (m.category !== category || m.group !== group) continue;
    const a = byId[m.teamAId], b = byId[m.teamBId];
    if (!a || !b) continue;
    a.played++; b.played++;
    a.kill += Number(m.teamAKill || 0);
    b.kill += Number(m.teamBKill || 0);
    if (m.winner === m.teamA) {
      a.win++; a.points += 3; b.lose++;
      h2h[`${a.teamId}|${b.teamId}`] = a.teamId;
      h2h[`${b.teamId}|${a.teamId}`] = a.teamId;
    } else if (m.winner === m.teamB) {
      b.win++; b.points += 3; a.lose++;
      h2h[`${a.teamId}|${b.teamId}`] = b.teamId;
      h2h[`${b.teamId}|${a.teamId}`] = b.teamId;
    }
  }

  rows.sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    if (y.win !== x.win) return y.win - x.win;
    const hk = `${x.teamId}|${y.teamId}`;
    if (h2h[hk] === x.teamId) return -1;
    if (h2h[hk] === y.teamId) return 1;
    return y.kill - x.kill;
  });

  rows.forEach((r, i) => (r.ranking = i + 1));
  return rows;
}

export function semifinalPairs(store, category) {
  const A = computeStandings(store, category, "A");
  const B = computeStandings(store, category, "B");
  return {
    sf1: { home: A[0], away: B[1] }, // Johan A vs Naib Johan B
    sf2: { home: B[0], away: A[1] }, // Johan B vs Naib Johan A
  };
}
