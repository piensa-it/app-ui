import * as React from "react";

import { cn } from "@/lib/utils";
import { AuthErrorRegion } from "./auth-error-region";
import { Button } from "./button";
import { Field } from "./field";
import { Input } from "./input";

export type PasswordResetStep = "request" | "sent";

export interface PasswordResetFormLabels {
  /** @default "Usuario o correo" */
  identifier?: string;
  /** @default "Enviar instrucciones" */
  submit?: string;
  /** Texto del botón mientras `loading`. @default "Enviando…" */
  loading?: string;
  /** @default "Volver a entrar" */
  back?: string;
  /** Título del paso `sent`. @default "Revisa tu correo" */
  sentTitle?: string;
  /**
   * Cuerpo del paso `sent`. Recibe `sentTo` ya enmascarado por la
   * aplicación. @default (destino) => `Si la cuenta existe, enviamos las instrucciones a ${destino}.`
   */
  sentBody?: (sentTo: React.ReactNode) => React.ReactNode;
  /** Cuerpo del paso `sent` cuando no llega `sentTo`. @default "Si la cuenta existe, ya enviamos las instrucciones." */
  sentBodyWithoutTarget?: React.ReactNode;
}

export interface PasswordResetFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange"> {
  /**
   * Qué paso se pinta. **Lo decide la aplicación**, no el formulario: el
   * cambio ocurre cuando el backend responde, y un estado interno se
   * desincronizaría del de fuera en cuanto la petición fallara.
   */
  step: PasswordResetStep;
  /** El identificador tecleado. Solo se usa en el paso `request`. */
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: React.ReactNode;
  /**
   * A dónde se envió, **ya enmascarado por la aplicación** (`•••@piensait.com`).
   * Enmascarar un correo o un teléfono es una regla de negocio y de
   * cumplimiento; la librería no la inventa. Sin esto, el paso `sent` usa un
   * texto que no promete a dónde fue.
   */
  sentTo?: React.ReactNode;
  /** Sin esto, el enlace de volver no se pinta. */
  onBack?: () => void;
  labels?: PasswordResetFormLabels;
}

const DEFAULT_LABELS: Required<PasswordResetFormLabels> = {
  identifier: "Usuario o correo",
  submit: "Enviar instrucciones",
  loading: "Enviando…",
  back: "Volver a entrar",
  sentTitle: "Revisa tu correo",
  sentBody: (sentTo) => <>Si la cuenta existe, enviamos las instrucciones a {sentTo}.</>,
  sentBodyWithoutTarget: "Si la cuenta existe, ya enviamos las instrucciones.",
};

const ARIA_DISABLED_LOOK = "aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:cursor-default";

/**
 * Recuperar el acceso, en dos pasos (#131). Va dentro del `AuthLayout` de
 * #130, así que no estrena armazón.
 *
 * **Controlado desde fuera, incluido el paso.** `step` lo decide la
 * aplicación porque el cambio ocurre cuando el backend responde; un estado
 * interno se quedaría en «enviado» aunque la petición hubiera fallado.
 *
 * No cuenta intentos ni bloquea: eso vive en el backend y llega por `error`.
 * Tampoco enmascara el destino —`sentTo` llega ya enmascarado—, porque cómo
 * se enmascara un correo es una regla de negocio.
 *
 * @example
 * ```tsx
 * <PasswordResetForm
 *   step={enviado ? "sent" : "request"}
 *   value={identificador}
 *   onChange={setIdentificador}
 *   onSubmit={pedirInstrucciones}
 *   sentTo="•••@piensait.com"
 *   onBack={() => navigate("/entrar")}
 * />
 * ```
 */
export const PasswordResetForm = React.forwardRef<HTMLFormElement | HTMLDivElement, PasswordResetFormProps>(
  ({ step, value, onChange, onSubmit, loading = false, error, sentTo, onBack, labels, className, ...props }, ref) => {
    const text = { ...DEFAULT_LABELS, ...labels };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (loading) return;
      onSubmit();
    };

    const volver = onBack ? (
      <div className="text-center">
        <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onBack}>
          {text.back}
        </Button>
      </div>
    ) : null;

    if (step === "sent") {
      // Sin `<form>`: en este paso no hay nada que enviar, y un formulario
      // vacío le ofrecería a los gestores de contraseñas un envío que no
      // existe. `role="status"` para que el cambio de paso se anuncie.
      return (
        <div ref={ref as React.Ref<HTMLDivElement>} className={cn("flex flex-col gap-ui-lg", className)}>
          <AuthErrorRegion error={error} />
          <div role="status" className="flex flex-col gap-ui-2xs">
            <h2 className="text-ui-title-sm font-semibold">{text.sentTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {sentTo ? text.sentBody(sentTo) : text.sentBodyWithoutTarget}
            </p>
          </div>
          {volver}
        </div>
      );
    }

    return (
      <form ref={ref as React.Ref<HTMLFormElement>} noValidate onSubmit={handleSubmit} className={cn("flex flex-col gap-ui-lg", className)} {...props}>
        <AuthErrorRegion error={error} />
        <Field label={text.identifier}>
          <Input
            type="text"
            name="username"
            autoComplete="username"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
        <Button
          type="submit"
          aria-disabled={loading || undefined}
          aria-busy={loading || undefined}
          className={ARIA_DISABLED_LOOK}
        >
          {loading ? text.loading : text.submit}
        </Button>
        {volver}
      </form>
    );
  },
);
PasswordResetForm.displayName = "PasswordResetForm";
