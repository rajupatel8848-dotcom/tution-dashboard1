/** filters: [{ label, options: [] }] — presentational for now; wire to query params later. */
export default function Toolbar({ filters = [], children }) {
  return (
    <div className="toolbar">
      {filters.map((f) => (
        <select key={f.label} className="sel" aria-label={f.label} defaultValue={f.options[0]}>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ))}
      <span className="sp" />
      {children}
    </div>
  );
}
