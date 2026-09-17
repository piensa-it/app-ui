import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Building2, FileText, Mail, MessageCircle, RefreshCw, ShieldCheck, Smartphone, Wallet } from "lucide-react";

import { FeatureGrid } from "./feature-grid";
import { Section, SectionHeading } from "./section";

const meta = {
  title: "Marketing/FeatureGrid",
  component: FeatureGrid,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Rejilla de capacidades, módulos, canales o garantías. Variantes `card`, `list`, `joined` y `compact`; por tarjeta: ícono, numeración, insignia de estado, chip de código, viñetas, etiquetas, pie «etiqueta: valor», tinte y enlace. La última fila incompleta se centra.",
      },
    },
  },
  args: { items: [] },
  decorators: [
    (Story) => (
      <Section spacing="sm">
        <Story />
      </Section>
    ),
  ],
} satisfies Meta<typeof FeatureGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Tarjetas: Story = {
  name: "Tarjetas con insignia y pie (ej. Deliver canales)",
  args: {
    columns: 4,
    items: [
      { icon: Mail, title: "Email", description: "Transaccional y masivo, con plantillas.", badge: { label: "Fase 1", tone: "success" }, meta: { label: "Llega a:", value: "bandeja de entrada" } },
      { icon: Smartphone, title: "SMS", description: "Operadores locales con reintentos.", badge: { label: "Fase 1", tone: "success" }, meta: { label: "Llega a:", value: "cualquier celular" }, tone: "success" },
      { icon: MessageCircle, title: "WhatsApp", description: "Plantillas aprobadas por Meta.", badge: { label: "Fase 2" }, meta: { label: "Llega a:", value: "WhatsApp" }, tone: "warning" },
      { icon: Bell, title: "Push", description: "Notificaciones a apps móviles y web.", badge: { label: "Fase 2" }, meta: { label: "Llega a:", value: "la app" }, tone: "muted" },
    ],
  },
};

export const ChipYViñetas: Story = {
  name: "Chip de código y viñetas (ej. AdapterDian ámbitos)",
  args: {
    columns: 3,
    items: [
      { tag: "/invoices/v1", title: "Emisión", description: "Cinco tipos de documento.", bullets: ["Factura de venta", "Notas crédito y débito", "Documento soporte"] },
      { tag: "/receptions/v1", title: "Recepción", description: "Buzón, CUFE y eventos RADIAN.", bullets: ["Acuse de recibo", "Aceptación y rechazo"] },
      { tag: "/payrolls/v1", title: "Nómina", description: "23 devengados y 18 deducciones.", bullets: ["Nómina individual", "Notas de ajuste"] },
    ],
  },
};

export const Unidas: Story = {
  name: "Celdas unidas (ej. AdapterDian garantías, piensait.com países)",
  args: {
    variant: "joined",
    columns: 2,
    items: [
      { title: "Idempotencia", description: <>Reenviar con la misma <code>Idempotency-Key</code> no emite dos veces.</> },
      { title: "Validación clara", description: <>El campo <code>is_validated</code> dice si la DIAN aceptó.</> },
      { title: "Totales verificados", description: "Se recalculan antes de firmar." },
      { title: "Errores RFC 7807", description: "Un formato de error para todo." },
    ],
  },
};

export const UnidasConEstado: Story = {
  name: "Unidas con estado y atenuadas (ej. piensait.com)",
  args: {
    variant: "joined",
    columns: 5,
    items: [
      { title: "United States", description: "Norwalk, Connecticut", badge: { label: "Headquarters", tone: "primary" } },
      { title: "Colombia", description: "CO", badge: { label: "Delivery hub" } },
      { title: "Ecuador", description: "EC", badge: { label: "Delivery hub" } },
      { title: "Brazil", description: "BR", badge: { label: "Under evaluation" }, dimmed: true },
      { title: "Chile", description: "CL", badge: { label: "Under evaluation" }, dimmed: true },
    ],
  },
};

export const Lista: Story = {
  name: "Lista con ícono (ej. Deliver confiabilidad)",
  args: {
    variant: "list",
    columns: 2,
    items: [
      { icon: RefreshCw, title: "Reintentos automáticos", description: "Con espera creciente y límite." },
      { icon: ShieldCheck, title: "Cada mensaje sale una sola vez", description: "Aunque la petición llegue repetida." },
      { icon: FileText, title: "El estado de cada envío", description: "Encolado, enviado, entregado o fallido." },
      { icon: Building2, title: "Acceso bajo control", description: "Llaves por ambiente y por aplicación." },
    ],
  },
};

export const NumeradasImpares: Story = {
  name: "Numeradas, 5 en 3 columnas sin hueco (ej. Lynx módulos)",
  args: {
    numbered: true,
    columns: 3,
    items: [
      { icon: Building2, title: "Gestión de activos", description: "Jerarquía de inmuebles." },
      { icon: FileText, title: "Estructuración", description: "Proyectos y fases." },
      { icon: Wallet, title: "Comercial", description: "Contratos y cánones." },
      { icon: Building2, title: "Propiedad horizontal", description: "Cuotas y asambleas." },
      { icon: Wallet, title: "Inversiones", description: "Rentabilidad por activo." },
    ],
  },
};

export const Compacta: Story = {
  name: "Compacta 3×3 (ej. CoreLink)",
  args: {
    variant: "compact",
    columns: 3,
    items: ["CAD · Recepción documental", "Compras", "Cuentas por pagar", "Cuentas por cobrar", "Tesorería", "Contabilidad", "Inventario", "Propiedad horizontal", "Presupuestos"].map(
      (title) => ({ title, description: "Conectado al mismo documento electrónico." }),
    ),
  },
};

export const ConEncabezado: Story = {
  name: "Con encabezado y enlaces",
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-10">
        <SectionHeading eyebrow="Productos" title="Todo lo que hacemos" description="Cada tarjeta lleva a su landing." />
        <Story />
      </div>
    ),
  ],
  args: {
    columns: 3,
    items: [
      { icon: Mail, title: "Deliver", description: "Mensajería multicanal por API.", href: "#" },
      { icon: FileText, title: "AdapterDian", description: "Facturación electrónica por API.", href: "#", tone: "success" },
      { icon: Building2, title: "Lynx", description: "Sistema operativo inmobiliario.", href: "#", tone: "warning" },
    ],
  },
};
