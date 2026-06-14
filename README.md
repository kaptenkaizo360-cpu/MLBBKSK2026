# MLBB Pendidikan Khas Negeri Johor

Sistem pendaftaran & pengurusan pertandingan Mobile Legend Pendidikan Khas Peringkat Negeri Johor.
Next.js 14 (App Router) · React · Tailwind CSS · Lucide Icons.

## Jalankan secara tempatan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Login Demo

**Admin** — `ADMINMLBBJOHOR` / `Admin@Johor2026`
**Host** — `HOSTMLBBJOHOR` / `Host@MLBB2026`
**Daerah** (contoh Kluang) — `MLBBKLUANG` / `aVbx#6aj7vqx`

Senarai penuh kredensial daerah ada dalam Dashboard Admin → tab "Data & Tetapan",
atau dalam fail `data/districts.js`.

## Cara Guna

1. **Daerah** log masuk → daftar pasukan Sekolah Rendah & Menengah + senarai peserta (Username MLBB, IGN, role).
2. **Host** log masuk → pilih kategori/kumpulan → isi kill & pilih pemenang → tekan "Menang". Standing auto-update.
3. **Admin** log masuk → lihat semua pasukan/peserta/IGN, sahkan pendaftaran, export CSV, reset data.
4. Paparan awam: `/standings`, `/results`, `/semifinal`, `/final`.

Sistem mata: Menang = 3, Kalah = 0.
Susunan standing: Mata → Menang. Seri = admin tentukan manual. Tiada kiraan kill.
Dua teratas setiap kumpulan layak separuh akhir.

## Penyimpanan Data

Versi demo guna `localStorage` (mock database, kunci mlbb_store_v2) dengan event `mlbb-update` untuk live-refresh
dalam tab yang sama dan event `storage` untuk antara tab.
Struktur data (`USERS`, `TEAMS`, `PLAYERS`, `MATCHES`, `STANDINGS`) sudah disusun supaya
mudah disambung ke Firebase/Firestore kemudian — gantikan fungsi dalam `lib/store.js`
dengan panggilan Firestore + listener `onSnapshot`.

## Deploy ke GitHub

```bash
git init
git add .
git commit -m "MLBB PK Johor"
git branch -M main
git remote add origin https://github.com/USERNAME/mlbb-pk-johor.git
git push -u origin main
```

## Deploy ke Vercel

1. Daftar/masuk https://vercel.com
2. "Add New… → Project" → import repo GitHub di atas.
3. Vercel auto-detect Next.js. Tekan **Deploy**. Tiada env var diperlukan untuk versi demo.

## Struktur Folder

```
app/                 # halaman (App Router)
  page.js            # landing + live dashboard
  login/             # /login
  district-dashboard/  register-team/
  host-dashboard/    admin-dashboard/
  standings/  results/  semifinal/  final/
components/           # Navbar, Footer, Tables, useStore, useGuard
lib/                  # store.js (logik standing/jadual), auth.js
data/                 # districts.js (daerah, login, kumpulan)
```

## Google Sheet sebagai pangkalan data (data dikongsi semua user)

Sistem guna Google Sheet (ID `1KFwkaFP1F956Hjv89UL-KiaFK_Bnme75jdbRsLGCpaA`)
sebagai sumber utama. Semua user — daerah, host, admin — baca & tulis ke Sheet
yang sama, jadi semua nampak data yang sama. Paparan disegerak setiap 5 saat.
localStorage cuma cache supaya laju & boleh jalan walau internet putus seketika.

Langkah pasang:

1. Buka Google Sheet tersebut -> Extensions -> Apps Script.
2. Tampal kandungan `apps-script/Code.gs`, Save.
3. Deploy -> New deployment -> Web app -> Execute as: Me, Who has access: Anyone -> Deploy.
4. Salin Web app URL.
5. Buat `.env.local` (salin dari `.env.local.example`):
   NEXT_PUBLIC_SHEET_SYNC_URL=https://script.google.com/macros/s/XXXX/exec
   Untuk Vercel: Settings -> Environment Variables -> tambah pemboleh ubah sama.
6. Restart `npm run dev` (atau redeploy Vercel).

Sheet akan ada tab: _DATA (JSON penuh, tersembunyi), Pasukan, Peserta, Keputusan.
Status sambungan dipaparkan di Dashboard Admin.
Jika URL tidak diset, sistem jalan dalam pelayar sahaja (tidak dikongsi).

PENTING: setiap kali kod Apps Script diubah, buat Deploy -> Manage deployments
-> Edit -> Version: New version supaya perubahan naik.
