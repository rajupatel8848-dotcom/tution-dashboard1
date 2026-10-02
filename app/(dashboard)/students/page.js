import MiniStats from "@/components/ui/MiniStats";
import Toolbar from "@/components/ui/Toolbar";
import ActionButton from "@/components/ui/ActionButton";
import StudentsTable from "@/components/dashboard/StudentsTable";

export const metadata = { title: "Students · Tutora" };

export default function StudentsPage() {
  return (
    <>
      <MiniStats items={[["Total students", "1,248", "+8.4% this month"], ["Active", "1,190", "95.4%"], ["At risk", "58", "Low attendance or marks"], ["New this month", "98", "Admissions"]]} />
      <Toolbar filters={[{ label: "Class", options: ["All classes", "Class 9", "Class 10", "Class 11", "Class 12"] }, { label: "Status", options: ["Status: All", "Active", "At Risk"] }]}>
        <ActionButton primary icon="UserPlus">Add Student</ActionButton>
      </Toolbar>
      <StudentsTable title="All students" />
    </>
  );
}
