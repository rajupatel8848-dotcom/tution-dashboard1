"use client";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import ActionButton from "@/components/ui/ActionButton";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function TodaysClasses() {
  const { data, loading, error, reload } = useApiCollection("classes");
  return (
    <Card title="Classes and batches">
      <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
      {!loading && !error && data.map((c) => (
        <div className="cls" key={c.id}>
          <span className="tm">{c.time || "—"}</span>
          <div className="in">
            <b>{c.subject}</b> <Badge>{c.status || "Scheduled"}</Badge>
            <div className="muted">{c.teacher || "Teacher not assigned"} · {c.batch} · Room {c.room || "—"} · {c.students || 0} students</div>
          </div>
          <ActionButton message={`Opening ${c.subject} · ${c.batch}`}>View Class</ActionButton>
        </div>
      ))}
    </Card>
  );
}
