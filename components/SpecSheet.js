export default function SpecSheet({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <dl className="spec-sheet">
      {items.map(({ key, value }) => (
        <div className="spec-row" key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
