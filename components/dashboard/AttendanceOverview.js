import Card from "@/components/ui/Card";
import BarChart from "@/components/charts/BarChart";
import { ATTENDANCE_WEEK } from "@/data/dashboard";

export default function AttendanceOverview() {
  return (
    <Card title="Attendance overview">
      <BarChart data={ATTENDANCE_WEEK} max={100} unit="%" />
    </Card>
  );
}
