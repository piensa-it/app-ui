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
          "Diálogo de confirmación sobre PrimeReact ConfirmDialog. `<AlertDialogHost />` ya está incluido dentro de `UiProvider`; llama a `confirmAlert(...)` desde cualquier parte de la app.",
      },
    },
  },
} satisfies Meta<typeof AlertDialogHost>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <AlertDialogHost />
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
