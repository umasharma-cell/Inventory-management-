export default function BarChart({ title, description, data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="chart-panel">
      <div className="section-title">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="bar-chart">
        {data.map((item) => {
          const height = Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0);
          return (
            <div className="bar-item" key={item.label}>
              <div className="bar-track">
                <div className="bar-fill" style={{ height: `${height}%` }} />
              </div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
