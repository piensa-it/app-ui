import * as React from "react";
import { ArrowLeft, Download, X } from "lucide-react";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { LinkComponent } from "@/components/marketing/public-header";
import { cn } from "@/lib/utils";

import { etapasDeNivel } from "./etapas";
import { FlowMap, TarjetaProceso } from "./flow-map";
import { tonoDeNodo } from "./tonos";
import { distribuirNivel, type MotorDistribucion } from "./layout";
import { cargarMotorElk } from "./motor-elk";
import { descargarSvg, distribucionASvg, resolverColores } from "./svg";
import type { DireccionDiagrama, Distribucion, GrupoProceso, NodoProceso } from "./types";

/** Por debajo de este ancho de ventana se muestra la lista de etapas en vez del lienzo. */
const CONSULTA_MOVIL = "(max-width: 859px)";

function useConsultaMedia(consulta: string): boolean {
  return React.useSyncExternalStore(
    (avisar) => {
      if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", avisar);
      return () => lista.removeEventListener("change", avisar);
    },
    () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(consulta).matches,
    () => false,
  );
}

export interface ProcessMapProps {
  /** El nodo cuyos `hijos` son el primer nivel que se ve. */
  raiz: NodoProceso;
  /** Nombre y color de los carriles (`NodoProceso.grupo`). */
  grupos?: GrupoProceso[];
  /** Hacia dónde corre el flujo. @default "derecha" */
  direccion?: DireccionDiagrama;
  /** Anima todas las aristas. Respeta `prefers-reduced-motion`. */
  animado?: boolean;
  /** Se llama con el `href` de un enlace del panel de detalle. Sin él, los enlaces son `<a href>`. */
  onEnlace?: (href: string) => void;
  /** Avisa cada cambio de nivel con la ruta desde la raíz. */
  onNivelChange?: (ruta: NodoProceso[]) => void;
  /**
   * Motor de distribución. Por defecto ELK en el hilo principal, cargado de
   * forma diferida; pasa uno sobre Web Worker si el mapa es grande.
   */
  motor?: MotorDistribucion;
  /** Nombre de cada nivel por profundidad (0 = raíz): «Ciclo», «Proceso»… o «Contexto», «Contenedores»… */
  nombresNiveles?: string[];
  /** Títulos de las bandas. */
  etiquetasBandas?: Partial<Record<"transversal" | "base", string>>;
  /**
   * `auto` muestra el lienzo y, por debajo de 860 px, la lista de etapas.
   * @default "auto"
   */
  vista?: "auto" | "diagrama" | "etapas";
  /**
   * Alto del lienzo en píxeles. Sin él, el lienzo toma la proporción del
   * nivel distribuido (entre 360 y 880 px), sin franjas vacías.
   */
  alto?: number;
  /** Muestra «Exportar SVG». @default true */
  exportable?: boolean;
  className?: string;
}

/**
 * Procesos por niveles: el ciclo de la empresa, cada proceso y cada
 * subproceso, con la misma pieza. Un clic en un proceso con `hijos` baja a
 * ellos, la miga de pan sube, y lo que la aplicación ata a cada proceso
 * (`enlaces`, `detalle`) se abre en un panel.
 *
 * La distribución la calcula ELK en cada nivel, así que las flechas no pisan
 * recuadros aunque cada aplicación tenga nodos distintos.
 */
export function ProcessMap({
  raiz,
  grupos,
  direccion = "derecha",
  animado = false,
  onEnlace,
  onNivelChange,
  motor,
  nombresNiveles,
  etiquetasBandas,
  vista = "auto",
  alto,
  exportable = true,
  className,
}: ProcessMapProps) {
  const [ruta, setRuta] = React.useState<NodoProceso[]>([raiz]);
  const [seleccionado, setSeleccionado] = React.useState<string | null>(null);
  const [resultado, setResultado] = React.useState<{ clave: string; distribucion?: Distribucion; error?: unknown } | null>(null);
  const titulo = React.useRef<HTMLHeadingElement>(null);
  const lienzo = React.useRef<HTMLDivElement>(null);
  const moverFoco = React.useRef(false);
  const ids = React.useId();

  // Si cambia la raíz, se vuelve a empezar desde ella.
  const [raizPrevia, setRaizPrevia] = React.useState(raiz);
  if (raizPrevia !== raiz) {
    setRaizPrevia(raiz);
    setRuta([raiz]);
    setSeleccionado(null);
  }

  const actual = ruta[ruta.length - 1];
  const esMovil = useConsultaMedia(CONSULTA_MOVIL);
  const enEtapas = vista === "etapas" || (vista === "auto" && esMovil);
  const clave = `${ruta.map((n) => n.id).join("/")}|${direccion}`;

  React.useEffect(() => {
    if (enEtapas) return;
    let vigente = true;
    Promise.resolve(motor ?? cargarMotorElk())
      .then((m) => distribuirNivel(actual, m, { direccion, grupos, etiquetasBandas }))
      .then((distribucion) => vigente && setResultado({ clave, distribucion }))
      .catch((error: unknown) => vigente && setResultado({ clave, error }));
    return () => {
      vigente = false;
    };
  }, [actual, clave, direccion, enEtapas, etiquetasBandas, grupos, motor]);

  React.useEffect(() => {
    if (moverFoco.current) {
      moverFoco.current = false;
      titulo.current?.focus();
    }
  }, [ruta]);

  const irA = React.useCallback(
    (nuevaRuta: NodoProceso[]) => {
      moverFoco.current = true;
      setRuta(nuevaRuta);
      setSeleccionado(null);
      onNivelChange?.(nuevaRuta);
    },
    [onNivelChange],
  );

  const activar = React.useCallback(
    (id: string) => {
      const nodo = actual.hijos?.find((n) => n.id === id);
      if (!nodo) return;
      if (nodo.hijos?.length) irA([...ruta, nodo]);
      else setSeleccionado((previo) => (previo === id ? null : id));
    },
    [actual, irA, ruta],
  );

  const [anchoLienzo, setAnchoLienzo] = React.useState(0);
  React.useEffect(() => {
    const elemento = lienzo.current;
    if (!elemento || typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(([entrada]) => setAnchoLienzo(entrada.contentRect.width));
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [enEtapas]);

  const distribucion = resultado?.clave === clave ? resultado.distribucion : undefined;
  const altoLienzo =
    alto ??
    (distribucion && anchoLienzo
      ? Math.round(Math.min(880, Math.max(360, (anchoLienzo * distribucion.alto) / Math.max(1, distribucion.ancho) + 48)))
      : 480);
  const error = resultado?.clave === clave ? resultado.error : undefined;
  const nodoSeleccionado = actual.hijos?.find((n) => n.id === seleccionado) ?? null;
  const conDetalle = (n: NodoProceso | null) => Boolean(n && (n.detalle || n.enlaces?.length));
  // El panel muestra el proceso elegido; si no hay ninguno, el proceso en el que se está (desde el nivel 2).
  const panel = conDetalle(nodoSeleccionado) ? nodoSeleccionado : ruta.length > 1 && conDetalle(actual) ? actual : null;

  const nombreNivel = nombresNiveles?.[ruta.length - 1];
  const idTitulo = `${ids}-titulo`;
  const idDescripcion = `${ids}-descripcion`;

  const EnlaceMiga: LinkComponent = React.useCallback(
    ({ to, children, className: clases }) => (
      <button type="button" className={clases} onClick={() => irA(ruta.slice(0, Number(to.slice(1)) + 1))}>
        {children}
      </button>
    ),
    [irA, ruta],
  );

  const exportar = () => {
    if (!distribucion) return;
    const svg = distribucionASvg(distribucion, actual, { grupos, colores: resolverColores(lienzo.current) });
    descargarSvg(svg, actual.id);
  };

  const porId = new Map((actual.hijos ?? []).map((n) => [n.id, n]));
  const nombre = (id: string) => porId.get(id)?.etiqueta ?? id;
  const aristas = (actual.aristas ?? []).filter((a) => porId.has(a.desde) && porId.has(a.hasta));

  const renderPanel = (nodo: NodoProceso, cerrable: boolean) => (
    <PanelDetalle
      nodo={nodo}
      onEnlace={onEnlace}
      onCerrar={cerrable ? () => setSeleccionado(null) : undefined}
      onEntrar={nodo.hijos?.length && nodo !== actual ? () => irA([...ruta, nodo]) : undefined}
    />
  );

  return (
    <section className={cn("flex flex-col gap-4", className)} aria-labelledby={idTitulo}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {ruta.length > 1 ? (
            <Breadcrumb
              aria-label="Niveles del mapa"
              linkComponent={EnlaceMiga}
              items={ruta.map((n, i) => ({ label: n.etiqueta, href: i < ruta.length - 1 ? `#${i}` : undefined }))}
            />
          ) : null}
          {nombreNivel ? (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{nombreNivel}</p>
          ) : null}
          <h2 ref={titulo} id={idTitulo} tabIndex={-1} className="text-lg font-semibold outline-none">
            {actual.etiqueta}
          </h2>
          {actual.subtitulo ? <p className="text-sm text-muted-foreground">{actual.subtitulo}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {ruta.length > 1 ? (
            <Button type="button" variant="outline" size="sm" onClick={() => irA(ruta.slice(0, -1))}>
              <ArrowLeft />
              Subir de nivel
            </Button>
          ) : null}
          {exportable && !enEtapas ? (
            <Button type="button" variant="outline" size="sm" onClick={exportar} disabled={!distribucion}>
              <Download />
              Exportar SVG
            </Button>
          ) : null}
        </div>
      </header>

      <div id={idDescripcion} className="sr-only">
        <p>
          Diagrama de {actual.etiqueta}: {actual.hijos?.length ?? 0} procesos y {aristas.length} flujos.
        </p>
        {aristas.length ? (
          <ul>
            {aristas.map((a, i) => (
              <li key={i}>
                {nombre(a.desde)} hacia {nombre(a.hasta)}
                {a.etiqueta ? ` (${a.etiqueta})` : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {enEtapas ? (
        <VistaEtapas
          nivel={actual}
          grupos={grupos}
          etiquetasBandas={etiquetasBandas}
          seleccionado={seleccionado}
          onActivar={activar}
          renderDetalle={(n) => renderPanel(n, true)}
          describedBy={idDescripcion}
        />
      ) : (
        <div className={cn("grid gap-4", panel && "lg:grid-cols-[minmax(0,1fr)_320px]")}>
          <div
            ref={lienzo}
            role="group"
            aria-roledescription="diagrama"
            aria-labelledby={idTitulo}
            aria-describedby={idDescripcion}
            aria-busy={!distribucion && !error}
            className="relative overflow-hidden rounded-xl border border-border bg-background"
            style={{ height: altoLienzo }}
          >
            {distribucion ? (
              <FlowMap
                key={clave}
                distribucion={distribucion}
                nivel={actual}
                grupos={grupos}
                animado={animado}
                seleccionado={seleccionado}
                onActivar={activar}
                tamano={`${Math.round(anchoLienzo)}x${altoLienzo}`}
              />
            ) : error ? (
              <p role="alert" className="p-6 text-sm text-destructive">
                No se pudo distribuir el diagrama.
              </p>
            ) : (
              <div className="grid h-full place-items-center p-6">
                <Skeleton label="Distribuyendo el diagrama" className="h-3/4 w-full" />
              </div>
            )}
          </div>
          {panel ? renderPanel(panel, panel === nodoSeleccionado) : null}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────── Panel ─────────────────────────────── */

interface PanelDetalleProps {
  nodo: NodoProceso;
  onEnlace?: (href: string) => void;
  onCerrar?: () => void;
  onEntrar?: () => void;
}

function PanelDetalle({ nodo, onEnlace, onCerrar, onEntrar }: PanelDetalleProps) {
  const idTitulo = React.useId();
  return (
    <aside aria-labelledby={idTitulo} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-sm text-card-foreground">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={idTitulo} className="font-semibold">
            {nodo.etiqueta}
          </h3>
          {nodo.subtitulo ? <p className="text-muted-foreground">{nodo.subtitulo}</p> : null}
        </div>
        {onCerrar ? (
          <Button type="button" variant="plain" size="xs" aria-label="Cerrar detalle" onClick={onCerrar}>
            <X />
          </Button>
        ) : null}
      </div>
      {nodo.detalle ? <div className="leading-relaxed">{nodo.detalle}</div> : null}
      {nodo.enlaces?.length || onEntrar ? (
        <div className="flex flex-wrap gap-2">
          {onEntrar ? (
            <Button type="button" size="sm" onClick={onEntrar}>
              Ver subprocesos
            </Button>
          ) : null}
          {nodo.enlaces?.map((enlace) =>
            onEnlace ? (
              <Button key={enlace.href} type="button" variant="outline" size="sm" onClick={() => onEnlace(enlace.href)}>
                {enlace.etiqueta}
              </Button>
            ) : (
              <Button key={enlace.href} asChild variant="outline" size="sm">
                <a href={enlace.href}>{enlace.etiqueta}</a>
              </Button>
            ),
          )}
        </div>
      ) : null}
    </aside>
  );
}

/* ─────────────────────────────── Etapas ─────────────────────────────── */

interface VistaEtapasProps {
  nivel: NodoProceso;
  grupos?: GrupoProceso[];
  etiquetasBandas?: Partial<Record<"transversal" | "base", string>>;
  seleccionado: string | null;
  onActivar: (id: string) => void;
  renderDetalle: (nodo: NodoProceso) => React.ReactNode;
  describedBy: string;
}

/** La vista de móvil: el mismo nivel como lista de etapas, sin ELK ni lienzo. */
function VistaEtapas({ nivel, grupos, etiquetasBandas, seleccionado, onActivar, renderDetalle, describedBy }: VistaEtapasProps) {
  const { etapas, transversales, bases } = React.useMemo(() => etapasDeNivel(nivel), [nivel]);
  const porId = new Map((nivel.hijos ?? []).map((n) => [n.id, n]));
  const salidas = (id: string) =>
    (nivel.aristas ?? [])
      .filter((a) => a.desde === id && porId.has(a.hasta))
      .map((a) => `${porId.get(a.hasta)!.etiqueta}${a.etiqueta ? ` (${a.etiqueta})` : ""}`);

  const seccion = (titulo: string, nodos: NodoProceso[], clave: string) => (
    <li key={clave} className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</h3>
      <ul className="space-y-2">
        {nodos.map((n) => {
          const destinos = salidas(n.id);
          return (
            <li key={n.id} className="space-y-2">
              <div className="min-h-16">
                <TarjetaProceso nodo={n} tono={tonoDeNodo(n, grupos)} seleccionado={seleccionado === n.id} onActivar={onActivar} />
              </div>
              {destinos.length ? (
                <p className="pl-4 text-xs text-muted-foreground">→ {destinos.join(" · ")}</p>
              ) : null}
              {seleccionado === n.id && (n.detalle || n.enlaces?.length) ? renderDetalle(n) : null}
            </li>
          );
        })}
      </ul>
    </li>
  );

  return (
    <ol aria-label={`Etapas de ${nivel.etiqueta}`} aria-describedby={describedBy} className="space-y-5">
      {etapas.map((nodos, i) => seccion(`Etapa ${i + 1}`, nodos, `etapa-${i}`))}
      {transversales.length ? seccion(etiquetasBandas?.transversal ?? "Transversal", transversales, "transversal") : null}
      {bases.length ? seccion(etiquetasBandas?.base ?? "Base", bases, "base") : null}
    </ol>
  );
}
