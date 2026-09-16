import type { ElkExtendedEdge, ElkNode, ElkPoint } from "elkjs/lib/elk-api";

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

/** Separación entre líneas de un mismo canal de aristas. */
const PASO_CANAL = 12;
/** Hueco entre la caja de una banda y lo que tiene alrededor. */
const MARGEN = 16;
/** Espacio entre nodos vecinos de una banda. */
const SEPARACION_BANDA = 32;

/**
 * Tamaño de la caja de un nodo, estimado a partir del texto.
 *
 * ELK necesita las cajas antes de pintar, así que no se puede medir el DOM: se
 * estima con un ancho medio por carácter (DM Sans/Geist a 14 px ≈ 7,4 px) y la
 * etiqueta pasa a dos líneas antes de ensanchar la caja más allá de `ANCHO_MAX`.
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

export function medirEtiqueta(texto: string): { ancho: number; alto: number } {
  return { ancho: Math.round(texto.length * 6.4 + 14), alto: 20 };
}

/* ─────────────────────────── Ejes canónicos ────────────────────────────
 * La composición de bandas se escribe una sola vez, con `u` a lo largo del
 * flujo y `v` a lo ancho. Con dirección «derecha» u = x; con «abajo» u = y. */

const trasponerPunto = (p: Punto): Punto => ({ x: p.y, y: p.x });
const trasponerCaja = <T extends Caja>(c: T): T => ({ ...c, x: c.y, y: c.x, ancho: c.alto, alto: c.ancho });

/* ─────────────────────────────── Distribución ─────────────────────────── */

type Clase = "flujo" | "TF" | "BF" | "TT" | "BB" | "TB";

interface AristaClasificada {
  indice: number;
  desde: string;
  hasta: string;
  clase: Clase;
}

const capaDe = (nodo: NodoProceso): CapaProceso => nodo.capa ?? "flujo";

/**
 * Distribuye un nivel: los `hijos` de `nivel` y sus `aristas`.
 *
 * El flujo lo coloca ELK (`layered`, enrutado ortogonal que esquiva nodos) con
 * un subgrafo por `grupo` como carril. Las capas transversal y base van en
 * bandas a todo lo ancho, antes y después del flujo, y sus aristas hacia el
 * flujo entran por puertos del borde del grafo de ELK: la parte de dentro la
 * enruta ELK y la de fuera recorre solo huecos vacíos (el canal entre banda y
 * flujo), así que tampoco pisa ninguna caja.
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

  // Sin flujo no hay bandas que ordenar: todo se distribuye como flujo.
  const hayFlujo = hijos.some((n) => capaDe(n) === "flujo");
  const capa = (id: string): CapaProceso => (hayFlujo ? capaDe(porId.get(id)!) : "flujo");

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
  const aristaOriginal = (a: AristaClasificada) => nivel.aristas![a.indice];

  /* ── 1. El flujo, con ELK ── */

  const flujo = hijos.filter((n) => capa(n.id) === "flujo");
  const ordenGrupos = [
    ...new Set([
      ...(opciones.grupos ?? []).map((g) => g.id),
      ...flujo.map((n) => n.grupo).filter((g): g is string => Boolean(g)),
    ]),
  ].filter((g) => flujo.some((n) => n.grupo === g));
  const conCarriles = ordenGrupos.length >= 2;

  const hojaElk = (n: NodoProceso): ElkNode => ({
    id: n.id,
    width: medidas.get(n.id)!.ancho,
    height: medidas.get(n.id)!.alto,
  });

  const hijosElk: ElkNode[] = conCarriles
    ? [
        ...ordenGrupos.map<ElkNode>((g) => ({
          id: `carril:${g}`,
          children: flujo.filter((n) => n.grupo === g).map(hojaElk),
          layoutOptions: { "elk.padding": "[top=44,left=16,bottom=16,right=16]" },
        })),
        ...flujo.filter((n) => !n.grupo || !ordenGrupos.includes(n.grupo)).map(hojaElk),
      ]
    : flujo.map(hojaElk);

  const ladoTransversal = derecha ? "NORTH" : "WEST";
  const ladoBase = derecha ? "SOUTH" : "EAST";
  const puertos = aristas
    .filter((a) => a.clase === "TF" || a.clase === "BF")
    .map((a) => ({
      id: `puerto:${a.indice}`,
      width: 0,
      height: 0,
      layoutOptions: { "elk.port.side": a.clase === "TF" ? ladoTransversal : ladoBase },
    }));

  const aristasElk: ElkExtendedEdge[] = aristas
    .filter((a) => a.clase === "flujo" || a.clase === "TF" || a.clase === "BF")
    .map((a) => {
      const texto = aristaOriginal(a).etiqueta;
      const puerto = `puerto:${a.indice}`;
      const origenEsFlujo = capa(a.desde) === "flujo";
      const destinoEsFlujo = capa(a.hasta) === "flujo";
      return {
        id: `arista:${a.indice}`,
        sources: [origenEsFlujo ? a.desde : puerto],
        targets: [destinoEsFlujo ? a.hasta : puerto],
        labels: texto ? [{ text: texto, ...dimensionesElk(medirEtiqueta(texto)) }] : undefined,
      };
    });

  const opcionesComunes = {
    "elk.algorithm": "layered",
    "elk.direction": derecha ? "RIGHT" : "DOWN",
    "elk.hierarchyHandling": "INCLUDE_CHILDREN",
    "elk.edgeRouting": "ORTHOGONAL",
    "elk.edgeLabels.placement": "CENTER",
    "elk.spacing.nodeNode": "40",
    "elk.spacing.edgeNode": "24",
    "elk.spacing.edgeEdge": "14",
    "elk.spacing.edgeLabel": "6",
    "elk.layered.spacing.nodeNodeBetweenLayers": "72",
    "elk.layered.spacing.edgeNodeBetweenLayers": "24",
    "elk.layered.spacing.edgeEdgeBetweenLayers": "14",
  };
  // ELK no admite aristas desde los puertos del grafo raíz: el nivel va
  // envuelto en un nodo compuesto, y los puertos son de ese nodo.
  const grafo: ElkNode = {
    id: "lienzo",
    layoutOptions: {
      ...opcionesComunes,
      "elk.json.edgeCoords": "ROOT",
      "elk.json.shapeCoords": "ROOT",
      "elk.padding": "[top=0,left=0,bottom=0,right=0]",
    },
    children: [
      {
        id: "nivel",
        layoutOptions: {
          ...opcionesComunes,
          "elk.portConstraints": "FIXED_SIDE",
          "elk.padding": "[top=16,left=16,bottom=16,right=16]",
        },
        ports: puertos,
        children: hijosElk,
        edges: aristasElk,
      },
    ],
  };

  const raiz = flujo.length > 0 ? await distribuirConRespaldo(motor, grafo) : null;
  const resultado: ElkNode = raiz?.children?.[0] ?? { id: "nivel", width: 0, height: 0 };
  const origen = { x: resultado.x ?? 0, y: resultado.y ?? 0 };
  const alOrigen = <T extends { x?: number; y?: number }>(e: T): T => ({ ...e, x: (e.x ?? 0) - origen.x, y: (e.y ?? 0) - origen.y });

  // Todo a coordenadas canónicas (u a lo largo del flujo).
  const canon = <T extends Caja>(c: T): T => (derecha ? c : trasponerCaja(c));
  const canonP = (p: Punto): Punto => (derecha ? p : trasponerPunto(p));

  const cajasFlujo = new Map<string, Caja>();
  const carrilesCanon: CarrilDistribuido[] = [];
  for (const hijo of resultado.children ?? []) {
    const caja = canon(cajaElk(alOrigen(hijo)));
    if (hijo.id.startsWith("carril:")) {
      const id = hijo.id.slice("carril:".length);
      carrilesCanon.push({ id, etiqueta: opciones.grupos?.find((g) => g.id === id)?.etiqueta ?? id, ...caja });
      for (const nieto of hijo.children ?? []) cajasFlujo.set(nieto.id, canon(cajaElk(alOrigen(nieto))));
    } else {
      cajasFlujo.set(hijo.id, caja);
    }
  }
  const tamFlujo = canon({ x: 0, y: 0, ancho: resultado.width ?? 0, alto: resultado.height ?? 0 });

  const puertosCanon = new Map<string, Punto>();
  for (const p of resultado.ports ?? []) puertosCanon.set(p.id, canonP({ x: (p.x ?? 0) - origen.x, y: (p.y ?? 0) - origen.y }));

  const seccionesElk = new Map<string, { puntos: Punto[]; etiqueta?: EtiquetaDistribuida }>();
  for (const arista of recogerAristas(resultado)) {
    const puntos = (arista.sections ?? []).flatMap((s) => [s.startPoint, ...(s.bendPoints ?? []), s.endPoint]);
    const et = arista.labels?.[0];
    seccionesElk.set(arista.id, {
      puntos: puntos.map((p: ElkPoint) => canonP({ x: p.x - origen.x, y: p.y - origen.y })),
      etiqueta:
        et && et.text
          ? { texto: et.text, ...canon({ x: (et.x ?? 0) - origen.x, y: (et.y ?? 0) - origen.y, ancho: et.width ?? 0, alto: et.height ?? 0 }) }
          : undefined,
    });
  }

  /* ── 2. Bandas y canales, en coordenadas canónicas ── */

  const transversales = hijos.filter((n) => capa(n.id) === "transversal");
  const bases = hijos.filter((n) => capa(n.id) === "base");
  const hayT = transversales.length > 0;
  const hayB = bases.length > 0;
  const hayBandas = hayT || hayB;

  const de = (clase: Clase) => aristas.filter((a) => a.clase === clase);
  const tf = de("TF");
  const bf = de("BF");
  const tt = de("TT");
  const bb = de("BB");
  const tb = de("TB");

  const banda = (id: string) => capa(id) as "transversal" | "base";
  const lead = hayBandas ? (derecha ? 148 : 44) : 0;
  const tam = (id: string) => {
    const m = medidas.get(id)!;
    return derecha ? m : { ancho: m.alto, alto: m.ancho };
  };
  const altoFila = (nodos: NodoProceso[]) => Math.max(0, ...nodos.map((n) => tam(n.id).alto));

  // Eje v. Las etiquetas de las aristas entre bandas van en una franja propia, por fuera de los canales.
  const grosorEtiqueta = (a: AristaClasificada) => {
    const texto = aristaOriginal(a).etiqueta;
    if (!texto) return 0;
    const m = medirEtiqueta(texto);
    return (derecha ? m.alto : m.ancho) + 4;
  };
  const etiquetasEn = (b: "transversal" | "base") =>
    Math.max(0, ...[...tt, ...bb, ...tb].filter((a) => banda(a.desde) === b).map(grosorEtiqueta));
  const canalesT = tt.length + tb.length;
  const canalesB = bb.length + tb.length;
  const extraT = etiquetasEn("transversal");
  const extraB = etiquetasEn("base");
  const vT0 = 0;
  const filaT = vT0 + MARGEN + extraT + canalesT * PASO_CANAL;
  const vT1 = hayT ? filaT + altoFila(transversales) + MARGEN : 0;
  const vF0 = hayT ? vT1 + MARGEN + Math.max(1, tf.length) * PASO_CANAL + MARGEN : 0;
  const vF1 = vF0 + tamFlujo.alto;
  const vB0 = hayB ? vF1 + MARGEN + Math.max(1, bf.length) * PASO_CANAL + MARGEN : vF1;
  const filaB = vB0 + MARGEN;
  const finFilaB = filaB + altoFila(bases);
  const vB1 = hayB ? finFilaB + MARGEN + canalesB * PASO_CANAL + extraB + MARGEN : vF1;

  const uF0 = lead;
  const moverFlujo = (p: Punto): Punto => ({ x: p.x + uF0, y: p.y + vF0 });
  const moverCaja = <T extends Caja>(c: T): T => ({ ...c, x: c.x + uF0, y: c.y + vF0 });

  const cajas = new Map<string, Caja>();
  for (const [id, c] of cajasFlujo) cajas.set(id, moverCaja(c));

  // Eje u de cada banda: cada nodo, lo más cerca posible de los puertos con los que habla.
  const colocarBanda = (nodos: NodoProceso[], conFlujo: AristaClasificada[], fila: number, altoDeFila: number) => {
    const deseado = new Map<string, number>();
    for (const n of nodos) {
      const us = conFlujo
        .filter((a) => a.desde === n.id || a.hasta === n.id)
        .map((a) => puertosCanon.get(`puerto:${a.indice}`))
        .filter((p): p is Punto => Boolean(p))
        .map((p) => p.x + uF0);
      if (us.length) deseado.set(n.id, us.reduce((s, u) => s + u, 0) / us.length);
    }
    const orden = nodos
      .map((n, i) => ({ n, i, d: deseado.get(n.id) }))
      .sort((a, b) => (a.d ?? Infinity) - (b.d ?? Infinity) || a.i - b.i);
    let cursor = lead + MARGEN;
    for (const { n, d } of orden) {
      const { ancho, alto } = tam(n.id);
      const u = Math.max(cursor, d === undefined ? cursor : d - ancho / 2);
      cajas.set(n.id, { x: u, y: fila + (altoDeFila - alto) / 2, ancho, alto });
      cursor = u + ancho + SEPARACION_BANDA;
    }
    return cursor - SEPARACION_BANDA;
  };
  const finT = hayT ? colocarBanda(transversales, tf, filaT, altoFila(transversales)) : 0;
  const finB = hayB ? colocarBanda(bases, bf, filaB, altoFila(bases)) : 0;

  const uFin = Math.max(uF0 + tamFlujo.ancho, finT + MARGEN, finB + MARGEN);
  const uCanalLateral = (j: number) => uFin + MARGEN + j * PASO_CANAL;
  const anchoTotal = tb.length ? uCanalLateral(tb.length - 1) + MARGEN : uFin;
  const altoTotal = hayB ? vB1 : vF1;

  // Puntos de enganche: varias aristas por el mismo lado de un nodo se reparten a lo largo del lado.
  type Lado = "antes" | "despues"; // v mínima o v máxima de la caja
  const enganches = new Map<string, { clave: string; hacia: number }[]>();
  const pedirEnganche = (nodo: string, lado: Lado, clave: string, hacia: number) => {
    const k = `${nodo}|${lado}`;
    if (!enganches.has(k)) enganches.set(k, []);
    enganches.get(k)!.push({ clave, hacia });
  };
  const enganche = (nodo: string, lado: Lado, clave: string): Punto => {
    const lista = [...enganches.get(`${nodo}|${lado}`)!].sort((a, b) => a.hacia - b.hacia);
    const k = lista.findIndex((e) => e.clave === clave);
    const c = cajas.get(nodo)!;
    return { x: c.x + (c.ancho * (k + 1)) / (lista.length + 1), y: lado === "antes" ? c.y : c.y + c.alto };
  };

  const centroU = (id: string) => cajas.get(id)!.x + cajas.get(id)!.ancho / 2;
  const ladoExterior = (id: string): Lado => (banda(id) === "transversal" ? "antes" : "despues");
  const ladoInterior = (id: string): Lado => (banda(id) === "transversal" ? "despues" : "antes");

  for (const a of [...tf, ...bf]) {
    const nodoBanda = capa(a.desde) === "flujo" ? a.hasta : a.desde;
    const p = puertosCanon.get(`puerto:${a.indice}`);
    pedirEnganche(nodoBanda, ladoInterior(nodoBanda), `a${a.indice}`, (p?.x ?? 0) + uF0);
  }
  for (const a of [...tt, ...bb, ...tb]) {
    pedirEnganche(a.desde, ladoExterior(a.desde), `a${a.indice}:o`, a.clase === "TB" ? Infinity : centroU(a.hasta));
    pedirEnganche(a.hasta, ladoExterior(a.hasta), `a${a.indice}:d`, a.clase === "TB" ? Infinity : centroU(a.desde));
  }

  const lineaCanalT = (i: number) => vT0 + MARGEN + extraT + i * PASO_CANAL;
  const lineaCanalB = (i: number) => finFilaB + MARGEN + i * PASO_CANAL;
  const lineaHuecoT = (i: number) => vT1 + MARGEN + i * PASO_CANAL;
  const lineaHuecoB = (i: number) => vF1 + MARGEN + i * PASO_CANAL;

  const aristasCanon: AristaDistribuida[] = [];
  const empujar = (a: AristaClasificada, puntos: Punto[], etiqueta?: EtiquetaDistribuida) => {
    const original = aristaOriginal(a);
    aristasCanon.push({
      id: `arista:${a.indice}`,
      desde: a.desde,
      hasta: a.hasta,
      puntos: limpiarPoligonal(puntos),
      etiqueta,
      estilo: original.estilo ?? "continua",
      animada: Boolean(original.animada),
    });
  };

  for (const a of de("flujo")) {
    const s = seccionesElk.get(`arista:${a.indice}`);
    if (!s) continue;
    empujar(a, s.puntos.map(moverFlujo), s.etiqueta && moverCaja(s.etiqueta));
  }

  const ordenarHueco = (lista: AristaClasificada[]) =>
    [...lista].sort(
      (x, y) => (puertosCanon.get(`puerto:${x.indice}`)?.x ?? 0) - (puertosCanon.get(`puerto:${y.indice}`)?.x ?? 0),
    );
  ordenarHueco(tf).forEach((a, i) => rutaHaciaFlujo(a, lineaHuecoT(i)));
  ordenarHueco(bf).forEach((a, i) => rutaHaciaFlujo(a, lineaHuecoB(i)));

  function rutaHaciaFlujo(a: AristaClasificada, lineaV: number) {
    const s = seccionesElk.get(`arista:${a.indice}`);
    if (!s || s.puntos.length === 0) return;
    const dentro = s.puntos.map(moverFlujo);
    const desdeBanda = capa(a.desde) !== "flujo";
    const nodoBanda = desdeBanda ? a.desde : a.hasta;
    const e = enganche(nodoBanda, ladoInterior(nodoBanda), `a${a.indice}`);
    const puerto = desdeBanda ? dentro[0] : dentro[dentro.length - 1];
    const fuera = [e, { x: e.x, y: lineaV }, { x: puerto.x, y: lineaV }, puerto];
    empujar(
      a,
      desdeBanda ? [...fuera, ...dentro.slice(1)] : [...dentro.slice(0, -1), ...fuera.reverse()],
      s.etiqueta && moverCaja(s.etiqueta),
    );
  }

  let iT = 0;
  let iB = 0;
  for (const a of [...tt, ...bb]) {
    const linea = a.clase === "TT" ? lineaCanalT(iT++) : lineaCanalB(iB++);
    const o = enganche(a.desde, ladoExterior(a.desde), `a${a.indice}:o`);
    const d = enganche(a.hasta, ladoExterior(a.hasta), `a${a.indice}:d`);
    const puntos = [o, { x: o.x, y: linea }, { x: d.x, y: linea }, d];
    empujar(a, puntos, etiquetaEnCanal(aristaOriginal(a).etiqueta, puntos[1], puntos[2], banda(a.desde), derecha));
  }
  tb.forEach((a, j) => {
    const lineaO = banda(a.desde) === "transversal" ? lineaCanalT(iT++) : lineaCanalB(iB++);
    const lineaD = banda(a.hasta) === "transversal" ? lineaCanalT(iT++) : lineaCanalB(iB++);
    const lateral = uCanalLateral(j);
    const o = enganche(a.desde, ladoExterior(a.desde), `a${a.indice}:o`);
    const d = enganche(a.hasta, ladoExterior(a.hasta), `a${a.indice}:d`);
    const puntos = [o, { x: o.x, y: lineaO }, { x: lateral, y: lineaO }, { x: lateral, y: lineaD }, { x: d.x, y: lineaD }, d];
    empujar(a, puntos, etiquetaEnCanal(aristaOriginal(a).etiqueta, puntos[1], puntos[2], banda(a.desde), derecha));
  });

  const bandasCanon: BandaDistribuida[] = [];
  const etiquetaBanda = (c: "transversal" | "base") =>
    opciones.etiquetasBandas?.[c] ?? (c === "transversal" ? "Transversal" : "Base");
  const tituloBanda = (v0: number, v1: number): Caja =>
    derecha
      ? { x: MARGEN / 2, y: v0 + MARGEN / 2, ancho: lead - MARGEN, alto: v1 - v0 - MARGEN }
      : { x: v0 + MARGEN / 2, y: MARGEN / 2, ancho: v1 - v0 - MARGEN, alto: lead - MARGEN }; // ya traspuesto: ver abajo
  if (hayT) {
    bandasCanon.push({ capa: "transversal", etiqueta: etiquetaBanda("transversal"), x: 0, y: vT0, ancho: anchoTotal, alto: vT1 - vT0, titulo: tituloBanda(vT0, vT1) });
  }
  if (hayB) {
    bandasCanon.push({ capa: "base", etiqueta: etiquetaBanda("base"), x: 0, y: vB0, ancho: anchoTotal, alto: vB1 - vB0, titulo: tituloBanda(vB0, vB1) });
  }

  /* ── 3. De vuelta a coordenadas reales ── */

  const real = <T extends Caja>(c: T): T => (derecha ? c : trasponerCaja(c));
  const realP = (p: Punto): Punto => (derecha ? p : trasponerPunto(p));

  const nodos: NodoDistribuido[] = hijos
    .filter((n) => cajas.has(n.id))
    .map((n) => {
      const c = real(cajas.get(n.id)!);
      return { id: n.id, capa: capa(n.id), grupo: n.grupo, x: c.x, y: c.y, ancho: c.ancho, alto: c.alto };
    });

  return {
    ancho: Math.ceil(derecha ? anchoTotal : altoTotal),
    alto: Math.ceil(derecha ? altoTotal : anchoTotal),
    direccion,
    nodos,
    carriles: carrilesCanon.map((c) => real(moverCaja(c))),
    // El título ya se calculó en coordenadas reales; el resto de la banda se traspone.
    bandas: bandasCanon.map((b) => ({ ...real(b), titulo: b.titulo })),
    aristas: aristasCanon.map((a) => ({
      ...a,
      puntos: a.puntos.map(realP),
      etiqueta: a.etiqueta && (derecha ? a.etiqueta : { ...a.etiqueta, ...sinTexto(real(a.etiqueta)) }),
    })),
  };
}

/* ─────────────────────────────── Auxiliares ─────────────────────────────── */

/**
 * Perfiles de opciones que se prueban en orden.
 *
 * El primero acorta las aristas largas tras colocar los nodos (con el Mapa de
 * CoreLink, 2.744 → 2.156 px de ancho). Pero ELK (elkjs 0.12) aborta con
 * algunas combinaciones de opciones y grafos concretos —medido: este perfil
 * rompe con el contexto C4 de ejemplo, y `NETWORK_SIMPLEX` o `PREFER_NODES`
 * rompen con el Mapa de CoreLink—, y no hay una combinación compacta que valga
 * para todos. Si un perfil falla se prueba el siguiente; el último es el de
 * fábrica, menos compacto pero el más probado.
 */
export const PERFILES_ELK: readonly Record<string, string>[] = [
  { "elk.layered.considerModelOrder.strategy": "PREFER_EDGES", "elk.layered.compaction.postCompaction.strategy": "EDGE_LENGTH" },
  { "elk.layered.considerModelOrder.strategy": "NONE", "elk.layered.compaction.postCompaction.strategy": "NONE" },
];

async function distribuirConRespaldo(motor: MotorDistribucion, grafo: ElkNode): Promise<ElkNode> {
  let primerError: unknown;
  for (const perfil of PERFILES_ELK) {
    const intento = structuredClone(grafo);
    const aplicar = (n: ElkNode) => {
      if (n.layoutOptions) Object.assign(n.layoutOptions, perfil);
      n.children?.forEach(aplicar);
    };
    aplicar(intento);
    try {
      return await motor.layout(intento);
    } catch (error) {
      primerError ??= error;
    }
  }
  throw primerError;
}

function dimensionesElk(m: { ancho: number; alto: number }) {
  return { width: m.ancho, height: m.alto };
}

function cajaElk(n: { x?: number; y?: number; width?: number; height?: number }): Caja {
  return { x: n.x ?? 0, y: n.y ?? 0, ancho: n.width ?? 0, alto: n.height ?? 0 };
}

function sinTexto(c: Caja): Caja {
  return { x: c.x, y: c.y, ancho: c.ancho, alto: c.alto };
}

function recogerAristas(nodo: ElkNode): ElkExtendedEdge[] {
  return [...(nodo.edges ?? []), ...(nodo.children ?? []).flatMap(recogerAristas)];
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
 * Etiqueta de una arista entre bandas, junto a su tramo de canal (canónico) y
 * del lado de fuera: en la banda transversal, antes de la línea; en la base,
 * después. Así nunca queda entre el canal y la fila de nodos.
 */
function etiquetaEnCanal(
  texto: string | undefined,
  a: Punto,
  b: Punto,
  banda: "transversal" | "base",
  derecha: boolean,
): EtiquetaDistribuida | undefined {
  if (!texto) return undefined;
  const m = medirEtiqueta(texto);
  // En canónico, con dirección «abajo», el ancho del texto corre a lo largo de v.
  const largoU = derecha ? m.ancho : m.alto;
  const grosorV = derecha ? m.alto : m.ancho;
  const v = banda === "transversal" ? a.y - 2 - grosorV : a.y + 2;
  return { texto, x: (a.x + b.x) / 2 - largoU / 2, y: v, ancho: largoU, alto: grosorV };
}
