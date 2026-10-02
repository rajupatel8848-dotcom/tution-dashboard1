import { NextResponse } from "next/server";
import { hasValidSession, isSameOrigin } from "@/lib/auth";
import { indiaDateKey } from "@/lib/date";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request) {
  if (!hasValidSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must contain valid JSON." }, { status: 400 });
  }
  if (typeof body.question !== "string" || !body.question.trim() || body.question.length > 500) {
    return NextResponse.json({ error: "Enter a question of up to 500 characters." }, { status: 400 });
  }

  try {
    const database = await getDatabase();
    const question = body.question.toLowerCase();
    const today = indiaDateKey();
    let text;
    if (question.includes("absent")) {
      const absent = await database.collection("attendance").countDocuments({ date: today, status: "Absent" });
      text = `${absent} students are recorded as absent today.`;
    } else if (question.includes("fee")) {
      const [result] = await database.collection("fees").aggregate([
        { $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$total", 0] } },
          paid: { $sum: { $ifNull: ["$paid", 0] } },
        } },
      ]).toArray();
      const pending = Math.max(0, (result?.total || 0) - (result?.paid || 0));
      text = `Recorded unpaid fees total ₹${pending.toLocaleString("en-IN")}.`;
    } else if (question.includes("student")) {
      const count = await database.collection("students").countDocuments();
      text = `${count} student records are currently stored.`;
    } else if (question.includes("teacher")) {
      const count = await database.collection("teachers").countDocuments();
      text = `${count} teacher records are currently stored.`;
    } else {
      text = "I can currently look up recorded student and teacher counts, today's absences, and unpaid fees.";
    }
    return NextResponse.json({ data: { text } });
  } catch (error) {
    console.error("Assistant data query failed:", error);
    return NextResponse.json({ error: "Could not query dashboard data." }, { status: 500 });
  }
}
