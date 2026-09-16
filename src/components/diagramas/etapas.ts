import type { NodoProceso } from "./types";

export interface EtapasNivel {
  /** Nodos de flujo por etapa, en el orden en que corre el flujo. */
  etapas: NodoProceso[][];
  transversales: NodoProceso[];
  bases: NodoProceso[];
}

/**
 * Reparte un nivel en etapas sin ELK, para la vista de lista en móvil: la etapa
 * de cada nodo de flujo es el camino más largo que llega hasta él. Los ciclos
 * («recompra») se rompen ignorando las aristas que vuelven hacia atrás en un
 * recorrido en profundidad por orden de declaración.
 */
export function etapasDeNivel(nivel: Pick<NodoProceso, "hijos" | "aristas">): EtapasNivel {
  const hijos = nivel.hijos ?? [];
  const hayFlujo = hijos.some((n) => (n.capa ?? "flujo") === "flujo");
  const esFlujo = (n: NodoProceso) => !hayFlujo || (n.capa ?? "flujo") === "flujo";
  const flujo = hijos.filter(esFlujo);
  const ids = new Set(flujo.map((n) => n.id));
  const salidas = new Map<string, string[]>(flujo.map((n) => [n.id, []]));
  for (const a of nivel.aristas ?? []) {
    if (ids.has(a.desde) && ids.has(a.hasta) && a.desde !== a.hasta) salidas.get(a.desde)!.push(a.hasta);
  }

  // Aristas hacia atrás: las que cierran un ciclo en el recorrido en profundidad.
  const estado = new Map<string, 0 | 1 | 2>();
  const haciaAtras = new Set<string>();
  const visitar = (id: string) => {
    estado.set(id, 1);
    for (const destino of salidas.get(id)!) {
      if (estado.get(destino) === 1) haciaAtras.add(`${id}>${destino}`);
      else if (!estado.get(destino)) visitar(destino);
    }
    estado.set(id, 2);
  };
  // Se empieza por los nodos sin entradas, para que el ciclo se rompa en su vuelta y no en su ida.
  const conEntrada = new Set([...salidas.values()].flat());
  for (const n of [...flujo.filter((n) => !conEntrada.has(n.id)), ...flujo]) if (!estado.get(n.id)) visitar(n.id);

  const etapa = new Map<string, number>();
  const calcular = (id: string, pila = new Set<string>()): number => {
    if (etapa.has(id)) return etapa.get(id)!;
    pila.add(id);
    let valor = 0;
    for (const [origen, destinos] of salidas) {
      if (destinos.includes(id) && !haciaAtras.has(`${origen}>${id}`) && !pila.has(origen)) {
        valor = Math.max(valor, calcular(origen, pila) + 1);
      }
    }
    pila.delete(id);
    etapa.set(id, valor);
    return valor;
  };
  flujo.forEach((n) => calcular(n.id));

  const etapas: NodoProceso[][] = [];
  for (const n of flujo) (etapas[etapa.get(n.id)!] ??= []).push(n);
  return {
    etapas: etapas.filter(Boolean),
    transversales: hayFlujo ? hijos.filter((n) => n.capa === "transversal") : [],
    bases: hayFlujo ? hijos.filter((n) => n.capa === "base") : [],
  };
}
