const AREA_LABELS = {
  lideranca: "Liderança",
  engenharia: "Engenharia",
  producao: "Produção",
  comercial: "Comercial",
  qualidade: "Qualidade",
};

const AREA_VARS = {
  lideranca: "var(--area-lideranca)",
  engenharia: "var(--area-engenharia)",
  producao: "var(--area-producao)",
  comercial: "var(--area-comercial)",
  qualidade: "var(--area-qualidade)",
};

export function areaLabel(area) {
  return AREA_LABELS[area] || "Outras áreas";
}

export function areaColorVar(area) {
  return AREA_VARS[area] || "var(--area-neutra)";
}

export function areaOptions() {
  return Object.keys(AREA_LABELS);
}
