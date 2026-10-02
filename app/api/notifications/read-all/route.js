import { NextResponse } from "next/server";
import { hasValidSession, isSameOrigin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request) {
  if (!hasValidSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const result = await (await getDatabase()).collection("notifications")
      .updateMany({ read: { $ne: true } }, { $set: { read: true } });
    return NextResponse.json({ data: { updated: result.modifiedCount } });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}
