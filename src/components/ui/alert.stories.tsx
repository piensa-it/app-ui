import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertCircle, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Informacion: Story = {
  args: {
    icon: <Info className="size-5" />,
    children: <><AlertTitle>Actualización disponible</AlertTitle><AlertDescription>Guarda tus cambios antes de actualizar.</AlertDescription></>,
  },
};

export const Estados: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert icon={<Info className="size-5" />}><AlertTitle>Información</AlertTitle><AlertDescription>Este cambio se aplicará mañana.</AlertDescription></Alert>
      <Alert variant="success" icon={<CircleCheck className="size-5" />}><AlertTitle>Cambios guardados</AlertTitle><AlertDescription>La configuración ya está activa.</AlertDescription></Alert>
      <Alert variant="warning" icon={<TriangleAlert className="size-5" />}><AlertTitle>Revisa los datos</AlertTitle><AlertDescription>Hay campos que podrían estar desactualizados.</AlertDescription></Alert>
      <Alert variant="destructive" icon={<AlertCircle className="size-5" />}><AlertTitle>No pudimos guardar</AlertTitle><AlertDescription>Corrige los errores e inténtalo de nuevo.</AlertDescription></Alert>
    </div>
  ),
};
