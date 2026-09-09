import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertDialogHost, confirmAlert } from "./alert-dialog";
import { Button } from "./button";

const meta = {
  title: "UI/AlertDialog",
  component: AlertDialogHost,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Diálogo de confirmación sobre Ark UI Dialog (`role=\"alertdialog\"`). `<AlertDialogHost />` ya está incluido dentro de `UiProvider`; llama a `confirmAlert(...)` desde cualquier parte de la app.",
      },
    },
  },
} satisfies Meta<typeof AlertDialogHost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      {/* Sin <AlertDialogHost /> aquí: UiProvider —que envuelve toda story vía
          el decorador de preview.tsx— ya monta uno. Repetirlo aquí montaba un
          segundo host suscrito al mismo store, así que cada confirmAlert(...)
          pintaba dos <alertdialog> idénticos a la vez (hallazgo de #53, al
          correr axe sobre el overlay abierto de verdad por primera vez). */}
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
        Eliminar
      </Button>
    </>
  ),
};

export const Superficies: Story = {
  render: () => (
    <>
      <div className="flex flex-wrap gap-3">
        {(["default", "outline", "elevated"] as const).map((surface) => (
          <Button
            key={surface}
            variant="outline"
            onClick={() =>
              confirmAlert({
                title: `Confirmación ${surface}`,
                description: "Elige la superficie adecuada para el contexto de la aplicación.",
                confirmLabel: "Confirmar",
                surface,
                onConfirm: () => {},
              })
            }
          >
            {surface}
          </Button>
        ))}
      </div>
    </>
  ),
};
