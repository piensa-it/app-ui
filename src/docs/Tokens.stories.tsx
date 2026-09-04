import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

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
          "Los tokens de diseño (`src/styles/globals.css`) son variables CSS — nunca colores hardcodeados en los componentes. Cada producto puede sobreescribir este bloque con su propia paleta para lograr white-labeling sin tocar un solo componente. Cambia el toggle \"Tema\" del toolbar para ver la versión oscura.",
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

// La escala de espaciado sí son variables CSS (`--space-*`) desde la 0.3.0, y
// alimentan padding, margin, gap y space-y. Encima de los siete pasos hay
// cuatro nombres por ROL, que son los que deben usar los componentes: cambiar
// un rol cambia toda la interfaz de una vez.
//
// Los pasos llevan el prefijo `ui-` desde la 0.6.0. Sin él se llamaban igual
// que la escala de contenedores de Tailwind, que en v4 pierde siempre contra
// el espaciado: `max-w-2xl` valía 3 rem en vez de 42. Ver #71.
const spacingScale = [
  { name: "ui-2xs", value: "0.25rem", px: 4 },
  { name: "ui-xs", value: "0.5rem", px: 8 },
  { name: "ui-sm", value: "0.75rem", px: 12 },
  { name: "ui-md", value: "1rem", px: 16 },
  { name: "ui-lg", value: "1.5rem", px: 24 },
  { name: "ui-xl", value: "2rem", px: 32 },
  { name: "ui-2xl", value: "3rem", px: 48 },
];

const spacingRoles = [
  {
    name: "p-inset",
    equivale: "lg · 24px",
    usage: "Relleno interior de un contenedor: tarjeta, diálogo, panel.",
  },
  {
    name: "p-inset-compact",
    equivale: "md · 16px",
    usage: "Lo mismo en pantallas de captura, donde importa cuántas filas caben.",
  },
  {
    name: "space-y-stack",
    equivale: "lg · 24px",
    usage: "Ritmo vertical entre bloques de primer nivel. Lo aplica PageContainer.",
  },
  {
    name: "gap-field",
    equivale: "xs · 8px",
    usage: "Entre una etiqueta y su control. Lo aplica Field.",
  },
];

/**
 * Qué clase de token es cada uno. La distinción no es cosmética: `--primary` y
 * `--accent` se leen igual y no se parecen en nada, y confundirlos deja todos
 * los `hover` teñidos del color de marca (#76).
 */
const tokenClasses = [
  {
    id: "identidad",
    title: "Identidad",
    themable: true,
    summary: "Lo que cambia de una marca a otra. Es lo único que mueve una paleta.",
    tokens: ["--primary", "--primary-foreground", "--ring", "--subtle", "--subtle-hover", "--subtle-foreground", "--chart-1"],
  },
  {
    id: "significado",
    title: "Significado universal",
    themable: false,
    summary:
      "Rojo es peligro y ámbar es atención en cualquier marca. Teñirlos de la marca borra lo único que comunican.",
    tokens: ["--destructive", "--success", "--warning", "--overlay", "--shadow-color"],
  },
  {
    id: "interaccion",
    title: "Estado de interacción",
    themable: false,
    summary:
      "Son grises deliberados: el fondo de un hover, de una opción de menú o de un texto secundario. Con color de marca dejan el texto de dentro ilegible.",
    tokens: ["--accent", "--accent-foreground", "--muted", "--muted-foreground", "--secondary", "--secondary-foreground"],
  },
  {
    id: "estructura",
    title: "Estructura",
    themable: false,
    summary:
      "Superficies, bordes y campos. Sostienen la escala de elevación: moverlos por marca la rompe en todas las pantallas a la vez.",
    tokens: ["--ground", "--surface", "--raised", "--border", "--input", "--card", "--popover"],
  },
  {
    id: "menu",
    title: "Menú lateral",
    themable: false,
    summary:
      "Un plano cromático aparte, oscuro en los dos temas. Se elige con `variant` en AppShell, no con la paleta.",
    tokens: ["--sidebar", "--sidebar-foreground", "--sidebar-active", "--sidebar-hover", "--sidebar-ring"],
  },
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

export const QuePuedeMoverUnTema: Story = {
  name: "Qué puede mover un tema",
  parameters: {
    docs: {
      description: {
        story:
          "Los tokens de color no son todos de la misma clase. Solo los de identidad son de la marca; el resto sostiene significados, estados o estructura, y moverlos desde una paleta rompe cosas que no se ven hasta que alguien las usa.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-ui-lg">
      <p className="max-w-3xl text-ui-body-sm text-muted-foreground">
        Una paleta mueve <strong>siete</strong> tokens. El resto no es de la marca. El caso que motivó esta
        página: una aplicación movió <code className="font-mono">--accent</code> creyendo que era un color de
        identidad —es el gris de los <em>hover</em>—, y con el tema en verde todos los hover salieron en verde
        saturado con el texto gris de dentro ilegible. La misma paleta no movía{" "}
        <code className="font-mono">--ring</code>, así que el anillo de foco se quedó en el azul de fábrica: el
        único sitio de la pantalla que no se enteraba del cambio de tema.
      </p>

      {tokenClasses.map((clase) => (
        <section
          key={clase.id}
          className={cn(
            "rounded-xl border p-inset",
            clase.themable ? "border-primary/40 bg-subtle" : "border-surface-border bg-surface",
          )}
        >
          <div className="flex flex-wrap items-center gap-ui-sm">
            <h3 className="text-ui-title-sm font-semibold">{clase.title}</h3>
            <Badge variant={clase.themable ? "success" : "secondary"}>
              {clase.themable ? "Se puede tematizar" : "No se toca"}
            </Badge>
          </div>
          <p className="mt-ui-2xs max-w-3xl text-ui-body-sm text-muted-foreground">{clase.summary}</p>
          <div className="mt-ui-sm flex flex-wrap gap-ui-2xs">
            {clase.tokens.map((token) => (
              <code
                key={token}
                className="rounded-md border border-border bg-raised px-ui-2xs py-px font-mono text-ui-caption"
              >
                {token}
              </code>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl border border-surface-border bg-surface p-inset">
        <h3 className="text-ui-title-sm font-semibold">Declarar una marca propia</h3>
        <p className="mt-ui-2xs max-w-3xl text-ui-body-sm text-muted-foreground">
          Si la marca no es ninguna de las seis paletas incluidas, <code className="font-mono">createPalette</code>{" "}
          construye los siete tokens a partir del color. Los que no se tocan no están en su firma, así que no se
          pueden mover por error.
        </p>
        <pre className="mt-ui-sm overflow-x-auto rounded-lg border border-border bg-raised p-ui-sm font-mono text-ui-caption">
{`import { createPalette } from "@piensa-it/ui-library";

<div style={createPalette({ primary: "158 64% 32%" })}>
  <UiProvider>{children}</UiProvider>
</div>`}
        </pre>
      </section>
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
          "Siete pasos en variables CSS (`--space-*`) que alimentan `p-*`, `m-*`, `gap-*` y `space-y-*`. Encima hay cuatro nombres por rol: son los que usan los componentes, y los que hay que usar para que dos aplicaciones respiren igual.",
      },
    },
  },
  render: () => (
    <div className="flex flex-col gap-ui-2xl">
      <section>
        <h3 className="text-ui-title-sm font-semibold">La escala</h3>
        <p className="mb-ui-md mt-ui-2xs text-ui-body-sm text-muted-foreground">
          Cada paso es visiblemente mayor que el anterior. La barra mide exactamente el valor del token. Se
          usan con su prefijo —<code className="font-mono">p-ui-md</code>,{" "}
          <code className="font-mono">gap-ui-sm</code>— para no quitarle a Tailwind los nombres de{" "}
          <code className="font-mono">max-w-*</code>.
        </p>
        <div className="flex flex-col gap-ui-xs">
          {spacingScale.map((token) => (
            <div key={token.name} className="flex items-center gap-ui-md">
              <code className="w-20 shrink-0 font-mono text-ui-caption text-muted-foreground">{token.name}</code>
              <div className="h-4 bg-primary" style={{ width: token.value }} />
              <span className="text-ui-caption text-muted-foreground">
                {token.value} · {token.px}px
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-ui-title-sm font-semibold">Los cuatro roles</h3>
        <p className="mb-ui-md mt-ui-2xs text-ui-body-sm text-muted-foreground">
          Un componente no elige un número: elige un rol. Así se puede cambiar el relleno de todas las tarjetas
          de todas las aplicaciones tocando un token.
        </p>
        <div className="grid gap-ui-sm sm:grid-cols-2">
          {spacingRoles.map((role) => (
            <div key={role.name} className="rounded-lg border border-border p-ui-md">
              <div className="flex items-baseline justify-between gap-ui-xs">
                <code className="font-mono text-ui-body-sm font-semibold text-foreground">{role.name}</code>
                <span className="text-ui-caption text-muted-foreground">{role.equivale}</span>
              </div>
              <p className="mt-ui-2xs text-ui-body-sm text-muted-foreground">{role.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-ui-title-sm font-semibold">Cómo se ve la diferencia</h3>
        <p className="mb-ui-md mt-ui-2xs text-ui-body-sm text-muted-foreground">
          La misma tarjeta con el relleno normal y con el compacto. Es la diferencia entre una pantalla de
          consulta y una de captura.
        </p>
        <div className="grid gap-ui-md sm:grid-cols-2">
          {[
            { label: "p-inset", className: "p-inset" },
            { label: "p-inset-compact", className: "p-inset-compact" },
          ].map((variant) => (
            <div key={variant.label} className="rounded-lg border border-dashed border-primary/40">
              <div className={variant.className}>
                <div className="rounded-md bg-subtle p-ui-sm">
                  <p className="text-ui-body-sm font-medium text-subtle-foreground">Contenido</p>
                </div>
              </div>
              <p className="border-t border-border px-ui-sm py-ui-2xs text-center font-mono text-ui-caption text-muted-foreground">
                {variant.label}
              </p>
            </div>
          ))}
        </div>
      </section>
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
