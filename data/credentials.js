// ===========================================================================
// AMARAN PENTING: Fail ini mengandungi PASSWORD SEBENAR.
// JANGAN sekali-kali import fail ini dari mana-mana komponen "use client"
// (contoh: app/login/page.js, app/admin-dashboard/page.js, dsb).
// Fail ini HANYA boleh diimport oleh API Route Handler (app/api/.../route.js)
// yang berjalan di SERVER (Vercel serverless function), bukan di pelayar.
//
// Kenapa? Next.js akan "bundle" (gabung) apa-apa fail yang diimport oleh
// komponen client terus ke dalam fail JavaScript yang dihantar ke pelayar
// SESIAPA SAHAJA yang buka laman web — termasuk yang belum login. Kalau
// fail ini diimport oleh komponen client, semua password akan boleh dibaca
// terus oleh sesiapa yang buka DevTools / View Source.
// ===========================================================================

export const ADMIN_CREDENTIALS = { userId: "ADMINMLBBJOHOR", password: "avadakadabra360" };
export const HOST_CREDENTIALS = { userId: "HOSTMLBBJOHOR", password: "avadakadabra" };

export const DISTRICT_CREDENTIALS = [
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
