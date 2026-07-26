import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiProvider } from "./UiProvider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { confirmAlert } from "@/components/ui/alert-dialog";

const meta = {
  title: "UI/UiProvider",
  component: UiProvider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Proveedor raíz de la librería — se monta una única vez en el entrypoint de la app (`main.tsx`/`_app.tsx`), envolviendo el resto del árbol. No es un proveedor de tema (los componentes son headless y no lo necesitan): solo monta los dos hosts globales de un único punto de montaje que la librería necesita — `<Toaster />` (para `toast.success(...)`, etc.) y `<AlertDialogHost />` (para `confirmAlert(...)`). Sin `UiProvider`, esas dos APIs no tienen dónde renderizar.",
      },
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof UiProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Demo mínima: con un solo `<UiProvider>` en la raíz, tanto `toast` como
 * `confirmAlert` funcionan desde cualquier componente hijo sin volver a
 * montar nada.
 */
export const Default: Story = {
  render: () => (
    <UiProvider>
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.success({ summary: "Guardado", detail: "Los cambios se guardaron." })}>
          Disparar toast
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            confirmAlert({
              title: "¿Eliminar el registro?",
              description: "Esta acción no se puede deshacer.",
              variant: "destructive",
              onConfirm: () => {},
            })
          }
        >
          Disparar confirmAlert
        </Button>
      </div>
    </UiProvider>
  ),
};
