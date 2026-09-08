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
          "Los datos de la persona en la pantalla de perfil (#124): el avatar y el nombre, correo, teléfono y cargo. Es lo único del perfil que de verdad se repite entre aplicaciones; lo demás —documento, sede, contraseña— es negocio y entra por `children`, tras los campos estándar. Controlado y sin persistencia: cualquier cambio, el avatar incluido, llama a `onChange` con el objeto completo.",
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

/** Los cuatro campos estándar y la elección del avatar (foto o iniciales con color). */
export const Default: Story = {
  name: "Completo",
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
