/* ─────────────────────────────── Encuadre ─────────────────────────────── */

/** Tamaño de la etiqueta de un nodo, en píxeles de CSS a zoom 1. */
const FUENTE_ETIQUETA = 14;
/** Zoom mínimo del encuadre inicial: la etiqueta del nodo nunca mide menos de 12 px en pantalla. */
export const ZOOM_LEGIBLE = 12 / FUENTE_ETIQUETA;
/** Margen alrededor del diagrama dentro del lienzo, en píxeles de pantalla. */
export const MARGEN_LIENZO = 24;
/** Alto reservado a la barra de desplazamiento horizontal. */
export const ALTO_BARRA = 14;

export interface Encuadre {
  x: number;
  y: number;
  zoom: number;
  /** El diagrama no cabe a lo ancho: hay que desplazarse. */
  desborda: boolean;
}

/**
 * Zoom y posición iniciales: el diagrama entero si cabe a un zoom legible
 * (hasta 1); si no, zoom legible, alineado al principio del flujo y con
 * desplazamiento horizontal.
 */
export function calcularEncuadre(ancho: number, alto: number, contenedor: { ancho: number; alto: number }): Encuadre {
  const utilAncho = Math.max(1, contenedor.ancho - 2 * MARGEN_LIENZO);
  const zoomAncho = utilAncho / Math.max(1, ancho);
  const desborda = zoomAncho < ZOOM_LEGIBLE;
  const utilAlto = Math.max(1, contenedor.alto - 2 * MARGEN_LIENZO - (desborda ? ALTO_BARRA : 0));
  const zoomAlto = utilAlto / Math.max(1, alto);
  const zoom = Math.min(1, Math.max(ZOOM_LEGIBLE, Math.min(zoomAncho, zoomAlto)));
  const x = ancho * zoom <= utilAncho ? (contenedor.ancho - ancho * zoom) / 2 : MARGEN_LIENZO;
  const y = alto * zoom <= utilAlto ? MARGEN_LIENZO + (utilAlto - alto * zoom) / 2 : MARGEN_LIENZO;
  return { x, y, zoom, desborda: ancho * zoom > utilAncho + 0.5 };
}
