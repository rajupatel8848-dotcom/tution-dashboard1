"use client";
import { useMemo } from "react";
import Card from "@/components/ui/Card";
import LineChart from "@/components/charts/LineChart";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function StudentGrowth() {
  const { data, loading, error, reload } = useApiCollection("students");
  const series = useMemo(() => {
    const byMonth = new Map();
    data.forEach((student) => {
      const date = student.createdAt ? new Date(student.createdAt) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) || 0) + 1);
    });
    return [...byMonth.entries()].sort(([left], [right]) => left.localeCompare(right)).slice(-12);
  }, [data]);

  return (
    <Card title="Student registrations">
      {loading || error || !series.length
        ? <ApiStatus loading={loading} error={error} empty={!series.length && !loading && !error} onRetry={reload} />
        : <LineChart label="Student registrations by month" series={[{ data: series.map(([, count]) => count), color: "var(--pri)" }]} />}
    </Card>
  );
}
