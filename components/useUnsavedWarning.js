"use client";
import { useEffect } from "react";

// Amaran bila cuba tutup/refresh tab dengan perubahan belum disimpan
export function useUnsavedWarning(dirty) {
  useEffect(() => {
    function onBeforeUnload(e) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = ""; // pelayar akan papar amaran lalai
      return "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}
