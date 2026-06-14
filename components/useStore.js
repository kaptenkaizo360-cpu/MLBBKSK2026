"use client";
import { useEffect, useState, useCallback } from "react";
import { loadStore, saveStore } from "@/lib/store";

export function useStore() {
  const [store, setStore] = useState(null);

  const refresh = useCallback(() => setStore(loadStore()), []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("mlbb-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("mlbb-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const commit = useCallback((next) => {
    saveStore(next);
    setStore({ ...next });
  }, []);

  return { store, commit, refresh };
}
