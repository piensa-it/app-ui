import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageCarouselBackdrop } from "./ImageCarouselBackdrop";

// Placeholders de color sólido — en un producto real estas son fotos reales
// pasadas por el consumidor (ver `heroBackgrounds.ts` de ejemplo en el README).
const demoImages = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%230f172a'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%23334155'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500'%3E%3Crect width='800' height='500' fill='%2364748b'/%3E%3C/svg%3E",
];

const meta = {
  title: "Marketing/ImageCarouselBackdrop",
  component: ImageCarouselBackdrop,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Fondo de imagen animado (carrusel con fundido cada `intervalMs`) + overlay. Se usa como fondo absoluto de una sección `relative`. Pensado para heroes de landing pages.",
      },
    },
  },
  args: {
    images: demoImages,
    intervalMs: 2500,
  },
} satisfies Meta<typeof ImageCarouselBackdrop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Duotone: Story = {
  args: { variant: "duotone" },
  render: (args) => (
    <div className="relative flex h-80 items-center justify-center overflow-hidden">
      <ImageCarouselBackdrop {...args} />
      <p className="relative z-10 text-2xl font-bold text-white">Contenido encima (testimonios, precios...)</p>
    </div>
  ),
};

export const Hero: Story = {
  args: { variant: "hero" },
  render: (args) => (
    <div className="relative flex h-80 items-center justify-center overflow-hidden">
      <ImageCarouselBackdrop {...args} />
      <p className="relative z-10 text-2xl font-bold text-foreground">Hero de landing page</p>
    </div>
  ),
};
