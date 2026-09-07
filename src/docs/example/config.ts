/**
 * Configuración técnica de la aplicación de ejemplo.
 *
 * Lo que aquí se decide no lo elige la persona que usa la aplicación: lo
 * fija el equipo que la mantiene, por producto o por despliegue. Es el
 * módulo que cada aplicación real tiene con otro nombre (flags, ajustes de
 * entorno) y que la librería no conoce.
 */
export const configuracion = {
  /** Si las pantallas de tabla muestran la fila de indicadores arriba. */
  mostrarIndicadores: true,
} as const;
