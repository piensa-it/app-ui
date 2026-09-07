import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppearanceSettings, type AppearanceValue } from "./appearance-settings";
import { UiProvider } from "@/components/providers/UiProvider";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Badge } from "./badge";

const meta = {
  title: "UI/AppearanceSettings",
  component: AppearanceSettings,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "El panel de apariencia estándar: tema, paleta, tipografía y densidad —y, si se pide, el estilo visual—, cada opción con su vista previa. Controlado y sin persistencia: la aplicación guarda la elección y aplica los atributos en su raíz. Solo ofrece lo tematizable.",
      },
    },
  },
  args: { value: { theme: "system", palette: "indigo", font: "geist", density: "default" }, onChange: () => {} },
} satisfies Meta<typeof AppearanceSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Las cuatro secciones, con las seis paletas incluidas. */
export const Completo: Story = {
  name: "Panel completo",
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState<AppearanceValue>(args.value);
      return <AppearanceSettings value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};

/**
 * La elección aplicada en vivo sobre unos componentes, tal como lo haría la
 * aplicación en su raíz: `.dark`, `data-ui-palette`, `data-ui-font`,
 * `data-ui-look` y `<UiProvider density>`. El panel no toca nada; lo hace la
 * aplicación. Aquí se pide la sección de estilo, que no entra por defecto.
 */
export const EnVivo: Story = {
  name: "Aplicado en vivo",
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState<AppearanceValue>(args.value);
      const prefersDark = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      const dark = value.theme === "dark" || (value.theme === "system" && prefersDark);
      return (
        <div className="grid gap-ui-lg lg:grid-cols-[1fr_20rem]">
          <AppearanceSettings
            value={value}
            onChange={setValue}
            palettes={["indigo", "ocean", "emerald", "ruby", { id: "marca", label: "Marca", primary: "158 64% 32%" }]}
            sections={["theme", "palette", "font", "density", "look"]}
          />
          <div
            className={dark ? "dark" : undefined}
            data-ui-palette={value.palette === "marca" ? undefined : value.palette}
            data-ui-font={value.font}
            data-ui-look={value.look && value.look !== "classic" ? value.look : undefined}
          >
            <UiProvider density={value.density}>
              <div className="rounded-xl bg-ground p-inset font-sans text-foreground">
                <Card>
                  <CardHeader>
                    <CardTitle>Así se vería</CardTitle>
                    <CardDescription>Una tarjeta, un campo y dos botones con la elección aplicada.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-ui-sm">
                    <Input placeholder="Un campo" aria-label="Un campo" />
                    <div className="flex flex-wrap items-center gap-ui-2xs">
                      <Button size="sm">Guardar</Button>
                      <Button size="sm" variant="outline">Cancelar</Button>
                      <Badge variant="success">Activo</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </UiProvider>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

/** Solo tema y densidad: lo que una aplicación sin marca configurable ofrecería. */
export const Parcial: Story = {
  name: "Solo tema y densidad",
  args: { sections: ["theme", "density"] },
};

/**
 * La quinta sección, el estilo visual (`data-ui-look`, #109). No entra por
 * defecto: se pide en `sections`. Cada miniatura lleva el estilo puesto, así
 * que enseña el borde, la sombra, el radio y el activo del menú reales.
 */
export const ConEstilo: Story = {
  name: "Con estilo visual",
  args: { sections: ["look"], value: { theme: "system", palette: "indigo", font: "geist", density: "default", look: "soft" } },
  render: (args) => {
    const Demo = () => {
      const [value, setValue] = useState<AppearanceValue>(args.value);
      return <AppearanceSettings value={value} onChange={setValue} sections={args.sections} />;
    };
    return <Demo />;
  },
};
