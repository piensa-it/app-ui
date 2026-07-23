import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { placeholder: "Escribe un comentario..." },
  argTypes: {
    variant: { control: "select", options: ["outline", "surface", "subtle"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Deshabilitado: Story = { args: { disabled: true, value: "No editable" } };
export const Invalido: Story = { args: { "aria-invalid": true, defaultValue: "Contenido inválido" } };
