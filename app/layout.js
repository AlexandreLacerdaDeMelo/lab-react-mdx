import Link from "next/link";
import NavLink from "@/components/NavLink";
import SpecSheet from "@/components/SpecSheet";
import Logo from "@/components/Logo";
import SearchBox from "@/components/SearchBox";
import IdeaButton from "@/components/IdeaButton";
import { getContent } from "@/lib/content.mjs";
import { parseSections } from "@/lib/sections.js";
import { buildSearchIndex, productCategories } from "@/lib/searchIndex.server.mjs";
import "./globals.css";

export const metadata = {
  title: { default: "Aurora Studio", template: "%s | Aurora Studio" },
  description: "Produção audiovisual, edição de vídeo e equipamentos de captura para criadores.",
};

const navItems = [
  { href: "/empresa", label: "Empresa" },
  { href: "/produtos", label: "Produtos" },
  { href: "/equipe", label: "Equipe" },
  { href: "/numeros", label: "Números" },
  { href: "/contato", label: "Contato" },
];

export default async function RootLayout({ children }) {
  const [rodape, searchIndexData, categories] = await Promise.all([
    getContent("paginas", "rodape"),
    buildSearchIndex(),
    productCategories(),
  ]);
  const blocos = rodape ? parseSections(rodape.content, { level: 3 }) : [];
  const year = new Date().getFullYear();

  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <header>
          <nav className="container nav-principal" aria-label="Principal">
            <Link href="/" className="brand" aria-label="Aurora Studio — página inicial">
              <Logo variant="full" titleId="logo-header" />
            </Link>
            <SearchBox index={searchIndexData} categories={categories} />
            <ul className="nav-links nav-desktop">
              {navItems.map(({ href, label }) => (
                <li key={href}><NavLink href={href}>{label}</NavLink></li>
              ))}
            </ul>
            <details className="nav-mobile">
              <summary>Menu</summary>
              <ul className="nav-links">
                {navItems.map(({ href, label }) => (
                  <li key={href}><NavLink href={href}>{label}</NavLink></li>
                ))}
              </ul>
            </details>
          </nav>
        </header>
        <main id="conteudo" className="container">{children}</main>
        <footer>
          <div className="footer-bg">
            <div className="container footer-grid">
              {blocos.map((bloco) => (
                <div className="footer-block" key={bloco.heading}>
                  <h2>{bloco.heading}</h2>
                  {bloco.kind === "spec" ? <SpecSheet items={bloco.spec} /> : <p>{bloco.raw}</p>}
                </div>
              ))}
              <div className="footer-block">
                <h2>Navegação</h2>
                <ul>
                  {navItems.map(({ href, label }) => (
                    <li key={href}><Link href={href}>{label}</Link></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="container">
            <p className="footer-bar">
              <Logo variant="icon" titleId="logo-footer" size={18} /> Aurora Studio — Produção audiovisual e equipamentos de captura · © {year}
            </p>
          </div>
        </footer>
        <IdeaButton />
      </body>
    </html>
  );
}
