import * as React from "react";
import { Avatar as ArkAvatar } from "@ark-ui/react/avatar";

import { cn } from "@/lib/utils";

export interface AvatarProps extends Omit<ArkAvatar.RootProps, "children"> {
  /** URL de la imagen. Si falla o no se provee, se usa `label`/`icon` como fallback. */
  src?: string;
  alt?: string;
  /** Iniciales a mostrar cuando no hay imagen (ej. "AM"). */
  label?: React.ReactNode;
  /** Ícono a mostrar cuando no hay imagen ni `label` (ej. un ícono de lucide-react). */
  icon?: React.ReactNode;
  shape?: "circle" | "square";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "soft" | "outline" | "elevated";
}

/** Avatar de usuario sobre Ark UI (headless): imagen con fallback a iniciales o ícono. */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = "",
      label,
      icon,
      shape = "circle",
      size = "md",
      variant = "soft",
      ...props
    },
    ref,
  ) => (
    <ArkAvatar.Root
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold",
        size === "xs" && "h-6 w-6 text-[0.625rem]",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-10 w-10 text-sm",
        size === "lg" && "h-12 w-12 text-base",
        size === "xl" && "h-16 w-16 text-lg",
        variant === "soft" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border border-border bg-raised text-foreground",
        variant === "elevated" && "border border-border/80 bg-card text-foreground shadow-md",
        shape === "circle" ? "rounded-full" : "rounded-xl",
        className,
      )}
      {...props}
    >
      <ArkAvatar.Fallback>{label ?? icon}</ArkAvatar.Fallback>
      {src ? <ArkAvatar.Image src={src} alt={alt} className="h-full w-full object-cover" /> : null}
    </ArkAvatar.Root>
  ),
);
Avatar.displayName = "Avatar";

export { Avatar };
