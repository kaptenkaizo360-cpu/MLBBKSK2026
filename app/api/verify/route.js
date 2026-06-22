import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.AUTH_SECRET || "DEV-ONLY-FALLBACK-SECRET-TUKAR-DI-VERCEL";
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // token sah selama 12 jam

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const token = body?.token;
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const [payloadB64, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");

  // Bandingan selamat (elak timing attack)
  const sigBuf = Buffer.from(sig || "");
  const expBuf = Buffer.from(expectedSig);
  const validSig = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  if (!validSig) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  if (!payload?.iat || Date.now() - payload.iat > MAX_AGE_MS) {
    return NextResponse.json({ valid: false, expired: true }, { status: 401 });
  }

  return NextResponse.json({ valid: true, session: payload });
}
