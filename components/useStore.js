"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { loadStore, saveStore, defaultStore } from "@/lib/store";
import { syncNow, fetchStore, syncEnabled } from "@/lib/sync";

const POLL_MS = 3000; // semak Sheet setiap 3 saat (BACA sahaja)

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
  const [dirty, setDirty] = useState(false); // ada perubahan belum disimpan ke Sheet
  const dirtyRef = useRef(false);

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
      } catch { /* jatuh ke localStorage */ }
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

  // Poll setiap 3 saat — BACA dari Sheet supaya semua peranti nampak update.
  // JANGAN timpa kalau ada perubahan tempatan belum disimpan, atau sedang menaip.
  useEffect(() => {
    if (!syncEnabled()) return;
    const id = setInterval(async () => {
      if (dirtyRef.current) return; // ada perubahan belum Save — jangan timpa
      const el = typeof document !== "undefined" ? document.activeElement : null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT")) return;
      try {
        const remote = await fetchStore();
        if (remote) {
          const safe = safeStore(remote);
          saveStore(safe, { silent: true });
          setStore(safe);
        }
      } catch { /* abaikan ralat rangkaian */ }
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  // Perubahan disimpan ke PELAYAR sahaja — tandakan dirty (belum ke Sheet)
  const commit = useCallback((next) => {
    try {
      const safe = safeStore(next);
      saveStore(safe);
      setStore(safe);
      dirtyRef.current = true;
      setDirty(true);
    } catch { /* abaikan */ }
  }, []);

  // Tekan SAVE — tulis ke Sheet, kemudian tandakan tidak dirty
  const saveToSheet = useCallback(async () => {
    try {
      const current = safeStore(loadStore());
      await syncNow(current);
      dirtyRef.current = false;
      setDirty(false);
      return true;
    } catch {
      return false;
    }
  }, []);

  return { store, commit, refresh: applyLocal, saveToSheet, dirty };
}
