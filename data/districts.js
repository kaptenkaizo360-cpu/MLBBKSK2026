// Senarai daerah + login. Kumpulan bergantung pada kategori.

export const DISTRICTS = [
  { name: "Johor Bahru", userId: "MLBBJOHORBAHRU", password: "U%Za3GiBv#3J" },
  { name: "Pasir Gudang", userId: "MLBBPASIRGUDANG", password: "#buHz2yeYpP#" },
  { name: "Kulai", userId: "MLBBKULAI", password: "X5WjHn3wU@ex" },
  { name: "Kota Tinggi", userId: "MLBBKOTATINGGI", password: "65j%a&bzq5U*" },
  { name: "Mersing", userId: "MLBBMERSING", password: "5Wzyxqn3X#iH" },
  { name: "Kluang", userId: "MLBBKLUANG", password: "aVbx#6aj7vqx" },
  { name: "Batu Pahat", userId: "MLBBBATUPAHAT", password: "AY%hcyK6hKa$" },
  { name: "Muar", userId: "MLBBMUAR", password: "mYwjLganU2G*" },
  { name: "Tangkak", userId: "MLBBTANGKAK", password: "t3MVk&mP2Y2c" },
  { name: "Segamat", userId: "MLBBSEGAMAT", password: "j#t#F$bfN9Fd" },
  { name: "Pontian", userId: "MLBBPONTIAN", password: "K2fR$m5&aYrp" },
];

export const HOST = { userId: "HOSTMLBBJOHOR", password: "Host@MLBB2026" };
export const ADMIN = { userId: "ADMINMLBBJOHOR", password: "Admin@Johor2026" };

export const CATEGORIES = ["Sekolah Rendah", "Sekolah Menengah"];

// Pembahagian kumpulan ikut kategori
export const GROUPING = {
  "Sekolah Rendah": {
    A: ["Johor Bahru", "Pasir Gudang", "Kulai", "Kota Tinggi", "Mersing", "Pontian"],
    B: ["Kluang", "Batu Pahat", "Muar", "Tangkak", "Segamat"],
  },
  "Sekolah Menengah": {
    A: ["Johor Bahru", "Pasir Gudang", "Kulai", "Kota Tinggi", "Mersing", "Kluang"],
    B: ["Batu Pahat", "Muar", "Tangkak", "Segamat", "Pontian"],
  },
};

// Kumpulan untuk daerah dalam kategori tertentu
export function groupOf(district, category) {
  const g = GROUPING[category];
  if (!g) return "A";
  if (g.A.includes(district)) return "A";
  if (g.B.includes(district)) return "B";
  return "A";
}
