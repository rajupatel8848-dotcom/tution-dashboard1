"use client";
import { useMemo } from "react";
import Card from "@/components/ui/Card";
import BarChart from "@/components/charts/BarChart";
import ApiStatus from "@/components/api/ApiStatus";
import useApiCollection from "@/components/api/useApiCollection";

export default function AttendanceOverview() {
  const { data, loading, error, reload } = useApiCollection("attendance");
  const chartData = useMemo(() => {
    const grouped = new Map();
    for (const record of data) {
      if (!record.date) continue;
      const day = new Date(`${record.date}T00:00:00`).toLocaleDateString("en", { weekday: "short" });
      const current = grouped.get(record.date) || { label: day, total: 0, present: 0 };
      current.total += 1;
      if (record.status === "Present") current.present += 1;
      grouped.set(record.date, current);
    }
    return [...grouped.values()].slice(-7).map((day) => ({
      label: day.label,
      value: Math.round((day.present / day.total) * 100),
    }));
  }, [data]);

  return (
    <Card title="Attendance overview">
      {loading || error || !chartData.length
        ? <ApiStatus loading={loading} error={error} empty={!chartData.length && !loading && !error} onRetry={reload} />
        : <BarChart data={chartData} max={100} unit="%" />}
    </Card>
  );
}
