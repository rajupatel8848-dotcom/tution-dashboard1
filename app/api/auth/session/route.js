import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";

export async function GET(request) {
  return NextResponse.json({ data: { authenticated: hasValidSession(request) } });
}
