import type { ElkNode } from "elkjs/lib/elk-api";

import type {
  AristaDistribuida,
  BandaDistribuida,
  Caja,
  CapaProceso,
  CarrilDistribuido,
  DireccionDiagrama,
  Distribucion,
  EtiquetaDistribuida,
  GrupoProceso,
  NodoDistribuido,
  NodoProceso,
  Punto,
} from "./types";

/**
 * Lo único que la distribución necesita de ELK: una instancia de `elkjs` lo
 * cumple, también la que corre sobre Web Worker.
 */
export interface MotorDistribucion {
  layout(grafo: ElkNode): Promise<ElkNode>;
}

export interface OpcionesDistribucion {
  direccion?: DireccionDiagrama;
  /** Carriles, en el orden en que se apilan. */
  grupos?: GrupoProceso[];
  /** Nombre de las bandas. @default { transversal: "Transversal", base: "Base" } */
  etiquetasBandas?: Partial<Record<"transversal" | "base", string>>;
}

/* ─────────────────────────────── Medidas ─────────────────────────────── */

const ANCHO_MIN = 184;
const ANCHO_MAX = 272;
const RELLENO_CON_ICONO = 92;
const RELLENO_SIN_ICONO = 48;
const LINEA_ETIQUETA = 20;

/** Separación entre pistas de un mismo canal. */
const PASO = 10;
const MARGEN = 16;
/** Relleno de un carril alrededor de sus nodos. */
const RELLENO_CARRIL = 14;
const SEPARACION_APILADOS = 20;
const SEPARACION_BANDA = 32;

/**
 * Tamaño de la caja de un nodo, estimado a partir del texto (la distribución
 * necesita las cajas antes de pintar): ancho medio por carácter de la fuente
 * de 14 px, y la etiqueta pasa a dos líneas antes de superar `ANCHO_MAX`.
 */
export function medirNodo(nodo: Pick<NodoProceso, "etiqueta" | "subtitulo" | "icono" | "insignia">): {
  ancho: number;
  alto: number;
} {
  const relleno = nodo.icono ? RELLENO_CON_ICONO : RELLENO_SIN_ICONO;
  const textoEtiqueta = nodo.etiqueta.length * 7.4;
  const textoSubtitulo = (nodo.subtitulo?.length ?? 0) * 6.3;
  const textoInsignia = (nodo.insignia?.length ?? 0) * 6.2;
  const ancho = Math.round(
    Math.min(ANCHO_MAX, Math.max(ANCHO_MIN, relleno + 8 + Math.max(textoEtiqueta, textoSubtitulo, textoInsignia))),
  );
  const lineas = Math.min(2, Math.max(1, Math.ceil(textoEtiqueta / (ancho - relleno))));
  const alto = 36 + lineas * LINEA_ETIQUETA + (nodo.subtitulo ? 18 : 0) + (nodo.insignia ? 16 : 0);
  return { ancho, alto: Math.max(60, alto) };
}

/** Caja de la etiqueta de una arista (texto de 12 px). */
export function medirEtiqueta(texto: string): { ancho: number; alto: number } {
  return { ancho: Math.round(texto.length * 6.8 + 16), alto: 22 };
}

/* ─────────────────────────── Ejes canónicos ────────────────────────────
 * Todo se compone con `u` a lo largo del flujo (columnas) y `v` a lo ancho
 * (filas). Con dirección «derecha» u = x; con «abajo» u = y. */

const trasponerPunto = (p: Punto): Punto => ({ x: p.y, y: p.x });
const trasponerCaja = <T extends Caja>(c: T): T => ({ ...c, x: c.y, y: c.x, ancho: c.alto, alto: c.ancho });

type Clase = "flujo" | "TF" | "BF" | "TT" | "BB" | "TB";

interface AristaClasificada {
  indice: number;
  desde: string;
  hasta: string;
  clase: Clase;
}

interface Plan {
  a: AristaClasificada;
  huecoSalida?: number;
  huecoEntrada?: number;
  huecoH?: number;
  huecoEtiqueta?: number;
}

const capaDe = (nodo: NodoProceso): CapaProceso => nodo.capa ?? "flujo";

function empujarEn<K, V>(mapa: Map<K, V[]>, clave: K, valor: V) {
  const lista = mapa.get(clave);
  if (lista) lista.push(valor);
  else mapa.set(clave, [valor]);
}

/**
 * Distribuye un nivel: los `hijos` de `nivel` y sus `aristas`.
 *
 * - **Columnas:** ELK (`layered`) decide la etapa de cada proceso de flujo y
 *   su orden, y las columnas se comparten entre carriles: un proceso
 *   posterior queda siempre más adelante que uno anterior, esté en el carril
 *   que esté.
 * - **Filas:** un carril por `grupo`, en el orden de `opciones.grupos`
 *   (columnas si la dirección es «abajo»). Las capas `transversal` y `base`
 *   van en bandas antes y después.
 * - **Aristas:** ortogonales y solo por los huecos entre columnas y entre
 *   filas, que nunca contienen nodos; cada arista lleva su propia pista.
 */
export async function distribuirNivel(
  nivel: Pick<NodoProceso, "hijos" | "aristas">,
  motor: MotorDistribucion,
  opciones: OpcionesDistribucion = {},
): Promise<Distribucion> {
  const direccion = opciones.direccion ?? "derecha";
  const derecha = direccion === "derecha";
  const hijos = nivel.hijos ?? [];
  const porId = new Map(hijos.map((n) => [n.id, n]));
  const medidas = new Map(hijos.map((n) => [n.id, medirNodo(n)]));
  const tam = (id: string) => {
    const m = medidas.get(id)!;
    return derecha ? m : { ancho: m.alto, alto: m.ancho };
  };
  const tamEtiqueta = (texto: string) => {
    const m = medirEtiqueta(texto);
    return derecha ? m : { ancho: m.alto, alto: m.ancho };
  };

  const hayFlujo = hijos.some((n) => capaDe(n) === "flujo");
  const capa = (id: string): CapaProceso => (hayFlujo ? capaDe(porId.get(id)!) : "flujo");
  const banda = (id: string) => capa(id) as "transversal" | "base";

  const aristas: AristaClasificada[] = (nivel.aristas ?? [])
    .map((a, indice) => ({ ...a, indice }))
    .filter((a) => porId.has(a.desde) && porId.has(a.hasta) && a.desde !== a.hasta)
    .map((a) => {
      const cd = capa(a.desde);
      const ch = capa(a.hasta);
      let clase: Clase;
      if (cd === "flujo" && ch === "flujo") clase = "flujo";
      else if (cd === "flujo" || ch === "flujo") clase = cd === "transversal" || ch === "transversal" ? "TF" : "BF";
      else if (cd === ch) clase = cd === "transversal" ? "TT" : "BB";
      else clase = "TB";
      return { indice: a.indice, desde: a.desde, hasta: a.hasta, clase };
    });
  const original = (a: AristaClasificada) => nivel.aristas![a.indice];
  const de = (...clases: Clase[]) => aristas.filter((a) => clases.includes(a.clase));

  /* ── 1. Columnas y orden, con ELK ── */

  const flujo = hijos.filter((n) => capa(n.id) === "flujo");
  const { columna, orden } = await columnasConElk(flujo, de("flujo"), medidas, motor);
  const numColumnas = Math.max(0, ...flujo.map((n) => columna.get(n.id)! + 1));

  /* ── 2. Filas ── */

  const ordenGrupos = [
    ...new Set([
      ...(opciones.grupos ?? []).map((g) => g.id),
      ...flujo.map((n) => n.grupo).filter((g): g is string => Boolean(g)),
    ]),
  ].filter((g) => flujo.some((n) => n.grupo === g));
  const conCarriles = ordenGrupos.length >= 2;
  const filas: { grupo?: string; nodos: NodoProceso[] }[] = conCarriles
    ? [
        ...ordenGrupos.map((g) => ({ grupo: g as string | undefined, nodos: flujo.filter((n) => n.grupo === g) })),
        { grupo: undefined, nodos: flujo.filter((n) => !n.grupo || !ordenGrupos.includes(n.grupo)) },
      ].filter((f) => f.nodos.length > 0)
    : flujo.length
      ? [{ nodos: flujo }]
      : [];
  const filaDe = new Map<string, number>();
  filas.forEach((f, i) => f.nodos.forEach((n) => filaDe.set(n.id, i)));
  const numFilas = filas.length;

  const transversales = hijos.filter((n) => capa(n.id) === "transversal");
  const bases = hijos.filter((n) => capa(n.id) === "base");
  const hayT = transversales.length > 0;
  const hayB = bases.length > 0;
  const lead = conCarriles || hayT || hayB ? (derecha ? 156 : 44) : 0;

  /* ── 3. Plan de rutas: qué canales usa cada arista ──
   * Hueco vertical k: después de la columna k (-1: antes de la primera).
   * Hueco horizontal g: antes de la fila g (numFilas: después de la última). */

  const pistasV = new Map<number, string[]>();
  const pistasH = new Map<number, string[]>();
  const etiquetaMaxEnHueco = new Map<number, number>();
  const reservarEtiqueta = (k: number, texto?: string) => {
    if (texto) etiquetaMaxEnHueco.set(k, Math.max(etiquetaMaxEnHueco.get(k) ?? 0, tamEtiqueta(texto).ancho));
  };
  const planes: Plan[] = [];

  for (const a of de("flujo")) {
    const i = columna.get(a.desde)!;
    const j = columna.get(a.hasta)!;
    const plan: Plan = { a, huecoSalida: i, huecoEntrada: j - 1, huecoEtiqueta: j - 1 };
    empujarEn(pistasV, i, `${a.indice}:s`);
    if (j - 1 !== i) {
      empujarEn(pistasV, j - 1, `${a.indice}:e`);
      const r = filaDe.get(a.desde)!;
      const s = filaDe.get(a.hasta)!;
      plan.huecoH = s < r ? r : r + 1;
      empujarEn(pistasH, plan.huecoH, `${a.indice}`);
    }
    reservarEtiqueta(j - 1, original(a).etiqueta);
    planes.push(plan);
  }
  for (const a of de("TF", "BF")) {
    const g = a.clase === "TF" ? 0 : numFilas;
    const haciaFlujo = capa(a.hasta) === "flujo";
    const nodoFlujo = haciaFlujo ? a.hasta : a.desde;
    const k = haciaFlujo ? columna.get(nodoFlujo)! - 1 : columna.get(nodoFlujo)!;
    empujarEn(pistasV, k, `${a.indice}:${haciaFlujo ? "e" : "s"}`);
    empujarEn(pistasH, g, `${a.indice}`);
    reservarEtiqueta(k, original(a).etiqueta);
    planes.push({ a, huecoH: g, huecoEtiqueta: k, ...(haciaFlujo ? { huecoEntrada: k } : { huecoSalida: k }) });
  }

  /* ── 4. Eje u ── */

  const anchoColumna = Array.from({ length: numColumnas }, (_, c) =>
    Math.max(0, ...flujo.filter((n) => columna.get(n.id) === c).map((n) => tam(n.id).ancho)),
  );
  const anchoHueco = (k: number) =>
    Math.max(56, 32 + (pistasV.get(k)?.length ?? 0) * PASO, (etiquetaMaxEnHueco.get(k) ?? 0) + 24);
  const inicioHueco = new Map<number, number>();
  const inicioColumna: number[] = [];
  let u = lead;
  inicioHueco.set(-1, u);
  u += anchoHueco(-1);
  for (let c = 0; c < numColumnas; c++) {
    inicioColumna[c] = u;
    u += anchoColumna[c];
    inicioHueco.set(c, u);
    u += anchoHueco(c);
  }
  const finFlujoU = u;
  const pistaU = (k: number, clave: string) => {
    const lista = pistasV.get(k)!;
    const t = lista.indexOf(clave);
    return inicioHueco.get(k)! + anchoHueco(k) / 2 + (t - (lista.length - 1) / 2) * PASO;
  };
  const centroHuecoU = (k: number) => inicioHueco.get(k)! + anchoHueco(k) / 2;

  /* ── 5. Eje v ── */

  const tt = de("TT");
  const bb = de("BB");
  const tb = de("TB");
  const grosorEtiqueta = (a: AristaClasificada) => {
    const texto = original(a).etiqueta;
    return texto ? tamEtiqueta(texto).alto + 4 : 0;
  };
  const extraT = Math.max(0, ...[...tt, ...tb].filter((a) => banda(a.desde) === "transversal").map(grosorEtiqueta));
  const extraB = Math.max(0, ...[...bb, ...tb].filter((a) => banda(a.desde) === "base").map(grosorEtiqueta));
  const canalesT = tt.length + tb.length;
  const canalesB = bb.length + tb.length;
  const altoFila = (nodos: NodoProceso[]) => Math.max(0, ...nodos.map((n) => tam(n.id).alto));

  const filaT = MARGEN + extraT + canalesT * PASO;
  const vT1 = hayT ? filaT + altoFila(transversales) + MARGEN : 0;
  let v = vT1;

  const altoHuecoH = (g: number) => 2 * RELLENO_CARRIL + 20 + (pistasH.get(g)?.length ?? 0) * PASO;
  const inicioHuecoH: number[] = [];
  const inicioFila: number[] = [];
  const altoDeFila: number[] = [];
  const pilas = new Map<string, NodoProceso[]>();
  filas.forEach((f, r) => {
    for (const n of [...f.nodos].sort((x, y) => orden.get(x.id)! - orden.get(y.id)!)) {
      empujarEn(pilas, `${r}|${columna.get(n.id)}`, n);
    }
  });
  const altoPila = (nodos: NodoProceso[]) =>
    nodos.reduce((s, n) => s + tam(n.id).alto, 0) + SEPARACION_APILADOS * Math.max(0, nodos.length - 1);
  if (numFilas > 0) {
    for (let r = 0; r <= numFilas; r++) {
      inicioHuecoH[r] = v;
      v += altoHuecoH(r);
      if (r === numFilas) break;
      inicioFila[r] = v;
      altoDeFila[r] = Math.max(0, ...Array.from({ length: numColumnas }, (_, c) => altoPila(pilas.get(`${r}|${c}`) ?? [])));
      v += altoDeFila[r];
    }
  }
  const finFlujoV = v;
  const vFlujoInicio = numFilas ? inicioHuecoH[0] : v;
  const pistaV = (g: number, clave: string) => {
    const lista = pistasH.get(g)!;
    const t = lista.indexOf(clave);
    return inicioHuecoH[g] + altoHuecoH(g) / 2 + (t - (lista.length - 1) / 2) * PASO;
  };
  const vB0 = v;
  const filaB = vB0 + MARGEN;
  const finFilaB = filaB + altoFila(bases);
  const vB1 = finFilaB + MARGEN + canalesB * PASO + extraB + MARGEN;

  /* ── 6. Cajas ── */

  const cajas = new Map<string, Caja>();
  for (const [clave, nodos] of pilas) {
    const [r, c] = clave.split("|").map(Number);
    let cursor = inicioFila[r] + (altoDeFila[r] - altoPila(nodos)) / 2;
    for (const n of nodos) {
      const t = tam(n.id);
      cajas.set(n.id, { x: inicioColumna[c] + (anchoColumna[c] - t.ancho) / 2, y: cursor, ancho: t.ancho, alto: t.alto });
      cursor += t.alto + SEPARACION_APILADOS;
    }
  }

  const centroColumna = (id: string) => inicioColumna[columna.get(id)!] + anchoColumna[columna.get(id)!] / 2;
  const colocarBanda = (nodos: NodoProceso[], fila: number) => {
    const altoDeLaFila = altoFila(nodos);
    const deseado = new Map<string, number>();
    for (const n of nodos) {
      const us = de("TF", "BF")
        .filter((a) => a.desde === n.id || a.hasta === n.id)
        .map((a) => centroColumna(a.desde === n.id ? a.hasta : a.desde));
      if (us.length) deseado.set(n.id, us.reduce((s, x) => s + x, 0) / us.length);
    }
    const lista = nodos
      .map((n, i) => ({ n, i, d: deseado.get(n.id) }))
      // Los que no hablan con el flujo, al principio: así no alargan la banda por la derecha.
      .sort((a, b) => (a.d ?? -Infinity) - (b.d ?? -Infinity) || a.i - b.i);
    let cursor = lead + MARGEN;
    for (const { n, d } of lista) {
      const t = tam(n.id);
      const x = Math.max(cursor, d === undefined ? cursor : d - t.ancho / 2);
      cajas.set(n.id, { x, y: fila + (altoDeLaFila - t.alto) / 2, ancho: t.ancho, alto: t.alto });
      cursor = x + t.ancho + SEPARACION_BANDA;
    }
    return cursor - SEPARACION_BANDA;
  };
  const finT = hayT ? colocarBanda(transversales, filaT) : 0;
  const finB = hayB ? colocarBanda(bases, filaB) : 0;
  const finContenido = Math.max(finFlujoU, finT + MARGEN, finB + MARGEN);
  const canalLateral = (j: number) => finContenido + MARGEN + j * PASO;
  const anchoTotal = tb.length ? canalLateral(tb.length - 1) + MARGEN : finContenido;
  const altoTotal = hayB ? vB1 : finFlujoV;

  /* ── 7. Enganches: varias aristas por el mismo lado se reparten a lo largo del lado ── */

  type Lado = "entrada" | "salida" | "antes" | "despues";
  const enganches = new Map<string, { clave: string; hacia: number }[]>();
  const pedir = (nodo: string, lado: Lado, clave: string, hacia: number) =>
    empujarEn(enganches, `${nodo}|${lado}`, { clave, hacia });
  const enganche = (nodo: string, lado: Lado, clave: string): Punto => {
    const lista = [...enganches.get(`${nodo}|${lado}`)!].sort((a, b) => a.hacia - b.hacia);
    const k = lista.findIndex((e) => e.clave === clave);
    const c = cajas.get(nodo)!;
    const f = (k + 1) / (lista.length + 1);
    if (lado === "entrada") return { x: c.x, y: c.y + c.alto * f };
    if (lado === "salida") return { x: c.x + c.ancho, y: c.y + c.alto * f };
    return { x: c.x + c.ancho * f, y: lado === "antes" ? c.y : c.y + c.alto };
  };
  const centro = (id: string) => {
    const c = cajas.get(id)!;
    return { x: c.x + c.ancho / 2, y: c.y + c.alto / 2 };
  };
  const exterior = (id: string): Lado => (banda(id) === "transversal" ? "antes" : "despues");
  const interior = (id: string): Lado => (banda(id) === "transversal" ? "despues" : "antes");

  for (const { a } of planes) {
    if (capa(a.desde) === "flujo") pedir(a.desde, "salida", `${a.indice}`, centro(a.hasta).y);
    else pedir(a.desde, interior(a.desde), `${a.indice}`, centro(a.hasta).x);
    if (capa(a.hasta) === "flujo") pedir(a.hasta, "entrada", `${a.indice}`, centro(a.desde).y);
    else pedir(a.hasta, interior(a.hasta), `${a.indice}`, centro(a.desde).x);
  }
  for (const a of [...tt, ...bb, ...tb]) {
    pedir(a.desde, exterior(a.desde), `${a.indice}`, a.clase === "TB" ? Infinity : centro(a.hasta).x);
    pedir(a.hasta, exterior(a.hasta), `${a.indice}`, a.clase === "TB" ? Infinity : centro(a.desde).x);
  }

  /* ── 8. Rutas ── */

  const resultado: AristaDistribuida[] = [];
  const etiquetasPorHueco = new Map<number, EtiquetaDistribuida[]>();
  const empujar = (a: AristaClasificada, puntos: Punto[], etiqueta?: EtiquetaDistribuida) => {
    const o = original(a);
    resultado.push({
      id: `arista:${a.indice}`,
      desde: a.desde,
      hasta: a.hasta,
      puntos: limpiarPoligonal(puntos),
      etiqueta,
      estilo: o.estilo ?? "continua",
      animada: Boolean(o.animada),
      transversal: a.clase !== "flujo",
    });
  };

  for (const { a, huecoSalida, huecoEntrada, huecoH, huecoEtiqueta } of planes) {
    const origenFlujo = capa(a.desde) === "flujo";
    const destinoFlujo = capa(a.hasta) === "flujo";
    const o = origenFlujo ? enganche(a.desde, "salida", `${a.indice}`) : enganche(a.desde, interior(a.desde), `${a.indice}`);
    const d = destinoFlujo ? enganche(a.hasta, "entrada", `${a.indice}`) : enganche(a.hasta, interior(a.hasta), `${a.indice}`);
    const puntos: Punto[] = [o];
    if (origenFlujo) {
      const us = pistaU(huecoSalida!, `${a.indice}:s`);
      puntos.push({ x: us, y: o.y });
      if (huecoH !== undefined) {
        const vh = pistaV(huecoH, `${a.indice}`);
        puntos.push({ x: us, y: vh });
        if (destinoFlujo) {
          const ue = pistaU(huecoEntrada!, `${a.indice}:e`);
          puntos.push({ x: ue, y: vh }, { x: ue, y: d.y });
        } else {
          puntos.push({ x: d.x, y: vh });
        }
      } else {
        puntos.push({ x: us, y: d.y });
      }
    } else {
      const vh = pistaV(huecoH!, `${a.indice}`);
      const ue = pistaU(huecoEntrada!, `${a.indice}:e`);
      puntos.push({ x: o.x, y: vh }, { x: ue, y: vh }, { x: ue, y: d.y });
    }
    puntos.push(d);

    const texto = original(a).etiqueta;
    let etiqueta: EtiquetaDistribuida | undefined;
    if (texto && huecoEtiqueta !== undefined) {
      const t = tamEtiqueta(texto);
      const ancla = destinoFlujo ? d.y : o.y;
      etiqueta = { texto, x: centroHuecoU(huecoEtiqueta) - t.ancho / 2, y: ancla - t.alto - 3, ancho: t.ancho, alto: t.alto };
      empujarEn(etiquetasPorHueco, huecoEtiqueta, etiqueta);
    }
    empujar(a, puntos, etiqueta);
  }

  // Etiquetas de un mismo hueco: sin pisarse entre sí y dentro de la franja del flujo.
  for (const lista of etiquetasPorHueco.values()) {
    lista.sort((x, y) => x.y - y.y);
    let tope = vFlujoInicio;
    for (const e of lista) {
      e.y = Math.max(e.y, tope);
      tope = e.y + e.alto + 2;
    }
    let suelo = finFlujoV;
    for (const e of [...lista].reverse()) {
      e.y = Math.min(e.y, suelo - e.alto);
      suelo = e.y - 2;
    }
  }

  const lineaCanalT = (i: number) => MARGEN + extraT + i * PASO;
  const lineaCanalB = (i: number) => finFilaB + MARGEN + i * PASO;
  let iT = 0;
  let iB = 0;
  for (const a of [...tt, ...bb]) {
    const linea = a.clase === "TT" ? lineaCanalT(iT++) : lineaCanalB(iB++);
    const o = enganche(a.desde, exterior(a.desde), `${a.indice}`);
    const d = enganche(a.hasta, exterior(a.hasta), `${a.indice}`);
    empujar(
      a,
      [o, { x: o.x, y: linea }, { x: d.x, y: linea }, d],
      etiquetaEnCanal(original(a).etiqueta, o.x, d.x, linea, banda(a.desde), tamEtiqueta),
    );
  }
  tb.forEach((a, j) => {
    const lineaO = banda(a.desde) === "transversal" ? lineaCanalT(iT++) : lineaCanalB(iB++);
    const lineaD = banda(a.hasta) === "transversal" ? lineaCanalT(iT++) : lineaCanalB(iB++);
    const lateral = canalLateral(j);
    const o = enganche(a.desde, exterior(a.desde), `${a.indice}`);
    const d = enganche(a.hasta, exterior(a.hasta), `${a.indice}`);
    empujar(
      a,
      [o, { x: o.x, y: lineaO }, { x: lateral, y: lineaO }, { x: lateral, y: lineaD }, { x: d.x, y: lineaD }, d],
      etiquetaEnCanal(original(a).etiqueta, o.x, lateral, lineaO, banda(a.desde), tamEtiqueta),
    );
  });

  /* ── 9. Carriles y bandas ── */

  const carriles: CarrilDistribuido[] = [];
  if (conCarriles) {
    filas.forEach((f, r) => {
      if (!f.grupo) return;
      carriles.push({
        id: f.grupo,
        etiqueta: opciones.grupos?.find((g) => g.id === f.grupo)?.etiqueta ?? f.grupo,
        x: MARGEN / 2,
        y: inicioFila[r] - RELLENO_CARRIL,
        ancho: finFlujoU - MARGEN / 2,
        alto: altoDeFila[r] + 2 * RELLENO_CARRIL,
      });
    });
  }

  const etiquetaBanda = (c: "transversal" | "base") =>
    opciones.etiquetasBandas?.[c] ?? (c === "transversal" ? "Transversal" : "Base");
  // El título se da ya en coordenadas reales.
  const tituloBanda = (v0: number, v1: number): Caja =>
    derecha
      ? { x: MARGEN / 2, y: v0 + MARGEN / 2, ancho: lead - MARGEN, alto: v1 - v0 - MARGEN }
      : { x: v0 + MARGEN / 2, y: MARGEN / 2, ancho: v1 - v0 - MARGEN, alto: lead - MARGEN };
  const bandas: BandaDistribuida[] = [];
  if (hayT) {
    bandas.push({ capa: "transversal", etiqueta: etiquetaBanda("transversal"), x: 0, y: 0, ancho: anchoTotal, alto: vT1, titulo: tituloBanda(0, vT1) });
  }
  if (hayB) {
    bandas.push({ capa: "base", etiqueta: etiquetaBanda("base"), x: 0, y: vB0, ancho: anchoTotal, alto: vB1 - vB0, titulo: tituloBanda(vB0, vB1) });
  }

  /* ── 10. A coordenadas reales ── */

  const real = <T extends Caja>(c: T): T => (derecha ? c : trasponerCaja(c));
  const realP = (p: Punto): Punto => (derecha ? p : trasponerPunto(p));
  const nodos: NodoDistribuido[] = hijos
    .filter((n) => cajas.has(n.id))
    .map((n) => ({ id: n.id, capa: capa(n.id), grupo: n.grupo, ...real(cajas.get(n.id)!) }));

  return {
    ancho: Math.ceil(derecha ? anchoTotal : altoTotal),
    alto: Math.ceil(derecha ? altoTotal : anchoTotal),
    direccion,
    nodos,
    carriles: carriles.map(real),
    bandas: bandas.map((b) => ({ ...real(b), titulo: b.titulo })),
    aristas: resultado.map((a) => ({ ...a, puntos: a.puntos.map(realP), etiqueta: a.etiqueta && real(a.etiqueta) })),
  };
}

/* ─────────────────────────────── Auxiliares ─────────────────────────────── */

/**
 * Etapa (columna) y orden de cada proceso de flujo según ELK `layered`. Las
 * capas se leen de las coordenadas: los nodos cuyos intervalos a lo largo del
 * flujo se solapan están en la misma capa.
 */
async function columnasConElk(
  flujo: NodoProceso[],
  aristas: AristaClasificada[],
  medidas: Map<string, { ancho: number; alto: number }>,
  motor: MotorDistribucion,
): Promise<{ columna: Map<string, number>; orden: Map<string, number> }> {
  const columna = new Map<string, number>();
  const orden = new Map<string, number>();
  if (flujo.length === 0) return { columna, orden };
  const resultado = await motor.layout({
    id: "capas",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "24",
      "elk.layered.spacing.nodeNodeBetweenLayers": "48",
    },
    children: flujo.map((n) => ({ id: n.id, width: medidas.get(n.id)!.ancho, height: medidas.get(n.id)!.alto })),
    edges: aristas.map((a) => ({ id: `a${a.indice}`, sources: [a.desde], targets: [a.hasta] })),
  });
  const cajas = (resultado.children ?? [])
    .map((c) => ({ id: c.id, x: c.x ?? 0, fin: (c.x ?? 0) + (c.width ?? 0), y: c.y ?? 0 }))
    .sort((a, b) => a.x - b.x);
  let capa = -1;
  let finCapa = -Infinity;
  for (const c of cajas) {
    if (c.x >= finCapa - 0.5) {
      capa++;
      finCapa = c.fin;
    } else {
      finCapa = Math.max(finCapa, c.fin);
    }
    columna.set(c.id, capa);
    orden.set(c.id, c.y);
  }
  return { columna, orden };
}

/** Quita puntos repetidos y los intermedios alineados, para que la poligonal quede mínima. */
export function limpiarPoligonal(puntos: Punto[]): Punto[] {
  const sinRepetir = puntos.filter(
    (p, i) => i === 0 || Math.abs(p.x - puntos[i - 1].x) > 0.01 || Math.abs(p.y - puntos[i - 1].y) > 0.01,
  );
  return sinRepetir.filter((p, i) => {
    if (i === 0 || i === sinRepetir.length - 1) return true;
    const a = sinRepetir[i - 1];
    const b = sinRepetir[i + 1];
    const alineadoX = Math.abs(a.x - p.x) < 0.01 && Math.abs(b.x - p.x) < 0.01;
    const alineadoY = Math.abs(a.y - p.y) < 0.01 && Math.abs(b.y - p.y) < 0.01;
    return !(alineadoX || alineadoY);
  });
}

/**
 * Etiqueta de una arista entre bandas, junto a su tramo de canal y del lado de
 * fuera: en la banda transversal antes de la línea, en la base después.
 */
function etiquetaEnCanal(
  texto: string | undefined,
  u0: number,
  u1: number,
  linea: number,
  banda: "transversal" | "base",
  medir: (texto: string) => { ancho: number; alto: number },
): EtiquetaDistribuida | undefined {
  if (!texto) return undefined;
  const t = medir(texto);
  const v = banda === "transversal" ? linea - 2 - t.alto : linea + 2;
  return { texto, x: (u0 + u1) / 2 - t.ancho / 2, y: v, ancho: t.ancho, alto: t.alto };
}
