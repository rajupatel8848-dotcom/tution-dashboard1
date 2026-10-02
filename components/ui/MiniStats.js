export default function MiniStats({ items }) {
  return (
    <div className="grid g4" style={{ marginBottom: 16 }}>
      {items.map(([label, value, sub]) => (
        <div className="card stat" key={label}>
          <span className="muted">{label}</span>
          <span className="v">{value}</span>
          <span className="muted">{sub}</span>
        </div>
      ))}
    </div>
  );
}
