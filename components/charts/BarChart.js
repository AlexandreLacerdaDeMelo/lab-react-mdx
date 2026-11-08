export default function BarChart({ id, title, description, data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value));
  const width = 480;
  const height = 220;
  const barWidth = width / data.length;
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  return (
    <figure className="chart">
      <figcaption className="eyebrow">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={titleId} aria-describedby={descId}>
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        {data.map((d, i) => {
          const barHeight = max ? (d.value / max) * (height - 50) : 0;
          const x = i * barWidth + barWidth * 0.15;
          const y = height - 30 - barHeight;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barWidth * 0.7} height={barHeight} fill="var(--violet)" />
              <text x={x + barWidth * 0.35} y={height - 14} textAnchor="middle" fontSize="11" fill="var(--ink-soft)">
                {d.label}
              </text>
              <text x={x + barWidth * 0.35} y={y - 6} textAnchor="middle" fontSize="11" fill="var(--ink)">
                {d.value.toLocaleString("pt-BR")}{d.unit || ""}
              </text>
            </g>
          );
        })}
      </svg>
      <table className="chart-table">
        <caption className="visually-hidden">{title}</caption>
        <thead><tr><th scope="col">Item</th><th scope="col">Valor</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}><td>{d.label}</td><td>{d.value.toLocaleString("pt-BR")}{d.unit || ""}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
