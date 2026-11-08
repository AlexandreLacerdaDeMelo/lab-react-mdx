export default function Callout({ title, children }) {
  return (
    <aside className="callout">
      <strong className="eyebrow">{title}</strong>
      <div>{children}</div>
    </aside>
  );
}
