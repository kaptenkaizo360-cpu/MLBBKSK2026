// Lapisan segerak ke Google Sheet (sumber utama).
// localStorage digunakan sebagai cache offline + paparan pantas.
import { getToken } from "@/lib/auth";

const SYNC_URL = process.env.NEXT_PUBLIC_SHEET_SYNC_URL || "";

let writeTimer = null;
let lastStatus = "idle"; // idle | loading | syncing | ok | error | disabled

export function syncEnabled() {
  return Boolean(SYNC_URL);
}
export function getSyncStatus() {
  return SYNC_URL ? lastStatus : "disabled";
}
function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("mlbb-sync", { detail: getSyncStatus() }));
  }
}

// Baca state terkini dari Sheet
export async function fetchStore() {
  if (!SYNC_URL) return null;
  lastStatus = "loading"; notify();
  try {
    const res = await fetch(SYNC_URL, { method: "GET" });
    const data = await res.json();
    lastStatus = "ok"; notify();
    return data && data.ok ? data.store : null;
  } catch {
    lastStatus = "error"; notify();
    return null;
  }
}

// Tulis state ke Sheet — MELALUI proksi /api/sync sendiri (bukan terus ke
// Apps Script dari pelayar), supaya token log masuk disahkan dan rahsia
// Sheet tidak pernah didedahkan kepada pelayar.
async function push(store) {
  if (!SYNC_URL) { lastStatus = "disabled"; return; }
  lastStatus = "syncing"; notify();
  try {
    const token = getToken();
    await fetch("/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ store }),
    });
    lastStatus = "ok";
  } catch {
    lastStatus = "error";
  }
  notify();
}

// Tulis dengan debounce supaya tak spam Sheet
export function scheduleSync(store) {
  if (!SYNC_URL || typeof window === "undefined") return;
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => push(store), 1200);
}

// Tulis segera (cth: butang Backup Sekarang)
export function syncNow(store) {
  if (writeTimer) clearTimeout(writeTimer);
  return push(store);
}
