import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleApp } from "./example/example-app";

const meta = {
  title: "Guías/Aplicación de ejemplo",
  component: ExampleApp,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Una aplicación de tesorería completa —menú, barra superior, tabla y formulario— montada",
          "únicamente con piezas de la librería. Es la referencia contra la que discutir el armazón:",
          "si algo aquí hay que resolverlo a mano, es un hueco de la librería, no de la aplicación.",
          "",
          "El reparto es el de siempre: la librería pone el armazón (`AppShell`), el ritmo",
          "(`PageContainer`, `PageHeader`) y los controles; la aplicación pone su router, sus datos y",
          "sus permisos. Por eso los enlaces del menú son `<a>` corrientes de esta página, no un",
          "componente de navegación: la librería no conoce el router de nadie, pero sí garantiza que",
          "reposo, hover y activo se lean igual gracias a los tokens `--sidebar-*`.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["graphite", "ink", "smoke"],
      description: "Carácter cromático del menú lateral.",
    },
    vistaInicial: {
      control: "inline-radio",
      options: ["movimientos", "nuevo", "conciliacion", "reportes", "cuentas"],
      description: "Vista con la que arranca el ejemplo.",
    },
    defaultCollapsed: { control: "boolean" },
  },
  args: {
    variant: "graphite",
    vistaInicial: "movimientos",
    defaultCollapsed: false,
  },
} satisfies Meta<typeof ExampleApp>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * La aplicación entera, navegable. Demuestra el recorrido completo: elegir
 * empresa y entorno en `SidebarBrand`, cambiar de sección en el menú (con el
 * activo marcado por `aria-current`), plegar el menú desde la barra superior y
 * ver la versión del compilado en el pie.
 *
 * Usa el control `variant` de esta página para probar las tres variantes de
 * menú sin salir de la story.
 */
export const AplicacionCompleta: Story = {};

/**
 * La vista de datos: `PageContainer` en ancho `wide`, `PageHeader` con
 * acciones, tres cifras de resumen y una `DataTable` con búsqueda, orden,
 * paginación y configurador de columnas. La columna de valor va alineada a la
 * derecha con `tabular-nums` —único modo de comparar magnitudes de un
 * vistazo— y el signo se refuerza con color, no solo con el menos.
 */
export const VistaDeTabla: Story = {
  args: { vistaInicial: "movimientos" },
};

/**
 * La vista de captura: `Field` conectando etiqueta, ayuda y error de cada
 * control, con `Input` y `Select` sobre una rejilla de dos columnas. Pulsa
 * "Guardar movimiento" con el concepto vacío para ver los estados de error
 * (`aria-invalid` y `role="alert"` los pone `Field`, no la aplicación).
 */
export const VistaDeFormulario: Story = {
  args: { vistaInicial: "nuevo" },
};

/**
 * El menú plegado: los enlaces se reducen a su icono conservando el nombre
 * accesible, y `SidebarBrand` muestra solo el distintivo. Sirve para revisar
 * que ninguna etiqueta se desborde en el ancho corto.
 */
export const MenuPlegado: Story = {
  args: { defaultCollapsed: true },
};

/**
 * Las tres variantes de menú, una debajo de otra, para compararlas con el
 * mismo contenido: `graphite` (neutra, la de por defecto), `ink` (verde
 * profunda, de marca) y `smoke` (translúcida con desenfoque).
 */
export const VariantesDeMenu: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col">
      {(["graphite", "ink", "smoke"] as const).map((variante) => (
        <section key={variante} className="border-b border-border">
          <h2 className="bg-surface px-md py-xs font-heading text-ui-body-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {variante}
          </h2>
          <ExampleApp variant={variante} vistaInicial="movimientos" />
        </section>
      ))}
    </div>
  ),
};
