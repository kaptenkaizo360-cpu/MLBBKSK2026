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
    for (const grp of ["A", "B", "C"]) {
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
    (t) => t.category === category && t.group === group && !t.excluded
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

// Adakah SEMUA daerah dalam kategori ini telah daftar & disahkan admin?
export function registrationComplete(store, category) {
  const teams = store.teams.filter((t) => t.category === category && !t.excluded);
  if (teams.length === 0) return false;
  return teams.every((t) => t.registered);
}

// Pasangan separuh akhir: 3 johan kumpulan + 1 naib johan terbaik
export function semifinalPairs(store, category) {
  const groups = activeGroups(store, category);
  const standings = groups.map((g) => computeStandings(store, category, g));

  if (groups.length >= 3) {
    // 3 kumpulan: 3 johan + 1 naib johan terbaik
    const champions = standings.map((s) => s[0]).filter(Boolean);
    const runnersUp = standings.map((s) => s[1]).filter(Boolean);
    const bestRunnerUp = [...runnersUp].sort((x, y) => (y.points - x.points) || (y.win - x.win))[0] || null;
    const seeded = [...champions].sort((x, y) => (y.points - x.points) || (y.win - x.win));
    return {
      sf1: { home: seeded[0] || null, away: bestRunnerUp },   // Johan terbaik vs Naib Johan terbaik
      sf2: { home: seeded[1] || null, away: seeded[2] || null }, // Johan #2 vs Johan #3
      qualifiers: { champions: seeded, bestRunnerUp },
    };
  }

  // 2 kumpulan: Johan A vs Naib B, Johan B vs Naib A
  const A = standings[0] || [];
  const B = standings[1] || [];
  return {
    sf1: { home: A[0] || null, away: B[1] || null },
    sf2: { home: B[0] || null, away: A[1] || null },
    qualifiers: { champions: [A[0], B[0]].filter(Boolean) },
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

  // Tempat ke-3 & ke-4 daripada pasukan kalah separuh akhir
  const sfLosers = [sfLoser1, sfLoser2].filter(Boolean);
  let third = null, fourth = null;
  if (ko.thirdWinner) {
    third = sfLosers.find((t) => t.teamName === ko.thirdWinner) || null;
    fourth = sfLosers.find((t) => t.teamName !== ko.thirdWinner) || null;
  }

  // Kedudukan ke-5: mata tertinggi antara pasukan yang tidak layak ke separuh akhir
  const qualifierNames = new Set([...sf1Teams, ...sf2Teams].map((t) => t.teamName));
  let fifth = null;
  if (ko.fifth) {
    fifth = store.teams.find((t) => t.teamName === ko.fifth) || { teamName: ko.fifth };
  } else {
    const others = [];
    for (const g of ["A", "B", "C"]) {
      computeStandings(store, category, g).forEach((r) => {
        if (!qualifierNames.has(r.teamName)) others.push(r);
      });
    }
    others.sort((a, b) => (b.points - a.points) || (b.win - a.win));
    fifth = others[0] || null;
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
  for (const grp of ["A", "B", "C"]) {
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

// Kumpulan yang aktif (ada sekurang-kurangnya 1 pasukan tidak dikecualikan) bagi kategori
export function activeGroups(store, category) {
  const groups = [];
  for (const g of ["A", "B", "C"]) {
    const has = store.teams.some(
      (t) => t.category === category && t.group === g && !t.excluded
    );
    if (has) groups.push(g);
  }
  return groups;
}

// Buang satu pasukan dari liga (kecualikan) + jana semula jadual kategori
export function removeTeamFromLeague(store, teamId) {
  const team = store.teams.find((t) => t.teamId === teamId);
  if (!team) return store;
  const teams = store.teams.map((t) => t.teamId === teamId ? { ...t, excluded: true } : t);
  const otherMatches = store.matches.filter((m) => m.category !== team.category);
  const newMatches = buildCategoryMatches(teams.filter((t) => !t.excluded), team.category, 1);
  const knockout = { ...(store.knockout || {}) };
  delete knockout[team.category];
  return { ...store, teams, matches: [...otherMatches, ...newMatches], knockout };
}

// Padam seluruh kumpulan (kecualikan semua pasukan dalam kumpulan itu) + jana semula
export function deleteGroup(store, category, group) {
  const teams = store.teams.map((t) =>
    (t.category === category && t.group === group) ? { ...t, excluded: true } : t
  );
  const otherMatches = store.matches.filter((m) => m.category !== category);
  const newMatches = buildCategoryMatches(teams.filter((t) => !t.excluded), category, 1);
  const knockout = { ...(store.knockout || {}) };
  delete knockout[category];
  return { ...store, teams, matches: [...otherMatches, ...newMatches], knockout };
}
