"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { getSession, clearSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSessionState] = useState(null);
  const router = useRouter();

  useEffect(() => { setSessionState(getSession()); }, []);

  const links = [
    { href: "/standings", label: "Kedudukan" },
    { href: "/results", label: "Keputusan" },
    { href: "/semifinal", label: "Separuh Akhir" },
    { href: "/final", label: "Final" },
  ];

  // Klik logo = ke Home + auto logout (dengan peringatan jika sedang login)
  function goHome() {
    if (session) {
      const ok = window.confirm(
        "Pastikan data anda telah disimpan sebelum keluar.\n\nKlik OK untuk ke Laman Utama dan log keluar."
      );
      if (!ok) return;
    }
    clearSession();
    setSessionState(null);
    setOpen(false);
    router.push("/");
  }

  function logout() {
    const ok = window.confirm(
      "PERINGATAN: Pastikan data anda telah disimpan!\n\nAdakah anda pasti mahu log keluar?"
    );
    if (!ok) return;
    clearSession();
    setSessionState(null);
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 glass !rounded-none border-x-0 border-t-0">
      {/* Semua di sebelah kiri */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo karnival (Home) + logo esports baharu */}
        <button onClick={goHome} className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo-karnival.jpg"
            alt="Karnival Sukan PPKI Daerah Kluang — Home"
            className="h-11 w-11 rounded-full object-cover border border-gold/40 group-hover:scale-105 transition"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <img
            src="/logo-esports.jpeg"
            alt="E-Sports MLBB Pendidikan Khas Negeri Johor"
            className="h-11 w-11 rounded-full object-cover border border-gold/40 group-hover:scale-105 transition hidden sm:block"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <span className="title-rgb font-display font-bold tracking-wide text-sm sm:text-base whitespace-nowrap">
            MLBB PK JOHOR
          </span>
        </button>

        {/* Pautan di kiri (selepas logo) */}
        <nav className="hidden md:flex items-center gap-5 ml-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-white/80 hover:text-gold transition">
              {l.label}
            </Link>
          ))}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-gold/80 text-sm hidden lg:inline">{session.label}</span>
              <button onClick={logout} className="btn btn-gold text-sm">
                <LogOut size={16} /> Log Keluar
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-gold text-sm">Login</Link>
          )}
        </nav>

        {/* Butang menu mobile (kekal kanan) */}
        <button className="md:hidden text-gold ml-auto" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 items-start">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-white/80 hover:text-gold">{l.label}</Link>
          ))}
          {session ? (
            <>
              <span className="text-gold/80 text-sm">{session.label}</span>
              <button onClick={logout} className="btn btn-gold text-sm w-fit">
                <LogOut size={16} /> Log Keluar
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="btn btn-gold text-sm w-fit">Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
