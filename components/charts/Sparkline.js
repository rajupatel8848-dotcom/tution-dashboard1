export default function Sparkline({ data, width = 64, height = 26 }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i * width) / (data.length - 1)},${height - 2 - (v / max) * (height - 4)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline fill="none" stroke="var(--pri)" strokeWidth="2" points={pts} />
    </svg>
  );
}
