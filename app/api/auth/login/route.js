import { NextResponse } from "next/server";
import {
  authConfigurationError,
  createSessionToken,
  credentialsMatch,
  isSameOrigin,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const configurationError = authConfigurationError();
  if (configurationError) {
    return NextResponse.json({ error: configurationError }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }

  if (typeof body.username !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  try {
    if (!credentialsMatch(body.username, body.password)) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }
    const response = NextResponse.json({ data: { authenticated: true } });
    response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Login configuration error:", error);
    return NextResponse.json({ error: "Login failed because of a server configuration error." }, { status: 500 });
  }
}
