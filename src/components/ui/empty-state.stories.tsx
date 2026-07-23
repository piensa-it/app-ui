import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";
import { Button } from "./button";
import { EmptyState } from "./empty-state";

const meta = {
  title: "UI/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    title: "Aún no hay movimientos",
    description: "Los movimientos aparecerán aquí cuando registres el primero.",
    icon: <Inbox className="size-5" />,
    action: <Button size="sm">Registrar movimiento</Button>,
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
