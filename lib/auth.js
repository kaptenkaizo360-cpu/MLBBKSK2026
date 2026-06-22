"use client";
// Fail ini SELAMAT untuk client — TIDAK mengandungi password.
// Pengesahan sebenar berlaku di server melalui API route (/api/login, /api/verify).

const SKEY = "mlbb_session_v1";
const TKEY = "mlbb_token_v1";

// Login — hantar kredensial ke server untuk disahkan. Password tidak pernah
// disimpan dalam kod pelayar.
export async function loginAs(role, userId, password) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, userId, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.token || !data?.session) return null;
    setSession(data.session, data.token);
    return data.session;
  } catch {
    return null;
  }
}

export function setSession(session, token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SKEY, JSON.stringify(session));
  if (token) localStorage.setItem(TKEY, token);
  window.dispatchEvent(new Event("mlbb-session"));
}

// Paparan pantas (UI sahaja) — JANGAN guna ini untuk kawalan akses.
// Untuk kawalan akses sebenar, guna verifySession().
export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SKEY));
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TKEY);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SKEY);
  localStorage.removeItem(TKEY);
  window.dispatchEvent(new Event("mlbb-session"));
}

// Sahkan token dengan SERVER — token tidak boleh dipalsukan tanpa AUTH_SECRET
// yang hanya disimpan di server. useGuard WAJIB guna fungsi ini, bukan
// getSession() secara terus, supaya session palsu (cth. ditulis terus ke
// localStorage melalui DevTools) tidak diterima.
export async function verifySession() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.valid) return null;
    return data.session;
  } catch {
    return null;
  }
}

// Dapatkan senarai kredensial (admin sahaja) — server semak token dahulu
export async function fetchCredentialsList() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch("/api/admin/credentials", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
