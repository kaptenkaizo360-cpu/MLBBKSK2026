"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verifySession, clearSession } from "@/lib/auth";

export function useGuard(roles) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    (async () => {
      // Sahkan TOKEN dengan server — localStorage sahaja tidak dipercayai,
      // sebab ia boleh dipalsukan terus melalui DevTools pelayar.
      const s = await verifySession();
      if (!alive) return;
      if (!s || (roles && !roles.includes(s.role))) {
        clearSession();
        router.push("/login");
        return;
      }
      setSession(s);
      setReady(true);
    })();
    return () => { alive = false; };
  }, [router, roles]);

  return { session, ready };
}
