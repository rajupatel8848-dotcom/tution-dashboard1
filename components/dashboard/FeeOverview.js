import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import BarChart from "@/components/charts/BarChart";
import ActionButton from "@/components/ui/ActionButton";
import { FEE_LEDGER, FEE_MONTHLY, FEE_SUMMARY } from "@/data/fees";
import { inr } from "@/lib/format";

const columns = [
  { key: "student", label: "Student", render: (r) => <b>{r.student}</b> },
  { key: "cls", label: "Class" },
  { key: "total", label: "Total Fee", render: (r) => inr(r.total) },
  { key: "paid", label: "Paid", render: (r) => inr(r.paid) },
  { key: "pending", label: "Pending", render: (r) => inr(r.total - r.paid) },
  { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
];

export default function FeeOverview({ title = "Fee collection" }) {
  return (
    <Card title={title} actions={<ActionButton primary message="Collect Fee opened">Collect Fee</ActionButton>}>
      <div className="fin">
        {FEE_SUMMARY.map((f) => (
          <div key={f.label}>
            <span className="muted">{f.label}</span>
            <b style={f.bad ? { color: "var(--bad)" } : undefined}>{f.value}</b>
          </div>
        ))}
      </div>
      <BarChart data={FEE_MONTHLY} max={9} unit="L" />
      <div style={{ marginTop: 14 }}>
        <DataTable columns={columns} rows={FEE_LEDGER} />
      </div>
    </Card>
  );
}
