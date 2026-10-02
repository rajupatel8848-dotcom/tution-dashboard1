import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "tutora_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

export function authConfigurationError() {
  const missing = [];
  if (!process.env.DASHBOARD_USERNAME?.trim()) missing.push("DASHBOARD_USERNAME");
  if (!process.env.DASHBOARD_PASSWORD) missing.push("DASHBOARD_PASSWORD");
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    missing.push("SESSION_SECRET (at least 32 characters)");
  }
  return missing.length
    ? `Authentication is not configured. Set ${missing.join(", ")} in .env.local and restart the server.`
    : null;
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return value;
}

function sign(value) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function credentialsMatch(username, password) {
  const expectedUsername = process.env.DASHBOARD_USERNAME;
  const expectedPassword = process.env.DASHBOARD_PASSWORD;
  if (!expectedUsername?.trim() || !expectedPassword) {
    throw new Error("DASHBOARD_USERNAME and DASHBOARD_PASSWORD must be configured.");
  }
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createSessionToken() {
  const payload = Buffer.from(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  try {
    if (!safeEqual(signature, sign(payload))) return false;
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isInteger(session.exp) && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export function hasValidSession(request) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}
