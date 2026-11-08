export default function DonutChart({ id, title, description, data, colors }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  let offset = 0;

  return (
    <figure className="chart">
      <figcaption className="eyebrow">{title}</figcaption>
      <svg viewBox="0 0 160 160" role="img" aria-labelledby={titleId} aria-describedby={descId}>
        <title id={titleId}>{title}</title>
        <desc id={descId}>{description}</desc>
        <g transform="translate(80 80) rotate(-90)">
          {data.map((d, i) => {
            const fraction = total ? d.value / total : 0;
            const length = fraction * circumference;
            const dasharray = `${length} ${circumference - length}`;
            const circle = (
              <circle
                key={d.label}
                r={radius}
                fill="none"
                stroke={colors?.[i] || "var(--area-neutra)"}
                strokeWidth="24"
                strokeDasharray={dasharray}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </g>
        <text x="80" y="84" textAnchor="middle" fontSize="20" fill="var(--ink)">{total}</text>
      </svg>
      <ul className="chart-legend">
        {data.map((d, i) => (
          <li key={d.label}>
            <span className="legend-dot" style={{ background: colors?.[i] || "var(--area-neutra)" }} />
            {d.label}: {d.value}
          </li>
        ))}
      </ul>
    </figure>
  );
}
