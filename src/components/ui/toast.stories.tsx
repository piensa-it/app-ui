import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toast } from "./toast";
import { Button } from "./button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Field } from "./field";
import { Input } from "./input";

const meta = {
  title: "UI/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Notificaciones globales sobre Ark UI Toast (reemplaza a `sonner`). `<Toaster />` ya está incluido dentro de `UiProvider` — no hace falta agregarlo manualmente en la app consumidora.",
      },
    },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      {/* Sin <Toaster /> aquí: UiProvider —que envuelve toda story vía el
          decorador de preview.tsx— ya monta uno. Repetirlo aquí montaba un
          segundo Toaster suscrito al mismo `toaster`, así que cada aviso se
          pintaba dos veces (hallazgo de #53, al correr axe sobre el overlay
          abierto de verdad por primera vez). */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => toast.success({ summary: "Guardado", detail: "Los cambios se guardaron." })}>
          Éxito
        </Button>
        <Button
          variant="destructive"
          onClick={() => toast.error({ summary: "Error", detail: "No se pudo guardar." })}
        >
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.info({ summary: "Info", detail: "Dato informativo." })}>
          Info
        </Button>
      </div>
    </>
  ),
};

/**
 * #67: el caso real que hoy dispara casi todos los avisos de la librería —
 * validar un formulario de captura dentro de un `Dialog` modal. Antes de
 * portalizar `Toaster`, el aviso quedaba en el subárbol que el diálogo marca
 * `aria-hidden="true"` mientras está abierto: un lector de pantalla no lo
 * anunciaba y su botón de cerrar no era alcanzable. Cubierta además por
 * `toast-under-dialog.test.tsx` (afirma la ausencia de ese `aria-hidden`) y
 * por el gate de navegador en `tests/browser/storybook.spec.ts`.
 */
export const ConDialogoAlValidar: Story = {
  name: "Con diálogo al validar",
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      const [nombre, setNombre] = useState("");

      const guardar = () => {
        if (!nombre.trim()) {
          toast.error({ summary: "No se pudo guardar", detail: "El nombre es obligatorio." });
          return;
        }
        toast.success({ summary: "Guardado" });
        setOpen(false);
      };

      return (
        <>
          <Button onClick={() => setOpen(true)}>Capturar registro</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogHeader>
              <DialogTitle>Capturar registro</DialogTitle>
              <DialogDescription>Guardar con el campo vacío dispara el aviso de error.</DialogDescription>
            </DialogHeader>
            <Field label="Nombre" required>
              <Input value={nombre} onChange={(event) => setNombre(event.target.value)} />
            </Field>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={guardar}>Guardar</Button>
            </DialogFooter>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};

/** Cada toast dura 4 s por defecto (alineado con sonner); `duration` lo cambia por notificación. */
export const Duracion: Story = {
  name: "Duración",
  render: () => (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => toast.info({ summary: "4 segundos (por defecto)" })}>
          Por defecto
        </Button>
        <Button variant="outline" onClick={() => toast.warn({ summary: "10 segundos", duration: 10000 })}>
          duration: 10000
        </Button>
      </div>
    </>
  ),
};
