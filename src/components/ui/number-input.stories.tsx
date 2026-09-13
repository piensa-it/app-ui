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
          "Entrada numérica sobre Ark UI, con `currency` como atajo para el caso más común: dinero. Con `currency` o `formatOptions` el campo se enmascara mientras se escribe —separadores de miles de la `locale`, cursor en su sitio— y `onChange` entrega siempre un `number`, nunca el texto formateado.",
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
        <Field label="Salario mensual" description={`Valor que recibe la aplicación: ${value ?? "vacío"}`}>
          <NumberInput value={value} onChange={setValue} currency="COP" locale="es-CO" hideControls aria-label="Salario mensual" />
        </Field>
      );
    };
    return <Demo />;
  },
};

/**
 * Cantidad entera con separadores de miles: `formatOptions` sin decimales, sin
 * `currency`. El punto del teclado numérico no escribe nada, porque el formato
 * no admite decimales.
 */
export const Entero: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<number | undefined>(undefined);
      return (
        <Field label="Unidades en inventario" description={`Valor que recibe la aplicación: ${value ?? "vacío"}`}>
          <NumberInput
            value={value}
            onChange={setValue}
            locale="es-CO"
            formatOptions={{ maximumFractionDigits: 0 }}
            placeholder="0"
            aria-label="Unidades en inventario"
          />
        </Field>
      );
    };
    return <Demo />;
  },
};

/** `mask={false}`: el formato se aplica solo al salir del campo, como hace Ark UI por defecto. */
export const SinMascara: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<number | undefined>(undefined);
      return (
        <NumberInput value={value} onChange={setValue} currency="USD" locale="en-US" mask={false} placeholder="$0.00" aria-label="Monto" />
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
