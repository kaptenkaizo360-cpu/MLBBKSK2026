import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "MLBB Pendidikan Khas Negeri Johor",
  description:
    "Sistem Pendaftaran & Pengurusan Pertandingan Mobile Legend Pendidikan Khas Peringkat Negeri Johor",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body className="bg-arena min-h-screen animate-moveGrad">
        {/* Logo e-sports sebagai latar penuh */}
        <div className="brand-bg" aria-hidden="true" />
        {/* Kesan kilat / lightning gaming */}
        <div className="lightning" aria-hidden="true" />
        <div className="lightning bolt2" aria-hidden="true" />
        {/* Garis petir berkelip */}
        <svg className="bolt-svg" style={{ top: "-2%", left: "18%", height: "60vh" }} viewBox="0 0 60 300" fill="none" aria-hidden="true">
          <path d="M34 0 L14 130 L30 130 L8 300 L46 120 L28 120 L40 0 Z"
            fill="rgba(180,215,255,0.9)" stroke="rgba(230,245,255,0.95)" strokeWidth="1.5" />
        </svg>
        <svg className="bolt-svg b2" style={{ top: "-2%", right: "14%", height: "55vh" }} viewBox="0 0 60 300" fill="none" aria-hidden="true">
          <path d="M30 0 L12 120 L26 120 L6 300 L44 110 L26 110 L38 0 Z"
            fill="rgba(170,205,255,0.85)" stroke="rgba(225,240,255,0.9)" strokeWidth="1.5" />
        </svg>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
