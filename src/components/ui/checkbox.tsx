import * as React from "react";
import { Checkbox as ArkCheckbox } from "@ark-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { checkboxControlVariants, checkboxLabelVariants } from "@/lib/recipes/checkbox";
import { hiddenInputCoverClassName, hiddenInputCoverStyle } from "@/lib/recipes/hidden-input";

export interface CheckboxProps
  extends Omit<ArkCheckbox.RootProps, "checked" | "children" | "onCheckedChange">,
    VariantProps<typeof checkboxControlVariants> {
  /**
   * `"indeterminate"` es el equivalente a `.indeterminate` en un
   * `<input type="checkbox">` nativo: representa selección parcial (ej. un
   * "seleccionar todo" con algunos hijos marcados) y solo se establece por
   * código, nunca como resultado de una interacción del usuario. Ark UI
   * replica ese comportamiento nativo — verificado en
   * `@zag-js/checkbox/dist/checkbox.machine.js`: la acción `toggleChecked`
   * resuelve cualquier clic sobre un estado `"indeterminate"` a `true`, igual
   * que un checkbox nativo — así que `onCheckedChange` nunca informa de un
   * tercer estado de salida, solo de entrada.
   *
   * Ark sincroniza `el.indeterminate` en el input nativo subyacente, pero
   * solo cuando `checked` **cambia** después del montaje (su `track` interno,
   * `@zag-js/react/dist/track.js`, ignora deliberadamente la primera
   * ejecución) — así que si el valor inicial ya es `"indeterminate"`,
   * `el.indeterminate` se queda en `false` hasta el próximo cambio. Este
   * componente lo corrige con un `ref` propio que lo escribe en cada render
   * (mount incluido), sin depender de ese detalle interno de Ark.
   *
   * Los navegadores traducen esa propiedad IDL al árbol de accesibilidad como
   * `mixed` automáticamente — por eso no hace falta (ni se añade aquí)
   * `aria-checked="mixed"` a mano: sería redundante con la semántica nativa
   * que ya provee el propio `<input type="checkbox">`, y Ark tampoco lo
   * agrega en `getHiddenInputProps()`.
   */
  checked?: boolean | "indeterminate";
  /**
   * Solo recibe `boolean`: un clic del usuario nunca produce `"indeterminate"`
   * como salida (ver JSDoc de `checked`). Firma sin cambios respecto a
   * versiones anteriores — no es un breaking change.
   */
  onCheckedChange?: (checked: boolean) => void;
  /** Texto de la etiqueta, opcional (para checkboxes sin label visible usa `aria-label`). */
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Nombre accesible del input cuando no hay `label` visible. */
  "aria-label"?: string;
  /**
   * Id del input nativo, para asociar un `<label htmlFor>` externo. Equivale a
   * `ids.hiddenInput`; si se pasan ambos, gana `ids.hiddenInput`.
   */
  id?: string;
}


/** Checkbox accesible sobre Ark UI (headless), con el tema Tailwind de la librería. */
const Checkbox = React.forwardRef<HTMLLabelElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, label, description, size, "aria-label": ariaLabel, id, ids, ...props }, ref) => {
    const hiddenInputRef = React.useRef<HTMLInputElement>(null);

    // Ark solo sincroniza `el.indeterminate` cuando `checked` cambia después
    // del montaje (ver JSDoc de `checked` arriba) — este efecto lo escribe
    // en cada render, mount incluido, así el input nativo nunca queda
    // desincronizado del estado visual.
    React.useEffect(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.indeterminate = checked === "indeterminate";
      }
    }, [checked]);

    return (
      <ArkCheckbox.Root
        ref={ref}
        ids={id || ids ? { ...ids, hiddenInput: ids?.hiddenInput ?? id } : undefined}
        className={cn(
          "group relative inline-flex min-h-control-default cursor-pointer items-start gap-3 rounded-md px-1.5 py-2",
          "transition-colors duration-normal hover:bg-surface-hover",
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          className,
        )}
        checked={checked}
        // `=== true` (no `!!`): `!!"indeterminate"` sería `true` por ser un
        // string no vacío — colapsaría el tercer estado a "marcado" si algún
        // día llegara aquí. Con `=== true` solo se reporta `checked` cuando
        // realmente lo es; ver JSDoc de `onCheckedChange`.
        onCheckedChange={(details) => onCheckedChange?.(details.checked === true)}
        {...props}
      >
        <ArkCheckbox.Control
          className={cn(checkboxControlVariants({ size }), "mt-0.5")}
        >
          <ArkCheckbox.Indicator>
            <Check aria-hidden="true" />
          </ArkCheckbox.Indicator>
          <ArkCheckbox.Indicator indeterminate>
            <Minus aria-hidden="true" />
          </ArkCheckbox.Indicator>
        </ArkCheckbox.Control>
        {label ? (
          <span className="grid gap-0.5">
            <ArkCheckbox.Label className={checkboxLabelVariants({ size })}>{label}</ArkCheckbox.Label>
            {description ? <span className="text-sm leading-5 text-muted-foreground">{description}</span> : null}
          </span>
        ) : null}
        {/* Sin `label`, Ark apuntaría `aria-labelledby` a un Label que no existe:
            el nombre accesible se escribe en el propio input. */}
        <ArkCheckbox.HiddenInput
          ref={hiddenInputRef}
          aria-label={ariaLabel}
          // `null` (no `undefined`): mergeProps de Zag ignora undefined y dejaría
          // el aria-labelledby de Ark; React omite el atributo con null.
          aria-labelledby={label ? undefined : (null as unknown as undefined)}
          className={hiddenInputCoverClassName}
          style={hiddenInputCoverStyle}
        />
      </ArkCheckbox.Root>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
