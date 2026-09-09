import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchInput } from "./search-input";

const meta = {
  title: "UI/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Campo de búsqueda con icono, botón de limpiar y retardo antes de avisar `onChange` — evita disparar una consulta por cada tecla.",
      },
    },
  },
  args: { value: "", onChange: () => {} },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("");
      return <SearchInput value={value} onChange={setValue} aria-label="Buscar" />;
    };
    return <Demo />;
  },
};

export const ConTexto: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("café");
      return <SearchInput value={value} onChange={setValue} aria-label="Buscar producto" />;
    };
    return <Demo />;
  },
};

export const SinRetardo: Story = {
  parameters: {
    docs: { description: { story: "`delay={0}` para cuando el propio consumidor ya hace su debounce." } },
  },
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("");
      return <SearchInput value={value} onChange={setValue} delay={0} aria-label="Buscar" />;
    };
    return <Demo />;
  },
};

export const Tamanos: Story = {
  render: () => {
    const Demo = () => {
      const [sm, setSm] = useState("");
      const [md, setMd] = useState("");
      const [lg, setLg] = useState("");
      return (
        <div className="flex flex-col gap-3">
          <SearchInput size="sm" value={sm} onChange={setSm} aria-label="Pequeño" />
          <SearchInput size="md" value={md} onChange={setMd} aria-label="Mediano" />
          <SearchInput size="lg" value={lg} onChange={setLg} aria-label="Grande" />
        </div>
      );
    };
    return <Demo />;
  },
};

export const Deshabilitado: Story = {
  render: () => <SearchInput value="" onChange={() => {}} disabled aria-label="Buscar" />,
};
