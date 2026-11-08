import KpiRow from "@/components/charts/KpiRow";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import HorizontalBars from "@/components/charts/HorizontalBars";
import { getContent } from "@/lib/content.mjs";
import { metricsFromBody, computeVariation } from "@/lib/numbers.mjs";
import { areaColorVar } from "@/lib/areas.mjs";

export const metadata = { title: "A Aurora em números" };

const AREA_SLUGS = {
  Liderança: "lideranca",
  Engenharia: "engenharia",
  Produção: "producao",
  Comercial: "comercial",
  Qualidade: "qualidade",
};

function InfoPanel({ highlight, variation, period, reading }) {
  return (
    <div className="info-panel">
      {highlight && <p className="info-highlight">{highlight.value.toLocaleString("pt-BR")}{highlight.unit || ""}</p>}
      {variation !== null && (
        <p className="meta">
          {variation >= 0 ? "▲" : "▼"} {Math.abs(variation).toFixed(1)}% em relação ao período anterior
        </p>
      )}
      {period && <p className="meta">Período: {period}</p>}
      {reading && <p>{reading}</p>}
    </div>
  );
}

export default async function NumerosPage() {
  const doc = await getContent("paginas", "numeros");

  if (!doc) {
    return (
      <article>
        <p className="eyebrow">Números</p>
        <h1>Esses números ainda estão sendo preparados</h1>
      </article>
    );
  }

  const visaoGeral = metricsFromBody(doc.content, "Visão geral");
  const operacao = metricsFromBody(doc.content, "Operação");
  const timePorArea = metricsFromBody(doc.content, "Time por área");
  const producaoPorAno = metricsFromBody(doc.content, "Produção por ano");
  const mixProdutos = metricsFromBody(doc.content, "Mix de produtos");
  const areaColors = timePorArea.chart.map((item) => areaColorVar(AREA_SLUGS[item.label]));

  return (
    <article className="numeros-page">
      <p className="eyebrow">Números</p>
      <h1>{doc.frontmatter.title}</h1>
      <p className="lead">{doc.frontmatter.lead}</p>

      <KpiRow items={[...visaoGeral.chart, ...operacao.chart]} />

      <div className="bento">
        <section className="bento-item">
          <h2>Time por área</h2>
          <div className="bento-chart-row">
            <DonutChart
              id="time-area"
              title="Time por área"
              description="Distribuição das 85 pessoas da equipe entre as cinco áreas da Aurora."
              data={timePorArea.chart}
              colors={areaColors}
            />
            <InfoPanel
              highlight={timePorArea.highlight}
              variation={null}
              period={timePorArea.period}
              reading={timePorArea.reading}
            />
          </div>
        </section>

        <section className="bento-item">
          <h2>Produção por ano</h2>
          <div className="bento-chart-row">
            <BarChart
              id="producao-ano"
              title="Unidades produzidas por ano"
              description="Crescimento da produção anual de unidades entre 2019 e 2024."
              data={producaoPorAno.chart}
            />
            <InfoPanel
              highlight={producaoPorAno.highlight}
              variation={computeVariation(producaoPorAno.chart)}
              period={producaoPorAno.period}
              reading={producaoPorAno.reading}
            />
          </div>
        </section>

        <section className="bento-item">
          <h2>Mix de produtos</h2>
          <div className="bento-chart-row">
            <HorizontalBars
              id="mix-produtos"
              title="Participação de cada categoria na produção"
              description="Participação percentual de cada categoria de produto na produção total da Aurora."
              data={mixProdutos.chart}
            />
            <InfoPanel
              highlight={mixProdutos.highlight}
              variation={null}
              period={mixProdutos.period}
              reading={mixProdutos.reading}
            />
          </div>
        </section>
      </div>
    </article>
  );
}
