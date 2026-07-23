import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Button } from "./button";

const meta = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Panel flotante accesible sobre Ark UI para contenido contextual interactivo." } },
  },
  args: { children: null },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger>
        <Button variant="outline">Ver detalles</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm">Contenido adicional que aparece al hacer click en el botón.</p>
      </PopoverContent>
    </Popover>
  ),
};
