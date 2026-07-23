import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  iconConfig,
  type ContainerColor,
  type ContainerSize,
  type IconColor,
  type IconSize,
} from "@/lib/iconConfig";

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "color"> {
  icon: LucideIcon;
  size?: IconSize;
  color?: IconColor;
  /** Nombre accesible. Si se omite, el ícono se considera decorativo. */
  label?: string;
}

/** Renderiza íconos Lucide con tamaños y colores semánticos compartidos. */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: Glyph, size = "md", color = "muted", label, className, ...props }, ref) => (
    <Glyph
      ref={ref}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("shrink-0", iconConfig.sizes[size], iconConfig.colors[color], className)}
      {...props}
    />
  ),
);
Icon.displayName = "Icon";

export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  iconSize?: IconSize;
  color?: IconColor;
  containerSize?: ContainerSize;
  containerColor?: ContainerColor;
  label?: string;
}

/** Ícono dentro de una superficie semántica para encabezados, métricas y estados. */
const IconTile = React.forwardRef<HTMLSpanElement, IconTileProps>(
  (
    {
      icon,
      iconSize = "md",
      color = "primary",
      containerSize = "md",
      containerColor = "primary",
      label,
      className,
      ...props
    },
    ref,
  ) => (
    <span
      ref={ref}
      className={cn(
        "inline-grid shrink-0 place-items-center",
        iconConfig.containerSizes[containerSize],
        iconConfig.containerColors[containerColor],
        className,
      )}
      {...props}
    >
      <Icon icon={icon} size={iconSize} color={color} label={label} />
    </span>
  ),
);
IconTile.displayName = "IconTile";

export { Icon, IconTile };
