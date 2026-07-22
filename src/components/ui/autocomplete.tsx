import * as React from "react";
import { AutoComplete as PrimeAutoComplete, type AutoCompleteProps } from "primereact/autocomplete";

import { cn } from "@/lib/utils";
import { overlayPanelTransition } from "@/lib/overlay-transitions";

export type { AutoCompleteProps };

/**
 * Campo de texto con sugerencias sobre PrimeReact AutoComplete. Recibe
 * `suggestions` (el resultado ya filtrado) y `completeMethod` (callback que
 * calcula esas sugerencias, típicamente contra una API).
 */
const AutoComplete = React.forwardRef<PrimeAutoComplete, AutoCompleteProps>(({ className, ...props }, ref) => (
  <PrimeAutoComplete
    ref={ref}
    className={cn(className)}
    transitionOptions={overlayPanelTransition}
    {...props}
  />
));
AutoComplete.displayName = "AutoComplete";

export { AutoComplete };
