import * as React from "react";
import { Tooltip as PrimeTooltip, type TooltipProps as PrimeTooltipProps } from "primereact/tooltip";

export interface TooltipProps extends Omit<PrimeTooltipProps, "target" | "content"> {
  /** Contenido del tooltip. */
  content: React.ReactNode;
  /** Único hijo sobre el que se activa el tooltip al hacer hover/focus. */
  children: React.ReactElement;
}

/**
 * Tooltip accesible sobre PrimeReact Tooltip. A diferencia de PrimeReact
 * "puro" (que apunta a un selector CSS), este wrapper genera un id estable
 * y lo asocia automáticamente — funciona con cualquier hijo, sea un
 * componente de la librería o un elemento nativo.
 */
function Tooltip({ content, children, ...props }: TooltipProps) {
  const id = React.useId().replace(/:/g, "");
  const targetId = `tooltip-target-${id}`;
  return (
    <>
      {React.cloneElement(children, { id: children.props.id ?? targetId })}
      <PrimeTooltip target={`#${children.props.id ?? targetId}`} content={content as string} {...props} />
    </>
  );
}

export { Tooltip };
