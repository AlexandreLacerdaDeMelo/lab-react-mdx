import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { buildSearchIndex, productCategories } from "@/lib/searchIndex.server.mjs";

export default async function NotFound() {
  const [index, categories] = await Promise.all([buildSearchIndex(), productCategories()]);

  return (
    <>
      <h1>Página não encontrada</h1>
      <p>Não encontramos essa página. Ela pode ter sido movida ou o endereço está incorreto.</p>
      <SearchBox index={index} categories={categories} />
      <p><Link href="/">Voltar ao início</Link></p>
    </>
  );
}
