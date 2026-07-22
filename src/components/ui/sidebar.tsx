import * as React from "react";
import { Sidebar as PrimeSidebar, type SidebarProps as PrimeSidebarProps } from "primereact/sidebar";

import { cn } from "@/lib/utils";
import { sidebarTransition } from "@/lib/overlay-transitions";

export interface SheetProps extends Omit<PrimeSidebarProps, "visible" | "onHide"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Panel deslizante lateral sobre PrimeReact Sidebar (reemplaza al antiguo
 * `Sheet` basado en Radix). Por defecto sale desde la derecha.
 */
const Sheet = React.forwardRef<PrimeSidebar, SheetProps>(
  ({ open, onOpenChange, className, position = "right", children, ...props }, ref) => (
    <PrimeSidebar
      ref={ref}
      visible={open}
      onHide={() => onOpenChange(false)}
      position={position}
      className={cn(position === "left" || position === "right" ? "w-3/4 sm:max-w-sm" : undefined, className)}
      transitionOptions={sidebarTransition(position)}
      {...props}
    >
      {children}
    </PrimeSidebar>
  ),
);
Sheet.displayName = "Sheet";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-heading text-lg font-semibold text-foreground", className)} {...props} />
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);
SheetDescription.displayName = "SheetDescription";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
);
SheetFooter.displayName = "SheetFooter";

export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
