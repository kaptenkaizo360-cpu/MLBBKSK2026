"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, setSession } from "@/lib/auth";
import { LogIn, ShieldCheck, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function submit() {
    setError("");
    const s = login(userId, password);
    if (!s) { setError("ID atau kata laluan tidak sah."); return; }
    setSession(s);
    if (s.role === "admin") router.push("/admin-dashboard");
    else if (s.role === "host") router.push("/host-dashboard");
    else router.push("/district-dashboard");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="glass p-8">
        <div className="flex items-center gap-2 text-gold mb-1">
          <ShieldCheck /> <span className="font-display font-bold">LOG MASUK SISTEM</span>
        </div>
        <p className="text-white/60 text-sm mb-6">Daerah · Host · Admin</p>

        <label className="text-sm text-white/70">User ID</label>
        <div className="relative mb-4 mt-1">
          <KeyRound size={16} className="absolute left-3 top-3 text-gold/60" />
          <input className="field pl-9" value={userId} onChange={(e) => setUserId(e.target.value)}
            placeholder="cth: MLBBKLUANG" onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>

        <label className="text-sm text-white/70">Kata Laluan</label>
        <input type="password" className="field mt-1" value={password}
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
          onKeyDown={(e) => e.key === "Enter" && submit()} />

        {error && <p className="text-red-300 text-sm mt-3">{error}</p>}

        <button onClick={submit} className="btn btn-gold w-full justify-center mt-6">
          <LogIn size={18} /> Log Masuk
        </button>
      </div>
    </div>
  );
}
