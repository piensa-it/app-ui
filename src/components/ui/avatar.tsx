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
}

/** Avatar de usuario sobre Ark UI (headless): imagen con fallback a iniciales o ícono. */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "", label, icon, shape = "circle", ...props }, ref) => (
    <ArkAvatar.Root
      ref={ref}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center overflow-hidden bg-secondary text-sm font-medium text-secondary-foreground",
        shape === "circle" ? "rounded-full" : "rounded-md",
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
