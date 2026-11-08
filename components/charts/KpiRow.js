export default function KpiRow({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="kpi-row">
      {items.map((item) => (
        <li className="card kpi" key={item.label}>
          <p className="kpi-value">
            {item.value.toLocaleString("pt-BR")}
            {item.unit || ""}
          </p>
          <p className="eyebrow">{item.label}</p>
        </li>
      ))}
    </ul>
  );
}
