"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trophy, Menu, X, LogOut } from "lucide-react";
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

  function logout() {
    clearSession();
    setSessionState(null);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 glass !rounded-none border-x-0 border-t-0">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Trophy className="text-gold animate-pulseGlow" />
          <span className="font-display font-bold tracking-wide gold-text text-sm sm:text-base">
            MLBB PK JOHOR
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-white/80 hover:text-gold transition">
              {l.label}
            </Link>
          ))}
          {session ? (
            <button onClick={logout} className="btn btn-ghost text-sm">
              <LogOut size={16} /> {session.label}
            </button>
          ) : (
            <Link href="/login" className="btn btn-gold text-sm">Login</Link>
          )}
        </nav>

        <button className="md:hidden text-gold" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-white/80 hover:text-gold">{l.label}</Link>
          ))}
          {session ? (
            <button onClick={logout} className="btn btn-ghost text-sm w-fit">
              <LogOut size={16} /> Log Keluar
            </button>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="btn btn-gold text-sm w-fit">Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
