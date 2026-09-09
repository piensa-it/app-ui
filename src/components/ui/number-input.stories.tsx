import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberInput } from "./number-input";
import { Field } from "./field";

const meta = {
  title: "UI/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Entrada numérica sobre Ark UI, con `currency` como atajo para el caso más común: dinero.",
      },
    },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<number | undefined>(10);
      return <NumberInput value={value} onChange={setValue} aria-label="Cantidad" />;
    };
    return <Demo />;
  },
};

export const Moneda: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<number | undefined>(1250000);
      return (
        <Field label="Salario mensual" description="Separador de miles y decimales vienen de Intl.NumberFormat.">
          <NumberInput value={value} onChange={setValue} currency="COP" locale="es-CO" aria-label="Salario mensual" />
        </Field>
      );
    };
    return <Demo />;
  },
};

export const Vacio: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<number | undefined>(undefined);
      return <NumberInput value={value} onChange={setValue} placeholder="0" aria-label="Cantidad" />;
    };
    return <Demo />;
  },
};

export const Tamanos: Story = {
  render: () => {
    const Demo = () => {
      const [sm, setSm] = useState<number | undefined>(1);
      const [md, setMd] = useState<number | undefined>(1);
      const [lg, setLg] = useState<number | undefined>(1);
      return (
        <div className="flex flex-col items-start gap-3">
          <NumberInput size="sm" value={sm} onChange={setSm} aria-label="Pequeño" />
          <NumberInput size="md" value={md} onChange={setMd} aria-label="Mediano" />
          <NumberInput size="lg" value={lg} onChange={setLg} aria-label="Grande" />
        </div>
      );
    };
    return <Demo />;
  },
};

export const Deshabilitado: Story = {
  render: () => <NumberInput value={100} disabled aria-label="Cantidad" />,
};

export const Invalido: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<number | undefined>(-5);
      return <NumberInput value={value} onChange={setValue} min={0} invalid aria-label="Cantidad" />;
    };
    return <Demo />;
  },
};
