import Link from "next/link";
import { stripSection } from "@/lib/sections.js";
import { summarize } from "@/lib/summary.mjs";
import { areaLabel, areaColorVar } from "@/lib/areas.mjs";

export default function TeamListItem({ slug, frontmatter, content }) {
  const { name, position, secondary_position, area, summary, image, alt } = frontmatter;
  const resumo = summary || summarize(stripSection(content, "Perfil rápido"), { maxChars: 140 });
  return (
    <li className="member" data-slug={slug} data-area={area || ""} style={{ "--current-area-color": areaColorVar(area) }}>
      {image && (
        <div className="frame portrait">
          <img src={image} alt={alt || ""} />
        </div>
      )}
      <div className="member-body">
        <div className="area-stripe" />
        <h3><Link href={`/equipe/${slug}`}>{name}</Link></h3>
        <p className="eyebrow">{position}</p>
        {secondary_position && <p className="meta">{secondary_position}</p>}
        <span className="area-label">{areaLabel(area)}</span>
        {resumo && <p>{resumo}</p>}
      </div>
    </li>
  );
}
