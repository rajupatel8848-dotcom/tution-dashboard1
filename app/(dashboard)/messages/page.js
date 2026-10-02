import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import ActionButton from "@/components/ui/ActionButton";
import AiMessageCenter from "@/components/dashboard/AiMessageCenter";
import { ANNOUNCEMENTS } from "@/data/academics";

export const metadata = { title: "Messages · Tutora" };

const columns = [
  { key: "title", label: "Title", render: (a) => <b>{a.title}</b> },
  { key: "audience", label: "Audience" },
  { key: "sent", label: "Sent" },
];

export default function MessagesPage() {
  return (
    <div className="grid g2">
      <AiMessageCenter />
      <Card title="Announcements" actions={<ActionButton primary icon="Megaphone" message="Send Announcement opened">New announcement</ActionButton>}>
        <DataTable columns={columns} rows={ANNOUNCEMENTS} minWidth={380} />
      </Card>
    </div>
  );
}
