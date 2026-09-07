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
