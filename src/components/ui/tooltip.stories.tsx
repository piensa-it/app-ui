import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./tooltip";
import { Button } from "./button";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Tooltip accesible sobre Ark UI para ayudas breves y contextuales." } },
  },
  args: { content: "", children: <span /> },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip content="Guardar cambios">
      <Button variant="outline">Guardar</Button>
    </Tooltip>
  ),
};
