import * as React from "react";
import { Accordion as PrimeAccordion, AccordionTab, type AccordionProps } from "primereact/accordion";

import { cn } from "@/lib/utils";

export type { AccordionProps };

/** Contenido colapsable sobre PrimeReact Accordion. Los hijos deben ser `AccordionTab`. */
const Accordion = React.forwardRef<PrimeAccordion, AccordionProps>(({ className, ...props }, ref) => (
  <PrimeAccordion ref={ref} className={cn(className)} {...props} />
));
Accordion.displayName = "Accordion";

export { Accordion, AccordionTab };
