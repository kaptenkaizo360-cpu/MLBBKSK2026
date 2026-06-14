"use client";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Home, LayoutDashboard } from "lucide-react";
import { getSession, clearSession } from "@/lib/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [session, setSessionState] = useState(null);

  useEffect(() => {
    setSessionState(getSession());
    const onUpdate = () => setSessionState(getSession());
    window.addEventListener("mlbb-session", onUpdate);
    return () => window.removeEventListener("mlbb-session", onUpdate);
  }, []);

  const links = [
    { href: "/standings", label: "Kedudukan" },
    { href: "/results", label: "Keputusan" },
    { href: "/semifinal", label: "Separuh Akhir" },
    { href: "/final", label: "Final" },
  ];

  // Dashboard ikut role yang login
  const dashboardHref =
    session?.role === "admin" ? "/admin-dashboard" :
    session?.role === "host" ? "/host-dashboard" :
    session?.role === "district" ? "/district-dashboard" : null;

  function logout() {
    const ok = window.confirm(
      "Pastikan semua maklumat telah disemak dan disimpan untuk mengelakkan kesalahan.\n\nAdakah anda pasti mahu log keluar?"
    );
    if (!ok) return;
    clearSession();
    setSessionState(null);
    setOpen(false);
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 glass !rounded-none border-x-0 border-t-0">
      {/* Semua di sebelah kiri */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo e-sports = pautan ke Home (kekal login) */}
        <a href="/" className="flex items-center gap-2 group shrink-0">
          <img
            src="/logo-esports.jpeg"
            alt="E-Sports MLBB Pendidikan Khas Negeri Johor — Home"
            className="h-11 w-11 rounded-full object-cover border border-gold/50 group-hover:scale-105 transition shadow-goldglow"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <span className="title-rgb font-display font-bold tracking-wide text-sm sm:text-base whitespace-nowrap">
            MLBB PK JOHOR
          </span>
        </a>

        {/* Pautan + butang di kiri */}
        <nav className="hidden md:flex items-center gap-5 ml-2">
          <a href="/" className="text-white/80 hover:text-gold transition flex items-center gap-1">
            <Home size={15} /> Utama
          </a>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-white/80 hover:text-gold transition">
              {l.label}
            </a>
          ))}
          {dashboardHref && (
            <a href={dashboardHref} className="text-gold hover:text-mustard transition flex items-center gap-1">
              <LayoutDashboard size={15} /> Dashboard
            </a>
          )}
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-gold/80 text-sm hidden lg:inline">{session.label}</span>
              <button onClick={logout} className="btn btn-gold text-sm">
                <LogOut size={16} /> Log Keluar
              </button>
            </div>
          ) : (
            <a href="/login" className="btn btn-gold text-sm">Login</a>
          )}
        </nav>

        <button className="md:hidden text-gold ml-auto" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3 items-start">
          <a href="/" className="text-white/80 hover:text-gold flex items-center gap-1">
            <Home size={15} /> Utama
          </a>
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-white/80 hover:text-gold">{l.label}</a>
          ))}
          {dashboardHref && (
            <a href={dashboardHref} className="text-gold hover:text-mustard flex items-center gap-1">
              <LayoutDashboard size={15} /> Dashboard
            </a>
          )}
          {session ? (
            <>
              <span className="text-gold/80 text-sm">{session.label}</span>
              <button onClick={logout} className="btn btn-gold text-sm w-fit">
                <LogOut size={16} /> Log Keluar
              </button>
            </>
          ) : (
            <a href="/login" className="btn btn-gold text-sm w-fit">Login</a>
          )}
        </div>
      )}
    </header>
  );
}
