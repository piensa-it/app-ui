import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { SkeletonCard, SkeletonKpi, SkeletonTable } from "./skeleton";

const meta = {
  title: "UI/Skeleton/Presets",
  component: SkeletonCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bloques de carga componibles — `SkeletonKpi`, `SkeletonCard` y `SkeletonTable` — para mostrar la estructura de la pantalla mientras llegan los datos. Cada preset es UN solo `role=\"status\"` (los huesos internos son decorativos), y el pulso se detiene con `prefers-reduced-motion`.",
      },
    },
  },
} satisfies Meta<typeof SkeletonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [loading, setLoading] = useState(true);
      useEffect(() => {
        if (!loading) return;
        const t = setTimeout(() => setLoading(false), 2200);
        return () => clearTimeout(t);
      }, [loading]);
      return (
        <div className="space-y-4 p-6">
          <Button variant="outline" onClick={() => setLoading(true)} disabled={loading}>
            {loading ? "Cargando…" : "Volver a cargar"}
          </Button>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {loading ? (
              <>
                <SkeletonKpi />
                <SkeletonKpi />
                <SkeletonKpi />
              </>
            ) : (
              ["92%", "$ 3.042.040", "23"].map((v, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                      {["Ocupación", "Ingresos", "Contratos"][i]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-semibold tabular-nums">{v}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {loading ? <SkeletonTable rows={4} columns={5} /> : <SkeletonCard lines={0} className="hidden" />}
          {!loading && (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">Datos cargados — la tabla real iría aquí.</CardContent>
            </Card>
          )}
        </div>
      );
    };
    return <Demo />;
  },
};
