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
