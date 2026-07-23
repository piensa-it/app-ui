import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, ChartNoAxesCombined, CircleCheck, Settings, TriangleAlert } from "lucide-react";

import { Icon, IconTile } from "./icon";

const meta = {
  title: "UI/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Íconos Lucide con tamaños, colores semánticos, fondos y comportamiento accesible consistentes.",
      },
    },
  },
  args: { icon: Bell },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  name: "Tamaños",
  render: () => (
    <div className="flex items-end gap-5">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="grid justify-items-center gap-2">
          <Icon icon={Settings} size={size} />
          <span className="font-mono text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const SemanticTiles: Story = {
  name: "Contenedores semánticos",
  render: () => (
    <div className="flex flex-wrap gap-4">
      <IconTile icon={ChartNoAxesCombined} label="Analítica" />
      <IconTile icon={CircleCheck} color="success" containerColor="success" label="Completado" />
      <IconTile icon={TriangleAlert} color="warning" containerColor="warning" label="Advertencia" />
      <IconTile icon={Bell} color="destructive" containerColor="destructive" label="Alerta" />
    </div>
  ),
};
