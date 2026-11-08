export default function HorizontalBars({ id, title, description, data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value));
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  return (
    <figure className="chart">
      <figcaption className="eyebrow">{title}</figcaption>
      <svg viewBox={`0 0 320 ${data.length * 34}`} role="img" aria-labelledby={titleId} aria-describedby={descId}>
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        {data.map((d, i) => {
          const barLength = max ? (d.value / max) * 200 : 0;
          const y = i * 34;
          return (
            <g key={d.label}>
              <text x="0" y={y + 14} fontSize="11" fill="var(--ink-soft)">{d.label}</text>
              <rect x="0" y={y + 18} width={barLength} height="10" fill="var(--azure)" />
              <text x={barLength + 8} y={y + 26} fontSize="11" fill="var(--ink)">{d.value}{d.unit || ""}</text>
            </g>
          );
        })}
      </svg>
      <table className="chart-table">
        <caption className="visually-hidden">{title}</caption>
        <thead><tr><th scope="col">Categoria</th><th scope="col">Participação</th></tr></thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}><td>{d.label}</td><td>{d.value}{d.unit || ""}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
