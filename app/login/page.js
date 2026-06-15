"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAs, setSession } from "@/lib/auth";
import { LogIn, ShieldCheck, KeyRound, Shield, Gamepad2, Trophy } from "lucide-react";

const ROLES = [
  { id: "district", label: "Daerah", icon: Shield, hint: "cth: MLBBKLUANG", dest: "/district-dashboard" },
  { id: "host", label: "Host", icon: Gamepad2, hint: "HOSTMLBBJOHOR", dest: "/host-dashboard" },
  { id: "admin", label: "Admin", icon: Trophy, hint: "ADMINMLBBJOHOR", dest: "/admin-dashboard" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-white/60">Memuatkan…</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const [role, setRole] = useState("district");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const r = params.get("role");
    if (r && ROLES.some((x) => x.id === r)) setRole(r);
  }, [params]);

  const active = ROLES.find((r) => r.id === role);

  function submit() {
    setError("");
    const s = loginAs(role, userId, password);
    if (!s) { setError(`ID atau kata laluan ${active.label} tidak sah.`); return; }
    setSession(s);
    router.push(active.dest);
  }

  function pickRole(id) {
    setRole(id);
    setError("");
    setUserId("");
    setPassword("");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass p-8">
        <div className="flex items-center gap-2 text-gold mb-1">
          <ShieldCheck /> <span className="font-display font-bold">LOG MASUK SISTEM</span>
        </div>
        <p className="text-white/60 text-sm mb-6">Pilih jenis log masuk anda</p>

        {/* Tab role */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <button key={r.id} onClick={() => pickRole(r.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-sm transition
                  ${role === r.id
                    ? "bg-gold text-ink border-gold font-semibold"
                    : "bg-black/20 text-white/70 border-gold/25 hover:border-gold/50"}`}>
                <Icon size={18} /> {r.label}
              </button>
            );
          })}
        </div>

        <label className="text-sm text-white/70">User ID {active.label}</label>
        <div className="relative mb-4 mt-1">
          <KeyRound size={16} className="absolute left-3 top-3 text-gold/60" />
          <input className="field pl-9" value={userId} onChange={(e) => setUserId(e.target.value)}
            placeholder={active.hint} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>

        <label className="text-sm text-white/70">Kata Laluan</label>
        <input type="password" className="field mt-1" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && submit()} />

        {error && <p className="text-red-300 text-sm mt-3">{error}</p>}

        <button onClick={submit} className="btn btn-gold w-full justify-center mt-6">
          <LogIn size={18} /> Log Masuk sebagai {active.label}
        </button>
      </div>
    </div>
  );
}
