/** series: [{ data: number[], color, dashed? }] */
export default function LineChart({ series, label = "Line chart", W = 560, H = 200, pad = 26 }) {
  const max = Math.max(1, ...series.flatMap((s) => s.data));
  const pts = (d) => d.map((v, i) => [
    d.length === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (d.length - 1),
    H - pad - (v / max) * (H - 2 * pad),
  ]);
  const path = (d) => pts(d).map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label}>
      {[0, 1, 2, 3].map((i) => {
        const y = pad + (i * (H - 2 * pad)) / 3;
        return <line key={i} x1={pad} x2={W - pad} y1={y} y2={y} stroke="var(--line)" />;
      })}
      {series.map((s, i) => (
        <g key={i}>
          <path d={path(s.data)} fill="none" stroke={s.color} strokeWidth="2.5" strokeDasharray={s.dashed ? "5 4" : undefined} />
          {!s.dashed && pts(s.data).map((p, j) => <circle key={j} cx={p[0]} cy={p[1]} r="3.5" fill={s.color} />)}
        </g>
      ))}
    </svg>
  );
}
