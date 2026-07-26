import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, Copy, Trash2, ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Menu, MenuTrigger, MenuContent, MenuItem, MenuItemGroup, MenuItemGroupLabel, MenuSeparator } from "./menu";
import { Button } from "./button";

const meta = {
  title: "UI/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Menú de acciones (dropdown) sobre Ark UI — ideal para acciones de fila en tablas, menús \"más opciones\" (kebab) y navegación contextual. Se cierra automáticamente al seleccionar una opción, con click afuera o con Escape, y se posiciona en un `Portal` para no quedar recortado por `overflow` del contenedor padre.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Caso de uso más común: acciones de fila en una tabla o tarjeta. */
export const Default: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="outline" size="icon" aria-label="Más opciones">
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="edit" icon={<Pencil aria-hidden="true" />} onSelect={() => alert("Editar")}>
          Editar
        </MenuItem>
        <MenuItem value="duplicate" icon={<Copy aria-hidden="true" />} onSelect={() => alert("Duplicar")}>
          Duplicar
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          value="delete"
          variant="destructive"
          icon={<Trash2 aria-hidden="true" />}
          onSelect={() => alert("Eliminar")}
        >
          Eliminar
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};

/** Ítems agrupados con etiqueta — ej. un menú de ordenamiento. */
export const Agrupado: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="surface">
          <ArrowUpDown aria-hidden="true" />
          Ordenar
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItemGroup>
          <MenuItemGroupLabel>Ordenar por</MenuItemGroupLabel>
          <MenuItem value="name">Nombre</MenuItem>
          <MenuItem value="date">Fecha</MenuItem>
          <MenuItem value="amount">Monto</MenuItem>
        </MenuItemGroup>
      </MenuContent>
    </Menu>
  ),
};

/** Ítem individual deshabilitado — no responde a click ni teclado. */
export const ItemDeshabilitado: Story = {
  render: () => (
    <Menu>
      <MenuTrigger>
        <Button variant="outline" size="icon" aria-label="Más opciones">
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem value="edit" icon={<Pencil aria-hidden="true" />}>
          Editar
        </MenuItem>
        <MenuItem value="duplicate" icon={<Copy aria-hidden="true" />} disabled>
          Duplicar (sin permisos)
        </MenuItem>
      </MenuContent>
    </Menu>
  ),
};
