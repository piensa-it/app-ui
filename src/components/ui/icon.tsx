import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  iconConfig,
  type ContainerColor,
  type ContainerShape,
  type ContainerSize,
  type ContainerVariant,
  type IconColor,
  type IconSize,
} from "@/lib/iconConfig";

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, "color"> {
  icon: LucideIcon;
  /** Escala semántica recomendada o medida exacta en píxeles para casos especiales. */
  size?: IconSize | number;
  color?: IconColor;
  /** Grosor del trazo SVG. Lucide usa 2 por defecto. */
  strokeWidth?: number;
  /** Mantiene el grosor visual del trazo aunque cambie el tamaño. */
  absoluteStrokeWidth?: boolean;
  /** Nombre accesible. Si se omite, el ícono se considera decorativo. */
  label?: string;
}

/** Renderiza íconos Lucide con tamaños y colores semánticos compartidos. */
const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: Glyph,
      size = "md",
      color = "muted",
      label,
      strokeWidth = 2,
      absoluteStrokeWidth = false,
      className,
      ...props
    },
    ref,
  ) => (
    <Glyph
      ref={ref}
      size={typeof size === "number" ? size : undefined}
      strokeWidth={strokeWidth}
      absoluteStrokeWidth={absoluteStrokeWidth}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn(
        "shrink-0",
        typeof size === "number" ? undefined : iconConfig.sizes[size],
        iconConfig.colors[color],
        className,
      )}
      {...props}
    />
  ),
);
Icon.displayName = "Icon";

export interface IconTileProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  iconSize?: IconSize | number;
  color?: IconColor;
  containerSize?: ContainerSize;
  containerColor?: ContainerColor;
  /** Tratamiento de la superficie que contiene el ícono. */
  variant?: ContainerVariant;
  /** Geometría del contenedor. */
  shape?: ContainerShape;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
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
      variant = "soft",
      shape = "rounded",
      strokeWidth = 2,
      absoluteStrokeWidth = false,
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
        variant === "soft" ? iconConfig.containerColors[containerColor] : undefined,
        iconConfig.containerVariants[variant],
        iconConfig.containerShapes[shape],
        className,
      )}
      {...props}
    >
      <Icon
        icon={icon}
        size={iconSize}
        color={color}
        label={label}
        strokeWidth={strokeWidth}
        absoluteStrokeWidth={absoluteStrokeWidth}
      />
    </span>
  ),
);
IconTile.displayName = "IconTile";

export { Icon, IconTile };
