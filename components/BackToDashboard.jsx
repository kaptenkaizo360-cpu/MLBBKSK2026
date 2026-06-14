"use client";
import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { getSession } from "@/lib/auth";

export default function BackToDashboard() {
  const [href, setHref] = useState(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const s = getSession();
    if (!s) return;
    if (s.role === "admin") { setHref("/admin-dashboard"); setLabel("Kembali ke Dashboard Admin"); }
    else if (s.role === "host") { setHref("/host-dashboard"); setLabel("Kembali ke Dashboard Host"); }
    else if (s.role === "district") { setHref("/district-dashboard"); setLabel(`Kembali ke Dashboard ${s.district}`); }
  }, []);

  if (!href) return null;
  return (
    <a href={href} className="btn btn-emerald text-sm mb-6">
      <LayoutDashboard size={16} /> {label}
    </a>
  );
}
