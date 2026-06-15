"use client";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Home, Trophy, Swords, GitBranch, Crown, LayoutDashboard } from "lucide-react";
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
    { href: "/", label: "Utama", icon: Home },
    { href: "/standings", label: "Kedudukan", icon: Trophy },
    { href: "/results", label: "Keputusan", icon: Swords },
    { href: "/semifinal", label: "Separuh Akhir", icon: GitBranch },
    { href: "/final", label: "Final", icon: Crown },
  ];

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
    <>
      {/* Bar atas mini untuk MOBILE (butang buka menu) */}
      <header className="md:hidden sticky top-0 z-50 glass !rounded-none border-x-0 border-t-0">
        <div className="px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo-esports.jpeg" alt="Home"
              className="h-9 w-9 rounded-full object-cover border border-gold/50"
              onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span className="title-rgb font-display font-bold text-sm">MLBB PK JOHOR</span>
          </a>
          <button className="text-gold" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Tirai gelap bila menu mobile dibuka */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* SIDEBAR menegak di kiri */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-60 glass !rounded-none border-y-0 border-l-0
        flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>

        {/* Logo + tajuk */}
        <a href="/" className="flex items-center gap-2 px-5 h-16 border-b border-gold/20 shrink-0">
          <img src="/logo-esports.jpeg" alt="E-Sports MLBB PK Johor — Home"
            className="h-10 w-10 rounded-full object-cover border border-gold/50 shadow-goldglow"
            onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="title-rgb font-display font-bold text-sm leading-tight">MLBB<br/>PK JOHOR</span>
          {/* Emblem gaming berputar */}
          <svg className="gaming-emblem ml-auto" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2l2.4 4.8 5.3.8-3.85 3.75.9 5.3L12 19l-4.75 2.45.9-5.3L4.3 12.4l5.3-.8L12 2z"
              fill="#F2C94C" stroke="#D4AF37" strokeWidth="0.6" />
          </svg>
        </a>

        {/* Pautan menegak */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:bg-gold/10 hover:text-gold transition">
                <Icon size={18} /> <span className="text-sm">{l.label}</span>
              </a>
            );
          })}

          {dashboardHref && (
            <a href={dashboardHref} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gold hover:bg-gold/10 transition mt-1">
              <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
            </a>
          )}
        </nav>

        {/* Bahagian bawah: login / logout */}
        <div className="p-3 border-t border-gold/20 shrink-0">
          <div className="flex items-center justify-center gap-2 mb-3 text-gold/40">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6 8h12a4 4 0 0 1 4 4v1a3 3 0 0 1-5.4 1.8L15 13.5H9l-1.6 2.3A3 3 0 0 1 2 14v-2a4 4 0 0 1 4-4zm1 2v1.5H5.5V13H7v1.5h1.5V13H10v-1.5H8.5V10H7zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
            </svg>
            <span className="text-[10px] tracking-widest font-display">E-SPORTS</span>
          </div>
          {session ? (
            <>
              <div className="text-gold/80 text-xs px-2 mb-2 truncate">{session.label}</div>
              <button onClick={logout} className="btn btn-gold text-sm w-full justify-center">
                <LogOut size={16} /> Log Keluar
              </button>
            </>
          ) : (
            <a href="/login" className="btn btn-gold text-sm w-full justify-center">Log Masuk</a>
          )}
        </div>
      </aside>
    </>
  );
}
