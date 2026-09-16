/** Ejemplo C4 de las stories y las pruebas: contexto, contenedores y componentes de una tienda en línea. */
import type { ElementoC4 } from "../c4-diagram";

export const tienda: ElementoC4 = {
  id: "alcance",
  nombre: "Tienda en línea",
  tipo: "sistema",
  descripcion: "Contexto del sistema de pedidos",
  limites: [{ id: "empresa", etiqueta: "Comercial Ejemplo S.A.S.", tono: "primary" }],
  hijos: [
    { id: "cliente", nombre: "Cliente", tipo: "persona", descripcion: "Compra desde la web o el móvil" },
    { id: "operador", nombre: "Operador de bodega", tipo: "persona", descripcion: "Alista y despacha pedidos" },
    {
      id: "pedidos",
      nombre: "Sistema de pedidos",
      tipo: "sistema",
      limite: "empresa",
      descripcion: "Catálogo, carrito y seguimiento",
      limites: [{ id: "nube", etiqueta: "Nube · región us-east", tono: "success" }],
      hijos: [
        { id: "web", nombre: "Aplicación web", tipo: "contenedor", tecnologia: "React", descripcion: "Tienda y cuenta del cliente", limite: "nube" },
        {
          id: "api",
          nombre: "API de pedidos",
          tipo: "contenedor",
          tecnologia: "Node.js",
          descripcion: "Reglas de negocio",
          limite: "nube",
          hijos: [
            { id: "carrito", nombre: "Carrito", tipo: "componente", descripcion: "Precios y promociones" },
            { id: "checkout", nombre: "Checkout", tipo: "componente", descripcion: "Pago y confirmación" },
            { id: "inventario", nombre: "Disponibilidad", tipo: "componente", descripcion: "Reserva de existencias" },
            { id: "pasarela", nombre: "Pasarela de pagos", tipo: "sistema", externo: true },
          ],
          relaciones: [
            { desde: "carrito", hasta: "checkout", descripcion: "Confirma" },
            { desde: "checkout", hasta: "inventario", descripcion: "Reserva" },
            { desde: "checkout", hasta: "pasarela", descripcion: "Cobra", tecnologia: "HTTPS" },
          ],
        },
        { id: "db", nombre: "Base de datos", tipo: "contenedor", tecnologia: "PostgreSQL", limite: "nube" },
        { id: "cola", nombre: "Cola de eventos", tipo: "contenedor", tecnologia: "SQS", limite: "nube" },
      ],
      relaciones: [
        { desde: "web", hasta: "api", descripcion: "Llama", tecnologia: "JSON/HTTPS" },
        { desde: "api", hasta: "db", descripcion: "Lee y escribe" },
        { desde: "api", hasta: "cola", descripcion: "Publica", asincrona: true },
      ],
    },
    { id: "erp", nombre: "ERP", tipo: "sistema", externo: true, descripcion: "Facturación e inventario" },
    { id: "correo", nombre: "Correo", tipo: "sistema", externo: true, descripcion: "Notificaciones" },
  ],
  relaciones: [
    { desde: "cliente", hasta: "pedidos", descripcion: "Compra" },
    { desde: "operador", hasta: "pedidos", descripcion: "Despacha" },
    { desde: "pedidos", hasta: "erp", descripcion: "Factura", asincrona: true },
    { desde: "pedidos", hasta: "correo", descripcion: "Avisa" },
  ],
};
