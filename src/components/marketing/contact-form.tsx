import * as React from "react";
import { Loader2, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type ContactFieldName = "name" | "company" | "email" | "phone" | "message";

export type ContactFormValues = Partial<Record<ContactFieldName, string>> & { consent?: boolean };

export interface ContactFormLabels {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  required: string;
  invalidEmail: string;
  consentRequired: string;
}

const defaultLabels: ContactFormLabels = {
  name: "Nombre",
  company: "Empresa",
  email: "Correo",
  phone: "Teléfono",
  message: "Mensaje",
  submit: "Enviar mensaje",
  submitting: "Enviando…",
  success: "Recibimos tu mensaje. Te respondemos pronto.",
  error: "No pudimos enviar el mensaje. Inténtalo de nuevo.",
  required: "Este campo es obligatorio.",
  invalidEmail: "Escribe un correo válido.",
  consentRequired: "Debes aceptar para continuar.",
};

export interface ContactFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children"> {
  /** Campos en orden. @default ["name", "company", "email", "phone", "message"] */
  fields?: ContactFieldName[];
  /** Obligatorios. @default ["name", "email", "message"] */
  requiredFields?: ContactFieldName[];
  placeholders?: Partial<Record<ContactFieldName, string>>;
  /** Casilla de aceptación del tratamiento de datos. */
  consent?: { label: React.ReactNode; required?: boolean };
  /**
   * Envío. La librería no manda nada a ningún backend: valida y llama aquí.
   * Si lanza un error, el formulario muestra el mensaje de error. Sin
   * `onSubmit`, el formulario se envía de forma nativa a `action`
   * (Netlify Forms, un endpoint propio).
   */
  onSubmit?: (values: ContactFormValues) => void | Promise<void>;
  /** Campo trampa oculto contra bots. Su `name`. */
  honeypot?: string;
  /** Contenido al lado del formulario en escritorio (`ContactSection layout="aside"`). */
  aside?: React.ReactNode;
  labels?: Partial<ContactFormLabels>;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulario de contacto de las webs públicas (#203). Valida en el navegador,
 * anuncia errores y estados de forma accesible y no reenvía con doble clic.
 * Sin JavaScript sigue funcionando con `action` y los `required` nativos.
 */
const ContactForm = React.forwardRef<HTMLFormElement, ContactFormProps>(
  (
    {
      fields = ["name", "company", "email", "phone", "message"],
      requiredFields = ["name", "email", "message"],
      placeholders = {},
      consent,
      onSubmit,
      honeypot,
      aside,
      labels: labelsProp,
      className,
      ...props
    },
    ref,
  ) => {
    const labels = { ...defaultLabels, ...labelsProp };
    const [errors, setErrors] = React.useState<Partial<Record<ContactFieldName | "consent", string>>>({});
    const [consentChecked, setConsentChecked] = React.useState(false);
    const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
    const formRef = React.useRef<HTMLFormElement | null>(null);

    const setRefs = (node: HTMLFormElement | null) => {
      formRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      if (status === "submitting") {
        event.preventDefault();
        return;
      }
      const data = new FormData(event.currentTarget);
      if (honeypot && data.get(honeypot)) {
        event.preventDefault();
        setStatus("success");
        return;
      }

      const values: ContactFormValues = { consent: consentChecked };
      const nextErrors: typeof errors = {};
      for (const field of fields) {
        const value = String(data.get(field) ?? "").trim();
        values[field] = value;
        if (requiredFields.includes(field) && !value) nextErrors[field] = labels.required;
        else if (field === "email" && value && !EMAIL.test(value)) nextErrors[field] = labels.invalidEmail;
      }
      if (consent?.required && !consentChecked) nextErrors.consent = labels.consentRequired;

      setErrors(nextErrors);
      const firstInvalid = Object.keys(nextErrors)[0];
      if (firstInvalid) {
        event.preventDefault();
        formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
        return;
      }
      if (!onSubmit) return; // envío nativo a `action`

      event.preventDefault();
      setStatus("submitting");
      try {
        await onSubmit(values);
        setStatus("success");
        formRef.current?.reset();
        setConsentChecked(false);
      } catch {
        setStatus("error");
      }
    };

    const control = (field: ContactFieldName) => {
      const common = {
        name: field,
        placeholder: placeholders[field],
        required: requiredFields.includes(field),
        "aria-invalid": errors[field] ? true : undefined,
      };
      return field === "message" ? (
        <Textarea {...common} rows={5} />
      ) : (
        <Input {...common} type={field === "email" ? "email" : field === "phone" ? "tel" : "text"} autoComplete={autocomplete[field]} />
      );
    };

    const form = (
      <form ref={setRefs} noValidate={Boolean(onSubmit)} onSubmit={handleSubmit} className="flex flex-col gap-5" {...props}>
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field} className={cn(field === "message" && "sm:col-span-2")}>
              <Field label={labels[field]} required={requiredFields.includes(field)} error={errors[field]}>
                {control(field)}
              </Field>
            </div>
          ))}
        </div>
        {honeypot && (
          <input type="text" name={honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />
        )}
        {consent && (
          <div className="flex flex-col gap-1">
            <Checkbox
              name="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
              label={consent.label}
              required={consent.required}
              invalid={Boolean(errors.consent)}
            />
            {errors.consent && <p className="text-sm text-destructive">{errors.consent}</p>}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" aria-disabled={status === "submitting" || undefined}>
            {status === "submitting" ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
            {status === "submitting" ? labels.submitting : labels.submit}
            {status !== "submitting" && <Send aria-hidden="true" />}
          </Button>
          <p role="status" aria-live="polite" className={cn("text-sm", status === "error" ? "text-destructive" : "text-success")}>
            {status === "success" ? labels.success : status === "error" ? labels.error : ""}
          </p>
        </div>
      </form>
    );

    return aside ? (
      <div className={cn("grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]", className)}>
        {form}
        <div>{aside}</div>
      </div>
    ) : (
      <div className={className}>{form}</div>
    );
  },
);
ContactForm.displayName = "ContactForm";

const autocomplete: Record<Exclude<ContactFieldName, "message">, string> = {
  name: "name",
  company: "organization",
  email: "email",
  phone: "tel",
};

export { ContactForm };
