"use client";
import { useState } from "react";
import Card from "@/components/ui/Card";
import SegmentedControl from "@/components/ui/SegmentedControl";
import LineChart from "@/components/charts/LineChart";
import { GROWTH } from "@/data/dashboard";

export default function StudentGrowth() {
  const ranges = Object.keys(GROWTH);
  const [range, setRange] = useState(ranges[0]);
  const { total, added } = GROWTH[range];

  return (
    <Card
      title="Student growth"
      actions={<SegmentedControl label="Date range" options={ranges} value={range} onChange={setRange} />}
    >
      <p className="muted" style={{ margin: "0 0 8px" }}>
        <span style={{ color: "var(--pri)" }}>●</span> Total students &nbsp; <span style={{ color: "#e08a1e" }}>●</span> New students
      </p>
      <LineChart
        label={`Student growth, ${range}`}
        series={[{ data: total, color: "var(--pri)" }, { data: added, color: "#e08a1e", dashed: true }]}
      />
    </Card>
  );
}
