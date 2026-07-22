import * as React from "react";
import { Avatar as PrimeAvatar, type AvatarProps as PrimeAvatarProps } from "primereact/avatar";

import { cn } from "@/lib/utils";

export type AvatarProps = PrimeAvatarProps;

/** Avatar de usuario sobre PrimeReact Avatar (soporta imagen, ícono o iniciales vía `label`). */
const Avatar = React.forwardRef<PrimeAvatar, AvatarProps>(({ className, shape = "circle", ...props }, ref) => (
  <PrimeAvatar ref={ref} shape={shape} className={cn(className)} {...props} />
));
Avatar.displayName = "Avatar";

export { Avatar };
