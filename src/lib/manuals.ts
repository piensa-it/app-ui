import primerosPasos from "@/content/manuals/primeros-pasos.md?raw";
import cuentasYTarjetas from "@/content/manuals/cuentas-y-tarjetas.md?raw";
import transacciones from "@/content/manuals/transacciones.md?raw";
import presupuestos from "@/content/manuals/presupuestos.md?raw";
import recurrentes from "@/content/manuals/recurrentes.md?raw";
import correosYSugerencias from "@/content/manuals/correos-y-sugerencias.md?raw";
import dashboardYReportes from "@/content/manuals/dashboard-y-reportes.md?raw";
import categorias from "@/content/manuals/categorias.md?raw";
import recordatorios from "@/content/manuals/recordatorios.md?raw";
import cuentaFamiliar from "@/content/manuals/cuenta-familiar.md?raw";
import logros from "@/content/manuals/logros.md?raw";
import perfilYCorreos from "@/content/manuals/perfil-y-correos.md?raw";
import establecimientos from "@/content/manuals/establecimientos.md?raw";

export interface Manual {
  id: string;
  titulo: string;
  descripcion: string;
  /** Nombre del icono de lucide (resuelto en la página de Ayuda) */
  icono:
    | "Rocket" | "CreditCard" | "Receipt" | "PiggyBank" | "Repeat" | "Inbox" | "BarChart3"
    | "FolderTree" | "Bell" | "Users" | "Trophy" | "UserCircle" | "Store";
  contenido: string;
}

/**
 * Registro de manuales de usuario.
 * Regla del producto: cada funcionalidad liberada agrega aquí su manual
 * (archivo .md en src/content/manuals/) — ver docs/backlog.md P4-2.
 */
export const MANUALS: Manual[] = [
  {
    id: "primeros-pasos",
    titulo: "Primeros pasos",
    descripcion: "De cero a tus finanzas organizadas en minutos",
    icono: "Rocket",
    contenido: primerosPasos,
  },
  {
    id: "cuentas-y-tarjetas",
    titulo: "Cuentas y tarjetas de crédito",
    descripcion: "Activos, deudas, cupo disponible y pago de tarjetas sin doble conteo",
    icono: "CreditCard",
    contenido: cuentasYTarjetas,
  },
  {
    id: "transacciones",
    titulo: "Ingresos, gastos y movimientos",
    descripcion: "Registrar, editar, filtrar y entender los tipos de movimiento",
    icono: "Receipt",
    contenido: transacciones,
  },
  {
    id: "presupuestos",
    titulo: "Presupuestos",
    descripcion: "Límites por categoría o globales, con alertas antes de pasarte",
    icono: "PiggyBank",
    contenido: presupuestos,
  },
  {
    id: "recurrentes",
    titulo: "Movimientos recurrentes",
    descripcion: "Salario, arriendo y suscripciones que se registran solos",
    icono: "Repeat",
    contenido: recurrentes,
  },
  {
    id: "correos-y-sugerencias",
    titulo: "Correos bancarios y sugerencias",
    descripcion: "Reenvía tus notificaciones y confirma los movimientos detectados",
    icono: "Inbox",
    contenido: correosYSugerencias,
  },
  {
    id: "dashboard-y-reportes",
    titulo: "Dashboard y reportes",
    descripcion: "Cómo leer tu saldo, tu deuda y tu flujo de caja",
    icono: "BarChart3",
    contenido: dashboardYReportes,
  },
  {
    id: "categorias",
    titulo: "Categorías y subcategorías",
    descripcion: "Organiza en qué se va tu dinero, con categorías propias",
    icono: "FolderTree",
    contenido: categorias,
  },
  {
    id: "recordatorios",
    titulo: "Recordatorios de pago",
    descripcion: "Vencimientos y compromisos que no se te pueden pasar",
    icono: "Bell",
    contenido: recordatorios,
  },
  {
    id: "cuenta-familiar",
    titulo: "Cuenta familiar",
    descripcion: "Finanzas compartidas del hogar sin perder tu privacidad",
    icono: "Users",
    contenido: cuentaFamiliar,
  },
  {
    id: "logros",
    titulo: "Logros y rachas",
    descripcion: "Convierte el registro diario en un hábito",
    icono: "Trophy",
    contenido: logros,
  },
  {
    id: "perfil-y-correos",
    titulo: "Perfil, correos y configuración",
    descripcion: "Varios correos, moneda, tema y recuperación de contraseña",
    icono: "UserCircle",
    contenido: perfilYCorreos,
  },
  {
    id: "establecimientos",
    titulo: "Establecimientos",
    descripcion: "Comercios, proveedores y contactos de negocio con sus datos y etiquetas",
    icono: "Store",
    contenido: establecimientos,
  },
];
