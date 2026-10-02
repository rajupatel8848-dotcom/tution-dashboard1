import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import MiniStats from "@/components/ui/MiniStats";
import ProgressBar from "@/components/ui/ProgressBar";
import ActionButton from "@/components/ui/ActionButton";
import AttendanceOverview from "@/components/dashboard/AttendanceOverview";
import { CLASS_PERFORMANCE } from "@/data/dashboard";
import { ABSENTEES } from "@/data/academics";

export const metadata = { title: "Attendance · Tutora" };

const columns = [
  { key: "student", label: "Student", render: (r) => <b>{r.student}</b> },
  { key: "cls", label: "Class" },
  { key: "reason", label: "Reason" },
  { key: "notified", label: "Parent notified", render: (r) => <Badge>{r.notified}</Badge> },
  { key: "action", label: "Action", render: (r) => <ActionButton message={`Calling parent of ${r.student}`}>Call parent</ActionButton> },
];

export default function AttendancePage() {
  return (
    <>
      <MiniStats items={[["Present today", "1,154", "92.5%"], ["Absent", "94", "7.5%"], ["Late", "21", "Arrived after 10 min"], ["Parents notified", "37", "By AI automation"]]} />
      <div className="grid g2">
        <AttendanceOverview />
        <Card title="By class">
          {CLASS_PERFORMANCE.map((c) => (
            <div key={c.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><b>{c.name}</b><span>{c.attendance}%</span></div>
              <ProgressBar value={c.attendance} />
            </div>
          ))}
        </Card>
      </div>
      <div className="mt">
        <Card title="Absent today" actions={<ActionButton primary icon="CalendarCheck" message="Attendance sheet opened">Mark Attendance</ActionButton>}>
          <DataTable columns={columns} rows={ABSENTEES} />
        </Card>
      </div>
    </>
  );
}
