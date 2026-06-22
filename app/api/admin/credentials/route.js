import { NextResponse } from "next/server";
import crypto from "crypto";
import { ADMIN_CREDENTIALS, HOST_CREDENTIALS, DISTRICT_CREDENTIALS } from "@/data/credentials";

const SECRET = process.env.AUTH_SECRET || "DEV-ONLY-FALLBACK-SECRET-TUKAR-DI-VERCEL";

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

export async function GET(req) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Tidak dibenarkan." }, { status: 403 });
  }

  return NextResponse.json({
    admin: ADMIN_CREDENTIALS,
    host: HOST_CREDENTIALS,
    districts: DISTRICT_CREDENTIALS,
  });
}
