import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/auth";
import { indiaDateKey } from "@/lib/date";
import { getDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(request) {
  if (!hasValidSession(request)) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const database = await getDatabase();
    const dateKey = indiaDateKey();
    const monthKey = dateKey.slice(0, 7);
    const [studentCount, activeStudentCount, todayAttendance, feeTotals, feeRecordCount, teacherCount, batchCount] = await Promise.all([
      database.collection("students").countDocuments(),
      database.collection("students").countDocuments({ status: "Active" }),
      database.collection("attendance").find({ date: dateKey }).toArray(),
      database.collection("fees").aggregate([
        { $group: {
          _id: null,
          total: { $sum: { $ifNull: ["$total", 0] } },
          paid: { $sum: { $ifNull: ["$paid", 0] } },
          monthPaid: {
            $sum: { $cond: [{ $eq: ["$month", monthKey] }, { $ifNull: ["$paid", 0] }, 0] },
          },
          pendingRecords: { $sum: { $cond: [{ $lt: ["$paid", "$total"] }, 1, 0] } },
        } },
      ]).toArray(),
      database.collection("fees").countDocuments(),
      database.collection("teachers").countDocuments(),
      database.collection("batches").countDocuments(),
    ]);
    const totals = feeTotals[0] || { total: 0, paid: 0, monthPaid: 0, pendingRecords: 0 };
    const presentCount = todayAttendance.filter((record) => record.status === "Present").length;
    const absentCount = todayAttendance.filter((record) => record.status === "Absent").length;

    return NextResponse.json({ data: {
      students: { total: studentCount, active: activeStudentCount },
      attendance: {
        date: dateKey,
        recorded: todayAttendance.length,
        present: presentCount,
        absent: absentCount,
        rate: todayAttendance.length ? Math.round((presentCount / todayAttendance.length) * 1000) / 10 : 0,
      },
      fees: {
        total: totals.total,
        collected: totals.paid,
        collectedThisMonth: totals.monthPaid,
        pending: Math.max(0, totals.total - totals.paid),
        pendingRecords: totals.pendingRecords,
        recordCount: feeRecordCount,
      },
      teachers: { total: teacherCount },
      batches: { total: batchCount },
    } });
  } catch (error) {
    console.error("Failed to load dashboard metrics:", error);
    return NextResponse.json({ error: "Database request failed." }, { status: 500 });
  }
}
