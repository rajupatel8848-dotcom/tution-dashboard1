"use client";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import MiniStats from "@/components/ui/MiniStats";
import ActionButton from "@/components/ui/ActionButton";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

const columns = [
  { key: "name", label: "Teacher", render: (t) => <b>{t.name}</b> },
  { key: "subject", label: "Subject" },
  { key: "batches", label: "Batches" },
  { key: "students", label: "Students" },
  { key: "rating", label: "Rating", render: (t) => `⭐ ${t.rating}` },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status", render: (t) => <Badge>{t.status}</Badge> },
  { key: "action", label: "Action", render: (t) => <ActionButton message={`Message sent to ${t.name}`}>Message</ActionButton> },
];

export default function TeachersPage() {
  const { data, loading, error, reload } = useApiCollection("teachers");
  const active = data.filter((teacher) => teacher.status === "Active").length;
  const rated = data.filter((teacher) => Number.isFinite(Number(teacher.rating)));
  const averageRating = rated.length ? (rated.reduce((total, teacher) => total + Number(teacher.rating), 0) / rated.length).toFixed(1) : "—";
  return (
    <>
      <MiniStats items={[["Teachers", String(data.length), "Recorded"], ["Active", String(active), "Current status"], ["Avg. rating", averageRating, `${rated.length} ratings`], ["Subjects", String(new Set(data.map((teacher) => teacher.subject).filter(Boolean)).size), "Recorded"]]} />
      <Card title="Faculty" actions={<ActionButton primary icon="UserPlus">Add Teacher</ActionButton>}>
        <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
        {!loading && !error && data.length > 0 && <DataTable columns={columns} rows={data} />}
      </Card>
    </>
  );
}
