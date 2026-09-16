import * as React from "react";

import { cn } from "@/lib/utils";

import { PIENSA_ISOTIPO_SRC } from "./piensa-isotipo";

export interface ProductSignatureOptions {
  /** @default "by Piensa IT" */
  label?: string;
  /** Isotipo propio. Por defecto, el de Piensa IT incluido en la librería. */
  logoSrc?: string;
}

export interface ProductSignatureProps extends React.HTMLAttributes<HTMLSpanElement>, ProductSignatureOptions {}

/**
 * Firma de producto «by Piensa IT»: isotipo a tamaño de firma y texto en
 * mayúsculas finas monoespaciadas. Firma el producto, no es su logo (#184).
 */
const ProductSignature = React.forwardRef<HTMLSpanElement, ProductSignatureProps>(
  ({ label = "by Piensa IT", logoSrc = PIENSA_ISOTIPO_SRC, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground", className)}
      {...props}
    >
      <img src={logoSrc} alt="" className="size-3.5 rounded-[3px] object-contain" />
      {label}
    </span>
  ),
);
ProductSignature.displayName = "ProductSignature";

export { ProductSignature };
