import * as React from "react";

import { cn } from "@/lib/utils";
import { AuthErrorRegion } from "./auth-error-region";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Field } from "./field";
import { Input } from "./input";
import { PasswordInput } from "./password-input";

export interface LoginFormValue {
  username: string;
  password: string;
  /** «Recordar mi nombre de usuario». Binario, por eso `checked` en el control. */
  remember: boolean;
}

export interface LoginFormLabels {
  /** @default "Usuario" */
  username?: string;
  /** @default "Contraseña" */
  password?: string;
  /** @default "Recordar mi usuario" */
  remember?: string;
  /** @default "Entrar" */
  submit?: string;
  /** Texto del botón mientras `loading`. @default "Entrando…" */
  loading?: string;
  /** @default "¿Olvidaste tu usuario o contraseña?" */
  forgot?: string;
  /** @default "Activa tu usuario" */
  activate?: string;
  /** Nombre accesible del botón de mostrar contraseña. @default "Mostrar contraseña" */
  showPassword?: string;
  /** Nombre accesible del botón de ocultar contraseña. @default "Ocultar contraseña" */
  hidePassword?: string;
}

export interface LoginFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange"> {
  value: LoginFormValue;
  onChange: (next: LoginFormValue) => void;
  /** El envío. La aplicación hace el fetch; aquí no hay nada de autenticación. */
  onSubmit: () => void;
  /**
   * Envío en curso: el botón anuncia `labels.loading` y descarta un segundo
   * envío, sin perder el foco (`aria-disabled`, no `disabled`).
   */
  loading?: boolean;
  /** Mensaje de fallo. Lo pinta un `Alert` sobre los campos; lo redacta la aplicación. */
  error?: React.ReactNode;
  /** Sin esto, el enlace de recuperar no se pinta. */
  onForgot?: () => void;
  /** Sin esto, el enlace de activar no se pinta. */
  onActivate?: () => void;
  labels?: LoginFormLabels;
  /** Contenido propio entre los campos y el botón —un selector de sede, un aviso legal. */
  children?: React.ReactNode;
}

const DEFAULT_LABELS: Required<LoginFormLabels> = {
  username: "Usuario",
  password: "Contraseña",
  remember: "Recordar mi usuario",
  submit: "Entrar",
  loading: "Entrando…",
  forgot: "¿Olvidaste tu usuario o contraseña?",
  activate: "Activa tu usuario",
  showPassword: "Mostrar contraseña",
  hidePassword: "Ocultar contraseña",
};

// Igual que en `SettingsPage`: `aria-disabled` no dispara las variantes
// `disabled:` de Tailwind, así que el aspecto de "deshabilitado" se escribe
// aquí a mano.
const ARIA_DISABLED_LOOK = "aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:cursor-default";

/**
 * El formulario de entrada estándar (#130): usuario, contraseña, recordarme,
 * los dos enlaces y el botón de entrar.
 *
 * Pinta un `<form>` de verdad, con `onSubmit`. Es deliberadamente lo
 * contrario de `SettingsPage`, donde el pie vive fuera del contenido: aquí
 * Enter tiene que enviar desde cualquiera de los dos campos, y los gestores
 * de contraseñas necesitan un formulario real para ofrecer guardar. Por lo
 * mismo, los campos llevan `autoComplete="username"` y `"current-password"`
 * (WCAG 2.1 SC 1.3.5), sin los cuales ni el autorrelleno ni los gestores
 * reconocen el campo.
 *
 * **El botón no se deshabilita con los campos vacíos.** Deshabilitarlo
 * esconde el motivo: es mejor dejar enviar y que la aplicación conteste con
 * `error`. Con `loading` sí se descarta el segundo envío, pero con
 * `aria-disabled` en vez de `disabled`, para no perder el foco ni el anuncio
 * del cambio de texto.
 *
 * Controlado y sin negocio: ni fetch, ni router, ni almacenamiento de sesión.
 *
 * @example
 * ```tsx
 * <LoginForm
 *   value={datos}
 *   onChange={setDatos}
 *   onSubmit={entrar}
 *   loading={enviando}
 *   error={mensaje}
 *   onForgot={() => navigate("/recuperar")}
 * />
 * ```
 */
export const LoginForm = React.forwardRef<HTMLFormElement, LoginFormProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      loading = false,
      error,
      onForgot,
      onActivate,
      labels,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const text = { ...DEFAULT_LABELS, ...labels };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      // Siempre: el envío lo resuelve la aplicación, nunca el navegador
      // navegando a una URL con la contraseña en la barra de direcciones.
      event.preventDefault();
      if (loading) return;
      onSubmit();
    };

    return (
      <form
        ref={ref}
        // La validación la escribe la aplicación en `error`; sin esto el
        // navegador se le adelanta con su propio globo en su propio idioma.
        noValidate
        onSubmit={handleSubmit}
        className={cn("flex flex-col gap-ui-lg", className)}
        {...props}
      >
        <AuthErrorRegion error={error} />

        <div className="flex flex-col gap-ui-md">
          <Field label={text.username}>
            <Input
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={value.username}
              onChange={(event) => onChange({ ...value, username: event.target.value })}
            />
          </Field>
          <Field label={text.password}>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              value={value.password}
              onChange={(event) => onChange({ ...value, password: event.target.value })}
              labels={{ show: text.showPassword, hide: text.hidePassword }}
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-ui-sm">
          <Checkbox
            name="remember"
            label={text.remember}
            checked={value.remember}
            onCheckedChange={(checked) => onChange({ ...value, remember: checked })}
          />
          {onForgot ? (
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onForgot}>
              {text.forgot}
            </Button>
          ) : null}
        </div>

        {children}

        <Button
          type="submit"
          aria-disabled={loading || undefined}
          aria-busy={loading || undefined}
          className={ARIA_DISABLED_LOOK}
        >
          {loading ? text.loading : text.submit}
        </Button>

        {onActivate ? (
          <div className="text-center text-sm text-muted-foreground">
            <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={onActivate}>
              {text.activate}
            </Button>
          </div>
        ) : null}
      </form>
    );
  },
);
LoginForm.displayName = "LoginForm";
