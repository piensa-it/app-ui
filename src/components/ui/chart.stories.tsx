import type { Meta, StoryObj } from "@storybook/react-vite";
import { Chart } from "./chart";

const meta = {
  title: "UI/Chart",
  component: Chart,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Gráficas sobre PrimeReact Chart (Chart.js)." } },
  },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = {
  labels: ["Ene", "Feb", "Mar", "Abr", "May"],
  datasets: [
    {
      label: "Proyectos activos",
      data: [4, 7, 6, 9, 12],
      backgroundColor: "hsl(350 85% 42% / 0.6)",
      borderColor: "hsl(350 85% 42%)",
    },
  ],
};

export const Barras: Story = { args: { type: "bar", data } };
export const Lineas: Story = { name: "Líneas", args: { type: "line", data } };
