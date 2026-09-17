import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProductShowcase } from "./product-showcase";

// Placeholders SVG de color sólido con su nombre — en un producto real estas son
// capturas reales del producto pasadas por el consumidor (ver `HeroCarousel` de
// ejemplo en los repos que adoptan la librería).
const shot = (label: string, bg: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%23${bg}'/%3E%3Ctext x='50%25' y='50%25' fill='white' font-family='sans-serif' font-size='40' text-anchor='middle' dominant-baseline='middle'%3E${label}%3C/text%3E%3C/svg%3E`;

const screens = [
  { src: shot("Tablero", "0f172a"), name: "Tablero", description: "Ocupación, área y canon del portafolio, con el detalle por edificio." },
  { src: shot("Planimetría", "334155"), name: "Planimetría", description: "El plano con el mapa de calor de ventas y las incidencias abiertas." },
  { src: shot("Rent roll", "475569"), name: "Rent roll", description: "Arrendatarios, cánones, cuotas de administración y días para vencer." },
  { src: shot("Facturación", "64748b"), name: "Facturación", description: "Del canon vigente a la factura electrónica, con su estado ante la DIAN." },
];

const meta = {
  title: "Marketing/ProductShowcase",
  component: ProductShowcase,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Carrusel de capturas del producto como tarjeta acotada (marco, pie que cambia y selector de pantalla), pensado para el `aside` del `Hero` en dos columnas. Se cruza cada `intervalMs`, se pausa al pasar el cursor o enfocar una pastilla y respeta `prefers-reduced-motion`.",
      },
    },
  },
  args: {
    screens,
    intervalMs: 3000,
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProductShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** En el hueco real: la columna derecha (`aside`) de un `Hero` de dos columnas. */
export const EnElHero: Story = {
  parameters: { docs: { description: { story: "Cómo se ve en el `aside` del `Hero`, junto a la columna de texto." } } },
  decorators: [
    (Story) => (
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground">Todo el portafolio, en una vista</h1>
          <p className="text-lg text-muted-foreground">La descripción de la landing va aquí, a la izquierda del carrusel.</p>
        </div>
        <Story />
      </div>
    ),
  ],
};

/** Una sola pantalla: sin selector ni rotación automática. */
export const UnaSolaPantalla: Story = {
  args: { screens: [screens[0]] },
};

/** Sin descripciones: solo el marco y el selector, sin pie. */
export const SinPie: Story = {
  args: { screens: screens.map(({ src, name }) => ({ src, name })) },
};

/** Otra relación de aspecto (p. ej. una captura más cuadrada). */
export const AspectoCuadrado: Story = {
  args: { aspectRatio: "4 / 3" },
};
