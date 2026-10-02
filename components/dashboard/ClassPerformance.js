"use client";
import { useMemo } from "react";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function ClassPerformance() {
  const { data, loading, error, reload } = useApiCollection("students");
  const classes = useMemo(() => {
    const groups = new Map();
    data.forEach((student) => {
      if (!student.cls) return;
      const group = groups.get(student.cls) || {
        name: student.cls,
        marks: 0,
        marksCount: 0,
        attendance: 0,
        attendanceCount: 0,
        students: 0,
      };
      if (student.performance !== undefined && Number.isFinite(Number(student.performance))) {
        group.marks += Number(student.performance);
        group.marksCount += 1;
      }
      if (student.attendance !== undefined && Number.isFinite(Number(student.attendance))) {
        group.attendance += Number(student.attendance);
        group.attendanceCount += 1;
      }
      group.students += 1;
      groups.set(student.cls, group);
    });
    return [...groups.values()].map((group) => ({
      ...group,
      marks: group.marksCount ? Math.round(group.marks / group.marksCount) : null,
      attendance: group.attendanceCount ? Math.round(group.attendance / group.attendanceCount) : null,
    }));
  }, [data]);

  return (
    <Card title="Class performance">
      {loading || error || !classes.length
        ? <ApiStatus loading={loading} error={error} empty={!classes.length && !loading && !error} onRetry={reload} />
        : classes.map((c) => (
        <div key={c.name} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <b>{c.name}</b>
            <span className="muted">{c.students} students · {c.attendance === null ? "No attendance data" : `${c.attendance}% attendance`}</span>
          </div>
          {c.marks !== null
            ? <><ProgressBar value={c.marks} /><span className="muted">Avg marks {c.marks}%</span></>
            : <span className="muted">No performance data</span>}
        </div>
      ))}
    </Card>
  );
}
