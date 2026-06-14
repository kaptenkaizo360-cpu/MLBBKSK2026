"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterTeamRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/district-dashboard"); }, [router]);
  return <div className="text-center py-20 text-white/60">Mengalih ke dashboard daerah…</div>;
}
