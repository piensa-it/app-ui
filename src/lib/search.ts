/** Sin tildes ni mayúsculas, para que «conciliacion» encuentre «Conciliación». */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
