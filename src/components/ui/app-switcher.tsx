import * as React from "react";
import { ArrowLeft, Check, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";

export interface AppSwitcherItem {
  id: string;
  label: string;
  /**
   * De qué va la opción. Un desplegable no tiene sitio para esto; una
   * cuadrícula sí, y es lo que hace que quince opciones se distingan.
   */
  description?: string;
  /** Icono de la opción. Es lo que distingue una de otra: no llevan color por grupo. */
  icon?: React.ComponentType<{ className?: string }>;
  /** Distintivo junto al nombre: entorno, estado… */
  badge?: { label: string; tone?: "neutral" | "warning" | "danger" };
  /**
   * Lo que hace falta para no equivocarse, en filas legibles y no apretado en
   * una línea: el NIT, el rol con el que se entra, la sucursal. Se repiten en
   * el paso de confirmación: quien confirma tiene que verlos otra vez.
   */
  details?: { label: string; value: React.ReactNode }[];
  disabled?: boolean;
}

export interface AppSwitcherConfirm {
  /** «Cambiar a Acme S.A.». Recibe la opción elegida. */
  title: string | ((item: AppSwitcherItem) => string);
  /** Qué va a cambiar. Recibe la opción elegida. */
  description?: React.ReactNode | ((item: AppSwitcherItem) => React.ReactNode);
  /** @default "Confirmar" */
  confirmLabel?: string;
  /** @default "Volver" */
  backLabel?: string;
}

export interface AppSwitcherGroup {
  id: string;
  label: string;
  items: AppSwitcherItem[];
}

export interface AppSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** «Cambiar de módulo», «Cambiar de empresa»… */
  title: string;
  description?: string;
  /** @default "Buscar…" */
  searchPlaceholder?: string;
  /** Nombre accesible del buscador. @default "Buscar" */
  searchLabel?: string;
  /** Opción en la que se está. Se marca como «aquí estás» y no es elegible. */
  activeId?: string;
  onSelect: (id: string, item: AppSwitcherItem) => void;
  /**
   * Identificadores de las últimas opciones elegidas, de la más reciente a la
   * más antigua. Salen primero. La activa se excluye: cambiar a donde ya estás
   * no es cambiar.
   */
  recent?: string[];
  /** @default "Recientes" */
  recentLabel?: string;
  groups: AppSwitcherGroup[];
  /** @default "No hay nada que coincida." */
  emptyMessage?: string;
  /**
   * Recordatorio al pie, para que nadie confunda esta ventana con la paleta de
   * comandos. La aplicación sabe si tiene una; la librería no.
   * @example hint={<>Para buscar pantallas, <kbd>Ctrl</kbd> <kbd>K</kbd>.</>}
   */
  hint?: React.ReactNode;
  /**
   * Un segundo paso antes de confirmar, para cuando elegir no es cambiar de
   * pestaña: cambiar de empresa cambia los datos, los permisos y quién emite lo
   * que se factura. Sin `confirm`, se elige al primer clic.
   *
   * Es un segundo panel DENTRO de la misma ventana, no una ventana encima:
   * apilar capas modales es lo que más caro ha salido —Radix y Zag peleándose
   * por `pointer-events`, cierres en cascada, foco que se va— y aquí no aporta
   * nada, es el mismo asunto en dos pasos. Desde ahí se puede volver a la lista
   * sin elegir.
   */
  confirm?: AppSwitcherConfirm;
  className?: string;
}

/** Sin tildes ni mayúsculas: «nomina» encuentra «Nómina». */
const fold = (text: string) =>
  text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

interface Entry {
  /** Único en el DOM aunque la opción salga dos veces (recientes y su grupo). */
  key: string;
  item: AppSwitcherItem;
}

interface Section {
  id: string;
  label: string | null;
  entries: Entry[];
}

/**
 * Una ventana para elegir entre pocas cosas importantes: buscador arriba,
 * recientes primero, y el resto en cuadrícula con icono y descripción.
 *
 * Existe porque un desplegable no sirve para elegir entre quince cosas. Medido
 * en CoreLink en una ventana de 800 px: el desplegable de módulos medía 921,
 * sobresalía 239 y su contenedor recortaba sin dejar desplazarse; las últimas
 * opciones eran inalcanzables. Y antes que eso: un desplegable no tiene sitio
 * para decir de qué va cada opción.
 *
 * No es la paleta de comandos. Aquella busca PANTALLAS —cientos, en lista—;
 * esto elige entre pocas cosas y se ve como lo que es, una cuadrícula de
 * fichas. Por eso tiene buscador propio y admite un `hint` al pie que recuerde
 * dónde está la otra.
 *
 * Teclado en patrón de combobox: el foco no sale del buscador; las flechas
 * mueven el resaltado con `aria-activedescendant`. Así se escribe y se navega
 * sin soltar. Roles `listbox` y `option`, que son los correctos para elegir
 * uno de una lista y dan a las pruebas un localizador estable.
 *
 * Una opción puede salir dos veces —en recientes y en su grupo—: quitarla del
 * grupo deja huecos en la cuadrícula. Quien la localice en una prueba tiene
 * que desambiguar con `.first()`.
 *
 * @example
 * ```tsx
 * <AppSwitcher
 *   open={abierto}
 *   onOpenChange={setAbierto}
 *   title="Cambiar de módulo"
 *   activeId={modulo}
 *   onSelect={(id) => navegar(id)}
 *   recent={recientes}
 *   groups={grupos}
 * />
 * ```
 */
export function AppSwitcher({ open, onOpenChange, className, ...panel }: AppSwitcherProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      initialFocusEl={() => inputRef.current}
      className={cn(
        // La ventana no crece MÁS ALLÁ de la pantalla: con treinta opciones
        // es la lista la que se desplaza dentro. Es el fallo original, y el que
        // se prueba explícitamente. Con tres opciones, en cambio, se ajusta a
        // ellas: un alto fijo dejaba media ventana vacía.
        "flex max-h-[min(44rem,calc(100dvh-2rem))] flex-col overflow-hidden p-0 sm:max-w-3xl",
        className,
      )}
    >
      {/* El estado vive aquí dentro y no en `AppSwitcher`: el diálogo monta
          perezoso y desmonta al cerrar, así que cada apertura empieza limpia
          —sin la búsqueda de la vez anterior— sin ningún efecto que lo vacíe. */}
      <Panel {...panel} onOpenChange={onOpenChange} inputRef={inputRef} />
    </Dialog>
  );
}

type PanelProps = Omit<AppSwitcherProps, "open" | "className"> & {
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function Panel({
  onOpenChange,
  inputRef,
  title,
  description,
  searchPlaceholder = "Buscar…",
  searchLabel = "Buscar",
  activeId,
  onSelect,
  recent = [],
  recentLabel = "Recientes",
  groups,
  emptyMessage = "No hay nada que coincida.",
  hint,
  confirm,
}: PanelProps) {
  const [query, setQuery] = React.useState("");
  const [highlighted, setHighlighted] = React.useState(0);
  // La opción elegida a la espera de confirmación. Es el segundo paso, y vive
  // en este mismo panel: no hay segunda capa modal.
  const [pending, setPending] = React.useState<AppSwitcherItem | null>(null);
  const listboxId = React.useId();

  const sections = React.useMemo<Section[]>(() => {
    const all = groups.flatMap((group) => group.items);
    const byId = new Map(all.map((item) => [item.id, item]));
    const needle = fold(query.trim());

    if (needle) {
      // Buscando no hay recientes ni grupos: mezclar el orden de los grupos
      // con el de la relevancia deja a quien busca sin saber por qué algo está
      // donde está. Primero lo que coincide por nombre, luego por descripción.
      const byLabel = all.filter((item) => fold(item.label).includes(needle));
      const byDescription = all.filter(
        (item) => !byLabel.includes(item) && item.description && fold(item.description).includes(needle),
      );
      return [
        {
          id: "results",
          label: null,
          entries: [...byLabel, ...byDescription].map((item) => ({ key: `result-${item.id}`, item })),
        },
      ];
    }

    const recents = recent
      .filter((id) => id !== activeId)
      .map((id) => byId.get(id))
      .filter((item): item is AppSwitcherItem => item !== undefined)
      .map((item) => ({ key: `recent-${item.id}`, item }));

    return [
      ...(recents.length > 0 ? [{ id: "recent", label: recentLabel, entries: recents }] : []),
      ...groups.map((group) => ({
        id: group.id,
        label: group.label,
        entries: group.items.map((item) => ({ key: `${group.id}-${item.id}`, item })),
      })),
    ];
  }, [groups, query, recent, activeId, recentLabel]);

  const entries = React.useMemo(
    () => sections.flatMap((section) => section.entries).filter((entry) => !entry.item.disabled),
    [sections],
  );
  // Con detalles por opción —NIT, rol— tres columnas aprietan las filas hasta
  // partir el NIT en dos renglones. Dos columnas les dan el sitio que piden.
  const detailed = groups.some((group) => group.items.some((item) => item.details && item.details.length > 0));
  const current = entries[Math.min(highlighted, Math.max(entries.length - 1, 0))];

  const commit = (item: AppSwitcherItem) => {
    onSelect(item.id, item);
    onOpenChange(false);
  };

  const choose = (entry: Entry) => {
    // Cambiar a donde ya estás no es cambiar: la activa solo cierra, y no
    // dispara confirmación.
    if (entry.item.id === activeId) {
      onOpenChange(false);
      return;
    }
    if (confirm) {
      setPending(entry.item);
      return;
    }
    commit(entry.item);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (entries.length === 0) return;
    const last = entries.length - 1;
    const move = (index: number) => {
      event.preventDefault();
      setHighlighted(index);
    };
    switch (event.key) {
      case "ArrowDown":
        return move(highlighted >= last ? 0 : highlighted + 1);
      case "ArrowUp":
        return move(highlighted <= 0 ? last : highlighted - 1);
      case "Home":
        return move(0);
      case "End":
        return move(last);
      case "Enter":
        event.preventDefault();
        if (current) choose(current);
        return;
      default:
        return;
    }
  };

  // El resaltado sigue al teclado aunque esté fuera de la vista: es la lista
  // la que se desplaza, no la ventana.
  React.useEffect(() => {
    if (!current) return;
    // Con `?.()` porque jsdom no implementa `scrollIntoView`; en el navegador
    // siempre existe.
    document.getElementById(optionId(listboxId, current.key))?.scrollIntoView?.({ block: "nearest" });
  }, [current, listboxId]);

  if (pending && confirm) {
    const titulo = typeof confirm.title === "function" ? confirm.title(pending) : confirm.title;
    const descripcion =
      typeof confirm.description === "function" ? confirm.description(pending) : confirm.description;
    return (
      <div className="flex min-h-0 flex-1 flex-col p-inset" data-step="confirm">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          {descripcion ? <DialogDescription>{descripcion}</DialogDescription> : null}
        </DialogHeader>
        {/* Se repiten los detalles: si hubiera que recordarlos del paso
            anterior, la confirmación no confirmaría nada. */}
        <div className="mt-ui-md flex items-start gap-ui-sm rounded-lg border border-primary bg-surface p-ui-sm">
          {pending.icon ? (
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-md bg-subtle text-primary">
              <pending.icon className="size-4" />
            </span>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-ui-2xs">
            <span className="flex items-center gap-ui-2xs">
              <span className="text-ui-body font-medium text-foreground">{pending.label}</span>
              {pending.badge ? <ItemBadge badge={pending.badge} /> : null}
            </span>
            {pending.details ? <Details details={pending.details} /> : null}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setPending(null)}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {confirm.backLabel ?? "Volver"}
          </Button>
          <Button type="button" autoFocus onClick={() => commit(pending)}>
            {confirm.confirmLabel ?? "Confirmar"}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <>
      <div className="flex shrink-0 flex-col gap-ui-sm border-b border-border p-inset pb-ui-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={searchLabel}
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={current ? optionId(listboxId, current.key) : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlighted(0);
            }}
            onKeyDown={onKeyDown}
            className={cn(
              "h-control-default w-full rounded-md border border-input bg-surface pl-9 pr-3 text-ui-body",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            )}
          />
        </div>
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label={title}
        className="min-h-0 flex-1 overflow-y-auto p-inset [scrollbar-width:thin]"
      >
        {entries.length === 0 ? (
          <p className="py-ui-lg text-center text-ui-body-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          sections.map((section) =>
            section.entries.length === 0 ? null : (
              <section key={section.id} aria-label={section.label ?? undefined} className="mb-ui-lg last:mb-0">
                {section.label ? (
                  <h3 className="mb-ui-xs text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.label}
                  </h3>
                ) : null}
                <div className={cn("grid gap-ui-sm sm:grid-cols-2", !detailed && "lg:grid-cols-3")}>
                  {section.entries.map((entry) => (
                    <Option
                      key={entry.key}
                      id={optionId(listboxId, entry.key)}
                      entry={entry}
                      active={entry.item.id === activeId}
                      highlighted={current?.key === entry.key}
                      onHighlight={() => {
                        const index = entries.indexOf(entry);
                        if (index >= 0) setHighlighted(index);
                      }}
                      onChoose={() => choose(entry)}
                    />
                  ))}
                </div>
              </section>
            ),
          )
        )}
      </div>

      {hint ? (
        <div className="shrink-0 border-t border-border px-inset py-ui-sm text-ui-caption text-muted-foreground [&_kbd]:rounded [&_kbd]:border [&_kbd]:border-border [&_kbd]:bg-surface [&_kbd]:px-1 [&_kbd]:font-mono">
          {hint}
        </div>
      ) : null}
    </>
  );
}
AppSwitcher.displayName = "AppSwitcher";

const optionId = (listboxId: string, key: string) => `${listboxId}-${key}`;

interface OptionProps {
  id: string;
  entry: Entry;
  active: boolean;
  highlighted: boolean;
  onHighlight: () => void;
  onChoose: () => void;
}

function Option({ id, entry, active, highlighted, onHighlight, onChoose }: OptionProps) {
  const { item } = entry;
  const Icon = item.icon;
  return (
    <div
      id={id}
      role="option"
      aria-selected={highlighted}
      aria-current={active ? "true" : undefined}
      aria-disabled={item.disabled || undefined}
      data-active={active || undefined}
      onMouseEnter={item.disabled ? undefined : onHighlight}
      onClick={item.disabled ? undefined : onChoose}
      className={cn(
        "flex min-w-0 cursor-pointer items-start gap-ui-sm rounded-lg border p-ui-sm text-left transition-colors duration-fast",
        "border-surface-border bg-surface",
        highlighted && !item.disabled && "bg-surface-hover ring-2 ring-ring ring-offset-1 ring-offset-raised",
        // La activa se marca con borde y visto, no con color: si el color
        // fuese la señal, chocaría con que los iconos van todos en `primary`.
        active && "border-primary",
        item.disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {Icon ? (
        <span aria-hidden="true" className="mt-px grid size-8 shrink-0 place-items-center rounded-md bg-subtle text-primary">
          <Icon className="size-4" />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-ui-2xs">
          <span className="truncate text-ui-body-sm font-medium text-foreground">{item.label}</span>
          {item.badge ? <ItemBadge badge={item.badge} /> : null}
          {active ? (
            <>
              <Check aria-hidden="true" className="size-4 shrink-0 text-primary" />
              <span className="sr-only">, aquí estás</span>
            </>
          ) : null}
        </span>
        {item.description ? (
          <span className="line-clamp-2 text-ui-caption text-muted-foreground">{item.description}</span>
        ) : null}
        {item.details ? <Details details={item.details} /> : null}
      </span>
    </div>
  );
}

const BADGE_VARIANT = { neutral: "secondary", warning: "warning", danger: "destructive" } as const;

function ItemBadge({ badge }: { badge: NonNullable<AppSwitcherItem["badge"]> }) {
  return (
    <Badge variant={BADGE_VARIANT[badge.tone ?? "neutral"]} className="shrink-0">
      {badge.label}
    </Badge>
  );
}

/** Filas legibles, no una línea apretada: es lo que hace falta para no equivocarse. */
function Details({ details }: { details: NonNullable<AppSwitcherItem["details"]> }) {
  return (
    <dl className="mt-ui-2xs grid grid-cols-[auto_1fr] gap-x-ui-sm gap-y-px text-ui-caption">
      {details.map((row) => (
        <React.Fragment key={row.label}>
          <dt className="text-muted-foreground">{row.label}</dt>
          {/* Sin `truncate`: el NIT es justo lo que hay que poder leer entero. */}
          <dd className="min-w-0 break-words text-foreground">{row.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
