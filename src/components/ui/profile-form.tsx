import * as React from "react";

import { cn } from "@/lib/utils";
import type { TokenColor } from "@/lib/palette";
import { AvatarPicker, type AvatarPickerValue } from "./avatar-picker";
import { Field } from "./field";
import { FormGrid } from "./form-grid";
import { Input } from "./input";

export type ProfileField = "name" | "email" | "phone" | "jobTitle";

export interface ProfileFormValue {
  name: string;
  email?: string;
  phone?: string;
  /** «Cajera», «Administrador»… El mismo que se ve en `UserMenu`. */
  jobTitle?: string;
  avatar?: AvatarPickerValue;
}

export interface ProfileFormChange extends ProfileFormValue {
  /**
   * La foto recién elegida, o `null` si se quitó, cuando el cambio vino del
   * avatar. Subirla y guardarla es de la aplicación.
   */
  avatarFile?: File | null;
}

export interface ProfileFormLabels {
  /** @default "Nombre" */
  name?: string;
  /** @default "Correo" */
  email?: string;
  /** @default "Teléfono" */
  phone?: string;
  /** @default "Cargo" */
  jobTitle?: string;
}

export interface ProfileFormProps {
  value: ProfileFormValue;
  /** Recibe el objeto completo con el cambio aplicado. No persiste nada. */
  onChange: (next: ProfileFormChange) => void;
  /**
   * Qué campos se ofrecen.
   * @default ["name", "email", "phone", "jobTitle"]
   */
  fields?: ProfileField[];
  /**
   * Mensajes de validación por campo. La validación la hace la aplicación.
   * Un error de un campo que `fields` no ofrece no se muestra en ningún
   * lado: no hay dónde ponerlo. Es responsabilidad de la aplicación no
   * mandar errores de campos que no pidió mostrar.
   */
  errors?: Partial<Record<ProfileField, React.ReactNode>>;
  /** Campos propios de la aplicación —documento, sede—, tras los estándar. */
  children?: React.ReactNode;
  /** Colores ofrecidos para las iniciales. Por defecto, los ocho del sistema. */
  avatarColors?: TokenColor[];
  /** @default 2 */
  avatarMaxSizeMb?: number;
  labels?: ProfileFormLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<ProfileFormLabels> = {
  name: "Nombre",
  email: "Correo",
  phone: "Teléfono",
  jobTitle: "Cargo",
};

const DEFAULT_FIELDS: ProfileField[] = ["name", "email", "phone", "jobTitle"];

// Solo para el teclado que ofrece el navegador en móvil: `ProfileForm` no
// pinta un <form>, así que no hay envío que dispare la validación nativa del
// navegador y choque con `errors` (que es de la aplicación).
const INPUT_TYPE: Record<ProfileField, string> = {
  name: "text",
  email: "email",
  phone: "tel",
  jobTitle: "text",
};

/**
 * Los datos de la persona en la pantalla de perfil (#124): el avatar y el
 * nombre, correo, teléfono y cargo. Es lo único que de verdad se repite entre
 * aplicaciones; lo demás —documento, sede, contraseña— es negocio y entra por
 * `children`, tras los campos estándar, dentro de la misma rejilla —así que
 * también puede usar `span="full"`.
 *
 * Controlado y sin persistencia, como el resto de la librería: cualquier
 * cambio —el avatar incluido— llama a `onChange` con el objeto completo.
 * Va como contenido de la sección `account` de `SettingsPage`.
 *
 * @example
 * ```tsx
 * <ProfileForm
 *   value={perfil}
 *   onChange={(next) => setPerfil(next)}
 *   errors={{ email: errorDeCorreo }}
 * >
 *   <Field label="Documento" span="full"><Input value={doc} onChange={…} /></Field>
 * </ProfileForm>
 * ```
 */
export const ProfileForm = React.forwardRef<HTMLDivElement, ProfileFormProps>(
  (
    {
      value,
      onChange,
      fields = DEFAULT_FIELDS,
      errors,
      children,
      avatarColors,
      avatarMaxSizeMb,
      labels,
      className,
    },
    ref,
  ) => {
    const text = { ...DEFAULT_LABELS, ...labels };

    return (
      <div ref={ref} className={cn("flex flex-col gap-ui-lg", className)}>
        <AvatarPicker
          name={value.name}
          value={value.avatar}
          colors={avatarColors}
          maxSizeMb={avatarMaxSizeMb}
          // El avatar es un dato más del perfil: se entrega junto al resto,
          // para que la aplicación guarde una sola vez. `AvatarPicker` ya
          // resuelve `src` para los tres casos —subir, quitar, solo cambiar
          // el color, este último reenviando el `src` que ya tenía— así que
          // no hace falta (ni conviene) recalcularlo aquí: forzar una lógica
          // propia terminó siendo la fuente del bug que el plan original
          // intentaba tapar con un condicional que nunca se ejecutaba.
          onChange={({ file, color, src }) => onChange({ ...value, avatar: { color, src }, avatarFile: file })}
        />
        <FormGrid>
          {fields.map((field) => (
            <Field key={field} label={text[field]} error={errors?.[field]}>
              <Input
                type={INPUT_TYPE[field]}
                value={value[field] ?? ""}
                onChange={(event) => onChange({ ...value, [field]: event.target.value })}
              />
            </Field>
          ))}
          {children}
        </FormGrid>
      </div>
    );
  },
);
ProfileForm.displayName = "ProfileForm";
