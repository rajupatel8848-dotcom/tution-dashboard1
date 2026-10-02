import StatCard from "@/components/ui/StatCard";
import { STATS } from "@/data/dashboard";

export default function StatsGrid() {
  return (
    <div className="grid g4">
      {STATS.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}
