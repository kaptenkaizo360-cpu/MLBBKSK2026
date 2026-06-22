import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "DEV-ONLY-FALLBACK-SECRET-TUKAR-DI-VERCEL";
const SHEET_URL = process.env.NEXT_PUBLIC_SHEET_SYNC_URL || "";
const SHEET_SECRET = process.env.GOOGLE_SHEETS_SECRET || "";

function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  const sigBuf = Buffer.from(sig || "");
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  } catch {
    return null;
  }
}

// Proksi tulisan ke Google Sheet. Pelayar TIDAK PERNAH tahu GOOGLE_SHEETS_SECRET —
// ia ditambah di sini, di server, sebelum dihantar ke Apps Script.
export async function POST(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const payload = verifyToken(token);

  // Admin, host, dan daerah semua perlu boleh simpan data masing-masing
  if (!payload || !["admin", "host", "district"].includes(payload.role)) {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  if (!SHEET_URL) {
    return NextResponse.json({ ok: false, error: "Sheet sync tidak aktif." }, { status: 200 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  try {
    const res = await fetch(SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ store: body.store, secret: SHEET_SECRET }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 502 });
  }
}
