import { DISTRICTS, HOST, ADMIN } from "@/data/districts";

const SKEY = "mlbb_session_v1";

export function login(userId, password) {
  const u = (userId || "").trim();
  const p = password || "";

  if (u === ADMIN.userId && p === ADMIN.password)
    return { role: "admin", userId: u, label: "Admin Negeri Johor" };

  if (u === HOST.userId && p === HOST.password)
    return { role: "host", userId: u, label: "Host Pertandingan" };

  const d = DISTRICTS.find((x) => x.userId === u && x.password === p);
  if (d) return { role: "district", userId: u, district: d.name, label: d.name };

  return null;
}

export function setSession(s) {
  if (typeof window !== "undefined") localStorage.setItem(SKEY, JSON.stringify(s));
}
export function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SKEY)); } catch { return null; }
}
export function clearSession() {
  if (typeof window !== "undefined") localStorage.removeItem(SKEY);
}
