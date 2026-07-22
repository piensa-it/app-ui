/**
 * Localización en español para componentes PrimeReact que dependen de
 * `primereact/api` (Calendar, DataTable con filtros, etc.). PrimeReact solo
 * trae "en" registrado por defecto — sin esto, Calendar mostraría meses y
 * días en inglés aunque el resto de la UI esté en español.
 *
 * Se registra una sola vez, como side-effect, al importar este módulo desde
 * `UiProvider`.
 */
import { addLocale } from "primereact/api";

addLocale("es", {
  firstDayOfWeek: 1,
  dayNames: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  dayNamesShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
  dayNamesMin: ["D", "L", "M", "X", "J", "V", "S"],
  monthNames: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
  monthNamesShort: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  today: "Hoy",
  clear: "Limpiar",
  apply: "Aplicar",
  weekHeader: "Sem",
  weak: "Débil",
  medium: "Media",
  strong: "Fuerte",
  passwordPrompt: "Ingresa una contraseña",
  emptyMessage: "No hay resultados",
  emptyFilterMessage: "No se encontraron resultados",
  accept: "Sí",
  reject: "No",
  choose: "Elegir",
  upload: "Subir",
  cancel: "Cancelar",
});

export const DEFAULT_LOCALE = "es";
