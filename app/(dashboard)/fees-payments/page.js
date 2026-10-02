"use client";
import MiniStats from "@/components/ui/MiniStats";
import FeeOverview from "@/components/dashboard/FeeOverview";
import useApiSummary from "@/components/api/useApiSummary";

export default function FeesPage() {
  const { data, error } = useApiSummary();
  const fees = data?.fees;
  const items = fees
    ? [["Collected", `₹${fees.collectedThisMonth.toLocaleString("en-IN")}`, "This month"], ["Pending", `₹${fees.pending.toLocaleString("en-IN")}`, `${fees.pendingRecords} records`], ["Total collected", `₹${fees.collected.toLocaleString("en-IN")}`, "All recorded payments"], ["Fee records", String(fees.recordCount ?? "—"), "In the ledger"]]
    : [["Collected", "—", "Loading"], ["Pending", "—", "Loading"], ["Total collected", "—", "Loading"], ["Fee records", "—", "Loading"]];
  return (
    <>
      {error && <p role="alert">{error}</p>}
      <MiniStats items={items} />
      <FeeOverview title="Collection trend & ledger" />
    </>
  );
}
