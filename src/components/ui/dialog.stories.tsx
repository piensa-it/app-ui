import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Select } from "./select";
import { Field } from "./field";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "./sidebar";

const meta = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Modal accesible sobre Ark UI con encabezado, contenido y acciones componibles." } },
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

/**
 * Reproducción del hallazgo de app-lynx (historial-tecnico §30.4): un overlay de Ark
 * (Select) dentro del Dialog de la librería. Cubierto por el gate de navegador en
 * tests/browser/storybook.spec.ts — el desplegable debe abrir, permitir elegir y no
 * cerrar el diálogo.
 */
export const ConSelectDentro: Story = {
  name: "Con Select dentro (overlays anidados)",
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      const [ciudad, setCiudad] = useState<string | number | null>(null);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Abrir formulario</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogHeader>
              <DialogTitle>Nuevo registro</DialogTitle>
              <DialogDescription>Formulario con un Select dentro del diálogo.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Field label="Ciudad">
                <Select
                  aria-label="Ciudad"
                  placeholder="Selecciona una ciudad"
                  value={ciudad}
                  onChange={setCiudad}
                  options={[
                    { label: "Bogotá", value: "bogota" },
                    { label: "Medellín", value: "medellin" },
                    { label: "Cali", value: "cali" },
                  ]}
                />
              </Field>
              <p data-testid="ciudad-elegida" className="mt-2 text-sm text-muted-foreground">
                Elegida: {ciudad ?? "ninguna"}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={() => setOpen(false)}>Guardar</Button>
            </DialogFooter>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};

/**
 * Capas encadenadas gobernadas por la app: el diálogo abre un panel y se cierra
 * a sí mismo en el mismo clic (radicar → ver el radicado). Zag cerraría en
 * cascada el panel al retirar el diálogo, y lo cerraría de nuevo al devolverle
 * el foco al botón de origen; la librería veta ambos por defecto
 * (`onRequestDismiss`, `onFocusOutside`). Escape y el backdrop siguen cerrando.
 */
export const AbreUnSheet: Story = {
  name: "Abre un Sheet y se cierra",
  render: () => {
    const Demo = () => {
      const [dialogOpen, setDialogOpen] = useState(false);
      const [sheetOpen, setSheetOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setDialogOpen(true)}>Radicar documento</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogHeader>
              <DialogTitle>Radicar documento</DialogTitle>
              <DialogDescription>Al confirmar se abre el detalle del radicado.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setSheetOpen(true);
                  setDialogOpen(false);
                }}
              >
                Confirmar y ver radicado
              </Button>
            </DialogFooter>
          </Dialog>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetHeader>
              <SheetTitle>Radicado 2026-0917</SheetTitle>
              <SheetDescription>Este panel debe seguir abierto aunque el diálogo de origen ya se cerró.</SheetDescription>
            </SheetHeader>
          </Sheet>
        </>
      );
    };
    return <Demo />;
  },
};
