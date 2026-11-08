export function validateSelection(slugs, productsBySlug) {
  const unique = [...new Set(slugs)];
  if (unique.length < 2) return { ok: false, message: "Selecione pelo menos 2 produtos para comparar." };
  if (unique.length > 3) return { ok: false, message: "Selecione no máximo 3 produtos para comparar." };

  const products = [];
  for (const slug of unique) {
    const product = productsBySlug.get(slug);
    if (!product) return { ok: false, message: `Produto não encontrado: ${slug}.` };
    products.push(product);
  }

  const categories = new Set(products.map((p) => p.category));
  if (categories.size > 1) {
    return { ok: false, message: "Só é possível comparar produtos da mesma categoria." };
  }

  return { ok: true, products };
}

export function buildComparisonRows(products) {
  const allKeys = [];
  const seen = new Set();
  for (const product of products) {
    for (const { key } of product.specSection?.spec || []) {
      if (!seen.has(key)) {
        seen.add(key);
        allKeys.push(key);
      }
    }
  }

  const rows = allKeys.map((key) => {
    const values = new Map();
    for (const product of products) {
      const entry = (product.specSection?.spec || []).find((item) => item.key === key);
      values.set(product.slug, entry ? entry.value : null);
    }
    return { key, values };
  });

  return { category: products[0]?.category, rows };
}
