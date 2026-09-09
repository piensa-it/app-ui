import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PasswordInput } from "./password-input";
import { Field } from "./field";

const meta = {
  title: "UI/PasswordInput",
  component: PasswordInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Campo de contraseña con mostrar/ocultar, sobre el `password-input` de Ark UI (#130). Alternar cambia el `type` del mismo input, así que el valor nunca se pierde, y Ark vuelve a ocultarla sola al enviar o reiniciar el formulario. Trae `autoComplete=\"current-password\"` de fábrica —`new-password` al crear o cambiar la clave— y **no** pide a los gestores de contraseñas que lo ignoren, que es lo que necesita una pantalla de entrada. Frente a Ark, corrige dos cosas de teclado: el botón es enfocable y responde a Enter y Espacio (Ark lo deja con `tabIndex={-1}` y solo atiende el puntero).",
      },
    },
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (props: React.ComponentProps<typeof PasswordInput> & { label?: string; error?: string }) => {
  const { label = "Contraseña", error, ...rest } = props;
  const [value, setValue] = React.useState("una-clave-larga");
  return (
    <div className="max-w-sm">
      <Field label={label} error={error}>
        <PasswordInput value={value} onChange={(event) => setValue(event.target.value)} {...rest} />
      </Field>
    </div>
  );
};

export const Basico: Story = {
  name: "Básico",
  render: () => <Demo />,
};

export const Visible: Story = {
  name: "Empezando visible",
  render: () => <Demo defaultVisible />,
};

export const ClaveNueva: Story = {
  name: "Contraseña nueva",
  parameters: {
    docs: {
      description: {
        story:
          "`autoComplete=\"new-password\"` es lo que hace que el navegador ofrezca **generar** una contraseña en vez de rellenar la guardada. Va en registro y en cambio de contraseña, nunca en la pantalla de entrada.",
      },
    },
  },
  render: () => <Demo label="Nueva contraseña" autoComplete="new-password" />,
};

export const ConError: Story = {
  name: "Con error",
  render: () => <Demo error="La contraseña debe tener al menos 8 caracteres" />,
};

export const Deshabilitado: Story = {
  render: () => <Demo disabled />,
};
