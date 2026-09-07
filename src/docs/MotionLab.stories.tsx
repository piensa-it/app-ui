import type { Meta, StoryObj } from "@storybook/react-vite";

import { MotionLab } from "./motion-lab";

const meta = {
  title: "Guías/Laboratorio de movimiento",
  component: MotionLab,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: [
          "Los cuatro mecanismos del sistema de movimiento —`Stagger` (la entrada de página que `PageContainer` aplica",
          "por defecto), `Motion` (cinco verbos), `AnimatedNumber` (cifras que cuentan) y `Reveal` (aparición al",
          "desplazar)— sobre una página de ejemplo real, con los controles dentro del lienzo y el fragmento de código",
          "que reproduce lo elegido.",
          "",
          "Cada story aislada enseña un mecanismo; aquí se comparan. Un `gap` de 40 ms y uno de 120 ms se sienten",
          "distintos y no hay forma de saber cuál conviene sin verlo sobre una página entera. Todos respetan",
          "`prefers-reduced-motion`: con esa preferencia activa el laboratorio lo dice arriba y nada se anima.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof MotionLab>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Las cuatro secciones, con los valores por defecto del sistema. */
export const Laboratorio: Story = {};
