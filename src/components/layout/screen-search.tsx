import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { AppSwitcher, type AppSwitcherGroup, type AppSwitcherItem } from "@/components/ui/app-switcher";

export interface ScreenSearchProps {
  /** Las pantallas, agrupadas como en el menú. */
  groups: AppSwitcherGroup[];
  /** Pantalla actual: se marca como «aquí estás». */
  activeId?: string;
  onSelect: (id: string, item: AppSwitcherItem) => void;
  /** @default "Buscar pantalla…" */
  placeholder?: string;
  /** Pista del atajo. @default "Ctrl K" */
  shortcut?: string;
  /** Título del diálogo. @default "Ir a una pantalla" */
  title?: string;
  /** Recientes, por identificador, arriba del todo. */
  recent?: string[];
  className?: string;
}

/**
 * El buscador de pantallas de la barra superior: un campo que abre el
 * `AppSwitcher` con todas las pantallas de la aplicación, también con
 * Ctrl K (⌘ K en Mac). Es estándar en todas las aplicaciones; qué pantallas
 * hay y a dónde llevan lo pone la aplicación con `groups` y `onSelect`.
 *
 * Va en el hueco `topbarStart` de `AppShell`.
 *
 * @example
 * ```tsx
 * <AppShell topbarStart={<ScreenSearch groups={pantallas} activeId={vista} onSelect={ir} />} … />
 * ```
 */
export function ScreenSearch({
  groups,
  activeId,
  onSelect,
  placeholder = "Buscar pantalla…",
  shortcut = "Ctrl K",
  title = "Ir a una pantalla",
  recent,
  className,
}: ScreenSearchProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${placeholder.replace(/…$/, "")} (${shortcut})`}
        className={cn(
          "flex h-control-compact w-full max-w-xs items-center gap-ui-xs rounded-md border border-input bg-surface-hover px-ui-sm text-ui-body-sm text-muted-foreground transition-colors",
          "hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <Search aria-hidden="true" className="size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">{placeholder}</span>
        <kbd aria-hidden="true" className="hidden shrink-0 rounded border border-border bg-raised px-1.5 font-mono text-ui-caption text-muted-foreground sm:inline">
          {shortcut}
        </kbd>
      </button>
      <AppSwitcher
        open={open}
        onOpenChange={setOpen}
        title={title}
        searchPlaceholder={placeholder}
        groups={groups}
        activeId={activeId}
        recent={recent}
        onSelect={(id, item) => {
          setOpen(false);
          onSelect(id, item);
        }}
      />
    </>
  );
}
