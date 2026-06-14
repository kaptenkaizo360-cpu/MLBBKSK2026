import { DISTRICTS, CATEGORIES, GROUPING, groupOf } from "@/data/districts";

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
        group: groupOf(d.name, cat),
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
  if (list.length % 2 !== 0) list.push(null);
  const n = list.length;
  const matches = [];
  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const a = list[i];
      const b = list[n - 1 - i];
      if (a && b) matches.push([a, b]);
    }
    list.splice(1, 0, list.pop());
  }
  return matches;
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
          note: "",
          status: "pending", // pending | live | completed
          updatedBy: "",
        });
      }
    }
  }
  return matches;
}

const KEY = "mlbb_store_v2";

export function defaultStore() {
  const teams = seedTeams();
  return {
    teams,
    matches: seedMatches(teams),
    // keputusan pusingan kalah mati (diisi admin/host)
    knockout: {}, // cth: { "Sekolah Rendah": { sf1Winner, sf2Winner, finalWinner, thirdWinner, fifth } }
  };
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
    const parsed = JSON.parse(raw);
    if (!parsed.knockout) parsed.knockout = {};
    return parsed;
  } catch {
    return defaultStore();
  }
}

export function saveStore(store, opts = {}) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
  if (!opts.silent) window.dispatchEvent(new Event("mlbb-update"));
}

export function resetStore() {
  const s = defaultStore();
  saveStore(s);
  return s;
}

// Kira standing automatik (tanpa kill)
export function computeStandings(store, category, group) {
  const teams = store.teams.filter(
    (t) => t.category === category && t.group === group
  );
  const rows = teams.map((t) => ({
    teamId: t.teamId,
    teamName: t.teamName,
    district: t.district,
    played: 0, win: 0, lose: 0, points: 0,
  }));
  const byId = Object.fromEntries(rows.map((r) => [r.teamId, r]));

  for (const m of store.matches) {
    if (m.status !== "completed") continue;
    if (m.category !== category || m.group !== group) continue;
    const a = byId[m.teamAId], b = byId[m.teamBId];
    if (!a || !b) continue;
    a.played++; b.played++;
    if (m.winner === m.teamA) { a.win++; a.points += 3; b.lose++; }
    else if (m.winner === m.teamB) { b.win++; b.points += 3; a.lose++; }
  }

  // Susun: Mata -> Menang. Seri = admin tentukan manual (kekalkan susunan stabil).
  rows.sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    return y.win - x.win;
  });

  rows.forEach((r, i) => (r.ranking = i + 1));
  return rows;
}

// Adakah semua perlawanan liga (kedua-dua kumpulan) bagi kategori ini sudah selesai?
export function leagueComplete(store, category) {
  const league = store.matches.filter((m) => m.category === category);
  if (league.length === 0) return false;
  return league.every((m) => m.status === "completed");
}

// Pasangan separuh akhir ikut format
export function semifinalPairs(store, category) {
  const A = computeStandings(store, category, "A");
  const B = computeStandings(store, category, "B");
  return {
    sf1: { home: A[0], away: B[1] }, // Johan A vs Naib Johan B
    sf2: { home: B[0], away: A[1] }, // Johan B vs Naib Johan A
  };
}

// Kedudukan akhir 1-5
export function finalStandings(store, category) {
  const ko = (store.knockout && store.knockout[category]) || {};
  const { sf1, sf2 } = semifinalPairs(store, category);

  const sf1Teams = [sf1.home, sf1.away].filter(Boolean);
  const sf2Teams = [sf2.home, sf2.away].filter(Boolean);

  const nameToTeam = {};
  [...sf1Teams, ...sf2Teams].forEach((t) => { if (t) nameToTeam[t.teamName] = t; });

  const finalist1 = ko.sf1Winner ? nameToTeam[ko.sf1Winner] : null;
  const finalist2 = ko.sf2Winner ? nameToTeam[ko.sf2Winner] : null;
  const sfLoser1 = ko.sf1Winner ? sf1Teams.find((t) => t.teamName !== ko.sf1Winner) : null;
  const sfLoser2 = ko.sf2Winner ? sf2Teams.find((t) => t.teamName !== ko.sf2Winner) : null;

  const champion = ko.finalWinner ? nameToTeam[ko.finalWinner] : null;
  const runnerUp = (finalist1 && finalist2 && ko.finalWinner)
    ? [finalist1, finalist2].find((t) => t.teamName !== ko.finalWinner) : null;

  // Tempat ke-3 & ke-4
  const sfLosers = [sfLoser1, sfLoser2].filter(Boolean);
  let third = null, fourth = null;
  if (ko.thirdWinner) {
    third = sfLosers.find((t) => t.teamName === ko.thirdWinner) || null;
    fourth = sfLosers.find((t) => t.teamName !== ko.thirdWinner) || null;
  }

  // Kedudukan ke-5: mata tertinggi antara pasukan tidak layak (ranking >= 3)
  let fifth = null;
  if (ko.fifth) {
    fifth = store.teams.find((t) => t.teamName === ko.fifth) || { teamName: ko.fifth };
  } else {
    const nonQualified = [];
    for (const g of ["A", "B"]) {
      computeStandings(store, category, g).forEach((r) => {
        if (r.ranking >= 3) nonQualified.push(r);
      });
    }
    nonQualified.sort((a, b) => (b.points - a.points) || (b.win - a.win));
    fifth = nonQualified[0] || null;
  }

  return {
    finalists: { finalist1, finalist2 },
    champion,
    runnerUp,
    third, fourth, fifth,
    sfLosers,
  };
}

export function setKnockout(store, category, patch) {
  const knockout = { ...(store.knockout || {}) };
  knockout[category] = { ...(knockout[category] || {}), ...patch };
  return { ...store, knockout };
}

// Round-robin untuk satu set pasukan (dipakai semula bila jana semula)
function buildCategoryMatches(teams, category, startIdx) {
  const matches = [];
  let idx = startIdx;
  for (const grp of ["A", "B"]) {
    const grpTeams = teams.filter((t) => t.category === category && t.group === grp);
    for (const [a, b] of roundRobin(grpTeams)) {
      matches.push({
        matchId: `M${category === "Sekolah Rendah" ? "SR" : "SM"}${String(idx++).padStart(2, "0")}`,
        category, group: grp,
        teamA: a.teamName, teamB: b.teamName,
        teamAId: a.teamId, teamBId: b.teamId,
        winner: "", loser: "", note: "", status: "pending", updatedBy: "",
      });
    }
  }
  return matches;
}

// Tukar kumpulan satu pasukan (dalam kategori yang sama sahaja) + jana semula jadual kategori itu
export function setTeamGroup(store, teamId, newGroup) {
  const team = store.teams.find((t) => t.teamId === teamId);
  if (!team) return store;

  const teams = store.teams.map((t) => t.teamId === teamId ? { ...t, group: newGroup } : t);

  // Buang jadual lama kategori ini, jana semula
  const otherMatches = store.matches.filter((m) => m.category !== team.category);
  const newMatches = buildCategoryMatches(teams, team.category, 1);

  // Kosongkan keputusan kalah mati kategori ini sebab susunan berubah
  const knockout = { ...(store.knockout || {}) };
  delete knockout[team.category];

  return { ...store, teams, matches: [...otherMatches, ...newMatches], knockout };
}
