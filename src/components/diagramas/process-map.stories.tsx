import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ProcessMap } from "./process-map";
import { cicloCoreLink, gruposCoreLink, procesoCompras } from "./ejemplos/mapa-corelink";

const meta = {
  title: "Diagramas/ProcessMap",
  component: ProcessMap,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: [
          "Procesos por niveles, desde `@piensa-it/ui-library/diagramas`: el ciclo de la empresa, cada proceso y cada subproceso con la misma pieza.",
          "Clic (o Intro) en un proceso con `hijos` baja a ellos; la miga de pan sube. Lo que la aplicación ata a cada proceso (`enlaces`, `detalle`) se abre en un panel, y los enlaces llaman a `onEnlace`.",
          "Los carriles (`grupo`) son filas en el orden de `grupos`, y las columnas las comparten: **ELK** (cargado de forma diferida) decide la etapa de cada proceso, así que uno posterior queda siempre más a la derecha. Las aristas van solo por los huecos entre filas y columnas, sin pisar recuadros. Las capas `transversal` y `base` van en bandas.",
          "En el primer nivel, las conexiones con las bandas aparecen al pasar el cursor, enfocar o seleccionar un proceso (que se resalta con sus vecinos), o con «Mostrar todas las conexiones»; `conexionesTransversales=\"siempre\"` las deja fijas. El encuadre nunca baja de un zoom en el que la etiqueta mida 12 px: si no cabe a lo ancho, se desplaza. Por debajo de 860 px se muestra la lista de etapas.",
          "Requiere instalar las dependencias opcionales: `npm i @xyflow/react elkjs`.",
        ].join("\n\n"),
      },
    },
  },
  args: {
    raiz: cicloCoreLink,
    grupos: gruposCoreLink,
    etiquetasBandas: { transversal: "Transversales", base: "Base" },
    nombresNiveles: ["Ciclo", "Proceso", "Subproceso"],
  },
} satisfies Meta<typeof ProcessMap>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nivel 1 del Mapa de CoreLink: 13 procesos, 3 carriles y 17 flujos. Compras tiene subprocesos. */
export const MapaCoreLink: Story = {
  name: "Mapa de CoreLink · nivel 1",
  render: (args) => {
    const [ultimo, setUltimo] = useState<string | null>(null);
    return (
      <div className="space-y-3">
        <ProcessMap {...args} onEnlace={setUltimo} />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {ultimo ? `onEnlace("${ultimo}")` : "Abre un proceso con enlaces (Logística, Cuentas por pagar, Ventas…)."}
        </p>
      </div>
    );
  },
};

/** Nivel 2: el proceso de compras, con el presupuesto como transversal y la contabilidad como base. */
export const NivelProceso: Story = {
  name: "Nivel 2 · Compras",
  args: { raiz: procesoCompras, nombresNiveles: ["Proceso", "Subproceso"] },
};

export const HaciaAbajo: Story = {
  name: "Flujo hacia abajo",
  args: { direccion: "abajo" },
};

/** Aristas animadas; con `prefers-reduced-motion: reduce` quedan quietas. */
export const Animado: Story = {
  args: { raiz: procesoCompras, animado: true },
};

/** La vista de móvil, forzada: sin ELK ni lienzo. */
export const Etapas: Story = {
  args: { vista: "etapas" },
};

export const Oscuro: Story = {
  name: "Tema oscuro",
  globals: { theme: "dark" },
};
