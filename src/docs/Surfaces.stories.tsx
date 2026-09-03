import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const meta = {
  title: "Tokens/Superficies",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Los tres niveles de la escala de superficies, uno dentro de otro. Es la referencia visual del sistema: un cambio de token se ve aquí antes que en una aplicación.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Los tres niveles, uno sobre otro. En claro y en oscuro cada nivel es más
 * claro que el anterior: la elevación se lee siempre como más luz.
 */
export const Escala: Story = {
  name: "Escala de superficies",
  render: () => (
    <div className="min-h-screen bg-ground p-lg">
      <div className="mx-auto flex max-w-3xl flex-col gap-stack">
        <div>
          <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">ground</p>
          <p className="text-ui-body-sm text-muted-foreground">La página. Nada se dibuja por debajo.</p>
        </div>

        <div className="rounded-lg border border-surface-border bg-surface p-inset shadow-surface">
          <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">surface</p>
          <p className="mb-md text-ui-body-sm text-muted-foreground">
            Paneles, barras y controles de formulario.
          </p>

          <div className="rounded-lg border border-raised-border bg-raised p-inset shadow-raised">
            <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">raised</p>
            <p className="text-ui-body-sm text-muted-foreground">
              Lo que flota sobre la página: tarjetas, diálogos, menús.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Una tarjeta real</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-md">
            <p className="text-ui-body-sm text-muted-foreground">
              `Card` toma `raised` sola. Sobre la página gris se distingue sin que nadie elija un gris.
            </p>
            <Field label="Monto" description="En pesos colombianos.">
              <Input placeholder="0" />
            </Field>
            <div className="flex gap-xs">
              <Button size="sm">Guardar</Button>
              <Button size="sm" variant="outline">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
