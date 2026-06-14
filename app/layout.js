import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "MLBB Pendidikan Khas Negeri Johor",
  description:
    "Sistem Pendaftaran & Pengurusan Pertandingan Mobile Legend Pendidikan Khas Peringkat Negeri Johor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body className="bg-arena min-h-screen animate-moveGrad">
        {/* Emblem bulan sabit & bintang gold */}
        <svg className="moon-emblem" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path d="M70 50a30 30 0 1 1-22-29 24 24 0 1 0 22 29z" fill="#D4AF37" />
          <path d="M78 20l2.5 6 6 .5-4.5 4 1.5 6-5.5-3.5L72 43l1.5-6-4.5-4 6-.5z" fill="#F2C94C" />
        </svg>
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
