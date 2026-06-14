"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { loadStore, saveStore } from "@/lib/store";
import { scheduleSync, fetchStore, syncEnabled } from "@/lib/sync";

const POLL_MS = 5000; // semak Sheet setiap 5 saat supaya semua nampak update

export function useStore() {
  const [store, setStore] = useState(null);
  const localTouchedAt = useRef(0); // waktu user ini buat perubahan

  const applyLocal = useCallback(() => setStore(loadStore()), []);

  // Muat awal: cuba Sheet dulu, kalau gagal guna localStorage
  useEffect(() => {
    let alive = true;
    (async () => {
      if (syncEnabled()) {
        const remote = await fetchStore();
        if (alive && remote) {
          saveStore(remote, { silent: true });
          setStore(remote);
          return;
        }
      }
      if (alive) applyLocal();
    })();
    return () => { alive = false; };
  }, [applyLocal]);

  // Dengar perubahan tempatan (antara tab / komponen)
  useEffect(() => {
    const onUpdate = () => applyLocal();
    window.addEventListener("mlbb-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("mlbb-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [applyLocal]);

  // Poll Sheet supaya nampak perubahan orang lain
  useEffect(() => {
    if (!syncEnabled()) return;
    const id = setInterval(async () => {
      // Jangan timpa kalau user baru je buat perubahan (elak data hilang)
      if (Date.now() - localTouchedAt.current < POLL_MS) return;
      const remote = await fetchStore();
      if (remote) {
        saveStore(remote, { silent: true });
        setStore(remote);
      }
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const commit = useCallback((next) => {
    localTouchedAt.current = Date.now();
    saveStore(next);
    setStore({ ...next });
    scheduleSync(next); // tulis ke Sheet
  }, []);

  return { store, commit, refresh: applyLocal };
}
