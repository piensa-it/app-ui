import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Interruptor accesible sobre Ark UI para preferencias binarias de efecto inmediato." } },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [checked, setChecked] = useState(true);
      return <Switch checked={checked} onCheckedChange={setChecked} />;
    };
    return <Demo />;
  },
};

/** Con un `<label htmlFor>` externo: `id` va al input nativo (`ids.hiddenInput`). */
export const ConLabelExterno: Story = {
  name: "Con label externo (id)",
  render: () => {
    const Demo = () => {
      const [checked, setChecked] = useState(true);
      return (
        <div className="flex items-center gap-2">
          <Switch id="notificaciones" checked={checked} onCheckedChange={setChecked} />
          <label htmlFor="notificaciones" className="text-sm">
            Notificaciones por correo
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
  args: { "aria-label": "Activar modo oscuro", checked: false },
};
