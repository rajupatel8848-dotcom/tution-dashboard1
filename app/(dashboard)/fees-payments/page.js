import MiniStats from "@/components/ui/MiniStats";
import FeeOverview from "@/components/dashboard/FeeOverview";

export const metadata = { title: "Fees & Payments · Tutora" };

export default function FeesPage() {
  return (
    <>
      <MiniStats items={[["Collected", "₹8,45,000", "This month"], ["Pending", "₹1,24,500", "68 students"], ["Overdue", "₹48,200", "12 students"], ["Refunds", "₹12,000", "3 students"]]} />
      <FeeOverview title="Collection trend & ledger" />
    </>
  );
}
