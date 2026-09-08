import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileForm, type ProfileFormProps, type ProfileFormValue } from "./profile-form";
import { Field } from "./field";
import { Input } from "./input";

const meta = {
  title: "UI/ProfileForm",
  component: ProfileForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Los datos de la persona en la pantalla de perfil (#124): el avatar y el nombre, correo, teléfono y cargo. Es lo único del perfil que de verdad se repite entre aplicaciones; lo demás —documento, sede, contraseña— es negocio y entra por `children`, tras los campos estándar. Controlado y sin persistencia: cualquier cambio, el avatar incluido, llama a `onChange` con el objeto completo. `orientation=\"horizontal\"` (#132) pone el rótulo a la izquierda y el control con tope de ancho a la derecha, pero solo se ve bien acompañada de `descriptions` —es lo que le da peso a esa columna—; sin ellas, mejor `vertical` (el valor de fábrica, la disposición de 0.10.0).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl p-ui-md">
        <Story />
      </div>
    ),
  ],
  args: {
    value: {
      name: "Andrés Montoya",
      email: "andres@piensait.com",
      phone: "3001234567",
      jobTitle: "Cajera",
      avatar: { color: "350 75% 45%" },
    },
    onChange: () => {},
  },
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `ProfileForm` es controlado: unos `args` estáticos no dejarían escribir en
 * los campos —cada tecleo llamaría a `onChange`, pero nada volvería a pasar
 * `value`—. Este envoltorio sí ejerce los `args` (`value` como semilla,
 * `errors`/`children`/etc. reenviados tal cual) y lleva el estado con
 * `useState`, como hace `AppearanceSettings` en su propia story.
 */
const ControladoDemo = ({ value, onChange: _onChange, ...rest }: ProfileFormProps) => {
  const [current, setCurrent] = React.useState<ProfileFormValue>(value);
  return <ProfileForm {...rest} value={current} onChange={setCurrent} />;
};

/**
 * Los cuatro campos estándar y la elección del avatar (foto o iniciales con
 * color), en la disposición de fábrica: rótulo arriba del control, avatar
 * como bloque suelto encima del formulario. Es exactamente lo que había en
 * 0.10.0 —`orientation="vertical"` no cambia nada—.
 */
export const Default: Story = {
  name: "Vertical (por defecto)",
  render: (args) => <ControladoDemo {...args} />,
};

/**
 * `orientation="horizontal"` con `descriptions`: rótulo y ayuda a la
 * izquierda, control con tope de ancho a la derecha, avatar integrado en la
 * misma rejilla con su propio rótulo («Foto», sustituible con
 * `labels.avatar`). Las dos props van juntas a propósito —es la combinación
 * que documenta el JSDoc de `orientation`—: `descriptions` es lo que le da
 * peso a la columna izquierda; sin ella, el rótulo queda viendo lejos del
 * control y el bloque se ve descuadrado en vez de intencionado (podés
 * comprobarlo quitando `descriptions` de los args, a modo de contraejemplo).
 */
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    descriptions: {
      name: "Como aparece para el resto del equipo.",
      email: "Lo usamos para avisos de la cuenta, nunca para mercadeo.",
      phone: "Solo para contacto en caso de una alerta operativa.",
      jobTitle: "El mismo que se ve en el menú de usuario.",
    },
  },
  render: (args) => <ControladoDemo {...args} />,
};

/**
 * Los campos propios de la aplicación —documento, sede, lo que sea negocio—
 * van tras los estándar, dentro de la misma rejilla: `Field`/`Input` de esta
 * misma librería, sin nada especial de `ProfileForm`.
 */
export const ConCamposPropios: Story = {
  name: "Con campos propios",
  args: {
    children: (
      <>
        <Field label="Documento">
          <Input defaultValue="1020304050" />
        </Field>
        <Field label="Sede">
          <Input defaultValue="Medellín" />
        </Field>
      </>
    ),
  },
  render: (args) => <ControladoDemo {...args} />,
};

/**
 * La validación es cosa de la aplicación: `ProfileForm` solo pinta el mensaje
 * que le llega en `errors`, bajo el campo correspondiente.
 */
export const ConError: Story = {
  name: "Con error de validación",
  args: { errors: { email: "Ese correo ya está en uso." } },
  render: (args) => <ControladoDemo {...args} />,
};
