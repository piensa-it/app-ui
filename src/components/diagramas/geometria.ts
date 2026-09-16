import type { Caja, Distribucion, Punto } from "./types";

export type ProblemaDistribucion =
  | { tipo: "arista-cruza-nodo"; arista: string; nodo: string }
  | { tipo: "nodos-solapados"; nodos: [string, string] }
  | { tipo: "etiqueta-tapa-nodo"; arista: string; nodo: string };

/** Tolerancia en píxeles: tocar el borde de una caja no es atravesarla. */
const TOLERANCIA = 0.5;

function segmentoAtraviesaCaja(a: Punto, b: Punto, c: Caja): boolean {
  // Las aristas son ortogonales, pero se comprueba el caso general por recorte
  // (Liang-Barsky) contra la caja encogida en la tolerancia.
  const x0 = c.x + TOLERANCIA;
  const x1 = c.x + c.ancho - TOLERANCIA;
  const y0 = c.y + TOLERANCIA;
  const y1 = c.y + c.alto - TOLERANCIA;
  if (x1 <= x0 || y1 <= y0) return false;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [a.x - x0, x1 - a.x, a.y - y0, y1 - a.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] <= 0) return false;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 >= t1) return false;
    }
  }
  return true;
}

function cajasSeSolapan(a: Caja, b: Caja): boolean {
  return (
    a.x + TOLERANCIA < b.x + b.ancho &&
    b.x + TOLERANCIA < a.x + a.ancho &&
    a.y + TOLERANCIA < b.y + b.alto &&
    b.y + TOLERANCIA < a.y + a.alto
  );
}

/**
 * Comprueba que una distribución se puede leer: ningún tramo de arista pasa por
 * dentro de un nodo que no sea su origen o su destino, ninguna etiqueta tapa un
 * nodo y ningún par de nodos se solapa. Devuelve la lista de problemas; vacía
 * si no hay ninguno.
 *
 * Es la misma comprobación que fija la librería en sus pruebas; una aplicación
 * puede usarla en las suyas con sus propios datos.
 */
export function validarDistribucion(distribucion: Distribucion): ProblemaDistribucion[] {
  const problemas: ProblemaDistribucion[] = [];
  const { nodos, aristas } = distribucion;

  for (let i = 0; i < nodos.length; i++) {
    for (let j = i + 1; j < nodos.length; j++) {
      if (cajasSeSolapan(nodos[i], nodos[j])) problemas.push({ tipo: "nodos-solapados", nodos: [nodos[i].id, nodos[j].id] });
    }
  }

  for (const arista of aristas) {
    for (const nodo of nodos) {
      if (arista.etiqueta && cajasSeSolapan(arista.etiqueta, nodo)) {
        problemas.push({ tipo: "etiqueta-tapa-nodo", arista: arista.id, nodo: nodo.id });
      }
      if (nodo.id === arista.desde || nodo.id === arista.hasta) continue;
      const cruza = arista.puntos.some((p, k) => k > 0 && segmentoAtraviesaCaja(arista.puntos[k - 1], p, nodo));
      if (cruza) problemas.push({ tipo: "arista-cruza-nodo", arista: arista.id, nodo: nodo.id });
    }
  }
  return problemas;
}
