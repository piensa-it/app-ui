/**
 * Datos de una aplicación de tesorería ficticia. Viven fuera de la story para
 * que el ejemplo se lea como una aplicación y no como un volcado de arrays.
 */

export interface Movimiento {
  id: string;
  fecha: string;
  concepto: string;
  tercero: string;
  centro: string;
  metodo: string;
  estado: "conciliado" | "pendiente" | "anulado";
  /** Positivo entrada, negativo salida. En pesos colombianos. */
  valor: number;
}

export const movimientos: Movimiento[] = [
  {
    id: "MC-2041",
    fecha: "2026-08-31",
    concepto: "Recaudo facturas de agosto",
    tercero: "Distribuidora El Poblado S.A.S.",
    centro: "Comercial",
    metodo: "Transferencia",
    estado: "conciliado",
    valor: 18_450_000,
  },
  {
    id: "MC-2042",
    fecha: "2026-08-31",
    concepto: "Pago nómina quincena",
    tercero: "Nómina Piensa IT",
    centro: "Administración",
    metodo: "Transferencia",
    estado: "conciliado",
    valor: -42_780_500,
  },
  {
    id: "MC-2043",
    fecha: "2026-09-01",
    concepto: "Anticipo contrato mantenimiento",
    tercero: "Servicios Andinos Ltda.",
    centro: "Operaciones",
    metodo: "Transferencia",
    estado: "pendiente",
    valor: -6_200_000,
  },
  {
    id: "MC-2044",
    fecha: "2026-09-01",
    concepto: "Venta de contado mostrador",
    tercero: "Carolina Ríos Betancur",
    centro: "Comercial",
    metodo: "Efectivo",
    estado: "conciliado",
    valor: 1_340_000,
  },
  {
    id: "MC-2045",
    fecha: "2026-09-01",
    concepto: "Compra de insumos de bodega",
    tercero: "Ferretería La Ceiba S.A.S.",
    centro: "Operaciones",
    metodo: "Tarjeta",
    estado: "pendiente",
    valor: -2_985_400,
  },
  {
    id: "MC-2046",
    fecha: "2026-09-02",
    concepto: "Reembolso de caja menor",
    tercero: "Julián Mora Restrepo",
    centro: "Administración",
    metodo: "Efectivo",
    estado: "conciliado",
    valor: -780_000,
  },
  {
    id: "MC-2047",
    fecha: "2026-09-02",
    concepto: "Abono cliente institucional",
    tercero: "Clínica Santa Fe de Bogotá",
    centro: "Comercial",
    metodo: "Transferencia",
    estado: "conciliado",
    valor: 27_900_000,
  },
  {
    id: "MC-2048",
    fecha: "2026-09-02",
    concepto: "Arriendo sede Medellín",
    tercero: "Inmobiliaria Aburrá S.A.",
    centro: "Administración",
    metodo: "Transferencia",
    estado: "pendiente",
    valor: -9_150_000,
  },
  {
    id: "MC-2049",
    fecha: "2026-09-02",
    concepto: "Nota crédito por devolución",
    tercero: "Supermercados del Valle S.A.",
    centro: "Comercial",
    metodo: "Transferencia",
    estado: "anulado",
    valor: -1_120_000,
  },
  {
    id: "MC-2050",
    fecha: "2026-09-03",
    concepto: "Recaudo pasarela de pagos",
    tercero: "Pasarela PSE",
    centro: "Comercial",
    metodo: "Transferencia",
    estado: "conciliado",
    valor: 4_675_300,
  },
  {
    id: "MC-2051",
    fecha: "2026-09-03",
    concepto: "Pago proveedor de transporte",
    tercero: "Transportes Cafeteros S.A.S.",
    centro: "Logística",
    metodo: "Transferencia",
    estado: "pendiente",
    valor: -3_420_000,
  },
  {
    id: "MC-2052",
    fecha: "2026-09-03",
    concepto: "Intereses cuenta de ahorros",
    tercero: "Banco de Bogotá",
    centro: "Administración",
    metodo: "Transferencia",
    estado: "conciliado",
    valor: 512_800,
  },
  {
    id: "MC-2053",
    fecha: "2026-09-03",
    concepto: "Compra de equipos de cómputo",
    tercero: "Tecnología Integral del Caribe S.A.S.",
    centro: "Tecnología",
    metodo: "Tarjeta",
    estado: "pendiente",
    valor: -14_299_900,
  },
  {
    id: "MC-2054",
    fecha: "2026-09-03",
    concepto: "Recaudo cartera vencida",
    tercero: "Agroindustrias del Tolima S.A.",
    centro: "Comercial",
    metodo: "Transferencia",
    estado: "conciliado",
    valor: 8_060_000,
  },
];

/** Pesos colombianos sin decimales, que es como se leen en un arqueo. */
export function formatoPesos(valor: number): string {
  return valor.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

/** Fecha corta para las celdas de la tabla. */
export function formatoFecha(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

export const empresas = [
  { value: "poblado", label: "Distribuidora El Poblado S.A.S.", description: "NIT 900.412.331-4" },
  { value: "andinos", label: "Servicios Andinos Ltda.", description: "NIT 830.118.902-7" },
  { value: "cafeteros", label: "Transportes Cafeteros S.A.S.", description: "NIT 901.554.208-1" },
];

export const entornos = [
  { value: "prd", label: "Producción", description: "Datos reales de la operación" },
  {
    value: "uat",
    label: "Pruebas (UAT)",
    description: "Datos de ensayo, sin efecto real",
    // El distintivo lo declara la opción: así el entorno no se mantiene
    // sincronizado a mano entre el menú y la cabecera.
    badge: { label: "UAT", tone: "warning" as const },
  },
];

export const centrosDeCosto = [
  { value: "comercial", label: "Comercial" },
  { value: "administracion", label: "Administración" },
  { value: "operaciones", label: "Operaciones" },
  { value: "logistica", label: "Logística" },
  { value: "tecnologia", label: "Tecnología" },
];

export const metodosDePago = [
  { value: "transferencia", label: "Transferencia" },
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta corporativa" },
  { value: "cheque", label: "Cheque", disabled: true },
];
