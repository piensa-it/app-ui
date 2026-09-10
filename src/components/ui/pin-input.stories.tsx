import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PinInput } from "./pin-input";
import { Field } from "./field";
import { Button } from "./button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";

const meta = {
  title: "UI/PinInput",
  component: PinInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Código de un solo uso, sobre el `pin-input` de Ark UI (#131): una casilla por carácter, el foco avanza solo, borrar retrocede, y pegar el código entero lo reparte entre todas. Lleva `autoComplete=\"one-time-code\"` e `inputMode=\"numeric\"`, que es lo que hace que el teléfono ofrezca el código recién llegado por SMS. **No es una pieza de autenticación**, aunque el segundo factor sea su uso más obvio: sirve igual para confirmar una transferencia o autorizar una anulación, y por eso vive en `UI/`. Es un control compuesto —varias casillas enfocables bajo un rótulo—, así que dentro de un `Field` va con `compositeControl`.",
      },
    },
  },
  args: {
    value: "",
    onChange: () => {},
  },
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (props: Partial<React.ComponentProps<typeof PinInput>>) => {
  const [value, setValue] = React.useState("");
  return (
    <Field label="Código de verificación" compositeControl>
      <PinInput value={value} onChange={setValue} {...props} />
    </Field>
  );
};

export const Basico: Story = {
  name: "Básico",
  render: () => <Demo />,
};

export const CuatroDigitos: Story = {
  name: "Cuatro dígitos",
  render: () => <Demo length={4} />,
};

export const Enmascarado: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Con `mask` las casillas son de contraseña, así que el navegador tampoco deja copiar el valor. Para un PIN que no es de un solo uso, apagá además `otp`: ofrecerle a alguien un código viejo es peor que no ofrecerle nada.",
      },
    },
  },
  render: () => <Demo mask otp={false} />,
};

export const ConError: Story = {
  name: "Con error",
  render: function ConErrorDemo() {
    const [value, setValue] = React.useState("482913");
    return (
      <Field label="Código de verificación" compositeControl error="El código no es válido o ya caducó">
        <PinInput value={value} onChange={setValue} aria-invalid />
      </Field>
    );
  },
};

export const ConfirmarUnaOperacion: Story = {
  name: "Fuera del login: confirmar una operación",
  parameters: {
    docs: {
      description: {
        story:
          "El segundo factor es su uso más obvio, pero no el único ni el que justifica dónde vive. Aquí confirma una transferencia dentro de la aplicación, sin que haya ninguna sesión en juego: por eso `PinInput` es un control de `UI/` y no una pieza de autenticación.",
      },
    },
  },
  render: function ConfirmarDemo() {
    const [value, setValue] = React.useState("");
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogHeader>
          <DialogTitle>Confirmar la transferencia</DialogTitle>
          <DialogDescription>
            Vas a transferir $ 1.250.000 a la cuenta •••4417. Escribí el código que te enviamos.
          </DialogDescription>
        </DialogHeader>
        <Field label="Código de confirmación" compositeControl>
          <PinInput value={value} onChange={setValue} />
        </Field>
        <DialogFooter>
          <Button variant="outline">Cancelar</Button>
          <Button>Confirmar</Button>
        </DialogFooter>
      </Dialog>
    );
  },
};
