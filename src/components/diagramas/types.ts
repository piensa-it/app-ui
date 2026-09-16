import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Dónde vive un proceso dentro de su nivel.
 *
 * - `flujo`: la cadena principal (abastecer → transformar → vender…). Lo
 *   distribuye ELK por capas, en carriles según su `grupo`.
 * - `transversal`: lo que cruza toda la cadena (talento humano, presupuestos…).
 *   Va en una banda a todo lo ancho, antes del flujo.
 * - `base`: lo que sostiene a todos (contabilidad, tesorería). Banda después
 *   del flujo.
 */
export type CapaProceso = "flujo" | "transversal" | "base";

export type EstiloArista = "continua" | "discontinua";

/** Un flujo entre dos hijos del mismo nivel. */
export interface AristaProceso {
  desde: string;
  hasta: string;
  /** Lo que pasa por el flujo («radicado», «producto terminado»). */
  etiqueta?: string;
  /** `discontinua` para flujos conceptuales o de apoyo. @default "continua" */
  estilo?: EstiloArista;
  /** Anima el trazo en este flujo aunque `ProcessMap` no tenga `animado`. */
  animada?: boolean;
}

/** Lo que la aplicación ata a un proceso: una pantalla, un módulo, un informe. */
export interface EnlaceProceso {
  etiqueta: string;
  href: string;
}

/**
 * Un proceso, en cualquier nivel. El mismo modelo sirve para el ciclo de la
 * empresa, para un proceso y para un subproceso: `hijos` es el nivel siguiente.
 */
export interface NodoProceso {
  id: string;
  etiqueta: string;
  subtitulo?: string;
  icono?: LucideIcon;
  /** @default "flujo" */
  capa?: CapaProceso;
  /** Carril (y color) del nodo en su nivel. Ver `ProcessMap.grupos`. */
  grupo?: string;
  /** El siguiente nivel. Con hijos, un clic en el nodo baja a ellos. */
  hijos?: NodoProceso[];
  /** Flujos entre los `hijos`. */
  aristas?: AristaProceso[];
  enlaces?: EnlaceProceso[];
  /** Buenas prácticas, KPIs… Se muestra en el panel de detalle. */
  detalle?: ReactNode;
  /** Línea breve en versalitas sobre la etiqueta (p. ej. «Contenedor · React» en C4). */
  insignia?: string;
  /** Nodo de fuera del alcance (sistema externo en C4): borde discontinuo y tono apagado. */
  externo?: boolean;
}

export type TonoGrupo = "primary" | "success" | "warning" | "destructive" | "muted";

/** Nombre y color de un carril. */
export interface GrupoProceso {
  id: string;
  etiqueta: string;
  /** @default "primary" */
  tono?: TonoGrupo;
}

export type DireccionDiagrama = "derecha" | "abajo";

export interface Punto {
  x: number;
  y: number;
}

export interface Caja {
  x: number;
  y: number;
  ancho: number;
  alto: number;
}

export interface NodoDistribuido extends Caja {
  id: string;
  capa: CapaProceso;
  grupo?: string;
}

export interface CarrilDistribuido extends Caja {
  id: string;
  etiqueta: string;
}

export interface BandaDistribuida extends Caja {
  capa: Exclude<CapaProceso, "flujo">;
  etiqueta: string;
  /** Hueco reservado al título de la banda, fuera del paso de nodos y aristas. */
  titulo: Caja;
}

export interface EtiquetaDistribuida extends Caja {
  texto: string;
}

export interface AristaDistribuida {
  id: string;
  desde: string;
  hasta: string;
  /** Poligonal ortogonal, del borde del origen al borde del destino. */
  puntos: Punto[];
  etiqueta?: EtiquetaDistribuida;
  estilo: EstiloArista;
  animada: boolean;
  /** Toca un nodo de las capas transversal o base. */
  transversal: boolean;
}

/** Geometría de un nivel, lista para pintar o exportar. Coordenadas en píxeles. */
export interface Distribucion {
  ancho: number;
  alto: number;
  direccion: DireccionDiagrama;
  nodos: NodoDistribuido[];
  carriles: CarrilDistribuido[];
  bandas: BandaDistribuida[];
  aristas: AristaDistribuida[];
}
