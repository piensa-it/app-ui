import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eye, Search } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { InputGroup, InputGroupAction, InputGroupAddon } from "./input-group";

const meta = {
  title: "UI/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Compone campos con prefijos, unidades, íconos o acciones sin duplicar bordes y foco." } },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Busqueda: Story = {
  render: () => (
    <InputGroup className="max-w-md">
      <InputGroupAddon><Search aria-hidden="true" className="size-4" /></InputGroupAddon>
      <Input aria-label="Buscar" placeholder="Buscar movimientos..." />
    </InputGroup>
  ),
};

export const Moneda: Story = {
  render: () => (
    <InputGroup className="max-w-xs">
      <InputGroupAddon>$</InputGroupAddon>
      <Input aria-label="Valor" inputMode="decimal" placeholder="0,00" className="tabular-nums" />
      <InputGroupAddon>COP</InputGroupAddon>
    </InputGroup>
  ),
};

export const ConAccion: Story = {
  render: () => (
    <InputGroup className="max-w-md">
      <Input type="password" aria-label="Contraseña" defaultValue="contraseña" />
      <InputGroupAction><Button variant="plain" size="icon" aria-label="Mostrar contraseña"><Eye /></Button></InputGroupAction>
    </InputGroup>
  ),
};
