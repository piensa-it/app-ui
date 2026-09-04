import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "../components/ui/badge";
import { Surface } from "../components/ui/surface";
import { UI_LIBRARY_RELEASES, UI_LIBRARY_VERSION, type ReleaseChannel } from "../version";

const meta = {
  title: "Versiones",
  parameters: {
    layout: "padded",
    // Página de referencia estática — sin controles, acciones, pruebas de
    // interacción ni auditoría de a11y que mostrar (apagamos las 4 pestañas
    // del panel inferior; ver la nota más completa en Tokens.stories.tsx).
    controls: { disable: true },
    actions: { disable: true },
    interactions: { disable: true },
    a11y: { disable: true },
    docs: {
      description: {
        component:
          "Estado de las versiones publicadas. `current` es la versión recomendada; una línea pasa a `lts` cuando recibe soporte prolongado.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const channelLabels: Record<ReleaseChannel, string> = {
  current: "Actual",
  lts: "LTS",
  maintenance: "Mantenimiento",
  deprecated: "Sin soporte",
};

export const EstadoDeVersiones: Story = {
  name: `Versión actual · ${UI_LIBRARY_VERSION}`,
  render: () => (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header className="grid gap-2">
        <p className="text-ui-caption font-semibold uppercase tracking-[0.16em] text-primary">Releases</p>
        <h1 className="text-ui-display font-heading font-semibold">Versiones de la librería</h1>
        <p className="max-w-2xl text-ui-body text-muted-foreground">
          Consulta qué versión deben instalar las aplicaciones y cuáles siguen recibiendo soporte.
        </p>
      </header>
      <div className="grid gap-3">
        {UI_LIBRARY_RELEASES.map((release) => (
          <Surface key={release.version} variant="card" className="grid gap-ui-md">
            <div className="flex items-center justify-between gap-ui-md">
              <div>
                <p className="text-ui-title-sm font-semibold">@piensa-it/ui-library</p>
                <code className="text-ui-body-sm text-muted-foreground">v{release.version}</code>
              </div>
              <Badge variant={release.channel === "current" ? "default" : "outline"}>
                {channelLabels[release.channel]}
              </Badge>
            </div>
            {/* Qué hay que hacer al subir, no qué cambió: lo segundo está en el
                CHANGELOG y lo primero es lo que se busca al actualizar. */}
            {release.migration.length > 0 ? (
              <div className="grid gap-ui-xs border-t border-border pt-ui-md">
                <p className="text-ui-caption font-semibold uppercase tracking-wide text-muted-foreground">
                  Al subir a esta versión
                </p>
                <ul className="grid list-disc gap-ui-2xs pl-ui-md text-ui-body-sm text-muted-foreground">
                  {release.migration.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Surface>
        ))}
      </div>
      <Surface variant="subtle" className="p-5">
        <p className="text-ui-title-sm font-semibold">Política de estados</p>
        <p className="mt-2 text-ui-body-sm text-muted-foreground">
          Actual: recomendada para nuevos proyectos · LTS: soporte prolongado · Mantenimiento: solo correcciones
          críticas · Sin soporte: requiere migración.
        </p>
      </Surface>
    </div>
  ),
};
