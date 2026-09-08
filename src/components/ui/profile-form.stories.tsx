import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileForm, type ProfileFormProps, type ProfileFormValue } from "./profile-form";
import { Field } from "./field";
import { Input } from "./input";

const meta = {
  title: "Formularios/ProfileForm",
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

const VALOR_INICIAL: ProfileFormValue = meta.args.value;

/**
 * `ProfileForm` es controlado: sin este envoltorio con estado propio, los
 * campos se verían pero no admitirían tecleo (`args` estáticos no bastan).
 */
const Controlado = (props: Partial<ProfileFormProps>) => {
  const [value, setValue] = React.useState<ProfileFormValue>(props.value ?? VALOR_INICIAL);
  return <ProfileForm {...props} value={value} onChange={setValue} />;
};

/** Los cuatro campos estándar y la elección del avatar (foto o iniciales con color). */
export const Default: Story = {
  name: "Completo",
  render: () => <Controlado />,
};

/**
 * Los campos propios de la aplicación —documento, sede, lo que sea negocio—
 * van tras los estándar, dentro de la misma rejilla: `Field`/`Input` de esta
 * misma librería, sin nada especial de `ProfileForm`.
 */
export const ConCamposPropios: Story = {
  name: "Con campos propios",
  render: () => (
    <Controlado>
      <Field label="Documento">
        <Input defaultValue="1020304050" />
      </Field>
      <Field label="Sede">
        <Input defaultValue="Medellín" />
      </Field>
    </Controlado>
  ),
};

/**
 * La validación es cosa de la aplicación: `ProfileForm` solo pinta el mensaje
 * que le llega en `errors`, bajo el campo correspondiente.
 */
export const ConError: Story = {
  name: "Con error de validación",
  render: () => <Controlado errors={{ email: "Ese correo ya está en uso." }} />,
};
