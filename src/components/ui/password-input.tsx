import * as React from "react";
import { PasswordInput as ArkPasswordInput } from "@ark-ui/react/password-input";
import { Eye, EyeOff } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { fieldControlVariants } from "@/lib/recipes/field-control";
import { focusRingOutside } from "@/lib/recipes/focus";
import { interactiveTransition } from "@/lib/recipes/interactive";

export interface PasswordInputLabels {
  /** Nombre accesible del botón cuando la contraseña está oculta. @default "Mostrar contraseña" */
  show?: string;
  /** Nombre accesible del botón cuando la contraseña está visible. @default "Ocultar contraseña" */
  hide?: string;
}

export interface PasswordInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "size" | "autoComplete" | "disabled" | "readOnly" | "required" | "name"
    >,
    VariantProps<typeof fieldControlVariants> {
  /**
   * Propósito del campo para el autorrelleno y los gestores de contraseñas
   * (WCAG 2.1 SC 1.3.5). `current-password` para entrar; `new-password` al
   * crear o cambiar la contraseña —es lo que hace que el navegador ofrezca
   * generar una en vez de rellenar la guardada.
   * @default "current-password"
   */
  autoComplete?: "current-password" | "new-password";
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Visibilidad inicial, si no la controlás con `visible`. @default false */
  defaultVisible?: boolean;
  /** Visibilidad controlada. Con ella, el botón solo avisa; no alterna solo. */
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  /**
   * Pide a 1Password, LastPass, Bitwarden, Dashlane y Proton Pass que
   * ignoren el campo. Es lo contrario de lo que quiere una pantalla de
   * entrada —ver `LoginForm`— y solo tiene sentido en campos que *parecen*
   * contraseña sin serlo, como un PIN de un solo uso.
   * @default false
   */
  ignorePasswordManagers?: boolean;
  labels?: PasswordInputLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<PasswordInputLabels> = {
  show: "Mostrar contraseña",
  hide: "Ocultar contraseña",
};

/**
 * Campo de contraseña con mostrar/ocultar, sobre el `password-input` de Ark
 * UI. Alternar cambia el `type` del mismo input, así que el valor nunca se
 * pierde, y el propio Ark vuelve a ocultarla al enviar o reiniciar el
 * formulario —para que no quede en pantalla tras entrar.
 *
 * Acepta `id` y se lo pasa al input de dentro (`ids.input`), así que
 * funciona dentro de un `Field` como un control simple: el `<label htmlFor>`
 * apunta al input real, no al `<div>` de la raíz.
 *
 * **Dos correcciones deliberadas sobre Ark**, ambas de accesibilidad de
 * teclado: Ark pinta el botón con `tabIndex={-1}` y solo escucha
 * `onPointerDown`, de modo que quien navega con teclado ni llega al botón ni
 * podría activarlo si llegara —un control visible cuya función no se puede
 * usar sin ratón, que es justo lo que prohíbe WCAG 2.1 SC 2.1.1—. Aquí el
 * botón es enfocable y responde también a Enter y Espacio. El clic de
 * teclado se distingue por `detail === 0` (el navegador sintetiza un `click`
 * sin coordenadas), porque el de ratón ya lo atendió `onPointerDown` y
 * atender los dos alternaría dos veces.
 *
 * @example
 * ```tsx
 * <Field label="Contraseña">
 *   <PasswordInput value={clave} onChange={(e) => setClave(e.target.value)} />
 * </Field>
 * ```
 */
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      variant,
      size,
      id,
      name,
      disabled,
      readOnly,
      required,
      autoComplete = "current-password",
      defaultVisible,
      visible,
      onVisibilityChange,
      ignorePasswordManagers,
      labels,
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) => {
    const text = { ...DEFAULT_LABELS, ...labels };
    // `Field` inyecta `aria-invalid` al clonar su hijo; el estado inválido de
    // Ark es una prop de la raíz, y es ella quien lo baja al input como
    // `aria-invalid` y `data-invalid` (de ahí el borde rojo del recuadro).
    const invalid = ariaInvalid === true || ariaInvalid === "true";

    return (
      <ArkPasswordInput.Root
        ids={id ? { input: id } : undefined}
        name={name}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        invalid={invalid}
        autoComplete={autoComplete}
        defaultVisible={defaultVisible}
        visible={visible}
        onVisibilityChange={({ visible: next }) => onVisibilityChange?.(next)}
        ignorePasswordManagers={ignorePasswordManagers}
        translations={{ visibilityTrigger: (isVisible) => (isVisible ? text.hide : text.show) }}
        className="w-full"
      >
        <ArkPasswordInput.Control
          className={cn(
            fieldControlVariants({ variant, size }),
            "flex items-center gap-2 focus-within:border-ring focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
            className,
          )}
        >
          <ArkPasswordInput.Input
            ref={ref}
            className="h-auto min-h-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-inherit outline-hidden placeholder:text-muted-foreground"
            {...props}
          />
          <ArkPasswordInput.Context>
            {(api) => (
              <ArkPasswordInput.VisibilityTrigger
                tabIndex={0}
                onClick={(event) => {
                  if (event.detail !== 0) return;
                  api.toggleVisible();
                }}
                className={cn(
                  "-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground",
                  interactiveTransition,
                  focusRingOutside,
                  "hover:bg-surface-hover hover:text-foreground",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                <ArkPasswordInput.Indicator fallback={<Eye className="size-4" />}>
                  <EyeOff className="size-4" />
                </ArkPasswordInput.Indicator>
              </ArkPasswordInput.VisibilityTrigger>
            )}
          </ArkPasswordInput.Context>
        </ArkPasswordInput.Control>
      </ArkPasswordInput.Root>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
