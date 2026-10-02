import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import MiniStats from "@/components/ui/MiniStats";
import ActionButton from "@/components/ui/ActionButton";
import { TEACHERS } from "@/data/teachers";

export const metadata = { title: "Teachers · Tutora" };

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
  return (
    <>
      <MiniStats items={[["Teachers", "24", "6 subjects"], ["Present today", "22", "91.7%"], ["Avg. rating", "4.6/5", "From 1,120 reviews"], ["Classes today", "36", "4 live now"]]} />
      <Card title="Faculty" actions={<ActionButton primary icon="UserPlus">Add Teacher</ActionButton>}>
        <DataTable columns={columns} rows={TEACHERS} />
      </Card>
    </>
  );
}
