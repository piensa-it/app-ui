/**
 * Punto de entrada `@piensa-it/ui-library/diagramas`.
 *
 * Vive aparte del índice principal para que React Flow (`@xyflow/react`) y ELK
 * (`elkjs`), dependencias opcionales, no pesen en las aplicaciones que no
 * pintan diagramas. ELK además se carga de forma diferida, al distribuir el
 * primer nivel.
 */
export { ProcessMap, type ProcessMapProps } from "./components/diagramas/process-map";
export {
  C4Diagram,
  type C4DiagramProps,
  type ElementoC4,
  type LimiteC4,
  type RelacionC4,
  type TipoC4,
} from "./components/diagramas/c4-diagram";
export {
  distribuirNivel,
  medirNodo,
  type MotorDistribucion,
  type OpcionesDistribucion,
} from "./components/diagramas/layout";
export { cargarMotorElk } from "./components/diagramas/motor-elk";
export { validarDistribucion, type ProblemaDistribucion } from "./components/diagramas/geometria";
export { distribucionASvg, resolverColores, type ColoresSvg } from "./components/diagramas/svg";
export type {
  AristaDistribuida,
  AristaProceso,
  BandaDistribuida,
  Caja,
  CapaProceso,
  CarrilDistribuido,
  DireccionDiagrama,
  Distribucion,
  EnlaceProceso,
  EstiloArista,
  EtiquetaDistribuida,
  GrupoProceso,
  NodoDistribuido,
  NodoProceso,
  Punto,
  TonoGrupo,
} from "./components/diagramas/types";
