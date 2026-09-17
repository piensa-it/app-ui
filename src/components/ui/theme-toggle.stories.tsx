import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ThemeToggle, type ThemePreference } from "./theme-toggle";

const meta = {
  title: "UI/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Selector de tema claro, oscuro o sistema. No controlado: guarda la elección en `localStorage`, aplica `dark` en `<html>` y sigue al sistema en vivo. Para que la página no parpadee al cargar, pon `<ThemeScript />` en el `<head>` (Astro) o `themeScript()` en `index.html` (Vite), con la misma `storageKey`.",
      },
    },
  },
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlado(props: { variant?: "icons" | "labeled" }) {
  const [value, setValue] = useState<ThemePreference>("system");
  return (
    <div className="flex flex-col items-start gap-3">
      <ThemeToggle {...props} value={value} onChange={setValue} />
      <p className="text-sm text-muted-foreground">Elegido: {value}</p>
    </div>
  );
}

export const Iconos: Story = { render: () => <Controlado /> };

export const ConTexto: Story = { render: () => <Controlado variant="labeled" /> };

export const EnIngles: Story = {
  name: "En inglés",
  args: { value: "dark", variant: "labeled", labels: { group: "Theme", light: "Light", dark: "Dark", system: "System" } },
};
