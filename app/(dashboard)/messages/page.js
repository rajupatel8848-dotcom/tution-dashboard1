"use client";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import ActionButton from "@/components/ui/ActionButton";
import AiMessageCenter from "@/components/dashboard/AiMessageCenter";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

const columns = [
  { key: "title", label: "Title", render: (a) => <b>{a.title}</b> },
  { key: "audience", label: "Audience" },
  { key: "sent", label: "Sent" },
];

export default function MessagesPage() {
  const { data, loading, error, reload } = useApiCollection("announcements");
  return (
    <div className="grid g2">
      <AiMessageCenter />
      <Card title="Announcements" actions={<ActionButton primary icon="Megaphone" message="Send Announcement opened">New announcement</ActionButton>}>
        <ApiStatus loading={loading} error={error} empty={!data.length && !loading && !error} onRetry={reload} />
        {!loading && !error && data.length > 0 && <DataTable columns={columns} rows={data} minWidth={380} />}
      </Card>
    </div>
  );
}
