import * as React from "react";
import { Component, Container, Server, User, type LucideIcon } from "lucide-react";

import { ProcessMap, type ProcessMapProps } from "./process-map";
import type { EnlaceProceso, GrupoProceso, NodoProceso, TonoGrupo } from "./types";

export type TipoC4 = "persona" | "sistema" | "contenedor" | "componente";

/** Un límite C4 (sistema, empresa, despliegue): agrupa elementos de su nivel en un carril. */
export interface LimiteC4 {
  id: string;
  etiqueta: string;
  /** @default "primary" */
  tono?: TonoGrupo;
}

export interface RelacionC4 {
  desde: string;
  hasta: string;
  /** Qué hace la relación: «Consulta saldos». */
  descripcion?: string;
  /** Cómo: «JSON/HTTPS». */
  tecnologia?: string;
  /** Asíncrona (colas, eventos): trazo discontinuo. */
  asincrona?: boolean;
}

/**
 * Un elemento C4. Los tres niveles salen de anidarlos: los `hijos` de la raíz
 * son el **contexto** (personas y sistemas), los de un sistema sus
 * **contenedores** y los de un contenedor sus **componentes**.
 */
export interface ElementoC4 {
  id: string;
  nombre: string;
  tipo: TipoC4;
  descripcion?: string;
  tecnologia?: string;
  /** Fuera del alcance del sistema que se documenta. */
  externo?: boolean;
  /** Id del límite (de `limites` del padre) que lo contiene. */
  limite?: string;
  /** Límites que agrupan a los `hijos`. */
  limites?: LimiteC4[];
  hijos?: ElementoC4[];
  relaciones?: RelacionC4[];
  enlaces?: EnlaceProceso[];
  detalle?: React.ReactNode;
}

const ICONOS: Record<TipoC4, LucideIcon> = {
  persona: User,
  sistema: Server,
  contenedor: Container,
  componente: Component,
};

/** Nombre de cada nivel C4, por profundidad. */
const NIVELES_C4 = ["Contexto", "Contenedores", "Componentes"];

const NOMBRE_TIPO: Record<TipoC4, string> = {
  persona: "Persona",
  sistema: "Sistema",
  contenedor: "Contenedor",
  componente: "Componente",
};


function aNodo(elemento: ElementoC4): NodoProceso {
  return {
    id: elemento.id,
    etiqueta: elemento.nombre,
    subtitulo: elemento.descripcion,
    icono: ICONOS[elemento.tipo],
    insignia: `${elemento.externo ? `${NOMBRE_TIPO[elemento.tipo]} externo` : NOMBRE_TIPO[elemento.tipo]}${elemento.tecnologia ? ` · ${elemento.tecnologia}` : ""}`,
    externo: elemento.externo,
    capa: "flujo",
    grupo: elemento.limite,
    enlaces: elemento.enlaces,
    detalle: elemento.detalle,
    hijos: elemento.hijos?.map(aNodo),
    aristas: elemento.relaciones?.map((r) => ({
      desde: r.desde,
      hasta: r.hasta,
      etiqueta: [r.descripcion, r.tecnologia && `[${r.tecnologia}]`].filter(Boolean).join(" ") || undefined,
      estilo: r.asincrona ? "discontinua" : "continua",
    })),
  };
}

function recogerLimites(elemento: ElementoC4): GrupoProceso[] {
  return [
    ...(elemento.limites ?? []).map((l) => ({ id: l.id, etiqueta: l.etiqueta, tono: l.tono })),
    ...(elemento.hijos ?? []).flatMap(recogerLimites),
  ];
}

export interface C4DiagramProps extends Omit<ProcessMapProps, "raiz" | "grupos" | "nombresNiveles"> {
  /** El alcance que se documenta: sus `hijos` son el diagrama de contexto. */
  raiz: ElementoC4;
}

/**
 * Diagramas C4 (contexto, contenedores, componentes) sobre `ProcessMap`: la
 * misma distribución y el mismo descenso por niveles, con el vocabulario de
 * nodos de C4. Los límites se pintan como carriles.
 */
export function C4Diagram({ raiz, direccion = "abajo", ...props }: C4DiagramProps) {
  const nodo = React.useMemo(() => aNodo(raiz), [raiz]);
  const grupos = React.useMemo(() => recogerLimites(raiz), [raiz]);
  return (
    <ProcessMap {...props} raiz={nodo} grupos={grupos} direccion={direccion} nombresNiveles={NIVELES_C4} />
  );
}
