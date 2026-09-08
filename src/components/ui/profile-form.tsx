import * as React from "react";

import { cn } from "@/lib/utils";
import type { TokenColor } from "@/lib/palette";
import { AvatarPicker, type AvatarPickerLabels, type AvatarPickerValue } from "./avatar-picker";
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
   * La foto recién elegida, o `null` si se quitó, solo presente cuando el
   * cambio fue justo eso —subir o quitar la foto—. En cualquier otro cambio
   * —incluido elegir un color de iniciales, o editar un campo— la clave no
   * aparece: no es parte del *valor* del perfil, es el *evento* de subida, y
   * reenviarla en cada cambio posterior (p. ej. `onChange={setPerfil}`)
   * volvería a subir el mismo archivo con cada letra tecleada.
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
  /** Rótulo del bloque del avatar en `orientation="horizontal"`. Sin uso en vertical. @default "Foto" */
  avatar?: string;
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
  /**
   * Texto de ayuda por campo. En horizontal va bajo el rótulo, a la
   * izquierda (ver `Field`); en vertical, bajo el control, como siempre.
   * Sin valores por defecto: la librería no inventa copia de producto —sin
   * esta prop la columna izquierda lleva solo el rótulo, y no queda hueco.
   */
  descriptions?: Partial<Record<ProfileField, React.ReactNode>>;
  /** Campos propios de la aplicación —documento, sede—, tras los estándar. */
  children?: React.ReactNode;
  /** Colores ofrecidos para las iniciales. Por defecto, los ocho del sistema. */
  avatarColors?: TokenColor[];
  /** @default 2 */
  avatarMaxSizeMb?: number;
  /** Textos del `AvatarPicker` interno («Subir foto», «Color de las iniciales»…). */
  avatarLabels?: AvatarPickerLabels;
  labels?: ProfileFormLabels;
  /**
   * Disposición de los campos: `horizontal` pone el rótulo a la izquierda y
   * el control a la derecha (ver `Field`), pensada para la pantalla de
   * ajustes que es el destino de este componente; `vertical` es la
   * disposición de 0.10.0, para quien la prefiera.
   * @default "horizontal"
   */
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const DEFAULT_LABELS: Required<ProfileFormLabels> = {
  name: "Nombre",
  email: "Correo",
  phone: "Teléfono",
  jobTitle: "Cargo",
  avatar: "Foto",
};

const DEFAULT_FIELDS: ProfileField[] = ["name", "email", "phone", "jobTitle"];

// `type` es el teclado adecuado en móvil y una pista más para el autorrelleno;
// `autoComplete` es lo que de verdad identifica el propósito del campo ante
// gestores de contraseñas y autorrelleno (WCAG 2.1 SC 1.3.5). Si la
// aplicación envuelve `ProfileForm` en un `<form>` propio (`SettingsPage` lo
// permite: ver su doc de `content`), el envío puede disparar la validación
// nativa del navegador antes que `errors` —que es de la aplicación—; le toca
// a esa aplicación poner `noValidate` en su `<form>`.
const INPUT_ATTRS: Record<ProfileField, { type: string; autoComplete: string }> = {
  name: { type: "text", autoComplete: "name" },
  email: { type: "email", autoComplete: "email" },
  phone: { type: "tel", autoComplete: "tel" },
  jobTitle: { type: "text", autoComplete: "organization-title" },
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
 * Horizontal de fábrica (#132): rótulo a la izquierda, control a la derecha
 * con tope de ancho —es la mejor disposición para una pantalla de ajustes,
 * que es para lo que existe este componente—. `orientation="vertical"`
 * devuelve la disposición de 0.10.0, para quien la prefiera. `descriptions`
 * agrega el texto de ayuda de cada campo bajo su rótulo, a la izquierda; sin
 * él la columna izquierda solo lleva el rótulo, porque la librería no inventa
 * copia de producto.
 *
 * @example
 * ```tsx
 * <ProfileForm
 *   value={perfil}
 *   onChange={(next) => setPerfil(next)}
 *   errors={{ email: errorDeCorreo }}
 * >
 *   <Field label="Documento" span="full"><Input value={doc} onChange={(e) => setDoc(e.target.value)} /></Field>
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
      descriptions,
      children,
      avatarColors,
      avatarMaxSizeMb,
      avatarLabels,
      labels,
      orientation = "horizontal",
      className,
    },
    ref,
  ) => {
    const text = { ...DEFAULT_LABELS, ...labels };
    // Los campos únicos que se ofrecen: repetir uno en `fields` no debe pintar
    // dos controles con la misma clave —React se quejaría, y la aplicación no
    // podría distinguirlos con `getByLabelText`.
    const uniqueFields = [...new Set(fields)];

    // `avatarFile` no es parte del valor del perfil, es el evento de subida:
    // se descarta siempre del `value` recibido, y solo se vuelve a agregar
    // cuando el cambio actual de verdad fue eso —subir o quitar la foto—.
    // Así un tecleo posterior nunca reenvía el mismo `File`, y elegir un
    // color no se confunde con quitar la foto.
    const emit = (patch: Partial<ProfileFormValue>, avatarFile?: File | null) => {
      const clean: ProfileFormChange = { ...(value as ProfileFormChange) };
      delete clean.avatarFile;
      onChange(avatarFile === undefined ? { ...clean, ...patch } : { ...clean, ...patch, avatarFile });
    };

    const avatarPicker = (
      <AvatarPicker
        name={value.name}
        value={value.avatar}
        colors={avatarColors}
        maxSizeMb={avatarMaxSizeMb}
        labels={avatarLabels}
        // El avatar es un dato más del perfil: se entrega junto al resto,
        // para que la aplicación guarde una sola vez. `AvatarPicker` ya
        // resuelve `src` para los tres casos —subir, quitar, solo cambiar
        // el color, este último reenviando el `src` que ya tenía— así que
        // no hace falta (ni conviene) recalcularlo aquí.
        //
        // `file` distingue subir (`File`) de los otros dos, pero quitar y
        // solo cambiar el color llegan idénticos (`file: null, src:
        // undefined`): la única diferencia es si ya había una foto puesta,
        // así que se compara contra el `value` actual, no contra el evento.
        onChange={({ file, color, src }) => {
          const hadPhoto = value.avatar?.src !== undefined;
          const avatarFile = file !== null ? file : hadPhoto ? null : undefined;
          emit({ avatar: { color, src } }, avatarFile);
        }}
      />
    );

    return (
      <div ref={ref} className={cn("flex flex-col gap-ui-lg", className)}>
        {/* En vertical el avatar es un bloque suelto encima del formulario,
            como en 0.10.0. En horizontal entra en la misma rejilla —con su
            propio rótulo (`text.avatar`) a la izquierda, como cualquier otro
            campo— para que la pantalla se lea como una sola rejilla y no
            como un bloque suelto sobre un formulario. */}
        {orientation === "vertical" ? avatarPicker : null}
        <FormGrid columns={orientation === "horizontal" ? 1 : 2}>
          {orientation === "horizontal" ? <Field label={text.avatar}>{avatarPicker}</Field> : null}
          {uniqueFields.map((field) => (
            <Field
              key={field}
              label={text[field]}
              description={descriptions?.[field]}
              error={errors?.[field]}
              required={field === "name"}
              orientation={orientation}
            >
              <Input
                type={INPUT_ATTRS[field].type}
                name={field}
                autoComplete={INPUT_ATTRS[field].autoComplete}
                value={value[field] ?? ""}
                onChange={(event) => emit({ [field]: event.target.value })}
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
