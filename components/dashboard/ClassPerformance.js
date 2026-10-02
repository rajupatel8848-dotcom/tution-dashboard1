import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { CLASS_PERFORMANCE } from "@/data/dashboard";

export default function ClassPerformance() {
  return (
    <Card title="Class performance">
      {CLASS_PERFORMANCE.map((c) => (
        <div key={c.name} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <b>{c.name}</b>
            <span className="muted">{c.students} students · {c.attendance}% attendance</span>
          </div>
          <ProgressBar value={c.marks} />
          <span className="muted">Avg marks {c.marks}%</span>
        </div>
      ))}
    </Card>
  );
}
