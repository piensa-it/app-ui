import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Reveal } from "./reveal";

const meta = {
  title: "UI/Reveal",
  component: Reveal,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Revela su contenido con el preset `enter` al entrar al viewport — para secciones bajas de páginas largas. Sin IntersectionObserver o con `prefers-reduced-motion`, el contenido simplemente se muestra.",
      },
    },
  },
} satisfies Meta<typeof Reveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <p className="text-sm text-muted-foreground">Desplázate hacia abajo — cada sección aparece al entrar en pantalla.</p>
      {["Resumen", "Detalle por edificio", "Actividad reciente", "Notas"].map((titulo, i) => (
        <div key={titulo}>
          {i > 0 && <div className="h-[60vh]" aria-hidden />}
          <Reveal>
            <Card>
              <CardHeader>
                <CardTitle>{titulo}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Sección revelada al hacer scroll ({i + 1} de 4).
              </CardContent>
            </Card>
          </Reveal>
        </div>
      ))}
    </div>
  ),
};
