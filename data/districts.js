// Senarai daerah (untuk paparan/UI sahaja — TIADA password di sini).
// Kredensial sebenar (userId+password) disimpan di data/credentials.js
// yang hanya boleh diakses oleh API route di server.

export const DISTRICTS = [
  { name: "Johor Bahru" },
  { name: "Pasir Gudang" },
  { name: "Kulai" },
  { name: "Kota Tinggi" },
  { name: "Mersing" },
  { name: "Kluang" },
  { name: "Batu Pahat" },
  { name: "Muar" },
  { name: "Tangkak" },
  { name: "Pontian" },
];

export const CATEGORIES = ["Sekolah Rendah", "Sekolah Menengah"];

// Pembahagian kumpulan ikut kategori — A & B sahaja (Segamat tidak mengambil bahagian)
export const GROUPING = {
  "Sekolah Rendah": {
    A: ["Johor Bahru", "Pasir Gudang", "Kulai", "Kota Tinggi", "Muar"],
    B: ["Mersing", "Pontian", "Kluang", "Batu Pahat", "Tangkak"],
  },
  "Sekolah Menengah": {
    A: ["Kulai", "Kota Tinggi", "Mersing", "Kluang", "Tangkak"],
    B: ["Batu Pahat", "Muar", "Pontian", "Johor Bahru", "Pasir Gudang"],
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
