"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { loadStore, saveStore, defaultStore } from "@/lib/store";
import { scheduleSync, fetchStore, syncEnabled } from "@/lib/sync";

const POLL_MS = 3000; // semak Sheet setiap 3 saat

// Pastikan store sentiasa sah supaya UI tak crash
function safeStore(s) {
  if (!s || typeof s !== "object") return defaultStore();
  return {
    teams: Array.isArray(s.teams) ? s.teams : [],
    matches: Array.isArray(s.matches) ? s.matches : [],
    knockout: s.knockout && typeof s.knockout === "object" ? s.knockout : {},
  };
}

export function useStore() {
  const [store, setStore] = useState(null);
  const localTouchedAt = useRef(0);

  const applyLocal = useCallback(() => {
    try { setStore(safeStore(loadStore())); }
    catch { setStore(defaultStore()); }
  }, []);

  // Muat awal
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (syncEnabled()) {
          const remote = await fetchStore();
          if (alive && remote) {
            const safe = safeStore(remote);
            saveStore(safe, { silent: true });
            setStore(safe);
            return;
          }
        }
      } catch { /* abaikan, jatuh ke localStorage */ }
      if (alive) applyLocal();
    })();
    return () => { alive = false; };
  }, [applyLocal]);

  // Dengar perubahan tempatan
  useEffect(() => {
    const onUpdate = () => applyLocal();
    window.addEventListener("mlbb-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("mlbb-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [applyLocal]);

  // Poll setiap 3 saat
  useEffect(() => {
    if (!syncEnabled()) return;
    const id = setInterval(async () => {
      if (Date.now() - localTouchedAt.current < POLL_MS) return;
      const el = typeof document !== "undefined" ? document.activeElement : null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) return;
      try {
        const remote = await fetchStore();
        if (remote) {
          const safe = safeStore(remote);
          saveStore(safe, { silent: true });
          setStore(safe);
        }
      } catch { /* abaikan ralat rangkaian, cuba lagi pusingan seterusnya */ }
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const commit = useCallback((next) => {
    try {
      const safe = safeStore(next);
      localTouchedAt.current = Date.now();
      saveStore(safe);
      setStore(safe);
      scheduleSync(safe);
    } catch { /* abaikan */ }
  }, []);

  return { store, commit, refresh: applyLocal };
}
