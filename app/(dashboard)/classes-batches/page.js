import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Toolbar from "@/components/ui/Toolbar";
import ActionButton from "@/components/ui/ActionButton";
import { BATCHES } from "@/data/batches";

export const metadata = { title: "Classes & Batches · Tutora" };

export default function BatchesPage() {
  return (
    <>
      <Toolbar filters={[{ label: "Class", options: ["All classes", "Class 9", "Class 10", "Class 11", "Class 12"] }]}>
        <ActionButton primary icon="Layers">Create Batch</ActionButton>
      </Toolbar>
      <div className="grid g3">
        {BATCHES.map((b) => (
          <Card key={b.id} title={b.name} actions={<Badge tone="ok">Active</Badge>}>
            <p className="muted" style={{ margin: "0 0 8px" }}>{b.subjects} · {b.teacher}</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>{b.time}</span><b>{b.seats} seats</b></div>
            <div className="muted" style={{ margin: "8px 0 4px" }}>Attendance {b.attendance}%</div>
            <ProgressBar value={b.attendance} />
          </Card>
        ))}
      </div>
    </>
  );
}
