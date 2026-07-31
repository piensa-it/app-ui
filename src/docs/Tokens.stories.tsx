import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";

const meta = {
  title: "Tokens",
  parameters: {
    layout: "padded",
    // Página de referencia estática (sin `component`) — nunca va a tener
    // controles, acciones, pruebas de interacción ni auditoría de a11y que
    // mostrar, así que apagamos las 4 pestañas del panel inferior en vez de
    // dejarlas vacías ocupando espacio. Ver el mismo ajuste en
    // Versions.stories.tsx y ControlShowcase.stories.tsx (esta última deja
    // Accessibility activo porque sí es un formulario real interactivo).
    controls: { disable: true },
    actions: { disable: true },
    interactions: { disable: true },
    a11y: { disable: true },
    docs: {
      description: {
        component:
          "Los tokens de diseño (`src/styles/globals.css`) son variables CSS — nunca colores hardcodeados en los componentes. Cada producto (MisFin, Lynx...) sobreescribe este bloque con su propia paleta para lograr white-labeling sin tocar un solo componente. Cambia el toggle \"Tema\" del toolbar para ver la versión oscura.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const colorTokens: { name: string; bg: string; fg: string; usage: string }[] = [
  { name: "primary", bg: "bg-primary", fg: "text-primary-foreground", usage: "Acciones principales, CTAs" },
  { name: "secondary", bg: "bg-secondary", fg: "text-secondary-foreground", usage: "Acciones secundarias" },
  { name: "muted", bg: "bg-muted", fg: "text-muted-foreground", usage: "Fondos sutiles, texto de apoyo" },
  { name: "accent", bg: "bg-accent", fg: "text-accent-foreground", usage: "Hover states, resaltados" },
  { name: "surface", bg: "bg-surface", fg: "text-foreground", usage: "Controles y superficies base" },
  { name: "subtle", bg: "bg-subtle", fg: "text-subtle-foreground", usage: "Acciones y énfasis suaves" },
  { name: "success", bg: "bg-success", fg: "text-success-foreground", usage: "Estados positivos (pagado, activo)" },
  { name: "warning", bg: "bg-warning", fg: "text-warning-foreground", usage: "Estados de alerta (pendiente)" },
  { name: "destructive", bg: "bg-destructive", fg: "text-destructive-foreground", usage: "Errores, acciones destructivas" },
  { name: "card", bg: "bg-card", fg: "text-card-foreground", usage: "Superficies elevadas (Card, Popover)" },
  {
    name: "overlay",
    bg: "bg-overlay",
    fg: "text-white",
    usage: "Scrim detrás de modales/paneles — igual en claro y oscuro por defecto, pero sobreescribible",
  },
];

const radiusTokens = [
  { name: "sm", className: "rounded-sm" },
  { name: "md", className: "rounded-md" },
  { name: "lg", className: "rounded-lg" },
];

const densityTokens = [
  { name: "Compacta", value: "32 px", className: "h-control-compact" },
  { name: "Predeterminada", value: "40 px", className: "h-control-default" },
  { name: "Cómoda", value: "44 px", className: "h-control-comfortable" },
];

const elevationTokens = [
  { name: "sm", className: "shadow-sm" },
  { name: "md", className: "shadow-md" },
  { name: "lg", className: "shadow-lg" },
];

// No son variables CSS (a diferencia de color/radio/elevación) — es la
// escala de Tailwind, pero usada con un criterio fijo: el padding
// horizontal interno de un control escala junto con su altura
// (`--control-compact/default/comfortable`). Cualquier componente nuevo
// con tamaños `sm`/`md`/`lg` debería tomar estos mismos valores en vez de
// inventar los suyos — así lo hacen ya Button y los controles de Field.
const spacingTokens = [
  { name: "sm", px: "0.625rem (10px)", className: "px-2.5", pairsWith: "h-control-compact / h-9" },
  { name: "md", px: "0.875rem (14px)", className: "px-3.5", pairsWith: "h-control-default" },
  { name: "lg", px: "1rem (16px)", className: "px-4", pairsWith: "h-control-comfortable" },
];

const gapTokens = [
  { name: "compacto", className: "gap-1.5", usage: "Ícono + texto en un control pequeño" },
  { name: "por defecto", className: "gap-2", usage: "Entre controles relacionados (Button, Toolbar)" },
  { name: "sección", className: "gap-4", usage: "Entre bloques/campos de un formulario" },
  { name: "layout", className: "gap-6", usage: "Entre secciones de una página" },
];

const palettes = [
  { value: "indigo", label: "Índigo" },
  { value: "ocean", label: "Océano" },
  { value: "violet", label: "Violeta" },
  { value: "emerald", label: "Esmeralda" },
  { value: "ruby", label: "Rubí" },
  { value: "amber", label: "Ámbar" },
];

const fontFamilies = [
  { value: "geist", label: "Geist", character: "Neutral, precisa y optimizada para producto." },
  { value: "inter", label: "Inter", character: "Familiar, compacta y muy legible en interfaces densas." },
  { value: "dm-sans", label: "DM Sans", character: "Amable, geométrica y adecuada para productos públicos." },
  { value: "system", label: "Sistema", character: "Nativa, rápida y alineada con cada plataforma." },
];

const typeScale = [
  { token: "ui-display", className: "text-ui-display", sample: "Display", usage: "Portadas y cifras principales" },
  { token: "ui-title", className: "text-ui-title", sample: "Título de página", usage: "Encabezados principales" },
  { token: "ui-title-sm", className: "text-ui-title-sm", sample: "Título de sección", usage: "Cards y secciones" },
  { token: "ui-body", className: "text-ui-body", sample: "Texto de interfaz y lectura", usage: "Contenido principal" },
  { token: "ui-body-sm", className: "text-ui-body-sm", sample: "Texto auxiliar y controles", usage: "Controles y metadatos" },
  { token: "ui-caption", className: "text-ui-caption", sample: "CAPTION · 12 PX", usage: "Etiquetas y datos compactos" },
];

export const Colores: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {colorTokens.map((token) => (
        <div key={token.name} className="overflow-hidden rounded-lg border border-border">
          <div className={`flex h-20 items-center justify-center ${token.bg} ${token.fg}`}>
            <span className="text-sm font-medium">Aa</span>
          </div>
          <div className="p-3">
            <p className="font-mono text-sm font-semibold">--{token.name}</p>
            <p className="text-xs text-muted-foreground">{token.usage}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Radios: Story = {
  name: "Border radius",
  render: () => (
    <div className="flex flex-wrap gap-6">
      {radiusTokens.map((token) => (
        <div key={token.name} className="flex flex-col items-center gap-2">
          <div className={`h-16 w-16 border-2 border-primary ${token.className}`} />
          <span className="font-mono text-xs text-muted-foreground">{token.name}</span>
        </div>
      ))}
    </div>
  ),
};

export const Tipografia: Story = {
  name: "Tipografía",
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-heading text-3xl font-semibold tracking-tight">Geist Variable — encabezados</p>
        <p className="text-xs text-muted-foreground">--font-heading · jerarquía por peso, escala y espaciado</p>
      </div>
      <div>
        <p className="font-sans text-base">Geist Variable — interfaz y lectura</p>
        <p className="text-xs text-muted-foreground">--font-sans · controles, cuerpo y datos</p>
      </div>
    </div>
  ),
};

export const FamiliasTipograficas: Story = {
  name: "Familias tipográficas",
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      {fontFamilies.map((family) => (
        <section key={family.value} data-ui-font={family.value} className="rounded-lg border border-border bg-card p-5">
          <p className="font-heading text-ui-title font-semibold tracking-tight">{family.label}</p>
          <p className="mt-3 text-ui-body">Construye productos claros, modernos y consistentes.</p>
          <p className="mt-2 text-ui-body-sm text-muted-foreground">{family.character}</p>
          <code className="mt-4 block text-ui-caption text-muted-foreground">data-ui-font=&quot;{family.value}&quot;</code>
        </section>
      ))}
    </div>
  ),
};

export const EscalaTipografica: Story = {
  name: "Escala tipográfica",
  render: () => (
    <div className="divide-y divide-border rounded-lg border border-border bg-card px-5">
      {typeScale.map((item) => (
        <div key={item.token} className="grid gap-2 py-5 sm:grid-cols-[1fr_13rem] sm:items-baseline">
          <p className={`font-heading ${item.className} font-medium`}>{item.sample}</p>
          <div>
            <code className="text-ui-caption text-muted-foreground">text-{item.token}</code>
            <p className="mt-1 text-ui-caption text-muted-foreground">{item.usage}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Paletas: Story = {
  name: "Paletas de identidad",
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {palettes.map((palette) => (
        <section
          key={palette.value}
          data-ui-palette={palette.value}
          className="rounded-xl border border-surface-border bg-card p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-heading font-semibold">{palette.label}</p>
              <p className="font-mono text-xs text-muted-foreground">data-ui-palette=&quot;{palette.value}&quot;</p>
            </div>
            <span className="size-8 rounded-full bg-primary shadow-sm ring-4 ring-subtle" />
          </div>
          <div className="grid gap-3">
            <Input aria-label={`Campo ${palette.label}`} placeholder="Campo de ejemplo" />
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Continuar</Button>
              <Button size="sm" variant="subtle">Secundario</Button>
              <Switch checked aria-label={`Activo ${palette.label}`} />
            </div>
          </div>
        </section>
      ))}
    </div>
  ),
};

export const Densidad: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      {densityTokens.map((token) => (
        <div key={token.name} className="rounded-lg border border-border p-4">
          <div className={`flex items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground ${token.className}`}>
            Control
          </div>
          <p className="mt-3 text-sm font-semibold">{token.name}</p>
          <p className="text-xs text-muted-foreground">{token.value}</p>
        </div>
      ))}
    </div>
  ),
};

export const Espaciado: Story = {
  name: "Espaciado",
  parameters: {
    docs: {
      description: {
        story:
          "No es una variable CSS propia — es la escala de Tailwind, adoptada con un criterio fijo para que los tamaños `sm`/`md`/`lg` de todos los controles sean predecibles entre sí. Un componente nuevo con variantes de tamaño debería reusar esta tabla en vez de elegir su propio padding.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {spacingTokens.map((token) => (
          <div key={token.name} className="rounded-lg border border-border p-4">
            <div className={`inline-flex items-center rounded-md border border-dashed border-primary/40 bg-subtle ${token.className} py-2 text-sm font-medium text-subtle-foreground`}>
              {token.className}
            </div>
            <p className="mt-3 text-sm font-semibold">{token.name}</p>
            <p className="text-xs text-muted-foreground">{token.px}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">junto a {token.pairsWith}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-3 text-sm font-semibold">Separación entre elementos (`gap-*`)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {gapTokens.map((token) => (
            <div key={token.name} className="rounded-lg border border-border p-3">
              <code className="font-mono text-xs text-foreground">{token.className}</code>
              <p className="mt-1 text-xs text-muted-foreground">
                {token.name} — {token.usage}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const Elevacion: Story = {
  name: "Elevación",
  render: () => (
    <div className="grid gap-6 bg-muted p-8 sm:grid-cols-3">
      {elevationTokens.map((token) => (
        <div key={token.name} className={`rounded-lg border border-border bg-card p-6 ${token.className}`}>
          <p className="font-mono text-sm">shadow-{token.name}</p>
        </div>
      ))}
    </div>
  ),
};

export const Movimiento: Story = {
  name: "Movimiento y reducción",
  render: () => (
    <div className="space-y-3 text-sm">
      <p>Las transiciones usan duraciones semánticas de 120, 180 y 280 ms.</p>
      <p className="text-muted-foreground">
        Con <code>prefers-reduced-motion</code>, el sistema elimina animaciones y transformaciones no esenciales.
      </p>
    </div>
  ),
};
