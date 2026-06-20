// Senarai daerah + login. Kumpulan bergantung pada kategori.

export const DISTRICTS = [
  { name: "Johor Bahru", userId: "MLBBJOHORBAHRU", password: "mlbbjohorbahru564" },
  { name: "Pasir Gudang", userId: "MLBBPASIRGUDANG", password: "mlbbpasirgudang247" },
  { name: "Kulai", userId: "MLBBKULAI", password: "mlbbkulai808" },
  { name: "Kota Tinggi", userId: "MLBBKOTATINGGI", password: "mlbbkotatinggi625" },
  { name: "Mersing", userId: "MLBBMERSING", password: "mlbbmersing814" },
  { name: "Kluang", userId: "MLBBKLUANG", password: "mlbbkluang886" },
  { name: "Batu Pahat", userId: "MLBBBATUPAHAT", password: "mlbbbatupahat979" },
  { name: "Muar", userId: "MLBBMUAR", password: "mlbbmuar307" },
  { name: "Tangkak", userId: "MLBBTANGKAK", password: "mlbbtangkak343" },
  { name: "Pontian", userId: "MLBBPONTIAN", password: "mlbbpontian304" },
];

export const HOST = { userId: "HOSTMLBBJOHOR", password: "avadakadabra" };
export const ADMIN = { userId: "ADMINMLBBJOHOR", password: "avadakadabra360" };

export const CATEGORIES = ["Sekolah Rendah", "Sekolah Menengah"];

// Pembahagian kumpulan ikut kategori (Segamat tidak mengambil bahagian)
export const GROUPING = {
  "Sekolah Rendah": {
    A: ["Johor Bahru", "Pasir Gudang", "Kulai", "Kota Tinggi"],
    B: ["Mersing", "Pontian", "Kluang", "Batu Pahat"],
    C: ["Muar", "Tangkak"],
  },
  "Sekolah Menengah": {
    A: ["Kulai", "Kota Tinggi", "Mersing", "Kluang"],
    B: ["Tangkak", "Batu Pahat", "Muar"],
    C: ["Pontian", "Johor Bahru", "Pasir Gudang"],
  },
};

// Kumpulan untuk daerah dalam kategori tertentu
export function groupOf(district, category) {
  const g = GROUPING[category];
  if (!g) return "A";
  if (g.A.includes(district)) return "A";
  if (g.B.includes(district)) return "B";
  if (g.C.includes(district)) return "C";
  return "A";
}
