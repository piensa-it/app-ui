import type { Meta, StoryObj } from "@storybook/react-vite";

import { ExampleApp } from "./example/example-app";

const meta = {
  title: "Guías/Aplicación de ejemplo",
  component: ExampleApp,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    // En la página de documentación las historias se pintan una tras otra: sin
    // acotar la altura, un armazón a pantalla completa deja una página
    // interminable y el menú se pierde de vista. Con marco propio se ve como
    // lo que es, una aplicación, y cada historia trae su propio desplazamiento.
    docs: {
      // En la página de documentación las historias se pintan una tras otra:
      // sin acotar la altura, un armazón a pantalla completa deja una página
      // interminable y el menú se pierde de vista. Con marco propio se ve como
      // lo que es, una aplicación, y con su propio desplazamiento.
      story: { height: "620px", inline: false },
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
      options: ["tablero", "movimientos", "nuevo", "conciliacion", "reportes", "cuentas"],
      description: "Vista con la que arranca el ejemplo.",
    },
    defaultCollapsed: { control: "boolean" },
    layout: {
      control: "inline-radio",
      options: ["docked", "floating", "rail", "framed", "rail-panel"],
      description: "Forma del armazón: pegado al borde, flotante, riel, enmarcado, o riel con panel de sección.",
    },
    sidebarTone: {
      control: "inline-radio",
      options: ["dark", "light"],
      description: "Tono del menú: oscuro (la regla) o claro (sigue a la página).",
    },
    buscadorCentrado: { control: "boolean", description: "El buscador centrado en la barra superior." },
  },
  args: {
    variant: "graphite",
    vistaInicial: "tablero",
    defaultCollapsed: false,
    layout: "docked",
    buscadorCentrado: false,
  },
} satisfies Meta<typeof ExampleApp>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * La aplicación clásica: menú fijo y oscuro, plegable a iconos, la identidad
 * arriba del menú y la persona en la barra superior. Arranca en el tablero:
 * cuatro cifras con icono y tono, la gráfica de flujo de caja y dos tarjetas
 * con lo pendiente y lo reciente, todo con datos de ejemplo.
 *
 * Desde el menú se llega a la vista de datos —`PageContainer` en ancho
 * `wide`, `PageHeader` con acciones, tres cifras y una `DataTable` con
 * búsqueda, orden, paginación y configurador de columnas—, a la de captura
 * —`Field` conectando etiqueta, ayuda y error de cada control; pulsa "Guardar
 * movimiento" con el concepto vacío para ver los estados de error—, a elegir
 * empresa en `SidebarIdentity`, a plegar el menú y a ver la versión en el pie.
 *
 * Los cinco ejemplos son la misma aplicación con otra forma del armazón;
 * cambia entre ellos para compararlas. Los estados sueltos del armazón viven
 * en `Layout/AppShell`.
 */
export const AplicacionDeEjemplo1: Story = {
  name: "Aplicación de ejemplo 1 · clásica",
};

/**
 * La misma aplicación con otra forma (#113): menú flotante y claro, y el
 * buscador centrado en la barra. Es la plantilla 1 de la evaluación montada
 * solo con props de `AppShell`; el estilo visual (`data-ui-look`) se elige
 * en el toolbar. La persona, como en todas, arriba a la derecha.
 */
export const AplicacionDeEjemplo2: Story = {
  name: "Aplicación de ejemplo 2 · flotante y clara",
  args: { layout: "floating", sidebarTone: "light", buscadorCentrado: true },
};

/**
 * La misma aplicación en riel (#113): icono y etiqueta, sin desplegar, y el
 * buscador centrado. Es la forma de la plantilla 3 con un solo nivel; los dos
 * niveles —riel más panel de sección— llegan con #114.
 */
export const AplicacionDeEjemplo3: Story = {
  name: "Aplicación de ejemplo 3 · riel",
  args: { layout: "rail", buscadorCentrado: true },
};

/**
 * La misma aplicación en dos niveles (#114): el riel lleva los módulos y el
 * panel de sección, el árbol del módulo activo. Es la plantilla 3 completa.
 * Plegar oculta el panel; el riel se queda.
 */
export const AplicacionDeEjemplo4: Story = {
  name: "Aplicación de ejemplo 4 · riel con panel",
  args: { layout: "rail-panel", buscadorCentrado: true },
};

/**
 * La misma aplicación enmarcada (#118): el menú encierra el contenido. En
 * oscuro, con el estilo `deep` y la paleta cian del toolbar, es la plantilla
 * 2 de la evaluación.
 */
export const AplicacionDeEjemplo5: Story = {
  name: "Aplicación de ejemplo 5 · enmarcada",
  args: { layout: "framed" },
};
