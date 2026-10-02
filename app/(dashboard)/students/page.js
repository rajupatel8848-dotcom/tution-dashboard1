"use client";
import { useMemo } from "react";
import MiniStats from "@/components/ui/MiniStats";
import Toolbar from "@/components/ui/Toolbar";
import ActionButton from "@/components/ui/ActionButton";
import StudentsTable from "@/components/dashboard/StudentsTable";
import useApiCollection from "@/components/api/useApiCollection";
import ApiStatus from "@/components/api/ApiStatus";

export default function StudentsPage() {
  const { data, loading, error, reload } = useApiCollection("students");
  const active = data.filter((student) => student.status === "Active").length;
  const atRisk = data.filter((student) => student.status === "At Risk").length;
  const newThisMonth = useMemo(() => data.filter((student) => {
    const date = new Date(student.createdAt);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length, [data]);
  return (
    <>
      <ApiStatus loading={loading} error={error} onRetry={reload} />
      <MiniStats items={[["Total students", String(data.length), "Recorded"], ["Active", String(active), "Current status"], ["At risk", String(atRisk), "Current status"], ["New this month", String(newThisMonth), "From admission dates"]]} />
      <Toolbar filters={[{ label: "Class", options: ["All classes", "Class 9", "Class 10", "Class 11", "Class 12"] }, { label: "Status", options: ["Status: All", "Active", "At Risk"] }]}>
        <ActionButton primary icon="UserPlus">Add Student</ActionButton>
      </Toolbar>
      <StudentsTable title="All students" />
    </>
  );
}
