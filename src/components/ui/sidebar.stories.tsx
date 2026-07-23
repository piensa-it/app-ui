import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "./sidebar";
import { Button } from "./button";

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Panel lateral accesible sobre Ark UI para tareas secundarias y navegación contextual." } },
  },
  args: { open: false, onOpenChange: () => {} },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Abrir panel</Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>Ajusta los filtros de la búsqueda.</SheetDescription>
            </SheetHeader>
          </Sheet>
        </>
      );
    };
    return <Demo />;
  },
};
