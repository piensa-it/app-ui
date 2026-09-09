import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "./checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Checkbox accesible sobre Ark UI con estados marcado, vacío e indeterminado." } },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [checked, setChecked] = useState(false);
      return <Checkbox checked={checked} onCheckedChange={setChecked} />;
    };
    return <Demo />;
  },
};

export const Deshabilitado: Story = { args: { checked: true, disabled: true } };

/**
 * Con un `<label htmlFor>` externo: `id` va al input nativo (equivale a
 * `ids.hiddenInput`), así la etiqueta asocia y `getByLabelText` encuentra el
 * control. El input cubre todo el control para que un clic automatizado sobre
 * él no lo desplace.
 */
export const ConLabelExterno: Story = {
  name: "Con label externo (id)",
  render: () => {
    const Demo = () => {
      const [checked, setChecked] = useState(false);
      return (
        <div className="flex items-center gap-2">
          <Checkbox id="acepta-terminos" checked={checked} onCheckedChange={setChecked} />
          <label htmlFor="acepta-terminos" className="text-sm">
            Acepto los términos
          </label>
        </div>
      );
    };
    return <Demo />;
  },
};

/** Sin etiqueta visible: `aria-label` da nombre al propio input. */
export const SoloAriaLabel: Story = {
  name: "Solo aria-label",
  args: { "aria-label": "Seleccionar fila", checked: true },
};

/**
 * `checked="indeterminate"` — selección parcial, ej. un "seleccionar todo"
 * con algunos hijos marcados (el caso de #144 y #137). Un clic del usuario
 * siempre lo resuelve a marcado/desmarcado, nunca vuelve a "indeterminate"
 * por sí solo: por eso este demo también ofrece un botón para restaurarlo,
 * como haría un padre de `DataTable` al reevaluar la selección de sus hijos.
 */
export const Indeterminado: Story = {
  render: () => {
    const Demo = () => {
      const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate");
      return (
        <div className="flex items-center gap-4">
          <Checkbox checked={checked} onCheckedChange={setChecked} label="Seleccionar todo" />
          <button
            type="button"
            className="text-sm text-primary underline"
            onClick={() => setChecked("indeterminate")}
          >
            Volver a indeterminado
          </button>
        </div>
      );
    };
    return <Demo />;
  },
};
