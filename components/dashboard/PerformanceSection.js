"use client";
import { useMemo } from "react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function PerformanceSection() {
  const { data, loading, error, reload } = useApiCollection("students");
  const topStudents = useMemo(() => [...data]
    .filter((student) => Number.isFinite(Number(student.performance)))
    .sort((left, right) => Number(right.performance) - Number(left.performance))
    .slice(0, 5), [data]);

  return (
    <Card title="Performance">
      <b>Top performing students</b>
      <ApiStatus loading={loading} error={error} empty={!topStudents.length && !loading && !error} onRetry={reload} />
      {topStudents.map((student) => (
        <div className="cls" style={{ padding: "8px 0" }} key={student.id}>
          <div className="in"><b>{student.name}</b><div className="muted">{student.cls || "Class not set"} · {Number(student.attendance) || 0}% attendance</div></div>
          <b>{Number(student.performance) || 0}%</b>
        </div>
      ))}
      {topStudents.length > 0 && <ProgressBar value={Number(topStudents[0].performance) || 0} />}
    </Card>
  );
}
