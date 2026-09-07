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
          "Campo de búsqueda: lupa, texto y botón de limpiar en cuanto hay algo escrito. Es opcional por aplicación: `AppShell` tiene el hueco (`topbarStart`) y cada producto decide si lo pone. Controlado: busca al escribir (`onChange`) o al confirmar (`onSearch`).",
      },
    },
  },
  args: { value: "", onChange: () => {}, placeholder: "Buscar movimientos…" },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = (props: Partial<React.ComponentProps<typeof SearchInput>>) => {
  const [value, setValue] = useState("");
  const [buscado, setBuscado] = useState<string | null>(null);
  return (
    <div className="flex max-w-md flex-col gap-ui-sm">
      <SearchInput value={value} onChange={setValue} onSearch={setBuscado} placeholder="Buscar movimientos…" {...props} />
      <p className="text-ui-caption text-muted-foreground">
        Escribiendo: «{value}» · Confirmado con Enter: {buscado === null ? "—" : `«${buscado}»`}
      </p>
    </div>
  );
};

/** Al escribir aparece el botón de limpiar; Escape también limpia. */
export const Default: Story = { name: "Buscador", render: () => <Demo /> };

/** Con la pista del atajo. La librería solo la pinta; registrar el atajo es de la aplicación. */
export const ConAtajo: Story = { name: "Con atajo", render: () => <Demo shortcut="Ctrl K" /> };

/** Compacto, para una barra de herramientas. */
export const Compacto: Story = { render: () => <Demo size="sm" /> };
