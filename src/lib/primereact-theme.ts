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

/** Botones de navegación del paginador de DataTable (primera/anterior/siguiente/última página). */
const paginatorNavButton = {
  className: cx(
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    "disabled:pointer-events-none disabled:opacity-40",
    transition,
  ),
};

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
    label: { className: "flex flex-wrap items-center gap-1" },
    token: {
      className:
        "inline-flex max-w-full items-center gap-1 rounded-md bg-secondary py-0.5 pl-2 pr-1 text-xs text-secondary-foreground",
    },
    tokenLabel: { className: "truncate" },
    removeTokenIcon: {
      className: cx(
        "size-3.5 shrink-0 cursor-pointer rounded-sm text-secondary-foreground/70 hover:text-secondary-foreground",
        transition,
      ),
    },
    trigger: { className: "flex w-6 shrink-0 items-center justify-center text-muted-foreground" },
    dropdownIcon: { className: "size-3.5" },
    clearIcon: { className: "size-3.5 shrink-0 text-muted-foreground hover:text-foreground" },
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
    // Modo `multiple`: el input se reemplaza por un <ul> (`container`) con un
    // <li> por cada valor seleccionado (`token`) + un último <li> con el
    // input de texto real (`inputToken`).
    container: {
      className: cx(
        "flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm",
        focusRing,
        transition,
      ),
    },
    token: {
      className:
        "inline-flex max-w-full items-center gap-1 rounded-md bg-secondary py-0.5 pl-2 pr-1 text-xs text-secondary-foreground",
    },
    tokenLabel: { className: "truncate" },
    removeTokenIcon: {
      className: cx(
        "size-3.5 shrink-0 cursor-pointer rounded-sm text-secondary-foreground/70 hover:text-secondary-foreground",
        transition,
      ),
    },
    inputToken: { className: "flex-1" },
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
  //
  // IMPORTANTE: en modo `unstyled` PrimeReact NO oculta el <input> nativo que
  // usa internamente para accesibilidad — en modo "styled" eso lo hace su CSS
  // base (clase `p-hidden-accessible`), que nosotros nunca cargamos. Si el PT
  // `input` se deja sin estilo, el checkbox/radio/switch nativo del navegador
  // queda visible al lado de nuestro control custom (bug real, visto en vivo:
  // un círculo rojo nativo junto al box con foco). Por eso `input` siempre se
  // posiciona en `absolute inset-0 opacity-0` sobre el `root` — sigue siendo
  // clickeable/focuseable (accesibilidad intacta vía teclado/lector de
  // pantalla) pero visualmente invisible, y usamos `peer`/`group` + su estado
  // real (`:checked`, `:disabled`, `aria-checked`) para estilar el control
  // visual (`box`/`slider`) en vez de los `aria-*`/`data-p-*` que PrimeReact
  // pone en elementos que no siempre coinciden con lo que Tailwind matchea.
  checkbox: {
    root: { className: "group relative inline-flex h-4 w-4 shrink-0" },
    input: {
      className: "peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed",
    },
    box: {
      className: cx(
        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary shadow",
        // PrimeReact sí replica el estado en `data-p-highlight` del propio `box`.
        "data-[p-highlight=true]:bg-primary data-[p-highlight=true]:text-primary-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
        transition,
      ),
    },
    icon: { className: "h-3.5 w-3.5" },
  },
  radiobutton: {
    root: { className: "group relative inline-flex h-4 w-4 shrink-0" },
    input: {
      className: "peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed",
    },
    box: {
      className: cx(
        "flex h-4 w-4 items-center justify-center rounded-full border border-primary shadow",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
        transition,
      ),
    },
    // El `icon` (punto interno) SIEMPRE está en el DOM, no solo cuando está
    // seleccionado (a diferencia de Checkbox) — hay que ocultarlo nosotros
    // mismos según `data-p-checked`, que PrimeReact solo pone en el `root`.
    icon: {
      className: cx(
        "h-2 w-2 rounded-full bg-primary opacity-0 group-data-[p-checked=true]:opacity-100",
        transition,
      ),
    },
  },
  inputswitch: {
    root: { className: "group relative inline-flex h-5 w-9 shrink-0" },
    input: {
      className: "peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed",
    },
    slider: {
      className: cx(
        "absolute inset-0 cursor-pointer rounded-full bg-input",
        "before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-background before:shadow before:transition-transform",
        // El `role="checkbox" aria-checked` de PrimeReact vive en el `root`, no en el `slider`.
        "group-aria-checked:bg-primary group-aria-checked:before:translate-x-4",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
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
          "flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium",
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
      firstPageButton: paginatorNavButton,
      prevPageButton: paginatorNavButton,
      nextPageButton: paginatorNavButton,
      lastPageButton: paginatorNavButton,
      pages: { className: "flex items-center gap-1" },
      pageButton: {
        className: cx(
          "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-muted-foreground",
          "aria-[current=true]:bg-primary aria-[current=true]:text-primary-foreground",
          "hover:bg-accent hover:text-accent-foreground aria-[current=true]:hover:bg-primary/90",
          transition,
        ),
      },
      RPPDropdown: {
        root: {
          className: cx(
            "flex h-8 items-center gap-1 rounded-md border border-input bg-transparent px-2 text-sm",
            focusRing,
            transition,
          ),
        },
        panel: {
          className: cx(
            "z-50 mt-1 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg",
            elevationRing,
          ),
        },
        list: { className: "max-h-56 overflow-auto p-1" },
        item: {
          className: cx(
            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1 text-sm outline-none",
            "aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            transition,
          ),
        },
      },
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
    previousButton: {
      className: cx(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        focusRing,
        transition,
      ),
    },
    nextButton: {
      className: cx(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        focusRing,
        transition,
      ),
    },
    previousIcon: { className: "size-4" },
    nextIcon: { className: "size-4" },
    title: { className: "flex items-center gap-1 text-sm font-semibold" },
    monthTitle: { className: cx("rounded-sm px-1 hover:text-primary", transition) },
    yearTitle: { className: cx("rounded-sm px-1 hover:text-primary", transition) },
    table: { className: "w-full border-collapse" },
    tableHeaderCell: { className: "p-1 text-xs font-medium text-muted-foreground" },
    // OJO: `day` es el <td> real (table-cell) — nunca darle `display: flex`
    // aquí, rompe el layout de la tabla y los días se apilan en una columna.
    // El estilo visual (tamaño, hover, selección) va en `dayLabel`, que es el
    // <span> clickeable interno donde PrimeReact pone `aria-selected`.
    day: { className: "p-0.5 text-center" },
    dayLabel: {
      className: cx(
        "mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm hover:bg-accent",
        "aria-selected:bg-primary aria-selected:text-primary-foreground",
        "aria-disabled:pointer-events-none aria-disabled:opacity-40",
        focusRing,
        transition,
      ),
    },
  },
  fileupload: {
    root: { className: "flex flex-col gap-3" },
    buttonbar: { className: "flex flex-wrap items-center gap-2" },
    // `chooseButton` es un <span> (no un <button>), así que se estila como
    // botón "outline" directamente en vez de reutilizar `ButtonPassThroughOptions`.
    chooseButton: {
      className: cx(
        "relative inline-flex h-9 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground",
        "aria-disabled:pointer-events-none aria-disabled:opacity-50",
        focusRing,
        transition,
      ),
    },
    chooseIcon: { className: "size-4" },
    chooseButtonLabel: { className: "flex-1 truncate" },
    uploadButton: {
      root: {
        className: cx(
          "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90",
          "disabled:pointer-events-none disabled:opacity-50",
          focusRing,
          transition,
        ),
      },
      icon: { className: "size-4" },
    },
    cancelButton: {
      root: {
        className: cx(
          "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground",
          "disabled:pointer-events-none disabled:opacity-50",
          focusRing,
          transition,
        ),
      },
      icon: { className: "size-4" },
    },
    content: {
      className: "rounded-md border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground",
    },
    file: {
      className: "flex items-center justify-between gap-3 rounded-md border border-border p-2 text-sm",
    },
    thumbnail: { className: "h-10 w-10 shrink-0 rounded object-cover" },
    details: { className: "flex flex-1 flex-col gap-0.5 overflow-hidden" },
    fileName: { className: "truncate text-sm text-foreground" },
    fileSize: { className: "text-xs text-muted-foreground" },
    badge: { root: { className: "shrink-0" } },
    actions: { className: "flex shrink-0 items-center gap-1" },
    removeButton: {
      root: {
        className: cx(
          "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive",
          focusRing,
          transition,
        ),
      },
      icon: { className: "size-4" },
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
