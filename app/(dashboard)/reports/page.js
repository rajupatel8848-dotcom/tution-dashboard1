import Card from "@/components/ui/Card";
import Toolbar from "@/components/ui/Toolbar";
import ActionButton from "@/components/ui/ActionButton";
import { REPORT_TYPES } from "@/data/academics";

export const metadata = { title: "Reports & Analytics · Tutora" };

export default function ReportsPage() {
  return (
    <>
      <Toolbar
        filters={[
          { label: "Date", options: ["This month", "Last month", "This quarter", "This year"] },
          { label: "Class", options: ["All classes", "Class 9", "Class 10", "Class 11", "Class 12"] },
          { label: "Batch", options: ["All batches", "12-A", "12-B", "11-A", "10-A"] },
          { label: "Teacher", options: ["All teachers", "Mr. Rajesh Kumar", "Ms. Anita Desai"] },
        ]}
      />
      <div className="grid g3">
        {REPORT_TYPES.map((r) => (
          <Card key={r} title={`${r} Report`}>
            <p className="muted">Filter by date, class, batch and teacher.</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <ActionButton primary message={`Generating ${r} report…`}>View Report</ActionButton>
              <ActionButton icon="Download" message="PDF downloaded">PDF</ActionButton>
              <ActionButton icon="Download" message="Excel exported">Excel</ActionButton>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
