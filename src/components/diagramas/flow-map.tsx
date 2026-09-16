import * as React from "react";
import { Panel, ReactFlow, ReactFlowProvider, useReactFlow, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { ChevronRight, Maximize, ZoomIn, ZoomOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

import { trazoRedondeado } from "./svg";
import { ACENTO, CARRIL, tonoDeNodo } from "./tonos";
import type { BandaDistribuida, Distribucion, GrupoProceso, NodoProceso, TonoGrupo } from "./types";


/* ─────────────────────────────── Tarjeta ─────────────────────────────── */

export interface TarjetaProcesoProps {
  nodo: NodoProceso;
  tono: TonoGrupo;
  seleccionado?: boolean;
  onActivar: (id: string) => void;
  className?: string;
}

/**
 * La caja de un proceso: la misma en el lienzo y en la lista de etapas. Es un
 * `role="button"` enfocable que se activa con clic, Intro o Espacio.
 */
export function TarjetaProceso({ nodo, tono, seleccionado, onActivar, className }: TarjetaProcesoProps) {
  const conHijos = Boolean(nodo.hijos?.length);
  const conDetalle = Boolean(nodo.detalle || nodo.enlaces?.length);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={conHijos ? undefined : Boolean(seleccionado)}
      data-proceso={nodo.id}
      onClick={() => onActivar(nodo.id)}
      onKeyDown={(evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          onActivar(nodo.id);
        }
      }}
      className={cn(
        "group relative flex h-full w-full cursor-pointer items-center gap-3 overflow-hidden rounded-lg border bg-card py-2 pl-4 pr-3 text-left text-card-foreground shadow-sm",
        "transition-colors hover:border-primary/60 hover:bg-accent/40",
        nodo.externo ? "border-dashed border-muted-foreground/50" : "border-border",
        seleccionado && "border-primary ring-1 ring-primary",
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
          <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
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

type DatosProceso = { nodo: NodoProceso; tono: TonoGrupo; seleccionado: boolean; onActivar: (id: string) => void };
type DatosCarril = { etiqueta: string; tono: TonoGrupo };
type DatosBanda = { banda: BandaDistribuida };
type DatosAristas = { distribucion: Distribucion; animado: boolean; idBase: string };

type NodoLienzo =
  | Node<DatosProceso, "proceso">
  | Node<DatosCarril, "carril">
  | Node<DatosBanda, "banda">
  | Node<DatosAristas, "aristas">;

function NodoProcesoLienzo({ data }: NodeProps<Node<DatosProceso, "proceso">>) {
  return <TarjetaProceso nodo={data.nodo} tono={data.tono} seleccionado={data.seleccionado} onActivar={data.onActivar} />;
}

function NodoCarril({ data }: NodeProps<Node<DatosCarril, "carril">>) {
  return (
    <div className={cn("h-full w-full rounded-xl border", CARRIL[data.tono].caja)}>
      <div className="flex items-center gap-2 px-4 pt-3 text-[13px] font-semibold text-foreground">
        <span aria-hidden className={cn("h-2 w-2 rounded-full", CARRIL[data.tono].punto)} />
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
  const { distribucion, animado, idBase } = data;
  const flecha = `${idBase}-flecha`;
  const flechaActiva = `${idBase}-flecha-activa`;
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
      {distribucion.aristas.map((a) => {
        const activa = animado || a.animada;
        return (
          <path
            key={a.id}
            d={trazoRedondeado(a.puntos)}
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            strokeDasharray={a.estilo === "discontinua" ? "6 4" : undefined}
            markerEnd={`url(#${activa ? flechaActiva : flecha})`}
            className={cn(activa && "piensa-process-map-animada stroke-primary")}
            data-arista={a.id}
          />
        );
      })}
      {distribucion.aristas.map((a) =>
        a.etiqueta ? (
          <g key={`${a.id}-etiqueta`}>
            <rect
              x={a.etiqueta.x}
              y={a.etiqueta.y}
              width={a.etiqueta.ancho}
              height={a.etiqueta.alto}
              rx={6}
              className="fill-card stroke-border"
            />
            <text
              x={a.etiqueta.x + a.etiqueta.ancho / 2}
              y={a.etiqueta.y + a.etiqueta.alto / 2}
              dominantBaseline="central"
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
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

function Controles({ tamano }: { tamano?: string }) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  // El lienzo cambia de tamaño (alto automático, panel de detalle): se vuelve a encuadrar.
  React.useEffect(() => {
    const cuadro = requestAnimationFrame(() => fitView({ padding: 0.08 }));
    return () => cancelAnimationFrame(cuadro);
  }, [tamano, fitView]);
  return (
    <Panel position="top-right" className="flex gap-1 rounded-lg border border-border bg-card/90 p-1 shadow-sm">
      <Button type="button" variant="plain" size="xs" aria-label="Acercar" onClick={() => zoomIn()}>
        <ZoomIn />
      </Button>
      <Button type="button" variant="plain" size="xs" aria-label="Alejar" onClick={() => zoomOut()}>
        <ZoomOut />
      </Button>
      <Button type="button" variant="plain" size="xs" aria-label="Ajustar a la vista" onClick={() => fitView({ padding: 0.08 })}>
        <Maximize />
      </Button>
    </Panel>
  );
}

export interface FlowMapProps {
  distribucion: Distribucion;
  nivel: NodoProceso;
  grupos?: GrupoProceso[];
  animado?: boolean;
  seleccionado?: string | null;
  onActivar: (id: string) => void;
  /** Cambia cuando cambia el tamaño del contenedor, para volver a encuadrar. */
  tamano?: string;
}

/**
 * El lienzo de un nivel: pinta una `Distribucion` ya calculada sobre React
 * Flow (desplazar, acercar, ajustar). No distribuye nada: eso lo hace
 * `distribuirNivel`. Interno; la API pública es `ProcessMap`.
 */
export function FlowMap({ distribucion, nivel, grupos, animado = false, seleccionado, onActivar, tamano }: FlowMapProps) {
  const idBase = React.useId().replace(/:/g, "");
  const porId = React.useMemo(() => new Map((nivel.hijos ?? []).map((n) => [n.id, n])), [nivel]);

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
        data: { etiqueta: c.etiqueta, tono: grupos?.find((g) => g.id === c.id)?.tono ?? "primary" },
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
      data: { distribucion, animado, idBase },
      style: { pointerEvents: "none" },
    });
    // Orden de tabulación: a lo largo del flujo y, dentro de una misma altura, de izquierda a derecha.
    [...distribucion.nodos]
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .sort((a, b) => (distribucion.direccion === "derecha" ? a.x - b.x : a.y - b.y))
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
          data: { nodo: datos, tono: tonoDeNodo(datos, grupos), seleccionado: seleccionado === n.id, onActivar },
          // React Flow apaga los eventos de puntero de un nodo no seleccionable ni arrastrable;
          // la tarjeta los necesita para su clic.
          style: { pointerEvents: "all" },
          className: "nopan",
        });
      });
    return lista;
  }, [distribucion, grupos, animado, idBase, porId, seleccionado, onActivar]);

  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodos}
        edges={[]}
        nodeTypes={tiposDeNodo}
        fitView
        fitViewOptions={{ padding: 0.08 }}
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
        <Controles tamano={tamano} />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
