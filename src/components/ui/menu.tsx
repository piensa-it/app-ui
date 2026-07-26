import * as React from "react";
import { Menu as ArkMenu, useMenu } from "@ark-ui/react/menu";
import { Portal } from "@ark-ui/react/portal";
import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import { elevationRing, popoverAnimation } from "@/lib/style-helpers";
import { floatingPanelStyles } from "@/lib/recipes/field-control";
import { menuItemVariants } from "@/lib/recipes/menu-item";

export interface MenuProps extends Omit<ArkMenu.RootProps, "children"> {
  children?: React.ReactNode;
}

/**
 * Menú de acciones (dropdown) sobre Ark UI (headless). Ideal para acciones de
 * fila en tablas, menús de "más opciones" (kebab), y navegación contextual.
 * El posicionamiento y cierre (click afuera, Escape, selección) los maneja
 * Ark de forma nativa — a diferencia de `Popover`, no necesita un hook de
 * dismiss manual porque su contenido siempre se renderiza en un `Portal`
 * (igual que `Select`), lo que evita el recorte por `overflow` del contenedor
 * padre (ej. una celda de `DataTable`).
 *
 * Usa `useMenu` + `RootProvider` (en vez de `ArkMenu.Root`) para poder forzar
 * un reposicionamiento en el frame posterior a la apertura: igual que en
 * `Select`, el primer cálculo de floating-ui puede correr antes de que el
 * trigger tenga su layout final, dejando el panel posicionado fuera de
 * viewport la primera vez que se abre.
 */
const Menu = ({ open: controlledOpen, defaultOpen, onOpenChange, children, ...props }: MenuProps) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const open = controlledOpen ?? internalOpen;

  const menu = useMenu({
    open,
    onOpenChange: (details) => {
      if (controlledOpen === undefined) setInternalOpen(details.open);
      onOpenChange?.(details);
    },
    ...props,
  });
  const isOpen = menu.api.open;
  const reposition = menu.api.reposition;

  React.useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => reposition());
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, reposition]);

  return <ArkMenu.RootProvider value={menu}>{children}</ArkMenu.RootProvider>;
};

export type MenuTriggerProps = ArkMenu.TriggerProps;

/** Elemento que abre el menú — normalmente un `Button`/ícono con `asChild` implícito. */
const MenuTrigger = React.forwardRef<HTMLButtonElement, MenuTriggerProps>((props, ref) => (
  <ArkMenu.Trigger ref={ref} asChild {...props} />
));
MenuTrigger.displayName = "MenuTrigger";

export type MenuContentProps = ArkMenu.ContentProps;

/** Panel flotante del menú. */
const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(({ className, ...props }, ref) => (
  <Portal>
    <ArkMenu.Positioner>
      <ArkMenu.Content
        ref={ref}
        className={cn(floatingPanelStyles, "min-w-48 p-1.5", elevationRing, popoverAnimation, className)}
        {...props}
      />
    </ArkMenu.Positioner>
  </Portal>
));
MenuContent.displayName = "MenuContent";

export interface MenuItemProps extends Omit<ArkMenu.ItemProps, "value"> {
  value: string;
  /** @default "default" */
  variant?: "default" | "destructive";
  /** Ícono decorativo a la izquierda (ej. de `lucide-react`). */
  icon?: React.ReactNode;
  className?: string;
}

/** Opción accionable del menú. Usa `onSelect` (no `onClick`) para reaccionar igual a teclado y mouse. */
const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ className, variant = "default", icon, children, ...props }, ref) => (
    <ArkMenu.Item ref={ref} className={cn(menuItemVariants({ variant }), className)} {...props}>
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">{icon}</span> : null}
      <span className="flex-1 truncate">{children}</span>
    </ArkMenu.Item>
  ),
);
MenuItem.displayName = "MenuItem";

export type MenuItemGroupProps = ArkMenu.ItemGroupProps;

/** Agrupa ítems relacionados (ej. "Ordenar por"). */
const MenuItemGroup = React.forwardRef<HTMLDivElement, MenuItemGroupProps>(({ className, ...props }, ref) => (
  <ArkMenu.ItemGroup ref={ref} className={cn("py-1 first:pt-0 last:pb-0", className)} {...props} />
));
MenuItemGroup.displayName = "MenuItemGroup";

export type MenuItemGroupLabelProps = ArkMenu.ItemGroupLabelProps;

const MenuItemGroupLabel = React.forwardRef<HTMLDivElement, MenuItemGroupLabelProps>(
  ({ className, ...props }, ref) => (
    <ArkMenu.ItemGroupLabel
      ref={ref}
      className={cn("px-2.5 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    />
  ),
);
MenuItemGroupLabel.displayName = "MenuItemGroupLabel";

export type MenuSeparatorProps = ArkMenu.SeparatorProps;

const MenuSeparator = React.forwardRef<HTMLHRElement, MenuSeparatorProps>(({ className, ...props }, ref) => (
  <ArkMenu.Separator ref={ref} className={cn("-mx-1.5 my-1.5 h-px border-none bg-border", className)} {...props} />
));
MenuSeparator.displayName = "MenuSeparator";

export interface MenuCheckboxItemProps extends Omit<ArkMenu.CheckboxItemProps, "value"> {
  value: string;
  className?: string;
}

/** Ítem con estado de sí/no dentro del menú (ej. "Mostrar columna X"). */
const MenuCheckboxItem = React.forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  ({ className, children, ...props }, ref) => (
    <ArkMenu.CheckboxItem ref={ref} className={cn(menuItemVariants(), "pl-8", className)} {...props}>
      <ArkMenu.ItemIndicator className="absolute left-2.5 flex size-4 items-center justify-center">
        <Check aria-hidden="true" className="size-4" />
      </ArkMenu.ItemIndicator>
      <span className="flex-1 truncate">{children}</span>
    </ArkMenu.CheckboxItem>
  ),
);
MenuCheckboxItem.displayName = "MenuCheckboxItem";

export type MenuRadioItemGroupProps = ArkMenu.RadioItemGroupProps;

/** Agrupa `MenuRadioItem` — selección única, `value`/`onValueChange`. */
const MenuRadioItemGroup = React.forwardRef<HTMLDivElement, MenuRadioItemGroupProps>((props, ref) => (
  <ArkMenu.RadioItemGroup ref={ref} {...props} />
));
MenuRadioItemGroup.displayName = "MenuRadioItemGroup";

export interface MenuRadioItemProps extends Omit<ArkMenu.RadioItemProps, "value"> {
  value: string;
  className?: string;
}

const MenuRadioItem = React.forwardRef<HTMLDivElement, MenuRadioItemProps>(
  ({ className, children, ...props }, ref) => (
    <ArkMenu.RadioItem ref={ref} className={cn(menuItemVariants(), "pl-8", className)} {...props}>
      <ArkMenu.ItemIndicator className="absolute left-2.5 flex size-4 items-center justify-center">
        <Circle aria-hidden="true" className="size-2 fill-current" />
      </ArkMenu.ItemIndicator>
      <span className="flex-1 truncate">{children}</span>
    </ArkMenu.RadioItem>
  ),
);
MenuRadioItem.displayName = "MenuRadioItem";

export {
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuItemGroupLabel,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioItemGroup,
  MenuRadioItem,
};
