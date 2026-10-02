import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import { SUBJECTS, TOP_STUDENTS } from "@/data/dashboard";

export default function PerformanceSection() {
  return (
    <Card title="Performance">
      <b>Top performing students</b>
      {TOP_STUDENTS.map((t) => (
        <div className="cls" style={{ padding: "8px 0" }} key={t.name}>
          <div className="in"><b>{t.name}</b><div className="muted">Class {t.cls} · {t.attendance}% attendance</div></div>
          <b>{t.marks}%</b>
        </div>
      ))}
      <b style={{ display: "block", margin: "10px 0 6px" }}>Subjects</b>
      {SUBJECTS.map((s) => (
        <div key={s.name} style={{ marginBottom: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>{s.name}</span><span className="muted">{s.score}%</span></div>
          <ProgressBar value={s.score} />
        </div>
      ))}
    </Card>
  );
}
