import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "admin_token";
const TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

interface TokenPayload {
  timestamp: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return secret;
}

export function signToken(): string {
  const payload: TokenPayload = {
    timestamp: Date.now(),
    exp: Date.now() + TOKEN_MAX_AGE * 1000,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payloadBase64)
    .digest("hex");

  return `${payloadBase64}.${signature}`;
}

export function verifyToken(token: string): boolean {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return false;

    const expectedSignature = crypto
      .createHmac("sha256", getSecret())
      .update(payloadBase64)
      .digest("hex");

    // Constant-time comparison
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    if (sigBuffer.length !== expectedBuffer.length) return false;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

    // Check expiry
    const payload: TokenPayload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString()
    );
    if (Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  // Constant-time comparison
  const inputBuffer = Buffer.from(password);
  const storedBuffer = Buffer.from(adminPassword);

  if (inputBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(inputBuffer, storedBuffer);
}

export function createAuthCookieHeader(token: string): string {
  const parts = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${TOKEN_MAX_AGE}`,
    "SameSite=Strict",
  ];

  // Add Secure flag in production
  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function clearAuthCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}

export function verifyAuthFromRequest(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export async function verifyAuthFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
