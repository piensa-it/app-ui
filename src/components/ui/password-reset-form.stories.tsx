import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PasswordResetForm } from "./password-reset-form";

const meta = {
  title: "UI/PasswordResetForm",
  component: PasswordResetForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Recuperar el acceso, en dos pasos (#131). Va dentro del `AuthLayout` de #130. **El paso lo decide la aplicación** (`step`), no el formulario: el cambio ocurre cuando el backend responde, y un estado interno se quedaría en «enviado» aunque la petición hubiera fallado. No cuenta intentos ni bloquea —eso vive en el backend y llega por `error`— y no enmascara el destino: `sentTo` llega ya enmascarado, porque cómo se enmascara un correo es una regla de negocio y de cumplimiento.",
      },
    },
  },
  args: {
    step: "request",
    value: "",
    onChange: () => {},
    onSubmit: () => {},
  },
} satisfies Meta<typeof PasswordResetForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (props: Partial<React.ComponentProps<typeof PasswordResetForm>>) => {
  const [value, setValue] = React.useState("");
  return (
    <div className="max-w-sm">
      <PasswordResetForm step="request" value={value} onChange={setValue} onSubmit={() => {}} {...props} />
    </div>
  );
};

export const Pedir: Story = {
  name: "Paso 1: pedir",
  render: () => <Demo onBack={() => {}} />,
};

export const Enviado: Story = {
  name: "Paso 2: enviado",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `<form>`: en este paso no hay nada que enviar, y un formulario vacío le ofrecería a los gestores de contraseñas un envío que no existe. El bloque es un `role=\"status\"`, para que el cambio de paso se anuncie.",
      },
    },
  },
  render: () => <Demo step="sent" sentTo="•••@piensait.com" onBack={() => {}} />,
};

export const SinDestino: Story = {
  name: "Enviado, sin decir a dónde",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `sentTo` el texto no promete un destino. Es lo que hay que usar cuando la política es no revelar si la cuenta existe.",
      },
    },
  },
  render: () => <Demo step="sent" onBack={() => {}} />,
};

export const ConError: Story = {
  name: "Con error",
  render: () => <Demo error="No pudimos enviar el correo. Intentá de nuevo en unos minutos." onBack={() => {}} />,
};
