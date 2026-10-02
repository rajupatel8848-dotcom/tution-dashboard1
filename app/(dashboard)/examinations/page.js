import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import MiniStats from "@/components/ui/MiniStats";
import ActionButton from "@/components/ui/ActionButton";
import PerformanceSection from "@/components/dashboard/PerformanceSection";
import { EXAMS } from "@/data/academics";

export const metadata = { title: "Examinations · Tutora" };

const columns = [
  { key: "exam", label: "Exam", render: (e) => <b>{e.exam}</b> },
  { key: "cls", label: "Class" },
  { key: "date", label: "Date" },
  { key: "room", label: "Room" },
  { key: "marks", label: "Marks" },
];

export default function ExaminationsPage() {
  return (
    <>
      <MiniStats items={[["Upcoming", "6", "Next 2 weeks"], ["Completed", "14", "This term"], ["Avg. score", "76%", "+2.1% vs last term"], ["Pass rate", "94%", "All classes"]]} />
      <div className="grid g2">
        <Card title="Exam schedule" actions={<ActionButton primary icon="ClipboardList">Schedule Exam</ActionButton>}>
          <DataTable columns={columns} rows={EXAMS} />
        </Card>
        <PerformanceSection />
      </div>
    </>
  );
}
