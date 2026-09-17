import * as React from "react";

import { cn } from "@/lib/utils";

import "./docs.css";

export type DocsProseProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Estilos para el HTML que genera MDX o Markdown en una guía (#213):
 * encabezados con ancla, párrafos, listas, código, tablas, citas e imágenes.
 * Solo tokens, sin `@tailwindcss/typography`. Los componentes de la librería
 * dentro (`CodeBlock`, `Alert`) conservan su propio estilo.
 */
const DocsProse = React.forwardRef<HTMLDivElement, DocsProseProps>(({ className, ...props }, ref) => (
  <div ref={ref} data-docs-prose="" className={cn("max-w-3xl", className)} {...props} />
));
DocsProse.displayName = "DocsProse";

export { DocsProse };
