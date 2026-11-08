import { notFound } from "next/navigation";
import EditorialContent from "@/components/EditorialContent";
import { getContent, listContent } from "@/lib/content.mjs";

export async function generateStaticParams() {
  return (await listContent("paginas")).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = await getContent("paginas", slug);
  return doc ? { title: doc.frontmatter.title, description: doc.frontmatter.lead } : { title: "Página não encontrada" };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const doc = await getContent("paginas", slug);
  if (!doc) notFound();
  return (
    <article>
      <p className="eyebrow">Aurora Studio</p>
      <h1>{doc.frontmatter.title}</h1>
      <p className="lead">{doc.frontmatter.lead}</p>
      <EditorialContent source={doc.content} />
    </article>
  );
}
