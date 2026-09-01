import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Stagger } from "./stagger";

const meta = {
  title: "UI/Stagger",
  component: Stagger,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Entrada escalonada de los hijos con el preset `enter` (CSS puro). El contenedor lleva las clases de layout; cada hijo entra con un retraso incremental. Con `prefers-reduced-motion` el contenido aparece sin animar.",
      },
    },
  },
} satisfies Meta<typeof Stagger>;

export default meta;
type Story = StoryObj<typeof meta>;

const kpis = [
  { label: "Ocupación", value: "92%" },
  { label: "Ingresos", value: "$ 3.042.040" },
  { label: "Contratos", value: "23" },
  { label: "Vacancia", value: "8%" },
];

export const Default: Story = {
  args: { gap: 80, children: null },
  render: (args) => {
    const Demo = () => {
      const [replayKey, setReplayKey] = useState(0);
      return (
        <div className="space-y-4 p-6">
          <Button variant="outline" onClick={() => setReplayKey((k) => k + 1)}>
            Repetir entrada
          </Button>
          <Stagger key={replayKey} gap={args.gap} className="grid grid-cols-2 gap-4 md:grid-cols-4" itemClassName="h-full">
            {kpis.map((kpi) => (
              <Card key={kpi.label} className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">{kpi.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold tabular-nums">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </Stagger>
        </div>
      );
    };
    return <Demo />;
  },
};
