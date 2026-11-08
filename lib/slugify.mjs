export function stripAccents(value) {
  return (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function slugify(value) {
  return stripAccents(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
