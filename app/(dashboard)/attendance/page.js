"use client";
import { useMemo } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import MiniStats from "@/components/ui/MiniStats";
import ProgressBar from "@/components/ui/ProgressBar";
import ActionButton from "@/components/ui/ActionButton";
import AttendanceOverview from "@/components/dashboard/AttendanceOverview";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";
import { indiaDateKey } from "@/lib/date";

const columns = [
  { key: "student", label: "Student", render: (r) => <b>{r.student}</b> },
  { key: "cls", label: "Class" },
  { key: "reason", label: "Reason" },
  { key: "notified", label: "Parent notified", render: (r) => <Badge>{r.notified}</Badge> },
  { key: "action", label: "Action", render: (r) => <ActionButton message={`Calling parent of ${r.student}`}>Call parent</ActionButton> },
];

export default function AttendancePage() {
  const { data, loading, error, reload } = useApiCollection("attendance");
  const { data: students } = useApiCollection("students");
  const today = indiaDateKey();
  const records = data.filter((record) => record.date === today);
  const absent = records.filter((record) => record.status === "Absent");
  const present = records.filter((record) => record.status === "Present");
  const late = records.filter((record) => record.status === "Late");
  const notified = records.filter((record) => record.notified === "Sent").length;
  const classes = useMemo(() => {
    const totals = new Map();
    students.forEach((student) => {
      if (!student.cls) return;
      const group = totals.get(student.cls) || { name: student.cls, total: 0, attendance: 0, attendanceCount: 0 };
      group.total += 1;
      if (student.attendance !== undefined && Number.isFinite(Number(student.attendance))) {
        group.attendance += Number(student.attendance);
        group.attendanceCount += 1;
      }
      totals.set(student.cls, group);
    });
    return [...totals.values()].map((group) => ({
      ...group,
      attendance: group.attendanceCount ? Math.round(group.attendance / group.attendanceCount) : null,
    }));
  }, [students]);

  return (
    <>
      <MiniStats items={[["Present today", String(present.length), `${records.length ? Math.round((present.length / records.length) * 100) : 0}% of records`], ["Absent", String(absent.length), "Today"], ["Late", String(late.length), "Today"], ["Parents notified", String(notified), "Today"]]} />
      <div className="grid g2">
        <AttendanceOverview />
        <Card title="By class">
          {classes.map((c) => (
            <div key={c.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><b>{c.name}</b><span>{c.attendance === null ? "—" : `${c.attendance}%`}</span></div>
              {c.attendance !== null && <ProgressBar value={c.attendance} />}
            </div>
          ))}
          {!classes.length && <p className="muted">No class attendance data is available.</p>}
        </Card>
      </div>
      <div className="mt">
        <Card title="Absent today" actions={<ActionButton primary icon="CalendarCheck" message="Attendance sheet opened">Mark Attendance</ActionButton>}>
          <ApiStatus loading={loading} error={error} empty={!absent.length && !loading && !error} onRetry={reload} />
          {!loading && !error && absent.length > 0 && <DataTable columns={columns} rows={absent} />}
        </Card>
      </div>
    </>
  );
}
