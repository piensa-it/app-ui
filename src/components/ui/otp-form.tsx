import * as React from "react";

import { cn } from "@/lib/utils";
import { AuthErrorRegion } from "./auth-error-region";
import { Button } from "./button";
import { Field } from "./field";
import { PinInput } from "./pin-input";

export interface OtpFormLabels {
  /** @default "Código de verificación" */
  code?: string;
  /** @default "Verificar" */
  submit?: string;
  /** Texto del botón mientras `loading`. @default "Verificando…" */
  loading?: string;
  /** @default "Reenviar código" */
  resend?: string;
  /**
   * Aviso mientras falta para poder reenviar. Recibe los segundos.
   * @default (segundos) => `Podés reenviar el código en ${segundos} s`
   */
  resendIn?: (seconds: number) => React.ReactNode;
  /**
   * Dónde se envió. Recibe `sentTo` ya enmascarado por la aplicación.
   * @default (destino) => `Escribí el código que enviamos a ${destino}.`
   */
  sentTo?: (sentTo: React.ReactNode) => React.ReactNode;
  /** @default "Volver a entrar" */
  back?: string;
}

export interface OtpFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** El envío. La aplicación valida el código. */
  onSubmit: () => void;
  /** @default 6 */
  length?: number;
  /**
   * A dónde se envió el código, **ya enmascarado por la aplicación**
   * (`•••@piensait.com`, `•••1234`). Enmascarar es una regla de negocio y de
   * cumplimiento; la librería no la inventa. Sin esto no se pinta la línea.
   */
  sentTo?: React.ReactNode;
  loading?: boolean;
  error?: React.ReactNode;
  /** Sin esto, no se ofrece reenviar. */
  onResend?: () => void;
  /**
   * Segundos que faltan para poder reenviar. **La cuenta atrás la lleva la
   * aplicación**, no la librería: aquí solo se muestra y se deshabilita el
   * botón mientras sea mayor que cero. Igual que `saving` en `SettingsPage`,
   * la librería no monta temporizadores propios.
   * @default 0
   */
  resendAvailableIn?: number;
  /** Sin esto, el enlace de volver no se pinta. */
  onBack?: () => void;
  labels?: OtpFormLabels;
}

const DEFAULT_LABELS: Required<OtpFormLabels> = {
  code: "Código de verificación",
  submit: "Verificar",
  loading: "Verificando…",
  resend: "Reenviar código",
  resendIn: (seconds) => `Podés reenviar el código en ${seconds} s`,
  sentTo: (sentTo) => <>Escribí el código que enviamos a {sentTo}.</>,
  back: "Volver a entrar",
};

const ARIA_DISABLED_LOOK = "aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:cursor-default";

/**
 * El segundo factor (#131): el código de un solo uso y el reenvío. Va dentro
 * del `AuthLayout` de #130, así que no estrena armazón.
 *
 * No valida nada ni cuenta intentos —eso vive en el backend y llega por
 * `error`—, y **no lleva la cuenta atrás del reenvío**: `resendAvailableIn`
 * llega en segundos ya calculados y aquí solo se muestra. La librería no
 * monta temporizadores propios.
 *
 * Se envía solo al completarse el código (es lo que espera quien acaba de
 * teclear seis dígitos), y también con Enter o con el botón.
 *
 * @example
 * ```tsx
 * <OtpForm
 *   value={codigo}
 *   onChange={setCodigo}
 *   onSubmit={verificar}
 *   sentTo="•••@piensait.com"
 *   onResend={reenviar}
 *   resendAvailableIn={segundos}
 * />
 * ```
 */
export const OtpForm = React.forwardRef<HTMLFormElement, OtpFormProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      length = 6,
      sentTo,
      loading = false,
      error,
      onResend,
      resendAvailableIn = 0,
      onBack,
      labels,
      className,
      ...props
    },
    ref,
  ) => {
    const text = { ...DEFAULT_LABELS, ...labels };
    const esperandoReenvio = resendAvailableIn > 0;

    const submit = () => {
      if (loading) return;
      onSubmit();
    };

    return (
      <form
        ref={ref}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className={cn("flex flex-col gap-ui-lg", className)}
        {...props}
      >
        <AuthErrorRegion error={error} />

        {sentTo ? <p className="text-sm text-muted-foreground">{text.sentTo(sentTo)}</p> : null}

        {/* `compositeControl`: `PinInput` son varias casillas enfocables bajo
            un mismo rótulo, así que el rótulo va como `<span id>` y el rol de
            grupo lo pone el `Field` — un `<label htmlFor>` apuntaría a un
            elemento que no enfoca. */}
        <Field label={text.code} compositeControl>
          <PinInput
            value={value}
            onChange={onChange}
            onComplete={submit}
            length={length}
            autoFocus
            aria-invalid={error ? true : undefined}
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

        {onResend ? (
          <div className="text-center">
            {/* `aria-disabled`, no `disabled`: mientras falta tiempo el botón
                sigue enfocable, así que quien navega con teclado o lector de
                pantalla llega a él y **oye por qué** no puede usarlo todavía
                —con `disabled` nativo el control desaparece del recorrido y
                el motivo se pierde—. El clic se descarta en el manejador. */}
            <Button
              type="button"
              variant="link"
              size="sm"
              className={cn("h-auto p-0", ARIA_DISABLED_LOOK)}
              aria-disabled={esperandoReenvio || undefined}
              onClick={() => {
                if (esperandoReenvio) return;
                onResend();
              }}
            >
              {esperandoReenvio ? text.resendIn(resendAvailableIn) : text.resend}
            </Button>
          </div>
        ) : null}

        {onBack ? (
          <div className="text-center">
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onBack}>
              {text.back}
            </Button>
          </div>
        ) : null}
      </form>
    );
  },
);
OtpForm.displayName = "OtpForm";
