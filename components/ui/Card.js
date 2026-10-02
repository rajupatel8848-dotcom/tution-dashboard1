export default function Card({ title, actions, children, className = "", style }) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || actions) && (
        <div className="ch">
          {title && <h3>{title}</h3>}
          {actions && <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
