/** data: [{ label, value }] */
export default function BarChart({ data, max, unit = "", barArea = 120 }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: barArea + 50 }}>
      {data.map((d) => (
        <div key={d.label} style={{ flex: 1, textAlign: "center" }} title={`${d.label}: ${d.value}${unit}`}>
          <div className="muted" style={{ fontSize: 11 }}>{d.value}{unit}</div>
          <div style={{ height: (d.value / max) * barArea, background: "var(--pri)", opacity: 0.5 + d.value / max / 2, borderRadius: "7px 7px 3px 3px", margin: "3px 0" }} />
          <span className="muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
