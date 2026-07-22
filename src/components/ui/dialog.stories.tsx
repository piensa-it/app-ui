import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Modal sobre PrimeReact Dialog, con composición por hijos." } },
  },
  args: { open: false, onOpenChange: () => {} },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogHeader>
              <DialogTitle>¿Confirmar acción?</DialogTitle>
              <DialogDescription>Esta operación no se puede deshacer.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setOpen(false)}>Confirmar</Button>
            </DialogFooter>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};
