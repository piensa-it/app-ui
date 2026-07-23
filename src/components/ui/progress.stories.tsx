import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./progress";

const meta = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Barra de progreso accesible sobre Ark UI, tematizada con tokens semánticos." } },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { value: 45 } };
export const Completo: Story = { args: { value: 100 } };
