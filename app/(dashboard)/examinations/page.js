"use client";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import MiniStats from "@/components/ui/MiniStats";
import ActionButton from "@/components/ui/ActionButton";
import PerformanceSection from "@/components/dashboard/PerformanceSection";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

const columns = [
  { key: "exam", label: "Exam", render: (e) => <b>{e.exam}</b> },
  { key: "cls", label: "Class" },
  { key: "date", label: "Date" },
  { key: "room", label: "Room" },
  { key: "marks", label: "Marks" },
];

export default function ExaminationsPage() {
  const { data, loading, error, reload } = useApiCollection("exams");
  const upcoming = data.filter((exam) => {
    const date = new Date(exam.date);
    return !Number.isNaN(date.getTime()) && date >= new Date();
  }).length;
  return (
    <>
      <MiniStats items={[["Scheduled", String(data.length), "Recorded exams"], ["Upcoming", String(upcoming), "Based on exam dates"], ["Completed", String(data.length - upcoming), "Based on exam dates"], ["Avg. marks", data.length ? String(Math.round(data.reduce((sum, exam) => sum + (Number(exam.marks) || 0), 0) / data.length)) : "—", "Recorded exams"]]} />
      <div className="grid g2">
        <Card title="Exam schedule" actions={<ActionButton primary icon="ClipboardList">Schedule Exam</ActionButton>}>
          <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
          {!loading && !error && data.length > 0 && <DataTable columns={columns} rows={data} />}
        </Card>
        <PerformanceSection />
      </div>
    </>
  );
}
