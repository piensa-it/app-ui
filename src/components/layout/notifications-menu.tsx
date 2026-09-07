import * as React from "react";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface NotificationItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** «Hace 5 min», «Ayer». Ya formateado: la librería no formatea fechas. */
  time?: React.ReactNode;
  /** Sin leer: se marca con un punto y cuenta en el distintivo. */
  unread?: boolean;
}

export interface NotificationsLabels {
  /** @default "Notificaciones" */
  title?: string;
  /** @default "Marcar todo como leído" */
  markAllRead?: string;
  /** @default "Ver todas" */
  viewAll?: string;
  /** @default "No hay notificaciones." */
  empty?: string;
  /** Nombre accesible del botón con N sin leer: recibe N. @default (n) => `Notificaciones, ${n} sin leer` */
  trigger?: (unread: number) => string;
}

export interface NotificationsMenuProps {
  items: NotificationItem[];
  /** Al elegir una notificación. La aplicación decide a dónde lleva. */
  onSelect?: (item: NotificationItem) => void;
  /** «Ver todas»: normalmente abre la pantalla de notificaciones. Sin él, no hay pie. */
  onViewAll?: () => void;
  /** «Marcar todo como leído». Sin él, no hay ese control. */
  onMarkAllRead?: () => void;
  /** Cuántas sin leer. Por defecto se cuentan de `items`. */
  unreadCount?: number;
  labels?: NotificationsLabels;
  /** Panel abierto de entrada (controlado). Para documentación y pruebas. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const DEFAULT_LABELS: Required<NotificationsLabels> = {
  title: "Notificaciones",
  markAllRead: "Marcar todo como leído",
  viewAll: "Ver todas",
  empty: "No hay notificaciones.",
  trigger: (unread) => (unread > 0 ? `Notificaciones, ${unread} sin leer` : "Notificaciones"),
};

/**
 * Las notificaciones de la barra superior, a la izquierda de la persona: la
 * campana con el número de pendientes y un panel con las últimas. Es estándar
 * en todas las aplicaciones; lo que cambia es de dónde salen los avisos y a
 * dónde llevan, y eso lo pone la aplicación con `items` y `onSelect`.
 *
 * Controlado en contenido y sin red: la librería no sabe qué es una
 * notificación, solo cómo se ve. Los textos se sustituyen con `labels`.
 *
 * @example
 * ```tsx
 * <AppShell topbar={<><NotificationsMenu items={avisos} onSelect={ir} onViewAll={verTodas} /><UserMenu … /></>} … />
 * ```
 */
export function NotificationsMenu({
  items,
  onSelect,
  onViewAll,
  onMarkAllRead,
  unreadCount,
  labels,
  open,
  onOpenChange,
  className,
}: NotificationsMenuProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const unread = unreadCount ?? items.filter((item) => item.unread).length;

  return (
    <Popover open={open} onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}>
      <PopoverTrigger>
        <button
          type="button"
          aria-label={text.trigger(unread)}
          className={cn(
            "relative grid size-9 place-items-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-surface-hover hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <Bell aria-hidden="true" className="size-5" />
          {unread > 0 ? (
            // El número flota sobre la campana, como un distintivo elevado:
            // no ocupa sitio en la barra y se ve sin abrir el panel.
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-ui-caption font-semibold leading-none text-destructive-foreground"
            >
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between gap-ui-sm border-b border-border px-ui-md py-ui-sm">
          <p className="text-ui-body-sm font-semibold">{text.title}</p>
          {onMarkAllRead && unread > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="text-ui-caption font-medium text-primary hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              {text.markAllRead}
            </button>
          ) : null}
        </div>
        {items.length === 0 ? (
          <p className="px-ui-md py-ui-lg text-center text-ui-body-sm text-muted-foreground">{text.empty}</p>
        ) : (
          <ul className="max-h-96 divide-y divide-border overflow-y-auto [scrollbar-width:thin]">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(item)}
                  className={cn(
                    "flex w-full items-start gap-ui-sm px-ui-md py-ui-sm text-left transition-colors hover:bg-surface-hover",
                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  )}
                >
                  {/* El punto marca lo no leído; también se anuncia. */}
                  <span aria-hidden="true" className={cn("mt-2 size-2 shrink-0 rounded-full", item.unread ? "bg-primary" : "bg-transparent")} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className={cn("text-ui-body-sm", item.unread ? "font-semibold text-foreground" : "text-foreground")}>
                      {item.unread ? <span className="sr-only">Sin leer:</span> : null}
                      {item.title}
                    </span>
                    {item.description ? <span className="text-ui-caption text-muted-foreground">{item.description}</span> : null}
                    {item.time ? <span className="text-ui-caption text-muted-foreground">{item.time}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {onViewAll ? (
          <div className="border-t border-border p-ui-2xs">
            <button
              type="button"
              onClick={onViewAll}
              className="flex min-h-9 w-full items-center justify-center rounded-md text-ui-body-sm font-medium text-muted-foreground hover:bg-surface-hover hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
            >
              {text.viewAll}
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
