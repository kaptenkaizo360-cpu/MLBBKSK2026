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
        {/* Logo e-sports sebagai latar samar (tidak ganggu bacaan) */}
        <div className="brand-bg" aria-hidden="true" />
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
