import { DISTRICTS, HOST, ADMIN } from "@/data/districts";

const SKEY = "mlbb_session_v1";

// Login ikut role yang DIPILIH — kredensial hanya disemak untuk role itu sahaja.
export function loginAs(role, userId, password) {
  const u = (userId || "").trim();
  const p = password || "";

  if (role === "admin") {
    if (u === ADMIN.userId && p === ADMIN.password)
      return { role: "admin", userId: u, label: "Admin Negeri Johor" };
    return null;
  }
  if (role === "host") {
    if (u === HOST.userId && p === HOST.password)
      return { role: "host", userId: u, label: "Host Pertandingan" };
    return null;
  }
  if (role === "district") {
    const d = DISTRICTS.find((x) => x.userId === u && x.password === p);
    if (d) return { role: "district", userId: u, district: d.name, label: d.name };
    return null;
  }
  return null;
}

// Kekalkan login lama (auto-detect) untuk keserasian
export function login(userId, password) {
  return loginAs("admin", userId, password)
    || loginAs("host", userId, password)
    || loginAs("district", userId, password);
}

export function setSession(s) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SKEY, JSON.stringify(s));
    window.dispatchEvent(new Event("mlbb-session"));
  }
}
export function getSession() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(SKEY)); } catch { return null; }
}
export function clearSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SKEY);
    window.dispatchEvent(new Event("mlbb-session"));
  }
}
