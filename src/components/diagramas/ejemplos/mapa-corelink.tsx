/**
 * Datos de ejemplo equivalentes al «Mapa de CoreLink» (app-corelink#101),
 * adaptados al modelo de procesos por niveles de #205. Sirven a las stories y
 * a la prueba de no solape; no se exportan con la librería.
 *
 * Mismo tamaño que el mapa original: 13 nodos, 3 carriles de flujo y 17
 * aristas, con los transversales (gestión documental, talento humano,
 * presupuestos, activos fijos) y la base (contabilidad, tesorería) en bandas.
 */
import {
  BookOpen, Boxes, Building, CheckCircle, ClipboardList, Factory, FileCheck, FileInput, FileOutput, Globe, Inbox,
  PackageCheck, PiggyBank, Receipt, ShoppingCart, Tag, Users, Wallet,
} from "lucide-react";

import type { GrupoProceso, NodoProceso } from "../types";

export const gruposCoreLink: GrupoProceso[] = [
  { id: "egreso", etiqueta: "Abastecimiento y pago", tono: "warning" },
  { id: "transformacion", etiqueta: "Transformación", tono: "primary" },
  { id: "ingreso", etiqueta: "Venta y recaudo", tono: "success" },
];

const practicas = (items: string[], kpis: string) => (
  <div className="space-y-3">
    <ul className="list-disc space-y-1 pl-4">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
    <p className="text-muted-foreground">
      <span className="font-medium text-foreground">KPIs:</span> {kpis}
    </p>
  </div>
);

/** Nivel 2: el proceso de compras, de la requisición a la causación. */
export const procesoCompras: NodoProceso = {
  id: "com",
  etiqueta: "Compras",
  subtitulo: "Facturas nacionales",
  icono: ShoppingCart,
  capa: "flujo",
  grupo: "egreso",
  detalle: practicas(
    ["Cruce de 3 vías: orden de compra, recepción y factura", "Proveedores homologados y evaluados", "Aprobaciones por monto"],
    "ciclo de compra, % facturas con diferencias, ahorro",
  ),
  enlaces: [{ etiqueta: "Abrir Compras", href: "/compras" }],
  hijos: [
    { id: "req", etiqueta: "Requisición", subtitulo: "Necesidad del área", icono: ClipboardList, detalle: "Quien necesita pide; quien compra negocia.", enlaces: [{ etiqueta: "Requisiciones", href: "/compras/requisiciones" }] },
    { id: "oc", etiqueta: "Orden de compra", subtitulo: "Precio y plazo pactados", icono: FileOutput, enlaces: [{ etiqueta: "Órdenes de compra", href: "/compras/ordenes" }] },
    { id: "rec", etiqueta: "Recepción", subtitulo: "Lo que llegó a bodega", icono: PackageCheck },
    {
      id: "fac", etiqueta: "Factura", subtitulo: "Validada ante la DIAN", icono: Receipt,
      hijos: [
        { id: "radicar", etiqueta: "Radicar", subtitulo: "Buzón único", icono: Inbox },
        { id: "validar", etiqueta: "Validar", subtitulo: "Documento electrónico", icono: FileCheck },
        { id: "cruzar", etiqueta: "Cruce de 3 vías", subtitulo: "OC · recepción · factura", icono: CheckCircle },
      ],
      aristas: [
        { desde: "radicar", hasta: "validar" },
        { desde: "validar", hasta: "cruzar", etiqueta: "aceptada" },
      ],
    },
    { id: "caus", etiqueta: "Causación", subtitulo: "Obligación contable", icono: FileCheck },
    { id: "pres2", etiqueta: "Presupuesto", subtitulo: "Disponibilidad", icono: PiggyBank, capa: "transversal" },
    { id: "cont2", etiqueta: "Contabilidad", subtitulo: "Asiento automático", icono: BookOpen, capa: "base" },
  ],
  aristas: [
    { desde: "req", hasta: "oc", etiqueta: "aprobada" },
    { desde: "oc", hasta: "rec" },
    { desde: "rec", hasta: "fac", etiqueta: "entrada" },
    { desde: "fac", hasta: "caus", etiqueta: "cruce 3 vías" },
    { desde: "pres2", hasta: "req", etiqueta: "disponibilidad", estilo: "discontinua" },
    { desde: "caus", hasta: "cont2", etiqueta: "asiento" },
  ],
};

/** Nivel 1: el ciclo de la empresa. */
export const cicloCoreLink: NodoProceso = {
  id: "ciclo",
  etiqueta: "Ciclo de la empresa",
  subtitulo: "Abastecer, transformar, vender, cobrar y pagar",
  hijos: [
    { id: "log", etiqueta: "Logística", subtitulo: "Inventario MP y PT", icono: Boxes, capa: "flujo", grupo: "transformacion", enlaces: [{ etiqueta: "Abrir Logística", href: "/logistica" }], detalle: practicas(["Maestro único de productos", "Stock mínimo y punto de reorden", "Conteos cíclicos"], "rotación, exactitud de inventario") },
    procesoCompras,
    { id: "imp", etiqueta: "Importaciones · comercio exterior", subtitulo: "Nacionalización y landed", icono: Globe, capa: "flujo", grupo: "egreso" },
    { id: "cxp", etiqueta: "Cuentas por pagar", subtitulo: "Obligaciones", icono: FileOutput, capa: "flujo", grupo: "egreso", enlaces: [{ etiqueta: "Abrir Cuentas por pagar", href: "/cxp" }] },
    { id: "prod", etiqueta: "Producción", subtitulo: "Órdenes y costeo", icono: Factory, capa: "flujo", grupo: "transformacion" },
    { id: "ven", etiqueta: "Ventas", subtitulo: "Comercial y facturación", icono: Tag, capa: "flujo", grupo: "ingreso", enlaces: [{ etiqueta: "Abrir Ventas", href: "/ventas" }] },
    { id: "cxc", etiqueta: "Cuentas por cobrar", subtitulo: "Cartera", icono: FileInput, capa: "flujo", grupo: "ingreso" },
    { id: "cad", etiqueta: "Gestión documental", subtitulo: "Recepción y radicado", icono: Inbox, capa: "transversal" },
    { id: "nom", etiqueta: "Talento humano", subtitulo: "Nómina y equipo", icono: Users, capa: "transversal" },
    { id: "pres", etiqueta: "Presupuestos", subtitulo: "Plan vs. ejecución", icono: PiggyBank, capa: "transversal" },
    { id: "act", etiqueta: "Activos fijos", subtitulo: "Depreciación", icono: Building, capa: "transversal" },
    { id: "tes", etiqueta: "Tesorería", subtitulo: "Pagos y recaudo", icono: Wallet, capa: "base" },
    { id: "cont", etiqueta: "Contabilidad", subtitulo: "Cierre y estados", icono: BookOpen, capa: "base", detalle: practicas(["Contabilización automática desde cada módulo", "Plan de cuentas bajo NIIF"], "días de cierre, EBITDA") },
  ],
  aristas: [
    { desde: "log", hasta: "com" },
    { desde: "log", hasta: "imp" },
    { desde: "com", hasta: "cxp" },
    { desde: "cad", hasta: "cxp", etiqueta: "radicado" },
    { desde: "imp", hasta: "cxp", etiqueta: "liquidación" },
    { desde: "cxp", hasta: "tes", etiqueta: "vencimientos" },
    { desde: "tes", hasta: "cont" },
    { desde: "log", hasta: "prod", etiqueta: "materia prima" },
    { desde: "prod", hasta: "ven", etiqueta: "producto terminado" },
    { desde: "log", hasta: "ven", etiqueta: "reventa", estilo: "discontinua" },
    { desde: "ven", hasta: "cxc" },
    { desde: "cxc", hasta: "tes", etiqueta: "recaudo" },
    { desde: "nom", hasta: "prod", etiqueta: "mano de obra", estilo: "discontinua" },
    { desde: "act", hasta: "cont", etiqueta: "depreciación", estilo: "discontinua" },
    { desde: "cont", hasta: "pres", etiqueta: "ejecución", estilo: "discontinua" },
    { desde: "cont", hasta: "log", etiqueta: "recompra ×N", estilo: "discontinua" },
    { desde: "pres", hasta: "com", etiqueta: "disponibilidad", estilo: "discontinua" },
  ],
};
