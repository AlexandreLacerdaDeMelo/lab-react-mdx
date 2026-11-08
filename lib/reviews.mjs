export const USOS = ["vlog", "entrevista", "estúdio", "eventos", "outro"];

export function validateReview({ rating, title, uso }) {
  const errors = [];
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    errors.push("Selecione uma nota de 1 a 5 estrelas.");
  }
  if (!title || !title.toString().trim()) {
    errors.push("Informe um título curto.");
  }
  if (uso && !USOS.includes(uso)) {
    errors.push("Selecione um uso válido.");
  }
  return errors;
}

// Null quando não há nenhuma avaliação ainda — a média/contagem só aparecem
// na UI quando existir ao menos uma.
export function averageRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + Number(review.rating || 0), 0);
  return sum / reviews.length;
}
