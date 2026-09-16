import * as React from "react";
import {
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  useViewport,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { ChevronRight, Maximize, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

import { MARGEN_LIENZO, calcularEncuadre, type Encuadre } from "./encuadre";
import { trazoRedondeado } from "./svg";
import { ACENTO, CARRIL, tonoDeNodo } from "./tonos";
import type { BandaDistribuida, Distribucion, GrupoProceso, NodoProceso, TonoGrupo } from "./types";

/* ─────────────────────────────── Tarjeta ─────────────────────────────── */

export interface TarjetaProcesoProps {
  nodo: NodoProceso;
  tono: TonoGrupo;
  seleccionado?: boolean;
  /** Otro proceso está resaltado y este no es vecino suyo. */
  atenuado?: boolean;
  onActivar: (id: string) => void;
  /** Avisa cuando el cursor o el foco entran (`id`) o salen (`null`). */
  onResaltar?: (id: string | null) => void;
  className?: string;
}

/**
 * La caja de un proceso: la misma en el lienzo y en la lista de etapas. Es un
 * `role="button"` enfocable que se activa con clic, Intro o Espacio.
 */
export function TarjetaProceso({ nodo, tono, seleccionado, atenuado, onActivar, onResaltar, className }: TarjetaProcesoProps) {
  const conHijos = Boolean(nodo.hijos?.length);
  const conDetalle = Boolean(nodo.detalle || nodo.enlaces?.length);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={conHijos ? undefined : Boolean(seleccionado)}
      data-proceso={nodo.id}
      data-atenuado={atenuado || undefined}
      onClick={() => onActivar(nodo.id)}
      onKeyDown={(evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          onActivar(nodo.id);
        }
      }}
      onMouseEnter={onResaltar && (() => onResaltar(nodo.id))}
      onMouseLeave={onResaltar && (() => onResaltar(null))}
      onFocus={onResaltar && (() => onResaltar(nodo.id))}
      onBlur={onResaltar && (() => onResaltar(null))}
      className={cn(
        "group relative flex h-full w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border bg-card py-2 pl-4 pr-3 text-left text-card-foreground shadow-sm",
        "transition-[border-color,background-color,opacity] hover:border-primary/60 hover:bg-accent/40 motion-reduce:transition-none",
        nodo.externo ? "border-dashed border-muted-foreground/50" : "border-border",
        seleccionado && "border-primary ring-1 ring-primary",
        atenuado && "opacity-40",
        focusRingOutside,
        className,
      )}
    >
      <span aria-hidden className={cn("absolute inset-y-2.5 left-0 w-[3px] rounded-r-full", ACENTO[tono])} />
      {nodo.icono ? (
        <IconTile icon={nodo.icono} iconSize="md" containerSize="md" shape="rounded" color={tono} containerColor={tono} />
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col">
        {nodo.insignia ? (
          <span className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {nodo.insignia}
          </span>
        ) : null}
        <span className="line-clamp-2 text-sm font-semibold leading-5" title={nodo.etiqueta}>
          {nodo.etiqueta}
        </span>
        {nodo.subtitulo ? (
          <span className="truncate text-xs text-muted-foreground" title={nodo.subtitulo}>
            {nodo.subtitulo}
          </span>
        ) : null}
        {conHijos ? (
          <span className="sr-only">. Tiene {nodo.hijos!.length} subprocesos: actívalo para entrar.</span>
        ) : conDetalle ? (
          <span className="sr-only">. Actívalo para ver el detalle.</span>
        ) : null}
      </span>
      {conHijos ? (
        <ChevronRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      ) : null}
    </div>
  );
}

/* ─────────────────────────────── Lienzo ─────────────────────────────── */

type DatosProceso = {
  nodo: NodoProceso;
  tono: TonoGrupo;
  seleccionado: boolean;
  atenuado: boolean;
  onActivar: (id: string) => void;
  onResaltar: (id: string | null) => void;
};
type DatosCarril = { etiqueta: string; tono: TonoGrupo; direccion: Distribucion["direccion"] };
type DatosBanda = { banda: BandaDistribuida };
type DatosAristas = {
  distribucion: Distribucion;
  animado: boolean;
  idBase: string;
  resaltado: string | null;
  ocultarTransversales: boolean;
};

type NodoLienzo =
  | Node<DatosProceso, "proceso">
  | Node<DatosCarril, "carril">
  | Node<DatosBanda, "banda">
  | Node<DatosAristas, "aristas">;

function NodoProcesoLienzo({ data }: NodeProps<Node<DatosProceso, "proceso">>) {
  return (
    <TarjetaProceso
      nodo={data.nodo}
      tono={data.tono}
      seleccionado={data.seleccionado}
      atenuado={data.atenuado}
      onActivar={data.onActivar}
      onResaltar={data.onResaltar}
    />
  );
}

function NodoCarril({ data }: NodeProps<Node<DatosCarril, "carril">>) {
  return (
    <div className={cn("h-full w-full rounded-xl border", CARRIL[data.tono].caja)}>
      <div
        className={cn(
          "flex items-start gap-2 text-sm font-semibold leading-5 text-foreground",
          data.direccion === "derecha" ? "w-[132px] px-4 pt-4" : "px-4 pt-3",
        )}
      >
        <span aria-hidden className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", CARRIL[data.tono].punto)} />
        {data.etiqueta}
      </div>
    </div>
  );
}

function NodoBanda({ data }: NodeProps<Node<DatosBanda, "banda">>) {
  const { banda } = data;
  return (
    <div className="relative h-full w-full border-y border-dashed border-border bg-muted/40">
      <div
        className="absolute flex items-start text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        style={{
          left: banda.titulo.x - banda.x,
          top: banda.titulo.y - banda.y,
          width: banda.titulo.ancho,
          height: banda.titulo.alto,
        }}
      >
        {banda.etiqueta}
      </div>
    </div>
  );
}

function NodoAristas({ data }: NodeProps<Node<DatosAristas, "aristas">>) {
  const { distribucion, animado, idBase, resaltado, ocultarTransversales } = data;
  const flecha = `${idBase}-flecha`;
  const flechaActiva = `${idBase}-flecha-activa`;
  const toca = (a: { desde: string; hasta: string }) => resaltado !== null && (a.desde === resaltado || a.hasta === resaltado);
  const visibles = distribucion.aristas.filter((a) => !a.transversal || !ocultarTransversales || toca(a));
  // Las resaltadas, encima.
  const ordenadas = [...visibles].sort((a, b) => Number(toca(a)) - Number(toca(b)));
  return (
    <svg
      width={distribucion.ancho}
      height={distribucion.alto}
      className="pointer-events-none block overflow-visible text-muted-foreground"
      aria-hidden
    >
      <defs>
        <style>{`
          @keyframes piensa-process-map-flujo { to { stroke-dashoffset: -24; } }
          .piensa-process-map-animada { stroke-dasharray: 8 4; animation: piensa-process-map-flujo 1.2s linear infinite; }
          @media (prefers-reduced-motion: reduce) { .piensa-process-map-animada { animation: none; } }
        `}</style>
        <marker id={flecha} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill="currentColor" />
        </marker>
        <marker id={flechaActiva} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="fill-primary" />
        </marker>
      </defs>
      {ordenadas.map((a) => {
        const destacada = toca(a);
        const activa = animado || a.animada || destacada;
        return (
          <path
            key={a.id}
            d={trazoRedondeado(a.puntos)}
            fill="none"
            strokeWidth={destacada ? 2.25 : 1.5}
            stroke="currentColor"
            strokeDasharray={a.estilo === "discontinua" ? "6 4" : undefined}
            markerEnd={`url(#${activa ? flechaActiva : flecha})`}
            opacity={resaltado !== null && !destacada ? 0.18 : 1}
            className={cn((animado || a.animada) && "piensa-process-map-animada", activa && "stroke-primary")}
            data-arista={a.id}
          />
        );
      })}
      {ordenadas.map((a) =>
        a.etiqueta ? (
          <g key={`${a.id}-etiqueta`} opacity={resaltado !== null && !toca(a) ? 0.25 : 1}>
            <rect
              x={a.etiqueta.x}
              y={a.etiqueta.y}
              width={a.etiqueta.ancho}
              height={a.etiqueta.alto}
              rx={6}
              className={cn("fill-card", toca(a) ? "stroke-primary" : "stroke-border")}
            />
            <text
              x={a.etiqueta.x + a.etiqueta.ancho / 2}
              y={a.etiqueta.y + a.etiqueta.alto / 2}
              dominantBaseline="central"
              textAnchor="middle"
              className={cn("text-xs", toca(a) ? "fill-foreground" : "fill-muted-foreground")}
            >
              {a.etiqueta.texto}
            </text>
          </g>
        ) : null,
      )}
    </svg>
  );
}

const tiposDeNodo = {
  proceso: NodoProcesoLienzo,
  carril: NodoCarril,
  banda: NodoBanda,
  aristas: NodoAristas,
};

interface ControlesProps {
  encuadre: Encuadre;
  distribucion: Distribucion;
  contenedor: { ancho: number; alto: number };
}

function Controles({ encuadre, distribucion, contenedor }: ControlesProps) {
  const { zoomIn, zoomOut, setViewport } = useReactFlow();
  const encuadrar = React.useCallback(
    () => setViewport({ x: encuadre.x, y: encuadre.y, zoom: encuadre.zoom }),
    [encuadre.x, encuadre.y, encuadre.zoom, setViewport],
  );
  // El lienzo cambió de tamaño (alto automático, panel de detalle): se vuelve a encuadrar.
  React.useEffect(() => {
    const cuadro = requestAnimationFrame(encuadrar);
    return () => cancelAnimationFrame(cuadro);
  }, [encuadrar]);
  return (
    <>
      <Panel position="top-right" className="flex gap-1 rounded-lg border border-border bg-card/90 p-1 shadow-sm">
        <Button type="button" variant="plain" size="xs" aria-label="Acercar" onClick={() => zoomIn()}>
          <ZoomIn />
        </Button>
        <Button type="button" variant="plain" size="xs" aria-label="Alejar" onClick={() => zoomOut()}>
          <ZoomOut />
        </Button>
        <Button type="button" variant="plain" size="xs" aria-label="Volver al encuadre inicial" onClick={encuadrar}>
          <Maximize />
        </Button>
      </Panel>
      <DesplazamientoHorizontal distribucion={distribucion} contenedor={contenedor} />
    </>
  );
}

/**
 * Barra de desplazamiento horizontal y pistas de «hay más» a los lados, cuando
 * el diagrama no cabe a lo ancho al zoom actual. El lienzo también se arrastra.
 */
function DesplazamientoHorizontal({ distribucion, contenedor }: Omit<ControlesProps, "encuadre">) {
  const { x, y, zoom } = useViewport();
  const { setViewport } = useReactFlow();
  const arrastre = React.useRef<{ inicio: number; progreso: number } | null>(null);

  const contenido = distribucion.ancho * zoom + 2 * MARGEN_LIENZO;
  if (!contenedor.ancho || contenido <= contenedor.ancho + 1) return null;

  const xMax = MARGEN_LIENZO;
  const xMin = contenedor.ancho - distribucion.ancho * zoom - MARGEN_LIENZO;
  const progreso = Math.min(1, Math.max(0, (xMax - x) / (xMax - xMin)));
  const anchoPulgar = Math.max(40, (contenedor.ancho * contenedor.ancho) / contenido);
  const recorrido = contenedor.ancho - anchoPulgar - 8;
  const ir = (p: number) => setViewport({ x: xMax - Math.min(1, Math.max(0, p)) * (xMax - xMin), y, zoom });

  return (
    <>
      {progreso > 0.01 ? (
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent" />
      ) : null}
      {progreso < 0.99 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-16 items-center justify-end bg-gradient-to-l from-background to-transparent pr-2"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      ) : null}
      <div
        role="scrollbar"
        aria-label="Desplazamiento horizontal del diagrama"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progreso * 100)}
        tabIndex={0}
        className={cn("nopan nodrag absolute inset-x-1 bottom-1 z-20 h-2.5 rounded-full bg-muted", focusRingOutside)}
        onKeyDown={(evento) => {
          const paso = evento.key === "ArrowRight" ? 0.1 : evento.key === "ArrowLeft" ? -0.1 : evento.key === "End" ? 1 : evento.key === "Home" ? -1 : 0;
          if (paso) {
            evento.preventDefault();
            ir(progreso + paso);
          }
        }}
        onPointerDown={(evento) => {
          const caja = evento.currentTarget.getBoundingClientRect();
          const dentroDelPulgar = evento.target !== evento.currentTarget;
          if (!dentroDelPulgar) ir((evento.clientX - caja.left - anchoPulgar / 2) / Math.max(1, recorrido));
          arrastre.current = { inicio: evento.clientX, progreso: dentroDelPulgar ? progreso : (evento.clientX - caja.left - anchoPulgar / 2) / Math.max(1, recorrido) };
          evento.currentTarget.setPointerCapture?.(evento.pointerId);
        }}
        onPointerMove={(evento) => {
          if (!arrastre.current) return;
          ir(arrastre.current.progreso + (evento.clientX - arrastre.current.inicio) / Math.max(1, recorrido));
        }}
        onPointerUp={() => {
          arrastre.current = null;
        }}
      >
        <div
          className="absolute inset-y-0 rounded-full bg-muted-foreground/50 hover:bg-muted-foreground/70"
          style={{ width: anchoPulgar, left: 4 + progreso * recorrido }}
        />
      </div>
    </>
  );
}

export interface FlowMapProps {
  distribucion: Distribucion;
  nivel: NodoProceso;
  grupos?: GrupoProceso[];
  animado?: boolean;
  seleccionado?: string | null;
  onActivar: (id: string) => void;
  /** Tamaño del contenedor, para el encuadre inicial. */
  contenedor: { ancho: number; alto: number };
  /** Oculta las aristas de las bandas salvo las del proceso resaltado. */
  ocultarTransversales?: boolean;
}

/**
 * El lienzo de un nivel: pinta una `Distribucion` ya calculada sobre React
 * Flow (desplazar, acercar, encuadrar) y resalta el proceso bajo el cursor, con
 * el foco o seleccionado, junto con sus vecinos. Interno; la API pública es
 * `ProcessMap`.
 */
export function FlowMap({
  distribucion,
  nivel,
  grupos,
  animado = false,
  seleccionado,
  onActivar,
  contenedor,
  ocultarTransversales = false,
}: FlowMapProps) {
  const idBase = React.useId().replace(/:/g, "");
  const porId = React.useMemo(() => new Map((nivel.hijos ?? []).map((n) => [n.id, n])), [nivel]);
  const [bajoCursor, setBajoCursor] = React.useState<string | null>(null);
  const resaltado = bajoCursor ?? seleccionado ?? null;
  const encuadre = calcularEncuadre(distribucion.ancho, distribucion.alto, contenedor);

  const vecinos = React.useMemo(() => {
    if (!resaltado) return null;
    const conjunto = new Set([resaltado]);
    for (const a of distribucion.aristas) {
      if (a.desde === resaltado) conjunto.add(a.hasta);
      if (a.hasta === resaltado) conjunto.add(a.desde);
    }
    return conjunto;
  }, [distribucion, resaltado]);

  const nodos = React.useMemo<NodoLienzo[]>(() => {
    const fijo = { draggable: false, selectable: false, connectable: false, focusable: false } as const;
    const lista: NodoLienzo[] = [];
    distribucion.bandas.forEach((b) =>
      lista.push({ ...fijo, id: `banda:${b.capa}`, type: "banda", position: { x: b.x, y: b.y }, width: b.ancho, height: b.alto, zIndex: 0, data: { banda: b }, style: { pointerEvents: "none" } }),
    );
    distribucion.carriles.forEach((c) =>
      lista.push({
        ...fijo,
        id: `carril:${c.id}`,
        type: "carril",
        position: { x: c.x, y: c.y },
        width: c.ancho,
        height: c.alto,
        zIndex: 1,
        data: { etiqueta: c.etiqueta, tono: grupos?.find((g) => g.id === c.id)?.tono ?? "primary", direccion: distribucion.direccion },
        style: { pointerEvents: "none" },
      }),
    );
    lista.push({
      ...fijo,
      id: "aristas",
      type: "aristas",
      position: { x: 0, y: 0 },
      width: distribucion.ancho,
      height: distribucion.alto,
      zIndex: 2,
      data: { distribucion, animado, idBase, resaltado, ocultarTransversales },
      style: { pointerEvents: "none" },
    });
    // Orden de tabulación: a lo largo del flujo y, en una misma etapa, de arriba abajo.
    [...distribucion.nodos]
      .sort((a, b) => (distribucion.direccion === "derecha" ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x))
      .forEach((n) => {
        const datos = porId.get(n.id);
        if (!datos) return;
        lista.push({
          ...fijo,
          id: n.id,
          type: "proceso",
          position: { x: n.x, y: n.y },
          width: n.ancho,
          height: n.alto,
          zIndex: 3,
          data: {
            nodo: datos,
            tono: tonoDeNodo(datos, grupos),
            seleccionado: seleccionado === n.id,
            atenuado: vecinos !== null && !vecinos.has(n.id),
            onActivar,
            onResaltar: setBajoCursor,
          },
          // React Flow apaga los eventos de puntero de un nodo no seleccionable ni arrastrable;
          // la tarjeta los necesita para su clic.
          style: { pointerEvents: "all" },
          className: "nopan",
        });
      });
    return lista;
  }, [distribucion, grupos, animado, idBase, porId, seleccionado, onActivar, resaltado, ocultarTransversales, vecinos]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodos}
        edges={[]}
        nodeTypes={tiposDeNodo}
        defaultViewport={{ x: encuadre.x, y: encuadre.y, zoom: encuadre.zoom }}
        translateExtent={[
          [-MARGEN_LIENZO * 4, -MARGEN_LIENZO * 4],
          [distribucion.ancho + MARGEN_LIENZO * 4, distribucion.alto + MARGEN_LIENZO * 4],
        ]}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        disableKeyboardA11y
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        panOnScroll={false}
        style={{ "--xy-attribution-background-color-default": "transparent" } as React.CSSProperties}
      >
        <Controles encuadre={encuadre} distribucion={distribucion} contenedor={contenedor} />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
