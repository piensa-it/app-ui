import type { Meta, StoryObj } from "@storybook/react-vite";
import { Layers3 } from "lucide-react";

import { IconTile } from "./icon";
import { Surface } from "./surface";

const meta = {
  title: "UI/Surface",
  component: Surface,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Fondos semánticos, padding y elevación para páginas, secciones, tarjetas y estados de producto.",
      },
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  name: "Fondos semánticos",
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(["page", "card", "muted", "subtle", "accent", "primary"] as const).map((variant) => (
        <Surface key={variant} variant={variant} className="min-h-32">
          <IconTile icon={Layers3} containerColor={variant === "primary" ? "muted" : "primary"} />
          <p className="mt-4 font-heading font-semibold capitalize">{variant}</p>
          <p className="mt-1 text-sm opacity-75">Superficie basada en tokens.</p>
        </Surface>
      ))}
    </div>
  ),
};

export const Elevated: Story = {
  name: "Elevación y padding",
  render: () => (
    <div className="bg-muted p-8">
      <Surface elevation="md" padding="lg">
        <p className="font-heading text-lg font-semibold">Panel elevado</p>
        <p className="mt-2 text-sm text-muted-foreground">Usa elevación únicamente cuando comunique jerarquía.</p>
      </Surface>
    </div>
  ),
};
