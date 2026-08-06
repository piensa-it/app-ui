import type { Meta, StoryObj } from "@storybook/react-vite";

import { Illustration } from "./illustration";

function DemoFigure() {
  return (
    <svg viewBox="0 0 240 240" role="img" aria-label="Figura geométrica de demostración">
      <circle cx="120" cy="120" r="96" className="fill-primary/10" />
      <path d="M70 154c25-64 75-64 100 0" className="fill-none stroke-primary" strokeWidth="12" strokeLinecap="round" />
      <circle cx="92" cy="102" r="9" className="fill-foreground" />
      <circle cx="148" cy="102" r="9" className="fill-foreground" />
    </svg>
  );
}

const meta = {
  title: "Contenedores/Illustration",
  component: Illustration,
  tags: ["autodocs"],
  args: {
    children: <DemoFigure />,
    size: "lg",
    motion: "float",
  },
  decorators: [
    (Story) => (
      <div className="grid min-h-96 place-items-center bg-muted/30 p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Illustration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Flotante: Story = {};
export const Entrada: Story = { args: { motion: "enter" } };
export const SinMovimiento: Story = { args: { motion: "none" } };
export const Pausada: Story = { args: { paused: true } };
