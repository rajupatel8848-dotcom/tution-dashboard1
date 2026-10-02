import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(request) {
  if (!hasValidSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const database = await getDatabase();
    await database.command({ ping: 1 });
    return NextResponse.json({ data: { status: "ok", database: database.databaseName } });
  } catch (error) {
    console.error("MongoDB health check failed:", error);
    return NextResponse.json({ error: "MongoDB connection failed." }, { status: 503 });
  }
}
