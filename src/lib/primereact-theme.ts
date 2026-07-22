/**
 * Tema Tailwind para PrimeReact (modo `unstyled`).
 *
 * PrimeReact se usa siempre en modo `unstyled: true` — nunca cargamos sus
 * temas SASS (Lara, MD, etc.). En su lugar, cada componente recibe un objeto
 * "passthrough" (`pt`) que mapea sus partes internas (root, header, panel...)
 * a las mismas clases Tailwind/tokens definidos en `styles/globals.css`
 * (`bg-primary`, `text-foreground`, `border-border`...). Así, PrimeReact y
 * nuestros componentes propios (Button, Card, Badge) comparten una única
 * identidad visual — la de Piensa IT — y el white-labeling de cada app
 * consumidora (sobreescribiendo las CSS vars) sigue funcionando igual para
 * ambos.
 *
 * Ver: https://primereact.dev/docs/styled/guides/configuration (unstyled + pt)
 */
import type { PrimeReactPTOptions } from "primereact/api";

/** Anillo de foco consistente con el resto de la librería (ver button.tsx). */
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const transition = "transition-colors duration-150";

/**
 * Anillo de 1px casi invisible que reforzamos junto a la sombra en paneles
 * flotantes/modales. Una sombra sola sobre fondos claros se ve tenue; el
 * hairline le da un borde definido sin depender solo del `box-shadow`
 * (mismo truco que usan Linear/Vercel/shadcn para que los overlays no se
 * sientan "planos" sobre el fondo).
 */
const elevationRing = "ring-1 ring-black/5 dark:ring-white/10";

export const piensaTheme: PrimeReactPTOptions = {
  // --- Inputs de texto ---
  inputtext: {
    root: {
      className: cx(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
        "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        focusRing,
        transition,
      ),
    },
  },
  inputtextarea: {
    root: {
      className: cx(
        "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
        "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        focusRing,
        transition,
      ),
    },
  },

  // --- Dropdown (Select) ---
  dropdown: {
    root: {
      className: cx(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        focusRing,
        transition,
      ),
    },
    input: { className: "flex-1 truncate bg-transparent outline-none" },
    trigger: { className: "flex w-6 items-center justify-center text-muted-foreground" },
    panel: {
      className: cx(
        "z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
        elevationRing,
      ),
    },
    list: { className: "max-h-72 overflow-auto p-1" },
    item: {
      className: cx(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        transition,
      ),
    },
    emptyMessage: { className: "px-2 py-1.5 text-sm text-muted-foreground" },
    filterContainer: { className: "border-b border-border p-2" },
    filterInput: {
      className: "h-8 w-full rounded-sm border border-input bg-transparent px-2 text-sm outline-none",
    },
  },

  // --- MultiSelect ---
  multiselect: {
    root: {
      className: cx(
        "flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        focusRing,
        transition,
      ),
    },
    labelContainer: { className: "flex-1 overflow-hidden" },
    label: { className: "flex flex-wrap gap-1 truncate" },
    trigger: { className: "flex w-6 items-center justify-center text-muted-foreground" },
    panel: {
      className: cx(
        "z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
        elevationRing,
      ),
    },
    header: { className: "flex items-center gap-2 border-b border-border p-2" },
    filterContainer: { className: "flex-1" },
    filterInput: {
      className: "h-8 w-full rounded-sm border border-input bg-transparent px-2 text-sm outline-none",
    },
    list: { className: "max-h-72 overflow-auto p-1" },
    item: {
      className: cx(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        transition,
      ),
    },
  },

  // --- AutoComplete ---
  autocomplete: {
    root: { className: "w-full" },
    input: {
      root: {
        className: cx(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
          "placeholder:text-muted-foreground",
          focusRing,
          transition,
        ),
      },
    },
    panel: {
      className: cx(
        "z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
        elevationRing,
      ),
    },
    list: { className: "max-h-72 overflow-auto p-1" },
    item: {
      className: cx(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        transition,
      ),
    },
    emptyMessage: { className: "px-2 py-1.5 text-sm text-muted-foreground" },
  },

  // --- Checkbox / RadioButton / InputSwitch / Slider ---
  checkbox: {
    root: { className: "relative inline-flex h-4 w-4 shrink-0" },
    box: {
      className: cx(
        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary shadow",
        "aria-checked:bg-primary aria-checked:text-primary-foreground",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        focusRing,
        transition,
      ),
    },
    icon: { className: "h-3.5 w-3.5" },
  },
  radiobutton: {
    root: { className: "relative inline-flex h-4 w-4 shrink-0" },
    box: {
      className: cx(
        "flex h-4 w-4 items-center justify-center rounded-full border border-primary shadow",
        "aria-checked:border-primary",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        focusRing,
        transition,
      ),
    },
    icon: { className: "h-2 w-2 rounded-full bg-primary" },
  },
  inputswitch: {
    root: { className: "relative inline-flex h-5 w-9 shrink-0" },
    slider: {
      className: cx(
        "absolute inset-0 cursor-pointer rounded-full bg-input",
        "before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-background before:shadow before:transition-transform",
        "aria-checked:bg-primary aria-checked:before:translate-x-4",
        "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
        transition,
      ),
    },
  },
  slider: {
    root: { className: "relative flex h-4 w-full items-center" },
    range: { className: "absolute h-1.5 rounded-full bg-primary" },
    handle: {
      className: cx(
        "block h-4 w-4 rounded-full border-2 border-primary bg-background shadow",
        focusRing,
      ),
    },
  },

  // --- Overlays: Dialog / ConfirmDialog / Sidebar / OverlayPanel / Tooltip ---
  dialog: {
    root: {
      className: cx("w-full max-w-lg rounded-lg border border-border bg-background shadow-2xl", elevationRing),
    },
    header: { className: "flex items-center justify-between gap-4 p-6 pb-0" },
    headerTitle: { className: "font-heading text-lg font-semibold leading-none tracking-tight" },
    closeButton: {
      className: cx(
        "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
        focusRing,
      ),
    },
    content: { className: "p-6 text-sm text-foreground" },
    footer: { className: "flex flex-col-reverse gap-2 p-6 pt-0 sm:flex-row sm:justify-end" },
    mask: { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" },
  },
  confirmdialog: {
    root: {
      className: cx("w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-2xl", elevationRing),
    },
    header: { className: "flex items-center gap-3 pb-2" },
    headerTitle: { className: "font-heading text-lg font-semibold" },
    icon: { className: "text-2xl text-warning" },
    content: { className: "pb-4 text-sm text-muted-foreground" },
    footer: { className: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end" },
    rejectButton: {
      root: {
        className: cx(
          "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent",
          transition,
        ),
      },
    },
    acceptButton: {
      root: {
        className: cx(
          "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90",
          transition,
        ),
      },
    },
  },
  sidebar: {
    root: {
      className: cx("fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-2xl", elevationRing),
    },
    header: { className: "flex items-center justify-between" },
    closeButton: {
      className: cx(
        "rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100",
        focusRing,
      ),
    },
    content: { className: "flex-1 overflow-auto" },
    mask: { className: "fixed inset-0 z-50 bg-black/60" },
  },
  overlaypanel: {
    root: {
      className: cx(
        "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-lg",
        elevationRing,
      ),
    },
  },
  tooltip: {
    root: { className: "z-50" },
    text: {
      className: "rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-lg",
    },
  },

  // --- Navegación: TabView / Accordion ---
  tabview: {
    root: { className: "w-full" },
    navContainer: { className: "relative" },
    nav: { className: "flex gap-1 border-b border-border" },
    panelContainer: { className: "py-4" },
  },
  accordion: {
    root: { className: "w-full divide-y divide-border rounded-md border border-border" },
    accordiontab: {
      headerAction: {
        className: cx(
          "flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium",
          "aria-expanded:text-primary hover:bg-accent/50",
          focusRing,
          transition,
        ),
      },
      headerIcon: { className: "text-muted-foreground transition-transform" },
      content: { className: "px-4 pb-4 text-sm text-muted-foreground" },
    },
  },

  // --- Feedback: Toast / Avatar / ProgressBar ---
  toast: {
    root: { className: "z-50 flex w-96 max-w-[90vw] flex-col gap-2" },
    message: {
      className: cx(
        "flex items-start gap-3 rounded-md border border-border bg-card p-4 text-card-foreground shadow-xl",
        elevationRing,
      ),
    },
    content: { className: "flex flex-1 items-start gap-3" },
    summary: { className: "text-sm font-semibold" },
    detail: { className: "mt-1 text-sm text-muted-foreground" },
    closeButton: { className: "text-muted-foreground hover:text-foreground" },
  },
  avatar: {
    root: {
      className:
        "inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-medium text-secondary-foreground",
    },
  },
  progressbar: {
    root: { className: "h-2 w-full overflow-hidden rounded-full bg-secondary" },
    value: { className: "h-full bg-primary transition-all" },
    label: { className: "hidden" },
  },

  // --- Datos: DataTable / Column / Calendar / FileUpload / Chart ---
  datatable: {
    wrapper: { className: "overflow-auto rounded-md border border-border" },
    table: { className: "w-full border-collapse text-sm" },
    thead: { className: "bg-muted/50" },
    headerRow: { className: "" },
    tbody: { className: "divide-y divide-border" },
    row: { root: { className: cx("hover:bg-accent/40", transition) } },
    paginator: {
      root: { className: "flex items-center justify-between gap-2 border-t border-border p-3 text-sm" },
    },
  },
  column: {
    headerCell: {
      className: "border-b border-border px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
    },
    bodyCell: { className: "px-4 py-3 align-middle" },
  },
  calendar: {
    input: {
      className: cx(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
        focusRing,
        transition,
      ),
    },
    panel: {
      className: cx(
        "z-50 mt-1 rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-lg",
        elevationRing,
      ),
    },
    header: { className: "mb-2 flex items-center justify-between" },
    title: { className: "text-sm font-semibold" },
    tableHeaderCell: { className: "p-1 text-xs font-medium text-muted-foreground" },
    day: {
      className: cx(
        "flex h-8 w-8 items-center justify-center rounded-md text-sm hover:bg-accent aria-selected:bg-primary aria-selected:text-primary-foreground",
        transition,
      ),
    },
  },
  fileupload: {
    root: { className: "flex flex-col gap-3" },
    buttonbar: { className: "flex items-center gap-2" },
    content: {
      className: "rounded-md border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground",
    },
    file: {
      className: "flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm",
    },
  },
  chart: {
    root: { className: "relative w-full" },
  },
};

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export default piensaTheme;
