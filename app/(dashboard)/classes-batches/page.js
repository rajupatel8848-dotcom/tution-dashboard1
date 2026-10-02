"use client";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import Toolbar from "@/components/ui/Toolbar";
import ActionButton from "@/components/ui/ActionButton";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function BatchesPage() {
  const { data, loading, error, reload } = useApiCollection("batches");
  return (
    <>
      <Toolbar filters={[{ label: "Class", options: ["All classes", "Class 9", "Class 10", "Class 11", "Class 12"] }]}>
        <ActionButton primary icon="Layers">Create Batch</ActionButton>
      </Toolbar>
      <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
      <div className="grid g3">
        {!loading && !error && data.map((b) => (
          <Card key={b.id} title={b.name} actions={b.status ? <Badge tone="ok">{b.status}</Badge> : null}>
            <p className="muted" style={{ margin: "0 0 8px" }}>{b.subjects || "Subjects not assigned"} · {b.teacher || "Teacher not assigned"}</p>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>{b.time || "Time not set"}</span><b>{b.seats || "Seats not set"} seats</b></div>
            {Number.isFinite(Number(b.attendance)) && <><div className="muted" style={{ margin: "8px 0 4px" }}>Attendance {b.attendance}%</div><ProgressBar value={Number(b.attendance)} /></>}
          </Card>
        ))}
      </div>
    </>
  );
}
