import Icon from "./Icon";

export default function EmptyState({ icon = "SearchX", title, text }) {
  return (
    <div className="empty">
      <Icon name={icon} size={34} style={{ color: "var(--pri)" }} />
      {title && <h3 style={{ margin: "8px 0 4px", color: "var(--ink)" }}>{title}</h3>}
      <p>{text}</p>
    </div>
  );
}
