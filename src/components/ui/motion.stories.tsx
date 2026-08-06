import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { BellRing, PartyPopper, Pointer, Sparkles, Wind } from "lucide-react";

import { Button } from "./button";
import { Motion, type MotionPreset } from "./motion";

const presets: Array<{
  preset: MotionPreset;
  label: string;
  description: string;
  icon: typeof Sparkles;
}> = [
  { preset: "enter", label: "Entrar", description: "Revela contenido nuevo.", icon: Sparkles },
  { preset: "float", label: "Flotar", description: "Movimiento ambiental continuo.", icon: Wind },
  { preset: "point", label: "Señalar", description: "Orienta hacia una acción.", icon: Pointer },
  { preset: "celebrate", label: "Celebrar", description: "Confirma un logro importante.", icon: PartyPopper },
  { preset: "warn", label: "Advertir", description: "Pide atención sin alarmar.", icon: BellRing },
];

function MotionGallery() {
  const [paused, setPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="min-h-screen bg-muted/30 p-8 md:p-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">Sistema de movimiento</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Cinco verbos, una sola API.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Movimientos compartidos para ilustraciones, banners y estados de interfaz.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPaused((value) => !value)}>
              {paused ? "Reanudar" : "Pausar"}
            </Button>
            <Button onClick={() => setReplayKey((value) => value + 1)}>Repetir muestra</Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" key={replayKey}>
          {presets.map(({ preset, label, description, icon: Icon }) => (
            <div key={preset} className="flex min-h-64 flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{preset}</p>
                <h2 className="mt-2 text-lg font-semibold">{label}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </div>
              <div className="grid min-h-28 place-items-center">
                <Motion preset={preset} paused={paused} className="rounded-full bg-primary/10 p-5 text-primary">
                  <Icon aria-hidden="true" className="size-9" strokeWidth={1.8} />
                </Motion>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Primitivas/Motion",
  component: Motion,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    preset: "float",
    children: <span className="inline-block rounded-lg bg-primary px-4 py-3 text-primary-foreground">Contenido animado</span>,
  },
} satisfies Meta<typeof Motion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Galeria: Story = { render: () => <MotionGallery /> };
export const Basico: Story = {};
export const Pausado: Story = { args: { paused: true } };
export const RepeticionControlada: Story = { args: { preset: "point", repeat: 2 } };
