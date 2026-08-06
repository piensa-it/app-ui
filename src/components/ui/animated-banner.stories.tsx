import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartyPopper } from "lucide-react";

import { AnimatedBanner } from "./animated-banner";
import { Button } from "./button";

function BannerFigure() {
  return (
    <div className="grid size-20 place-items-center rounded-full bg-success/15 text-success">
      <PartyPopper className="size-9" aria-hidden="true" />
    </div>
  );
}

const meta = {
  title: "Contenedores/AnimatedBanner",
  component: AnimatedBanner,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    title: "La configuración quedó lista",
    children: "Ya puedes continuar con el siguiente paso de la guía.",
    illustration: <BannerFigure />,
    action: <Button size="sm">Continuar</Button>,
    variant: "success",
    motion: "enter",
  },
} satisfies Meta<typeof AnimatedBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Exito: Story = {};
export const Advertencia: Story = {
  args: {
    title: "Revisa esta información",
    children: "Hay campos pendientes antes de publicar.",
    variant: "warning",
    motion: "warn",
    action: <Button variant="outline" size="sm">Revisar</Button>,
  },
};
export const SinIlustracion: Story = { args: { illustration: undefined } };
export const SinMovimiento: Story = { args: { motion: "none" } };
