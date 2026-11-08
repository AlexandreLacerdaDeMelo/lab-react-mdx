import Link from "next/link";

export default function ProductCard({ slug, frontmatter }) {
  const { name, category, description, image, alt } = frontmatter;
  return (
    <li className="card">
      {image && <div className="frame"><img src={image} alt={alt || ""} /></div>}
      <p className="eyebrow">{category}</p>
      <h3><Link href={`/produtos/${slug}`}>{name}</Link></h3>
      <p>{description}</p>
    </li>
  );
}