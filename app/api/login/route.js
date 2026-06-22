import { NextResponse } from "next/server";
import crypto from "crypto";
import { ADMIN_CREDENTIALS, HOST_CREDENTIALS, DISTRICT_CREDENTIALS } from "@/data/credentials";

// PENTING: tetapkan AUTH_SECRET dalam Environment Variables Vercel (rawak, panjang).
// Tanpa ini, sistem guna nilai fallback dev sahaja — JANGAN guna fallback di produksi.
const SECRET = process.env.AUTH_SECRET || "DEV-ONLY-FALLBACK-SECRET-TUKAR-DI-VERCEL";

function signToken(payloadObj) {
  const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  const role = body?.role;
  const u = (body?.userId || "").trim();
  const p = body?.password || "";

  let session = null;

  if (role === "admin" && u === ADMIN_CREDENTIALS.userId && p === ADMIN_CREDENTIALS.password) {
    session = { role: "admin", userId: u, label: "Admin Negeri Johor" };
  } else if (role === "host" && u === HOST_CREDENTIALS.userId && p === HOST_CREDENTIALS.password) {
    session = { role: "host", userId: u, label: "Host Pertandingan" };
  } else if (role === "district") {
    const d = DISTRICT_CREDENTIALS.find((x) => x.userId === u && x.password === p);
    if (d) session = { role: "district", userId: u, district: d.name, label: d.name };
  }

  if (!session) {
    return NextResponse.json({ error: "ID atau kata laluan tidak sah." }, { status: 401 });
  }

  const token = signToken({ ...session, iat: Date.now() });
  return NextResponse.json({ token, session });
}
