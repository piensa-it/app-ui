import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppVersion } from "./app-version";

const meta = {
  title: "Layout/AppVersion",
  component: AppVersion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Línea de versión para el pie del menú lateral. Muestra solo la versión de la aplicación, que es el único dato que se consulta a diario; `details` añade la versión de la librería y la fecha de compilación para una pantalla de ayuda.",
      },
    },
  },
  args: { version: "1.4.2" },
  decorators: [
    (Story) => (
      <div className="w-64 rounded-lg bg-sidebar p-ui-sm text-sidebar-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppVersion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** En el pie del menú: solo la versión de la aplicación, con su prefijo por defecto ("v"). */
export const Default: Story = {
  name: "En el pie del menú",
  args: { version: "1.4.2" },
};

/**
 * `details` añade la versión de la librería y la fecha de compilación —el
 * dato que hace falta al depurar un reporte— en una segunda línea. Su sitio
 * es una pantalla de ayuda o "acerca de", no el menú.
 */
export const ConDetalle: Story = {
  name: "Con detalle (pantalla de ayuda)",
  args: { version: "1.4.2", buildDate: "2026-09-03", details: true },
};

/** Un prefijo distinto a "v", por si la aplicación numera sus versiones de otra forma. */
export const PrefijoPersonalizado: Story = {
  name: "Prefijo personalizado",
  args: { version: "2026.09.03", prefix: "build " },
};
