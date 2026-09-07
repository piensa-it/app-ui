import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BUNDLED_LOOKS } from "@/lib/appearance-presets";

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
    <div className="min-h-screen bg-ground p-ui-lg">
      <div className="mx-auto flex max-w-3xl flex-col gap-stack">
        <div>
          <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">ground</p>
          <p className="text-ui-body-sm text-muted-foreground">La página. Nada se dibuja por debajo.</p>
        </div>

        <div className="rounded-lg border border-surface-border bg-surface p-inset shadow-surface">
          <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">surface</p>
          <p className="mb-ui-md text-ui-body-sm text-muted-foreground">
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
          <CardContent className="flex flex-col gap-ui-md">
            <p className="text-ui-body-sm text-muted-foreground">
              `Card` toma `raised` sola. Sobre la página gris se distingue sin que nadie elija un gris.
            </p>
            <Field label="Monto" description="En pesos colombianos.">
              <Input placeholder="0" />
            </Field>
            <div className="flex gap-ui-xs">
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

/**
 * Los cuatro estilos visuales (`data-ui-look`), uno al lado del otro, con la
 * misma escala dentro. Un estilo mueve solo tokens —neutros, radio, sombra y
 * el activo del menú— y la dirección de la escala se conserva en todos: la
 * prueba de tokens lo comprueba para cada estilo en claro y en oscuro.
 *
 * Elige el estilo de todo el sitio con el conmutador «Estilo» del toolbar;
 * aquí se ven los cuatro a la vez para compararlos.
 */
export const Estilos: Story = {
  name: "Estilos visuales",
  render: () => (
    <div className="grid min-h-screen grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-4">
      {BUNDLED_LOOKS.map((look) => (
        <div key={look.id} data-ui-look={look.id === "classic" ? undefined : look.id} className="flex flex-col bg-ground">
          <div data-sidebar="graphite" className="flex items-center gap-ui-xs bg-sidebar px-ui-sm py-ui-xs text-sidebar-foreground">
            <span className="rounded-md bg-sidebar-active px-ui-xs py-ui-2xs text-ui-caption font-medium text-sidebar-active-foreground inset-shadow-[var(--sidebar-active-bar)_0_0_0_hsl(var(--sidebar-ring))]">
              Activo
            </span>
            <span className="rounded-md px-ui-xs py-ui-2xs text-ui-caption text-sidebar-muted">Reposo</span>
          </div>
          <div className="flex flex-1 flex-col gap-ui-md p-ui-md">
            <div>
              <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">
                data-ui-look="{look.id}"
              </p>
              <p className="text-ui-title-sm font-semibold text-foreground">{look.label}</p>
            </div>
            <div className="rounded-lg border border-surface-border bg-surface p-ui-md shadow-surface">
              <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">surface</p>
              <Card className="mt-ui-sm">
                <CardHeader>
                  <CardTitle className="text-ui-body">raised</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-ui-sm">
                  <Field label="Monto">
                    <Input placeholder="0" />
                  </Field>
                  <div className="flex gap-ui-xs">
                    <Button size="sm">Guardar</Button>
                    <Button size="sm" variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
