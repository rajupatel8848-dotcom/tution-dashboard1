"use client";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import DataTable from "@/components/ui/DataTable";
import BarChart from "@/components/charts/BarChart";
import ActionButton from "@/components/ui/ActionButton";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";
import { apiRequest } from "@/components/api/client";
import { inr } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";

const columns = [
  { key: "student", label: "Student", render: (r) => <b>{r.student}</b> },
  { key: "cls", label: "Class" },
  { key: "total", label: "Total Fee", render: (r) => inr(r.total) },
  { key: "paid", label: "Paid", render: (r) => inr(r.paid) },
  { key: "pending", label: "Pending", render: (r) => inr((Number(r.total) || 0) - (Number(r.paid) || 0)) },
  { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
];

export default function FeeOverview({ title = "Fee collection" }) {
  const { data: ledger, loading, error, reload } = useApiCollection("fees");
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  useEffect(() => {
    apiRequest("/api/dashboard").then(setSummary).catch((requestError) => setSummaryError(requestError.message));
  }, []);
  const monthly = useMemo(() => {
    const grouped = new Map();
    ledger.forEach((fee) => {
      if (!fee.month) return;
      grouped.set(fee.month, (grouped.get(fee.month) || 0) + (Number(fee.paid) || 0));
    });
    return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).slice(-9)
      .map(([month, value]) => ({ label: month, value }));
  }, [ledger]);
  const summaryItems = summary ? [
    { label: "Total Collected", value: inr(summary.fees.collected) },
    { label: "Pending", value: inr(summary.fees.pending) },
    { label: "Fee Records", value: String(ledger.length) },
  ] : [];

  return (
    <Card title={title} actions={<ActionButton primary message="Collect Fee opened">Collect Fee</ActionButton>}>
      <div className="fin">
        {summaryItems.map((f) => (
          <div key={f.label}>
            <span className="muted">{f.label}</span>
            <b>{f.value}</b>
          </div>
        ))}
      </div>
      {summaryError && <p role="alert" className="muted">{summaryError}</p>}
      {monthly.length > 0 && <BarChart data={monthly} max={Math.max(...monthly.map((item) => item.value), 1)} unit="" />}
      <div style={{ marginTop: 14 }}>
        <ApiStatus loading={loading} error={error} empty={!ledger.length && !loading && !error} onRetry={reload} />
        {!loading && !error && ledger.length > 0 && <DataTable columns={columns} rows={ledger} />}
      </div>
    </Card>
  );
}
