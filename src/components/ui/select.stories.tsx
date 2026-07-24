import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select";

const paises = [
  { label: "Colombia", value: "co" },
  { label: "México", value: "mx" },
  { label: "España", value: "es" },
  { label: "Argentina", value: "ar" },
  { label: "Brasil", value: "br" },
  { label: "Chile", value: "cl" },
  { label: "Costa Rica", value: "cr" },
  { label: "Ecuador", value: "ec" },
  { label: "Estados Unidos", value: "us" },
  { label: "Guatemala", value: "gt" },
  { label: "Panamá", value: "pa" },
  { label: "Perú", value: "pe" },
  { label: "Portugal", value: "pt" },
  { label: "República Dominicana", value: "do" },
  { label: "Uruguay", value: "uy" },
  { label: "Venezuela", value: "ve", disabled: true },
];

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Selector desplegable cerrado para listas cortas. Incluye navegación por teclado; si necesitas filtrar escribiendo, usa AutoComplete · Lista con búsqueda.",
      },
    },
  },
  args: { options: paises },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  name: "Explorar países",
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>(null);
      return (
        <div className="grid max-w-lg gap-3">
          <div>
            <h3 className="text-ui-title font-semibold">País de operación</h3>
            <p className="mt-1 text-ui-body-sm text-muted-foreground">
              Abre el control para recorrer {paises.length} opciones con teclado o puntero.
            </p>
          </div>
          <Select options={paises} value={value} onChange={setValue} placeholder="Selecciona un país" size="lg" variant="surface" />
          <p className="min-h-5 text-ui-body-sm text-muted-foreground">
            {value ? `Código seleccionado: ${value}` : "Aún no has seleccionado un país."}
          </p>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>(null);
      return <Select options={paises} value={value} onChange={setValue} placeholder="Selecciona un país" />;
    };
    return <Demo />;
  },
};

// La variante con filtro de texto vive en el componente `AutoComplete`
// (combobox con búsqueda) — `Select` es un selector cerrado sin input.
