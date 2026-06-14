// Senarai daerah + login + kumpulan liga

export const DISTRICTS = [
  { name: "Johor Bahru", userId: "MLBBJOHORBAHRU", password: "U%Za3GiBv#3J", group: "A" },
  { name: "Pasir Gudang", userId: "MLBBPASIRGUDANG", password: "#buHz2yeYpP#", group: "A" },
  { name: "Kulai", userId: "MLBBKULAI", password: "X5WjHn3wU@ex", group: "A" },
  { name: "Kota Tinggi", userId: "MLBBKOTATINGGI", password: "65j%a&bzq5U*", group: "A" },
  { name: "Mersing", userId: "MLBBMERSING", password: "5Wzyxqn3X#iH", group: "A" },
  { name: "Kluang", userId: "MLBBKLUANG", password: "aVbx#6aj7vqx", group: "A" },
  { name: "Batu Pahat", userId: "MLBBBATUPAHAT", password: "AY%hcyK6hKa$", group: "B" },
  { name: "Muar", userId: "MLBBMUAR", password: "mYwjLganU2G*", group: "B" },
  { name: "Tangkak", userId: "MLBBTANGKAK", password: "t3MVk&mP2Y2c", group: "B" },
  { name: "Segamat", userId: "MLBBSEGAMAT", password: "j#t#F$bfN9Fd", group: "B" },
  { name: "Pontian", userId: "MLBBPONTIAN", password: "K2fR$m5&aYrp", group: "B" },
];

export const HOST = { userId: "HOSTMLBBJOHOR", password: "Host@MLBB2026" };
export const ADMIN = { userId: "ADMINMLBBJOHOR", password: "Admin@Johor2026" };

export const CATEGORIES = ["Sekolah Rendah", "Sekolah Menengah"];

export const PLAYER_ROLES = [
  "Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support",
  "Roamer", "Jungler", "Mid Laner", "Gold Laner", "EXP Laner",
];

export function groupOf(district) {
  const d = DISTRICTS.find((x) => x.name === district);
  return d ? d.group : "A";
}
