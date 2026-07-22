import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Input } from "./input";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Contenedor de superficie (`bg-card`) para agrupar contenido relacionado. Se compone con `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` y `CardFooter` — todos exportados individualmente para máxima flexibilidad de layout.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basica: Story = {
  name: "Básica",
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Título de la card</CardTitle>
        <CardDescription>Una descripción corta de una línea.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Contenido libre dentro de la card.</p>
      </CardContent>
    </Card>
  ),
};

export const ConFormulario: Story = {
  name: "Con formulario",
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>Ejemplo de formulario básico.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input placeholder="Correo electrónico" type="email" />
        <Input placeholder="Contraseña" type="password" />
      </CardContent>
      <CardFooter>
        <Button className="w-full">Continuar</Button>
      </CardFooter>
    </Card>
  ),
};
