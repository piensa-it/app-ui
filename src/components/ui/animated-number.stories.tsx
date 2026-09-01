import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AnimatedNumber } from "./animated-number";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const meta = {
  title: "UI/AnimatedNumber",
  component: AnimatedNumber,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Cifra que cuenta hasta su valor (ease-out), pensada para KPIs: al montar cuenta desde cero y en cada cambio anima del valor anterior al nuevo. Con `prefers-reduced-motion` muestra el valor final directo. Siempre `tabular-nums`.",
      },
    },
  },
} satisfies Meta<typeof AnimatedNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { value: 3042040 },
  render: () => {
    const Demo = () => {
      const [ingresos, setIngresos] = useState(3042040);
      const [ocupacion, setOcupacion] = useState(92);
      return (
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Ingresos del mes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  $ <AnimatedNumber value={ingresos} />
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Ocupación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">
                  <AnimatedNumber value={ocupacion} format={(v) => `${Math.round(v)}%`} />
                </p>
              </CardContent>
            </Card>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIngresos((v) => v + Math.round(Math.random() * 500000));
              setOcupacion((v) => (v >= 99 ? 84 : v + 3));
            }}
          >
            Simular nuevo dato
          </Button>
        </div>
      );
    };
    return <Demo />;
  },
};
