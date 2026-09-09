import type { TokenColor } from "./palette";

/**
 * Ocho tonos con contraste AA (≥ 4,5:1) para iniciales blancas. La
 * luminosidad varía por tono porque el ojo no la percibe igual: un ámbar
 * necesita ser mucho más oscuro que un azul para el mismo contraste. Hay una
 * prueba que lo comprueba con `contrastRatio`, no a ojo.
 */
export const DEFAULT_AVATAR_COLORS: readonly TokenColor[] = [
  "350 75% 45%",
  "20 80% 40%",
  "40 85% 32%",
  "145 60% 30%",
  "175 55% 30%",
  "215 75% 45%",
  "243 70% 52%",
  "285 60% 48%",
];

/**
 * Nombre en español de cada color de `DEFAULT_AVATAR_COLORS`, mismo índice.
 * Es lo que `AvatarPicker` anuncia en cada muestra en vez de su HSL crudo
 * (#161). Mismo tono sobrio que `BUNDLED_PALETTES` en `appearance-presets.ts`
 * —de hecho comparte nombre con las tres que caen en el mismo matiz (Rubí,
 * Índigo, Violeta)—, no un vocabulario nuevo.
 */
export const DEFAULT_AVATAR_COLOR_LABELS: readonly string[] = [
  "Rubí",
  "Terracota",
  "Ámbar",
  "Esmeralda",
  "Turquesa",
  "Azul",
  "Índigo",
  "Violeta",
];

/**
 * Nombre por valor HSL exacto, para que un color por defecto se siga
 * anunciando por su nombre aunque llegue dentro de una lista `colors` propia
 * (reordenada o parcial) sin `colorLabels`. Solo compara el valor, no el
 * matiz: no adivina nombres para colores que no están en la lista.
 */
export const DEFAULT_AVATAR_COLOR_NAME_BY_VALUE: ReadonlyMap<TokenColor, string> = new Map(
  DEFAULT_AVATAR_COLORS.map((color, index) => [color, DEFAULT_AVATAR_COLOR_LABELS[index]]),
);
