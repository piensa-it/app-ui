import type { MotorDistribucion } from "./layout";

let pendiente: Promise<MotorDistribucion> | null = null;

/**
 * ELK por defecto: se importa de forma diferida la primera vez que hace falta
 * distribuir un nivel, así que no entra en la carga inicial de la aplicación
 * (ni siquiera en la de las pantallas que importan `/diagramas`).
 *
 * Corre en el hilo principal (`elk.bundled.js`). Para sacarlo a un Web Worker,
 * la aplicación pasa su propio motor a `ProcessMap`:
 *
 * ```ts
 * import ELK from "elkjs/lib/elk-api";
 * const motor = new ELK({
 *   workerFactory: () => new Worker(new URL("elkjs/lib/elk-worker.min.js", import.meta.url)),
 * });
 * <ProcessMap raiz={...} motor={motor} />
 * ```
 *
 * No se hace aquí porque la URL del worker la tiene que resolver el bundler de
 * la aplicación: desde un paquete publicado con `preserveModules`,
 * `new URL(..., import.meta.url)` apuntaría a un archivo que la librería no
 * publica.
 */
export function cargarMotorElk(): Promise<MotorDistribucion> {
  pendiente ??= import("elkjs/lib/elk.bundled.js")
    .then(({ default: ELK }) => new ELK())
    .catch((error: unknown) => {
      pendiente = null;
      throw error;
    });
  return pendiente;
}
