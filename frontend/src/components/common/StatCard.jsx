export default function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-icon">{Icon ? <Icon size={22} aria-hidden="true" /> : null}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </article>
  );
}
