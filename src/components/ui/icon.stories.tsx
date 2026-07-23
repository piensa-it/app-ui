import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { LucideIcon } from "lucide-react";
import { Bell, ChartNoAxesCombined, CircleCheck, Settings, TriangleAlert } from "lucide-react";

import { Icon, IconTile } from "./icon";
import * as LibraryIcons from "../../icons";

const meta = {
  title: "UI/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Íconos Lucide con tamaños, colores semánticos, fondos y comportamiento accesible consistentes.",
      },
    },
  },
  args: { icon: Bell },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  name: "Tamaños",
  render: () => (
    <div className="flex items-end gap-5">
      {(["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const).map((size) => (
        <div key={size} className="grid justify-items-center gap-2">
          <Icon icon={Settings} size={size} />
          <span className="font-mono text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const CustomSizesAndStroke: Story = {
  name: "Medidas y grosor",
  render: () => (
    <div className="flex flex-wrap items-end gap-6">
      {[
        { size: 18, strokeWidth: 1.5 },
        { size: 24, strokeWidth: 2 },
        { size: 32, strokeWidth: 2.25 },
        { size: 48, strokeWidth: 2.5 },
      ].map(({ size, strokeWidth }) => (
        <div key={size} className="grid justify-items-center gap-2">
          <Icon icon={LibraryIcons.SettingsIcon} size={size} strokeWidth={strokeWidth} absoluteStrokeWidth />
          <code className="text-xs text-muted-foreground">{size}px · {strokeWidth}</code>
        </div>
      ))}
    </div>
  ),
};

export const ContainerStyles: Story = {
  name: "Estilos de contenedor",
  render: () => (
    <div className="flex flex-wrap gap-6">
      {(["soft", "outline", "elevated", "ghost"] as const).map((variant) => (
        <div key={variant} className="grid justify-items-center gap-2">
          <IconTile
            icon={LibraryIcons.SaveIcon}
            iconSize="lg"
            containerSize="lg"
            variant={variant}
            shape="rounded"
            label={`Guardar · ${variant}`}
          />
          <code className="text-xs text-muted-foreground">{variant}</code>
        </div>
      ))}
      {(["square", "rounded", "circle"] as const).map((shape) => (
        <div key={shape} className="grid justify-items-center gap-2">
          <IconTile
            icon={LibraryIcons.SearchIcon}
            iconSize="lg"
            containerSize="lg"
            variant="outline"
            shape={shape}
            label={`Buscar · ${shape}`}
          />
          <code className="text-xs text-muted-foreground">{shape}</code>
        </div>
      ))}
    </div>
  ),
};

export const SemanticTiles: Story = {
  name: "Contenedores semánticos",
  render: () => (
    <div className="flex flex-wrap gap-4">
      <IconTile icon={ChartNoAxesCombined} label="Analítica" />
      <IconTile icon={CircleCheck} color="success" containerColor="success" label="Completado" />
      <IconTile icon={TriangleAlert} color="warning" containerColor="warning" label="Advertencia" />
      <IconTile icon={Bell} color="destructive" containerColor="destructive" label="Alerta" />
    </div>
  ),
};

const catalog = Object.entries(LibraryIcons)
  .filter(([name, glyph]) => name.endsWith("Icon") && typeof glyph === "object")
  .sort(([nameA], [nameB]) => nameA.localeCompare(nameB)) as [string, LucideIcon][];

function IconCatalog() {
  const [query, setQuery] = React.useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleIcons = catalog.filter(([name]) => name.toLocaleLowerCase().includes(normalizedQuery));

  return (
    <div className="grid gap-5">
      <label className="relative block max-w-md">
        <span className="sr-only">Buscar iconos</span>
        <Icon
          icon={LibraryIcons.SearchIcon}
          size="sm"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar SaveIcon, SearchIcon, UserIcon…"
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </label>
      <p className="text-sm text-muted-foreground">
        {visibleIcons.length} de {catalog.length} iconos
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleIcons.map(([name, glyph]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <IconTile icon={glyph} containerSize="sm" variant="outline" shape="square" />
            <code className="truncate text-xs text-muted-foreground">{name}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Catalog: Story = {
  name: "Catálogo ampliado",
  render: () => <IconCatalog />,
};
