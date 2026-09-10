import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OtpForm } from "./otp-form";

const meta = {
  title: "UI/OtpForm",
  component: OtpForm,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "El segundo factor (#131). Va dentro del `AuthLayout` de #130, así que no estrena armazón. No valida nada ni cuenta intentos —eso vive en el backend y llega por `error`— y **no lleva la cuenta atrás del reenvío**: `resendAvailableIn` llega en segundos ya calculados y aquí solo se muestra, igual que `saving` en `SettingsPage`. El destino llega ya enmascarado en `sentTo`, porque enmascarar un correo es una regla de negocio y de cumplimiento. Se envía solo al completarse el código, que es lo que espera quien acaba de teclear seis dígitos.",
      },
    },
  },
  args: {
    value: "",
    onChange: () => {},
    onSubmit: () => {},
  },
} satisfies Meta<typeof OtpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = ({ initial = "", ...props }: Partial<React.ComponentProps<typeof OtpForm>> & { initial?: string }) => {
  const [value, setValue] = React.useState(initial);
  return (
    <div className="max-w-sm">
      <OtpForm value={value} onChange={setValue} onSubmit={() => {}} {...props} />
    </div>
  );
};

export const Basico: Story = {
  name: "Básico",
  render: () => <Demo sentTo="•••@piensait.com" onResend={() => {}} onBack={() => {}} />,
};

export const EsperandoParaReenviar: Story = {
  name: "Esperando para reenviar",
  parameters: {
    docs: {
      description: {
        story:
          "Mientras `resendAvailableIn` sea mayor que cero el botón dice cuánto falta y descarta el clic. Usa `aria-disabled`, no `disabled`: así el control sigue en el recorrido del teclado y quien lo alcanza **oye por qué** no puede usarlo todavía. La cuenta atrás la lleva la aplicación.",
      },
    },
  },
  render: () => <Demo sentTo="•••@piensait.com" onResend={() => {}} resendAvailableIn={32} />,
};

export const ConError: Story = {
  name: "Con error",
  render: () => (
    <Demo initial="482913" sentTo="•••@piensait.com" error="El código no es válido o ya caducó." onResend={() => {}} />
  ),
};

export const Verificando: Story = {
  render: () => <Demo initial="482913" sentTo="•••@piensait.com" loading />,
};

export const Oscuro: Story = {
  name: "Tema oscuro",
  globals: { theme: "dark" },
  render: () => <Demo sentTo="•••@piensait.com" onResend={() => {}} onBack={() => {}} />,
};
