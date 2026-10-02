"use client";
import StatCard from "@/components/ui/StatCard";
import ApiStatus from "@/components/api/ApiStatus";
import { apiRequest } from "@/components/api/client";
import { useEffect, useState } from "react";

export default function StatsGrid() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/api/dashboard").then(setSummary).catch((requestError) => setError(requestError.message));
  }, []);

  if (!summary) return <ApiStatus loading={!error} error={error} />;
  const stats = [
    { icon: "GraduationCap", label: "Total Students", value: summary.students.total, note: `${summary.students.active} active` },
    { icon: "CalendarCheck", label: "Today's Attendance", value: summary.attendance.recorded ? `${summary.attendance.rate}%` : "—", note: `${summary.attendance.recorded} records` },
    { icon: "IndianRupee", label: "Pending Fees", value: `₹${summary.fees.pending.toLocaleString("en-IN")}`, note: `${summary.fees.pendingRecords} records`, up: false },
    { icon: "Wallet", label: "Collected This Month", value: `₹${summary.fees.collectedThisMonth.toLocaleString("en-IN")}`, note: "From recorded payments" },
  ];
  return (
    <div className="grid g4">
      {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>
  );
}
