/**
 * Iniciales de un nombre, para un avatar o una marca sin logotipo.
 *
 * Vive aquí y no dentro de un componente porque la usan varios —la marca de
 * la organización en el menú lateral y la persona en la barra superior— y
 * las iniciales tienen que salir iguales en los dos sitios.
 */
/** Dos primeras iniciales del nombre, ignorando las formas societarias. */
export function initialsFrom(name: string): string {
  const ignored = /^(s\.?a\.?s?|ltda|inc|llc|corp|s\.?l|c\.?a|gmbh)\.?$/i;
  const words = name
    .split(/\s+/)
    .filter((word) => word.length > 0 && !ignored.test(word.replace(/[.,]/g, "")));
  const source = words.length > 0 ? words : name.split(/\s+/);
  // Con una sola palabra ("Acme S.A." → "Acme") dos letras se leen mejor que
  // una suelta en el cuadro.
  if (source.length === 1) return (source[0] ?? "").slice(0, 2).toLocaleUpperCase();
  return source
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase() ?? "")
    .join("");
}
