"use client";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import Toolbar from "@/components/ui/Toolbar";
import ActionButton from "@/components/ui/ActionButton";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

const columns = [
  { key: "title", label: "Title", render: (a) => <b>{a.title}</b> },
  { key: "cls", label: "Class" },
  { key: "subject", label: "Subject" },
  { key: "due", label: "Due" },
  { key: "submitted", label: "Submitted" },
  { key: "status", label: "Status", render: (a) => <Badge>{a.status}</Badge> },
];

export default function AssignmentsPage() {
  const { data, loading, error, reload } = useApiCollection("assignments");
  return (
    <>
      <Toolbar filters={[{ label: "Class", options: ["All classes", "Class 9", "Class 10", "Class 11", "Class 12"] }, { label: "Subject", options: ["All subjects", "Physics", "Mathematics", "Chemistry", "English"] }]}>
        <ActionButton primary icon="FilePlus">Create Assignment</ActionButton>
      </Toolbar>
      <Card title="Assignments">
        <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
        {!loading && !error && data.length > 0 && <DataTable columns={columns} rows={data} />}
      </Card>
    </>
  );
}
