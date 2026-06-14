"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export function useGuard(roles) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const s = getSession();
    if (!s || (roles && !roles.includes(s.role))) {
      router.push("/login");
      return;
    }
    setSession(s);
    setReady(true);
  }, [router, roles]);

  return { session, ready };
}
