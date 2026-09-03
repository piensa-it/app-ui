import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toast } from "./toast";
import { Button } from "./button";

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
      <Toaster />
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

/** Cada toast dura 4 s por defecto (alineado con sonner); `duration` lo cambia por notificación. */
export const Duracion: Story = {
  name: "Duración",
  render: () => (
    <>
      <Toaster />
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
